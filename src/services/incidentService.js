import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

class IncidentService {

    /**
     * Raise a new SOS Incident
     * @param {Object} data - { societyId, type, description, reportedBy, reportedByName, contactPhone, location }
     */
    async raiseSos(data) {
        try {
            const { societyId, type, description, reportedBy, reportedByName, contactPhone, location } = data;

            const newIncident = {
                societyId,
                type: type || 'emergency', // medical, fire, security
                severity: 'critical',
                description: description || 'SOS Alert Raised',
                reportedBy,
                reportedByName, // Snapshot of name for speed
                contactPhone,
                location: location || 'Unknown',
                status: 'active', // active, resolved
                createdAt: serverTimestamp(),
                timeline: [
                    { status: 'raised', timestamp: new Date(), by: reportedBy }
                ]
            };

            const docRef = await addDoc(collection(db, 'incidents'), newIncident);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error raising SOS:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Resolve an Incident
     */
    async resolveIncident(incidentId, userId, note) {
        try {
            const incidentRef = doc(db, 'incidents', incidentId);
            await updateDoc(incidentRef, {
                status: 'resolved',
                resolvedAt: serverTimestamp(),
                resolvedBy: userId,
                // Add to timeline would require arrayUnion but simple update is safer for now without strict types
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Subscribe to Active Incidents (For Admin/Guard Dashboard)
     */
    subscribeToActiveIncidents(societyId, onUpdate) {
        const q = query(
            collection(db, 'incidents'),
            where('societyId', '==', societyId),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            onUpdate(incidents);
        }, (error) => {
            console.error('Incident Subscription Error:', error);
        });
    }
}

export default new IncidentService();

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Complaint Service - Enterprise SLA & Workflow
 */

class ComplaintService {

    /**
     * File a new complaint
     */
    async fileComplaint(complaintData) {
        try {
            const { societyId, flatNumber, userId, category, description, priority } = complaintData;

            // Calculate SLA Target Date based on Priority (Case insensitive)
            const p = priority?.toLowerCase();
            let slaHours = 72; // Default Low
            if (p === 'medium') slaHours = 48;
            if (p === 'high') slaHours = 24;
            if (p === 'critical' || p === 'urgent') slaHours = 6;

            const slaTarget = new Date();
            slaTarget.setHours(slaTarget.getHours() + slaHours);

            const newComplaint = {
                societyId,
                flatNumber,
                userId,
                category,
                description,
                priority,
                status: 'open', // open, in_progress, resolved, escalated
                slaTargetTime: slaTarget,
                isBreached: false,
                escalationLevel: 0,
                createdAt: serverTimestamp(),
                history: [
                    { action: 'CREATED', by: userId, timestamp: new Date(), note: 'Complaint filed' }
                ]
            };

            const docRef = await addDoc(collection(db, 'complaints'), newComplaint);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error filing complaint:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get Complaints for Resident
     */
    async getMyComplaints(userId) {
        try {
            const q = query(
                collection(db, 'complaints'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const complaints = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                slaTargetTime: doc.data().slaTargetTime?.toDate() || new Date()
            }));
            return { success: true, complaints };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get All Complaints (Admin)
     */
    async getAllComplaints(societyId, statusFilter = 'all') {
        try {
            // Base Query
            let q = query(
                collection(db, 'complaints'),
                where('societyId', '==', societyId),
                orderBy('createdAt', 'desc')
            );

            // Fetch all and filter in memory if index is missing for complex queries
            // Ideally we should have compound indexes.
            const snapshot = await getDocs(q);
            let complaints = snapshot.docs.map(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate() || new Date();
                const slaTargetTime = data.slaTargetTime?.toDate() || new Date();
                const isBreached = data.status !== 'resolved' && new Date() > slaTargetTime;

                return {
                    id: doc.id,
                    ...data,
                    createdAt,
                    slaTargetTime,
                    isBreached
                };
            });

            if (statusFilter !== 'all') {
                complaints = complaints.filter(c => c.status === statusFilter);
            }

            return { success: true, complaints };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update Status (Admin)
     */
    async updateStatus(complaintId, newStatus, adminId, note = '') {
        try {
            const ref = doc(db, 'complaints', complaintId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return { success: false, error: 'Not found' };

            const prevHistory = snap.data().history || [];

            await updateDoc(ref, {
                status: newStatus,
                updatedAt: serverTimestamp(),
                history: [
                    ...prevHistory,
                    { action: `STATUS_CHANGE_TO_${newStatus.toUpperCase()}`, by: adminId, timestamp: new Date(), note }
                ]
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Check for SLA Breaches (Cloud Function Candidate - but implementing client-side check for UI)
     */
    checkSlaBreach(complaint) {
        const now = new Date();
        const target = complaint.slaTargetTime;
        return complaint.status !== 'resolved' && now > target;
    }
}

export default new ComplaintService();

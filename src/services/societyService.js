import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Society Service - Manages societies/communities
 */

class SocietyService {
    /**
     * Create a new society
     */
    async createSociety(societyData) {
        try {
            const data = {
                name: societyData.name,
                address: societyData.address,
                city: societyData.city || '',
                totalFlats: societyData.totalFlats || 0,
                facilities: societyData.facilities || [],
                contactPerson: societyData.contactPerson || '',
                contactPhone: societyData.contactPhone || '',
                active: true,
                createdAt: serverTimestamp(),
                stats: {
                    totalResidents: 0,
                    assignedGuards: 0,
                    totalVisitors: 0,
                    activeParcels: 0,
                },
            };

            const docRef = await addDoc(collection(db, 'societies'), data);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating society:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get all societies
     */
    async getSocieties() {
        try {
            const q = query(
                collection(db, 'societies'),
                where('active', '==', true),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const societies = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            }));

            return { success: true, societies };
        } catch (error) {
            console.error('Error fetching societies:', error);
            return { success: false, error: error.message, societies: [] };
        }
    }

    /**
     * Get a single society by ID
     */
    async getSociety(societyId) {
        try {
            const docRef = doc(db, 'societies', societyId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    success: true,
                    society: {
                        id: docSnap.id,
                        ...docSnap.data(),
                        createdAt: docSnap.data().createdAt?.toDate(),
                    },
                };
            } else {
                return { success: false, error: 'Society not found' };
            }
        } catch (error) {
            console.error('Error fetching society:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update society
     */
    async updateSociety(societyId, updateData) {
        try {
            const societyRef = doc(db, 'societies', societyId);
            await updateDoc(societyRef, {
                ...updateData,
                updatedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating society:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete society (soft delete)
     */
    async deleteSociety(societyId) {
        try {
            const societyRef = doc(db, 'societies', societyId);
            await updateDoc(societyRef, {
                active: false,
                deletedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting society:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update society statistics
     */
    async updateSocietyStats(societyId, stats) {
        try {
            const societyRef = doc(db, 'societies', societyId);
            await updateDoc(societyRef, {
                stats: stats,
                statsUpdatedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating society stats:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Subscribe to societies (real-time)
     */
    subscribeToSocieties(callback) {
        const q = query(
            collection(db, 'societies'),
            where('active', '==', true),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const societies = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            }));
            callback(societies);
        });
    }

    /**
     * Get society count
     */
    async getSocietyCount() {
        try {
            const q = query(
                collection(db, 'societies'),
                where('active', '==', true)
            );

            const snapshot = await getDocs(q);
            return { success: true, count: snapshot.size };
        } catch (error) {
            console.error('Error getting society count:', error);
            return { success: false, count: 0 };
        }
    }
}

export default new SocietyService();

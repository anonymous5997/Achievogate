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
 * Enterprise Flat Service 
 * Manages the new 'flats' entity which is central to the Enterprise Architecture.
 */

class FlatService {

    /**
     * Create a new flat (Admin Only)
     */
    async createFlat(flatData) {
        try {
            const data = {
                societyId: flatData.societyId,
                flatNumber: flatData.flatNumber, // e.g., "A-101"
                block: flatData.block || '',     // e.g., "Block A"
                floor: flatData.floor || 0,
                residentIds: [], // Initially empty
                vehicleIds: [],  // Initially empty
                occupancyStatus: 'vacant', // 'occupied', 'vacant', 'rented'
                createdAt: serverTimestamp(),
            };

            // Check for duplicates in this society
            const q = query(
                collection(db, 'flats'),
                where('societyId', '==', flatData.societyId),
                where('flatNumber', '==', flatData.flatNumber)
            );
            const duplicates = await getDocs(q);
            if (!duplicates.empty) {
                return { success: false, error: 'Flat already exists in this society' };
            }

            const docRef = await addDoc(collection(db, 'flats'), data);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating flat:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get flats by Society
     */
    async getFlatsBySociety(societyId) {
        try {
            const q = query(
                collection(db, 'flats'),
                where('societyId', '==', societyId),
                orderBy('flatNumber', 'asc')
            );
            const snapshot = await getDocs(q);
            const flats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { success: true, flats };
        } catch (error) {
            console.error('Error getting flats:', error);
            // Fallback for missing index or other errors
            return { success: false, error: error.message, flats: [] };
        }
    }

    /**
     * Add Resident to Flat
     * This links a User to a Flat entity
     */
    async addResidentToFlat(flatId, userId) {
        try {
            const flatRef = doc(db, 'flats', flatId);
            const flatSnap = await getDoc(flatRef);

            if (!flatSnap.exists()) throw new Error('Flat not found');

            const currentResidents = flatSnap.data().residentIds || [];
            if (!currentResidents.includes(userId)) {
                await updateDoc(flatRef, {
                    residentIds: [...currentResidents, userId],
                    occupancyStatus: currentResidents.length === 0 ? 'occupied' : flatSnap.data().occupancyStatus, // Auto-update status
                    updatedAt: serverTimestamp()
                });
            }
            return { success: true };
        } catch (error) {
            console.error('Error adding resident to flat:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove Resident from Flat
     */
    async removeResidentFromFlat(flatId, userId) {
        try {
            const flatRef = doc(db, 'flats', flatId);
            const flatSnap = await getDoc(flatRef);

            if (!flatSnap.exists()) throw new Error('Flat not found');

            const currentResidents = flatSnap.data().residentIds || [];
            const newResidents = currentResidents.filter(id => id !== userId);

            await updateDoc(flatRef, {
                residentIds: newResidents,
                occupancyStatus: newResidents.length === 0 ? 'vacant' : flatSnap.data().occupancyStatus,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error removing resident from flat:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get details of a specific flat (including residents)
     */
    async getFlatDetails(flatId) {
        try {
            const flatRef = doc(db, 'flats', flatId);
            const flatSnap = await getDoc(flatRef);
            if (!flatSnap.exists()) return { success: false, error: 'Flat not found' };

            const flatData = flatSnap.data();

            // Enrich with cached/basic resident info if needed, 
            // but for now return raw data.
            return { success: true, flat: { id: flatId, ...flatData } };
        } catch (error) {
            console.error('Error getting flat details:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new FlatService();

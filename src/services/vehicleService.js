import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Vehicle Service - Manage Residents' Vehicles
 */

class VehicleService {

    /**
     * Add a new vehicle
     * Checks for duplicate plate number within society
     */
    async addVehicle(vehicleData) {
        try {
            const { societyId, plateNumber, flatNumber, ownerId } = vehicleData;

            // 1. Check for Duplicate Plate
            const q = query(
                collection(db, 'vehicles'),
                where('societyId', '==', societyId),
                where('plateNumber', '==', plateNumber.toUpperCase())
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return { success: false, error: 'Vehicle with this plate number already exists in society.' };
            }

            // 2. Add Vehicle
            const newVehicle = {
                societyId,
                plateNumber: plateNumber.toUpperCase(),
                flatNumber,
                ownerId,
                type: vehicleData.type || 'Car', // Car, Bike
                model: vehicleData.model || '',
                stickerId: vehicleData.stickerId || '',
                status: 'active',
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'vehicles'), newVehicle);
            return { success: true, id: docRef.id };

        } catch (error) {
            console.error('Error adding vehicle:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get Vehicles for a Society (Admin View)
     */
    async getVehicles(societyId) {
        try {
            const q = query(
                collection(db, 'vehicles'),
                where('societyId', '==', societyId)
            );
            const snapshot = await getDocs(q);
            const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, vehicles };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Search Vehicle by Plate (Global Search Helper)
     */
    async searchVehicle(societyId, queryText) {
        try {
            // Firestore doesn't support substring search standardly.
            // We rely on client-side filtering or exact match for now.
            // Or '>= queryText' range query for prefix search.
            const q = query(
                collection(db, 'vehicles'),
                where('societyId', '==', societyId),
                where('plateNumber', '>=', queryText.toUpperCase()),
                where('plateNumber', '<=', queryText.toUpperCase() + '\uf8ff')
            );

            const snapshot = await getDocs(q);
            const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return { success: true, vehicles };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete Vehicle
     */
    async deleteVehicle(vehicleId) {
        try {
            await deleteDoc(doc(db, 'vehicles', vehicleId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new VehicleService();

import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Parcel Service - Manages delivery tracking for residents
 */

/**
 * Add a new parcel for a resident
 */
export const addParcel = async (flatNumber, details) => {
    try {
        const parcelData = {
            flatNumber,
            description: details.description || 'Package',
            carrier: details.carrier || 'Unknown',
            receivedAt: new Date(),
            collectedAt: null,
            status: 'pending',
            createdBy: details.createdBy || 'Guard',
        };

        const docRef = await addDoc(collection(db, 'parcels'), parcelData);

        // Send notification to resident
        const notificationService = (await import('./notificationService')).default;
        const notification = notificationService.parcelLogged(
            parcelData.flatNumber,
            parcelData.description
        );
        await notificationService.sendLocalNotification(
            notification.title,
            notification.body,
            notification.data
        );

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding parcel:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get parcels for a specific flat
 */
export const getParcels = async (flatNumber) => {
    try {
        const q = query(
            collection(db, 'parcels'),
            where('flatNumber', '==', flatNumber),
            orderBy('receivedAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const parcels = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            receivedAt: doc.data().receivedAt?.toDate(),
            collectedAt: doc.data().collectedAt?.toDate(),
        }));

        return { success: true, parcels };
    } catch (error) {
        console.error('Error fetching parcels:', error);
        return { success: false, error: error.message, parcels: [] };
    }
};

/**
 * Get pending parcels count for a flat
 */
export const getPendingParcelsCount = async (flatNumber) => {
    try {
        const q = query(
            collection(db, 'parcels'),
            where('flatNumber', '==', flatNumber),
            where('status', '==', 'pending')
        );

        const snapshot = await getDocs(q);
        return { success: true, count: snapshot.size };
    } catch (error) {
        console.error('Error fetching parcel count:', error);
        return { success: false, count: 0 };
    }
};

/**
 * Mark a parcel as collected
 */
export const markParcelCollected = async (parcelId) => {
    try {
        const parcelRef = doc(db, 'parcels', parcelId);
        await updateDoc(parcelRef, {
            status: 'collected',
            collectedAt: new Date(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error marking parcel as collected:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Subscribe to parcels for a flat (real-time)
 */
export const subscribeToParcels = (flatNumber, callback) => {
    const q = query(
        collection(db, 'parcels'),
        where('flatNumber', '==', flatNumber),
        orderBy('receivedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const parcels = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            receivedAt: doc.data().receivedAt?.toDate(),
            collectedAt: doc.data().collectedAt?.toDate(),
        }));
        callback(parcels);
    });
};

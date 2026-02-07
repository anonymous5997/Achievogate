import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Parcel Service - Manages delivery tracking for residents
 */

/**
 * Upload parcel image to Firebase Storage
 */
export const uploadParcelImage = async (uri) => {
    if (!uri) return null;
    try {
        const manipResult = await manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: SaveFormat.JPEG }
        );

        const response = await fetch(manipResult.uri);
        const blob = await response.blob();
        const filename = `parcels/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error('Error uploading parcel image:', error);
        return null;
    }
};

/**
 * Add a new parcel for a resident (Enterprise)
 */
export const addParcel = async (flatNumber, details) => {
    try {
        const { societyId, description, carrier, photoUrl, createdBy } = details;

        // Upload image if it's a local URI (starts with file:// or similar)
        let finalPhotoUrl = photoUrl;
        if (photoUrl && !photoUrl.startsWith('http')) {
            finalPhotoUrl = await uploadParcelImage(photoUrl);
        }

        const parcelData = {
            societyId: societyId, // Strict Scoping
            flatNumber,
            description: description || 'Package',
            carrier: carrier || 'Unknown',
            photoUrl: finalPhotoUrl || null,
            status: 'at_gate',
            entryTime: serverTimestamp(),
            collectedAt: null,
            reminderSent: false,
            createdBy: createdBy || 'Guard',
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'parcels'), parcelData);

        // Enterprise: Write to Notification Queue (Backend Worker Pattern)
        // This decouples the heavy lifting (finding tokens, retries) from the client.
        await addDoc(collection(db, 'notificationQueue'), {
            type: 'PARCEL_ALERT',
            targetFlat: flatNumber,
            societyId: societyId,
            payload: {
                title: 'Parcel Arrived',
                body: `A package from ${parcelData.carrier} is at the gate.`,
                data: { parcelId: docRef.id, photoUrl: photoUrl }
            },
            status: 'pending',
            retryCount: 0,
            createdAt: serverTimestamp()
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding parcel:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get parcels for a specific flat
 */
/**
 * Get parcels for a specific flat
 */
export const getParcels = async (societyId, flatNumber) => {
    try {
        let q = query(
            collection(db, 'parcels'),
            where('flatNumber', '==', flatNumber),
            orderBy('entryTime', 'desc')
        );

        // If societyId provided, ideally we filter by it. 
        // Requires Composite Index: flatNumber ASC, entryTime DESC (or societyId ASC, flatNumber ASC...)
        if (societyId) {
            q = query(
                collection(db, 'parcels'),
                where('societyId', '==', societyId),
                where('flatNumber', '==', flatNumber),
                orderBy('entryTime', 'desc')
            );
        }

        const snapshot = await getDocs(q);
        const parcels = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            receivedAt: doc.data().receivedAt?.toDate(),
            collectedAt: doc.data().collectedAt?.toDate(),
            entryTime: doc.data().entryTime?.toDate(),
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

/**
 * Get parcels for the entire Society (Admin Dashboard)
 */
export const getParcelsForSociety = async (societyId, filterStatus = 'pending') => {
    try {
        let q = query(
            collection(db, 'parcels'),
            where('societyId', '==', societyId),
            orderBy('entryTime', 'desc')
        );

        if (filterStatus === 'pending') {
            q = query(
                collection(db, 'parcels'),
                where('societyId', '==', societyId),
                where('status', 'in', ['at_gate', 'pending']), // Handle synonyms
                orderBy('entryTime', 'desc')
            );
        } else if (filterStatus === 'collected') {
            q = query(
                collection(db, 'parcels'),
                where('societyId', '==', societyId),
                where('status', '==', 'collected'),
                orderBy('entryTime', 'desc'),
                limit(50) // Limit collected history
            );
        }

        const snapshot = await getDocs(q);
        const parcels = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            entryTime: doc.data().entryTime?.toDate(),
            collectedAt: doc.data().collectedAt?.toDate(),
            createdAt: doc.data().createdAt?.toDate() || doc.data().entryTime?.toDate() // Fallback
        }));

        return { success: true, parcels };
    } catch (error) {
        console.error('Error fetching society parcels:', error);
        return { success: false, error: error.message, parcels: [] };
    }
};

/**
 * Get parcels for the entire Society (Admin Dashboard)
 */


import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
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
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import notificationService from './notificationService';

class VisitorService {

    // Upload image to Firebase Storage with compression
    async uploadVisitorImage(uri) {
        if (!uri) return null;
        try {
            // Compress image
            const manipResult = await manipulateAsync(
                uri,
                [{ resize: { width: 800 } }], // Resize to max 800px width
                { compress: 0.7, format: SaveFormat.JPEG }
            );

            // Create blob
            const response = await fetch(manipResult.uri);
            const blob = await response.blob();

            // Generate unique filename
            const filename = `visitors/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const storageRef = ref(storage, filename);

            // Upload
            await uploadBytes(storageRef, blob);

            // Get URL
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            // Fallback: Return null but don't crash flow, allow creation without image
            return null;
        }
    }

    // Create new visitor entry
    async createVisitor(visitorData, guardId) {
        try {
            // Upload image first if present
            let photoUrl = null;
            if (visitorData.photoUrl) {
                photoUrl = await this.uploadVisitorImage(visitorData.photoUrl);
            }

            const visitorRef = await addDoc(collection(db, 'visitors'), {
                ...visitorData,
                photoUrl, // Use the storage URL, not the local URI
                guardId,
                status: 'pending',
                createdAt: serverTimestamp(),
                approvedAt: null,
                enteredAt: null,
                exitedAt: null,
            });

            // Send notification to resident
            // Note: Cloud Functions should ideally handle this trigger, 
            // but we call it client-side for immediate feedback in this demo.
            await notificationService.sendVisitorNotification(
                visitorData.flatNumber,
                visitorData.visitorName,
                visitorRef.id
            );

            return { success: true, visitorId: visitorRef.id };
        } catch (error) {
            console.error('Error creating visitor:', error);
            return { success: false, error: error.message };
        }
    }

    // Update visitor status
    async updateVisitorStatus(visitorId, status, userId) {
        try {
            const visitorRef = doc(db, 'visitors', visitorId);
            const updates = {
                status,
                updatedAt: serverTimestamp(),
            };

            if (status === 'approved') {
                updates.approvedAt = serverTimestamp();
                updates.residentId = userId;
            } else if (status === 'denied') {
                updates.deniedAt = serverTimestamp();
                updates.residentId = userId;
            } else if (status === 'entered') {
                updates.enteredAt = serverTimestamp();
            } else if (status === 'exited') {
                updates.exitedAt = serverTimestamp();
            }

            await updateDoc(visitorRef, updates);

            // Notify guard about the update
            if (status === 'approved' || status === 'denied') {
                const visitorSnap = await getDoc(visitorRef);
                const visitorData = visitorSnap.data();
                await notificationService.sendStatusUpdateNotification(
                    visitorData.guardId,
                    status,
                    visitorData.visitorName
                );
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating visitor status:', error);
            return { success: false, error: error.message };
        }
    }

    // Get visitors by guard
    subscribeToGuardVisitors(guardId, callback) {
        const q = query(
            collection(db, 'visitors'),
            where('guardId', '==', guardId),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const visitors = [];
            snapshot.forEach((doc) => {
                visitors.push({ id: doc.id, ...doc.data() });
            });
            callback(visitors);
        });
    }

    // Get pending visitors for resident's flat
    subscribeToPendingVisitors(flatNumber, callback) {
        const q = query(
            collection(db, 'visitors'),
            where('flatNumber', '==', flatNumber),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const visitors = [];
            snapshot.forEach((doc) => {
                visitors.push({ id: doc.id, ...doc.data() });
            });
            callback(visitors);
        });
    }

    // Get visitor history for resident
    subscribeToResidentVisitors(flatNumber, callback) {
        const q = query(
            collection(db, 'visitors'),
            where('flatNumber', '==', flatNumber),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const visitors = [];
            snapshot.forEach((doc) => {
                visitors.push({ id: doc.id, ...doc.data() });
            });
            callback(visitors);
        });
    }

    // Get all visitors (admin)
    subscribeToAllVisitors(societyId, callback) {
        const q = query(
            collection(db, 'visitors'),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const visitors = [];
            snapshot.forEach((doc) => {
                visitors.push({ id: doc.id, ...doc.data() });
            });
            callback(visitors);
        });
    }

    // Get visitors by status
    async getVisitorsByStatus(status, limit = 50) {
        try {
            const q = query(
                collection(db, 'visitors'),
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const visitors = [];
            snapshot.forEach((doc) => {
                visitors.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, visitors };
        } catch (error) {
            console.error('Error getting visitors by status:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new VisitorService();

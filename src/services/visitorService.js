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

    // Create visitor entry
    async createVisitor(data, guardInfo) {
        try {
            // Run risk analysis first
            const riskAnalysisService = (await import('./riskAnalysisService')).default;
            const riskAnalysis = await riskAnalysisService.analyzeVisitor(data);

            // Upload image first if present
            let photoUrl = null;
            if (data.photoUrl) {
                photoUrl = await this.uploadVisitorImage(data.photoUrl);
            }

            const visitorData = {
                visitorName: data.visitorName,
                visitorPhone: data.visitorPhone,
                flatNumber: data.flatNumber,
                purpose: data.purpose || 'Visit',
                vehicleNumber: data.vehicleNumber || '',
                photoUrl: photoUrl, // Use the storage URL, not the local URI
                status: data.status || 'pending', // 'pending', 'approved', 'denied', 'arrived', 'exited'
                createdBy: guardInfo?.uid || 'guard',
                createdByName: guardInfo?.name || 'Security Guard',
                createdAt: serverTimestamp(),
                approvedBy: null,
                approvedAt: null,
                enteredAt: null, // Changed from arrivedAt to enteredAt for consistency
                exitedAt: null,
                // Risk analysis data
                riskScore: riskAnalysis.riskScore,
                riskLevel: riskAnalysis.riskLevel,
                riskFactors: riskAnalysis.riskFactors || [],
            };

            const visitorRef = await addDoc(collection(db, 'visitors'), visitorData);

            // Audit log
            const auditService = (await import('./auditService')).default;
            await auditService.logAction(
                'visitor.created',
                guardInfo?.uid,
                guardInfo?.name,
                visitorRef.id,
                'visitor',
                { visitorName: data.visitorName, flatNumber: data.flatNumber, riskLevel: riskAnalysis.riskLevel }
            );

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

            // Send notifications based on status change
            const visitorSnap = await getDoc(visitorRef);
            const visitorData = visitorSnap.data();

            if (status === 'approved') {
                // Notify guard about approval
                const notification = notificationService.visitorApproved(
                    visitorData.visitorName,
                    visitorData.flatNumber
                );
                await notificationService.sendLocalNotification(
                    notification.title,
                    notification.body,
                    notification.data
                );
            } else if (status === 'denied') {
                // Could notify visitor about denial (if we had their push token)
                console.log('Visitor denied:', visitorData.visitorName);
            } else if (status === 'entered') {
                // Notify resident about visitor arrival
                const notification = notificationService.visitorArrived(
                    visitorData.visitorName,
                    visitorData.flatNumber
                );
                await notificationService.sendLocalNotification(
                    notification.title,
                    notification.body,
                    notification.data
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

    // PRE-REGISTRATION METHODS

    /**
     * Create a pre-registered visitor invitation
     */
    async createPreRegistration(flatNumber, visitorDetails, residentId) {
        try {
            const preRegData = {
                flatNumber,
                residentId,
                visitorName: visitorDetails.visitorName,
                visitorPhone: visitorDetails.visitorPhone,
                purpose: visitorDetails.purpose,
                expectedDate: visitorDetails.expectedDate || new Date(),
                status: 'invited', // 'invited', 'arrived', 'cancelled'
                createdAt: serverTimestamp(),
                usedAt: null,
                // NEW: Scheduling fields
                scheduledDate: visitorDetails.scheduledDate || null,
                scheduledTime: visitorDetails.scheduledTime || null,
                isRecurring: visitorDetails.isRecurring || false,
                recurrencePattern: visitorDetails.recurrencePattern || null, // 'daily', 'weekly', 'monthly'
                autoApprove: visitorDetails.autoApprove || false,
            };

            const docRef = await addDoc(collection(db, 'preRegistrations'), preRegData);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating pre-registration:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get pre-registrations for a flat
     */
    subscribeToPreRegistrations(flatNumber, callback) {
        const q = query(
            collection(db, 'preRegistrations'),
            where('flatNumber', '==', flatNumber),
            where('status', '==', 'invited'),
            orderBy('createdAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const preRegs = [];
            snapshot.forEach((doc) => {
                preRegs.push({ id: doc.id, ...doc.data() });
            });
            callback(preRegs);
        });
    }

    /**
     * Mark pre-registration as used
     */
    async markPreRegistrationUsed(preRegId) {
        try {
            const preRegRef = doc(db, 'preRegistrations', preRegId);
            await updateDoc(preRegRef, {
                status: 'arrived',
                usedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error) {
            console.error('Error marking pre-registration as used:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get pre-registration by phone number (for prior invite lookup)
     */
    async getPreRegistrationByPhone(phone) {
        try {
            const q = query(
                collection(db, 'preRegistrations'),
                where('visitorPhone', '==', phone),
                where('status', '==', 'invited'),
                orderBy('createdAt', 'desc'),
                limit(1)
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return {
                    success: true,
                    preRegistration: { id: doc.id, ...doc.data() }
                };
            } else {
                return { success: false, error: 'Not found' };
            }
        } catch (error) {
            console.error('Error getting pre-registration by phone:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get visitor count for today (for stats)
     */
    async getTodayVisitorCount(flatNumber) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const q = query(
                collection(db, 'visitors'),
                where('flatNumber', '==', flatNumber),
                where('createdAt', '>=', today)
            );

            const snapshot = await getDocs(q);
            return { success: true, count: snapshot.size };
        } catch (error) {
            console.error('Error getting today visitor count:', error);
            return { success: false, count: 0 };
        }
    }
}

export default new VisitorService();

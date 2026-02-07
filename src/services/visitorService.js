import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
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
                societyId: data.societyId, // Partition Key
                block: data.block || '',
                flatNumber: data.flatNumber,
                visitorName: data.visitorName,
                visitorPhone: data.visitorPhone,
                purpose: data.purpose || 'Visit',
                vehicleNumber: data.vehicleNumber || '',
                photoUrl: photoUrl, // Use the storage URL, not the local URI
                status: data.status || 'pending', // 'pending', 'approved', 'denied', 'entered', 'exited'

                // Guard / Creator Info
                createdBy: guardInfo?.uid || 'guard',
                createdByName: guardInfo?.name || 'Security Guard',
                guardId: guardInfo?.uid,
                createdAt: serverTimestamp(),

                // Lifecycle Timestamps
                approvedBy: null,
                approvedAt: null,
                enteredAt: null,
                exitedAt: null,
                deniedAt: null,

                // Risk analysis
                riskScore: riskAnalysis.riskScore,
                riskLevel: riskAnalysis.riskLevel,
                riskFactors: riskAnalysis.riskFactors || [],
                isRepeat: false // To be calculated
            };

            const visitorRef = await addDoc(collection(db, 'visitors'), visitorData);

            // Audit log
            const auditService = (await import('./auditService')).default;
            await auditService.logAction(
                'visitor.created',
                guardInfo?.uid,
                guardInfo?.name || 'Guard',
                visitorRef.id,
                'visitor',
                { ...visitorData, id: visitorRef.id }
            );

            // Send notification to resident
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

    // Advanced Visitor Query (Admin)
    async getVisitors(societyId, filters = {}, limitCount = 20, lastVisible = null) {
        // ... existing code ...
    }

    /**
     * Get recent visitors for a specific flat (Resident 360)
     */
    async getRecentVisitors(societyId, flatNumber, limitCount = 5) {
        try {
            const q = query(
                collection(db, 'visitors'),
                where('societyId', '==', societyId),
                where('flatNumber', '==', flatNumber),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const visitors = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            return { success: true, visitors };
        } catch (error) {
            console.error('Error fetching recent visitors:', error);
            // Fallback for missing index: return empty
            return { success: false, error: error.message, visitors: [] };
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

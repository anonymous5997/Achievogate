import {
    addDoc,
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import auditService from './auditService';

class GuardService {

    /**
     * Create a new Guard
     */
    async createGuard(guardData, adminId) {
        try {
            const data = {
                name: guardData.name,
                phone: guardData.phone,
                email: guardData.email || '',
                role: 'guard',
                societyId: guardData.societyId,
                shift: guardData.shift || 'Morning', // Morning, Evening, Night
                gateNumber: guardData.gateNumber || '1',
                active: true,
                isDeleted: false,
                status: 'off_duty', // on_duty, off_duty
                createdAt: serverTimestamp(),
                createdBy: adminId
            };

            const docRef = await addDoc(collection(db, 'users'), data);

            // Audit
            await auditService.logAction(
                'guard.created',
                adminId,
                docRef.id,
                guardData.societyId,
                { name: data.name, shift: data.shift }
            );

            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating guard:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark Guard Attendance (Check-in / Check-out)
     */
    async markAttendance(guardId, societyId, type, location = null) {
        try {
            const attendanceData = {
                guardId,
                societyId,
                type, // 'check_in' or 'check_out'
                timestamp: serverTimestamp(),
                location: location || 'Main Gate',
            };

            await addDoc(collection(db, 'attendance'), attendanceData);

            // Update Guard Status
            const guardRef = doc(db, 'users', guardId);
            await updateDoc(guardRef, {
                status: type === 'check_in' ? 'on_duty' : 'off_duty',
                lastAttendance: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error marking attendance:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get Guard Stats (Attendance, Visitors Handled)
     * Placeholder: In real app, aggregate from 'attendance' and 'visitors' collections
     */
    async getGuardStats(guardId) {
        try {
            // Mock stats for now
            return {
                success: true,
                stats: {
                    attendanceRate: '95%',
                    visitorsHandled: 120, // To do: count visitors where createdBy == guardId
                    avgCheckInTime: '08:05 AM',
                    performanceScore: '92' // Mock Score
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get Guards by Society (Wrapper for userService logic but specific to Guards)
     */
    async getGuards(societyId) {
        try {
            const q = query(
                collection(db, 'users'),
                where('societyId', '==', societyId),
                where('role', '==', 'guard'),
                where('isDeleted', '==', false),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const guards = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, guards };
        } catch (error) {
            console.error('Error fetching guards:', error);
            return { success: false, guards: [] };
        }
    }

    /**
     * Get Attendance Logs for a Guard
     */
    async getGuardAttendance(guardId, limitCount = 20) {
        try {
            const q = query(
                collection(db, 'attendance'),
                where('guardId', '==', guardId),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));

            return { success: true, logs };
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return { success: false, logs: [] };
        }
    }
}

export default new GuardService();

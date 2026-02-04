import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import notificationService from './notificationService';

const alertService = {
    // Trigger a panic alert
    triggerPanicAlert: async (userInfo, location, message = 'Emergency help needed!') => {
        try {
            const alert = {
                societyId: userInfo.societyId,
                type: 'panic',
                severity: 'critical',
                triggeredBy: userInfo.uid,
                triggeredByName: userInfo.name,
                triggeredByRole: userInfo.role,
                flatNumber: userInfo.flatNumber || 'N/A',
                location: location || { description: 'Location not available' },
                message: message,
                status: 'active',
                acknowledgedBy: [],
                notifiedUsers: [],
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'alerts'), alert);

            // Notify all guards and admins
            await notificationService.sendNotificationToRole(
                userInfo.societyId,
                ['guard', 'admin'],
                'EMERGENCY ALERT',
                `${userInfo.name} (${userInfo.flatNumber}) has triggered a panic alert!`,
                { type: 'panic_alert', alertId: docRef.id }
            );

            return { success: true, alertId: docRef.id };
        } catch (error) {
            console.error('Error triggering panic alert:', error);
            return { success: false, error: error.message };
        }
    },

    // Broadcast alert to all residents
    broadcastAlert: async (adminInfo, alertData) => {
        try {
            const alert = {
                societyId: adminInfo.societyId,
                type: alertData.type || 'other',
                severity: alertData.severity || 'medium',
                triggeredBy: adminInfo.uid,
                triggeredByName: adminInfo.name,
                triggeredByRole: 'admin',
                message: alertData.message,
                status: 'active',
                acknowledgedBy: [],
                notifiedUsers: [],
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'alerts'), alert);

            // Notify all residents
            await notificationService.sendNotificationToRole(
                adminInfo.societyId,
                ['resident', 'guard'],
                `ALERT: ${alertData.type.toUpperCase()}`,
                alertData.message,
                { type: 'broadcast_alert', alertId: docRef.id }
            );

            return { success: true, alertId: docRef.id };
        } catch (error) {
            console.error('Error broadcasting alert:', error);
            return { success: false, error: error.message };
        }
    },

    // Get active alerts
    getActiveAlerts: async (societyId) => {
        try {
            const q = query(
                collection(db, 'alerts'),
                where('societyId', '==', societyId),
                where('status', '==', 'active')
            );

            const snapshot = await getDocs(q);
            const alerts = [];

            snapshot.forEach(doc => {
                alerts.push({ id: doc.id, ...doc.data() });
            });

            alerts.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());

            return alerts;
        } catch (error) {
            console.error('Error fetching alerts:', error);
            return [];
        }
    }
};

export default alertService;

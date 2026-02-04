import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Notification Service - Manages push notifications with Expo Notifications
 */

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    /**
     * Request notification permissions
     */
    async requestPermissions() {
        try {
            if (!Device.isDevice) {
                console.log('Must use physical device for Push Notifications');
                return { success: false, error: 'Not a physical device' };
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                return { success: false, error: 'Permission not granted' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get Expo push token and save to user profile
     */
    async registerForPushNotifications(userId) {
        try {
            const permissionResult = await this.requestPermissions();
            if (!permissionResult.success) {
                return permissionResult;
            }

            // Get Expo push token
            const token = (await Notifications.getExpoPushTokenAsync()).data;

            // Save token to user document
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                expoPushToken: token,
                notificationsEnabled: true,
                lastTokenUpdate: new Date(),
            });

            return { success: true, token };
        } catch (error) {
            console.error('Error registering for push notifications:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send local notification (for testing/demo)
     */
    async sendLocalNotification(title, body, data = {}) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                },
                trigger: null, // Immediate
            });

            return { success: true };
        } catch (error) {
            console.error('Error sending notification:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Notification Templates
     */

    // Visitor notifications
    visitorRegistered(visitorName, flatNumber) {
        return {
            title: '🔔 New Visitor Registered',
            body: `${visitorName} is requesting to visit ${flatNumber}`,
            data: { type: 'visitor_registered', visitorName, flatNumber },
        };
    }

    visitorApproved(visitorName, flatNumber) {
        return {
            title: '✅ Visitor Approved',
            body: `${visitorName} has been approved for ${flatNumber}`,
            data: { type: 'visitor_approved', visitorName, flatNumber },
        };
    }

    visitorArrived(visitorName, flatNumber) {
        return {
            title: '🚪 Visitor Arrived',
            body: `${visitorName} has arrived at ${flatNumber}`,
            data: { type: 'visitor_arrived', visitorName, flatNumber },
        };
    }

    // Parcel notifications
    parcelLogged(flatNumber, description) {
        return {
            title: '📦 New Parcel Arrived',
            body: `${description} delivered to ${flatNumber}`,
            data: { type: 'parcel_logged', flatNumber, description },
        };
    }

    // Complaint notifications
    complaintFiled(category, priority) {
        return {
            title: '📝 New Complaint Filed',
            body: `${priority.toUpperCase()} priority ${category} complaint`,
            data: { type: 'complaint_filed', category, priority },
        };
    }

    complaintOverdue(complaintTitle, hours) {
        return {
            title: '⚠️ Complaint Overdue',
            body: `"${complaintTitle}" is ${hours}h overdue`,
            data: { type: 'complaint_overdue', complaintTitle, hours },
        };
    }

    /**
     * Subscribe to notification received events
     */
    addNotificationListener(callback) {
        return Notifications.addNotificationReceivedListener(callback);
    }

    /**
     * Subscribe to notification tapped events
     */
    addNotificationResponseListener(callback) {
        return Notifications.addNotificationResponseReceivedListener(callback);
    }

    /**
     * Remove notification listeners
     */
    removeNotificationListener(subscription) {
        if (subscription) {
            Notifications.removeNotificationSubscription(subscription);
        }
    }

    /**
     * Clear all notifications
     */
    async clearAllNotifications() {
        await Notifications.dismissAllNotificationsAsync();
    }
}

export default new NotificationService();

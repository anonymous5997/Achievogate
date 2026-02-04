// Notification Service - Disabled for Expo Go
// This is a stub to prevent crashes in Expo Go environment

class NotificationService {
    async registerForPushNotificationsAsync() {
        console.log('[NotificationService] Disabled in Expo Go');
        return null;
    }

    async registerToken(userId) {
        return { success: true, message: 'Notifications disabled' };
    }

    async sendVisitorNotification(flatNumber, visitorName, visitorId) {
        return { success: true };
    }

    async sendStatusUpdateNotification(guardId, status, visitorName) {
        return { success: true };
    }
}

export default new NotificationService();

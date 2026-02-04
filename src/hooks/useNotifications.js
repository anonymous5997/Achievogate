import { useEffect, useState } from 'react';
import notificationService from '../services/notificationService';

/**
 * Hook for managing push notifications
 */
const useNotifications = (userId) => {
    const [expoPushToken, setExpoPushToken] = useState(null);
    const [notification, setNotification] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState(null);

    useEffect(() => {
        if (!userId) return;

        // Register for push notifications
        registerForPushNotifications();

        // Set up notification listeners
        const notificationListener = notificationService.addNotificationListener((notification) => {
            setNotification(notification);
        });

        const responseListener = notificationService.addNotificationResponseListener((response) => {
            // Handle notification tap
            const data = response.notification.request.content.data;
            handleNotificationTap(data);
        });

        return () => {
            notificationService.removeNotificationListener(notificationListener);
            notificationService.removeNotificationListener(responseListener);
        };
    }, [userId]);

    const registerForPushNotifications = async () => {
        const result = await notificationService.registerForPushNotifications(userId);
        if (result.success) {
            setExpoPushToken(result.token);
            setNotificationPermission('granted');
        } else {
            setNotificationPermission('denied');
            console.log('Failed to get push token:', result.error);
        }
    };

    const handleNotificationTap = (data) => {
        // Handle different notification types
        console.log('Notification tapped:', data);
        // You can add navigation logic here based on notification type
    };

    const sendLocalNotification = async (title, body, data = {}) => {
        return await notificationService.sendLocalNotification(title, body, data);
    };

    const clearNotifications = async () => {
        await notificationService.clearAllNotifications();
    };

    return {
        expoPushToken,
        notification,
        notificationPermission,
        sendLocalNotification,
        clearNotifications,
    };
};

export default useNotifications;

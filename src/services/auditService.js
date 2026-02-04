import * as Device from 'expo-device';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from '../../firebaseConfig';

/**
 * Audit Service - Logs all important actions for compliance
 */

class AuditService {
    /**
     * Log an action
     */
    async logAction(actionType, performedBy, performedByName, targetId, targetType, changes = {}) {
        try {
            const auditData = {
                action: actionType,
                performedBy,
                performedByName,
                targetId,
                targetType,
                changes,
                timestamp: serverTimestamp(),
                deviceInfo: {
                    platform: Platform.OS,
                    deviceModel: Device.modelName || 'Unknown',
                    osVersion: Device.osVersion || 'Unknown',
                },
            };

            await addDoc(collection(db, 'auditLogs'), auditData);
            return { success: true };
        } catch (error) {
            console.error('Error logging audit:', error);
            return { success: false, error: error.message };
        }
    }

    // Specific audit log methods
    async logVisitorApproval(userId, userName, visitorId, visitorName) {
        return this.logAction(
            'visitor.approved',
            userId,
            userName,
            visitorId,
            'visitor',
            { visitorName, status: 'approved' }
        );
    }

    async logVisitorDenial(userId, userName, visitorId, visitorName) {
        return this.logAction(
            'visitor.denied',
            userId,
            userName,
            visitorId,
            'visitor',
            { visitorName, status: 'denied' }
        );
    }

    async logComplaintStatusChange(userId, userName, complaintId, oldStatus, newStatus) {
        return this.logAction(
            'complaint.status_changed',
            userId,
            userName,
            complaintId,
            'complaint',
            { before: { status: oldStatus }, after: { status: newStatus } }
        );
    }

    async logUserCreated(userId, userName, newUserId, newUserData) {
        return this.logAction(
            'user.created',
            userId,
            userName,
            newUserId,
            'user',
            { userData: new UserData }
        );
    }

    async logUserDeleted(userId, userName, deletedUserId, deletedUserName) {
        return this.logAction(
            'user.deleted',
            userId,
            userName,
            deletedUserId,
            'user',
            { deletedUserName }
        );
    }

    async logSocietyModified(userId, userName, societyId, changes) {
        return this.logAction(
            'society.modified',
            userId,
            userName,
            societyId,
            'society',
            changes
        );
    }
}

export default new AuditService();

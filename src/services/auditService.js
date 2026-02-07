import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Audit Service - Logs critical actions for compliance and tracking
 */
class AuditService {

    ACTION_TYPES = {
        RESIDENT_CREATED: 'RESIDENT_CREATED',
        RESIDENT_UPDATED: 'RESIDENT_UPDATED',
        RESIDENT_DELETED: 'RESIDENT_DELETED',
        BULK_IMPORT: 'BULK_IMPORT',
        ROLE_CHANGE: 'ROLE_CHANGE',
        STATUS_CHANGE: 'STATUS_CHANGE'
    };

    /**
     * Log an action to the 'auditLogs' collection
     * @param {string} actionType - One of ACTION_TYPES
     * @param {string} actorUserId - ID of the admin performing the action
     * @param {string} targetUserId - ID of the user being affected
     * @param {string} societyId - ID of the society
     * @param {object} metadata - Additional details (e.g., specific fields changed)
     */
    async logAction(actionType, actorUserId, targetUserId, societyId, metadata = {}) {
        try {
            const logEntry = {
                actionType,
                actorUserId,
                targetUserId,
                societyId,
                metadata,
                timestamp: serverTimestamp(),
                deviceInfo: 'App/Web Console' // Placeholder for real device info
            };

            await addDoc(collection(db, 'auditLogs'), logEntry);
            console.log(`[Audit] Logged: ${actionType}`);
            return { success: true };
        } catch (error) {
            console.error('[Audit] Failed to log action:', error);
            // Audit logging failure should not break the main flow, but we log it to console
            return { success: false, error: error.message };
        }
    }
}

export default new AuditService();

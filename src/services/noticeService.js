import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Notice Service - Targeted Announcements
 */

class NoticeService {

    /**
     * Create a new Notice
     */
    async createNotice(noticeData) {
        try {
            const { societyId, title, content, targetRole, targetBlock, validUntil } = noticeData;

            const newNotice = {
                societyId,
                title,
                content,
                targetRole: targetRole || 'all', // all, resident, guard, owner, tenant
                targetBlock: targetBlock || 'all', // all, A, B...
                validUntil: validUntil || null,
                isPinned: false,
                readBy: [], // Array of userIds who read this
                createdAt: serverTimestamp(),
                createdBy: noticeData.createdBy,
            };

            const docRef = await addDoc(collection(db, 'notices'), newNotice);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating notice:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark notice as read by user
     */
    async markAsRead(noticeId, userId) {
        try {
            const noticeRef = doc(db, 'notices', noticeId);
            // using arrayUnion to add userId unique
            await updateDoc(noticeRef, {
                readBy: arrayUnion(userId)
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get Notices for a specific user context
     */
    async getNotices(societyId, userRole, userBlock) {
        try {
            // Firestore OR queries are limited, so we fetch relevant subsets or filter client-side 
            // if dataset is small (Notices are usually few).
            // Strategy: Fetch all for society, then filter.

            const q = query(
                collection(db, 'notices'),
                where('societyId', '==', societyId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const notices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Client-side Filtering for Targeting
            const filtered = notices.filter(notice => {
                const roleMatch = notice.targetRole === 'all' || notice.targetRole === userRole;
                // Simple Block check: userBlock might be 'A' from 'A-101'
                const blockMatch = notice.targetBlock === 'all' || (userBlock && notice.targetBlock === userBlock);

                return roleMatch && blockMatch;
            });

            return { success: true, notices: filtered };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete Notice
     */
    async deleteNotice(noticeId) {
        try {
            await deleteDoc(doc(db, 'notices', noticeId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export const subscribeToNotices = (societyId, userRole, userBlock, callback) => {
    if (!societyId) return () => { };

    const q = query(
        collection(db, 'notices'),
        where('societyId', '==', societyId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side Filter
        if (userRole === 'admin') {
            callback(notices);
            return;
        }

        const filtered = notices.filter(notice => {
            const roleMatch = notice.targetRole === 'all' || notice.targetRole === userRole;
            const blockMatch = notice.targetBlock === 'all' || (userBlock && notice.targetBlock === userBlock);
            return roleMatch && blockMatch;
        });

        callback(filtered);
    });
};

export default new NoticeService();

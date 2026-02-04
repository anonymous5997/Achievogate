import { addDoc, collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Notice Service - Manages community notice board
 */

/**
 * Add a new notice (Admin only)
 */
export const addNotice = async (title, content, icon = 'notifications', priority = 'normal') => {
    try {
        const noticeData = {
            title,
            content,
            icon,
            priority, // 'high' or 'normal'
            date: new Date(),
            active: true,
        };

        const docRef = await addDoc(collection(db, 'notices'), noticeData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding notice:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get all active notices
 */
export const getNotices = async () => {
    try {
        const q = query(
            collection(db, 'notices'),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        const notices = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate(),
            }))
            .filter(notice => notice.active !== false); // Filter active in code

        return { success: true, notices };
    } catch (error) {
        console.error('Error fetching notices:', error);
        return { success: false, error: error.message, notices: [] };
    }
};

/**
 * Subscribe to active notices (real-time)
 */
export const subscribeToNotices = (callback) => {
    const q = query(
        collection(db, 'notices'),
        orderBy('date', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notices = snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate(),
            }))
            .filter(notice => notice.active !== false); // Filter active in code
        callback(notices);
    });
};


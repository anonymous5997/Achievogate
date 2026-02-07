import { useEffect, useState } from 'react';
import {
    subscribeToNotices
} from '../services/noticeService';
import useAuth from './useAuth'; // Need user context

/**
 * Custom hook for notice board
 */
const useNotices = () => {
    const {
        userProfile
    } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        const userRole = userProfile?.role || 'resident';
        const userBlock = userProfile?.block || userProfile?.flatNumber?.split('-')[0] || null;

        // Subscribe to notices with targeting
        const unsubscribe = subscribeToNotices(userProfile?.societyId, userRole, userBlock, (fetchedNotices) => {
            // Sort by priority (high first) then by date
            const sorted = fetchedNotices.sort((a, b) => {
                if (a.priority === 'high' && b.priority !== 'high') return -1;
                if (a.priority !== 'high' && b.priority === 'high') return 1;
                // createAt might be Firestore timestamp or Date
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            setNotices(sorted);
            setLoading(false);
        });

        return () => unsubscribe && unsubscribe();
    }, [userProfile?.societyId]);

    return {
        notices,
        highPriorityNotices: notices.filter(n => n.priority === 'high'),
        normalNotices: notices.filter(n => n.priority === 'normal'),
        loading,
    };
};

export default useNotices;

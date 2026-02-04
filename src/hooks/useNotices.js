import { useEffect, useState } from 'react';
import { subscribeToNotices } from '../services/noticeService';

/**
 * Custom hook for notice board
 */
const useNotices = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        // Subscribe to notices
        const unsubscribe = subscribeToNotices((fetchedNotices) => {
            // Sort by priority (high first) then by date
            const sorted = fetchedNotices.sort((a, b) => {
                if (a.priority === 'high' && b.priority !== 'high') return -1;
                if (a.priority !== 'high' && b.priority === 'high') return 1;
                return b.date - a.date;
            });
            setNotices(sorted);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return {
        notices,
        highPriorityNotices: notices.filter(n => n.priority === 'high'),
        normalNotices: notices.filter(n => n.priority === 'normal'),
        loading,
    };
};

export default useNotices;

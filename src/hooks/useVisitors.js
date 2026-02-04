import { useEffect, useState } from 'react';
import visitorService from '../services/visitorService';

export const useVisitors = (filterType, filterValue) => {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe;

        const setupSubscription = () => {
            setLoading(true);

            switch (filterType) {
                case 'guard':
                    unsubscribe = visitorService.subscribeToGuardVisitors(filterValue, (data) => {
                        setVisitors(data);
                        setLoading(false);
                    });
                    break;

                case 'pending':
                    unsubscribe = visitorService.subscribeToPendingVisitors(filterValue, (data) => {
                        setVisitors(data);
                        setLoading(false);
                    });
                    break;

                case 'resident':
                    unsubscribe = visitorService.subscribeToResidentVisitors(filterValue, (data) => {
                        setVisitors(data);
                        setLoading(false);
                    });
                    break;

                case 'all':
                    unsubscribe = visitorService.subscribeToAllVisitors(filterValue, (data) => {
                        setVisitors(data);
                        setLoading(false);
                    });
                    break;

                default:
                    setLoading(false);
            }
        };

        if (filterType && filterValue) {
            setupSubscription();
        } else {
            setLoading(false);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [filterType, filterValue]);

    const createVisitor = async (visitorData, guardId) => {
        const result = await visitorService.createVisitor(visitorData, guardId);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const updateStatus = async (visitorId, status, userId) => {
        const result = await visitorService.updateVisitorStatus(visitorId, status, userId);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const approveVisitor = async (visitorId, userId) => {
        return updateStatus(visitorId, 'approved', userId);
    };

    const denyVisitor = async (visitorId, userId) => {
        return updateStatus(visitorId, 'denied', userId);
    };

    const markEntered = async (visitorId) => {
        return updateStatus(visitorId, 'entered', null);
    };

    const markExited = async (visitorId) => {
        return updateStatus(visitorId, 'exited', null);
    };

    const pendingVisitors = visitors.filter(v => v.status === 'pending');
    const approvedVisitors = visitors.filter(v => v.status === 'approved');
    const deniedVisitors = visitors.filter(v => v.status === 'denied');

    return {
        visitors,
        pendingVisitors,
        approvedVisitors,
        deniedVisitors,
        loading,
        error,
        createVisitor,
        updateStatus,
        approveVisitor,
        denyVisitor,
        markEntered,
        markExited,
    };
};

export default useVisitors;

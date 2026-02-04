import { useEffect, useState } from 'react';
import { markParcelCollected, subscribeToParcels } from '../services/parcelService';

/**
 * Custom hook for managing parcels
 */
const useParcels = (flatNumber) => {
    const [parcels, setParcels] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!flatNumber) return;

        setLoading(true);

        // Subscribe to parcels
        const unsubscribe = subscribeToParcels(flatNumber, (fetchedParcels) => {
            setParcels(fetchedParcels);
            const pending = fetchedParcels.filter(p => p.status === 'pending').length;
            setPendingCount(pending);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [flatNumber]);

    const collectParcel = async (parcelId) => {
        const result = await markParcelCollected(parcelId);
        return result;
    };

    return {
        parcels,
        pendingParcels: parcels.filter(p => p.status === 'pending'),
        collectedParcels: parcels.filter(p => p.status === 'collected'),
        pendingCount,
        loading,
        collectParcel,
    };
};

export default useParcels;

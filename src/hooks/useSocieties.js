import { useEffect, useState } from 'react';
import societyService from '../services/societyService';

/**
 * Custom hook for society management
 */
const useSocieties = () => {
    const [societies, setSocieties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);

        // Subscribe to real-time updates
        const unsubscribe = societyService.subscribeToSocieties((fetchedSocieties) => {
            setSocieties(fetchedSocieties);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const createSociety = async (societyData) => {
        const result = await societyService.createSociety(societyData);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const updateSociety = async (societyId, updateData) => {
        const result = await societyService.updateSociety(societyId, updateData);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const deleteSociety = async (societyId) => {
        const result = await societyService.deleteSociety(societyId);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    return {
        societies,
        loading,
        error,
        createSociety,
        updateSociety,
        deleteSociety,
    };
};

export default useSocieties;

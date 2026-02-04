import { useEffect, useState } from 'react';
import complaintService from '../services/complaintService';

/**
 * Custom hook for complaint management
 */
const useComplaints = (filters = {}) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);

        // Subscribe to real-time updates
        const unsubscribe = complaintService.subscribeToComplaints(filters, (fetchedComplaints) => {
            setComplaints(fetchedComplaints);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [filters.status, filters.societyId, filters.createdBy]);

    const createComplaint = async (complaintData) => {
        const result = await complaintService.createComplaint(complaintData);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const updateStatus = async (complaintId, status) => {
        const result = await complaintService.updateComplaintStatus(complaintId, status);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const assignComplaint = async (complaintId, assignedTo) => {
        const result = await complaintService.assignComplaint(complaintId, assignedTo);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const addComment = async (complaintId, comment, userId, userName) => {
        const result = await complaintService.addComment(complaintId, comment, userId, userName);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const deleteComplaint = async (complaintId) => {
        const result = await complaintService.deleteComplaint(complaintId);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    return {
        complaints,
        pendingComplaints: complaints.filter(c => c.status === 'pending'),
        inProgressComplaints: complaints.filter(c => c.status === 'in-progress'),
        resolvedComplaints: complaints.filter(c => c.status === 'resolved'),
        loading,
        error,
        createComplaint,
        updateStatus,
        assignComplaint,
        addComment,
        deleteComplaint,
    };
};

export default useComplaints;

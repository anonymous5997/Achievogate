import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Complaint Service - Manages complaints from all users
 */

class ComplaintService {
    /**
     * Create a new complaint
     */
    async createComplaint(complaintData) {
        try {
            const data = {
                title: complaintData.title,
                description: complaintData.description,
                category: complaintData.category, // 'maintenance', 'security', 'noise', 'cleanliness', 'other'
                priority: complaintData.priority || 'medium', // 'low', 'medium', 'high'
                status: 'pending', // 'pending', 'in-progress', 'resolved', 'closed'
                createdBy: complaintData.createdBy, // userId
                createdByRole: complaintData.createdByRole, // 'resident', 'guard', 'admin'
                societyId: complaintData.societyId,
                flatNumber: complaintData.flatNumber || '',
                againstUser: complaintData.againstUser || null, // optional
                assignedTo: complaintData.assignedTo || null, // optional
                photos: complaintData.photos || [],
                comments: [],
                createdAt: serverTimestamp(),
                resolvedAt: null,
            };

            const docRef = await addDoc(collection(db, 'complaints'), complaintData);

            // Send notification to admin
            const notificationService = (await import('./notificationService')).default;
            const notification = notificationService.complaintFiled(
                complaintData.category,
                complaintData.priority
            );
            await notificationService.sendLocalNotification(
                notification.title,
                notification.body,
                notification.data
            );

            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating complaint:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get complaints with filters
     */
    async getComplaints(filters = {}) {
        try {
            let q = query(collection(db, 'complaints'));

            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }

            if (filters.societyId) {
                q = query(q, where('societyId', '==', filters.societyId));
            }

            if (filters.createdBy) {
                q = query(q, where('createdBy', '==', filters.createdBy));
            }

            if (filters.assignedTo) {
                q = query(q, where('assignedTo', '==', filters.assignedTo));
            }

            if (filters.category) {
                q = query(q, where('category', '==', filters.category));
            }

            q = query(q, orderBy('createdAt', 'desc'));

            const snapshot = await getDocs(q);
            const complaints = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                resolvedAt: doc.data().resolvedAt?.toDate(),
            }));

            return { success: true, complaints };
        } catch (error) {
            console.error('Error fetching complaints:', error);
            return { success: false, error: error.message, complaints: [] };
        }
    }

    /**
     * Get a single complaint by ID
     */
    async getComplaint(complaintId) {
        try {
            const docRef = doc(db, 'complaints', complaintId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    success: true,
                    complaint: {
                        id: docSnap.id,
                        ...docSnap.data(),
                        createdAt: docSnap.data().createdAt?.toDate(),
                        resolvedAt: docSnap.data().resolvedAt?.toDate(),
                    },
                };
            } else {
                return { success: false, error: 'Complaint not found' };
            }
        } catch (error) {
            console.error('Error fetching complaint:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update complaint status
     */
    async updateComplaintStatus(complaintId, status, userId, userName) {
        try {
            // Get current complaint to track changes
            const complaintRef = doc(db, 'complaints', complaintId);
            const complaintSnap = await getDoc(complaintRef);
            const oldStatus = complaintSnap.data()?.status;

            const updates = {
                status: status,
                updatedAt: serverTimestamp(),
            };

            if (status === 'resolved' || status === 'closed') {
                updates.resolvedAt = serverTimestamp();
            }

            await updateDoc(complaintRef, updates);

            // Audit log
            const auditService = (await import('./auditService')).default;
            await auditService.logComplaintStatusChange(
                userId,
                userName,
                complaintId,
                oldStatus,
                status
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating complaint status:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Assign complaint to user
     */
    async assignComplaint(complaintId, assignedTo) {
        try {
            const complaintRef = doc(db, 'complaints', complaintId);
            await updateDoc(complaintRef, {
                assignedTo: assignedTo,
                status: 'in-progress',
                updatedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            console.error('Error assigning complaint:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Add comment to complaint
     */
    async addComment(complaintId, comment, userId, userName) {
        try {
            const complaintRef = doc(db, 'complaints', complaintId);
            const complaintSnap = await getDoc(complaintRef);

            if (complaintSnap.exists()) {
                const currentComments = complaintSnap.data().comments || [];
                const newComment = {
                    text: comment,
                    userId: userId,
                    userName: userName,
                    timestamp: new Date(),
                };

                await updateDoc(complaintRef, {
                    comments: [...currentComments, newComment],
                    updatedAt: serverTimestamp(),
                });

                return { success: true };
            } else {
                return { success: false, error: 'Complaint not found' };
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete complaint
     */
    async deleteComplaint(complaintId) {
        try {
            const complaintRef = doc(db, 'complaints', complaintId);
            await deleteDoc(complaintRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting complaint:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Subscribe to complaints (real-time)
     */
    subscribeToComplaints(filters = {}, callback) {
        let q = query(collection(db, 'complaints'));

        if (filters.status) {
            q = query(q, where('status', '==', filters.status));
        }

        if (filters.societyId) {
            q = query(q, where('societyId', '==', filters.societyId));
        }

        if (filters.createdBy) {
            q = query(q, where('createdBy', '==', filters.createdBy));
        }

        q = query(q, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const complaints = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                resolvedAt: doc.data().resolvedAt?.toDate(),
            }));
            callback(complaints);
        });
    }

    /**
     * Get complaint count by status
     */
    async getComplaintCount(filters = {}) {
        try {
            let q = query(collection(db, 'complaints'));

            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }

            if (filters.societyId) {
                q = query(q, where('societyId', '==', filters.societyId));
            }

            const snapshot = await getDocs(q);
            return { success: true, count: snapshot.size };
        } catch (error) {
            console.error('Error getting complaint count:', error);
            return { success: false, count: 0 };
        }
    }
}

export default new ComplaintService();

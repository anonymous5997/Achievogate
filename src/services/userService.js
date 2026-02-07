import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    startAfter,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import auditService from './auditService';

/**
 * User Service - Enhanced user management for all roles
 * Supports Pagination, Audit Logging, and Advanced Filtering
 */

class UserService {

    /**
     * Get Residents with Pagination & Filtering
     * @param {string} societyId 
     * @param {object} filters { status, block, floor, search }
     * @param {QueryDocumentSnapshot} lastDoc - For pagination
     * @param {number} pageSize 
     */
    async getResidents(societyId, filters = {}, lastDoc = null, pageSize = 20) {
        try {
            let q = query(
                collection(db, 'users'),
                where('societyId', '==', societyId),
                where('role', '==', 'resident'),
                where('isDeleted', '==', false)
            );

            // Apply Filters
            if (filters.status && filters.status !== 'all') {
                q = query(q, where('status', '==', filters.status));
            }
            if (filters.block && filters.block !== 'all') {
                q = query(q, where('block', '==', filters.block));
            }
            // Note: 'floor' might need a composite index if used with other filters

            // Ordering
            q = query(q, orderBy('createdAt', 'desc'));

            // Pagination
            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            q = query(q, limit(pageSize));

            const snapshot = await getDocs(q);
            const residents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            }));

            // Client-side Search (Firestore doesn't support partial text search easily without external services like Algolia)
            // For MVP, we filter the current page or rely on precise matches if needed.
            // A better approach for "Search" is to have a separate "searchUsers" method that doesn't paginate deeply.

            return {
                success: true,
                residents,
                lastVisible: snapshot.docs[snapshot.docs.length - 1],
                hasMore: snapshot.docs.length === pageSize
            };
        } catch (error) {
            console.error('Error fetching residents:', error);
            return { success: false, error: error.message, residents: [] };
        }
    }

    /**
     * Create a new resident with Audit Log
     */
    async createResident(residentData, adminId) {
        try {
            const data = {
                name: residentData.name,
                email: residentData.email || '',
                phone: residentData.phone,
                role: 'resident',
                societyId: residentData.societyId,
                flatNumber: residentData.flatNumber,
                block: residentData.block || '',
                floor: residentData.floor || '',
                occupantCount: residentData.occupantCount || 1,
                occupancyStatus: residentData.occupancyStatus || 'owner',
                status: residentData.status || 'pending', // pending, active, rejected
                vehicles: residentData.vehicles || [],
                vehicleIds: [], // Legacy or efficient lookups
                familyMembers: residentData.familyMembers || [],
                active: true,
                isDeleted: false,
                trustedDevices: [],
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'users'), data);

            // Audit
            await auditService.logAction(
                auditService.ACTION_TYPES.RESIDENT_CREATED,
                adminId,
                docRef.id,
                residentData.societyId,
                { name: data.name, flat: data.flatNumber }
            );

            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating resident:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update Resident Status (Active/Suspend/Reject)
     */
    async updateResidentStatus(userId, status, adminId, societyId) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                status: status,
                updatedAt: serverTimestamp()
            });

            await auditService.logAction(
                auditService.ACTION_TYPES.STATUS_CHANGE,
                adminId,
                userId,
                societyId,
                { newStatus: status }
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating status:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Bulk Import Residents from CSV Data
     * Uses batch writes for atomicity (chunks of 500)
     */
    async bulkImportResidents(residentsData, societyId, adminId) {
        try {
            const batch = writeBatch(db);
            const summary = { successItems: 0, failedItems: 0 };

            // In a real app, process in chunks of 500 (Firestore batch limit)
            // For MVP, assuming < 500 rows

            residentsData.forEach(res => {
                const docRef = doc(collection(db, 'users')); // Auto-ID
                const data = {
                    ...res,
                    role: 'resident',
                    societyId: societyId,
                    status: 'active', // Default to active for bulk imports usually
                    active: true,
                    isDeleted: false,
                    createdAt: serverTimestamp()
                };
                batch.set(docRef, data);
                summary.successItems++;
            });

            await batch.commit();

            await auditService.logAction(
                auditService.ACTION_TYPES.BULK_IMPORT,
                adminId,
                'BULK',
                societyId,
                { count: summary.successItems }
            );

            return { success: true, summary };
        } catch (error) {
            console.error('Bulk Import Failed:', error);
            return { success: false, error: error.message };
        }
    }


    /* --- Legacy / Other Role Methods --- */

    /**
     * Get users by role (Legacy - kept for backward compatibility if needed)
     */
    async getUsers(role = null, filters = {}) {
        try {
            let q = query(collection(db, 'users'), where('active', '==', true), where('isDeleted', '==', false));

            if (role) {
                q = query(q, where('role', '==', role));
            }

            if (filters.societyId) {
                q = query(q, where('societyId', '==', filters.societyId));
            }

            q = query(q, orderBy('createdAt', 'desc'));

            const snapshot = await getDocs(q);
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            }));

            return { success: true, users };
        } catch (error) {
            console.error('Error fetching users:', error);
            return { success: false, error: error.message, users: [] };
        }
    }

    /**
     * Get a single user by ID
     */
    async getUser(userId) {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    success: true,
                    user: {
                        id: docSnap.id,
                        ...docSnap.data(),
                        createdAt: docSnap.data().createdAt?.toDate(),
                    },
                };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update user
     */
    async updateUser(userId, updateData) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                ...updateData,
                updatedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete user (soft delete)
     */
    async deleteUser(userId) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                active: false,
                isDeleted: true, // Enterprise Soft Delete
                deletedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Assign society to user
     */
    async assignSociety(userId, societyId) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                societyId: societyId,
                updatedAt: serverTimestamp(),
            });

            return { success: true };
        } catch (error) {
            console.error('Error assigning society:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Subscribe to users by role (real-time)
     */
    subscribeToUsers(role = null, filters = {}, callback) {
        let q = query(collection(db, 'users'), where('active', '==', true), where('isDeleted', '==', false));

        if (role) {
            q = query(q, where('role', '==', role));
        }

        if (filters.societyId) {
            q = query(q, where('societyId', '==', filters.societyId));
        }

        q = query(q, orderBy('createdAt', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
            }));
            callback(users);
        });
    }

    /**
     * Get user count by role
     */
    async getUserCount(role = null) {
        try {
            let q = query(collection(db, 'users'), where('active', '==', true), where('isDeleted', '==', false));

            if (role) {
                q = query(q, where('role', '==', role));
            }

            const snapshot = await getDocs(q);
            return { success: true, count: snapshot.size };
        } catch (error) {
            console.error('Error getting user count:', error);
            return { success: false, count: 0 };
        }
    }

    /**
     * Search users by name
     */
    async searchUsers(searchTerm, role = null) {
        try {
            let q = query(collection(db, 'users'), where('active', '==', true), where('isDeleted', '==', false));

            if (role) {
                q = query(q, where('role', '==', role));
            }

            const snapshot = await getDocs(q);
            const users = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                }))
                .filter(user =>
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.phone.includes(searchTerm)
                );

            return { success: true, users };
        } catch (error) {
            console.error('Error searching users:', error);
            return { success: false, error: error.message, users: [] };
        }
    }
}


export default new UserService();

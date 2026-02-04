import {
    addDoc,
    collection,
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
 * User Service - Enhanced user management for all roles
 */

class UserService {
    /**
     * Create a new user
     */
    async createUser(role, userData) {
        try {
            const data = {
                name: userData.name,
                email: userData.email || '',
                phone: userData.phone,
                role: role, // 'admin', 'guard', 'resident'
                societyId: userData.societyId || '',
                flatNumber: userData.flatNumber || '', // for residents
                shiftTiming: userData.shiftTiming || '', // for guards
                active: true,
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'users'), data);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get users by role
     */
    async getUsers(role = null, filters = {}) {
        try {
            let q = query(collection(db, 'users'), where('active', '==', true));

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
        let q = query(collection(db, 'users'), where('active', '==', true));

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
            let q = query(collection(db, 'users'), where('active', '==', true));

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
            let q = query(collection(db, 'users'), where('active', '==', true));

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

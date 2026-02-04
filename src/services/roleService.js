import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

class RoleService {
    // Get user role
    async getUserRole(userId) {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                return { success: true, role: userData.role, user: userData };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error getting user role:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user role (admin only)
    async updateUserRole(userId, newRole) {
        try {
            const validRoles = ['admin', 'guard', 'resident'];
            if (!validRoles.includes(newRole)) {
                return { success: false, error: 'Invalid role' };
            }

            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                role: newRole,
                updatedAt: new Date().toISOString(),
            });

            return { success: true };
        } catch (error) {
            console.error('Error updating user role:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all users by role
    async getUsersByRole(role) {
        try {
            const q = query(
                collection(db, 'users'),
                where('role', '==', role)
            );

            const snapshot = await getDocs(q);
            const users = [];

            snapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, users };
        } catch (error) {
            console.error('Error getting users by role:', error);
            return { success: false, error: error.message };
        }
    }

    // Get all users (admin only)
    async getAllUsers() {
        try {
            const snapshot = await getDocs(collection(db, 'users'));
            const users = [];

            snapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, users };
        } catch (error) {
            console.error('Error getting all users:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if user has permission
    hasPermission(userRole, requiredRole) {
        const roleHierarchy = {
            admin: 3,
            guard: 2,
            resident: 1,
        };

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    }

    // Check if user can access resource
    canAccessResource(userRole, resourceRole) {
        if (userRole === 'admin') return true;
        return userRole === resourceRole;
    }
}

export default new RoleService();

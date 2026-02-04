import { useEffect, useState } from 'react';
import userService from '../services/userService';

/**
 * Custom hook for user management
 */
const useUsers = (role = null, filters = {}) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);

        // Subscribe to real-time updates
        const unsubscribe = userService.subscribeToUsers(role, filters, (fetchedUsers) => {
            setUsers(fetchedUsers);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [role, filters.societyId]);

    const createUser = async (userRole, userData) => {
        const result = await userService.createUser(userRole, userData);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const updateUser = async (userId, updateData) => {
        const result = await userService.updateUser(userId, updateData);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const deleteUser = async (userId) => {
        const result = await userService.deleteUser(userId);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const searchUsers = async (searchTerm) => {
        const result = await userService.searchUsers(searchTerm, role);
        return result;
    };

    return {
        users,
        residents: users.filter(u => u.role === 'resident'),
        guards: users.filter(u => u.role === 'guard'),
        admins: users.filter(u => u.role === 'admin'),
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        searchUsers,
    };
};

export default useUsers;

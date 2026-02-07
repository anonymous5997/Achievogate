
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext({
    user: null,
    userProfile: null,
    loading: true,
    error: null,
    signInWithEmail: async () => { },
    signInWithPhone: async () => { },
    signUpWithEmail: async () => { },
    sendOTP: async () => { },
    sendOTPViaFirestore: async () => { },
    verifyOTP: async () => { },
    verifyOTPFromFirestore: async () => { },
    signOut: async () => { },
    updateProfile: async () => { },
    isAuthenticated: false,
    userRole: null,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check for stored session
        checkStoredSession();

        // Listen to auth state changes
        const unsubscribe = authService.onAuthStateChange(async ({ user, profile }) => {
            setUser(user);
            setUserProfile(profile);
            setLoading(false);

            if (user && profile) {
                AsyncStorage.setItem('userRole', profile.role);
            }
        });

        return () => unsubscribe();
    }, []);

    const checkStoredSession = async () => {
        try {
            const session = await authService.getStoredSession();
            if (!session || !session.token) {
                setLoading(false);
            }
        } catch (e) {
            console.error('Session check failed:', e);
            setLoading(false);
        }
    };

    const signInWithEmail = async (email, password) => {
        setError(null);
        setLoading(true);
        const result = await authService.signInWithEmail(email, password);

        if (result.success) {
            setUser(result.user);
            setUserProfile(result.userProfile);
        } else {
            setError(result.error);
        }

        setLoading(false);
        return result;
    };

    const signUpWithEmail = async (email, password, phoneNumber) => {
        setError(null);
        setLoading(true);
        const result = await authService.signUpWithEmail(email, password, phoneNumber);

        if (result.success) {
            setUser(result.user);
            setUserProfile(result.userProfile);
        } else {
            setError(result.error);
        }

        setLoading(false);
        return result;
    };

    const sendOTP = async (phoneNumber, recaptchaRef) => {
        setError(null);
        const result = await authService.sendOTP(phoneNumber, recaptchaRef);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const verifyOTP = async (code) => {
        setError(null);
        setLoading(true);
        const result = await authService.verifyOTP(code);

        if (result.success) {
            setUser(result.user);
            setUserProfile(result.userProfile);
        } else {
            setError(result.error);
        }

        setLoading(false);
        return result;
    };

    const signInWithPhone = async (phone, password) => {
        setError(null);
        setLoading(true);
        const result = await authService.signInWithPhone(phone, password);

        if (result.success) {
            setUser(result.user);
            setUserProfile(result.userProfile);
        } else {
            setError(result.error);
        }

        setLoading(false);
        return result;
    };

    const sendOTPViaFirestore = async (identifier) => {
        setError(null);
        const result = await authService.sendOTPViaFirestore(identifier);
        if (!result.success) {
            setError(result.error);
        }
        return result;
    };

    const verifyOTPFromFirestore = async (identifier, otp) => {
        setError(null);
        setLoading(true);
        const result = await authService.verifyOTPFromFirestore(identifier, otp);

        if (result.success) {
            setUser(result.user);
            setUserProfile(result.userProfile);
        } else {
            setError(result.error);
        }

        setLoading(false);
        return result;
    };

    const signOut = async () => {
        setLoading(true);
        const result = await authService.signOut();
        if (result.success) {
            setUser(null);
            setUserProfile(null);
        }
        setLoading(false);
        return result;
    };

    const updateProfile = async (updates) => {
        if (!user) return { success: false, error: 'No user logged in' };

        const result = await authService.updateUserProfile(user.uid, updates);
        if (result.success) {
            setUserProfile({ ...userProfile, ...updates });
        }
        return result;
    };

    return (
        <AuthContext.Provider value={{
            user,
            userProfile,
            loading,
            error,
            signInWithEmail,
            signInWithPhone,
            signUpWithEmail,
            sendOTP,
            sendOTPViaFirestore,
            verifyOTP,
            verifyOTPFromFirestore,
            signOut,
            updateProfile,
            isAuthenticated: !!user,
            userRole: userProfile?.role,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

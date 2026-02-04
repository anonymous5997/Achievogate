import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

class AuthService {
    constructor() {
        this.confirmationResult = null;
    }

    // Check if running in Expo Go
    isExpoGo() {
        return Constants.appOwnership === 'expo';
    }

    // Email/Password Sign In (for Expo Go development)
    async signInWithEmail(email, password) {
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const user = credential.user;

            // Store user session
            await AsyncStorage.setItem('userToken', await user.getIdToken());
            await AsyncStorage.setItem('userId', user.uid);

            // Fetch or create user profile
            const userProfile = await this.getUserProfile(user.uid);

            return { success: true, user, userProfile };
        } catch (error) {
            console.error('Error signing in with email:', error);
            return { success: false, error: error.message };
        }
    }

    // Email/Password Sign Up (for Expo Go development)
    async signUpWithEmail(email, password, phoneNumber) {
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const user = credential.user;

            // Store user session
            await AsyncStorage.setItem('userToken', await user.getIdToken());
            await AsyncStorage.setItem('userId', user.uid);

            // Create user profile with phone number
            const userProfile = await this.getUserProfile(user.uid);
            if (phoneNumber) {
                await this.updateUserProfile(user.uid, { phone: phoneNumber });
            }

            return { success: true, user, userProfile };
        } catch (error) {
            console.error('Error signing up with email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send OTP to phone number (for production builds)
    async sendOTP(phoneNumber, recaptchaRef) {
        try {
            // In Expo Go, recaptcha is not available
            if (this.isExpoGo() || !recaptchaRef) {
                console.warn('Running in Expo Go - Phone auth not supported');
                return {
                    success: false,
                    error: 'Phone authentication requires a Development Build. Please use email/password for testing.'
                };
            }

            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            this.confirmationResult = await signInWithPhoneNumber(
                auth,
                formattedPhone,
                recaptchaRef
            );
            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            console.error('Error sending OTP:', error);
            return { success: false, error: error.message };
        }
    }

    // Verify OTP code (for production builds)
    async verifyOTP(code) {
        try {
            if (!this.confirmationResult) {
                throw new Error('No confirmation result available');
            }

            const credential = await this.confirmationResult.confirm(code);
            const user = credential.user;

            // Store user session
            await AsyncStorage.setItem('userToken', await user.getIdToken());
            await AsyncStorage.setItem('userId', user.uid);

            // Fetch or create user profile
            const userProfile = await this.getUserProfile(user.uid);

            return { success: true, user, userProfile };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, error: error.message };
        }
    }

    // Get user profile from Firestore
    async getUserProfile(userId) {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data();
            } else {
                // Create default user profile if doesn't exist
                const defaultProfile = {
                    id: userId,
                    email: auth.currentUser?.email || '',
                    phone: auth.currentUser?.phoneNumber || '',
                    name: '',
                    role: 'resident', // Default role
                    societyId: 'default',
                    flatNumber: '',
                    fcmToken: '',
                    createdAt: new Date().toISOString(),
                };

                await setDoc(userRef, defaultProfile);
                return defaultProfile;
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    // Update user profile
    async updateUserProfile(userId, updates) {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                ...updates,
                updatedAt: new Date().toISOString(),
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    }

    // Update FCM token
    async updateFCMToken(userId, fcmToken) {
        return this.updateUserProfile(userId, { fcmToken });
    }

    // Sign out
    async signOut() {
        try {
            await firebaseSignOut(auth);
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userRole');
            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            return { success: false, error: error.message };
        }
    }

    // Check authentication state
    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                const profile = await this.getUserProfile(user.uid);
                callback({ user, profile });
            } else {
                callback({ user: null, profile: null });
            }
        });
    }

    // Get current user
    getCurrentUser() {
        return auth.currentUser;
    }

    // Get stored session
    async getStoredSession() {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('userId');
            return { token, userId };
        } catch (error) {
            console.error('Error getting stored session:', error);
            return null;
        }
    }
}

export default new AuthService();

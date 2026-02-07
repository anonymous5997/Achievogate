import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPhoneNumber
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import bcrypt from 'react-native-bcrypt';
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

    // Sign in with Phone and Password
    async signInWithPhone(phone, password) {
        try {
            // Query Firestore for user with this phone number
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('phone', '==', phone));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: false, error: 'No account found with this phone number' };
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            // Check if password is set
            if (!userData.passwordHash) {
                return { success: false, error: 'Password not set. Please use OTP login or set password in profile' };
            }

            // Verify password
            const isValid = await this.verifyPassword(password, userData.passwordHash);
            if (!isValid) {
                return { success: false, error: 'Invalid password' };
            }

            // Sign in with email (Firebase requires email auth)
            if (!userData.email) {
                return { success: false, error: 'Account not properly configured. Contact admin' };
            }

            // Use stored Firebase password or sign in via custom token
            // For now, we'll use the email login if available
            return await this.signInWithEmail(userData.email, password);
        } catch (error) {
            console.error('Error signing in with phone:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate and send OTP (stored in Firestore)
    async sendOTPViaFirestore(identifier) {
        try {
            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            // Find user by email or phone
            const usersRef = collection(db, 'users');
            const isEmail = identifier.includes('@');
            const q = query(
                usersRef,
                where(isEmail ? 'email' : 'phone', '==', identifier)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: false, error: 'No account found with this identifier' };
            }

            const userDoc = querySnapshot.docs[0];
            const userId = userDoc.id;

            // Store OTP in Firestore
            const otpRef = doc(db, 'otps', userId);
            await setDoc(otpRef, {
                otp,
                expiresAt: expiresAt.toISOString(),
                identifier,
                createdAt: new Date().toISOString(),
            });

            // In production, send OTP via SMS/Email service
            console.log(`OTP for ${identifier}: ${otp}`);

            // For development, return OTP in response
            return {
                success: true,
                message: 'OTP sent successfully',
                // Remove otp from response in production
                devOTP: __DEV__ ? otp : undefined
            };
        } catch (error) {
            console.error('Error sending OTP:', error);
            return { success: false, error: error.message };
        }
    }

    // Verify OTP from Firestore
    async verifyOTPFromFirestore(identifier, otp) {
        try {
            // Find user
            const usersRef = collection(db, 'users');
            const isEmail = identifier.includes('@');
            const q = query(
                usersRef,
                where(isEmail ? 'email' : 'phone', '==', identifier)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: false, error: 'User not found' };
            }

            const userDoc = querySnapshot.docs[0];
            const userId = userDoc.id;
            const userData = userDoc.data();

            // Get stored OTP
            const otpRef = doc(db, 'otps', userId);
            const otpDoc = await getDoc(otpRef);

            if (!otpDoc.exists()) {
                return { success: false, error: 'OTP not found or expired' };
            }

            const otpData = otpDoc.data();

            // Check expiration
            if (new Date() > new Date(otpData.expiresAt)) {
                return { success: false, error: 'OTP has expired' };
            }

            // Verify OTP
            if (otpData.otp !== otp) {
                return { success: false, error: 'Invalid OTP' };
            }

            // OTP is valid - create session
            // For Expo Go, we need to sign in with email if available
            if (userData.email && userData.passwordHash) {
                // Sign in with stored credentials
                await AsyncStorage.setItem('userToken', userId); // Temporary token
                await AsyncStorage.setItem('userId', userId);

                // Delete used OTP
                await setDoc(otpRef, { used: true, usedAt: new Date().toISOString() }, { merge: true });

                return { success: true, user: { uid: userId }, userProfile: userData };
            }

            return { success: false, error: 'Account not fully configured' };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, error: error.message };
        }
    }

    // Hash password
    async hashPassword(password) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }

    // Verify password
    async verifyPassword(password, hash) {
        return bcrypt.compareSync(password, hash);
    }

    // Set/Update user password
    async setUserPassword(userId, newPassword) {
        try {
            const passwordHash = await this.hashPassword(newPassword);
            await this.updateUserProfile(userId, {
                passwordHash,
                passwordUpdatedAt: new Date().toISOString()
            });
            return { success: true, message: 'Password set successfully' };
        } catch (error) {
            console.error('Error setting password:', error);
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
                return { id: userSnap.id, ...userSnap.data() };
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

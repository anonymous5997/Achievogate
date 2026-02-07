import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase configuration from environment variables
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with platform-specific persistence
let auth;

if (Platform.OS === 'web') {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  });
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };



// ...

// Initialize Firestore with settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // often helps with Expo connections
});
// Note: Persistence is enabled by default in recent SDKs for Native, 
// but for Web JS SDK on Native, it heavily relies on Async Storage.
// We will rely on the SDK's internal queuing for the session.

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;

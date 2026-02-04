# AchievoGate - Society Visitor Management System

A modern, full-featured mobile application for society gate visitor management built with React Native, Expo, and Firebase.

## 🚀 Features

### Three Role System
- **Guard**: Create visitor entries, view pending/approved visitors  
- **Resident**: Approve/deny visitor requests, view visit history
- **Admin**: Manage all visitors and users, change user roles

### Core Functionality
- 📱 Phone OTP Authentication via Firebase
- 🔔 Real-time Push Notifications  
- 📸 Camera & Photo Library Integration
- 🎨 Beautiful Dark Neon UI with Glassmorphism
- ✨ Smooth Animations with React Native Reanimated
- 🔄 Real-time Firestore Database Sync

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase Project (see Setup below)
- iOS Simulator / Android Emulator or physical device

## 🛠️ Installation

1. **Clone and Install Dependencies**
   ```bash
   cd achievogate-app
   npm install
   ```

2. **Configure Firebase**
   
   Edit `firebaseConfig.js` and replace the placeholder values with your Firebase project credentials:
   
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

3. **Firebase Console Setup**
   
   - Enable **Authentication > Phone** provider
   - Create **Firestore Database**
   - Enable **Cloud Messaging**
   - (Android) Download `google-services.json` and place in project root
   - (iOS) Download `GoogleService-Info.plist` and add to iOS folder

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "AchievoGate"
3. Add an iOS and/or Android app

### 2. Enable Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Phone** provider
3. Add test phone numbers if needed (for development)

### 3. Create Firestore Database
1. Go to **Firestore Database** → **Create Database**
2. Start in **Test Mode** (for development)
3. Create the following collections:

#### Users Collection (`users`)
```javascript
{
  id: string,              // User ID (auto-generated)
  phone: string,           // Phone number with country code
  name: string,            // User's full name
  role: string,            // 'admin' | 'guard' | 'resident'
  societyId: string,       // Society identifier
  flatNumber: string,      // Flat/apartment number (for residents)
  fcmToken: string,        // Firebase Cloud Messaging token
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Visitors Collection (`visitors`)
```javascript
{
  id: string,              // Visitor ID (auto-generated)
  visitorName: string,     // Visitor's name
  phone: string,           // Visitor's phone
  flatNumber: string,      // Destination flat number
  purpose: string,         // Purpose of visit
  status: string,          // 'pending' | 'approved' | 'denied' | 'entered' | 'exited'
  guardId: string,         // ID of guard who created entry
  residentId: string,      // ID of resident who approved/denied
  photoUrl: string,        // Optional photo URL
  createdAt: timestamp,
  approvedAt: timestamp,
  enteredAt: timestamp,
  exitedAt: timestamp
}
```

### 4. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return getUserData().role == 'admin';
    }
    
    function isGuard() {
      return getUserData().role == 'guard';
    }
    
    function isResident() {
      return getUserData().role == 'resident';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || request.auth.uid == userId;
    }
    
    // Visitors collection
    match /visitors/{visitorId} {
      allow read: if isAuthenticated();
      allow create: if isGuard();
      allow update: if isAdmin() || 
                       (isResident() && resource.data.flatNumber == getUserData().flatNumber) ||
                       (isGuard() && resource.data.guardId == request.auth.uid);
      allow delete: if isAdmin();
    }
  }
}
```

### 5. Enable Cloud Messaging
1. Go to **Cloud Messaging**
2. Enable the API
3. Note: Push notifications require a backend server to send FCM messages

## 🏃 Running the App

```bash
# Start the development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Run on web (limited functionality)
npx expo start --web
```

## 📱 Testing the App

### Create Test Users in Firestore

Manually add test users to the `users` collection:

**Admin User:**
```javascript
{
  phone: "+911234567890",
  name: "Admin User",
  role: "admin",
  societyId: "default",
  flatNumber: "",
  fcmToken: ""
}
```

**Guard User:**
```javascript
{
  phone: "+919876543210",
  name: "Security Guard",
  role: "guard",
  societyId: "default",
  flatNumber: "",
  fcmToken: ""
}
```

**Resident User:**
```javascript
{
  phone: "+919999999999",
  name: "Resident User",
  role: "resident",
  societyId: "default",
  flatNumber: "A-101",
  fcmToken: ""
}
```

### Test Flow

1. **Login as Guard** → Create a visitor entry for flat A-101
2. **Login as Resident** → Approve/deny the visitor request  
3. **Login as Admin** → View all visitors and manage users

## 📂 Project Structure

```
achievogate-app/
├── src/
│   ├── screens/
│   │   ├── auth/           # Authentication screens
│   │   ├── guard/          # Guard role screens
│   │   ├── resident/       # Resident role screens
│   │   └── admin/          # Admin role screens
│   ├── components/         # Reusable UI components
│   ├── services/           # Business logic services
│   ├── navigation/         # Navigation configuration
│   ├── theme/              # Theme and styling
│   └── hooks/              # Custom React hooks
├── firebaseConfig.js       # Firebase configuration
├── App.js                  # Main app entry point
└── app.json                # Expo configuration
```

## 🎨 UI/UX Features

- **Dark Neon Theme**: Purple/indigo gradient with glassmorphism effects
- **Smooth Animations**: Staggered card entrance, scale buttons, swipe gestures
- **Real-time Updates**: Live visitor status changes via Firestore listeners
- **Role-based Routing**: Automatic navigation based on user role

## 🔐 Security

- Phone OTP authentication for secure login
- Role-based access control via Firestore rules
- Guards can only create visitors
- Residents can only approve/deny visitors for their flat
- Admins have full system access

## 🐛 Troubleshooting

### OTP Not Sending
- Check Firebase Phone Authentication is enabled
- Add test phone numbers in Firebase Console
- Verify reCAPTCHA is working

### App Crashes on Start
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Firestore Permission Denied
- Check security rules are properly configured
- Verify user has correct role in Firestore

## 📝 License

MIT License - feel free to use this project for your society!

## 🙏 Credits

Built with:
- React Native & Expo
- Firebase (Auth, Firestore, FCM)
- React Navigation
- React Native Reanimated
- Expo Linear Gradient & Blur

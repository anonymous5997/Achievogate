# Firebase Setup Guide for AchievoGate

## Step-by-Step Firebase Configuration

### 1. Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: **AchievoGate**
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

### 2. Add Apps to Firebase Project

#### For iOS:
1. Click iOS icon in project overview
2. Register app:
   - **iOS bundle ID**: `com.achievogate.app`
   - **App nickname**: AchievoGate iOS
3. Download `GoogleService-Info.plist`
4. Place file in `achievogate-app/ios/` directory

#### For Android:
1. Click Android icon in project overview
2. Register app:
   - **Android package name**: `com.achievogate.app`
   - **App nickname**: AchievoGate Android
3. Download `google-services.json`
4. Place file in `achievogate-app/` root directory

### 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Select your web app or create one
4. Copy the configuration object
5. Update `firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                              // Copy from Firebase
  authDomain: "achievogate-xxxxx.firebaseapp.com", // Copy from Firebase
  projectId: "achievogate-xxxxx",                 // Copy from Firebase
  storageBucket: "achievogate-xxxxx.appspot.com", // Copy from Firebase
  messagingSenderId: "123456789",                 // Copy from Firebase
  appId: "1:123456789:web:abcdef",               // Copy from Firebase
};
```

### 4. Enable Phone Authentication

1. Go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Click **Phone** provider
4. Click **Enable** toggle
5. Click **Save**

#### Add Test Phone Numbers (Optional - for development):
1. Scroll down to **"Phone numbers for testing"**
2. Add test numbers with verification codes:
   ```
   Phone: +15555551234
   Code: 123456
   ```

### 5. Create Firestore Database

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose region closest to you
5. Click **"Enable"**

### 6. Set Up Collections

Create these collections manually or they'll be created automatically when the app runs:

#### Users Collection
1. Click **"Start collection"**
2. Collection ID: `users`
3. Add a test document:
   ```javascript
   Document ID: [Auto-ID]
   Fields:
   - phone: "+911234567890"
   - name: "Test Admin"
   - role: "admin"
   - societyId: "default"
   - flatNumber: ""
   - fcmToken: ""
   - createdAt: [Current timestamp]
   ```

#### Visitors Collection
Collection will be created automatically when first visitor is added.

### 7. Configure Firestore Security Rules

1. Go to **Firestore Database** → **Rules**
2. Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'admin';
    }
    
    function isGuard() {
      return isAuthenticated() && getUserData().role == 'guard';
    }
    
    function isResident() {
      return isAuthenticated() && getUserData().role == 'resident';
    }
    
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAdmin() || request.auth.uid == userId;
      allow delete: if isAdmin();
    }
    
    match /visitors/{visitorId} {
      allow read: if isAuthenticated();
      allow create: if isGuard() || isAdmin();
      allow update: if isAdmin() || 
                       (isResident() && resource.data.flatNumber == getUserData().flatNumber) ||
                       (isGuard() && resource.data.guardId == request.auth.uid);
      allow delete: if isAdmin();
    }
  }
}
```

3. Click **"Publish"**

### 8. Enable Cloud Messaging (FCM)

1. Go to **Cloud Messaging**
2. If not enabled, click **"Get started"**
3. Note the **Server key** (needed for backend notifications)

### 9. Create Initial Test Users

Add these test users to the `users` collection:

**Admin:**
```javascript
{
  phone: "+911234567890",
  name: "Admin User",
  role: "admin",
  societyId: "default",
  flatNumber: "",
  fcmToken: "",
  createdAt: [timestamp]
}
```

**Guard:**
```javascript
{
  phone: "+919876543210",
  name: "Security Guard",
  role: "guard",
  societyId: "default",
  flatNumber: "",
  fcmToken: "",
  createdAt: [timestamp]
}
```

**Resident:**
```javascript
{
  phone: "+919999999999",
  name: "John Resident",
  role: "resident",
  societyId: "default",
  flatNumber: "A-101",
  fcmToken: "",
  createdAt: [timestamp]
}
```

## Testing Checklist

- [ ] Firebase project created
- [ ] Phone authentication enabled
- [ ] Firestore database created
- [ ] Security rules configured
- [ ] Test users added
- [ ] Firebase config updated in `firebaseConfig.js`
- [ ] App can send OTP
- [ ] App can verify OTP
- [ ] Users can access their role-specific dashboards

## Common Issues

### Issue: "reCAPTCHA verification failed"
**Solution**: Add test phone numbers in Firebase Console or test on physical device

### Issue: "Permission denied" in Firestore
**Solution**: Check security rules are published and user has correct role

### Issue: "Firebase app not initialized"
**Solution**: Verify `firebaseConfig.js` has correct credentials

### Issue: Phone OTP not received
**Solution**: 
- Check phone auth is enabled in Firebase
- Verify phone number format includes country code (+91)
- Check Firebase quota limits
- Use test phone numbers for development

## Production Considerations

Before going to production:

1. **Switch Firestore to Production Mode** with proper security rules
2. **Set up Firebase Functions** for sending FCM notifications
3. **Enable App Check** for additional security
4. **Configure proper OAuth credentials** for phone auth
5. **Set up Firebase Hosting** for web version (if needed)
6. **Review and update** security rules for production use
7. **Set up proper indexes** for Firestore queries
8. **Enable Firebase Analytics** for tracking

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/)

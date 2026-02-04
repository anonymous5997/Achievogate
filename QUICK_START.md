# AchievoGate Quick Start Guide

## 🚀 Getting Started (3 Steps)

### Step 1: Install Dependencies
```bash
cd achievogate-app
npm install
```

### Step 2: Configure Firebase

1. **Create Firebase Project** at [console.firebase.google.com](https://console.firebase.google.com)
2. **Enable Phone Authentication**: Authentication → Sign-in method → Phone
3. **Create Firestore Database**: Firestore Database → Create Database (Test Mode)
4. **Get Firebase Config**: Project Settings → Your apps → Config
5. **Update** [firebaseConfig.js](file:///Users/manmath/Achievogate/achievogate-app/firebaseConfig.js):

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

### Step 3: Add Test Users

In Firestore, create `users` collection with these test users:

**Admin** (can manage everything):
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

**Guard** (creates visitor entries):
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

**Resident** (approves/denies visitors):
```javascript
{
  phone: "+919999999999",
  name: "John Resident",
  role: "resident",
  societyId: "default",
  flatNumber: "A-101",
  fcmToken: ""
}
```

---

## ▶️ Run the App

```bash
npx expo start
```

Then:
- **iOS**: Press `i` or scan QR with Expo Go
- **Android**: Press `a` or scan QR with Expo Go
- **Web**: Press `w` (limited functionality)

---

## 🧪 Test the Complete Flow

1. **Login as Guard** (+919876543210)
   - Enter phone number → Send OTP
   - Enter verification code
   - See Guard Dashboard

2. **Create Visitor Entry**
   - Tap "Add New Visitor"
   - Fill in:
     - Visitor Name: "Jane Doe"
     - Phone: "+918888888888"
     - Flat Number: "A-101"
     - Purpose: "Delivery"
   - Submit

3. **Login as Resident** (+919999999999)
   - See pending visitor alert
   - Review visitor details
   - Tap "Approve" or "Deny"

4. **Login as Admin** (+911234567890)
   - View all visitors
   - Manage user roles
   - See system statistics

---

## 📱 App Features by Role

### Guard Can:
- ✅ Create new visitor entries
- ✅ View pending approvals
- ✅ View approved visitors
- ✅ Take visitor photos

### Resident Can:
- ✅ Approve pending visitors for their flat
- ✅ Deny unwanted visitors
- ✅ View visit history
- ✅ Get real-time notifications

### Admin Can:
- ✅ View all system visitors
- ✅ Manage all users
- ✅ Change user roles
- ✅ See system analytics

---

## 📁 Project Files

**Main Files:**
- [App.js](file:///Users/manmath/Achievogate/achievogate-app/App.js) - Entry point
- [firebaseConfig.js](file:///Users/manmath/Achievogate/achievogate-app/firebaseConfig.js) - Firebase setup
- [app.json](file:///Users/manmath/Achievogate/achievogate-app/app.json) - Expo config

**Services:**
- [authService.js](file:///Users/manmath/Achievogate/achievogate-app/src/services/authService.js) - Authentication
- [visitorService.js](file:///Users/manmath/Achievogate/achievogate-app/src/services/visitorService.js) - Visitor management
- [notificationService.js](file:///Users/manmath/Achievogate/achievogate-app/src/services/notificationService.js) - Push notifications
- [roleService.js](file:///Users/manmath/Achievogate/achievogate-app/src/services/roleService.js) - User roles

**Screens:**
- Guard: [GuardDashboard.js](file:///Users/manmath/Achievogate/achievogate-app/src/screens/guard/GuardDashboard.js), [CreateVisitor.js](file:///Users/manmath/Achievogate/achievogate-app/src/screens/guard/CreateVisitor.js), [VisitorList.js](file:///Users/manmath/Achievogate/achievogate-app/src/screens/guard/VisitorList.js)
- Resident: [ResidentDashboard.js](file:///Users/manmath/Achievogate/achievogate-app/src/screens/resident/ResidentDashboard.js)
- Admin: [AdminDashboard.js](file:///Users/manmath/Achievogate/achievogate-app/src/screens/admin/AdminDashboard.js), [AllVisitors.js](file:///Users/manmath/Achievogate/achievogate-app/src/screens/admin/AllVisitors.js), [UserManagement.js](file:///Users/manmath/Achievogate/achievogate-app/src/screens/admin/UserManagement.js)

**Documentation:**
- [README.md](file:///Users/manmath/Achievogate/achievogate-app/README.md) - Complete guide
- [FIREBASE_SETUP.md](file:///Users/manmath/Achievogate/achievogate-app/FIREBASE_SETUP.md) - Detailed Firebase setup

---

## ⚠️ Troubleshooting

**Metro bundler not starting?**
```bash
npx expo start -c
```

**Firebase errors?**
- Check `firebaseConfig.js` has correct credentials
- Verify Phone Auth is enabled in Firebase Console
- Add test phone numbers in Firebase for development

**Permission denied in Firestore?**
- Check security rules are set correctly
- Verify user has proper role in users collection

**OTP not received?**
- Use test phone numbers from Firebase Console
- Check internet connection
- Try on physical device (not simulator)

---

## 🎯 Next Steps

1. **Set up Firebase** (required to run app)
2. **Test all three roles** with the test flow above
3. **Customize theme** in [theme.js](file:///Users/manmath/Achievogate/achievogate-app/src/theme/theme.js)
4. **Add your society data** by creating users in Firestore
5. **Deploy to app stores** when ready

---

## 📚 Full Documentation

- **README.md** - Installation, features, security
- **FIREBASE_SETUP.md** - Step-by-step Firebase guide
- **walkthrough.md** - Complete feature documentation

---

## 💡 Key Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Clear cache
npx expo start -c

# Build for production
eas build --platform ios
eas build --platform android
```

---

**Made with ❤️ for modern society management**

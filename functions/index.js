const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const fcm = admin.messaging();

/**
 * TRIGGER: On New Visitor Entry
 * - Sends Push Notification to Resident
 * - Updates Society Daily Stats
 */
exports.onVisitorEntry = functions.firestore
    .document("visitors/{visitorId}")
    .onCreate(async (snap, context) => {
        const visitor = snap.data();
        const { societyId, flatNumber, residentId, name, type } = visitor;

        // 1. Notification
        if (residentId) {
            const userSnap = await db.collection("users").doc(residentId).get();
            const userTokens = userSnap.data()?.fcmTokens || [];

            if (userTokens.length > 0) {
                await fcm.sendToDevice(userTokens, {
                    notification: {
                        title: "New Visitor",
                        body: `${name} (${type}) is at the gate.`,
                    },
                    data: {
                        type: "visitor_entry",
                        visitorId: context.params.visitorId
                    }
                });
            }
        }

        // 2. Analytics (Increment Daily Count)
        const today = new Date().toISOString().split('T')[0];
        const statsRef = db.collection("societies").doc(societyId).collection("stats").doc(today);

        return statsRef.set({
            totalVisitors: admin.firestore.FieldValue.increment(1),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    });

/**
 * TRIGGER: Parcel Arrived
 * - Notify Resident
 */
exports.onParcelArrived = functions.firestore
    .document("parcels/{parcelId}")
    .onCreate(async (snap, context) => {
        const parcel = snap.data();
        // Logic to find resident by flatNumber if residentId not present
        // Send FCM...
        console.log("Parcel notification logic here for:", parcel.flatNumber);
    });

/**
 * SCHEDULED: Check Complaint SLA
 * - Runs every hour
 * - Marks 'open' complaints > 24h as 'escalated'
 */
exports.checkComplaintSLA = functions.pubsub.schedule("every 60 minutes").onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const cutoff = now.toMillis() - (24 * 60 * 60 * 1000); // 24 hours ago

    const overdueSnaps = await db.collectionGroup("complaints")
        .where("status", "==", "open")
        .where("createdAt", "<", admin.firestore.Timestamp.fromMillis(cutoff))
        .get();

    const batch = db.batch();
    overdueSnaps.forEach(doc => {
        batch.update(doc.ref, {
            status: "escalated",
            escalationReason: "Auto-escalation: SLA Breach (>24h)",
            updatedAt: now
        });
    });

    return batch.commit();
});

/**
 * TRIGGER: On SOS
 * - High Priority Notification to All Guards & Admins
 */
exports.onSOS = functions.firestore
    .document("incidents/{incidentId}")
    .onCreate(async (snap, context) => {
        const incident = snap.data();
        // Fetch all admins/guards of that society
        // Send Critical Alert FCM
    });

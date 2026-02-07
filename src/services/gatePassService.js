import {
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * GatePass Service
 * Handles One-Time Password (OTP) generation for visitor entry.
 */

class GatePassService {

    /**
     * Generate a new Gate Pass with OTP
     */
    async generatePass(passData) {
        try {
            const { societyId, flatNumber, visitorName, expectedTime, createdBy } = passData;

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const newPass = {
                societyId,
                flatNumber,
                visitorName,
                otp,
                status: 'active', // active, used, expired
                validUntil: expectedTime, // Date object or timestamp
                createdBy,
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'gatePasses'), newPass);
            return { success: true, id: docRef.id, otp };
        } catch (error) {
            console.error('Error generating pass:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify and Redeem OTP (Guard uses this)
     */
    async verifyPass(societyId, otp) {
        try {
            // Find active pass with this OTP in this society
            const q = query(
                collection(db, 'gatePasses'),
                where('societyId', '==', societyId),
                where('otp', '==', otp),
                where('status', '==', 'active'),
                limit(1)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return { success: false, error: 'Invalid or Expired OTP' };
            }

            const passDoc = snapshot.docs[0];
            const passData = passDoc.data();

            // Check expiry (if validUntil is passed)
            // if (passData.validUntil && passData.validUntil.toDate() < new Date()) { ... }

            // Mark as used
            await updateDoc(doc(db, 'gatePasses', passDoc.id), {
                status: 'used',
                usedAt: serverTimestamp()
            });

            return { success: true, pass: { id: passDoc.id, ...passData } };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get Active Passes for a Resident
     */
    async getMyPasses(userId) {
        try {
            const q = query(
                collection(db, 'gatePasses'),
                where('createdBy', '==', userId),
                where('status', '==', 'active')
            );

            const snapshot = await getDocs(q);
            const passes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            return { success: true, passes };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new GatePassService();

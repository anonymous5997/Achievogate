import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * QR Code & Pass Service - Manages digital visitor passes
 */

class QRCodeService {
    /**
     * Generate a unique pass ID
     */
    generatePassId() {
        return `PASS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Create a digital visitor pass
     */
    async createPass(passData) {
        try {
            const passId = this.generatePassId();

            const data = {
                passId,
                type: 'visitor_pass',
                visitorName: passData.visitorName,
                visitorPhone: passData.visitorPhone,
                flatNumber: passData.flatNumber,
                residentId: passData.residentId,
                residentName: passData.residentName,
                purpose: passData.purpose || 'Visit',
                validFrom: passData.validFrom || new Date(),
                validUntil: passData.validUntil,
                maxScans: passData.maxScans || 1, // 1 for one-time, -1 for unlimited
                scansUsed: 0,
                isActive: true,
                createdAt: serverTimestamp(),
                // QR Data will be: JSON.stringify({ passId, token: encrypted_hash })
                token: this.generateToken(passId, passData.visitorPhone),
            };

            const docRef = await addDoc(collection(db, 'visitorPasses'), data);

            return {
                success: true,
                passId,
                pass: { id: docRef.id, ...data },
            };
        } catch (error) {
            console.error('Error creating pass:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate simple token (in production, use JWT with secret)
     */
    generateToken(passId, phone) {
        // Simple hash for demo - in production, use proper JWT
        const data = `${passId}:${phone}:${Date.now()}`;
        return Buffer.from(data).toString('base64');
    }

    /**
     * Validate and scan a pass
     */
    async scanPass(passId) {
        try {
            // Find pass in database
            const passRef = collection(db, 'visitorPasses');
            const snapshot = await getDoc(doc(passRef, passId));

            if (!snapshot.exists()) {
                return { success: false, error: 'Pass not found' };
            }

            const passData = snapshot.data();

            // Check if pass is active
            if (!passData.isActive) {
                return { success: false, error: 'Pass has been deactivated' };
            }

            // Check if pass is expired
            const now = new Date();
            const validUntil = passData.validUntil?.toDate();
            if (validUntil && now > validUntil) {
                return { success: false, error: 'Pass has expired' };
            }

            // Check scan limits
            if (passData.maxScans > 0 && passData.scansUsed >= passData.maxScans) {
                return { success: false, error: 'Pass scan limit reached' };
            }

            // Update scan count
            await updateDoc(snapshot.ref, {
                scansUsed: passData.scansUsed + 1,
                lastScannedAt: serverTimestamp(),
                isActive: passData.maxScans === 1 ? false : true, // Deactivate one-time passes
            });

            return {
                success: true,
                pass: {
                    ...passData,
                    scansUsed: passData.scansUsed + 1,
                },
            };
        } catch (error) {
            console.error('Error scanning pass:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get pass by ID
     */
    async getPass(passId) {
        try {
            const passRef = collection(db, 'visitorPasses');
            const snapshot = await getDoc(doc(passRef, passId));

            if (snapshot.exists()) {
                return {
                    success: true,
                    pass: {
                        id: snapshot.id,
                        ...snapshot.data(),
                    },
                };
            } else {
                return { success: false, error: 'Pass not found' };
            }
        } catch (error) {
            console.error('Error getting pass:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate QR data string
     */
    generateQRData(passId, token) {
        return JSON.stringify({
            type: 'achievogate_visitor_pass',
            passId,
            token,
            timestamp: Date.now(),
        });
    }

    /**
     * Parse scanned QR data
     */
    parseQRData(qrString) {
        try {
            const data = JSON.parse(qrString);
            if (data.type === 'achievogate_visitor_pass' && data.passId) {
                return { success: true, passId: data.passId, token: data.token };
            }
            return { success: false, error: 'Invalid QR code' };
        } catch (error) {
            return { success: false, error: 'Invalid QR format' };
        }
    }

    /**
     * Generate offline fallback code (8-digit)
     */
    generateOfflineCode() {
        return Math.floor(10000000 + Math.random() * 90000000).toString();
    }
}

export default new QRCodeService();

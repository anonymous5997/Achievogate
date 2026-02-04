import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import notificationService from './notificationService';

/**
 * Risk Analysis Service - Detects suspicious visitor patterns
 */

class RiskAnalysisService {
    /**
     * Analyze visitor for risk factors
     */
    async analyzeVisitor(visitorData) {
        const riskFactors = [];
        let riskScore = 0;

        // Check 1: Late night visits (10 PM - 6 AM)
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 6) {
            riskFactors.push('late_night_entry');
            riskScore += 20;
        }

        // Check 2: Repeated denials
        const denialCount = await this.getRecentDenials(visitorData.visitorPhone);
        if (denialCount >= 3) {
            riskFactors.push('repeated_denials');
            riskScore += 40;
        }

        // Check 3: Multiple flat visits same day
        const flatVisits = await this.getTodayFlatVisits(visitorData.visitorPhone);
        if (flatVisits >= 5) {
            riskFactors.push('multiple_flats');
            riskScore += 30;
        }

        // Check 4: Blacklisted phone
        const isBlacklisted = await this.isBlacklisted(visitorData.visitorPhone);
        if (isBlacklisted) {
            riskFactors.push('blacklisted');
            riskScore += 100;
        }

        const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';

        // Alert admin if high risk
        if (riskLevel === 'high') {
            await notificationService.sendLocalNotification(
                '⚠️ High Risk Visitor Alert',
                `${visitorData.visitorName} flagged: ${riskFactors.join(', ')}`,
                { type: 'risk_alert', visitorData, riskFactors }
            );
        }

        return {
            riskScore,
            riskLevel,
            riskFactors,
        };
    }

    /**
     * Get recent denials for a phone number (last 24 hours)
     */
    async getRecentDenials(phone) {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const q = query(
                collection(db, 'visitors'),
                where('visitorPhone', '==', phone),
                where('status', '==', 'denied')
            );

            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Error checking denials:', error);
            return 0;
        }
    }

    /**
     * Get today's flat visits for a phone number
     */
    async getTodayFlatVisits(phone) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const q = query(
                collection(db, 'visitors'),
                where('visitorPhone', '==', phone),
                where('status', '==', 'approved')
            );

            const snapshot = await getDocs(q);
            const uniqueFlats = new Set();

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt?.toDate() >= today) {
                    uniqueFlats.add(data.flatNumber);
                }
            });

            return uniqueFlats.size;
        } catch (error) {
            console.error('Error checking flat visits:', error);
            return 0;
        }
    }

    /**
     * Check if phone is blacklisted
     */
    async isBlacklisted(phone) {
        try {
            const q = query(
                collection(db, 'blacklist'),
                where('phone', '==', phone),
                where('active', '==', true)
            );

            const snapshot = await getDocs(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking blacklist:', error);
            return false;
        }
    }

    /**
     * Add to blacklist
     */
    async addToBlacklist(phone, reason, addedBy) {
        try {
            const docRef = doc(collection(db, 'blacklist'));
            await setDoc(docRef, {
                phone,
                reason,
                addedBy,
                addedAt: serverTimestamp(),
                active: true,
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding to blacklist:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new RiskAnalysisService();

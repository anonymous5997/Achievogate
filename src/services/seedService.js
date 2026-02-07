import {
    collection,
    doc,
    serverTimestamp,
    setDoc,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Seed Service - Populates Firestore with Demo Data for "Royal Gardens"
 * Use this to verify Premium Dashboard features immediately.
 */

class SeedService {

    constructor() {
        this.SOCIETY_ID = 'royal_gardens_demo';
        this.SOCIETY_NAME = 'Royal Gardens Premium';
    }

    async seedDatabase() {
        try {
            console.log('🌱 Starting Seed Process...');

            // 1. Create Society
            await this.seedSociety();

            // 2. Create Flats (Blocks A, B)
            await this.seedFlats();

            // 3. Create Users (Residents, Guards)
            // Note: These are Firestore profile docs only. Real auth requires signing up.
            await this.seedUsers();

            // 4. Create Operational Data
            await this.seedVisitors();
            await this.seedParcels();
            await this.seedComplaints();

            console.log('✅ Seed Complete!');
            return { success: true, message: 'Database populated with Demo Data' };
        } catch (error) {
            console.error('❌ Seed Failed:', error);
            return { success: false, error: error.message };
        }
    }

    // --- Helper Methods ---

    async seedSociety() {
        const ref = doc(db, 'societies', this.SOCIETY_ID);
        await setDoc(ref, {
            name: this.SOCIETY_NAME,
            address: '123, Premium Avenue, Tech City',
            stats: {
                residentCount: 25,
                vehicleCount: 12,
                activeGuardCount: 2,
                todayVisitorCount: 5
            },
            featureFlags: {
                parcelOtpEnabled: true,
                rfidEnabled: true,
                vehicleLimitEnabled: true
            },
            subscription: {
                plan: 'enterprise',
                status: 'active',
                expiryDate: Timestamp.fromDate(new Date('2030-01-01'))
            },
            createdAt: serverTimestamp()
        }, { merge: true });
    }

    async seedFlats() {
        const batch = writeBatch(db);
        const blocks = ['A', 'B'];
        let count = 0;

        for (const block of blocks) {
            for (let floor = 1; floor <= 4; floor++) {
                for (let num = 1; num <= 2; num++) {
                    const flatNum = `${block}-${floor}0${num}`; // e.g., A-101
                    const flatId = `${this.SOCIETY_ID}_${flatNum}`;
                    const ref = doc(db, 'flats', flatId);

                    batch.set(ref, {
                        societyId: this.SOCIETY_ID,
                        flatNumber: flatNum,
                        block: block,
                        floor: floor,
                        residentIds: [], // Will be populated in seedUsers
                        occupancyStatus: Math.random() > 0.3 ? 'occupied' : 'vacant',
                        createdAt: serverTimestamp()
                    });
                    count++;
                }
            }
        }
        await batch.commit();
        console.log(`__ Created ${count} Flats`);
    }

    async seedUsers() {
        // We will create fake user docs. In a real scenario, these IDs come from Auth.
        // We use consistent IDs so we can link them.
        const users = [
            { id: 'user_res_1', name: 'Rahul Sharma', role: 'resident', flat: 'A-101' },
            { id: 'user_res_2', name: 'Priya Singh', role: 'resident', flat: 'A-102' },
            { id: 'user_res_3', name: 'Amit Patel', role: 'resident', flat: 'B-201' },
            { id: 'user_guard_1', name: 'Guard Ram', role: 'guard', shift: 'morning' },
            { id: 'user_guard_2', name: 'Guard Shyam', role: 'guard', shift: 'night' }
        ];

        const batch = writeBatch(db);

        for (const u of users) {
            const ref = doc(db, 'users', u.id);
            batch.set(ref, {
                name: u.name,
                email: `${u.role}_${u.id}@demo.com`,
                phone: '9999999999',
                role: u.role,
                societyId: this.SOCIETY_ID,
                flatNumber: u.flat || '',
                active: true,
                isDeleted: false,
                createdAt: serverTimestamp()
            });

            // If resident, link to flat
            if (u.role === 'resident' && u.flat) {
                const flatRef = doc(db, 'flats', `${this.SOCIETY_ID}_${u.flat}`);
                // Note: Can't update doc in same batch if we didn't create it in this batch easily without getting current data,
                // but for seeding we assume flat exists.
                // Actually, batch updates verify existence.
                batch.update(flatRef, {
                    residentIds: [u.id],
                    occupancyStatus: 'occupied'
                });
            }
        }
        await batch.commit();
        console.log(`__ Created ${users.length} Users`);
    }

    async seedVisitors() {
        const visitors = [
            { name: 'Swiggy Delivery', type: 'delivery', status: 'pending' },
            { name: 'Uber Driver', type: 'cab', status: 'approved' },
            { name: 'Mom & Dad', type: 'guest', status: 'entered' },
            { name: 'Internet Guy', type: 'service', status: 'exited' },
            { name: 'Zomato', type: 'delivery', status: 'denied' }
        ];

        const batch = writeBatch(db);
        visitors.forEach((v, i) => {
            const ref = doc(collection(db, 'visitors'));
            batch.set(ref, {
                societyId: this.SOCIETY_ID,
                visitorName: v.name,
                visitorType: v.type, // 'guest', 'delivery', etc.
                status: v.status,
                flatNumber: 'A-101', // Targeting Rahul
                residentId: 'user_res_1',
                guardId: 'user_guard_1',
                checkInTime: v.status === 'entered' || v.status === 'exited' ? serverTimestamp() : null,
                checkOutTime: v.status === 'exited' ? serverTimestamp() : null,
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
        console.log(`__ Created ${visitors.length} Visitors`);
    }

    async seedParcels() {
        const batch = writeBatch(db);
        for (let i = 0; i < 5; i++) {
            const ref = doc(collection(db, 'parcels'));
            batch.set(ref, {
                societyId: this.SOCIETY_ID,
                flatNumber: 'A-102',
                residentId: 'user_res_2',
                deliveryCompany: i % 2 === 0 ? 'Amazon' : 'Myntra',
                status: i < 3 ? 'at_gate' : 'collected',
                entryTime: serverTimestamp(),
                reminderSent: false
            });
        }
        await batch.commit();
        console.log('__ Created 5 Parcels');
    }

    async seedComplaints() {
        const batch = writeBatch(db);
        const complaints = [
            { cat: 'plumbing', priority: 'high', status: 'open', title: 'Leaking pipe' },
            { cat: 'security', priority: 'critical', status: 'in_progress', title: 'Gate not closing' },
            { cat: 'electrical', priority: 'medium', status: 'resolved', title: 'Hall light flickers' }
        ];

        complaints.forEach(c => {
            const ref = doc(collection(db, 'complaints'));
            batch.set(ref, {
                societyId: this.SOCIETY_ID,
                category: c.cat,
                priority: c.priority,
                status: c.status,
                title: c.title,
                description: 'This is a sample complaint description.',
                createdBy: 'user_res_1',
                createdAt: serverTimestamp()
            });
        });
        await batch.commit();
        console.log('__ Created 3 Complaints');
    }
}

export default new SeedService();

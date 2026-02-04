// Sample Data Setup Script for Firestore
// This script creates sample parcels and notices for testing

import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebaseConfig';

const setupSampleData = async () => {
    console.log('Setting up sample data...');

    try {
        // Sample Parcels
        const parcels = [
            {
                flatNumber: 'A101',
                description: 'Amazon Delivery',
                carrier: 'Amazon',
                receivedAt: new Date(),
                collectedAt: null,
                status: 'pending',
                createdBy: 'Guard',
            },
            {
                flatNumber: 'A101',
                description: 'Flipkart Package',
                carrier: 'Flipkart',
                receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                collectedAt: null,
                status: 'pending',
                createdBy: 'Guard',
            },
        ];

        for (const parcel of parcels) {
            await addDoc(collection(db, 'parcels'), parcel);
            console.log(`Added parcel: ${parcel.description}`);
        }

        // Sample Notices
        const notices = [
            {
                title: 'Monthly Maintenance Meeting',
                content: 'The monthly maintenance meeting will be held on June 25, 2024 at 6:00 PM in the community hall.',
                icon: 'bell',
                priority: 'normal',
                date: new Date('2024-06-25'),
                active: true,
            },
            {
                title: 'Water Supply Disruption',
                content: 'Water supply will be disrupted on June 22, 2024 from 10:00 AM to 2:00 PM for maintenance work.',
                icon: 'water',
                priority: 'high',
                date: new Date('2024-06-22'),
                active: true,
            },
        ];

        for (const notice of notices) {
            await addDoc(collection(db, 'notices'), notice);
            console.log(`Added notice: ${notice.title}`);
        }

        console.log('Sample data setup complete!');
    } catch (error) {
        console.error('Error setting up sample data:', error);
    }
};

export default setupSampleData;

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const vendorService = {
    // Get all vendors for a society
    getVendors: async (societyId, category = null) => {
        try {
            let q;

            if (category) {
                q = query(
                    collection(db, 'vendors'),
                    where('societyId', '==', societyId),
                    where('category', '==', category),
                    where('status', '==', 'active')
                );
            } else {
                q = query(
                    collection(db, 'vendors'),
                    where('societyId', '==', societyId),
                    where('status', '==', 'active')
                );
            }

            const snapshot = await getDocs(q);
            const vendors = [];

            snapshot.forEach(doc => {
                vendors.push({ id: doc.id, ...doc.data() });
            });

            // Sort by rating
            vendors.sort((a, b) => (b.rating || 0) - (a.rating || 0));

            return vendors;
        } catch (error) {
            console.error('Error fetching vendors:', error);
            return [];
        }
    },

    // Get a single vendor
    getVendor: async (vendorId) => {
        try {
            const docRef = doc(db, 'vendors', vendorId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error fetching vendor:', error);
            return null;
        }
    },

    // Create a service request
    createServiceRequest: async (requestData) => {
        try {
            const docRef = await addDoc(collection(db, 'service_requests'), {
                ...requestData,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return { success: true, requestId: docRef.id };
        } catch (error) {
            console.error('Error creating service request:', error);
            return { success: false, error: error.message };
        }
    },

    // Get service requests for a user
    getUserRequests: async (userId) => {
        try {
            const q = query(
                collection(db, 'service_requests'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const requests = [];

            snapshot.forEach(doc => {
                requests.push({ id: doc.id, ...doc.data() });
            });

            return requests;
        } catch (error) {
            console.error('Error fetching user requests:', error);
            return [];
        }
    },

    // Update service request status
    updateRequestStatus: async (requestId, status, updates = {}) => {
        try {
            const requestRef = doc(db, 'service_requests', requestId);
            const updateData = {
                status,
                updatedAt: serverTimestamp(),
                ...updates
            };

            if (status === 'accepted') {
                updateData.acceptedAt = serverTimestamp();
            } else if (status === 'completed') {
                updateData.completedAt = serverTimestamp();
            }

            await updateDoc(requestRef, updateData);

            return { success: true };
        } catch (error) {
            console.error('Error updating request status:', error);
            return { success: false, error: error.message };
        }
    },

    // Add a review for a vendor
    addReview: async (reviewData) => {
        try {
            const docRef = await addDoc(collection(db, 'vendor_reviews'), {
                ...reviewData,
                createdAt: serverTimestamp()
            });

            // Update vendor's average rating
            const vendorRef = doc(db, 'vendors', reviewData.vendorId);
            const vendorSnap = await getDoc(vendorRef);

            if (vendorSnap.exists()) {
                const vendor = vendorSnap.data();
                const currentTotal = (vendor.rating || 0) * (vendor.totalReviews || 0);
                const newTotal = currentTotal + reviewData.rating;
                const newCount = (vendor.totalReviews || 0) + 1;
                const newAverage = newTotal / newCount;

                await updateDoc(vendorRef, {
                    rating: parseFloat(newAverage.toFixed(1)),
                    totalReviews: newCount
                });
            }

            return { success: true, reviewId: docRef.id };
        } catch (error) {
            console.error('Error adding review:', error);
            return { success: false, error: error.message };
        }
    },

    // Get reviews for a vendor
    getVendorReviews: async (vendorId) => {
        try {
            const q = query(
                collection(db, 'vendor_reviews'),
                where('vendorId', '==', vendorId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const reviews = [];

            snapshot.forEach(doc => {
                reviews.push({ id: doc.id, ...doc.data() });
            });

            return reviews;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    }
};

export default vendorService;

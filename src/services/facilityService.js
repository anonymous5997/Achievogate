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

const facilityService = {
    // Get all facilities for a society
    getFacilities: async (societyId) => {
        try {
            const q = query(
                collection(db, 'facilities'),
                where('societyId', '==', societyId),
                where('status', '==', 'active')
            );

            const snapshot = await getDocs(q);
            const facilities = [];

            snapshot.forEach(doc => {
                facilities.push({ id: doc.id, ...doc.data() });
            });

            return facilities;
        } catch (error) {
            console.error('Error fetching facilities:', error);
            return [];
        }
    },

    // Get a single facility
    getFacility: async (facilityId) => {
        try {
            const docRef = doc(db, 'facilities', facilityId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error fetching facility:', error);
            return null;
        }
    },

    // Get bookings for a user
    getUserBookings: async (userId) => {
        try {
            const q = query(
                collection(db, 'facility_bookings'),
                where('userId', '==', userId),
                orderBy('bookingDate', 'desc')
            );

            const snapshot = await getDocs(q);
            const bookings = [];

            snapshot.forEach(doc => {
                bookings.push({ id: doc.id, ...doc.data() });
            });

            return bookings;
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            return [];
        }
    },

    // Check for booking conflicts
    checkConflict: async (facilityId, bookingDate, startTime, endTime, excludeBookingId = null) => {
        try {
            const q = query(
                collection(db, 'facility_bookings'),
                where('facilityId', '==', facilityId),
                where('bookingDate', '==', bookingDate),
                where('status', 'in', ['confirmed', 'pending'])
            );

            const snapshot = await getDocs(q);

            for (const docSnap of snapshot.docs) {
                if (excludeBookingId && docSnap.id === excludeBookingId) continue;

                const booking = docSnap.data();
                const existingStart = booking.startTime;
                const existingEnd = booking.endTime;

                // Check for time overlap
                if (
                    (startTime >= existingStart && startTime < existingEnd) ||
                    (endTime > existingStart && endTime <= existingEnd) ||
                    (startTime <= existingStart && endTime >= existingEnd)
                ) {
                    return {
                        hasConflict: true,
                        conflictingBooking: { id: docSnap.id, ...booking }
                    };
                }
            }

            return { hasConflict: false };
        } catch (error) {
            console.error('Error checking conflicts:', error);
            return { hasConflict: false };
        }
    },

    // Create a booking
    createBooking: async (bookingData) => {
        try {
            // Check for conflicts first
            const conflict = await facilityService.checkConflict(
                bookingData.facilityId,
                bookingData.bookingDate,
                bookingData.startTime,
                bookingData.endTime
            );

            if (conflict.hasConflict) {
                return {
                    success: false,
                    error: 'Time slot already booked',
                    conflict: conflict.conflictingBooking
                };
            }

            const docRef = await addDoc(collection(db, 'facility_bookings'), {
                ...bookingData,
                status: bookingData.requiresApproval ? 'pending' : 'confirmed',
                createdAt: serverTimestamp()
            });

            return { success: true, bookingId: docRef.id };
        } catch (error) {
            console.error('Error creating booking:', error);
            return { success: false, error: error.message };
        }
    },

    // Cancel a booking
    cancelBooking: async (bookingId) => {
        try {
            const bookingRef = doc(db, 'facility_bookings', bookingId);
            await updateDoc(bookingRef, {
                status: 'cancelled',
                cancelledAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return { success: false, error: error.message };
        }
    },

    // Get bookings for a specific date (for calendar view)
    getBookingsForDate: async (facilityId, date) => {
        try {
            const q = query(
                collection(db, 'facility_bookings'),
                where('facilityId', '==', facilityId),
                where('bookingDate', '==', date),
                where('status', 'in', ['confirmed', 'pending'])
            );

            const snapshot = await getDocs(q);
            const bookings = [];

            snapshot.forEach(doc => {
                bookings.push({ id: doc.id, ...doc.data() });
            });

            return bookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
        } catch (error) {
            console.error('Error fetching bookings for date:', error);
            return [];
        }
    }
};

export default facilityService;

import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const paymentService = {
    // Get all dues for a flat
    getDuesForFlat: async (flatId) => {
        try {
            const q = query(
                collection(db, 'dues'),
                where('flatId', '==', flatId)
            );

            const snapshot = await getDocs(q);
            const dues = [];

            snapshot.forEach(doc => {
                dues.push({ id: doc.id, ...doc.data() });
            });

            // Sort by due date
            dues.sort((a, b) => b.dueDate?.toMillis() - a.dueDate?.toMillis());

            return dues;
        } catch (error) {
            console.error('Error fetching dues:', error);
            return [];
        }
    },

    // Get payment history
    getPaymentHistory: async (userId) => {
        try {
            const q = query(
                collection(db, 'payments'),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            const payments = [];

            snapshot.forEach(doc => {
                payments.push({ id: doc.id, ...doc.data() });
            });

            payments.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());

            return payments;
        } catch (error) {
            console.error('Error fetching payments:', error);
            return [];
        }
    },

    // Create a payment
    createPayment: async (paymentData) => {
        try {
            const docRef = await addDoc(collection(db, 'payments'), {
                ...paymentData,
                status: 'success',
                createdAt: serverTimestamp()
            });

            // Update the dues status
            if (paymentData.dueIds && paymentData.dueIds.length > 0) {
                for (const dueId of paymentData.dueIds) {
                    await updateDoc(doc(db, 'dues', dueId), {
                        status: 'paid',
                        paidAmount: paymentData.amount,
                        paidDate: serverTimestamp(),
                        paymentId: docRef.id,
                        updatedAt: serverTimestamp()
                    });
                }
            }

            return { success: true, paymentId: docRef.id };
        } catch (error) {
            console.error('Error creating payment:', error);
            return { success: false, error: error.message };
        }
    },

    // Calculate total pending dues
    calculatePendingDues: (dues) => {
        return dues
            .filter(due => due.status === 'pending' || due.status === 'overdue')
            .reduce((total, due) => total + (due.totalAmount || 0), 0);
    }
};

export default paymentService;

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import paymentService from '../../services/paymentService';
import theme from '../../theme/theme';

const PaymentsScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [dues, setDues] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!userProfile?.flatId) return;

        try {
            const [duesData, paymentsData] = await Promise.all([
                paymentService.getDuesForFlat(userProfile.flatId),
                paymentService.getPaymentHistory(userProfile.uid)
            ]);

            setDues(duesData);
            setPayments(paymentsData);
        } catch (error) {
            console.error('Error loading payment data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handlePayDue = (due) => {
        Alert.alert(
            'Pay Due',
            `Pay ₹${due.totalAmount} for ${due.title}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pay Now',
                    onPress: async () => {
                        const result = await paymentService.createPayment({
                            societyId: userProfile.societyId,
                            userId: userProfile.uid,
                            flatId: userProfile.flatId,
                            dueIds: [due.id],
                            amount: due.totalAmount,
                            method: 'upi',
                            transactionId: `TXN${Date.now()}`
                        });

                        if (result.success) {
                            Alert.alert('Success', 'Payment completed successfully!');
                            loadData();
                        } else {
                            Alert.alert('Error', 'Payment failed. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const pendingDues = dues.filter(d => d.status === 'pending' || d.status === 'overdue');
    const totalPending = paymentService.calculatePendingDues(dues);

    const getDueStatusColor = (status) => {
        switch (status) {
            case 'paid': return theme.colors.status.success;
            case 'overdue': return theme.colors.status.error;
            default: return theme.colors.status.warning;
        }
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Payments & Dues"
                subtitle={`Total Pending: ₹${totalPending}`}
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Summary Card */}
                <AnimatedCard3D style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Pending</Text>
                            <Text style={styles.summaryValue}>₹{totalPending}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Paid This Month</Text>
                            <Text style={styles.summaryValue}>
                                ₹{payments.filter(p => {
                                    const date = p.createdAt?.toDate();
                                    const now = new Date();
                                    return date && date.getMonth() === now.getMonth();
                                }).reduce((sum, p) => sum + p.amount, 0)}
                            </Text>
                        </View>
                    </View>
                </AnimatedCard3D>

                {/* Pending Dues */}
                {pendingDues.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Pending Dues</Text>
                        {pendingDues.map(due => (
                            <AnimatedCard3D key={due.id} style={styles.dueCard}>
                                <View style={styles.dueHeader}>
                                    <View style={styles.dueInfo}>
                                        <Text style={styles.dueTitle}>{due.title}</Text>
                                        <Text style={styles.dueType}>{due.type}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: getDueStatusColor(due.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getDueStatusColor(due.status) }]}>
                                            {due.status?.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.dueDetails}>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="calendar-outline" size={16} color={theme.colors.text.secondary} />
                                        <Text style={styles.detailText}>
                                            Due: {due.dueDate?.toDate().toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="cash-outline" size={16} color={theme.colors.text.secondary} />
                                        <Text style={styles.detailText}>Amount: ₹{due.totalAmount}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.payButton} onPress={() => handlePayDue(due)}>
                                    <Text style={styles.payButtonText}>Pay Now</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </TouchableOpacity>
                            </AnimatedCard3D>
                        ))}
                    </>
                )}

                {/* Payment History */}
                {payments.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Payment History</Text>
                        {payments.slice(0, 5).map(payment => (
                            <AnimatedCard3D key={payment.id} style={styles.paymentCard}>
                                <View style={styles.paymentHeader}>
                                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.status.success} />
                                    <View style={styles.paymentInfo}>
                                        <Text style={styles.paymentAmount}>₹{payment.amount}</Text>
                                        <Text style={styles.paymentDate}>
                                            {payment.createdAt?.toDate().toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.paymentMethod}>via {payment.method?.toUpperCase()}</Text>
                                <Text style={styles.transactionId}>TXN: {payment.transactionId}</Text>
                            </AnimatedCard3D>
                        ))}
                    </>
                )}

                {dues.length === 0 && !loading && (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color={theme.colors.text.muted} />
                        <Text style={styles.emptyText}>No dues found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    summaryCard: {
        padding: 20,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        marginBottom: 4,
    },
    summaryValue: {
        ...theme.typography.h2,
        color: theme.colors.primary,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 12,
        marginTop: 8,
    },
    dueCard: {
        padding: 16,
        marginBottom: 12,
    },
    dueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    dueInfo: {
        flex: 1,
    },
    dueTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    dueType: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        textTransform: 'capitalize',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    dueDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginLeft: 8,
    },
    payButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    payButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 8,
    },
    paymentCard: {
        padding: 16,
        marginBottom: 12,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    paymentInfo: {
        marginLeft: 12,
    },
    paymentAmount: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
    },
    paymentDate: {
        color: theme.colors.text.secondary,
        fontSize: 12,
    },
    paymentMethod: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginBottom: 4,
    },
    transactionId: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: theme.colors.text.muted,
        marginTop: 16,
        fontSize: 16,
    },
});

export default PaymentsScreen;

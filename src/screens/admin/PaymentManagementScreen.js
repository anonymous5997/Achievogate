import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import WebContainer from '../../components/WebContainer';
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/theme';

const PaymentManagementScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // all, pending, paid

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        // In production, fetch all payments for the society
        // For now, using sample data structure
        setLoading(false);
        setRefreshing(false);
    };

    const stats = {
        totalCollected: 125000,
        pending: 45000,
        overdue: 12000,
        thisMonth: 85000
    };

    return (
        <WebContainer>
            <View style={styles.container}>
                <CinematicBackground />
                <CinematicHeader
                    title="Payment Management"
                    subtitle="Financial Overview"
                    leftIcon="arrow-back"
                    onLeftPress={() => navigation.goBack()}
                />

                <View style={styles.content}>
                    {/* Stats Cards */}
                    <View style={styles.statsGrid}>
                        <AnimatedCard3D style={styles.statCard}>
                            <Ionicons name="checkmark-circle" size={32} color={theme.colors.status.success} />
                            <Text style={styles.statValue}>₹{stats.totalCollected.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Total Collected</Text>
                        </AnimatedCard3D>

                        <AnimatedCard3D style={styles.statCard}>
                            <Ionicons name="time" size={32} color={theme.colors.status.warning} />
                            <Text style={styles.statValue}>₹{stats.pending.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </AnimatedCard3D>

                        <AnimatedCard3D style={styles.statCard}>
                            <Ionicons name="alert-circle" size={32} color={theme.colors.status.error} />
                            <Text style={styles.statValue}>₹{stats.overdue.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Overdue</Text>
                        </AnimatedCard3D>

                        <AnimatedCard3D style={styles.statCard}>
                            <Ionicons name="trending-up" size={32} color={theme.colors.primary} />
                            <Text style={styles.statValue}>₹{stats.thisMonth.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>This Month</Text>
                        </AnimatedCard3D>
                    </View>

                    {/* Filters */}
                    <View style={styles.filters}>
                        {['all', 'pending', 'paid'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                                onPress={() => setFilter(f)}
                            >
                                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                    {f.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Payment List */}
                    <FlatList
                        data={[]}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={() => null}
                        contentContainerStyle={styles.list}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadPayments} />}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Ionicons name="cash-outline" size={64} color={theme.colors.text.muted} />
                                <Text style={styles.emptyText}>No payment data available</Text>
                                <Text style={styles.emptySubtext}>
                                    Payment records will appear here once residents make payments
                                </Text>
                            </View>
                        }
                    />
                </View>
            </View>
        </WebContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    statValue: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginTop: 12,
        marginBottom: 4,
    },
    statLabel: {
        color: theme.colors.text.secondary,
        fontSize: 12,
    },
    filters: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    filterText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: theme.colors.text.muted,
        marginTop: 16,
        fontSize: 16,
    },
    emptySubtext: {
        color: theme.colors.text.muted,
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default PaymentManagementScreen;

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import facilityService from '../../services/facilityService';
import theme from '../../theme/theme';

const MyBookingsScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        if (!userProfile?.uid) return;

        const data = await facilityService.getUserBookings(userProfile.uid);
        setBookings(data);
        setLoading(false);
        setRefreshing(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return theme.colors.status.success;
            case 'pending': return theme.colors.status.warning;
            case 'cancelled': return theme.colors.text.muted;
            default: return theme.colors.text.secondary;
        }
    };

    const renderBooking = ({ item }) => (
        <AnimatedCard3D style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.facilityName}>{item.facilityName || 'Facility'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status?.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailText}>{item.bookingDate}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailText}>{item.startTime} - {item.endTime}</Text>
                </View>

                {item.amountPaid > 0 && (
                    <View style={styles.detailRow}>
                        <Ionicons name="cash" size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.detailText}>₹{item.amountPaid}</Text>
                    </View>
                )}
            </View>
        </AnimatedCard3D>
    );

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="My Bookings"
                subtitle="Your reservations"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                renderItem={renderBooking}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadBookings} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.empty}>
                            <Ionicons name="calendar-outline" size={64} color={theme.colors.text.muted} />
                            <Text style={styles.emptyText}>No bookings yet</Text>
                        </View>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    list: {
        padding: 16,
    },
    card: {
        padding: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    facilityName: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        flex: 1,
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
    details: {},
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginLeft: 8,
    },
    empty: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: theme.colors.text.muted,
        marginTop: 16,
    },
});

export default MyBookingsScreen;

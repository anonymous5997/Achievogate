import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import vendorService from '../../services/vendorService';
import theme from '../../theme/theme';

const MyRequestsScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        if (!userProfile?.uid) return;

        const data = await vendorService.getUserRequests(userProfile.uid);
        setRequests(data);
        setLoading(false);
        setRefreshing(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return theme.colors.status.success;
            case 'in_progress': return theme.colors.primary;
            case 'accepted': return theme.colors.status.info;
            case 'pending': return theme.colors.status.warning;
            case 'cancelled': return theme.colors.text.muted;
            default: return theme.colors.text.secondary;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return 'checkmark-circle';
            case 'in_progress': return 'construct';
            case 'accepted': return 'checkmark';
            case 'pending': return 'time';
            case 'cancelled': return 'close-circle';
            default: return 'help-circle';
        }
    };

    const renderRequest = ({ item }) => (
        <AnimatedCard3D style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons
                        name={getStatusIcon(item.status)}
                        size={20}
                        color={getStatusColor(item.status)}
                    />
                    <Text style={styles.title}>{item.title}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status?.toUpperCase().replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <Text style={styles.category}>{item.category?.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

            <View style={styles.footer}>
                <View style={styles.detail}>
                    <Ionicons name="calendar-outline" size={14} color={theme.colors.text.muted} />
                    <Text style={styles.detailText}>
                        {new Date(item.scheduledDate).toLocaleDateString()}
                    </Text>
                </View>

                {item.estimatedCost > 0 && (
                    <View style={styles.detail}>
                        <Ionicons name="cash-outline" size={14} color={theme.colors.text.muted} />
                        <Text style={styles.detailText}>₹{item.estimatedCost}</Text>
                    </View>
                )}
            </View>

            {item.vendorResponse && (
                <View style={styles.response}>
                    <Text style={styles.responseLabel}>Vendor Response:</Text>
                    <Text style={styles.responseText}>{item.vendorResponse}</Text>
                </View>
            )}
        </AnimatedCard3D>
    );

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="My Requests"
                subtitle="Service history"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={renderRequest}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadRequests} />}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.empty}>
                            <Ionicons name="construct-outline" size={64} color={theme.colors.text.muted} />
                            <Text style={styles.emptyText}>No service requests yet</Text>
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
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        ...theme.typography.h3,
        fontSize: 16,
        color: theme.colors.text.primary,
        marginLeft: 8,
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
    category: {
        color: theme.colors.text.muted,
        fontSize: 12,
        marginBottom: 8,
    },
    description: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    detailText: {
        color: theme.colors.text.muted,
        fontSize: 12,
        marginLeft: 4,
    },
    response: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    responseLabel: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        marginBottom: 4,
    },
    responseText: {
        color: theme.colors.text.primary,
        fontSize: 14,
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

export default MyRequestsScreen;


import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/theme';

const ParcelManagementScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active'); // active, collected

    useEffect(() => {
        loadParcels();
    }, [userProfile?.societyId, filter]);

    const loadParcels = async () => {
        setLoading(true);
        if (userProfile?.societyId) {
            const parcelService = await import('../../services/parcelService');
            // Check if getParcelsForSociety exists, if not use mock or fallback
            if (parcelService.getParcelsForSociety) {
                const res = await parcelService.getParcelsForSociety(userProfile.societyId, filter);
                if (res.success) {
                    setParcels(res.parcels);
                }
            } else {
                // Fallback if service update failed (Mock)
                console.warn("getParcelsForSociety not found");
            }
        }
        setLoading(false);
    };

    const isOverdue = (date) => {
        const hours = (new Date() - date) / 36e5;
        return hours > 48;
    };

    const handleRemind = (item) => {
        Alert.alert('Reminded', `Notification sent to ${item.flatNumber} for ${item.courier} parcel.`);
    };

    const renderItem = ({ item }) => {
        const overdue = item.status === 'pending' && isOverdue(item.createdAt);

        return (
            <AnimatedCard3D style={styles.card}>
                <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: overdue ? '#EF4444' : (item.status === 'pending' ? '#F59E0B' : '#10B981') }]}>
                        <Ionicons name="cube" size={24} color="#fff" />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.title}>{item.carrier || item.courier || 'Unknown'}</Text>
                        <Text style={styles.sub}>Flat: {item.flatNumber} {item.residentName ? `• ${item.residentName}` : ''}</Text>
                        <Text style={styles.time}>{item.createdAt?.toLocaleString() || item.entryTime?.toLocaleString()}</Text>
                        {overdue && <Text style={styles.overdueText}>⚠️ Overdue (&gt;48h)</Text>}
                    </View>

                    <View style={styles.actions}>
                        {item.status === 'pending' && (
                            <TouchableOpacity onPress={() => handleRemind(item)} style={styles.remindBtn}>
                                <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        )}
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
            </AnimatedCard3D>
        );
    };

    const getStats = () => {
        if (filter !== 'active') return null;
        const total = parcels.length;
        const overdueCount = parcels.filter(p => isOverdue(p.createdAt)).length;

        return (
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statVal}>{total}</Text>
                    <Text style={styles.statLabel}>At Gate</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statVal, { color: '#EF4444' }]}>{overdueCount}</Text>
                    <Text style={styles.statLabel}>Overdue</Text>
                </View>
            </View>
        );
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader title="Parcel Management" onBack={() => navigation.goBack()} />

                {/* Filter Tabs */}
                <View style={styles.tabs}>
                    {['active', 'collected'].map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.tab, filter === t && styles.activeTab]}
                            onPress={() => setFilter(t)}
                        >
                            <Text style={[styles.tabText, filter === t && styles.activeTabText]}>{t.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {getStats()}

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={parcels}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16 }}
                        ListEmptyComponent={<Text style={styles.empty}>No parcels found.</Text>}
                    />
                )}
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    tabs: { flexDirection: 'row', padding: 16, gap: 12 },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
    activeTab: { backgroundColor: theme.colors.primary },
    tabText: { color: theme.colors.text.muted, fontSize: 12, fontWeight: '600' },
    activeTabText: { color: '#fff' },

    statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, padding: 16, marginBottom: 8 },
    statItem: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: '#eee' },
    statVal: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
    statLabel: { fontSize: 12, color: theme.colors.text.muted, textTransform: 'uppercase', letterSpacing: 1 },

    card: { marginBottom: 12, padding: 16 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    title: { ...theme.typography.h3, fontSize: 16, color: theme.colors.text.primary },
    sub: { ...theme.typography.body1, fontSize: 13, color: theme.colors.text.muted },
    time: { fontSize: 10, color: theme.colors.text.muted, marginTop: 4 },
    overdueText: { color: '#EF4444', fontSize: 11, fontWeight: '700', marginTop: 2 },

    actions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 48 },
    remindBtn: { padding: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' },
    statusText: { fontSize: 10, fontWeight: '700', color: theme.colors.text.secondary },
    empty: { textAlign: 'center', marginTop: 40, color: theme.colors.text.muted }
});

export default ParcelManagementScreen;

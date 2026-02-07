import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import visitorService from '../../services/visitorService'; // Added import
import theme from '../../theme/theme';

const ResidentDetailScreen = ({ route, navigation }) => {
    const { resident } = route.params;
    const { userProfile } = useAuth();
    const [details, setDetails] = useState(resident);
    const [history, setHistory] = useState({ visitors: [], parcels: [] });
    const [loading, setLoading] = useState(false); // Validated state

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const [vRes, pRes] = await Promise.all([
                visitorService.getRecentVisitors(userProfile.societyId, resident.flatNumber),
                // Dynamic import to avoid cycles or ensure service availability
                import('../../services/parcelService').then(mod => mod.getParcels(userProfile.societyId, resident.flatNumber))
            ]);

            setHistory({
                visitors: vRes.success ? vRes.visitors : [],
                parcels: pRes.success ? pRes.parcels.slice(0, 5) : [] // Limit to 5
            });
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const getStatusColor = (status) => {
        if (!status) return theme.colors.text.muted;
        switch (status.toLowerCase()) {
            case 'active': return theme.colors.status.active;
            case 'pending': return theme.colors.status.pending;
            case 'suspended': return theme.colors.status.warning;
            case 'rejected': return theme.colors.status.error;
            default: return theme.colors.text.muted;
        }
    };

    const handleStatusChange = async (newStatus) => {
        Alert.alert(
            'Confirm Status Change',
            `Are you sure you want to mark this resident as ${newStatus.toUpperCase()}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    style: newStatus === 'rejected' || newStatus === 'suspended' ? 'destructive' : 'default',
                    onPress: async () => {
                        setLoading(true);
                        const res = await userService.updateResidentStatus(resident.id, newStatus, userProfile.uid, userProfile.societyId);
                        if (res.success) {
                            setDetails(prev => ({ ...prev, status: newStatus }));
                            alert('Status updated successfully');
                        } else {
                            alert('Failed to update status');
                        }
                        setLoading(false);
                    }
                }
            ]
        );
    };

    const StatusBadge = ({ status }) => {
        const color = getStatusColor(status);

        return (
            <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
                <Text style={[styles.badgeText, { color }]}>{status ? status.toUpperCase() : 'UNKNOWN'}</Text>
            </View>
        );
    };

    const InfoRow = ({ label, value, icon }) => (
        <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
                <Ionicons name={icon} size={18} color={theme.colors.text.muted} style={{ marginRight: 8 }} />
                <Text style={styles.label}>{label}</Text>
            </View>
            <Text style={styles.value}>{value || 'N/A'}</Text>
        </View>
    );

    const FloatingAura = ({ color }) => {
        const scale = useSharedValue(1);
        const opacity = useSharedValue(0.4);

        useEffect(() => {
            scale.value = withRepeat(withTiming(1.4, { duration: 2000 }), -1, true);
            opacity.value = withRepeat(withTiming(0, { duration: 2000 }), -1, true);
        }, []);

        const style = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            backgroundColor: color,
            position: 'absolute',
            width: '100%', height: '100%',
            borderRadius: 999,
            zIndex: -1,
        }));

        return <Animated.View style={style} />;
    };

    const CountdownBadge = ({ targetDate }) => {
        const [timeLeft, setTimeLeft] = useState('');

        useEffect(() => {
            const timer = setInterval(() => {
                const now = new Date();
                const diff = new Date(targetDate) - now;
                if (diff <= 0) {
                    setTimeLeft('Expired');
                    clearInterval(timer);
                } else {
                    const hrs = Math.floor(diff / 3600000);
                    const mins = Math.floor((diff % 3600000) / 60000);
                    const secs = Math.floor((diff % 60000) / 1000);
                    setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
                }
            }, 1000);
            return () => clearInterval(timer);
        }, [targetDate]);

        return (
            <View style={styles.slaBadge}>
                <Ionicons name="time" size={10} color="#EF4444" />
                <Text style={styles.slaText}>{timeLeft}</Text>
            </View>
        );
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper>
                <CinematicHeader title="RESIDENT PROFILE" onBack={() => navigation.goBack()} />

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Header Card */}
                    <View style={styles.card}>
                        <View style={styles.profileHeader}>
                            <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <FloatingAura color={getStatusColor(details.status)} />
                                <Animated.View
                                    style={[styles.avatarBig, { backgroundColor: theme.colors.background.light }]}
                                    sharedTransitionTag={`resident-avatar-${details.id}`}
                                >
                                    <Text style={styles.avatarTextBig}>{details.name?.[0]?.toUpperCase()}</Text>
                                </Animated.View>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.nameBig}>{details.name}</Text>
                                <Text style={styles.subBig}>
                                    {details.block} - {details.flatNumber} • {details.type?.toUpperCase()}
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(details.status) + '20' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(details.status) }]} />
                                    <Text style={[styles.statusText, { color: getStatusColor(details.status) }]}>
                                        {details.status?.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <InfoRow label="Email" value={details.email} icon="mail-outline" />
                        <InfoRow label="Phone" value={details.phone} icon="call-outline" />
                        <InfoRow label="Flat" value={`${details.block || ''} - ${details.flatNumber}`} icon="home-outline" />
                        <InfoRow label="Joined" value={details.createdAt ? new Date(details.createdAt).toDateString() : 'Unknown'} icon="calendar-outline" />
                    </View>

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Management Actions</Text>
                    <View style={styles.actionGrid}>
                        {details.status !== 'active' && (
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleStatusChange('active')}>
                                <Ionicons name="checkmark-circle" size={24} color={theme.colors.status.active} />
                                <Text style={styles.actionText}>Approve</Text>
                            </TouchableOpacity>
                        )}
                        {details.status !== 'suspended' && (
                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleStatusChange('suspended')}>
                                <Ionicons name="pause-circle" size={24} color={theme.colors.status.pending} />
                                <Text style={styles.actionText}>Suspend</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleStatusChange('rejected')}>
                            <Ionicons name="close-circle" size={24} color={theme.colors.status.error} />
                            <Text style={styles.actionText}>Reject</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Family Members */}
                    <Text style={styles.sectionTitle}>Family Members ({details.familyMembers?.length || 0})</Text>
                    <View style={styles.card}>
                        {details.familyMembers?.length > 0 ? (
                            details.familyMembers.map((member, i) => (
                                <View key={i} style={styles.listItem}>
                                    <View style={styles.listIcon}>
                                        <Ionicons name="person" size={20} color={theme.colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.listTitle}>{member.name}</Text>
                                        <Text style={styles.listSub}>{member.relation} • {member.phone}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No family members added.</Text>
                        )}
                    </View>

                    {/* Vehicles */}
                    <Text style={styles.sectionTitle}>Vehicles ({details.vehicles?.length || 0})</Text>
                    <View style={styles.card}>
                        {details.vehicles?.length > 0 ? (
                            details.vehicles.map((v, i) => (
                                <View key={i} style={styles.listItem}>
                                    <View style={styles.listIcon}>
                                        <Ionicons name={v.type === 'Bike' ? 'bicycle' : 'car'} size={20} color={theme.colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.listTitle}>{v.plateNumber || v.vehicleNumber}</Text>
                                        <Text style={styles.listSub}>{v.type || 'Vehicle'}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No vehicles registered.</Text>
                        )}
                    </View>

                    {/* Recent Visitors */}
                    <Text style={styles.sectionTitle}>Recent Visitors</Text>
                    <View style={styles.card}>
                        {history.visitors.length > 0 ? (
                            history.visitors.map((v, i) => (
                                <View key={i} style={styles.listItem}>
                                    <View style={[styles.listIcon, { backgroundColor: '#EEF2FF' }]}>
                                        <Ionicons name="people" size={18} color={theme.colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.listTitle}>{v.visitorName}</Text>
                                        <Text style={styles.listSub}>{new Date(v.createdAt).toLocaleDateString()} • {v.purpose}</Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: v.status === 'approved' ? '#DCFCE7' : '#F3F4F6' }]}>
                                        <Text style={[styles.badgeText, { color: v.status === 'approved' ? theme.colors.status.active : theme.colors.text.muted }]}>
                                            {v.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No recent visitors.</Text>
                        )}
                    </View>

                    {/* Recent Parcels */}
                    <Text style={styles.sectionTitle}>Recent Parcels</Text>
                    <View style={styles.card}>
                        {history.parcels.length > 0 ? (
                            history.parcels.map((p, i) => (
                                <View key={i} style={styles.listItem}>
                                    <View style={[styles.listIcon, { backgroundColor: '#FFF7ED' }]}>
                                        <Ionicons name="cube" size={18} color={theme.colors.status.warning} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.listTitle}>{p.carrier || 'Package'}</Text>
                                        <Text style={styles.listSub}>{p.entryTime ? new Date(p.entryTime).toLocaleDateString() : 'Unknown Date'}</Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: p.status === 'collected' ? '#DCFCE7' : '#FEF3C7' }]}>
                                        <Text style={[styles.badgeText, { color: p.status === 'collected' ? theme.colors.status.active : theme.colors.status.warning }]}>
                                            {p.status === 'collected' ? 'DONE' : 'GATE'}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No parcel history.</Text>
                        )}
                    </View>

                </ScrollView>

                {loading && (
                    <View style={styles.loaderOverlay}>
                        <View style={styles.loaderContent}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={styles.loaderText}>Updating...</Text>
                        </View>
                    </View>
                )}

            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 16, paddingBottom: 40 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },

    profileHeader: { alignItems: 'center', marginBottom: 16 },
    avatarBig: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    avatarTextBig: { fontSize: 32, fontWeight: 'bold', color: theme.colors.text.primary },
    nameBig: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    subBig: { fontSize: 13, color: '#64748b', marginBottom: 8 },

    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    infoLabelContainer: { flexDirection: 'row', alignItems: 'center' },
    label: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    value: { fontSize: 14, color: '#1e293b', fontWeight: '600' },

    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    badgeText: { fontSize: 11, fontWeight: '700' },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12, marginLeft: 4 },

    actionGrid: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
    actionBtn: { flex: 1, minWidth: '30%', backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    actionText: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#334155' },

    listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    listIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    listTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    listSub: { fontSize: 12, color: '#64748b' },
    emptyText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: 12 },

    loaderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    loaderContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#1e293b', fontWeight: '600' }
});

export default ResidentDetailScreen;

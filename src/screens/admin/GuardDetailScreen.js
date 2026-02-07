import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import theme from '../../theme/theme';

const GuardDetailScreen = ({ route, navigation }) => {
    const { guard } = route.params;
    const [stats, setStats] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const guardService = (await import('../../services/guardService')).default;
            const [statsRes, attRes] = await Promise.all([
                guardService.getGuardStats(guard.id),
                guardService.getGuardAttendance(guard.id)
            ]);

            if (statsRes.success) setStats(statsRes.stats);
            if (attRes.success) setAttendance(attRes.logs);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
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

    const getScoreColor = (score) => {
        if (!score) return theme.colors.text.muted;
        const s = parseInt(score);
        if (s >= 90) return theme.colors.status.approved;
        if (s >= 70) return theme.colors.status.active;
        return theme.colors.status.error;
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Guard Profile"
                    onBack={() => navigation.goBack()}
                />

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Header Profile */}
                    <View style={styles.card}>
                        <View style={styles.profileHeader}>
                            <View style={[styles.avatarBig, { backgroundColor: '#E0E7FF' }]}>
                                <Text style={styles.avatarTextBig}>{guard.name?.[0]?.toUpperCase()}</Text>
                            </View>
                            <View style={{ alignItems: 'center', marginTop: 12 }}>
                                <Text style={styles.nameBig}>{guard.name}</Text>
                                <Text style={styles.subBig}>{guard.shift} Shift • Gate {guard.gateNumber}</Text>
                                <View style={[styles.badge, { backgroundColor: guard.status === 'on_duty' ? '#DCFCE7' : '#F3F4F6' }]}>
                                    <Text style={[styles.badgeText, { color: guard.status === 'on_duty' ? theme.colors.status.active : theme.colors.text.muted }]}>
                                        {guard.status?.replace('_', ' ').toUpperCase() || 'OFF DUTY'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <InfoRow label="Phone" value={guard.phone} icon="call-outline" />
                        <InfoRow label="Employee ID" value={guard.id?.substring(0, 8).toUpperCase()} icon="id-card-outline" />
                        <InfoRow label="Joined" value={guard.createdAt ? new Date(guard.createdAt).toDateString() : 'Unknown'} icon="calendar-outline" />
                    </View>

                    {/* Stats */}
                    {loading ? <ActivityIndicator color={theme.colors.primary} /> : (
                        <>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>{stats?.attendanceRate || '-'}</Text>
                                    <Text style={styles.statLabel}>Attendance</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statValue}>{stats?.visitorsHandled || '0'}</Text>
                                    <Text style={styles.statLabel}>Visitors</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={[styles.statValue, { color: getScoreColor(stats?.performanceScore) }]}>
                                        {stats?.performanceScore || 'N/A'}
                                    </Text>
                                    <Text style={styles.statLabel}>Performance</Text>
                                </View>
                            </View>

                            {/* Attendance Log */}
                            <Text style={styles.sectionTitle}>Recent Attendance</Text>
                            <View style={styles.card}>
                                {attendance.length > 0 ? (
                                    attendance.map((log, i) => (
                                        <View key={i} style={styles.listItem}>
                                            <View style={[styles.listIcon, { backgroundColor: log.type === 'check_in' ? '#DCFCE7' : '#FEE2E2' }]}>
                                                <Ionicons name={log.type === 'check_in' ? 'log-in' : 'log-out'} size={18} color={log.type === 'check_in' ? theme.colors.status.active : theme.colors.status.error} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.listTitle}>{log.type === 'check_in' ? 'Check In' : 'Check Out'}</Text>
                                                <Text style={styles.listSub}>{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</Text>
                                            </View>
                                            <Text style={styles.locationText}>{log.location}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>No attendance records found.</Text>
                                )}
                            </View>
                        </>
                    )}
                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 16, paddingBottom: 40 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    profileHeader: { alignItems: 'center', marginBottom: 16 },
    avatarBig: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    avatarTextBig: { fontSize: 32, fontWeight: 'bold', color: '#4338CA' },
    nameBig: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    subBig: { fontSize: 13, color: '#64748b', marginBottom: 8 },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    infoLabelContainer: { flexDirection: 'row', alignItems: 'center' },
    label: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    value: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
    badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
    badgeText: { fontSize: 11, fontWeight: '700' },

    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#64748b' },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12, marginLeft: 4 },
    listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    listIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    listTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    listSub: { fontSize: 12, color: '#64748b' },
    locationText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
    emptyText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: 12 },
});

export default GuardDetailScreen;

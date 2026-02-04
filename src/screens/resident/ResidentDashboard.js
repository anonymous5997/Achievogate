import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import useVisitors from '../../hooks/useVisitors';
import theme from '../../theme/theme';

const ResidentDashboard = ({ navigation }) => {
    const { userProfile, signOut } = useAuth();
    const { visitors, pendingVisitors, approveVisitor, denyVisitor } = useVisitors('resident', userProfile?.flatNumber);

    return (
        <CinematicBackground>
            <StatusBar barStyle="dark-content" />

            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="My Home"
                    subTitle={`Flat ${userProfile?.flatNumber} • ${userProfile?.name?.split(' ')[0]}`}
                    rightAction={
                        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                            <Ionicons name="log-out-outline" size={20} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={styles.content}>

                    {pendingVisitors.length > 0 ? (
                        pendingVisitors.map((v, i) => (
                            <AnimatedCard3D
                                key={v.id}
                                index={i}
                                glowColor={theme.colors.status.pending}
                                style={styles.approvalCard}
                            >
                                <View style={styles.approvalHeader}>
                                    <View style={styles.tag}>
                                        <View style={styles.pulse} />
                                        <Text style={styles.tagText}>WAITING AT GATE</Text>
                                    </View>
                                    <Text style={styles.time}>Now</Text>
                                </View>

                                <View style={styles.visitorInfo}>
                                    <Text style={styles.visitorName}>{v.visitorName}</Text>
                                    <Text style={styles.purpose}>{v.purpose}</Text>
                                </View>

                                <View style={styles.actions}>
                                    <CinematicButton
                                        title="Allow Entry"
                                        variant="success"
                                        style={{ flex: 1, marginRight: 8 }}
                                        onPress={() => approveVisitor(v.id, userProfile.id)}
                                        icon={<Ionicons name="checkmark" size={18} color="#fff" />}
                                    />
                                    <CinematicButton
                                        title="Deny"
                                        variant="danger"
                                        style={{ flex: 1, marginLeft: 8 }}
                                        onPress={() => denyVisitor(v.id, userProfile.id)}
                                        icon={<Ionicons name="close" size={18} color="#fff" />}
                                    />
                                </View>
                            </AnimatedCard3D>
                        ))
                    ) : (
                        <AnimatedCard3D>
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIcon}>
                                    <Ionicons name="home" size={32} color={theme.colors.primary} />
                                </View>
                                <Text style={styles.emptyText}>No pending requests</Text>
                                <Text style={styles.emptySub}>Your home is secure</Text>
                            </View>
                        </AnimatedCard3D>
                    )}

                    <Text style={styles.historyLabel}>RECENT ACTIVITY</Text>

                    {visitors.slice(0, 5).map((v, i) => (
                        <AnimatedCard3D key={v.id} index={i + 2} delay={200} style={{ marginVertical: 6 }}>
                            <View style={styles.row}>
                                <View style={[
                                    styles.statusData,
                                    { backgroundColor: v.status === 'approved' ? '#DCFCE7' : '#FEE2E2' } // Light green/red bg
                                ]}>
                                    <Ionicons
                                        name={v.status === 'approved' ? 'arrow-down' : 'close'}
                                        size={16}
                                        color={v.status === 'approved' ? theme.colors.status.approved : theme.colors.status.denied}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.rowText}>{v.visitorName}</Text>
                                    <Text style={styles.rowSub}>{v.purpose}</Text>
                                </View>
                                <Text style={styles.rowStatus}>{v.status.toUpperCase()}</Text>
                            </View>
                        </AnimatedCard3D>
                    ))}

                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 24 },
    logoutBtn: {
        padding: 8, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12,
    },
    approvalCard: {
        borderWidth: 1,
        borderColor: theme.colors.status.pending, // Golden border
        backgroundColor: '#fff',
    },
    approvalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    tagText: { fontSize: 10, fontWeight: '700', color: theme.colors.status.pending, marginLeft: 6 },
    pulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.status.pending },
    time: { ...theme.typography.caption, color: theme.colors.text.muted },
    visitorInfo: { alignItems: 'center', marginBottom: 24 },
    visitorName: { ...theme.typography.h1, fontSize: 32, textAlign: 'center', color: theme.colors.text.primary },
    purpose: { ...theme.typography.body1, color: theme.colors.text.secondary, marginTop: 4 },
    actions: { flexDirection: 'row' },
    emptyState: { alignItems: 'center', padding: 24 },
    emptyIcon: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF2FF',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16
    },
    emptyText: { ...theme.typography.h3, color: theme.colors.text.primary },
    emptySub: { ...theme.typography.body1, color: theme.colors.text.muted },
    historyLabel: { ...theme.typography.caption, marginTop: 32, marginBottom: 12, marginLeft: 4, color: theme.colors.text.muted },
    row: { flexDirection: 'row', alignItems: 'center' },
    statusData: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    rowText: { color: theme.colors.text.primary, fontWeight: '600', fontSize: 16 },
    rowSub: { color: theme.colors.text.muted, fontSize: 13 },
    rowStatus: { ...theme.typography.caption, color: theme.colors.text.secondary }
});

export default ResidentDashboard;

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import NeoCard from '../../components/NeoCard';
import NeonButton from '../../components/NeonButton';
import SOSButton from '../../components/SOSButton';
import FloatingOrb from '../../components/motion/FloatingOrb';
import StatusRing from '../../components/motion/StatusRing';
import useAuth from '../../hooks/useAuth';
import useNotices from '../../hooks/useNotices';
import useParcels from '../../hooks/useParcels';
import useVisitors from '../../hooks/useVisitors';
import visitorService from '../../services/visitorService';
import theme from '../../theme/theme';

const FadeInLeft = (delay) => FadeInUp.delay(delay).springify(); // Helper
const FadeInRight = (delay) => FadeInUp.delay(delay).springify(); // Helper

const QuickAction = ({ icon, label, onPress, delay, color }) => (
    <Animated.View entering={ZoomIn.delay(delay).springify()} style={styles.quickActionContainer}>
        <TouchableOpacity onPress={onPress} style={styles.quickActionBtn}>
            {/* Floating Effect Background */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={{ opacity: 0.3, transform: [{ scale: 1.2 }] }}>
                    <FloatingOrb size={56} color={color} duration={2000 + delay} />
                </View>
            </View>
            <LinearGradient
                colors={[color, color + '80']}
                style={styles.quickActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={icon} size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.quickActionLabel}>{label}</Text>
        </TouchableOpacity>
    </Animated.View>
);

const SectionHeader = ({ title, action, onAction }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {action && (
            <TouchableOpacity onPress={onAction}>
                <Text style={styles.sectionAction}>{action}</Text>
            </TouchableOpacity>
        )}
    </View>
);

const ResidentDashboard = ({ navigation }) => {
    const { userProfile, signOut } = useAuth();
    const { visitors, pendingVisitors, approveVisitor, denyVisitor } = useVisitors('resident', userProfile?.flatNumber);
    const { parcels, pendingCount: parcelCount } = useParcels(userProfile?.flatNumber);
    const { notices } = useNotices();
    const [visitorsTodayCount, setVisitorsTodayCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        // Add reload logic here if needed
        setTimeout(() => setRefreshing(false), 1000);
    };

    useEffect(() => {
        if (userProfile?.flatNumber) {
            visitorService.getTodayVisitorCount(userProfile.flatNumber).then(result => {
                if (result.success) setVisitorsTodayCount(result.count);
            });
        }
    }, [userProfile, visitors]);

    return (
        <CinematicBackground>
            <StatusBar barStyle="light-content" />

            <CinematicHeader
                title="MY HOME"
                subTitle={`Flat ${userProfile?.flatNumber} • ${userProfile?.societyId}`}
                rightAction={
                    <TouchableOpacity onPress={signOut} style={styles.profileBtn}>
                        <Image source={{ uri: userProfile?.photoUrl || 'https://ui-avatars.com/api/?name=' + userProfile?.name }} style={styles.profileImg} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                showsVerticalScrollIndicator={false}
            >

                {/* Pending Actions / Notifications */}
                {pendingVisitors.length > 0 && (
                    <Animated.View entering={FadeInDown.springify()} style={styles.alertSection}>
                        {pendingVisitors.map((v, i) => (
                            <NeoCard key={v.id} style={styles.alertCard} glass={true} padding={16}>
                                <View style={styles.alertHeader}>
                                    <View style={styles.pulseContainer}>
                                        <View style={styles.pulseDot} />
                                        <Text style={styles.alertTitle}>WAITING AT GATE</Text>
                                    </View>
                                    <Text style={styles.alertTime}>Just Now</Text>
                                </View>
                                <View style={styles.visitorRow}>
                                    <View style={styles.visitorAvatar}>
                                        <Ionicons name="person" size={24} color="#fff" />
                                    </View>
                                    <View>
                                        <Text style={styles.visitorName}>{v.visitorName}</Text>
                                        <Text style={styles.visitorPurpose}>{v.purpose}</Text>
                                    </View>
                                </View>
                                <View style={styles.actionRow}>
                                    <NeonButton
                                        title="ALLOW"
                                        variant="success"
                                        style={{ flex: 1, marginRight: 8 }}
                                        onPress={() => approveVisitor(v.id, userProfile.id)}
                                    />
                                    <NeonButton
                                        title="DENY"
                                        variant="danger"
                                        style={{ flex: 1, marginLeft: 8 }}
                                        onPress={() => denyVisitor(v.id, userProfile.id)}
                                    />
                                </View>
                            </NeoCard>
                        ))}
                    </Animated.View>
                )}

                {/* Quick Actions Grid */}
                <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
                <View style={styles.quickGrid}>
                    <QuickAction icon="people-outline" label="Invite" delay={100} color="#3B82F6" onPress={() => navigation.navigate('InviteVisitor')} />
                    <QuickAction icon="cube-outline" label="Parcels" delay={200} color="#F59E0B" onPress={() => navigation.navigate('ParcelEntryScreen')} />
                    <QuickAction icon="chatbox-ellipses-outline" label="Help" delay={300} color="#EF4444" onPress={() => navigation.navigate('ResidentComplaint')} />
                    <QuickAction icon="calendar-outline" label="Book" delay={400} color="#10B981" onPress={() => navigation.navigate('FacilityListScreen')} />
                </View>

                {/* Status Cards */}
                <View style={styles.statsRow}>
                    <Animated.View entering={FadeInLeft(200)} style={{ flex: 1 }}>
                        <NeoCard style={styles.statCard} glass={true}>
                            <View style={{ position: 'absolute' }}>
                                <StatusRing
                                    size={80}
                                    progress={Math.min(visitorsTodayCount / 10, 1)}
                                    color={theme.colors.secondary}
                                    strokeWidth={4}
                                />
                            </View>
                            <Text style={styles.statNumber}>{visitorsTodayCount}</Text>
                            <Text style={styles.statLabel}>Visitors Today</Text>
                        </NeoCard>
                    </Animated.View>
                    <View style={{ width: 12 }} />
                    <Animated.View entering={FadeInRight(200)} style={{ flex: 1 }}>
                        <NeoCard style={styles.statCard} glass={true}>
                            <Text style={[styles.statNumber, { color: parcelCount > 0 ? theme.colors.primary : '#fff' }]}>
                                {parcelCount}
                            </Text>
                            <Text style={styles.statLabel}>Parcels Pending</Text>
                        </NeoCard>
                    </Animated.View>
                </View>

                {/* Recent Visitors */}
                <SectionHeader title="RECENT VISITORS" action="View All" onAction={() => navigation.navigate('VisitorList')} />
                <View style={styles.listSection}>
                    {visitors.slice(0, 3).map((v, i) => (
                        <Animated.View key={v.id} entering={FadeInUp.delay(i * 100)}>
                            <NeoCard style={styles.listItem} glass={true} padding={12}>
                                <View style={styles.listRow}>
                                    <View style={[styles.statusDot, { backgroundColor: v.status === 'approved' ? '#10B981' : '#EF4444' }]} />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.listTitle}>{v.visitorName}</Text>
                                        <Text style={styles.listSub}>{v.purpose}</Text>
                                    </View>
                                    <Text style={styles.listStatus}>{v.status.toUpperCase()}</Text>
                                </View>
                            </NeoCard>
                        </Animated.View>
                    ))}
                </View>

                {/* Community Feed Preview */}
                <SectionHeader title="COMMUNITY UPDATES" action="Open Feed" onAction={() => navigation.navigate('CommunityFeedScreen')} />
                <Animated.View entering={FadeInUp.delay(400)}>
                    <NeoCard style={styles.feedCard} glass={true} padding={0}>
                        {/* Placeholder for feed preview */}
                        <View style={{ padding: 16 }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Annual General Meeting</Text>
                            <Text style={{ color: theme.colors.text.secondary, marginTop: 4 }}>Join us this Sunday at the clubhouse...</Text>
                        </View>
                        <View style={{ height: 40, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', paddingHorizontal: 16 }}>
                            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '700' }}>READ MORE</Text>
                        </View>
                    </NeoCard>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <SOSButton style={{ position: 'absolute', bottom: 20, right: 20 }} />
        </CinematicBackground>
    );
};


import { Image } from 'react-native'; // Import Image

const styles = StyleSheet.create({
    content: {
        padding: 20,
    },
    profileBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        overflow: 'hidden',
    },
    profileImg: {
        width: '100%',
        height: '100%',
    },

    // Alerts
    alertSection: {
        marginBottom: 24,
    },
    alertCard: {
        borderWidth: 1,
        borderColor: theme.colors.status.pending,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    pulseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.status.pending,
    },
    alertTitle: {
        color: theme.colors.status.pending,
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 1,
    },
    alertTime: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    visitorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    visitorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    visitorName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    visitorPurpose: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    actionRow: {
        flexDirection: 'row',
    },

    // Quick Grid
    sectionLabel: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
        marginBottom: 16,
        marginLeft: 4,
    },
    quickGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    quickActionContainer: {
        width: '23%',
        aspectRatio: 1,
    },
    quickActionBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionGradient: {
        width: 56,
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    quickActionLabel: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        fontWeight: '600',
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        marginBottom: 32,
    },
    statCard: {
        alignItems: 'center',
        padding: 16,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.text.muted,
    },

    // List
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: '#fff',
        fontSize: 16,
    },
    sectionAction: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    listSection: {
        marginBottom: 24,
        gap: 12,
    },
    listItem: {
        marginBottom: 0,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    listTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    listSub: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    listStatus: {
        color: theme.colors.text.secondary,
        fontSize: 10,
        fontWeight: '700',
    },
    feedCard: {
        overflow: 'hidden',
    }
});

export default ResidentDashboard;

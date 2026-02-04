import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import NoticeCard from '../../components/NoticeCard';
import useAuth from '../../hooks/useAuth';
import useNotices from '../../hooks/useNotices';
import useParcels from '../../hooks/useParcels';
import useVisitors from '../../hooks/useVisitors';
import visitorService from '../../services/visitorService';
import theme from '../../theme/theme';

const ResidentDashboard = ({ navigation }) => {
    const { userProfile, signOut } = useAuth();
    const { visitors, pendingVisitors, approveVisitor, denyVisitor } = useVisitors('resident', userProfile?.flatNumber);
    const { parcels, pendingCount: parcelCount } = useParcels(userProfile?.flatNumber);
    const { notices } = useNotices();
    const [visitorsTodayCount, setVisitorsTodayCount] = useState(0);

    useEffect(() => {
        if (userProfile?.flatNumber) {
            visitorService.getTodayVisitorCount(userProfile.flatNumber).then(result => {
                if (result.success) {
                    setVisitorsTodayCount(result.count);
                }
            });
        }
    }, [userProfile, visitors]);

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const hours = d.getHours();
        const minutes = d.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    return (
        <CinematicBackground>
            <StatusBar barStyle="dark-content" />

            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title={`Welcome, ${userProfile?.name?.split(' ')[0]}!`}
                    subTitle={`Flat ${userProfile?.flatNumber}`}
                    rightAction={
                        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                            <Ionicons name="log-out-outline" size={20} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Quick Actions Row */}
                    <View style={styles.quickActionsRow}>
                        {/* Invite Visitor Card */}
                        <AnimatedCard3D
                            index={0}
                            style={[styles.quickActionCard, { flex: 1, marginRight: 8 }]}
                            onPress={() => navigation.navigate('InviteVisitor')}
                        >
                            <View style={styles.inviteIcon}>
                                <Ionicons name="person-add" size={28} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.inviteTitle}>Invite Visitor</Text>
                            <Text style={styles.inviteSubtitle}>Pre-register a guest</Text>
                        </AnimatedCard3D>

                        {/* File Complaint Card */}
                        <AnimatedCard3D
                            index={1}
                            style={[styles.quickActionCard, { flex: 1, marginLeft: 8 }]}
                            onPress={() => navigation.navigate('ResidentComplaint')}
                        >
                            <View style={[styles.inviteIcon, { backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="chatbox-ellipses" size={28} color={theme.colors.status.denied} />
                            </View>
                            <Text style={styles.inviteTitle}>File Complaint</Text>
                            <Text style={styles.inviteSubtitle}>Report an issue</Text>
                        </AnimatedCard3D>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <AnimatedCard3D index={2} style={[styles.statCard, { marginRight: 8 }]}>
                            <Text style={styles.statLabel}>Visitors Today</Text>
                            <Text style={styles.statValue}>{visitorsTodayCount}</Text>
                        </AnimatedCard3D>

                        <AnimatedCard3D index={2} style={[styles.statCard, { marginLeft: 8 }]}>
                            <Text style={styles.statLabel}>Parcels to Collect</Text>
                            <Text style={styles.statValue}>{parcelCount}</Text>
                        </AnimatedCard3D>
                    </View>

                    {/* Pending Approvals Section */}
                    <Text style={styles.sectionTitle}>Pending Approvals</Text>
                    {pendingVisitors.length > 0 ? (
                        pendingVisitors.map((v, i) => (
                            <AnimatedCard3D
                                key={v.id}
                                index={i + 3}
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
                        <AnimatedCard3D index={3}>
                            <View style={styles.emptyState}>
                                <View style={styles.emptyIcon}>
                                    <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
                                </View>
                                <Text style={styles.emptyText}>No pending requests</Text>
                                <Text style={styles.emptySub}>You're all caught up!</Text>
                            </View>
                        </AnimatedCard3D>
                    )}

                    {/* Recent Visitors Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Visitors</Text>
                        {visitors.length > 5 && (
                            <TouchableOpacity>
                                <Text style={styles.viewAll}>View All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {visitors.slice(0, 5).map((v, i) => (
                        <AnimatedCard3D key={v.id} index={i + 10} delay={50} style={{ marginVertical: 6 }}>
                            <View style={styles.row}>
                                <View style={[
                                    styles.statusData,
                                    { backgroundColor: v.status === 'approved' ? '#DCFCE7' : '#FEE2E2' }
                                ]}>
                                    <Ionicons
                                        name={v.status === 'approved' ? 'checkmark' : 'close'}
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

                    {/* Parcels Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Parcels</Text>
                        {parcels.length > 3 && (
                            <TouchableOpacity>
                                <Text style={styles.viewAll}>View All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {parcels.slice(0, 3).length > 0 ? (
                        parcels.slice(0, 3).map((parcel, i) => (
                            <AnimatedCard3D key={parcel.id} index={i + 20} delay={50} style={{ marginVertical: 6 }}>
                                <View style={styles.row}>
                                    <View style={styles.parcelIcon}>
                                        <Ionicons name="cube" size={20} color={theme.colors.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={styles.rowText}>{parcel.description}</Text>
                                        <Text style={styles.rowSub}>Received at {formatTime(parcel.receivedAt)}</Text>
                                    </View>
                                    {parcel.status === 'pending' && (
                                        <View style={styles.pendingBadge}>
                                            <Text style={styles.pendingText}>NEW</Text>
                                        </View>
                                    )}
                                </View>
                            </AnimatedCard3D>
                        ))
                    ) : (
                        <AnimatedCard3D index={20}>
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No parcels</Text>
                            </View>
                        </AnimatedCard3D>
                    )}

                    {/* Notice Board Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Notice Board</Text>
                        {notices.length > 2 && (
                            <TouchableOpacity>
                                <Text style={styles.viewAll}>View All</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <AnimatedCard3D index={30} style={{ marginBottom: 24 }}>
                        {notices.slice(0, 2).length > 0 ? (
                            notices.slice(0, 2).map((notice) => (
                                <NoticeCard key={notice.id} notice={notice} />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No notices</Text>
                            </View>
                        )}
                    </AnimatedCard3D>

                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 24 },
    logoutBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
    },

    // Invite Card
    inviteCard: {
        backgroundColor: '#fff',
        marginBottom: 24,
    },
    inviteContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    inviteIcon: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    inviteInfo: {
        flex: 1,
    },
    inviteTitle: {
        ...theme.typography.h3,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    inviteSubtitle: {
        ...theme.typography.body1,
        fontSize: 13,
        color: theme.colors.text.secondary,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 20,
    },
    statLabel: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
        marginBottom: 8,
        fontSize: 13,
    },
    statValue: {
        ...theme.typography.h1,
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text.primary,
    },

    // Section Headers
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        ...theme.typography.h3,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginTop: 8,
    },
    viewAll: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '600',
    },

    // Approval Cards
    approvalCard: {
        borderWidth: 1,
        borderColor: theme.colors.status.pending,
        backgroundColor: '#fff',
        marginBottom: 16,
    },
    approvalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.status.pending,
        marginLeft: 6,
    },
    pulse: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.status.pending,
    },
    time: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
    },
    visitorInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    visitorName: {
        ...theme.typography.h1,
        fontSize: 28,
        textAlign: 'center',
        color: theme.colors.text.primary,
    },
    purpose: {
        ...theme.typography.body1,
        color: theme.colors.text.secondary,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
    },

    // Empty States
    emptyState: {
        alignItems: 'center',
        padding: 24,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        ...theme.typography.h3,
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    emptySub: {
        ...theme.typography.body1,
        color: theme.colors.text.muted,
    },

    // List Rows
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusData: {
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowText: {
        color: theme.colors.text.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    rowSub: {
        color: theme.colors.text.muted,
        fontSize: 13,
        marginTop: 2,
    },
    rowStatus: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
        fontWeight: '600',
    },

    // Parcel Items
    parcelIcon: {
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pendingBadge: {
        backgroundColor: theme.colors.status.pending,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    pendingText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
});

export default ResidentDashboard;

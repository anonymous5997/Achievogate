import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import useVisitors from '../../hooks/useVisitors';
import theme from '../../theme/theme';

const GuardActionCard = ({ icon, title, subtitle, color, onPress, index }) => (
    <AnimatedCard3D
        index={index}
        delay={index * 100}
        style={styles.actionCard}
        onPress={onPress}
    >
        <View style={[styles.actionIconContainer, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={32} color={color} />
        </View>
        <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{title}</Text>
            <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.colors.text.muted} />
    </AnimatedCard3D>
);

const GuardDashboard = ({ navigation }) => {
    const { userProfile, signOut } = useAuth();
    const { visitors, pendingVisitors, approvedVisitors } = useVisitors('guard', userProfile?.id);

    const actions = [
        {
            id: 'prior-invite',
            icon: 'ticket',
            title: 'Prior Invite',
            subtitle: 'Check in a visitor with a pre-approved code.',
            color: '#4F46E5',
            screen: 'PriorInvite',
        },
        {
            id: 'new-visitor',
            icon: 'person-add',
            title: 'New Visitor',
            subtitle: 'Register a new visitor at the gate.',
            color: '#2563EB',
            screen: 'CreateVisitor',
        },
        {
            id: 'parcel-entry',
            icon: 'cube',
            title: 'Parcel Entry',
            subtitle: 'Log a package delivery.',
            color: '#D97706',
            screen: 'ParcelEntry',
        },
        {
            id: 'view-notices',
            icon: 'megaphone',
            title: 'View Notices',
            subtitle: 'See society announcements.',
            color: '#DC2626',
            screen: 'ViewNoticesScreen',
        },
        {
            id: 'file-complaint',
            icon: 'chatbox-ellipses',
            title: 'File Complaint',
            subtitle: 'Report an issue or concern.',
            color: '#EA580C',
            screen: 'GuardComplaint',
        },
    ];

    return (
        <CinematicBackground>
            <StatusBar barStyle="dark-content" />

            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Guard Portal"
                    subTitle={`Hi, ${userProfile?.name?.split(' ')[0] || 'Guard'}`}
                    leftAction={
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                    }
                    rightAction={
                        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                            <Ionicons name="power" size={20} color={theme.colors.status.denied} />
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <AnimatedCard3D index={0} style={styles.statBox}>
                            <Text style={styles.statValue}>{pendingVisitors.length}</Text>
                            <Text style={styles.statLabel}>PENDING</Text>
                        </AnimatedCard3D>
                        <AnimatedCard3D index={1} style={styles.statBox}>
                            <Text style={styles.statValue}>{approvedVisitors.length}</Text>
                            <Text style={styles.statLabel}>APPROVED</Text>
                        </AnimatedCard3D>
                        <AnimatedCard3D index={2} style={styles.statBox}>
                            <Text style={styles.statValue}>{visitors.length}</Text>
                            <Text style={styles.statLabel}>TOTAL TODAY</Text>
                        </AnimatedCard3D>
                    </View>

                    {/* Guard Actions */}
                    <Text style={styles.sectionTitle}>GUARD ACTIONS</Text>
                    <Text style={styles.sectionSubtitle}>Select an option to proceed.</Text>

                    {actions.map((action, index) => (
                        <GuardActionCard
                            key={action.id}
                            {...action}
                            index={index + 3}
                            onPress={() => action.screen && navigation.navigate(action.screen)}
                        />
                    ))}

                    {/* Quick Access */}
                    < AnimatedCard3D index={10} style={styles.quickAccessCard}>
                        <View style={styles.quickAccessHeader}>
                            <Ionicons name="flash" size={20} color={theme.colors.secondary} />
                            <Text style={styles.quickAccessTitle}>Quick Access</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.quickAccessBtn}
                            onPress={() => navigation.navigate('VisitorList')}
                        >
                            <Ionicons name="list" size={18} color={theme.colors.primary} />
                            <Text style={styles.quickAccessBtnText}>View Full Visitor Log</Text>
                            <Ionicons name="chevron-forward" size={18} color={theme.colors.text.muted} />
                        </TouchableOpacity>
                    </AnimatedCard3D>

                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 24 },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        ...theme.typography.h1,
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.text.muted,
        fontWeight: '600',
    },

    // Section
    sectionTitle: {
        ...theme.typography.h2,
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.muted,
        marginBottom: 20,
    },

    // Action Card
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
    },
    actionIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        ...theme.typography.h3,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    actionSubtitle: {
        ...theme.typography.body1,
        fontSize: 13,
        color: theme.colors.text.muted,
    },

    // Quick Access
    quickAccessCard: {
        marginTop: 24,
        padding: 16,
    },
    quickAccessHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    quickAccessTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    quickAccessBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        gap: 10,
    },
    quickAccessBtnText: {
        ...theme.typography.body1,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        flex: 1,
    },
});

export default GuardDashboard;

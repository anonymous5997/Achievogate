import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D'; // Updated
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper'; // Updated
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import useVisitors from '../../hooks/useVisitors';
import theme from '../../theme/theme';

const StatBox = ({ label, value, icon, color, index }) => (
    <View style={styles.statBoxWrapper}>
        <AnimatedCard3D index={index} style={styles.statCard}>
            <View style={styles.statContent}>
                <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
        </AnimatedCard3D>
    </View>
);

const GuardDashboard = ({ navigation }) => {
    const { userProfile, signOut } = useAuth();
    const { visitors, pendingVisitors, approvedVisitors } = useVisitors('guard', userProfile?.id);

    return (
        <CinematicBackground>
            <StatusBar barStyle="dark-content" />

            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Guard Console"
                    subTitle={`Hi, ${userProfile?.name?.split(' ')[0] || 'Guard'}`}
                    rightAction={
                        <TouchableOpacity onPress={signOut} style={styles.profileBtn}>
                            <Ionicons name="power" size={20} color={theme.colors.status.denied} />
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={styles.content}>

                    {/* Quick Action */}
                    <AnimatedCard3D delay={100} glowColor={theme.colors.secondary}>
                        <View style={styles.actionRow}>
                            <View>
                                <Text style={styles.actionTitle}>New Entry</Text>
                                <Text style={styles.actionSub}>Register a visitor</Text>
                            </View>
                            <CinematicButton
                                title="Start"
                                onPress={() => navigation.navigate('CreateVisitor')}
                                style={{ width: 100, minHeight: 44 }}
                                textStyle={{ fontSize: 14 }}
                            />
                        </View>
                    </AnimatedCard3D>

                    <Text style={styles.sectionHeader}>LIVE METRICS</Text>

                    <View style={styles.statsGrid}>
                        <StatBox
                            label="PENDING"
                            value={pendingVisitors.length}
                            icon="time"
                            color={theme.colors.status.pending}
                            index={2}
                        />
                        <StatBox
                            label="APPROVED"
                            value={approvedVisitors.length}
                            icon="checkmark-circle"
                            color={theme.colors.status.approved}
                            index={3}
                        />
                        <StatBox
                            label="TOTAL"
                            value={visitors.length}
                            icon="people"
                            color={theme.colors.primary}
                            index={4}
                        />
                        <StatBox
                            label="EXITED"
                            value={visitors.filter(v => v.status === 'exited').length}
                            icon="log-out"
                            color={theme.colors.text.muted}
                            index={5}
                        />
                    </View>

                    <CinematicButton
                        title="View Full Visitor Log"
                        variant="outline"
                        onPress={() => navigation.navigate('VisitorList')}
                        style={{ marginTop: 24 }}
                        icon={<Ionicons name="list" size={18} color={theme.colors.primary} />}
                    />

                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: theme.spacing.container },
    profileBtn: {
        width: 36, height: 36,
        borderRadius: 18,
        backgroundColor: '#FEE2E2', // light red bg
        alignItems: 'center', justifyContent: 'center'
    },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    actionTitle: { ...theme.typography.h3, fontSize: 18, color: theme.colors.text.primary },
    actionSub: { ...theme.typography.body1, fontSize: 14, color: theme.colors.text.secondary },
    sectionHeader: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
        marginTop: 32, marginBottom: 12,
        marginLeft: 4
    },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
    statBoxWrapper: { width: '50%', padding: 8 },
    statCard: { marginVertical: 0, minHeight: 140, justifyContent: 'center' },
    statContent: { alignItems: 'center', padding: 12 },
    iconCircle: {
        width: 48, height: 48, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 12
    },
    statValue: { ...theme.typography.h2, fontSize: 32, color: theme.colors.text.primary },
    statLabel: { ...theme.typography.caption, fontSize: 11, color: theme.colors.text.muted }
});

export default GuardDashboard;

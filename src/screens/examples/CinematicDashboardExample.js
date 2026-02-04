// Example: Cinematic Dashboard Screen
// Demonstrates the motion system in action

import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStaggerDelay } from '../animations/useAnimations';
import AnimatedButton from '../components/animated/AnimatedButton';
import AnimatedCard from '../components/animated/AnimatedCard';
import AnimatedScreen from '../components/animated/AnimatedScreen';
import FlipCard from '../components/animated/FlipCard';
import { colors, spacing } from '../theme';

const CinematicDashboardExample = ({ navigation }) => {
    const actionCards = [
        { id: 1, icon: 'person-add', title: 'Invite Visitor', subtitle: 'Pre-approve your guests' },
        { id: 2, icon: 'calendar', title: 'Book Facility', subtitle: 'Reserve clubhouse or pool' },
        { id: 3, icon: 'card', title: 'Pay Dues', subtitle: 'Maintenance payment' },
    ];

    return (
        <AnimatedScreen gradient>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Hero Section */}
                    <View style={styles.hero}>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.userName}>John Doe</Text>
                    </View>

                    {/* Stats Grid - Staggered Animation */}
                    <View style={styles.statsGrid}>
                        <AnimatedCard delay={getStaggerDelay(0)} style={styles.statCard}>
                            <Text style={styles.statNumber}>12</Text>
                            <Text style={styles.statLabel}>Visitors</Text>
                        </AnimatedCard>
                        <AnimatedCard delay={getStaggerDelay(1)} style={styles.statCard}>
                            <Text style={styles.statNumber}>3</Text>
                            <Text style={styles.statLabel}>Bookings</Text>
                        </AnimatedCard>
                    </View>

                    {/* Action Cards - Staggered */}
                    {actionCards.map((item, index) => (
                        <AnimatedCard
                            key={item.id}
                            delay={getStaggerDelay(index + 2)}
                            onPress={() => console.log('Pressed:', item.title)}
                            style={styles.actionCard}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.iconTintPrimary }]}>
                                <Ionicons name={item.icon} size={24} color={colors.primary} />
                            </View>
                            <View style={styles.actionText}>
                                <Text style={styles.actionTitle}>{item.title}</Text>
                                <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                        </AnimatedCard>
                    ))}

                    {/* 3D Flip Card Example */}
                    <AnimatedCard delay={getStaggerDelay(5)}>
                        <Text style={styles.sectionTitle}>3D Flip Card Demo</Text>
                        <FlipCard
                            style={styles.flipCardContainer}
                            frontContent={
                                <View style={styles.flipFace}>
                                    <Ionicons name="card" size={48} color={colors.primary} />
                                    <Text style={styles.flipText}>Tap to Flip</Text>
                                </View>
                            }
                            backContent={
                                <View style={[styles.flipFace, styles.flipBackFace]}>
                                    <Ionicons name="shield-checkmark" size={48} color={colors.success} />
                                    <Text style={styles.flipText}>Back Side</Text>
                                </View>
                            }
                        />
                    </AnimatedCard>

                    {/* Primary Button */}
                    <AnimatedButton
                        title="Pay Maintenance Dues"
                        onPress={() => console.log('Pay pressed')}
                        style={styles.primaryButton}
                    />

                    {/* Secondary Button */}
                    <AnimatedButton
                        title="View More"
                        variant="secondary"
                        onPress={() => console.log('View more')}
                        style={styles.secondaryButton}
                    />
                </ScrollView>
            </SafeAreaView>
        </AnimatedScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
    },
    hero: {
        marginBottom: spacing.xl,
    },
    greeting: {
        fontSize: 16,
        color: colors.textTertiary,
        marginBottom: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        flex: 1,
        marginLeft: spacing.md,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 13,
        color: colors.textTertiary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    flipCardContainer: {
        height: 150,
    },
    flipFace: {
        flex: 1,
        backgroundColor: colors.surfaceWhite,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    flipBackFace: {
        backgroundColor: colors.primary,
    },
    flipText: {
        marginTop: spacing.sm,
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    primaryButton: {
        marginTop: spacing.lg,
    },
    secondaryButton: {
        marginTop: spacing.md,
    },
});

export default CinematicDashboardExample;

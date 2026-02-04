import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import GlassCard from '../../components/GlassCard';
import theme from '../../theme/theme';

const RoleSelectionScreen = ({ navigation, route }) => {
    const { onRoleSelect } = route.params || {};

    const handleRoleSelection = (role) => {
        if (onRoleSelect) {
            onRoleSelect(role);
        }

        // Navigate based on role
        if (role === 'guard') {
            navigation.replace('GuardDashboard');
        } else if (role === 'resident') {
            navigation.replace('ResidentDashboard');
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.iconGlow}>
                                <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
                            </View>
                        </View>
                        <Text style={styles.title}>Welcome to</Text>
                        <Text style={styles.appName}>Achievogate</Text>
                        <Text style={styles.subtitle}>Please select your role to continue.</Text>
                    </View>

                    {/* Role Cards */}
                    <View style={styles.rolesContainer}>
                        {/* Guard Card */}
                        <TouchableOpacity
                            style={styles.roleCard}
                            onPress={() => handleRoleSelection('guard')}
                            activeOpacity={0.8}
                        >
                            <GlassCard style={styles.cardContent}>
                                <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                                    <Ionicons name="shield" size={32} color={theme.colors.primary} />
                                </View>
                                <View style={styles.roleInfo}>
                                    <Text style={styles.roleTitle}>Guard</Text>
                                    <Text style={styles.roleDescription}>
                                        Manage visitor entries and deliveries
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={theme.colors.text.secondary} />
                            </GlassCard>
                        </TouchableOpacity>

                        {/* Resident Card */}
                        <TouchableOpacity
                            style={styles.roleCard}
                            onPress={() => handleRoleSelection('resident')}
                            activeOpacity={0.8}
                        >
                            <GlassCard style={styles.cardContent}>
                                <View style={[styles.iconContainer, { backgroundColor: '#FEF3F2' }]}>
                                    <Ionicons name="people" size={32} color={theme.colors.accent} />
                                </View>
                                <View style={styles.roleInfo}>
                                    <Text style={styles.roleTitle}>Resident</Text>
                                    <Text style={styles.roleDescription}>
                                        Approve visitors and view notices
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color={theme.colors.text.secondary} />
                            </GlassCard>
                        </TouchableOpacity>
                    </View>

                    {/* Go Back Option */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={16} color={theme.colors.primary} />
                        <Text style={styles.backText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        marginBottom: 16,
    },
    iconGlow: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    title: {
        ...theme.typography.h2,
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    appName: {
        ...theme.typography.h1,
        fontSize: 36,
        fontWeight: '800',
        color: theme.colors.text.primary,
        marginBottom: 12,
    },
    subtitle: {
        ...theme.typography.body1,
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    rolesContainer: {
        gap: 16,
        marginBottom: 32,
    },
    roleCard: {
        marginBottom: 12,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    roleInfo: {
        flex: 1,
    },
    roleTitle: {
        ...theme.typography.h3,
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    roleDescription: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    backText: {
        ...theme.typography.body1,
        color: theme.colors.primary,
        fontWeight: '600',
    },
});

export default RoleSelectionScreen;

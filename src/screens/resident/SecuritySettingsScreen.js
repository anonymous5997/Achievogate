import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import theme from '../../theme/theme';

const SecuritySettingsScreen = ({ navigation }) => {
    const { userProfile, user } = useAuth();
    const [showPasswords, setShowPasswords] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const hasPassword = userProfile?.passwordHash;

    const handleSetPassword = async () => {
        if (newPassword.length < 6) {
            return Alert.alert('Error', 'Password must be at least 6 characters');
        }

        if (newPassword !== confirmPassword) {
            return Alert.alert('Error', 'Passwords do not match');
        }

        if (hasPassword && !currentPassword) {
            return Alert.alert('Error', 'Please enter your current password');
        }

        // Verify current password if changing
        if (hasPassword) {
            const isValid = await authService.verifyPassword(currentPassword, userProfile.passwordHash);
            if (!isValid) {
                return Alert.alert('Error', 'Current password is incorrect');
            }
        }

        setLoading(true);
        const result = await authService.setUserPassword(user.uid, newPassword);
        setLoading(false);

        if (result.success) {
            Alert.alert('Success', hasPassword ? 'Password updated successfully!' : 'Password set successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswords(false);
        } else {
            Alert.alert('Error', result.error || 'Failed to set password');
        }
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Security Settings"
                subtitle="Manage your login credentials"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                {/* Password Section */}
                <AnimatedCard3D style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="lock-closed" size={24} color={theme.colors.primary} />
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.cardTitle}>Password</Text>
                            <Text style={styles.cardSubtitle}>
                                {hasPassword ? 'Update your password' : 'Set a password to login'}
                            </Text>
                        </View>
                    </View>

                    {hasPassword && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <View style={styles.passwordInput}>
                                <TextInput
                                    style={styles.input}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor={theme.colors.text.muted}
                                    secureTextEntry={!showPasswords}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPasswords(!showPasswords)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showPasswords ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={theme.colors.text.secondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <View style={styles.passwordInput}>
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password"
                                placeholderTextColor={theme.colors.text.muted}
                                secureTextEntry={!showPasswords}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPasswords(!showPasswords)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPasswords ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={theme.colors.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.hint}>At least 6 characters</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <View style={styles.passwordInput}>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor={theme.colors.text.muted}
                                secureTextEntry={!showPasswords}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPasswords(!showPasswords)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPasswords ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={theme.colors.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSetPassword}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Saving...' : hasPassword ? 'Update Password' : 'Set Password'}
                        </Text>
                    </TouchableOpacity>
                </AnimatedCard3D>

                {/* Login Methods Info */}
                <AnimatedCard3D style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="information-circle" size={24} color="#3B82F6" />
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.cardTitle}>Login Methods</Text>
                        </View>
                    </View>

                    <View style={styles.methodItem}>
                        <Ionicons name="key-outline" size={20} color={theme.colors.text.secondary} />
                        <View style={styles.methodText}>
                            <Text style={styles.methodTitle}>Password Login</Text>
                            <Text style={styles.methodDescription}>
                                {hasPassword ? 'Enabled - You can login with email/phone + password' : 'Set a password to enable this method'}
                            </Text>
                        </View>
                        <View style={[styles.badge, hasPassword && styles.badgeActive]}>
                            <Text style={[styles.badgeText, hasPassword && styles.badgeTextActive]}>
                                {hasPassword ? 'ON' : 'OFF'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.methodItem}>
                        <Ionicons name="chatbox-ellipses-outline" size={20} color={theme.colors.text.secondary} />
                        <View style={styles.methodText}>
                            <Text style={styles.methodTitle}>OTP Login</Text>
                            <Text style={styles.methodDescription}>
                                Always available - Login with email/phone + OTP
                            </Text>
                        </View>
                        <View style={[styles.badge, styles.badgeActive]}>
                            <Text style={[styles.badgeText, styles.badgeTextActive]}>ON</Text>
                        </View>
                    </View>
                </AnimatedCard3D>

                {/* Security Tips */}
                <AnimatedCard3D style={styles.card}>
                    <Text style={styles.tipsTitle}>Security Tips</Text>
                    <View style={styles.tip}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.tipText}>Use a strong password with letters, numbers & symbols</Text>
                    </View>
                    <View style={styles.tip}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.tipText}>Don't share your password with anyone</Text>
                    </View>
                    <View style={styles.tip}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.tipText}>OTP is sent every time for secure access</Text>
                    </View>
                </AnimatedCard3D>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        padding: 20,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardHeaderText: {
        flex: 1,
        marginLeft: 12,
    },
    cardTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 8,
    },
    passwordInput: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: theme.colors.text.primary,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        fontSize: 16,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
    hint: {
        fontSize: 12,
        color: theme.colors.text.muted,
        marginTop: 4,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    methodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    methodText: {
        flex: 1,
        marginLeft: 12,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    methodDescription: {
        fontSize: 13,
        color: theme.colors.text.secondary,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    badgeActive: {
        backgroundColor: theme.colors.primary + '20',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.text.muted,
    },
    badgeTextActive: {
        color: theme.colors.primary,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 16,
    },
    tip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginLeft: 12,
        lineHeight: 20,
    },
});

export default SecuritySettingsScreen;

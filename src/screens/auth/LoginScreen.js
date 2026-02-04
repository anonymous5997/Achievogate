import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import CinematicBackground from '../../components/CinematicBackground';
import GlassCard from '../../components/GlassCard';
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/theme';

const RETRY_DELAY = 30; // seconds

const LoginScreen = () => {
    const [authMode, setAuthMode] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('input'); // 'input' or 'otp' (for phone auth)
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const { sendOTP, verifyOTP, signInWithEmail, signUpWithEmail } = useAuth();

    const isExpoGo = Constants.appOwnership === 'expo';

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Email/Password Login
    const handleEmailAuth = async () => {
        if (!email || !password) {
            return Alert.alert('Error', 'Please enter email and password');
        }

        setLoading(true);

        let result;
        if (isSignUp) {
            result = await signUpWithEmail(email, password, phoneNumber);
        } else {
            result = await signInWithEmail(email, password);
        }

        setLoading(false);

        if (!result.success) {
            Alert.alert('Authentication Failed', result.error);
        }
    };

    // Phone OTP Login
    const handleSendOTP = async (isRetry = false) => {
        if (!phoneNumber || phoneNumber.length < 10) {
            return Alert.alert('Error', 'Invalid phone number');
        }
        if (isRetry && timer > 0) return;

        setLoading(true);
        const result = await sendOTP(phoneNumber);
        setLoading(false);

        if (result.success) {
            if (!isRetry) setStep('otp');
            setTimer(RETRY_DELAY);
            if (isRetry) Alert.alert('Sent', 'Code resent successfully.');
        } else {
            Alert.alert('Error', result.error || 'Failed to send OTP');
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            return Alert.alert('Error', 'Invalid OTP length');
        }

        setLoading(true);
        const result = await verifyOTP(otp);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Authentication Failed', result.error);
            setOtp('');
        }
    };

    const switchAuthMode = () => {
        if (isExpoGo && authMode === 'email') {
            Alert.alert(
                'Phone Auth Unavailable',
                'Phone authentication requires a Development Build and is not available in Expo Go. Please continue with email/password.'
            );
            return;
        }
        setAuthMode(authMode === 'email' ? 'phone' : 'email');
        setStep('input');
        setOtp('');
    };

    return (
        <CinematicBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.logoContainer}>
                        <View style={styles.iconGlow}>
                            <Ionicons name="shield-checkmark" size={64} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.title}>ACHIEVOGATE</Text>
                        <Text style={styles.subtitle}>SECURE ACCESS SYSTEM</Text>

                        {isExpoGo && (
                            <View style={styles.devModeChip}>
                                <Ionicons name="code-slash" size={14} color="#fff" />
                                <Text style={styles.devModeText}>Expo Go - Dev Mode</Text>
                            </View>
                        )}
                    </View>

                    <GlassCard>
                        {/* Auth Mode Selector */}
                        {!isExpoGo && (
                            <View style={styles.authModeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.authModeButton,
                                        authMode === 'email' && styles.authModeButtonActive
                                    ]}
                                    onPress={() => {
                                        setAuthMode('email');
                                        setStep('input');
                                    }}
                                >
                                    <Ionicons
                                        name="mail"
                                        size={18}
                                        color={authMode === 'email' ? '#fff' : theme.colors.text.muted}
                                    />
                                    <Text style={[
                                        styles.authModeButtonText,
                                        authMode === 'email' && styles.authModeButtonTextActive
                                    ]}>Email</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.authModeButton,
                                        authMode === 'phone' && styles.authModeButtonActive
                                    ]}
                                    onPress={switchAuthMode}
                                >
                                    <Ionicons
                                        name="call"
                                        size={18}
                                        color={authMode === 'phone' ? '#fff' : theme.colors.text.muted}
                                    />
                                    <Text style={[
                                        styles.authModeButtonText,
                                        authMode === 'phone' && styles.authModeButtonTextActive
                                    ]}>Phone</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Email/Password Auth */}
                        {authMode === 'email' ? (
                            <View>
                                <Text style={styles.label}>
                                    {isSignUp ? 'Create Account' : 'Identity Verification'}
                                </Text>
                                <Text style={styles.helper}>
                                    {isSignUp ? 'Sign up with email and password' : 'Enter your credentials'}
                                </Text>

                                {/* Email Input */}
                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail" size={20} color={theme.colors.secondary} style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="email@example.com"
                                        placeholderTextColor={theme.colors.text.muted}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed" size={20} color={theme.colors.accent} style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor={theme.colors.text.muted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                {/* Phone Number (optional for signup) */}
                                {isSignUp && (
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="keypad" size={20} color={theme.colors.secondary} style={styles.icon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="+91 99999 99999 (optional)"
                                            placeholderTextColor={theme.colors.text.muted}
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                )}

                                {/* Submit Button */}
                                <TouchableOpacity
                                    onPress={handleEmailAuth}
                                    disabled={loading}
                                    style={[styles.button, { marginTop: 8 }]}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="finger-print" size={20} color="#fff" style={{ marginRight: 8 }} />
                                            <Text style={styles.buttonText}>
                                                {isSignUp ? 'Create Account' : 'Sign In'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {/* Toggle Sign Up / Sign In */}
                                <TouchableOpacity
                                    onPress={() => setIsSignUp(!isSignUp)}
                                    style={styles.centerLink}
                                >
                                    <Text style={styles.link}>
                                        {isSignUp ? 'Already have an account? Sign In' : 'New user? Create Account'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* Phone OTP Auth */
                            step === 'input' ? (
                                <View>
                                    <Text style={styles.label}>Identity Verification</Text>
                                    <Text style={styles.helper}>Enter your registered mobile number</Text>

                                    <View style={styles.inputContainer}>
                                        <Ionicons name="keypad" size={20} color={theme.colors.secondary} style={styles.icon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="+91 99999 99999"
                                            placeholderTextColor={theme.colors.text.muted}
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                        />
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => handleSendOTP(false)}
                                        disabled={loading}
                                        style={[styles.button, { marginTop: 8 }]}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Ionicons name="finger-print" size={20} color="#fff" style={{ marginRight: 8 }} />
                                                <Text style={styles.buttonText}>Send Safe Code</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <Text style={styles.label}>Verify Code</Text>
                                    <Text style={styles.helper}>Sent to {phoneNumber}</Text>

                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed" size={20} color={theme.colors.accent} style={styles.icon} />
                                        <TextInput
                                            placeholder="______"
                                            placeholderTextColor={theme.colors.text.muted}
                                            value={otp}
                                            onChangeText={setOtp}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            textAlign="center"
                                            style={[styles.input, { fontSize: 24, letterSpacing: 8 }]}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleVerifyOTP}
                                        disabled={loading}
                                        style={[styles.button, styles.buttonSuccess]}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.buttonText}>Unlock Access</Text>
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.footerRow}>
                                        <TouchableOpacity onPress={() => handleSendOTP(true)} disabled={timer > 0}>
                                            <Text style={[styles.link, timer > 0 && styles.linkDisabled]}>
                                                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => { setStep('input'); setOtp(''); }}>
                                            <Text style={styles.link}>Change Number</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )
                        )}
                    </GlassCard>
                </ScrollView>
            </KeyboardAvoidingView>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.spacing.container,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    iconGlow: {
        marginBottom: 16,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    title: {
        ...theme.typography.h1,
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.typography.caption,
        textAlign: 'center',
        letterSpacing: 4,
        color: theme.colors.secondary,
        marginBottom: 12,
    },
    devModeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 152, 0, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 8,
        gap: 6,
    },
    devModeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    authModeSelector: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: theme.layout.buttonRadius,
        padding: 4,
        marginBottom: 24,
        gap: 8,
    },
    authModeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: theme.layout.buttonRadius - 4,
        gap: 6,
    },
    authModeButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    authModeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.muted,
    },
    authModeButtonTextActive: {
        color: '#fff',
    },
    label: {
        ...theme.typography.h3,
        marginBottom: 8,
        textAlign: 'center',
        color: theme.colors.text.secondary,
    },
    helper: {
        ...theme.typography.body1,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        color: theme.colors.text.muted,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: theme.layout.buttonRadius,
        height: 56,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
    },
    icon: { marginRight: 12 },
    input: {
        flex: 1,
        color: theme.colors.text.primary,
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        fontWeight: '600',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingHorizontal: 8,
    },
    centerLink: {
        alignItems: 'center',
        marginTop: 16,
    },
    link: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '700',
    },
    linkDisabled: {
        color: theme.colors.text.muted,
    },
    button: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.layout.buttonRadius,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonSuccess: {
        backgroundColor: theme.colors.success,
        shadowColor: theme.colors.success,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    }
});

export default LoginScreen;

import { Ionicons } from '@expo/vector-icons';
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
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);

    const { sendOTP, verifyOTP } = useAuth();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOTP = async (isRetry = false) => {
        if (!phoneNumber || phoneNumber.length < 10) return Alert.alert('Error', 'Invalid phone number');
        if (isRetry && timer > 0) return;

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
        if (!otp || otp.length !== 6) return Alert.alert('Error', 'Invalid OTP length');

        setLoading(true);
        const result = await verifyOTP(otp);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Authentication Failed', result.error);
            setOtp(''); // Clear generic error
        }
    };

    return (
        <CinematicBackground>
            {/* FirebaseRecaptchaVerifierModal disabled for Expo Go compatibility */}
            {/* <FirebaseRecaptchaVerifierModal
                ref={recaptchaRef}
                firebaseConfig={firebaseConfig}
                firebaseApp={app}
                title="Security Verification"
            /> */}

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
                    </View>

                    <GlassCard>
                        {step === 'phone' ? (
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

                                    <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); }}>
                                        <Text style={styles.link}>Change Number</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
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
        backgroundColor: '#F1F5F9', // Slate 100
        borderRadius: theme.layout.buttonRadius,
        height: 56,
        marginBottom: 24,
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

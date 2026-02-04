import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CinematicBackground from '../../components/CinematicBackground';
import OTPInput from '../../components/onboarding/OTPInput';
import PrimaryButton from '../../components/onboarding/PrimaryButton';
import TextInputField from '../../components/onboarding/TextInputField';
import useAuth from '../../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
    const [authMethod, setAuthMethod] = useState('password'); // 'password' or 'otp'
    const [identifier, setIdentifier] = useState(''); // email or phone
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);

    const { signInWithEmail, signInWithPhone, sendOTPViaFirestore, verifyOTPFromFirestore } = useAuth();

    // OTP Timer
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const isEmail = () => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    };

    const isPhone = () => {
        return /^\+?[0-9]{10,15}$/.test(identifier.replace(/\s/g, ''));
    };

    // Handle Password Login
    const handlePasswordLogin = async () => {
        if (!identifier || !password) {
            return Alert.alert('Error', 'Please enter your credentials');
        }

        setLoading(true);
        try {
            let result;
            if (isEmail()) {
                result = await signInWithEmail(identifier, password);
            } else if (isPhone()) {
                result = await signInWithPhone(identifier, password);
            } else {
                setLoading(false);
                return Alert.alert('Error', 'Please enter a valid email or phone number');
            }

            if (!result.success) {
                Alert.alert('Login Failed', result.error || 'Invalid credentials');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    };

    // Handle Send OTP
    const handleSendOTP = async () => {
        if (!identifier) {
            return Alert.alert('Error', 'Please enter email or phone number');
        }

        if (!isEmail() && !isPhone()) {
            return Alert.alert('Error', 'Please enter a valid email or phone number');
        }

        setLoading(true);
        try {
            const result = await sendOTPViaFirestore(identifier);
            if (result.success) {
                setOtpSent(true);
                setTimer(30);
                Alert.alert('Success', `OTP sent to ${identifier}${result.devOTP ? `\n\nDev OTP: ${result.devOTP}` : ''}`);
            } else {
                Alert.alert('Error', result.error || 'Failed to send OTP');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    };

    // Handle Verify OTP
    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            return Alert.alert('Error', 'Please enter 6-digit OTP');
        }

        setLoading(true);
        try {
            const result = await verifyOTPFromFirestore(identifier, otp);
            if (!result.success) {
                Alert.alert('Verification Failed', result.error || 'Invalid OTP');
                setOtp('');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    };

    // Handle Resend OTP
    const handleResendOTP = async () => {
        if (timer > 0) return;
        await handleSendOTP();
    };

    return (
        <CinematicBackground>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.logo}>AchievoGate</Text>
                            <Text style={styles.tagline}>Smart Society Management</Text>
                        </View>

                        {/* Auth Method Toggle */}
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    authMethod === 'password' && styles.toggleButtonActive
                                ]}
                                onPress={() => {
                                    setAuthMethod('password');
                                    setOtpSent(false);
                                    setOtp('');
                                }}
                            >
                                <Ionicons
                                    name="key-outline"
                                    size={20}
                                    color={authMethod === 'password' ? '#FFFFFF' : '#6B7280'}
                                />
                                <Text style={[
                                    styles.toggleText,
                                    authMethod === 'password' && styles.toggleTextActive
                                ]}>
                                    Password
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    authMethod === 'otp' && styles.toggleButtonActive
                                ]}
                                onPress={() => {
                                    setAuthMethod('otp');
                                    setPassword('');
                                }}
                            >
                                <Ionicons
                                    name="chatbox-ellipses-outline"
                                    size={20}
                                    color={authMethod === 'otp' ? '#FFFFFF' : '#6B7280'}
                                />
                                <Text style={[
                                    styles.toggleText,
                                    authMethod === 'otp' && styles.toggleTextActive
                                ]}>
                                    OTP
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Form */}
                        <View style={styles.form}>
                            {/* Identifier Input (Email/Phone) */}
                            <TextInputField
                                label="Email or Phone Number"
                                value={identifier}
                                onChangeText={setIdentifier}
                                placeholder="Enter email or phone"
                                icon={isEmail() ? 'mail-outline' : 'call-outline'}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            {/* Password Method */}
                            {authMethod === 'password' ? (
                                <>
                                    <View style={styles.passwordContainer}>
                                        <TextInputField
                                            label="Password"
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="Enter your password"
                                            icon="lock-closed-outline"
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color="#6B7280"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity style={styles.forgotPassword}>
                                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                    </TouchableOpacity>

                                    <PrimaryButton
                                        title="Login"
                                        onPress={handlePasswordLogin}
                                        loading={loading}
                                        disabled={!identifier || !password}
                                        style={styles.loginButton}
                                    />
                                </>
                            ) : (
                                <>
                                    {/* OTP Method */}
                                    {!otpSent ? (
                                        <PrimaryButton
                                            title="Send OTP"
                                            onPress={handleSendOTP}
                                            loading={loading}
                                            disabled={!identifier}
                                            style={styles.loginButton}
                                        />
                                    ) : (
                                        <>
                                            <Text style={styles.otpLabel}>Enter 6-digit OTP</Text>
                                            <OTPInput value={otp} onChange={setOtp} length={6} />

                                            <View style={styles.resendRow}>
                                                {timer > 0 ? (
                                                    <Text style={styles.timerText}>
                                                        Resend OTP in <Text style={styles.timerBold}>{timer}s</Text>
                                                    </Text>
                                                ) : (
                                                    <TouchableOpacity onPress={handleResendOTP}>
                                                        <Text style={styles.resendLink}>Resend OTP</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            <PrimaryButton
                                                title="Verify & Login"
                                                onPress={handleVerifyOTP}
                                                loading={loading}
                                                disabled={otp.length !== 6}
                                                style={styles.loginButton}
                                            />

                                            <TouchableOpacity
                                                style={styles.changeNumber}
                                                onPress={() => {
                                                    setOtpSent(false);
                                                    setOtp('');
                                                }}
                                            >
                                                <Text style={styles.changeNumberText}>Change Number</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Info Card */}
                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle" size={20} color="#3B82F6" />
                            <Text style={styles.infoText}>
                                {authMethod === 'password'
                                    ? 'You can set your password in Profile → Security settings'
                                    : 'OTP will be sent to your registered email or phone number'
                                }
                            </Text>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Don't have access?{' '}
                                <Text style={styles.footerLink}>Contact Admin</Text>
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 32,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 32,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
    },
    toggleButtonActive: {
        backgroundColor: '#3B82F6',
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
        marginLeft: 8,
    },
    toggleTextActive: {
        color: '#FFFFFF',
    },
    form: {
        marginBottom: 24,
    },
    passwordContainer: {
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 46,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -8,
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    otpLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    resendRow: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    resendLink: {
        fontSize: 15,
        color: '#3B82F6',
        fontWeight: '600',
    },
    timerText: {
        fontSize: 15,
        color: '#6B7280',
    },
    timerBold: {
        fontWeight: '600',
        color: '#111827',
    },
    changeNumber: {
        alignItems: 'center',
        marginTop: 16,
    },
    changeNumberText: {
        fontSize: 15,
        color: '#6B7280',
    },
    loginButton: {
        marginTop: 8,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#3B82F6',
        marginLeft: 12,
        lineHeight: 18,
    },
    footer: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    footerLink: {
        color: '#3B82F6',
        fontWeight: '600',
    },
});

export default LoginScreen;

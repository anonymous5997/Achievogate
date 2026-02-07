import { Ionicons } from '@expo/vector-icons';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import FloatingOrb from '../../components/motion/FloatingOrb';
import ScanFrame from '../../components/motion/ScanFrame';

// ... imports

const CinematicLoginScreen = () => {
    // ... state

    return (
        <CinematicBackground>
            {/* Background Orb Focus */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <View style={{ position: 'absolute', top: -100, left: -50 }}>
                    <FloatingOrb size={300} color={theme.colors.primary} />
                </View>
            </View>

            <ScanFrame active={loading} color={theme.colors.primary} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* 1. Cinematic Logo Reveal */}
                    <Animated.View entering={FadeInUp.duration(1000).springify()} style={styles.logoContainer}>
                        <View style={styles.iconGlow}>
                            <Ionicons name="shield-checkmark" size={64} color={theme.colors.primary} />
                            {/* Fingerprint Pulse Simulation if idle */}
                            {!loading && <FloatingOrb size={100} color={theme.colors.primary} duration={2000} />}
                        </View>
                        <Text style={styles.title}>ACHIEVOGATE</Text>
                        <Text style={styles.subtitle}>SECURE ACCESS SYSTEM</Text>

                        {isExpoGo && (
                            <View style={styles.devModeChip}>
                                <Ionicons name="code-slash" size={12} color="#fff" />
                                <Text style={styles.devModeText}>Expo Go - Dev Mode</Text>
                            </View>
                        )}
                    </Animated.View>

                    {/* 2. Main Auth Card */}
                    <Animated.View entering={ZoomIn.duration(800).delay(200)}>
                        <NeoCard style={styles.card}>

                            {/* Auth Switcher */}
                            {!isExpoGo && (
                                <View style={styles.switcher}>
                                    <TouchableOpacity
                                        onPress={() => setAuthMode('email')}
                                        style={[styles.switchBtn, authMode === 'email' && styles.switchBtnActive]}
                                    >
                                        <Text style={[styles.switchText, authMode === 'email' && { color: '#fff' }]}>Email</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={switchAuthMode}
                                        style={[styles.switchBtn, authMode === 'phone' && styles.switchBtnActive]}
                                    >
                                        <Text style={[styles.switchText, authMode === 'phone' && { color: '#fff' }]}>Phone</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Forms */}
                            {authMode === 'email' ? (
                                <Animated.View entering={FadeInDown.duration(400)}>
                                    <Text style={styles.headerText}>
                                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                                    </Text>

                                    <CinematicInput
                                        label="Email Address"
                                        icon={<Ionicons name="mail" size={20} color={theme.colors.primary} />}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />

                                    <CinematicInput
                                        label="Password"
                                        icon={<Ionicons name="lock-closed" size={20} color={theme.colors.secondary} />}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />

                                    {isSignUp && (
                                        <CinematicInput
                                            label="Phone (Optional)"
                                            icon={<Ionicons name="call" size={20} color={theme.colors.accent} />}
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                        />
                                    )}

                                    <NeonButton
                                        title={isSignUp ? 'Initialize Account' : 'Authenticate'}
                                        onPress={handleEmailAuth}
                                        loading={loading}
                                        icon={<Ionicons name="finger-print" size={20} color="#fff" style={{ marginRight: 8 }} />}
                                    />

                                    <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.footerLink}>
                                        <Text style={styles.linkText}>
                                            {isSignUp ? 'Already have credentials? Sign In' : 'New User? Initialize Account'}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            ) : (
                                <Animated.View entering={FadeInDown.duration(400)}>
                                    {step === 'input' ? (
                                        <>
                                            <Text style={styles.headerText}>Mobile Verification</Text>
                                            <CinematicInput
                                                label="Phone Number"
                                                icon={<Ionicons name="keypad" size={20} color={theme.colors.primary} />}
                                                value={phoneNumber}
                                                onChangeText={setPhoneNumber}
                                                keyboardType="phone-pad"
                                                placeholder="+91..."
                                            />
                                            <NeonButton
                                                title="Send Secure Code"
                                                onPress={() => handleSendOTP(false)}
                                                loading={loading}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.headerText}>Verify Identity</Text>
                                            <CinematicInput
                                                label="Enter OTP"
                                                icon={<Ionicons name="shield" size={20} color={theme.colors.success} />}
                                                value={otp}
                                                onChangeText={setOtp}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                            />
                                            <NeonButton
                                                title="Unlock Access"
                                                variant="success"
                                                onPress={handleVerifyOTP}
                                                loading={loading}
                                            />
                                            <View style={styles.otpFooter}>
                                                <TouchableOpacity onPress={() => handleSendOTP(true)} disabled={timer > 0}>
                                                    <Text style={[styles.linkText, timer > 0 && { color: theme.colors.text.muted }]}>
                                                        {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setStep('input')}>
                                                    <Text style={styles.linkText}>Change Number</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    )}
                                </Animated.View>
                            )}
                        </NeoCard>
                    </Animated.View>

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
        marginBottom: 40,
    },
    iconGlow: {
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        height: 100,
    },
    title: {
        ...theme.typography.h1,
        fontSize: 36,
        color: '#fff',
        textAlign: 'center',
        textShadowColor: theme.colors.primary,
        textShadowRadius: 10,
    },
    subtitle: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        letterSpacing: 6,
        marginTop: 8,
    },
    devModeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.5)',
    },
    devModeText: {
        color: '#F59E0B',
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 6,
    },
    card: {
        marginBottom: 20,
    },
    switcher: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    switchBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    switchBtnActive: {
        backgroundColor: theme.colors.primary,
    },
    switchText: {
        color: theme.colors.text.muted,
        fontWeight: '600',
        fontSize: 14,
    },
    headerText: {
        ...theme.typography.h2,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
    },
    footerLink: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        color: theme.colors.secondary,
        fontWeight: '600',
        fontSize: 14,
    },
    otpFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    }
});

export default CinematicLoginScreen;

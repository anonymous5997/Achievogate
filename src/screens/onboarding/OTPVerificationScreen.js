import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OTPInput from '../../components/onboarding/OTPInput';
import PrimaryButton from '../../components/onboarding/PrimaryButton';

const OTPVerificationScreen = ({ route, navigation }) => {
    const { name, email, mobile, countryCode } = route.params;
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleVerify = () => {
        // In production, verify OTP with backend
        navigation.navigate('CountrySelectionScreen', {
            name,
            email,
            mobile,
            countryCode,
        });
    };

    const handleResend = () => {
        setTimer(30);
        setCanResend(false);
        setOtp('');
        // Trigger resend OTP API
    };

    const maskedContact = email || `${countryCode} ${mobile}`;

    return (
        <SafeAreaView style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="mail-outline" size={48} color="#3B82F6" />
                </View>
                <Text style={styles.title}>Verify your account</Text>
                <Text style={styles.subtitle}>
                    We sent a 6-digit code to{'\n'}
                    <Text style={styles.contact}>{maskedContact}</Text>
                </Text>
            </View>

            {/* OTP Input */}
            <OTPInput value={otp} onChange={setOtp} />

            {/* Resend Timer */}
            <View style={styles.resendRow}>
                {canResend ? (
                    <TouchableOpacity onPress={handleResend}>
                        <Text style={styles.resendLink}>Resend Code</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.timerText}>
                        Resend code in <Text style={styles.timerBold}>{timer}s</Text>
                    </Text>
                )}
            </View>

            {/* Verify Button */}
            <PrimaryButton
                title="Verify"
                onPress={handleVerify}
                disabled={otp.length !== 6}
                style={styles.verifyButton}
            />

            {/* Change Contact */}
            <TouchableOpacity style={styles.changeContact} onPress={() => navigation.goBack()}>
                <Text style={styles.changeText}>Wrong contact? Change it</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        padding: 32,
        paddingTop: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    contact: {
        color: '#111827',
        fontWeight: '600',
    },
    resendRow: {
        alignItems: 'center',
        marginBottom: 32,
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
    verifyButton: {
        marginTop: 20,
    },
    changeContact: {
        alignItems: 'center',
        marginTop: 24,
    },
    changeText: {
        fontSize: 15,
        color: '#6B7280',
    },
});

export default OTPVerificationScreen;

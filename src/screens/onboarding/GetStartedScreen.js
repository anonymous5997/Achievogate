import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/onboarding/PrimaryButton';
import TextInputField from '../../components/onboarding/TextInputField';
import TrustInfoCard from '../../components/onboarding/TrustInfoCard';

const GetStartedScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [useMobile, setUseMobile] = useState(false);
    const [mobile, setMobile] = useState('');

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateMobile = (mobile) => {
        return mobile.length >= 10;
    };

    const isValid = useMobile ? validateMobile(mobile) : validateEmail(email);

    const handleContinue = () => {
        navigation.navigate('UserDetailsScreen', {
            email: useMobile ? null : email,
            mobile: useMobile ? mobile : null,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Let's Get Started</Text>
                        <Text style={styles.subtitle}>
                            Create your account to access your society features
                        </Text>
                    </View>

                    {/* Input Field */}
                    {useMobile ? (
                        <TextInputField
                            label="Mobile Number"
                            value={mobile}
                            onChangeText={setMobile}
                            placeholder="Enter your mobile number"
                            icon="call-outline"
                            keyboardType="phone-pad"
                        />
                    ) : (
                        <TextInputField
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            icon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    )}

                    {/* Toggle */}
                    <TouchableOpacity
                        style={styles.toggle}
                        onPress={() => setUseMobile(!useMobile)}
                    >
                        <Text style={styles.toggleText}>
                            {useMobile ? 'Use email instead' : 'Use mobile number instead'}
                        </Text>
                    </TouchableOpacity>

                    {/* Trust Card */}
                    <TrustInfoCard />

                    {/* CTA Button */}
                    <PrimaryButton
                        title="Continue"
                        onPress={handleContinue}
                        disabled={!isValid}
                    />

                    {/* Footer Links */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.link}>Terms of Service</Text>
                            {' '}and{' '}
                            <Text style={styles.link}>Privacy Policy</Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 32,
        paddingTop: 60,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    toggle: {
        marginTop: -8,
        marginBottom: 20,
    },
    toggleText: {
        fontSize: 15,
        color: '#3B82F6',
        fontWeight: '600',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
    },
    link: {
        color: '#3B82F6',
        fontWeight: '600',
    },
});

export default GetStartedScreen;

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/onboarding/PrimaryButton';
import TextInputField from '../../components/onboarding/TextInputField';

const UserDetailsScreen = ({ route, navigation }) => {
    const { email, mobile } = route.params;
    const [name, setName] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [mobileNumber, setMobileNumber] = useState(mobile || '');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const isValid = name.trim().length >= 2 && mobileNumber.length >= 10 && termsAccepted;

    const handleSubmit = () => {
        navigation.navigate('OTPVerificationScreen', {
            name,
            email,
            countryCode,
            mobile: mobileNumber,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Back Button */}
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Tell us about yourself</Text>
                        <Text style={styles.subtitle}>We'll use this to set up your profile</Text>
                    </View>

                    {/* Name Input */}
                    <TextInputField
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your full name"
                        icon="person-outline"
                    />

                    {/* Country Code + Mobile */}
                    <Text style={styles.label}>Mobile Number</Text>
                    <View style={styles.phoneRow}>
                        <TouchableOpacity style={styles.countryCodeButton}>
                            <Text style={styles.countryCodeText}>{countryCode}</Text>
                            <Ionicons name="chevron-down" size={16} color="#6B7280" />
                        </TouchableOpacity>

                        <View style={styles.mobileInputContainer}>
                            <TextInputField
                                value={mobileNumber}
                                onChangeText={setMobileNumber}
                                placeholder="Mobile number"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Terms Checkbox */}
                    <TouchableOpacity
                        style={styles.checkboxRow}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                    >
                        <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                            {termsAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                        </View>
                        <Text style={styles.checkboxText}>
                            I agree to the{' '}
                            <Text style={styles.link}>Terms & Conditions</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <PrimaryButton
                        title="Continue"
                        onPress={handleSubmit}
                        disabled={!isValid}
                        style={styles.submitButton}
                    />
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
        paddingTop: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    phoneRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    countryCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        marginRight: 12,
        height: 56,
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginRight: 4,
    },
    mobileInputContainer: {
        flex: 1,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    checkboxText: {
        flex: 1,
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    link: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    submitButton: {
        marginTop: 20,
    },
});

export default UserDetailsScreen;

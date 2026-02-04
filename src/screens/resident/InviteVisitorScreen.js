import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
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
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import GlassCard from '../../components/GlassCard';
import useAuth from '../../hooks/useAuth';
import visitorService from '../../services/visitorService';
import theme from '../../theme/theme';

const InviteVisitorScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        visitorName: '',
        visitorPhone: '',
        purpose: '',
    });

    const handleInvite = async () => {
        if (!formData.visitorName || !formData.visitorPhone) {
            return Alert.alert('Error', 'Please enter visitor name and phone number');
        }

        setLoading(true);
        const result = await visitorService.createPreRegistration(
            userProfile.flatNumber,
            formData,
            userProfile.id
        );
        setLoading(false);

        if (result.success) {
            Alert.alert(
                'Success',
                'Visitor invited! They can now enter easily at the gate.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } else {
            Alert.alert('Error', result.error || 'Failed to invite visitor');
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Invite a Visitor"
                    subTitle="Pre-register a guest for easy entry"
                    leftAction={
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={20} color={theme.colors.text.secondary} />
                        </TouchableOpacity>
                    }
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <ScrollView contentContainerStyle={styles.content}>
                        <GlassCard style={styles.card}>
                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                                <Text style={styles.infoText}>
                                    Invited visitors can enter quickly without waiting for approval
                                </Text>
                            </View>

                            {/* Visitor Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Visitor Name *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="person" size={20} color={theme.colors.secondary} style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter full name"
                                        placeholderTextColor={theme.colors.text.muted}
                                        value={formData.visitorName}
                                        onChangeText={(text) => setFormData({ ...formData, visitorName: text })}
                                    />
                                </View>
                            </View>

                            {/* Phone Number */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number *</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="call" size={20} color={theme.colors.secondary} style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="+91 99999 99999"
                                        placeholderTextColor={theme.colors.text.muted}
                                        value={formData.visitorPhone}
                                        onChangeText={(text) => setFormData({ ...formData, visitorPhone: text })}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            {/* Purpose */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Purpose (Optional)</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="document-text" size={20} color={theme.colors.secondary} style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., Family visit, Delivery"
                                        placeholderTextColor={theme.colors.text.muted}
                                        value={formData.purpose}
                                        onChangeText={(text) => setFormData({ ...formData, purpose: text })}
                                    />
                                </View>
                            </View>

                            {/* Submit Button */}
                            <CinematicButton
                                title={loading ? 'Sending Invitation...' : 'Send Invitation'}
                                onPress={handleInvite}
                                disabled={loading}
                                style={{ marginTop: 24 }}
                                icon={<Ionicons name="send" size={18} color="#fff" />}
                            />
                        </GlassCard>
                    </ScrollView>
                </KeyboardAvoidingView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    backBtn: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
    },
    card: {
        padding: 24,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
        gap: 8,
    },
    infoText: {
        flex: 1,
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontSize: 13,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        ...theme.typography.body1,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: theme.layout.buttonRadius,
        height: 56,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: theme.colors.text.primary,
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        fontWeight: '500',
    },
});

export default InviteVisitorScreen;

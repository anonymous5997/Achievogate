import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import visitorService from '../../services/visitorService';
import theme from '../../theme/theme';

const PriorInviteScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [visitorDetails, setVisitorDetails] = useState(null);

    const handleScanQR = () => {
        // In a real app, integrate with barcode scanner
        Alert.alert('QR Scanner', 'QR code scanning would be implemented here using expo-barcode-scanner');
    };

    const handleSearchCode = async () => {
        if (!inviteCode.trim()) {
            Alert.alert('Error', 'Please enter an invite code');
            return;
        }

        setLoading(true);
        try {
            // Search for pre-registration by code/phone
            // For now, we search by phone number as code
            const result = await visitorService.getPreRegistrationByPhone(inviteCode);

            if (result.success && result.preRegistration) {
                setVisitorDetails(result.preRegistration);
            } else {
                Alert.alert('Not Found', 'No pre-registered visitor found with this code');
                setVisitorDetails(null);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to find visitor');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!visitorDetails) return;

        Alert.alert(
            'Confirm Check-in',
            `Check in ${visitorDetails.visitorName} for flat ${visitorDetails.flatNumber}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Check In',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // Mark pre-registration as used
                            await visitorService.markPreRegistrationUsed(visitorDetails.id);

                            // Create visitor entry
                            await visitorService.createVisitor({
                                visitorName: visitorDetails.visitorName,
                                visitorPhone: visitorDetails.visitorPhone,
                                purpose: visitorDetails.purpose,
                                flatNumber: visitorDetails.flatNumber,
                                imageUrl: '', // No photo for prior invites
                                status: 'approved', // Auto-approved
                                guardId: userProfile.id,
                                preRegistered: true,
                            });

                            Alert.alert('Success', 'Visitor checked in successfully', [
                                {
                                    text: 'OK', onPress: () => {
                                        setVisitorDetails(null);
                                        setInviteCode('');
                                        navigation.goBack();
                                    }
                                }
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to check in visitor');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Prior Invite"
                    subTitle="Scan or enter invite code"
                    onBack={() => navigation.goBack()}
                />

                <ScrollView contentContainerStyle={styles.content}>

                    {/* QR Scanner Card */}
                    <AnimatedCard3D index={0}>
                        <View style={styles.scannerContainer}>
                            <View style={styles.qrPlaceholder}>
                                <Ionicons name="qr-code" size={80} color={theme.colors.text.muted} />
                            </View>
                            <CinematicButton
                                title="Scan QR Code"
                                icon={<Ionicons name="scan" size={18} color="#fff" />}
                                onPress={handleScanQR}
                                style={{ marginTop: 20 }}
                            />
                        </View>
                    </AnimatedCard3D>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Manual Entry Card */}
                    <AnimatedCard3D index={1}>
                        <Text style={styles.cardTitle}>Enter Invite Code</Text>
                        <Text style={styles.cardSubtitle}>Enter the visitor's phone number or invite code</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="ticket-outline" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. +91 9999999999"
                                value={inviteCode}
                                onChangeText={setInviteCode}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <CinematicButton
                            title="Search"
                            variant="outline"
                            onPress={handleSearchCode}
                            loading={loading}
                        />
                    </AnimatedCard3D>

                    {/* Visitor Details Card */}
                    {visitorDetails && (
                        <AnimatedCard3D index={2} style={styles.detailsCard}>
                            <View style={styles.detailsHeader}>
                                <View style={styles.successIcon}>
                                    <Ionicons name="checkmark-circle" size={48} color={theme.colors.status.approved} />
                                </View>
                                <Text style={styles.detailsTitle}>Visitor Found!</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="person" size={20} color={theme.colors.text.muted} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Visitor Name</Text>
                                    <Text style={styles.detailValue}>{visitorDetails.visitorName}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="call" size={20} color={theme.colors.text.muted} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Phone</Text>
                                    <Text style={styles.detailValue}>{visitorDetails.visitorPhone}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="home" size={20} color={theme.colors.text.muted} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Flat Number</Text>
                                    <Text style={styles.detailValue}>{visitorDetails.flatNumber}</Text>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="document-text" size={20} color={theme.colors.text.muted} />
                                <View style={styles.detailContent}>
                                    <Text style={styles.detailLabel}>Purpose</Text>
                                    <Text style={styles.detailValue}>{visitorDetails.purpose}</Text>
                                </View>
                            </View>

                            <CinematicButton
                                title="Check In Visitor"
                                onPress={handleCheckIn}
                                loading={loading}
                                style={{ marginTop: 20 }}
                            />
                        </AnimatedCard3D>
                    )}

                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 24 },

    // Scanner
    scannerContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    qrPlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        ...theme.typography.caption,
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text.muted,
        marginHorizontal: 16,
    },

    // Card
    cardTitle: {
        ...theme.typography.h3,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    cardSubtitle: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.muted,
        marginBottom: 20,
    },

    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: theme.colors.text.primary,
    },

    // Details Card
    detailsCard: {
        marginTop: 20,
    },
    detailsHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    successIcon: {
        marginBottom: 12,
    },
    detailsTitle: {
        ...theme.typography.h2,
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        marginBottom: 10,
    },
    detailContent: {
        marginLeft: 12,
        flex: 1,
    },
    detailLabel: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.text.muted,
        marginBottom: 2,
    },
    detailValue: {
        ...theme.typography.body1,
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
});

export default PriorInviteScreen;

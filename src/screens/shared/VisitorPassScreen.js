import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import qrCodeService from '../../services/qrCodeService';
import theme from '../../theme/theme';

const VisitorPassScreen = ({ route, navigation }) => {
    const { invite } = route.params || {};
    const [pass, setPass] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qrData, setQrData] = useState('');

    useEffect(() => {
        generatePass();
    }, []);

    const generatePass = async () => {
        setLoading(true);
        try {
            // Create a digital pass for this invite
            const validUntil = new Date();
            validUntil.setHours(validUntil.getHours() + 24); // Valid for 24 hours

            const result = await qrCodeService.createPass({
                visitorName: invite.visitorName,
                visitorPhone: invite.visitorPhone,
                flatNumber: invite.flatNumber,
                residentId: invite.residentId,
                residentName: invite.residentName,
                purpose: invite.purpose,
                validUntil: validUntil,
                maxScans: 1, // One-time entry
            });

            if (result.success) {
                setPass(result.pass);
                // Generate QR data
                const qr = qrCodeService.generateQRData(result.passId, result.pass.token);
                setQrData(qr);
            } else {
                Alert.alert('Error', result.error || 'Failed to generate pass');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate pass');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <CinematicBackground />
                <CinematicHeader
                    title="Generating Pass"
                    leftIcon="arrow-back"
                    onLeftPress={() => navigation.goBack()}
                />
                <View style={styles.loadingContainer}>
                    <Ionicons name="hourglass" size={48} color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Generating digital pass...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CinematicBackground />

            <CinematicHeader
                title="Visitor Pass"
                subtitle="Show this QR to guard"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                {/* QR Code Card */}
                <AnimatedCard3D style={styles.qrCard}>
                    <View style={styles.qrContainer}>
                        {qrData ? (
                            <QRCode
                                value={qrData}
                                size={220}
                                backgroundColor="white"
                                color={theme.colors.text.primary}
                            />
                        ) : (
                            <Ionicons name="qr-code" size={220} color={theme.colors.text.muted} />
                        )}
                    </View>

                    <View style={styles.passIdContainer}>
                        <Text style={styles.passIdLabel}>Pass ID</Text>
                        <Text style={styles.passId}>{pass?.passId || 'N/A'}</Text>
                    </View>
                </AnimatedCard3D>

                {/* Visitor Details */}
                <AnimatedCard3D style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Visitor Information</Text>

                    <View style={styles.detailRow}>
                        <Ionicons name="person" size={20} color={theme.colors.primary} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Name</Text>
                            <Text style={styles.detailValue}>{pass?.visitorName || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="call" size={20} color={theme.colors.primary} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Phone</Text>
                            <Text style={styles.detailValue}>{pass?.visitorPhone || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="home" size={20} color={theme.colors.primary} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Visiting</Text>
                            <Text style={styles.detailValue}>{pass?.flatNumber || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="document-text" size={20} color={theme.colors.primary} />
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Purpose</Text>
                            <Text style={styles.detailValue}>{pass?.purpose || 'N/A'}</Text>
                        </View>
                    </View>
                </AnimatedCard3D>

                {/* Validity Info */}
                <AnimatedCard3D style={styles.validityCard}>
                    <View style={styles.validityHeader}>
                        <Ionicons name="time" size={24} color={theme.colors.status.approved} />
                        <Text style={styles.validityTitle}>Pass Validity</Text>
                    </View>

                    <View style={styles.validityRow}>
                        <Text style={styles.validityLabel}>Valid From:</Text>
                        <Text style={styles.validityValue}>{formatTime(pass?.validFrom)}</Text>
                    </View>

                    <View style={styles.validityRow}>
                        <Text style={styles.validityLabel}>Valid Until:</Text>
                        <Text style={styles.validityValue}>{formatTime(pass?.validUntil)}</Text>
                    </View>

                    <View style={styles.validityRow}>
                        <Text style={styles.validityLabel}>Scans Remaining:</Text>
                        <Text style={styles.validityValue}>
                            {pass?.maxScans === -1 ? 'Unlimited' : `${pass?.maxScans - pass?.scansUsed || 0}`}
                        </Text>
                    </View>
                </AnimatedCard3D>

                {/* Instructions */}
                <AnimatedCard3D style={styles.instructionsCard}>
                    <View style={styles.instructionsHeader}>
                        <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                        <Text style={styles.instructionsTitle}>Instructions</Text>
                    </View>
                    <Text style={styles.instructionText}>
                        1. Show this QR code to the security guard at the gate
                    </Text>
                    <Text style={styles.instructionText}>
                        2. Guard will scan the code to verify your entry
                    </Text>
                    <Text style={styles.instructionText}>
                        3. Pass is valid for one-time entry only
                    </Text>
                    <Text style={styles.instructionText}>
                        4. If QR doesn't work, provide Pass ID to guard
                    </Text>
                </AnimatedCard3D>

                {/* Offline Code */}
                <AnimatedCard3D style={styles.offlineCard}>
                    <Text style={styles.offlineTitle}>Offline Backup Code</Text>
                    <Text style={styles.offlineCode}>
                        {qrCodeService.generateOfflineCode()}
                    </Text>
                    <Text style={styles.offlineHint}>
                        Use this code if QR scanner is unavailable
                    </Text>
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
        padding: theme.spacing.container,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        ...theme.typography.body1,
        marginTop: 16,
        color: theme.colors.text.secondary,
    },
    qrCard: {
        padding: 24,
        alignItems: 'center',
        marginBottom: 16,
    },
    qrContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
    },
    passIdContainer: {
        alignItems: 'center',
    },
    passIdLabel: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.text.muted,
        marginBottom: 4,
    },
    passId: {
        ...theme.typography.h3,
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text.primary,
        letterSpacing: 1,
    },
    detailsCard: {
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        ...theme.typography.h2,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    detailContent: {
        flex: 1,
        marginLeft: 12,
    },
    detailLabel: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.text.muted,
        marginBottom: 2,
    },
    detailValue: {
        ...theme.typography.body1,
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    validityCard: {
        padding: 20,
        marginBottom: 16,
        backgroundColor: '#F0FDF4',
        borderColor: theme.colors.status.approved,
    },
    validityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    validityTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginLeft: 8,
    },
    validityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    validityLabel: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    validityValue: {
        ...theme.typography.body1,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    instructionsCard: {
        padding: 20,
        marginBottom: 16,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    instructionsTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginLeft: 8,
    },
    instructionText: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 8,
        lineHeight: 20,
    },
    offlineCard: {
        padding: 20,
        marginBottom: 32,
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
    },
    offlineTitle: {
        ...theme.typography.body1,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 8,
    },
    offlineCode: {
        ...theme.typography.h1,
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text.primary,
        letterSpacing: 4,
        marginBottom: 8,
    },
    offlineHint: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.text.muted,
        textAlign: 'center',
    },
});

export default VisitorPassScreen;

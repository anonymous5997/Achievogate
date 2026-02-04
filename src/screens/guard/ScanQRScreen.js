import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import notificationService from '../../services/notificationService';
import qrCodeService from '../../services/qrCodeService';
import visitorService from '../../services/visitorService';
import theme from '../../theme/theme';

const ScanQRScreen = ({ navigation }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scanning, setScanning] = useState(true);
    const [passData, setPassData] = useState(null);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanned) return;

        setScanned(true);
        setScanning(false);

        try {
            // Parse QR data
            const parseResult = qrCodeService.parseQRData(data);

            if (!parseResult.success) {
                Alert.alert('Invalid QR Code', parseResult.error);
                resetScanner();
                return;
            }

            // Validate and scan the pass
            const scanResult = await qrCodeService.scanPass(parseResult.passId);

            if (!scanResult.success) {
                Alert.alert('Pass Invalid', scanResult.error);
                resetScanner();
                return;
            }

            // Show pass details
            setPassData(scanResult.pass);

            // Auto-create visitor entry
            await createVisitorEntry(scanResult.pass);

        } catch (error) {
            Alert.alert('Scan Error', 'Failed to process QR code');
            console.error(error);
            resetScanner();
        }
    };

    const createVisitorEntry = async (pass) => {
        try {
            // Create approved visitor entry
            const result = await visitorService.createVisitor({
                visitorName: pass.visitorName,
                visitorPhone: pass.visitorPhone,
                flatNumber: pass.flatNumber,
                purpose: pass.purpose,
                status: 'approved',
                checkInMethod: 'qr_code',
                passId: pass.passId,
            });

            if (result.success) {
                // Send notification to resident
                const notification = notificationService.visitorArrived(
                    pass.visitorName,
                    pass.flatNumber
                );
                await notificationService.sendLocalNotification(
                    notification.title,
                    notification.body,
                    notification.data
                );
            }
        } catch (error) {
            console.error('Failed to create visitor entry:', error);
        }
    };

    const resetScanner = () => {
        setTimeout(() => {
            setScanned(false);
            setScanning(true);
            setPassData(null);
        }, 2000);
    };

    const handleCheckIn = () => {
        Alert.alert(
            'Check-in Successful',
            `${passData?.visitorName} has been checked in`,
            [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <CinematicBackground />
                <View style={styles.centerContainer}>
                    <Text style={styles.messageText}>Requesting camera permission...</Text>
                </View>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <CinematicBackground />
                <CinematicHeader
                    title="No Camera Access"
                    leftIcon="arrow-back"
                    onLeftPress={() => navigation.goBack()}
                />
                <View style={styles.centerContainer}>
                    <Ionicons name="camera-off" size={64} color={theme.colors.text.muted} />
                    <Text style={styles.messageText}>
                        Camera permission is required to scan QR codes
                    </Text>
                    <TouchableOpacity
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CinematicBackground />

            <CinematicHeader
                title="Scan Visitor Pass"
                subtitle="Point camera at QR code"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <View style={styles.cameraContainer}>
                {scanning && (
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                    >
                        <View style={styles.overlay}>
                            <View style={styles.scanFrame}>
                                <View style={[styles.corner, styles.cornerTopLeft]} />
                                <View style={[styles.corner, styles.cornerTopRight]} />
                                <View style={[styles.corner, styles.cornerBottomLeft]} />
                                <View style={[styles.corner, styles.cornerBottomRight]} />
                            </View>
                            <Text style={styles.scanText}>
                                {scanned ? 'Processing...' : 'Align QR code within frame'}
                            </Text>
                        </View>
                    </CameraView>
                )}

                {passData && (
                    <View style={styles.resultContainer}>
                        <AnimatedCard3D style={styles.resultCard}>
                            <View style={styles.successHeader}>
                                <Ionicons name="checkmark-circle" size={48} color={theme.colors.status.approved} />
                                <Text style={styles.successTitle}>Pass Verified!</Text>
                            </View>

                            <View style={styles.passDetails}>
                                <View style={styles.passRow}>
                                    <Text style={styles.passLabel}>Visitor:</Text>
                                    <Text style={styles.passValue}>{passData.visitorName}</Text>
                                </View>
                                <View style={styles.passRow}>
                                    <Text style={styles.passLabel}>Phone:</Text>
                                    <Text style={styles.passValue}>{passData.visitorPhone}</Text>
                                </View>
                                <View style={styles.passRow}>
                                    <Text style={styles.passLabel}>Visiting:</Text>
                                    <Text style={styles.passValue}>{passData.flatNumber}</Text>
                                </View>
                                <View style={styles.passRow}>
                                    <Text style={styles.passLabel}>Purpose:</Text>
                                    <Text style={styles.passValue}>{passData.purpose}</Text>
                                </View>
                                <View style={styles.passRow}>
                                    <Text style={styles.passLabel}>Scans Used:</Text>
                                    <Text style={styles.passValue}>
                                        {passData.scansUsed} / {passData.maxScans === -1 ? '∞' : passData.maxScans}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.checkInButton}
                                onPress={handleCheckIn}
                            >
                                <Text style={styles.checkInText}>Check In Visitor</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>
                        </AnimatedCard3D>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    messageText: {
        ...theme.typography.body1,
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: 16,
    },
    permissionButton: {
        marginTop: 24,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    cameraContainer: {
        flex: 1,
        margin: theme.spacing.container,
        borderRadius: 16,
        overflow: 'hidden',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#fff',
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    scanText: {
        ...theme.typography.body1,
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginTop: 24,
        textAlign: 'center',
    },
    resultContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        padding: 24,
    },
    resultCard: {
        padding: 24,
    },
    successHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        ...theme.typography.h1,
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginTop: 12,
    },
    passDetails: {
        marginBottom: 24,
    },
    passRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    passLabel: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    passValue: {
        ...theme.typography.body1,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    checkInButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    checkInText: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginRight: 8,
    },
});

export default ScanQRScreen;

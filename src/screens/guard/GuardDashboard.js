import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import GuardAttendanceCard from '../../components/GuardAttendanceCard';
import FloatingOrb from '../../components/motion/FloatingOrb';
import NeoCard from '../../components/NeoCard';
import NeonButton from '../../components/NeonButton';
import NetworkStatusBanner from '../../components/NetworkStatusBanner';
import useAuth from '../../hooks/useAuth';
import useVisitors from '../../hooks/useVisitors';
import gatePassService from '../../services/gatePassService';
import theme from '../../theme/theme';

const GuardActionCard = ({ icon, title, subtitle, color, onPress, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <NeoCard style={styles.actionCard} glass={true}>
                <View style={[styles.actionIconContainer, { backgroundColor: `${color}20`, borderColor: color }]}>
                    <Ionicons name={icon} size={28} color={color} />
                </View>
                <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{title}</Text>
                    <Text style={styles.actionSubtitle}>{subtitle}</Text>
                </View>
                <View style={[styles.arrowContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
                </View>
            </NeoCard>
        </TouchableOpacity>
    </Animated.View>
);

const StatBox = ({ label, value, color, delay }) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.statBoxContainer}>
        <NeoCard style={styles.statBox} glass={true} padding={12}>
            <Text style={[styles.statValue, { color: color, textShadowColor: color, textShadowRadius: 10 }]}>
                {value}
            </Text>
            <Text style={styles.statLabel}>{label}</Text>
        </NeoCard>
    </Animated.View>
);

const GuardDashboard = ({ navigation }) => {
    const { userProfile, signOut } = useAuth();
    const { visitors, pendingVisitors, approvedVisitors } = useVisitors('guard', userProfile?.id);

    // OTP Modal State
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setVerifying(true);
        const res = await gatePassService.verifyPass(userProfile.societyId, otp);
        setVerifying(false);

        if (res.success) {
            Alert.alert('Success', 'Gate Pass Verified!', [
                {
                    text: 'Register Entry',
                    onPress: () => {
                        setOtpModalVisible(false);
                        setOtp('');
                        navigation.navigate('CreateVisitor', {
                            prefill: {
                                name: res.pass.visitorName,
                                flat: res.pass.flatNumber,
                                type: 'Guest'
                            }
                        });
                    }
                }
            ]);
        } else {
            Alert.alert('Verification Failed', res.error);
        }
    };

    const actions = [
        {
            id: 'verify-pass',
            icon: 'scan',
            title: 'Verify Gate Pass',
            subtitle: 'Scan QR or Enter OTP',
            color: '#10B981', // Emerald
            onPress: () => setOtpModalVisible(true),
        },
        {
            id: 'new-visitor',
            icon: 'person-add',
            title: 'New Visitor',
            subtitle: 'Register Guest / Delivery',
            color: '#3B82F6', // Blue
            onPress: () => navigation.navigate('CreateVisitor'),
        },
        {
            id: 'parcel-entry',
            icon: 'cube',
            title: 'Parcel Entry',
            subtitle: 'Log Incoming Package',
            color: '#F59E0B', // Amber
            onPress: () => navigation.navigate('ParcelEntryScreen'),
        },
        {
            id: 'view-notices',
            icon: 'megaphone',
            title: 'Notice Board',
            subtitle: 'Society Announcements',
            color: '#EF4444', // Red
            onPress: () => navigation.navigate('ViewNoticesScreen'),
        },
    ];

    return (
        <CinematicBackground>
            <StatusBar barStyle="light-content" />
            <NetworkStatusBanner />

            <CinematicHeader
                title="COMMAND CENTER"
                subTitle={`Officer ${userProfile?.name?.split(' ')[0] || ''}`}
                leftAction={
                    <View style={styles.badgeContainer}>
                        <View style={StyleSheet.absoluteFill} pointerEvents="none">
                            <View style={{ position: 'absolute', top: -10, left: -10 }}>
                                <FloatingOrb size={50} color={theme.colors.status.success} duration={1000} />
                            </View>
                        </View>
                        <Ionicons name="shield" size={16} color={theme.colors.primary} />
                        <Text style={styles.badgeText}>ACTIVE</Text>
                    </View>
                }
                rightAction={
                    <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                        <Ionicons name="power" size={20} color="#EF4444" />
                    </TouchableOpacity>
                }
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Attendance - Needs update to match theme inside component, but wrapper is okay */}
                <View style={styles.section}>
                    <GuardAttendanceCard />
                </View>

                {/* Live Stats */}
                <View style={styles.statsRow}>
                    <StatBox label="PENDING" value={pendingVisitors.length} color="#F59E0B" delay={100} />
                    <StatBox label="APPROVED" value={approvedVisitors.length} color="#10B981" delay={200} />
                    <StatBox label="TOTAL" value={visitors.length} color="#3B82F6" delay={300} />
                </View>

                {/* Tactical Actions */}
                <Text style={styles.sectionTitle}>OPERATIONS</Text>
                <View style={styles.grid}>
                    {actions.map((action, index) => (
                        <GuardActionCard
                            key={action.id}
                            {...action}
                            index={index}
                        />
                    ))}
                </View>

                {/* Quick Links */}
                <Animated.View entering={FadeInUp.delay(600)}>
                    <NeoCard style={styles.quickLinkCard} glass={true}>
                        <TouchableOpacity
                            style={styles.quickLinkContent}
                            onPress={() => navigation.navigate('VisitorList')}
                        >
                            <View style={styles.quickIcon}>
                                <Ionicons name="list" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.quickTitle}>Visitor Log</Text>
                                <Text style={styles.quickSubtitle}>View full history</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color={theme.colors.text.muted} />
                        </TouchableOpacity>
                    </NeoCard>
                </Animated.View>

            </ScrollView>

            {/* OTP Modal */}
            <Modal
                visible={otpModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setOtpModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <LinearGradient
                            colors={['#1E293B', '#0F172A']}
                            style={styles.modalContent}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>VERIFY PASS</Text>
                                <TouchableOpacity onPress={() => setOtpModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={theme.colors.text.muted} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.otpForm}>
                                <Text style={styles.otpLabel}>ENTER 6-DIGIT CODE</Text>
                                <TextInput
                                    style={styles.otpInput}
                                    value={otp}
                                    onChangeText={setOtp}
                                    placeholder="000000"
                                    placeholderTextColor="#475569"
                                    keyboardType="numeric"
                                    maxLength={6}
                                    autoFocus
                                />
                                <NeonButton
                                    title="VERIFY ACCESS"
                                    onPress={handleVerifyOtp}
                                    loading={verifying}
                                    variant="primary"
                                />
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>

        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.4)',
        gap: 4,
    },
    badgeText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    logoutBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    section: {
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statBoxContainer: {
        flex: 1,
    },
    statBox: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', // Tactical look
    },
    statLabel: {
        fontSize: 10,
        color: theme.colors.text.muted,
        fontWeight: '700',
        letterSpacing: 1,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.secondary,
        marginBottom: 16,
        letterSpacing: 2,
    },
    grid: {
        gap: 16,
        marginBottom: 32,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        color: '#F8FAFC',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    actionSubtitle: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickLinkCard: {
        marginBottom: 20,
    },
    quickLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    quickIcon: {
        marginRight: 16,
    },
    quickTitle: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    quickSubtitle: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalContent: {
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 2,
    },
    otpForm: {
        gap: 16,
    },
    otpLabel: {
        color: theme.colors.text.muted,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textAlign: 'center',
    },
    otpInput: {
        backgroundColor: '#0F172A',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: 12,
        color: theme.colors.primary,
        fontSize: 32,
        fontWeight: '800',
        textAlign: 'center',
        padding: 16,
        letterSpacing: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        marginBottom: 16,
    },
});

export default GuardDashboard;

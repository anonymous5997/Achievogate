import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import gatePassService from '../../services/gatePassService';
import theme from '../../theme/theme';

const GatePassScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [passes, setPasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        visitorName: '',
        expectedTime: new Date().toISOString(), // Simplified for now
    });

    useFocusEffect(
        useCallback(() => {
            loadPasses();
        }, [])
    );

    const loadPasses = async () => {
        if (!userProfile?.id) return;
        setLoading(true);
        const res = await gatePassService.getMyPasses(userProfile.id);
        if (res.success) {
            setPasses(res.passes);
        }
        setLoading(false);
    };

    const handleGenerate = async () => {
        if (!formData.visitorName) {
            Alert.alert('Error', 'Please enter visitor name');
            return;
        }

        const passData = {
            societyId: userProfile.societyId,
            flatNumber: userProfile.flatNumber,
            visitorName: formData.visitorName,
            expectedTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Valid for 24h
            createdBy: userProfile.id,
        };

        const res = await gatePassService.generatePass(passData);
        if (res.success) {
            Alert.alert('Success', 'Gate Pass Generated!');
            setModalVisible(false);
            setFormData({ visitorName: '', expectedTime: '' });
            loadPasses();
        } else {
            Alert.alert('Error', res.error);
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Gate Pass"
                    subTitle="Manage Entry Passes"
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                            <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={styles.list}>
                    {passes.length === 0 && !loading && (
                        <AnimatedCard3D>
                            <View style={styles.emptyState}>
                                <Ionicons name="qr-code-outline" size={64} color={theme.colors.text.muted} />
                                <Text style={styles.emptyTitle}>No Active Passes</Text>
                                <Text style={styles.emptySubtitle}>Create a pass for upcoming guests</Text>
                                <CinematicButton
                                    title="Create Pass"
                                    onPress={() => setModalVisible(true)}
                                    style={{ marginTop: 20, width: '100%' }}
                                />
                            </View>
                        </AnimatedCard3D>
                    )}

                    {passes.map((pass, index) => (
                        <AnimatedCard3D key={pass.id} index={index} style={styles.card}>
                            <View style={styles.passHeader}>
                                <View>
                                    <Text style={styles.visitorName}>{pass.visitorName}</Text>
                                    <Text style={styles.validity}>Expires: {new Date(pass.createdAt?.toDate ? pass.createdAt.toDate().getTime() + 24 * 60 * 60 * 1000 : Date.now()).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.otpBadge}>
                                    <Text style={styles.otpLabel}>OTP</Text>
                                    <Text style={styles.otpText}>{pass.otp}</Text>
                                </View>
                            </View>

                            <View style={styles.qrContainer}>
                                <QRCode value={pass.otp} size={150} />
                            </View>

                            <Text style={styles.instruction}>
                                Share this QR Code or OTP with your guest.
                            </Text>
                        </AnimatedCard3D>
                    ))}
                </ScrollView>

                {/* Create Pass Modal */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Gate Pass</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close-circle" size={28} color={theme.colors.text.muted} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.form}>
                                <Text style={styles.label}>Visitor Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.visitorName}
                                    onChangeText={(text) => setFormData({ ...formData, visitorName: text })}
                                    placeholder="e.g., John Doe"
                                />

                                <Text style={styles.subLabel}>Pass will be valid for 24 hours.</Text>

                                <CinematicButton
                                    title="Generate Pass"
                                    onPress={handleGenerate}
                                    style={{ marginTop: 24 }}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    addBtn: { padding: 4 },
    list: { padding: 24, paddingBottom: 100 },
    card: { marginBottom: 20, alignItems: 'center' },

    passHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    visitorName: { ...theme.typography.h3, fontSize: 18, color: theme.colors.text.primary },
    validity: { ...theme.typography.caption, color: theme.colors.text.muted },

    otpBadge: {
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    otpLabel: { fontSize: 10, color: theme.colors.text.muted, textTransform: 'uppercase', fontWeight: '700' },
    otpText: { fontSize: 18, fontWeight: '800', color: theme.colors.primary, letterSpacing: 1 },

    qrContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 16,
    },
    instruction: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
        textAlign: 'center',
    },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { ...theme.typography.h2, marginTop: 16 },
    emptySubtitle: { ...theme.typography.body1, color: theme.colors.text.muted, marginBottom: 24 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    modalTitle: { ...theme.typography.h2, fontSize: 20 },
    form: { padding: 24 },
    label: { ...theme.typography.h3, fontSize: 14, marginBottom: 8 },
    input: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    subLabel: { fontSize: 12, color: theme.colors.text.muted, marginTop: 8 },
});

export default GatePassScreen;

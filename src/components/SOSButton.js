import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useAuth from '../hooks/useAuth';
import incidentService from '../services/incidentService';
import theme from '../theme/theme';

const SOSButton = ({ style }) => {
    const { userProfile } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [sending, setSending] = useState(false);

    const handlePress = () => {
        setModalVisible(true);
    };

    const confirmSos = async (type) => {
        setSending(true);
        const res = await incidentService.raiseSos({
            societyId: userProfile.societyId,
            type,
            description: `Emergency: ${type.toUpperCase()} Alert`,
            reportedBy: userProfile.id,
            reportedByName: userProfile.name,
            contactPhone: userProfile.phone || 'N/A',
            location: `Flat ${userProfile.flatNumber || 'Unknown'}`
        });
        setSending(false);
        setModalVisible(false);

        if (res.success) {
            Alert.alert('SOS SENT', 'Security and Admins have been alerted. Help is on the way.', [{ text: 'OK' }]);
        } else {
            Alert.alert('Failed', 'Could not send SOS. Please call security directly.');
        }
    };

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                style={[styles.container, style]}
            >
                <View style={[styles.innerCircle]}>
                    <Ionicons name="alert" size={28} color="#fff" />
                    <Text style={styles.label}>SOS</Text>
                </View>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>EMERGENCY ALERT</Text>
                        <Text style={styles.subtitle}>What kind of emergency is this?</Text>

                        <View style={styles.grid}>
                            <TouchableOpacity style={[styles.typeBtn, { backgroundColor: '#EF4444' }]} onPress={() => confirmSos('medical')}>
                                <Ionicons name="medical" size={32} color="#fff" />
                                <Text style={styles.typeLabel}>MEDICAL</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.typeBtn, { backgroundColor: '#F59E0B' }]} onPress={() => confirmSos('fire')}>
                                <Ionicons name="flame" size={32} color="#fff" />
                                <Text style={styles.typeLabel}>FIRE</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.typeBtn, { backgroundColor: '#3B82F6' }]} onPress={() => confirmSos('security')}>
                                <Ionicons name="shield" size={32} color="#fff" />
                                <Text style={styles.typeLabel}>SECURITY</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelText}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#DC2626",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    innerCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#DC2626',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        marginTop: -2
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 0, 0, 0.2)', // Red tint for urgency
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    title: { ...theme.typography.h1, color: '#DC2626', marginBottom: 8 },
    subtitle: { ...theme.typography.body1, color: theme.colors.text.secondary, marginBottom: 24, textAlign: 'center' },

    grid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        width: '100%',
        justifyContent: 'center'
    },
    typeBtn: {
        width: 80,
        height: 80,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4
    },
    typeLabel: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '800'
    },

    cancelBtn: { padding: 12 },
    cancelText: { color: theme.colors.text.muted, fontWeight: '600' }
});

export default SOSButton;

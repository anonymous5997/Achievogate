import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useAuth from '../../hooks/useAuth';
import societyService from '../../services/societyService';
import theme from '../../theme/theme';
import CinematicButton from '../CinematicButton';

const AddGuardModal = ({ visible, onClose, onSuccess }) => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [societyName, setSocietyName] = useState('Loading...');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        shift: 'Morning', // Morning, Evening, Night
        gateNumber: '1',
    });

    useEffect(() => {
        if (visible && userProfile?.societyId) {
            fetchSocietyDetails();
        }
    }, [visible, userProfile]);

    const fetchSocietyDetails = async () => {
        const res = await societyService.getSocietyById(userProfile.societyId);
        if (res.success) {
            setSocietyName(res.society.name);
        } else {
            setSocietyName('Unknown Society');
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.name || !formData.phone) {
            alert('Please fill Name and Phone');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                societyId: userProfile.societyId,
                role: 'guard',
                email: `guard_${formData.phone}@${userProfile.societyId}.com` // Auto-generate dummy email for auth if needed
            };

            // Use GuardService for dedicated creation
            const guardService = (await import('../../services/guardService')).default;
            const res = await guardService.createGuard(payload, userProfile.uid);

            if (res.success) {
                alert('Guard Added Successfully!');
                setFormData({ name: '', phone: '', shift: 'Morning', gateNumber: '1' });
                onSuccess();
                onClose();
            } else {
                alert('Error: ' + res.error);
            }
        } catch (error) {
            alert('Error adding guard: ' + error.message);
        }
        setLoading(false);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Add Guard</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.form}>

                    {/* Society Info */}
                    <View style={styles.infoBanner}>
                        <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.infoLabel}>Assigning to Society</Text>
                            <Text style={styles.infoValue}>{societyName}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Guard Details</Text>

                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Ram Singh"
                        value={formData.name}
                        onChangeText={t => handleChange('name', t)}
                    />

                    <Text style={styles.label}>Phone Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 9876543210"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={t => handleChange('phone', t)}
                    />

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Shift</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Morning/Night"
                                value={formData.shift}
                                onChangeText={t => handleChange('shift', t)}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Gate Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1"
                                keyboardType="numeric"
                                value={formData.gateNumber}
                                onChangeText={t => handleChange('gateNumber', t)}
                            />
                        </View>
                    </View>

                    <CinematicButton
                        title={loading ? "Adding..." : "Add Guard"}
                        icon={!loading && "person-add"}
                        onPress={handleSubmit}
                        style={{ marginTop: 24 }}
                        disabled={loading}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    title: { fontSize: 20, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    form: { padding: 24 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.primary, marginTop: 16, marginBottom: 12, textTransform: 'uppercase' },
    label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
    row: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },

    infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#BAE6FD' },
    infoLabel: { fontSize: 11, color: '#0369A1', fontWeight: '600', textTransform: 'uppercase' },
    infoValue: { fontSize: 15, color: '#0C4A6E', fontWeight: 'bold' },
});

export default AddGuardModal;

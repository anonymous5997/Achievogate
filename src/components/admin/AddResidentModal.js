import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useAuth from '../../hooks/useAuth';
import societyService from '../../services/societyService';
import userService from '../../services/userService';
import theme from '../../theme/theme';
import CinematicButton from '../CinematicButton';

const AddResidentModal = ({ visible, onClose, onSuccess }) => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [societyName, setSocietyName] = useState('Loading...');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        block: '',
        flatNumber: '',
        floor: '',
        parkingNumber: '',
        vehicleCount: '0',
    });

    const [familyMembers, setFamilyMembers] = useState([]);
    const [newMember, setNewMember] = useState({ name: '', relation: '' });
    const [showFamilyInput, setShowFamilyInput] = useState(false);

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

    const addFamilyMember = () => {
        if (!newMember.name || !newMember.relation) {
            alert('Please enter member name and relation');
            return;
        }
        setFamilyMembers(prev => [...prev, newMember]);
        setNewMember({ name: '', relation: '' });
        setShowFamilyInput(false);
    };

    const removeFamilyMember = (index) => {
        setFamilyMembers(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.name || !formData.phone || !formData.block || !formData.flatNumber) {
            alert('Please fill all required fields (Name, Phone, Block, Flat)');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                familyMembers,
                societyId: userProfile.societyId,
                role: 'resident'
            };

            const res = await userService.createResident(payload);

            if (res.success) {
                alert('Resident Added Successfully!');
                setFormData({ name: '', email: '', phone: '', block: '', flatNumber: '', floor: '', parkingNumber: '', vehicleCount: '0' });
                setFamilyMembers([]);
                onSuccess(); // Refresh list
                onClose();
            } else {
                alert('Error: ' + res.error);
            }
        } catch (error) {
            alert('Error adding resident: ' + error.message);
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
                    <Text style={styles.title}>Add Resident</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.form}>

                    {/* Society Info (Read Only) */}
                    <View style={styles.infoBanner}>
                        <Ionicons name="business" size={20} color={theme.colors.primary} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.infoLabel}>Adding to Society</Text>
                            <Text style={styles.infoValue}>{societyName}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Rahul Sharma"
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

                    <Text style={styles.label}>Email (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. rahul@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={t => handleChange('email', t)}
                    />

                    <Text style={styles.sectionTitle}>Flat & Vehicle Details</Text>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Block *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="A"
                                value={formData.block}
                                onChangeText={t => handleChange('block', t)}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Floor</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1"
                                keyboardType="numeric"
                                value={formData.floor}
                                onChangeText={t => handleChange('floor', t)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Flat Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 101"
                        value={formData.flatNumber}
                        onChangeText={t => handleChange('flatNumber', t)}
                    />

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Parking Slot</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="P-101"
                                value={formData.parkingNumber}
                                onChangeText={t => handleChange('parkingNumber', t)}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Vehicles</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                keyboardType="numeric"
                                value={formData.vehicleCount}
                                onChangeText={t => handleChange('vehicleCount', t)}
                            />
                        </View>
                    </View>

                    {/* Family Members Section */}
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Family Members ({familyMembers.length})</Text>
                        <TouchableOpacity onPress={() => setShowFamilyInput(!showFamilyInput)}>
                            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                {showFamilyInput ? 'Cancel' : '+ Add'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showFamilyInput && (
                        <View style={styles.familyInputBox}>
                            <TextInput
                                style={[styles.input, { marginBottom: 8 }]}
                                placeholder="Name"
                                value={newMember.name}
                                onChangeText={t => setNewMember(p => ({ ...p, name: t }))}
                            />
                            <TextInput
                                style={[styles.input, { marginBottom: 8 }]}
                                placeholder="Relation (e.g. Wife, Son)"
                                value={newMember.relation}
                                onChangeText={t => setNewMember(p => ({ ...p, relation: t }))}
                            />
                            <CinematicButton
                                title="Add Member"
                                onPress={addFamilyMember}
                                height={40}
                                fontSize={14}
                            />
                        </View>
                    )}

                    {familyMembers.map((member, index) => (
                        <View key={index} style={styles.memberCard}>
                            <View>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <Text style={styles.memberRelation}>{member.relation}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeFamilyMember(index)}>
                                <Ionicons name="trash-outline" size={20} color={theme.colors.status.error} />
                            </TouchableOpacity>
                        </View>
                    ))}

                    <CinematicButton
                        title={loading ? "Adding..." : "Add Resident"}
                        icon={!loading && "person-add"}
                        onPress={handleSubmit}
                        style={{ marginTop: 24, marginBottom: 40 }}
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
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 12 },
    label: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 6 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
    row: { flexDirection: 'row', gap: 12 },
    col: { flex: 1 },

    infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#BAE6FD' },
    infoLabel: { fontSize: 11, color: '#0369A1', fontWeight: '600', textTransform: 'uppercase' },
    infoValue: { fontSize: 15, color: '#0C4A6E', fontWeight: 'bold' },

    familyInputBox: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
    memberCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 8 },
    memberName: { fontSize: 14, fontWeight: '600', color: '#333' },
    memberRelation: { fontSize: 12, color: '#666' }
});

export default AddResidentModal;

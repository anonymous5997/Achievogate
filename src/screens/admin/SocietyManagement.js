import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import SocietyCard from '../../components/SocietyCard';
import useSocieties from '../../hooks/useSocieties';
import theme from '../../theme/theme';

const SocietyManagement = ({ navigation }) => {
    const { societies, loading, createSociety, updateSociety, deleteSociety } = useSocieties();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSociety, setEditingSociety] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        totalFlats: '',
        contactPerson: '',
        contactPhone: '',
    });

    const handleAdd = () => {
        setEditingSociety(null);
        setFormData({
            name: '',
            address: '',
            city: '',
            totalFlats: '',
            contactPerson: '',
            contactPhone: '',
        });
        setModalVisible(true);
    };

    const handleEdit = (society) => {
        setEditingSociety(society);
        setFormData({
            name: society.name,
            address: society.address,
            city: society.city || '',
            totalFlats: String(society.totalFlats || ''),
            contactPerson: society.contactPerson || '',
            contactPhone: society.contactPhone || '',
        });
        setModalVisible(true);
    };

    const handleDelete = (society) => {
        Alert.alert(
            'Delete Society',
            `Are you sure you want to delete "${society.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteSociety(society.id);
                        if (result.success) {
                            Alert.alert('Success', 'Society deleted successfully');
                        } else {
                            Alert.alert('Error', result.error);
                        }
                    },
                },
            ]
        );
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.address) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const data = {
            ...formData,
            totalFlats: parseInt(formData.totalFlats) || 0,
        };

        let result;
        if (editingSociety) {
            result = await updateSociety(editingSociety.id, data);
        } else {
            result = await createSociety(data);
        }

        if (result.success) {
            Alert.alert('Success', `Society ${editingSociety ? 'updated' : 'created'} successfully`);
            setModalVisible(false);
        } else {
            Alert.alert('Error', result.error);
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Societies"
                    subTitle={`${societies.length} Communities`}
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
                            <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={styles.content}>
                    {societies.length === 0 ? (
                        <AnimatedCard3D>
                            <View style={styles.emptyState}>
                                <Ionicons name="business-outline" size={64} color={theme.colors.text.muted} />
                                <Text style={styles.emptyTitle}>No Societies Yet</Text>
                                <Text style={styles.emptySubtitle}>Add your first society to get started</Text>
                            </View>
                        </AnimatedCard3D>
                    ) : (
                        societies.map((society, index) => (
                            <SocietyCard
                                key={society.id}
                                society={society}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </ScrollView>

                {/* Add/Edit Modal */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingSociety ? 'Edit Society' : 'Add Society'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close-circle" size={28} color={theme.colors.text.muted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll}>
                                <Text style={styles.label}>Society Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    placeholder="e.g. Green Valley Apartments"
                                />

                                <Text style={styles.label}>Address *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.address}
                                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                                    placeholder="Street address"
                                />

                                <Text style={styles.label}>City</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.city}
                                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                                    placeholder="e.g. Mumbai"
                                />

                                <Text style={styles.label}>Total Flats</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.totalFlats}
                                    onChangeText={(text) => setFormData({ ...formData, totalFlats: text })}
                                    placeholder="e.g. 100"
                                    keyboardType="number-pad"
                                />

                                <Text style={styles.label}>Contact Person</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.contactPerson}
                                    onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
                                    placeholder="Manager name"
                                />

                                <Text style={styles.label}>Contact Phone</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.contactPhone}
                                    onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
                                    placeholder="+91 9999999999"
                                    keyboardType="phone-pad"
                                />
                            </ScrollView>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.cancelBtn]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.submitBtn]}
                                    onPress={handleSubmit}
                                >
                                    <Text style={styles.submitText}>
                                        {editingSociety ? 'Update' : 'Create'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 24 },
    addBtn: { padding: 4 },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        ...theme.typography.body1,
        color: theme.colors.text.muted,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        ...theme.typography.h2,
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    formScroll: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    label: {
        ...theme.typography.h3,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: theme.colors.text.primary,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modalActions: {
        flexDirection: 'row',
        padding: 24,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: '#F1F5F9',
    },
    submitBtn: {
        backgroundColor: theme.colors.primary,
    },
    cancelText: {
        ...theme.typography.h3,
        fontSize: 16,
        color: theme.colors.text.secondary,
    },
    submitText: {
        ...theme.typography.h3,
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
    },
});

export default SocietyManagement;

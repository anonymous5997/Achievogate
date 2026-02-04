import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import ComplaintCard from '../../components/ComplaintCard';
import useAuth from '../../hooks/useAuth';
import useComplaints from '../../hooks/useComplaints';
import useSocieties from '../../hooks/useSocieties';
import theme from '../../theme/theme';

const ComplaintManagement = ({ navigation }) => {
    const { userProfile } = useAuth();
    const { complaints, updateStatus, assignComplaint, createComplaint, deleteComplaint } = useComplaints();
    const { societies } = useSocieties();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'maintenance',
        priority: 'medium',
        societyId: '',
    });

    const categories = ['maintenance', 'security', 'noise', 'cleanliness', 'other'];
    const priorities = ['low', 'medium', 'high'];
    const statuses = ['all', 'pending', 'in-progress', 'resolved'];

    const filteredComplaints = selectedFilter === 'all'
        ? complaints
        : complaints.filter(c => c.status === selectedFilter);

    const handleCreateComplaint = async () => {
        if (!formData.title || !formData.description) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const complaintData = {
            ...formData,
            createdBy: userProfile.id,
            createdByRole: 'admin',
        };

        const result = await createComplaint(complaintData);
        if (result.success) {
            Alert.alert('Success', 'Complaint created successfully');
            setModalVisible(false);
            setFormData({
                title: '',
                description: '',
                category: 'maintenance',
                priority: 'medium',
                societyId: '',
            });
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const handleComplaintPress = (complaint) => {
        Alert.alert(
            complaint.title,
            complaint.description,
            [
                { text: 'Close', style: 'cancel' },
                {
                    text: 'Mark Resolved',
                    onPress: async () => {
                        await updateStatus(complaint.id, 'resolved');
                    },
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteComplaint(complaint.id);
                    },
                },
            ]
        );
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Complaints"
                    subTitle={`${complaints.length} Total`}
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                            <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                        </TouchableOpacity>
                    }
                />

                {/* Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    {statuses.map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterPill,
                                selectedFilter === status && styles.filterPillActive
                            ]}
                            onPress={() => setSelectedFilter(status)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === status && styles.filterTextActive
                            ]}>
                                {status.toUpperCase()}
                            </Text>
                            {status !== 'all' && (
                                <View style={styles.filterBadge}>
                                    <Text style={styles.filterBadgeText}>
                                        {complaints.filter(c => c.status === status).length}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <FlatList
                    data={filteredComplaints}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <ComplaintCard complaint={item} onPress={handleComplaintPress} />
                    )}
                    ListEmptyComponent={
                        <AnimatedCard3D>
                            <View style={styles.emptyState}>
                                <Ionicons name="checkmark-done-circle" size={64} color={theme.colors.text.muted} />
                                <Text style={styles.emptyTitle}>No Complaints</Text>
                                <Text style={styles.emptySubtitle}>All clear in this category</Text>
                            </View>
                        </AnimatedCard3D>
                    }
                />

                {/* Create Complaint Modal */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Create Complaint</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close-circle" size={28} color={theme.colors.text.muted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll}>
                                <Text style={styles.label}>Title *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                    placeholder="Brief description"
                                />

                                <Text style={styles.label}>Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    placeholder="Detailed explanation"
                                    multiline
                                    numberOfLines={4}
                                />

                                <Text style={styles.label}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
                                    {categories.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.optionChip,
                                                formData.category === cat && styles.optionChipActive
                                            ]}
                                            onPress={() => setFormData({ ...formData, category: cat })}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                formData.category === cat && styles.optionTextActive
                                            ]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <Text style={styles.label}>Priority</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
                                    {priorities.map(pri => (
                                        <TouchableOpacity
                                            key={pri}
                                            style={[
                                                styles.optionChip,
                                                formData.priority === pri && styles.optionChipActive
                                            ]}
                                            onPress={() => setFormData({ ...formData, priority: pri })}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                formData.priority === pri && styles.optionTextActive
                                            ]}>
                                                {pri}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <Text style={styles.label}>Society</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
                                    {societies.map(soc => (
                                        <TouchableOpacity
                                            key={soc.id}
                                            style={[
                                                styles.optionChip,
                                                formData.societyId === soc.id && styles.optionChipActive
                                            ]}
                                            onPress={() => setFormData({ ...formData, societyId: soc.id })}
                                        >
                                            <Text style={[
                                                styles.optionText,
                                                formData.societyId === soc.id && styles.optionTextActive
                                            ]}>
                                                {soc.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </ScrollView>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.submitBtn]}
                                    onPress={handleCreateComplaint}
                                >
                                    <Text style={styles.submitText}>Create Complaint</Text>
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
    addBtn: { padding: 4 },
    filterContainer: {
        marginVertical: 12,
    },
    filterContent: {
        paddingHorizontal: 24,
        gap: 8,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
    },
    filterPillActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.secondary,
    },
    filterTextActive: {
        color: '#fff',
    },
    filterBadge: {
        marginLeft: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    filterBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    list: {
        padding: 24,
    },
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    optionsRow: {
        marginTop: 8,
        marginBottom: 12,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
    },
    optionChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    optionText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        textTransform: 'capitalize',
    },
    optionTextActive: {
        color: '#fff',
    },
    modalActions: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    modalBtn: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtn: {
        backgroundColor: theme.colors.primary,
    },
    submitText: {
        ...theme.typography.h3,
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
    },
});

export default ComplaintManagement;

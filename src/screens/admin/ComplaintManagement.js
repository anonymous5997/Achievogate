import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import ComplaintCard from '../../components/ComplaintCard';
import useAuth from '../../hooks/useAuth';
import complaintService from '../../services/complaintService'; // Updated Import
import theme from '../../theme/theme';

const ComplaintManagement = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // Detailed View State
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // Initial Load & Refresh
    useFocusEffect(
        useCallback(() => {
            loadComplaints();
        }, [userProfile?.societyId])
    );

    const loadComplaints = async () => {
        if (!userProfile?.societyId) return;
        setLoading(true);
        const res = await complaintService.getAllComplaints(userProfile.societyId);
        if (res.success) {
            setComplaints(res.complaints);
        }
        setLoading(false);
    };

    const statuses = ['all', 'open', 'in_progress', 'resolved', 'escalated', 'breached'];

    const filteredComplaints = selectedFilter === 'all'
        ? complaints
        : selectedFilter === 'breached'
            ? complaints.filter(c => c.isBreached)
            : complaints.filter(c => c.status === selectedFilter);

    const updateStatus = async (status) => {
        if (!selectedComplaint) return;

        const res = await complaintService.updateStatus(selectedComplaint.id, status, userProfile.id, `Admin marked as ${status}`);
        if (res.success) {
            Alert.alert('Success', `Complaint updated to ${status}`);
            setSelectedComplaint(null);
            loadComplaints();
        } else {
            Alert.alert('Error', res.error);
        }
    };

    const renderDetailModal = () => (
        <Modal visible={!!selectedComplaint} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.modalContainer}>
                {selectedComplaint && (
                    <>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setSelectedComplaint(null)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Complaint #{selectedComplaint.id.slice(-6).toUpperCase()}</Text>
                        </View>

                        <ScrollView contentContainerStyle={styles.modalContent}>
                            {/* Header Status */}
                            <View style={[styles.statusBanner, { backgroundColor: getStatusColor(selectedComplaint.status) + '20' }]}>
                                <Text style={[styles.statusBannerText, { color: getStatusColor(selectedComplaint.status) }]}>
                                    {selectedComplaint.status.toUpperCase()}
                                </Text>
                                {selectedComplaint.priority === 'urgent' && (
                                    <View style={styles.urgentBadge}>
                                        <Ionicons name="flame" size={14} color="#fff" />
                                        <Text style={styles.urgentText}>URGENT</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.subject}>{selectedComplaint.title}</Text>
                            <Text style={styles.description}>{selectedComplaint.description}</Text>

                            <View style={styles.section}>
                                <Text style={styles.label}>Resident Info</Text>
                                <View style={styles.infoRow}>
                                    <Ionicons name="person" size={18} color="#666" />
                                    <Text style={styles.infoText}>{selectedComplaint.reportedBy || 'Unknown User'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Ionicons name="home" size={18} color="#666" />
                                    <Text style={styles.infoText}>Flat {selectedComplaint.flatNumber || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Timeline</Text>
                                <View style={styles.timelineItem}>
                                    <View style={styles.timelineDot} />
                                    <Text style={styles.timelineText}>Created: {selectedComplaint.createdAt?.toLocaleString()}</Text>
                                </View>
                                {/* SLA Display */}
                                <View style={styles.timelineItem}>
                                    <View style={[styles.timelineDot, { backgroundColor: selectedComplaint.isBreached ? '#EF4444' : '#F59E0B' }]} />
                                    <Text style={[styles.timelineText, selectedComplaint.isBreached && { color: '#EF4444', fontWeight: 'bold' }]}>
                                        {selectedComplaint.isBreached ? 'SLA BREACHED' : 'SLA Target'}: {selectedComplaint.slaTargetTime?.toLocaleString()}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.label}>Actions</Text>
                            <View style={styles.actionGrid}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus('in_progress')}>
                                    <Ionicons name="hammer-outline" size={24} color="#3B82F6" />
                                    <Text style={styles.actionText}>Progress</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus('resolved')}>
                                    <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                                    <Text style={styles.actionText}>Resolve</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => updateStatus('escalated')}>
                                    <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
                                    <Text style={styles.actionText}>Escalate</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </>
                )}
            </View>
        </Modal>
    );

    const getStatusColor = (s) => {
        switch (s) {
            case 'open': return theme.colors.status.error;
            case 'in_progress': return theme.colors.status.pending;
            case 'resolved': return theme.colors.status.approved;
            case 'escalated': return '#EF4444';
            default: return theme.colors.text.muted;
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Complaints"
                    subTitle={`${complaints.length} Total`}
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <TouchableOpacity onPress={loadComplaints} style={styles.addBtn}>
                            <Ionicons name="refresh" size={24} color={theme.colors.primary} />
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
                                        {status === 'breached'
                                            ? complaints.filter(c => c.isBreached).length
                                            : complaints.filter(c => c.status === status).length}
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
                    refreshing={loading}
                    onRefresh={loadComplaints}
                    renderItem={({ item }) => (
                        <ComplaintCard
                            complaint={item}
                            onPress={() => setSelectedComplaint(item)}
                            isAdminView={true}
                        />
                    )}
                    ListEmptyComponent={
                        !loading && (
                            <AnimatedCard3D>
                                <View style={styles.emptyState}>
                                    <Ionicons name="checkmark-done-circle" size={64} color={theme.colors.text.muted} />
                                    <Text style={styles.emptyTitle}>No Complaints</Text>
                                    <Text style={styles.emptySubtitle}>All clear in this category</Text>
                                </View>
                            </AnimatedCard3D>
                        )
                    }
                />

                {renderDetailModal()}

            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    addBtn: { padding: 4 },
    filterContainer: {
        marginVertical: 12,
        maxHeight: 50,
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
        paddingBottom: 100
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

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    closeBtn: { marginRight: 16 },
    modalTitle: { ...theme.typography.h3, fontWeight: '700' },
    modalContent: { padding: 24 },
    statusBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 16 },
    statusBannerText: { fontWeight: '800', letterSpacing: 1 },
    urgentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    urgentText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
    subject: { ...theme.typography.h2, fontSize: 20, marginBottom: 8, color: '#1E293B' },
    description: { ...theme.typography.body1, color: theme.colors.text.secondary, marginBottom: 24, lineHeight: 24 },
    section: { marginBottom: 24, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12 },
    label: { fontSize: 12, fontWeight: '700', color: theme.colors.text.muted, marginBottom: 12, textTransform: 'uppercase' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoText: { marginLeft: 12, color: '#333', fontSize: 15, fontWeight: '500' },
    timelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginRight: 12 },
    timelineText: { color: theme.colors.text.secondary, fontSize: 13 },
    actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    actionBtn: { flex: 1, alignItems: 'center', padding: 12, backgroundColor: '#F3F4F6', borderRadius: 12, marginHorizontal: 4 },
    actionText: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#333' }
});

export default ComplaintManagement;


import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import noticeService from '../../services/noticeService';
import theme from '../../theme/theme';

const NoticeBoardScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create Mode
    const [modalVisible, setModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [target, setTarget] = useState('All Residents');
    const [targetRole, setTargetRole] = useState('all');
    const [priority, setPriority] = useState('info'); // info, urgent, event
    const [sendPush, setSendPush] = useState(true);

    useEffect(() => {
        loadNotices();
    }, [userProfile?.societyId]);

    const loadNotices = async () => {
        setLoading(true);
        if (userProfile?.societyId) {
            const res = await noticeService.getNotices(userProfile.societyId, 'admin', 'all'); // Admin sees all
            if (res.success) {
                setNotices(res.notices);
            }
        }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newTitle || !newDesc) return Alert.alert('Error', 'Please fill all fields');

        setLoading(true);
        const noticeData = {
            societyId: userProfile.societyId,
            title: newTitle,
            content: newDesc,
            targetBlock: target === 'All Residents' ? 'all' : target.replace('Block ', ''), // "Block A" -> "A"
            targetRole: targetRole,
            priority,
            createdBy: userProfile.id
        };

        const res = await noticeService.createNotice(noticeData);

        if (res.success) {
            Alert.alert('Success', 'Notice posted successfully.');
            setModalVisible(false);
            setNewTitle('');
            setNewDesc('');
            loadNotices();
        } else {
            Alert.alert('Error', res.error);
        }
        setLoading(false);
    };

    const renderItem = ({ item }) => (
        <AnimatedCard3D style={[styles.card, { borderLeftWidth: 4, borderLeftColor: getPriorityColor(item.priority) }]}>
            <View style={styles.headerRow}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>{item.priority.toUpperCase()}</Text>
                </View>
                <Text style={styles.date}>{item.createdAt.toLocaleDateString()}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>

            <View style={styles.footer}>
                <Ionicons name="people" size={14} color={theme.colors.text.muted} />
                <Text style={styles.target}>{item.target}</Text>

                <View style={[styles.footer, { marginLeft: 'auto' }]}>
                    <Ionicons name="eye-outline" size={14} color={theme.colors.text.muted} />
                    <Text style={styles.target}>{item.readBy?.length || 0} Read</Text>
                </View>
            </View>
        </AnimatedCard3D>
    );

    const getPriorityColor = (p) => {
        switch (p) {
            case 'urgent': return '#EF4444';
            case 'event': return '#8B5CF6';
            default: return theme.colors.primary;
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Notice Board"
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Ionicons name="add" size={28} color={theme.colors.primary} />
                        </TouchableOpacity>
                    }
                />

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={notices}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                        ListEmptyComponent={<Text style={styles.empty}>No notices found.</Text>}
                    />
                )}

                <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Notice</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.form}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="E.g. Lift Maintenance"
                                value={newTitle}
                                onChangeText={setNewTitle}
                            />

                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Details..."
                                multiline
                                textAlignVertical="top"
                                value={newDesc}
                                onChangeText={setNewDesc}
                            />

                            <Text style={styles.label}>Target Audience</Text>
                            <View style={styles.pillRow}>
                                {['All Residents', 'Block A', 'Block B'].map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.pill, target === t && styles.pillActive]}
                                        onPress={() => setTarget(t)}
                                    >
                                        <Text style={[styles.pillText, target === t && { color: '#fff' }]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Target Role</Text>
                            <View style={styles.pillRow}>
                                {['all', 'owner', 'tenant', 'guard'].map(r => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[styles.pill, targetRole === r && styles.pillActive]}
                                        onPress={() => setTargetRole(r)}
                                    >
                                        <Text style={[styles.pillText, targetRole === r && { color: '#fff' }]}>{r.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.pillRow}>
                                {['info', 'urgent', 'event'].map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[styles.pill, priority === p && { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) }]}
                                        onPress={() => setPriority(p)}
                                    >
                                        <Text style={[styles.pillText, { color: '#fff' }]}>{p.toUpperCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>Send Push Notification</Text>
                                <Switch value={sendPush} onValueChange={setSendPush} trackColor={{ true: theme.colors.primary }} />
                            </View>

                            <CinematicButton
                                title="Post Notice"
                                onPress={handleCreate}
                                style={{ marginTop: 24 }}
                            />
                        </ScrollView>
                    </View>
                </Modal>

            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    card: { marginBottom: 16, padding: 16, overflow: 'hidden' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    priorityText: { fontSize: 10, fontWeight: '700' },
    date: { fontSize: 10, color: theme.colors.text.muted },
    title: { ...theme.typography.h3, fontSize: 18, marginBottom: 4, color: '#1E293B' },
    desc: { ...theme.typography.body1, color: theme.colors.text.secondary, lineHeight: 20 },
    footer: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    target: { fontSize: 11, color: theme.colors.text.muted, marginLeft: 4 },
    empty: { textAlign: 'center', marginTop: 40, color: theme.colors.text.muted },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    modalTitle: { ...theme.typography.h3 },
    form: { padding: 24 },
    label: { fontSize: 12, fontWeight: '700', color: theme.colors.text.muted, marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15 },
    textArea: { height: 100 },
    pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
    pillActive: { backgroundColor: theme.colors.text.primary, borderColor: theme.colors.text.primary },
    pillText: { fontSize: 12, fontWeight: '600', color: theme.colors.text.secondary },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, backgroundColor: '#fff', padding: 12, borderRadius: 10 },
    switchLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' }
});

export default NoticeBoardScreen;

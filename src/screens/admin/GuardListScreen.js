import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddGuardModal from '../../components/admin/AddGuardModal';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/theme';

const GuardListScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [guards, setGuards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const loadGuards = useCallback(async () => {
        if (!userProfile?.societyId) return;
        setLoading(true);
        // Using GuardService
        const guardService = (await import('../../services/guardService')).default;
        const res = await guardService.getGuards(userProfile.societyId);
        if (res.success) {
            setGuards(res.guards);
        }
        setLoading(false);
        setRefreshing(false);
    }, [userProfile?.societyId]);

    useEffect(() => {
        loadGuards();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadGuards();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('GuardDetailScreen', { guard: item })}>
            <View style={styles.row}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.subText}>{item.phone}</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.shift || 'Shift?'}</Text>
                </View>
                <View style={styles.actionBtn}>
                    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </View>
            </View>
            <View style={styles.footer}>
                <View style={styles.footerItem}>
                    <Ionicons name="key-outline" size={14} color="#666" />
                    <Text style={styles.footerText}>Gate {item.gateNumber || 'Main'}</Text>
                </View>
                <View style={styles.footerItem}>
                    <Ionicons name="radio-button-on" size={14} color={item.active ? theme.colors.status.active : theme.colors.status.error} />
                    <Text style={[styles.footerText, { color: item.active ? theme.colors.status.active : theme.colors.status.error }]}>
                        {item.active ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Guard Management"
                    subtitle={`${guards.length} Security Personnel`}
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <TouchableOpacity onPress={() => navigation.navigate('GuardRosterScreen')}>
                                <Ionicons name="calendar" size={20} color={theme.colors.text.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleRefresh}>
                                <Ionicons name="sync" size={20} color={theme.colors.text.primary} />
                            </TouchableOpacity>
                        </View>
                    }
                />

                <FlatList
                    data={guards}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={!loading && (
                        <View style={styles.emptyState}>
                            <Ionicons name="shield-outline" size={48} color={theme.colors.text.muted} />
                            <Text style={styles.emptyText}>No guards added yet.</Text>
                        </View>
                    )}
                />

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>

                <AddGuardModal
                    visible={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={loadGuards}
                />

            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    listContent: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: '#4338CA' },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    subText: { fontSize: 13, color: '#666' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#FEF3C7', borderRadius: 4, marginRight: 8 },
    badgeText: { fontSize: 11, fontWeight: '700', color: '#D97706', textTransform: 'uppercase' },
    actionBtn: { padding: 4 },
    footer: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderColor: '#f3f4f6', paddingTop: 12 },
    footerItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
    footerText: { fontSize: 12, color: '#666', marginLeft: 4, fontWeight: '500' },

    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, color: theme.colors.text.muted },
    fab: { position: 'absolute', right: 20, bottom: 40, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.primary, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
});

export default GuardListScreen;

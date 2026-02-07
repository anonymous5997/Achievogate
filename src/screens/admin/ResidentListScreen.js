import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated from 'react-native-reanimated';
import AddResidentModal from '../../components/admin/AddResidentModal'; // Import
import BulkImportModal from '../../components/admin/BulkImportModal';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import theme from '../../theme/theme';

const ResidentListScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // Filters & Modals
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterDrawer, setShowFilterDrawer] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false); // New State
    const [filters, setFilters] = useState({
        status: 'all',
        block: 'all',
        floor: 'all'
    });

    const loadResidents = useCallback(async (reset = false) => {
        if (!userProfile?.societyId) return;
        if (reset) setLoading(true);

        const currentLastDoc = reset ? null : lastDoc;
        const res = await userService.getResidents(
            userProfile.societyId,
            filters,
            currentLastDoc
        );

        if (res.success) {
            if (reset) {
                setResidents(res.residents);
            } else {
                setResidents(prev => [...prev, ...res.residents]);
            }
            setLastDoc(res.lastVisible);
            setHasMore(res.hasMore);
        }
        setLoading(false);
        setRefreshing(false);
    }, [userProfile?.societyId, filters, lastDoc]);

    useEffect(() => {
        loadResidents(true);
    }, [filters]);

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            // Placeholder for search logic
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadResidents(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadResidents(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return theme.colors.status.active;
            case 'pending': return theme.colors.status.pending;
            case 'rejected': return theme.colors.status.error;
            default: return theme.colors.text.muted;
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ResidentDetailScreen', { resident: item })}
        >
            <View style={styles.row}>
                <Animated.View
                    style={[styles.avatar, { backgroundColor: getStatusColor(item.status) + '20' }]}
                    sharedTransitionTag={`resident-avatar-${item.id}`}
                >
                    <Text style={[styles.avatarText, { color: getStatusColor(item.status) }]}>
                        {item.name?.[0]?.toUpperCase()}
                    </Text>
                </Animated.View>

                <View style={styles.colName}>
                    <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.metaRow}>
                        <Ionicons name="people" size={12} color={theme.colors.text.muted} />
                        <Text style={styles.metaText}>{item.familyMembers?.length || 0}</Text>
                        <Ionicons name="car" size={12} color={theme.colors.text.muted} style={{ marginLeft: 8 }} />
                        <Text style={styles.metaText}>{item.vehicles?.length || 0}</Text>
                    </View>
                </View>

                <View style={styles.colFlat}>
                    <Text style={styles.flatText}>{item.block}-{item.flatNumber}</Text>
                    <Text style={[styles.subText, { color: item.occupancyStatus === 'tenant' ? theme.colors.secondary : theme.colors.text.muted }]}>
                        {item.occupancyStatus ? item.occupancyStatus.toUpperCase() : 'OWNER'}
                    </Text>
                </View>

                <View style={styles.colStatus}>
                    <View style={[styles.statusBadge, { borderColor: getStatusColor(item.status) }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status?.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={16} color={theme.colors.text.muted} />
            </View>
            <View style={styles.separator} />
        </TouchableOpacity>
    );

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Resident Directory"
                    subtitle={`${residents.length} Residents Loaded`}
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <TouchableOpacity onPress={handleRefresh}>
                            <Ionicons name="sync" size={20} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                    }
                />

                {/* Search & Filter Bar */}
                <View style={styles.toolbar}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color={theme.colors.text.muted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search residents..."
                            placeholderTextColor={theme.colors.text.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setShowImportModal(true)}
                    >
                        <Ionicons name="cloud-upload-outline" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setShowFilterDrawer(true)}
                    >
                        <Ionicons name="filter" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Header Row */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerText, { flex: 0.5 }]}>User</Text>
                    <Text style={[styles.headerText, { flex: 0.3 }]}>Flat</Text>
                    <Text style={[styles.headerText, { flex: 0.2, textAlign: 'center' }]}>Status</Text>
                </View>

                {/* List */}
                <FlatList
                    data={residents}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
                    }
                    ListFooterComponent={loading && !refreshing ? <ActivityIndicator style={{ margin: 20 }} /> : null}
                    ListEmptyComponent={!loading && (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={theme.colors.text.muted} />
                            <Text style={styles.emptyText}>No residents found matching criteria.</Text>
                        </View>
                    )}
                />

                {/* FAB: Add Resident */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setShowAddModal(true)}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Filter Drawer Modal */}
                <Modal visible={showFilterDrawer} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.drawer}>
                            <Text style={styles.drawerTitle}>Filters</Text>

                            <Text style={styles.filterLabel}>Status</Text>
                            <View style={styles.filterRow}>
                                {['all', 'active', 'pending', 'rejected'].map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        style={[styles.chip, filters.status === s && styles.chipActive]}
                                        onPress={() => setFilters(prev => ({ ...prev, status: s }))}
                                    >
                                        <Text style={[styles.chipText, filters.status === s && { color: '#fff' }]}>
                                            {s.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={() => setShowFilterDrawer(false)}
                            >
                                <Text style={styles.applyBtnText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* Modals */}
                <BulkImportModal
                    visible={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => loadResidents(true)}
                />

                <AddResidentModal
                    visible={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => loadResidents(true)}
                />

            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    toolbar: { flexDirection: 'row', padding: 16, paddingTop: 8, gap: 12 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#eee' },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: theme.colors.text.primary },
    filterBtn: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },

    tableHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    headerText: { fontSize: 12, fontWeight: '700', color: theme.colors.text.secondary, textTransform: 'uppercase' },

    listContent: { paddingBottom: 100 },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
    separator: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 68 }, // Indented separator

    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontWeight: '700', fontSize: 16 },

    colName: { flex: 1 },
    nameText: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    subText: { fontSize: 12, color: '#64748b', marginTop: 2 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    metaText: { fontSize: 12, color: '#64748b', fontWeight: '500' },

    colFlat: { width: 80 },
    flatText: { fontSize: 14, fontWeight: '600', color: '#334155' },

    colStatus: { width: 70, alignItems: 'center', marginRight: 8 },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
    statusText: { fontSize: 10, fontWeight: '700' },

    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: 16, color: theme.colors.text.muted },

    fab: { position: 'absolute', right: 20, bottom: 40, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.primary, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },

    // Drawer
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    drawer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    drawerTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    filterLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text.secondary, marginBottom: 12 },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9' },
    chipActive: { backgroundColor: theme.colors.primary },
    chipText: { fontSize: 14, color: '#334155', fontWeight: '500' },
    applyBtn: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
    applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default ResidentListScreen;

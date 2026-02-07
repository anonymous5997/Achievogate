import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import CinematicListStagger from '../../components/CinematicListStagger';
import useAuth from '../../hooks/useAuth';
import flatService from '../../services/flatService';
import userService from '../../services/userService';
import vehicleService from '../../services/vehicleService'; // Add vehicle service
import theme from '../../theme/theme';

const UserManagement = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Detailed View Data
    const [userVehicles, setUserVehicles] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailTab, setDetailTab] = useState('info'); // info, vehicles, family

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [flats, setFlats] = useState([]);
    const [selectedFlat, setSelectedFlat] = useState(null);
    const [flatFilterVisible, setFlatFilterVisible] = useState(false);
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, [userProfile?.societyId]);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, selectedFlat, roleFilter, users]);

    // Fetch Details when User Selected
    useEffect(() => {
        if (selectedUser && selectedUser.flatNumber) {
            loadUserDetails(selectedUser);
        }
    }, [selectedUser]);

    const loadData = async () => {
        setLoading(true);
        if (userProfile?.societyId) {
            const [usersRes, flatsRes] = await Promise.all([
                userService.getUsers(null, { societyId: userProfile.societyId }),
                flatService.getFlatsBySociety(userProfile.societyId)
            ]);

            if (usersRes.success) setUsers(usersRes.users);
            if (flatsRes.success) setFlats(flatsRes.flats);
        }
        setLoading(false);
    };

    const loadUserDetails = async (user) => {
        setLoadingDetails(true);
        // 1. Fetch Family (Same flat)
        const family = users.filter(u => u.flatNumber === user.flatNumber && u.id !== user.id);
        setFamilyMembers(family);

        // 2. Fetch Vehicles (Match flat or ownerID)
        if (user.flatNumber) {
            const vRes = await vehicleService.getVehicles(userProfile.societyId);
            if (vRes.success) {
                // Filter by flat for now (assuming vehicle service returns all society vehicles)
                // In production, optimize backend to query by flat
                const myVehicles = vRes.vehicles.filter(v => v.flatNumber === user.flatNumber);
                setUserVehicles(myVehicles);
            }
        }
        setLoadingDetails(false);
    };

    const applyFilters = () => {
        let result = users;

        // 1. Text Search
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(u =>
                (u.name && u.name.toLowerCase().includes(lower)) ||
                (u.email && u.email.toLowerCase().includes(lower)) ||
                (u.phone && u.phone.includes(searchQuery))
            );
        }

        // 2. Flat Filter
        if (selectedFlat) {
            result = result.filter(u => u.flatNumber === selectedFlat);
        }

        // 3. Role Filter
        if (roleFilter !== 'all') {
            result = result.filter(u => u.role === roleFilter);
        }

        setFilteredUsers(result);
    };

    const handleUpdateRole = async (role) => {
        if (!selectedUser) return;
        if (role === 'admin') {
            alert('Security: Admin role can only be assigned via Database Console.');
            return;
        }

        try {
            const res = await userService.updateUser(selectedUser.id, { role });
            if (res.success) {
                alert('Success: User role updated.');
                loadData(); // Refresh list
                // Update local selected user role for immediate UI feedback
                setSelectedUser(prev => ({ ...prev, role }));
            } else {
                alert('Error: ' + res.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const renderItem = ({ item }) => (
        <AnimatedCard3D onPress={() => { setSelectedUser(item); setDetailTab('info'); }} style={{ marginBottom: 12 }}>
            <View style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: getRoleColor(item.role) }]}>
                    <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'U'}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name || 'Unknown'}</Text>
                    <Text style={styles.sub}>
                        {item.role === 'resident' ? `Flat ${item.flatNumber || 'N/A'}` : item.role.toUpperCase()}
                    </Text>
                    <Text style={styles.contact}>{item.phone || item.email}</Text>
                </View>
                <View style={[styles.badge, { borderColor: getRoleColor(item.role) }]}>
                    <Text style={[styles.badgeText, { color: getRoleColor(item.role) }]}>
                        {item.status?.toUpperCase() || 'ACTIVE'}
                    </Text>
                </View>
            </View>
        </AnimatedCard3D>
    );

    const getRoleColor = (r) => {
        if (r === 'admin') return theme.colors.primary;
        if (r === 'guard') return theme.colors.status.active;
        if (r === 'resident') return theme.colors.secondary;
        return theme.colors.text.muted;
    }

    // --- Sub-Components for Modal ---
    const renderDetailTab = () => {
        if (loadingDetails) return <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />;

        switch (detailTab) {
            case 'vehicles':
                return (
                    <View style={styles.tabContent}>
                        {userVehicles.length === 0 ? <Text style={styles.emptyText}>No vehicles registered.</Text> :
                            userVehicles.map((v, i) => (
                                <View key={i} style={styles.detailItem}>
                                    <Ionicons name={v.type === 'Bike' ? 'bicycle' : 'car-sport'} size={20} color={theme.colors.text.secondary} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.itemTitle}>{v.plateNumber}</Text>
                                        <Text style={styles.itemSub}>{v.type} • Owner: {v.flatNumber}</Text>
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                );
            case 'family':
                return (
                    <View style={styles.tabContent}>
                        {familyMembers.length === 0 ? <Text style={styles.emptyText}>No other family members found.</Text> :
                            familyMembers.map((f, i) => (
                                <View key={i} style={styles.detailItem}>
                                    <Ionicons name="person" size={20} color={theme.colors.text.secondary} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.itemTitle}>{f.name}</Text>
                                        <Text style={styles.itemSub}>{f.role} • {f.phone || f.email}</Text>
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                );
            default: // info
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{selectedUser?.email}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Phone:</Text>
                            <Text style={styles.value}>{selectedUser?.phone || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Flat:</Text>
                            <Text style={styles.value}>{selectedUser?.flatNumber || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Joined:</Text>
                            <Text style={styles.value}>{selectedUser?.createdAt?.toDate ? selectedUser.createdAt.toDate().toDateString() : 'Unknown'}</Text>
                        </View>

                        <Text style={styles.sectionHeader}>Actions</Text>
                        {/* Enforce Security: Only Resident/Guard assignable */}
                        <View style={styles.actionRow}>
                            {['resident', 'guard'].map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.roleBtn, selectedUser?.role === r && styles.roleBtnActive]}
                                    onPress={() => handleUpdateRole(r)}
                                >
                                    <Text style={[styles.roleBtnText, selectedUser?.role === r && { color: '#fff' }]}>
                                        Set {r.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.securityNote}>
                            Admin role changes require console access.
                        </Text>
                    </View>
                );
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="User Directory"
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <TouchableOpacity onPress={loadData} style={styles.refresh}>
                            <Ionicons name="refresh" size={20} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                    }
                />

                <View style={styles.filterContainer}>
                    {/* Search Input */}
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={theme.colors.text.muted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search name, phone, flat..."
                            placeholderTextColor={theme.colors.text.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {/* Role Filter */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginTop: 8 }}>
                        {['all', 'resident', 'guard'].map(r => (
                            <TouchableOpacity
                                key={r}
                                style={[styles.pill, roleFilter === r && styles.pillActive]}
                                onPress={() => setRoleFilter(r)}
                            >
                                <Text style={[styles.pillText, roleFilter === r && { color: '#fff' }]}>{r.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Flat Filter Link */}
                <TouchableOpacity
                    style={styles.flatFilterBar}
                    onPress={() => setFlatFilterVisible(true)}
                >
                    <Text style={styles.flatFilterText}>
                        {selectedFlat ? `Showing Flat: ${selectedFlat}` : 'Filter by Flat'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                    {loading ? (
                        <ActivityIndicator color={theme.colors.primary} />
                    ) : (
                        <CinematicListStagger data={filteredUsers} renderItem={renderItem} />
                    )}
                </ScrollView>

                {/* Detailed User Modal */}
                <Modal visible={!!selectedUser} animationType="slide" presentationStyle="pageSheet">
                    <View style={styles.modalContainer}>
                        {selectedUser && (
                            <>
                                <View style={styles.modalHeader}>
                                    <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.closeBtn}>
                                        <Ionicons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                    <View style={styles.modalProfile}>
                                        <View style={[styles.bigAvatar, { backgroundColor: getRoleColor(selectedUser.role) }]}>
                                            <Text style={styles.bigAvatarText}>{selectedUser.name?.[0] || 'U'}</Text>
                                        </View>
                                        <Text style={styles.modalName}>{selectedUser.name}</Text>
                                        <Text style={styles.modalRole}>{selectedUser.role.toUpperCase()}</Text>
                                    </View>
                                </View>

                                {/* Tabs */}
                                <View style={styles.tabs}>
                                    {['info', 'family', 'vehicles'].map(t => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[styles.tab, detailTab === t && styles.tabActive]}
                                            onPress={() => setDetailTab(t)}
                                        >
                                            <Text style={[styles.tabText, detailTab === t && styles.tabTextActive]}>
                                                {t.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <ScrollView style={styles.modalContent}>
                                    {renderDetailTab()}
                                </ScrollView>
                            </>
                        )}
                    </View>
                </Modal>

                {/* Flat Filter Modal */}
                <Modal visible={flatFilterVisible} transparent animationType="slide">
                    <View style={styles.modalBg}>
                        <View style={styles.bottomSheet}>
                            <Text style={styles.sheetTitle}>Select Flat</Text>
                            <ScrollView style={{ maxHeight: 300 }}>
                                <TouchableOpacity
                                    style={styles.sheetItem}
                                    onPress={() => { setSelectedFlat(null); setFlatFilterVisible(false); }}
                                >
                                    <Text style={styles.sheetItemText}>All Flats</Text>
                                </TouchableOpacity>
                                {flats.map(f => (
                                    <TouchableOpacity
                                        key={f.id}
                                        style={styles.sheetItem}
                                        onPress={() => { setSelectedFlat(f.flatNumber); setFlatFilterVisible(false); }}
                                    >
                                        <Text style={styles.sheetItemText}>{f.flatNumber} <Text style={{ fontSize: 12, color: '#666' }}>({f.occupancyStatus})</Text></Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity onPress={() => setFlatFilterVisible(false)} style={styles.closeSheet}>
                                <Text style={{ color: theme.colors.text.primary, fontWeight: 'bold' }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    refresh: { padding: 8 },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    info: { flex: 1 },
    name: { ...theme.typography.h3, fontSize: 16, color: theme.colors.text.primary },
    sub: { ...theme.typography.body1, fontSize: 13, color: theme.colors.text.secondary },
    contact: { fontSize: 11, color: theme.colors.text.muted },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: '700' },

    // Filters
    filterContainer: { padding: 16, paddingBottom: 0 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, height: 40, borderWidth: 1, borderColor: '#eee' },
    searchInput: { flex: 1, marginLeft: 8 },
    pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', marginRight: 8, borderWidth: 1, borderColor: '#eee' },
    pillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    pillText: { fontSize: 12, fontWeight: '600', color: '#666' },
    flatFilterBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    flatFilterText: { color: theme.colors.primary, fontWeight: '600' },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    modalHeader: { padding: 24, backgroundColor: '#fff', alignItems: 'center', paddingBottom: 32 },
    closeBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
    bigAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    bigAvatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
    modalName: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    modalRole: { fontSize: 14, color: theme.colors.text.muted, marginTop: 4, letterSpacing: 1 },

    tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 24, paddingBottom: 0, borderBottomWidth: 1, borderColor: '#eee' },
    tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
    tabActive: { borderColor: theme.colors.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.text.muted },
    tabTextActive: { color: theme.colors.primary },

    modalContent: { padding: 24 },
    infoRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
    label: { width: 80, fontWeight: '600', color: theme.colors.text.secondary },
    value: { flex: 1, color: theme.colors.text.primary },

    sectionHeader: { fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 12, color: '#1E293B' },
    actionRow: { flexDirection: 'row', gap: 12 },
    roleBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
    roleBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    roleBtnText: { fontWeight: '600', color: theme.colors.text.secondary },
    securityNote: { fontSize: 11, color: theme.colors.text.muted, marginTop: 16, textAlign: 'center', fontStyle: 'italic' },

    detailItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
    itemTitle: { fontWeight: '600', color: '#1E293B' },
    itemSub: { fontSize: 12, color: theme.colors.text.muted, marginTop: 2 },
    emptyText: { textAlign: 'center', marginTop: 40, color: theme.colors.text.muted },

    // Sheet
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    sheetItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    sheetItemText: { fontSize: 16, color: '#333' },
    closeSheet: { marginTop: 16, alignItems: 'center', padding: 12, backgroundColor: '#F3F4F6', borderRadius: 12 }
});

export default UserManagement;

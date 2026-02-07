import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import exportService from '../../services/exportService';
import visitorService from '../../services/visitorService';
import theme from '../../theme/theme';

const AllVisitors = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [visitors, setVisitors] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Premium Filters
    const [filters, setFilters] = useState({
        status: 'all',
        block: 'all',
        vehicleNumber: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Date Filtering
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [filterDate, setFilterDate] = useState(null);

    useEffect(() => {
        loadVisitors(true);
    }, [filters, filterDate, userProfile?.societyId]);

    const loadVisitors = async (reset = false) => {
        if (loading || (loadingMore && !reset)) return;
        if (!userProfile?.societyId) return;

        if (reset) {
            setLoading(true);
            setLastVisible(null);
        } else {
            setLoadingMore(true);
        }

        try {
            const apiFilters = {
                status: filters.status,
                block: filters.block,
                vehicleNumber: filters.vehicleNumber
            };

            const res = await visitorService.getVisitors(
                userProfile.societyId,
                apiFilters,
                20,
                reset ? null : lastVisible
            );

            if (res.success) {
                const newVisitors = res.visitors;
                if (reset) {
                    setVisitors(newVisitors);
                } else {
                    setVisitors(prev => [...prev, ...newVisitors]);
                }
                setLastVisible(res.lastVisible);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleExport = async () => {
        const res = await exportService.exportToCSV(userProfile.societyId, 'visitors');
        if (!res.success) alert(res.error);
    };

    // Advanced Filtering Logic (Client-side Search & Date)
    const displayVisitors = visitors.filter(v => {
        // 1. Text Search
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            const match = (
                v.visitorName?.toLowerCase().includes(lower) ||
                v.flatNumber?.toLowerCase().includes(lower) ||
                v.vehicleNumber?.toLowerCase().includes(lower)
            );
            if (!match) return false;
        }
        // 2. Date Filter
        if (filterDate) {
            const vDate = v.createdAt?.toDate ? v.createdAt.toDate() : new Date(v.createdAt);
            const isSameDay = vDate.toDateString() === filterDate.toDateString();
            if (!isSameDay) return false;
        }
        return true;
    });

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setFilterDate(selectedDate);
    };

    const renderItem = ({ item, index }) => (
        <AnimatedCard3D index={index} style={{ marginBottom: 10 }}>
            <View style={styles.row}>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.visitorName}</Text>
                    <Text style={styles.sub}>{item.purpose} • Flat {item.flatNumber}</Text>
                    {item.vehicleNumber && <Text style={styles.meta}>Vehicle: {item.vehicleNumber}</Text>}
                    <Text style={styles.date}>
                        {item.entryTime ? new Date(item.entryTime.seconds * 1000).toLocaleString() : 'Pending Entry'}
                    </Text>
                </View>
                <View style={styles.statusCol}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                    {item.exitTime && <Text style={styles.exitText}>Exited</Text>}
                </View>
            </View>
        </AnimatedCard3D>
    );

    const getStatusColor = (s) => {
        switch (s) {
            case 'approved': return theme.colors.status.approved;
            case 'pending': return theme.colors.status.pending;
            case 'denied': return theme.colors.status.denied;
            case 'entered': return theme.colors.primary;
            default: return theme.colors.text.secondary;
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Visitor Logs"
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <TouchableOpacity onPress={() => setShowFilters(true)}>
                            <Ionicons name="filter" size={28} color={theme.colors.primary} />
                        </TouchableOpacity>
                    }
                />

                <View style={styles.controls}>
                    {/* Search Bar */}
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={theme.colors.text.muted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search Name, Flat, Vehicle..."
                            placeholderTextColor={theme.colors.text.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={16} color={theme.colors.text.muted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Quick Filters */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                        {['all', 'pending', 'approved', 'entered', 'exited'].map(s => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setFilters(prev => ({ ...prev, status: s }))}
                                style={[styles.chip, filters.status === s && styles.activeChip]}
                            >
                                <Text style={[styles.chipText, filters.status === s && styles.activeChipText]}>
                                    {s.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Active Date Filter Indicator */}
                    {filterDate && (
                        <TouchableOpacity style={styles.dateChip} onPress={() => setFilterDate(null)}>
                            <Text style={styles.dateChipText}>Date: {filterDate.toDateString()}</Text>
                            <Ionicons name="close" size={14} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Main List */}
                <FlatList
                    data={displayVisitors}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    onEndReached={() => loadVisitors(false)}
                    onEndReachedThreshold={0.5}
                    refreshing={loading}
                    onRefresh={() => loadVisitors(true)}
                    ListFooterComponent={loadingMore && <ActivityIndicator color={theme.colors.primary} />}
                    ListEmptyComponent={!loading && <Text style={styles.empty}>No records found.</Text>}
                />

                {/* Filter Drawer / Modal */}
                <Modal visible={showFilters} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.drawer}>
                            <Text style={styles.drawerTitle}>Advanced Filters</Text>

                            <Text style={styles.sectionTitle}>Filter by Block</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. A, B, C (Type 'all' to reset)"
                                value={filters.block === 'all' ? '' : filters.block}
                                onChangeText={t => setFilters(prev => ({ ...prev, block: t || 'all' }))}
                            />

                            <Text style={styles.sectionTitle}>Filter by Vehicle</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. MH12AB1234"
                                value={filters.vehicleNumber}
                                onChangeText={t => setFilters(prev => ({ ...prev, vehicleNumber: t }))}
                            />

                            <Text style={styles.sectionTitle}>Date Range</Text>
                            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                                <Ionicons name="calendar" size={20} color={theme.colors.text.primary} />
                                <Text style={styles.dateBtnText}>
                                    {filterDate ? filterDate.toDateString() : 'Select Specific Date'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.sectionTitle}>Export Data</Text>
                            <CinematicButton
                                title="Download CSV Report"
                                icon="download"
                                onPress={handleExport}
                                style={{ marginBottom: 20 }}
                            />

                            <CinematicButton
                                title="Apply & Close"
                                onPress={() => setShowFilters(false)}
                            />
                        </View>
                    </View>
                </Modal>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                    />
                )}

            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    controls: { padding: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, height: 40, marginBottom: 12 },
    searchInput: { flex: 1, marginLeft: 8 },
    filterRow: { flexDirection: 'row', marginBottom: 8 },
    chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', marginRight: 8 },
    activeChip: { backgroundColor: theme.colors.primary },
    chipText: { fontSize: 12, color: '#333' },
    activeChipText: { color: '#fff', fontWeight: 'bold' },
    dateChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start', marginTop: 8 },
    dateChipText: { color: '#fff', fontSize: 12, marginRight: 4 },

    // Card
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    info: { flex: 1 },
    name: { ...theme.typography.h3, fontSize: 16, color: theme.colors.text.primary },
    sub: { color: theme.colors.text.muted, fontSize: 13, marginVertical: 2 },
    meta: { color: theme.colors.primary, fontSize: 12 },
    date: { color: theme.colors.text.muted, fontSize: 11, marginTop: 4 },
    statusCol: { alignItems: 'flex-end' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '700' },
    exitText: { fontSize: 10, color: theme.colors.text.muted, marginTop: 4 },

    empty: { textAlign: 'center', marginTop: 40, color: theme.colors.text.muted },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    drawer: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    drawerTitle: { ...theme.typography.h2, marginBottom: 20 },
    sectionTitle: { ...theme.typography.h3, fontSize: 14, marginTop: 16, marginBottom: 8 },
    dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 24 },
    dateBtnText: { marginLeft: 12, fontSize: 16, color: theme.colors.text.primary },
    input: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 8 }
});

export default AllVisitors;

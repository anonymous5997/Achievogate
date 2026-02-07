import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import GlobalSearchModal from '../../components/GlobalSearchModal';
import IncidentDashboard from '../../components/IncidentDashboard';
import NeoCard from '../../components/NeoCard';
import WebContainer from '../../components/WebContainer';
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/theme';

const AdminDashboard = ({ navigation }) => {
    const { userProfile, signOut } = useAuth();
    const [searchVisible, setSearchVisible] = useState(false);
    const [stats, setStats] = useState({ visitors: 0, parcels: 0, complaints: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    const menuItems = [
        { title: 'ANALYTICS', icon: 'bar-chart', screen: 'AnalyticsDashboard', color: '#8B5CF6' },
        { title: 'VISITOR LOGS', icon: 'people', screen: 'AllVisitors', color: '#6366f1' },
        { title: 'RESIDENTS', icon: 'home', screen: 'ResidentListScreen', color: '#10b981' },
        { title: 'SOCIETIES', icon: 'business', screen: 'SocietyManagement', color: '#f59e0b' },
        { title: 'COMPLAINTS', icon: 'alert-circle', screen: 'ComplaintManagement', color: '#ef4444' },
        { title: 'VEHICLES', icon: 'car-sport', screen: 'VehicleManagementScreen', color: '#ec4899' },
        { title: 'PARCELS', icon: 'cube', screen: 'ParcelManagementScreen', color: '#F59E0B' },
        { title: 'NOTICES', icon: 'notifications', screen: 'NoticeBoardScreen', color: '#8B5CF6' },
        { title: 'GUARDS', icon: 'shield-checkmark', screen: 'GuardListScreen', color: '#4338CA' },
    ];

    useEffect(() => {
        fetchStats();
    }, [userProfile?.societyId]);

    const fetchStats = async () => {
        if (!userProfile || !userProfile.societyId) return;
        const sociService = require('../../services/societyService').default;
        const res = await sociService.getDashboardStats(userProfile.societyId);
        if (res.success) setStats(res.stats);
        setLoadingStats(false);
    };

    // Components
    const FloatingOrb = ({ size = 40, color = theme.colors.primary, duration = 2000 }) => {
        const scale = useSharedValue(1);
        const opacity = useSharedValue(0.5);

        useEffect(() => {
            scale.value = withRepeat(
                withSequence(withTiming(1.2, { duration }), withTiming(1, { duration })),
                -1, true
            );
            opacity.value = withRepeat(
                withSequence(withTiming(0.8, { duration }), withTiming(0.3, { duration })),
                -1, true
            );
        }, []);

        const style = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            width: size, height: size,
            borderRadius: size / 2,
            backgroundColor: color,
        }));

        return <Animated.View style={style} />;
    };

    const CountingText = ({ value, style }) => {
        const [displayValue, setDisplayValue] = useState(0);

        useEffect(() => {
            let start = 0;
            const end = parseInt(value) || 0;
            if (start === end) return;

            const duration = 1000;
            const startTime = performance.now();

            const update = () => {
                const now = performance.now();
                const progress = Math.min((now - startTime) / duration, 1);

                // Ease out quart
                const ease = 1 - Math.pow(1 - progress, 4);

                setDisplayValue(Math.floor(start + (end - start) * ease));

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };
            requestAnimationFrame(update);
        }, [value]);

        return <Text style={style}>{displayValue}</Text>;
    };

    const WidgetCard = ({ title, value, icon, color, delay }) => {
        // Breathing Icon Effect
        const scale = useSharedValue(1);
        useEffect(() => {
            scale.value = withRepeat(
                withSequence(withTiming(1.1, { duration: 2000 }), withTiming(1, { duration: 2000 })),
                -1, true
            );
        }, []);

        const iconStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }]
        }));

        return (
            <Animated.View entering={ZoomIn.delay(delay).springify()} style={styles.widgetContainer}>
                <NeoCard style={[styles.widgetCard, { borderBottomColor: color, borderBottomWidth: 3 }]} glass={true}>
                    <View style={styles.widgetHeader}>
                        <Animated.View style={[styles.widgetIcon, { backgroundColor: `${color}20` }, iconStyle]}>
                            <Ionicons name={icon} size={18} color={color} />
                        </Animated.View>
                        <CountingText value={value} style={styles.widgetValue} />
                    </View>
                    <Text style={styles.widgetTitle}>{title}</Text>
                </NeoCard>
            </Animated.View>
        );
    };

    if (!userProfile) {
        return (
            <WebContainer>
                <CinematicBackground>
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loaderText}>INITIALIZING COMMAND CENTER...</Text>
                    </View>
                </CinematicBackground>
            </WebContainer>
        );
    }

    return (
        <WebContainer>
            <CinematicBackground>
                <CinematicHeader
                    title="COMMAND CENTER"
                    subTitle={`ADMIN: ${userProfile?.name?.toUpperCase() || ''}`}
                    rightAction={
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ marginRight: 10 }}>
                                <FloatingOrb size={10} color={theme.colors.status.success} duration={1500} />
                            </View>
                            <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
                                <Ionicons name="power" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    }
                />

                {/* Search Bar */}
                <Animated.View entering={FadeInDown.delay(100)}>
                    <TouchableOpacity
                        style={styles.searchBar}
                        onPress={() => setSearchVisible(true)}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                            style={styles.searchGradient}
                        >
                            <Ionicons name="search" size={20} color={theme.colors.primary} />
                            <Text style={styles.searchText}>SEARCH DATABASE...</Text>
                            <View style={styles.kbdShortcut}>
                                <Text style={styles.kbdText}>⌘K</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Live Stats */}
                    <View style={styles.statsRow}>
                        <WidgetCard title="VISITORS" value={stats.visitors} icon="people" color="#6366f1" delay={200} />
                        <WidgetCard title="PARCELS" value={stats.parcels} icon="cube" color="#f59e0b" delay={300} />
                        <WidgetCard title="ALERTS" value={stats.complaints} icon="warning" color="#ef4444" delay={400} />
                    </View>

                    {/* SOS Dashboard */}
                    <Animated.View entering={FadeInUp.delay(500)}>
                        <IncidentDashboard minimal={false} />
                    </Animated.View>

                    {/* Metrics Grid */}
                    <Text style={styles.sectionTitle}>SYSTEM MODULES</Text>
                    <View style={styles.grid}>
                        {menuItems.map((item, index) => (
                            <Animated.View
                                key={index}
                                entering={FadeInUp.delay(600 + (index * 50)).springify()}
                                style={styles.gridItemContainer}
                            >
                                <TouchableOpacity
                                    onPress={() => navigation.navigate(item.screen)}
                                    activeOpacity={0.8}
                                >
                                    <NeoCard style={styles.gridItem} glass={true}>
                                        <LinearGradient
                                            colors={[`${item.color}20`, 'transparent']}
                                            style={styles.gridGradient}
                                        />
                                        <View style={[styles.gridIcon, { borderColor: item.color }]}>
                                            <Ionicons name={item.icon} size={28} color={item.color} />
                                        </View>
                                        <Text style={styles.gridTitle}>{item.title}</Text>
                                        <Ionicons name="arrow-forward" size={16} color={theme.colors.text.muted} style={styles.arrow} />
                                    </NeoCard>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </ScrollView>

                <GlobalSearchModal
                    visible={searchVisible}
                    onClose={() => setSearchVisible(false)}
                    navigation={navigation}
                />
            </CinematicBackground>
        </WebContainer>
    );
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        marginTop: 16,
        letterSpacing: 2,
    },
    logoutBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },

    // Search
    searchBar: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    searchGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchText: {
        flex: 1,
        color: theme.colors.text.muted,
        marginLeft: 12,
        fontSize: 12,
        letterSpacing: 1,
    },
    kbdShortcut: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    kbdText: {
        color: theme.colors.text.secondary,
        fontSize: 10,
        fontWeight: '700',
    },

    content: {
        padding: 20,
        paddingBottom: 100,
    },

    // Widgets
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    widgetContainer: {
        width: '31%',
    },
    widgetCard: {
        padding: 16,
        minHeight: 100,
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    widgetIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    widgetValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    widgetTitle: {
        fontSize: 10,
        color: theme.colors.text.secondary,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    // Grid
    sectionTitle: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
        marginBottom: 16,
        marginLeft: 4,
        letterSpacing: 2,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItemContainer: {
        width: '48%',
        marginBottom: 16,
    },
    gridItem: {
        height: 140,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    gridGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    gridIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
    },
    gridTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    arrow: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        opacity: 0.5,
    },
});

export default AdminDashboard;

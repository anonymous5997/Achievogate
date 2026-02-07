import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import CinematicListStagger from '../../components/CinematicListStagger';
import useAuth from '../../hooks/useAuth';
import useVisitors from '../../hooks/useVisitors';
import theme from '../../theme/theme';

import { ScrollView } from 'react-native-gesture-handler'; // Added for ScrollView
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated, { runOnJS } from 'react-native-reanimated';

const VisitorList = ({ navigation }) => {
    const { userProfile } = useAuth();
    const { visitors } = useVisitors('guard', userProfile?.id);
    const [filter, setFilter] = useState('all');

    const filtered = visitors.filter(v => filter === 'all' || v.status === filter);

    const StatusBadge = ({ status }) => {
        let color = theme.colors.text.muted;
        let bg = '#F1F5F9';

        if (status === 'approved') { color = theme.colors.status.approved; bg = '#DCFCE7'; }
        if (status === 'pending') { color = theme.colors.status.pending; bg = '#FEF3C7'; }
        if (status === 'denied') { color = theme.colors.status.denied; bg = '#FEE2E2'; }

        return (
            <View style={[styles.badge, { backgroundColor: bg }]}>
                <Text style={[styles.badgeText, { color }]}>{status.toUpperCase()}</Text>
            </View>
        );
    };

    const renderRightActions = (progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [0, 100],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.rightAction}>
                <Animated.Text style={[styles.actionText, { transform: [{ translateX: trans }] }]}>
                    DENY
                </Animated.Text>
                <Ionicons name="close-circle" size={32} color="#fff" />
            </View>
        );
    };

    const renderLeftActions = (progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [0, 100],
            outputRange: [-100, 0],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.leftAction}>
                <Ionicons name="checkmark-circle" size={32} color="#fff" />
                <Animated.Text style={[styles.actionText, { transform: [{ translateX: trans }] }]}>
                    APPROVE
                </Animated.Text>
            </View>
        );
    };

    const handleSwipe = (direction, item) => {
        // Placeholder for logic
        console.log(`Swiped ${direction} on ${item.visitorName} `);
    };

    const renderItem = ({ item, index }) => (
        <Swipeable
            renderRightActions={renderRightActions}
            renderLeftActions={renderLeftActions}
            onSwipeableOpen={(direction) => {
                if (direction === 'left') runOnJS(handleSwipe)('approve', item);
                else runOnJS(handleSwipe)('deny', item);
            }}
            containerStyle={{ marginVertical: 6 }}
        >
            <AnimatedCard3D
                index={index}
                glowColor={item.riskLevel === 'high' ? theme.colors.status.denied : theme.colors.primary}
                style={{ marginVertical: 0 }} // Remove conflicting margin
                onPress={() => navigation.navigate('VisitorPassScreen', { invite: item })}
            >
                <View style={styles.cardRow}>
                    <Animated.View
                        style={styles.avatar}
                        sharedTransitionTag={`visitor - avatar - ${item.id} `}
                    >
                        {item.photoUrl ? (
                            <Image source={{ uri: item.photoUrl }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{item.visitorName?.[0] || 'V'}</Text>
                        )}
                    </Animated.View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <View style={styles.headerRow}>
                            <Text style={styles.name}>{item.visitorName}</Text>
                            {item.riskLevel === 'high' && (
                                <View style={styles.riskBadge}>
                                    <Ionicons name="warning" size={12} color="#fff" />
                                    <Text style={styles.riskText}>RISK</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.details}>Flat {item.flatNumber} • {item.purpose}</Text>
                        {item.vehicleNumber ? (
                            <View style={styles.vehicleRow}>
                                <Ionicons name="car" size={12} color={theme.colors.text.muted} />
                                <Text style={styles.vehicleText}>{item.vehicleNumber}</Text>
                            </View>
                        ) : null}
                    </View>
                    <StatusBadge status={item.status} />
                </View>
            </AnimatedCard3D>
        </Swipeable>
    );

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Visitor Log"
                    onBack={() => navigation.goBack()}
                />

                <View style={styles.tabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
                        {['all', 'pending', 'approved', 'denied'].map(tab => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setFilter(tab)}
                                style={[styles.tab, filter === tab && styles.activeTab]}
                            >
                                <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                    <CinematicListStagger
                        data={filtered}
                        renderItem={renderItem}
                    />
                </View>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    tabsContainer: {
        paddingVertical: 12,
    },
    tabs: {
        paddingHorizontal: 24,
        flexDirection: 'row',
    },
    tab: {
        marginRight: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tabText: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.secondary,
        fontWeight: '600'
    },
    activeTabText: {
        color: '#fff',
    },
    cardRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 44, height: 44, borderRadius: 16,
        backgroundColor: '#EEF2FF',
        alignItems: 'center', justifyContent: 'center'
    },
    avatarText: { fontSize: 18, color: theme.colors.primary, fontWeight: '700' },
    name: { ...theme.typography.h3, fontSize: 16, color: theme.colors.text.primary },
    details: { ...theme.typography.body1, fontSize: 13, color: theme.colors.text.muted },
    badge: {
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    avatarImage: { width: '100%', height: '100%', borderRadius: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    riskBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.status.denied, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 2 },
    riskText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    vehicleText: { fontSize: 12, color: theme.colors.text.muted, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
    leftAction: {
        flex: 1,
        backgroundColor: theme.colors.status.success,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 20,
        borderRadius: 16,
        marginVertical: 6,
    },
    rightAction: {
        flex: 1,
        backgroundColor: theme.colors.status.danger,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 20,
        borderRadius: 16,
        marginVertical: 6,
    },
    actionText: {
        color: 'white',
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },
});

export default VisitorList;

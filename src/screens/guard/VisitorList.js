import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import CinematicListStagger from '../../components/CinematicListStagger';
import useAuth from '../../hooks/useAuth';
import useVisitors from '../../hooks/useVisitors';
import theme from '../../theme/theme';

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

    const renderItem = ({ item, index }) => (
        // Pass index to 3D card for staggered entry
        <AnimatedCard3D index={index} glowColor={theme.colors.primary} style={{ marginVertical: 6 }}>
            <View style={styles.cardRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.visitorName?.[0] || 'V'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.name}>{item.visitorName}</Text>
                    <Text style={styles.details}>Flat {item.flatNumber} • {item.purpose}</Text>
                </View>
                <StatusBadge status={item.status} />
            </View>
        </AnimatedCard3D>
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
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }
});

export default VisitorList;

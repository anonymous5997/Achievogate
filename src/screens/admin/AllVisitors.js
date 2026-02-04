import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import CinematicListStagger from '../../components/CinematicListStagger';
import useVisitors from '../../hooks/useVisitors';
import theme from '../../theme/theme';

const AllVisitors = ({ navigation }) => {
    const { visitors } = useVisitors('admin');
    const [filter, setFilter] = useState('all');

    const filtered = visitors.filter(v => filter === 'all' || v.status === filter);

    const renderItem = ({ item, index }) => (
        <AnimatedCard3D index={index} style={{ marginBottom: 10 }}>
            <View style={styles.row}>
                <View>
                    <Text style={styles.name}>{item.visitorName}</Text>
                    <Text style={styles.sub}>{item.purpose} • Flat {item.flatNumber}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.status === 'approved' ? '#DCFCE7' : item.status === 'pending' ? '#FEF3C7' : '#FEE2E2' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'approved' ? theme.colors.status.approved : item.status === 'pending' ? theme.colors.status.pending : theme.colors.status.denied }
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        </AnimatedCard3D>
    );

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader title="All Visitors" onBack={() => navigation.goBack()} />

                <View style={styles.tabs}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {['all', 'pending', 'approved', 'denied'].map(f => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setFilter(f)}
                                style={[styles.chip, filter === f && styles.activeChip]}
                            >
                                <Text style={[styles.chipText, filter === f && styles.activeChipText]}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <CinematicListStagger
                        data={filtered}
                        renderItem={renderItem}
                    />
                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    tabs: { paddingVertical: 16, paddingHorizontal: 24 },
    chip: {
        paddingVertical: 8, paddingHorizontal: 20,
        borderRadius: 24,
        backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#E2E8F0',
        marginRight: 12
    },
    activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { ...theme.typography.body1, fontSize: 14, color: theme.colors.text.secondary },
    activeChipText: { color: '#fff', fontWeight: '600' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { ...theme.typography.h3, fontSize: 16, color: theme.colors.text.primary },
    sub: { ...theme.typography.body1, fontSize: 13, color: theme.colors.text.muted },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '700' }
});

export default AllVisitors;

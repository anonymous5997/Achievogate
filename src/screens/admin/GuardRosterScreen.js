import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/theme';

const GuardRosterScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [schedule, setSchedule] = useState({});
    const [loading, setLoading] = useState(true);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        loadRoster();
    }, []);

    const loadRoster = async () => {
        if (!userProfile?.societyId) return;
        setLoading(true);
        const guardService = (await import('../../services/guardService')).default;
        const res = await guardService.getGuards(userProfile.societyId);

        if (res.success) {
            // Mock Scheduling Logic: Distribute guards across shifts
            const roster = {
                Morning: [],
                Evening: [],
                Night: []
            };

            res.guards.forEach(g => {
                const shift = g.shift || 'Morning';
                if (roster[shift]) roster[shift].push(g);
            });

            setSchedule(roster);
        }
        setLoading(false);
    };

    const ShiftSection = ({ title, guards, color }) => (
        <View style={styles.section}>
            <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View style={[styles.countBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.countText, { color }]}>{guards.length} Guards</Text>
                </View>
            </View>

            <FlatList
                horizontal
                data={guards}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <AnimatedCard3D style={styles.guardCard} onPress={() => navigation.navigate('GuardDetailScreen', { guard: item })}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.name[0]}</Text>
                        </View>
                        <Text style={styles.guardName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.gateInfo}>Gate {item.gateNumber}</Text>
                    </AnimatedCard3D>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No guards assigned</Text>}
            />
        </View>
    );

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Shift Roster"
                    subtitle="Weekly Schedule"
                    onBack={() => navigation.goBack()}
                />

                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {/* Date Picker / Week View (Mock) */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekRow}>
                        {weekDays.map((day, i) => (
                            <TouchableOpacity key={day} style={[styles.dayPill, i === 0 && styles.dayPillActive]}>
                                <Text style={[styles.dayText, i === 0 && styles.dayTextActive]}>{day}</Text>
                                <Text style={[styles.dateText, i === 0 && styles.dateTextActive]}>{10 + i}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <ShiftSection title="Morning Shift (6AM - 2PM)" guards={schedule.Morning || []} color="#F59E0B" />
                    <ShiftSection title="Evening Shift (2PM - 10PM)" guards={schedule.Evening || []} color="#10B981" />
                    <ShiftSection title="Night Shift (10PM - 6AM)" guards={schedule.Night || []} color="#3B82F6" />

                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    weekRow: { marginBottom: 24, paddingBottom: 8 },
    dayPill: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#eee' },
    dayPillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    dayText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    dayTextActive: { color: '#fff' },
    dateText: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 4 },
    dateTextActive: { color: '#fff' },

    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderLeftWidth: 4, paddingLeft: 12 },
    sectionTitle: { ...theme.typography.h3, fontSize: 16, marginBottom: 0 },
    countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    countText: { fontSize: 12, fontWeight: '700' },

    list: { paddingRight: 16 },
    guardCard: { width: 120, padding: 12, alignItems: 'center', marginRight: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
    guardName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    gateInfo: { fontSize: 11, color: '#64748b', marginTop: 2 },
    empty: { fontStyle: 'italic', color: '#94a3b8' }
});

export default GuardRosterScreen;

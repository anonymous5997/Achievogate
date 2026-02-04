import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import useVisitors from '../../hooks/useVisitors';
import theme from '../../theme/theme';

const AdminDashboard = ({ navigation }) => {
    const { signOut } = useAuth();
    const { visitors } = useVisitors('admin');

    const stats = [
        { label: 'Total Visits', value: visitors.length, color: theme.colors.primary, icon: 'analytics' },
        { label: 'Flags', value: visitors.filter(v => v.status === 'denied').length, color: theme.colors.status.denied, icon: 'alert-circle' },
        { label: 'Gate', value: 'Active', color: theme.colors.status.active, icon: 'pulse' },
        { label: 'System', value: 'Online', color: theme.colors.status.approved, icon: 'server' },
    ];

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Overview"
                    subTitle="Admin Console"
                    rightAction={
                        <TouchableOpacity onPress={signOut} style={styles.logout}>
                            <Ionicons name="log-out-outline" size={20} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.grid}>
                        {stats.map((s, i) => (
                            <View key={i} style={styles.cellWrapper}>
                                <AnimatedCard3D index={i} delay={i * 100} style={{ minHeight: 110, justifyContent: 'center' }}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                            <Ionicons name={s.icon} size={12} color={theme.colors.text.muted} style={{ marginRight: 4 }} />
                                            <Text style={styles.statLabel}>{s.label}</Text>
                                        </View>
                                    </View>
                                </AnimatedCard3D>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.section}>MANAGEMENT</Text>

                    <AnimatedCard3D delay={400} onPress={() => navigation.navigate('AllVisitors')}>
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                <Ionicons name="reader" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={{ marginLeft: 16 }}>
                                <Text style={styles.moduleTitle}>Visitor Reports</Text>
                                <Text style={styles.moduleSub}>Access full logs and analytics</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} style={{ marginLeft: 'auto' }} />
                        </View>
                    </AnimatedCard3D>

                    <AnimatedCard3D delay={500} onPress={() => navigation.navigate('UserManagement')}>
                        <View style={styles.row}>
                            <View style={[styles.iconBox, { backgroundColor: '#FCE7F3' }]}>
                                <Ionicons name="people" size={24} color={theme.colors.accent} />
                            </View>
                            <View style={{ marginLeft: 16 }}>
                                <Text style={styles.moduleTitle}>User Directory</Text>
                                <Text style={styles.moduleSub}>Manage roles & access</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} style={{ marginLeft: 'auto' }} />
                        </View>
                    </AnimatedCard3D>

                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 24 },
    logout: { padding: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
    cellWrapper: { width: '50%', padding: 8 },
    statValue: { fontSize: 32, fontWeight: '800' },
    statLabel: { ...theme.typography.caption, fontSize: 11, color: theme.colors.text.muted },
    section: { ...theme.typography.caption, marginTop: 32, marginBottom: 12, marginLeft: 4, color: theme.colors.text.muted },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    moduleTitle: { ...theme.typography.h3, fontSize: 16, color: theme.colors.text.primary },
    moduleSub: { ...theme.typography.body1, fontSize: 13, color: theme.colors.text.muted }
});

export default AdminDashboard;

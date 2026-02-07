import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/theme';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d

    // Mock Data State
    const [visitorData, setVisitorData] = useState(null);
    const [complaintData, setComplaintData] = useState([]);
    const [parcelData, setParcelData] = useState(null);

    useFocusEffect(
        useCallback(() => {
            loadAnalytics();
        }, [timeRange])
    );

    const loadAnalytics = async () => {
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            // Mock Data Generation based on timeRange
            const labels = timeRange === '7d' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['W1', 'W2', 'W3', 'W4'];
            const dataPoints = timeRange === '7d'
                ? [20, 45, 28, 80, 99, 43, 50]
                : [300, 450, 320, 500];

            setVisitorData({
                labels: labels,
                datasets: [{ data: dataPoints }]
            });

            setComplaintData([
                { name: 'Open', population: 12, color: '#EF4444', legendFontColor: '#7F7F7F', legendFontSize: 12 },
                { name: 'Progress', population: 5, color: '#F59E0B', legendFontColor: '#7F7F7F', legendFontSize: 12 },
                { name: 'Resolved', population: 40, color: '#10B981', legendFontColor: '#7F7F7F', legendFontSize: 12 },
            ]);

            setParcelData({
                labels: ['Amzn', 'Flipk', 'Myntra', 'Food', 'Other'],
                datasets: [{ data: [50, 20, 15, 40, 10] }]
            });

            setLoading(false);
        }, 1000);
    };

    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, // Primary Color
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader title="Analytics Center" onBack={() => navigation.goBack()} />

                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Time Range:</Text>
                    <View style={styles.pillContainer}>
                        {['7d', '30d'].map(r => (
                            <TouchableOpacity
                                key={r}
                                style={[styles.pill, timeRange === r && styles.pillActive]}
                                onPress={() => setTimeRange(r)}
                            >
                                <Text style={[styles.pillText, timeRange === r && { color: '#fff' }]}>{r.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.content}>

                        {/* Visitor Trends */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="people" size={20} color={theme.colors.primary} />
                                <Text style={styles.cardTitle}>Visitor Traffic</Text>
                            </View>
                            <LineChart
                                data={visitorData}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={styles.chart}
                            />
                        </View>

                        {/* Complaint Resolution */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="alert-circle" size={20} color={theme.colors.secondary} />
                                <Text style={styles.cardTitle}>Complaint Status</Text>
                            </View>
                            <PieChart
                                data={complaintData}
                                width={screenWidth - 64}
                                height={200}
                                chartConfig={chartConfig}
                                accessor={"population"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                absolute
                            />
                        </View>

                        {/* Parcel Volume */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="cube" size={20} color="#F59E0B" />
                                <Text style={styles.cardTitle}>Parcel Sources</Text>
                            </View>
                            <BarChart
                                data={parcelData}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                                }}
                                style={styles.chart}
                                showValuesOnTopOfBars
                            />
                        </View>

                    </ScrollView>
                )}
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 16, paddingBottom: 100 },
    filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
    filterLabel: { fontWeight: '600', color: theme.colors.text.secondary },
    pillContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 4 },
    pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
    pillActive: { backgroundColor: theme.colors.primary },
    pillText: { fontSize: 12, fontWeight: '600', color: theme.colors.text.muted },

    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginLeft: 8, color: '#1E293B' },
    chart: { borderRadius: 16, marginVertical: 8 }
});

export default AnalyticsScreen;

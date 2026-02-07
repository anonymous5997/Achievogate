import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import NeoCard from '../../components/NeoCard';
import theme from '../../theme/theme';

const screenWidth = Dimensions.get('window').width;

const ChartCard = ({ title, children, delay }) => (
    <Animated.View entering={FadeInUp.delay(delay).springify()} style={styles.chartContainer}>
        <NeoCard glass={true} padding={16}>
            <Text style={styles.chartTitle}>{title}</Text>
            {children}
        </NeoCard>
    </Animated.View>
);

const MetricWidget = ({ label, value, trend, trendUp, delay }) => (
    <Animated.View entering={ZoomIn.delay(delay).springify()} style={styles.metricContainer}>
        <NeoCard glass={true} padding={16} style={styles.metricCard}>
            {label === 'TOTAL TRAFFIC' && (
                <View style={{ position: 'absolute', top: 10, right: 10 }}>
                    <FloatingOrb size={30} color={theme.colors.primary} duration={1500} />
                </View>
            )}
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={[styles.metricTrend, { color: trendUp ? '#10B981' : '#EF4444' }]}>
                {trendUp ? '▲' : '▼'} {trend}
            </Text>
        </NeoCard>
    </Animated.View>
);

const AnalyticsDashboard = ({ navigation }) => {
    // Mock Data (Neon Theme)
    const visitorData = {
        labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
        datasets: [{
            data: [20, 45, 28, 80, 99, 43, 50],
            color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`, // Electric Violet
            strokeWidth: 3
        }]
    };

    const complaintData = [
        { name: "Maint.", population: 45, color: "#F87171", legendFontColor: "#CBD5E1", legendFontSize: 10 },
        { name: "Security", population: 28, color: "#60A5FA", legendFontColor: "#CBD5E1", legendFontSize: 10 },
        { name: "Noise", population: 15, color: "#FBBF24", legendFontColor: "#CBD5E1", legendFontSize: 10 },
        { name: "Other", population: 12, color: "#34D399", legendFontColor: "#CBD5E1", legendFontSize: 10 }
    ];

    const chartConfig = {
        backgroundGradientFrom: "transparent",
        backgroundGradientTo: "transparent",
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.7,
        useShadowColorFromDataset: false,
        propsForDots: { r: "4", strokeWidth: "2", stroke: "#8B5CF6" },
        propsForBackgroundLines: { strokeDasharray: "", stroke: "rgba(255,255,255,0.1)" }
    };

    return (
        <CinematicBackground>
            <CinematicHeader title="DATA INSIGHTS" subTitle="REAL-TIME ANALYTICS" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Key Metrics */}
                <View style={styles.metricsRow}>
                    <MetricWidget label="TOTAL TRAFFIC" value="1,248" trend="12% vs last week" trendUp={true} delay={100} />
                    <MetricWidget label="AVG. RESOLUTION" value="4.2h" trend="8% faster" trendUp={true} delay={200} />
                </View>

                {/* Visitor Trends (Line Chart) */}
                <ChartCard title="WEEKLY FOOTFALL" delay={300}>
                    <LineChart
                        data={visitorData}
                        width={screenWidth - 60}
                        height={200}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withDots={true}
                        withInnerLines={true}
                        withOuterLines={false}
                        yAxisInterval={1}
                    />
                </ChartCard>

                {/* Complaint Distribution (Pie Chart) */}
                <ChartCard title="ISSUE CATEGORIES" delay={400}>
                    <PieChart
                        data={complaintData}
                        width={screenWidth - 60}
                        height={200}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute={false}
                        hasLegend={true}
                    />
                </ChartCard>

                {/* Peak Hours (Bar Chart) */}
                <ChartCard title="PEAK ACTIVITY HOURS" delay={500}>
                    <BarChart
                        data={{
                            labels: ["8AM", "12PM", "4PM", "8PM"],
                            datasets: [{ data: [30, 45, 60, 90] }]
                        }}
                        width={screenWidth - 60}
                        height={200}
                        yAxisLabel=""
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`, // Cyber Teal
                        }}
                        style={styles.chart}
                        showValuesOnTopOfBars
                    />
                </ChartCard>

                <View style={{ height: 40 }} />
            </ScrollView>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 20, paddingBottom: 100 },

    // Metrics
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    metricContainer: { width: '48%' },
    metricCard: {
        alignItems: 'flex-start',
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    metricLabel: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
        fontSize: 10,
        marginBottom: 4,
        letterSpacing: 1,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    metricTrend: {
        fontSize: 10,
        fontWeight: '700',
    },

    // Charts
    chartContainer: { marginBottom: 24 },
    chartTitle: {
        ...theme.typography.h3,
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 16,
        letterSpacing: 2,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
});

export default AnalyticsDashboard;

import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import theme from '../../theme/theme';

const screenWidth = Dimensions.get('window').width;

const AnalyticsDashboard = ({ navigation }) => {
    // Mock data for demonstration - in production this would come from analyticsService
    const visitorData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                data: [20, 45, 28, 80, 99, 43, 50],
                color: (opacity = 1) => `rgba(147, 51, 234, ${opacity})`, // primary color
                strokeWidth: 2
            }
        ],
        legend: ["Visitor Traffic"]
    };

    const complaintData = [
        {
            name: "Maintenance",
            population: 45,
            color: "#F87171",
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        },
        {
            name: "Security",
            population: 28,
            color: "#60A5FA",
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        },
        {
            name: "Noise",
            population: 15,
            color: "#FBBF24",
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        },
        {
            name: "Other",
            population: 12,
            color: "#34D399",
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        }
    ];

    const chartConfig = {
        backgroundGradientFrom: "#1E293B",
        backgroundGradientTo: "#0F172A",
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Analytics"
                subtitle="Society Insights"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                <AnimatedCard3D style={styles.card}>
                    <Text style={styles.chartTitle}>Weekly Visitor Trends</Text>
                    <LineChart
                        data={visitorData}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                </AnimatedCard3D>

                <AnimatedCard3D style={styles.card}>
                    <Text style={styles.chartTitle}>Complaints by Category</Text>
                    <PieChart
                        data={complaintData}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        absolute
                    />
                </AnimatedCard3D>

                <View style={styles.spacer} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: 10,
    },
    card: {
        padding: 10,
        marginBottom: 20,
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
    },
    chartTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 10,
        alignSelf: 'flex-start',
        paddingLeft: 10,
    },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    spacer: {
        height: 40,
    }
});

export default AnalyticsDashboard;

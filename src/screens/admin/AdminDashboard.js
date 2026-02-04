import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import WebContainer from '../../components/WebContainer'; // Import the new container
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/theme';

const AdminDashboard = ({ navigation }) => {
    const { userProfile, signOut } = useAuth();

    const menuItems = [
        { title: 'Visitor Logs', icon: 'people', screen: 'AllVisitors', color: '#6366f1' },
        { title: 'Manage Users', icon: 'person-add', screen: 'UserManagement', color: '#10b981' },
        { title: 'Societies', icon: 'business', screen: 'SocietyManagement', color: '#f59e0b' },
        { title: 'Complaints', icon: 'alert-circle', screen: 'ComplaintManagement', color: '#ef4444' },
        { title: 'Analytics', icon: 'stats-chart', screen: 'AnalyticsDashboard', color: '#8b5cf6' },
        { title: 'Vehicles', icon: 'car', screen: 'VehicleManagementScreen', color: '#ec4899' },
    ];

    const handleMenuPress = (screen) => {
        if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
        }
        navigation.navigate(screen);
    };

    return (
        <WebContainer>
            <View style={styles.container}>
                <CinematicBackground />
                <CinematicHeader
                    title="Admin Console"
                    subtitle={`Welcome, ${userProfile?.name || 'Admin'}`}
                    rightIcon="log-out-outline"
                    onRightPress={signOut}
                />

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.grid}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.gridItemContainer}
                                onPress={() => handleMenuPress(item.screen)}
                            >
                                <AnimatedCard3D style={styles.gridItem}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                                        <Ionicons name={item.icon} size={32} color={item.color} />
                                    </View>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                </AnimatedCard3D>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </WebContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: 16,
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
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 160,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        color: theme.colors.text.primary,
        textAlign: 'center',
    },
});

export default AdminDashboard;

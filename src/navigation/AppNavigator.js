import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import useAuth from '../hooks/useAuth';
import theme from '../theme/theme';

// Onboarding
import AddHomeScreen from '../screens/onboarding/AddHomeScreen';
import BuildingSelectionScreen from '../screens/onboarding/BuildingSelectionScreen';
import CitySelectionScreen from '../screens/onboarding/CitySelectionScreen';
import CountrySelectionScreen from '../screens/onboarding/CountrySelectionScreen';
import GetStartedScreen from '../screens/onboarding/GetStartedScreen';
import OTPVerificationScreen from '../screens/onboarding/OTPVerificationScreen';
import UserDetailsScreen from '../screens/onboarding/UserDetailsScreen';

// Auth
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

// Guard
import CreateVisitor from '../screens/guard/CreateVisitor';
import GuardDashboard from '../screens/guard/GuardDashboard';
import ParcelEntryScreen from '../screens/guard/ParcelEntryScreen';
import PriorInviteScreen from '../screens/guard/PriorInviteScreen';
import ScanQRScreen from '../screens/guard/ScanQRScreen';
import VisitorList from '../screens/guard/VisitorList';

// Resident
import BookFacilityScreen from '../screens/resident/BookFacilityScreen';
import CommunityFeedScreen from '../screens/resident/CommunityFeedScreen';
import CreatePostScreen from '../screens/resident/CreatePostScreen';
import FacilityListScreen from '../screens/resident/FacilityListScreen';
import InviteVisitorScreen from '../screens/resident/InviteVisitorScreen';
import MyBookingsScreen from '../screens/resident/MyBookingsScreen';
import MyRequestsScreen from '../screens/resident/MyRequestsScreen';
import PaymentsScreen from '../screens/resident/PaymentsScreen';
import PostDetailScreen from '../screens/resident/PostDetailScreen';
import ProfileScreen from '../screens/resident/ProfileScreen';
import ResidentComplaintScreen from '../screens/resident/ResidentComplaintScreen';
import ResidentDashboard from '../screens/resident/ResidentDashboard';
import ScheduleVisitorScreen from '../screens/resident/ScheduleVisitorScreen';
import ServiceRequestScreen from '../screens/resident/ServiceRequestScreen';
import SettingsScreen from '../screens/resident/SettingsScreen';
import VendorDetailScreen from '../screens/resident/VendorDetailScreen';
import VendorListScreen from '../screens/resident/VendorListScreen';

// Admin
import AdminDashboard from '../screens/admin/AdminDashboard';
import AllVisitors from '../screens/admin/AllVisitors';
import AnalyticsDashboard from '../screens/admin/AnalyticsDashboard';
import ComplaintManagement from '../screens/admin/ComplaintManagement';
import DataManagementScreen from '../screens/admin/DataManagementScreen';
import GuardDetailScreen from '../screens/admin/GuardDetailScreen'; // Import
import GuardListScreen from '../screens/admin/GuardListScreen'; // Import
import GuardRosterScreen from '../screens/admin/GuardRosterScreen'; // Import
import NoticeBoardScreen from '../screens/admin/NoticeBoardScreen';
import ParcelManagementScreen from '../screens/admin/ParcelManagementScreen';
import PaymentManagementScreen from '../screens/admin/PaymentManagementScreen';
import ResidentDetailScreen from '../screens/admin/ResidentDetailScreen';
import ResidentListScreen from '../screens/admin/ResidentListScreen';
import SocietyManagement from '../screens/admin/SocietyManagement';
import UserManagement from '../screens/admin/UserManagement';
import VehicleManagementScreen from '../screens/admin/VehicleManagementScreen';
// Shared
import EmergencyScreen from '../screens/shared/EmergencyScreen';
import ViewNoticesScreen from '../screens/shared/ViewNoticesScreen';
import VisitorPassScreen from '../screens/shared/VisitorPassScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Loading Screen Component
const LoadingScreen = ({ message }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F1A' }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ marginTop: 20, color: '#ffffff', fontSize: 16 }}>{message}</Text>
    </View>
);



// Resident Tab Navigator ... (same) ...
const ResidentTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Visitors') iconName = focused ? 'people' : 'people-outline';
                    else if (route.name === 'Payments') iconName = focused ? 'cash' : 'cash-outline';
                    else if (route.name === 'Account') iconName = focused ? 'person' : 'person-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text.muted,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: 'rgba(255,255,255,0.1)',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
            })}
        >
            <Tab.Screen name="Home" component={ResidentDashboard} />
            <Tab.Screen name="Visitors" component={InviteVisitorScreen} options={{ tabBarBadge: null }} />
            <Tab.Screen name="Payments" component={PaymentsScreen} />
            <Tab.Screen name="Account" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

import CinematicIntro from '../screens/CinematicIntro';

// ... imports

const AppNavigator = () => {
    const { user, userProfile, loading } = useAuth();
    const [onboardingComplete, setOnboardingComplete] = useState(null);
    const [introComplete, setIntroComplete] = useState(false);

    // Explicit Logging for Navigation Logic
    useEffect(() => {
        console.log(`[AppNavigator] State Update -> Loading: ${loading}, Onboarding: ${onboardingComplete}, User: ${!!user}, Role: ${userProfile?.role}`);
    }, [loading, onboardingComplete, user, userProfile]);

    useEffect(() => {
        checkOnboarding();
    }, []);

    const checkOnboarding = async () => {
        try {
            const completed = await AsyncStorage.getItem('onboardingCompleted');
            setOnboardingComplete(completed === 'true');
        } catch (e) {
            console.error('[AppNavigator] Onboarding check failed', e);
            setOnboardingComplete(false); // Fallback
        }
    };

    // 0. Cinematic Intro (Splash)
    if (!introComplete) {
        return <CinematicIntro onComplete={() => setIntroComplete(true)} />;
    }

    // 1. Loading State - Fallback Screen
    if (loading) {
        return <LoadingScreen message="Verifying Authentication..." />;
    }
    if (onboardingComplete === null) {
        return <LoadingScreen message="Checking App Status..." />;
    }

    // 2. Auth Flow - Not Logged In
    if (!user) {
        console.log('[AppNavigator] Rendering Auth/Onboarding Stack');
        return (
            <>
                <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                    {!onboardingComplete ? (
                        <>
                            <Stack.Screen name="OnboardingCarousel" component={NeoOnboarding} />
                            <Stack.Screen name="GetStartedScreen" component={GetStartedScreen} />
                            <Stack.Screen name="UserDetailsScreen" component={UserDetailsScreen} />
                            <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
                            <Stack.Screen name="CountrySelectionScreen" component={CountrySelectionScreen} />
                            <Stack.Screen name="CitySelectionScreen" component={CitySelectionScreen} />
                            <Stack.Screen name="AddHomeScreen" component={AddHomeScreen} />
                            <Stack.Screen name="BuildingSelectionScreen" component={BuildingSelectionScreen} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name="Login" component={CinematicLoginScreen} />
                            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                        </>
                    )}
                </Stack.Navigator>
            </>
        );
    }

    // 3. User Logged In but No Profile (Edge Case)
    if (user && !userProfile) {
        console.log('[AppNavigator] User logged in but missing profile');
        return (
            <>

                <LoadingScreen message="Fetching User Profile..." />
            </>
        );
    }

    // 4. Role Based Navigation
    console.log(`[AppNavigator] Rendering Main Stack for Role: ${userProfile.role}`);

    const renderRoleBasedStack = () => {
        switch (userProfile.role) {
            case 'guard':
                return (
                    <>
                        <Stack.Screen name="GuardDashboard" component={GuardDashboard} />
                        <Stack.Screen name="CreateVisitor" component={CreateVisitor} />
                        <Stack.Screen name="VisitorList" component={VisitorList} />
                        <Stack.Screen name="PriorInviteScreen" component={PriorInviteScreen} />
                        <Stack.Screen name="ParcelEntryScreen" component={ParcelEntryScreen} />
                        <Stack.Screen name="ScanQRScreen" component={ScanQRScreen} />
                        <Stack.Screen name="ViewNoticesScreen" component={ViewNoticesScreen} />
                        <Stack.Screen name="VisitorPassScreen" component={VisitorPassScreen} />
                        <Stack.Screen name="EmergencyScreen" component={EmergencyScreen} />
                    </>
                );

            case 'resident':
                return (
                    <>
                        <Stack.Screen name="ResidentTabs" component={ResidentTabs} />
                        <Stack.Screen name="ScheduleVisitor" component={ScheduleVisitorScreen} />
                        <Stack.Screen name="VisitorPassScreen" component={VisitorPassScreen} />
                        <Stack.Screen name="ResidentComplaint" component={ResidentComplaintScreen} />
                        <Stack.Screen name="ViewNoticesScreen" component={ViewNoticesScreen} />
                        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
                        <Stack.Screen name="EmergencyScreen" component={EmergencyScreen} />
                        <Stack.Screen name="CommunityFeedScreen" component={CommunityFeedScreen} />
                        <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
                        <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} />
                        <Stack.Screen name="FacilityListScreen" component={FacilityListScreen} />
                        <Stack.Screen name="BookFacilityScreen" component={BookFacilityScreen} />
                        <Stack.Screen name="MyBookingsScreen" component={MyBookingsScreen} />
                        <Stack.Screen name="VendorListScreen" component={VendorListScreen} />
                        <Stack.Screen name="VendorDetailScreen" component={VendorDetailScreen} />
                        <Stack.Screen name="ServiceRequestScreen" component={ServiceRequestScreen} />
                        <Stack.Screen name="MyRequestsScreen" component={MyRequestsScreen} />
                    </>
                );

            case 'admin':
                return (
                    <>
                        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
                        <Stack.Screen name="AllVisitors" component={AllVisitors} />
                        <Stack.Screen name="UserManagement" component={UserManagement} />
                        <Stack.Screen name="ResidentListScreen" component={ResidentListScreen} />
                        <Stack.Screen name="ResidentDetailScreen" component={ResidentDetailScreen} />
                        <Stack.Screen name="SocietyManagement" component={SocietyManagement} />
                        <Stack.Screen name="ComplaintManagement" component={ComplaintManagement} />
                        <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboard} />
                        <Stack.Screen name="VehicleManagementScreen" component={VehicleManagementScreen} />
                        <Stack.Screen name="ParcelManagementScreen" component={ParcelManagementScreen} />
                        <Stack.Screen name="NoticeBoardScreen" component={NoticeBoardScreen} />
                        <Stack.Screen name="PaymentManagementScreen" component={PaymentManagementScreen} />
                        <Stack.Screen name="ViewNoticesScreen" component={ViewNoticesScreen} />
                        <Stack.Screen name="DataManagementScreen" component={DataManagementScreen} />
                        <Stack.Screen name="GuardListScreen" component={GuardListScreen} />
                        <Stack.Screen name="GuardDetailScreen" component={GuardDetailScreen} />
                        <Stack.Screen name="GuardRosterScreen" component={GuardRosterScreen} />
                        <Stack.Screen name="EmergencyScreen" component={EmergencyScreen} />
                    </>
                );

            default:
                return (
                    <Stack.Screen name="ResidentTabs" component={ResidentTabs} />
                );
        }
    };

    return (
        <>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                {renderRoleBasedStack()}
            </Stack.Navigator>
        </>
    );
};

export default AppNavigator;

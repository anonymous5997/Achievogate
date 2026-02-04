import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuth from '../hooks/useAuth';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';

// Guard Screens
import CreateVisitor from '../screens/guard/CreateVisitor';
import GuardDashboard from '../screens/guard/GuardDashboard';
import VisitorList from '../screens/guard/VisitorList';

// Resident Screens
import ResidentDashboard from '../screens/resident/ResidentDashboard';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import AllVisitors from '../screens/admin/AllVisitors';
import UserManagement from '../screens/admin/UserManagement';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, userProfile, loading } = useAuth();

    if (loading) {
        return null; // Or a loading screen
    }

    // Auth Stack - when user is not logged in
    if (!user || !userProfile) {
        return (
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
            </Stack.Navigator>
        );
    }

    // Role-based navigation
    const renderRoleBasedStack = () => {
        switch (userProfile.role) {
            case 'guard':
                return (
                    <>
                        <Stack.Screen name="GuardDashboard" component={GuardDashboard} />
                        <Stack.Screen name="CreateVisitor" component={CreateVisitor} />
                        <Stack.Screen name="VisitorList" component={VisitorList} />
                    </>
                );

            case 'resident':
                return (
                    <>
                        <Stack.Screen name="ResidentDashboard" component={ResidentDashboard} />
                    </>
                );

            case 'admin':
                return (
                    <>
                        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
                        <Stack.Screen name="AllVisitors" component={AllVisitors} />
                        <Stack.Screen name="UserManagement" component={UserManagement} />
                    </>
                );

            default:
                // Default to resident if role is unknown
                return (
                    <>
                        <Stack.Screen name="ResidentDashboard" component={ResidentDashboard} />
                    </>
                );
        }
    };

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            {renderRoleBasedStack()}
        </Stack.Navigator>
    );
};

export default AppNavigator;

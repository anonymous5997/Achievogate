import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuth from '../hooks/useAuth';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

// Guard
import CreateVisitor from '../screens/guard/CreateVisitor';
import GuardDashboard from '../screens/guard/GuardDashboard';
import ParcelEntryScreen from '../screens/guard/ParcelEntryScreen';
import PriorInviteScreen from '../screens/guard/PriorInviteScreen';
import ScanQRScreen from '../screens/guard/ScanQRScreen';
import VisitorList from '../screens/guard/VisitorList';

// Resident
import InviteVisitorScreen from '../screens/resident/InviteVisitorScreen';
import ResidentComplaintScreen from '../screens/resident/ResidentComplaintScreen';
import ResidentDashboard from '../screens/resident/ResidentDashboard';
import ScheduleVisitorScreen from '../screens/resident/ScheduleVisitorScreen';

// Admin
import AdminDashboard from '../screens/admin/AdminDashboard';
import AllVisitors from '../screens/admin/AllVisitors';
import ComplaintManagement from '../screens/admin/ComplaintManagement';
import SocietyManagement from '../screens/admin/SocietyManagement';
import UserManagement from '../screens/admin/UserManagement';

// Shared
import ViewNoticesScreen from '../screens/shared/ViewNoticesScreen';
import VisitorPassScreen from '../screens/shared/VisitorPassScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, userProfile, loading } = useAuth();

    if (loading) return null;

    if (!user || !userProfile) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            </Stack.Navigator>
        );
    }

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
                    </>
                );

            case 'resident':
                return (
                    <>
                        <Stack.Screen name="ResidentDashboard" component={ResidentDashboard} />
                        <Stack.Screen name="InviteVisitor" component={InviteVisitorScreen} />
                        <Stack.Screen name="ScheduleVisitor" component={ScheduleVisitorScreen} />
                        <Stack.Screen name="VisitorPassScreen" component={VisitorPassScreen} />
                        <Stack.Screen name="ResidentComplaint" component={ResidentComplaintScreen} />
                        <Stack.Screen name="ViewNoticesScreen" component={ViewNoticesScreen} />
                    </>
                );

            case 'admin':
                return (
                    <>
                        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
                        <Stack.Screen name="AllVisitors" component={AllVisitors} />
                        <Stack.Screen name="UserManagement" component={UserManagement} />
                        <Stack.Screen name="SocietyManagement" component={SocietyManagement} />
                        <Stack.Screen name="ComplaintManagement" component={ComplaintManagement} />
                        <Stack.Screen name="AnalyticsDashboard" component={AnalyticsDashboard} />
                        <Stack.Screen name="VehicleManagementScreen" component={VehicleManagementScreen} />
                        <Stack.Screen name="ViewNoticesScreen" component={ViewNoticesScreen} />
                    </>
                );

            default:
                return (
                    <>
                        <Stack.Screen name="ResidentDashboard" component={ResidentDashboard} />
                        <Stack.Screen name="InviteVisitor" component={InviteVisitorScreen} />
                    </>
                );
        }
    };

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            {renderRoleBasedStack()}
        </Stack.Navigator>
    );
};

export default AppNavigator;

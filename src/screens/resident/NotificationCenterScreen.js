import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import CinematicListStagger from '../../components/CinematicListStagger';
import theme from '../../theme/theme';

// Mock Notifications - Real implementation would fetch from Firestore/Local Storage
const MOCK_NOTIFS = [
    { id: '1', title: 'Visitor Approved', body: 'Rohan (A-101) approved Rahul for entry.', time: '2 mins ago', type: 'success' },
    { id: '2', title: 'New Alert', body: 'Gate maintenance scheduled for tonight.', time: '1 hr ago', type: 'info' },
    { id: '3', title: 'Security Update', body: 'Please update your profile photo.', time: 'yesterday', type: 'warning' },
];

const NotificationCenterScreen = ({ navigation }) => {

    const renderItem = ({ item, index }) => (
        <AnimatedCard3D index={index} style={{ marginBottom: 10 }}>
            <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: getTypeColor(item.type) }]} />
                <View style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.time}>{item.time}</Text>
                    </View>
                    <Text style={styles.body}>{item.body}</Text>
                </View>
            </View>
        </AnimatedCard3D>
    );

    const getTypeColor = (t) => {
        if (t === 'success') return theme.colors.status.approved;
        if (t === 'warning') return theme.colors.status.pending;
        return theme.colors.primary;
    }

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader title="Notifications" onBack={() => navigation.goBack()} />
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <CinematicListStagger
                        data={MOCK_NOTIFS}
                        renderItem={renderItem}
                    />
                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row' },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    title: { fontWeight: '700', fontSize: 16, color: theme.colors.text.primary },
    time: { fontSize: 12, color: theme.colors.text.muted },
    body: { fontSize: 14, color: theme.colors.text.secondary, lineHeight: 20 }
});

export default NotificationCenterScreen;

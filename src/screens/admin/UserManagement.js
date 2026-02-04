import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import CinematicListStagger from '../../components/CinematicListStagger';
import theme from '../../theme/theme';

const UserManagement = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const db = getFirestore();
            const snapshot = await getDocs(collection(db, 'users'));
            const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setUsers(list);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (role) => {
        if (!selectedUser) return;
        try {
            const db = getFirestore();
            await updateDoc(doc(db, 'users', selectedUser.id), { role });
            setSelectedUser(null);
            fetchUsers();
        } catch (e) {
            console.error(e);
        }
    };

    const renderItem = ({ item }) => (
        <AnimatedCard3D onPress={() => setSelectedUser(item)} style={{ marginBottom: 12 }}>
            <View style={styles.row}>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name || 'Unknown'}</Text>
                    <Text style={styles.sub}>{item.phoneNumber}</Text>
                </View>
                <View style={[styles.badge, { borderColor: getRoleColor(item.role), backgroundColor: `${getRoleColor(item.role)}10` }]}>
                    <Text style={[styles.badgeText, { color: getRoleColor(item.role) }]}>
                        {item.role?.toUpperCase() || 'USER'}
                    </Text>
                </View>
            </View>
        </AnimatedCard3D>
    );

    const getRoleColor = (r) => {
        if (r === 'admin') return theme.colors.primary;
        if (r === 'guard') return theme.colors.secondary;
        return theme.colors.text.muted;
    }

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="User Directory"
                    onBack={() => navigation.goBack()}
                    rightAction={
                        <TouchableOpacity onPress={fetchUsers} style={styles.refresh}>
                            <Ionicons name="refresh" size={20} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                    }
                />

                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    {loading ? (
                        <ActivityIndicator color={theme.colors.primary} />
                    ) : (
                        <CinematicListStagger data={users} renderItem={renderItem} />
                    )}
                </ScrollView>

                <Modal visible={!!selectedUser} transparent animationType="fade">
                    <View style={styles.modalBg}>
                        <AnimatedCard3D style={{ width: '80%' }}>
                            <Text style={styles.modalTitle}>Update Role</Text>
                            <Text style={styles.modalSub}>{selectedUser?.name}</Text>

                            {['resident', 'guard', 'admin'].map(r => (
                                <CinematicButton
                                    key={r}
                                    title={r.toUpperCase()}
                                    variant={selectedUser?.role === r ? 'success' : 'outline'}
                                    onPress={() => handleUpdateRole(r)}
                                    style={{ marginVertical: 6 }}
                                />
                            ))}

                            <CinematicButton
                                title="Cancel"
                                variant="ghost"
                                onPress={() => setSelectedUser(null)}
                                style={{ marginTop: 16 }}
                                textStyle={{ color: theme.colors.text.muted }}
                            />
                        </AnimatedCard3D>
                    </View>
                </Modal>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    refresh: { padding: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: { ...theme.typography.h3, fontSize: 16, color: theme.colors.text.primary },
    sub: { ...theme.typography.body1, fontSize: 13, color: theme.colors.text.muted },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    modalTitle: { ...theme.typography.h2, textAlign: 'center', marginBottom: 4, color: theme.colors.text.primary },
    modalSub: { ...theme.typography.body1, textAlign: 'center', marginBottom: 24, color: theme.colors.secondary }
});

export default UserManagement;

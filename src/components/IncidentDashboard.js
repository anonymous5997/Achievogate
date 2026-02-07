import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../components/AnimatedCard3D';
import useAuth from '../hooks/useAuth';
import incidentService from '../services/incidentService';
import theme from '../theme/theme';

const IncidentDashboard = ({ minimal = false }) => {
    const { userProfile } = useAuth();
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        if (!userProfile || !userProfile.societyId) return;

        // Only Admin or Guard should see this
        const unsubscribe = incidentService.subscribeToActiveIncidents(userProfile.societyId, (data) => {
            setIncidents(data);
        });

        return () => unsubscribe();
    }, [userProfile?.societyId]);

    const handleCall = (phone) => {
        if (phone) Linking.openURL(`tel:${phone}`);
    };

    const handleResolve = async (id) => {
        await incidentService.resolveIncident(id, userProfile.id);
    };

    if (!userProfile) return null;
    if (incidents.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.pulseContainer}>
                    <View style={styles.pulse} />
                </View>
                <Text style={styles.title}>ACTIVE EMERGENCIES ({incidents.length})</Text>
            </View>

            <FlatList
                data={incidents.filter(i => i && i.id)}
                keyExtractor={(item, index) => item?.id || index.toString()}
                horizontal={minimal}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => {
                    if (!item) return null;
                    return (
                        <AnimatedCard3D style={styles.alertCard}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBox, { backgroundColor: getSeverityColor(item.type) }]}>
                                    <Ionicons name={getIcon(item.type)} size={24} color="#fff" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.alertType}>{item.type ? item.type.toUpperCase() : 'ALERT'}</Text>
                                    <Text style={styles.alertTime}>{timeAgo(item.createdAt)}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleCall(item.contactPhone)} style={styles.callBtn}>
                                    <Ionicons name="call" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.alertLocation}>📍 {item.location || 'Unknown Location'}</Text>
                            <Text style={styles.alertReporter}>Reported by: {item.reportedByName || 'Unknown'}</Text>

                            {!minimal && (
                                <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item.id)}>
                                    <Text style={styles.resolveText}>MARK RESOLVED</Text>
                                </TouchableOpacity>
                            )}
                        </AnimatedCard3D>
                    );
                }}
            />
        </View>
    );
};

const getSeverityColor = (type) => {
    switch (type) {
        case 'medical': return '#EF4444';
        case 'fire': return '#F59E0B';
        case 'security': return '#3B82F6';
        default: return '#EF4444';
    }
};

const getIcon = (type) => {
    switch (type) {
        case 'medical': return 'medical';
        case 'fire': return 'flame';
        case 'security': return 'shield';
        default: return 'alert-circle';
    }
};

const timeAgo = (timestamp) => {
    if (!timestamp) return '';
    const diff = (new Date() - timestamp.toDate()) / 1000 / 60; // minutes
    return `${Math.floor(diff)} min ago`;
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        backgroundColor: '#FEF2F2',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FECACA'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8
    },
    title: {
        ...theme.typography.h3,
        color: '#DC2626',
        fontWeight: '900',
        letterSpacing: 0.5
    },
    pulseContainer: {
        width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444',
        alignItems: 'center', justifyContent: 'center'
    },
    alertCard: {
        marginBottom: 10,
        backgroundColor: '#fff',
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444'
    },
    cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    alertType: { ...theme.typography.h3, fontSize: 16, color: '#111' },
    alertTime: { ...theme.typography.caption, color: '#666' },
    callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
    alertLocation: { ...theme.typography.h3, fontSize: 18, marginBottom: 4 },
    alertReporter: { ...theme.typography.body1, color: '#666', fontSize: 13 },
    resolveBtn: { marginTop: 12, backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, alignItems: 'center' },
    resolveText: { color: '#666', fontWeight: '700', fontSize: 12 }
});

export default IncidentDashboard;

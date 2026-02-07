import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import WebContainer from '../../components/WebContainer';
import useAuth from '../../hooks/useAuth';
import exportService from '../../services/exportService';
import theme from '../../theme/theme';

const DataManagementScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleExport = async (type) => {
        if (!userProfile?.societyId) return;
        setLoading(true);
        try {
            const res = await exportService.exportToCSV(userProfile.societyId, type);
            if (res.success) {
                Alert.alert('Success', `Exported ${type} data successfully!`);
            } else {
                Alert.alert('Error', res.error || 'Export failed');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        }
        setLoading(false);
    };

    const tools = [
        {
            id: 'export_visitors',
            title: 'Export Visitor Logs',
            desc: 'Download CSV of all visitor history',
            icon: 'people-outline',
            color: '#6366F1',
            action: () => handleExport('visitors')
        },
        {
            id: 'export_residents',
            title: 'Export Resident List',
            desc: 'Download CSV of all residents',
            icon: 'home-outline',
            color: '#10B981',
            action: () => handleExport('residents')
        },
        {
            id: 'export_complaints',
            title: 'Export Complaints',
            desc: 'Download report of all issues',
            icon: 'alert-circle-outline',
            color: '#EF4444',
            action: () => handleExport('complaints')
        },
    ];

    return (
        <WebContainer>
            <View style={styles.container}>
                <CinematicBackground />
                <CinematicHeader
                    title="Data Tools"
                    subtitle="Export & Manage Data"
                    onBack={() => navigation.goBack()}
                />

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionTitle}>Data Exports</Text>
                    {tools.map((tool, index) => (
                        <TouchableOpacity key={tool.id} onPress={tool.action} disabled={loading}>
                            <AnimatedCard3D style={styles.card} index={index}>
                                <View style={[styles.iconBox, { backgroundColor: tool.color + '20' }]}>
                                    <Ionicons name={tool.icon} size={28} color={tool.color} />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{tool.title}</Text>
                                    <Text style={styles.cardDesc}>{tool.desc}</Text>
                                </View>
                                <Ionicons name="download-outline" size={24} color={theme.colors.text.muted} />
                            </AnimatedCard3D>
                        </TouchableOpacity>
                    ))}

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                        <Text style={styles.infoText}>
                            Exports are generated in CSV format and can be shared or saved to your device files.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </WebContainer>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20 },
    sectionTitle: { ...theme.typography.h3, color: theme.colors.text.secondary, marginBottom: 16, textTransform: 'uppercase', fontSize: 13 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 16 },
    iconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    cardContent: { flex: 1 },
    cardTitle: { ...theme.typography.h3, fontSize: 16, color: theme.colors.text.primary, marginBottom: 4 },
    cardDesc: { color: theme.colors.text.muted, fontSize: 13 },
    infoBox: { flexDirection: 'row', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: 16, borderRadius: 12, marginTop: 8, alignItems: 'center' },
    infoText: { flex: 1, marginLeft: 12, color: theme.colors.primary, fontSize: 14, lineHeight: 20 }
});

export default DataManagementScreen;

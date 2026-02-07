import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import exportService from '../../services/exportService';
import theme from '../../theme/theme';

const DataManagementScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [csvText, setCsvText] = useState('');
    const [importing, setImporting] = useState(false);

    const handleExport = (collection) => {
        exportService.exportToCSV(userProfile.societyId, collection);
    };

    const handleImport = async () => {
        if (!csvText.trim()) return;
        setImporting(true);
        const res = await exportService.importResidentsFromCSV(userProfile.societyId, csvText);
        setImporting(false);

        if (res.success) {
            Alert.alert('Success', `Imported ${res.count} residents successfully.`);
            setImportModalVisible(false);
            setCsvText('');
        } else {
            Alert.alert('Error', res.error);
        }
    };

    return (
        <CinematicBackground>
            <StatusBar barStyle="light-content" />
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Data Management"
                    leftIcon="arrow-back"
                    onLeftPress={() => navigation.goBack()}
                />

                <ScrollView contentContainerStyle={styles.content}>

                    <Text style={styles.sectionTitle}>EXPORT DATA (CSV)</Text>
                    <Text style={styles.sectionSub}>Download society records for offline analysis.</Text>

                    <View style={styles.grid}>
                        <ExportCard
                            title="Visitor Logs"
                            icon="people"
                            color="#3B82F6"
                            onPress={() => handleExport('visitors')}
                        />
                        <ExportCard
                            title="Resident List"
                            icon="home"
                            color="#10B981"
                            onPress={() => handleExport('users')}
                        />
                        <ExportCard
                            title="Complaints"
                            icon="alert-circle"
                            color="#F59E0B"
                            onPress={() => handleExport('complaints')}
                        />
                        <ExportCard
                            title="Gate Passes"
                            icon="qr-code"
                            color="#8B5CF6"
                            onPress={() => handleExport('gatePasses')}
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 32 }]}>IMPORT DATA</Text>
                    <Text style={styles.sectionSub}>Bulk onboard residents via CSV paste.</Text>

                    <AnimatedCard3D style={styles.importCard} onPress={() => setImportModalVisible(true)}>
                        <View style={styles.importIcon}>
                            <Ionicons name="cloud-upload" size={32} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>Bulk Import Residents</Text>
                            <Text style={styles.cardSub}>Paste CSV data (Name,Email,Flat...)</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </AnimatedCard3D>

                </ScrollView>

                {/* Import Modal */}
                <Modal visible={importModalVisible} animationType="slide" presentationStyle="pageSheet">
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Import Residents</Text>
                            <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                                <Ionicons name="close" size={28} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.instruction}>
                                Format: Name, Email, Flat, Phone, Role{'\n'}
                                Example: John Doe, john@email.com, A-101, 9999999999, resident
                            </Text>
                            <TextInput
                                style={styles.inputArea}
                                multiline
                                placeholder="Paste CSV data here..."
                                value={csvText}
                                onChangeText={setCsvText}
                                textAlignVertical="top"
                            />
                            <CinematicButton
                                title="Run Import"
                                onPress={handleImport}
                                loading={importing}
                            />
                        </View>
                    </View>
                </Modal>

            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const ExportCard = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
        <AnimatedCard3D style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: color }]}>
                <Ionicons name={icon} size={28} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.downloadText}>Download CSV</Text>
        </AnimatedCard3D>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    content: { padding: 24 },
    sectionTitle: { ...theme.typography.h2, color: theme.colors.text.primary, marginBottom: 4 },
    sectionSub: { ...theme.typography.body1, color: theme.colors.text.muted, marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    cardContainer: { width: '48%', marginBottom: 16 },
    card: { padding: 16, alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    cardTitle: { ...theme.typography.h3, fontSize: 16, marginBottom: 4, textAlign: 'center' },
    cardSub: { ...theme.typography.body1, fontSize: 13, color: '#666' },
    downloadText: { ...theme.typography.caption, color: theme.colors.primary, fontWeight: '600' },

    // Import Card
    importCard: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
    importIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },

    // Modal
    modalContent: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    modalTitle: { ...theme.typography.h2 },
    form: { padding: 20 },
    instruction: { ...theme.typography.caption, color: '#666', marginBottom: 16, backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8 },
    inputArea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, height: 300, marginBottom: 20, fontSize: 14 },
});

export default DataManagementScreen;

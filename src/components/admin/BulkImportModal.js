import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import theme from '../../theme/theme';

const BulkImportModal = ({ visible, onClose, onSuccess }) => {
    const { userProfile } = useAuth();
    const [parsedData, setParsedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState(null);
    const [importing, setImporting] = useState(false);
    const [step, setStep] = useState(1); // 1: Pick, 2: Preview, 3: Result

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setFileName(file.name);
            setLoading(true);

            // Fetch file content (Expo FileSystem or fetch)
            // For web/simplicity in Expo, fetch usually works with local URI
            const response = await fetch(file.uri);
            const text = await response.text();

            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const validRows = results.data.filter(row => row.name && row.phone && row.flatNumber);
                    setParsedData(validRows);
                    setStep(2);
                    setLoading(false);
                },
                error: (error) => {
                    Alert.alert('Parse Error', 'Could not parse CSV file.');
                    setLoading(false);
                }
            });
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to read file.');
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!userProfile?.societyId) return;
        setImporting(true);

        const res = await userService.bulkImportResidents(
            parsedData,
            userProfile.societyId,
            userProfile.uid
        );

        setImporting(false);

        if (res.success) {
            Alert.alert(
                'Import Successful',
                `Imported ${res.summary.successItems} residents successfully.`,
                [{ text: 'OK', onPress: () => { onClose(); onSuccess(); } }]
            );
        } else {
            Alert.alert('Import Failed', res.error);
        }
    };

    const reset = () => {
        setStep(1);
        setParsedData([]);
        setFileName(null);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Bulk Import Residents</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {step === 1 && (
                        <View style={styles.stepContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="document-text-outline" size={48} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.instructions}>
                                Upload a CSV file with the following columns:{"\n\n"}
                                <Text style={{ fontWeight: 'bold' }}>name, phone, email, flatNumber, block, floor, occupantCount</Text>
                            </Text>

                            <TouchableOpacity style={styles.pickBtn} onPress={pickFile}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.pickBtnText}>Select CSV File</Text>}
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.stepContainer}>
                            <View style={styles.previewHeader}>
                                <Text style={styles.previewTitle}>Preview ({parsedData.length} Users)</Text>
                                <TouchableOpacity onPress={reset}>
                                    <Text style={{ color: theme.colors.status.error }}>Change File</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.table} nestedScrollEnabled>
                                {parsedData.slice(0, 10).map((row, i) => (
                                    <View key={i} style={styles.row}>
                                        <Text style={styles.cellName}>{row.name}</Text>
                                        <Text style={styles.cellFlat}>{row.block}-{row.flatNumber}</Text>
                                        <Text style={styles.cellPhone}>{row.phone}</Text>
                                    </View>
                                ))}
                                {parsedData.length > 10 && (
                                    <Text style={styles.moreText}>...and {parsedData.length - 10} more</Text>
                                )}
                            </ScrollView>

                            <TouchableOpacity
                                style={[styles.pickBtn, { backgroundColor: theme.colors.status.active }]}
                                onPress={handleImport}
                                disabled={importing}
                            >
                                {importing ? <ActivityIndicator color="#fff" /> : <Text style={styles.pickBtnText}>Confirm Import</Text>}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    container: { backgroundColor: '#fff', borderRadius: 16, padding: 24, maxHeight: '80%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },

    stepContainer: { alignItems: 'center' },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    instructions: { textAlign: 'center', color: '#64748b', lineHeight: 22, marginBottom: 32 },

    pickBtn: { width: '100%', backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
    pickBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    previewHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
    previewTitle: { fontWeight: '600', color: '#333' },

    table: { width: '100%', maxHeight: 300, marginBottom: 20, borderColor: '#eee', borderWidth: 1, borderRadius: 8 },
    row: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#f1f5f9' },
    cellName: { flex: 2, fontSize: 13, fontWeight: '600', color: '#333' },
    cellFlat: { flex: 1, fontSize: 13, color: '#555' },
    cellPhone: { flex: 1.5, fontSize: 13, color: '#777', textAlign: 'right' },
    moreText: { textAlign: 'center', padding: 12, color: '#999', fontStyle: 'italic' }
});

export default BulkImportModal;

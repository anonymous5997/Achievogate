import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import CinematicInput from '../../components/CinematicInput';
import NeoCard from '../../components/NeoCard';
import NeonButton from '../../components/NeonButton';
import useAuth from '../../hooks/useAuth';
import complaintService from '../../services/complaintService';
import theme from '../../theme/theme';

const PriorityChip = ({ level, selected, onSelect }) => {
    const getColor = () => {
        switch (level) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            default: return theme.colors.primary;
        }
    };
    const color = getColor();

    return (
        <TouchableOpacity
            onPress={() => onSelect(level)}
            style={[
                styles.chip,
                selected && { backgroundColor: `${color}20`, borderColor: color }
            ]}
        >
            <Text style={[styles.chipText, selected && { color: color }]}>{level.toUpperCase()}</Text>
        </TouchableOpacity>
    );
};

const ResidentComplaintScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'maintenance',
        priority: 'medium',
    });
    const [photoUri, setPhotoUri] = useState(null);

    const categories = [
        { id: 'maintenance', label: 'Maintenance', icon: 'construct' },
        { id: 'security', label: 'Security', icon: 'shield-checkmark' },
        { id: 'noise', label: 'Noise', icon: 'volume-high' },
        { id: 'cleanliness', label: 'Cleanliness', icon: 'trash' },
    ];

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission needed');
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [4, 3], quality: 0.7,
        });
        if (!result.canceled) setPhotoUri(result.assets[0].uri);
    };

    const handleSubmit = async () => {
        if (!formData.description) return Alert.alert('Missing Info', 'Description is required.');
        setLoading(true);

        const complaintData = {
            ...formData,
            userId: userProfile.uid || userProfile.id,
            societyId: userProfile.societyId || '',
            flatNumber: userProfile.flatNumber || '',
            photos: photoUri ? [photoUri] : [],
        };

        const result = await complaintService.fileComplaint(complaintData);
        setLoading(false);

        if (result.success) {
            Alert.alert('Complaint Filed', 'We have received your report.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } else {
            Alert.alert('Error', result.error);
        }
    };

    return (
        <CinematicBackground>
            <CinematicHeader title="REPORT ISSUE" subTitle="SUBMIT COMPLAINT" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInDown.springify()}>
                    <NeoCard glass={true} padding={20}>
                        <View style={styles.formGap}>

                            {/* Categories */}
                            <Text style={styles.sectionLabel}>CATEGORY</Text>
                            <View style={styles.grid}>
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.catBtn,
                                            formData.category === cat.id && styles.catBtnActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, category: cat.id })}
                                    >
                                        <Ionicons
                                            name={cat.icon}
                                            size={20}
                                            color={formData.category === cat.id ? '#fff' : theme.colors.text.muted}
                                        />
                                        <Text style={[
                                            styles.catText,
                                            formData.category === cat.id && styles.catTextActive
                                        ]}>{cat.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <CinematicInput
                                label="SUBJECT"
                                value={formData.title}
                                onChangeText={t => setFormData({ ...formData, title: t })}
                                icon={<Ionicons name="chatbubble-ellipses" size={20} color={theme.colors.primary} />}
                            />

                            <CinematicInput
                                label="DETAILS"
                                value={formData.description}
                                onChangeText={t => setFormData({ ...formData, description: t })}
                                multiline
                                numberOfLines={4}
                                icon={<Ionicons name="document-text" size={20} color={theme.colors.secondary} />}
                            />

                            <Text style={styles.sectionLabel}>PRIORITY</Text>
                            <View style={styles.priorityRow}>
                                {['low', 'medium', 'high'].map(p => (
                                    <PriorityChip
                                        key={p}
                                        level={p}
                                        selected={formData.priority === p}
                                        onSelect={l => setFormData({ ...formData, priority: l })}
                                    />
                                ))}
                            </View>

                            <Text style={styles.sectionLabel}>EVIDENCE (OPTIONAL)</Text>
                            {photoUri ? (
                                <View style={styles.photoContainer}>
                                    <Image source={{ uri: photoUri }} style={styles.photo} />
                                    <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.removeBtn}>
                                        <Ionicons name="close" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handleTakePhoto} style={styles.uploadBtn}>
                                    <Ionicons name="camera" size={24} color={theme.colors.text.muted} />
                                    <Text style={styles.uploadText}>Tap to Capture</Text>
                                </TouchableOpacity>
                            )}

                            <NeonButton
                                title="SUBMIT REPORT"
                                onPress={handleSubmit}
                                loading={loading}
                                style={{ marginTop: 12 }}
                            />
                        </View>
                    </NeoCard>
                </Animated.View>
            </ScrollView>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 24 },
    formGap: { gap: 20 },
    sectionLabel: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
        marginLeft: 4,
        marginBottom: 8,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    catBtn: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        gap: 8,
    },
    catBtnActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    catText: { color: theme.colors.text.muted, fontSize: 13, fontWeight: '600' },
    catTextActive: { color: '#fff' },

    priorityRow: { flexDirection: 'row', gap: 10 },
    chip: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    chipText: {
        color: theme.colors.text.muted,
        fontSize: 12,
        fontWeight: '700',
    },

    uploadBtn: {
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    uploadText: { color: theme.colors.text.muted, fontSize: 12, marginTop: 8 },
    photoContainer: { position: 'relative' },
    photo: { width: '100%', height: 200, borderRadius: 12 },
    removeBtn: {
        position: 'absolute', top: 8, right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 12
    }
});

export default ResidentComplaintScreen;

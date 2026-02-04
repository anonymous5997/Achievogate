import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import complaintService from '../../services/complaintService';
import theme from '../../theme/theme';

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
        { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
    ];

    const priorities = ['low', 'medium', 'high'];

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            Alert.alert('Error', 'Please fill in title and description');
            return;
        }

        setLoading(true);
        try {
            const complaintData = {
                ...formData,
                createdBy: userProfile.id,
                createdByRole: 'resident',
                societyId: userProfile.societyId || '',
                flatNumber: userProfile.flatNumber || '',
                photos: photoUri ? [photoUri] : [],
            };

            const result = await complaintService.createComplaint(complaintData);

            if (result.success) {
                Alert.alert(
                    'Success',
                    'Your complaint has been submitted successfully',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('Error', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="File Complaint"
                    subTitle="Report an issue"
                    onBack={() => navigation.goBack()}
                />

                <ScrollView contentContainerStyle={styles.content}>

                    <AnimatedCard3D index={0}>
                        <Text style={styles.infoText}>
                            <Ionicons name="information-circle" size={16} color={theme.colors.primary} />
                            {' '}Your complaint will be reviewed by the admin and assigned for resolution.
                        </Text>
                    </AnimatedCard3D>

                    <AnimatedCard3D index={1}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="Brief description of the issue"
                        />

                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Provide detailed information about the issue"
                            multiline
                            numberOfLines={5}
                        />

                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoryGrid}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryBtn,
                                        formData.category === cat.id && styles.categoryBtnActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, category: cat.id })}
                                >
                                    <Ionicons
                                        name={cat.icon}
                                        size={24}
                                        color={formData.category === cat.id ? theme.colors.primary : theme.colors.text.muted}
                                    />
                                    <Text style={[
                                        styles.categoryText,
                                        formData.category === cat.id && styles.categoryTextActive
                                    ]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.priorityRow}>
                            {priorities.map(pri => (
                                <TouchableOpacity
                                    key={pri}
                                    style={[
                                        styles.priorityChip,
                                        formData.priority === pri && styles.priorityChipActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, priority: pri })}
                                >
                                    <Text style={[
                                        styles.priorityText,
                                        formData.priority === pri && styles.priorityTextActive
                                    ]}>
                                        {pri.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Photo (Optional)</Text>
                        {photoUri ? (
                            <View style={styles.photoContainer}>
                                <Image source={{ uri: photoUri }} style={styles.photo} />
                                <TouchableOpacity
                                    style={styles.removePhotoBtn}
                                    onPress={() => setPhotoUri(null)}
                                >
                                    <Ionicons name="close-circle" size={28} color={theme.colors.status.denied} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.photoPlaceholder}
                                onPress={handleTakePhoto}
                            >
                                <Ionicons name="camera" size={32} color={theme.colors.text.muted} />
                                <Text style={styles.photoText}>Take Photo</Text>
                            </TouchableOpacity>
                        )}

                        <CinematicButton
                            title="Submit Complaint"
                            onPress={handleSubmit}
                            loading={loading}
                            style={{ marginTop: 20 }}
                        />
                    </AnimatedCard3D>

                </ScrollView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 24 },
    infoText: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        padding: 16,
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
    },

    // Form
    label: {
        ...theme.typography.h3,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: theme.colors.text.primary,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },

    // Category
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryBtn: {
        width: '48%',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    categoryBtnActive: {
        borderColor: theme.colors.primary,
        backgroundColor: '#EEF2FF',
    },
    categoryText: {
        ...theme.typography.body1,
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.muted,
        marginTop: 8,
    },
    categoryTextActive: {
        color: theme.colors.primary,
    },

    // Priority
    priorityRow: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    priorityChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    priorityText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.text.secondary,
    },
    priorityTextActive: {
        color: '#fff',
    },

    // Photo
    photoPlaceholder: {
        height: 120,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
    },
    photoText: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.muted,
        marginTop: 8,
    },
    photoContainer: {
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    removePhotoBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 14,
    },
});

export default ResidentComplaintScreen;

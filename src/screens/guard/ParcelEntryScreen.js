import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import useSocieties from '../../hooks/useSocieties';
import flatService from '../../services/flatService'; // NEW
import parcelService from '../../services/parcelService';
import theme from '../../theme/theme';

const ParcelEntryScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const { societies } = useSocieties();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        flatNumber: '',
        description: '',
        carrier: '',
        trackingNumber: '',
    });
    const [photoUri, setPhotoUri] = useState(null);

    // Flat Selector State
    const [flats, setFlats] = useState([]);
    const [loadingFlats, setLoadingFlats] = useState(false);
    const [flatSelectorVisible, setFlatSelectorVisible] = useState(false);

    useEffect(() => {
        if (userProfile?.societyId) {
            setLoadingFlats(true);
            flatService.getFlatsBySociety(userProfile.societyId).then(res => {
                if (res.success) setFlats(res.flats);
                setLoadingFlats(false);
            });
        }
    }, [userProfile?.societyId]);

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
        if (!formData.flatNumber || !formData.description) {
            Alert.alert('Error', 'Please fill in flat number and description');
            return;
        }

        setLoading(true);
        try {
            const parcelData = {
                flatNumber: formData.flatNumber,
                description: formData.description,
                carrier: formData.carrier || 'Unknown',
                trackingNumber: formData.trackingNumber,
                societyId: userProfile.societyId || '',
                createdBy: userProfile.name || 'Guard',
                photoUrl: photoUri // Pass the local URI (Service handles upload ideally, or assumes local for demo)
            };

            const result = await parcelService.addParcel(formData.flatNumber, parcelData);

            if (result.success) {
                Alert.alert('Success', 'Parcel logged successfully', [
                    {
                        text: 'OK',
                        onPress: () => {
                            setFormData({
                                flatNumber: '',
                                description: '',
                                carrier: '',
                                trackingNumber: '',
                            });
                            setPhotoUri(null);
                            navigation.goBack();
                        },
                    },
                ]);
            } else {
                Alert.alert('Error', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to log parcel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Parcel Entry"
                    subTitle="Log a package delivery"
                    onBack={() => navigation.goBack()}
                />

                <ScrollView contentContainerStyle={styles.content}>

                    <AnimatedCard3D index={0}>
                        <Text style={styles.cardTitle}>Parcel Details</Text>

                        {/* Photo */}
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
                                <Text style={styles.photoText}>Take Photo (Optional)</Text>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.label}>Flat Number *</Text>
                        <Text style={styles.label}>Flat Number *</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setFlatSelectorVisible(true)}
                        >
                            <Text style={formData.flatNumber ? styles.selectorText : styles.placeholderText}>
                                {formData.flatNumber || 'Select Flat'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={theme.colors.text.muted} />
                        </TouchableOpacity>

                        {/* Flat Selector Modal */}
                        <Modal visible={flatSelectorVisible} animationType="slide" transparent>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Select Flat</Text>
                                    <ScrollView>
                                        {loadingFlats ? (
                                            <ActivityIndicator color={theme.colors.primary} />
                                        ) : (
                                            flats.map(flat => (
                                                <TouchableOpacity
                                                    key={flat.id}
                                                    style={styles.modalItem}
                                                    onPress={() => {
                                                        setFormData({ ...formData, flatNumber: flat.flatNumber });
                                                        setFlatSelectorVisible(false);
                                                    }}
                                                >
                                                    <Text style={styles.modalItemText}>{flat.flatNumber}</Text>
                                                    <Text style={styles.modalItemSub}>{flat.occupancyStatus}</Text>
                                                </TouchableOpacity>
                                            ))
                                        )}
                                    </ScrollView>
                                    <TouchableOpacity
                                        style={styles.closeBtn}
                                        onPress={() => setFlatSelectorVisible(false)}
                                    >
                                        <Text style={styles.closeBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                        <Text style={styles.label}>Package Description *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="e.g. Amazon Delivery"
                        />

                        <Text style={styles.label}>Carrier</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.carrier}
                            onChangeText={(text) => setFormData({ ...formData, carrier: text })}
                            placeholder="e.g. Amazon, Flipkart, DHL"
                        />

                        <Text style={styles.label}>Tracking Number</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.trackingNumber}
                            onChangeText={(text) => setFormData({ ...formData, trackingNumber: text })}
                            placeholder="Optional"
                        />

                        <CinematicButton
                            title="Log Parcel"
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
    cardTitle: {
        ...theme.typography.h3,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 20,
    },

    // Photo
    photoPlaceholder: {
        height: 160,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: '#F8FAFC',
    },
    photoText: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.muted,
        marginTop: 8,
    },
    photoContainer: {
        marginBottom: 20,
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

    // Form
    label: {
        ...theme.typography.h3,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 8,
        marginTop: 12,
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
    selector: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    selectorText: { fontSize: 15, color: theme.colors.text.primary },
    placeholderText: { fontSize: 15, color: theme.colors.text.muted },

    // Modal
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#1a1a1a',
    },
    modalItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalItemText: { fontSize: 16, fontWeight: '500' },
    modalItemSub: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
    closeBtn: {
        marginTop: 15,
        backgroundColor: '#f4f4f5',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeBtnText: { color: '#333', fontWeight: '600' },
});

export default ParcelEntryScreen;

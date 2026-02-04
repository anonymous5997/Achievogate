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
import useSocieties from '../../hooks/useSocieties';
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
            };

            const result = await parcelService.addParcel(parcelData);

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
                        <TextInput
                            style={styles.input}
                            value={formData.flatNumber}
                            onChangeText={(text) => setFormData({ ...formData, flatNumber: text })}
                            placeholder="e.g. A-101"
                        />

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
});

export default ParcelEntryScreen;

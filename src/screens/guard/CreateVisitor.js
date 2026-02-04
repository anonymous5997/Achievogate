import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D'; // Updated
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper'; // Updated
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import useVisitors from '../../hooks/useVisitors';
import theme from '../../theme/theme';

const CreateVisitor = ({ navigation }) => {
    const { userProfile } = useAuth();
    const { createVisitor } = useVisitors();

    const [formData, setFormData] = useState({
        visitorName: '',
        phone: '',
        flatNumber: '',
        purpose: '',
        photoUrl: null,
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert('Permission needed');
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled) handleInputChange('photoUrl', result.assets[0].uri);
    };

    const handleSubmit = async () => {
        if (!formData.visitorName || !formData.flatNumber) return Alert.alert('Missing Info');
        setLoading(true);
        const result = await createVisitor(formData, userProfile.id);
        setLoading(false);
        if (result.success) {
            Alert.alert('Success', 'Visitor registered');
            navigation.goBack();
        } else {
            Alert.alert('Error', result.error);
        }
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader title="Register Entry" onBack={() => navigation.goBack()} />

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.content}>

                        <View style={styles.photoContainer}>
                            <TouchableOpacity onPress={handleTakePhoto} style={styles.photoBox}>
                                {formData.photoUrl ? (
                                    <Image source={{ uri: formData.photoUrl }} style={styles.photo} />
                                ) : (
                                    <View style={styles.placeholder}>
                                        <Ionicons name="camera" size={32} color={theme.colors.primary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <Text style={styles.photoLabel}>Capture Visitor Photo</Text>
                        </View>

                        <AnimatedCard3D delay={200}>
                            {[
                                { key: 'visitorName', placeholder: 'Visitor Name', icon: 'person' },
                                { key: 'phone', placeholder: 'Phone Number', icon: 'call', keyboard: 'phone-pad' },
                                { key: 'flatNumber', placeholder: 'Flat No (e.g. A-101)', icon: 'home' },
                                { key: 'purpose', placeholder: 'Purpose', icon: 'briefcase' },
                            ].map((field, i) => (
                                <View key={field.key} style={styles.inputRow}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name={field.icon} size={18} color={theme.colors.primary} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={field.placeholder}
                                        placeholderTextColor={theme.colors.text.muted}
                                        value={formData[field.key]}
                                        onChangeText={t => handleInputChange(field.key, t)}
                                        keyboardType={field.keyboard || 'default'}
                                    />
                                </View>
                            ))}

                            <CinematicButton
                                title="Authorize Entry"
                                onPress={handleSubmit}
                                loading={loading}
                                style={{ marginTop: 24 }}
                                icon={<Ionicons name="shield-checkmark" size={20} color="#fff" />}
                            />
                        </AnimatedCard3D>

                    </ScrollView>
                </KeyboardAvoidingView>
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 24 },
    photoContainer: { alignItems: 'center', marginBottom: 32 },
    photoBox: {
        width: 100, height: 100, borderRadius: 30, // Squircle
        backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    photo: { width: '100%', height: '100%', borderRadius: 30 },
    placeholder: {
        width: '100%', height: '100%', borderRadius: 30,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#EEF2FF',
        borderWidth: 2, borderColor: '#fff',
    },
    photoLabel: { ...theme.typography.caption, marginTop: 12, color: theme.colors.text.secondary },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: theme.layout.buttonRadius,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
        borderWidth: 1, borderColor: '#E2E8F0'
    },
    iconCircle: { marginRight: 12 },
    input: {
        flex: 1, color: theme.colors.text.primary, fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        fontWeight: '500'
    }
});

export default CreateVisitor;

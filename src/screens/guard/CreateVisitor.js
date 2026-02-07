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
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import CinematicInput from '../../components/CinematicInput';
import NeoCard from '../../components/NeoCard';
import NeonButton from '../../components/NeonButton';
import useAuth from '../../hooks/useAuth';
import useVisitors from '../../hooks/useVisitors';
import theme from '../../theme/theme';

const CreateVisitor = ({ navigation, route }) => {
    const { userProfile } = useAuth();
    const { createVisitor } = useVisitors();
    const prefill = route.params?.prefill || {};

    const [formData, setFormData] = useState({
        visitorName: prefill.name || '',
        phone: '',
        flatNumber: prefill.flat || '',
        purpose: prefill.type || '',
        vehicleNumber: '',
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
        if (!formData.visitorName || !formData.flatNumber) return Alert.alert('Missing Info', 'Name and Flat Number are required.');
        setLoading(true);

        const payload = {
            ...formData,
            societyId: userProfile.societyId,
            visitorPhone: formData.phone,
        };

        const guardInfo = {
            uid: userProfile.id,
            name: userProfile.name
        };

        const result = await createVisitor(payload, guardInfo);
        setLoading(false);
        if (result.success) {
            Alert.alert('Access Granted', 'Visitor has been registered successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Registration Failed', result.error);
        }
    };

    return (
        <CinematicBackground>
            <CinematicHeader title="NEW ENTRY" subTitle="VISITOR REGISTRATION" onBack={() => navigation.goBack()} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* AI Photo Capture */}
                    <Animated.View entering={ZoomIn.duration(600)} style={styles.photoSection}>
                        <TouchableOpacity onPress={handleTakePhoto} style={styles.viewfinder}>
                            {/* Tactical Corners */}
                            <View style={[styles.corner, styles.tl]} />
                            <View style={[styles.corner, styles.tr]} />
                            <View style={[styles.corner, styles.bl]} />
                            <View style={[styles.corner, styles.br]} />

                            {formData.photoUrl ? (
                                <Image source={{ uri: formData.photoUrl }} style={styles.photo} />
                            ) : (
                                <View style={styles.placeholder}>
                                    <Ionicons name="camera" size={40} color={theme.colors.primary} />
                                    <Text style={styles.photoText}>TAP TO SCAN FACE</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Form Fields */}
                    <Animated.View entering={FadeInDown.delay(300).springify()}>
                        <NeoCard glass={true} padding={20}>
                            <View style={styles.formGrid}>
                                <CinematicInput
                                    label="VISITOR NAME"
                                    value={formData.visitorName}
                                    onChangeText={t => handleInputChange('visitorName', t)}
                                    icon={<Ionicons name="person" size={20} color={theme.colors.primary} />}
                                />

                                <CinematicInput
                                    label="PHONE NUMBER"
                                    value={formData.phone}
                                    onChangeText={t => handleInputChange('phone', t)}
                                    keyboardType="phone-pad"
                                    icon={<Ionicons name="call" size={20} color={theme.colors.secondary} />}
                                />

                                <View style={styles.row}>
                                    <View style={[styles.col, { marginRight: 8 }]}>
                                        <CinematicInput
                                            label="FLAT NO"
                                            value={formData.flatNumber}
                                            onChangeText={t => handleInputChange('flatNumber', t)}
                                            icon={<Ionicons name="home" size={20} color={theme.colors.accent} />}
                                        />
                                    </View>
                                    <View style={[styles.col, { marginLeft: 8 }]}>
                                        <CinematicInput
                                            label="VEHICLE (OPT)"
                                            value={formData.vehicleNumber}
                                            onChangeText={t => handleInputChange('vehicleNumber', t)}
                                            icon={<Ionicons name="car" size={20} color={theme.colors.text.muted} />}
                                        />
                                    </View>
                                </View>

                                <CinematicInput
                                    label="PURPOSE"
                                    value={formData.purpose}
                                    onChangeText={t => handleInputChange('purpose', t)}
                                    icon={<Ionicons name="briefcase" size={20} color={theme.colors.text.muted} />}
                                />

                                <NeonButton
                                    title="AUTHORIZE ENTRY"
                                    onPress={handleSubmit}
                                    loading={loading}
                                    icon={<Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />}
                                    style={{ marginTop: 12 }}
                                />
                            </View>
                        </NeoCard>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    content: { padding: 20, paddingBottom: 100 },
    photoSection: { alignItems: 'center', marginBottom: 32 },
    viewfinder: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    photo: {
        width: 140,
        height: 140,
        borderRadius: 20,
    },
    placeholder: {
        width: 140,
        height: 140,
        borderRadius: 20,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderWidth: 1,
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoText: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontSize: 10,
        marginTop: 8,
        letterSpacing: 1,
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: theme.colors.secondary,
    },
    tl: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
    tr: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
    br: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },

    formGrid: {
        gap: 16,
    },
    row: {
        flexDirection: 'row',
    },
    col: {
        flex: 1,
    },
});

export default CreateVisitor;

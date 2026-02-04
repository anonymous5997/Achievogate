import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import vendorService from '../../services/vendorService';
import theme from '../../theme/theme';

const ServiceRequestScreen = ({ route, navigation }) => {
    const { vendor } = route.params;
    const { userProfile } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scheduledDate, setScheduledDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSubmitting(true);

        const result = await vendorService.createServiceRequest({
            societyId: userProfile.societyId,
            flatId: userProfile.flatId,
            userId: userProfile.uid,
            vendorId: vendor.id,
            category: vendor.category,
            title: title.trim(),
            description: description.trim(),
            scheduledDate: scheduledDate.toISOString(),
            scheduledTime: '10:00',
            estimatedCost: vendor.pricing?.baseCharge || 0
        });

        setSubmitting(false);

        if (result.success) {
            Alert.alert(
                'Request Submitted!',
                'The vendor will respond to your request soon.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } else {
            Alert.alert('Error', result.error || 'Failed to submit request');
        }
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Service Request"
                subtitle={vendor.name}
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                <AnimatedCard3D style={styles.card}>
                    <Text style={styles.label}>Issue Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Leaking kitchen tap"
                        placeholderTextColor={theme.colors.text.muted}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe the issue in detail..."
                        placeholderTextColor={theme.colors.text.muted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Preferred Date</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                        <Text style={styles.dateText}>{scheduledDate.toDateString()}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={scheduledDate}
                            mode="date"
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) setScheduledDate(selectedDate);
                            }}
                        />
                    )}

                    <View style={styles.pricing}>
                        <Text style={styles.pricingLabel}>Estimated Cost</Text>
                        <Text style={styles.pricingAmount}>₹{vendor.pricing?.baseCharge || 0}+</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <Text style={styles.submitButtonText}>
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </Text>
                    </TouchableOpacity>
                </AnimatedCard3D>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        padding: 20,
    },
    label: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 12,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        color: theme.colors.text.primary,
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    textArea: {
        minHeight: 120,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    dateText: {
        color: theme.colors.text.primary,
        fontSize: 16,
        marginLeft: 12,
    },
    pricing: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginVertical: 16,
    },
    pricingLabel: {
        color: theme.colors.text.secondary,
        fontSize: 16,
    },
    pricingAmount: {
        ...theme.typography.h2,
        color: theme.colors.primary,
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ServiceRequestScreen;

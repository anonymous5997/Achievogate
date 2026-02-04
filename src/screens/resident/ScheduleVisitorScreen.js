import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import visitorService from '../../services/visitorService';
import theme from '../../theme/theme';

const ScheduleVisitorScreen = ({ navigation }) => {
    const { profile } = useAuth();
    const [visitorName, setVisitorName] = useState('');
    const [visitorPhone, setVisitorPhone] = useState('');
    const [purpose, setPurpose] = useState('');
    const [scheduledDate, setScheduledDate] = useState(new Date());
    const [scheduledTime, setScheduledTime] = useState(new Date());
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrencePattern, setRecurrencePattern] = useState('daily'); // daily, weekly, monthly
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleScheduleVisitor = async () => {
        if (!visitorName.trim() || !visitorPhone.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            // Create scheduled pre-registration
            const result = await visitorService.createPreRegistration({
                visitorName: visitorName.trim(),
                visitorPhone: visitorPhone.trim(),
                purpose: purpose.trim() || 'Visit',
                flatNumber: profile?.flatNumber || 'N/A',
                residentId: profile?.uid,
                residentName: profile?.name || 'Resident',
                scheduledDate: scheduledDate,
                scheduledTime: scheduledTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                isRecurring,
                recurrencePattern: isRecurring ? recurrencePattern : null,
                autoApprove: false, // Can be made configurable
            });

            if (result.success) {
                alert('Visitor scheduled successfully!');
                navigation.goBack();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            alert('Failed to schedule visitor');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />

            <CinematicHeader
                title="Schedule Visitor"
                subtitle="Plan future visits"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                {/* Visitor Details */}
                <AnimatedCard3D style={styles.card}>
                    <Text style={styles.sectionTitle}>Visitor Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Visitor Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={visitorName}
                            onChangeText={setVisitorName}
                            placeholder="Enter visitor name"
                            placeholderTextColor={theme.colors.text.muted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            value={visitorPhone}
                            onChangeText={setVisitorPhone}
                            placeholder="+91XXXXXXXXXX"
                            keyboardType="phone-pad"
                            placeholderTextColor={theme.colors.text.muted}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Purpose</Text>
                        <TextInput
                            style={styles.input}
                            value={purpose}
                            onChangeText={setPurpose}
                            placeholder="Purpose of visit"
                            placeholderTextColor={theme.colors.text.muted}
                        />
                    </View>
                </AnimatedCard3D>

                {/* Schedule Details */}
                <AnimatedCard3D style={styles.card}>
                    <Text style={styles.sectionTitle}>Schedule Details</Text>

                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                        <Text style={styles.dateText}>
                            {scheduledDate.toLocaleDateString()}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={theme.colors.text.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Ionicons name="time" size={20} color={theme.colors.primary} />
                        <Text style={styles.dateText}>
                            {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={theme.colors.text.muted} />
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={scheduledDate}
                            mode="date"
                            display="default"
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setScheduledDate(selectedDate);
                            }}
                        />
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={scheduledTime}
                            mode="time"
                            display="default"
                            onChange={(event, selectedTime) => {
                                setShowTimePicker(false);
                                if (selectedTime) setScheduledTime(selectedTime);
                            }}
                        />
                    )}
                </AnimatedCard3D>

                {/* Recurring Settings */}
                <AnimatedCard3D style={styles.card}>
                    <TouchableOpacity
                        style={styles.recurringToggle}
                        onPress={() => setIsRecurring(!isRecurring)}
                    >
                        <View style={styles.recurringInfo}>
                            <Ionicons name="repeat" size={24} color={theme.colors.primary} />
                            <Text style={styles.recurringLabel}>Recurring Visitor</Text>
                        </View>
                        <View style={[styles.toggle, isRecurring && styles.toggleActive]}>
                            <View style={[styles.toggleThumb, isRecurring && styles.toggleThumbActive]} />
                        </View>
                    </TouchableOpacity>

                    {isRecurring && (
                        <View style={styles.recurrenceOptions}>
                            {['daily', 'weekly', 'monthly'].map((pattern) => (
                                <TouchableOpacity
                                    key={pattern}
                                    style={[
                                        styles.recurrenceOption,
                                        recurrencePattern === pattern && styles.recurrenceOptionActive
                                    ]}
                                    onPress={() => setRecurrencePattern(pattern)}
                                >
                                    <Text style={[
                                        styles.recurrenceText,
                                        recurrencePattern === pattern && styles.recurrenceTextActive
                                    ]}>
                                        {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </AnimatedCard3D>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleScheduleVisitor}
                    disabled={loading}
                >
                    <Text style={styles.submitText}>
                        {loading ? 'Scheduling...' : 'Schedule Visitor'}
                    </Text>
                </TouchableOpacity>
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
        padding: theme.spacing.container,
    },
    card: {
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        ...theme.typography.h2,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        ...theme.typography.body1,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        marginBottom: 8,
    },
    input: {
        ...theme.typography.body1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: theme.colors.text.primary,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    dateText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: theme.colors.text.primary,
    },
    recurringToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    recurringInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recurringLabel: {
        ...theme.typography.body1,
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginLeft: 12,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E2E8F0',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: theme.colors.primary,
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
    recurrenceOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    recurrenceOption: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    recurrenceOptionActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    recurrenceText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.secondary,
    },
    recurrenceTextActive: {
        color: '#fff',
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitText: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default ScheduleVisitorScreen;

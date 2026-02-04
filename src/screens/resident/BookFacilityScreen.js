import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import facilityService from '../../services/facilityService';
import theme from '../../theme/theme';

const BookFacilityScreen = ({ route, navigation }) => {
    const { facility } = route.params;
    const { userProfile } = useAuth();
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('11:00');
    const [booking, setBooking] = useState(false);

    const timeSlots = [
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    const handleBook = async () => {
        if (startTime >= endTime) {
            Alert.alert('Error', 'End time must be after start time');
            return;
        }

        setBooking(true);

        const result = await facilityService.createBooking({
            facilityId: facility.id,
            societyId: userProfile.societyId,
            userId: userProfile.uid,
            userName: userProfile.name,
            flatNumber: userProfile.flatNumber,
            phone: userProfile.phone,
            bookingDate: date.toISOString().split('T')[0],
            startTime,
            endTime,
            guestCount: 1,
            purpose: 'General use',
            requiresApproval: facility.bookingRules?.requiresApproval || false,
            paymentRequired: facility.pricing?.residentPrice > 0,
            amountPaid: facility.pricing?.residentPrice || 0
        });

        setBooking(false);

        if (result.success) {
            Alert.alert(
                'Success!',
                facility.bookingRules?.requiresApproval
                    ? 'Booking request submitted for approval'
                    : 'Facility booked successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } else if (result.conflict) {
            Alert.alert('Conflict', 'This time slot is already booked. Please choose another time.');
        } else {
            Alert.alert('Error', result.error || 'Failed to book facility');
        }
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title={facility.name}
                subtitle="Book a slot"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                <AnimatedCard3D style={styles.card}>
                    <Text style={styles.label}>Select Date</Text>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                        <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                        <Text style={styles.dateText}>{date.toDateString()}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )}

                    <Text style={styles.label}>Start Time</Text>
                    <View style={styles.timeSlots}>
                        {timeSlots.map((time) => (
                            <TouchableOpacity
                                key={`start-${time}`}
                                style={[
                                    styles.timeSlot,
                                    startTime === time && styles.timeSlotSelected
                                ]}
                                onPress={() => setStartTime(time)}
                            >
                                <Text style={[
                                    styles.timeText,
                                    startTime === time && styles.timeTextSelected
                                ]}>
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>End Time</Text>
                    <View style={styles.timeSlots}>
                        {timeSlots.map((time) => (
                            <TouchableOpacity
                                key={`end-${time}`}
                                style={[
                                    styles.timeSlot,
                                    endTime === time && styles.timeSlotSelected
                                ]}
                                onPress={() => setEndTime(time)}
                            >
                                <Text style={[
                                    styles.timeText,
                                    endTime === time && styles.timeTextSelected
                                ]}>
                                    {time}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {facility.pricing?.residentPrice > 0 && (
                        <View style={styles.pricing}>
                            <Text style={styles.pricingLabel}>Total Amount</Text>
                            <Text style={styles.pricingAmount}>₹{facility.pricing.residentPrice}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.bookButton, booking && styles.bookButtonDisabled]}
                        onPress={handleBook}
                        disabled={booking}
                    >
                        <Text style={styles.bookButtonText}>
                            {booking ? 'Booking...' : 'Confirm Booking'}
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
    timeSlots: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    timeSlot: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginRight: 8,
        marginBottom: 8,
    },
    timeSlotSelected: {
        backgroundColor: theme.colors.primary,
    },
    timeText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    timeTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
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
    bookButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    bookButtonDisabled: {
        opacity: 0.5,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BookFacilityScreen;

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import CinematicInput from '../../components/CinematicInput';
import NeoCard from '../../components/NeoCard';
import NeonButton from '../../components/NeonButton';
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
            Alert.alert('Missing Info', 'Please provide a title and description.');
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
            Alert.alert('Request Sent', 'The vendor has been notified.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', result.error || 'Failed to submit request');
        }
    };

    return (
        <CinematicBackground>
            <CinematicHeader
                title="BOOK SERVICE"
                subTitle={vendor.name.toUpperCase()}
                onBack={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View entering={FadeInDown.duration(500)}>
                    <NeoCard glass={true} padding={20}>
                        <View style={styles.formGap}>
                            <CinematicInput
                                label="ISSUE TITLE"
                                value={title}
                                onChangeText={setTitle}
                                icon={<Ionicons name="pricetag" size={20} color={theme.colors.primary} />}
                            />

                            <CinematicInput
                                label="DESCRIPTION"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                icon={<Ionicons name="document-text" size={20} color={theme.colors.secondary} />}
                            />

                            <View style={styles.dateSection}>
                                <Text style={styles.sectionLabel}>PREFERRED DATE</Text>
                                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                                    <Ionicons name="calendar-outline" size={20} color="#fff" />
                                    <Text style={styles.dateText}>{scheduledDate.toDateString()}</Text>
                                    <Ionicons name="chevron-down" size={16} color={theme.colors.text.muted} />
                                </TouchableOpacity>
                            </View>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={scheduledDate}
                                    mode="date"
                                    minimumDate={new Date()}
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(Platform.OS === 'ios');
                                        if (selectedDate) setScheduledDate(selectedDate);
                                    }}
                                    themeVariant="dark"
                                />
                            )}

                            <View style={styles.costContainer}>
                                <Text style={styles.costLabel}>ESTIMATED COST</Text>
                                <Text style={styles.costValue}>₹{vendor.pricing?.baseCharge || 0}+</Text>
                            </View>

                            <NeonButton
                                title="CONFIRM BOOKING"
                                onPress={handleSubmit}
                                loading={submitting}
                                icon={<Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />}
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
    content: {
        padding: 24,
    },
    formGap: {
        gap: 20,
    },
    dateSection: {
        marginTop: 8,
    },
    sectionLabel: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
        marginBottom: 8,
        marginLeft: 4,
    },
    dateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 12,
        justifyContent: 'space-between',
    },
    dateText: {
        flex: 1,
        color: '#fff',
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
    },
    costContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginTop: 8,
    },
    costLabel: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    costValue: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.primary,
    },
});

export default ServiceRequestScreen;

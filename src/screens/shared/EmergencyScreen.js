import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import alertService from '../../services/alertService';
import theme from '../../theme/theme';

const EmergencyScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [message, setMessage] = useState('');
    const [triggering, setTriggering] = useState(false);

    const triggerPanic = async () => {
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        Alert.alert(
            'Trigger Emergency Alert',
            'This will notify all guards and admins immediately. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'CONFIRM',
                    style: 'destructive',
                    onPress: async () => {
                        setTriggering(true);

                        if (Platform.OS !== 'web') {
                            // Vibrate urgently
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
                            setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);
                        }

                        const result = await alertService.triggerPanicAlert(
                            userProfile,
                            null,
                            message || 'Emergency help needed!'
                        );

                        setTriggering(false);

                        if (result.success) {
                            Alert.alert(
                                'Alert Sent!',
                                'Emergency alert has been sent to all guards and admins.',
                                [{ text: 'OK', onPress: () => navigation.goBack() }]
                            );
                        } else {
                            Alert.alert('Error', 'Failed to send alert. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const emergencyContacts = [
        { name: 'Police', number: '100', icon: 'shield', color: '#3b82f6' },
        { name: 'Fire', number: '101', icon: 'flame', color: '#ef4444' },
        { name: 'Ambulance', number: '102', icon: 'medical', color: '#10b981' },
        { name: 'Society Security', number: '9876543210', icon: 'call', color: '#8b5cf6' },
    ];

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Emergency"
                subtitle="Quick response system"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <View style={styles.content}>
                {/* Panic Button */}
                <AnimatedCard3D style={styles.panicCard}>
                    <Text style={styles.panicTitle}>Panic Alert</Text>
                    <Text style={styles.panicSubtitle}>
                        Instantly notify all guards and admins
                    </Text>

                    <TextInput
                        style={styles.messageInput}
                        placeholder="Optional message (e.g., 'Suspicious person at gate')"
                        placeholderTextColor={theme.colors.text.muted}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        maxLength={200}
                    />

                    <TouchableOpacity
                        style={[styles.panicButton, triggering && styles.panicButtonDisabled]}
                        onPress={triggerPanic}
                        disabled={triggering}
                    >
                        <View style={styles.panicButtonInner}>
                            <Ionicons name="warning" size={40} color="#fff" />
                            <Text style={styles.panicButtonText}>
                                {triggering ? 'SENDING...' : 'TRIGGER PANIC ALERT'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </AnimatedCard3D>

                {/* Emergency Contacts */}
                <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                <View style={styles.contactsGrid}>
                    {emergencyContacts.map((contact, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.contactCard}
                            onPress={() => {
                                if (Platform.OS !== 'web') {
                                    Haptics.selectionAsync();
                                }
                                Alert.alert(
                                    contact.name,
                                    `Call ${contact.number}?`,
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Call', onPress: () => {
                                                // In production, use Linking.openURL(`tel:${contact.number}`)
                                                Alert.alert('Call', `Calling ${contact.number}...`);
                                            }
                                        }
                                    ]
                                );
                            }}
                        >
                            <View style={[styles.contactIcon, { backgroundColor: contact.color + '20' }]}>
                                <Ionicons name={contact.icon} size={28} color={contact.color} />
                            </View>
                            <Text style={styles.contactName}>{contact.name}</Text>
                            <Text style={styles.contactNumber}>{contact.number}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Safety Tips */}
                <AnimatedCard3D style={styles.tipsCard}>
                    <View style={styles.tipHeader}>
                        <Ionicons name="bulb" size={20} color={theme.colors.status.warning} />
                        <Text style={styles.tipTitle}>Safety Tips</Text>
                    </View>
                    <Text style={styles.tipText}>• Use panic button only for genuine emergencies</Text>
                    <Text style={styles.tipText}>• Keep emergency contacts handy</Text>
                    <Text style={styles.tipText}>• Stay calm and provide clear information</Text>
                    <Text style={styles.tipText}>• Lock doors if feeling unsafe</Text>
                </AnimatedCard3D>
            </View>
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
    panicCard: {
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    panicTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginBottom: 8,
    },
    panicSubtitle: {
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    messageInput: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: theme.colors.text.primary,
        marginBottom: 20,
        minHeight: 60,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    panicButton: {
        width: '100%',
        backgroundColor: theme.colors.status.error,
        borderRadius: 12,
        padding: 20,
        shadowColor: theme.colors.status.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    panicButtonDisabled: {
        opacity: 0.5,
    },
    panicButtonInner: {
        alignItems: 'center',
    },
    panicButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 16,
    },
    contactsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    contactCard: {
        width: '48%',
        backgroundColor: 'rgba(30,30,30,0.8)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    contactIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactName: {
        ...theme.typography.h3,
        fontSize: 14,
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    contactNumber: {
        color: theme.colors.text.secondary,
        fontSize: 12,
    },
    tipsCard: {
        padding: 16,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tipTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginLeft: 8,
    },
    tipText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
});

export default EmergencyScreen;

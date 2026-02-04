import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import theme from '../../theme/theme';

const SettingsScreen = ({ navigation }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [visitorAlerts, setVisitorAlerts] = useState(true);
    const [paymentReminders, setPaymentReminders] = useState(true);
    const [communityUpdates, setCommunityUpdates] = useState(false);

    const settingsSections = [
        {
            title: 'Notifications',
            items: [
                {
                    icon: 'notifications',
                    label: 'Push Notifications',
                    value: notificationsEnabled,
                    onToggle: setNotificationsEnabled
                },
                {
                    icon: 'person-add',
                    label: 'Visitor Alerts',
                    value: visitorAlerts,
                    onToggle: setVisitorAlerts
                },
                {
                    icon: 'cash',
                    label: 'Payment Reminders',
                    value: paymentReminders,
                    onToggle: setPaymentReminders
                },
                {
                    icon: 'people',
                    label: 'Community Updates',
                    value: communityUpdates,
                    onToggle: setCommunityUpdates
                }
            ]
        },
        {
            title: 'Privacy',
            items: [
                {
                    icon: 'lock-closed',
                    label: 'Change Password',
                    isButton: true,
                    onPress: () => console.log('Change password')
                },
                {
                    icon: 'shield-checkmark',
                    label: 'Privacy Policy',
                    isButton: true,
                    onPress: () => console.log('Privacy policy')
                }
            ]
        },
        {
            title: 'App',
            items: [
                {
                    icon: 'information-circle',
                    label: 'About',
                    isButton: true,
                    value: 'Version 1.0.0',
                    onPress: () => console.log('About')
                },
                {
                    icon: 'help-circle',
                    label: 'Help & Support',
                    isButton: true,
                    onPress: () => console.log('Help')
                }
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Settings"
                subtitle="Preferences & Configuration"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <AnimatedCard3D style={styles.settingsCard}>
                            {section.items.map((item, itemIndex) => (
                                <View key={itemIndex}>
                                    {item.isButton ? (
                                        <TouchableOpacity
                                            style={styles.settingRow}
                                            onPress={item.onPress}
                                        >
                                            <View style={styles.settingLeft}>
                                                <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
                                                <Text style={styles.settingLabel}>{item.label}</Text>
                                            </View>
                                            {item.value ? (
                                                <Text style={styles.settingValue}>{item.value}</Text>
                                            ) : (
                                                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
                                            )}
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.settingRow}>
                                            <View style={styles.settingLeft}>
                                                <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
                                                <Text style={styles.settingLabel}>{item.label}</Text>
                                            </View>
                                            <Switch
                                                value={item.value}
                                                onValueChange={item.onToggle}
                                                trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                                                thumbColor={item.value ? theme.colors.primary : '#f4f3f4'}
                                            />
                                        </View>
                                    )}
                                    {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                                </View>
                            ))}
                        </AnimatedCard3D>
                    </View>
                ))}
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
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 12,
        marginTop: 8,
    },
    settingsCard: {
        padding: 4,
        marginBottom: 20,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingLabel: {
        color: theme.colors.text.primary,
        fontSize: 16,
        marginLeft: 12,
    },
    settingValue: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 12,
    },
});

export default SettingsScreen;

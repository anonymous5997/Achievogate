import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import useAuth from '../hooks/useAuth';
import guardService from '../services/guardService';
import theme from '../theme/theme';
import NeoCard from './NeoCard';
import NeonButton from './NeonButton';

const PulseIndicator = ({ active }) => {
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        if (active) {
            opacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
        } else {
            opacity.value = 0.5;
        }
    }, [active]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.pulse, { backgroundColor: active ? theme.colors.status.active : theme.colors.status.offline }, animatedStyle]} />
    );
};

const GuardAttendanceCard = () => {
    const { userProfile } = useAuth();
    const [isOnDuty, setIsOnDuty] = useState(userProfile?.isOnDuty || false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsOnDuty(userProfile?.isOnDuty || false);
    }, [userProfile]);

    const handleToggleDuty = async () => {
        setLoading(true);
        const action = isOnDuty ? 'check_out' : 'check_in';
        const res = await guardService.markAttendance(userProfile.uid, userProfile.societyId, action);

        if (res.success) {
            setIsOnDuty(!isOnDuty);
            Alert.alert(isOnDuty ? 'Off Duty' : 'On Duty', isOnDuty ? 'Shift ended.' : 'Shift started successfully.');
        } else {
            Alert.alert('Error', res.error);
        }
        setLoading(false);
    };

    return (
        <NeoCard style={styles.card} glass={true}>
            <View style={styles.header}>
                <View style={styles.statusRow}>
                    <PulseIndicator active={isOnDuty} />
                    <View>
                        <Text style={styles.title}>SHIFT STATUS</Text>
                        <Text style={[styles.subtitle, { color: isOnDuty ? theme.colors.text.primary : theme.colors.text.muted }]}>
                            {isOnDuty ? 'ACTIVE DUTY' : 'OFFLINE'}
                        </Text>
                    </View>
                </View>
                <Ionicons
                    name={isOnDuty ? "shield-checkmark" : "shield-outline"}
                    size={32}
                    color={isOnDuty ? theme.colors.primary : theme.colors.text.muted}
                />
            </View>

            <NeonButton
                title={isOnDuty ? "END SHIFT" : "START SHIFT"}
                onPress={handleToggleDuty}
                variant={isOnDuty ? "danger" : "primary"}
                loading={loading}
                style={styles.btn}
                icon={<Ionicons name={isOnDuty ? "log-out" : "log-in"} size={20} color="#fff" style={{ marginRight: 8 }} />}
            />
        </NeoCard>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    pulse: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    title: {
        ...theme.typography.caption,
        fontSize: 10,
        color: theme.colors.text.muted,
        letterSpacing: 1,
    },
    subtitle: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    btn: {
        width: '100%',
    }
});

export default GuardAttendanceCard;

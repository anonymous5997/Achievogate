import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';
import theme from '../theme/theme';
import GlassCard from './GlassCard';

const StatCard = ({ label, value, icon, color = theme.colors.primary, index = 0 }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
        translateY.value = withDelay(index * 100, withTiming(0, { duration: 500 }));
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[styles.wrapper, animatedStyle]}>
            <GlassCard style={styles.card} padding="large">
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                        <Ionicons name={icon} size={24} color={color} />
                    </View>
                    <Text style={styles.value} numberOfLines={1}>{value}</Text>
                </View>
                <Text style={styles.label}>{label}</Text>
            </GlassCard>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        minWidth: '45%', // Ensure 2 per row mostly
    },
    card: {
        height: 140,
        justifyContent: 'space-between',
    },
    header: {
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    value: {
        ...theme.typography.h2,
        fontSize: 28,
    },
    label: {
        ...theme.typography.body2,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
});

export default StatCard;

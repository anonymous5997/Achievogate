import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import theme from '../theme/theme';

const CinematicCard = ({
    children,
    style,
    index = 0,
    delay = 0,
    onPress,
    glowColor = theme.colors.glow.primary
}) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(30);
    const scale = useSharedValue(0.92);
    const borderOpacity = useSharedValue(0);

    useEffect(() => {
        const startDelay = delay + (index * 80);

        // Smooth Staggered Entry
        opacity.value = withDelay(startDelay, withTiming(1, { duration: 500 }));
        translateY.value = withDelay(startDelay, withSpring(0, { damping: 14 }));
        scale.value = withDelay(startDelay, withTiming(1, { duration: 500 }));

        // Flash border on entry (subtle)
        borderOpacity.value = withDelay(
            startDelay + 400,
            withSequence(
                withTiming(0.6, { duration: 600 }),
                withTiming(0, { duration: 600 })
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    const borderStyle = useAnimatedStyle(() => ({
        borderColor: glowColor,
        opacity: borderOpacity.value,
    }));

    const Content = (
        <View style={styles.surface}>
            <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />

            {/* White Overlay for definition */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />

            {/* Gradient Sheen */}
            <LinearGradient
                colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.2)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            <View style={[styles.content, { padding: theme.spacing.lg }]}>
                {children}
            </View>

            <Animated.View style={[styles.border, borderStyle]} />
        </View>
    );

    if (onPress) {
        return (
            <Animated.View style={[styles.container, animatedStyle, style]}>
                <TouchableOpacity
                    activeOpacity={0.94}
                    onPress={onPress}
                    style={styles.touchable}
                >
                    {Content}
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[styles.container, animatedStyle, style]}>
            {Content}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 8,
        // Soft Card Shadow
        shadowColor: theme.colors.text.secondary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    touchable: {
        width: '100%',
    },
    surface: {
        borderRadius: theme.layout.cardRadius,
        overflow: 'hidden',
        backgroundColor: '#fff', // fallback
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: theme.layout.cardRadius,
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    content: {
        width: '100%',
    }
});

export default CinematicCard;

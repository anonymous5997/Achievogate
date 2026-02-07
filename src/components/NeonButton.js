import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    withTiming
} from 'react-native-reanimated';
import { usePhysicsGesture } from '../hooks/usePhysicsGesture';
import { MotionTokens } from '../motion/MotionTokens';
import theme from '../theme/theme';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const NeonButton = ({ onPress, title, variant = 'primary', loading = false, style, icon }) => {
    // Physics Hook
    const { tapGesture, animatedStyle, values } = usePhysicsGesture({
        onPress: !loading ? onPress : undefined,
        scaleOnPress: true,
    });

    const { isPressed } = values;

    const getColors = () => {
        switch (variant) {
            case 'secondary': return theme.colors.gradients.secondary;
            case 'danger': return theme.colors.gradients.danger;
            case 'outline': return ['transparent', 'transparent'];
            default: return theme.colors.gradients.primary;
        }
    };

    const isOutline = variant === 'outline';
    const colors = getColors();

    // Derived Animations
    const glowStyle = useAnimatedStyle(() => {
        const opacity = isPressed.value
            ? withTiming(MotionTokens.light.glow.press, { duration: 100 })
            : withTiming(MotionTokens.light.glow.idle, { duration: 300 });

        const scaleGlow = isPressed.value
            ? withTiming(1.1, { duration: 100 })
            : withTiming(1.0, { duration: 300 });

        return {
            opacity,
            transform: [{ scale: scaleGlow }]
        };
    });

    return (
        <GestureDetector gesture={tapGesture}>
            <Animated.View style={[styles.container, style, animatedStyle]}>
                <AnimatedGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.gradient,
                        isOutline && { borderWidth: 1, borderColor: theme.colors.primary }
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            {icon && icon}
                            <Text style={[styles.text, isOutline && { color: theme.colors.primary }]}>
                                {title}
                            </Text>
                        </>
                    )}
                </AnimatedGradient>

                {/* Active Glow (Only for Filled Buttons) */}
                {!isOutline && !loading && (
                    <AnimatedGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.glow, glowStyle]}
                    />
                )}
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: theme.layout.buttonRadius,
        marginVertical: 8,
    },
    gradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: theme.layout.buttonRadius,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        zIndex: 2,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        marginLeft: 8,
    },
    glow: {
        position: 'absolute',
        bottom: -6,
        left: 20,
        right: 20,
        height: 20,
        borderRadius: 20,
        zIndex: 1,
        // Elevation for Android
        elevation: 8,
    }
});

export default NeonButton;

import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { usePhysicsGesture } from '../hooks/usePhysicsGesture';
import { MotionTokens } from '../motion/MotionTokens';
import theme from '../theme/theme';

const AnimatedCard3D = ({
    children,
    style,
    index = 0,
    glowColor = theme.colors.primary,
    onPress,
}) => {
    // Physics Hook
    const { tapGesture, animatedStyle, values } = usePhysicsGesture({
        onPress,
        scaleOnPress: true,
        tiltEffect: true,
    });

    const { isPressed } = values;

    // Entry Animation
    const entryStyle = useAnimatedStyle(() => ({
        opacity: withDelay(index * MotionTokens.timing.stagger, withTiming(1, { duration: 500 })),
        transform: [
            { translateY: withDelay(index * MotionTokens.timing.stagger, withSpring(0, MotionTokens.springs.enter)) }
        ]
    }));

    // Glow Border style
    const glowStyle = useAnimatedStyle(() => ({
        opacity: isPressed.value ? withTiming(1) : withTiming(0.3),
        borderColor: isPressed.value ? glowColor : 'rgba(255,255,255,0.1)',
        borderWidth: isPressed.value ? 2 : 1,
    }));

    const Content = (
        <Animated.View style={[styles.surface, animatedStyle, glowStyle]}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.65)' }]} />
            <View style={styles.padding}>{children}</View>
        </Animated.View>
    );

    return (
        <GestureDetector gesture={tapGesture}>
            <Animated.View style={[styles.container, style, entryStyle]}>
                {Content}
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    surface: {
        borderRadius: theme.layout.cardRadius,
        overflow: 'hidden',
    },
    padding: {
        padding: 20,
    }
});

export default AnimatedCard3D;

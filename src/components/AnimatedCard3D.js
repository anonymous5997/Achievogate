import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

/**
 * AnimatedCard3D
 * Glass card with gesture-driven press feedback using Reanimated
 */

const AnimatedCard3D = ({
    children,
    style,
    onPress,
}) => {
    const scale = useSharedValue(1);
    const shadowOpacity = useSharedValue(0.1);

    const tapGesture = Gesture.Tap()
        .onBegin(() => {
            'worklet';
            scale.value = withSpring(0.97, {
                damping: 25,
                stiffness: 200,
            });
            shadowOpacity.value = withSpring(0.15);
        })
        .onFinalize(() => {
            'worklet';
            scale.value = withSpring(1);
            shadowOpacity.value = withSpring(0.1);
        })
        .onEnd(() => {
            if (onPress) {
                onPress();
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        shadowOpacity: shadowOpacity.value,
    }));

    const Content = (
        <Animated.View style={[styles.surface, animatedStyle]}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.65)' }]} />
            <View style={styles.padding}>{children}</View>
        </Animated.View>
    );

    if (onPress) {
        return (
            <GestureDetector gesture={tapGesture}>
                <Animated.View style={[styles.container, style]}>
                    {Content}
                </Animated.View>
            </GestureDetector>
        );
    }

    return (
        <Animated.View style={[styles.container, style]}>
            {Content}
        </Animated.View>
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
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    padding: {
        padding: 20,
    }
});

export default AnimatedCard3D;

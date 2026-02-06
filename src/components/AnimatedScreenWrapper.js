import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

/**
 * AnimatedScreenWrapper
 * Screen wrapper with cinematic entrance animation
 */

const AnimatedScreenWrapper = ({ children, style, noPadding = false }) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.94);
    const translateY = useSharedValue(30);

    useEffect(() => {
        // Cinematic entrance
        opacity.value = withTiming(1, {
            duration: 500,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        scale.value = withSpring(1, {
            damping: 20,
            stiffness: 90,
        });
        translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 90,
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
        ],
    }));

    return (
        <Animated.View style={[styles.container, noPadding && styles.noPadding, style, animatedStyle]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    noPadding: {
        padding: 0,
    }
});

export default AnimatedScreenWrapper;

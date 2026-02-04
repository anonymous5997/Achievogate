import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { animationPresets } from '../theme/animationPresets';

// Reusable animated wrapper for any content (staggered entry)
const AnimatedCard = ({ children, index = 0, delay = null, style }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(12);

    useEffect(() => {
        // Calculate delay: explicit delay prop OR stagger based on index
        const startDelay = delay !== null ? delay : index * animationPresets.cardEntry.stagger;

        opacity.value = withDelay(startDelay, withTiming(1, { duration: animationPresets.cardEntry.duration }));
        translateY.value = withDelay(startDelay, withSpring(0, { damping: 15, stiffness: 100 }));
    }, [index, delay]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle, style]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});

export default AnimatedCard;

import { useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { MotionTokens } from '../motion/MotionTokens';

/**
 * Custom hook for consistent spring animations
 * @param {number} initialValue - Initial value for the shared value
 * @param {object} config - Optional config (defaults to micro spring)
 */
export const useMotionSpring = (initialValue = 0, config = MotionTokens.springs.micro) => {
    const value = useSharedValue(initialValue);

    const animateTo = (target) => {
        'worklet';
        value.value = withSpring(target, config);
    };

    const animateToWithDelay = (target, delay) => {
        'worklet';
        value.value = withDelay(delay, withSpring(target, config));
    };

    // Quick helper for looping animations (e.g., pulsing)
    // For more complex loops use useEffect with withRepeat

    return {
        value,
        animateTo,
        animateToWithDelay
    };
};

/**
 * Hook for staggered list item entrance
 * @param {number} index - Index of the item in the list
 */
export const useStaggeredEntrance = (index) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    const enter = () => {
        'worklet';
        const delay = index * MotionTokens.timing.staggerDelay;
        opacity.value = withDelay(delay, withTiming(1, { duration: MotionTokens.timing.fadeIn }));
        translateY.value = withDelay(delay, withSpring(0, MotionTokens.springs.enter));
    };

    return { opacity, translateY, enter };
};

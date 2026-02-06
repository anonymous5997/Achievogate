import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { springConfigs, timingConfigs } from './springConfigs';

/**
 * Cinematic Entrance Hook
 * Automatically triggers on mount with Netflix-style entrance
 * 
 * @param delay - Optional delay before animation starts (ms)
 * @param config - Optional spring config override
 * @returns Animated style object
 */

interface CinematicEnterOptions {
    delay?: number;
    springConfig?: typeof springConfigs.cinematic;
    timingConfig?: typeof timingConfigs.slow;
    initialScale?: number;
    initialTranslateY?: number;
}

export const useCinematicEnter = (options: CinematicEnterOptions = {}) => {
    const {
        delay = 0,
        springConfig = springConfigs.cinematic,
        timingConfig = timingConfigs.slow,
        initialScale = 0.94,
        initialTranslateY = 30,
    } = options;

    // Shared values
    const opacity = useSharedValue(0);
    const scale = useSharedValue(initialScale);
    const translateY = useSharedValue(initialTranslateY);

    // Trigger animation on mount
    useEffect(() => {
        const timeout = setTimeout(() => {
            opacity.value = withTiming(1, { ...timingConfig, delay });
            scale.value = withSpring(1, { ...springConfig, delay });
            translateY.value = withSpring(0, { ...springConfig, delay });
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay]);

    // Animated style
    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
        ],
    }));

    return animatedStyle;
};

/**
 * Cinematic Enter with Control
 * Manually trigger entrance animation
 */
export const useCinematicEnterControlled = (options: CinematicEnterOptions = {}) => {
    const {
        springConfig = springConfigs.cinematic,
        timingConfig = timingConfigs.slow,
        initialScale = 0.94,
        initialTranslateY = 30,
    } = options;

    const opacity = useSharedValue(0);
    const scale = useSharedValue(initialScale);
    const translateY = useSharedValue(initialTranslateY);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value },
        ],
    }));

    const enter = (delay = 0) => {
        opacity.value = withTiming(1, { ...timingConfig, delay });
        scale.value = withSpring(1, { ...springConfig, delay });
        translateY.value = withSpring(0, { ...springConfig, delay });
    };

    const exit = () => {
        opacity.value = withTiming(0, timingConfigs.fast);
        scale.value = withTiming(initialScale, timingConfigs.fast);
        translateY.value = withTiming(initialTranslateY, timingConfigs.fast);
    };

    return { animatedStyle, enter, exit };
};

export default useCinematicEnter;

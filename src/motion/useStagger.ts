import { useEffect, useMemo } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { delayPresets, springConfigs, timingConfigs } from './springConfigs';

/**
 * Stagger Hook
 * Creates staggered entrance animations for lists and grids
 * Waterfall cascade effect
 * 
 * @param count - Number of items to stagger
 * @param delay - Delay between each item (ms)
 * @param config - Spring configuration
 * @returns Array of animated styles
 */

interface UseStaggerOptions {
    count: number;
    delay?: number;
    springConfig?: typeof springConfigs.soft;
    timingConfig?: typeof timingConfigs.fast;
    initialTranslateY?: number;
    enabled?: boolean;
}

export const useStagger = (options: UseStaggerOptions) => {
    const {
        count,
        delay = delayPresets.xs,
        springConfig = springConfigs.soft,
        timingConfig = timingConfigs.fast,
        initialTranslateY = 20,
        enabled = true,
    } = options;

    // Create shared values for each item
    const opacities = useMemo(
        () => Array.from({ length: count }, () => useSharedValue(0)),
        [count]
    );

    const translateYs = useMemo(
        () => Array.from({ length: count }, () => useSharedValue(initialTranslateY)),
        [count, initialTranslateY]
    );

    // Trigger stagger animation on mount
    useEffect(() => {
        if (!enabled) return;

        opacities.forEach((opacity, index) => {
            opacity.value = withTiming(1, {
                ...timingConfig,
                delay: index * delay,
            });
        });

        translateYs.forEach((translateY, index) => {
            translateY.value = withSpring(0, {
                ...springConfig,
                delay: index * delay,
            });
        });
    }, [count, delay, enabled]);

    // Create animated styles for each item
    const animatedStyles = useMemo(
        () =>
            opacities.map((opacity, index) =>
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useAnimatedStyle(() => ({
                    opacity: opacity.value,
                    transform: [{ translateY: translateYs[index].value }],
                }))
            ),
        [opacities, translateYs]
    );

    return animatedStyles;
};

/**
 * Stagger Single Item Hook
 * For individual item in a list (more flexible than useStagger)
 */
export const useStaggerItem = (index: number, options: Partial<UseStaggerOptions> = {}) => {
    const {
        delay = delayPresets.xs,
        springConfig = springConfigs.soft,
        timingConfig = timingConfigs.fast,
        initialTranslateY = 20,
        enabled = true,
    } = options;

    const opacity = useSharedValue(0);
    const translateY = useSharedValue(initialTranslateY);

    useEffect(() => {
        if (!enabled) return;

        const itemDelay = index * delay;

        opacity.value = withTiming(1, {
            ...timingConfig,
            delay: itemDelay,
        });

        translateY.value = withSpring(0, {
            ...springConfig,
            delay: itemDelay,
        });
    }, [index, delay, enabled]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return animatedStyle;
};

/**
 * Controlled Stagger Hook
 * Manually trigger stagger animation
 */
export const useControlledStagger = (count: number, options: Partial<UseStaggerOptions> = {}) => {
    const {
        delay = delayPresets.xs,
        springConfig = springConfigs.soft,
        timingConfig = timingConfigs.fast,
        initialTranslateY = 20,
    } = options;

    const opacities = useMemo(
        () => Array.from({ length: count }, () => useSharedValue(0)),
        [count]
    );

    const translateYs = useMemo(
        () => Array.from({ length: count }, () => useSharedValue(initialTranslateY)),
        [count, initialTranslateY]
    );

    const animatedStyles = useMemo(
        () =>
            opacities.map((opacity, index) =>
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useAnimatedStyle(() => ({
                    opacity: opacity.value,
                    transform: [{ translateY: translateYs[index].value }],
                }))
            ),
        [opacities, translateYs]
    );

    const trigger = () => {
        opacities.forEach((opacity, index) => {
            opacity.value = withTiming(1, {
                ...timingConfig,
                delay: index * delay,
            });
        });

        translateYs.forEach((translateY, index) => {
            translateY.value = withSpring(0, {
                ...springConfig,
                delay: index * delay,
            });
        });
    };

    const reset = () => {
        opacities.forEach((opacity) => {
            opacity.value = 0;
        });

        translateYs.forEach((translateY) => {
            translateY.value = initialTranslateY;
        });
    };

    return { animatedStyles, trigger, reset };
};

export default useStagger;

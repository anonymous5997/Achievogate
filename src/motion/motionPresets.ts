import { withSpring, withTiming } from 'react-native-reanimated';
import { delayPresets, easingCurves, springConfigs, timingConfigs } from './springConfigs';

/**
 * Reanimated Worklet-Based Motion Presets
 * Netflix/JioHotstar-style cinematic animations
 * Target: 60fps, native driver compatible
 */

/**
 * Cinematic Screen Entrance
 * Scale from 0.94 + fade + slide up
 */
export const cinematicEnter = (delay = 0) => ({
    opacity: withTiming(1, { ...timingConfigs.slow, delay }),
    transform: [
        { scale: withSpring(1, { ...springConfigs.cinematic, delay }) },
        { translateY: withSpring(0, { ...springConfigs.cinematic, delay }) },
    ],
});

export const cinematicEnterInitial = {
    opacity: 0,
    transform: [{ scale: 0.94 }, { translateY: 30 }],
};

/**
 * Card 3D Rise (with stagger support)
 * Perfect for card grids and lists
 */
export const card3DRise = (index = 0) => ({
    opacity: withTiming(1, {
        ...timingConfigs.normal,
        delay: index * delayPresets.sm
    }),
    transform: [
        {
            scale: withSpring(1, {
                ...springConfigs.cinematic,
                delay: index * delayPresets.sm
            })
        },
        {
            translateY: withSpring(0, {
                ...springConfigs.cinematic,
                delay: index * delayPresets.sm
            })
        },
    ],
});

export const card3DRiseInitial = {
    opacity: 0,
    transform: [{ scale: 0.9 }, { translateY: 60 }],
};

/**
 * Hero Reveal
 * Parallax float reveal for headers
 */
export const heroReveal = (delay = 0) => ({
    opacity: withTiming(1, { ...timingConfigs.slow, delay }),
    transform: [
        {
            scale: withTiming(1, {
                duration: timingConfigs.slow.duration,
                easing: easingCurves.expoOut,
                delay
            })
        },
        {
            translateY: withTiming(0, {
                duration: timingConfigs.slow.duration,
                easing: easingCurves.expoOut,
                delay
            })
        },
    ],
});

export const heroRevealInitial = {
    opacity: 0,
    transform: [{ scale: 1.1 }, { translateY: -30 }],
};

/**
 * Stagger Item
 * Waterfall cascade for lists
 */
export const staggerItem = (index = 0) => ({
    opacity: withTiming(1, {
        ...timingConfigs.fast,
        delay: index * delayPresets.xs
    }),
    transform: [
        {
            translateY: withSpring(0, {
                ...springConfigs.soft,
                delay: index * delayPresets.xs
            })
        },
    ],
});

export const staggerItemInitial = {
    opacity: 0,
    transform: [{ translateY: 20 }],
};

/**
 * Modal Lift
 * Scale from depth with overlay fade
 */
export const modalLift = (delay = 0) => ({
    opacity: withTiming(1, { ...timingConfigs.normal, delay }),
    transform: [
        { scale: withSpring(1, { ...springConfigs.cinematic, delay }) },
        { translateY: withSpring(0, { ...springConfigs.cinematic, delay }) },
    ],
});

export const modalLiftInitial = {
    opacity: 0,
    transform: [{ scale: 0.9 }, { translateY: 100 }],
};

export const modalExit = {
    opacity: withTiming(0, timingConfigs.fast),
    transform: [
        { scale: withTiming(0.9, timingConfigs.fast) },
        { translateY: withTiming(100, timingConfigs.fast) },
    ],
};

/**
 * Sheet Slide Up
 * Bottom sheet entrance
 */
export const sheetSlideUp = (delay = 0) => ({
    transform: [
        { translateY: withSpring(0, { ...springConfigs.snappy, delay }) },
    ],
});

export const sheetSlideUpInitial = {
    transform: [{ translateY: 1000 }],
};

/**
 * Fade In/Out
 * Simple opacity transitions
 */
export const fadeIn = (delay = 0) => ({
    opacity: withTiming(1, { ...timingConfigs.normal, delay }),
});

export const fadeOut = () => ({
    opacity: withTiming(0, timingConfigs.fast),
});

export const fadeInitial = {
    opacity: 0,
};

/**
 * Scale Press
 * Press feedback animation
 */
export const scalePress = (pressed: boolean) => ({
    transform: [
        { scale: withSpring(pressed ? 0.95 : 1, springConfigs.snappy) },
    ],
});

/**
 * Glow Press
 * Shadow/glow intensity on press
 */
export const glowPress = (pressed: boolean) => ({
    shadowOpacity: withSpring(pressed ? 0.3 : 0.15, springConfigs.snappy),
    elevation: withSpring(pressed ? 8 : 4, springConfigs.snappy),
});

/**
 * Rotate Flip (3D Card)
 * Y-axis rotation for flip effect
 */
export const rotateFlip = (flipped: boolean) => ({
    transform: [
        {
            rotateY: withSpring(flipped ? '180deg' : '0deg', {
                ...springConfigs.cinematic,
                damping: 18,
            }),
        },
    ],
});

/**
 * Parallax Scroll
 * Header parallax based on scroll offset
 */
export const parallaxScroll = (scrollY: number, factor = 0.5) => ({
    transform: [
        { translateY: -scrollY * factor },
    ],
});

/**
 * Float Loop
 * Continuous floating animation
 */
export const floatLoop = () => ({
    transform: [
        {
            translateY: withTiming(-8, {
                duration: 3000,
                easing: easingCurves.expoInOut,
            })
        },
    ],
});

export const floatInitial = {
    transform: [{ translateY: 0 }],
};

export default {
    cinematicEnter,
    cinematicEnterInitial,
    card3DRise,
    card3DRiseInitial,
    heroReveal,
    heroRevealInitial,
    staggerItem,
    staggerItemInitial,
    modalLift,
    modalLiftInitial,
    modalExit,
    sheetSlideUp,
    sheetSlideUpInitial,
    fadeIn,
    fadeOut,
    fadeInitial,
    scalePress,
    glowPress,
    rotateFlip,
    parallaxScroll,
    floatLoop,
    floatInitial,
};

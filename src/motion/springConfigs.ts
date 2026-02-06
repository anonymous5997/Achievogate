import { Easing } from 'react-native-reanimated';

/**
 * Spring Physics Configurations
 * Carefully tuned for cinematic, premium feel
 */

export const springConfigs = {
    // Cinematic (Netflix-style): Smooth, elegant, professional
    cinematic: {
        damping: 20,
        stiffness: 90,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    },

    // Soft: Gentle, floaty, calm
    soft: {
        damping: 15,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    },

    // Bouncy: Playful, energetic (use sparingly)
    bouncy: {
        damping: 10,
        stiffness: 120,
        mass: 0.8,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    },

    // Snappy: Quick, responsive, precise
    snappy: {
        damping: 25,
        stiffness: 200,
        mass: 0.5,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    },

    // Gentle: Ultra-smooth for large movements
    gentle: {
        damping: 30,
        stiffness: 80,
        mass: 1.2,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    },
};

/**
 * Timing Configurations
 * For precise, controlled animations
 */

export const timingConfigs = {
    // Fast: Quick transitions (200ms)
    fast: {
        duration: 200,
        easing: Easing.out(Easing.cubic),
    },

    // Normal: Standard transitions (300ms)
    normal: {
        duration: 300,
        easing: Easing.out(Easing.cubic),
    },

    // Slow: Cinematic, dramatic (500ms)
    slow: {
        duration: 500,
        easing: Easing.bezier(0.16, 1, 0.3, 1), // Expo out
    },

    // Ultra Slow: Hero moments (800ms)
    ultraSlow: {
        duration: 800,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
    },

    // Linear: Constant speed (use for loops)
    linear: {
        duration: 300,
        easing: Easing.linear,
    },
};

/**
 * Delay Presets
 * For stagger effects
 */

export const delayPresets = {
    xs: 50,   // Subtle stagger
    sm: 80,   // Standard stagger
    md: 120,  // Pronounced stagger
    lg: 180,  // Dramatic stagger
    xl: 250,  // Ultra-dramatic stagger
};

/**
 * Easing Curves
 * Custom bezier curves for specific effects
 */

export const easingCurves = {
    // Expo curves
    expoOut: Easing.bezier(0.16, 1, 0.3, 1),
    expoIn: Easing.bezier(0.7, 0, 0.84, 0),
    expoInOut: Easing.bezier(0.87, 0, 0.13, 1),

    // Cubic curves
    cubicOut: Easing.bezier(0.33, 1, 0.68, 1),
    cubicIn: Easing.bezier(0.32, 0, 0.67, 0),
    cubicInOut: Easing.bezier(0.65, 0, 0.35, 1),

    // Circ curves (sharp acceleration)
    circOut: Easing.bezier(0, 0.55, 0.45, 1),
    circIn: Easing.bezier(0.55, 0, 1, 0.45),

    // Back curves (overshoot)
    backOut: Easing.bezier(0.34, 1.56, 0.64, 1),
    backIn: Easing.bezier(0.36, 0, 0.66, -0.56),
};

export default {
    springConfigs,
    timingConfigs,
    delayPresets,
    easingCurves,
};

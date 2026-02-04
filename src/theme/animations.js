// AchievoGate Design System - Premium Soft-Cinematic Animations
import { Easing } from 'react-native';

// ✅ SAFE DURATIONS - Won't crash
export const durations = {
    micro: 120,        // Micro-interactions, icon pulses
    short: 200,        // Button press, small movements
    card: 320,         // Card enter animations
    medium: 300,       // Screen transitions
    screen: 420,       // Complex screen transitions
    long: 400,         // Hero animations
};

// ✅ SAFE EASING - Smooth curves
export const easing = {
    default: Easing.inOut(Easing.ease),
    easeOut: Easing.out(Easing.cubic),
    easeOutCubic: Easing.out(Easing.cubic),
    easeIn: Easing.in(Easing.ease),
    linear: Easing.linear,
    spring: { tension: 40, friction: 7 },      // Soft spring
    softBounce: { tension: 50, friction: 5 }, // Gentle bounce
};

// ✅ SAFE ANIMATION PRESETS
export const animationPresets = {
    // Card Enter: Fade + TranslateY + Slight Scale
    cardEnter: {
        from: {
            opacity: 0,
            translateY: 20,
            scale: 0.98
        },
        to: {
            opacity: 1,
            translateY: 0,
            scale: 1
        },
        duration: durations.card,
        easing: easing.easeOutCubic,
        useNativeDriver: true,
    },

    // Fade In (Simple)
    fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
        duration: durations.medium,
        useNativeDriver: true,
    },

    // Fade Out
    fadeOut: {
        from: { opacity: 1 },
        to: { opacity: 0 },
        duration: durations.short,
        useNativeDriver: true,
    },

    // Slide Up
    slideUp: {
        from: { translateY: 30, opacity: 0 },
        to: { translateY: 0, opacity: 1 },
        duration: durations.medium,
        useNativeDriver: true,
    },

    // Slide Down
    slideDown: {
        from: { translateY: -30, opacity: 0 },
        to: { translateY: 0, opacity: 1 },
        duration: durations.medium,
        useNativeDriver: true,
    },

    // Scale In
    scaleIn: {
        from: { scale: 0.95, opacity: 0 },
        to: { scale: 1, opacity: 1 },
        duration: durations.medium,
        useNativeDriver: true,
    },

    // Scale Out
    scaleOut: {
        from: { scale: 1, opacity: 1 },
        to: { scale: 0.95, opacity: 0 },
        duration: durations.short,
        useNativeDriver: true,
    },

    // Button Press (Scale + Glow)
    buttonPress: {
        from: { scale: 1 },
        to: { scale: 0.96 },
        duration: durations.micro,
        useNativeDriver: true,
    },

    // Icon Pulse (Micro)
    iconPulse: {
        from: { scale: 1 },
        to: { scale: 1.1 },
        duration: durations.micro,
        useNativeDriver: true,
    },

    // Screen Enter
    screenEnter: {
        from: {
            opacity: 0,
            translateY: 40,
            scale: 0.96
        },
        to: {
            opacity: 1,
            translateY: 0,
            scale: 1
        },
        duration: durations.screen,
        easing: easing.easeOutCubic,
        useNativeDriver: true,
    },
};

// ✅ SAFE STAGGER DELAYS
export const staggerDelays = {
    list: 80,      // For list items (80ms between each)
    card: 100,     // For cards (100ms between each)
    quick: 50,     // Quick stagger
};

// ✅ SAFE MOTION HELPERS
export const motionHelpers = {
    // Calculate stagger delay for list items
    getStaggerDelay: (index, baseDelay = 80) => index * baseDelay,

    // Safe spring config
    getSafeSpring: () => ({
        tension: 40,
        friction: 7,
        useNativeDriver: true,
    }),

    // Safe timing config
    getSafeTiming: (duration = 300) => ({
        duration,
        easing: easing.easeOutCubic,
        useNativeDriver: true,
    }),
};

export default {
    durations,
    easing,
    animationPresets,
    staggerDelays,
    motionHelpers,
};

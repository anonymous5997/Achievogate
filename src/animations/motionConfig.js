// AchievoGate Cinematic Motion System Configuration
// Netflix/JioHotstar inspired motion design
// Safe for Expo Go - uses Animated API

import { Easing } from 'react-native';

export const motionConfig = {
    // Timing presets
    timing: {
        micro: 120,      // Icon pulses, micro-interactions
        fast: 200,       // Button press
        normal: 320,     // Card animations
        screen: 420,     // Screen transitions
        hero: 700,       // Hero section animations
        intro: 3000,     // Splash intro
    },

    // Easing curves
    easing: {
        standard: Easing.out(Easing.cubic),
        enter: Easing.out(Easing.exp),
        exit: Easing.in(Easing.cubic),
        spring: { tension: 40, friction: 7 },        // Soft spring
        springBounce: { tension: 50, friction: 5 },  // Gentle bounce
    },

    // Screen transitions
    screenTransitions: {
        push: {
            in: {
                scale: { from: 0.94, to: 1 },
                translateY: { from: 24, to: 0 },
                opacity: { from: 0, to: 1 },
            },
            out: {
                scale: { from: 1, to: 1.05 },
                opacity: { from: 1, to: 0.6 },
            },
        },
        modal: {
            in: {
                translateY: { from: 80, to: 0 },
                scale: { from: 0.96, to: 1 },
            },
            out: {
                translateY: { from: 0, to: 80 },
                opacity: { from: 1, to: 0 },
            },
        },
    },

    // Card presets
    cardPresets: {
        enter: {
            translateY: { from: 28, to: 0 },
            scale: { from: 0.96, to: 1 },
            opacity: { from: 0, to: 1 },
            stagger: 60,
        },
        press: {
            scale: 0.97,
            duration: 140,
        },
        heroFloat: {
            loop: true,
            translateY: { from: -6, to: 6 },
            duration: 2600,
        },
    },

    // List stagger
    listStagger: {
        baseDelay: 40,
        maxDelay: 220,
    },

    // Button presets
    buttonPresets: {
        primaryPress: {
            scale: 0.95,
            duration: 140,
        },
        successFeedback: {
            pulse: true,
            duration: 400,
        },
    },

    // Icon micro-interactions
    iconInteractions: {
        tap: {
            scale: { from: 1, to: 1.18, back: 1 },
            duration: 220,
        },
        pulse: {
            loop: true,
            scale: { from: 1, to: 1.1 },
            duration: 800,
        },
    },

    // 3D flip (basic - Animated API version)
    flip3D: {
        perspective: 900,
        duration: 600,
    },

    // Parallax
    parallax: {
        layers: 3,
        depthSpeed: [0.3, 0.6, 1],
    },
};

export default motionConfig;

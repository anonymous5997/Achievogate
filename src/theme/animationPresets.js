import { Easing } from 'react-native-reanimated';

// Cinematic Motion Presets
// "Product Trailer" Physics

const DURATIONS = {
    enter: 600,
    stagger: 80,
    fast: 300,
    slow: 1000,
};

// Custom Cubic Easing (GSAP-like)
// easeOutExpo for snaps, easeInOutCubic for smooth moves
const EASING = {
    spring: {
        damping: 12,
        stiffness: 100,
        mass: 1,
    },
    smooth: Easing.bezier(0.25, 0.1, 0.25, 1), // ease
    elastic: Easing.elastic(1),
};

export const animationPresets = {
    // Screen Entry
    screenEnter: {
        from: {
            opacity: 0,
            scale: 0.96,
            translateY: 20,
        },
        to: {
            opacity: 1,
            scale: 1,
            translateY: 0,
        },
        transition: {
            type: 'timing',
            duration: DURATIONS.enter,
            easing: EASING.smooth,
        },
    },

    // Staggered List Items
    listStagger: (index) => ({
        from: { opacity: 0, translateY: 40, scale: 0.9 },
        to: { opacity: 1, translateY: 0, scale: 1 },
        delay: index * DURATIONS.stagger,
        config: {
            duration: 500,
            easing: EASING.smooth,
        },
    }),

    // Interactive Press
    press: {
        active: { scale: 0.94 },
        idle: { scale: 1 },
        config: { type: 'spring', ...EASING.spring },
    },

    // Floating Loop
    float: {
        from: { translateY: 0 },
        to: { translateY: -6 },
        config: {
            duration: 2000,
            easing: Easing.inOut(Easing.sine),
            loop: true,
            yoyo: true, // Reanimated usage differs, logic handled in component
        }
    },

    // Blur Focus
    blurReveal: {
        from: { opacity: 0, blur: 10 },
        to: { opacity: 1, blur: 0 },
    }
};

export default animationPresets;

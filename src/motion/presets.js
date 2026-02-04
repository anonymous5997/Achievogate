import { Easing } from 'react-native-reanimated';
import { motionTheme } from './motionTheme';

// Moti Variants & Reanimated Presets
// "Product Trailer" Style Physics

export const presets = {
    // Screen Entrance: Depth Fade + Slide Up
    cinematicEnter: {
        from: {
            opacity: 0,
            scale: 0.94,
            translateY: motionTheme.depth.translateYEntry,
        },
        animate: {
            opacity: 1,
            scale: 1,
            translateY: 0,
        },
        transition: {
            type: 'spring',
            ...motionTheme.springs.cinematic,
        },
    },

    // Card: 3D Rise from bottom (Stagger compatible)
    card3DRise: (index = 0) => ({
        from: {
            opacity: 0,
            translateY: 60,
            scale: 0.9,
        },
        animate: {
            opacity: 1,
            translateY: 0,
            scale: 1,
        },
        transition: {
            type: 'spring',
            ...motionTheme.springs.cinematic,
            delay: index * motionTheme.delays.sm,
        },
    }),

    // Header: Parallax float reveal
    heroReveal: {
        from: {
            opacity: 0,
            translateY: -30,
            scale: 1.1,
        },
        animate: {
            opacity: 1,
            translateY: 0,
            scale: 1,
        },
        transition: {
            type: 'timing',
            duration: motionTheme.durations.slow,
            easing: Easing.bezier(...motionTheme.easings.expoOut),
        },
    },

    // List Item: Waterfall Cascade
    staggerItem: (index) => ({
        from: {
            opacity: 0,
            translateY: 20,
        },
        animate: {
            opacity: 1,
            translateY: 0,
        },
        transition: {
            type: 'spring',
            ...motionTheme.springs.soft,
            delay: index * motionTheme.delays.xs,
        },
    }),

    // Modal: Lift from depth
    modalLift: {
        from: {
            opacity: 0,
            translateY: 100,
            scale: 0.9,
        },
        animate: {
            opacity: 1,
            translateY: 0,
            scale: 1,
        },
        exit: {
            opacity: 0,
            translateY: 100,
            scale: 0.9,
        },
        transition: {
            type: 'spring',
            ...motionTheme.springs.cinematic,
        },
    },

    // Floating Loop (Hover)
    floatLoop: {
        from: { translateY: 0 },
        animate: { translateY: -8 },
        transition: {
            loop: true,
            type: 'timing',
            duration: 3000,
            easing: Easing.inOut(Easing.sine),
        }
    }
};

export default presets;

import { Easing } from 'react-native-reanimated';

export const MotionTokens = {
    springs: {
        // Core Navigation (Spatial Transitions)
        enter: {
            damping: 15,
            stiffness: 120,
            mass: 1,
            overshootClamping: false,
        },
        exit: {
            damping: 18,
            stiffness: 120,
            mass: 0.8,
        },
        // Physical Interactions (Buttons, Cards)
        bouncy: {
            damping: 12,
            stiffness: 200,
            mass: 1.2,
        },
        snappy: {
            damping: 20,
            stiffness: 300,
            mass: 0.6,
        },
        // Micro-interactions (Toggles, Checkboxes)
        micro: {
            damping: 15,
            stiffness: 350,
            mass: 0.5,
        },
        // Heavy Elements (Bottom Sheets, Modals)
        viscous: {
            damping: 30,
            stiffness: 180,
            mass: 1.5,
        }
    },
    timing: {
        stagger: 50,           // ms between list items
        cinematicShort: 300,   // ms for quick UI morphs
        cinematicMedium: 500,  // ms for shared element transitions
        cinematicLong: 800,    // ms for intro sequences
        easing: {
            emphasized: Easing.bezier(0.2, 0.0, 0, 1.0), // Material Design 3 Emphasized
            decelerate: Easing.out(Easing.cubic),
            accelerate: Easing.in(Easing.cubic),
        }
    },
    light: {
        glow: {
            idle: 0.3,
            hover: 0.6,
            press: 0.9,
            active: 1.0,
        },
        pulseSpeed: {
            slow: 3000,   // ms (breathing)
            alert: 800,   // ms (ciritical)
            scan: 1500,   // ms (scanning)
        }
    },
    gestures: {
        pressScale: 0.96,
        hoverScale: 1.02,
        swipeVelocityThreshold: 500,
        dragResistance: 0.8,
    }
};

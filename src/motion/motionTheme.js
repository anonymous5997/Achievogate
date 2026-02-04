// 3D Motion System - Theme Tokens
// Defines timing, perspective, and physics constants

export const motionTheme = {
    // Duration categories (ms)
    durations: {
        fast: 300,
        normal: 450,
        slow: 600,
        cinematic: 800,
        ultraSlow: 1200,
    },

    // Delays for staggering (ms)
    delays: {
        xs: 40,
        sm: 80,
        md: 120,
        lg: 200,
    },

    // Spring Physics Configs
    springs: {
        // Sharp snap (buttons, toggles)
        snappy: {
            damping: 20,
            stiffness: 250,
            mass: 1,
        },
        // Standard UI movement
        soft: {
            damping: 15,
            stiffness: 120,
            mass: 1,
        },
        // Premium heavy feel (cards, screens)
        cinematic: {
            damping: 16, // slightly higher damping for "premium" feel (less bounce)
            stiffness: 100,
            mass: 1,
        },
        // Bouncy (alerts, errors only)
        elastic: {
            damping: 10,
            stiffness: 100,
            mass: 1,
        },
        // Slow float effects
        float: {
            damping: 100,
            stiffness: 20,
            mass: 2,
        }
    },

    // Depth & 3D Settings
    depth: {
        perspective: 1000,
        rotateSoft: '2deg',
        rotateMedium: '5deg',
        scalePressed: 0.96,
        scaleHover: 1.02,
        translateYEntry: 40,
    },

    // Bezier Curves (GSAP approx)
    easings: {
        expoOut: [0.19, 1, 0.22, 1], // Power2.out
        circOut: [0.075, 0.82, 0.165, 1],
        smoothOut: [0.25, 0.1, 0.25, 1],
    }
};

export default motionTheme;

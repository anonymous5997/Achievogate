import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Cinematic Dark Luxury Design System
// Midnight Blue + Neon Glows + Glassmorphism

export const theme = {
    colors: {
        mode: 'dark',

        // Backgrounds
        background: {
            screen: '#0F172A', // Midnight Blue Base
            card: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
            glass: 'rgba(15, 23, 42, 0.6)', // Deep Blue Glass
            overlay: 'rgba(2, 6, 23, 0.85)', // Obsidian Overlay
            modal: '#1E293B',
        },

        // Brand Gradients (Start -> End)
        gradients: {
            primary: ['#6366F1', '#8B5CF6', '#D946EF'], // Indigo -> Violet -> Fuchsia (Neon)
            secondary: ['#0EA5E9', '#22D3EE', '#A7F3D0'], // Sky -> Cyan -> Teal (Cyber)
            accent: ['#F59E0B', '#F97316', '#EF4444'], // Amber -> Orange -> Red (Heat)

            dark: ['#0F172A', '#1E293B'],
            glass: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'],

            success: ['#10B981', '#34D399'],
            danger: ['#EF4444', '#F87171'],
            warning: ['#F59E0B', '#FBBF24'],
        },

        // Solid Colors (Neon Vibrancy)
        primary: '#8B5CF6', // Violet
        secondary: '#22D3EE', // Cyan
        accent: '#F472B6', // Pink

        // Glow Colors (Shadows/Bloom)
        glow: {
            primary: '#8B5CF6',
            secondary: '#22D3EE',
            accent: '#F472B6',
            success: '#10B981',
            danger: '#EF4444',
            white: '#FFFFFF',
        },

        // Text
        text: {
            primary: '#F8FAFC', // Slate 50
            secondary: '#94A3B8', // Slate 400
            muted: '#64748B', // Slate 500
            inverse: '#0F172A', // Dark
            highlight: '#E2E8F0',
        },

        status: {
            pending: '#F59E0B',  // Amber
            approved: '#10B981', // Emerald
            denied: '#EF4444',   // Red
            active: '#3B82F6',   // Blue
            offline: '#64748B',  // Slate
        },

        border: 'rgba(255, 255, 255, 0.1)',
    },

    layout: {
        width,
        height,
        cardRadius: 20,
        buttonRadius: 16,
        inputRadius: 12,
        sectionGap: 24,

        // Cinematic Dark Shadows/Glows
        shadows: {
            glow: {
                shadowColor: '#8B5CF6',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 16,
                elevation: 10,
            },
            card: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 8,
            },
            float: {
                shadowColor: '#22D3EE',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
            },
            text: {
                textShadowColor: 'rgba(139, 92, 246, 0.5)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
            }
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 32,
        xxxl: 48,
        container: 20,
        headerHeight: 70,
    },

    typography: {
        // Modern Geometric Sans
        h1: {
            fontSize: 32,
            fontWeight: '800',
            lineHeight: 40,
            color: '#F8FAFC',
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700',
            lineHeight: 32,
            color: '#F1F5F9',
            letterSpacing: -0.5,
        },
        h3: {
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 26,
            color: '#E2E8F0',
        },
        body1: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 24,
            color: '#CBD5E1',
        },
        body2: {
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 20,
            color: '#94A3B8',
        },
        caption: {
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 16,
            color: '#64748B',
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: '#94A3B8',
            letterSpacing: 0.5,
        }
    },
};

export default theme;

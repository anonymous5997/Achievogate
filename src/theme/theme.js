import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Cinematic Pastel-Glass Design System
// High Whitespace + Deep Pastel Gradients

export const theme = {
    colors: {
        mode: 'light',

        // Backgrounds
        background: {
            screen: '#F8FAFC', // Slate 50
            card: 'rgba(255, 255, 255, 0.7)',
            glass: 'rgba(255, 255, 255, 0.4)',
            overlay: 'rgba(255, 255, 255, 0.9)',
        },

        // Brand Gradients (Start -> End)
        gradients: {
            primary: ['#6366F1', '#8B5CF6', '#3B82F6'], // Indigo -> Violet -> Blue
            secondary: ['#A78BFA', '#22D3EE', '#7DD3FC'], // Lavender -> Cyan -> Sky
            accent: ['#F472B6', '#FBBF24', '#F87171'], // Pink -> Peach -> Red

            success: ['#34D399', '#10B981'], // Emerald -> Teal
            danger: ['#F87171', '#EF4444'], // Rose -> Red
            warning: ['#FBBF24', '#F59E0B'], // Amber -> Orange

            header: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.8)'],
        },

        // Solid Colors
        primary: '#6366F1', // Indigo 500
        secondary: '#06B6D4', // Cyan 500
        accent: '#EC4899', // Pink 500

        // Glow Colors (for light mode shadows)
        glow: {
            primary: '#818CF8', // Indigo 400
            secondary: '#67E8F9', // Cyan 300
            accent: '#F9A8D4', // Pink 300
        },

        // Text
        text: {
            primary: '#1E293B', // Slate 800
            secondary: '#475569', // Slate 600
            muted: '#94A3B8', // Slate 400
            inverse: '#FFFFFF',
        },

        status: {
            pending: '#F59E0B',
            approved: '#10B981',
            denied: '#EF4444',
            active: '#3B82F6',
        },
    },

    layout: {
        width,
        height,
        cardRadius: 24,
        buttonRadius: 20,
        sectionGap: 24,

        // Cinematic Light Shadows
        shadows: {
            glow: {
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 8,
            },
            card: {
                shadowColor: '#94A3B8',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 4,
            },
            float: {
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.2,
                shadowRadius: 24,
                elevation: 12,
            },
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
        xxxl: 48,
        container: 24,
        headerHeight: 70,
    },

    typography: {
        // Clean Education Style
        h1: {
            fontSize: 32,
            fontWeight: '800',
            lineHeight: 40,
            color: '#1E293B',
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700',
            lineHeight: 32,
            color: '#334155',
            letterSpacing: -0.5,
        },
        h3: {
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 26,
            color: '#475569',
        },
        body1: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 24,
            color: '#475569',
        },
        caption: {
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 16,
            color: '#94A3B8',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
        },
    },
};

export default theme;

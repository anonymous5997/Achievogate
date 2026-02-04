// AchievoGate Design System - Premium Spacing & Sizing

export const spacing = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const borderRadius = {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    card: 20,          // Premium card radius
    button: 16,        // Button radius
    iconContainer: 14, // Icon container radius
    tabBar: 28,        // Floating tab bar radius
    full: 999,
};

export const shadows = {
    // Premium soft shadows
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
        elevation: 6,
    },
    strong: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.16,
        shadowRadius: 40,
        elevation: 8,
    },
    // Colored shadow for primary buttons
    colored: {
        shadowColor: '#5B6CFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 6,
    },
    // Floating tab bar shadow
    tabBar: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 8,
    },
};

export const iconSizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
};

export const typography = {
    heading: {
        h1: { fontSize: 28, fontWeight: '700', color: '#0F172A', letterSpacing: -0.5 },
        h2: { fontSize: 22, fontWeight: '700', color: '#0F172A', letterSpacing: -0.3 },
        h3: { fontSize: 18, fontWeight: '600', color: '#0F172A', letterSpacing: -0.2 },
    },
    body: {
        fontSize: 15,
        fontWeight: '400',
        color: '#475569',
        lineHeight: 22,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },
};

export default {
    spacing,
    borderRadius,
    shadows,
    iconSizes,
    typography,
};

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

// Simple Button (Reanimated removed for Expo Go compatibility)
const CinematicButton = ({
    title,
    onPress,
    icon,
    variant = 'primary',
    style,
    loading = false,
    textStyle
}) => {
    const variantStyles = {
        primary: styles.primary,
        success: styles.success,
        danger: styles.danger,
        outline: styles.outline,
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            style={[styles.button, variantStyles[variant], style]}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#6366F1' : '#fff'} />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, variant === 'outline' && styles.outlineText, textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        minHeight: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primary: {
        backgroundColor: '#6366F1', // Indigo 500
    },
    success: {
        backgroundColor: '#10B981', // Green 500
    },
    danger: {
        backgroundColor: '#EF4444', // Red 500
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#6366F1',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
    outlineText: {
        color: '#6366F1',
    }
});

export default CinematicButton;

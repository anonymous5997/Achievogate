import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import theme from '../theme/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const PrimaryButton = ({
    title,
    onPress,
    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
    loading = false,
    disabled = false,
    icon,
    style,
    textStyle
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        if (disabled || loading) return;
        scale.value = withSpring(0.96, { damping: 10, stiffness: 150 });
    };

    const handlePressOut = () => {
        if (disabled || loading) return;
        scale.value = withSpring(1, { damping: 10, stiffness: 150 });
    };

    const getBackgroundColor = () => {
        if (disabled) return theme.colors.interactive.disabled;
        if (variant === 'primary') return theme.colors.interactive.buttonPrimary;
        if (variant === 'danger') return theme.colors.status.denied;
        if (variant === 'secondary' || variant === 'outline') return 'transparent';
        return theme.colors.interactive.buttonPrimary;
    };

    const getTextColor = () => {
        if (disabled) return '#888';
        if (variant === 'secondary' || variant === 'outline') return theme.colors.primary;
        return theme.colors.interactive.buttonSecondary; // White usually
    };

    const getBorder = () => {
        if (variant === 'outline') return { borderWidth: 1, borderColor: theme.colors.primary };
        return {};
    };

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            disabled={disabled || loading}
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() },
                getBorder(),
                animatedStyle,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
                        {title}
                    </Text>
                </View>
            )}
        </AnimatedTouchable>
    );
};

// Alias to maintain compatibility if "NeonButton" was imported elsewhere, 
// though we prefer upgrading imports.
export const NeonButton = PrimaryButton;

const styles = StyleSheet.create({
    container: {
        borderRadius: theme.layout.buttonRadius,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        // Add subtle shadow for primary buttons
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        fontSize: theme.typography.button.fontSize,
        fontWeight: theme.typography.button.fontWeight,
        letterSpacing: theme.typography.button.letterSpacing,
    },
});

export default PrimaryButton;

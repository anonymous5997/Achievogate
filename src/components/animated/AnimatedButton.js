// Animated Button Component
// Premium button with gradient and press feedback

import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useButtonPress } from '../animations/useAnimations';
import { borderRadius, colors, shadows } from '../theme';

const AnimatedButton = ({ title, onPress, variant = 'primary', style, textStyle }) => {
    const { scale, handlePressIn, handlePressOut } = useButtonPress();

    if (variant === 'primary') {
        return (
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <Animated.View style={[{ transform: [{ scale }] }, style]}>
                    <LinearGradient
                        colors={colors.primaryGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.button, styles.primaryButton, shadows.colored]}
                    >
                        <Text style={[styles.text, styles.primaryText, textStyle]}>
                            {title}
                        </Text>
                    </LinearGradient>
                </Animated.View>
            </Pressable>
        );
    }

    // Secondary variant
    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
        >
            <Animated.View
                style={[
                    styles.button,
                    styles.secondaryButton,
                    { transform: [{ scale }] },
                    style,
                ]}
            >
                <Text style={[styles.text, styles.secondaryText, textStyle]}>
                    {title}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 54,
        borderRadius: borderRadius.button,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    primaryButton: {
        // Gradient applied via LinearGradient
    },
    secondaryButton: {
        backgroundColor: colors.surfaceTint,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryText: {
        color: colors.primary,
    },
});

export default AnimatedButton;

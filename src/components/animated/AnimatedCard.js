// Animated Card Component
// Cinematic card with enter animation and press feedback

import { Animated, Pressable, StyleSheet } from 'react-native';
import { useButtonPress, useCardEnter } from '../animations/useAnimations';
import { borderRadius, colors, shadows, spacing } from '../theme';

const AnimatedCard = ({ children, delay = 0, onPress, style }) => {
    const { opacity, translateY, scale: enterScale } = useCardEnter(delay);
    const { scale: pressScale, handlePressIn, handlePressOut } = useButtonPress();

    const animatedStyle = {
        opacity,
        transform: [
            { translateY },
            { scale: Animated.multiply(enterScale, pressScale) },
        ],
    };

    if (onPress) {
        return (
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
            >
                <Animated.View style={[styles.card, animatedStyle, style]}>
                    {children}
                </Animated.View>
            </Pressable>
        );
    }

    return (
        <Animated.View style={[styles.card, animatedStyle, style]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surfaceWhite,
        borderRadius: borderRadius.card,
        padding: spacing.lg,
        ...shadows.soft,
        borderTopWidth: 1,
        borderTopColor: colors.highlightEdge,
    },
});

export default AnimatedCard;

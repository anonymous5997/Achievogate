import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { springConfigs } from '../motion/springConfigs';

/**
 * PressableGlow Component
 * Premium button with glow effect and scale feedback
 * 
 * Usage:
 * <PressableGlow onPress={() => console.log('Pressed')}>
 *   <Text>Press Me</Text>
 * </PressableGlow>
 */

interface PressableGlowProps {
    children: React.ReactNode;
    onPress?: () => void;
    onLongPress?: () => void;
    style?: ViewStyle;
    glowColor?: string;
    glowIntensity?: number;
    scaleAmount?: number;
    disabled?: boolean;
    hapticFeedback?: boolean;
}

const PressableGlow: React.FC<PressableGlowProps> = ({
    children,
    onPress,
    onLongPress,
    style,
    glowColor = '#5B6CFF',
    glowIntensity = 0.6,
    scaleAmount = 0.96,
    disabled = false,
    hapticFeedback = true,
}) => {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);
    const shadowOpacity = useSharedValue(0.2);

    const handlePressIn = () => {
        if (disabled) return;

        scale.value = withSpring(scaleAmount, springConfigs.snappy);
        glowOpacity.value = withSpring(glowIntensity, springConfigs.snappy);
        shadowOpacity.value = withSpring(0.4, springConfigs.snappy);
    };

    const handlePressOut = () => {
        if (disabled) return;

        scale.value = withSpring(1, springConfigs.snappy);
        glowOpacity.value = withSpring(0, springConfigs.snappy);
        shadowOpacity.value = withSpring(0.2, springConfigs.snappy);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        shadowOpacity: shadowOpacity.value,
    }));

    const glowAnimatedStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[styles.container, style]}
        >
            <Animated.View style={[styles.button, animatedStyle]}>
                {/* Glow Layer */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.glowContainer,
                        glowAnimatedStyle,
                    ]}
                >
                    <LinearGradient
                        colors={[`${glowColor}40`, `${glowColor}20`, 'transparent']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>

                {/* Content */}
                <View style={styles.content}>{children}</View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 6,
    },
    glowContainer: {
        borderRadius: 16,
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
});

export default PressableGlow;

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { springConfigs, timingConfigs } from '../motion/springConfigs';
import { useCinematicEnter } from '../motion/useCinematicEnter';

/**
 * CinematicScreen Component
 * Wrapper for screens with automatic cinematic entrance
 * Netflix/JioHotstar style depth transitions
 * 
 * Usage:
 * <CinematicScreen>
 *   <YourScreenContent />
 * </CinematicScreen>
 */

interface CinematicScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
    delay?: number;
    gradientBackground?: boolean;
    gradientColors?: string[];
    backgroundColor?: string;
    springConfig?: typeof springConfigs.cinematic;
    timingConfig?: typeof timingConfigs.slow;
}

const CinematicScreen: React.FC<CinematicScreenProps> = ({
    children,
    style,
    delay = 0,
    gradientBackground = false,
    gradientColors = ['#0F0F1E', '#1A1A2E', '#0F0F1E'],
    backgroundColor = '#0F0F1A',
    springConfig,
    timingConfig,
}) => {
    const animatedStyle = useCinematicEnter({
        delay,
        springConfig,
        timingConfig,
    });

    return (
        <Animated.View style={[styles.container, style, animatedStyle]}>
            {gradientBackground && (
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            )}

            {!gradientBackground && (
                <Animated.View
                    style={[StyleSheet.absoluteFill, { backgroundColor }]}
                />
            )}

            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default CinematicScreen;

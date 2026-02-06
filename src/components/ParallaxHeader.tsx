import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

/**
 * ParallaxHeader Component
 * Scrolling header with parallax effect and blur
 * 
 * Usage:
 * <ScrollView onScroll={scrollHandler}>
 *   <ParallaxHeader scrollY={scrollY}>
 *     <HeaderContent />
 *   </ParallaxHeader>
 * </ScrollView>
 */

interface ParallaxHeaderProps {
    children: React.ReactNode;
    height?: number;
    parallaxFactor?: number;
    enableBlur?: boolean;
    blurIntensity?: number;
    gradientOverlay?: boolean;
    gradientColors?: string[];
    style?: ViewStyle;
    scrollY: Animated.SharedValue<number>;
}

const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({
    children,
    height = 300,
    parallaxFactor = 0.5,
    enableBlur = true,
    blurIntensity = 20,
    gradientOverlay = true,
    gradientColors = ['transparent', 'rgba(15, 15, 26, 0.3)', 'rgba(15, 15, 26, 0.7)'],
    style,
    scrollY,
}) => {
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [0, height],
            [0, -height * parallaxFactor],
            Extrapolate.CLAMP
        );

        const scale = interpolate(
            scrollY.value,
            [-height, 0, height],
            [1.5, 1, 0.9],
            Extrapolate.CLAMP
        );

        const opacity = interpolate(
            scrollY.value,
            [0, height * 0.5, height],
            [1, 0.7, 0],
            Extrapolate.CLAMP
        );

        return {
            transform: [{ translateY }, { scale }],
            opacity,
        };
    });

    const blurAnimatedStyle = useAnimatedStyle(() => {
        const intensity = interpolate(
            scrollY.value,
            [0, height * 0.5],
            [0, blurIntensity],
            Extrapolate.CLAMP
        );

        return {
            opacity: interpolate(
                scrollY.value,
                [0, height * 0.3],
                [0, 1],
                Extrapolate.CLAMP
            ),
        };
    });

    return (
        <Animated.View style={[styles.container, { height }, style, headerAnimatedStyle]}>
            {children}

            {/* Blur Overlay */}
            {enableBlur && (
                <Animated.View style={[StyleSheet.absoluteFill, blurAnimatedStyle]}>
                    <BlurView
                        intensity={blurIntensity}
                        tint="dark"
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>
            )}

            {/* Gradient Overlay */}
            {gradientOverlay && (
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
            )}
        </Animated.View>
    );
};

/**
 * Hook for Parallax Scroll Handler
 * Use this to get scrollY value and handler
 */
export const useParallaxScroll = () => {
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return { scrollY, scrollHandler };
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
});

export default ParallaxHeader;

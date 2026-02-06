import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface CinematicIntroProps {
    onComplete?: () => void;
}

/**
 * CinematicIntro Component
 * Netflix-style intro animation with multi-phase sequence
 * - Logo scale + glow ring expansion
 * - Light sweep effect
 * - Title letter spacing reveal
 * Target: 60fps with Reanimated worklets
 */

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
    // Animation values
    const logoScale = useSharedValue(0.7);
    const logoOpacity = useSharedValue(0);
    const glowScale = useSharedValue(0);
    const glowOpacity = useSharedValue(0);
    const sweepPosition = useSharedValue(-width);
    const titleOpacity = useSharedValue(0);
    const titleScale = useSharedValue(1.1);
    const screenOpacity = useSharedValue(1);

    const hasCompleted = useRef(false);

    useEffect(() => {
        // Phase 1: Logo reveal (0-800ms)
        logoScale.value = withSpring(1, {
            damping: 20,
            stiffness: 90,
        });
        logoOpacity.value = withTiming(1, {
            duration: 600,
            easing: Easing.out(Easing.ease),
        });

        // Phase 2: Glow ring expansion (200-1200ms)
        glowScale.value = withDelay(
            200,
            withSequence(
                withTiming(3, {
                    duration: 1000,
                    easing: Easing.out(Easing.cubic),
                })
            )
        );
        glowOpacity.value = withDelay(
            200,
            withSequence(
                withTiming(0.6, {
                    duration: 400,
                    easing: Easing.out(Easing.ease),
                }),
                withTiming(0, {
                    duration: 600,
                    easing: Easing.in(Easing.ease),
                })
            )
        );

        // Phase 3: Light sweep (400-1000ms)
        sweepPosition.value = withDelay(
            400,
            withTiming(width * 2, {
                duration: 600,
                easing: Easing.inOut(Easing.ease),
            })
        );

        // Phase 4: Title reveal (1000-1800ms)
        titleOpacity.value = withDelay(
            1000,
            withTiming(1, {
                duration: 800,
                easing: Easing.out(Easing.ease),
            })
        );
        titleScale.value = withDelay(
            1000,
            withTiming(1, {
                duration: 800,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
            })
        );

        // Phase 5: Fade out (3000ms)
        screenOpacity.value = withDelay(
            3000,
            withTiming(
                0,
                {
                    duration: 400,
                    easing: Easing.in(Easing.ease),
                },
                (finished) => {
                    if (finished && onComplete && !hasCompleted.current) {
                        hasCompleted.current = true;
                        runOnJS(onComplete)();
                    }
                }
            )
        );
    }, []);

    const screenAnimatedStyle = useAnimatedStyle(() => ({
        opacity: screenOpacity.value,
    }));

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const glowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: glowScale.value }],
        opacity: glowOpacity.value,
    }));

    const sweepAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: sweepPosition.value }],
    }));

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ scale: titleScale.value }],
    }));

    return (
        <Animated.View style={[styles.container, screenAnimatedStyle]}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#0F0F1E', '#1A1A2E', '#0F0F1E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Glow Ring */}
            <Animated.View style={[styles.glowRing, glowAnimatedStyle]}>
                <LinearGradient
                    colors={['rgba(91, 108, 255, 0.4)', 'rgba(124, 140, 255, 0.2)', 'transparent']}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.glowGradient}
                />
            </Animated.View>

            {/* Logo Container */}
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <LinearGradient
                    colors={['#5B6CFF', '#7C8CFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoGradient}
                >
                    <Ionicons name="shield-checkmark" size={120} color="#FFFFFF" />
                </LinearGradient>
            </Animated.View>

            {/* Light Sweep */}
            <Animated.View style={[styles.lightSweep, sweepAnimatedStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.15)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sweepGradient}
                />
            </Animated.View>

            {/* Title */}
            <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
                <Text style={styles.title}>ACHIEVOGATE</Text>
                <Animated.View style={styles.titleUnderline} />
                <Text style={styles.subtitle}>Smart Society Management</Text>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F0F1E',
    },
    glowRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    glowGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    logoGradient: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5B6CFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    lightSweep: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 200,
        transform: [{ rotate: '15deg' }],
    },
    sweepGradient: {
        flex: 1,
    },
    titleContainer: {
        position: 'absolute',
        bottom: height * 0.25,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 4,
        marginBottom: 8,
    },
    titleUnderline: {
        width: 80,
        height: 3,
        backgroundColor: '#5B6CFF',
        borderRadius: 2,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});

export default CinematicIntro;

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashIntroScreen = ({ onComplete }) => {
    // Animation values
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoBlur = useRef(new Animated.Value(20)).current;
    const glowScale = useRef(new Animated.Value(0)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const sweepPosition = useRef(new Animated.Value(-width)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleLetterSpacing = useRef(new Animated.Value(10)).current;
    const screenOpacity = useRef(new Animated.Value(1)).current;

    const skippable = useRef(false);
    const hasCompleted = useRef(false);

    useEffect(() => {
        // Mark as skippable after 1.5 seconds
        setTimeout(() => {
            skippable.current = true;
        }, 1500);

        // Start the cinematic sequence
        startAnimationSequence();

        // Auto-complete after 3 seconds
        setTimeout(() => {
            completeIntro();
        }, 3000);
    }, []);

    const startAnimationSequence = () => {
        // Phase 1: Logo reveal (0-800ms)
        Animated.parallel([
            // Logo scale up
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // Logo fade in
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            // Logo blur to sharp
            Animated.timing(logoBlur, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false, // Blur can't use native driver
            }),
        ]).start();

        // Phase 2: Glow ring expansion (200-1200ms)
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(glowScale, {
                    toValue: 3,
                    duration: 1000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(glowOpacity, {
                        toValue: 0.6,
                        duration: 400,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 0,
                        duration: 600,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }, 200);

        // Phase 3: Light sweep (400-1000ms)
        setTimeout(() => {
            Animated.timing(sweepPosition, {
                toValue: width * 2,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start();
        }, 400);

        // Phase 4: Title reveal (1000-2000ms)
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(titleOpacity, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(titleLetterSpacing, {
                    toValue: 0,
                    duration: 800,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: false, // Letter spacing can't use native driver
                }),
            ]).start();
        }, 1000);
    };

    const completeIntro = () => {
        if (hasCompleted.current) return;
        hasCompleted.current = true;

        // Fade out entire screen
        Animated.timing(screenOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            if (onComplete) onComplete();
        });
    };

    const handleSkip = () => {
        if (skippable.current && !hasCompleted.current) {
            completeIntro();
        }
    };

    return (
        <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
            {/* Cinematic Background Gradient */}
            <LinearGradient
                colors={['#0F0F1E', '#1A1A2E', '#0F0F1E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Glow Ring Behind Logo */}
            <Animated.View
                style={[
                    styles.glowRing,
                    {
                        transform: [{ scale: glowScale }],
                        opacity: glowOpacity,
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(91, 108, 255, 0.4)', 'rgba(124, 140, 255, 0.2)', 'transparent']}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.glowGradient}
                />
            </Animated.View>

            {/* Logo Container */}
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        transform: [{ scale: logoScale }],
                        opacity: logoOpacity,
                    },
                ]}
            >
                {/* 3D Shield Icon */}
                <View style={styles.shieldContainer}>
                    {/* Back layer (shadow) */}
                    <View style={[styles.shieldShadow, { top: 8, left: 8 }]}>
                        <Ionicons name="shield-checkmark" size={120} color="rgba(0, 0, 0, 0.3)" />
                    </View>

                    {/* Middle layer (glow) */}
                    <View style={styles.shieldGlow}>
                        <Ionicons name="shield-checkmark" size={120} color="rgba(91, 108, 255, 0.5)" />
                    </View>

                    {/* Front layer (main) */}
                    <View style={styles.shieldMain}>
                        <LinearGradient
                            colors={['#5B6CFF', '#7C8CFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.shieldGradient}
                        >
                            <Ionicons name="shield-checkmark" size={120} color="#FFFFFF" />
                        </LinearGradient>
                    </View>
                </View>
            </Animated.View>

            {/* Light Sweep Effect */}
            <Animated.View
                style={[
                    styles.lightSweep,
                    {
                        transform: [{ translateX: sweepPosition }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.15)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sweepGradient}
                />
            </Animated.View>

            {/* Title Text */}
            <Animated.View
                style={[
                    styles.titleContainer,
                    {
                        opacity: titleOpacity,
                    },
                ]}
            >
                <Text style={styles.title}>ACHIEVOGATE</Text>
                <View style={styles.titleUnderline} />
                <Text style={styles.subtitle}>Smart Society Management</Text>
            </Animated.View>

            {/* Skip Button (appears after 1.5s) */}
            <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
            >
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
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

    // Glow Ring
    glowRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
    },

    // Logo
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    shieldContainer: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    shieldShadow: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shieldGlow: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shieldMain: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    shieldGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5B6CFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },

    // Light Sweep
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

    // Title
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

    // Skip Button
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    skipText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SplashIntroScreen;

import { BlurMask, Canvas, Circle, Group, Path, Rect, Skia, LinearGradient as SkiaGradient, vec } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import theme from '../theme/theme';

const { width, height } = Dimensions.get('window');

const CinematicIntro = ({ onComplete }) => {
    // Animation Values
    const progress = useSharedValue(0); // 0 to 1 for overall timeline
    const logoScale = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const containerScale = useSharedValue(1);
    const containerOpacity = useSharedValue(1);

    // Energy Lines Paths
    const pathLeft = useMemo(() => {
        const p = Skia.Path.Make();
        p.moveTo(0, height / 2);
        p.cubicTo(width * 0.2, height / 2, width * 0.3, height * 0.4, width / 2, height / 2);
        return p;
    }, []);

    const pathRight = useMemo(() => {
        const p = Skia.Path.Make();
        p.moveTo(width, height / 2);
        p.cubicTo(width * 0.8, height / 2, width * 0.7, height * 0.6, width / 2, height / 2);
        return p;
    }, []);

    // Particles
    const particles = useMemo(() => {
        return new Array(20).fill(0).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        }));
    }, []);

    useEffect(() => {
        // Timeline
        // 1. Lines draw in (0-800ms)
        progress.value = withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) });

        // 2. Logo Enter (800ms) with Spring "Thud"
        logoScale.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 100 }));
        logoOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));

        // 3. Zoom out/in exit (2500ms ->)
        containerScale.value = withDelay(2500, withTiming(1.5, { duration: 800, easing: Easing.in(Easing.exp) }));
        containerOpacity.value = withDelay(2800, withTiming(0, { duration: 500 }, (finished) => {
            if (finished && onComplete) {
                runOnJS(onComplete)();
            }
        }));
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: containerScale.value }],
        opacity: containerOpacity.value,
    }));

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }]
    }));

    // Derived values for Skia
    const lineEnd = useDerivedValue(() => progress.value);

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <Canvas style={StyleSheet.absoluteFill}>
                <Rect x={0} y={0} width={width} height={height} color="#000" />

                {/* Midnight Background */}
                <Rect x={0} y={0} width={width} height={height}>
                    <SkiaGradient
                        start={vec(0, 0)}
                        end={vec(width, height)}
                        colors={['#020617', '#0F172A', '#020617']}
                    />
                </Rect>

                {/* Particles */}
                {particles.map((p, i) => (
                    <Circle key={i} cx={p.x} cy={p.y} r={p.r} color="#fff" opacity={p.opacity * 0.5} />
                ))}

                {/* Energy Lines */}
                <Group>
                    <Path
                        path={pathLeft}
                        color={theme.colors.primary}
                        style="stroke"
                        strokeWidth={4}
                        end={lineEnd}
                    >
                        <BlurMask blur={4} style="solid" />
                    </Path>
                    <Path
                        path={pathRight}
                        color={theme.colors.secondary}
                        style="stroke"
                        strokeWidth={4}
                        end={lineEnd}
                    >
                        <BlurMask blur={4} style="solid" />
                    </Path>
                </Group>

                {/* Center Glow */}
                <Circle cx={width / 2} cy={height / 2} r={100} color={theme.colors.primary} opacity={logoOpacity}>
                    <BlurMask blur={50} style="normal" />
                </Circle>
            </Canvas>

            {/* Content Layer */}
            <View style={styles.centerContainer}>
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <View style={styles.shield}>
                        <Animated.Text style={styles.shieldText}>A</Animated.Text>
                    </View>
                    <Animated.Text style={styles.brandText}>ACHIEVOGATE</Animated.Text>
                    <Animated.Text style={styles.subText}>SECURE • FAST • PREMIUM</Animated.Text>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centerContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    shield: {
        width: 100,
        height: 100,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        shadowColor: theme.colors.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },
    shieldText: {
        fontSize: 64,
        fontWeight: '900',
        color: '#fff',
    },
    brandText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 6,
    },
    subText: {
        marginTop: 8,
        fontSize: 12,
        color: theme.colors.text.muted,
        letterSpacing: 3,
        fontWeight: '600',
    }
});

export default CinematicIntro;

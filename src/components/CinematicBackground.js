import { BlurMask, Canvas, Circle, Rect, LinearGradient as SkiaGradient, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
    Easing,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import theme from '../theme/theme';

const { width, height } = Dimensions.get('window');

const Particle = ({ x, y, r, color, duration }) => {
    const opacity = useSharedValue(0.3);
    const translateY = useSharedValue(0);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.8, { duration: duration, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        translateY.value = withRepeat(
            withTiming(-30, { duration: duration * 1.5, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );
    }, []);

    const cy = useDerivedValue(() => y + translateY.value);

    return (
        <Circle cx={x} cy={cy} r={r} color={color} opacity={opacity}>
            <BlurMask blur={4} style="normal" />
        </Circle>
    );
};

const CinematicBackground = ({ children, style }) => {
    // Generate static random positions for particles to avoid hydration mismatches if logic was complex
    // In React Native JS we can just use constants or useMemo if we wanted, but simple fixed arrays work too.
    const particles = Array.from({ length: 12 }).map((_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1,
        color: i % 2 === 0 ? theme.colors.primary : theme.colors.secondary,
        duration: 3000 + Math.random() * 2000
    }));

    return (
        <View style={styles.container}>
            {/* 1. Deep Space Base (Skia Gradient for smoothness) */}
            <Canvas style={StyleSheet.absoluteFill}>
                <Rect x={0} y={0} width={width} height={height}>
                    <SkiaGradient
                        start={vec(0, 0)}
                        end={vec(width, height)}
                        colors={['#020617', '#0F172A', '#1E1B4B']}
                    />
                </Rect>

                {/* 2. Ambient Glow Orbs */}
                <Circle cx={width * 0.2} cy={height * 0.2} r={120} color="#8B5CF6" opacity={0.15}>
                    <BlurMask blur={60} style="normal" />
                </Circle>
                <Circle cx={width * 0.8} cy={height * 0.6} r={150} color="#06B6D4" opacity={0.1}>
                    <BlurMask blur={80} style="normal" />
                </Circle>

                {/* 3. Star Particles */}
                {particles.map((p, i) => (
                    <Particle key={i} {...p} />
                ))}
            </Canvas>

            {/* 4. Content */}
            <View style={[styles.content, style]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    content: {
        flex: 1,
    },
});

export default CinematicBackground;

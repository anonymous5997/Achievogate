import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Easing, Animated as RNAnimated, StyleSheet, View } from 'react-native'; // Use standard RN Animated for safety
import theme from '../theme/theme';

// Simplified Safe Background - Replaces Skia/Reanimated for verified stability
const FloatingOrb = ({ cx, cy, color, radius, duration }) => {
    const moveAnim = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        RNAnimated.loop(
            RNAnimated.sequence([
                RNAnimated.timing(moveAnim, {
                    toValue: 1,
                    duration: duration,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                RNAnimated.timing(moveAnim, {
                    toValue: 0,
                    duration: duration,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();
    }, []);

    const translateY = moveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, 20],
    });

    const translateX = moveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 10],
    });

    return (
        <RNAnimated.View
            style={{
                position: 'absolute',
                left: cx - radius,
                top: cy - radius,
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                backgroundColor: color,
                transform: [{ translateX }, { translateY }],
                opacity: 0.6,
            }}
        />
    );
};

const CinematicBackground = ({ children, style }) => {
    return (
        <View style={styles.container}>
            {/* 1. Light Base Gradient */}
            <LinearGradient
                colors={['#EEF2FF', '#F0F9FF', '#F5F3FF']} // Soft Lavender/Blue/White
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* 2. Simplified Orbs (No Skia) */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <FloatingOrb
                    cx={50}
                    cy={100}
                    color="#A78BFA" // Violet
                    radius={120}
                    duration={5000}
                />
                <FloatingOrb
                    cx={theme.layout?.width || 300} // Fallback safety
                    cy={theme.layout?.height || 600}
                    color="#22D3EE" // Cyan
                    radius={140}
                    duration={7000}
                />
            </View>

            {/* 3. Content */}
            <View style={[styles.content, style]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        flex: 1,
    },
});

export default CinematicBackground;

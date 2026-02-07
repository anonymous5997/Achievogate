import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { usePhysicsGesture } from '../hooks/usePhysicsGesture';
import { MotionTokens } from '../motion/MotionTokens';
import theme from '../theme/theme';

const NeoCard = ({
    children,
    style,
    glowColor = theme.colors.primary,
    padding = 16,
    glass = true,
    delay = 0,
    disabled = false,
    onPress,
}) => {
    // Entry Animation
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    React.useEffect(() => {
        opacity.value = withTiming(1, { duration: MotionTokens.timing.cinematicShort });
        translateY.value = withSpring(0, MotionTokens.springs.enter);
    }, []);

    const entryStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }]
    }));

    // Physics Gesture (Tilt)
    const { tapGesture, panGesture, animatedStyle: physicsStyle } = usePhysicsGesture({
        onPress,
        scaleOnPress: !disabled,
        tiltEffect: !disabled,
    });

    // Compose gestures: Pan for tilt, Tap for press
    const gesture = !disabled
        ? (onPress ? Gesture.Race(panGesture, tapGesture) : panGesture) // If specific semantics needed
        // Simpler: Just rely on pan for tilt, but if it's touchable, maybe just scaling is enough.
        // For general cards, we'll allow tilt on drag.
        : undefined;

    // Note: Reanimated Gesture handling composition can be tricky inside a component if not memoized 
    // or if we change logic dynamically. 
    // To be safe and performant for list items, we will only apply tilt if explicitly requested or interactive.
    // For now, applying scaling physics.

    return (
        <GestureDetector gesture={tapGesture}>
            <Animated.View style={[styles.glowContainer, { shadowColor: glowColor }, style, entryStyle, physicsStyle]}>
                {/* Glass Background */}
                <View style={[
                    styles.card,
                    {
                        padding,
                        backgroundColor: glass ? theme.colors.background.card : '#1E293B',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                    }
                ]}>
                    <LinearGradient
                        colors={theme.colors.gradients.glass}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />

                    {children}

                    {/* Neon Border Highlight */}
                    <View style={[
                        StyleSheet.absoluteFill,
                        styles.borderHighlight,
                        { borderColor: glowColor, opacity: 0.15 }
                    ]} />
                </View>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    glowContainer: {
        marginBottom: 16,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        borderRadius: theme.layout.cardRadius,
    },
    card: {
        borderRadius: theme.layout.cardRadius,
        borderWidth: 1,
        overflow: 'hidden',
    },
    borderHighlight: {
        borderWidth: 1,
        borderRadius: theme.layout.cardRadius,
        pointerEvents: 'none',
    }
});

export default NeoCard;

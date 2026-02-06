import React, { useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { springConfigs } from '../motion/springConfigs';

/**
 * FlipCard3D Component
 * Gesture-driven 3D flip card with perspective transform
 * Supports tap-to-flip and swipe-to-flip
 * 
 * Usage:
 * <FlipCard3D
 *   front={<FrontContent />}
 *   back={<BackContent />}
 *   flipOnTap
 *   flipOnSwipe
 * />
 */

interface FlipCard3DProps {
    front: React.ReactNode;
    back: React.ReactNode;
    flipOnTap?: boolean;
    flipOnSwipe?: boolean;
    style?: ViewStyle;
    cardStyle?: ViewStyle;
    duration?: number;
    perspective?: number;
    onFlip?: (isFlipped: boolean) => void;
}

const FlipCard3D: React.FC<FlipCard3DProps> = ({
    front,
    back,
    flipOnTap = true,
    flipOnSwipe = false,
    style,
    cardStyle,
    perspective = 1200,
    onFlip,
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    const handleFlip = () => {
        const newFlippedState = !isFlipped;
        setIsFlipped(newFlippedState);

        rotation.value = withSpring(newFlippedState ? 180 : 0, {
            ...springConfigs.cinematic,
            damping: 18,
        });

        if (onFlip) {
            onFlip(newFlippedState);
        }
    };

    // Tap gesture
    const tapGesture = Gesture.Tap()
        .enabled(flipOnTap)
        .onBegin(() => {
            'worklet';
            scale.value = withSpring(0.98, springConfigs.snappy);
        })
        .onFinalize(() => {
            'worklet';
            scale.value = withSpring(1, springConfigs.snappy);
        })
        .onEnd(() => {
            handleFlip();
        });

    // Pan (swipe) gesture
    const panGesture = Gesture.Pan()
        .enabled(flipOnSwipe)
        .onUpdate((event) => {
            'worklet';
            // Horizontal swipe triggers flip
            const dragProgress = Math.abs(event.translationX) / 100;
            rotation.value = isFlipped ? 180 - dragProgress * 180 : dragProgress * 180;
        })
        .onEnd((event) => {
            'worklet';
            // If dragged more than 50px, complete the flip
            if (Math.abs(event.translationX) > 50) {
                handleFlip();
            } else {
                // Otherwise, snap back
                rotation.value = withSpring(isFlipped ? 180 : 0, springConfigs.cinematic);
            }
        });

    const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

    // Front card animation
    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = `${rotation.value}deg`;
        const opacity = interpolate(rotation.value, [0, 90, 90, 180], [1, 1, 0, 0]);

        return {
            transform: [
                { perspective },
                { rotateY },
                { scale: scale.value },
            ],
            opacity,
            backfaceVisibility: 'hidden',
        };
    });

    // Back card animation
    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = `${rotation.value - 180}deg`;
        const opacity = interpolate(rotation.value, [0, 90, 90, 180], [0, 0, 1, 1]);

        return {
            transform: [
                { perspective },
                { rotateY },
                { scale: scale.value },
            ],
            opacity,
            backfaceVisibility: 'hidden',
        };
    });

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.container, style]}>
                {/* Front Side */}
                <Animated.View style={[styles.card, cardStyle, frontAnimatedStyle]}>
                    {front}
                </Animated.View>

                {/* Back Side */}
                <Animated.View style={[styles.card, cardStyle, styles.cardBack, backAnimatedStyle]}>
                    {back}
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    card: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    cardBack: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default FlipCard3D;

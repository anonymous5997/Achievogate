// 3D Flip Card Component
// Cinematic card flip animation with perspective

import { useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import motionConfig from '../animations/motionConfig';

const FlipCard = ({ frontContent, backContent, style }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnimation = useRef(new Animated.Value(0)).current;

    const flipCard = () => {
        const toValue = isFlipped ? 0 : 180;

        Animated.spring(flipAnimation, {
            toValue,
            ...motionConfig.easing.springBounce,
            useNativeDriver: true,
        }).start();

        setIsFlipped(!isFlipped);
    };

    // Front face rotation
    const frontInterpolate = flipAnimation.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    // Back face rotation
    const backInterpolate = flipAnimation.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    // Opacity for smooth transition
    const frontOpacity = flipAnimation.interpolate({
        inputRange: [89, 90],
        outputRange: [1, 0],
    });

    const backOpacity = flipAnimation.interpolate({
        inputRange: [89, 90],
        outputRange: [0, 1],
    });

    return (
        <TouchableWithoutFeedback onPress={flipCard}>
            <View style={[styles.container, style]}>
                {/* Front Face */}
                <Animated.View
                    style={[
                        styles.card,
                        styles.cardFront,
                        {
                            transform: [{ rotateY: frontInterpolate }],
                            opacity: frontOpacity,
                        },
                    ]}
                >
                    {frontContent}
                </Animated.View>

                {/* Back Face */}
                <Animated.View
                    style={[
                        styles.card,
                        styles.cardBack,
                        {
                            transform: [{ rotateY: backInterpolate }],
                            opacity: backOpacity,
                        },
                    ]}
                >
                    {backContent}
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        perspective: 900,
    },
    card: {
        backfaceVisibility: 'hidden',
    },
    cardFront: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    cardBack: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default FlipCard;

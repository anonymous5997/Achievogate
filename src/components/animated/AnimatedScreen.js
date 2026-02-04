// Animated Screen Wrapper
// Cinematic screen enter animation

import { LinearGradient } from 'expo-linear-gradient';
import { Animated, StyleSheet, View } from 'react-native';
import { useScreenEnter } from '../animations/useAnimations';
import { colors } from '../theme';

const AnimatedScreen = ({ children, gradient = true, style }) => {
    const { opacity, translateY, scale } = useScreenEnter();

    const animatedStyle = {
        opacity,
        transform: [{ translateY }, { scale }],
    };

    if (gradient) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={colors.bgGradient}
                    style={StyleSheet.absoluteFill}
                />
                <Animated.View style={[styles.content, animatedStyle, style]}>
                    {children}
                </Animated.View>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.container, animatedStyle, style]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});

export default AnimatedScreen;

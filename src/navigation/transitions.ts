import {
    HeaderStyleInterpolators,
    StackCardInterpolatedStyle,
    StackCardInterpolationProps
} from '@react-navigation/stack';
import { Easing } from 'react-native';

/**
 * Navigation Transitions
 * Cinematic transitions for React Navigation
 * Netflix/JioHotstar style depth-based transitions
 */

/**
 * Cinematic Push Transition
 * Current screen scales down while new screen slides in
 */
export const cinematicPushTransition = {
    gestureDirection: 'horizontal' as const,
    transitionSpec: {
        open: {
            animation: 'spring',
            config: {
                stiffness: 90,
                damping: 20,
                mass: 1,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
            },
        },
        close: {
            animation: 'spring',
            config: {
                stiffness: 90,
                damping: 20,
                mass: 1,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
            },
        },
    },
    cardStyleInterpolator: ({ current, next, layouts }: StackCardInterpolationProps): StackCardInterpolatedStyle => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                        }),
                    },
                    {
                        scale: next
                            ? next.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0.95],
                            })
                            : 1,
                    },
                ],
                opacity: current.progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 1],
                }),
            },
            overlayStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.3],
                }),
            },
        };
    },
    headerStyleInterpolator: HeaderStyleInterpolators.forFade,
};

/**
 * Modal Present Transition
 * Scale from bottom with depth effect
 */
export const modalPresentTransition = {
    gestureDirection: 'vertical' as const,
    transitionSpec: {
        open: {
            animation: 'spring',
            config: {
                stiffness: 90,
                damping: 20,
                mass: 1,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
            },
        },
        close: {
            animation: 'spring',
            config: {
                stiffness: 100,
                damping: 25,
                mass: 0.8,
                overshootClamping: false,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
            },
        },
    },
    cardStyleInterpolator: ({ current, layouts }: StackCardInterpolationProps): StackCardInterpolatedStyle => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.height, 0],
                        }),
                    },
                    {
                        scale: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                        }),
                    },
                ],
                opacity: current.progress.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0, 0.5, 1],
                }),
            },
            overlayStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                }),
            },
        };
    },
    headerStyleInterpolator: HeaderStyleInterpolators.forFade,
};

/**
 * Depth Push Transition
 * Current screen scales and fades while new screen scales in
 */
export const depthPushTransition = {
    gestureDirection: 'horizontal' as const,
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                duration: 500,
                easing: Easing.bezier(0.16, 1, 0.3, 1), // Expo out
            },
        },
        close: {
            animation: 'timing',
            config: {
                duration: 400,
                easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
        },
    },
    cardStyleInterpolator: ({ current, next, layouts }: StackCardInterpolationProps): StackCardInterpolatedStyle => {
        return {
            cardStyle: {
                transform: [
                    {
                        scale: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.94, 1],
                        }),
                    },
                    {
                        translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                        }),
                    },
                    // Scale down current screen when next is present
                    ...(next
                        ? [
                            {
                                scale: next.progress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 0.92],
                                }),
                            },
                        ]
                        : []),
                ],
                opacity: current.progress.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0, 0.5, 1],
                }),
            },
            overlayStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.4],
                }),
            },
        };
    },
    headerStyleInterpolator: HeaderStyleInterpolators.forFade,
};

/**
 * Fade Transition
 * Simple crossfade
 */
export const fadeTransition = {
    gestureDirection: 'horizontal' as const,
    transitionSpec: {
        open: {
            animation: 'timing',
            config: {
                duration: 300,
                easing: Easing.out(Easing.cubic),
            },
        },
        close: {
            animation: 'timing',
            config: {
                duration: 200,
                easing: Easing.in(Easing.cubic),
            },
        },
    },
    cardStyleInterpolator: ({ current }: StackCardInterpolationProps): StackCardInterpolatedStyle => {
        return {
            cardStyle: {
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                }),
            },
        };
    },
    headerStyleInterpolator: HeaderStyleInterpolators.forFade,
};

/**
 * Apply Cinematic Transition to Navigator
 * Use in screenOptions of Stack.Navigator
 */
export const cinematicScreenOptions = {
    ...cinematicPushTransition,
    cardOverlayEnabled: true,
    gestureEnabled: true,
    gestureResponseDistance: 100,
    headerShown: false,
};

export const modalScreenOptions = {
    ...modalPresentTransition,
    presentation: 'modal' as const,
    cardOverlayEnabled: true,
    gestureEnabled: true,
    gestureResponseDistance: 150,
    headerShown: false,
};

export default {
    cinematicPushTransition,
    modalPresentTransition,
    depthPushTransition,
    fadeTransition,
    cinematicScreenOptions,
    modalScreenOptions,
};

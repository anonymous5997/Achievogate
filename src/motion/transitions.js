import { motionTheme } from './motionTheme';

// React Navigation Transition Configuration
// Replicates a "Depth" transition found in native iOS/Cinematic apps

export const transitions = {
    // Depth Transition: Pushes previous screen back + dims it
    cinematicStack: ({ current, next, layouts }) => {
        return {
            cardStyle: {
                backgroundColor: 'transparent', // Let gradient show through
            },
            transitionSpec: {
                open: {
                    animation: 'spring',
                    config: motionTheme.springs.cinematic,
                },
                close: {
                    animation: 'spring',
                    config: motionTheme.springs.cinematic,
                },
            },
            cardStyleInterpolator: ({ current, next, layouts }) => {
                const translateFocused = current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.height, 0], // Slide up
                });

                const scaleFocused = current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1], // Subtle scale in
                });

                const opacityFocused = current.progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 1],
                });

                const scaleBackground = next
                    ? next.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.94], // Scale down background
                    })
                    : 1;

                const opacityBackground = next
                    ? next.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.5], // Dim background
                    })
                    : 1;

                return {
                    cardStyle: {
                        transform: [
                            { translateY: translateFocused },
                            { scale: scaleFocused },
                            { scale: scaleBackground },
                        ],
                        opacity: opacityFocused,
                    },
                    overlayStyle: {
                        opacity: next ? next.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.4]
                        }) : 0
                    }
                };
            },
        };
    },
};

export default transitions;

import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { springConfigs } from './springConfigs';

/**
 * Gesture Scale Hook
 * Provides press feedback with scale animation
 * Uses gesture-handler for smooth, native-feeling interaction
 * 
 * @param scaleAmount - Scale factor when pressed (default: 0.95)
 * @param springConfig - Spring configuration
 * @returns { gesture, animatedStyle }
 */

interface UseGestureScaleOptions {
    scaleAmount?: number;
    springConfig?: typeof springConfigs.snappy;
    onPress?: () => void;
    hapticFeedback?: boolean;
}

export const useGestureScale = (options: UseGestureScaleOptions = {}) => {
    const {
        scaleAmount = 0.95,
        springConfig = springConfigs.snappy,
        onPress,
    } = options;

    const scale = useSharedValue(1);
    const isPressed = useSharedValue(false);

    // Tap gesture for press feedback
    const tapGesture = Gesture.Tap()
        .onBegin(() => {
            'worklet';
            isPressed.value = true;
            scale.value = withSpring(scaleAmount, springConfig);
        })
        .onFinalize(() => {
            'worklet';
            isPressed.value = false;
            scale.value = withSpring(1, springConfig);
        })
        .onEnd(() => {
            if (onPress) {
                onPress();
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return { gesture: tapGesture, animatedStyle, isPressed };
};

/**
 * Long Press Gesture Scale
 * Scale on long press with feedback
 */
export const useLongPressScale = (options: UseGestureScaleOptions & { minDuration?: number } = {}) => {
    const {
        scaleAmount = 0.92,
        springConfig = springConfigs.snappy,
        onPress,
        minDuration = 500,
    } = options;

    const scale = useSharedValue(1);

    const longPressGesture = Gesture.LongPress()
        .minDuration(minDuration)
        .onBegin(() => {
            'worklet';
            scale.value = withSpring(scaleAmount, springConfig);
        })
        .onFinalize(() => {
            'worklet';
            scale.value = withSpring(1, springConfig);
        })
        .onEnd(() => {
            if (onPress) {
                onPress();
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return { gesture: longPressGesture, animatedStyle };
};

/**
 * Pan Gesture Scale
 * Scale while dragging (useful for draggable items)
 */
export const usePanScale = (options: UseGestureScaleOptions = {}) => {
    const {
        scaleAmount = 1.05,
        springConfig = springConfigs.soft,
    } = options;

    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            'worklet';
            scale.value = withSpring(scaleAmount, springConfig);
        })
        .onUpdate((event) => {
            'worklet';
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onFinalize(() => {
            'worklet';
            scale.value = withSpring(1, springConfig);
            translateX.value = withSpring(0, springConfig);
            translateY.value = withSpring(0, springConfig);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }));

    return { gesture: panGesture, animatedStyle };
};

export default useGestureScale;

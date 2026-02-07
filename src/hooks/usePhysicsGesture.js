import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated';
import { useMotion } from '../context/MotionContext';
import { MotionTokens } from '../motion/MotionTokens';

export const usePhysicsGesture = ({
    onPress,
    onHoverIn,
    onHoverOut,
    scaleOnPress = true,
    tiltEffect = false,
}) => {
    const { isReducedMotion } = useMotion();

    // Shared Values
    const scale = useSharedValue(1);
    const rotateX = useSharedValue(0);
    const rotateY = useSharedValue(0);
    const isPressed = useSharedValue(false);

    // Physics Configs
    const pressSpring = MotionTokens.springs.snappy;
    const releaseSpring = MotionTokens.springs.bouncy;

    const tapGesture = Gesture.Tap()
        .onBegin(() => {
            'worklet';
            isPressed.value = true;
            if (scaleOnPress && !isReducedMotion) {
                scale.value = withSpring(MotionTokens.gestures.pressScale, pressSpring);
            }
        })
        .onFinalize(() => {
            'worklet';
            isPressed.value = false;
            if (scaleOnPress && !isReducedMotion) {
                scale.value = withSpring(1, releaseSpring);
            }
            if (onPress) {
                runOnJS(onPress)();
            }
        });

    // For tilt effect (Pan gesture to simulate 3D touch on drag)
    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            'worklet';
            if (tiltEffect && !isReducedMotion) {
                // Simplistic tilt calculation based on touch position relative to center
                // This usually requires component dimensions, so often we just use velocity or translation
                // for a "drag" tilt.
                // Here we'll stick to a simple drag-resist tilt
                rotateX.value = withSpring(e.translationY / 20 * -1, MotionTokens.springs.micro);
                rotateY.value = withSpring(e.translationX / 20, MotionTokens.springs.micro);
            }
        })
        .onFinalize(() => {
            'worklet';
            if (tiltEffect) {
                rotateX.value = withSpring(0, releaseSpring);
                rotateY.value = withSpring(0, releaseSpring);
            }
        });

    // Compose gestures if tilt is enabled
    // Note: In many cases, Tap is enough for buttons. Pan is for Cards.
    // We return individual gestures or a composed one depending on usage.

    return {
        tapGesture,
        panGesture,
        animatedStyle: {
            transform: [
                { scale },
                { rotateX: `${rotateX.value}deg` }, // String interpolation in worklet needs care, but Reanimated handles this format often or use useDerivedValue
                { rotateY: `${rotateY.value}deg` }
            ]
        },
        values: { scale, rotateX, rotateY, isPressed }
    };
};

import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

// Reusable Gesture Logic

export const gestures = {
    // Press Handler (Scale)
    press: (scaleValue, onPress) =>
        Gesture.Tap()
            .maxDuration(10000) // Prevent premature cancellation
            .onBegin(() => {
                scaleValue.value = 0.96;
            })
            .onFinalize(() => {
                scaleValue.value = 1;
                if (onPress) runOnJS(onPress)();
            }),

    // Tilt 3D Handler (Pan) - Simplified for cards
    tilt: (rotateX, rotateY) =>
        Gesture.Pan()
            .onUpdate((e) => {
                // Simulate 3D tilt based on touch position relative to center
                // Note: Getting exact element center in RN Reanimated without measure is tricky.
                // This is a simplified "drag to tilt" effect.
                rotateY.value = (e.translationX / 100) * 5; // Max 5 deg
                rotateX.value = -(e.translationY / 100) * 5;
            })
            .onFinalize(() => {
                rotateX.value = 0;
                rotateY.value = 0;
            })
};

export default gestures;

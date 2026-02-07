import { BlurMask, Canvas, Circle } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import theme from '../../theme/theme';

const FloatingOrb = ({ size = 100, color = theme.colors.primary, duration = 3000 }) => {
    const pulse = useSharedValue(0);

    useEffect(() => {
        pulse.value = withRepeat(
            withTiming(1, { duration: duration }),
            -1,
            true // reverse
        );
    }, []);

    const radius = useDerivedValue(() => {
        return size / 2 + (pulse.value * 10);
    });

    const blur = useDerivedValue(() => {
        return 20 + (pulse.value * 15);
    });

    const opacity = useDerivedValue(() => {
        return 0.3 + (pulse.value * 0.2);
    });

    return (
        <Canvas style={{ width: size + 40, height: size + 40 }}>
            <Circle cx={(size + 40) / 2} cy={(size + 40) / 2} r={radius} color={color} opacity={opacity}>
                <BlurMask blur={blur} style="normal" />
            </Circle>
            <Circle cx={(size + 40) / 2} cy={(size + 40) / 2} r={size / 4} color={color} opacity={0.8}>
                <BlurMask blur={5} style="normal" />
            </Circle>
        </Canvas>
    );
};

export default FloatingOrb;

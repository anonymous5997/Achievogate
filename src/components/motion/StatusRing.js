import { BlurMask, Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { View } from 'react-native';
import {
    Easing,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { MotionTokens } from '../../motion/MotionTokens';
import theme from '../../theme/theme';

const StatusRing = ({
    progress = 0.75, // 0 to 1
    size = 100,
    strokeWidth = 10,
    color = theme.colors.primary,
    trackColor = 'rgba(255,255,255,0.1)'
}) => {
    const animatedProgress = useSharedValue(0);
    const pulse = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withTiming(progress, { duration: MotionTokens.timing.cinematicLong });
        pulse.value = withRepeat(
            withTiming(4, { duration: MotionTokens.light.pulseSpeed.slow, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, [progress]);

    const path = useDerivedValue(() => {
        const p = Skia.Path.Make();
        p.addArc({ x: strokeWidth / 2, y: strokeWidth / 2, width: size - strokeWidth, height: size - strokeWidth }, -90, animatedProgress.value * 360);
        return p;
    });

    const trackPath = Skia.Path.Make();
    trackPath.addArc({ x: strokeWidth / 2, y: strokeWidth / 2, width: size - strokeWidth, height: size - strokeWidth }, 0, 360);

    return (
        <View style={{ width: size, height: size }}>
            <Canvas style={{ flex: 1 }}>
                <Path
                    path={trackPath}
                    color={trackColor}
                    style="stroke"
                    strokeWidth={strokeWidth}
                    strokeCap="round"
                />
                {/* Glow Layer */}
                <Path
                    path={path}
                    color={color}
                    style="stroke"
                    strokeWidth={strokeWidth}
                    strokeCap="round"
                >
                    <BlurMask blur={pulse} style="normal" />
                </Path>
                {/* Core Layer */}
                <Path
                    path={path}
                    color={color}
                    style="stroke"
                    strokeWidth={strokeWidth}
                    strokeCap="round"
                />
            </Canvas>
        </View>
    );
};

export default StatusRing;

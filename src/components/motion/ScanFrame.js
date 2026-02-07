import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import theme from '../../theme/theme';

const ScanFrame = ({ active = false, color = theme.colors.status.success }) => {
    const scanOpacity = useSharedValue(0);
    const scanTranslateY = useSharedValue(0);

    useEffect(() => {
        if (active) {
            scanOpacity.value = withTiming(1, { duration: 300 });
            scanTranslateY.value = withRepeat(
                withTiming(250, { duration: 2000 }),
                -1,
                true
            );
        } else {
            scanOpacity.value = withTiming(0);
            scanTranslateY.value = 0;
        }
    }, [active]);

    const scannerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanTranslateY.value }],
        opacity: scanOpacity.value
    }));

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={[styles.corner, styles.tl, { borderColor: color }]} />
            <View style={[styles.corner, styles.tr, { borderColor: color }]} />
            <View style={[styles.corner, styles.bl, { borderColor: color }]} />
            <View style={[styles.corner, styles.br, { borderColor: color }]} />

            <Animated.View style={[styles.scanLine, { backgroundColor: color }, scannerStyle]} />
        </View>
    );
};

const styles = StyleSheet.create({
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#fff',
        borderWidth: 4,
    },
    tl: { top: 40, left: 40, borderRightWidth: 0, borderBottomWidth: 0 },
    tr: { top: 40, right: 40, borderLeftWidth: 0, borderBottomWidth: 0 },
    bl: { bottom: 40, left: 40, borderRightWidth: 0, borderTopWidth: 0 },
    br: { bottom: 40, right: 40, borderLeftWidth: 0, borderTopWidth: 0 },
    scanLine: {
        position: 'absolute',
        top: 60,
        left: 40,
        right: 40,
        height: 2,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    }
});

export default ScanFrame;

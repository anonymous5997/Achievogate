import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';

// Simple Glass Card (Reanimated removed for Expo Go compatibility)
const AnimatedCard3D = ({
    children,
    style,
    onPress,
}) => {
    const Content = (
        <View style={styles.surface}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.65)' }]} />
            <View style={styles.padding}>{children}</View>
        </View>
    );

    if (onPress) {
        return (
            <View style={[styles.container, style]} onTouchEnd={onPress}>
                {Content}
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {Content}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    surface: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    padding: {
        padding: 20,
    }
});

export default AnimatedCard3D;

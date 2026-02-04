import { StyleSheet, View } from 'react-native';

// Simple Screen Wrapper (Reanimated removed for Expo Go compatibility)
const AnimatedScreenWrapper = ({ children, style, noPadding = false }) => {
    return (
        <View style={[styles.container, noPadding && styles.noPadding, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    noPadding: {
        padding: 0,
    }
});

export default AnimatedScreenWrapper;

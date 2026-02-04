import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import theme from '../theme/theme';

const GradientBackground = ({ children, style }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme.colors.background.subtleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.gradient, style]}
            >
                {children}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.screen, // Fallback
    },
    gradient: {
        flex: 1,
    },
});

export default GradientBackground;

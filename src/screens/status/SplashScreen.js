import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import CinematicBackground from '../../components/CinematicBackground';
import theme from '../../theme/theme';

// Simple Splash Screen (Moti removed for Expo Go compatibility)
const SplashScreen = () => {
    return (
        <CinematicBackground>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.secondary]}
                        style={styles.logoCircle}
                    >
                        <Text style={styles.logoText}>AG</Text>
                    </LinearGradient>
                    <Text style={styles.title}>ACHIEVOGATE</Text>
                    <Text style={styles.subtitle}>SECURE ACCESS SYSTEM</Text>
                </View>
            </View>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
    },
    logoText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    title: {
        ...theme.typography.h1,
        marginBottom: 8,
    },
    subtitle: {
        ...theme.typography.caption,
        letterSpacing: 4,
        color: theme.colors.secondary,
    },
});

export default SplashScreen;

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicButton from '../../components/CinematicButton';
import theme from '../../theme/theme';

const ErrorScreen = ({ error, onRetry }) => {
    return (
        <CinematicBackground>
            <View style={styles.container}>
                <AnimatedCard3D glowColor={theme.colors.status.denied}>
                    <View style={styles.content}>
                        <View style={styles.iconBox}>
                            <Ionicons name="cloud-offline" size={48} color={theme.colors.status.denied} />
                        </View>
                        <Text style={styles.title}>Connection Lost</Text>
                        <Text style={styles.message}>
                            {error || "We couldn't connect to AchievoGate. Please check your internet settings."}
                        </Text>

                        <CinematicButton
                            title="Retry Connection"
                            onPress={onRetry}
                            style={{ marginTop: 24, width: '100%' }}
                        />
                    </View>
                </AnimatedCard3D>
            </View>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        padding: 16,
    },
    iconBox: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#FEE2E2',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24, fontWeight: '700', color: theme.colors.text.primary,
        marginBottom: 8,
    },
    message: {
        textAlign: 'center',
        color: theme.colors.text.secondary,
        lineHeight: 22,
    }
});

export default ErrorScreen;

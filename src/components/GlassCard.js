import { StyleSheet, View } from 'react-native';
// Note: On newer Expo versions/some Android device settings, BlurView might need explicit intensity
// But for "Glassmorphism" on white backgrounds, standard Views with semi-transparent RGBA often work better + cleaner
// especially for the "Clean Dribbble" look which is usually just white + opacity + blur.
// We will use Expo BlurView but with fallback styling for consistency.
import { BlurView } from 'expo-blur';
import theme from '../theme/theme';

const GlassCard = ({
    children,
    style,
    intensity = 20,
    variant = 'default', // 'default' | 'highlight'
    padding = 'default' // 'default' | 'large' | 'none'
}) => {

    const getPadding = () => {
        switch (padding) {
            case 'large': return theme.spacing.xl;
            case 'none': return 0;
            default: return theme.spacing.lg;
        }
    };

    return (
        <View style={[styles.outerContainer, style]}>
            <BlurView intensity={intensity} tint="light" style={styles.blurContainer}>
                <View style={[
                    styles.innerContent,
                    {
                        backgroundColor: variant === 'highlight'
                            ? 'rgba(255, 255, 255, 0.6)'
                            : 'rgba(255, 255, 255, 0.8)',
                        padding: getPadding(),
                    }
                ]}>
                    {children}
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        borderRadius: theme.layout.cardRadius,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        backgroundColor: 'transparent',
        ...theme.layout.shadows.medium,
    },
    blurContainer: {
        // Flex 1 ensures it fills the outer container if size is fixed, 
        // but for dynamic auto-sizing cards, we rely on inner content to push size
    },
    innerContent: {
        // Background color provides the white tint for glass effect
        width: '100%',
    },
});

export default GlassCard;

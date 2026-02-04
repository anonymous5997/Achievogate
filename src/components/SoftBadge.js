import { StyleSheet, Text, View } from 'react-native';
import theme from '../theme/theme';

const SoftBadge = ({ text, color = theme.colors.accent, textColor = '#fff', icon }) => {
    return (
        <View style={[styles.container, { backgroundColor: color }]}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.text, { color: textColor }]}>
                {text}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 4,
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});

export default SoftBadge;

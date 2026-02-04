import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';
import AnimatedCard from './AnimatedCard';

const AnimatedListItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    index = 0,
    color = theme.colors.primary
}) => {
    return (
        <AnimatedCard index={index}>
            <TouchableOpacity
                style={styles.container}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={styles.content}>
                    <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                        <Ionicons name={icon} size={22} color={color} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                </View>
                {rightElement || (
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
                )}
            </TouchableOpacity>
        </AnimatedCard>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.card,
        borderRadius: theme.layout.cardRadius,
        marginBottom: theme.spacing.sm,
        // Soft shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        ...theme.typography.body1,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
    },
});

export default AnimatedListItem;

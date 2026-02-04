import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';

const NoticeCard = ({ notice, onPress }) => {
    const getIconName = () => {
        switch (notice.icon) {
            case 'bell':
                return 'notifications';
            case 'water':
                return 'water';
            case 'warning':
                return 'warning';
            default:
                return 'notifications';
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const d = new Date(date);
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress && onPress(notice)}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={getIconName()} size={20} color={theme.colors.accent} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {notice.title}
                </Text>
                <Text style={styles.date}>{formatDate(notice.date)}</Text>
            </View>
            {notice.priority === 'high' && (
                <View style={styles.priorityBadge}>
                    <View style={styles.pulse} />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FEF3F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        ...theme.typography.body1,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    date: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
    },
    priorityBadge: {
        marginLeft: 8,
    },
    pulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.status.pending,
    },
});

export default NoticeCard;

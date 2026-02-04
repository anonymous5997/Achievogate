import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';

const ComplaintCard = ({ complaint, onPress }) => {
    const getPriorityColor = () => {
        switch (complaint.priority) {
            case 'high':
                return theme.colors.status.denied;
            case 'medium':
                return theme.colors.status.pending;
            case 'low':
                return theme.colors.status.approved;
            default:
                return theme.colors.text.muted;
        }
    };

    const getStatusColor = () => {
        switch (complaint.status) {
            case 'resolved':
            case 'closed':
                return theme.colors.status.approved;
            case 'in-progress':
                return theme.colors.status.pending;
            case 'pending':
                return theme.colors.status.denied;
            default:
                return theme.colors.text.muted;
        }
    };

    const getCategoryIcon = () => {
        switch (complaint.category) {
            case 'maintenance':
                return 'construct';
            case 'security':
                return 'shield-checkmark';
            case 'noise':
                return 'volume-high';
            case 'cleanliness':
                return 'trash';
            default:
                return 'alert-circle';
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000); // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress && onPress(complaint)}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${getPriorityColor()}15` }]}>
                    <Ionicons name={getCategoryIcon()} size={20} color={getPriorityColor()} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.title} numberOfLines={1}>
                        {complaint.title}
                    </Text>
                    <Text style={styles.category}>{complaint.category.toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                    <Text style={styles.statusText}>{complaint.status.toUpperCase()}</Text>
                </View>
            </View>

            <Text style={styles.description} numberOfLines={2}>
                {complaint.description}
            </Text>

            <View style={styles.footer}>
                <Text style={styles.time}>{formatDate(complaint.createdAt)}</Text>
                {complaint.priority === 'high' && (
                    <View style={styles.priorityBadge}>
                        <View style={styles.pulse} />
                        <Text style={styles.priorityText}>HIGH PRIORITY</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    category: {
        ...theme.typography.caption,
        fontSize: 11,
        color: theme.colors.text.muted,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    description: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    time: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    pulse: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.status.denied,
        marginRight: 6,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.status.denied,
    },
});

export default ComplaintCard;

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../theme/theme';

const CommentItem = ({ comment }) => {
    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color={theme.colors.primary} />
            </View>

            <View style={styles.content}>
                <Text style={styles.author}>{comment.authorName}</Text>
                <Text style={styles.text}>{comment.content}</Text>
                <Text style={styles.time}>{getTimeAgo(comment.createdAt)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    author: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    text: {
        color: theme.colors.text.primary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    time: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
});

export default CommentItem;

import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';
import AnimatedCard3D from './AnimatedCard3D';

const PostCard = ({ post, onPress, onReact, onComment }) => {
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
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <AnimatedCard3D style={styles.card}>
                {post.isPinned && (
                    <View style={styles.pinnedBadge}>
                        <Ionicons name="pin" size={14} color={theme.colors.primary} />
                        <Text style={styles.pinnedText}>Pinned</Text>
                    </View>
                )}

                <View style={styles.header}>
                    {post.authorPhoto ? (
                        <Image source={{ uri: post.authorPhoto }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={20} color={theme.colors.primary} />
                        </View>
                    )}
                    <View style={styles.authorInfo}>
                        <Text style={styles.authorName}>{post.authorName}</Text>
                        <Text style={styles.authorFlat}>{post.authorFlatNumber} • {getTimeAgo(post.createdAt)}</Text>
                    </View>
                    {post.category && (
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) }]}>
                            <Text style={styles.categoryText}>{post.category}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.content} numberOfLines={5}>
                    {post.content}
                </Text>

                {post.images && post.images.length > 0 && (
                    <Image source={{ uri: post.images[0] }} style={styles.postImage} />
                )}

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.action} onPress={() => onReact && onReact('like')}>
                        <Ionicons name="heart-outline" size={20} color={theme.colors.text.secondary} />
                        <Text style={styles.actionText}>{post.reactions?.like || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.action} onPress={onComment}>
                        <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text.secondary} />
                        <Text style={styles.actionText}>{post.commentCount || 0}</Text>
                    </TouchableOpacity>

                    <View style={styles.action}>
                        <Ionicons name="eye-outline" size={20} color={theme.colors.text.secondary} />
                        <Text style={styles.actionText}>{post.views || 0}</Text>
                    </View>
                </View>
            </AnimatedCard3D>
        </TouchableOpacity>
    );
};

const getCategoryColor = (category) => {
    const colors = {
        general: theme.colors.primary + '40',
        maintenance: '#f59e0b40',
        event: '#10b98140',
        safety: '#ef444440',
        complaint: '#8b5cf640'
    };
    return colors[category] || colors.general;
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginBottom: 12,
    },
    pinnedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    pinnedText: {
        color: theme.colors.primary,
        fontSize: 12,
        marginLeft: 4,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    authorInfo: {
        flex: 1,
        marginLeft: 12,
    },
    authorName: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    authorFlat: {
        color: theme.colors.text.secondary,
        fontSize: 12,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    categoryText: {
        color: theme.colors.text.primary,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    content: {
        color: theme.colors.text.primary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginLeft: 6,
    },
});

export default PostCard;

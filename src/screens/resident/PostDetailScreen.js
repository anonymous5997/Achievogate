import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import CommentItem from '../../components/CommentItem';
import useAuth from '../../hooks/useAuth';
import communityService from '../../services/communityService';
import theme from '../../theme/theme';

const PostDetailScreen = ({ route, navigation }) => {
    const { postId } = route.params;
    const { userProfile } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [postData, commentsData] = await Promise.all([
            communityService.getPost(postId),
            communityService.getComments(postId)
        ]);

        setPost(postData);
        setComments(commentsData);
        setLoading(false);
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        const result = await communityService.addComment({
            postId,
            societyId: userProfile.societyId,
            authorId: userProfile.uid,
            authorName: userProfile.name,
            content: commentText.trim()
        });

        if (result.success) {
            setCommentText('');
            loadData();
        }
    };

    const handleReact = async (reactionType) => {
        await communityService.addReaction(postId, reactionType);
        setPost({
            ...post,
            reactions: {
                ...post.reactions,
                [reactionType]: (post.reactions?.[reactionType] || 0) + 1
            }
        });
    };

    if (loading || !post) {
        return (
            <View style={styles.container}>
                <CinematicBackground />
                <CinematicHeader title="Post" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <CinematicBackground />
            <CinematicHeader title="Post" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />

            <ScrollView style={styles.content}>
                <AnimatedCard3D style={styles.postCard}>
                    <Text style={styles.author}>{post.authorName}</Text>
                    <Text style={styles.flatNumber}>{post.authorFlatNumber}</Text>

                    <Text style={styles.postContent}>{post.content}</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.action} onPress={() => handleReact('like')}>
                            <Ionicons name="heart" size={20} color={theme.colors.status.error} />
                            <Text style={styles.actionText}>{post.reactions?.like || 0}</Text>
                        </TouchableOpacity>

                        <View style={styles.action}>
                            <Ionicons name="chatbubble" size={20} color={theme.colors.primary} />
                            <Text style={styles.actionText}>{comments.length}</Text>
                        </View>
                    </View>
                </AnimatedCard3D>

                <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

                {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                ))}

                {comments.length === 0 && (
                    <Text style={styles.noComments}>No comments yet. Be the first!</Text>
                )}
            </ScrollView>

            <View style={styles.commentInput}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a comment..."
                    placeholderTextColor={theme.colors.text.muted}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
                    <Ionicons name="send" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
    },
    postCard: {
        padding: 20,
        margin: 16,
    },
    author: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    flatNumber: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        marginBottom: 16,
    },
    postContent: {
        color: theme.colors.text.primary,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    actions: {
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
        marginLeft: 6,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    noComments: {
        color: theme.colors.text.muted,
        textAlign: 'center',
        padding: 20,
    },
    commentInput: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: theme.colors.surface,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: theme.colors.text.primary,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 12,
        padding: 8,
    },
});

export default PostDetailScreen;

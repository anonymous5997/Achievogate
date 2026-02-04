import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { FlatList, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import FloatingActionButton from '../../components/FloatingActionButton';
import PostCard from '../../components/PostCard';
import useAuth from '../../hooks/useAuth';
import communityService from '../../services/communityService';
import theme from '../../theme/theme';

const CommunityFeedScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        if (!userProfile?.societyId) return;

        const postsData = await communityService.getPosts(userProfile.societyId);
        setPosts(postsData);
        setLoading(false);
        setRefreshing(false);
    };

    const handleReact = async (postId, reactionType) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        await communityService.addReaction(postId, reactionType);

        // Update local state
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    reactions: {
                        ...p.reactions,
                        [reactionType]: (p.reactions?.[reactionType] || 0) + 1
                    }
                };
            }
            return p;
        }));
    };

    const handleCreatePost = () => {
        if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
        }
        navigation.navigate('CreatePostScreen');
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader title="Community" subtitle="Stay connected" />

            <FlatList
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        onPress={() => navigation.navigate('PostDetailScreen', { postId: item.id })}
                        onReact={(type) => handleReact(item.id, type)}
                        onComment={() => navigation.navigate('PostDetailScreen', { postId: item.id })}
                    />
                )}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadPosts} />}
                showsVerticalScrollIndicator={false}
            />

            <FloatingActionButton icon="add" onPress={handleCreatePost} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    list: {
        padding: 16,
    },
});

export default CommunityFeedScreen;

import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import communityService from '../../services/communityService';
import theme from '../../theme/theme';

const CreatePostScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [posting, setPosting] = useState(false);

    const categories = [
        { id: 'general', label: 'General', color: theme.colors.primary },
        { id: 'maintenance', label: 'Maintenance', color: '#f59e0b' },
        { id: 'event', label: 'Event', color: '#10b981' },
        { id: 'safety', label: 'Safety', color: '#ef4444' },
    ];

    const handlePost = async () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Please enter some content');
            return;
        }

        setPosting(true);

        const result = await communityService.createPost({
            societyId: userProfile.societyId,
            type: 'post',
            authorId: userProfile.uid,
            authorName: userProfile.name,
            authorFlatNumber: userProfile.flatNumber,
            authorPhoto: userProfile.photoUrl,
            content: content.trim(),
            category,
            images: []
        });

        setPosting(false);

        if (result.success) {
            Alert.alert('Success', 'Post created successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', result.error || 'Failed to create post');
        }
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Create Post"
                subtitle="Share with community"
                leftIcon="close"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                <AnimatedCard3D style={styles.card}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categories}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryButton,
                                    category === cat.id && { backgroundColor: cat.color + '40', borderColor: cat.color }
                                ]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    category === cat.id && { color: cat.color }
                                ]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Content</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="What's on your mind?"
                        placeholderTextColor={theme.colors.text.muted}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={8}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.postButton, posting && styles.postButtonDisabled]}
                        onPress={handlePost}
                        disabled={posting}
                    >
                        <Text style={styles.postButtonText}>
                            {posting ? 'Posting...' : 'Post to Community'}
                        </Text>
                    </TouchableOpacity>
                </AnimatedCard3D>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        padding: 20,
    },
    label: {
        color: theme.colors.text.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    categories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        color: theme.colors.text.primary,
        fontSize: 16,
        minHeight: 150,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    postButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    postButtonDisabled: {
        opacity: 0.5,
    },
    postButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreatePostScreen;

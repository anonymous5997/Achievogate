import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const communityService = {
    // Create a new post
    createPost: async (postData) => {
        try {
            const docRef = await addDoc(collection(db, 'posts'), {
                ...postData,
                isPinned: false,
                reactions: { like: 0, love: 0, helpful: 0 },
                commentCount: 0,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            return { success: true, postId: docRef.id };
        } catch (error) {
            console.error('Error creating post:', error);
            return { success: false, error: error.message };
        }
    },

    // Get posts for a society
    getPosts: async (societyId, limitCount = 20) => {
        try {
            const q = query(
                collection(db, 'posts'),
                where('societyId', '==', societyId),
                where('status', '==', 'active'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            const posts = [];

            snapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });

            return posts;
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    },

    // Get a single post
    getPost: async (postId) => {
        try {
            const docRef = doc(db, 'posts', postId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error('Error fetching post:', error);
            return null;
        }
    },

    // Add a reaction to a post
    addReaction: async (postId, reactionType) => {
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                [`reactions.${reactionType}`]: increment(1)
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding reaction:', error);
            return { success: false, error: error.message };
        }
    },

    // Add a comment to a post
    addComment: async (commentData) => {
        try {
            const docRef = await addDoc(collection(db, 'comments'), {
                ...commentData,
                reactions: { like: 0 },
                status: 'active',
                createdAt: serverTimestamp()
            });

            // Increment comment count on post
            const postRef = doc(db, 'posts', commentData.postId);
            await updateDoc(postRef, {
                commentCount: increment(1)
            });

            return { success: true, commentId: docRef.id };
        } catch (error) {
            console.error('Error adding comment:', error);
            return { success: false, error: error.message };
        }
    },

    // Get comments for a post
    getComments: async (postId) => {
        try {
            const q = query(
                collection(db, 'comments'),
                where('postId', '==', postId),
                where('status', '==', 'active'),
                orderBy('createdAt', 'asc')
            );

            const snapshot = await getDocs(q);
            const comments = [];

            snapshot.forEach(doc => {
                comments.push({ id: doc.id, ...doc.data() });
            });

            return comments;
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    },

    // Pin/unpin a post (admin only)
    togglePin: async (postId, userId) => {
        try {
            const postRef = doc(db, 'posts', postId);
            const postSnap = await getDoc(postRef);

            if (!postSnap.exists()) {
                return { success: false, error: 'Post not found' };
            }

            const currentPinStatus = postSnap.data().isPinned;

            await updateDoc(postRef, {
                isPinned: !currentPinStatus,
                pinnedBy: !currentPinStatus ? userId : null,
                pinnedAt: !currentPinStatus ? serverTimestamp() : null
            });

            return { success: true };
        } catch (error) {
            console.error('Error toggling pin:', error);
            return { success: false, error: error.message };
        }
    }
};

export default communityService;

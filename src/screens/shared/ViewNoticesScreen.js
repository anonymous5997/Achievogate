import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import noticeService from '../../services/noticeService';
import theme from '../../theme/theme';

const ViewNoticesScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadNotices();
        }, [userProfile?.societyId])
    );

    const loadNotices = async () => {
        if (!userProfile?.societyId) return;
        setLoading(true);
        // Assuming userProfile has 'role' and 'block' (derived from flatNumber e.g., 'A' from 'A-101')
        const block = userProfile.flatNumber ? userProfile.flatNumber.split('-')[0] : null; // Simple heuristic

        const res = await noticeService.getNotices(
            userProfile.societyId,
            userProfile.role,
            block
        );

        if (res.success) {
            setNotices(res.notices);
        }
        setLoading(false);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        // Handle Firestore Timestamp or Date object
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <CinematicBackground>
            <AnimatedScreenWrapper noPadding>
                <CinematicHeader
                    title="Notices"
                    subTitle={`${notices.length} Announcements`}
                    onBack={() => navigation.goBack()}
                />

                <FlatList
                    data={notices}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadNotices} tintColor={theme.colors.primary} />
                    }
                    renderItem={({ item, index }) => (
                        <AnimatedCard3D index={index} delay={index * 50} style={styles.card}>
                            <View style={styles.noticeHeader}>
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: item.targetRole === 'all' ? '#EEF2FF' : '#FEF3C7' }
                                ]}>
                                    <Ionicons
                                        name={item.targetRole === 'all' ? 'megaphone' : 'people'}
                                        size={24}
                                        color={item.targetRole === 'all' ? theme.colors.primary : theme.colors.status.warning}
                                    />
                                </View>
                                <View style={styles.headerInfo}>
                                    <Text style={styles.noticeTitle}>{item.title}</Text>
                                    <Text style={styles.noticeDate}>{formatDate(item.createdAt)}</Text>
                                </View>
                                {item.targetRole !== 'all' && (
                                    <View style={styles.priorityBadge}>
                                        <Text style={styles.priorityText}>{item.targetRole.toUpperCase()}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.noticeContent}>{item.content}</Text>
                        </AnimatedCard3D>
                    )}
                    ListEmptyComponent={
                        !loading && (
                            <AnimatedCard3D>
                                <View style={styles.emptyState}>
                                    <Ionicons name="megaphone-outline" size={64} color={theme.colors.text.muted} />
                                    <Text style={styles.emptyTitle}>No Notices</Text>
                                    <Text style={styles.emptySubtitle}>No announcements for you at this time</Text>
                                </View>
                            </AnimatedCard3D>
                        )
                    }
                />
            </AnimatedScreenWrapper>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 24,
    },
    card: {
        marginBottom: 12,
    },

    // Notice
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    noticeTitle: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    noticeDate: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.text.muted,
    },
    priorityBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.status.warning,
    },
    noticeContent: {
        ...theme.typography.body1,
        fontSize: 14,
        color: theme.colors.text.secondary,
        lineHeight: 20,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        ...theme.typography.body1,
        color: theme.colors.text.muted,
    },
});

export default ViewNoticesScreen;

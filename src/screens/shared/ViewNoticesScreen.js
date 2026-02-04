import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import useNotices from '../../hooks/useNotices';
import theme from '../../theme/theme';

const ViewNoticesScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const { notices, loading } = useNotices();

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
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
                    renderItem={({ item, index }) => (
                        <AnimatedCard3D index={index} delay={index * 50} style={styles.card}>
                            <View style={styles.noticeHeader}>
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: item.priority === 'high' ? '#FEE2E2' : '#EEF2FF' }
                                ]}>
                                    <Ionicons
                                        name={item.icon || 'megaphone'}
                                        size={24}
                                        color={item.priority === 'high' ? theme.colors.status.denied : theme.colors.primary}
                                    />
                                </View>
                                <View style={styles.headerInfo}>
                                    <Text style={styles.noticeTitle}>{item.title}</Text>
                                    <Text style={styles.noticeDate}>{formatDate(item.date)}</Text>
                                </View>
                                {item.priority === 'high' && (
                                    <View style={styles.priorityBadge}>
                                        <View style={styles.pulse} />
                                        <Text style={styles.priorityText}>HIGH</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.noticeContent}>{item.content}</Text>
                        </AnimatedCard3D>
                    )}
                    ListEmptyComponent={
                        <AnimatedCard3D>
                            <View style={styles.emptyState}>
                                <Ionicons name="megaphone-outline" size={64} color={theme.colors.text.muted} />
                                <Text style={styles.emptyTitle}>No Notices</Text>
                                <Text style={styles.emptySubtitle}>No announcements at this time</Text>
                            </View>
                        </AnimatedCard3D>
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

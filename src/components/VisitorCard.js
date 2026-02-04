import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';
import GlassCard from './GlassCard';
import PrimaryButton from './NeonButton'; // Aliased
import SoftBadge from './SoftBadge';

const VisitorCard = ({ visitor, onApprove, onDeny, onPress, showActions = false }) => {

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { color: theme.colors.status.pending, icon: 'time', label: 'Pending' };
            case 'approved': return { color: theme.colors.status.approved, icon: 'checkmark-circle', label: 'Approved' };
            case 'denied': return { color: theme.colors.status.denied, icon: 'close-circle', label: 'Denied' };
            case 'entered': return { color: theme.colors.status.active, icon: 'walk', label: 'Entered' };
            case 'exited': return { color: theme.colors.status.inactive, icon: 'exit', label: 'Exited' };
            default: return { color: theme.colors.text.muted, icon: 'help-circle', label: status };
        }
    };

    const statusConfig = getStatusConfig(visitor.status);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Just now';
        // timestamp could be Firestore timestamp or Date string
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={!onPress}
            style={styles.touchableWrapper}
        >
            <GlassCard style={styles.card}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={20} color={theme.colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.visitorName}>{visitor.visitorName}</Text>
                            <Text style={styles.visitorPhone}>{visitor.phone}</Text>
                        </View>
                    </View>
                    <SoftBadge
                        text={statusConfig.label}
                        color={`${statusConfig.color}20`} // 20% opacity for badge bg
                        textColor={statusConfig.color}
                        icon={<Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />}
                    />
                </View>

                <View style={styles.divider} />

                {/* Details Grid */}
                <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Destination</Text>
                        <Text style={styles.detailValue}>Flat {visitor.flatNumber}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Purpose</Text>
                        <Text style={styles.detailValue}>{visitor.purpose}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{formatDate(visitor.createdAt)}</Text>
                    </View>
                </View>

                {/* Action Buttons (Only if showActions is true) */}
                {showActions && (
                    <View style={styles.actionRow}>
                        <PrimaryButton
                            title="Approve"
                            variant="primary"
                            onPress={onApprove}
                            style={styles.actionBtn}
                            textStyle={{ fontSize: 14 }}
                            icon={<Ionicons name="checkmark" size={16} color="#fff" />}
                        />
                        <PrimaryButton
                            title="Deny"
                            variant="danger"
                            onPress={onDeny}
                            style={styles.actionBtn}
                            textStyle={{ fontSize: 14 }}
                            icon={<Ionicons name="close" size={16} color="#fff" />}
                        />
                    </View>
                )}
            </GlassCard>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchableWrapper: {
        marginBottom: theme.spacing.md,
    },
    card: {
        padding: theme.spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${theme.colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    visitorName: {
        ...theme.typography.h3,
        fontSize: 16,
        lineHeight: 20,
        marginBottom: 2,
    },
    visitorPhone: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.text.muted,
        opacity: 0.1,
        marginBottom: theme.spacing.md,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 4,
    },
    detailItem: {
        minWidth: '28%',
    },
    detailLabel: {
        ...theme.typography.caption,
        color: theme.colors.text.muted,
        marginBottom: 4,
    },
    detailValue: {
        ...theme.typography.body2,
        color: theme.colors.text.primary,
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        minHeight: 44,
    },
});

export default VisitorCard;

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';

const UserCard = ({ user, onPress, onEdit, onDelete }) => {
    const getRoleColor = () => {
        switch (user.role) {
            case 'admin':
                return theme.colors.accent;
            case 'guard':
                return theme.colors.secondary;
            case 'resident':
                return theme.colors.primary;
            default:
                return theme.colors.text.muted;
        }
    };

    const getRoleIcon = () => {
        switch (user.role) {
            case 'admin':
                return 'shield-checkmark';
            case 'guard':
                return 'shield';
            case 'resident':
                return 'person';
            default:
                return 'person-circle';
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress && onPress(user)}
            activeOpacity={0.8}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${getRoleColor()}15` }]}>
                    <Ionicons name={getRoleIcon()} size={24} color={getRoleColor()} />
                </View>
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {user.name}
                    </Text>
                    <View style={styles.detailsRow}>
                        {user.flatNumber && (
                            <View style={styles.detailItem}>
                                <Ionicons name="home" size={12} color={theme.colors.text.muted} />
                                <Text style={styles.detailText}>{user.flatNumber}</Text>
                            </View>
                        )}
                        {user.phone && (
                            <View style={styles.detailItem}>
                                <Ionicons name="call" size={12} color={theme.colors.text.muted} />
                                <Text style={styles.detailText}>{user.phone}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor() }]}>
                    <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
                </View>
            </View>

            {(onEdit || onDelete) && (
                <View style={styles.actions}>
                    {onEdit && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onEdit(user);
                            }}
                        >
                            <Ionicons name="create" size={14} color={theme.colors.primary} />
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onDelete(user);
                            }}
                        >
                            <Ionicons name="trash" size={14} color={theme.colors.status.denied} />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        ...theme.typography.h3,
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.text.muted,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    roleText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default UserCard;

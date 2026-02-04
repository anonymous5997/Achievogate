import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';

const SocietyCard = ({ society, onPress, onEdit, onDelete }) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress && onPress(society)}
            activeOpacity={0.8}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="business" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.name} numberOfLines={1}>
                        {society.name}
                    </Text>
                    <Text style={styles.address} numberOfLines={1}>
                        {society.address}
                    </Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{society.totalFlats || 0}</Text>
                    <Text style={styles.statLabel}>Flats</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{society.stats?.totalResidents || 0}</Text>
                    <Text style={styles.statLabel}>Residents</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{society.stats?.assignedGuards || 0}</Text>
                    <Text style={styles.statLabel}>Guards</Text>
                </View>
            </View>

            {(onEdit || onDelete) && (
                <View style={styles.actions}>
                    {onEdit && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onEdit(society);
                            }}
                        >
                            <Ionicons name="create" size={16} color={theme.colors.primary} />
                            <Text style={[styles.actionText, { color: theme.colors.primary }]}>Edit</Text>
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                onDelete(society);
                            }}
                        >
                            <Ionicons name="trash" size={16} color={theme.colors.status.denied} />
                            <Text style={[styles.actionText, { color: theme.colors.status.denied }]}>Delete</Text>
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
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        ...theme.typography.h3,
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    address: {
        ...theme.typography.body1,
        fontSize: 13,
        color: theme.colors.text.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        ...theme.typography.h2,
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        ...theme.typography.caption,
        fontSize: 11,
        color: theme.colors.text.muted,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: '#E2E8F0',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SocietyCard;

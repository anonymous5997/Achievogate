import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';
import AnimatedCard3D from './AnimatedCard3D';

const FacilityCard = ({ facility, onPress }) => {
    const getIcon = (type) => {
        const icons = {
            amenity: 'water',
            hall: 'business',
            court: 'tennisball',
            room: 'home'
        };
        return icons[type] || 'grid';
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <AnimatedCard3D style={styles.card}>
                {facility.images && facility.images.length > 0 ? (
                    <Image source={{ uri: facility.images[0] }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name={getIcon(facility.type)} size={48} color={theme.colors.primary} />
                    </View>
                )}

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{facility.name}</Text>
                        {facility.status === 'active' && (
                            <View style={styles.statusBadge}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Available</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.description} numberOfLines={2}>
                        {facility.description}
                    </Text>

                    <View style={styles.details}>
                        <View style={styles.detailItem}>
                            <Ionicons name="people-outline" size={16} color={theme.colors.text.secondary} />
                            <Text style={styles.detailText}>Capacity: {facility.capacity}</Text>
                        </View>

                        {facility.pricing?.residentPrice === 0 ? (
                            <View style={styles.detailItem}>
                                <Ionicons name="pricetag-outline" size={16} color={theme.colors.status.success} />
                                <Text style={[styles.detailText, { color: theme.colors.status.success }]}>Free</Text>
                            </View>
                        ) : (
                            <View style={styles.detailItem}>
                                <Ionicons name="cash-outline" size={16} color={theme.colors.text.secondary} />
                                <Text style={styles.detailText}>₹{facility.pricing?.residentPrice}/hr</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.arrow}>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
                </View>
            </AnimatedCard3D>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 140,
    },
    imagePlaceholder: {
        width: '100%',
        height: 140,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.status.success,
        marginRight: 6,
    },
    statusText: {
        color: theme.colors.status.success,
        fontSize: 12,
    },
    description: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    details: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    detailText: {
        color: theme.colors.text.secondary,
        fontSize: 13,
        marginLeft: 6,
    },
    arrow: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
});

export default FacilityCard;

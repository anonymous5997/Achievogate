import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';
import AnimatedCard3D from './AnimatedCard3D';

const VendorCard = ({ vendor, onPress }) => {
    const getCategoryIcon = (category) => {
        const icons = {
            plumbing: 'water',
            electrical: 'flash',
            carpentry: 'hammer',
            cleaning: 'sparkles',
            pest_control: 'bug'
        };
        return icons[category] || 'construct';
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <AnimatedCard3D style={styles.card}>
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Ionicons name={getCategoryIcon(vendor.category)} size={28} color={theme.colors.primary} />
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.name}>{vendor.name}</Text>
                        <Text style={styles.category}>{vendor.category?.replace('_', ' ').toUpperCase()}</Text>
                    </View>

                    {vendor.isVerified && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.colors.status.success} />
                    )}
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {vendor.description}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={16} color="#fbbf24" />
                        <Text style={styles.ratingText}>
                            {vendor.rating?.toFixed(1) || 'N/A'} ({vendor.totalReviews || 0})
                        </Text>
                    </View>

                    <View style={styles.pricing}>
                        <Text style={styles.priceLabel}>From </Text>
                        <Text style={styles.price}>₹{vendor.pricing?.baseCharge || 0}</Text>
                    </View>

                    <View style={styles.bookings}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.text.muted} />
                        <Text style={styles.bookingsText}>{vendor.totalBookings || 0} bookings</Text>
                    </View>
                </View>
            </AnimatedCard3D>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        ...theme.typography.h3,
        fontSize: 16,
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    category: {
        color: theme.colors.text.secondary,
        fontSize: 12,
    },
    description: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: theme.colors.text.primary,
        fontSize: 14,
        marginLeft: 4,
        fontWeight: 'bold',
    },
    pricing: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceLabel: {
        color: theme.colors.text.muted,
        fontSize: 12,
    },
    price: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    bookings: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookingsText: {
        color: theme.colors.text.muted,
        fontSize: 12,
        marginLeft: 4,
    },
});

export default VendorCard;

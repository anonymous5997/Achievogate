import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import vendorService from '../../services/vendorService';
import theme from '../../theme/theme';

const VendorDetailScreen = ({ route, navigation }) => {
    const { vendor } = route.params;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        const data = await vendorService.getVendorReviews(vendor.id);
        setReviews(data);
        setLoading(false);
    };

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            <Ionicons
                key={i}
                name={i < Math.floor(rating) ? 'star' : 'star-outline'}
                size={16}
                color="#fbbf24"
            />
        ));
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title={vendor.name}
                subtitle={vendor.category?.replace('_', ' ')}
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content}>
                <AnimatedCard3D style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.rating}>
                            {renderStars(vendor.rating || 0)}
                            <Text style={styles.ratingText}>
                                {vendor.rating?.toFixed(1) || 'N/A'} ({vendor.totalReviews || 0} reviews)
                            </Text>
                        </View>
                        {vendor.isVerified && (
                            <View style={styles.verified}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.status.success} />
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.description}>{vendor.description}</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact</Text>
                        <View style={styles.contactRow}>
                            <Ionicons name="call" size={16} color={theme.colors.primary} />
                            <Text style={styles.contactText}>{vendor.phone}</Text>
                        </View>
                        {vendor.email && (
                            <View style={styles.contactRow}>
                                <Ionicons name="mail" size={16} color={theme.colors.primary} />
                                <Text style={styles.contactText}>{vendor.email}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Pricing</Text>
                        <Text style={styles.price}>Base Charge: ₹{vendor.pricing?.baseCharge || 0}</Text>
                        <Text style={styles.price}>Hourly Rate: ₹{vendor.pricing?.hourlyRate || 0}/hr</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => navigation.navigate('ServiceRequestScreen', { vendor })}
                    >
                        <Text style={styles.bookButtonText}>Book Service</Text>
                    </TouchableOpacity>
                </AnimatedCard3D>

                <Text style={styles.reviewsTitle}>Reviews ({reviews.length})</Text>
                {reviews.map((review) => (
                    <AnimatedCard3D key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <Text style={styles.reviewAuthor}>{review.userName}</Text>
                            <View style={styles.reviewRating}>{renderStars(review.rating)}</View>
                        </View>
                        <Text style={styles.reviewText}>{review.review}</Text>
                    </AnimatedCard3D>
                ))}

                {reviews.length === 0 && !loading && (
                    <Text style={styles.noReviews}>No reviews yet</Text>
                )}
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
    },
    card: {
        padding: 20,
        margin: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: theme.colors.text.primary,
        marginLeft: 8,
        fontWeight: 'bold',
    },
    verified: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifiedText: {
        color: theme.colors.status.success,
        fontSize: 12,
        marginLeft: 4,
    },
    description: {
        color: theme.colors.text.primary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 12,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactText: {
        color: theme.colors.text.secondary,
        marginLeft: 8,
    },
    price: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginBottom: 6,
    },
    bookButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewsTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
    },
    reviewCard: {
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewAuthor: {
        color: theme.colors.text.primary,
        fontWeight: 'bold',
    },
    reviewRating: {
        flexDirection: 'row',
    },
    reviewText: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        lineHeight: 20,
    },
    noReviews: {
        color: theme.colors.text.muted,
        textAlign: 'center',
        padding: 20,
    },
});

export default VendorDetailScreen;

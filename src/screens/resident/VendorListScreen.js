import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import VendorCard from '../../components/VendorCard';
import useAuth from '../../hooks/useAuth';
import vendorService from '../../services/vendorService';
import theme from '../../theme/theme';

const VendorListScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [vendors, setVendors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const categories = [
        { id: 'plumbing', label: 'Plumbing', icon: 'water' },
        { id: 'electrical', label: 'Electrical', icon: 'flash' },
        { id: 'carpentry', label: 'Carpentry', icon: 'hammer' },
        { id: 'cleaning', label: 'Cleaning', icon: 'sparkles' },
        { id: 'pest_control', label: 'Pest Control', icon: 'bug' },
    ];

    useEffect(() => {
        loadVendors();
    }, [selectedCategory]);

    const loadVendors = async () => {
        if (!userProfile?.societyId) return;

        const data = await vendorService.getVendors(userProfile.societyId, selectedCategory);
        setVendors(data);
        setLoading(false);
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Home Services"
                subtitle="Find trusted vendors"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <View style={styles.categories}>
                <TouchableOpacity
                    style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]}
                    onPress={() => setSelectedCategory(null)}
                >
                    <Text style={[styles.categoryLabel, !selectedCategory && styles.categoryLabelSelected]}>
                        All
                    </Text>
                </TouchableOpacity>

                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipSelected]}
                        onPress={() => setSelectedCategory(cat.id)}
                    >
                        <Ionicons
                            name={cat.icon}
                            size={16}
                            color={selectedCategory === cat.id ? '#fff' : theme.colors.text.secondary}
                        />
                        <Text style={[styles.categoryLabel, selectedCategory === cat.id && styles.categoryLabelSelected]}>
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={vendors}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <VendorCard
                        vendor={item}
                        onPress={() => navigation.navigate('VendorDetailScreen', { vendor: item })}
                    />
                )}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadVendors} />}
                ListEmptyComponent={
                    !loading && (
                        <Text style={styles.emptyText}>No vendors found</Text>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    categories: {
        flexDirection: 'row',
        padding: 16,
        flexWrap: 'wrap',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginRight: 8,
        marginBottom: 8,
    },
    categoryChipSelected: {
        backgroundColor: theme.colors.primary,
    },
    categoryLabel: {
        color: theme.colors.text.secondary,
        fontSize: 14,
        marginLeft: 6,
    },
    categoryLabelSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    emptyText: {
        color: theme.colors.text.muted,
        textAlign: 'center',
        marginTop: 40,
    },
});

export default VendorListScreen;

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/onboarding/PrimaryButton';

const TOP_CITIES = [
    { id: '1', name: 'Mumbai', icon: 'business' },
    { id: '2', name: 'Delhi', icon: 'home' },
    { id: '3', name: 'Bangalore', icon: 'leaf' },
    { id: '4', name: 'Hyderabad', icon: 'ribbon' },
    { id: '5', name: 'Chennai', icon: 'water' },
    { id: '6', name: 'Pune', icon: 'school' },
];

const ALL_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune',
    'Ahmedabad', 'Kolkata', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik'
];

const CitySelectionScreen = ({ route, navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);

    const filteredCities = ALL_CITIES.filter((city) =>
        city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleContinue = () => {
        navigation.navigate('AddHomeScreen', {
            ...route.params,
            city: selectedCity,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Select your city</Text>
                <Text style={styles.subtitle}>Where do you live?</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search city..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Top Cities Grid */}
                {!searchQuery && (
                    <>
                        <Text style={styles.sectionTitle}>Popular Cities</Text>
                        <View style={styles.topCitiesGrid}>
                            {TOP_CITIES.map((city) => (
                                <TouchableOpacity
                                    key={city.id}
                                    style={[
                                        styles.cityCard,
                                        selectedCity === city.name && styles.cityCardActive
                                    ]}
                                    onPress={() => setSelectedCity(city.name)}
                                >
                                    <Ionicons
                                        name={city.icon}
                                        size={28}
                                        color={selectedCity === city.name ? '#3B82F6' : '#6B7280'}
                                    />
                                    <Text style={[
                                        styles.cityCardName,
                                        selectedCity === city.name && styles.cityCardNameActive
                                    ]}>
                                        {city.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>All Cities</Text>
                    </>
                )}

                {/* City List */}
                <View style={styles.cityList}>
                    {filteredCities.map((city, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.cityItem,
                                selectedCity === city && styles.cityItemActive
                            ]}
                            onPress={() => setSelectedCity(city)}
                        >
                            <Text style={styles.cityName}>{city}</Text>
                            {selectedCity === city && (
                                <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Continue Button */}
            {selectedCity && (
                <View style={styles.footer}>
                    <PrimaryButton
                        title="Continue"
                        onPress={handleContinue}
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        padding: 32,
        paddingTop: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        paddingLeft: 12,
        fontSize: 16,
        color: '#111827',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    topCitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 32,
        marginHorizontal: -6,
    },
    cityCard: {
        width: '31%',
        aspectRatio: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 6,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    cityCardActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    cityCardName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 8,
    },
    cityCardNameActive: {
        color: '#3B82F6',
    },
    cityList: {
        paddingBottom: 100,
    },
    cityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cityItemActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    cityName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    footer: {
        position: 'absolute',
        bottom: 32,
        left: 32,
        right: 32,
    },
});

export default CitySelectionScreen;

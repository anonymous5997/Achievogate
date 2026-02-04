import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/onboarding/PrimaryButton';

const COUNTRIES = [
    { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
    { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
];

const CountrySelectionScreen = ({ route, navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(null);

    const filteredCountries = COUNTRIES.filter((country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleContinue = () => {
        navigation.navigate('CitySelectionScreen', {
            ...route.params,
            country: selectedCountry,
        });
    };

    const renderCountry = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.countryItem,
                selectedCountry?.code === item.code && styles.countryItemActive
            ]}
            onPress={() => setSelectedCountry(item)}
        >
            <Text style={styles.flag}>{item.flag}</Text>
            <Text style={styles.countryName}>{item.name}</Text>
            {selectedCountry?.code === item.code && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Select your country</Text>
                <Text style={styles.subtitle}>Choose where you live</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search country..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Country List */}
            <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                renderItem={renderCountry}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* Continue Button */}
            {selectedCountry && (
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
        marginBottom: 20,
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
    list: {
        paddingBottom: 100,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 18,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    countryItemActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    flag: {
        fontSize: 28,
        marginRight: 16,
    },
    countryName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    footer: {
        position: 'absolute',
        bottom: 32,
        left: 32,
        right: 32,
    },
});

export default CountrySelectionScreen;

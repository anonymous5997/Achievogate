import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PrimaryButton from '../../components/onboarding/PrimaryButton';
import TextInputField from '../../components/onboarding/TextInputField';

// Sample societies - replace with actual API call
const SAMPLE_SOCIETIES = [
    { id: '1', name: 'Green Valley Apartments', location: 'Sector 62, Noida' },
    { id: '2', name: 'Sunshine Residency', location: 'Whitefield, Bangalore' },
    { id: '3', name: 'Royal Palms Society', location: 'Andheri West, Mumbai' },
    { id: '4', name: 'Silver Oak Heights', location: 'Gachibowli, Hyderabad' },
    { id: '5', name: 'Emerald Gardens', location: 'Indirapuram, Ghaziabad' },
];

const AddHomeScreen = ({ route, navigation }) => {
    const { country, city } = route.params;
    const [societyQuery, setSocietyQuery] = useState('');
    const [selectedSociety, setSelectedSociety] = useState(null);
    const [searching, setSearching] = useState(false);

    const filteredSocieties = societyQuery.trim()
        ? SAMPLE_SOCIETIES.filter((society) =>
            society.name.toLowerCase().includes(societyQuery.toLowerCase())
        )
        : [];

    const handleSocietySelect = (society) => {
        setSelectedSociety(society);
        setSocietyQuery(society.name);
    };

    const handleContinue = () => {
        navigation.navigate('BuildingSelectionScreen', {
            ...route.params,
            society: selectedSociety,
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
                <Text style={styles.title}>Add your home</Text>
                <Text style={styles.subtitle}>Search and select your society</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                {/* Country */}
                <TextInputField
                    label="Country"
                    value={country?.name || ''}
                    editable={false}
                    icon="globe-outline"
                />

                {/* City */}
                <TextInputField
                    label="City"
                    value={city || ''}
                    editable={false}
                    icon="location-outline"
                />

                {/* Society Search */}
                <Text style={styles.label}>Society Name</Text>
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrapper}>
                        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            value={societyQuery}
                            onChangeText={setSocietyQuery}
                            placeholder="Search for your society..."
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Search Results */}
                    {societyQuery.trim().length > 0 && (
                        <View style={styles.resultsContainer}>
                            {searching ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator color="#3B82F6" />
                                </View>
                            ) : filteredSocieties.length > 0 ? (
                                <FlatList
                                    data={filteredSocieties}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.resultItem}
                                            onPress={() => handleSocietySelect(item)}
                                        >
                                            <Ionicons name="business" size={20} color="#6B7280" />
                                            <View style={styles.resultTextContainer}>
                                                <Text style={styles.resultName}>{item.name}</Text>
                                                <Text style={styles.resultLocation}>{item.location}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                    style={styles.resultsList}
                                    keyboardShouldPersistTaps="handled"
                                />
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                                    <Text style={styles.emptyText}>No societies found</Text>
                                    <Text style={styles.emptySubtext}>Try a different search term</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>

            {/* Continue Button */}
            {selectedSociety && (
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
        marginBottom: 32,
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
    form: {
        flex: 1,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    searchContainer: {
        marginBottom: 20,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#111827',
    },
    resultsContainer: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    resultsList: {
        maxHeight: 300,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    resultTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    resultName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    resultLocation: {
        fontSize: 13,
        color: '#6B7280',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    footer: {
        paddingTop: 20,
    },
});

export default AddHomeScreen;

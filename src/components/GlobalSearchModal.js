import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useAuth from '../hooks/useAuth';
import searchService from '../services/searchService';
import theme from '../theme/theme';

const GlobalSearchModal = ({ visible, onClose, navigation }) => {
    const { userProfile } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (text) => {
        setQuery(text);
        if (text.length < 2) {
            setResults(null);
            return;
        }

        setLoading(true);
        // Debounce could be added here
        try {
            if (!userProfile?.societyId) return;
            const res = await searchService.globalSearch(userProfile.societyId, text);
            if (res.success) {
                setResults(res.results);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const navigateToItem = (item) => {
        onClose();
        // Navigation logic based on type
        switch (item.type) {
            case 'user':
                navigation.navigate('UserManagement', { filterId: item.id });
                break;
            case 'visitor':
                navigation.navigate('AllVisitors', { filterId: item.id });
                break;
            case 'flat':
                // navigate to flat detail if exists, else basics
                alert(`Flat: ${item.flatNumber}`);
                break;
            default:
                break;
        }
    };

    const renderSection = (title, items, icon) => {
        if (!items || items.length === 0) return null;
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={`${item.type}_${item.id}_${index}`}
                        style={styles.resultItem}
                        onPress={() => navigateToItem(item)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name={icon} size={20} color={theme.colors.primary} />
                        </View>
                        <View style={styles.resultText}>
                            <Text style={styles.resultMain}>
                                {item.name || item.visitorName || item.flatNumber}
                            </Text>
                            <Text style={styles.resultSub}>
                                {item.role || item.status || `Block ${item.block}`}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.text.muted} />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <BlurView intensity={90} tint="dark" style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
                        <TextInput
                            style={styles.input}
                            placeholder="Global Search (Users, Visitors, Flats)..."
                            placeholderTextColor={theme.colors.text.muted}
                            value={query}
                            onChangeText={handleSearch}
                            autoFocus={true}
                        />
                        {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={styles.closeText}>Cancel</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.resultsContainer} keyboardShouldPersistTaps="handled">
                    {!results && !loading && (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={48} color={theme.colors.text.muted} />
                            <Text style={styles.emptyText}>Type to search across everything</Text>
                        </View>
                    )}

                    {results && (
                        <>
                            {renderSection('Residents & Users', results.users, 'person')}
                            {renderSection('Visitors', results.visitors, 'people')}
                            {renderSection('Flats', results.flats, 'business')}

                            {/* Empty Result Check */}
                            {Object.values(results).every(arr => arr.length === 0) && (
                                <Text style={styles.noResults}>No matches found.</Text>
                            )}
                        </>
                    )}
                </ScrollView>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    input: {
        flex: 1,
        marginLeft: 8,
        color: 'white',
        fontSize: 16,
    },
    closeBtn: {
        marginLeft: 16,
    },
    closeText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        flex: 1,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    resultText: {
        flex: 1,
    },
    resultMain: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    resultSub: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
        opacity: 0.7,
    },
    emptyText: {
        color: theme.colors.text.muted,
        marginTop: 16,
    },
    noResults: {
        textAlign: 'center',
        color: theme.colors.text.muted,
        marginTop: 40,
    }
});

export default GlobalSearchModal;

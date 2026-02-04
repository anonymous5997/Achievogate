import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BuildingListItem from '../../components/onboarding/BuildingListItem';
import PrimaryButton from '../../components/onboarding/PrimaryButton';

const BUILDINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const BuildingSelectionScreen = ({ route, navigation }) => {
    const { society } = route.params;
    const [selectedBuilding, setSelectedBuilding] = useState(null);

    const handleComplete = async () => {
        // Save onboarding completion
        await AsyncStorage.setItem('onboardingCompleted', 'true');

        // In production, save user data and navigate to main app
        // For now, navigate to login
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Select your building</Text>
                <Text style={styles.subtitle}>
                    {society?.name || 'Your Society'}
                </Text>
            </View>

            {/* Buildings Section */}
            <Text style={styles.sectionTitle}>Buildings</Text>

            <ScrollView
                style={styles.buildingsList}
                contentContainerStyle={styles.buildingsListContent}
                showsVerticalScrollIndicator={false}
            >
                {BUILDINGS.map((building) => (
                    <BuildingListItem
                        key={building}
                        building={building}
                        onPress={() => setSelectedBuilding(building)}
                    />
                ))}
            </ScrollView>

            {/* Continue Button */}
            {selectedBuilding && (
                <View style={styles.footer}>
                    <View style={styles.selectedInfo}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.selectedText}>
                            Building {selectedBuilding} selected
                        </Text>
                    </View>
                    <PrimaryButton
                        title="Complete Setup"
                        onPress={handleComplete}
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    buildingsList: {
        flex: 1,
    },
    buildingsListContent: {
        paddingBottom: 120,
    },
    footer: {
        position: 'absolute',
        bottom: 32,
        left: 32,
        right: 32,
    },
    selectedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    selectedText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#10B981',
        marginLeft: 8,
    },
});

export default BuildingSelectionScreen;

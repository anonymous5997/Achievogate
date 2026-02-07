import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import vehicleService from '../../services/vehicleService';
import theme from '../../theme/theme';

const VehicleManagementScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Add Form State
    const [newVehicle, setNewVehicle] = useState({ number: '', type: 'Car', owner: '', slot: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadVehicles();
    }, [userProfile?.societyId]);

    useEffect(() => {
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            setFilteredVehicles(vehicles.filter(v =>
                v.plateNumber.toLowerCase().includes(lower) ||
                v.flatNumber.toLowerCase().includes(lower)
            ));
        } else {
            setFilteredVehicles(vehicles);
        }
    }, [searchQuery, vehicles]);

    const loadVehicles = async () => {
        setLoading(true);
        if (userProfile?.societyId) {
            const res = await vehicleService.getVehicles(userProfile.societyId);
            if (res.success) {
                setVehicles(res.vehicles);
                setFilteredVehicles(res.vehicles);
            }
        }
        setLoading(false);
    };

    const handleAddVehicle = async () => {
        if (!newVehicle.number || !newVehicle.owner) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please fill Plate Number and Flat Number');
            return;
        }

        setSubmitting(true);
        const vehicleData = {
            societyId: userProfile.societyId,
            plateNumber: newVehicle.number,
            flatNumber: newVehicle.owner,
            type: newVehicle.type,
            stickerId: newVehicle.slot, // Using slot as sticker ID for now
            ownerId: null // Optional: Link to specific user ID lookup later
        };

        const res = await vehicleService.addVehicle(vehicleData);
        setSubmitting(false);

        if (res.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Vehicle Added');
            setNewVehicle({ number: '', type: 'Car', owner: '', slot: '' });
            setShowAddForm(false);
            loadVehicles();
        } else {
            Alert.alert('Error', res.error);
        }
    };

    const handleDelete = (id) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Delete Vehicle',
            'Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await vehicleService.deleteVehicle(id);
                        loadVehicles();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Vehicle Management"
                subtitle="Manage Residents' Vehicles"
                onBack={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity onPress={() => {
                        setShowAddForm(!showAddForm);
                        Haptics.selectionAsync();
                    }}>
                        <Ionicons name="add" size={28} color={theme.colors.primary} />
                    </TouchableOpacity>
                }
            />

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={theme.colors.text.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search Plate or Flat..."
                    placeholderTextColor={theme.colors.text.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                {showAddForm && (
                    <AnimatedCard3D style={styles.addForm}>
                        <Text style={styles.formTitle}>Add New Vehicle</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Vehicle Number (e.g., KA-01-AB-1234)"
                            placeholderTextColor={theme.colors.text.muted}
                            value={newVehicle.number}
                            onChangeText={(text) => setNewVehicle({ ...newVehicle, number: text })}
                            autoCapitalize="characters"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Owner Flat (e.g., A-101)"
                            placeholderTextColor={theme.colors.text.muted}
                            value={newVehicle.owner}
                            onChangeText={(text) => setNewVehicle({ ...newVehicle, owner: text })}
                            autoCapitalize="characters"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Parking Slot / Sticker ID"
                            placeholderTextColor={theme.colors.text.muted}
                            value={newVehicle.slot}
                            onChangeText={(text) => setNewVehicle({ ...newVehicle, slot: text })}
                        />
                        <View style={styles.typeSelector}>
                            {['Car', 'Bike'].map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeButton, newVehicle.type === type && styles.typeButtonActive]}
                                    onPress={() => {
                                        setNewVehicle({ ...newVehicle, type });
                                        Haptics.selectionAsync();
                                    }}
                                >
                                    <Text style={[styles.typeText, newVehicle.type === type && styles.typeTextActive]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={[styles.saveButton, submitting && { opacity: 0.7 }]}
                            onPress={handleAddVehicle}
                            disabled={submitting}
                        >
                            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Vehicle</Text>}
                        </TouchableOpacity>
                    </AnimatedCard3D>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
                ) : filteredVehicles.length === 0 ? (
                    <Text style={styles.emptyText}>No vehicles found.</Text>
                ) : (
                    filteredVehicles.map((vehicle, index) => (
                        <AnimatedCard3D key={vehicle.id} index={index} style={styles.vehicleCard}>
                            <View style={styles.vehicleInfo}>
                                <View style={styles.vehicleHeader}>
                                    <Ionicons
                                        name={vehicle.type === 'Car' ? 'car-sport' : 'bicycle'}
                                        size={24}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={styles.vehicleNumber}>{vehicle.plateNumber}</Text>
                                </View>
                                <Text style={styles.vehicleDetail}>Owner: {vehicle.flatNumber}</Text>
                                {vehicle.stickerId ? <Text style={styles.vehicleDetail}>Sticker: {vehicle.stickerId}</Text> : null}
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(vehicle.id)} style={styles.deleteButton}>
                                <Ionicons name="trash-outline" size={20} color={theme.colors.status.error} />
                            </TouchableOpacity>
                        </AnimatedCard3D>
                    ))
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
        padding: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        margin: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 44,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#000' },
    addForm: {
        padding: 16,
        marginBottom: 20,
        backgroundColor: 'rgba(30,30,30,0.8)',
    },
    formTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 12,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: theme.colors.text.primary,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    typeSelector: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    typeButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: 8,
        borderRadius: 6,
    },
    typeButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    typeText: {
        color: theme.colors.text.secondary,
        fontWeight: '600',
    },
    typeTextActive: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        marginBottom: 12,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    vehicleNumber: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginLeft: 10,
    },
    vehicleDetail: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    deleteButton: {
        padding: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.text.muted,
        marginTop: 40,
        fontSize: 16
    }
});

export default VehicleManagementScreen;

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import theme from '../../theme/theme';

const VehicleManagementScreen = ({ navigation }) => {
    const [vehicles, setVehicles] = useState([
        { id: '1', number: 'KA-01-AB-1234', type: 'Car', owner: 'A-101', slot: 'P-12' },
        { id: '2', number: 'KA-05-XY-9876', type: 'Bike', owner: 'A-102', slot: 'B-05' },
    ]);
    const [newVehicle, setNewVehicle] = useState({ number: '', type: 'Car', owner: '', slot: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddVehicle = () => {
        if (!newVehicle.number || !newVehicle.owner || !newVehicle.slot) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setVehicles([...vehicles, { id: Date.now().toString(), ...newVehicle }]);
        setNewVehicle({ number: '', type: 'Car', owner: '', slot: '' });
        setShowAddForm(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
                    onPress: () => {
                        setVehicles(vehicles.filter(v => v.id !== id));
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
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
                rightIcon="add"
                onRightPress={() => {
                    setShowAddForm(!showAddForm);
                    Haptics.selectionAsync();
                }}
            />

            <ScrollView style={styles.content}>
                {showAddForm && (
                    <AnimatedCard3D style={styles.addForm}>
                        <Text style={styles.formTitle}>Add New Vehicle</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Vehicle Number (e.g., KA-01-AB-1234)"
                            placeholderTextColor={theme.colors.text.muted}
                            value={newVehicle.number}
                            onChangeText={(text) => setNewVehicle({ ...newVehicle, number: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Owner Flat (e.g., A-101)"
                            placeholderTextColor={theme.colors.text.muted}
                            value={newVehicle.owner}
                            onChangeText={(text) => setNewVehicle({ ...newVehicle, owner: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Parking Slot (e.g., P-10)"
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
                        <TouchableOpacity style={styles.saveButton} onPress={handleAddVehicle}>
                            <Text style={styles.saveButtonText}>Save Vehicle</Text>
                        </TouchableOpacity>
                    </AnimatedCard3D>
                )}

                {vehicles.map((vehicle) => (
                    <AnimatedCard3D key={vehicle.id} style={styles.vehicleCard}>
                        <View style={styles.vehicleInfo}>
                            <View style={styles.vehicleHeader}>
                                <Ionicons
                                    name={vehicle.type === 'Car' ? 'car-sport' : 'bicycle'}
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.vehicleNumber}>{vehicle.number}</Text>
                            </View>
                            <Text style={styles.vehicleDetail}>Owner: {vehicle.owner}</Text>
                            <Text style={styles.vehicleDetail}>Slot: {vehicle.slot}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(vehicle.id)} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.status.error} />
                        </TouchableOpacity>
                    </AnimatedCard3D>
                ))}
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
    }
});

export default VehicleManagementScreen;

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedCard3D from '../../components/AnimatedCard3D';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import useAuth from '../../hooks/useAuth';
import theme from '../../theme/theme';

const ProfileScreen = ({ navigation }) => {
    const { userProfile, updateProfile, signOut } = useAuth();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(userProfile?.name || '');
    const [phone, setPhone] = useState(userProfile?.phone || '');
    const [emergencyContact, setEmergencyContact] = useState(userProfile?.emergencyContact?.phone || '');

    const handleSave = async () => {
        const result = await updateProfile({
            name,
            phone,
            emergencyContact: {
                ...userProfile?.emergencyContact,
                phone: emergencyContact
            }
        });

        if (result.success) {
            Alert.alert('Success', 'Profile updated successfully!');
            setEditing(false);
        } else {
            Alert.alert('Error', result.error || 'Failed to update profile');
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Profile"
                subtitle={userProfile?.role?.toUpperCase()}
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity onPress={() => {
                        if (editing) {
                            setEditing(false);
                            setName(userProfile?.name || '');
                            setPhone(userProfile?.phone || '');
                        } else {
                            setEditing(true);
                        }
                    }}>
                        <Ionicons name={editing ? 'close' : 'create'} size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                }
            />

            <ScrollView style={styles.content}>
                {/* Profile Header */}
                <AnimatedCard3D style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        {userProfile?.photoUrl ? (
                            <Image source={{ uri: userProfile.photoUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={48} color={theme.colors.primary} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.profileName}>{userProfile?.name}</Text>
                    <Text style={styles.profileEmail}>{userProfile?.email}</Text>
                </AnimatedCard3D>

                {/* Profile Info */}
                <AnimatedCard3D style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Personal Information</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Full Name</Text>
                            {editing ? (
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter name"
                                    placeholderTextColor={theme.colors.text.muted}
                                />
                            ) : (
                                <Text style={styles.infoValue}>{userProfile?.name || 'N/A'}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            {editing ? (
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter phone"
                                    placeholderTextColor={theme.colors.text.muted}
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={styles.infoValue}>{userProfile?.phone || 'N/A'}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="home-outline" size={20} color={theme.colors.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Flat Number</Text>
                            <Text style={styles.infoValue}>{userProfile?.flatNumber || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="alert-circle-outline" size={20} color={theme.colors.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Emergency Contact</Text>
                            {editing ? (
                                <TextInput
                                    style={styles.input}
                                    value={emergencyContact}
                                    onChangeText={setEmergencyContact}
                                    placeholder="Enter emergency contact"
                                    placeholderTextColor={theme.colors.text.muted}
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={styles.infoValue}>
                                    {userProfile?.emergencyContact?.phone || 'Not set'}
                                </Text>
                            )}
                        </View>
                    </View>
                </AnimatedCard3D>

                {/* Security Settings */}
                <TouchableOpacity
                    style={styles.securityButton}
                    onPress={() => navigation.navigate('SecuritySettingsScreen')}
                >
                    <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.securityButtonText}>Security Settings</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
                </TouchableOpacity>

                {editing && (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                )}

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.status.error} />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
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
        padding: 16,
    },
    profileHeader: {
        alignItems: 'center',
        padding: 24,
        marginBottom: 16,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    profileEmail: {
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    infoCard: {
        padding: 20,
        marginBottom: 16,
    },
    cardTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoLabel: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        marginBottom: 4,
    },
    infoValue: {
        color: theme.colors.text.primary,
        fontSize: 16,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 10,
        color: theme.colors.text.primary,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    securityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        marginBottom: 16,
    },
    securityButtonText: {
        flex: 1,
        color: theme.colors.primary,
        fontWeight: '600',
        marginLeft: 12,
        fontSize: 16,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.status.error,
        marginBottom: 32,
    },
    signOutText: {
        color: theme.colors.status.error,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default ProfileScreen;

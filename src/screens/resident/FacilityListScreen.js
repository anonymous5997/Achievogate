import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import CinematicBackground from '../../components/CinematicBackground';
import CinematicHeader from '../../components/CinematicHeader';
import FacilityCard from '../../components/FacilityCard';
import useAuth from '../../hooks/useAuth';
import facilityService from '../../services/facilityService';
import theme from '../../theme/theme';

const FacilityListScreen = ({ navigation }) => {
    const { userProfile } = useAuth();
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadFacilities();
    }, []);

    const loadFacilities = async () => {
        if (!userProfile?.societyId) return;

        const data = await facilityService.getFacilities(userProfile.societyId);
        setFacilities(data);
        setLoading(false);
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <CinematicBackground />
            <CinematicHeader
                title="Facilities"
                subtitle="Book amenities"
                leftIcon="arrow-back"
                onLeftPress={() => navigation.goBack()}
            />

            <FlatList
                data={facilities}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <FacilityCard
                        facility={item}
                        onPress={() => navigation.navigate('BookFacilityScreen', { facility: item })}
                    />
                )}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFacilities} />}
                ListEmptyComponent={
                    !loading && (
                        <Text style={styles.emptyText}>No facilities available</Text>
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
    list: {
        padding: 16,
    },
    emptyText: {
        color: theme.colors.text.muted,
        textAlign: 'center',
        marginTop: 40,
    },
});

export default FacilityListScreen;

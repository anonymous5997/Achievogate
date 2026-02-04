import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

const TrustInfoCard = () => {
    return (
        <View style={styles.container}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <View style={styles.textContainer}>
                <Text style={styles.title}>Your data is safe</Text>
                <Text style={styles.description}>
                    We use industry-standard encryption and never share your personal information
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#D1FAE5',
        marginVertical: 20,
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#065F46',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: '#047857',
        lineHeight: 18,
    },
});

export default TrustInfoCard;

import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const NetworkStatusBanner = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [slideAnim] = useState(new Animated.Value(-50)); // Start hidden above

    useEffect(() => {
        let subscription;

        const checkInitial = async () => {
            const status = await Network.getNetworkStateAsync();
            setIsConnected(status.isConnected && status.isInternetReachable !== false);
        };

        checkInitial();

        // Note: Expo Network doesn't always have a robust listener on all platforms/versions
        // Polling or NetInfo is often used. For simplicity in this demo, we'll check periodically
        // or rely on active actions failing. But let's try a simulated interval for demo purposes
        // or use NetInfo if available. Since we didn't install @react-native-community/netinfo, 
        // we will stick to basic Expo Network checks on interval.

        const interval = setInterval(async () => {
            const status = await Network.getNetworkStateAsync();
            const online = status.isConnected && status.isInternetReachable !== false;
            if (online !== isConnected) setIsConnected(online);
        }, 5000);

        return () => clearInterval(interval);
    }, [isConnected]);

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isConnected ? -50 : 0,
            duration: 300,
            useNativeDriver: true
        }).start();
    }, [isConnected]);

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.banner}>
                <Ionicons name="cloud-offline" size={20} color="#fff" />
                <Text style={styles.text}>You are OFFLINE. Changes will exist locally.</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Below status bar
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
    },
    banner: {
        backgroundColor: '#64748B',
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700'
    }
});

export default NetworkStatusBanner;

import { Platform, StyleSheet, View } from 'react-native';

/**
 * A layout wrapper that handles responsive centering for Web.
 * On Mobile: Fits 100% width.
 * On Web: Centers content with a max-width (like Instagram/Twitter web).
 */
const WebContainer = ({ children, style }) => {
    if (Platform.OS === 'web') {
        return (
            <View style={[styles.webBackground, style]}>
                <View style={styles.webContainer}>
                    {children}
                </View>
            </View>
        );
    }

    return <View style={[styles.mobileContainer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    webBackground: {
        flex: 1,
        backgroundColor: '#0F172A', // Dark background for the outer sides
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
    },
    webContainer: {
        height: '100%',
        width: '100%',
        maxWidth: 500, // Limit width to look like a mobile app/dashboard
        backgroundColor: '#000',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    mobileContainer: {
        flex: 1,
    },
});

export default WebContainer;

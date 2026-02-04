import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const OnboardingSlide = ({ image, title, description }) => {
    return (
        <View style={styles.container}>
            <View style={styles.heroImageSection}>
                <Image source={image} style={styles.heroImage} resizeMode="cover" />
            </View>

            <View style={styles.bottomPanel}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width,
        height,
        backgroundColor: '#FAFAFA',
    },
    heroImageSection: {
        flex: 1,
        backgroundColor: '#E5E7EB',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    bottomPanel: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 32,
        paddingTop: 40,
        paddingBottom: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
        lineHeight: 36,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: '#6B7280',
        lineHeight: 24,
        letterSpacing: 0.2,
    },
});

export default OnboardingSlide;

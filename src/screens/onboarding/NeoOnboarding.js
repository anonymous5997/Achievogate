import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import CinematicBackground from '../../components/CinematicBackground';
import NeoCard from '../../components/NeoCard';
import NeonButton from '../../components/NeonButton';
import theme from '../../theme/theme';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        icon: 'home',
        title: 'Smarter Living\nRedefined',
        description: 'Experience seamless society management with digital visitor passes, instant alerts, and secure access control.',
    },
    {
        id: '2',
        icon: 'scan-circle',
        title: 'Visitor & Parcel\nAutomation',
        description: 'Pre-approve guests, track parcels, and get notified instantly when someone arrives at your gate.',
    },
    {
        id: '3',
        icon: 'construct',
        title: 'On-Demand\nHome Services',
        description: 'Book verified plumbers, electricians, and cleaners directly from your app with transparent pricing.',
    },
    {
        id: '4',
        icon: 'card',
        title: 'Seamless\nPayments',
        description: 'Pay maintenance, book facilities, and track all your society expenses in one secure place.',
    },
    {
        id: '5',
        icon: 'people',
        title: 'Connected\nCommunity',
        description: 'Join discussions, stay updated with notices, and participate in society events effortlessly.',
    },
];

const Slide = ({ item }) => {
    return (
        <View style={styles.slide}>
            <Animated.View entering={ZoomIn.delay(200).duration(800)} style={styles.imageContainer}>
                <View style={[styles.iconCircle, { shadowColor: theme.colors.primary }]}>
                    <Ionicons name={item.icon} size={80} color="#fff" />
                </View>
                <View style={[styles.glowRing, { borderColor: theme.colors.primary }]} />
            </Animated.View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );
};

const NeoOnboarding = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleSkip = async () => {
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        navigation.replace('GetStartedScreen'); // Or directly to Login if desired, keeping existing flow
    };

    const handleNext = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleSkip();
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    return (
        <CinematicBackground>
            <View style={styles.container}>
                {/* Header Skip */}
                <Animated.View entering={FadeInDown.delay(300)} style={styles.header}>
                    <TouchableOpacity onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip Intro</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Main Carousel */}
                <FlatList
                    ref={flatListRef}
                    data={ONBOARDING_DATA}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                    renderItem={({ item }) => <Slide item={item} />}
                    keyExtractor={(item) => item.id}
                    scrollEventThrottle={16}
                />

                {/* Bottom Section: Indicators & Button */}
                <Animated.View entering={FadeInUp.delay(500)} style={styles.bottomContainer}>
                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {ONBOARDING_DATA.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentIndex && styles.dotActive
                                ]}
                            />
                        ))}
                    </View>

                    <NeoCard style={styles.controlCard} glass={true} padding={20}>
                        <NeonButton
                            title={currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Continue'}
                            onPress={handleNext}
                            icon={currentIndex !== ONBOARDING_DATA.length - 1 && <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginRight: 8 }} />}
                        />
                    </NeoCard>
                </Animated.View>
            </View>
        </CinematicBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginTop: 60,
        alignItems: 'flex-end',
        paddingHorizontal: 24,
    },
    skipText: {
        ...theme.typography.caption,
        color: theme.colors.text.secondary,
        fontSize: 14,
    },
    slide: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    imageContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    glowRing: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 1,
        opacity: 0.3,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        ...theme.typography.h1,
        textAlign: 'center',
        marginBottom: 16,
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 10,
    },
    description: {
        ...theme.typography.body1,
        textAlign: 'center',
        color: theme.colors.text.secondary,
        lineHeight: 24,
    },
    bottomContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 6,
    },
    dotActive: {
        width: 32,
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    controlCard: {
        width: '100%',
    }
});

export default NeoOnboarding;

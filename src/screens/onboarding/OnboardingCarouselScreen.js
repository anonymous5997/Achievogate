import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef, useState } from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import OnboardingSlide from '../../components/onboarding/OnboardingSlide';
import PrimaryButton from '../../components/onboarding/PrimaryButton';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        image: require('../../../assets/onboarding/slide1_smart_living.png'),
        title: 'Welcome to smarter\ncommunity living',
        description: 'Experience seamless society management with digital visitor passes, instant alerts, and secure access control.',
    },
    {
        id: '2',
        image: require('../../../assets/onboarding/slide2_visitor_management.png'),
        title: 'Manage visitors &\ndeliveries seamlessly',
        description: 'Pre-approve guests, track parcels, and get notified instantly when someone arrives at your gate.',
    },
    {
        id: '3',
        image: require('../../../assets/onboarding/slide3_home_services.png'),
        title: 'Trusted local\nhome services',
        description: 'Book verified plumbers, electricians, and cleaners directly from your app with transparent pricing.',
    },
    {
        id: '4',
        image: require('../../../assets/onboarding/slide4_payments.png'),
        title: 'Society payments &\ndues made simple',
        description: 'Pay maintenance, book facilities, and track all your society expenses in one secure place.',
    },
    {
        id: '5',
        image: require('../../../assets/onboarding/slide5_community.png'),
        title: 'Stay connected with\nyour community',
        description: 'Join discussions, stay updated with notices, and participate in society events effortlessly.',
    },
];

const OnboardingCarouselScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleSkip = async () => {
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        navigation.replace('GetStartedScreen');
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
        <SafeAreaView style={styles.container}>
            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Carousel */}
            <FlatList
                ref={flatListRef}
                data={ONBOARDING_DATA}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
                renderItem={({ item }) => (
                    <OnboardingSlide
                        image={item.image}
                        title={item.title}
                        description={item.description}
                    />
                )}
                keyExtractor={(item) => item.id}
            />

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
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

                {/* Next/Get Started Button */}
                <PrimaryButton
                    title={currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
                    onPress={handleNext}
                    style={styles.nextButton}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    bottomControls: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        paddingHorizontal: 32,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
        marginHorizontal: 4,
    },
    dotActive: {
        width: 24,
        backgroundColor: '#3B82F6',
    },
    nextButton: {
        width: '100%',
    },
});

export default OnboardingCarouselScreen;

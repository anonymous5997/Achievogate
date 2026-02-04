import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashIntroScreen from './src/screens/SplashIntroScreen';

export default function App() {
    const [showIntro, setShowIntro] = useState(true);

    if (showIntro) {
        return (
            <SplashIntroScreen onComplete={() => setShowIntro(false)} />
        );
    }

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <NavigationContainer>
                    <StatusBar style="light" />
                    <AppNavigator />
                </NavigationContainer>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

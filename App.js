import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashIntroScreen from './src/screens/SplashIntroScreen';

export default function App() {
    const [showIntro, setShowIntro] = useState(true);

    console.log('App: Rendering. showIntro:', showIntro);

    if (showIntro) {
        return (
            <SplashIntroScreen onComplete={() => setShowIntro(false)} />
        );
    }

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <AuthProvider>
                    <NavigationContainer>
                        <StatusBar style="light" />
                        <AppNavigator />
                    </NavigationContainer>
                </AuthProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}

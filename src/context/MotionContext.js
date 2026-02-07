import { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

const MotionContext = createContext({
    isReducedMotion: false,
    performanceMode: 'high', // 'high' | 'balanced' | 'power_saver'
});

export const MotionProvider = ({ children }) => {
    const [isReducedMotion, setIsReducedMotion] = useState(false);
    const [performanceMode, setPerformanceMode] = useState('high');

    useEffect(() => {
        // Check system accessibility settings
        const checkMotion = async () => {
            const reduced = await AccessibilityInfo.isReduceMotionEnabled();
            setIsReducedMotion(reduced);
        };

        checkMotion();
        const subscription = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            setIsReducedMotion
        );

        return () => subscription.remove?.();
    }, []);

    // Basic performance monitoring (could be expanded)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                // If app comes to foreground, maybe reset to high if battery allows
                // specific logic can be added here
            } else if (nextAppState === 'background') {
                // Pause heavy animations if needed
            }
        });

        return () => subscription.remove();
    }, []);

    const value = {
        isReducedMotion,
        performanceMode,
        // Helper to conditionally return motion values
        getTransition: (type, fallback = {}) => {
            if (isReducedMotion) return fallback;
            return type; // e.g., MotionTokens.springs.enter
        }
    };

    return (
        <MotionContext.Provider value={value}>
            {children}
        </MotionContext.Provider>
    );
};

export const useMotion = () => useContext(MotionContext);

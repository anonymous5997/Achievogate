// Cinematic Animation Hooks
// Reusable animation utilities for consistent motion

import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import motionConfig from './motionConfig';

// Card Enter Animation
export const useCardEnter = (delay = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motionConfig.timing.normal,
        delay,
        easing: motionConfig.easing.standard,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motionConfig.timing.normal,
        delay,
        easing: motionConfig.easing.standard,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motionConfig.timing.normal,
        delay,
        easing: motionConfig.easing.standard,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, translateY, scale };
};

// Button Press Animation
export const useButtonPress = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: motionConfig.buttonPresets.primaryPress.scale,
      ...motionConfig.easing.spring,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      ...motionConfig.easing.spring,
      useNativeDriver: true,
    }).start();
  };

  return { scale, handlePressIn, handlePressOut };
};

// Hero Float Animation
export const useHeroFloat = () => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: motionConfig.cardPresets.heroFloat.translateY.from,
          duration: motionConfig.cardPresets.heroFloat.duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: motionConfig.cardPresets.heroFloat.translateY.to,
          duration: motionConfig.cardPresets.heroFloat.duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return { translateY };
};

// Icon Pulse Animation
export const useIconPulse = () => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: motionConfig.iconInteractions.pulse.duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: motionConfig.iconInteractions.pulse.duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return { scale };
};

// Fade In Animation
export const useFadeIn = (delay = 0, duration = motionConfig.timing.normal) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: motionConfig.easing.standard,
      useNativeDriver: true,
    }).start();
  }, []);

  return { opacity };
};

// Scale In Animation
export const useScaleIn = (delay = 0) => {
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      delay,
      ...motionConfig.easing.springBounce,
      useNativeDriver: true,
    }).start();
  }, []);

  return { scale };
};

// Stagger Delay Helper
export const getStaggerDelay = (index, baseDelay = motionConfig.listStagger.baseDelay) => {
  return Math.min(index * baseDelay, motionConfig.listStagger.maxDelay);
};

// Screen Enter Animation
export const useScreenEnter = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motionConfig.timing.screen,
        easing: motionConfig.easing.enter,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motionConfig.timing.screen,
        easing: motionConfig.easing.enter,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motionConfig.timing.screen,
        easing: motionConfig.easing.enter,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, translateY, scale };
};

export default {
  useCardEnter,
  useButtonPress,
  useHeroFloat,
  useIconPulse,
  useFadeIn,
  useScaleIn,
  getStaggerDelay,
  useScreenEnter,
};

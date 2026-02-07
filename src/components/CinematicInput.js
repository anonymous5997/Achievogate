import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TextInput, View } from 'react-native';
import theme from '../theme/theme';

const CinematicInput = ({ label, value, onChangeText, secureTextEntry, placeholder, icon, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255,255,255,0.1)', theme.colors.primary]
    });

    const labelTop = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [18, -10],
    });

    const labelSize = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
    });

    const labelColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.colors.text.muted, theme.colors.primary],
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.inputContainer, { borderColor }]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}

                <Animated.Text style={[styles.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
                    {label}
                </Animated.Text>

                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={secureTextEntry}
                    placeholderTextColor="transparent" // Hide default placeholder as we use custom label
                    placeholder={isFocused ? placeholder : ''}
                    {...props}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    inputContainer: {
        borderWidth: 1,
        borderRadius: theme.layout.inputRadius,
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // Transparent Slate
        height: 56,
        justifyContent: 'center',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
    },
    label: {
        position: 'absolute',
        left: 16,
        backgroundColor: theme.colors.background.screen, // Match screen bg to hide border line behind label
        paddingHorizontal: 4,
        zIndex: 1,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        height: '100%',
    },
});

export default CinematicInput;

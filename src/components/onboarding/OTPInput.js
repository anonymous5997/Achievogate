import { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const OTPInput = ({ value, onChange, length = 6 }) => {
    const inputRefs = useRef([]);
    const digits = value.split('');

    useEffect(() => {
        // Auto-focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (text, index) => {
        const newValue = digits.slice();
        newValue[index] = text;
        onChange(newValue.join(''));

        // Auto-advance to next input
        if (text && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        // Auto-backspace to previous input
        if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.container}>
            {Array.from({ length }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                        styles.input,
                        digits[index] && styles.inputFilled
                    ]}
                    value={digits[index] || ''}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 24,
    },
    input: {
        width: 48,
        height: 56,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: '#111827',
    },
    inputFilled: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
});

export default OTPInput;

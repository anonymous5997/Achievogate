import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/theme';

// Simple Header (Moti removed for Expo Go compatibility)
const CinematicHeader = ({ title, subTitle, icon, onBack, rightAction }) => {
    return (
        <View style={styles.container}>
            <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />

            <View style={styles.content}>
                <View style={styles.leftRow}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                    )}

                    <View>
                        {subTitle && (
                            <Text style={styles.subTitle}>{subTitle}</Text>
                        )}
                        <Text style={styles.title}>{title}</Text>
                    </View>
                </View>

                {rightAction && (
                    <View>
                        {rightAction}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        marginRight: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...theme.typography.h2,
        fontSize: 22,
        color: theme.colors.text.primary,
    },
    subTitle: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        marginBottom: 2,
    },
});

export default CinematicHeader;

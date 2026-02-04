import { View } from 'react-native';

// Simple List Stagger (Moti removed for Expo Go compatibility)
const CinematicListStagger = ({ data, renderItem, ListHeaderComponent }) => {
    return (
        <View style={{ flex: 1 }}>
            {ListHeaderComponent}
            {data.map((item, index) => (
                <View
                    key={item.id}
                    style={{ marginBottom: 12 }}
                >
                    {renderItem({ item, index })}
                </View>
            ))}
        </View>
    );
};

export default CinematicListStagger;

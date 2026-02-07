import { View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { MotionTokens } from '../../motion/MotionTokens';

const MotionList = ({ data, renderItem, keyExtractor, delayOffset = 0, style, ...props }) => {
    return (
        <View style={style}>
            {data.map((item, index) => {
                const delay = (delayOffset + index) * MotionTokens.timing.stagger;
                return (
                    <Animated.View
                        key={keyExtractor(item, index)}
                        entering={FadeInDown.delay(delay).springify()
                            .damping(MotionTokens.springs.enter.damping)
                            .stiffness(MotionTokens.springs.enter.stiffness)
                        }
                        layout={Layout.springify().damping(MotionTokens.springs.smooth.damping)}
                    >
                        {renderItem({ item, index })}
                    </Animated.View>
                );
            })}
        </View>
    );
};

export default MotionList;

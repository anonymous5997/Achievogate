# 🚀 Build & Run Instructions

Your AchievoGate app is now configured for **Expo Dev Client** with full **Reanimated** animation support!

## ⚠️ Important

**Your app NO LONGER works with Expo Go.** You must build it as a Dev Client to test the new cinematic animations.

---

## 📦 Step 1: Install Missing Dependency

```bash
npx expo install expo-dev-client
```

---

## 🛠️ Step 2: Prebuild (Generate Native Projects)

This generates the iOS and Android folders with necessary native code:

```bash
npx expo prebuild --clean
```

> This command will:
> - Generate `/ios` and `/android` folders
> - Configure native dependencies (Reanimated, Skia, gesture-handler)
> - Apply Expo config plugins

---

## ▶️ Step 3: Build & Run

### For Android:
```bash
npx expo run:android
```

### For iOS:
```bash
npx expo run:ios
```

> **Note:** First build will take 5-10 minutes as it compiles native code.

---

## 🎬 Step 4: Test Cinematic Animations

Once the app launches:

1. **Intro Animation**: Watch the cinematic splash screen with logo glow and light sweep
2. **Screen Transitions**: Navigate between screens to see depth-based transitions
3. **Gesture Feedback**: Tap on `AnimatedCard3D` components to see press feedback
4. **3D Flip Card**: Find `FlipCard3D` components - tap or swipe to flip

---

## 🔄 Development Workflow

### Start Dev Server:
```bash
npm start
```
or
```bash
npx expo start --dev-client
```

### Rebuild After Config Changes:
Only needed if you change `app.json`, install new native modules, or update Babel config:
```bash
npx expo prebuild --clean
npx expo run:android  # or run:ios
```

### Hot Reload:
After initial build, code changes (JS/TS) will hot reload automatically. No rebuild needed!

---

## 🎨 Using the New Animation System

### Cinematic Screen Wrapper
```tsx
import CinematicScreen from '../components/CinematicScreen';

<CinematicScreen gradientBackground>
  <YourContent />
</CinematicScreen>
```

### 3D Flip Card
```tsx
import FlipCard3D from '../components/FlipCard3D';

<FlipCard3D
  front={<Text>Front Side</Text>}
  back={<Text>Back Side</Text>}
  flipOnTap
/>
```

### Parallax Header
```tsx
import ParallaxHeader, { useParallaxScroll } from '../components/ParallaxHeader';

const { scrollY, scrollHandler } = useParallaxScroll();

<Animated.ScrollView onScroll={scrollHandler}>
  <ParallaxHeader scrollY={scrollY} height={300}>
    <Image source={require('./header.jpg')} />
  </ParallaxHeader>
</Animated.ScrollView>
```

### Pressable with Glow
```tsx
import PressableGlow from '../components/PressableGlow';

<PressableGlow onPress={handlePress}>
  <Text style={{ color: '#fff', fontSize: 16 }}>Click Me</Text>
</PressableGlow>
```

### Cinematic Enter Hook
```tsx
import { useCinematicEnter } from '../motion/useCinematicEnter';
import Animated from 'react-native-reanimated';

const MyComponent = () => {
  const animatedStyle = useCinematicEnter();
  
  return (
    <Animated.View style={animatedStyle}>
      <Text>Fades and scales in on mount!</Text>
    </Animated.View>
  );
};
```

### Stagger Hook
```tsx
import { useStagger } from '../motion/useStagger';
import Animated from 'react-native-reanimated';

const MyList = () => {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  const staggerStyles = useStagger({ count: items.length, delay: 80 });
  
  return items.map((item, index) => (
    <Animated.View key={index} style={staggerStyles[index]}>
      <Text>{item}</Text>
    </Animated.View>
  ));
};
```

---

## 🐛 Troubleshooting

### Error: "Worklets version mismatch"
```bash
rm -rf node_modules
npm install
npx expo prebuild --clean
```

### Error: "SDK location not found"
**Android:** Set `ANDROID_HOME` environment variable to your Android SDK path.

### Error: "Unable to boot simulator"
**iOS:** Open Xcode, go to Xcode → Preferences → Locations, and set Command Line Tools.

### Build fails with "module not found"
```bash
npm install
npx expo prebuild --clean
```

---

## 📚 Next Steps

1. **Create StaggeredList Component** (optional)
2. **Create MotionShowcase Screen** to demo all animations
3. **Migrate remaining animated components** (`AnimatedCard.js`, `AnimatedListItem.js`, etc.)
4. **Apply navigation transitions** in `AppNavigator`
5. **Test on physical devices** for true 60fps experience

---

## 📖 Documentation

- **Walkthrough**: See `walkthrough.md` for detailed change documentation
- **Implementation Plan**: See `implementation_plan.md` for architecture details
- **Task Checklist**: See `task.md` for progress tracking

---

## 💡 Tips

- **Performance**: All animations run at 60fps on the UI thread
- **Debugging**: Use React DevTools Performance monitor to verify frame rate
- **Customization**: Adjust spring configs in `/src/motion/springConfigs.ts`
- **Testing**: Test on real devices for accurate performance evaluation

---

Happy animating! 🎉

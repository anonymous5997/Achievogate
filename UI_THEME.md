# AchievoGate Design System 🎨

**Style:** Cinematic Pastel-Glass (Light)
**Version:** 4.0
**Influences:** "Clean Education", High Whitespace, Soft Gradients

## 🌈 Color Palette (Pastel Light)

| Name | Gradient | Usage |
|------|----------|-------|
| **Primary** | `#6366F1` → `#8B5CF6` → `#3B82F6` | Violet/Indigo/Blue (Brand) |
| **Secondary** | `#A78BFA` → `#22D3EE` → `#7DD3FC` | Lavender/Cyan/Sky (Accents) |
| **Background** | `#F8FAFC` (Slate 50) | Main screen background |
| **Glass** | `rgba(255, 255, 255, 0.7)` | Card surface with blur |
| **Type** | `#1E293B` (Slate 800) | Primary text color |

## 📐 Layout & Physics

- **Card Radius:** `24px` (Friendly curves)
- **Shadows:** Delicate colored shadows (Indigo/Cyan tints)
- **Physics:** Spring (damping: 14) suitable for light, airy motion.

## ✨ Motion Components

### `CinematicBackground`
Light base gradient (Slate/White) with soft floating pastel orbs (Pink/Violet/Cyan).
```jsx
<CinematicBackground>
  {/* Content floats over light airy space */}
</CinematicBackground>
```

### `CinematicCard`
White glass card with:
1. **Staggered Entry**: Slides up.
2. **Flash Border**: Subtle white flash on entry.
3. **Blur**: Uses `expo-blur` (tint="light").
```jsx
<CinematicCard delay={200}>
  <Content />
</CinematicCard>
```

### `CinematicHeader`
Parallax header with floating titles and blur background.
```jsx
<CinematicHeader title="My Home" subTitle="Welcome" />
```

### `CinematicButton`
Linear gradient button (Indigo/Blue) with soft shadow glow.

## 📱 Implementation Notes

- **Mode:** Light Mode only.
- **Typography:** Clean sans-serif (System/Roboto).
- **Status Colors:** 
  - Approved: Emerald (`#10B981`)
  - Pending: Amber (`#F59E0B`)
  - Denied: Rose (`#EF4444`)

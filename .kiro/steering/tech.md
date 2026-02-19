---
inclusion: always
---

# Technical Stack

## Core Technologies

- **Frontend Framework**: React 18.2 + TypeScript 5.3
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.4 + PostCSS
- **Animation**: Framer Motion 12.34
- **3D Graphics**: Three.js 0.160 + @react-three/fiber + @react-three/drei
- **Audio**: Howler.js 2.2
- **PWA**: vite-plugin-pwa + Workbox

## Development Tools

- **Type Checking**: TypeScript with strict mode enabled
- **Testing**: Playwright (E2E), Vitest (unit tests)
- **Package Manager**: npm
- **Version Control**: Git + GitHub

## Common Commands

```bash
# Development
npm run dev              # Start dev server on port 3001
npm run typecheck        # Run TypeScript type checking

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run Playwright E2E tests
npm run test:ui          # Run tests with UI
npm run test:debug       # Debug tests
npm run test:report      # View test report
npm run test:unit        # Run Vitest unit tests

# Utilities
npm run copy:miniprogram # Copy to WeChat miniprogram
npm run prepare:assets   # Prepare asset files
npm run sync-bugs        # Sync bugs to GitHub issues
```

## TypeScript Configuration

- Strict mode enabled with additional safety checks
- `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` for extra type safety
- ES2020 target with ESNext modules
- React JSX transform
- Source maps and declarations enabled

## Build Configuration

- Base path: `/`
- Dev server port: 3001
- PWA with offline support and asset caching
- Image optimization (CacheFirst strategy)
- Static resources (StaleWhileRevalidate strategy)

## Browser Support

Modern browsers with ES2020 support. PWA features require service worker support.

## Performance Considerations

- Avoid `JSON.parse(JSON.stringify())` for deep cloning (use structured clone or manual shallow copy)
- Use React.memo for expensive components
- Implement useMemo/useCallback for computed values and callbacks
- Clean up timers and event listeners in useEffect cleanup
- Remove console.log statements in production (use logger utility)

## Semicircular Icon Implementation

### Overview
The game uses semicircular tactical icons on player cards to represent different tactical abilities. These icons are implemented using CSS clip-path and transform techniques to create a visually appealing concave effect.

### Technical Details

#### Icon Mapping
Icons are mapped to their corresponding image files in the `getIconImage` function in `src/components/AthleteCard.tsx`:

```typescript
const getIconImage = (icon: TacticalIcon): string => {
  switch (icon) {
    case 'attack': return '/icons/icon-shoot.svg';
    case 'defense': return '/icons/icon-defense.svg';
    case 'pass': return '/icons/icon-pass.png';
    case 'press': return '/icons/icon-press.svg';
    default: return '/icons/icon-shoot.svg';
  }
};
```

#### Semicircular Clipping
Semicircular shapes are created using CSS `clip-path` with `circle()` syntax. The clip-path is applied to inner elements (background, mask, and icon container) rather than the outer container to ensure proper clipping while maintaining correct positioning:

```typescript
const clipPathStyle = {
  top: `circle(50% at 50% 0%)`, // Shows bottom half (concave at top)
  bottom: `circle(50% at 50% 100%)`, // Shows top half (concave at bottom)
  left: `circle(50% at 0% 50%)`, // Shows right half (concave at left)
  right: `circle(50% at 100% 50%)` // Shows left half (concave at right)
}[info.edge] || 'circle(50% at 50% 50%)';
```

#### Icon Positioning
Icons are positioned to show the appropriate half within each semicircle. The outer container is positioned half-outside the card edge, while inner elements use clip-path to create the semicircular effect:

```typescript
// Outer container positioning
const positionStyle = {
  top: {
    top: -containerSize / 2,
    left: `${info.position}%`,
    transform: 'translateX(-50%) translateY(-50%)'
  },
  bottom: {
    bottom: -containerSize / 2,
    left: `${info.position}%`,
    transform: 'translateX(-50%) translateY(50%)'
  },
  left: {
    left: -containerSize / 2,
    top: `${info.position}%`,
    transform: 'translateX(-50%) translateY(-50%)'
  },
  right: {
    right: -containerSize / 2,
    top: `${info.position}%`,
    transform: 'translateX(50%) translateY(-50%)'
  }
}[info.edge] || {};

// Inner elements with clip-path
<div style={{ clipPath: clipPathStyle }}>
  {/* Background */}
  {/* Mask */}
  {/* Icon */}
</div>
```

#### Container Setup
Icons are rendered within containers that handle positioning, clipping, and alignment. Each semicircular icon consists of three layers: background, mask, and icon image:

```typescript
<div
  style={{
    position: 'absolute',
    width: `${containerSize}px`,
    height: `${containerSize}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    overflow: 'visible',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
    ...positionStyle
  }}
>
  <div style={{ clipPath: clipPathStyle, overflow: 'hidden' }}>
    {/* Background circle */}
    <div style={{ clipPath: clipPathStyle }} />
    {/* Mask circle */}
    <div style={{ clipPath: clipPathStyle }} />
    {/* Icon container */}
    <div style={{ clipPath: clipPathStyle, overflow: 'hidden' }}>
      <img src={getIconImage(info.icon)} />
    </div>
  </div>
</div>
```

### Visual Effect
- **Top semicircles**: Curve downward, showing the bottom half of the icon
- **Bottom semicircles**: Curve upward, showing the top half of the icon
- **Left semicircles**: Curve rightward, showing the right half of the icon
- **Right semicircles**: Curve leftward, showing the left half of the icon

### Key Components
- `src/components/AthleteCard.tsx`: Main implementation of semicircular icons
- `public/icons/`: Contains the icon image files
- `src/data/cards.ts`: Defines tactical icon types and mappings

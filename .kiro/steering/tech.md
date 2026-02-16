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

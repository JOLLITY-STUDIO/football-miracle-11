---
inclusion: always
---

# Project Structure

## Directory Organization

```
football-miracle-11/
├── src/
│   ├── components/       # React UI components
│   ├── game/            # Core game logic and services
│   ├── utils/           # Utility functions
│   ├── data/            # Static data (cards, teams, config)
│   ├── config/          # Configuration files
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   ├── demos/           # Demo/prototype components
│   ├── tests/           # Unit tests
│   ├── plugins/         # Vite plugins (PWA)
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── public/              # Static assets
│   ├── audio/           # Sound effects
│   ├── bgm/             # Background music
│   ├── cards/           # Card images
│   ├── icons/           # UI icons
│   └── images/          # Game images
├── tests/e2e/           # End-to-end tests
├── scripts/             # Build and utility scripts
├── docs/                # Documentation
├── rules/               # Game rules and reference
├── miniprogram/         # WeChat miniprogram version
└── .kiro/steering/      # AI assistant steering rules
```

## Key Modules

### Game Logic (`src/game/`)
- `gameLogic.ts` - Core game state and reducer
- `turnPhaseService.ts` - Turn phase management
- `cardPlacementService.ts` - Card placement validation
- `placementRules.ts` - Placement rule definitions
- `ruleValidator.ts` - Rule validation utilities
- `tactics.ts` - Tactical calculations
- `gameRecorder.ts` - Game recording for replay

### Components (`src/components/`)
- Large components (GameBoard, GameField) should be refactored into smaller modules
- Follow single responsibility principle
- Use PascalCase for component files
- Separate concerns: UI rendering vs game logic

### Utils (`src/utils/`)
- `audio.ts` - Audio management
- `ai.ts` - AI opponent logic
- `cardPlacement.ts` - Card placement helpers
- `shotResolution.ts` - Shooting mechanics
- `synergyActions.ts` - Synergy card actions
- `logger.ts` - Logging utility (use instead of console.log)

### Data (`src/data/`)
- `cards.ts` - Card definitions
- `teams.ts` - Team configurations
- `synergyConfig.ts` - Synergy card setup
- `tutorialSteps.ts` - Tutorial content

## Naming Conventions

- **Components**: PascalCase (e.g., `GameField.tsx`)
- **Functions**: camelCase (e.g., `calculateCellPosition`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CELL_WIDTH`)
- **Types/Interfaces**: PascalCase (e.g., `GameState`)
- **Files**: Match content type (components: PascalCase, utils: camelCase)

## State Management

- Centralized game state in `useGameState` hook
- State driven by `gameLogic.ts` reducer
- Components are presentational, logic in services
- Use context sparingly, prefer prop drilling for clarity

## Code Organization Principles

1. **Separation of Concerns**: UI components should not contain game logic
2. **Service Layer**: Game logic in `src/game/` services
3. **Type Safety**: All game state and actions strongly typed
4. **Modularity**: Break large components into smaller, focused ones
5. **Testability**: Pure functions for game logic, side effects isolated

## Import Patterns

```typescript
// Absolute imports from src root
import { GameState } from './types/game';
import { calculatePower } from './utils/tactics';
import { GameBoard } from './components/GameBoard';
```

## File Size Guidelines

- Components: Aim for < 300 lines
- Services: Aim for < 500 lines
- If larger, consider splitting into multiple files
- GameBoard.tsx (1500+ lines) needs refactoring

## Documentation

- Core rules: `GAME_MANUAL.md`
- Bug tracking: `BUG_TRACKING.md`
- Project wiki: `WIKI.md`
- Implementation analysis: `docs/RULE_IMPLEMENTATION_ANALYSIS.md`
- Original board game rules: `rules/rules.md`

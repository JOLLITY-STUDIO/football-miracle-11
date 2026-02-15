# football-miracle-11 - Project Wiki

Welcome to the football-miracle-11 Project Wiki! This is the documentation center for the project, including roadmap, current status, and development guide.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Roadmap](#roadmap)
- [Current Status](#current-status)
- [Bug Tracking System](#bug-tracking-system)
- [Development Guide](#development-guide)
- [Related Documentation](#related-documentation)

## 🎯 Project Overview

**football-miracle-11** is a lightweight strategy football card battle game. Players deploy player cards, use tactical icons and synergy cards to engage in offensive and defensive battles on an 8x4 field map, with the higher score winning.

### Core Features

- ⚽️ **Football Battle**: Card battle game based on football rules
- 🎴 **Tactical System**: Tactical icons for passing, pressing, attacking, defending, etc.
- 🃏 **Synergy Cards**: Synergy card system to enhance player abilities
- 🤖️ **AI Battle**: Intelligent AI opponents
- 🏆 **Multiplayer Mode**: Support for PvP and PvE modes

### Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Animation**: Framer Motion
- **Testing**: Playwright
- **Version Control**: Git + GitHub

## 🗺️ Roadmap

### Completed ✅

#### Phase 1: Basic Architecture (v0.1.0 - v0.1.10)
- [x] Basic game framework
- [x] Field rendering
- [x] Card system
- [x] Basic AI logic
- [x] Duel system

#### Phase 2: Game Mechanics (v0.1.11 - v0.1.30)
- [x] Synergy card system
- [x] Tactical icons
- [x] Control system
- [x] Shooting mechanism
- [x] Substitution system

#### Phase 3: UI Optimization (v0.1.31 - v0.1.40)
- [x] Card animations
- [x] Field highlighting
- [x] Duel animations
- [x] Responsive design
- [x] Mobile adaptation

#### Phase 4: System Refactoring (v0.1.41 - v0.1.55)
- [x] Rule configuration file
- [x] Turn phase management
- [x] Card placement service
- [x] Bug tracking system
- [x] Code decoupling

### In Progress 🚧

#### Phase 5: Game Enhancement (v0.1.56 - v0.1.70)
- [ ] Improve AI logic
- [ ] Optimize duel animations
- [ ] Add sound effects system
- [ ] Improve synergy card effects
- [ ] Add achievement system
- [ ] Optimize performance

### Planned 📅

#### Phase 6: Advanced Features (v0.1.71 - v0.2.0)
- [ ] Multiplayer battles
- [ ] Ranking system
- [ ] League mode
- [ ] Skin system
- [ ] Data statistics
- [ ] Social features

#### Phase 7: Release Preparation (v0.2.0+)
- [ ] Performance optimization
- [ ] Security audit
- [ ] User testing
- [ ] Documentation completion
- [ ] Official release

## 📊 Current Status

### Latest Version

**Current Version**: v0.1.55
**Release Date**: 2026-02-16
**Branch**: feature/duel-system-enhancement

### Recent Updates

#### v0.1.55 (2026-02-16)
- ✅ Fixed issue where clicking players didn't highlight the field
- ✅ Allow card placement in teamAction phase
- ✅ Updated CenterField component's canPlaceCards logic

#### v0.1.54 (2026-02-16)
- ✅ Created unified turn phase management service
- ✅ Updated gameLogic to use TurnPhaseService
- ✅ Removed scattered judgment logic

#### v0.1.53 (2026-02-16)
- ✅ Fixed issue where AI cards only showed half in the first column
- ✅ Removed column reversal logic for AI
- ✅ Unified AI and player card position calculation

#### v0.1.52 (2026-02-16)
- ✅ Created rule configuration file
- ✅ Created card placement service
- ✅ Refactored GameField and FieldCellHighlight components
- ✅ Updated GAME_MANUAL.md

### Development Progress

- **Overall Progress**: 65%
- **Phase 1-4**: 100% ✅
- **Phase 5**: 20% 🚧
- **Phase 6**: 0% 📅
- **Phase 7**: 0% 📅

## 🐛 Bug Tracking System

### Bug ID Format

Each bug has a unique ID in the format: `BUG-YYYY-MM-DD-Number`

For example:
- `BUG-2026-02-16-001`
- `BUG-2026-02-16-002`

### Recently Fixed Bugs

#### BUG-2026-02-16-001: AI cards only show half in the first column
- **Status**: ✅ Fixed
- **Version**: v0.1.53
- **Impact**: AI card display
- **Details**: [View Details](../blob/main/BUG_TRACKING.md#bug-2026-02-16-001)

#### BUG-2026-02-16-002: Clicking players doesn't highlight the field
- **Status**: ✅ Fixed
- **Version**: v0.1.55
- **Impact**: Card placement highlighting
- **Details**: [View Details](../blob/main/BUG_TRACKING.md#bug-2026-02-16-002)

#### BUG-2026-02-16-003: Turn phase judgment affects each other
- **Status**: ✅ Fixed
- **Version**: v0.1.54
- **Impact**: Turn phase management
- **Details**: [View Details](../blob/main/BUG_TRACKING.md#bug-2026-02-16-003)

### Bug Statistics

- **Total Bugs**: 7
- **Fixed**: 7
- **In Progress**: 0
- **Pending**: 0
- **Fix Rate**: 100%

## 📖 Development Guide

### Development Environment Setup

```bash
# Clone repository
git clone https://github.com/JOLLITY-STUDIO/football-miracle-11.git

# Enter project directory
cd football-miracle-11

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
football-miracle-11/
├── src/
│   ├── components/       # React components
│   ├── game/            # Game logic
│   ├── utils/            # Utility functions
│   ├── data/             # Data configuration
│   ├── config/           # Configuration files
│   ├── hooks/            # React Hooks
│   └── types/            # TypeScript type definitions
├── scripts/              # Script tools
├── docs/                 # Documentation
├── tests/                # Test files
├── public/               # Static assets
└── package.json           # Project configuration
```

### Code Standards

#### Naming Conventions

- **Components**: PascalCase (e.g., `GameField.tsx`)
- **Functions**: camelCase (e.g., `calculateCellPosition`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CELL_WIDTH`)
- **Types**: PascalCase (e.g., `GameState`)

#### Comment Standards

- **File Comments**: Describe file purpose
- **Function Comments**: Describe function purpose, parameters, return values
- **Complex Logic**: Add detailed comments
- **Bug Fixes**: Add Bug ID comments

```typescript
/**
 * Calculate cell position for rendering
 * 
 * @param context - Field context
 * @param row - Row number
 * @param col - Column number
 * @returns Cell coordinates
 */
// BUG-2026-02-16-001: Fix AI card positioning
export const calculateCellPosition = (context, row, col) => {
  // Implementation
};
```

### Git Workflow

#### Branch Strategy

- **main**: Main branch, stable versions
- **feature/xxx**: Feature development branch
- **bugfix/xxx**: Bug fix branch
- **hotfix/xxx**: Emergency fix branch

#### Commit Standards

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code refactoring
- docs: Documentation update
- style: Code formatting adjustment
- test: Test related
- chore: Build/tooling related

Examples:
- feat: Add shooting animation
- fix: BUG-2026-02-16-001 - Correct AI card positioning
- refactor: Simplify turn phase management
- docs: Update GAME_MANUAL.md
```

#### Version Management

Follow Semantic Versioning:
- **Major Version**: Incompatible API changes
- **Minor Version**: Backwards compatible feature additions
- **Patch Version**: Backwards compatible bug fixes

Format: `vMajor.Minor.Patch`

Example: `v0.1.55`

### Testing Guide

#### Running Tests

```bash
# Run all tests
npm test

# Run UI tests
npm run test:ui

# Run debug tests
npm run test:debug

# View test reports
npm run test:report
```

#### Test Coverage

- **Unit Tests**: Core logic functions
- **Component Tests**: React components
- **Integration Tests**: Game flow
- **E2E Tests**: End-to-end tests

### Release Process

#### Pre-Release Checklist

- [ ] All tests pass
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Version number updated
- [ ] CHANGELOG updated
- [ ] Git tag created

#### Release Steps

```bash
# 1. Update version number
# Edit version field in package.json

# 2. Run tests
npm test
npm run typecheck

# 3. Commit changes
git add .
git commit -m "Release: v0.1.56"

# 4. Create tag
git tag -a v0.1.56 -m "Release v0.1.56"

# 5. Push to remote
git push origin main
git push origin v0.1.56

# 6. Sync bugs
npm run sync-bugs
```

## 📚 Related Documentation

### Core Documentation

- [GAME_MANUAL.md](../blob/main/GAME_MANUAL.md) - Game rules manual
- [BUG_TRACKING.md](../blob/main/BUG_TRACKING.md) - Bug tracking system
- [PROJECT_RULES.md](../blob/main/.trae/rules/project_rules.md) - Project development standards

### Technical Documentation

- [RULE_IMPLEMENTATION_ANALYSIS.md](../blob/main/docs/RULE_IMPLEMENTATION_ANALYSIS.md) - Rule implementation analysis
- [3D_IMPLEMENTATION_FIX.md](../blob/main/docs/3D_IMPLEMENTATION_FIX.md) - 3D implementation fixes
- [DAILY_REPORT_2026-02-11.md](../blob/main/docs/DAILY_REPORT_2026-02-11.md) - Daily report

### Development Documentation

- [scripts/README.md](../blob/main/scripts/README.md) - Script usage guide
- [TEST_SETUP_CHECKLIST.md](../blob/main/docs/TEST_SETUP_CHECKLIST.md) - Test setup checklist

## 🤝 Contribution Guide

### How to Contribute

1. **Fork Project**: Click the Fork button in the top right
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Develop**: Follow code standards to develop
4. **Commit Changes**: `git commit -m "feat: Add your feature"`
5. **Push Branch**: `git push origin feature/your-feature`
6. **Create PR**: Create Pull Request on GitHub

### Code Review

- **Code Style**: Follow project code standards
- **Test Coverage**: Ensure new features have tests
- **Documentation Update**: Update relevant documentation
- **Bug Tracking**: Reference Bug ID in commit messages

## 📞 Contact Information

### Project Maintainers

- **GitHub**: https://github.com/JOLLITY-STUDIO/football-miracle-11
- **Issues**: https://github.com/JOLLITY-STUDIO/football-miracle-11/issues
- **Discussions**: https://github.com/JOLLITY-STUDIO/football-miracle-11/discussions

### Getting Help

- **Documentation**: Check Wiki and README
- **Issues**: Ask questions in GitHub Issues
- **Discussions**: Discuss in Discussions

## 📜 License

This project is copyrighted.

## 🙏 Acknowledgments

Thanks to all developers and users who have contributed to this project!

---

*Last Updated: 2026-02-16*
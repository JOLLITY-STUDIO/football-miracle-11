# Bug Tracking System

This document records all bug fix history in the project, used to trace the impact and associations of bug fixes.

## Bug ID Format

Each bug has a unique ID in the format: `BUG-YYYY-MM-DD-Number`

For example:
- `BUG-2026-02-16-001`
- `BUG-2026-02-16-002`

## Bug Fix Records

### BUG-2026-02-16-001: AI cards only show half in the first column
- **Discovery Date**: 2026-02-16
- **Fix Date**: 2026-02-16
- **Impact Scope**: AI card display
- **Related Files**:
  - `src/utils/coordinateCalculator.ts`
  - `src/components/GameField.tsx`
- **Problem Description**: AI cards only show half when placed in the first column
- **Root Cause**: The `calculateCellPosition` function performed column reversal for AI (`adjustedCol = context.cols - 1 - col`), causing incorrect card position calculation
- **Fix Solution**: Removed column reversal logic for AI, AI and players now use the same column positioning logic
- **Version**: 0.1.53
- **Git Commit**: 60df046
- **Impact Analysis**:
  - AI cards now display correctly in specified column positions
  - Player cards maintain correct display
  - AI and player card position calculation logic is now completely consistent
- **Regression Testing**: Need to test AI card display in all columns

### BUG-2026-02-16-002: Clicking players doesn't highlight the field
- **Discovery Date**: 2026-02-16
- **Fix Date**: 2026-02-16
- **Impact Scope**: Card placement highlighting
- **Related Files**:
  - `src/components/CenterField.tsx`
  - `src/components/FieldCellHighlight.tsx`
  - `src/game/cardPlacementService.ts`
- **Problem Description**: Clicking players doesn't highlight the field
- **Root Cause**: In the `CenterField` component, the `canPlaceCards` calculation logic was incorrect, not including the `teamAction` phase
- **Fix Solution**: Updated `canDoAction` calculation logic, added `teamAction` phase
- **Version**: 0.1.55
- **Git Commit**: 68a1e9e
- **Impact Analysis**:
  - Cards can now be placed in teamAction phase
  - Cards can be placed in playerAction phase
  - Cards can be placed in start phase
  - Cards cannot be placed in other phases
- **Regression Testing**: Need to test card placement in all turn phases

### BUG-2026-02-16-003: Turn phase judgment affects each other
- **Discovery Date**: 2026-02-16
- **Fix Date**: 2026-02-16
- **Impact Scope**: Turn phase management
- **Related Files**:
  - `src/game/turnPhaseService.ts` (new)
  - `src/game/gameLogic.ts`
- **Problem Description**: Turn phase control logic is scattered in multiple places, causing judgments to affect each other
- **Root Cause**: No unified turn phase management service, each component has its own judgment logic
- **Fix Solution**: Created `TurnPhaseService` to centrally manage all turn phase logic
- **Version**: 0.1.54
- **Git Commit**: 5c44b27
- **Impact Analysis**:
  - All turn phase logic is now in one place
  - Avoids scattered judgment logic affecting each other
  - All components use the same API to validate actions
  - First turn automatically skips team action
- **Regression Testing**: Need to test all turn phase transitions

### BUG-2026-02-16-004: Card placement logic is not unified
- **Discovery Date**: 2026-02-16
- **Fix Date**: 2026-02-16
- **Impact Scope**: Card placement rules
- **Related Files**:
  - `src/game/placementRules.ts` (new)
  - `src/game/cardPlacementService.ts` (new)
  - `src/components/GameField.tsx`
  - `src/components/FieldCellHighlight.tsx`
  - `src/game/ruleValidator.ts`
  - `GAME_MANUAL.md`
- **Problem Description**: Card placement rules are scattered in multiple places, easily overwritten or modified
- **Root Cause**: No unified rule configuration file, each component has its own rule definitions
- **Fix Solution**: Created `placementRules.ts` and `cardPlacementService.ts` to centrally manage card placement logic
- **Version**: 0.1.52
- **Git Commit**: 39fe6cf
- **Impact Analysis**:
  - Rules are centrally managed, won't be arbitrarily modified
  - Components don't directly depend on specific rule implementations
  - Code structure is clearer, maintainability greatly improved
- **Regression Testing**: Need to test all card placement rules

### BUG-2026-02-16-005: Clicking column n doesn't place cards starting from column n
- **Discovery Date**: 2026-02-16
- **Fix Date**: 2026-02-16
- **Impact Scope**: Card placement position
- **Related Files**:
  - `src/utils/coordinateCalculator.ts`
  - `src/components/FieldCellHighlight.tsx`
- **Problem Description**: When clicking column n, cards don't start placement from column n
- **Root Cause**: The `calculateCellPosition` function used `(adjustedCol - 1) * cellWidth`, causing card position offset
- **Fix Solution**: Changed `x = (adjustedCol - 1) * cellWidth` to `x = adjustedCol * cellWidth`
- **Version**: 0.1.49
- **Git Commit**: 41fcb2c
- **Impact Analysis**:
  - When clicking columns 0-6, cards start placement from column n
  - When clicking column 7, cards start placement from column 6
  - Card position calculation is more accurate
- **Regression Testing**: Need to test card placement in all columns

### BUG-2026-02-16-006: Too many highlight colors causing confusion
- **Discovery Date**: 2026-02-16
- **Fix Date**: 2026-02-16
- **Impact Scope**: Field highlighting display
- **Related Files**:
  - `src/components/FieldCellHighlight.tsx`
- **Problem Description**: Too many highlight colors, players don't know which positions can be placed
- **Root Cause**: Three highlight colors (gold, green, red) causing confusion
- **Fix Solution**: Simplified to two states (gold for placeable, red for not placeable)
- **Version**: 0.1.50
- **Git Commit**: 64ddc41
- **Impact Analysis**:
  - Gold highlight clearly indicates positions where cards can be placed
  - Red highlight indicates valid areas but temporarily cannot be placed
  - Transparent indicates invalid areas
  - Players can clearly see which positions can place cards
- **Regression Testing**: Need to test highlight display clarity

### BUG-2026-02-16-007: Highlight color restored to red
- **Discovery Date**: 2026-02-16
- **Fix Date**: 2026-02-16
- **Impact Scope**: Field highlighting display
- **Related Files**:
  - `src/components/FieldCellHighlight.tsx`
- **Problem Description**: After simplifying highlight colors, testing phase needs to see which places cannot be selected
- **Root Cause**: Testing phase needs to see all states, including non-selectable positions
- **Fix Solution**: Restored red highlight to show valid areas but temporarily cannot be placed
- **Version**: 0.1.51
- **Git Commit**: 9103fea
- **Impact Analysis**:
  - Testing phase can clearly see which positions cannot be selected
  - Gold highlight indicates positions where cards can be placed
  - Red highlight indicates valid areas but temporarily cannot be placed
  - Transparent indicates invalid areas
- **Regression Testing**: Need to test highlight display clarity

## Bug Tracing Methods

### 1. Git Commit Message Format
All bug fix commit messages follow this format:
```
Fix: [Bug ID] - Description
```

For example:
```
Fix: BUG-2026-02-16-001 - Correct AI card positioning
```

### 2. Git Tags
Each bug fix is tagged:
```
git tag bug-2026-02-16-001
git push origin bug-2026-02-16-001
```

### 3. GitHub Issues
Use GitHub Issues to track bugs:
- Title format: `[BUG-2026-02-16-001] Description`
- Labels: `bug`, `fixed`, `version-0.1.53`
- Related commits: Reference corresponding Git commit in Issue

### 4. Code Comments
Add comments in fixed code:
```typescript
// BUG-2026-02-16-001: Fix AI card positioning
// Removed column reversal logic for AI cards
```

### 5. Regression Testing Checklist
Each bug fix requires regression testing:
- [ ] Test if the bug itself is fixed
- [ ] Test if related functions work normally
- [ ] Test if other turn phases work normally
- [ ] Test if both AI and players work normally

## Bug Impact Analysis

### Impact Scope Classification
1. **UI Display**: Affects user interface display
2. **Game Logic**: Affects game rules and logic
3. **Performance**: Affects game performance
4. **Compatibility**: Affects compatibility across different browsers or devices

### Impact Level
1. **Critical**: Blocks game progress
2. **Important**: Affects game experience
3. **General**: Affects some functions
4. **Minor**: Affects interface aesthetics or minor functions

### Dependencies
Record dependencies between bugs:
- BUG-2026-02-16-003 depends on BUG-2026-02-16-004
- BUG-2026-02-16-002 depends on BUG-2026-02-16-003

## Automated Checking

### Script Checking
Create scripts to automatically check bug fix impact:
```bash
# Check which files were affected by a bug fix
git log --all --grep="BUG-2026-02-16-001" --name-only --pretty=format:

# Check modification history of a file
git log --all --follow -- "src/utils/coordinateCalculator.ts"
```

### Impact Analysis Tools
Create tools to analyze bug fix impact:
```typescript
// src/utils/bugImpactAnalyzer.ts
export class BugImpactAnalyzer {
  static analyzeBugFix(bugId: string): {
    affectedFiles: string[];
    relatedBugs: string[];
    impactLevel: 'critical' | 'important' | 'minor';
  }
}
```

## Best Practices

1. **Unified Format**: All bugs use unified ID format
2. **Detailed Records**: Record bug discovery, fix, impact, etc.
3. **Related Commits**: Reference bug ID in Git commit messages
4. **Regression Testing**: Perform regression testing after each bug fix
5. **Impact Analysis**: Analyze impact of bug fix on other functions
6. **Documentation Update**: Update related documentation in time
7. **Version Management**: Update version number for each bug fix
8. **Code Comments**: Add comments in fixed code to explain

## Query Methods

### Query by Date
```bash
# Find all bugs on February 16, 2026
grep "BUG-2026-02-16" BUG_TRACKING.md
```

### Query by File
```bash
# Find all bugs affecting a file
grep "coordinateCalculator.ts" BUG_TRACKING.md
```

### Query by Impact Scope
```bash
# Find all bugs affecting AI card display
grep "AI card display" BUG_TRACKING.md
```

### Query by Version
```bash
# Find all bugs fixed in version 0.1.53
grep "0.1.53" BUG_TRACKING.md
```

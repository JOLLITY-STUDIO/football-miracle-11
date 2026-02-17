# Bug Tracking

## Fixed Bugs

### BUG-2026-02-18-001: AI Draft Card Storage Inconsistency
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 选秀系统，AI卡池管理
- **相关文件**:
  - `src/utils/draft.ts`
- **问题描述**: AI-selected draft cards were being stored in `aiAthleteHand`, but the filtering logic was checking `aiDraftHand`, causing potential card duplication and incorrect draft pool management.
- **根本原因**: 代码中使用了不一致的变量名，存储和过滤逻辑使用了不同的数组
- **修复方案**: Updated all draft filtering logic to use `aiAthleteHand` instead of `aiDraftHand` for consistency.
- **版本**: 0.2.35
- **Git提交**: N/A
- **影响分析**:
  - 修复后确保AI选秀卡不会重复
  - 选秀池管理更加准确

### BUG-2026-02-18-002: AI Bench Not Populated After Draft
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: AI队伍管理，替补球员系统
- **相关文件**:
  - `src/utils/draft.ts`
- **问题描述**: After completing the draft, AI cards were all stored in `aiAthleteHand` and `aiBench` remained empty, causing the AI to have no substitutes.
- **根本原因**: 选秀完成后没有将AI卡牌分配到替补席
- **修复方案**: Modified the `discardDraftCard` function to distribute AI cards between `aiAthleteHand` (first 10 cards as starters) and `aiBench` (remaining cards as substitutes) when the draft is complete.
- **版本**: 0.2.35
- **Git提交**: N/A
- **影响分析**:
  - AI现在有完整的10名首发和替补球员
  - 比赛中AI可以进行换人

### BUG-2026-02-18-003: Draft Round Progression Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 选秀系统，回合 progression
- **相关文件**:
  - `src/components/DraftPhase.tsx`
- **问题描述**: Draft process was only completing one round instead of three rounds as intended.
- **根本原因**: useEffect依赖数组包含了gameState.draftRound，导致选秀回合逻辑无法正确执行
- **修复方案**: Modified the `useEffect` dependency array in `DraftPhase.tsx` to remove `gameState.draftRound`, ensuring the draft round progression logic works correctly.
- **版本**: 0.2.36
- **Git提交**: N/A
- **影响分析**:
  - 选秀现在会完成完整的三轮
  - 玩家可以选择更多的明星球员

### BUG-2026-02-18-004: Duplicate Key Warnings in React Components
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: React渲染，性能
- **相关文件**:
  - `src/components/GameBoard.tsx`
  - `src/components/AthleteCardGroup.tsx`
- **问题描述**: React was warning about duplicate keys when rendering cards in different positions.
- **根本原因**: 不同组件中使用了相同的key值
- **修复方案**: Added unique prefixes to card keys in `GameBoard.tsx` (AI hand) and `AthleteCardGroup.tsx` (player hand) to ensure keys are unique across different components.
- **版本**: 0.2.36
- **Git提交**: N/A
- **影响分析**:
  - 消除了React警告
  - 提高了渲染性能

### BUG-2026-02-18-005: Player Card Distribution Issue After Draft
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 玩家队伍管理，手牌系统
- **相关文件**:
  - `src/utils/draft.ts`
- **问题描述**: After completing the draft, player cards were all stored in `playerAthleteHand` and `playerBench` remained empty, causing the player to have more than 10 cards in hand.
- **根本原因**: 选秀完成后没有将玩家卡牌分配到替补席
- **修复方案**: Modified the `discardDraftCard` function to distribute player cards between `playerAthleteHand` (first 10 cards as starters) and `playerBench` (remaining cards as substitutes) when the draft is complete.
- **版本**: 0.2.37
- **Git提交**: N/A
- **影响分析**:
  - 玩家现在有10名首发和替补球员
  - 手牌数量保持在合理范围

### BUG-2026-02-18-006: SquadSelection Component Using Popup Instead of Mask
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: UI设计，用户体验
- **相关文件**:
  - `src/components/SquadSelection.tsx`
  - `src/components/SquadSelection.css`
- **问题描述**: The SquadSelection component was implemented as a full page instead of using a mask overlay, which didn't match the desired UI design.
- **根本原因**: 组件设计不符合要求的UI规范
- **修复方案**: Modified the SquadSelection component to use a full-screen mask overlay with backdrop blur, providing a modal-like experience without using a traditional popup.
- **版本**: 0.2.38
- **Git提交**: N/A
- **影响分析**:
  - UI设计更加统一
  - 用户体验得到改善

### BUG-2026-02-18-007: Duplicate Star Cards in Player's Hand
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 选秀系统，卡牌管理
- **相关文件**:
  - `src/components/DraftPhase.tsx`
  - `src/utils/draft.ts`
- **问题描述**: During the draft process, duplicate star cards were appearing in the player's hand due to two issues: 1) The DraftPhase component was generating its own set of cards independently of the game state, bypassing the filtering logic, and 2) The pickDraftCard function wasn't checking for duplicates before adding cards to the player's hand.
- **根本原因**: 选秀逻辑存在两个问题：组件独立生成卡牌，且没有重复检查
- **修复方案**: 1) Updated DraftPhase to use the game state's startDraftRound function instead of generating its own cards, and 2) Added duplicate checking in both pickDraftCard and aiPickDraftCard functions to ensure each card is only added once to a player's hand.
- **版本**: 0.2.39
- **Git提交**: N/A
- **影响分析**:
  - 消除了重复明星卡的问题
  - 选秀过程更加公平

### BUG-2026-02-18-008: Background Music Playback Error
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 音频系统，用户体验
- **相关文件**:
  - `src/components/BackgroundMusic.tsx`
- **问题描述**: Background music was failing to load with "NotSupportedError: Failed to load because no supported source was found".
- **根本原因**: 音频加载逻辑没有正确处理元数据加载和错误情况
- **修复方案**: Updated the audio loading logic in BackgroundMusic.tsx to properly handle metadata loading, add error handling for unsupported formats, and implement a timeout mechanism to prevent infinite waiting.
- **版本**: 0.2.40
- **Git提交**: N/A
- **影响分析**:
  - 背景音乐现在可以正常加载和播放
  - 提高了音频系统的稳定性

### BUG-2026-02-18-009: Card Dealing Logic Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 卡牌系统，游戏流程
- **相关文件**:
  - `src/game/gameLogic.ts`
- **问题描述**: Card dealing was showing incorrect counts (33/36 instead of 20 total cards) and dealing too many cards.
- **根本原因**: DRAW_CARD逻辑没有正确处理牌组耗尽的情况，且消息显示不正确
- **修复方案**: Updated the DRAW_CARD logic in gameLogic.ts to properly handle deck depletion, fixed the message display to show a fixed total of 20 cards, and ensured proper distribution between home and away decks.
- **版本**: 0.2.40
- **Git提交**: N/A
- **影响分析**:
  - 卡牌发牌现在显示正确的数量
  - 游戏流程更加顺畅

### BUG-2026-02-18-010: Duplicate Card Dealer Animations
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: UI动画，用户体验
- **相关文件**:
  - `src/components/GameBoard.tsx`
- **问题描述**: Multiple CardDealer components were rendering simultaneously, creating duplicate animations and confusing card count displays.
- **根本原因**: 多个CardDealer组件同时渲染
- **修复方案**: Updated GameBoard.tsx to show only single card animations for both player and AI dealers, reducing visual clutter and providing clearer feedback.
- **版本**: 0.2.40
- **Git提交**: N/A
- **影响分析**:
  - 消除了重复的发牌动画
  - 视觉效果更加清晰

### BUG-2026-02-18-011: Player Card Nickname Line Break Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: UI设计，卡牌显示
- **相关文件**:
  - `src/components/AthleteCard.tsx`
- **问题描述**: Player card nicknames were automatically wrapping to multiple lines, affecting card layout consistency.
- **根本原因**: 没有设置文本换行限制
- **修复方案**: Added `whitespace-nowrap overflow-hidden text-ellipsis` classes to the nickname display div to prevent wrapping and ensure consistent single-line display.
- **版本**: 0.2.41
- **Git提交**: N/A
- **影响分析**:
  - 球员卡昵称现在保持单行显示
  - 卡牌布局更加一致

### BUG-2026-02-18-012: Player Card Text Auto-Sizing Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: UI设计，卡牌显示
- **相关文件**:
  - `src/components/AthleteCard.tsx`
- **问题描述**: Player card text (nickname and real name) was not adjusting font size based on text length, causing longer text to be truncated.
- **根本原因**: 文本字体大小没有根据文本长度自适应调整
- **修复方案**: Implemented adaptive font sizing for both nickname and real name displays, calculating font size based on text length to ensure complete display.
- **版本**: 0.2.42
- **Git提交**: N/A
- **影响分析**:
  - 球员卡文本现在可以根据长度自动调整字体大小
  - 长文本也能完整显示

### BUG-2026-02-18-013: Background Music Next Track Icon Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: UI设计，音频控制
- **相关文件**:
  - `src/components/BackgroundMusic.tsx`
- **问题描述**: The next track button in game mode had a garbled icon instead of the correct skip track icon.
- **根本原因**: 图标显示错误
- **修复方案**: Replaced the garbled icon with the correct ⏭️ icon and added a tooltip for better user understanding.
- **版本**: 0.2.44
- **Git提交**: N/A
- **影响分析**:
  - 下一曲按钮现在显示正确的图标
  - 用户体验得到改善

## Current Status
- ✅ Draft system now properly tracks AI-selected cards
- ✅ AI now has both starters in hand and substitutes on the bench
- ✅ Draft pool filtering works correctly for both player and AI
- ✅ Draft completion properly distributes cards to AI's hand and bench
- ✅ Draft process now completes all three rounds as intended
- ✅ React duplicate key warnings have been resolved
- ✅ SquadSelection component now uses mask overlay instead of full page
- ✅ Player cards are now properly distributed between hand (10 starters) and bench (substitutes)
- ✅ Duplicate star cards issue resolved, ensuring each card appears only once in a player's hand
- ✅ Background music now loads and plays correctly with proper error handling
- ✅ Card dealing now shows correct counts and deals the proper number of cards (20 total)
- ✅ Card dealer animations now show clear, single-card animations instead of duplicate effects

## Version History
- **0.2.53**: Added unique IDs for synergy card decks (synergyDeckId, synergyDiscardId) to ensure proper identification and management
- **0.2.52**: Added unique IDs for all card decks (starCardDeckId, homeCardDeckId, awayCardDeckId) to ensure proper identification and management
- **0.2.51**: Added CardDeck and CardDeckManager components for unified deck display system, showing home, away, and star decks with consistent visual design
- **0.2.50**: Restored dealing phase and card dealing animations, removed deck shuffling logic, ensured home deck goes to home team and away deck goes to away team
- **0.2.49**: Removed CardDeckDisplay component from game interface
- **0.2.48**: Enhanced Camera Engine with arrow key controls for up/down/left/right movement, added positionX and positionY properties to ViewSettings, and updated camera transform logic
- **0.2.47**: Enhanced CardDeckDisplay component with game animation effects, including dynamic card stacking, floating particles, hover effects, and smooth transitions
- **0.2.46**: Removed 5-layer limit from CardDeckDisplay component, now showing full 10-card stack effect for both home and away decks
- **0.2.45**: Added CardDeckDisplay component to show real-time deck counts during dealing phase, providing visual feedback of home and away deck sizes as cards are dealt
- **0.2.44**: Fixed background music next track icon in game mode, replacing garbled icon with correct ⏭️ icon
- **0.2.43**: Fixed background music next track icon in game mode, replacing garbled icon with correct ⏭️ icon
- **0.2.42**: Implemented adaptive font sizing for player card text (nickname and real name) to ensure complete display
- **0.2.41**: Fixed player card nickname line break issue by adding whitespace-nowrap and text-ellipsis classes
- **0.2.40**: Fixed background music playback error, card dealing logic issue, and duplicate card dealer animations
- **0.2.39**: Fixed duplicate star cards issue by updating DraftPhase to use game state's draft logic and adding duplicate checking in draft functions
- **0.2.38**: Updated SquadSelection component to use mask overlay instead of full page, providing a modal-like experience
- **0.2.37**: Fixed player card distribution issue after draft, ensuring hand contains exactly 10 starters and remaining cards go to bench
- **0.2.36**: Fixed draft round progression issue and duplicate key warnings
- **0.2.35**: Initial bug fixes for AI draft card storage and bench population

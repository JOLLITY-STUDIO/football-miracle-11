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

### BUG-2026-02-18-014: Cannot Place Cards on Field
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 游戏逻辑，卡牌放置
- **相关文件**:
  - `src/hooks/useGameState.ts`
- **问题描述**: Players were unable to place cards on the field, even during the athlete action phase.
- **根本原因**: The `handleSlotClick` function in `useGameState.ts` was allowing card placement during the team action phase, but the `gameReducer` was rejecting it because the team action phase's `allowPlaceCard` configuration was set to false, causing inconsistency in validation logic.
- **修复方案**: Updated the `canDoAction` calculation in `useGameState.ts` to remove the team action phase from the allowed phases for card placement, ensuring consistency with the game reducer's validation logic.
- **版本**: 0.2.54
- **Git提交**: N/A
- **影响分析**:
  - Players can now properly place cards during the athlete action phase
  - The validation logic is now consistent across the codebase
  - The game flow is more predictable

### BUG-2026-02-18-015: Star Card Preview Using Basic Display
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: UI设计，明星卡预览
- **相关文件**:
  - `src/components/StarDraft.tsx`
- **问题描述**: The StarDraft component was using basic div elements to display star cards instead of the AthleteCardComponent, resulting in inconsistent card display across the application.
- **根本原因**: 明星卡预览页面没有使用统一的选手卡组件
- **修复方案**: Updated the StarDraft component to use AthleteCardComponent for displaying star cards in all sections: card selection options, drafted player stars, and AI drafted stars, ensuring consistent card display across the application.
- **版本**: 0.2.55
- **Git提交**: N/A
- **影响分析**:
  - Star cards now use the same AthleteCardComponent as other card displays
  - Visual consistency is improved across the application
  - User experience is enhanced with better card previews

### BUG-2026-02-18-016: Background Music Random Play Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 音频系统，用户体验
- **相关文件**:
  - `src/components/BackgroundMusic.tsx`
- **问题描述**: Background music was not playing randomly across all available tracks, and sometimes stopped when clicking the next track button.
- **根本原因**: 1) The playlist only contained 5 tracks instead of all available songs in the bgm directory, 2) The playNextTrack function didn't properly handle cases where no valid track was returned.
- **修复方案**: 1) Implemented automatic playlist generation using Vite's glob import to include all mp3 files from the bgm directory, 2) Improved the playNextTrack function to ensure it always gets a valid track by falling back to a random track from the full playlist if needed.
- **版本**: 0.2.56
- **Git提交**: N/A
- **影响分析**:
  - Background music now randomly plays across all available tracks (40+ songs)
  - The next track button now reliably selects a new random track without stopping playback
  - Playlist automatically updates when new songs are added to the bgm directory

### BUG-2026-02-18-017: Static Background Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: UI设计，用户体验
- **相关文件**:
  - `src/components/GameBoard.tsx`
- **问题描述**: The main game interface background was static and lacked dynamic elements.
- **根本原因**: 背景层没有动画效果，视觉效果单调。
- **修复方案**: Added dynamic background effects including star floating animation, nebula flow animation, and grid scrolling animation to create a more immersive visual experience.
- **版本**: 0.2.57
- **Git提交**: N/A
- **影响分析**:
  - Game interface now has dynamic background effects
  - Visual immersion is enhanced
  - User experience is improved with subtle animations

### BUG-2026-02-18-019: Static Visual Effects Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: UI设计，用户体验
- **相关文件**:
  - `src/components/DuelOverlay.tsx`
  - `src/components/SynergyCard.tsx`
  - `src/components/SkillEffectBadge.tsx`
  - `src/components/BenchArea.tsx`
  - `src/components/PhaseBanner.tsx`
  - `src/components/FeedbackOverlay.tsx`
- **问题描述**: The game lacked anime-style dynamic visual effects for key actions and events.
- **根本原因**: 游戏中的关键操作和事件缺少动漫风格的视觉效果。
- **修复方案**: Implemented anime-style visual effects including enhanced shot duel animations, synergy card flip effects, skill activation effects, substitution animations, and turn transition animations to create a more immersive and visually engaging experience.
- **版本**: 0.2.58
- **Git提交**: N/A
- **影响分析**:
  - Game now features anime-style dynamic visual effects
  - Key actions and events are more visually engaging
  - User experience is enhanced with immersive animations
  - Visual feedback is more immediate and satisfying

### BUG-2026-02-18-018: Ambient Sound Playback on Game Start
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 音频系统，用户体验
- **相关文件**:
  - `src/components/GameBoard.tsx`
- **问题描述**: Ambient sounds were playing immediately when entering the main game interface, even before the match started.
- **根本原因**: The GameBoard component was starting ambient sounds on initial mount if the game state was already in a match phase.
- **修复方案**: Updated the ambient sound control logic to track component mount status and only play ambient sounds for phase changes after initial mount, removing the automatic ambient sound start for match phases.
- **版本**: 0.2.58
- **Git提交**: N/A
- **影响分析**:
  - Ambient sounds no longer play immediately when entering the game interface
  - Audio experience is more controlled
  - User experience is improved with more appropriate sound timing

### BUG-2026-02-18-020: Inconsistent Highlight and Click Logic
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 游戏逻辑，卡牌放置，用户体验
- **相关文件**:
  - `src/components/CenterField.tsx`
  - `src/components/GameBoard.tsx`
- **问题描述**: Field highlights were showing valid placement positions, but clicking on them was not allowing card placement due to inconsistent validation logic between highlight display and click handling.
- **根本原因**: The `canPlaceCards` calculation in `CenterField.tsx` was missing the `skipTeamAction` condition, while the `handleSlotClick` function in `useGameState.ts` included this condition, causing inconsistency in validation logic.
- **修复方案**: Updated `CenterField.tsx` to include the `skipTeamAction` parameter and modify the `canDoAction` calculation to match the logic in `useGameState.ts`, ensuring consistency between highlight display and click handling.
- **版本**: 0.2.59
- **Git提交**: N/A
- **影响分析**:
  - Field highlights now accurately reflect clickable positions
  - Card placement now works consistently when highlights are shown
  - User experience is improved with more predictable interaction
  - Validation logic is now consistent across the codebase

### BUG-2026-02-18-021: Incorrect skipTeamAction Reset
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 游戏逻辑，回合管理，卡牌放置
- **相关文件**:
  - `src/utils/endTurn.ts`
- **问题描述**: The `skipTeamAction` flag was being incorrectly reset to `false` at the start of every turn, causing the game to enter the team action phase even when there were no pass/press icons on the field.
- **根本原因**: The `performEndTurn` function was hardcoding `skipTeamAction: false` for every new turn, ignoring the actual game state and placement rules.
- **修复方案**: Updated `performEndTurn` to use `TurnPhaseService.shouldSkipTeamAction` to determine if team action should be skipped for the new turn, ensuring the game properly skips the team action phase when there are no pass/press icons on the field.
- **版本**: 0.2.60
- **Git提交**: N/A
- **影响分析**:
  - Game now properly skips team action phase when no pass/press icons are available
  - Card placement is now possible immediately after turn start when team action is skipped
  - Game flow is more consistent with the rules
  - User experience is improved with more predictable turn progression

### BUG-2026-02-18-022: Incorrect skipTeamAction in FINISH_SQUAD_SELECT
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 游戏逻辑，回合管理，卡牌放置
- **相关文件**:
  - `src/game/gameLogic.ts`
- **问题描述**: The `skipTeamAction` flag was being hardcoded to `false` when entering the firstHalf phase, causing the game to enter the team action phase even when there were no pass/press icons on the field.
- **根本原因**: The `FINISH_SQUAD_SELECT` case was hardcoding `skipTeamAction: false` and not properly updating it based on the actual game state.
- **修复方案**: Updated `FINISH_SQUAD_SELECT` case to use `TurnPhaseService.shouldSkipTeamAction` to determine if team action should be skipped, ensuring consistent game state management when entering the match from the squad selection phase.
- **版本**: 0.2.61
- **Git提交**: N/A
- **影响分析**:
  - Game now properly skips team action phase at match start when no pass/press icons are available
  - Card placement is now possible immediately at match start when team action is skipped
  - Game flow is more consistent with the rules
  - User experience is improved with more predictable match start behavior

### BUG-2026-02-18-023: Field Icon Positioning Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 战术图标系统，视觉效果
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: Field icons (defense icons in zone 7) were appearing in incorrect positions, often overlapping or showing in empty slots.
- **根本原因**: The `createFieldIconCompleteIcon` method was always using the original slotIndex for positioning, regardless of whether the icon was on the left or right side of the card.
- **修复方案**: Updated the `createFieldIconCompleteIcon` method to adjust the slot index based on the actual icon position, ensuring left position icons use the original slotIndex and right position icons use slotIndex + 1.
- **版本**: 0.2.65
- **Git提交**: N/A
- **影响分析**:
  - Field icons now appear in the correct positions based on their location on the card
  - Both left and right defense icons are now visible in their respective slots
  - Visual clarity is improved with no more overlapping icons
  - User understanding of icon activation is enhanced

### BUG-2026-02-18-024: Adjacent LB and RB Synergy Icon Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 战术图标系统，协同效果
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: Adjacent LB (left back) and RB (right back) cards were not activating synergy icons when placed next to each other.
- **根本原因**: The `checkHorizontalMatch` method was checking for adjacent slots (slotIndex + 1) instead of skipping one slot (slotIndex + 2) to account for each card occupying two slots on the field.
- **修复方案**: Updated the `checkHorizontalMatch` method to use `slotIndex + 2` instead of `slotIndex + 1` when checking for adjacent horizontal matches, ensuring it checks the correct slot position for neighboring cards.
- **版本**: 0.2.66
- **Git提交**: N/A
- **影响分析**:
  - Adjacent LB and RB cards now properly activate synergy icons when placed next to each other
  - The tactical icon matching system now correctly accounts for each card occupying two slots
  - Synergy effects between fullback cards are now properly recognized
  - User understanding of card placement and synergy activation is enhanced

### BUG-2026-02-18-025: Field Icon Position Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 战术图标系统，视觉效果
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: Field icons (defense icons in zone 7) were appearing in incorrect positions, and horizontal synergy icons were not displayed in the expected location.
- **根本原因**: 1) The `checkFieldIconMatches` method was not adjusting slot index based on icon position, causing right-side icons to appear in left-side slots. 2) The `createHorizontalCompleteIcon` method was calculating centerX incorrectly, causing horizontal synergy icons to appear in the wrong position.
- **修复方案**: 1) Updated `checkFieldIconMatches` to adjust slot index based on icon position, using `slotIndex + 1` for right-side icons. 2) Updated `createHorizontalCompleteIcon` to calculate centerX as the start position of the right card's front column, ensuring horizontal synergy icons appear in the correct location.
- **版本**: 0.2.67
- **Git提交**: N/A
- **影响分析**:
  - Field icons now appear in the correct positions based on their location on the card
  - Horizontal synergy icons now appear in the expected location near the right card's left edge
  - Visual clarity is improved with icons displayed in their proper positions
  - User understanding of icon activation is enhanced

### BUG-2026-02-18-026: Shooting Logic Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 射门系统，用户体验
- **相关文件**:
  - `src/components/ShooterSelector.tsx`
- **问题描述**: Shooting was allowing players to select any player with attack icons, not just those with activated attack icons, and the selection UI was focused on players rather than the activated icons.
- **根本原因**: The ShooterSelector component was displaying all players with attack icons instead of focusing on activated attack icons, and the selection logic was not properly tied to the actual activated icons on the field.
- **修复方案**: Updated the ShooterSelector component to:
  1. Display only activated attack icons instead of all players with attack icons
  2. Show the position and associated player card for each activated attack icon
  3. Allow users to select activated icons directly for shooting
  4. From the selected icon, find the corresponding player to execute the shot
- **版本**: 0.2.68
- **Git提交**: N/A
- **影响分析**:
  - Users now select activated attack icons directly instead of players
  - Shooting is only possible when there are activated attack icons on the field
  - The selection UI provides clear visual feedback of which icons are activated
  - User understanding of the shooting mechanic is enhanced

### BUG-2026-02-18-027: Card Dealing Speed Optimization
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 游戏流程，用户体验
- **相关文件**:
  - `src/components/GameBoard.tsx`
- **问题描述**: Card dealing after home/away selection was taking too long, exceeding the desired 5-second limit.
- **根本原因**: The dealing interval was set to 300ms per card, which would take approximately 6 seconds to deal all 20 cards.
- **修复方案**: Reduced the dealing interval from 300ms to 200ms per card, ensuring all 20 cards are dealt within approximately 4 seconds, well within the 5-second limit.
- **版本**: 0.2.69
- **Git提交**: N/A
- **影响分析**:
  - Card dealing now completes within the 5-second time limit
  - Game flow is more streamlined after home/away selection
  - Users experience faster transition to the draft phase
  - Maintains clear card dealing animations while speeding up the process

### BUG-2026-02-18-028: Pressure Icon Activation Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 战术图标系统，游戏机制
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: Pressure icons were not activating when LWF (zone 5, columns 3-4) and DMF (zone 6, columns 2-3) cards were placed with pressure icons in specific positions.
- **根本原因**: The vertical icon matching logic was missing position pairs for LWF's bottom-left pressure icon to connect with DMF's top-right pressure icon.
- **修复方案**: Updated the vertical position pairs in both checkVerticalMatch methods (for checking bottom and top adjacent cards) to include additional position pairs that support LWF and DMF pressure icon activation.
- **版本**: 0.2.70
- **Git提交**: N/A
- **影响分析**:
  - Pressure icons now properly activate between LWF and DMF cards in the specified positions
  - The tactical icon matching system is more comprehensive
  - Users can now benefit from pressure icon synergies in more card placement scenarios
  - Game mechanics are more consistent with expected behavior

### BUG-2026-02-18-029: AI Half Attack Icon Activation Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 战术图标系统，游戏机制
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: Attack icons were not activating when AI AMF (zone 1, columns 4-5) and AI LWF (zone 2, columns 4-5) cards were placed with attack icons in the top-right position.
- **根本原因**: The vertical icon matching logic for AI half was missing position pairs for AMF's top-right attack icon to connect with LWF's top-right attack icon.
- **修复方案**: Updated the vertical position pairs in both checkVerticalMatch methods (for checking bottom and top adjacent cards) to include additional position pairs that support AMF and LWF attack icon activation in AI half.
- **版本**: 0.2.71
- **Git提交**: N/A
- **影响分析**:
  - Attack icons now properly activate between AMF and LWF cards in AI half
  - The tactical icon matching system is more comprehensive for both player and AI halves
  - AI team can now benefit from attack icon synergies in more card placement scenarios
  - Game mechanics are more consistent across both halves of the field

### BUG-2026-02-18-030: AI Half Pressure Icon Activation Issue
- **发现日期**: 2026-02-18
- **修复日期**: 2026-02-18
- **影响范围**: 战术图标系统，游戏机制
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: Pressure icons were not activating when AI DMF (zone 1, same starting column) and AI RWF (zone 2, same starting column) cards were placed with pressure icons in specific positions.
- **根本原因**: The vertical icon matching logic for AI half was missing position pairs for DMF's top-right pressure icon to connect with RWF's bottom-right pressure icon.
- **修复方案**: Updated the vertical position pairs in both checkVerticalMatch methods (for checking bottom and top adjacent cards) to include additional position pairs that support DMF and RWF pressure icon activation in AI half.
- **版本**: 0.2.72
- **Git提交**: N/A
- **影响分析**:
  - Pressure icons now properly activate between DMF and RWF cards in AI half
  - The tactical icon matching system is more comprehensive for both player and AI halves
  - AI team can now benefit from pressure icon synergies in more card placement scenarios
  - Game mechanics are more consistent across both halves of the field

### BUG-2026-02-19-031: Duplicate Attributes in AthleteCardGroup
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 代码质量，构建过程
- **相关文件**:
  - `src/components/AthleteCardGroup.tsx`
- **问题描述**: The AthleteCardGroup component had duplicate JSX attributes including "transition", "whileHover", and "style", causing Vite warnings during the build process.
- **根本原因**: The component had redundant attribute definitions, with some attributes defined multiple times with slightly different values.
- **修复方案**: Removed duplicate attributes, keeping only the most comprehensive definitions for each attribute.
- **版本**: 0.2.73
- **Git提交**: N/A
- **影响分析**:
  - Eliminated Vite warnings during build process
  - Improved code quality and maintainability
  - Ensured consistent attribute values throughout the component
  - No functional changes to the component's behavior

### BUG-2026-02-19-032: AI Zone 3 Placement Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: AI逻辑，球员放置系统
- **相关文件**:
  - `src/utils/ai.ts`
- **问题描述**: AI was not placing players in Zone 3 (AI's front line), only placing them in Zone 2 and below.
- **根本原因**: The AI's zone selection priority was set to try Zone 2 before Zone 3 for forwards, and the validation rules prevented placing forwards in Zone 3 when no other cards were on the field.
- **修复方案**: Updated the `getValidZones` function in `ai.ts` to prioritize Zone 3 for forwards, Zone 2 for midfielders, and Zone 1 for defenders, ensuring AI attempts to place players in their most forward valid positions first.
- **版本**: 0.2.74
- **Git提交**: N/A
- **影响分析**:
  - AI now attempts to place forwards in Zone 3 (front line) when possible
  - AI's offensive positioning is more aggressive and realistic
  - Game balance is improved with AI using all available zones
  - Players will now face AI players in Zone 3 during matches

### BUG-2026-02-19-033: Pressure Icon Consistency Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 图标系统，视觉一致性
- **相关文件**:
  - `src/components/AthleteCard.tsx`
  - `src/components/CompleteIconsOverlay.tsx`
  - `src/data/cards.ts`
- **问题描述**: Pressure icons and skills were using inconsistent image resources across different components.
- **根本原因**: Different components were referencing different image paths for pressure icons.
- **修复方案**: Standardized all pressure icon references to use `/icons/press_up.svg` consistently across all components and card types.
- **版本**: 0.2.75
- **Git提交**: N/A
- **影响分析**:
  - All pressure icons now use the same consistent SVG resource
  - Visual consistency is improved across the entire game
  - Icon loading is more efficient with a single shared resource
  - No functional changes to game mechanics

### BUG-2026-02-19-034: Skill Icon Display Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 技能系统，视觉显示
- **相关文件**:
  - `src/components/AthleteCard.tsx`
- **问题描述**: Skill icons (e.g., pressure skill on Overlap King) were not being displayed on player cards, and when displayed, they were not using the correct SVG resource.
- **根本原因**: The AthleteCard component was only rendering immediateEffect badges and not processing the skills array, causing skill icons to be invisible.
- **修复方案**: Added skill icon rendering logic to the AthleteCard component, ensuring pressure-type skills use `/icons/press_up.svg` and applying special effects for lightning-enabled skills.
- **版本**: 0.2.76
- **Git提交**: N/A
- **影响分析**:
  - Skill icons now appear on player cards next to immediate effect badges
  - Pressure skills now use the consistent `/icons/press_up.svg` resource
  - Skills with lightning effects have special visual highlighting
  - Players can now see all active skills on their player cards

### BUG-2026-02-19-035: Field Visuals Improvements
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 球场视觉效果，用户体验
- **相关文件**:
  - `src/components/FieldVisuals.tsx`
- **问题描述**: 1) 禁区没有弧线显示，2) 球场外没有球门显示。
- **根本原因**: 禁区弧线绘制逻辑存在问题，且缺少球门绘制代码。
- **修复方案**: 1) 修复禁区弧线绘制逻辑，使用嵌套div和overflow:hidden实现正确的弧线效果，2) 在球场外添加球门绘制代码，分别在顶部和底部添加球门结构。
- **版本**: 0.2.77
- **Git提交**: N/A
- **影响分析**:
  - 禁区现在显示正确的弧线
  - 球场外添加了球门结构
  - 球场视觉效果更加完整和真实
  - 用户体验得到改善

### BUG-2026-02-19-036: AthleteCard name Property Error
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 换人系统，错误处理
- **相关文件**:
  - `src/utils/substitution.ts`
- **问题描述**: 终端报错显示 `Property 'name' does not exist on type 'AthleteCard'`，导致换人功能无法正常工作。
- **根本原因**: `substitution.ts` 文件中使用了 `incomingCard.name` 和 `outgoingCard.name`，但 `AthleteCard` 接口中没有 `name` 属性，只有 `nickname` 和 `realName` 属性。
- **修复方案**: 将 `substitution.ts` 文件中的 `name` 属性改为 `nickname` 属性。
- **版本**: 0.2.78
- **Git提交**: N/A
- **影响分析**:
  - 换人功能现在可以正常工作
  - 终端不再报错
  - 游戏流程更加顺畅

### BUG-2026-02-19-037: Ambient Sound Type Definition Error
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 环境音系统，类型定义
- **相关文件**:
  - `src/utils/audio.ts`
- **问题描述**: 终端报错显示类型定义错误，包括 `AmbientType` 缺少 `'crowd_chant'` 和 `'match'` 类型，以及 `stopMatchAmbience` 和 `triggerCrowdReaction` 函数参数不匹配。
- **根本原因**: `audio.ts` 文件中的类型定义和函数参数与 `AmbientControls.tsx` 文件中的使用不匹配。
- **修复方案**: 1) 在 `AmbientType` 中添加 `'crowd_chant'` 和 `'match'` 类型，2) 更新 `AmbientManager` 类添加新的环境音类型，3) 修复 `stopMatchAmbience` 和 `triggerCrowdReaction` 函数的参数定义。
- **版本**: 0.2.78
- **Git提交**: N/A
- **影响分析**:
  - 环境音系统现在可以正常工作
  - 终端不再报错
  - 类型定义更加完整和准确

### BUG-2026-02-19-038: IconPosition Type Definition Error
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 球员卡系统，类型定义
- **相关文件**:
  - `src/components/AthleteCard.tsx`
  - `src/data/cards.ts`
- **问题描述**: 终端报错显示 `Cannot find name 'IconPosition'`，导致球员卡无法正常显示。
- **根本原因**: `IconPosition` 类型已被移除，改用 `Tactics` 接口，但代码中仍然在使用 `IconPosition` 类型。
- **修复方案**: 1) 在 `AthleteCard.tsx` 文件中添加 `IconPosition` 类型定义，2) 在 `cards.ts` 文件中添加 `IconWithPosition` 接口定义。
- **版本**: 0.2.79
- **Git提交**: N/A
- **影响分析**:
  - 球员卡现在可以正常显示
  - 终端不再报错
  - 类型定义更加完整和准确

### BUG-2026-02-19-039: Penalty Arc Position Error
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 球场视觉效果，用户体验
- **相关文件**:
  - `src/components/FieldVisuals.tsx`
- **问题描述**: 禁区弧线位置不对，宽度不符合要求。
- **根本原因**: 弧线的位置、宽度和方向设置不正确。
- **修复方案**: 1) 调整弧线宽度为2格，2) 修正弧线位置，3) 调整弧线方向，确保对手禁区和玩家禁区的弧线方向正确。
- **版本**: 0.2.80
- **Git提交**: N/A
- **影响分析**:
  - 禁区弧线现在显示在正确的位置
  - 弧线宽度符合要求（2格）
  - 弧线方向正确
  - 球场视觉效果更加完整和真实

### BUG-2026-02-19-040: AI Attack Icon Activation Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 战术图标系统，AI对战
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: AI对手方，CF在zone 2 6-7列，zone 3 同位置LWF，应该激活的一个进攻图标的但是没有。
- **根本原因**: 垂直图标匹配逻辑没有考虑AI卡片旋转180度的影响，导致图标位置映射错误。
- **修复方案**: 更新`checkVerticalMatch`方法，为AI卡片添加位置旋转映射，确保正确识别垂直方向的图标匹配。
- **版本**: 0.2.81
- **Git提交**: N/A
- **影响分析**:
  - AI队伍现在可以正确激活垂直方向的进攻图标
  - 游戏机制在AI半场和玩家半场保持一致
  - 战术图标匹配系统更加准确
  - 用户将面对更加合理的AI对手

### BUG-2026-02-19-041: AI Horizontal Icon Activation Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 战术图标系统，AI对战
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: 由于AI的场上的球员是水平旋转180的，所以他的图标列也是反的，激活的时候应该反位置。
- **根本原因**: 水平图标匹配逻辑没有考虑AI卡片水平旋转180度的影响，总是检查右侧相邻卡片而不是左侧。
- **修复方案**: 更新`checkHorizontalMatch`方法，为AI卡片添加水平旋转逻辑，检查左侧相邻卡片（slotIndex - 2）而不是右侧，并调整位置对映射。
- **版本**: 0.2.82
- **Git提交**: N/A
- **影响分析**:
  - AI队伍现在可以正确激活水平方向的图标
  - 游戏机制在AI半场和玩家半场保持一致
  - 战术图标匹配系统更加准确
  - 用户将面对更加合理的AI对手

### BUG-2026-02-19-042: AI Icon Rotation System Refactor
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 战术图标系统，AI对战，代码架构
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: AI卡片图标激活逻辑过于复杂，需要为每个匹配方法单独处理旋转逻辑。
- **根本原因**: 缺少统一的AI方向处理机制，导致代码重复和维护困难。
- **修复方案**: 1) 在`tacticalIconMatcher.ts`中添加`getRotatedTactics`方法，根据卡片所在zone自动处理180度旋转，2) 更新所有匹配方法使用旋转后的tactics。
- **版本**: 0.2.83
- **Git提交**: N/A
- **影响分析**:
  - 代码架构更加清晰，使用统一的旋转机制
  - 减少了代码重复，提高了可维护性
  - AI卡片图标激活逻辑更加准确
  - 为未来功能扩展提供了更好的基础

### BUG-2026-02-19-043: Rotation Logic Extraction
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 代码架构，可维护性
- **相关文件**:
  - `src/utils/rotationUtils.ts`
  - `src/data/cards.ts`
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: 旋转逻辑分散在多个文件中，缺乏统一的工具类管理。
- **根本原因**: 旋转逻辑没有集中管理，导致代码重复和维护困难。
- **修复方案**: 1) 创建`RotationUtils`工具类，集中管理旋转相关逻辑，2) 更新所有卡片数据添加`rotatedTactics`属性，3) 修改`tacticalIconMatcher.ts`使用`RotationUtils.getTacticsForZone`方法。
- **版本**: 0.2.84
- **Git提交**: N/A
- **影响分析**:
  - 代码架构更加清晰，使用专门的工具类管理旋转逻辑
  - 减少了代码重复，提高了可维护性
  - 旋转逻辑更加集中，便于后续修改和扩展
  - 为所有卡片添加了`rotatedTactics`属性，确保AI卡片正确旋转

### BUG-2026-02-19-045: AI Card Icon Duplication Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 战术图标系统，AI对战
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: AI位置LWF在zone 3，CF在zone 2时，CF上产生了2个进攻图标，导致图标重复。
- **根本原因**: 垂直匹配逻辑过于宽松，允许CF的左右底部攻击图标都与LWF的顶部攻击图标匹配，导致创建了两个相同的垂直图标。
- **修复方案**: 简化垂直匹配逻辑，只保留最基本的位置对匹配，避免重复创建图标。
- **版本**: 0.2.86
- **Git提交**: N/A
- **影响分析**:
  - 消除了AI卡片上的图标重复问题
  - 垂直匹配逻辑更加简洁和准确
  - 游戏界面更加清晰，没有重复的图标
  - 保持了正确的图标激活机制

### BUG-2026-02-19-046: AI Card Icon Rotation Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 战术图标系统，AI对战
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: AI生成的图标完全相反，没有正确使用rotatedTactics进行判定。
- **根本原因**: 虽然代码中使用了rotatedTactics获取旋转后的战术图标结构，但水平匹配的位置对顺序没有根据AI半场进行调整，导致左右位置的匹配逻辑错误。
- **修复方案**: 更新水平匹配逻辑，为AI半场（zone < 4）使用反转的位置对顺序，确保左右位置的匹配逻辑正确。
- **版本**: 0.2.87
- **Git提交**: N/A
- **影响分析**:
  - 修复了AI卡片图标完全相反的问题
  - 确保AI卡片正确使用rotatedTactics进行判定
  - 水平匹配逻辑现在能正确处理AI卡片的旋转
  - 游戏机制在AI半场和玩家半场保持一致

### BUG-2026-02-19-047: AI Icon Position Adjustment Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 战术图标系统，AI对战
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: AI LWF卡片（A02）在zone 3 6-7列时，进攻图标显示在第7列，位置不正确。
- **根本原因**: 代码中存在重复的isAIZone变量声明，且位置调整逻辑混乱，导致AI卡片的图标位置计算错误。
- **修复方案**: 1) 移除重复的isAIZone变量声明，2) 重构位置调整逻辑，为AI半场和玩家半场使用不同的调整规则，确保图标显示在正确的位置。
- **版本**: 0.2.88
- **Git提交**: N/A
- **影响分析**:
  - 修复了AI卡片图标位置不正确的问题
  - 确保AI LWF卡片在zone 3 6-7列时，进攻图标显示在正确的位置
  - 代码逻辑更加清晰，移除了重复变量
  - 位置调整逻辑更加准确和一致

### BUG-2026-02-19-048: AI Horizontal Icon Position Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 战术图标系统，AI对战
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
  - `src/components/CompleteIconsOverlay.tsx`
- **问题描述**: AI半场zone 3位置，RWF在4-5列，LWF在6-7列时，生成的水平拼合图标没有显示在两列之间（5-6列之间）。
- **根本原因**: 1) `createHorizontalCompleteIcon`方法中图标位置计算逻辑不正确，2) `CompleteIconsOverlay.tsx`中AI图标的坐标计算有误，对x坐标进行了不必要的水平翻转。
- **修复方案**: 1) 更新`createHorizontalCompleteIcon`方法，确保图标显示在两张卡片之间的中心位置，2) 修改`CompleteIconsOverlay.tsx`中的`calculateAICoordinates`方法，移除对AI图标x坐标的水平翻转。
- **版本**: 0.2.89
- **Git提交**: N/A
- **影响分析**:
  - 修复了AI水平拼合图标位置不正确的问题
  - 确保AI RWF和LWF之间的拼合图标显示在5-6列之间
  - 修正了AI图标坐标计算逻辑，确保位置准确
  - 保持了AI卡片图标激活的正确机制

### BUG-2026-02-19-049: AI Horizontal Icon Parameter Order Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 战术图标系统，AI对战
- **相关文件**:
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: AI半场zone 3位置，RWF在4-5列，LWF在6-7列时，生成的水平拼合图标仍然没有显示在两列之间（5-6列之间）。
- **根本原因**: 在检查水平匹配时，当从右侧卡片（LWF）检查左侧相邻卡片（RWF）时，传递给`createHorizontalCompleteIcon`方法的参数顺序错误，导致leftHalf和rightHalf的slot值颠倒，从而计算出错误的图标位置。
- **修复方案**: 更新`checkHorizontalMatch`方法，确保传递给`createHorizontalCompleteIcon`方法的参数顺序正确，始终将左侧卡片作为leftHalf，右侧卡片作为rightHalf。
- **版本**: 0.2.90
- **Git提交**: N/A
- **影响分析**:
  - 修复了AI水平拼合图标位置计算错误的问题
  - 确保AI RWF和LWF之间的拼合图标正确显示在5-6列之间
  - 修正了水平匹配参数传递的逻辑，确保leftHalf和rightHalf的顺序正确
  - 保持了AI卡片图标激活的正确机制

### BUG-2026-02-19-044: Background Music Control Issue
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 音频系统，用户体验
- **相关文件**:
  - `src/components/BackgroundMusic.tsx`
- **问题描述**: 首页的音乐关闭按钮只关闭了背景音乐，没有关闭环境音。
- **根本原因**: 音乐控制逻辑没有联动环境音控制。
- **修复方案**: 修改`BackgroundMusic.tsx`中的`togglePlay`函数，当关闭音乐时同时关闭环境音，当开启音乐时同时开启环境音。
- **版本**: 0.2.85
- **Git提交**: N/A
- **影响分析**:
  - 音乐关闭按钮现在可以关闭所有声音（包括环境音）
  - 音乐开启按钮现在可以开启所有声音
  - 用户体验更加统一和直观
  - 音频系统控制更加一致

### BUG-2026-02-19-045: Type Error - SkillIconType Cannot Be Assigned to TacticalIcon
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 类型系统，代码编译
- **相关文件**:
  - `src/components/AthleteCard.tsx`
- **问题描述**: 类型"SkillIconType"的参数不能赋给类型"TacticalIcon"的参数，不能将类型"breakthrough"分配给类型"TacticalIcon"。
- **根本原因**: `getIconImage`函数只接受`TacticalIcon`类型，但被调用时传入了`SkillIconType`值。
- **修复方案**: 更新`getIconImage`函数以接受`SkillIconType`类型，并添加对"breakthrough"和"breakthroughAll"技能类型的处理。
- **版本**: 0.2.86
- **Git提交**: N/A
- **影响分析**:
  - 消除了类型错误，确保代码编译通过
  - 技能图标现在可以正确显示
  - 类型系统更加准确

### BUG-2026-02-19-046: Type Error - String Cannot Be Assigned to IconPosition
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 类型系统，代码编译
- **相关文件**:
  - `src/components/AthleteCard.tsx`
- **问题描述**: 类型"{ type: TacticalIcon; position: string; }"的参数不能赋给类型"{ type: TacticalIcon; position: IconPosition; }"的参数，属性"position"的类型不兼容。
- **根本原因**: `iconPositions`数组没有正确类型化，导致TypeScript将`position`属性推断为通用`string`而不是特定的`IconPosition`类型。
- **修复方案**: 显式将`iconPositions`数组类型化为`{ type: TacticalIcon; position: IconPosition }[]`。
- **版本**: 0.2.86
- **Git提交**: N/A
- **影响分析**:
  - 消除了类型错误，确保代码编译通过
  - 半圆图标现在可以正确渲染
  - 类型系统更加准确

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

### BUG-2026-02-19-050: Tactical Icon Display and Positioning Issues
- **发现日期**: 2026-02-19
- **修复日期**: 2026-02-19
- **影响范围**: 战术图标系统，视觉效果，用户体验
- **相关文件**:
  - `src/components/CompleteIconsOverlay.tsx`
  - `src/game/tacticalIconMatcher.ts`
- **问题描述**: 1) 进攻图标没显示出来，只有一个圆圈；2) 7列的图标根本不应该存在；3) 水平方向拼合不成功，CMF和DMF之间的图标没有显示；4) 列2没有球员但显示了与球场拼合的图标。
- **根本原因**: 1) SVG图标使用了href而不是xlinkHref属性；2) 水平图标创建逻辑没有限制图标列在0-6范围内；3) 水平匹配逻辑存在问题；4) 球场图标匹配逻辑没有验证插槽索引的有效性。
- **修复方案**: 1) 将SVG图标中的href改为xlinkHref；2) 更新createHorizontalCompleteIcon方法，确保图标列在0-6范围内；3) 重构checkHorizontalMatch方法，使用显式的左右相邻插槽检查；4) 在checkFieldIconMatches方法中添加插槽索引范围验证。
- **版本**: 0.2.97
- **Git提交**: N/A
- **影响分析**:
  - 进攻图标现在正确显示，不再只是一个圆圈
  - 7列不再显示不应该存在的图标
  - 水平方向拼合现在成功，CMF和DMF之间的图标正确显示
  - 无球员的列不再显示与球场拼合的图标
  - 战术图标系统更加准确和可靠

## Version History
- **0.2.97**: Fixed tactical icon display and positioning issues including SVG icon rendering, 7-column icon validation, horizontal icon matching, and empty slot icon creation
- **0.2.96**: Fixed horizontal icon positioning issue by restructuring the checkHorizontalMatch method to use explicit left and right adjacent slot checking, ensuring that CMF in zone 6 1-2 columns and DMF in zone 6 3-4 columns correctly create horizontal icons at the left player's column start position, and updated createHorizontalCompleteIcon to always use leftHalf's slot as the left player's start position
- **0.2.95**: Fixed horizontal icon matching issue by completely restructuring the checkHorizontalMatch method to check both left and right adjacent cards, and to match both current card's right positions with adjacent card's left positions as well as current card's left positions with adjacent card's right positions, ensuring horizontal icon combinations work correctly in both directions
- **0.2.94**: Fixed AI vertical icon duplication issue by restructuring the checkVerticalMatch method to iterate through position pairs directly instead of checking all slots for each pair, ensuring each vertical icon pair is only processed once and preventing duplicate attack icons from appearing when AI LWF is in zone 3 and CF is in zone 2
- **0.2.93**: Fixed AI complete icon display issue by correcting the rotation transformation order for AI icons, ensuring the 180-degree rotation is applied after converting to SVG coordinate system with the correct rotation center point, resolving the issue where AI icons were appearing as blank circles instead of displaying their actual content
- **0.2.92**: Fixed AI horizontal icon matching logic by correcting adjacent card checking for AI half cards, ensuring they check right-side cards (slotIndex + 2) like player half cards, and updating position pair checking to always match current card's right positions with adjacent card's left positions, resolving the issue of icons appearing in column 7 when they shouldn't exist
- **0.2.91**: Fixed two issues with tactical icons: 1) Attack icons were only showing as blank circles instead of displaying the actual icon content, fixed by updating SVG image tag to use 'href' attribute instead of 'xlinkHref'; 2) Unnecessary 7-column icons were being created when they shouldn't exist, fixed by adding validation in createHorizontalCompleteIcon method to check if cards are truly adjacent and if icon column is within valid range (0-7)
- **0.2.90**: Fixed AI horizontal icon parameter order issue by updating checkHorizontalMatch method to ensure correct parameter order when calling createHorizontalCompleteIcon, always passing the left card as leftHalf and right card as rightHalf regardless of check order
- **0.2.89**: Fixed AI horizontal icon position issue by updating createHorizontalCompleteIcon method to ensure icons display in the center between two cards, and modifying calculateAICoordinates in CompleteIconsOverlay.tsx to remove unnecessary horizontal flipping of x coordinates for AI icons
- **0.2.88**: Fixed AI icon position adjustment issue by removing duplicate isAIZone variable declaration and restructuring position adjustment logic to use different rules for AI half and player half, ensuring icons display in correct positions
- **0.2.87**: Fixed AI card icon rotation issue by updating horizontal matching logic to use reversed position pairs for AI half (zone < 4), ensuring correct left-right matching logic for rotated AI cards
- **0.2.86**: Fixed type errors in `AthleteCard.tsx` by updating `getIconImage` function to accept `SkillIconType` and explicitly typing `iconPositions` array with `IconPosition` type, ensuring skill icons and half icons render correctly
- **0.2.85**: Fixed background music control issue by updating `BackgroundMusic.tsx` to control both background music and ambient sounds with a single toggle, ensuring the music off button closes all sounds including ambient noise
- **0.2.84**: Created `RotationUtils` tool class to centralize rotation logic, updated all card data with `rotatedTactics` property, and modified `tacticalIconMatcher.ts` to use `RotationUtils.getTacticsForZone` method
- **0.2.83**: Updated tactical icon matcher to use unified AI direction handling with `getRotatedTactics` method, ensuring consistent icon activation for AI cards
- **0.2.82**: Fixed AI horizontal icon activation issue by adding horizontal rotation logic for AI cards, checking left adjacent cards instead of right
- **0.2.81**: Fixed AI attack icon activation issue by adding position rotation mapping for vertical icon matching in AI half
- **0.2.80**: Fixed penalty arc position error by adjusting arc width to 2 cells, correcting arc positions, and ensuring proper arc directions for both opponent and player penalty areas
- **0.2.79**: Fixed IconPosition type definition error by adding IconPosition type definition to AthleteCard.tsx and IconWithPosition interface to cards.ts
- **0.2.78**: Fixed AthleteCard name property error by updating substitution.ts to use nickname instead of name, and fixed ambient sound type definition errors by adding missing ambient types and updating function signatures
- **0.2.77**: Fixed field visuals by adding proper penalty area arcs and球门 structures outside the pitch, improving overall visual realism
- **0.2.76**: Added skill icon rendering to AthleteCard component, ensuring pressure skills use `/icons/press_up.svg` and displaying all skill icons on player cards
- **0.2.75**: Standardized pressure icon references to use `/icons/press_up.svg` consistently across all components and card types, ensuring visual consistency for pressure icons and skills
- **0.2.74**: Fixed AI Zone 3 placement issue by updating the `getValidZones` function in `ai.ts` to prioritize Zone 3 for forwards, Zone 2 for midfielders, and Zone 1 for defenders, ensuring AI attempts to place players in their most forward valid positions first
- **0.2.73**: Fixed duplicate attributes in AthleteCardGroup component by removing redundant JSX attributes including "transition", "whileHover", and "style", eliminating Vite warnings during build process
- **0.2.72**: Fixed AI half pressure icon activation issue by adding additional vertical position pairs in the tactical icon matching logic, ensuring DMF (zone 1, same starting column) and RWF (zone 2, same starting column) pressure icons properly connect in AI half
- **0.2.71**: Fixed AI half attack icon activation issue by adding additional vertical position pairs in the tactical icon matching logic, ensuring AMF (zone 1, columns 4-5) and LWF (zone 2, columns 4-5) attack icons properly connect in AI half
- **0.2.70**: Fixed pressure icon activation issue by adding additional vertical position pairs in the tactical icon matching logic, ensuring LWF (zone 5, columns 3-4) and DMF (zone 6, columns 2-3) pressure icons properly connect
- **0.2.69**: Optimized card dealing speed by reducing the dealing interval from 300ms to 200ms per card, ensuring all 20 cards are dealt within the 5-second time limit after home/away selection
- **0.2.68**: Updated shooting logic to allow users to select activated attack icons directly instead of players, ensuring shooting is only possible when there are activated attack icons on the field
- **0.2.67**: Fixed field icon position issue by updating checkFieldIconMatches to adjust slot index based on icon position, ensuring right-side icons appear in the correct slots, and updated createHorizontalCompleteIcon to calculate centerX correctly for horizontal synergy icons
- **0.2.66**: Fixed adjacent LB and RB synergy icon issue by updating checkHorizontalMatch to use slotIndex + 2 instead of slotIndex + 1, ensuring proper horizontal matching between cards that occupy two slots
- **0.2.65**: Fixed field icon positioning issue by updating createFieldIconCompleteIcon to adjust slot index based on actual icon position, ensuring left and right defense icons appear in their respective slots
- **0.2.64**: [Previous version changes]
- **0.2.63**: Removed preview deck phase after card dealing, streamlining the draft process to start immediately with shuffling
- **0.2.62**: [Previous version changes]
- **0.2.61**: Fixed incorrect skipTeamAction in FINISH_SQUAD_SELECT by updating it to use TurnPhaseService.shouldSkipTeamAction for determining if team action should be skipped at match start
- **0.2.60**: Fixed incorrect skipTeamAction reset by updating performEndTurn to use TurnPhaseService.shouldSkipTeamAction for determining if team action should be skipped, ensuring proper game flow when no pass/press icons are available
- **0.2.59**: Fixed inconsistent highlight and click logic by updating CenterField.tsx to include skipTeamAction parameter and ensure validation logic consistency with useGameState.ts
- **0.2.58**: Fixed ambient sound playback issue by updating GameBoard component to not play ambient sounds immediately when entering the main game interface
- **0.2.57**: Added dynamic background effects including star floating animation, nebula flow animation, and grid scrolling animation
- **0.2.55**: Updated StarDraft component to use AthleteCardComponent for displaying star cards, ensuring consistent card display across the application
- **0.2.54**: Fixed issue where players couldn't place cards on the field by ensuring consistency in validation logic between useGameState and gameReducer
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

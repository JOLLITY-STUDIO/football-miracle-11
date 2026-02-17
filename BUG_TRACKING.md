# Bug Tracking

## Fixed Bugs

### 1. AI Draft Card Storage Inconsistency
- **Issue**: AI-selected draft cards were being stored in `aiAthleteHand`, but the filtering logic was checking `aiDraftHand`, causing potential card duplication and incorrect draft pool management.
- **Fix**: Updated all draft filtering logic to use `aiAthleteHand` instead of `aiDraftHand` for consistency.
- **Files Modified**: `src/utils/draft.ts` (lines 24, 188)

### 2. AI Bench Not Populated After Draft
- **Issue**: After completing the draft, AI cards were all stored in `aiAthleteHand` and `aiBench` remained empty, causing the AI to have no substitutes.
- **Fix**: Modified the `discardDraftCard` function to distribute AI cards between `aiAthleteHand` (first 10 cards as starters) and `aiBench` (remaining cards as substitutes) when the draft is complete.
- **Files Modified**: `src/utils/draft.ts` (lines 158-176)

### 3. Draft Round Progression Issue
- **Issue**: Draft process was only completing one round instead of three rounds as intended.
- **Fix**: Modified the `useEffect` dependency array in `DraftPhase.tsx` to remove `gameState.draftRound`, ensuring the draft round progression logic works correctly.
- **Files Modified**: `src/components/DraftPhase.tsx` (line 87)

### 4. Duplicate Key Warnings in React Components
- **Issue**: React was warning about duplicate keys when rendering cards in different positions.
- **Fix**: Added unique prefixes to card keys in `GameBoard.tsx` (AI hand) and `AthleteCardGroup.tsx` (player hand) to ensure keys are unique across different components.
- **Files Modified**: `src/components/GameBoard.tsx` (line 1187), `src/components/AthleteCardGroup.tsx` (line 98)

### 5. Player Card Distribution Issue After Draft
- **Issue**: After completing the draft, player cards were all stored in `playerAthleteHand` and `playerBench` remained empty, causing the player to have more than 10 cards in hand.
- **Fix**: Modified the `discardDraftCard` function to distribute player cards between `playerAthleteHand` (first 10 cards as starters) and `playerBench` (remaining cards as substitutes) when the draft is complete.
- **Files Modified**: `src/utils/draft.ts` (lines 166-179, 216-229)

### 6. SquadSelection Component Using Popup Instead of Mask
- **Issue**: The SquadSelection component was implemented as a full page instead of using a mask overlay, which didn't match the desired UI design.
- **Fix**: Modified the SquadSelection component to use a full-screen mask overlay with backdrop blur, providing a modal-like experience without using a traditional popup.
- **Files Modified**: `src/components/SquadSelection.tsx` (lines 254-401), `src/components/SquadSelection.css` (lines 1-7)

### 7. Duplicate Star Cards in Player's Hand
- **Issue**: During the draft process, duplicate star cards were appearing in the player's hand due to two issues: 1) The DraftPhase component was generating its own set of cards independently of the game state, bypassing the filtering logic, and 2) The pickDraftCard function wasn't checking for duplicates before adding cards to the player's hand.
- **Fix**: 1) Updated DraftPhase to use the game state's startDraftRound function instead of generating its own cards, and 2) Added duplicate checking in both pickDraftCard and aiPickDraftCard functions to ensure each card is only added once to a player's hand.
- **Files Modified**: `src/components/DraftPhase.tsx` (lines 25-86), `src/utils/draft.ts` (lines 68-69, 121-122)

### 8. Background Music Playback Error
- **Issue**: Background music was failing to load with "NotSupportedError: Failed to load because no supported source was found".
- **Fix**: Updated the audio loading logic in BackgroundMusic.tsx to properly handle metadata loading, add error handling for unsupported formats, and implement a timeout mechanism to prevent infinite waiting.
- **Files Modified**: `src/components/BackgroundMusic.tsx` (lines 157-231)

### 9. Card Dealing Logic Issue
- **Issue**: Card dealing was showing incorrect counts (33/36 instead of 20 total cards) and dealing too many cards.
- **Fix**: Updated the DRAW_CARD logic in gameLogic.ts to properly handle deck depletion, fixed the message display to show a fixed total of 20 cards, and ensured proper distribution between home and away decks.
- **Files Modified**: `src/game/gameLogic.ts` (lines 900-983)

### 10. Duplicate Card Dealer Animations
- **Issue**: Multiple CardDealer components were rendering simultaneously, creating duplicate animations and confusing card count displays.
- **Fix**: Updated GameBoard.tsx to show only single card animations for both player and AI dealers, reducing visual clutter and providing clearer feedback.
- **Files Modified**: `src/components/GameBoard.tsx` (lines 812-829)

### 11. Player Card Nickname Line Break Issue
- **Issue**: Player card nicknames were automatically wrapping to multiple lines, affecting card layout consistency.
- **Fix**: Added `whitespace-nowrap overflow-hidden text-ellipsis` classes to the nickname display div to prevent wrapping and ensure consistent single-line display.
- **Files Modified**: `src/components/AthleteCard.tsx` (lines 300-302)

### 12. Player Card Text Auto-Sizing Issue
- **Issue**: Player card text (nickname and real name) was not adjusting font size based on text length, causing longer text to be truncated.
- **Fix**: Implemented adaptive font sizing for both nickname and real name displays, calculating font size based on text length to ensure complete display.
- **Files Modified**: `src/components/AthleteCard.tsx` (lines 119-128, 311-329)

### 13. Background Music Next Track Icon Issue
- **Issue**: The next track button in game mode had a garbled icon instead of the correct skip track icon.
- **Fix**: Replaced the garbled icon with the correct ⏭️ icon and added a tooltip for better user understanding.
- **Files Modified**: `src/components/BackgroundMusic.tsx` (lines 312-318)

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
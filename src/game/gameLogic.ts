import type { PlayerCard, SynergyCard, TacticalIcon, ImmediateEffectType } from '../data/cards';
import { playerCards, canPlaceCardAtSlot } from '../data/cards';
import { getSynergyDeckFixed } from '../data/synergyConfig';

export type ControlState = 'attack' | 'normal' | 'defense';
export type GamePhase = 
  | 'setup'
  | 'coinToss'
  | 'draft'
  | 'squadSelect'
  | 'firstHalf'
  | 'halfTime'
  | 'secondHalf'
  | 'finished';
export type TurnPhase = 'teamAction' | 'playerAction' | 'shooting' | 'end';
export type PlayerActionType = 'organizeAttack' | 'directAttack' | null;
export type ShotResult = 'goal' | 'saved' | 'missed' | 'magicNumber';
export type DuelPhase = 'none' | 'init' | 'select_shot_icon' | 'reveal_attacker' | 'reveal_defender' | 'reveal_synergy' | 'reveal_skills' | 'summary' | 'result';

export interface FieldSlot {
  position: number;
  playerCard: PlayerCard | null;
  shotMarkers: number;
  usedShotIcons: number[]; // Track which shot icon indices have been used
}

export interface FieldZone {
  zone: number;
  slots: FieldSlot[];
}

export interface ShotAttempt {
  attacker: PlayerCard;
  defender: PlayerCard | null;
  attackSynergy: SynergyCard[];
  defenseSynergy: SynergyCard[];
  attackPower: number;
  defensePower: number;
  result: ShotResult;
  activatedSkills: {
    attackerSkills: string[];
    defenderSkills: string[];
  };
  attackerUsedShotIcons?: number[];
  attackerZone?: number;
  attackerSlot?: number;
}

export interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentTurn: 'player' | 'ai';
  controlPosition: number;
  playerScore: number;
  aiScore: number;
  playerSubstitutionsLeft: number;
  aiSubstitutionsLeft: number;
  playerHand: PlayerCard[];
  playerBench: PlayerCard[];
  playerSynergyHand: SynergyCard[];
  playerField: FieldZone[];
  aiField: FieldZone[];
  aiHand: PlayerCard[];
  aiBench: PlayerCard[];
  aiSynergyHand: SynergyCard[];
  synergyDeck: SynergyCard[];
  synergyDiscard: SynergyCard[];
  selectedCard: PlayerCard | null;
  isHomeTeam: boolean;
  selectedSynergyCards: SynergyCard[];
  currentAction: PlayerActionType;
  message: string;
  turnCount: number;
  isFirstTurn: boolean;
  isStoppageTime: boolean;
  pendingShot: ShotAttempt | null;
  draftRound: number;
  draftStep: number;
  availableDraftCards: PlayerCard[];
  starCardDeck: PlayerCard[];
  pendingPenalty: boolean;
  pendingImmediateEffect: { card: PlayerCard; zone: number; slot: number } | null;
  synergyChoice: { cards: SynergyCard[]; sourceCard: PlayerCard } | null;
  substitutionMode: { incomingCard: PlayerCard } | null;
  instantShotMode: { card: PlayerCard; zone: number; slot: number } | null;
  playerActiveSynergy: SynergyCard[];
  aiActiveSynergy: SynergyCard[];
  isDealing: boolean;
  duelPhase: DuelPhase;
  aiActionStep: 'teamAction' | 'placeCard' | 'shot' | 'endTurn' | 'none';
  matchLogs: string[];
}

export const createInitialState = (
  playerStarters: PlayerCard[] = [], 
  playerSubstitutes: PlayerCard[] = [],
  initialPlayerField: FieldZone[] | null = null
): GameState => {
  const shuffledSynergy = getSynergyDeckFixed();
  const starCards = [...playerCards.filter(c => c.unlocked && c.isStar)].sort(() => Math.random() - 0.5);

  let playerHand: PlayerCard[];
  let playerBench: PlayerCard[];
  let playerField: FieldZone[];

  if (initialPlayerField) {
    playerField = initialPlayerField;
    playerHand = []; // All starters are on field
    playerBench = [...playerSubstitutes];
  } else if (playerStarters.length > 0 && playerSubstitutes.length > 0) {
    playerHand = [...playerStarters];
    playerBench = [...playerSubstitutes];
    playerField = [
      { zone: 1, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
      { zone: 2, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
      { zone: 3, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
      { zone: 4, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
    ];
  } else {
    const shuffledPlayers = [...playerCards.filter(c => c.unlocked && !c.isStar)].sort(() => Math.random() - 0.5);
    playerHand = shuffledPlayers.slice(0, 10);
    playerBench = [];
    playerField = [
      { zone: 1, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
      { zone: 2, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
      { zone: 3, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
      { zone: 4, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
    ];
  }

  const homeCards = playerCards.filter(c => !c.isStar && c.id.startsWith('H'));
  const awayCards = playerCards.filter(c => !c.isStar && c.id.startsWith('A'));

  return {
    phase: 'setup',
    turnPhase: 'playerAction',
    currentTurn: 'player',
    controlPosition: 5,
    playerScore: 0,
    aiScore: 0,
    playerSubstitutionsLeft: 3,
    aiSubstitutionsLeft: 3,
    isHomeTeam: true, // Default to home for setup
    playerHand: homeCards,
    playerBench: [],
    playerSynergyHand: [],
    playerField,
    aiField: [
      { zone: 1, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
      { zone: 2, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
      { zone: 3, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
      { zone: 4, slots: Array.from({ length: 8 }, (_, i) => ({ position: i, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) },
    ],
    aiHand: awayCards,
    aiBench: [],
    aiSynergyHand: [],
    synergyDeck: shuffledSynergy,
    synergyDiscard: [],
    selectedCard: null,
    selectedSynergyCards: [],
    currentAction: null,
    message: 'Preparing game board...',
    turnCount: 0,
    isFirstTurn: true,
    isStoppageTime: false,
    pendingShot: null,
    draftRound: 0,
    draftStep: 0,
    availableDraftCards: [],
    starCardDeck: starCards,
    pendingPenalty: false,
    pendingImmediateEffect: null,
    synergyChoice: null,
    substitutionMode: null,
    instantShotMode: null,
    playerActiveSynergy: [],
    aiActiveSynergy: [],
    isDealing: false,
    duelPhase: 'none',
    aiActionStep: 'none',
    matchLogs: ['Game started'],
  };
};

export type GameAction = 
  | { type: 'COIN_TOSS'; isHomeTeam: boolean }
  | { type: 'START_DRAFT_ROUND' }
  | { type: 'PICK_DRAFT_CARD'; cardIndex: number }
  | { type: 'FINISH_SQUAD_SELECT'; starters: PlayerCard[]; subs: PlayerCard[] }
  | { type: 'TEAM_ACTION'; action: 'pass' | 'press' }
  | { type: 'PLACE_CARD'; card: PlayerCard; zone: number; slot: number }
  | { type: 'PERFORM_SHOT'; zone: number; slot: number; synergyCards: SynergyCard[] }
  | { type: 'SELECT_SHOT_ICON'; iconIndex: number }
  | { type: 'END_TURN' }
  | { type: 'SUBSTITUTE'; incomingCardId: string; outgoingCardId: string }
  | { type: 'TRIGGER_EFFECT'; choice?: number }
  | { type: 'SKIP_EFFECT' }
  | { type: 'SYNERGY_CHOICE_SELECT'; index: number }
  | { type: 'PENALTY_COMPLETE'; playerPoints: number; aiPoints: number }
  | { type: 'SELECT_PLAYER_CARD'; card: PlayerCard | null }
  | { type: 'SELECT_SYNERGY_CARD'; card: SynergyCard }
  | { type: 'START_SUBSTITUTION'; card: PlayerCard }
  | { type: 'CANCEL_SUBSTITUTION' }
  | { type: 'START_SECOND_HALF' }
  | { type: 'CANCEL_INSTANT_SHOT' }
  | { type: 'AI_DRAFT_PICK' }
  | { type: 'AI_TURN' }
  | { type: 'SET_DEALING'; isDealing: boolean }
  | { type: 'ADVANCE_DUEL' }
  | { type: 'FINISH_SETUP' };

const addLog = (state: GameState, log: string): string[] => {
  const newLogs = [...state.matchLogs, log];
  if (newLogs.length > 50) newLogs.shift(); // Keep last 50 logs
  return newLogs;
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'FINISH_SETUP': {
      return {
        ...state,
        phase: 'coinToss',
        message: 'Click to toss the coin'
      };
    }
    case 'AI_DRAFT_PICK':
      return aiPickDraftCard(state);

    case 'AI_TURN':
      return performAITurn(state);

    case 'SELECT_PLAYER_CARD':
      return { ...state, selectedCard: action.card };

    case 'SELECT_SYNERGY_CARD': {
      const isSelected = state.selectedSynergyCards.some(c => c.id === action.card.id);
      if (isSelected) {
        return {
          ...state,
          selectedSynergyCards: state.selectedSynergyCards.filter(c => c.id !== action.card.id),
        };
      } else {
        // Validation for max synergy cards is handled in UI or here?
        // Let's handle it here too for safety.
        const controlState = getControlState(state.controlPosition);
        const maxSynergy = getMaxSynergyCardsForAttack(controlState);
        const maxHandCards = Math.max(0, maxSynergy - 1);
        
        if (state.selectedSynergyCards.length < maxHandCards) {
          return {
            ...state,
            selectedSynergyCards: [...state.selectedSynergyCards, action.card],
          };
        }
        return state;
      }
    }

    case 'START_SUBSTITUTION':
      return { ...state, substitutionMode: { incomingCard: action.card } };

    case 'CANCEL_SUBSTITUTION':
      return { ...state, substitutionMode: null };

    case 'START_SECOND_HALF':
      if (state.phase !== 'halfTime') return state;
      return startSecondHalf(state);

    case 'SET_DEALING':
      return { ...state, isDealing: action.isDealing };

    case 'ADVANCE_DUEL': {
      if (state.duelPhase === 'none') return state;
      const phases: DuelPhase[] = ['init', 'select_shot_icon', 'reveal_attacker', 'reveal_defender', 'reveal_synergy', 'reveal_skills', 'summary', 'result'];
      const currentIndex = phases.indexOf(state.duelPhase);
      const nextPhase = phases[currentIndex + 1] || 'none';
      
      let newState = { ...state, duelPhase: nextPhase };
      
      // Log duel steps
      if (state.pendingShot) {
        const { attacker, defender, attackPower, defensePower, result } = state.pendingShot;
        switch (nextPhase) {
          case 'reveal_attacker':
            newState.matchLogs = addLog(newState, `[Duel] Attacker revealed: ${attacker.name}`);
            break;
          case 'reveal_defender':
            newState.matchLogs = addLog(newState, `[Duel] Defender revealed: ${defender?.name || 'Empty'}`);
            break;
          case 'reveal_synergy':
            newState.matchLogs = addLog(newState, `[Duel] Synergy cards revealed.`);
            break;
          case 'reveal_skills':
            newState.matchLogs = addLog(newState, `[Duel] Skill effects triggered.`);
            break;
          case 'summary':
            newState.matchLogs = addLog(newState, `[Duel] Final calculations: ${attackPower} vs ${defensePower}`);
            break;
          case 'result':
            newState.matchLogs = addLog(newState, `[Duel] Outcome: ${result === 'goal' ? 'GOAL!' : 'No goal.'}`);
            break;
        }
      }
      
      if (nextPhase === 'none') {
        newState.turnPhase = 'end';
        newState.pendingShot = state.pendingShot; // Keep for result display
      }
      
      return newState;
    }

    case 'CANCEL_INSTANT_SHOT':
      return { ...state, instantShotMode: null, message: 'Instant shot cancelled' };

    case 'COIN_TOSS': {
      let newState = performCoinToss(state, action.isHomeTeam);
      newState.matchLogs = addLog(newState, `Coin toss: Player is ${action.isHomeTeam ? 'Home' : 'Away'}`);
      return newState;
    }
    
    case 'START_DRAFT_ROUND': {
      let newState = startDraftRound(state);
      newState.matchLogs = addLog(newState, `Draft Round ${newState.draftRound} started`);
      return newState;
    }
    
    case 'PICK_DRAFT_CARD': {
      const card = state.availableDraftCards[action.cardIndex];
      let newState = pickDraftCard(state, action.cardIndex, true);
      if (card) {
        newState.matchLogs = addLog(newState, `Player picked: ${card.name}`);
      }
      return newState;
    }
    
    case 'FINISH_SQUAD_SELECT': {
      const newState = { ...state };
      newState.playerHand = action.starters;
      newState.playerBench = action.subs;
      
      // Automatically select AI squad (10 starters, rest as subs)
      // Prioritize star cards for starters
      const sortedAIPlayers = [...state.aiHand].sort((a, b) => {
        if (a.isStar && !b.isStar) return -1;
        if (!a.isStar && b.isStar) return 1;
        return 0;
      });
      
      newState.aiHand = sortedAIPlayers.slice(0, 10);
      newState.aiBench = sortedAIPlayers.slice(10);
      
      newState.phase = 'firstHalf';
      // Rule: Skip team action on the first turn of the match
      newState.turnPhase = 'playerAction';
      newState.isFirstTurn = true;
      newState.currentTurn = newState.isHomeTeam ? 'player' : 'ai';
      newState.message = 'Match starts! First turn skips Team Action. Player Action now.';
      newState.matchLogs = addLog(newState, `Match started!`);
      return newState;
    }
    
    case 'TEAM_ACTION':
      if (state.turnPhase !== 'teamAction') return state;
      {
        let newState = performTeamAction(state, action.action);
        const actor = state.currentTurn === 'player' ? 'You' : 'AI';
        const actionName = action.action === 'pass' ? 'Pass' : 'Press';
        newState.turnPhase = 'playerAction';
        newState.matchLogs = addLog(newState, `${actor} executed ${actionName}`);
        return newState;
      }
    
    case 'PLACE_CARD': {
      if (state.turnPhase !== 'playerAction' || state.currentAction) return state;
      const slotPosition = Math.floor(action.slot / 2) + 1;
      let newState = placeCard(state, action.card, action.zone, action.slot, true);
      const actor = state.currentTurn === 'player' ? 'You' : 'AI';
      newState.currentAction = 'organizeAttack';
      newState.matchLogs = addLog(newState, `${actor} placed ${action.card.name} at line ${action.zone}`);

      if (action.card.immediateEffect !== 'none') {
        newState.pendingImmediateEffect = { card: action.card, zone: action.zone, slot: slotPosition };
        newState.message = `Triggering ${action.card.name}'s effect...`;
      } else {
        // Go to 'end' phase to trigger auto-end turn timer in GameBoard
        newState.turnPhase = 'end';
        newState.message = 'Action completed. Turn ending...';
      }
      return newState;
    }
    
    case 'PERFORM_SHOT': {
      if ((state.turnPhase !== 'playerAction' && !state.instantShotMode) || state.currentAction !== null) return state;
      
      const zone = state.playerField.find(z => z.zone === action.zone);
      const slot = zone?.slots.find(s => s.position === action.slot);
      if (!slot?.playerCard && !state.instantShotMode) return state;

      const shotCard = state.instantShotMode ? state.instantShotMode.card : (slot?.playerCard ?? null);
      if (!shotCard) return state;

      let newState = performShot(state, shotCard, action.zone, action.slot, action.synergyCards, true);
      const actor = state.currentTurn === 'player' ? 'You' : 'AI';
      newState.currentAction = 'directAttack';
      newState.matchLogs = addLog(newState, `${actor} initiated a shot! Duel starts...`);
      
      // Removed auto transition to 'end' phase
      // newState.turnPhase = 'end';
      newState.selectedSynergyCards = [];
      newState.instantShotMode = null;
      return newState;
    }

    case 'SELECT_SHOT_ICON': {
      if (!state.pendingShot) return state;
      
      let newState = { ...state };
      const updatedShot = { ...state.pendingShot };
      updatedShot.attackerUsedShotIcons = [action.iconIndex];
      newState.pendingShot = updatedShot;

      // Sync selection to field state for visual blackening and persistence
      const isPlayer = state.currentTurn === 'player';
      const zone = state.pendingShot.attackerZone!;
      const slot = state.pendingShot.attackerSlot!;
      newState = selectShotIcon(newState, isPlayer, zone, slot, action.iconIndex);
      
      // Log the shot icon selection
      const actor = state.currentTurn === 'player' ? 'You' : 'AI';
      newState.matchLogs = addLog(newState, `${actor} selected shot icon ${action.iconIndex + 1}`);
      
      // Advance to next duel phase
      return { ...newState, duelPhase: 'reveal_attacker' as DuelPhase };
    }

    case 'END_TURN': {
      let newState = { ...state };
      const actor = state.currentTurn === 'player' ? 'You' : 'AI';
      
      // Cleanup active synergy cards to discard pile
      newState.synergyDiscard = [
        ...newState.synergyDiscard,
        ...state.playerActiveSynergy,
        ...state.aiActiveSynergy
      ];
      newState.playerActiveSynergy = [];
      newState.aiActiveSynergy = [];

      // Reset action states
      newState.currentAction = null;
      newState.pendingImmediateEffect = null;
      newState.selectedSynergyCards = [];
      newState.instantShotMode = null;
      newState.synergyChoice = null;
      newState.isFirstTurn = false;
      newState.pendingShot = null;
      newState.duelPhase = 'none';
      
      // Increment turn count
      newState.turnCount += 1;
      
      // Swap turns
      const nextTurn = state.currentTurn === 'player' ? 'ai' : 'player';
      newState.currentTurn = nextTurn;
      newState.aiActionStep = nextTurn === 'ai' ? 'teamAction' : 'none';
      
      // Check if next player can do team actions (Pass/Press icons on field)
      const field = nextTurn === 'player' ? newState.playerField : newState.aiField;
      const passCount = countIcons(field, 'pass');
      const pressCount = countIcons(field, 'press');
      
      newState.matchLogs = addLog(newState, `${actor} ended turn. Turn ${newState.turnCount} begins.`);

      if (passCount === 0 && pressCount === 0) {
        newState.turnPhase = 'playerAction';
        newState.message = nextTurn === 'player' 
          ? "Your turn. No team actions available, skipping to Player Action."
          : "AI's turn. No team actions available, skipping to Player Action.";
      } else {
        newState.turnPhase = 'teamAction';
        newState.message = nextTurn === 'player'
          ? "Your turn. Select Team Action."
          : "AI's turn. Team Action first.";
      }
      
      return newState;
    }

    case 'SUBSTITUTE':
      if (state.playerSubstitutionsLeft <= 0) return state;
      let newState = {
        ...substitutePlayer(state, action.outgoingCardId, action.incomingCardId, true),
        substitutionMode: null
      };
      const actor = state.currentTurn === 'player' ? 'You' : 'AI';
      newState.matchLogs = addLog(newState, `${actor} substituted a player`);
      return newState;

    case 'TRIGGER_EFFECT': {
      if (!state.pendingImmediateEffect) return state;
      const effect = state.pendingImmediateEffect.card.immediateEffect;
      const card = state.pendingImmediateEffect.card;
      const { zone, slot } = state.pendingImmediateEffect;

      let newState: GameState;
      if (effect === 'draw_synergy_2_choose_1') {
        const { state: drawState, drawnCards } = drawTwoSynergyCardsForChoice(state, true);
        if (drawnCards.length >= 2) {
          let nextState = { ...drawState, synergyChoice: { cards: drawnCards, sourceCard: card }, pendingImmediateEffect: null };
          nextState.matchLogs = addLog(nextState, `Triggered ${card.name} effect: Draw 2 choose 1`);
          return nextState;
        } else {
          let finalState = applyImmediateEffect(state, effect, true);
          finalState.message = `Deck insufficient, drew ${drawnCards.length} synergy card(s)`;
          newState = { ...finalState, pendingImmediateEffect: null };
        }
      } else if (effect === 'instant_shot') {
        let nextState = { ...state, instantShotMode: { card, zone, slot }, pendingImmediateEffect: null, message: `Select synergy cards to boost instant shot (ignores base defense)` };
        nextState.matchLogs = addLog(nextState, `Triggered ${card.name} effect: Instant Shot!`);
        return nextState;
      } else if (effect === 'steal_synergy') {
        const { state: stealState, stolenCard } = stealSynergyCard(state, true);
        newState = { ...stealState, message: stolenCard ? `Stole synergy card: ${stolenCard.name}` : stealState.message, pendingImmediateEffect: null };
        newState.matchLogs = addLog(newState, stolenCard ? `Stole synergy card: ${stolenCard.name}` : `Failed to steal synergy card`);
      } else {
        newState = applyImmediateEffect(state, effect, true);
        newState.pendingImmediateEffect = null;
        newState.matchLogs = addLog(newState, `Triggered ${card.name} effect: ${effect}`);
      }

      // Transition to 'end' phase for auto-end turn timer
      return {
        ...newState,
        turnPhase: 'end',
        message: (newState.message || 'Effect resolved.') + ' Turn ending...'
      };
    }

    case 'SKIP_EFFECT': {
      const newState = { ...state, pendingImmediateEffect: null, message: `Skipped ${state.pendingImmediateEffect?.card.name}'s effect` };
      newState.matchLogs = addLog(newState, `Skipped ${state.pendingImmediateEffect?.card.name}'s effect`);
      return {
        ...newState,
        turnPhase: 'end',
        message: newState.message + ". Turn ending..."
      };
    }

    case 'SYNERGY_CHOICE_SELECT': {
      if (!state.synergyChoice) return state;
      let newState = resolveSynergyChoice(state, state.synergyChoice.cards, action.index, true);
      newState.synergyChoice = null;
      const chosenCard = state.synergyChoice.cards[action.index];
      if (chosenCard) {
        newState.matchLogs = addLog(newState, `Chose synergy card: ${chosenCard.name}`);
      }
      // Transition to 'end' phase for auto-end turn timer
      return {
        ...newState,
        turnPhase: 'end',
        message: (newState.message || 'Synergy chosen.') + ' Turn ending...'
      };
    }

    case 'PENALTY_COMPLETE': {
      const isPlayerKicker = state.currentTurn === 'player';
      let newState = resolvePenaltyKick(state, action.playerPoints, action.aiPoints, isPlayerKicker);
      newState.matchLogs = addLog(newState, `Penalty shootout complete: ${action.playerPoints} - ${action.aiPoints}`);
      return newState;
    }

    default:
      return state;
  }
};

export const getControlState = (position: number, isPlayer: boolean = true): ControlState => {
  // 0: Home Attack (Red)
  // 1, 2: Home Normal (Green)
  // 3, 4: Home Defense (Blue)
  // 5: Neutral
  // 6, 7: Away Defense (Blue)
  // 8, 9: Away Normal (Green)
  // 10: Away Attack (Red)

  if (isPlayer) {
    if (position === 0 || position === 6 || position === 7) return 'attack';
    if (position === 3 || position === 4 || position === 10) return 'defense';
    return 'normal'; // 1, 2, 5, 8, 9
  } else {
    // AI Perspective (Away)
    if (position === 10 || position === 3 || position === 4) return 'attack';
    if (position === 6 || position === 7 || position === 0) return 'defense';
    return 'normal'; // 8, 9, 5, 1, 2
  }
};

export const performCoinToss = (state: GameState, isHomeTeam: boolean): GameState => {
  const newState = {
    ...state,
    isHomeTeam,
    phase: 'draft' as GamePhase,
    draftRound: 1,
    draftStep: 0,
    message: isHomeTeam ? 'You are Home Team! Draft starts' : 'You are Away Team! Draft starts',
  };

  // Assign base cards based on team (10 cards each)
  const homeCards = playerCards.filter(c => !c.isStar && c.id.startsWith('H'));
  const awayCards = playerCards.filter(c => !c.isStar && c.id.startsWith('A'));

  if (isHomeTeam) {
    newState.playerHand = [...homeCards];
    newState.aiHand = [...awayCards];
  } else {
    newState.playerHand = [...awayCards];
    newState.aiHand = [...homeCards];
  }
  
  // Ensure bench is empty before draft adds star cards
  newState.playerBench = [];
  newState.aiBench = [];

  if (newState.currentTurn === 'ai') {
    newState.aiActionStep = 'teamAction';
  }
  
  return newState;
};

export const startDraftRound = (state: GameState): GameState => {
  const newState = { ...state };
  const deck = [...newState.starCardDeck];
  
  if (deck.length < 3) {
    newState.phase = 'firstHalf';
    newState.turnPhase = 'teamAction';
    newState.currentTurn = newState.isHomeTeam ? 'player' : 'ai';
    newState.message = 'Draft complete! Game starts - Team Action first';
    
    // Set aiActionStep if AI starts
    if (newState.currentTurn === 'ai') {
      newState.aiActionStep = 'teamAction';
    }
    
    return newState;
  }
  
  const availableCards = deck.slice(0, 3);
  const remainingDeck = deck.slice(3);
  
  const firstPicker = newState.draftRound === 2 
    ? (newState.isHomeTeam ? 'player' : 'ai')
    : (newState.isHomeTeam ? 'ai' : 'player');
  
  newState.availableDraftCards = availableCards;
  newState.starCardDeck = remainingDeck;
  newState.draftStep = 1;
  newState.currentTurn = firstPicker;
  newState.message = `Round ${newState.draftRound}: ${firstPicker === 'player' ? 'Your' : 'AI\'s'} turn to pick`;
  
  return newState;
};

export const pickDraftCard = (state: GameState, cardIndex: number, isPlayer: boolean): GameState => {
  const newState = { ...state };
  const card = newState.availableDraftCards[cardIndex];
  
  if (!card) return newState;
  
  if (isPlayer) {
    newState.playerHand = [...newState.playerHand, card];
  } else {
    newState.aiHand = [...newState.aiHand, card];
  }
  
  const remainingCards = newState.availableDraftCards.filter((_, i) => i !== cardIndex);
  newState.availableDraftCards = remainingCards;
  
  if (newState.draftStep === 1) {
    newState.draftStep = 2;
    newState.currentTurn = newState.currentTurn === 'player' ? 'ai' : 'player';
    newState.message = `${isPlayer ? 'You' : 'AI'} picked ${card.name}! ${newState.currentTurn === 'player' ? 'Your' : 'AI\'s'} turn`;
  } else {
    newState.draftRound = newState.draftRound + 1;
    newState.draftStep = 0;
    newState.availableDraftCards = [];
    
    if (newState.draftRound > 3) {
      newState.phase = 'squadSelect';
      newState.turnPhase = 'teamAction';
      newState.currentTurn = 'player';
      newState.message = 'Draft complete! Select your squad - 10 starters, 3 subs';
    } else {
      newState.message = `Round ${newState.draftRound - 1} complete. Click to start Round ${newState.draftRound}`;
    }
  }
  
  return newState;
};

export const aiPickDraftCard = (state: GameState): GameState => {
  const availableCards = state.availableDraftCards;
  if (availableCards.length === 0) return state;
  
  const pickIndex = Math.floor(Math.random() * availableCards.length);
  return pickDraftCard(state, pickIndex, false);
};

const getAdjacentSlot = (
  field: FieldZone[],
  zoneIndex: number,
  slotIndex: number,
  direction: 'left' | 'right' | 'up' | 'down'
): { zone: FieldZone; slot: FieldSlot; zoneIndex: number; slotIndex: number } | null => {
  const zone = field[zoneIndex];
  if (!zone) return null;

  if (direction === 'left') {
    if (slotIndex > 0) {
      const targetSlot = zone.slots[slotIndex - 1];
      if (targetSlot) {
        return { zone, slot: targetSlot, zoneIndex, slotIndex: slotIndex - 1 };
      }
    }
    return null;
  }

  if (direction === 'right') {
    if (slotIndex < zone.slots.length - 1) {
      const targetSlot = zone.slots[slotIndex + 1];
      if (targetSlot) {
        return { zone, slot: targetSlot, zoneIndex, slotIndex: slotIndex + 1 };
      }
    }
    return null;
  }

  if (direction === 'up') {
    if (zoneIndex > 0) {
      const upZone = field[zoneIndex - 1];
      if (upZone && upZone.slots[slotIndex]) {
        return { zone: upZone, slot: upZone.slots[slotIndex], zoneIndex: zoneIndex - 1, slotIndex };
      }
    }
    return null;
  }

  if (direction === 'down') {
    if (zoneIndex < field.length - 1) {
      const downZone = field[zoneIndex + 1];
      if (downZone && downZone.slots[slotIndex]) {
        return { zone: downZone, slot: downZone.slots[slotIndex], zoneIndex: zoneIndex + 1, slotIndex };
      }
    }
    return null;
  }

  return null;
};

const getMatchingPosition = (position: string): { matchingPosition: string; direction: 'left' | 'right' | 'up' | 'down' } | null => {
  const positionMap: Record<string, { matchingPosition: string; direction: 'left' | 'right' | 'up' | 'down' }> = {
    'slot1-topLeft': { matchingPosition: 'slot2-topRight', direction: 'left' },
    'slot1-topRight': { matchingPosition: 'slot2-topLeft', direction: 'right' },
    'slot1-middleLeft': { matchingPosition: 'slot2-middleRight', direction: 'left' },
    'slot1-middleRight': { matchingPosition: 'slot2-middleLeft', direction: 'right' },
    'slot1-bottomLeft': { matchingPosition: 'slot2-bottomRight', direction: 'left' },
    'slot1-bottomRight': { matchingPosition: 'slot2-bottomLeft', direction: 'right' },
    'slot2-topLeft': { matchingPosition: 'slot1-topRight', direction: 'left' },
    'slot2-topRight': { matchingPosition: 'slot1-topLeft', direction: 'right' },
    'slot2-middleLeft': { matchingPosition: 'slot1-middleRight', direction: 'left' },
    'slot2-middleRight': { matchingPosition: 'slot1-middleLeft', direction: 'right' },
    'slot2-bottomLeft': { matchingPosition: 'slot1-bottomRight', direction: 'left' },
    'slot2-bottomRight': { matchingPosition: 'slot1-topLeft', direction: 'right' },
  };
  return positionMap[position] || null;
};

export const countIcons = (field: FieldZone[], iconType: TacticalIcon): number => {
  let count = 0;
  const matchedPairs = new Set<string>();

  for (let zoneIndex = 0; zoneIndex < field.length; zoneIndex++) {
    const zone = field[zoneIndex];
    if (!zone) continue;
    for (let slotIndex = 0; slotIndex < zone.slots.length; slotIndex++) {
      const slot = zone.slots[slotIndex];
      if (!slot || !slot.playerCard) continue;

      if (slot.playerCard.completeIcon === iconType) {
        count++;
      }

      for (const iconWithPos of slot.playerCard.iconPositions) {
        if (iconWithPos.type !== iconType) continue;

        const pairKey = `${zoneIndex}-${slotIndex}-${iconWithPos.position}`;
        if (matchedPairs.has(pairKey)) continue;

        const matchInfo = getMatchingPosition(iconWithPos.position);
        if (!matchInfo) continue;

        const adjacent = getAdjacentSlot(field, zoneIndex, slotIndex, matchInfo.direction);
        if (!adjacent || !adjacent.slot.playerCard) continue;

        const hasMatchingIcon = adjacent.slot.playerCard.iconPositions.some(
          pos => pos.position === matchInfo.matchingPosition && pos.type === iconType
        );

        if (hasMatchingIcon) {
          count++;
          matchedPairs.add(pairKey);
          matchedPairs.add(`${adjacent.zoneIndex}-${adjacent.slotIndex}-${matchInfo.matchingPosition}`);
        }
      }
    }
  }

  return count;
};

export const drawSynergyCards = (state: GameState, count: number, isPlayer: boolean): GameState => {
  const newState = { ...state };
  const hand = isPlayer ? [...newState.playerSynergyHand] : [...newState.aiSynergyHand];
  const deck = [...newState.synergyDeck];
  
  let drawn = 0;
  while (drawn < count && hand.length < 5 && deck.length > 0) {
    const card = deck.shift();
    if (card) {
      hand.push(card);
      drawn++;
    }
  }
  
  if (isPlayer) {
    newState.playerSynergyHand = hand;
  } else {
    newState.aiSynergyHand = hand;
  }
  newState.synergyDeck = deck;
  
  return newState;
};

export const drawTwoSynergyCardsForChoice = (state: GameState, isPlayer: boolean): { state: GameState; drawnCards: SynergyCard[] } => {
  const newState = { ...state };
  const deck = [...newState.synergyDeck];
  const drawnCards: SynergyCard[] = [];
  
  for (let i = 0; i < 2 && deck.length > 0; i++) {
    const card = deck.shift();
    if (card) {
      drawnCards.push(card);
    }
  }
  
  newState.synergyDeck = deck;
  
  return { state: newState, drawnCards };
};

export const resolveSynergyChoice = (
  state: GameState,
  drawnCards: SynergyCard[],
  keepIndex: number,
  isPlayer: boolean
): GameState => {
  const newState = { ...state };
  const hand = isPlayer ? [...newState.playerSynergyHand] : [...newState.aiSynergyHand];
  const discard = [...newState.synergyDiscard];
  
  const cardToKeep = drawnCards[keepIndex];
  const cardToDiscard = drawnCards[1 - keepIndex];
  
  if (hand.length < 5 && cardToKeep) {
    hand.push(cardToKeep);
  }
  
  if (cardToDiscard) {
    discard.push(cardToDiscard);
  }
  
  if (isPlayer) {
    newState.playerSynergyHand = hand;
  } else {
    newState.aiSynergyHand = hand;
  }
  newState.synergyDiscard = discard;
  
  return newState;
};

export const moveControlMarker = (state: GameState, steps: number, towardsPlayer: boolean): GameState => {
  const newPosition = towardsPlayer 
    ? Math.max(0, state.controlPosition - steps)
    : Math.min(10, state.controlPosition + steps);
  
  return { ...state, controlPosition: newPosition };
};

export const performTeamAction = (state: GameState, action: 'pass' | 'press'): GameState => {
  let newState = { ...state };
  const isPlayer = state.currentTurn === 'player';
  const field = isPlayer ? state.playerField : state.aiField;
  
  if (action === 'pass') {
    const passCount = countIcons(field, 'pass');
    const currentHandSize = isPlayer ? state.playerSynergyHand.length : state.aiSynergyHand.length;
    const canDraw = Math.min(passCount, 5 - currentHandSize);
    
    if (canDraw > 0) {
      newState = drawSynergyCards(newState, canDraw, isPlayer);
      newState.message = `${isPlayer ? 'You' : 'AI'} drew ${canDraw} synergy card(s)`;
    } else {
      newState.message = 'Hand full or synergy deck empty';
    }
  } else {
    const pressCount = countIcons(field, 'press');
    if (pressCount > 0) {
      newState = moveControlMarker(newState, pressCount, isPlayer);
      newState.message = `${isPlayer ? 'You' : 'AI'} moved control marker towards opponent by ${pressCount} `;
    } else {
      newState.message = 'No press icons available';
    }
  }
  
  newState.turnPhase = 'playerAction';
  return newState;
};

export const applyImmediateEffect = (
  state: GameState, 
  effect: ImmediateEffectType, 
  isPlayer: boolean
): GameState => {
  let newState = { ...state };
  
  switch (effect) {
    case 'move_control_1':
      newState = moveControlMarker(newState, 1, isPlayer);
      newState.message = 'Control marker moved 1 towards opponent';
      break;
    case 'move_control_2':
      newState = moveControlMarker(newState, 2, isPlayer);
      newState.message = 'Control marker moved 2 towards opponent';
      break;
    case 'draw_synergy_1':
      if ((isPlayer ? newState.playerSynergyHand.length : newState.aiSynergyHand.length) < 5) {
        newState = drawSynergyCards(newState, 1, isPlayer);
        newState.message = 'Drew 1 synergy card';
      }
      break;
    case 'draw_synergy_2_choose_1':
      if ((isPlayer ? newState.playerSynergyHand.length : newState.aiSynergyHand.length) < 5) {
        // 在实际 UI 中应该弹出选择框，这里先实现逻辑支持
        const result = drawTwoSynergyCardsForChoice(newState, isPlayer);
        newState = result.state;
        // 如果是 AI，随机选一张；如果是玩家，暂时简化为自动选第一张，直到 UI 支持选择
        if (!isPlayer) {
          newState = resolveSynergyChoice(newState, result.drawnCards, 0, false);
        } else {
          newState = resolveSynergyChoice(newState, result.drawnCards, 0, true);
          newState.message = `Drew 2, kept ${result.drawnCards[0]?.name || 'one'}`;
        }
      }
      break;
    case 'steal_synergy':
      const stealResult = stealSynergyCard(newState, isPlayer);
      newState = stealResult.state;
      break;
    case 'instant_shot':
      newState.message = 'Triggered Instant Shot effect！';
      break;
  }
  
  return newState;
};

export const calculateAttackPower = (
  attacker: PlayerCard,
  synergyCards: SynergyCard[],
  field: FieldZone[],
  usedShotMarkers: number = 0
): number => {
  const baseAttack = attacker.icons.filter(i => i === 'attack').length;
  // 射门标记削弱:每次射门后基础攻击力-1 (规则:翻到背面的标记视为空位)
  const effectiveBaseAttack = Math.max(0, baseAttack - usedShotMarkers);
  const synergyStars = synergyCards.reduce((sum, c) => sum + c.stars, 0);
  return effectiveBaseAttack + synergyStars;
};

export const stealSynergyCard = (
  state: GameState,
  isPlayer: boolean
): { state: GameState; stolenCard: SynergyCard | null } => {
  const newState = { ...state };
  const opponentHand = isPlayer ? [...newState.aiSynergyHand] : [...newState.playerSynergyHand];
  
  if (opponentHand.length === 0) {
    return { state: newState, stolenCard: null };
  }
  
  const stolenIndex = Math.floor(Math.random() * opponentHand.length);
  const stolenCard = opponentHand[stolenIndex] ?? null;
  
  if (stolenCard) {
    if (isPlayer) {
      newState.aiSynergyHand = opponentHand.filter((_, i) => i !== stolenIndex);
    } else {
      newState.playerSynergyHand = opponentHand.filter((_, i) => i !== stolenIndex);
    }
    newState.synergyDiscard = [...newState.synergyDiscard, stolenCard];
    newState.message = `Discarded from opponent's hand ${stolenCard.name}`;
  }
  
  return { state: newState, stolenCard };
};

export const calculateDefensePower = (
  defender: PlayerCard | null,
  synergyCards: SynergyCard[],
  field: FieldZone[],
  ignoreBaseDefense: boolean = false,
  attackerDefenseIcons: number = 0
): number => {
  let baseDefense = 0;
  if (!ignoreBaseDefense) {
    baseDefense = field.reduce((count, zone) => {
      return count + zone.slots.reduce((slotCount, slot) => {
        if (slot.playerCard) {
          return slotCount + slot.playerCard.icons.filter(i => i === 'defense').length;
        }
        return slotCount;
      }, 0);
    }, 0);
  }
  baseDefense = Math.max(0, baseDefense - attackerDefenseIcons);
  const synergyStars = synergyCards.reduce((sum, c) => sum + c.stars, 0);
  return baseDefense + synergyStars;
};

export const getMaxSynergyCardsForAttack = (controlState: ControlState): number => {
  switch (controlState) {
    case 'attack': return 3;
    case 'normal': return 2;
    case 'defense': return 1;
  }
};

export const resolveShot = (
  attackPower: number,
  defensePower: number
): ShotResult => {
  const total = attackPower;
  
  if (total === 11) return 'magicNumber';
  if (total > 11) return 'missed';
  if (total > defensePower) return 'goal';
  return 'saved';
};

export const resolvePenaltyKick = (
  state: GameState,
  playerPoints: number,
  aiPoints: number,
  isPlayerKicker: boolean
): GameState => {
  const newState = { ...state };
  
  const success = isPlayerKicker ? (playerPoints > aiPoints) : (aiPoints > playerPoints);
  
  if (success) {
    if (isPlayerKicker) {
      newState.playerScore += 1;
      newState.message = `⚽ Goal! Penalty scored (${playerPoints} vs ${aiPoints})`;
    } else {
      newState.aiScore += 1;
      newState.message = `😢 Opponent scored penalty (${aiPoints} vs ${playerPoints})`;
    }
  } else {
    newState.message = isPlayerKicker 
      ? `❌ Penalty missed! (${playerPoints} vs ${aiPoints})`
      : `🛡️ Penalty saved! (${aiPoints} vs ${playerPoints})`;
  }
  
  newState.pendingPenalty = false;
  return newState;
};

export const placeCard = (
  state: GameState,
  card: PlayerCard,
  zone: number,
  startCol: number,
  isPlayer: boolean
): GameState => {
  let newState = { ...state };
  const field = isPlayer ? [...newState.playerField] : [...newState.aiField];
  const hand = isPlayer ? [...newState.playerHand] : [...newState.aiHand];
  
  const targetZone = field.find(z => z.zone === zone);
  if (!targetZone) return newState;
  
  // Place card in two slots (startCol and startCol+1)
  const slot1 = targetZone.slots.find(s => s.position === startCol);
  const slot2 = targetZone.slots.find(s => s.position === startCol + 1);
  
  if (slot1 && slot2 && !slot1.playerCard && !slot2.playerCard) {
    slot1.playerCard = card;
    slot2.playerCard = card; // Same card in both slots
    
    newState.playerField = isPlayer ? field : newState.playerField;
    newState.aiField = isPlayer ? newState.aiField : field;
    
    const newHand = hand.filter(c => c.id !== card.id);
    if (isPlayer) {
      newState.playerHand = newHand;
    } else {
      newState.aiHand = newHand;
    }
    
    newState.message = `Placed ${card.name} at ${zone} Zone Column${startCol}`;
  }
  
  return newState;
};

export const performShot = (
  state: GameState,
  attacker: PlayerCard,
  attackerZone: number,
  attackerSlot: number,
  attackSynergy: SynergyCard[],
  isPlayer: boolean,
  ignoreBaseDefense: boolean = false
): GameState => {
  const newState = { ...state };
  const opponentField = isPlayer ? newState.aiField : newState.playerField;
  const defenderZone = opponentField.find(z => z.zone === attackerZone);
  const defenderSlot = defenderZone?.slots.find(s => s.position === attackerSlot);
  const defender = defenderSlot?.playerCard || null;
  
  const defenseSynergy: SynergyCard[] = [];
  
  if (newState.synergyDeck.length > 0) {
    const firstCard = newState.synergyDeck[0];
    if (firstCard) {
      defenseSynergy.push(firstCard);
      newState.synergyDeck = newState.synergyDeck.slice(1);
    }
  }
  
  const defenseHand = isPlayer ? [...newState.aiSynergyHand] : [...newState.playerSynergyHand];
  if (defenseHand.length > 0 && defenseSynergy.length < 2) {
    const card = defenseHand[0];
    if (card) {
      defenseSynergy.push(card);
    }
  }
  
  const hasTackleCard = defenseSynergy.some(c => c.type === 'tackle');
  
  const attackerBreakthroughIcons = attacker.icons.filter(i => i === 'breakthrough').length;
  const hasBreakthroughAll = attacker.icons.includes('breakthroughAll');
  
  // 获取当前卡牌已使用的射门标记数 (在累加之前)
  const attackerFieldZone = isPlayer 
    ? newState.playerField.find(z => z.zone === attackerZone)
    : newState.aiField.find(z => z.zone === attackerZone);
  const currentShotMarkers = attackerFieldZone?.slots.find(s => s.position === attackerSlot)?.shotMarkers || 0;
  
  const attackPower = calculateAttackPower(
    attacker, 
    attackSynergy, 
    isPlayer ? newState.playerField : newState.aiField,
    currentShotMarkers
  );
  
  const attackerFieldSlot = attackerFieldZone?.slots.find(s => s.position === attackerSlot);
  
  // Rule Check: If attack power > 11 (Out of bounds), Tackle does not work
  if (hasTackleCard && attackPower <= 11) {
    const usedAttackIds = attackSynergy.map(c => c.id);
    const usedDefenseIds = defenseSynergy.map(c => c.id);
    
    if (isPlayer) {
      newState.playerSynergyHand = newState.playerSynergyHand.filter(c => !usedAttackIds.includes(c.id));
      newState.aiSynergyHand = newState.aiSynergyHand.filter(c => !usedDefenseIds.includes(c.id));
    } else {
      newState.aiSynergyHand = newState.aiSynergyHand.filter(c => !usedAttackIds.includes(c.id));
      newState.playerSynergyHand = newState.playerSynergyHand.filter(c => !usedDefenseIds.includes(c.id));
    }
    
    newState.synergyDiscard = [...newState.synergyDiscard, ...attackSynergy, ...defenseSynergy];
    
    newState.message = '🟡 Tackle! Attack cancelled, won penalty！';
    newState.pendingShot = null;
    newState.pendingPenalty = true;
    
    return newState;
  }

  const defensePower = hasBreakthroughAll ? 0 : calculateDefensePower(defender, defenseSynergy, opponentField, ignoreBaseDefense, attackerBreakthroughIcons);
  const result = resolveShot(attackPower, defensePower);
  
  // Track activated skills for visual feedback
  const attackerSkills: string[] = [];
  if (attacker.icons.includes('attack')) attackerSkills.push('Shot');
  if (attacker.icons.includes('breakthrough')) attackerSkills.push('Breakthrough');
  if (hasBreakthroughAll) attackerSkills.push('Ignore All Defense');
  if (ignoreBaseDefense) attackerSkills.push('Instant Shot');
  if (currentShotMarkers > 0) attackerSkills.push('Fatigue');

  const defenderSkills: string[] = [];
  if (defender) {
    if (defender.icons.includes('defense')) defenderSkills.push('Defend');
    if (hasTackleCard) defenderSkills.push('Tackle');
  }

  const shotAttempt: ShotAttempt = {
    attacker,
    defender,
    attackSynergy,
    defenseSynergy,
    attackPower,
    defensePower,
    result,
    activatedSkills: {
      attackerSkills,
      defenderSkills
    },
    attackerUsedShotIcons: attackerFieldSlot?.usedShotIcons || [],
    attackerZone,
    attackerSlot
  };
  
  if (result === 'goal' || result === 'magicNumber') {
    if (isPlayer) {
      newState.playerScore += 1;
    } else {
      newState.aiScore += 1;
    }
  }
  
  // 累加射门标记 (本次射门后 +1)
  if (attackerFieldSlot && attackerFieldSlot.playerCard) {
    attackerFieldSlot.shotMarkers += 1;
    // 注意：射门图标的选择现在需要在射门动作之前由玩家/AI手动选择
  }
  
  const usedAttackIds = attackSynergy.map(c => c.id);
  const usedDefenseIds = defenseSynergy.map(c => c.id);
  
  if (isPlayer) {
    newState.playerSynergyHand = newState.playerSynergyHand.filter(c => !usedAttackIds.includes(c.id));
    newState.aiSynergyHand = newState.aiSynergyHand.filter(c => !usedDefenseIds.includes(c.id));
    newState.playerActiveSynergy = attackSynergy;
    newState.aiActiveSynergy = defenseSynergy;
  } else {
    newState.aiSynergyHand = newState.aiSynergyHand.filter(c => !usedAttackIds.includes(c.id));
    newState.playerSynergyHand = newState.playerSynergyHand.filter(c => !usedDefenseIds.includes(c.id));
    newState.aiActiveSynergy = attackSynergy;
    newState.playerActiveSynergy = defenseSynergy;
  }
  
  // Do not discard yet, wait for END_TURN
  // newState.synergyDiscard = [...newState.synergyDiscard, ...attackSynergy, ...defenseSynergy];
  
  let resultMessage = '';
  switch (result) {
    case 'goal':
      resultMessage = `🎉 Goal! Attack:${attackPower} vs Defense:${defensePower}`;
      break;
    case 'magicNumber':
      resultMessage = `✨ Magic Number! Perfect Goal! Attack:${attackPower}`;
      break;
    case 'saved':
      resultMessage = `🛡️ Defended! Attack:${attackPower} vs Defense:${defensePower}`;
      break;
    case 'missed':
      resultMessage = `❌ Out of bounds! Attack:${attackPower} over 11`;
      break;
  }
  
  newState.message = resultMessage;
  newState.pendingShot = shotAttempt;
  newState.duelPhase = 'init';
  
  return newState;
};

export const checkHalfEnd = (state: GameState): GameState => {
  if (state.synergyDeck.length === 0 && state.synergyDiscard.length > 0) {
    const newDeck = [...state.synergyDiscard].sort(() => Math.random() - 0.5);
    return {
      ...state,
      synergyDeck: newDeck,
      synergyDiscard: [],
      isStoppageTime: true,
      message: 'Synergy deck exhausted! Entering stoppage time!',
    };
  }
  return state;
};

export const startHalfTime = (state: GameState): GameState => {
  return {
    ...state,
    phase: 'halfTime',
    turnPhase: 'end',
    message: 'First Half End! Half-time, make substitutions',
  };
};

export const startSecondHalf = (state: GameState): GameState => {
  const shuffledSynergy = [...state.synergyDeck, ...state.synergyDiscard, ...state.playerSynergyHand, ...state.aiSynergyHand]
    .sort(() => Math.random() - 0.5);
  
  return {
    ...state,
    phase: 'secondHalf',
    turnPhase: 'teamAction',
    currentTurn: 'ai',
    aiActionStep: 'teamAction',
    controlPosition: 5,
    playerField: state.playerField.map(z => ({ ...z, slots: z.slots.map(s => ({ ...s, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) })),
    aiField: state.aiField.map(z => ({ ...z, slots: z.slots.map(s => ({ ...s, playerCard: null, shotMarkers: 0, usedShotIcons: [] })) })),
    playerSynergyHand: state.playerSynergyHand,
    aiSynergyHand: state.aiSynergyHand,
    synergyDeck: shuffledSynergy,
    synergyDiscard: [],
    isFirstTurn: true,
    isStoppageTime: false,
    message: 'Second Half Start! AI first',
  };
};

export const endGame = (state: GameState): GameState => {
  if (state.playerScore === state.aiScore) {
    // 比分相同，进入点球大战
    return {
      ...state,
      phase: 'penalty' as GamePhase,
      turnPhase: 'end',
      message: 'Score is tied! Penalty shootout begins!',
    };
  }
  
  return {
    ...state,
    phase: 'finished',
    turnPhase: 'end',
    message: state.playerScore > state.aiScore 
      ? '🎉 Congratulations! You win！' 
      : '😢 You lose',
  };
};

export const selectShotIcon = (
  state: GameState,
  isPlayer: boolean,
  zone: number,
  slot: number,
  iconIndex: number
): GameState => {
  const newState = { ...state };
  const field = isPlayer ? newState.playerField : newState.aiField;
  const targetZone = field.find(z => z.zone === zone);
  const targetSlot = targetZone?.slots.find(s => s.position === slot);
  
  if (targetSlot && !targetSlot.usedShotIcons.includes(iconIndex)) {
    targetSlot.usedShotIcons = [...targetSlot.usedShotIcons, iconIndex];
    newState.message = `Selected shot icon ${iconIndex + 1} for ${targetSlot.playerCard?.name || 'player'}`;
    newState.matchLogs = addLog(newState, `Shot icon ${iconIndex + 1} selected for ${isPlayer ? 'player' : 'AI'} at zone ${zone} slot ${slot}`);
  }
  
  return isPlayer ? { ...newState, playerField: field } : { ...newState, aiField: field };
};

export const performAITurn = (state: GameState): GameState => {
  let newState = { ...state };
  
  // Phase 1: Team Action (Pass/Press)
  if (newState.aiActionStep === 'teamAction') {
    const passCount = countIcons(newState.aiField, 'pass');
    const pressCount = countIcons(newState.aiField, 'press');
    const hasPlayers = newState.aiField.some(z => z.slots.some(s => s.playerCard));
    
    if (newState.isFirstTurn && !hasPlayers) {
      newState.message = 'AI skipped team actions for one turn';
    } else if (passCount > 0 && newState.aiSynergyHand.length < 5) {
      newState = performTeamAction(newState, 'pass');
    } else if (pressCount > 0) {
      newState = performTeamAction(newState, 'press');
    }
    
    newState.aiActionStep = 'placeCard';
    newState.turnPhase = 'playerAction'; // Ensure we are in player action phase for placement
    return newState;
  }
  
  // Phase 2: Place Player Card
  if (newState.aiActionStep === 'placeCard') {
    const availablePlacements: { card: PlayerCard; zone: number; startCol: number }[] = [];
    
    newState.aiHand.forEach(card => {
      newState.aiField.forEach(z => {
        for (let col = 0; col <= 6; col++) {
          if (canPlaceCardAtSlot(card, newState.aiField, z.zone, col, newState.isFirstTurn)) {
            availablePlacements.push({ card, zone: z.zone, startCol: col });
          }
        }
      });
    });
    
    if (availablePlacements.length > 0 && Math.random() > 0.3) {
      const placement = availablePlacements[Math.floor(Math.random() * availablePlacements.length)]!;
      newState = placeCard(newState, placement.card, placement.zone, placement.startCol, false);
      
      // After placing, decide if this card or another card should shoot
      newState.aiActionStep = 'shot';
    } else {
      // No placement possible or decided not to place, move to shot anyway (existing cards might shoot)
      newState.aiActionStep = 'shot';
    }
    return newState;
  }
  
  // Phase 3: Shot Action
  if (newState.aiActionStep === 'shot') {
    // Find potential attackers (including newly placed one)
    const attackers: { zone: number; slot: number; card: PlayerCard }[] = [];
    newState.aiField.forEach(z => {
      z.slots.forEach(s => {
        if (s.playerCard && s.playerCard.icons.includes('attack')) {
          attackers.push({ zone: z.zone, slot: s.position, card: s.playerCard });
        }
      });
    });

    if (attackers.length > 0) {
      // Logic for choosing attacker: priority to those with special effects or just random
      const attacker = attackers[Math.floor(Math.random() * attackers.length)]!;
      
      let shouldShoot = false;
      let ignoreBaseDefense = false;
      
      if (attacker.card.immediateEffect === 'instant_shot') {
        shouldShoot = true;
        ignoreBaseDefense = true;
        newState.message = 'AI uses Instant Shot effect!';
      } else if (Math.random() > 0.4) { // 60% chance to shoot if available
        shouldShoot = true;
      }

      if (shouldShoot) {
        const controlState = getControlState(newState.controlPosition);
        const maxSynergy = getMaxSynergyCardsForAttack(controlState);
        const aiSynergy: SynergyCard[] = [];
        
        if (newState.synergyDeck.length > 0) {
          const firstCard = newState.synergyDeck[0];
          if (firstCard) {
            aiSynergy.push(firstCard);
            newState.synergyDeck = newState.synergyDeck.slice(1);
          }
        }
        
        const remainingSlots = maxSynergy - aiSynergy.length;
        if (remainingSlots > 0) {
          const fromHand = newState.aiSynergyHand.slice(0, remainingSlots);
          aiSynergy.push(...fromHand);
        }
        
        newState = performShot(newState, attacker.card, attacker.zone, attacker.slot, aiSynergy, false, ignoreBaseDefense);
      }
    }
    
    newState.aiActionStep = 'endTurn';
    newState = checkHalfEnd(newState);
    return newState;
  }
  
  // Phase 4: End Turn
  if (newState.aiActionStep === 'endTurn') {
    newState.turnPhase = 'end';
    newState.isFirstTurn = false;
    newState.turnCount += 1;
    
    if (newState.turnCount >= 10 && newState.phase === 'firstHalf') {
      newState = startHalfTime(newState);
    } else if (newState.turnCount >= 20 && newState.phase === 'secondHalf') {
      newState = endGame(newState);
    } else {
      newState.message += ' - Turn ending...';
    }
    
    newState.aiActionStep = 'none';
    return newState;
  }
  
  return newState;
};

export const substitutePlayer = (
  state: GameState,
  outgoingCardId: string,
  incomingCardId: string,
  isPlayer: boolean
): GameState => {
  const newState = { ...state };
  const field = isPlayer ? [...newState.playerField] : [...newState.aiField];
  const bench = isPlayer ? [...newState.playerBench] : [...newState.aiBench];
  const hand = isPlayer ? [...newState.playerHand] : [...newState.aiHand];
  
  const incomingCard = bench.find(c => c.id === incomingCardId);
  if (!incomingCard) return state;
  
  let replaced = false;
  // Try to replace on field
  for (const zone of field) {
    const slotIndex = zone.slots.findIndex(s => s.playerCard?.id === outgoingCardId);
    if (slotIndex >= 0) {
      const slot = zone.slots[slotIndex];
      if (slot) {
        zone.slots[slotIndex] = {
          position: slot.position,
          playerCard: incomingCard,
          shotMarkers: 0,
          usedShotIcons: [] // Reset used shot icons when substituting
        };
      }
      replaced = true;
      break;
    }
  }
  
  // Try to replace in hand if not found on field
  if (!replaced) {
    const handIndex = hand.findIndex(c => c.id === outgoingCardId);
    if (handIndex >= 0) {
      hand[handIndex] = incomingCard;
      replaced = true;
    }
  }

  if (!replaced) return state;
  
  const newBench = bench.filter(c => c.id !== incomingCardId);
  if (isPlayer) {
    newState.playerField = field;
    newState.playerHand = hand;
    newState.playerBench = newBench;
    newState.playerSubstitutionsLeft -= 1;
  } else {
    newState.aiField = field;
    newState.aiHand = hand;
    newState.aiBench = newBench;
    newState.aiSubstitutionsLeft -= 1;
  }
  
  newState.message = `Substitution complete: ${incomingCard.name} in`;
  return newState;
};





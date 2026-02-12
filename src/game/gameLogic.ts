import type { PlayerCard, SynergyCard } from '../data/cards';
import type { FieldZone, ShotAttempt, DuelPhase } from '../types/game';
import type { PlayerActionType, GamePhase, TurnPhase } from '../types/game';
import { calculateAttackPower, calculateDefensePower, getControlState, getMaxSynergyCardsForAttack, countIcons } from '../utils/gameUtils';
import { resolveShot } from '../utils/shotResolution';
import { performCoinToss } from '../utils/coinToss';
import { startDraftRound, pickDraftCard } from '../utils/draft';
import { performTeamAction } from '../utils/teamActions';
import { placeCard } from '../utils/cardPlacement';
import { performShot } from '../utils/shotActions';
import { useSynergy } from '../utils/synergyActions';
import { performSubstitution } from '../utils/substitution';
import { performImmediateEffect } from '../utils/immediateEffects';
import { performPenalty } from '../utils/penalty';
import { performEndTurn } from '../utils/endTurn';
import { aiTurn } from '../utils/ai';

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
  matchLogs: MatchLogEntry[];
  // Player state tracking for used shot icons
  playerUsedShotIcons: { [cardId: string]: number[] };
  aiUsedShotIcons: { [cardId: string]: number[] };
  defenderSynergySelection: boolean;
  defenderAvailableSynergyCards: SynergyCard[];
  defenderSelectedSynergyCards: SynergyCard[];
}

export interface MatchLogEntry {
  id: string;
  timestamp: Date;
  type: 'duel' | 'system' | 'action' | 'skill' | 'synergy' | 'result';
  phase?: string;
  step?: string;
  attacker?: string;
  defender?: string;
  attackPower?: number;
  defensePower?: number;
  synergyCards?: number;
  skills?: string[];
  result?: 'goal' | 'save' | 'miss';
  message: string;
}

export const createInitialState = (
  playerStarters: PlayerCard[] = [], 
  playerSubstitutes: PlayerCard[] = [],
  initialPlayerField: FieldZone[] | null = null
): GameState => {
  const initialState: GameState = {
    phase: 'draft',
    turnPhase: 'teamAction',
    currentTurn: 'player',
    controlPosition: 50,
    playerScore: 0,
    aiScore: 0,
    playerSubstitutionsLeft: 3,
    aiSubstitutionsLeft: 3,
    playerHand: [],
    playerBench: [],
    playerSynergyHand: [],
    playerField: initialPlayerField || [
      { zone: 0, cards: [], synergyCards: [], slots: [] },
      { zone: 1, cards: [], synergyCards: [], slots: [] },
      { zone: 2, cards: [], synergyCards: [], slots: [] },
      { zone: 3, cards: [], synergyCards: [], slots: [] }
    ],
    aiField: [
      { zone: 0, cards: [], synergyCards: [], slots: [] },
      { zone: 1, cards: [], synergyCards: [], slots: [] },
      { zone: 2, cards: [], synergyCards: [], slots: [] },
      { zone: 3, cards: [], synergyCards: [], slots: [] }
    ],
    aiHand: [],
    aiBench: [],
    aiSynergyHand: [],
    synergyDeck: [],
    synergyDiscard: [],
    selectedCard: null,
    isHomeTeam: true,
    selectedSynergyCards: [],
    currentAction: 'none',
    message: 'Draft your squad',
    turnCount: 0,
    isFirstTurn: true,
    isStoppageTime: false,
    pendingShot: null,
    draftRound: 1,
    draftStep: 0,
    availableDraftCards: [],
    starCardDeck: [],
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
    matchLogs: [],
    playerUsedShotIcons: {},
    aiUsedShotIcons: {},
    defenderSynergySelection: false,
    defenderAvailableSynergyCards: [],
    defenderSelectedSynergyCards: []
  };

  return initialState;
};

export type GameAction = 
  | { type: 'COIN_TOSS'; isHomeTeam: boolean }
  | { type: 'START_DRAFT_ROUND' }
  | { type: 'PICK_DRAFT_CARD'; cardIndex: number }
  | { type: 'AI_DRAFT_PICK' }
  | { type: 'FINISH_SQUAD_SELECT'; starters: PlayerCard[]; subs: PlayerCard[] }
  | { type: 'TEAM_ACTION'; action: 'pass' | 'press' }
  | { type: 'PLACE_CARD'; card: PlayerCard; zone: number; slot: number }
  | { type: 'USE_SYNERGY'; synergyCard: SynergyCard; targetCard: PlayerCard }
  | { type: 'PERFORM_SHOT'; card: PlayerCard; slot: number; zone: number }
  | { type: 'PERFORM_SUBSTITUTION'; incomingCard: PlayerCard; outgoingCard: PlayerCard; zone: number; slot: number }
  | { type: 'PERFORM_IMMEDIATE_EFFECT'; card: PlayerCard; zone: number; slot: number }
  | { type: 'CANCEL_INSTANT_SHOT' }
  | { type: 'CANCEL_IMMEDIATE_EFFECT' }
  | { type: 'PERFORM_PENALTY'; zone: number; slot: number }
  | { type: 'END_TURN' }
  | { type: 'AI_TURN' }
  | { type: 'SET_DEALING'; isDealing: boolean }
  | { type: 'ADVANCE_DUEL' }
  | { type: 'FINISH_SETUP' }
  | { type: 'SELECT_PLAYER_CARD'; card: PlayerCard | null }
  | { type: 'SYNERGY_CHOICE_SELECT'; index: number }
  | { type: 'CANCEL_SUBSTITUTION' }
  | { type: 'START_SECOND_HALF' }
  | { type: 'TRIGGER_EFFECT' }
  | { type: 'SKIP_EFFECT' }
  | { type: 'SUBSTITUTE'; outgoingCardId: string; incomingCardId: string }
  | { type: 'SELECT_SHOT_ICON'; iconIndex: number }
  | { type: 'START_DEFENDER_SYNERGY_SELECTION' }
  | { type: 'SELECT_DEFENDER_SYNERGY_CARD'; cardIndex: number }
  | { type: 'CONFIRM_DEFENDER_SYNERGY' }
  | { type: 'AI_DEFENDER_SYNERGY_PICK' };

const addLog = (state: GameState, entry: Omit<MatchLogEntry, 'id' | 'timestamp'>): MatchLogEntry[] => {
  const newEntry: MatchLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...entry
  };
  
  const newLogs = [...state.matchLogs, newEntry];
  if (newLogs.length > 50) newLogs.shift(); // Keep last 50 logs
  return newLogs;
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'ADVANCE_DUEL': {
      if (state.duelPhase === 'none') return state;
      const phases: DuelPhase[] = ['init', 'select_shot_icon', 'reveal_attacker', 'reveal_defender', 'defender_synergy_selection', 'reveal_synergy', 'reveal_skills', 'summary', 'result'];
      const currentIndex = phases.indexOf(state.duelPhase);
      const nextPhase = phases[currentIndex + 1] || 'none';
      
      let newState = { ...state, duelPhase: nextPhase };
      
      // Log duel steps with detailed information
      if (state.pendingShot) {
        const { attacker, defender, attackPower, defensePower, result } = state.pendingShot;
        switch (nextPhase) {
          case 'reveal_attacker':
            newState.matchLogs = addLog(newState, {
              type: 'duel',
              phase: 'Duel',
              step: 'Reveal Attacker',
              attacker: attacker.name,
              message: `Attacker revealed: ${attacker.name}`
            });
            break;
          case 'reveal_defender':
            newState.matchLogs = addLog(newState, {
              type: 'duel',
              phase: 'Duel',
              step: 'Reveal Defender',
              defender: defender?.name || 'Empty',
              message: `Defender revealed: ${defender?.name || 'Empty'}`
            });
            break;
          case 'defender_synergy_selection':
            newState.matchLogs = addLog(newState, {
              type: 'action',
              phase: 'Duel',
              step: 'Defender Synergy Selection',
              message: 'Defender is selecting synergy cards to counter the attack'
            });
            break;
          case 'reveal_synergy':
            newState.matchLogs = addLog(newState, {
              type: 'synergy',
              phase: 'Duel',
              step: 'Reveal Synergy',
              synergyCards: state.playerActiveSynergy.length + state.aiActiveSynergy.length,
              message: 'Synergy cards revealed and effects calculated'
            });
            break;
          case 'reveal_skills':
            newState.matchLogs = addLog(newState, {
              type: 'skill',
              phase: 'Duel',
              step: 'Reveal Skills',
              skills: [...(attacker.activatedSkills || []), ...(defender?.activatedSkills || [])],
              message: 'Player skills activated and effects applied'
            });
            break;
          case 'summary':
            newState.matchLogs = addLog(newState, {
              type: 'duel',
              phase: 'Duel',
              step: 'Final Summary',
              attackPower,
              defensePower,
              message: `Final power comparison: ${attackPower} (Attack) vs ${defensePower} (Defense)`
            });
            break;
          case 'result':
            newState.matchLogs = addLog(newState, {
              type: 'result',
              phase: 'Duel',
              step: 'Final Result',
              result: result === 'goal' ? 'goal' : result === 'save' ? 'save' : 'miss',
              message: `Duel outcome: ${result === 'goal' ? 'GOAL!' : result === 'save' ? 'Shot saved!' : 'Shot missed!'}`
            });
            break;
        }
      }
      
      if (nextPhase === 'none') {
        newState.pendingShot = null;
      }
      
      return newState;
    }
    
    case 'CANCEL_INSTANT_SHOT':
      return { ...state, instantShotMode: null, message: 'Instant shot cancelled' };
    
    case 'CANCEL_IMMEDIATE_EFFECT':
      return { ...state, pendingImmediateEffect: null, message: 'Immediate effect cancelled' };

    case 'COIN_TOSS': {
      let newState = performCoinToss(state, action.isHomeTeam);
      newState.matchLogs = addLog(newState, {
        type: 'system',
        message: `Coin toss: Player is ${action.isHomeTeam ? 'Home' : 'Away'}`
      });
      return newState;
    }
    
    case 'START_DRAFT_ROUND': {
      let newState = startDraftRound(state);
      newState.matchLogs = addLog(newState, {
        type: 'system',
        message: `Draft Round ${newState.draftRound} started`
      });
      return newState;
    }
    
    case 'PICK_DRAFT_CARD': {
      const card = state.availableDraftCards[action.cardIndex];
      let newState = pickDraftCard(state, action.cardIndex, true);
      if (card) {
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `Player picked: ${card.name}`
        });
      }
      return newState;
    }
    
    case 'FINISH_SQUAD_SELECT': {
      let newState = { 
        ...state, 
        phase: 'match', 
        turnCount: 1, 
        isFirstTurn: true,
        playerHand: action.starters,
        playerBench: action.subs
      };
      newState.message = newState.isHomeTeam ? 'Your turn! Place a card.' : 'AI is thinking...';
      // If AI starts, set aiActionStep to trigger AI actions
      if (!newState.isHomeTeam) {
        newState.aiActionStep = 'teamAction';
      }
      newState.matchLogs = addLog(newState, {
        type: 'system',
        message: 'Match started!'
      });
      return newState;
    }
    
    case 'TEAM_ACTION':
      if (state.turnPhase !== 'teamAction') return state;
      {
        let newState = performTeamAction(state, action.action);
        const actor = state.currentTurn === 'player' ? 'You' : 'AI';
        const actionName = action.action === 'pass' ? 'Pass' : 'Press';
        newState.turnPhase = 'playerAction';
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `${actor} executed ${actionName}`
        });
        return newState;
      }
    
    case 'PLACE_CARD': {
      if (state.turnPhase !== 'playerAction' || state.currentAction) return state;
      const slotPosition = Math.floor(action.slot / 2) + 1;
      let newState = placeCard(state, action.card, action.zone, action.slot, true);
      const actor = state.currentTurn === 'player' ? 'You' : 'AI';
      newState.currentAction = 'organizeAttack';
      newState.matchLogs = addLog(newState, {
        type: 'action',
        message: `${actor} placed ${action.card.name} at line ${action.zone}`
      });

      if (action.card.immediateEffect !== 'none') {
        newState.pendingImmediateEffect = { card: action.card, zone: action.zone, slot: slotPosition };
        newState.message = `Triggering ${action.card.name}'s effect...`;
      } else {
        newState.message = 'Organize your attack or end turn';
      }
      
      return newState;
    }
    
    case 'USE_SYNERGY': {
      if (state.turnPhase !== 'playerAction') return state;
      let newState = useSynergy(state, action.synergyCard, action.targetCard);
      if (newState.selectedSynergyCards.length > 0) {
        newState.matchLogs = addLog(newState, {
          type: 'synergy',
          message: `Synergy card used: ${action.synergyCard.name} on ${action.targetCard.name}`
        });
      }
      return newState;
    }
    
    case 'PERFORM_SHOT': {
      if (state.turnPhase !== 'playerAction') return state;
      if (!action.card) return state;
      
      let newState = performShot(state, action.card, action.slot, action.zone);
      
      if (newState.pendingShot) {
        const usedIconCount = newState.pendingShot.attacker.usedShotIcons.length;
        const iconText = usedIconCount === 1 ? 'icon' : 'icons';
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `${state.currentTurn === 'player' ? 'You' : 'AI'} attempted a shot with ${action.card.name} (Used ${usedIconCount} shot ${iconText})`
        });
      }
      
      return newState;
    }
    
    case 'PERFORM_SUBSTITUTION': {
      if (state.turnPhase !== 'playerAction') return state;
      let newState = performSubstitution(state, action.incomingCard, action.outgoingCard, action.zone, action.slot);
      newState.matchLogs = addLog(newState, {
        type: 'action',
        message: `Substitution: ${action.incomingCard.name} replaced ${action.outgoingCard.name}`
      });
      return newState;
    }
    
    case 'PERFORM_IMMEDIATE_EFFECT': {
      if (state.turnPhase !== 'playerAction') return state;
      let newState = performImmediateEffect(state, action.card, action.zone, action.slot);
      newState.matchLogs = addLog(newState, {
        type: 'skill',
        message: `Immediate effect triggered: ${action.card.name}`
      });
      return newState;
    }
    
    case 'PERFORM_PENALTY': {
      if (state.turnPhase !== 'playerAction') return state;
      let newState = performPenalty(state, action.zone, action.slot);
      newState.matchLogs = addLog(newState, {
        type: 'action',
        message: 'Penalty kick attempted'
      });
      return newState;
    }
    
    case 'END_TURN': {
      let newState = performEndTurn(state);
      newState.matchLogs = addLog(newState, {
        type: 'system',
        message: `${state.currentTurn === 'player' ? 'Player' : 'AI'} turn ended`
      });
      return newState;
    }
    
    case 'AI_TURN': {
      let newState = aiTurn(state);
      return newState;
    }
    
    case 'SET_DEALING':
      return { ...state, isDealing: action.isDealing };
    
    case 'FINISH_SETUP':
      return { 
        ...state, 
        phase: 'match', 
        turnCount: 1, 
        isFirstTurn: true,
        matchLogs: addLog(state, {
          type: 'system',
          message: 'Setup complete - Match ready to begin'
        })
      };
    
    case 'AI_DRAFT_PICK': {
      const randomIndex = Math.floor(Math.random() * state.availableDraftCards.length);
      const card = state.availableDraftCards[randomIndex];
      let newState = pickDraftCard(state, randomIndex, false);
      if (card) {
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `AI picked: ${card.name}`
        });
      }
      return newState;
    }
    
    case 'SELECT_PLAYER_CARD':
      return { ...state, selectedCard: action.card };
    
    case 'SYNERGY_CHOICE_SELECT': {
      const selectedCard = state.synergyChoice?.cards[action.index];
      if (selectedCard && state.synergyChoice) {
        let newState = { ...state };
        newState.playerSynergyHand = [...newState.playerSynergyHand, selectedCard];
        newState.synergyChoice = null;
        newState.message = `Selected synergy card: ${selectedCard.name}`;
        return newState;
      }
      return state;
    }
    
    case 'CANCEL_SUBSTITUTION':
      return { ...state, substitutionMode: null, message: 'Substitution cancelled' };
    
    case 'START_SECOND_HALF':
      return { ...state, phase: 'secondHalf', turnCount: 1, isFirstTurn: true, message: 'Second half started!' };
    
    case 'TRIGGER_EFFECT': {
      if (!state.pendingImmediateEffect) return state;
      let newState = performImmediateEffect(state, state.pendingImmediateEffect.card, state.pendingImmediateEffect.zone, state.pendingImmediateEffect.slot);
      newState.matchLogs = addLog(newState, {
        type: 'skill',
        message: `Immediate effect triggered: ${state.pendingImmediateEffect.card.name}`
      });
      return newState;
    }
    
    case 'SKIP_EFFECT':
      return { ...state, pendingImmediateEffect: null, message: 'Immediate effect skipped' };
    
    case 'SUBSTITUTE': {
      const outgoingCard = state.playerHand.find(c => c.id === action.outgoingCardId) || state.playerBench.find(c => c.id === action.outgoingCardId);
      const incomingCard = state.playerBench.find(c => c.id === action.incomingCardId);
      if (outgoingCard && incomingCard) {
        let newState = { ...state };
        if (state.playerHand.some(c => c.id === action.outgoingCardId)) {
          newState.playerHand = state.playerHand.map(c => c.id === action.outgoingCardId ? incomingCard : c);
        } else {
          newState.playerBench = state.playerBench.map(c => c.id === action.outgoingCardId ? incomingCard : c);
        }
        newState.playerBench = newState.playerBench.filter(c => c.id !== action.incomingCardId);
        newState.playerBench.push(outgoingCard);
        newState.playerSubstitutionsLeft -= 1;
        newState.substitutionMode = null;
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `Substitution: ${outgoingCard.name} → ${incomingCard.name}`
        });
        return newState;
      }
      return state;
    }
    
    case 'SELECT_SHOT_ICON':
      return { ...state, selectedShotIcon: action.iconIndex };
    
    case 'START_DEFENDER_SYNERGY_SELECTION': {
      if (!state.pendingShot) return state;
      
      const isPlayerDefending = state.currentTurn === 'ai';
      const defenderHand = isPlayerDefending ? state.playerSynergyHand : state.aiSynergyHand;
      
      let availableCards: SynergyCard[] = [];
      
      if (defenderHand.length > 0) {
        availableCards = [...defenderHand];
      } else {
        if (state.synergyDeck.length > 0) {
          const drawnCard = state.synergyDeck[0];
          availableCards = [drawnCard];
        }
      }
      
      return {
        ...state,
        defenderSynergySelection: true,
        defenderAvailableSynergyCards: availableCards,
        defenderSelectedSynergyCards: [],
        message: isPlayerDefending ? 'Select synergy cards to defend' : 'AI is selecting defense synergy cards...'
      };
    }
    
    case 'SELECT_DEFENDER_SYNERGY_CARD': {
      if (!state.defenderSynergySelection) return state;
      
      const card = state.defenderAvailableSynergyCards[action.cardIndex];
      if (!card) return state;
      
      const isAlreadySelected = state.defenderSelectedSynergyCards.some(c => c.id === card.id);
      let newSelectedCards: SynergyCard[];
      
      if (isAlreadySelected) {
        newSelectedCards = state.defenderSelectedSynergyCards.filter(c => c.id !== card.id);
      } else {
        if (state.defenderSelectedSynergyCards.length >= 2) {
          return state;
        }
        newSelectedCards = [...state.defenderSelectedSynergyCards, card];
      }
      
      return {
        ...state,
        defenderSelectedSynergyCards: newSelectedCards
      };
    }
    
    case 'CONFIRM_DEFENDER_SYNERGY': {
      if (!state.defenderSynergySelection) return state;
      
      const isPlayerDefending = state.currentTurn === 'ai';
      const defenderHand = isPlayerDefending ? state.playerSynergyHand : state.aiSynergyHand;
      
      let newDefenderHand = [...defenderHand];
      let newSynergyDeck = [...state.synergyDeck];
      let newSynergyDiscard = [...state.synergyDiscard];
      
      state.defenderSelectedSynergyCards.forEach(card => {
        const handIndex = newDefenderHand.findIndex(c => c.id === card.id);
        if (handIndex >= 0) {
          newDefenderHand.splice(handIndex, 1);
        } else {
          const deckIndex = newSynergyDeck.findIndex(c => c.id === card.id);
          if (deckIndex >= 0) {
            newSynergyDeck.splice(deckIndex, 1);
          }
        }
        newSynergyDiscard.push(card);
      });
      
      const isPlayerAttacking = state.currentTurn === 'player';
      const newAiActiveSynergy = isPlayerAttacking ? state.defenderSelectedSynergyCards : state.aiActiveSynergy;
      const newPlayerActiveSynergy = isPlayerAttacking ? state.playerActiveSynergy : state.defenderSelectedSynergyCards;
      
      return {
        ...state,
        defenderSynergySelection: false,
        defenderAvailableSynergyCards: [],
        defenderSelectedSynergyCards: [],
        playerSynergyHand: isPlayerDefending ? newDefenderHand : state.playerSynergyHand,
        aiSynergyHand: isPlayerDefending ? state.aiSynergyHand : newDefenderHand,
        synergyDeck: newSynergyDeck,
        synergyDiscard: newSynergyDiscard,
        playerActiveSynergy: newPlayerActiveSynergy,
        aiActiveSynergy: newAiActiveSynergy,
        message: 'Defense synergy cards confirmed'
      };
    }
    
    case 'AI_DEFENDER_SYNERGY_PICK': {
      if (!state.defenderSynergySelection) return state;
      
      let selectedCards: SynergyCard[] = [];
      
      if (state.defenderAvailableSynergyCards.length > 0) {
        state.defenderAvailableSynergyCards.sort((a, b) => b.stars - a.stars);
        selectedCards = state.defenderAvailableSynergyCards.slice(0, Math.min(2, state.defenderAvailableSynergyCards.length));
      }
      
      return {
        ...state,
        defenderSelectedSynergyCards: selectedCards
      };
    }
    
    default:
      return state;
  }
};

// Export utility functions for use in components
export { getControlState, getMaxSynergyCardsForAttack, countIcons };
import type { athleteCard, SynergyCard } from '../data/cards';
import type { FieldZone, ShotAttempt, DuelPhase } from '../types/game';
import type { PlayerActionType, GamePhase, TurnPhase } from '../types/game';
import { calculateAttackPower, calculateDefensePower, getControlState, getMaxSynergyCardsForAttack, countIcons } from '../utils/gameUtils';
import { resolveShot } from '../utils/shotResolution';
import { performRockPaperScissors } from '../utils/rockPaperScissors';
import { startDraftRound, pickDraftCard, aiPickDraftCard, discardDraftCard } from '../utils/draft';
import { performTeamAction } from '../utils/teamActions';
import { placeCard } from '../utils/cardPlacement';
import { performShot } from '../utils/shotActions';
import { useSynergy } from '../utils/synergyActions';
import { performSubstitution } from '../utils/substitution';
import { performImmediateEffect } from '../utils/immediateEffects';
import { performPenalty } from '../utils/penalty';
import { performEndTurn } from '../utils/endTurn';
import { aiTurn, processAiActionStep } from '../utils/ai';
import { starathleteCards, baseathleteCards } from '../data/cards';
import { getSynergyDeckFixed } from '../data/synergyConfig';
import { TUTORIAL_STEPS } from '../data/tutorialSteps';
import { TurnPhaseService } from './turnPhaseService';

export interface GameState {
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentTurn: 'player' | 'ai';
  controlPosition: number;
  playerScore: number;
  aiScore: number;
  playerSubstitutionsLeft: number;
  aiSubstitutionsLeft: number;
  playerHand: athleteCard[];
  playerBench: athleteCard[];
  playerSynergyHand: SynergyCard[];
  playerField: FieldZone[];
  aiField: FieldZone[];
  aiHand: athleteCard[];
  aiBench: athleteCard[];
  aiSynergyHand: SynergyCard[];
  synergyDeck: SynergyCard[];
  synergyDiscard: SynergyCard[];
  selectedCard: athleteCard | null;
  isHomeTeam: boolean;
  selectedSynergyCards: SynergyCard[];
  currentAction: PlayerActionType;
  message: string;
  turnCount: number;
  isFirstTurn: boolean;
  skipTeamAction: boolean;
  isFirstMatchTurn: boolean;
  isStoppageTime: boolean;
  pendingShot: ShotAttempt | null;
  draftRound: number;
  draftStep: number;
  availableDraftCards: athleteCard[];
  discardedDraftCards: athleteCard[];
  starCardDeck: athleteCard[];
  pendingPenalty: boolean;
  pendingImmediateEffect: { card: athleteCard; zone: number; slot: number } | null;
  synergyChoice: { cards: SynergyCard[]; sourceCard: athleteCard } | null;
  substitutionMode: { incomingCard: athleteCard } | null;
  instantShotMode: { card: athleteCard; zone: number; slot: number } | null;
  playerActiveSynergy: SynergyCard[];
  aiActiveSynergy: SynergyCard[];
  isDealing: boolean;
  duelPhase: DuelPhase;
  aiActionStep: 'teamAction' | 'placeCard' | 'shot' | 'endTurn' | 'none';
  matchLogs: MatchLogEntry[];
  playerUsedShotIcons: { [cardId: string]: number[] };
  aiUsedShotIcons: { [cardId: string]: number[] };
  defenderSynergySelection: boolean;
  tutorialStep: number;
  showTutorial: boolean;
  defenderAvailableSynergyCards: SynergyCard[];
  defenderSelectedSynergyCards: SynergyCard[];
  selectedShotIcon: number | null;
  draftTurn: 'player' | 'ai';
  aiDraftHand: athleteCard[];
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
  playerStarters: athleteCard[] = [], 
  playerSubstitutes: athleteCard[] = [],
  initialPlayerField: FieldZone[] | null = null
): GameState => {
  const initialState: GameState = {
    phase: 'coinToss',
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
      { zone: 0, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 1, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 2, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 3, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 4, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 5, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 6, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 7, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) }
    ],
    aiField: [
      { zone: 0, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 1, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 2, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 3, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 4, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 5, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 6, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) },
      { zone: 7, cards: [], synergyCards: [], slots: Array.from({ length: 8 }, (_, i) => ({ position: i, athleteCard: null, usedShotIcons: [], shotMarkers: 0 })) }
    ],
    aiHand: [],
    aiBench: [],
    aiSynergyHand: [],
    synergyDeck: getSynergyDeckFixed(),
    synergyDiscard: [],
    selectedCard: null,
    isHomeTeam: true,
    selectedSynergyCards: [],
    currentAction: 'none',
    message: 'Draft your squad',
    turnCount: 0,
    isFirstTurn: true,
    skipTeamAction: true,
    isFirstMatchTurn: true,
    isStoppageTime: false,
    pendingShot: null,
    draftRound: 1,
    draftStep: 0,
    availableDraftCards: [],
    discardedDraftCards: [],
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
    defenderSelectedSynergyCards: [],
    selectedShotIcon: null,
    // 选秀相关状态
    draftTurn: 'player',
    aiDraftHand: [],
    // 教程相关状态
    tutorialStep: 0,
    showTutorial: false
  };

  return initialState;
};

export type GameAction = 
  | { type: 'ROCK_PAPER_SCISSORS'; isHomeTeam: boolean }
  | { type: 'START_DRAFT_ROUND' }
  | { type: 'PICK_DRAFT_CARD'; cardIndex: number }
  | { type: 'AI_DRAFT_PICK' }
  | { type: 'DISCARD_DRAFT_CARD' }
  | { type: 'FINISH_SQUAD_SELECT'; starters: athleteCard[]; subs: athleteCard[] }
  | { type: 'TEAM_ACTION'; action: 'pass' | 'press' }
  | { type: 'PLACE_CARD'; card: athleteCard; zone: number; slot: number }
  | { type: 'NEXT_TUTORIAL_STEP' }
  | { type: 'SKIP_TUTORIAL' }
  | { type: 'COMPLETE_TUTORIAL' }
  | { type: 'USE_SYNERGY'; synergyCard: SynergyCard; targetCard: athleteCard }
  | { type: 'PERFORM_SHOT'; card: athleteCard; slot: number; zone: number; synergyCards?: SynergyCard[] }
  | { type: 'PERFORM_SUBSTITUTION'; incomingCard: athleteCard; outgoingCard: athleteCard; zone: number; slot: number }
  | { type: 'PERFORM_IMMEDIATE_EFFECT'; card: athleteCard; zone: number; slot: number }
  | { type: 'CANCEL_INSTANT_SHOT' }
  | { type: 'CANCEL_IMMEDIATE_EFFECT' }
  | { type: 'PERFORM_PENALTY'; zone: number; slot: number }
  | { type: 'END_TURN' }
  | { type: 'AI_TURN' }
  | { type: 'SET_DEALING'; isDealing: boolean }
  | { type: 'ADVANCE_DUEL' }
  | { type: 'FINISH_SETUP' }
  | { type: 'SELECT_PLAYER_CARD'; card: athleteCard | null }
  | { type: 'SELECT_SYNERGY_CARD'; card: SynergyCard }
  | { type: 'SELECT_SYNERGY_CARD'; card: SynergyCard }
  | { type: 'SYNERGY_CHOICE_SELECT'; index: number }
  | { type: 'MOVE_SYNERGY_TO_DECK'; cardId: string }
  | { type: 'CANCEL_SUBSTITUTION' }
  | { type: 'START_SECOND_HALF' }
  | { type: 'TRIGGER_EFFECT' }
  | { type: 'SKIP_EFFECT' }
  | { type: 'SUBSTITUTE'; outgoingCardId: string; incomingCardId: string }
  | { type: 'SELECT_SHOT_ICON'; iconIndex: number }
  | { type: 'START_DEFENDER_SYNERGY_SELECTION' }
  | { type: 'SELECT_DEFENDER_SYNERGY_CARD'; cardIndex: number }
  | { type: 'CONFIRM_DEFENDER_SYNERGY' }
  | { type: 'AI_DEFENDER_SYNERGY_PICK' }
  | { type: 'START_SUBSTITUTION'; card: athleteCard }
  | { type: 'PENALTY_COMPLETE'; playerPoints: number; aiPoints: number };

export const isHalfTime = (state: GameState): boolean => {
  return state.phase === 'firstHalf' && state.turnCount >= 10;
};

export const isFullTime = (state: GameState): boolean => {
  return state.phase === 'secondHalf' && state.turnCount >= 10;
};

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
        const { attacker, defender, attackerPower, defenderPower, result } = state.pendingShot;
        switch (nextPhase) {
          case 'reveal_attacker':
            newState.matchLogs = addLog(newState, {
              type: 'duel',
              phase: 'Duel',
              step: 'Reveal Attacker',
              attacker: attacker.card.name,
              message: `Attacker revealed: ${attacker.card.name}`
            });
            break;
          case 'reveal_defender':
            newState.matchLogs = addLog(newState, {
              type: 'duel',
              phase: 'Duel',
              step: 'Reveal Defender',
              defender: defender?.card.name || 'Empty',
              message: `Defender revealed: ${defender?.card.name || 'Empty'}`
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
              skills: [...(state.pendingShot.activatedSkills.attackerSkills || []), ...(state.pendingShot.activatedSkills.defenderSkills || [])],
              message: 'Player skills activated and effects applied'
            });
            break;
          case 'summary':
            newState.matchLogs = addLog(newState, {
              type: 'duel',
              phase: 'Duel',
              step: 'Final Summary',
              attackPower: attackerPower,
              defensePower: defenderPower,
              message: `Final power comparison: ${attackerPower} (Attack) vs ${defenderPower} (Defense)`
            });
            break;
          case 'result':
            newState.matchLogs = addLog(newState, {
              type: 'result',
              phase: 'Duel',
              step: 'Final Result',
              result: result === 'goal' ? 'goal' : result === 'saved' ? 'save' : 'miss',
              message: `Duel outcome: ${result === 'goal' ? 'GOAL!' : result === 'saved' ? 'Shot saved!' : 'Shot missed!'}`
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

    case 'ROCK_PAPER_SCISSORS': {
      let newState = performRockPaperScissors(state, action.isHomeTeam);
      newState.matchLogs = addLog(newState, {
        type: 'system',
        message: `Rock Paper Scissors: Player is ${action.isHomeTeam ? 'Home' : 'Away'}`
      });
      // 杩涘叆 draft 闃舵鍚庣珛鍗冲紑濮嬮€夌杞
      if (newState.phase === 'draft') {
        newState = startDraftRound(newState);
      }
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
      let newState = pickDraftCard(state, action.cardIndex);
      if (card) {
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `Player picked: ${card.name}`
        });
      }
      return newState;
    }
    
    case 'FINISH_SQUAD_SELECT': {
      // 鏍规嵁涓诲鍦轰负AI閫夋嫨鍩虹鐞冨憳
      const aiBaseCards = baseathleteCards.filter(card => {
        // 鐜╁鏄富闃熸椂锛孉I鏄闃燂紝鍙嶄箣浜︾劧
        if (!state.isHomeTeam) {
          return card.id.startsWith('H');
        } else {
          return card.id.startsWith('A');
        }
      });
      
      // 合并AI在选择中选择的明星卡和基础球员
      const allAiCards = [...state.aiDraftHand, ...aiBaseCards];
      
      // 为AI选择首发和替补
      const shuffledAiCards = [...allAiCards].sort(() => Math.random() - 0.5);
      const aiStarters = shuffledAiCards.slice(0, 10);
      const aiSubs = shuffledAiCards.slice(10);
      
      let newState: GameState = { 
        ...state, 
        phase: 'firstHalf' as GamePhase, 
        turnPhase: 'playerAction' as TurnPhase, 
        turnCount: state.isHomeTeam ? 1 : 2, // 涓婚槦浠庣1鍥炲悎寮€濮嬶紝瀹㈤槦浠庣2鍥炲悎寮€濮?        isFirstTurn: true,
        skipTeamAction: true,
        isFirstMatchTurn: true,
        currentAction: 'none' as PlayerActionType,
        playerHand: action.starters,
        playerBench: action.subs,
        aiHand: aiStarters,
        aiBench: aiSubs
      };      
      newState.currentTurn = newState.isHomeTeam ? 'player' : 'ai';
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
      if (!TurnPhaseService.canPerformTeamAction(state.turnPhase)) return state;
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
      if (!TurnPhaseService.canPlaceCard(state.turnPhase)) return state;
      
      if (state.currentAction && state.currentAction !== 'none') return state;
      
      const slotPosition = Math.floor(action.slot / 2) + 1;
      let newState = placeCard(state, action.card, action.zone, action.slot);
      
      if (!newState) return state;
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
      
      // 濡傛灉褰撳墠鏄痶eamAction闃舵锛屾斁缃崱鐗屽悗鑷姩鍒囨崲鍒皃layerAction闃舵
      if (state.turnPhase === 'teamAction') {
        newState.turnPhase = 'playerAction';
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
      let newState = processAiActionStep(state);
      return newState;
    }
    
    case 'SET_DEALING':
      return { ...state, isDealing: action.isDealing };
    
    case 'FINISH_SETUP':
      return { 
        ...state, 
        phase: 'firstHalf' as GamePhase, 
        turnCount: 1, 
        isFirstTurn: true,
        turnPhase: 'playerAction' as TurnPhase, // Skip team action phase for first turn
        matchLogs: addLog(state, {
          type: 'system',
          message: 'Setup complete - Match ready to begin'
        }),
        showTutorial: true // 鍚姩鏁欑▼
      };
    
    case 'AI_DRAFT_PICK': {
      const randomIndex = Math.floor(Math.random() * state.availableDraftCards.length);
      const card = state.availableDraftCards[randomIndex];
      let newState = aiPickDraftCard(state);
      if (card) {
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `AI picked: ${card.name}`
        });
      }
      return newState;
    }
    
    case 'NEXT_TUTORIAL_STEP': {
      const nextStep = state.tutorialStep + 1;
      return {
        ...state,
        tutorialStep: nextStep,
        showTutorial: nextStep < TUTORIAL_STEPS.length ? true : false
      };
    }
    
    case 'SKIP_TUTORIAL': {
      return {
        ...state,
        showTutorial: false
      };
    }
    
    case 'COMPLETE_TUTORIAL': {
      return {
        ...state,
        showTutorial: false,
        tutorialStep: 0
      };
    }
    
    case 'DISCARD_DRAFT_CARD': {
      let newState = discardDraftCard(state);
      newState.matchLogs = addLog(newState, {
        type: 'action',
        message: 'Remaining card discarded'
      });
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
    
    case 'MOVE_SYNERGY_TO_DECK': {
      const cardToMove = state.playerSynergyHand.find(c => c.id === action.cardId);
      if (!cardToMove) return state;
      
      let newState = { ...state };
      newState.playerSynergyHand = newState.playerSynergyHand.filter(c => c.id !== action.cardId);
      newState.synergyDeck = [cardToMove, ...newState.synergyDeck];
      newState.message = `Moved ${cardToMove.name} to deck`;
      newState.matchLogs = addLog(newState, {
        type: 'synergy',
        message: `Moved synergy card ${cardToMove.name} to deck`
      });
      return newState;
    }
    
    case 'CANCEL_SUBSTITUTION':
      return { ...state, substitutionMode: null, message: 'Substitution cancelled' };
    
    case 'START_SECOND_HALF':
      return { ...state, phase: 'secondHalf', isFirstTurn: true, skipTeamAction: true, isFirstMatchTurn: true, message: 'Second half started!' };
    
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
          message: `Substitution: ${outgoingCard.name} 鈫?${incomingCard.name}`
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
          if (drawnCard) {
            availableCards = [drawnCard];
          }
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

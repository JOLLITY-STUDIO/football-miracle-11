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
import { shuffleArray } from '../data/teams';
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
  playerAthleteHand: athleteCard[];  // 玩家球员手牌
  playerBench: athleteCard[];
  playerSynergyHand: SynergyCard[];
  playerField: FieldZone[];
  aiField: FieldZone[];
  aiAthleteHand: athleteCard[];  // AI球员手牌
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
  homeCardDeck: athleteCard[];
  awayCardDeck: athleteCard[];
  selectedDraftDeck: 'star' | 'home' | 'away';
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
  isTransitioning: boolean;
  // 抽卡相关状态
  dealingProgress: number;  // 抽卡进度，0-13
  dealingDirection: 'player' | 'ai';  // 当前抽卡方向
  playerDraftDeck: athleteCard[];  // 玩家选秀卡组
  aiDraftDeck: athleteCard[];  // AI选秀卡组
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
    phase: 'setup',
    turnPhase: 'teamAction',
    currentTurn: 'player',
    controlPosition: 50,
    playerScore: 0,
    aiScore: 0,
    playerSubstitutionsLeft: 3,
    aiSubstitutionsLeft: 3,
    playerAthleteHand: playerStarters,
    playerBench: playerSubstitutes,
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
    aiAthleteHand: [],
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
    starCardDeck: starathleteCards,
    homeCardDeck: baseathleteCards.filter(card => card.id.startsWith('H')),
    awayCardDeck: baseathleteCards.filter(card => card.id.startsWith('A')),
    selectedDraftDeck: 'star',
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
    showTutorial: false,
    // 过渡状态
    isTransitioning: false,
    // 抽卡相关状态
    dealingProgress: 0,
    dealingDirection: 'player',
    playerDraftDeck: [],
    aiDraftDeck: []
  };

  return initialState;
};

export type GameAction = 
  | { type: 'ROCK_PAPER_SCISSORS'; isHomeTeam: boolean }
  | { type: 'START_DRAFT_ROUND'; cards?: athleteCard[] }
  | { type: 'PICK_DRAFT_CARD'; cardIndex: number }
  | { type: 'AI_DRAFT_PICK' }
  | { type: 'DISCARD_DRAFT_CARD' }
  | { type: 'FINISH_SQUAD_SELECT'; starters: athleteCard[]; subs: athleteCard[] }
  | { type: 'TEAM_ACTION'; action: 'pass' | 'press'; iconCount: number }
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
  | { type: 'PENALTY_COMPLETE'; playerPoints: number; aiPoints: number }
  | { type: 'SELECT_DRAFT_DECK'; deckType: 'star' | 'home' | 'away' } // 新添加的action类型
  | { type: 'DRAW_CARD' }; // 抽卡动作

export const isHalfTime = (state: GameState): boolean => {
  // Half-time occurs when stoppage time is active and the turn is ending
  return state.phase === 'firstHalf' && state.isStoppageTime;
};

export const isFullTime = (state: GameState): boolean => {
  // Full-time occurs when second half is in stoppage time and the turn is ending
  return state.phase === 'secondHalf' && state.isStoppageTime;
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
              attacker: attacker.card.nickname,
              message: `Attacker revealed: ${attacker.card.nickname}`
            });
            break;
          case 'reveal_defender':
            newState.matchLogs = addLog(newState, {
              type: 'duel',
              phase: 'Duel',
              step: 'Reveal Defender',
              defender: defender?.card.nickname || 'Empty',
              message: `Defender revealed: ${defender?.card.nickname || 'Empty'}`
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
      
      // 洗牌并准备卡组
      // 不管玩家选择主客场，homeCardDeck始终包含主场卡片，awayCardDeck始终包含客场卡片
      const shuffledHomeDeck = shuffleArray([...newState.homeCardDeck]);
      const shuffledAwayDeck = shuffleArray([...newState.awayCardDeck]);
      
      // 保存洗牌后的卡组，保持homeCardDeck和awayCardDeck的原始含义
      newState.homeCardDeck = shuffledHomeDeck;
      newState.awayCardDeck = shuffledAwayDeck;
      
      // 清空手牌，准备通过抽卡动画分发
      newState.playerAthleteHand = [];
      newState.aiAthleteHand = [];
      
      // 明确设置为dealing阶段
      newState.phase = 'dealing' as GamePhase;
      
      newState.matchLogs = addLog(newState, {
        type: 'system',
        message: `Card decks prepared: Home deck (${shuffledHomeDeck.length} cards), Away deck (${shuffledAwayDeck.length} cards)`
      });
      
      newState.matchLogs = addLog(newState, {
        type: 'system',
        message: `Deck sizes: Home deck ${newState.homeCardDeck.length}, Away deck ${newState.awayCardDeck.length}, Total ${newState.homeCardDeck.length + newState.awayCardDeck.length}`
      });
      
      // 开始抽卡动画
      newState.isDealing = true;
      newState.dealingProgress = 0;
      newState.message = 'Dealing cards...';
      
      return newState;
    }
    
    case 'START_DRAFT_ROUND': {
      let newState;
      if (action.cards && action.cards.length > 0) {
        // Calculate the next draft round if it's not set
        const nextRound = state.draftRound || 1;
        newState = {
          ...state,
          availableDraftCards: action.cards,
          draftStep: 1,
          draftRound: nextRound
        };
      } else {
        newState = startDraftRound(state);
      }
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
          message: `Player picked: ${card.nickname}`
        });
      }
      return newState;
    }
    
    case 'FINISH_SQUAD_SELECT': {
      // 使用已经分发的卡牌，不再重新分发
      let newState: GameState = { 
        ...state, 
        phase: 'firstHalf' as GamePhase, 
        turnPhase: 'teamAction' as TurnPhase, 
        turnCount: 1, // Always start at turn 1 for the first turn of the match
        isFirstTurn: true,
        skipTeamAction: false,
        isFirstMatchTurn: true,
        currentAction: 'none' as PlayerActionType,
        playerAthleteHand: action.starters,
        playerBench: action.subs,
        // 保持AI手牌不变，因为已经在ROCK_PAPER_SCISSORS阶段分发了
        aiAthleteHand: state.aiAthleteHand,
        aiBench: state.aiBench
      };      
      newState.currentTurn = newState.isHomeTeam ? 'player' : 'ai';
      // Use TurnPhaseService to determine initial phase
      const initialPhase = TurnPhaseService.getInitialPhase(newState);
      newState.turnPhase = initialPhase;
      // Update message based on initial phase
      if (initialPhase === 'athleteAction') {
        newState.message = newState.isHomeTeam ? 'Your turn! Place a card.' : 'AI is thinking...';
      } else {
        newState.message = newState.isHomeTeam ? 'Your turn! Team action phase.' : 'AI is thinking...';
      }
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
        let newState = performTeamAction(state, action.action, action.iconCount);
        const actor = state.currentTurn === 'player' ? 'You' : 'AI';
        const actionName = action.action === 'pass' ? 'Pass' : 'Press';
        newState.turnPhase = 'athleteAction';
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `${actor} executed ${actionName}`
        });
        return newState;
      }
    
    case 'PLACE_CARD': {
      if (!TurnPhaseService.canPlaceCard(state.turnPhase)) return state;
      
      if (state.currentAction && state.currentAction !== 'none' && state.currentAction !== 'organizeAttack') return state;
      
      const slotPosition = Math.floor(action.slot / 2) + 1;
      let newState = placeCard(state, action.card, action.zone, action.slot);
      
      if (!newState) return state;
      const actor = state.currentTurn === 'player' ? 'You' : 'AI';
      newState.currentAction = 'organizeAttack';
      newState.matchLogs = addLog(newState, {
        type: 'action',
        message: `${actor} placed ${action.card.nickname} at line ${action.zone}`
      });

      if (action.card.immediateEffect !== 'none') {
        newState.pendingImmediateEffect = { card: action.card, zone: action.zone, slot: slotPosition };
        newState.message = `Triggering ${action.card.nickname}'s effect...`;
      } else {
        newState.message = 'Organize your attack or end turn';
      }
      
      return newState;
    }
    
    case 'USE_SYNERGY': {
      if (state.turnPhase !== 'athleteAction') return state;
      let newState = useSynergy(state, action.synergyCard, action.targetCard);
      if (newState.selectedSynergyCards.length > 0) {
        newState.matchLogs = addLog(newState, {
          type: 'synergy',
          message: `Synergy card used: ${action.synergyCard.name} on ${action.targetCard.nickname}`
        });
      }
      return newState;
    }
    
    case 'PERFORM_SHOT': {
      if (state.turnPhase !== 'athleteAction') return state;
      if (!action.card) return state;
      
      let newState = performShot(state, action.card, action.slot, action.zone);
      
      if (newState.pendingShot) {
        const usedIconCount = newState.pendingShot.attacker.usedShotIcons.length;
        const iconText = usedIconCount === 1 ? 'icon' : 'icons';
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `${state.currentTurn === 'player' ? 'You' : 'AI'} attempted a shot with ${action.card.nickname} (Used ${usedIconCount} shot ${iconText})`
        });
      }
      
      return newState;
    }
    
    case 'PERFORM_SUBSTITUTION': {
      if (state.turnPhase !== 'athleteAction') return state;
      let newState = performSubstitution(state, action.incomingCard, action.outgoingCard, action.zone, action.slot);
      newState.matchLogs = addLog(newState, {
        type: 'action',
        message: `Substitution: ${action.incomingCard.nickname} replaced ${action.outgoingCard.nickname}`
      });
      return newState;
    }
    
    case 'PERFORM_IMMEDIATE_EFFECT': {
      if (state.turnPhase !== 'athleteAction') return state;
      let newState = performImmediateEffect(state, action.card, action.zone, action.slot);
      newState.matchLogs = addLog(newState, {
        type: 'skill',
        message: `Immediate effect triggered: ${action.card.nickname}`
      });
      return newState;
    }
    
    case 'PERFORM_PENALTY': {
      if (state.turnPhase !== 'athleteAction') return state;
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
        phase: 'coinToss' as GamePhase, 
        matchLogs: addLog(state, {
          type: 'system',
          message: 'Setup complete - Ready for Rock Paper Scissors'
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
          message: `AI picked: ${card.nickname}`
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
    
    case 'START_SECOND_HALF': {
      // 重新洗牌协同卡牌库 - 将所有协同卡回到牌库重新洗牌
      const allSynergyCards = [...state.synergyDeck, ...state.synergyDiscard, ...state.playerSynergyHand];
      const shuffledDeck = shuffleArray([...allSynergyCards]);
      
      return { 
        ...state, 
        phase: 'secondHalf', 
        isFirstTurn: true, 
        skipTeamAction: false, 
        isFirstMatchTurn: true,
        controlPosition: 50,              // 控制权回到50%中间位置
        synergyDeck: shuffledDeck,        // 重新洗牌的协同卡牌库
        synergyDiscard: [],               // 清空弃牌堆
        playerSynergyHand: [],            // 清空玩家协同卡手牌
        turnCount: state.turnCount,       // 保持回合计数继续累加
        message: 'Second half started!' 
      };
    }
    
    case 'TRIGGER_EFFECT': {
      if (!state.pendingImmediateEffect) return state;
      const card = state.pendingImmediateEffect.card;
      let newState = performImmediateEffect(state, card, state.pendingImmediateEffect.zone, state.pendingImmediateEffect.slot);
      newState.pendingImmediateEffect = null;
      newState.matchLogs = addLog(newState, {
        type: 'skill',
        message: `Immediate effect triggered: ${card.nickname}`
      });
      return newState;
    }
    
    case 'SKIP_EFFECT':
      return { ...state, pendingImmediateEffect: null, message: 'Immediate effect skipped' };
    
    case 'SUBSTITUTE': {
      const outgoingCard = state.playerAthleteHand.find((c: athleteCard) => c.id === action.outgoingCardId) || state.playerBench.find((c: athleteCard) => c.id === action.outgoingCardId);
      const incomingCard = state.playerBench.find(c => c.id === action.incomingCardId);
      if (outgoingCard && incomingCard) {
        let newState = { ...state };
        if (state.playerAthleteHand.some((c: athleteCard) => c.id === action.outgoingCardId)) {
          newState.playerAthleteHand = state.playerAthleteHand.map((c: athleteCard) => c.id === action.outgoingCardId ? incomingCard : c);
        } else {
          newState.playerBench = state.playerBench.map(c => c.id === action.outgoingCardId ? incomingCard : c);
        }
        newState.playerBench = newState.playerBench.filter(c => c.id !== action.incomingCardId);
        newState.playerBench.push(outgoingCard);
        newState.playerSubstitutionsLeft -= 1;
        newState.substitutionMode = null;
        newState.matchLogs = addLog(newState, {
          type: 'action',
          message: `Substitution: ${outgoingCard.nickname} 鈫?${incomingCard.nickname}`
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
      let isStoppageTime = state.isStoppageTime;
      let message = isPlayerDefending ? 'Select synergy cards to defend' : 'AI is selecting defense synergy cards...';
      let newSynergyDeck = [...state.synergyDeck];
      
      if (defenderHand.length > 0) {
        availableCards = [...defenderHand];
      } else {
        if (newSynergyDeck.length > 0) {
          const drawnCard = newSynergyDeck.shift();
          if (drawnCard) {
            availableCards = [drawnCard];
          }
        } else {
          // 协同卡牌库耗尽，触发伤停补时
          isStoppageTime = true;
          message = 'Synergy deck exhausted! Stoppage time activated!';
        }
      }
      
      return {
        ...state,
        defenderSynergySelection: true,
        defenderAvailableSynergyCards: availableCards,
        defenderSelectedSynergyCards: [],
        synergyDeck: newSynergyDeck,
        isStoppageTime,
        message
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
      
      // 检查防守方是否使用了铲球卡
      const hasTackleCard = state.defenderSelectedSynergyCards.some(card => card.type === 'tackle');
      
      if (hasTackleCard) {
        // 铲球卡效果：取消当前判定，触发点球大战
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
          phase: 'penaltyShootout',
          pendingPenalty: true,
          message: '🛑 TACKLE! 铲球阻止了进攻，进入点球大战！'
        };
      }
      
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
    
    case 'SELECT_DRAFT_DECK':
      return {
        ...state,
        selectedDraftDeck: action.deckType,
        message: `Selected draft deck: ${action.deckType === 'star' ? 'Star Cards' : action.deckType === 'home' ? 'Home Team Cards' : 'Away Team Cards'}`
      };
    
    case 'DRAW_CARD': {
      let newState = { ...state };
      
      // 检查是否所有卡都已抽完
      const allCardsDealt = newState.homeCardDeck.length === 0 && newState.awayCardDeck.length === 0;
      
      if (allCardsDealt) {
        // 抽卡完成
        newState.isDealing = false;
        newState.dealingProgress = 0;
        newState.phase = 'draft' as GamePhase; // 抽卡完成后进入选秀阶段
        newState.message = 'Card dealing complete! Now entering draft phase.';
        newState.matchLogs = addLog(newState, {
          type: 'system',
          message: `All cards dealt: Player ${newState.playerAthleteHand.length} cards, AI ${newState.aiAthleteHand.length} cards` 
        });
        
        // 清空主客场卡组，准备选秀
        newState.homeCardDeck = [];
        newState.awayCardDeck = [];
        
        return newState;
      }
      
      const dealingCount = newState.dealingProgress + 1;
      
      // 每次只抽一张卡，交替从两个卡组抽卡
      let cardDrawn = false;
      let deckSource = '';
      let recipient = '';
      
      // 先从homeCardDeck开始发牌，然后再从awayCardDeck发牌
      // 这样确保主场先发完所有牌，然后客场再发
      
      // 先尝试从homeCardDeck抽卡
      if (newState.homeCardDeck.length > 0 && !cardDrawn) {
        const card = newState.homeCardDeck[0];
        if (card) {
          // 从homeCardDeck中移除这张卡
          newState.homeCardDeck = newState.homeCardDeck.slice(1);
          deckSource = 'home';
          
          // 根据卡片ID判断是主队还是客队卡片
          const isHomeCard = card.id.startsWith('H');
          
          // 检查卡片是否已经在玩家或AI的手牌中
          const isCardInPlayerHand = newState.playerAthleteHand.some(c => c.id === card.id);
          const isCardInAiHand = newState.aiAthleteHand.some(c => c.id === card.id);
          
          if (!isCardInPlayerHand && !isCardInAiHand) {
            // 根据主客场分配给玩家或AI
            if ((newState.isHomeTeam && isHomeCard) || (!newState.isHomeTeam && !isHomeCard)) {
              // 玩家获得自己队伍的卡片
              newState.playerAthleteHand.push(card);
              recipient = 'player';
              newState.matchLogs = addLog(newState, {
                type: 'action',
                message: `[Dealing #${dealingCount}] Player drew: ${card.nickname} - Player hand: ${newState.playerAthleteHand.length}`
              });
            } else {
              // AI获得对方队伍的卡片
              newState.aiAthleteHand.push(card);
              recipient = 'ai';
              newState.matchLogs = addLog(newState, {
                type: 'action',
                message: `[Dealing #${dealingCount}] AI drew: ${card.nickname} - AI hand: ${newState.aiAthleteHand.length}`
              });
            }
            cardDrawn = true;
          } else {
            // 卡片已经存在，跳过并记录日志
            newState.matchLogs = addLog(newState, {
              type: 'system',
              message: `DEBUG: Skipping duplicate card: ${card.nickname} (${card.id})`
            });
            // 继续抽下一张卡
            cardDrawn = false;
          }
        }
      }
      
      // 如果homeCardDeck空了，再从awayCardDeck抽卡
      if (newState.awayCardDeck.length > 0 && !cardDrawn) {
        const card = newState.awayCardDeck[0];
        if (card) {
          // 从awayCardDeck中移除这张卡
          newState.awayCardDeck = newState.awayCardDeck.slice(1);
          deckSource = 'away';
          
          // 根据卡片ID判断是主队还是客队卡片
          const isHomeCard = card.id.startsWith('H');
          
          // 检查卡片是否已经在玩家或AI的手牌中
          const isCardInPlayerHand = newState.playerAthleteHand.some(c => c.id === card.id);
          const isCardInAiHand = newState.aiAthleteHand.some(c => c.id === card.id);
          
          if (!isCardInPlayerHand && !isCardInAiHand) {
            // 根据主客场分配给玩家或AI
            if ((newState.isHomeTeam && isHomeCard) || (!newState.isHomeTeam && !isHomeCard)) {
              // 玩家获得自己队伍的卡片
              newState.playerAthleteHand.push(card);
              recipient = 'player';
              newState.matchLogs = addLog(newState, {
                type: 'action',
                message: `[Dealing #${dealingCount}] Player drew: ${card.nickname} - Player hand: ${newState.playerAthleteHand.length}`
              });
            } else {
              // AI获得对方队伍的卡片
              newState.aiAthleteHand.push(card);
              recipient = 'ai';
              newState.matchLogs = addLog(newState, {
                type: 'action',
                message: `[Dealing #${dealingCount}] AI drew: ${card.nickname} - AI hand: ${newState.aiAthleteHand.length}`
              });
            }
            cardDrawn = true;
          } else {
            // 卡片已经存在，跳过并记录日志
            newState.matchLogs = addLog(newState, {
              type: 'system',
              message: `DEBUG: Skipping duplicate card: ${card.nickname} (${card.id})`
            });
            // 继续抽下一张卡
            cardDrawn = false;
          }
        }
      }
      
      // 只有在成功抽卡后才更新进度
      if (cardDrawn) {
        newState.dealingProgress += 1;
        // 切换抽卡方向，用于动画显示
        newState.dealingDirection = recipient === 'player' ? 'ai' : 'player';
        // 添加详细的调试日志
        newState.matchLogs = addLog(newState, {
          type: 'system',
          message: `DEBUG: Dealing #${dealingCount} - From ${deckSource} deck to ${recipient} - Player hand: ${newState.playerAthleteHand.length}, AI hand: ${newState.aiAthleteHand.length}, Home deck: ${newState.homeCardDeck.length}, Away deck: ${newState.awayCardDeck.length}`
        });
      }
      
      const totalCards = newState.playerAthleteHand.length + newState.aiAthleteHand.length;
      const maxCards = 20; // Fixed total cards (10 home + 10 away)
      newState.message = `Dealing cards... ${totalCards}/${maxCards}`;
      
      return newState;
    }
    
    default:
      return state;
  }
};

// Export utility functions for use in components
export { getControlState, getMaxSynergyCardsForAttack, countIcons };

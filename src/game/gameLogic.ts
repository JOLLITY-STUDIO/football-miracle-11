import type { PlayerCard, SynergyCard, TacticalIcon, ImmediateEffectType } from '../data/cards';
import { playerCards, canPlaceCardInZone } from '../data/cards';
import { getSynergyDeckFixed } from '../data/synergyConfig';

export type ControlState = 'attack' | 'normal' | 'defense';
export type GamePhase = 'coinToss' | 'draft' | 'squadSelect' | 'firstHalf' | 'halfTime' | 'secondHalf' | 'extraTime' | 'finished';
export type TurnPhase = 'teamAction' | 'playerAction' | 'shooting' | 'end';
export type PlayerActionType = 'organizeAttack' | 'directAttack' | null;
export type ShotResult = 'goal' | 'saved' | 'missed' | 'magicNumber';

export interface FieldSlot {
  position: number;
  playerCard: PlayerCard | null;
  shotMarkers: number;
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
      { zone: 1, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 2, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 3, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 4, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
    ];
  } else {
    const shuffledPlayers = [...playerCards.filter(c => c.unlocked && !c.isStar)].sort(() => Math.random() - 0.5);
    playerHand = shuffledPlayers.slice(0, 10);
    playerBench = shuffledPlayers.slice(10, 13);
    playerField = [
      { zone: 1, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 2, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 3, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 4, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
    ];
  }

  const aiPlayers = [...playerCards.filter(c => c.unlocked && !c.isStar)].sort(() => Math.random() - 0.5);

  return {
    phase: 'coinToss',
    turnPhase: 'teamAction',
    currentTurn: 'player',
    controlPosition: 5,
    playerScore: 0,
    aiScore: 0,
    playerSubstitutionsLeft: 3,
    aiSubstitutionsLeft: 3,
    isHomeTeam: false,
    playerHand,
    playerBench,
    playerSynergyHand: shuffledSynergy.slice(0, 5),
    playerField,
    aiField: [
      { zone: 1, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 2, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 3, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 4, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
    ],
    aiHand: aiPlayers.slice(0, 10),
    aiBench: aiPlayers.slice(10, 13),
    aiSynergyHand: shuffledSynergy.slice(5, 10),
    synergyDeck: shuffledSynergy.slice(10),
    synergyDiscard: [],
    selectedCard: null,
    selectedSynergyCards: [],
    currentAction: null,
    message: 'Click to toss the coin',
    turnCount: 0,
    isFirstTurn: true,
    isStoppageTime: false,
    pendingShot: null,
    draftRound: 0,
    draftStep: 0,
    availableDraftCards: [],
    starCardDeck: starCards,
    pendingPenalty: false,
  };
};

export const getControlState = (position: number): ControlState => {
  if (position <= 2) return 'attack';
  if (position >= 7) return 'defense';
  return 'normal';
};

export const performCoinToss = (state: GameState): GameState => {
  const isHomeTeam = Math.random() < 0.5;
  return {
    ...state,
    isHomeTeam,
    phase: 'draft',
    draftRound: 1,
    draftStep: 0,
    message: isHomeTeam ? 'You are Home Team! Draft starts' : 'You are Away Team! Draft starts',
  };
};

export const startDraftRound = (state: GameState): GameState => {
  const newState = { ...state };
  const deck = [...newState.starCardDeck];
  
  if (deck.length < 3) {
    newState.phase = 'firstHalf';
    newState.turnPhase = 'teamAction';
    newState.currentTurn = newState.isHomeTeam ? 'player' : 'ai';
    newState.message = 'Draft complete! Game starts - Team Action first';
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
  
  const slotPosition = Math.floor(startCol / 2) + 1;
  const targetZone = field.find(z => z.zone === zone);
  const targetSlot = targetZone?.slots.find(s => s.position === slotPosition);
  if (targetZone && targetSlot && !targetSlot.playerCard) {
    targetSlot.playerCard = card;
    newState.playerField = isPlayer ? field : newState.playerField;
    newState.aiField = isPlayer ? newState.aiField : field;
    
    const newHand = hand.filter(c => c.id !== card.id);
    if (isPlayer) {
      newState.playerHand = newHand;
    } else {
      newState.aiHand = newHand;
    }
    
    newState.message = `Placed ${card.name} at ${zone} Zone Slot${slotPosition}`;
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
  
  const shotAttempt: ShotAttempt = {
    attacker,
    defender,
    attackSynergy,
    defenseSynergy,
    attackPower,
    defensePower,
    result,
  };
  
  if (result === 'goal' || result === 'magicNumber') {
    if (isPlayer) {
      newState.playerScore += 1;
    } else {
      newState.aiScore += 1;
    }
  }
  
  // 累加射门标记 (本次射门后 +1)
  const attackerFieldSlot = attackerFieldZone?.slots.find(s => s.position === attackerSlot);
  if (attackerFieldSlot) {
    attackerFieldSlot.shotMarkers += 1;
  }
  
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
    controlPosition: 5,
    playerField: state.playerField.map(z => ({ ...z, slots: z.slots.map(s => ({ ...s, playerCard: null, shotMarkers: 0 })) })),
    aiField: state.aiField.map(z => ({ ...z, slots: z.slots.map(s => ({ ...s, playerCard: null, shotMarkers: 0 })) })),
    playerSynergyHand: shuffledSynergy.slice(0, 5),
    aiSynergyHand: shuffledSynergy.slice(5, 10),
    synergyDeck: shuffledSynergy.slice(10),
    synergyDiscard: [],
    isFirstTurn: true,
    isStoppageTime: false,
    message: 'Second Half Start! AI first',
  };
};

export const endGame = (state: GameState): GameState => {
  return {
    ...state,
    phase: 'finished',
    turnPhase: 'end',
    message: state.playerScore > state.aiScore 
      ? '🎉 Congratulations! You win！' 
      : state.playerScore < state.aiScore 
        ? '😢 You lose' 
        : '🤝 Draw！',
  };
};

export const performAITurn = (state: GameState): GameState => {
  let newState = { ...state };
  
  if (newState.turnPhase === 'teamAction') {
    const passCount = countIcons(newState.aiField, 'pass');
    const pressCount = countIcons(newState.aiField, 'press');
    const hasPlayers = newState.aiField.some(z => z.slots.some(s => s.playerCard));
    
    if (newState.isFirstTurn && !hasPlayers) {
      newState.message = 'AI skipped team actions for one turn';
      newState.turnPhase = 'playerAction';
    } else if (passCount > 0 && newState.aiSynergyHand.length < 5) {
      newState = performTeamAction(newState, 'pass');
      newState.turnPhase = 'playerAction';
    } else if (pressCount > 0) {
      newState = performTeamAction(newState, 'press');
      newState.turnPhase = 'playerAction';
    } else {
      newState.turnPhase = 'playerAction';
    }
  }
  
  if (newState.turnPhase === 'playerAction') {
    const availableCards = newState.aiHand.filter(card => {
      return newState.aiField.some(z => z.slots.some(s => !s.playerCard) && canPlaceCardInZone(card, z.zone));
    });
    
    const attackers: { zone: number; slot: number; card: PlayerCard }[] = [];
    newState.aiField.forEach(z => {
      z.slots.forEach(s => {
        if (s.playerCard && s.playerCard.icons.includes('attack')) {
          attackers.push({ zone: z.zone, slot: s.position, card: s.playerCard });
        }
      });
    });
    
    if (availableCards.length > 0 && Math.random() > 0.3) {
      const cardToPlace = availableCards[Math.floor(Math.random() * availableCards.length)]!;
      const targetZone = newState.aiField.find(
        z => z.slots.some(s => !s.playerCard) && canPlaceCardInZone(cardToPlace, z.zone)
      );
      const targetSlot = targetZone?.slots.find(s => !s.playerCard);
      
      if (targetZone && targetSlot) {
        newState = placeCard(newState, cardToPlace, targetZone.zone, targetSlot.position, false);
        
        // Check for Immediate Shot Effect
        let shouldShoot = false;
        let ignoreBaseDefense = false;
        
        if (cardToPlace.immediateEffect === 'instant_shot') {
          shouldShoot = true;
          ignoreBaseDefense = true;
          newState.message = 'AI uses Instant Shot effect!';
        } else if (cardToPlace.icons.includes('attack') && Math.random() > 0.5) {
          shouldShoot = true;
        }

        if (shouldShoot) {
          const controlState = getControlState(newState.controlPosition);
          const maxSynergy = getMaxSynergyCardsForAttack(controlState);
          
          // AI Attack Logic:
          // 1. Draw 1 from Deck (if available) - Rule: First card MUST be from deck
          // 2. Add from Hand up to maxSynergy - 1
          
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
          
          newState = performShot(newState, cardToPlace, targetZone.zone, targetSlot.position, aiSynergy, false, ignoreBaseDefense);
        }
      }
    } else if (attackers.length > 0) {
      const attacker = attackers[Math.floor(Math.random() * attackers.length)]!;
      
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
      
      newState = performShot(newState, attacker.card, attacker.zone, attacker.slot, aiSynergy, false);
    }
    
    newState = checkHalfEnd(newState);
  }
  
  newState.currentTurn = 'player';
  newState.turnPhase = 'teamAction';
  newState.isFirstTurn = false;
  newState.turnCount += 1;
  
  if (newState.turnCount >= 10 && newState.phase === 'firstHalf') {
    newState = startHalfTime(newState);
  } else if (newState.turnCount >= 20 && newState.phase === 'secondHalf') {
    newState = endGame(newState);
  } else {
    newState.message += ' - Your turn';
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
  
  const incomingCard = bench.find(c => c.id === incomingCardId);
  if (!incomingCard) return state;
  
  for (const zone of field) {
    const slotIndex = zone.slots.findIndex(s => s.playerCard?.id === outgoingCardId);
    if (slotIndex >= 0) {
      zone.slots[slotIndex]!.playerCard = incomingCard;
      break;
    }
  }
  
  const newBench = bench.filter(c => c.id !== incomingCardId);
  if (isPlayer) {
    newState.playerField = field;
    newState.playerBench = newBench;
    newState.playerSubstitutionsLeft -= 1;
  } else {
    newState.aiField = field;
    newState.aiBench = newBench;
    newState.aiSubstitutionsLeft -= 1;
  }
  
  newState.message = `Substitution complete：${incomingCard.name} in`;
  return newState;
};





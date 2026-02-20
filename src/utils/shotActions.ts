import type { GameState } from '../game/gameLogic';
import type { athleteCard } from '../data/cards';
import type { SynergyCard } from '../data/cards';
import { calculateAttackPower } from './gameUtils';

// 从tactics中提取图标位置
const getIconPositionsFromTactics = (card: athleteCard) => {
  const iconPositions = [];
  if (card.tactics?.left) {
    if (card.tactics.left.left) {
      iconPositions.push({ type: card.tactics.left.left, position: 'slot-middleLeft' });
    }
    if (card.tactics.left.top) {
      iconPositions.push({ type: card.tactics.left.top, position: 'slot-topLeft' });
    }
    if (card.tactics.left.down) {
      iconPositions.push({ type: card.tactics.left.down, position: 'slot-bottomLeft' });
    }
  }
  if (card.tactics?.right) {
    if (card.tactics.right.top) {
      iconPositions.push({ type: card.tactics.right.top, position: 'slot-topRight' });
    }
    if (card.tactics.right.down) {
      iconPositions.push({ type: card.tactics.right.down, position: 'slot-bottomRight' });
    }
    if (card.tactics.right.right) {
      iconPositions.push({ type: card.tactics.right.right, position: 'slot-middleRight' });
    }
  }
  return iconPositions;
};

export const performShot = (state: GameState, card: athleteCard, slot: number, zone: number, synergyCards?: SynergyCard[]): GameState => {
  const isPlayer = state.currentTurn === 'player';
  const usedShotIcons = isPlayer ? state.playerUsedShotIcons[card.id] || [] : state.aiUsedShotIcons[card.id] || [];
  
  const iconPositions = getIconPositionsFromTactics(card);
  const attackIconPositions = iconPositions
    .map((pos, index) => ({ pos, index }))
    .filter(({ pos }) => pos.type === 'attack');
  
  const availableShotIcons = attackIconPositions
    .filter(({ index }) => !usedShotIcons.includes(index));
  
  if (availableShotIcons.length === 0) {
    return {
      ...state,
      message: 'No available shot icons on this player'
    };
  }
  
  const selectedShotIconIndex = availableShotIcons[0]?.index ?? 0;
  
  const playerZones = isPlayer ? state.playerField : state.aiField;
  const baseAttackPower = calculateAttackPower(card, playerZones, usedShotIcons);
  
  const defenderZone = state.aiField[zone];
  const defender = defenderZone ? defenderZone.cards[slot] : null;
  
  // Create shot attempt
  const shotAttempt = {
    attacker: {
      card,
      zone,
      slot,
      usedShotIcons: [...usedShotIcons, selectedShotIconIndex]
    },
    defender: defender ? {
      card: defender,
      zone,
      slot
    } : null,
    phase: 'init' as const,
    attackerPower: baseAttackPower,
    defenderPower: defender ? 0 : 0,
    attackSynergy: [],
    defenseSynergy: [],
    activatedSkills: {
      attackerSkills: [],
      defenderSkills: []
    },
    attackerUsedShotIcons: [...usedShotIcons, selectedShotIconIndex],
    result: null
  };
  
  // Update used shot icons tracking
  const newUsedShotIcons = isPlayer ? 
    { ...state.playerUsedShotIcons, [card.id]: [...usedShotIcons, selectedShotIconIndex] } :
    { ...state.aiUsedShotIcons, [card.id]: [...usedShotIcons, selectedShotIconIndex] };
  
  // Update shot markers for the field slot
  const newPlayerField = isPlayer ? 
    state.playerField.map(z => {
      if (z.zone === zone) {
        return {
          ...z,
          slots: z.slots.map(s => {
            if (s.position === slot && s.athleteCard?.id === card.id) {
              return {
                ...s,
                shotMarkers: (s.shotMarkers || 0) + 1
              };
            }
            return s;
          })
        };
      }
      return z;
    }) : 
    state.playerField;
  
  const newAiField = !isPlayer ? 
    state.aiField.map(z => {
      if (z.zone === zone) {
        return {
          ...z,
          slots: z.slots.map(s => {
            if (s.position === slot && s.athleteCard?.id === card.id) {
              return {
                ...s,
                shotMarkers: (s.shotMarkers || 0) + 1
              };
            }
            return s;
          })
        };
      }
      return z;
    }) : 
    state.aiField;
  
  // 进入射门准备阶段，而不是直接进入对决
  return {
    ...state,
    pendingShot: shotAttempt,
    shotPreparationPhase: 'attacker_synergy_selection',
    ...(isPlayer ? { playerUsedShotIcons: newUsedShotIcons } : { aiUsedShotIcons: newUsedShotIcons }),
    playerField: newPlayerField,
    aiField: newAiField,
    message: 'Shot preparation - attacker synergy selection'
  };
};

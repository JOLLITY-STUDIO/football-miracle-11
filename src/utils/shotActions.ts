import type { GameState } from '../game/gameLogic';
import type { PlayerCard } from '../data/cards';
import type { SynergyCard } from '../data/cards';
import { calculateAttackPower } from './gameUtils';

export const performShot = (state: GameState, card: PlayerCard, slot: number, zone: number, synergyCards?: SynergyCard[]): GameState => {
  // Check if the card has available shot icons
  const isPlayer = state.currentTurn === 'player';
  const usedShotIcons = isPlayer ? state.playerUsedShotIcons[card.id] || [] : state.aiUsedShotIcons[card.id] || [];
  
  // Get all attack icon positions
  const attackIconPositions = card.iconPositions
    .map((pos, index) => ({ pos, index }))
    .filter(({ pos }) => pos.type === 'attack');
  
  // Find available shot icons (not used)
  const availableShotIcons = attackIconPositions
    .filter(({ index }) => !usedShotIcons.includes(index));
  
  if (availableShotIcons.length === 0) {
    return {
      ...state,
      message: 'No available shot icons on this player'
    };
  }
  
  // For now, use the first available shot icon
  // In the future, this should be selected by the player/AI
  const selectedShotIconIndex = availableShotIcons[0]?.index ?? 0;
  
  // Calculate base attack power
  const baseAttackPower = calculateAttackPower(card);
  
  // Find defender (if any)
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
    phase: 'select_shot_icon' as const,
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
            if (s.position === slot && s.playerCard?.id === card.id) {
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
            if (s.position === slot && s.playerCard?.id === card.id) {
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
  
  return {
    ...state,
    pendingShot: shotAttempt,
    duelPhase: 'select_shot_icon',
    ...(isPlayer ? { playerUsedShotIcons: newUsedShotIcons } : { aiUsedShotIcons: newUsedShotIcons }),
    playerField: newPlayerField,
    aiField: newAiField
  };
};
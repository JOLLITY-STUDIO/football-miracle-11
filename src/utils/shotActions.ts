import type { GameState } from '../game/gameLogic';
import type { PlayerCard } from '../types/game';
import { calculateAttackPower } from './gameUtils';

export const performShot = (state: GameState, card: PlayerCard, slot: number, zone: number): GameState => {
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
  const selectedShotIconIndex = availableShotIcons[0].index;
  
  // Calculate base attack power
  const baseAttackPower = calculateAttackPower(card);
  
  // Find defender (if any)
  const defenderZone = state.aiField[zone];
  const defender = defenderZone.cards[slot] || null;
  
  // Create shot attempt
  const shotAttempt = {
    attacker: {
      card,
      zone,
      slot,
      usedShotIcons: [...usedShotIcons, selectedShotIconIndex] // Track the used icon
    },
    defender: defender ? {
      card: defender,
      zone,
      slot
    } : null,
    phase: 'select_shot_icon' as const,
    attackerPower: baseAttackPower,
    defenderPower: defender ? 0 : 0, // Will be calculated later
    result: null
  };
  
  // Update used shot icons tracking
  const newUsedShotIcons = isPlayer ? 
    { ...state.playerUsedShotIcons, [card.id]: [...usedShotIcons, selectedShotIconIndex] } :
    { ...state.aiUsedShotIcons, [card.id]: [...usedShotIcons, selectedShotIconIndex] };
  
  return {
    ...state,
    pendingShot: shotAttempt,
    duelPhase: 'select_shot_icon',
    ...(isPlayer ? { playerUsedShotIcons: newUsedShotIcons } : { aiUsedShotIcons: newUsedShotIcons })
  };
};
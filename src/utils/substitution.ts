import type { GameState } from '../game/gameLogic';
import type { athleteCard } from '../types/game';

export const performSubstitution = (
  state: GameState, 
  incomingCard: athleteCard, 
  outgoingCard: athleteCard, 
  zone: number, 
  slot: number
): GameState => {
  // Create new field state
  const newPlayerField = [...state.playerField];
  const newAiField = [...state.aiField];
  
  // Determine which field to update based on current turn
  const isPlayer = state.currentTurn === 'player';
  const targetField = isPlayer ? newPlayerField : newAiField;
  
  // Remove outgoing card from field
  if (targetField[zone] && targetField[zone].cards[slot]) {
    targetField[zone].cards[slot] = incomingCard;
  }
  
  // Reset used shot icons for the substituted player (outgoing card)
  const usedShotIconsKey = isPlayer ? 'playerUsedShotIcons' : 'aiUsedShotIcons';
  const newUsedShotIcons = { ...state[usedShotIconsKey] };
  delete newUsedShotIcons[outgoingCard.id]; // Clear the outgoing player's used icons
  
  // Add outgoing card to bench and remove incoming card from hand
  const newHand = isPlayer ? [...state.playerHand] : [...state.aiHand];
  const newBench = isPlayer ? [...state.playerBench] : [...state.aiBench];
  
  const outgoingIndex = newHand.findIndex(card => card.id === incomingCard.id);
  if (outgoingIndex !== -1) {
    newHand.splice(outgoingIndex, 1);
  }
  newBench.push(outgoingCard);
  
  return {
    ...state,
    ...(isPlayer ? {
      playerField: newPlayerField,
      playerHand: newHand,
      playerBench: newBench,
      playerUsedShotIcons: newUsedShotIcons
    } : {
      aiField: newAiField,
      aiHand: newHand,
      aiBench: newBench,
      aiUsedShotIcons: newUsedShotIcons
    }),
    message: `${incomingCard.name} substituted for ${outgoingCard.name} - used shot icons reset`
  };
};

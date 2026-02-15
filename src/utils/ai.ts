import type { GameState } from '../game/gameLogic';
import { placeCard } from './cardPlacement';

export const aiTurn = (state: GameState): GameState => {
  // Basic AI implementation
  let newState = { ...state };
  
  // 1. Check if AI has cards in hand
  if (newState.aiHand.length > 0) {
    // 2. Try to place a card
    const cardToPlace = newState.aiHand[0];
    
    // Find a valid position to place the card
    for (let zone of cardToPlace.zones) {
      for (let slot = 0; slot <= 6; slot++) {
        // Check if slot is empty
        const targetZone = newState.aiField.find(z => z.zone === zone);
        if (targetZone) {
          const slot1 = targetZone.slots.find(s => s.position === slot);
          const slot2 = targetZone.slots.find(s => s.position === slot + 1);
          
          if (slot1 && slot2 && !slot1.playerCard && !slot2.playerCard) {
            // Place the card
            newState = placeCard(newState, cardToPlace, zone, slot);
            newState.message = `AI placed ${cardToPlace.name}`;
            break;
          }
        }
      }
      if (newState.aiHand.length < state.aiHand.length) {
        break;
      }
    }
  }
  
  // 3. End AI turn
  newState.currentTurn = 'player';
  newState.turnPhase = 'teamAction';
  newState.message = 'Your turn!';
  newState.aiActionStep = 'none';
  
  return newState;
};

// AI 行动步骤管理
export const processAiActionStep = (state: GameState): GameState => {
  let newState = { ...state };
  
  if (!newState.aiActionStep) return newState;
  
  switch (newState.aiActionStep) {
    case 'teamAction':
      // AI 战术阶段 - 模拟思考
      newState.message = 'AI is planning...';
      newState.aiActionStep = 'playerAction';
      break;
      
    case 'playerAction':
      // AI 行动阶段 - 放置卡片
      if (newState.aiHand.length > 0) {
        const cardToPlace = newState.aiHand[0];
        
        for (let zone of cardToPlace.zones) {
          for (let slot = 0; slot <= 6; slot++) {
            const targetZone = newState.aiField.find(z => z.zone === zone);
            if (targetZone) {
              const slot1 = targetZone.slots.find(s => s.position === slot);
              const slot2 = targetZone.slots.find(s => s.position === slot + 1);
              
              if (slot1 && slot2 && !slot1.playerCard && !slot2.playerCard) {
                newState = placeCard(newState, cardToPlace, zone, slot);
                newState.message = `AI placed ${cardToPlace.name}`;
                break;
              }
            }
          }
          if (newState.aiHand.length < state.aiHand.length) {
            break;
          }
        }
      }
      newState.aiActionStep = 'endTurn';
      break;
      
    case 'endTurn':
      // AI 回合结束
      newState.currentTurn = 'player';
      newState.turnPhase = 'teamAction';
      newState.message = 'Your turn!';
      newState.aiActionStep = 'none';
      break;
  }
  
  return newState;
};
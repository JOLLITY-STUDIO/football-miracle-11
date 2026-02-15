import type { GameState } from '../game/gameLogic';
import type { SynergyCard } from '../data/cards';

export const performTeamAction = (state: GameState, action: 'pass' | 'press'): GameState => {
  let newControlPosition = state.controlPosition;
  let message = '';
  let newSynergyDeck = [...state.synergyDeck];
  let newPlayerSynergyHand = [...state.playerSynergyHand];
  let newAiSynergyHand = [...state.aiSynergyHand];
  
  switch (action) {
    case 'pass':
      newControlPosition += state.currentTurn === 'player' ? 10 : -10;
      
      // 统计场上pass图标的数量
      const field = state.currentTurn === 'player' ? state.playerField : state.aiField;
      let passIconCount = 0;
      
      field.forEach(zone => {
        zone.slots.forEach(slot => {
          if (slot.playerCard) {
            passIconCount += slot.playerCard.icons.filter(icon => icon === 'pass').length;
          }
        });
      });
      
      // 根据pass图标数量抽取协同卡
      const cardsToDraw = Math.min(passIconCount, newSynergyDeck.length);
      for (let i = 0; i < cardsToDraw; i++) {
        if (newSynergyDeck.length > 0) {
          const drawnCard = newSynergyDeck.shift();
          if (drawnCard) {
            if (state.currentTurn === 'player') {
              newPlayerSynergyHand.push(drawnCard);
            } else {
              newAiSynergyHand.push(drawnCard);
            }
          }
        }
      }
      
      message = cardsToDraw > 0 
        ? `Pass action performed. Drew ${cardsToDraw} synergy card(s).` 
        : 'Pass action performed. No pass icons on field.';
      break;
      
    case 'press':
      newControlPosition += state.currentTurn === 'player' ? 5 : -5;
      message = 'Press action performed';
      break;
  }
  
  // Clamp position between 0-100
  newControlPosition = Math.max(0, Math.min(100, newControlPosition));
  
  return {
    ...state,
    controlPosition: newControlPosition,
    synergyDeck: newSynergyDeck,
    playerSynergyHand: newPlayerSynergyHand,
    aiSynergyHand: newAiSynergyHand,
    message,
    turnPhase: 'playerAction'
  };
};
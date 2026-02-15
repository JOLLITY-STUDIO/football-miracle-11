import type { GameState } from '../game/gameLogic';
import type { SynergyCard } from '../data/cards';

export const performTeamAction = (state: GameState, action: 'pass' | 'press'): GameState => {
  let newControlPosition = state.controlPosition;
  let message = '';
  let newSynergyDeck = [...state.synergyDeck];
  let newPlayerSynergyHand = [...state.playerSynergyHand];
  let newAiSynergyHand = [...state.aiSynergyHand];
  
  switch (action) {
    case 'pass': {
      // Pass 不影响控制权，只根据 pass 图标数量抽取协同卡
      // 统计场上pass图标的数量
      const field = state.currentTurn === 'player' ? state.playerField : state.aiField;
      let passIconCount = 0;
      
      field.forEach((zone: { slots: { athleteCard?: { icons: string[] } }[] }) => {
        zone.slots.forEach((slot: { athleteCard?: { icons: string[] } }) => {
          if (slot.athleteCard) {
            passIconCount += slot.athleteCard.icons.filter((icon: string) => icon === 'pass').length;
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
    }
      
    case 'press': {
      // 统计场上press图标的数量
      const pressField = state.currentTurn === 'player' ? state.playerField : state.aiField;
      let pressIconCount = 0;
      
      pressField.forEach((zone: { slots: { athleteCard?: { icons: string[] } }[] }) => {
        zone.slots.forEach((slot: { athleteCard?: { icons: string[] } }) => {
          if (slot.athleteCard) {
            pressIconCount += slot.athleteCard.icons.filter((icon: string) => icon === 'press').length;
          }
        });
      });
      
      // 计算控制权移动格数(总控制权分为5格，每格20%)
      // 根据press图标数量移动对应格数
      const moveAmount = pressIconCount * 20; // 每格20%，所以1格=20%，2格=40%，等等
      // Press moves control towards the player performing the action
      // Player press: move up (decrease position value, more attack control for player)
      // AI press: move down (increase position value, more attack control for AI)
      newControlPosition += state.currentTurn === 'player' ? -moveAmount : moveAmount;
      
      message = pressIconCount > 0 
        ? `Press action performed. Moved ${pressIconCount} zone(s) with ${pressIconCount} press icon(s).` 
        : 'Press action performed. No press icons on field.';
      break;
    }
  }
  
  // Clamp position between 0-100 and snap to nearest 20% grid
  newControlPosition = Math.max(0, Math.min(100, newControlPosition));
  // Snap to nearest 20% grid
  newControlPosition = Math.round(newControlPosition / 20) * 20;
  
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

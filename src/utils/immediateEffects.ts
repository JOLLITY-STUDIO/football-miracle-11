import type { GameState } from '../game/gameLogic';
import type { athleteCard } from '../data/cards';

export const performImmediateEffect = (state: GameState, card: athleteCard, zone: number, slot: number): GameState => {
  const isPlayerTurn = state.currentTurn === 'player';
  
  switch (card.immediateEffect) {
    case 'draw_synergy_1':
      return handleDrawSynergy(state, 1, isPlayerTurn);
    
    case 'draw_synergy_2_choose_1':
      return handleDrawSynergyChoose(state, 2, isPlayerTurn);
    
    case 'draw_synergy_plus_1':
      return handleDrawSynergy(state, 1, isPlayerTurn, true);
    
    case 'steal_synergy':
      return handleStealSynergy(state, isPlayerTurn);
    
    case 'instant_shot':
      return handleInstantShot(state, card, zone, slot, isPlayerTurn);
    
    case 'ignore_defense':
      return handleIgnoreDefense(state, card, zone, slot, isPlayerTurn);
    
    case 'move_control_1':
      return handleMoveControl(state, 1, isPlayerTurn);
    
    case 'move_control_2':
      return handleMoveControl(state, 2, isPlayerTurn);
    
    case 'none':
    default:
      return state;
  }
};

const handleDrawSynergy = (state: GameState, count: number, isPlayerTurn: boolean, isBonus: boolean = false): GameState => {
  const playerHand = isPlayerTurn ? state.playerSynergyHand : state.aiSynergyHand;
  
  const drawnCards = state.synergyDeck.slice(0, count);
  const newDeck = state.synergyDeck.slice(count);
  const newHand = [...playerHand, ...drawnCards];
  
  const message = isBonus 
    ? `${isPlayerTurn ? 'Player' : 'AI'} drew ${count} bonus synergy card(s)!`
    : `${isPlayerTurn ? 'Player' : 'AI'} drew ${count} synergy card(s)!`;
  
  return {
    ...state,
    ...(isPlayerTurn ? {
      playerSynergyHand: newHand
    } : {
      aiSynergyHand: newHand
    }),
    synergyDeck: newDeck,
    message,
    matchLogs: [
      ...state.matchLogs,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'action',
        phase: state.phase,
        message: message
      }
    ]
  };
};

const handleDrawSynergyChoose = (state: GameState, count: number, isPlayerTurn: boolean): GameState => {
  const drawnCards = state.synergyDeck.slice(0, count);
  const newDeck = state.synergyDeck.slice(count);
  
  const message = `${isPlayerTurn ? 'Player' : 'AI'} drew ${count} synergy cards to choose from!`;
  
  return {
    ...state,
    synergyDeck: newDeck,
    synergyChoice: { cards: drawnCards, sourceCard: null as any },
    message,
    matchLogs: [
      ...state.matchLogs,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'action',
        phase: state.phase,
        message: message
      }
    ]
  };
};

const handleStealSynergy = (state: GameState, isPlayerTurn: boolean): GameState => {
  const opponentHand = isPlayerTurn ? state.aiSynergyHand : state.playerSynergyHand;
  
  if (opponentHand.length === 0) {
    return {
      ...state,
      message: `No synergy cards to steal!`
    };
  }
  
  const stolenCard = opponentHand[Math.floor(Math.random() * opponentHand.length)];
  if (!stolenCard) return state;
  const newOpponentHand = opponentHand.filter(card => card.id !== stolenCard.id);
  
  const playerHand = isPlayerTurn ? state.playerSynergyHand : state.aiSynergyHand;
  const newPlayerHand = [...playerHand, stolenCard];
  
  const message = `${isPlayerTurn ? 'Player' : 'AI'} stole a synergy card!`;
  
  return {
    ...state,
    ...(isPlayerTurn ? {
      playerSynergyHand: newPlayerHand,
      aiSynergyHand: newOpponentHand
    } : {
      aiSynergyHand: newPlayerHand,
      playerSynergyHand: newOpponentHand
    }),
    message,
    matchLogs: [
      ...state.matchLogs,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'action',
        phase: state.phase,
        message: message
      }
    ]
  };
};

const handleInstantShot = (state: GameState, card: athleteCard, zone: number, slot: number, isPlayerTurn: boolean): GameState => {
  const message = `${card.name} can shoot immediately!`;
  
  return {
    ...state,
    instantShotMode: {
      card,
      zone,
      slot
    },
    message,
    matchLogs: [
      ...state.matchLogs,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'action',
        phase: state.phase,
        message: message
      }
    ]
  };
};

const handleIgnoreDefense = (state: GameState, card: athleteCard, zone: number, slot: number, isPlayerTurn: boolean): GameState => {
  const message = `${card.name} ignores defense this turn!`;
  
  return {
    ...state,
    message,
    matchLogs: [
      ...state.matchLogs,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'action',
        phase: state.phase,
        message: message
      }
    ]
  };
};

const handleMoveControl = (state: GameState, steps: number, isPlayerTurn: boolean): GameState => {
  const currentControl = state.controlPosition;
  const newControl = isPlayerTurn 
    ? Math.min(currentControl + steps, 4)
    : Math.max(currentControl - steps, 1);
  
  const message = `${isPlayerTurn ? 'Player' : 'AI'} moved control ${steps} step(s)!`;
  
  return {
    ...state,
    controlPosition: newControl,
    message,
    matchLogs: [
      ...state.matchLogs,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'action',
        phase: state.phase,
        message: message
      }
    ]
  };
};

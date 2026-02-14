import type { GameState } from '../game/gameLogic';
import type { PlayerCard } from '../data/cards';
import { starPlayerCards, basePlayerCards } from '../data/cards';

export const startDraftRound = (state: GameState): GameState => {
  // 从明星卡池中随机选择3张明星卡，过滤掉已被选择和已被弃掉的卡片
  const shuffledStars = [...starPlayerCards]
    .filter(card => !state.playerHand.some(c => c.id === card.id) && !state.aiDraftHand.some(c => c.id === card.id) && !state.discardedDraftCards.some(c => c.id === card.id))
    .sort(() => Math.random() - 0.5);
  const draftCards = shuffledStars.slice(0, 3);
  
  // 客队先选择（AI如果是客队）
  const isPlayerHomeTeam = state.isHomeTeam;
  const firstSelector = isPlayerHomeTeam ? 'ai' : 'player';
  
  return {
    ...state,
    availableDraftCards: draftCards,
    draftStep: firstSelector === 'ai' ? 2 : 1, // 1: 玩家选择, 2: AI选择, 3: 弃卡, 4: 下一轮
    message: `Draft round started - ${firstSelector === 'ai' ? 'AI (Away Team) is choosing first...' : 'You (Away Team) choose first!'}`
  };
};

export const pickDraftCard = (state: GameState, cardIndex: number): GameState => {
  if (cardIndex >= 0 && cardIndex < state.availableDraftCards.length) {
    const selectedCard = state.availableDraftCards[cardIndex];
    if (!selectedCard) return state;
    
    const newPlayerHand = [...state.playerHand, selectedCard];
    
    // 移除玩家选择的卡片
    const remainingCards = state.availableDraftCards.filter((_, idx) => idx !== cardIndex) as PlayerCard[];
    
    // 如果是玩家先选（从draftStep=1开始），则玩家选完后轮到AI选择
    // 如果是AI先选后玩家选（从draftStep=1开始，但之前AI已经选过），则玩家选完后进入弃卡阶段
    const isPlayerFirst = state.draftStep === 1 && state.availableDraftCards.length === 3; // 玩家先选时，初始有3张卡
    const isAiFirstThenPlayer = state.draftStep === 1 && state.availableDraftCards.length === 2; // AI先选后玩家选时，剩余2张卡
    
    if (isPlayerFirst) {
      // 玩家先选后，轮到AI选择
      return {
        ...state,
        playerHand: newPlayerHand,
        availableDraftCards: remainingCards,
        draftStep: 2, // AI选择阶段
        message: `You selected ${selectedCard.name}. AI is choosing...`
      };
    } else if (isAiFirstThenPlayer) {
      // AI先选后玩家选，进入弃卡阶段
      return {
        ...state,
        playerHand: newPlayerHand,
        availableDraftCards: remainingCards,
        draftStep: 3, // 弃卡阶段
        message: `You selected ${selectedCard.name}. Discarding remaining card...`
      };
    } else {
      // 其他情况，默认进入AI选择阶段
      return {
        ...state,
        playerHand: newPlayerHand,
        availableDraftCards: remainingCards,
        draftStep: 2, // AI选择阶段
        message: `You selected ${selectedCard.name}. AI is choosing...`
      };
    }
  }
  
  return state;
};

// AI选秀逻辑
export const aiPickDraftCard = (state: GameState): GameState => {
  if (state.availableDraftCards.length > 0) {
    // AI随机选择一张卡片
    const aiIndex = Math.floor(Math.random() * state.availableDraftCards.length);
    const selectedCard = state.availableDraftCards[aiIndex];
    if (!selectedCard) return state;
    
    const newAiDraftHand = [...state.aiDraftHand, selectedCard];
    
    // 移除AI选择的卡片
    const remainingCards = state.availableDraftCards.filter((_, idx) => idx !== aiIndex) as PlayerCard[];
    
    // 如果是AI先选（从draftStep=2开始），则AI选完后轮到玩家选择
    // 如果是玩家先选后AI选（从draftStep=1开始到draftStep=2），则AI选完后进入弃卡阶段
    const isAiFirst = state.draftStep === 2 && state.availableDraftCards.length === 3; // AI先选时，初始有3张卡
    
    if (isAiFirst) {
      // AI先选后，轮到玩家选择
      return {
        ...state,
        aiDraftHand: newAiDraftHand,
        availableDraftCards: remainingCards,
        draftStep: 1, // 玩家选择阶段
        message: `AI selected ${selectedCard.name}. Your turn to choose!`
      };
    } else {
      // 玩家先选后AI选，进入弃卡阶段
      return {
        ...state,
        aiDraftHand: newAiDraftHand,
        availableDraftCards: remainingCards,
        draftStep: 3, // 弃卡阶段
        message: `AI selected ${selectedCard.name}. Discarding remaining card...`
      };
    }
  }
  
  return state;
};

// 弃卡逻辑
export const discardDraftCard = (state: GameState): GameState => {
  // 清空剩余卡片并添加到已弃卡集合
  const discardedCards = state.availableDraftCards;
  const newDiscardedDraftCards = [...state.discardedDraftCards, ...discardedCards];
  const nextRound = state.draftRound + 1;
  
  // 检查是否完成选秀（双方都选了3张明星卡）
  if (state.playerHand.length >= 3 && state.aiDraftHand.length >= 3) {
    // 选秀完成，添加基础球员
    const playerBaseTeamCards = basePlayerCards.filter(card => {
      if (state.isHomeTeam) {
        return card.id.startsWith('H');
      } else {
        return card.id.startsWith('A');
      }
    });
    
    const aiBaseTeamCards = basePlayerCards.filter(card => {
      if (state.isHomeTeam) {
        return card.id.startsWith('A');
      } else {
        return card.id.startsWith('H');
      }
    });
    
    const allPlayers = [...state.playerHand, ...playerBaseTeamCards];
    const allAiPlayers = [...state.aiDraftHand, ...aiBaseTeamCards];
    
    return {
      ...state,
      playerHand: allPlayers,
      aiHand: allAiPlayers,
      availableDraftCards: [],
      discardedDraftCards: newDiscardedDraftCards,
      phase: 'squadSelection',
      draftStep: 0,
      message: 'Draft complete! Now set your squad.'
    };
  }
  
  // 进入下一轮选秀
  const shuffledStars = [...starPlayerCards]
    .filter(card => !state.playerHand.some(c => c.id === card.id) && !state.aiDraftHand.some(c => c.id === card.id) && !newDiscardedDraftCards.some(c => c.id === card.id))
    .sort(() => Math.random() - 0.5);
  const nextDraftCards = shuffledStars.slice(0, 3) as PlayerCard[];
  
  return {
    ...state,
    availableDraftCards: nextDraftCards,
    discardedDraftCards: newDiscardedDraftCards,
    draftRound: nextRound,
    draftStep: 1, // 玩家选择阶段
    message: `Round ${nextRound} started! Choose your player.`
  };
};
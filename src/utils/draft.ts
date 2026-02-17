import type { GameState } from '../game/gameLogic';
import type { athleteCard } from '../data/cards';
import { starathleteCards, baseathleteCards } from '../data/cards';

export const startDraftRound = (state: GameState): GameState => {
  // 根据selectedDraftDeck选择要抽取的卡组
  let draftPool: athleteCard[];
  switch (state.selectedDraftDeck) {
    case 'star':
      draftPool = [...state.starCardDeck];
      break;
    case 'home':
      draftPool = [...state.homeCardDeck, ...state.starCardDeck];
      break;
    case 'away':
      draftPool = [...state.awayCardDeck, ...state.starCardDeck];
      break;
    default:
      draftPool = [...state.starCardDeck];
  }

  // 从选择的卡组中随机选择3张卡片，过滤掉已经选择和丢弃的卡片
  const shuffledCards = draftPool
    .filter(card => !state.playerAthleteHand.some(c => c.id === card.id) && !state.aiAthleteHand.some(c => c.id === card.id) && !state.discardedDraftCards.some(c => c.id === card.id))
    .sort(() => Math.random() - 0.5);
  const draftCards = shuffledCards.slice(0, 3);
  
  // Draft order alternates: Round 1 - Away picks first, Round 2 - Home picks first, Round 3 - Away picks first
  // draftRound: 1, 2, 3
  // Odd rounds (1,3): Away picks first
  // Even rounds (2): Home picks first
  const isAwayFirst = state.draftRound % 2 === 1; // Odd rounds: Away picks first
  
  // Determine who picks first
  // isHomeTeam = true: Player is Home, AI is Away
  // isHomeTeam = false: Player is Away, AI is Home
  let firstSelector: 'player' | 'ai';
  if (state.isHomeTeam) {
    // Player is Home team
    firstSelector = isAwayFirst ? 'ai' : 'player';
  } else {
    // Player is Away team
    firstSelector = isAwayFirst ? 'player' : 'ai';
  }
  
  return {
    ...state,
    availableDraftCards: draftCards,
    draftStep: firstSelector === 'ai' ? 2 : 1, // 1: Player selects, 2: AI selects, 3: Discard
    message: `Draft Round ${state.draftRound} - ${firstSelector === 'player' ? 'Your turn to choose first!' : 'AI is choosing first...'}`
  };
};

export const pickDraftCard = (state: GameState, cardIndex: number): GameState => {
  // Only allow player to pick during player selection phase
  if (state.draftStep !== 1) {
    return state;
  }
  
  if (cardIndex >= 0 && cardIndex < state.availableDraftCards.length) {
    const selectedCard = state.availableDraftCards[cardIndex];
    if (!selectedCard) return state;
    
    // Remove selected card from available cards
    const remainingCards = state.availableDraftCards.filter((_, idx) => idx !== cardIndex) as athleteCard[];
    
    // Add selected card to player's hand (prevent duplicates)
    const isAlreadyInHand = state.playerAthleteHand.some(c => c.id === selectedCard.id);
    const newPlayerHand = isAlreadyInHand ? state.playerAthleteHand : [...state.playerAthleteHand, selectedCard];
    
    // Remove selected card from the corresponding deck
    let newStarCardDeck = [...state.starCardDeck];
    let newHomeCardDeck = [...state.homeCardDeck];
    let newAwayCardDeck = [...state.awayCardDeck];
    
    // Check which deck the card came from and remove it
    if (newStarCardDeck.some(card => card.id === selectedCard.id)) {
      newStarCardDeck = newStarCardDeck.filter(card => card.id !== selectedCard.id);
    } else if (newHomeCardDeck.some(card => card.id === selectedCard.id)) {
      newHomeCardDeck = newHomeCardDeck.filter(card => card.id !== selectedCard.id);
    } else if (newAwayCardDeck.some(card => card.id === selectedCard.id)) {
      newAwayCardDeck = newAwayCardDeck.filter(card => card.id !== selectedCard.id);
    }
    
    // If player picks first (starting from draftStep=1), after player picks it's AI's turn
    // If AI picked first then player picks (starting from draftStep=1 but AI already picked), after player pick go to discard phase
    const isPlayerFirst = state.draftStep === 1 && state.availableDraftCards.length === 3; // When player picks first, starts with 3 cards
    const isAiFirstThenPlayer = state.draftStep === 1 && state.availableDraftCards.length === 2; // When AI picked first then player, 2 cards remain
    
    if (isPlayerFirst) {
      // After player picks first, it's AI's turn
      return {
        ...state,
        playerAthleteHand: newPlayerHand,
        availableDraftCards: remainingCards,
        starCardDeck: newStarCardDeck,
        homeCardDeck: newHomeCardDeck,
        awayCardDeck: newAwayCardDeck,
        draftStep: 2, // AI选择阶段
        message: `You selected ${selectedCard.name}. AI is choosing...`
      };
    } else if (isAiFirstThenPlayer) {
      // AI picked first then player, go to discard phase
      return {
        ...state,
        playerAthleteHand: newPlayerHand,
        availableDraftCards: remainingCards,
        starCardDeck: newStarCardDeck,
        homeCardDeck: newHomeCardDeck,
        awayCardDeck: newAwayCardDeck,
        draftStep: 3, // Discard phase
        message: `You selected ${selectedCard.name}. Discarding remaining card...`
      };
    } else {
      // Other cases, default to AI selection phase
      return {
        ...state,
        playerAthleteHand: newPlayerHand,
        availableDraftCards: remainingCards,
        starCardDeck: newStarCardDeck,
        homeCardDeck: newHomeCardDeck,
        awayCardDeck: newAwayCardDeck,
        draftStep: 2, // AI selection phase
        message: `You selected ${selectedCard.name}. AI is choosing...`
      };
    }
  }
  
  return state;
};

// AI draft logic
export const aiPickDraftCard = (state: GameState): GameState => {
  if (state.availableDraftCards.length > 0) {
    // AI randomly selects a card
    const aiIndex = Math.floor(Math.random() * state.availableDraftCards.length);
    const selectedCard = state.availableDraftCards[aiIndex];
    if (!selectedCard) return state;
    
    // Remove AI selected card from available cards
    const remainingCards = state.availableDraftCards.filter((_, idx) => idx !== aiIndex) as athleteCard[];
    
    // Add selected card to AI's hand (prevent duplicates)
    const isAlreadyInAiHand = state.aiAthleteHand.some(c => c.id === selectedCard.id);
    const newAiHand = isAlreadyInAiHand ? state.aiAthleteHand : [...state.aiAthleteHand, selectedCard];
    
    // If AI picks first (starting from draftStep=2), after AI picks it's player's turn
    // If player picked first then AI picks (from draftStep=1 to draftStep=2), after AI pick go to discard phase
    const isAiFirst = state.draftStep === 2 && state.availableDraftCards.length === 3; // When AI picks first, starts with 3 cards
    
    if (isAiFirst) {
      // After AI picks first, it's player's turn
      return {
        ...state,
        aiAthleteHand: newAiHand,
        availableDraftCards: remainingCards,
        draftStep: 1, // Player selection phase
        message: `AI selected ${selectedCard.name}. Your turn to choose!`
      };
    } else {
      // Player picked first then AI, go to discard phase
      return {
        ...state,
        aiAthleteHand: newAiHand,
        availableDraftCards: remainingCards,
        draftStep: 3, // Discard phase
        message: `AI selected ${selectedCard.name}. Discarding remaining card...`
      };
    }
  }
  
  return state;
};

// Discard card logic
export const discardDraftCard = (state: GameState): GameState => {
  // Clear remaining cards and add to discarded collection
  const discardedCards = state.availableDraftCards;
  const newDiscardedDraftCards = [...state.discardedDraftCards, ...discardedCards];
  const nextRound = state.draftRound + 1;
  
  // Check if draft is complete (3 rounds completed)
    if (nextRound > 3) {
      // Draft complete, use the already assigned full decks
      // Distribute AI cards to hand (starters) and bench (substitutes)
      // Each team should have 13 players, 10 starters + 3 substitutes
      const aiCards = state.aiAthleteHand;
      const aiStarters = aiCards.slice(0, 10); // First 10 as starters
      const aiSubstitutes = aiCards.slice(10); // Remaining as substitutes
      
      // Distribute player cards to hand (starters) and bench (substitutes)
      const playerCards = state.playerAthleteHand;
      const playerStarters = playerCards.slice(0, 10); // First 10 as starters
      const playerSubstitutes = playerCards.slice(10); // Remaining as substitutes
      
      return {
    ...state,
    availableDraftCards: [],
    discardedDraftCards: newDiscardedDraftCards,
    aiAthleteHand: aiStarters,
    aiBench: aiSubstitutes,
    playerAthleteHand: playerStarters,
    playerBench: playerSubstitutes,
    starCardDeck: [], // Clear remaining star cards after draft
    homeCardDeck: [], // Clear remaining home cards after draft
    awayCardDeck: [], // Clear remaining away cards after draft
    phase: 'squadSelection',
    draftStep: 0,
    message: 'Draft complete! Now set your squad.'
  };
    }
  
  // Proceed to next draft round
  // 根据selectedDraftDeck选择要抽取的卡组
  let nextDraftPool: athleteCard[];
  switch (state.selectedDraftDeck) {
    case 'star':
      nextDraftPool = [...starathleteCards];
      break;
    case 'home':
      nextDraftPool = [...baseathleteCards.filter(card => card.id.startsWith('H')), ...starathleteCards];
      break;
    case 'away':
      nextDraftPool = [...baseathleteCards.filter(card => card.id.startsWith('A')), ...starathleteCards];
      break;
    default:
      nextDraftPool = [...starathleteCards];
  }

  const shuffledCards = nextDraftPool
    .filter(card => !state.playerAthleteHand.some((c: athleteCard) => c.id === card.id) && !state.aiAthleteHand.some((c: athleteCard) => c.id === card.id) && !newDiscardedDraftCards.some((c: athleteCard) => c.id === card.id))
    .sort(() => Math.random() - 0.5);
  const nextDraftCards = shuffledCards.slice(0, 3) as athleteCard[];
  
  // 如果没有可用卡片，直接结束选秀
  if (nextDraftCards.length === 0) {
    // Draft complete, use the already assigned full decks
    // Distribute AI cards to hand (starters) and bench (substitutes)
    // Each team should have 13 players, 10 starters + 3 substitutes
    const aiCards = state.aiAthleteHand;
    const aiStarters = aiCards.slice(0, 10); // First 10 as starters
    const aiSubstitutes = aiCards.slice(10); // Remaining as substitutes
    
    // Distribute player cards to hand (starters) and bench (substitutes)
    const playerCards = state.playerAthleteHand;
    const playerStarters = playerCards.slice(0, 10); // First 10 as starters
    const playerSubstitutes = playerCards.slice(10); // Remaining as substitutes
    
    return {
    ...state,
    availableDraftCards: [],
    discardedDraftCards: newDiscardedDraftCards,
    aiAthleteHand: aiStarters,
    aiBench: aiSubstitutes,
    playerAthleteHand: playerStarters,
    playerBench: playerSubstitutes,
    starCardDeck: [], // Clear remaining star cards after draft
    homeCardDeck: [], // Clear remaining home cards after draft
    awayCardDeck: [], // Clear remaining away cards after draft
    phase: 'squadSelection',
    draftStep: 0,
    message: 'Draft complete! Now set your squad.'
  };
  }
  
  // Draft order alternates: Round 1 - Away picks first, Round 2 - Home picks first, Round 3 - Away picks first
  const nextIsAwayFirst = nextRound % 2 === 1; // Odd rounds: Away picks first
  let nextFirstSelector: 'player' | 'ai';
  if (state.isHomeTeam) {
    // Player is Home team
    nextFirstSelector = nextIsAwayFirst ? 'ai' : 'player';
  } else {
    // Player is Away team
    nextFirstSelector = nextIsAwayFirst ? 'player' : 'ai';
  }
  
  return {
    ...state,
    availableDraftCards: nextDraftCards,
    discardedDraftCards: newDiscardedDraftCards,
    draftRound: nextRound,
    draftStep: nextFirstSelector === 'ai' ? 2 : 1, // 1: Player selects, 2: AI selects
    message: `Round ${nextRound} started! ${nextFirstSelector === 'player' ? 'Your turn to choose first!' : 'AI is choosing first...'}`
  };
};

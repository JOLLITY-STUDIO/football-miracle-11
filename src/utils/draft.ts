import type { GameState } from '../game/gameLogic';
import type { athleteCard } from '../data/cards';
import { starathleteCards, baseathleteCards } from '../data/cards';

export const startDraftRound = (state: GameState): GameState => {
  // Randomly select 3 star cards from the pool, filtering out already selected and discarded cards
  const shuffledStars = [...starathleteCards]
    .filter(card => !state.playerAthleteHand.some(c => c.id === card.id) && !state.aiDraftHand.some(c => c.id === card.id) && !state.discardedDraftCards.some(c => c.id === card.id))
    .sort(() => Math.random() - 0.5);
  const draftCards = shuffledStars.slice(0, 3);
  
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
  if (cardIndex >= 0 && cardIndex < state.availableDraftCards.length) {
    const selectedCard = state.availableDraftCards[cardIndex];
    if (!selectedCard) return state;
    
    const newPlayerHand = [...state.playerAthleteHand, selectedCard];
    
    // Remove selected card from available cards
    const remainingCards = state.availableDraftCards.filter((_, idx) => idx !== cardIndex) as athleteCard[];
    
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
        draftStep: 2, // AI选择阶段
        message: `You selected ${selectedCard.name}. AI is choosing...`
      };
    } else if (isAiFirstThenPlayer) {
      // AI picked first then player, go to discard phase
      return {
        ...state,
        playerAthleteHand: newPlayerHand,
        availableDraftCards: remainingCards,
        draftStep: 3, // Discard phase
        message: `You selected ${selectedCard.name}. Discarding remaining card...`
      };
    } else {
      // Other cases, default to AI selection phase
      return {
        ...state,
        playerAthleteHand: newPlayerHand,
        availableDraftCards: remainingCards,
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
    
    const newAiDraftHand = [...state.aiDraftHand, selectedCard];
    
    // Remove AI selected card from available cards
    const remainingCards = state.availableDraftCards.filter((_, idx) => idx !== aiIndex) as athleteCard[];
    
    // If AI picks first (starting from draftStep=2), after AI picks it's player's turn
    // If player picked first then AI picks (from draftStep=1 to draftStep=2), after AI pick go to discard phase
    const isAiFirst = state.draftStep === 2 && state.availableDraftCards.length === 3; // When AI picks first, starts with 3 cards
    
    if (isAiFirst) {
      // After AI picks first, it's player's turn
      return {
        ...state,
        aiDraftHand: newAiDraftHand,
        availableDraftCards: remainingCards,
        draftStep: 1, // Player selection phase
        message: `AI selected ${selectedCard.name}. Your turn to choose!`
      };
    } else {
      // Player picked first then AI, go to discard phase
      return {
        ...state,
        aiDraftHand: newAiDraftHand,
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
  
  // Check if draft is complete (both sides have selected 3 star cards)
  if (state.playerAthleteHand.length >= 3 && state.aiDraftHand.length >= 3) {
    // Draft complete, add base player cards
    const playerBaseTeamCards = baseathleteCards.filter(card => {
      if (state.isHomeTeam) {
        return card.id.startsWith('H');
      } else {
        return card.id.startsWith('A');
      }
    });
    
    const aiBaseTeamCards = baseathleteCards.filter(card => {
      if (state.isHomeTeam) {
        return card.id.startsWith('A');
      } else {
        return card.id.startsWith('H');
      }
    });
    
    const allPlayers = [...state.playerAthleteHand, ...playerBaseTeamCards];
    const allAiPlayers = [...state.aiDraftHand, ...aiBaseTeamCards];
    
    return {
      ...state,
      playerAthleteHand: allPlayers,
      aiAthleteHand: allAiPlayers,
      availableDraftCards: [],
      discardedDraftCards: newDiscardedDraftCards,
      phase: 'squadSelection',
      draftStep: 0,
      message: 'Draft complete! Now set your squad.'
    };
  }
  
  // Proceed to next draft round
  const shuffledStars = [...starathleteCards]
    .filter(card => !state.playerAthleteHand.some((c: athleteCard) => c.id === card.id) && !state.aiDraftHand.some((c: athleteCard) => c.id === card.id) && !newDiscardedDraftCards.some((c: athleteCard) => c.id === card.id))
    .sort(() => Math.random() - 0.5);
  const nextDraftCards = shuffledStars.slice(0, 3) as athleteCard[];
  
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

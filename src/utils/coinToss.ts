import type { GameState } from '../game/gameLogic';

export const performCoinToss = (state: GameState, isHomeTeam: boolean): GameState => {
  return {
    ...state,
    isHomeTeam,
    phase: 'squadSelection',
    message: isHomeTeam ? 'You won the coin toss!' : 'AI won the coin toss!'
  };
};
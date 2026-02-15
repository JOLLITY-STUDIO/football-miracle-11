import type { GameState } from '../game/gameLogic';

export const performRockPaperScissors = (state: GameState, isHomeTeam: boolean): GameState => {
  return {
    ...state,
    isHomeTeam,
    phase: 'draft',
    draftStep: 1, // 开始选秀步骤
    message: isHomeTeam ? 'You won the Rock Paper Scissors! Start drafting star players!' : 'AI won the Rock Paper Scissors! Start drafting star players!'
  };
};

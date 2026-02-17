import type { GameState } from '../game/gameLogic';
import type { GamePhase } from '../types/game';

export const performRockPaperScissors = (state: GameState, isHomeTeam: boolean): GameState => {
  return {
    ...state,
    isHomeTeam,
    // 猜拳结束后进入dealing阶段，开始抽卡
    phase: 'dealing' as GamePhase,
    message: isHomeTeam ? 'You won the Rock Paper Scissors! You are Home team!' : 'AI won the Rock Paper Scissors! You are Away team!'
  };
};

import type { GameState } from '../game/gameLogic';
import { placeCard } from './cardPlacement';
import { performEndTurn } from './endTurn';
import { RuleValidator } from '../game/ruleValidator';

// Helper function to get valid zones based on player type
const getValidZones = (type: string): number[] => {
  switch (type) {
    case 'fw':
      return [2, 3, 4, 5]; // 前锋可放置在2-5区域
    case 'mf':
      return [1, 2, 5, 6]; // 中场只能放置在1、2、5、6行
    case 'df':
      return [0, 1, 6, 7]; // 后卫只能放置在0、1、6、7行
    default:
      return [];
  }
};

export const aiTurn = (state: GameState): GameState => {
  // Basic AI implementation
  let newState = { ...state };
  
  // 1. Check if AI has cards in hand
  if (newState.aiAthleteHand.length > 0) {
    // 2. Try to place a card
    const cardToPlace = newState.aiAthleteHand[0];
    
    // Find a valid position to place the card
    if (cardToPlace) {
      const validZones = getValidZones(cardToPlace.type);
      for (let zone of validZones) {
        for (let slot = 0; slot <= 6; slot++) {
          // 使用 RuleValidator 验证放置位置（包含第一回合前锋相邻验证）
          const validationResult = RuleValidator.canPlaceCard(
            cardToPlace,
            newState.aiField,
            zone,
            slot,
            newState.isFirstTurn
          );
          
          if (validationResult.valid) {
            // Place the card
            newState = placeCard(newState, cardToPlace, zone, slot);
            newState.message = `AI placed ${cardToPlace.name}`;
            break;
          }
        }
        if (newState.aiAthleteHand.length < state.aiAthleteHand.length) {
          break;
        }
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
      newState.aiActionStep = 'placeCard';
      break;
      
    case 'placeCard':
      // AI 行动阶段 - 放置卡片
      if (newState.aiAthleteHand.length > 0) {
        const cardToPlace = newState.aiAthleteHand[0];
        
        if (cardToPlace) {
          const validZones = getValidZones(cardToPlace.type);
          for (let zone of validZones) {
            for (let slot = 0; slot <= 6; slot++) {
              // 使用 RuleValidator 验证放置位置（包含第一回合前锋相邻验证）
              const validationResult = RuleValidator.canPlaceCard(
                cardToPlace,
                newState.aiField,
                zone,
                slot,
                newState.isFirstTurn
              );
              
              if (validationResult.valid) {
                newState = placeCard(newState, cardToPlace, zone, slot);
                newState.message = `AI placed ${cardToPlace.name}`;
                break;
              }
            }
            if (newState.aiAthleteHand.length < state.aiAthleteHand.length) {
              break;
            }
          }
        }
      }
      newState.aiActionStep = 'endTurn';
      break;
      
    case 'endTurn':
      // AI 回合结束 - 使用 performEndTurn 处理回合切换逻辑（包含第一回合跳过team action）
      newState = performEndTurn(newState);
      break;
  }
  
  return newState;
};

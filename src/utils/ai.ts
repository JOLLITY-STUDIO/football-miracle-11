import type { GameState } from '../game/gameLogic';
import { placeCard } from './cardPlacement';
import { performEndTurn } from './endTurn';
import { RuleValidator } from '../game/ruleValidator';
import { performShot } from './shotActions';
import { calculateAttackPower } from './gameUtils';

// Helper function to get valid zones based on player type
const getValidZones = (type: string): number[] => {
  switch (type) {
    case 'fw':
      return [3, 2]; // 前锋优先尝试3区域，再尝试2区域（AI半场）
    case 'mf':
      return [2, 1]; // 中场优先尝试2区域，再尝试1区域（AI半场）
    case 'df':
      return [1, 0]; // 后卫优先尝试1区域，再尝试0区域（AI半场）
    default:
      return [];
  }
};

// Helper function to check if a card has available shot icons
const hasAvailableShotIcons = (card: any, usedShotIcons: number[]): boolean => {
  const iconPositions = getIconPositionsFromTactics(card);
  const attackIconPositions = iconPositions
    .map((pos, index) => ({ pos, index }))
    .filter(({ pos }) => pos.type === 'attack');
  
  const availableShotIcons = attackIconPositions
    .filter(({ index }) => !usedShotIcons.includes(index));
  
  return availableShotIcons.length > 0;
};

// Helper function to get icon positions from tactics
const getIconPositionsFromTactics = (card: any) => {
  const iconPositions = [];
  if (card.tactics?.left) {
    if (card.tactics.left.left) {
      iconPositions.push({ type: card.tactics.left.left, position: 'slot-middleLeft' });
    }
    if (card.tactics.left.top) {
      iconPositions.push({ type: card.tactics.left.top, position: 'slot-topLeft' });
    }
    if (card.tactics.left.down) {
      iconPositions.push({ type: card.tactics.left.down, position: 'slot-bottomLeft' });
    }
  }
  if (card.tactics?.right) {
    if (card.tactics.right.top) {
      iconPositions.push({ type: card.tactics.right.top, position: 'slot-topRight' });
    }
    if (card.tactics.right.down) {
      iconPositions.push({ type: card.tactics.right.down, position: 'slot-bottomRight' });
    }
    if (card.tactics.right.right) {
      iconPositions.push({ type: card.tactics.right.right, position: 'slot-middleRight' });
    }
  }
  return iconPositions;
};

// Helper function to find best player for shooting
const findBestShootingPlayer = (state: GameState) => {
  let bestPlayer = null;
  let bestSlot = -1;
  let bestZone = -1;
  let highestPower = 0;
  
  // Check all AI players on the field
  for (let zone of [3, 2, 1, 0]) { // Priority: forward zones first
    const fieldZone = state.aiField[zone];
    if (fieldZone && fieldZone.cards) {
      for (let slot = 0; slot < fieldZone.cards.length; slot++) {
        const card = fieldZone.cards[slot];
        if (card) {
          const usedShotIcons = state.aiUsedShotIcons[card.id] || [];
          if (hasAvailableShotIcons(card, usedShotIcons)) {
            const power = calculateAttackPower(card, state.aiField, usedShotIcons);
            if (power > highestPower) {
              highestPower = power;
              bestPlayer = card;
              bestSlot = slot;
              bestZone = zone;
            }
          }
        }
      }
    }
  }
  
  return { player: bestPlayer, slot: bestSlot, zone: bestZone, power: highestPower };
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
            // 只传递AI半场的zones给验证器，避免场地类型误判
            const aiHalfField = newState.aiField.filter(z => z.zone < 4);
            const validationResult = RuleValidator.canPlaceCard(
              cardToPlace,
              aiHalfField,
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
  
  // 3. Check if AI should attempt a shot
  const bestShootingOption = findBestShootingPlayer(newState);
  if (bestShootingOption.player && bestShootingOption.power >= 5) { // Only shoot if power is decent
    newState = performShot(newState, bestShootingOption.player, bestShootingOption.slot, bestShootingOption.zone);
    newState.message = `AI attempts shot with ${bestShootingOption.player.name}!`;
    return newState;
  }
  
  // 4. End AI turn
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
              // 只传递AI半场的zones给验证器，避免场地类型误判
              const aiHalfField = newState.aiField.filter(z => z.zone < 4);
              const validationResult = RuleValidator.canPlaceCard(
                cardToPlace,
                aiHalfField,
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
      newState.aiActionStep = 'shot';
      break;
      
    case 'shot':
      // AI 射门决策
      const bestShootingOption = findBestShootingPlayer(newState);
      if (bestShootingOption.player && bestShootingOption.power >= 5) { // Only shoot if power is decent
        newState = performShot(newState, bestShootingOption.player, bestShootingOption.slot, bestShootingOption.zone);
        newState.message = `AI attempts shot with ${bestShootingOption.player.name}!`;
        newState.aiActionStep = 'none'; // Shot will trigger duel phase
      } else {
        newState.aiActionStep = 'endTurn';
      }
      break;
      
    case 'endTurn':
      // AI 回合结束 - 使用 performEndTurn 处理回合切换逻辑（包含第一回合跳过team action）
      newState = performEndTurn(newState);
      break;
  }
  
  return newState;
};

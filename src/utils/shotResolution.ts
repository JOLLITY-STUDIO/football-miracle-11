import type { GameState } from '../game/gameLogic';
import { calculateDefensePower } from './gameUtils';

// Import calculateAttackPower from gameUtils
import { calculateAttackPower } from './gameUtils';

// 射门类型
export type ShotType = 'normal' | 'precision' | 'power' | 'curved';

// 天气类型
export type WeatherType = 'clear' | 'rainy' | 'windy' | 'snowy';

// 计算射门成功率
const calculateShotSuccessRate = (
  attackPower: number,
  defensePower: number,
  shotType: ShotType,
  hasPrecisionSkill: boolean,
  hasPowerSkill: boolean,
  hasCurvedSkill: boolean,
  weather: WeatherType = 'clear'
): number => {
  let baseRate = 50; // 基础成功率50%
  
  // 攻击力与防御力差值影响
  const powerDifference = attackPower - defensePower;
  baseRate += powerDifference * 5;
  
  // 射门类型影响
  switch (shotType) {
    case 'precision':
      baseRate += hasPrecisionSkill ? 20 : 10;
      break;
    case 'power':
      baseRate += hasPowerSkill ? 15 : 5;
      break;
    case 'curved':
      baseRate += hasCurvedSkill ? 18 : 8;
      break;
  }
  
  // 天气影响
  switch (weather) {
    case 'rainy':
      baseRate -= 10;
      break;
    case 'windy':
      baseRate -= 5;
      break;
    case 'snowy':
      baseRate -= 15;
      break;
  }
  
  // 确保成功率在0-100之间
  return Math.max(0, Math.min(100, baseRate));
};

// 检查球员是否有特定技能
const hasSkill = (card: any, skillType: string): boolean => {
  return card.skills && card.skills.some((skill: any) => skill.type === skillType);
};

// 解析协同卡效果
const resolveSynergyEffects = (synergyCards: any[]): { attackBonus: number; defensePenalty: number; resetShotMarkers: boolean } => {
  let attackBonus = 0;
  let defensePenalty = 0;
  let resetShotMarkers = false;
  
  synergyCards.forEach(card => {
    switch (card.type) {
      case 'attack':
      case 'tactical':
      case 'status':
      case 'event':
        attackBonus += card.value;
        break;
      case 'weather':
        if (card.value > 0) {
          attackBonus += card.value;
        } else {
          defensePenalty -= card.value;
        }
        break;
      case 'coach':
        resetShotMarkers = true;
        attackBonus += card.value;
        break;
    }
  });
  
  return { attackBonus, defensePenalty, resetShotMarkers };
};

export const resolveShot = (state: GameState): GameState => {
  if (!state.pendingShot) return state;
  
  const { attacker, defender } = state.pendingShot;
  
  const playerZones = state.currentTurn === 'player' ? state.playerField : state.aiField;
  const aiZones = state.currentTurn === 'player' ? state.aiField : state.playerField;
  
  const usedShotIcons = state.currentTurn === 'player' 
    ? (state.playerUsedShotIcons[attacker.card.id] || [])
    : (state.aiUsedShotIcons[attacker.card.id] || []);
  
  // 计算基础攻击力和防御力
  let attackPower = calculateAttackPower(attacker.card, playerZones, usedShotIcons);
  let defensePower = 0;
  if (defender) {
    defensePower = calculateDefensePower(defender.card, aiZones);
  }
  
  // 解析协同卡效果
  const playerSynergyEffects = resolveSynergyEffects(state.playerActiveSynergy);
  const aiSynergyEffects = resolveSynergyEffects(state.aiActiveSynergy);
  
  // 应用协同卡效果
  attackPower += playerSynergyEffects.attackBonus;
  defensePower -= playerSynergyEffects.defensePenalty;
  defensePower += aiSynergyEffects.attackBonus;
  attackPower -= aiSynergyEffects.defensePenalty;
  
  // 确保防御力不为负
  defensePower = Math.max(0, defensePower);
  
  // 检查球员技能
  const hasPrecisionSkill = hasSkill(attacker.card, 'precision_shot');
  const hasPowerSkill = hasSkill(attacker.card, 'power_press');
  const hasCurvedSkill = hasSkill(attacker.card, 'magician');
  const hasSolidDefenseSkill = defender ? hasSkill(defender.card, 'solid_defense') : false;
  
  // 确定射门类型（这里简化处理，实际可以根据球员技能和玩家选择来确定）
  let shotType: ShotType = 'normal';
  if (hasPrecisionSkill) shotType = 'precision';
  else if (hasPowerSkill) shotType = 'power';
  else if (hasCurvedSkill) shotType = 'curved';
  
  // 计算射门成功率
  const successRate = calculateShotSuccessRate(
    attackPower,
    defensePower,
    shotType,
    hasPrecisionSkill,
    hasPowerSkill,
    hasCurvedSkill
  );
  
  // 确定射门结果
  let result: 'goal' | 'saved' | 'missed';
  const random = Math.random() * 100;
  
  if (!defender) {
    // 无人防守，高概率进球
    result = random < 90 ? 'goal' : 'missed';
  } else {
    // 有防守，根据成功率确定结果
    if (random < successRate) {
      result = 'goal';
    } else if (random < successRate + 20) {
      result = 'saved';
    } else {
      result = 'missed';
    }
  }
  
  // 应用特殊技能效果
  if (hasSkill(attacker.card, 'free_kick_master') || hasSkill(attacker.card, 'penalty_expert')) {
    // 定位球专家和点球专家提高进球率
    if (result === 'saved') {
      result = 'goal';
    }
  }
  
  if (hasSolidDefenseSkill && result === 'goal') {
    // 坚固防守技能有机会挽救必进球
    if (Math.random() < 0.3) {
      result = 'saved';
    }
  }
  
  let newState = { ...state };
  if (result === 'goal') {
    if (state.currentTurn === 'player') {
      newState.playerScore += 1;
    } else {
      newState.aiScore += 1;
    }
  }
  
  // 重置射门标记（如果有教练卡效果）
  if (playerSynergyEffects.resetShotMarkers) {
    if (state.currentTurn === 'player') {
      newState.playerUsedShotIcons = {};
    } else {
      newState.aiUsedShotIcons = {};
    }
  }
  
  newState.pendingShot = {
    ...state.pendingShot,
    attackerPower: attackPower,
    defenderPower: defensePower,
    result,
    successRate,
    shotType
  };
  
  return newState;
};

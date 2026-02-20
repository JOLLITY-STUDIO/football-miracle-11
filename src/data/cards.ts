// 由于 athleteCard 和 SynergyCard 接口已在本文件定义，无需再从外部 types 文件导入
// 如后续抽离到独立 types 文件，可恢复对应 import
import { RuleValidator } from '../game/ruleValidator';
import { RotationUtils } from '../utils/rotationUtils';

// 选手类型 - 表示球员的位置类型
export type athleteCardType = 'fw' | 'mf' | 'df';
export type SynergyType = 'attack' | 'defense' | 'special' | 'tackle' | 'setpiece' | 'tactical' | 'status' | 'weather' | 'coach' | 'event';

// 战术图标类型 - 表示球员卡片上的半圆战术图标
export type TacticalIcon = 'attack' | 'defense' | 'pass' | 'press';

// 技能图标类型 - 表示球员的技能
export type SkillIconType = TacticalIcon | 'breakthrough' | 'breakthroughAll' | 'precision_shot' | 'solid_defense' | 'quick_pass' | 'power_press' | 'free_kick_master' | 'penalty_expert' | 'team_leader' | 'super_sub' | 'magician' | 'iron_wall';

// 技能效果类型 - 表示球员上场时可以触发的即时效果
// 这些效果会在球员上场时立即生效，如移动控制标记、抽协同卡、抢断协同卡、即时射门等
// 带闪电图标的技能会在球员上场时自动触发这些效果
export type SkillEffectType = 
  | 'move_control_1' 
  | 'move_control_2' 
  | 'draw_synergy_1' 
  | 'draw_synergy_2_choose_1' 
  | 'draw_synergy_plus_1'
  | 'steal_synergy' 
  | 'instant_shot'
  | 'ignore_defense'
  | 'press'
  | 'none';

// 技能类型 - 表示技能的性质
export type SkillType = 'normal' | 'special';

// 技能图标 - 表示球员的技能
// 技能包括战术技能（完整图标）和即时效果技能（带闪电效果）
// 战术技能代表球员自带完整图标，如进攻、传球、压迫、逼抢等
// breakthrough和breakthroughAll是技能，不是战术图标
export type SkillIcon = {
  type: SkillIconType;        // 技能类型，如进攻、传球、压迫、突破等
  skillType: SkillType;      // 技能性质，普通或特殊
  hasLightning?: boolean;    // 是否带闪电效果（即时触发）
  description?: string;       // 技能描述
  effect?: SkillEffectType;   // 技能效果类型（如果是即时效果技能）
};

export interface Tactics {
  left?: {
    left?: TacticalIcon;
    top?: TacticalIcon;
    down?: TacticalIcon;
  };
  right?: {
    top?: TacticalIcon;
    down?: TacticalIcon;
    right?: TacticalIcon;
  };
}

// Icon with position type
export interface IconWithPosition {
  type: TacticalIcon;
  position: string;
}

export interface AthleteCard {
  id: string;
  nickname: string;
  type: athleteCardType;
  positionLabel: string;
  isStar: boolean;
  unlocked: boolean;
  unlockCondition: string;
  icons: TacticalIcon[];
  tactics: Tactics;
  rotatedTactics: Tactics; // Rotated 180 degrees for AI display
  immediateEffect: SkillEffectType;
  imageUrl?: string;
  backgroundColor?: string; // 位置对应的底色
  status?: 'yellow' | 'red';
  traits?: string[];
  skills?: SkillIcon[];
}



// Backward compatibility
export type athleteCard = AthleteCard;

export interface SynergyCard {
  id: string;
  name: string;
  type: SynergyType;
  value: number;
  stars: number;
  unlocked: boolean;
  unlockCondition: string;
  imageUrl?: string;
}

export interface PenaltyCard {
  id: string;
  name: string;
  points: number;
  unlocked: boolean;
  unlockCondition: string;
  imageUrl?: string;
}

// Home Team (H01-H11)
export const homeTeamCards: athleteCard[] = [
  { id: 'H01', nickname: 'Goal Machine', type: 'fw', positionLabel: 'CF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'attack', 'press'], tactics: { left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'attack', right: 'press' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'attack', right: 'press' } }), immediateEffect: 'none', backgroundColor: '#FFFFFF', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20soccer%20striker%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20kicking%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20tall%20muscular%2C%20dark%20brown%20hair%2C%20short%20style%2C%20red%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20forwards%20position&image_size=portrait_4_3' },
  { id: 'H02', nickname: 'Left Wing Flash', type: 'fw', positionLabel: 'LWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack', 'pass', 'attack'], tactics: { left: { left: 'attack', top: 'attack', down: 'press' }, right: { top: 'attack', down: 'pass', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'press' }, right: { top: 'attack', down: 'pass', right: 'attack' } }), immediateEffect: 'none', backgroundColor: '#F5F5F5', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20left%20wing%20soccer%20player%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20dribbling%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20slim%20athletic%2C%20blonde%20hair%2C%20medium%20length%2C%20blue%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20forwards%20position&image_size=portrait_4_3' },
  { id: 'H03', nickname: 'Right Wing Wizard', type: 'fw', positionLabel: 'RWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'attack', 'press', 'attack'], tactics: { left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'attack' } }), immediateEffect: 'none', backgroundColor: '#E0E0E0', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20right%20wing%20soccer%20player%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20crossing%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20medium%20build%2C%20black%20hair%2C%20curly%20style%2C%20green%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20forwards%20position&image_size=portrait_4_3' },
  { id: 'H04', nickname: 'Midfield Commander', type: 'mf', positionLabel: 'CMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'pass', 'pass', 'press', 'pass', 'defense'], tactics: { left: { left: 'attack', top: 'pass', down: 'pass' }, right: { top: 'press', down: 'pass', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'pass' }, right: { top: 'press', down: 'pass', right: 'defense' } }), immediateEffect: 'none', backgroundColor: '#EEEEEE', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20central%20midfielder%20soccer%20player%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20passing%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20medium%20athletic%2C%20brown%20hair%2C%20short%20spiky%20style%2C%20yellow%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'H05', nickname: 'Attack Core', type: 'mf', positionLabel: 'AMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'press', 'attack', 'pass'], tactics: { left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'pass' } }), immediateEffect: 'none', backgroundColor: '#E5E5E5', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20attacking%20midfielder%20soccer%20player%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20dribbling%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20slim%20agile%2C%20light%20brown%20hair%2C%20medium%20curly%20style%2C%20orange%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'H06', nickname: 'Midfield Wall', type: 'mf', positionLabel: 'DMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'pass', 'defense', 'press', 'pass', 'defense'], tactics: { left: { left: 'pass', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'pass', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'pass', right: 'defense' } }), immediateEffect: 'draw_synergy_2_choose_1', backgroundColor: '#DEDEDE', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20defensive%20midfielder%20soccer%20player%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20tackling%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20strong%20athletic%2C%20bald%20head%2C%20purple%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'H07', nickname: 'Left Defender Rock', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['defense', 'defense', 'pass', 'defense', 'press', 'defense'], tactics: { left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'press', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'press', right: 'defense' } }), immediateEffect: 'none', backgroundColor: '#D9D9D9', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20left%20center%20back%20soccer%20player%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20defending%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20tall%20strong%2C%20blonde%20hair%2C%20short%20buzz%20cut%2C%20pink%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'H08', nickname: 'Right Defender Stone', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['defense', 'defense', 'pass', 'defense', 'press', 'defense'], tactics: { left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'press', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'press', right: 'defense' } }), immediateEffect: 'none', backgroundColor: '#D4D4D4', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20right%20center%20back%20soccer%20player%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20defending%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20medium%20tall%20strong%2C%20black%20hair%2C%20short%20side%20part%2C%20black%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'H09', nickname: 'Left Back Hunter', type: 'df', positionLabel: 'LB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense', 'press', 'pass', 'defense'], tactics: { left: { left: 'press', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'pass', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'press', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'pass', right: 'defense' } }), immediateEffect: 'draw_synergy_1', backgroundColor: '#CFD8DC', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20left%20back%20soccer%20player%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20overlapping%20forward%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20fast%20agile%2C%20red%20hair%2C%20short%20messy%20style%2C%20white%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'H10', nickname: 'Right Back Guardian', type: 'df', positionLabel: 'RB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense', 'press', 'pass', 'defense'], tactics: { left: { left: 'press', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'pass', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'press', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'pass', right: 'defense' } }), immediateEffect: 'draw_synergy_1', backgroundColor: '#B0BEC5', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20right%20back%20soccer%20player%20in%20white%20jersey%20with%20black%20lines%20and%20white%20shorts%20overlapping%20forward%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20medium%20build%20athletic%2C%20dark%20brown%20hair%2C%20medium%20length%20slicked%20back%2C%20gray%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'H11', nickname: 'Home Keeper', type: 'df', positionLabel: 'GK', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['defense', 'defense', 'defense', 'defense', 'defense', 'defense'], tactics: { left: { left: 'defense', top: 'defense', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'defense', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'defense' } }), immediateEffect: 'none', backgroundColor: '#9E9E9E', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20soccer%20goalkeeper%20in%20green%20jersey%20with%20white%20lines%20and%20green%20shorts%20diving%20to%20save%20ball%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20tall%20agile%2C%20blonde%20hair%2C%20short%20style%2C%20brown%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20goalkeeper%20position&image_size=portrait_4_3' },
];

// Away Team (A01-A10) - Same stats as Home Team
export const awayTeamCards: athleteCard[] = [
  { id: 'A01', nickname: 'Box Predator', type: 'fw', positionLabel: 'CF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], tactics: { left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'attack' } }), immediateEffect: 'none', backgroundColor: '#212121', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20soccer%20striker%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20kicking%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20stocky%20powerful%2C%20red%20hair%2C%20short%20crew%20cut%2C%20blue%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20forwards%20position&image_size=portrait_4_3' },
  { id: 'A02', nickname: 'Left Wing Blitz', type: 'fw', positionLabel: 'LWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack', 'attack', 'pass'], tactics: { left: { left: 'attack', top: 'attack', down: 'press' }, right: { top: 'attack', down: 'attack', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'press' }, right: { top: 'attack', down: 'attack', right: 'pass' } }), immediateEffect: 'none', backgroundColor: '#2E2E2E', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20left%20wing%20soccer%20player%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20dribbling%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20tall%20agile%2C%20black%20hair%2C%20medium%20length%20straight%20style%2C%20green%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20forwards%20position&image_size=portrait_4_3' },
  { id: 'A03', nickname: 'Right Wing Sniper', type: 'fw', positionLabel: 'RWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'attack', 'attack', 'press'], tactics: { left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'attack', right: 'press' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'attack', right: 'press' } }), immediateEffect: 'none', backgroundColor: '#333333', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20right%20wing%20soccer%20player%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20crossing%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20medium%20build%20agile%2C%20blonde%20hair%2C%20short%20side%20part%20style%2C%20yellow%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20forwards%20position&image_size=portrait_4_3' },
  { id: 'A04', nickname: 'Midfield Engine', type: 'mf', positionLabel: 'CMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'pass', 'pass', 'press', 'defense', 'pass'], tactics: { left: { left: 'attack', top: 'pass', down: 'pass' }, right: { top: 'press', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'pass' }, right: { top: 'press', down: 'defense', right: 'pass' } }), immediateEffect: 'none', backgroundColor: '#3E3E3E', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20central%20midfielder%20soccer%20player%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20passing%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20fit%20energetic%2C%20brown%20hair%2C%20medium%20length%20wavy%20style%2C%20red%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'A05', nickname: 'Midfield Artist', type: 'mf', positionLabel: 'AMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'attack', 'press', 'pass'], tactics: { left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'pass' } }), immediateEffect: 'none', backgroundColor: '#424242', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20attacking%20midfielder%20soccer%20player%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20dribbling%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20slim%20graceful%2C%20curly%20black%20hair%2C%20medium%20length%20style%2C%20purple%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'A06', nickname: 'Interception Master', type: 'mf', positionLabel: 'DMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'pass', 'defense', 'press', 'defense', 'pass'], tactics: { left: { left: 'pass', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'defense', right: 'pass' } }), immediateEffect: 'draw_synergy_2_choose_1', backgroundColor: '#4A4A4A', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20defensive%20midfielder%20soccer%20player%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20tackling%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20strong%20athletic%2C%20bald%20head%2C%20orange%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'A07', nickname: 'Left Defender Wall', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['defense', 'defense', 'pass', 'defense', 'defense', 'press'], tactics: { left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'press' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'press' } }), immediateEffect: 'none', backgroundColor: '#263238', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20left%20center%20back%20soccer%20player%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20defending%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20tall%20lanky%2C%20light%20brown%20hair%2C%20short%20fade%20cut%2C%20green%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'A08', nickname: 'Right Defender Fortress', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['defense', 'defense', 'pass', 'defense', 'defense', 'press'], tactics: { left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'press' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'press' } }), immediateEffect: 'none', backgroundColor: '#2C3E50', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20right%20center%20back%20soccer%20player%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20defending%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20powerful%20athletic%2C%20dark%20brown%20hair%2C%20short%20spiky%20style%2C%20pink%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'A09', nickname: 'Left Back Tracker', type: 'df', positionLabel: 'LB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense', 'press', 'defense', 'pass'], tactics: { left: { left: 'press', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'press', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'defense', right: 'pass' } }), immediateEffect: 'draw_synergy_1', backgroundColor: '#37474F', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20left%20back%20soccer%20player%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20overlapping%20forward%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20quick%20agile%2C%20blonde%20hair%2C%20medium%20length%20messy%20style%2C%20white%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'A10', nickname: 'Right Back Protector', type: 'df', positionLabel: 'RB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense', 'press', 'defense', 'pass'], tactics: { left: { left: 'press', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'press', top: 'pass', down: 'defense' }, right: { top: 'press', down: 'defense', right: 'pass' } }), immediateEffect: 'draw_synergy_1', backgroundColor: '#455A64', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20right%20back%20soccer%20player%20in%20black%20jersey%20with%20white%20lines%20and%20black%20shorts%20overlapping%20forward%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20technical%20reliable%2C%20black%20hair%2C%20short%20slicked%20back%20style%2C%20gray%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'A11', nickname: 'Away Keeper', type: 'df', positionLabel: 'GK', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['defense', 'defense', 'defense', 'defense', 'defense', 'defense'], tactics: { left: { left: 'defense', top: 'defense', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'defense', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'defense' } }), immediateEffect: 'none', backgroundColor: '#616161', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20soccer%20goalkeeper%20in%20blue%20jersey%20with%20white%20lines%20and%20blue%20shorts%20diving%20to%20save%20ball%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20tall%20agile%2C%20dark%20brown%20hair%2C%20short%20style%2C%20brown%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20goalkeeper%20position&image_size=portrait_4_3' }
];


// Combine home and away team cards for backward compatibility
export const baseathleteCards: athleteCard[] = [...homeTeamCards, ...awayTeamCards];

export const starathleteCards: athleteCard[] = [
  { id: 'SF1', nickname: 'Ace', type: 'fw', positionLabel: 'CF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'attack'], tactics: { left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'attack', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'attack', right: 'attack' } }), immediateEffect: 'instant_shot', backgroundColor: '#FF5252', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20soccer%20striker%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20kicking%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20super%20star%2C%20heroic%20pose%2C%20dark%20brown%20hair%2C%20short%20messy%20style%2C%20red%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20forwards%20position&image_size=portrait_4_3' },
  { id: 'SF2', nickname: 'Lightning', type: 'fw', positionLabel: 'LWF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'press', 'attack'], tactics: { left: { down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }), immediateEffect: 'none', backgroundColor: '#FF6E40', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20left%20wing%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20dribbling%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20fast%20agile%2C%20lightning%20speed%2C%20blonde%20hair%2C%20medium%20length%20spiky%20style%2C%20blue%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20forwards%20position&image_size=portrait_4_3' },
  { id: 'SF3', nickname: 'Finisher', type: 'fw', positionLabel: 'CF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'press'], tactics: { left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'press' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'press' } }), immediateEffect: 'none', backgroundColor: '#FF5252', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20soccer%20striker%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20scoring%20goal%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20clinical%20finisher%2C%20celebration%20pose%2C%20black%20hair%2C%20short%20slicked%20back%20style%2C%20green%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20forwards%20position&image_size=portrait_4_3' },
  
  { id: 'SM1', nickname: 'Commander', type: 'mf', positionLabel: 'CMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'pass', 'pass', 'press'], tactics: { left: { left: 'press', top: 'pass', down: 'press' }, right: { top: 'pass', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'press', top: 'pass', down: 'press' }, right: { top: 'pass', right: 'pass' } }), immediateEffect: 'instant_shot', backgroundColor: '#4CAF50', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20central%20midfielder%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20passing%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20leader%20on%20field%2C%20commanding%20presence%2C%20brown%20hair%2C%20short%20side%20part%20style%2C%20yellow%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'SM2', nickname: 'Playmaker', type: 'mf', positionLabel: 'AMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'pass', 'press'], tactics: { left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'attack' } }), immediateEffect: 'none', backgroundColor: '#66BB6A', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20attacking%20midfielder%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20dribbling%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20creative%20playmaker%2C%20visionary%2C%20curly%20brown%20hair%2C%20medium%20length%20style%2C%20orange%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'SM3', nickname: 'Ball Winner', type: 'mf', positionLabel: 'DMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['pass', 'press', 'press', 'pass', 'pass'], tactics: { left: { left: 'pass', top: 'press', down: 'pass' }, right: { top: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'press', down: 'pass' }, right: { top: 'press', right: 'pass' } }), immediateEffect: 'draw_synergy_2_choose_1', backgroundColor: '#81C784', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20defensive%20midfielder%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20tackling%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20tough%20ball%20winner%2C%20strong%20tackler%2C%20bald%20head%2C%20purple%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'SM4', nickname: 'Magician', type: 'mf', positionLabel: 'CMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'pass', 'pass', 'attack', 'press'], tactics: { left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'pass' } }), immediateEffect: 'draw_synergy_2_choose_1', backgroundColor: '#4CAF50', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20central%20midfielder%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20performing%20skill%20move%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20magical%20skills%2C%20trickster%2C%20light%20brown%20hair%2C%20medium%20curly%20style%2C%20pink%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  { id: 'SM5', nickname: 'Engine', type: 'mf', positionLabel: 'CMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['pass', 'pass', 'pass', 'pass', 'press', 'press'], tactics: { left: { left: 'pass', top: 'pass', down: 'press' }, right: { top: 'pass', down: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'pass', down: 'press' }, right: { top: 'pass', down: 'press', right: 'pass' } }), immediateEffect: 'draw_synergy_1', backgroundColor: '#4CAF50', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20central%20midfielder%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20running%20with%20football%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20endless%20energy%2C%20box-to-box%20player%2C%20dark%20brown%20hair%2C%20short%20spiky%20style%2C%20black%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20midfielders%20position&image_size=portrait_4_3' },
  
  { id: 'SB1', nickname: 'Rock', type: 'df', positionLabel: 'CB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'pass', 'pass', 'defense', 'defense'], tactics: { left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'pass' } }), immediateEffect: 'steal_synergy', backgroundColor: '#2196F3', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20center%20back%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20defending%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20rock%20solid%20defender%2C%20imposing%20figure%2C%20black%20hair%2C%20short%20buzz%20cut%2C%20white%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'SB2', nickname: 'Wing Wizard', type: 'df', positionLabel: 'LB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'defense'], tactics: { right: { top: 'press', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ right: { top: 'press', down: 'defense', right: 'pass' } }), immediateEffect: 'draw_synergy_1', backgroundColor: '#42A5F5', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20left%20back%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20overlapping%20forward%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20wing%20wizard%2C%20technical%20fullback%2C%20blonde%20hair%2C%20medium%20length%20messy%20style%2C%20gray%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'SB3', nickname: 'Guardian', type: 'df', positionLabel: 'CB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'defense', 'pass', 'pass', 'defense'], tactics: { left: { left: 'defense', top: 'defense', down: 'pass' }, right: { top: 'defense', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'defense', down: 'pass' }, right: { top: 'defense', down: 'defense', right: 'pass' } }), immediateEffect: 'steal_synergy', backgroundColor: '#2196F3', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20center%20back%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20clearing%20ball%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20guardian%20of%20the%20goal%2C%20protective%20stance%2C%20brown%20hair%2C%20short%20fade%20cut%2C%20gray%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'SB4', nickname: 'Overlap King', type: 'df', positionLabel: 'RB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'defense'], tactics: { left: { left: 'pass', top: 'press', down: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'press', down: 'defense' } }), immediateEffect: 'draw_synergy_1', skills: [{ type: 'press', skillType: 'normal', hasLightning: false, description: '压迫' }], backgroundColor: '#64B5F6', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20right%20back%20soccer%20player%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20overlapping%20forward%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20overlap%20king%2C%20high%20energy%20fullback%2C%20dark%20brown%20hair%2C%20medium%20length%20slicked%20back%20style%2C%20brown%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20defenders%20position&image_size=portrait_4_3' },
  { id: 'SG1', nickname: 'Wall', type: 'df', positionLabel: 'GK', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'defense', 'defense'], tactics: { left: { left: 'defense', top: 'defense', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'defense', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'defense' } }), immediateEffect: 'none', backgroundColor: '#9E9E9E', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20soccer%20goalkeeper%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20diving%20to%20save%20ball%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20tall%20agile%2C%20blonde%20hair%2C%20short%20style%2C%20red%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20goalkeeper%20position&image_size=portrait_4_3' },
  { id: 'SG2', nickname: 'Sweeper Keeper', type: 'df', positionLabel: 'GK', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'defense', 'pass'], tactics: { left: { left: 'defense', top: 'defense', down: 'defense' }, right: { top: 'defense', down: 'pass', right: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'defense', down: 'defense' }, right: { top: 'defense', down: 'pass', right: 'defense' } }), immediateEffect: 'draw_synergy_1', backgroundColor: '#9E9E9E', imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flat%20anime%20style%20star%20soccer%20goalkeeper%20in%20golden%20jersey%20with%20white%20lines%20and%20white%20shorts%20passing%20ball%20with%20feet%2C%20dynamic%20action%20pose%2C%20distinctive%20features%3A%20adult%20age%2C%20tall%20agile%2C%20dark%20brown%20hair%2C%20short%20style%2C%20blue%20football%20boots%2C%20no%20facial%20features%2C%20no%20eyes%2C%20no%20nose%2C%20no%20mouth%2C%20no%20ears%2C%20faceless%2C%20solid%20red%20background%20goalkeeper%20position&image_size=portrait_4_3' },
];


export const athleteCards: athleteCard[] = [...baseathleteCards, ...starathleteCards];

export const synergyCards: SynergyCard[] = [
  // 1星协同卡（3张）
  { id: '4001', name: '1', type: 'attack', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4002', name: '1+铲球', type: 'tackle', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4003', name: '1+铲球', type: 'tackle', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 2星协同卡（5张）
  { id: '4004', name: '2', type: 'defense', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4005', name: '2', type: 'defense', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4006', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4007', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4008', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 3星协同卡（10张）
  { id: '4009', name: '3', type: 'attack', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4010', name: '3', type: 'attack', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4011', name: '3', type: 'attack', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4012', name: '3', type: 'defense', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4013', name: '3', type: 'defense', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4014', name: '3', type: 'defense', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4015', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4016', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4017', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4018', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 4星协同卡（5张）
  { id: '4019', name: '4', type: 'attack', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4020', name: '4', type: 'attack', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4021', name: '4', type: 'defense', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4022', name: '4', type: 'defense', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4023', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 5星协同卡（2张）
  { id: '4024', name: '5', type: 'attack', value: 5, stars: 5, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4025', name: '5', type: 'defense', value: 5, stars: 5, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 新协同卡类型
  // 战术卡
  { id: '4026', name: '战术支援', type: 'tactical', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4027', name: '战术大师', type: 'tactical', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 状态卡
  { id: '4028', name: '士气提升', type: 'status', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4029', name: '疲劳恢复', type: 'status', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 天气卡
  { id: '4030', name: '晴天', type: 'weather', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4031', name: '雨天', type: 'weather', value: -1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 教练卡
  { id: '4032', name: '临场指挥', type: 'coach', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4033', name: '战术调整', type: 'coach', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 特殊事件卡
  { id: '4034', name: '幸运时刻', type: 'event', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4035', name: '关键时刻', type: 'event', value: 5, stars: 5, unlocked: true, unlockCondition: 'Unlocked by default' },
];

// 协同卡效果映射
export const synergyCardEffects: Record<string, string> = {
  'tactical': '增加射门成功率10%',
  'status': '减少对手防守能力1点',
  'weather': '影响所有球员的射门和防守',
  'coach': '重置所有射门标记',
  'event': '随机获得额外效果',
};

export const penaltyCards: PenaltyCard[] = [
  { id: '5001', name: '点球-左上', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '5002', name: '点球-左下', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '5003', name: '点球-中间', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '5004', name: '点球-右上', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '5005', name: '点球-右下', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
];

export const penaltyDefenseCards: PenaltyCard[] = [
  { id: '6001', name: '点球防守-左上', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '6002', name: '点球防守-左下', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '6003', name: '点球防守-右上', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '6004', name: '点球防守-右下', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '6005', name: '点球防守-左侧', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '6006', name: '点球防守-右侧', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
];

// 扩展的防守卡覆盖范围映射
export const penaltyDefenseCoverage = {
  '6001': ['左上', '中间'], // 点球防守-左上（包含中间）
  '6002': ['左下', '中间'], // 点球防守-左下（包含中间）
  '6003': ['右上', '中间'], // 点球防守-右上（包含中间）
  '6004': ['右下', '中间'], // 点球防守-右下（包含中间）
  '6005': ['左上', '左下'], // 点球防守-左侧（只覆盖左上和左下，不带中间�?
  '6006': ['右上', '右下'], // 点球防守-右侧（只覆盖右上和右下，不带中间�?
};

export function getImmediateEffectDescription(effect: SkillEffectType): string {
  switch (effect) {
    case 'move_control_1': return 'Move control marker 1 space toward opponent';
    case 'move_control_2': return 'Move control marker 2 spaces toward opponent';
    case 'draw_synergy_1': return 'Draw 1 synergy card';
    case 'draw_synergy_2_choose_1': return 'Draw 2 synergy cards, choose 1 to keep';
    case 'steal_synergy': return 'Steal and discard 1 synergy card from opponent\'s hand';
    case 'instant_shot': return 'Use this card to attempt a shot';
    default: return '';
  }
}

export function getIconDisplay(icon: SkillIconType): { symbol: string; color: string; image: string } {
  switch (icon) {
    case 'attack': return { symbol: '⚔️', color: '#E53935', image: '/icons/icon-shoot.svg' };
    case 'defense': return { symbol: '🛡️', color: '#1E88E5', image: '/icons/icon-defense.svg' };
    case 'pass': return { symbol: '🔄', color: '#43A047', image: '/icons/icon-pass.png' };
    case 'press': return { symbol: '👊', color: '#FB8C00', image: '/icons/icon-press.svg' };
    case 'breakthrough': return { symbol: '💨', color: '#9C27B0', image: '/icons/icon-shoot.svg' };
    case 'breakthroughAll': return { symbol: '💥', color: '#E91E63', image: '/icons/icon-shoot.svg' };
    case 'precision_shot': return { symbol: '🎯', color: '#2196F3', image: '/icons/icon-shoot.svg' };
    case 'solid_defense': return { symbol: '🛡️', color: '#0D47A1', image: '/icons/icon-defense.svg' };
    case 'quick_pass': return { symbol: '⚡', color: '#4CAF50', image: '/icons/icon-pass.png' };
    case 'power_press': return { symbol: '💪', color: '#FF9800', image: '/icons/icon-press.svg' };
    case 'free_kick_master': return { symbol: '⚽', color: '#9C27B0', image: '/icons/icon-shoot.svg' };
    case 'penalty_expert': return { symbol: '🥅', color: '#E91E63', image: '/icons/icon-shoot.svg' };
    case 'team_leader': return { symbol: '👑', color: '#FFC107', image: '/icons/icon-pass.png' };
    case 'super_sub': return { symbol: '✨', color: '#673AB7', image: '/icons/icon-shoot.svg' };
    case 'magician': return { symbol: '🪄', color: '#00BCD4', image: '/icons/icon-pass.png' };
    case 'iron_wall': return { symbol: '🛡️', color: '#37474F', image: '/icons/icon-defense.svg' };
  }
}

export function canPlaceCardAtSlot(
  card: AthleteCard,
  fieldSlots: any[],
  zone: number,
  startCol: number,
  isFirstTurn: boolean
): boolean {
  const result = RuleValidator.canPlaceCard(card, fieldSlots, zone, startCol, isFirstTurn);
  return result.valid;
}







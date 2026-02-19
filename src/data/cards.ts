// 由于 athleteCard 和 SynergyCard 接口已在本文件定义，无需再从外部 types 文件导入
// 如后续抽离到独立 types 文件，可恢复对应 import
import { RuleValidator } from '../game/ruleValidator';
import { RotationUtils } from '../utils/rotationUtils';

// 选手类型 - 表示球员的位置类型
export type athleteCardType = 'fw' | 'mf' | 'df';
export type SynergyType = 'attack' | 'defense' | 'special' | 'tackle' | 'setpiece';

// 战术图标类型 - 表示球员卡片上的半圆战术图标
export type TacticalIcon = 'attack' | 'defense' | 'pass' | 'press';

// 技能图标类型 - 表示球员的技能
export type SkillIconType = TacticalIcon | 'breakthrough' | 'breakthroughAll';

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
  realName: string;
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

// Home Team (H01-H10)
export const homeTeamCards: athleteCard[] = [
  { id: 'H01', nickname: 'Striker', realName: 'John Smith', type: 'fw', positionLabel: 'CF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], tactics: { left: { left: 'attack', top: 'attack', down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cf-striker.png' },
  { id: 'H02', nickname: 'Left Winger', realName: 'David Johnson', type: 'fw', positionLabel: 'LWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack'], tactics: { left: { down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-lw-winger.png' },
  { id: 'H03', nickname: 'Right Winger', realName: 'Michael Brown', type: 'fw', positionLabel: 'RWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'press'], tactics: { left: { left: 'attack', top: 'attack', down: 'attack' }, right: { down: 'press' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'attack' }, right: { down: 'press' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-rw-winger.png' },
  { id: 'H04', nickname: 'Central Midfielder', realName: 'James Wilson', type: 'mf', positionLabel: 'CMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], tactics: { left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'press', down: 'pass', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'press', down: 'pass', right: 'pass' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cm-playmaker.png' },
  { id: 'H05', nickname: 'Attacking Midfielder', realName: 'Robert Taylor', type: 'mf', positionLabel: 'AMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'press'], tactics: { left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'attack' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-am-chancemaker.png' },
  { id: 'H06', nickname: 'Defensive Midfielder', realName: 'William Anderson', type: 'mf', positionLabel: 'DMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'press', 'pass', 'pass', 'pass'], tactics: { left: { left: 'pass', top: 'pass', down: 'pass' }, right: { top: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'pass', down: 'pass' }, right: { top: 'press', right: 'pass' } }), immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-home-dmf-tempo.png' },
  { id: 'H07', nickname: 'Left Center Back', realName: 'Richard Martinez', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], tactics: { left: { top: 'pass', down: 'defense' }, right: { down: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { top: 'pass', down: 'defense' }, right: { down: 'defense' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cb-l.png' },
  { id: 'H08', nickname: 'Right Center Back', realName: 'Thomas Garcia', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], tactics: { left: { down: 'defense' }, right: { top: 'pass', down: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { down: 'defense' }, right: { top: 'pass', down: 'defense' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cb-r.png' },
  { id: 'H09', nickname: 'Left Back', realName: 'Charles Lee', type: 'df', positionLabel: 'LB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], tactics: { right: { top: 'press', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ right: { top: 'press', down: 'defense', right: 'pass' } }), immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-lb-fullback.png' },
  { id: 'H10', nickname: 'Right Back', realName: 'Joseph Kim', type: 'df', positionLabel: 'RB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], tactics: { left: { left: 'pass', top: 'press', down: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'press', down: 'defense' } }), immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-rb-fullback.png' },
];

// Away Team (A01-A10) - Same stats as Home Team
export const awayTeamCards: athleteCard[] = [
  { id: 'A01', nickname: 'Striker', realName: 'Alex Rodriguez', type: 'fw', positionLabel: 'CF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], tactics: { left: { left: 'attack', top: 'attack', down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cf-striker.png' },
  { id: 'A02', nickname: 'Left Winger', realName: 'Brian Chavez', type: 'fw', positionLabel: 'LWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack'], tactics: { left: { down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-lw-winger.png' },
  { id: 'A03', nickname: 'Right Winger', realName: 'Carlos Mendez', type: 'fw', positionLabel: 'RWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'press'], tactics: { left: { left: 'attack', top: 'attack', down: 'attack' }, right: { down: 'press' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'attack' }, right: { down: 'press' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-rw-winger.png' },
  { id: 'A04', nickname: 'Central Midfielder', realName: 'Daniel Torres', type: 'mf', positionLabel: 'CMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], tactics: { left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'press', down: 'pass', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'press', down: 'pass', right: 'pass' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cm-playmaker.png' },
  { id: 'A05', nickname: 'Attacking Midfielder', realName: 'Eduardo Santos', type: 'mf', positionLabel: 'AMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'press'], tactics: { left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'attack' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-am-chancemaker.png' },
  { id: 'A06', nickname: 'Defensive Midfielder', realName: 'Francisco Lopez', type: 'mf', positionLabel: 'DMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'press', 'pass', 'pass', 'pass'], tactics: { left: { left: 'pass', top: 'pass', down: 'pass' }, right: { top: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'pass', down: 'pass' }, right: { top: 'press', right: 'pass' } }), immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-away-dmf-tempo.png' },
  { id: 'A07', nickname: 'Left Center Back', realName: 'Gustavo Herrera', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], tactics: { left: { top: 'pass', down: 'defense' }, right: { down: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { top: 'pass', down: 'defense' }, right: { down: 'defense' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cb-l.png' },
  { id: 'A08', nickname: 'Right Center Back', realName: 'Hector Gutierrez', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], tactics: { left: { down: 'defense' }, right: { top: 'pass', down: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { down: 'defense' }, right: { top: 'pass', down: 'defense' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cb-r.png' },
  { id: 'A09', nickname: 'Left Back', realName: 'Ivan Cruz', type: 'df', positionLabel: 'LB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], tactics: { right: { top: 'press', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ right: { top: 'press', down: 'defense', right: 'pass' } }), immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-away-lb-fullback.png' },
  { id: 'A10', nickname: 'Right Back', realName: 'Javier Moreno', type: 'df', positionLabel: 'RB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], tactics: { left: { left: 'pass', top: 'press', down: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'press', down: 'defense' } }), immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-away-rb-fullback.png' },
];

// Combine home and away team cards for backward compatibility
export const baseathleteCards: athleteCard[] = [...homeTeamCards, ...awayTeamCards];

export const starathleteCards: athleteCard[] = [
  { id: 'SF1', nickname: 'Ace', realName: 'Messi', type: 'fw', positionLabel: 'CF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'attack'], tactics: { left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'attack', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'attack', right: 'attack' } }), immediateEffect: 'instant_shot', imageUrl: '/images/cards/players/star-cf-target-man.png' },
  { id: 'SF2', nickname: 'Lightning', realName: 'Mbappe', type: 'fw', positionLabel: 'LWF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'press', 'attack'], tactics: { left: { down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { down: 'press' }, right: { top: 'attack', down: 'attack', right: 'attack' } }), immediateEffect: 'none' },
  { id: 'SF3', nickname: 'Finisher', realName: 'Haaland', type: 'fw', positionLabel: 'CF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'press'], tactics: { left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'press' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'attack', down: 'attack' }, right: { top: 'attack', down: 'press' } }), immediateEffect: 'none', imageUrl: '/images/cards/players/star-cf-target-man.png' },
  
  { id: 'SM1', nickname: 'Commander', realName: 'Modric', type: 'mf', positionLabel: 'CMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'pass', 'pass', 'press'], tactics: { left: { left: 'press', top: 'pass', down: 'press' }, right: { top: 'pass', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'press', top: 'pass', down: 'press' }, right: { top: 'pass', right: 'pass' } }), immediateEffect: 'instant_shot', imageUrl: '/images/cards/players/star-dmf-cannon-shot.png' },
  { id: 'SM2', nickname: 'Playmaker', realName: 'De Bruyne', type: 'mf', positionLabel: 'AMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'pass', 'press'], tactics: { left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'attack' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'press' }, right: { top: 'attack' } }), immediateEffect: 'none' },
  { id: 'SM3', nickname: 'Ball Winner', realName: 'Kante', type: 'mf', positionLabel: 'DMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['pass', 'press', 'press', 'pass', 'pass'], tactics: { left: { left: 'pass', top: 'press', down: 'pass' }, right: { top: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'press', down: 'pass' }, right: { top: 'press', right: 'pass' } }), immediateEffect: 'draw_synergy_2_choose_1' },
  { id: 'SM4', nickname: 'Magician', realName: 'Zidane', type: 'mf', positionLabel: 'CMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'pass', 'pass', 'attack', 'press'], tactics: { left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'attack', top: 'pass', down: 'attack' }, right: { top: 'attack', down: 'press', right: 'pass' } }), immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/star-amf-killer-pass.png' },
  { id: 'SM5', nickname: 'Engine', realName: 'Kroos', type: 'mf', positionLabel: 'CMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['pass', 'pass', 'pass', 'pass', 'press', 'press'], tactics: { left: { left: 'pass', top: 'pass', down: 'press' }, right: { top: 'pass', down: 'press', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'pass', down: 'press' }, right: { top: 'pass', down: 'press', right: 'pass' } }), immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/star-amf-killer-pass.png' },
  
  { id: 'SB1', nickname: 'Rock', realName: 'Van Dijk', type: 'df', positionLabel: 'CB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'pass', 'pass', 'defense', 'defense'], tactics: { left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'pass', down: 'defense' }, right: { top: 'defense', down: 'defense', right: 'pass' } }), immediateEffect: 'steal_synergy', imageUrl: '/images/cards/players/star-cb-sweeper.png' },
  { id: 'SB2', nickname: 'Wing Wizard', realName: 'Alphonso', type: 'df', positionLabel: 'LB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'defense'], tactics: { right: { top: 'press', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ right: { top: 'press', down: 'defense', right: 'pass' } }), immediateEffect: 'draw_synergy_1' },
  { id: 'SB3', nickname: 'Guardian', realName: 'Ruben Dias', type: 'df', positionLabel: 'CB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'defense', 'pass', 'pass', 'defense'], tactics: { left: { left: 'defense', top: 'defense', down: 'pass' }, right: { top: 'defense', down: 'defense', right: 'pass' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'defense', top: 'defense', down: 'pass' }, right: { top: 'defense', down: 'defense', right: 'pass' } }), immediateEffect: 'steal_synergy', imageUrl: '/images/cards/players/star-cb-sweeper.png' },
  { id: 'SB4', nickname: 'Overlap King', realName: 'Robertson', type: 'df', positionLabel: 'RB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'defense'], tactics: { left: { left: 'pass', top: 'press', down: 'defense' } }, rotatedTactics: RotationUtils.generateRotatedTactics({ left: { left: 'pass', top: 'press', down: 'defense' } }), immediateEffect: 'draw_synergy_1', skills: [{ type: 'press', skillType: 'normal', hasLightning: false, description: '压迫' }] },
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
];

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







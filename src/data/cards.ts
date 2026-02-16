// 由于 athleteCard 和 SynergyCard 接口已在本文件定义，无需再从外部 types 文件导入
// 如后续抽离到独立 types 文件，可恢复对应 import
import { RuleValidator } from '../game/ruleValidator';

export type CardType = 'fw' | 'mf' | 'df';
export type SynergyType = 'attack' | 'defense' | 'special' | 'tackle' | 'setpiece';
export type TacticalIcon = 'attack' | 'defense' | 'pass' | 'press' | 'breakthrough' | 'breakthroughAll';
export type ImmediateEffectType = 
  | 'move_control_1' 
  | 'move_control_2' 
  | 'draw_synergy_1' 
  | 'draw_synergy_2_choose_1' 
  | 'draw_synergy_plus_1'
  | 'steal_synergy' 
  | 'instant_shot'
  | 'ignore_defense'
  | 'none';

export type SkillType = 'normal' | 'special';
export type SkillIcon = {
  type: TacticalIcon;
  skillType: SkillType;
  hasLightning?: boolean;
  description?: string;
};

export type IconPosition = 
  | 'slot-topLeft' | 'slot-topRight' 
  | 'slot-middleLeft' | 'slot-middleRight' 
  | 'slot-bottomLeft' | 'slot-bottomRight';

export interface IconWithPosition {
  type: TacticalIcon;
  position: IconPosition;
}

export interface AthleteCard {
  id: string;
  nickname: string;
  realName: string;
  type: CardType;
  positionLabel: string;
  isStar: boolean;
  unlocked: boolean;
  unlockCondition: string;
  icons: TacticalIcon[];
  iconPositions: IconWithPosition[];
  immediateEffect: ImmediateEffectType;
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

export const baseathleteCards: athleteCard[] = [
  // Home Team (H01-H10)
  { id: 'H01', nickname: 'Striker', realName: 'John Smith', type: 'fw', positionLabel: 'CF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-topRight' }, { type: 'attack', position: 'slot-middleLeft' }, { type: 'attack', position: 'slot-middleRight' }, { type: 'press', position: 'slot-bottomLeft' }, { type: 'attack', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cf-striker.png' },
  { id: 'H02', nickname: 'Left Winger', realName: 'David Johnson', type: 'fw', positionLabel: 'LWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot-topRight' }, { type: 'attack', position: 'slot-middleRight' }, { type: 'press', position: 'slot-bottomLeft' }, { type: 'attack', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-lw-winger.png' },
  { id: 'H03', nickname: 'Right Winger', realName: 'Michael Brown', type: 'fw', positionLabel: 'RWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-middleLeft' }, { type: 'attack', position: 'slot-bottomLeft' }, { type: 'press', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-rw-winger.png' },
  { id: 'H04', nickname: 'Central Midfielder', realName: 'James Wilson', type: 'mf', positionLabel: 'CMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'press', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'press', position: 'slot-bottomLeft' }, { type: 'pass', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cm-playmaker.png' },
  { id: 'H05', nickname: 'Attacking Midfielder', realName: 'Robert Taylor', type: 'mf', positionLabel: 'AMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'press', position: 'slot-bottomLeft' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-am-chancemaker.png' },
  { id: 'H06', nickname: 'Defensive Midfielder', realName: 'William Anderson', type: 'mf', positionLabel: 'DMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'press', 'pass', 'pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot-topLeft' }, { type: 'press', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'pass', position: 'slot-bottomLeft' }], immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-home-dmf-tempo.png' },
  { id: 'H07', nickname: 'Left Center Back', realName: 'Richard Martinez', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot-topLeft' }, { type: 'defense', position: 'slot-bottomLeft' }, { type: 'defense', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cb-l.png' },
  { id: 'H08', nickname: 'Right Center Back', realName: 'Thomas Garcia', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot-topRight' }, { type: 'defense', position: 'slot-bottomLeft' }, { type: 'defense', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cb-r.png' },
  { id: 'H09', nickname: 'Left Back', realName: 'Charles Lee', type: 'df', positionLabel: 'LB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'defense', position: 'slot-bottomRight' }], immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-lb-fullback.png' },
  { id: 'H10', nickname: 'Right Back', realName: 'Joseph Kim', type: 'df', positionLabel: 'RB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot-topLeft' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'defense', position: 'slot-bottomLeft' }], immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-rb-fullback.png' },

  // Away Team (A01-A10) - Same stats as Home Team
  { id: 'A01', nickname: 'Striker', realName: 'Alex Rodriguez', type: 'fw', positionLabel: 'CF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-topRight' }, { type: 'attack', position: 'slot-middleLeft' }, { type: 'attack', position: 'slot-middleRight' }, { type: 'press', position: 'slot-bottomLeft' }, { type: 'attack', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cf-striker.png' },
  { id: 'A02', nickname: 'Left Winger', realName: 'Brian Chavez', type: 'fw', positionLabel: 'LWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot-topRight' }, { type: 'attack', position: 'slot-middleRight' }, { type: 'press', position: 'slot-bottomLeft' }, { type: 'attack', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-lw-winger.png' },
  { id: 'A03', nickname: 'Right Winger', realName: 'Carlos Mendez', type: 'fw', positionLabel: 'RWF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-middleLeft' }, { type: 'attack', position: 'slot-bottomLeft' }, { type: 'press', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-rw-winger.png' },
  { id: 'A04', nickname: 'Central Midfielder', realName: 'Daniel Torres', type: 'mf', positionLabel: 'CMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'press', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'press', position: 'slot-bottomLeft' }, { type: 'pass', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cm-playmaker.png' },
  { id: 'A05', nickname: 'Attacking Midfielder', realName: 'Eduardo Santos', type: 'mf', positionLabel: 'AMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'press', position: 'slot-bottomLeft' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-am-chancemaker.png' },
  { id: 'A06', nickname: 'Defensive Midfielder', realName: 'Francisco Lopez', type: 'mf', positionLabel: 'DMF', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'press', 'pass', 'pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot-topLeft' }, { type: 'press', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'pass', position: 'slot-bottomLeft' }], immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-away-dmf-tempo.png' },
  { id: 'A07', nickname: 'Left Center Back', realName: 'Gustavo Herrera', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot-topLeft' }, { type: 'defense', position: 'slot-bottomLeft' }, { type: 'defense', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cb-l.png' },
  { id: 'A08', nickname: 'Right Center Back', realName: 'Hector Gutierrez', type: 'df', positionLabel: 'CB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot-topRight' }, { type: 'defense', position: 'slot-bottomLeft' }, { type: 'defense', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cb-r.png' },
  { id: 'A09', nickname: 'Left Back', realName: 'Ivan Cruz', type: 'df', positionLabel: 'LB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'defense', position: 'slot-bottomRight' }], immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-away-lb-fullback.png' },
  { id: 'A10', nickname: 'Right Back', realName: 'Javier Moreno', type: 'df', positionLabel: 'RB', isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot-topLeft' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'defense', position: 'slot-bottomLeft' }], immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-away-rb-fullback.png' },
];

export const starathleteCards: athleteCard[] = [
  { id: 'SF1', nickname: 'Ace', realName: 'Messi', type: 'fw', positionLabel: 'CF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'attack'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-topRight' }, { type: 'attack', position: 'slot-bottomLeft' }, { type: 'attack', position: 'slot-bottomRight' }], immediateEffect: 'instant_shot', imageUrl: '/images/cards/players/star-cf-target-man.png' },
  { id: 'SF2', nickname: 'Lightning', realName: 'Mbappe', type: 'fw', positionLabel: 'LWF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot-topRight' }, { type: 'attack', position: 'slot-middleRight' }, { type: 'press', position: 'slot-bottomLeft' }, { type: 'attack', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-lw-winger.png' },
  { id: 'SF3', nickname: 'Finisher', realName: 'Haaland', type: 'fw', positionLabel: 'CF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-topRight' }, { type: 'attack', position: 'slot-bottomLeft' }, { type: 'press', position: 'slot-bottomRight' }], immediateEffect: 'none', imageUrl: '/images/cards/players/star-cf-target-man.png' },
  
  { id: 'SM1', nickname: 'Commander', realName: 'Modric', type: 'mf', positionLabel: 'CMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'pass', 'pass', 'press'], iconPositions: [{ type: 'press', position: 'slot-topLeft' }, { type: 'pass', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'press', position: 'slot-bottomLeft' }], immediateEffect: 'instant_shot', imageUrl: '/images/cards/players/star-dmf-cannon-shot.png' },
  { id: 'SM2', nickname: 'Playmaker', realName: 'De Bruyne', type: 'mf', positionLabel: 'AMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'press', position: 'slot-bottomLeft' }], immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-am-chancemaker.png' },
  { id: 'SM3', nickname: 'Ball Winner', realName: 'Kante', type: 'mf', positionLabel: 'DMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['pass', 'press', 'press', 'pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot-topLeft' }, { type: 'press', position: 'slot-topRight' }, { type: 'press', position: 'slot-middleLeft' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'pass', position: 'slot-bottomLeft' }], immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-home-dmf-tempo.png' },
  { id: 'SM4', nickname: 'Magician', realName: 'Zidane', type: 'mf', positionLabel: 'CMF', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'pass', 'pass', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot-topLeft' }, { type: 'attack', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'attack', position: 'slot-bottomLeft' }, { type: 'press', position: 'slot-bottomRight' }], immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/star-amf-killer-pass.png' },
  
  { id: 'SB1', nickname: 'Rock', realName: 'Van Dijk', type: 'df', positionLabel: 'CB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'pass', 'pass', 'defense', 'defense'], iconPositions: [{ type: 'defense', position: 'slot-topLeft' }, { type: 'defense', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'defense', position: 'slot-bottomLeft' }, { type: 'defense', position: 'slot-bottomRight' }], immediateEffect: 'steal_synergy', imageUrl: '/images/cards/players/star-cb-sweeper.png' },
  { id: 'SB2', nickname: 'Wing Wizard', realName: 'Alphonso', type: 'df', positionLabel: 'LB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot-topRight' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'defense', position: 'slot-bottomRight' }], immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-lb-fullback.png' },
  { id: 'SB3', nickname: 'Guardian', realName: 'Ruben Dias', type: 'df', positionLabel: 'CB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'defense', 'pass', 'pass', 'defense'], iconPositions: [{ type: 'defense', position: 'slot-topLeft' }, { type: 'defense', position: 'slot-topRight' }, { type: 'defense', position: 'slot-middleLeft' }, { type: 'pass', position: 'slot-middleRight' }, { type: 'pass', position: 'slot-bottomLeft' }, { type: 'defense', position: 'slot-bottomRight' }], immediateEffect: 'steal_synergy', imageUrl: '/images/cards/players/star-cb-sweeper.png' },
  { id: 'SB4', nickname: 'Overlap King', realName: 'Robertson', type: 'df', positionLabel: 'RB', isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot-topLeft' }, { type: 'pass', position: 'slot-middleLeft' }, { type: 'defense', position: 'slot-bottomLeft' }], immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/star-lb-overlapping.png' },
];

export const athleteCards: athleteCard[] = [...baseathleteCards, ...starathleteCards];

export const synergyCards: SynergyCard[] = [
  // 1星协同卡（3张）
  { id: '4001', name: '1', type: 'special', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4002', name: '1+铲球', type: 'tackle', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4003', name: '1+铲球', type: 'tackle', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 2星协同卡（5张）
  { id: '4004', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4005', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4006', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4007', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4008', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 3星协同卡（10张）
  { id: '4009', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4010', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4011', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4012', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4013', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4014', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4015', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4016', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4017', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4018', name: '3', type: 'special', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 4星协同卡（5张）
  { id: '4019', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4020', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4021', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4022', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4023', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  // 5星协同卡（2张）
  { id: '4024', name: '5', type: 'special', value: 5, stars: 5, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4025', name: '5', type: 'special', value: 5, stars: 5, unlocked: true, unlockCondition: 'Unlocked by default' },
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

export function getImmediateEffectDescription(effect: ImmediateEffectType): string {
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

export function getIconDisplay(icon: TacticalIcon): { symbol: string; color: string; image: string } {
  switch (icon) {
    case 'attack': return { symbol: '⚔️', color: '#E53935', image: '/icons/attack_ball.svg' };
    case 'defense': return { symbol: '🛡️', color: '#1E88E5', image: '/icons/defense_shield.svg' };
    case 'pass': return { symbol: '🔄', color: '#43A047', image: '/cards/skills/icon-pass.png' };
    case 'press': return { symbol: '👊', color: '#FB8C00', image: '/icons/press_up.svg' };
    case 'breakthrough': return { symbol: '💨', color: '#9C27B0', image: '/icons/attack_ball.svg' };
    case 'breakthroughAll': return { symbol: '💥', color: '#E91E63', image: '/icons/attack_ball.svg' };
  }
}

export function canPlaceCardAtSlot(
  card: AthleteCard,
  fieldSlots: { zone: number; slots: { position: number; athleteCard: AthleteCard | null; usedShotIcons?: number[]; shotMarkers?: number }[] }[],
  zone: number,
  startCol: number,
  isFirstTurn: boolean
): boolean {
  const result = RuleValidator.canPlaceCard(card, fieldSlots, zone, startCol, isFirstTurn);
  return result.valid;
}

export function getZoneName(zone: number): string {
  switch (zone) {
    case 1: return 'Front';
    case 2: return 'Second';
    case 3: return 'Third';
    case 4: return 'Last';
    default: return 'Unknown';
  }
}





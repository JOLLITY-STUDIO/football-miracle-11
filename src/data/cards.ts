// 由于 athleteCard �?SynergyCard 接口已在本文件定义，无需再从外部 types 文件导入
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
  | 'steal_synergy' 
  | 'instant_shot'
  | 'none';

export type IconPosition = 
  | 'slot1-topLeft' | 'slot1-topRight' 
  | 'slot1-middleLeft' | 'slot1-middleRight' 
  | 'slot1-bottomLeft' | 'slot1-bottomRight'
  | 'slot2-topLeft' | 'slot2-topRight' 
  | 'slot2-middleLeft' | 'slot2-middleRight' 
  | 'slot2-bottomLeft' | 'slot2-bottomRight';

export interface IconWithPosition {
  type: TacticalIcon;
  position: IconPosition;
}

export interface AthleteCard {
  id: string;
  name: string;
  realName: string;
  type: CardType;
  positionLabel: string;
  attack: number;
  defense: number;
  isStar: boolean;
  unlocked: boolean;
  unlockCondition: string;
  icons: TacticalIcon[];
  iconPositions: IconWithPosition[];
  completeIcon: TacticalIcon | null;
  immediateEffect: ImmediateEffectType;
  imageUrl?: string;
  status?: 'yellow' | 'red';
  traits?: string[];
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
  { id: 'H01', name: 'Striker', realName: 'John Smith', type: 'fw', positionLabel: 'CF', attack: 3, defense: 0, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleLeft' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cf-striker.png' },
  { id: 'H02', name: 'Left Winger', realName: 'David Johnson', type: 'fw', positionLabel: 'LWF', attack: 2, defense: 0, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-lw-winger.png' },
  { id: 'H03', name: 'Right Winger', realName: 'Michael Brown', type: 'fw', positionLabel: 'RWF', attack: 2, defense: 0, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-middleLeft' }, { type: 'attack', position: 'slot1-bottomLeft' }, { type: 'press', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-rw-winger.png' },
  { id: 'H04', name: 'Central Midfielder', realName: 'James Wilson', type: 'mf', positionLabel: 'CMF', attack: 2, defense: 2, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'pass', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cm-playmaker.png' },
  { id: 'H05', name: 'Attacking Midfielder', realName: 'Robert Taylor', type: 'mf', positionLabel: 'AMF', attack: 2, defense: 2, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'press', position: 'slot1-bottomLeft' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-am-chancemaker.png' },
  { id: 'H06', name: 'Defensive Midfielder', realName: 'William Anderson', type: 'mf', positionLabel: 'DMF', attack: 1, defense: 3, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'press', 'pass', 'pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-home-dmf-tempo.png' },
  { id: 'H07', name: 'Left Center Back', realName: 'Richard Martinez', type: 'df', positionLabel: 'CB', attack: 0, defense: 3, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cb-l.png' },
  { id: 'H08', name: 'Right Center Back', realName: 'Thomas Garcia', type: 'df', positionLabel: 'CB', attack: 0, defense: 3, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-topRight' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cb-r.png' },
  { id: 'H09', name: 'Left Back', realName: 'Charles Lee', type: 'df', positionLabel: 'LB', attack: 1, defense: 2, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-lb-fullback.png' },
  { id: 'H10', name: 'Right Back', realName: 'Joseph Kim', type: 'df', positionLabel: 'RB', attack: 1, defense: 2, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topLeft' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'defense', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-rb-fullback.png' },

  // Away Team (A01-A10) - Same stats as Home Team
  { id: 'A01', name: 'Striker', realName: 'Alex Rodriguez', type: 'fw', positionLabel: 'CF', attack: 3, defense: 0, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleLeft' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cf-striker.png' },
  { id: 'A02', name: 'Left Winger', realName: 'Brian Chavez', type: 'fw', positionLabel: 'LWF', attack: 2, defense: 0, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-lw-winger.png' },
  { id: 'A03', name: 'Right Winger', realName: 'Carlos Mendez', type: 'fw', positionLabel: 'RWF', attack: 2, defense: 0, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-middleLeft' }, { type: 'attack', position: 'slot1-bottomLeft' }, { type: 'press', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-rw-winger.png' },
  { id: 'A04', name: 'Central Midfielder', realName: 'Daniel Torres', type: 'mf', positionLabel: 'CMF', attack: 2, defense: 2, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'pass', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cm-playmaker.png' },
  { id: 'A05', name: 'Attacking Midfielder', realName: 'Eduardo Santos', type: 'mf', positionLabel: 'AMF', attack: 2, defense: 2, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'press', position: 'slot1-bottomLeft' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-am-chancemaker.png' },
  { id: 'A06', name: 'Defensive Midfielder', realName: 'Francisco Lopez', type: 'mf', positionLabel: 'DMF', attack: 1, defense: 3, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'press', 'pass', 'pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-away-dmf-tempo.png' },
  { id: 'A07', name: 'Left Center Back', realName: 'Gustavo Herrera', type: 'df', positionLabel: 'CB', attack: 0, defense: 3, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cb-l.png' },
  { id: 'A08', name: 'Right Center Back', realName: 'Hector Gutierrez', type: 'df', positionLabel: 'CB', attack: 0, defense: 3, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-topRight' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cb-r.png' },
  { id: 'A09', name: 'Left Back', realName: 'Ivan Cruz', type: 'df', positionLabel: 'LB', attack: 1, defense: 2, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-away-lb-fullback.png' },
  { id: 'A10', name: 'Right Back', realName: 'Javier Moreno', type: 'df', positionLabel: 'RB', attack: 1, defense: 2, isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topLeft' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'defense', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-away-rb-fullback.png' },
];

export const starathleteCards: athleteCard[] = [
  { id: 'SF1', name: 'Star Striker - Ace', realName: 'Messi', type: 'fw', positionLabel: 'CF', attack: 4, defense: 1, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'instant_shot', imageUrl: '/images/cards/players/star-cf-target-man.png' },
  { id: 'SF2', name: 'Star Striker - Lightning', realName: 'Mbappe', type: 'fw', positionLabel: 'LWF', attack: 4, defense: 0, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-lw-winger.png' },
  { id: 'SF3', name: 'Star Striker - Finisher', realName: 'Haaland', type: 'fw', positionLabel: 'CF', attack: 5, defense: 0, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-bottomLeft' }, { type: 'press', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/star-cf-target-man.png' },
  
  { id: 'SM1', name: 'Star Midfielder - Commander', realName: 'Modric', type: 'mf', positionLabel: 'CMF', attack: 2, defense: 3, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'pass', 'pass', 'press'], iconPositions: [{ type: 'press', position: 'slot1-topLeft' }, { type: 'pass', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'instant_shot', imageUrl: '/images/cards/players/star-dmf-cannon-shot.png' },
  { id: 'SM2', name: 'Star Midfielder - Playmaker', realName: 'De Bruyne', type: 'mf', positionLabel: 'AMF', attack: 3, defense: 2, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'press', position: 'slot1-bottomLeft' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-am-chancemaker.png' },
  { id: 'SM3', name: 'Star Midfielder - Ball Winner', realName: 'Kante', type: 'mf', positionLabel: 'DMF', attack: 1, defense: 4, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['pass', 'press', 'press', 'pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'press', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot1-bottomLeft' }], completeIcon: 'press', immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-home-dmf-tempo.png' },
  { id: 'SM4', name: 'Star Midfielder - Magician', realName: 'Zidane', type: 'mf', positionLabel: 'CMF', attack: 4, defense: 1, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'pass', 'pass', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'attack', position: 'slot1-bottomLeft' }, { type: 'press', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/star-amf-killer-pass.png' },
  
  { id: 'SB1', name: 'Star Defender - Rock', realName: 'Van Dijk', type: 'df', positionLabel: 'CB', attack: 1, defense: 4, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'pass', 'pass', 'defense', 'defense'], iconPositions: [{ type: 'defense', position: 'slot1-topLeft' }, { type: 'defense', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'steal_synergy', imageUrl: '/images/cards/players/star-cb-sweeper.png' },
  { id: 'SB2', name: 'Star Defender - Wing Wizard', realName: 'Alphonso', type: 'df', positionLabel: 'LB', attack: 2, defense: 3, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-lb-fullback.png' },
  { id: 'SB3', name: 'Star Defender - Guardian', realName: 'Ruben Dias', type: 'df', positionLabel: 'CB', attack: 0, defense: 5, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'defense', 'pass', 'pass', 'defense'], iconPositions: [{ type: 'defense', position: 'slot1-topLeft' }, { type: 'defense', position: 'slot1-topRight' }, { type: 'defense', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'steal_synergy', imageUrl: '/images/cards/players/star-cb-sweeper.png' },
  { id: 'SB4', name: 'Star Defender - Overlap King', realName: 'Robertson', type: 'df', positionLabel: 'RB', attack: 1, defense: 3, isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topLeft' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'defense', position: 'slot1-bottomLeft' }], completeIcon: 'press', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/star-lb-overlapping.png' },
];

export const athleteCards: athleteCard[] = [...baseathleteCards, ...starathleteCards];

export const synergyCards: SynergyCard[] = [
  { id: '4001', name: '1', type: 'special', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },

  { id: '4002', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4003', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4004', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4005', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4006', name: '2', type: 'special', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4007', name: '1+铲球', type: 'tackle', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4008', name: '1+铲球', type: 'tackle', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },

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

  { id: '4019', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4020', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4021', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4022', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4023', name: '4', type: 'special', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },

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
    case 'attack': return { symbol: '⚽', color: '#E53935', image: '/icons/attack_ball.svg' };
    case 'defense': return { symbol: '🛡', color: '#1E88E5', image: '/icons/defense_shield.svg' };
    case 'pass': return { symbol: '🔄', color: '#43A047', image: '/icons/pass.svg' };
    case 'press': return { symbol: '⚡', color: '#FB8C00', image: '/icons/press.svg' };
    case 'breakthrough': return { symbol: '💨', color: '#9C27B0', image: '/icons/breakthrough.svg' };
    case 'breakthroughAll': return { symbol: '💥', color: '#E91E63', image: '/icons/breakthroughAll.svg' };
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




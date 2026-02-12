export type CardType = 'forward' | 'midfielder' | 'defender';
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

export interface PlayerCard {
  id: string;
  name: string;
  realName: string;
  type: CardType;
  positionLabel: string;
  attack: number;
  defense: number;
  zones: number[];
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

export const basePlayerCards: PlayerCard[] = [
  // Home Team (H01-H10)
  { id: 'H01', name: '进攻尖兵', realName: '张三', type: 'forward', positionLabel: 'ST', attack: 3, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleLeft' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cf-striker.png' },
  { id: 'H02', name: '边路突击', realName: '李四', type: 'forward', positionLabel: 'LW', attack: 2, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-lw-winger.png' },
  { id: 'H03', name: '灵巧边锋', realName: '王五', type: 'forward', positionLabel: 'RW', attack: 2, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-middleLeft' }, { type: 'attack', position: 'slot1-bottomLeft' }, { type: 'press', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-rw-winger.png' },
  { id: 'H04', name: '中场核心', realName: '赵六', type: 'midfielder', positionLabel: 'CM', attack: 2, defense: 2, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'pass', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cm-playmaker.png' },
  { id: 'H05', name: '全能中场', realName: '孙七', type: 'midfielder', positionLabel: 'AMF', attack: 2, defense: 2, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'press', position: 'slot1-bottomLeft' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-am-chancemaker.png' },
  { id: 'H06', name: '防守闸门', realName: '周八', type: 'midfielder', positionLabel: 'DMF', attack: 1, defense: 3, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'press', 'pass', 'pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-home-dmf-tempo.png' },
  { id: 'H07', name: '定海神针', realName: '吴九', type: 'defender', positionLabel: 'CB-L', attack: 0, defense: 3, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cb-l.png' },
  { id: 'H08', name: '后防中坚', realName: '郑十', type: 'defender', positionLabel: 'CB-R', attack: 0, defense: 3, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-topRight' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-cb-r.png' },
  { id: 'H09', name: '助攻边卫', realName: '陈一', type: 'defender', positionLabel: 'LB', attack: 1, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-lb-fullback.png' },
  { id: 'H10', name: '铁血边卫', realName: '林二', type: 'defender', positionLabel: 'RB', attack: 1, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topLeft' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'defense', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-rb-fullback.png' },

  // Away Team (A01-A10) - Same stats as Home Team
  { id: 'A01', name: '进攻尖兵', realName: '阿强', type: 'forward', positionLabel: 'ST', attack: 3, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleLeft' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cf-striker.png' },
  { id: 'A02', name: '边路突击', realName: '阿明', type: 'forward', positionLabel: 'LW', attack: 2, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-lw-winger.png' },
  { id: 'A03', name: '灵巧边锋', realName: '阿华', type: 'forward', positionLabel: 'RW', attack: 2, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-middleLeft' }, { type: 'attack', position: 'slot1-bottomLeft' }, { type: 'press', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-rw-winger.png' },
  { id: 'A04', name: '中场核心', realName: '阿龙', type: 'midfielder', positionLabel: 'CM', attack: 2, defense: 2, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'pass', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cm-playmaker.png' },
  { id: 'A05', name: '全能中场', realName: '阿海', type: 'midfielder', positionLabel: 'AMF', attack: 2, defense: 2, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['attack', 'attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'press', position: 'slot1-bottomLeft' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-am-chancemaker.png' },
  { id: 'A06', name: '防守闸门', realName: '阿飞', type: 'midfielder', positionLabel: 'DMF', attack: 1, defense: 3, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'press', 'pass', 'pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-away-dmf-tempo.png' },
  { id: 'A07', name: '定海神针', realName: '阿勇', type: 'defender', positionLabel: 'CB-L', attack: 0, defense: 3, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cb-l.png' },
  { id: 'A08', name: '后防中坚', realName: '阿杰', type: 'defender', positionLabel: 'CB-R', attack: 0, defense: 3, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['pass', 'defense', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-topRight' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'none', imageUrl: '/images/cards/players/player-away-cb-r.png' },
  { id: 'A09', name: '助攻边卫', realName: '阿志', type: 'defender', positionLabel: 'LB', attack: 1, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-away-lb-fullback.png' },
  { id: 'A10', name: '铁血边卫', realName: '阿辉', type: 'defender', positionLabel: 'RB', attack: 1, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Default', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topLeft' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'defense', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-away-rb-fullback.png' },
];

export const starPlayerCards: PlayerCard[] = [
  { id: 'SF1', name: '明星前锋-王牌', realName: '梅西', type: 'forward', positionLabel: 'ST', attack: 4, defense: 1, zones: [1, 2], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'instant_shot', imageUrl: '/images/cards/players/star-cf-target-man.png' },
  { id: 'SF2', name: '明星前锋-闪电', realName: '姆巴佩', type: 'forward', positionLabel: 'LW', attack: 4, defense: 0, zones: [1, 2], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'press', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'breakthrough', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-lw-winger.png' },
  { id: 'SF3', name: '明星前锋-终结', realName: '哈兰德', type: 'forward', positionLabel: 'ST', attack: 5, defense: 0, zones: [1, 2], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-bottomLeft' }, { type: 'attack', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/star-cf-target-man.png' },
  
  { id: 'SM1', name: '明星中场-指挥', realName: '莫德里奇', type: 'midfielder', positionLabel: 'DMF', attack: 2, defense: 3, zones: [2, 3], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'pass', 'pass', 'press'], iconPositions: [{ type: 'press', position: 'slot1-topLeft' }, { type: 'pass', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'instant_shot', imageUrl: '/images/cards/players/star-dmf-cannon-shot.png' },
  { id: 'SM2', name: '明星中场-核心', realName: '德布劳内', type: 'midfielder', positionLabel: 'AMF', attack: 3, defense: 2, zones: [2, 3], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'press', position: 'slot1-bottomLeft' }], completeIcon: 'attack', immediateEffect: 'none', imageUrl: '/images/cards/players/player-home-am-chancemaker.png' },
  { id: 'SM3', name: '明星中场-铁闸', realName: '坎特', type: 'midfielder', positionLabel: 'DMF', attack: 1, defense: 4, zones: [2, 3], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['pass', 'press', 'pass', 'pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot1-topLeft' }, { type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot1-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/player-home-dmf-tempo.png' },
  { id: 'SM4', name: '明星中场-杀手传球', realName: '齐达内', type: 'midfielder', positionLabel: 'AMF', attack: 4, defense: 1, zones: [2, 3], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'attack', 'attack', 'press', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topLeft' }, { type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleLeft' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot1-bottomLeft' }, { type: 'press', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'draw_synergy_2_choose_1', imageUrl: '/images/cards/players/star-amf-killer-pass.png' },
  
  { id: 'SB1', name: '明星后卫-铁壁', realName: '范迪克', type: 'defender', positionLabel: 'CB', attack: 1, defense: 4, zones: [3, 4], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'pass', 'pass', 'defense', 'defense'], iconPositions: [{ type: 'defense', position: 'slot1-topLeft' }, { type: 'defense', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'steal_synergy', imageUrl: '/images/cards/players/star-cb-sweeper.png' },
  { id: 'SB2', name: '明星后卫-飞翼', realName: '阿方索', type: 'defender', positionLabel: 'LB', attack: 2, defense: 3, zones: [3, 4], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press', 'pass', 'defense'], iconPositions: [{ type: 'press', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/player-home-lb-fullback.png' },
  { id: 'SB3', name: '明星后卫-屏障', realName: '鲁本迪亚斯', type: 'defender', positionLabel: 'CB', attack: 0, defense: 5, zones: [3, 4], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'pass', 'pass', 'defense', 'defense'], iconPositions: [{ type: 'defense', position: 'slot1-topLeft' }, { type: 'defense', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-middleLeft' }, { type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot1-bottomLeft' }, { type: 'defense', position: 'slot1-bottomRight' }], completeIcon: 'defense', immediateEffect: 'steal_synergy', imageUrl: '/images/cards/players/star-cb-sweeper.png' },
  { id: 'SB4', name: '明星后卫-重叠', realName: '罗伯逊', type: 'defender', positionLabel: 'LB', attack: 1, defense: 3, zones: [3, 4], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['press'], iconPositions: [{ type: 'press', position: 'slot1-topRight' }], completeIcon: 'press', immediateEffect: 'draw_synergy_1', imageUrl: '/images/cards/players/star-lb-overlapping.png' },
];

export const playerCards: PlayerCard[] = [...basePlayerCards, ...starPlayerCards];

export const synergyCards: SynergyCard[] = [
  { id: '4001', name: '进攻加成+1', type: 'attack', value: 1, stars: 1, unlocked: true, unlockCondition: 'Unlocked by default' },

  { id: '4002', name: '进攻加成+2', type: 'attack', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4003', name: '进攻加成+2', type: 'attack', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4004', name: '防守加成+2', type: 'defense', value: 2, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4005', name: '铲球', type: 'tackle', value: 1, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4006', name: '铲球', type: 'tackle', value: 1, stars: 2, unlocked: true, unlockCondition: 'Unlocked by default' },

  { id: '4007', name: '进攻加成+3', type: 'attack', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4008', name: '进攻加成+3', type: 'attack', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4009', name: '进攻加成+3', type: 'attack', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4010', name: '防守加成+3', type: 'defense', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4011', name: '防守加成+3', type: 'defense', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4012', name: '防守加成+3', type: 'defense', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4013', name: '控制+2', type: 'special', value: 2, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4014', name: '控制+2', type: 'special', value: 2, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4015', name: '控制+2', type: 'special', value: 2, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4016', name: '控制+2', type: 'special', value: 2, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },

  { id: '4017', name: '进攻加成+4', type: 'attack', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4018', name: '进攻加成+4', type: 'attack', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4019', name: '防守加成+4', type: 'defense', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4020', name: '防守加成+4', type: 'defense', value: 4, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4021', name: '控制+3', type: 'special', value: 3, stars: 4, unlocked: true, unlockCondition: 'Unlocked by default' },

  { id: '4022', name: '进攻加成+5', type: 'attack', value: 5, stars: 5, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4023', name: '防守加成+5', type: 'defense', value: 5, stars: 5, unlocked: true, unlockCondition: 'Unlocked by default' },

  { id: '4024', name: 'Corner Kick', type: 'setpiece', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4025', name: 'Free Kick', type: 'setpiece', value: 3, stars: 3, unlocked: true, unlockCondition: 'Unlocked by default' },
  
  { id: '4026', name: 'VAR Check', type: 'special', value: 0, stars: 5, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '4027', name: 'VAR Overrule', type: 'special', value: 0, stars: 5, unlocked: true, unlockCondition: 'Unlocked by default' },
];

export const penaltyCards: PenaltyCard[] = [
  { id: '5001', name: '点球-入门', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '5002', name: '点球-入门', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '5003', name: '点球-入门', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '5004', name: '点球-入门', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '5005', name: '点球-入门', points: 1, unlocked: true, unlockCondition: 'Unlocked by default' },
  { id: '5006', name: '点球-进阶', points: 2, unlocked: true, unlockCondition: '人机对战胜利2次' },
  { id: '5007', name: '点球-进阶', points: 2, unlocked: true, unlockCondition: '人机对战胜利2次' },
  { id: '5008', name: '点球-进阶', points: 2, unlocked: true, unlockCondition: '人机对战胜利2次' },
  { id: '5009', name: '点球-大师', points: 3, unlocked: true, unlockCondition: '人机对战胜利8次' },
  { id: '5010', name: '点球-大师', points: 3, unlocked: true, unlockCondition: '人机对战胜利8次' },
];

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

export function getIconDisplay(icon: TacticalIcon): { symbol: string; color: string } {
  switch (icon) {
    case 'attack': return { symbol: '⚔', color: '#E53935' };
    case 'defense': return { symbol: '🛡', color: '#1E88E5' };
    case 'pass': return { symbol: '↔', color: '#43A047' };
    case 'press': return { symbol: '↑', color: '#FB8C00' };
    case 'breakthrough': return { symbol: '💨', color: '#9C27B0' };
    case 'breakthroughAll': return { symbol: '💥', color: '#E91E63' };
  }
}

export function canPlaceCardAtSlot(
  card: PlayerCard,
  fieldSlots: { zone: number; slots: { position: number; playerCard: PlayerCard | null }[] }[],
  zone: number,
  startCol: number,
  isFirstTurn: boolean
): boolean {
  const targetZone = fieldSlots.find(z => z.zone === zone);
  if (!targetZone) return false;
  
  // Check if card can be placed at this column (0-6)
  if (startCol < 0 || startCol > 6) return false;
  if (!card.zones.includes(zone)) return false;

  // Check if the two columns (startCol and startCol+1) are not occupied
  const slot1 = targetZone.slots.find(s => s.position === startCol);
  const slot2 = targetZone.slots.find(s => s.position === startCol + 1);
  
  if (!slot1 || !slot2) return false;
  if (slot1.playerCard || slot2.playerCard) return false;

  // 规则：Zone 1 (前线) 必须有邻居（同区域或后方区域）
  // 且第一张卡牌不能放置在 Zone 1
  const hasAnyCard = fieldSlots.some(z => z.slots.some(s => s.playerCard));
  
  if (zone === 1) {
    if (!hasAnyCard) return false; // 第一张卡牌不能在前线
    
    const zone1 = fieldSlots.find(z => z.zone === 1);
    const zone2 = fieldSlots.find(z => z.zone === 2);
    
    const hasAdjacentInZone1 = zone1?.slots.some(s => 
      s.playerCard && Math.abs(s.position - startCol) <= 1
    );
    const hasBehindInZone2 = zone2?.slots.some(s => 
      s.playerCard && Math.abs(s.position - startCol) <= 1
    );
    
    if (!hasAdjacentInZone1 && !hasBehindInZone2) return false;
  }

  return true;
}

export function getZoneName(zone: number): string {
  switch (zone) {
    case 1: return 'Front';
    case 2: return 'Second';
    case 3: return 'Third';
    case 4: return 'Last';
    default: return '未知';
  }
}



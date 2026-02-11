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
  { id: 'F01', name: '前锋-入门', realName: '张三', type: 'forward', positionLabel: 'ST', attack: 2, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack'], iconPositions: [{ type: 'attack', position: 'slot1-middleRight' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'F02', name: '前锋-进攻', realName: '李四', type: 'forward', positionLabel: 'CF', attack: 3, defense: 1, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'pass'], iconPositions: [{ type: 'attack', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot2-middleLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1' },
  { id: 'F03', name: '前锋-快速', realName: '王五', type: 'forward', positionLabel: 'LF', attack: 2, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'press', position: 'slot2-topLeft' }], completeIcon: 'press', immediateEffect: 'move_control_1' },
  { id: 'F04', name: '前锋-力量', realName: '赵六', type: 'forward', positionLabel: 'CF', attack: 3, defense: 1, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'defense'], iconPositions: [{ type: 'attack', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot2-bottomLeft' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'F05', name: '前锋-射手', realName: '孙七', type: 'forward', positionLabel: 'ST', attack: 3, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'attack'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot2-topLeft' }], completeIcon: 'attack', immediateEffect: 'none' },
  { id: 'F06', name: '前锋-灵巧', realName: '周八', type: 'forward', positionLabel: 'RF', attack: 2, defense: 1, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'pass'], iconPositions: [{ type: 'attack', position: 'slot1-bottomRight' }, { type: 'pass', position: 'slot2-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1' },
  { id: 'F07', name: '前锋-新星', realName: '吴九', type: 'forward', positionLabel: 'ST', attack: 2, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack'], iconPositions: [{ type: 'attack', position: 'slot2-middleLeft' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'F08', name: '前锋-老将', realName: '郑十', type: 'forward', positionLabel: 'CF', attack: 3, defense: 1, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-bottomRight' }, { type: 'press', position: 'slot2-bottomLeft' }], completeIcon: 'press', immediateEffect: 'move_control_1' },
  { id: 'F09', name: '前锋-技术', realName: '陈一', type: 'forward', positionLabel: 'SS', attack: 2, defense: 1, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot1-topRight' }, { type: 'pass', position: 'slot2-topLeft' }], completeIcon: 'pass', immediateEffect: 'none' },
  { id: 'F10', name: '前锋-强硬', realName: '林二', type: 'forward', positionLabel: 'CF', attack: 3, defense: 2, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'defense'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'defense', position: 'slot2-bottomLeft' }], completeIcon: 'defense', immediateEffect: 'none' },
  { id: 'F11', name: '前锋-反击', realName: '黄三', type: 'forward', positionLabel: 'LF', attack: 2, defense: 0, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-middleRight' }, { type: 'press', position: 'slot2-middleLeft' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'F12', name: '前锋-支点', realName: '杨四', type: 'forward', positionLabel: 'ST', attack: 2, defense: 2, zones: [1, 2], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['pass', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot2-bottomLeft' }], completeIcon: null, immediateEffect: 'none' },

  { id: 'M01', name: '中场-入门', realName: '刘五', type: 'midfielder', positionLabel: 'CMF', attack: 1, defense: 1, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['pass', 'press'], iconPositions: [{ type: 'pass', position: 'slot1-middleRight' }, { type: 'press', position: 'slot2-middleLeft' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'M02', name: '中场-组织', realName: '关六', type: 'midfielder', positionLabel: 'CMF', attack: 2, defense: 2, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['pass', 'pass'], iconPositions: [{ type: 'pass', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot2-middleLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1' },
  { id: 'M03', name: '中场-进攻', realName: '张七', type: 'midfielder', positionLabel: 'AMF', attack: 2, defense: 1, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'pass'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot2-topLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_1' },
  { id: 'M04', name: '中场-防守', realName: '马八', type: 'midfielder', positionLabel: 'DMF', attack: 1, defense: 2, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense', 'press'], iconPositions: [{ type: 'defense', position: 'slot1-bottomRight' }, { type: 'press', position: 'slot2-bottomLeft' }], completeIcon: 'press', immediateEffect: 'move_control_1' },
  { id: 'M05', name: '中场-全能', realName: '宋九', type: 'midfielder', positionLabel: 'CMF', attack: 2, defense: 2, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['attack', 'defense', 'pass'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'defense', position: 'slot1-bottomRight' }, { type: 'pass', position: 'slot2-middleLeft' }], completeIcon: 'defense', immediateEffect: 'none' },
  { id: 'M06', name: '中场-新星', realName: '董十', type: 'midfielder', positionLabel: 'CMF', attack: 1, defense: 1, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['pass'], iconPositions: [{ type: 'pass', position: 'slot1-middleRight' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'M07', name: '中场-老将', realName: '梁一', type: 'midfielder', positionLabel: 'CMF', attack: 2, defense: 2, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['press', 'press'], iconPositions: [{ type: 'press', position: 'slot1-topRight' }, { type: 'press', position: 'slot2-topLeft' }], completeIcon: 'press', immediateEffect: 'move_control_2' },
  { id: 'M08', name: '中场-边路', realName: '谢二', type: 'midfielder', positionLabel: 'LMF', attack: 2, defense: 1, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['pass', 'attack'], iconPositions: [{ type: 'pass', position: 'slot1-topRight' }, { type: 'attack', position: 'slot2-topLeft' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'M09', name: '中场-拦截', realName: '韩三', type: 'midfielder', positionLabel: 'DMF', attack: 1, defense: 3, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense', 'defense'], iconPositions: [{ type: 'defense', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot2-middleLeft' }], completeIcon: 'defense', immediateEffect: 'steal_synergy' },
  { id: 'M10', name: '中场-控制', realName: '唐四', type: 'midfielder', positionLabel: 'RMF', attack: 2, defense: 2, zones: [2, 3], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['pass', 'press'], iconPositions: [{ type: 'pass', position: 'slot1-bottomRight' }, { type: 'press', position: 'slot2-bottomLeft' }], completeIcon: null, immediateEffect: 'none' },

  { id: 'D01', name: '后卫-入门', realName: '冯五', type: 'defender', positionLabel: 'CB', attack: 0, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense'], iconPositions: [{ type: 'defense', position: 'slot1-middleRight' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'D02', name: '后卫-核心', realName: '于六', type: 'defender', positionLabel: 'CB', attack: 1, defense: 3, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense', 'defense'], iconPositions: [{ type: 'defense', position: 'slot1-middleRight' }, { type: 'defense', position: 'slot2-middleLeft' }], completeIcon: 'defense', immediateEffect: 'steal_synergy' },
  { id: 'D03', name: '后卫-速度', realName: '董七', type: 'defender', positionLabel: 'LB', attack: 1, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense', 'press'], iconPositions: [{ type: 'defense', position: 'slot1-topRight' }, { type: 'press', position: 'slot2-topLeft' }], completeIcon: 'press', immediateEffect: 'move_control_1' },
  { id: 'D04', name: '后卫-力量', realName: '袁八', type: 'defender', positionLabel: 'CB', attack: 0, defense: 3, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense', 'defense'], iconPositions: [{ type: 'defense', position: 'slot1-topRight' }, { type: 'defense', position: 'slot2-topLeft' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'D05', name: '后卫-空中', realName: '邓九', type: 'defender', positionLabel: 'CB', attack: 0, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense', 'defense'], iconPositions: [{ type: 'defense', position: 'slot1-bottomRight' }, { type: 'defense', position: 'slot2-bottomLeft' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'D06', name: '后卫-全能', realName: '许十', type: 'defender', positionLabel: 'CB', attack: 1, defense: 3, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense', 'pass'], iconPositions: [{ type: 'defense', position: 'slot1-middleRight' }, { type: 'pass', position: 'slot2-middleLeft' }], completeIcon: 'defense', immediateEffect: 'draw_synergy_1' },
  { id: 'D07', name: '后卫-新星', realName: '傅一', type: 'defender', positionLabel: 'CB', attack: 0, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense'], iconPositions: [{ type: 'defense', position: 'slot2-middleLeft' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'D08', name: '后卫-老将', realName: '沈二', type: 'defender', positionLabel: 'CB', attack: 1, defense: 3, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['defense', 'press'], iconPositions: [{ type: 'defense', position: 'slot1-bottomRight' }, { type: 'press', position: 'slot2-bottomLeft' }], completeIcon: 'press', immediateEffect: 'move_control_1' },
  { id: 'D09', name: '后卫-边路', realName: '曾三', type: 'defender', positionLabel: 'RB', attack: 1, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['pass', 'defense'], iconPositions: [{ type: 'pass', position: 'slot1-topRight' }, { type: 'defense', position: 'slot2-bottomLeft' }], completeIcon: null, immediateEffect: 'none' },
  { id: 'D10', name: '后卫-组织', realName: '彭四', type: 'defender', positionLabel: 'LB', attack: 1, defense: 2, zones: [3, 4], isStar: false, unlocked: true, unlockCondition: 'Unlocked by default', icons: ['pass', 'press'], iconPositions: [{ type: 'pass', position: 'slot1-middleRight' }, { type: 'press', position: 'slot2-middleLeft' }], completeIcon: null, immediateEffect: 'none' },
];

export const starPlayerCards: PlayerCard[] = [
  { id: 'SF1', name: '明星前锋-王牌', realName: '梅西', type: 'forward', positionLabel: 'ST', attack: 4, defense: 1, zones: [1, 2], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'breakthrough'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-bottomRight' }, { type: 'breakthrough', position: 'slot2-middleLeft' }], completeIcon: 'attack', immediateEffect: 'instant_shot' },
  { id: 'SF2', name: '明星前锋-金靴', realName: 'C罗', type: 'forward', positionLabel: 'CF', attack: 4, defense: 0, zones: [1, 2], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'breakthroughAll'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-middleRight' }, { type: 'breakthroughAll', position: 'slot1-bottomRight' }], completeIcon: 'attack', immediateEffect: 'instant_shot' },
  { id: 'SF3', name: '明星前锋-全能', realName: '内马尔', type: 'forward', positionLabel: 'SS', attack: 3, defense: 2, zones: [1, 2], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'pass', 'breakthrough'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot2-topLeft' }, { type: 'breakthrough', position: 'slot2-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1' },
  { id: 'SF4', name: '明星前锋-速度', realName: '姆巴佩', type: 'forward', positionLabel: 'LF', attack: 3, defense: 1, zones: [1, 2], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'breakthrough', 'breakthrough'], iconPositions: [{ type: 'attack', position: 'slot1-middleRight' }, { type: 'breakthrough', position: 'slot2-topLeft' }, { type: 'breakthrough', position: 'slot2-bottomLeft' }], completeIcon: 'breakthrough', immediateEffect: 'move_control_2' },

  { id: 'SM1', name: '明星中场-核心', realName: '德布劳内', type: 'midfielder', positionLabel: 'AMF', attack: 3, defense: 3, zones: [2, 3], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['pass', 'pass', 'breakthrough'], iconPositions: [{ type: 'pass', position: 'slot1-topRight' }, { type: 'pass', position: 'slot2-topLeft' }, { type: 'breakthrough', position: 'slot2-bottomLeft' }], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1' },
  { id: 'SM2', name: '明星中场-指挥', realName: '莫德里奇', type: 'midfielder', positionLabel: 'CMF', attack: 2, defense: 2, zones: [2, 3], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'pass', 'press'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'pass', position: 'slot1-bottomRight' }, { type: 'press', position: 'slot2-topLeft' }], completeIcon: 'press', immediateEffect: 'move_control_2' },
  { id: 'SM3', name: '明星中场-进攻', realName: 'B费', type: 'midfielder', positionLabel: 'AMF', attack: 3, defense: 2, zones: [2, 3], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'attack', 'breakthrough'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'attack', position: 'slot1-bottomRight' }, { type: 'breakthrough', position: 'slot2-middleLeft' }], completeIcon: 'attack', immediateEffect: 'instant_shot' },
  { id: 'SM4', name: '明星中场-防守', realName: '卡塞米罗', type: 'midfielder', positionLabel: 'DMF', attack: 2, defense: 4, zones: [2, 3], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'breakthroughAll'], iconPositions: [{ type: 'defense', position: 'slot1-topRight' }, { type: 'defense', position: 'slot1-bottomRight' }, { type: 'breakthroughAll', position: 'slot2-middleLeft' }], completeIcon: 'defense', immediateEffect: 'steal_synergy' },

  { id: 'SD1', name: '明星后卫-铁闸', realName: '范戴克', type: 'defender', positionLabel: 'CB', attack: 1, defense: 5, zones: [3, 4], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'defense', 'press'], iconPositions: [{ type: 'defense', position: 'slot1-topRight' }, { type: 'defense', position: 'slot1-bottomRight' }, { type: 'press', position: 'slot2-middleLeft' }], completeIcon: 'defense', immediateEffect: 'steal_synergy' },
  { id: 'SD2', name: '明星后卫-领袖', realName: '拉莫斯', type: 'defender', positionLabel: 'CB', attack: 2, defense: 4, zones: [3, 4], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'pass', 'press'], iconPositions: [{ type: 'defense', position: 'slot1-topRight' }, { type: 'pass', position: 'slot2-topLeft' }, { type: 'press', position: 'slot2-bottomLeft' }], completeIcon: 'defense', immediateEffect: 'move_control_2' },
  { id: 'SD3', name: '明星后卫-速度', realName: '阿方索', type: 'defender', positionLabel: 'LB', attack: 2, defense: 3, zones: [3, 4], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['defense', 'breakthrough', 'press'], iconPositions: [{ type: 'defense', position: 'slot1-middleRight' }, { type: 'breakthrough', position: 'slot2-topLeft' }, { type: 'press', position: 'slot2-bottomLeft' }], completeIcon: 'press', immediateEffect: 'move_control_2' },
  { id: 'SD4', name: '明星后卫-带刀', realName: '马尔基尼奥斯', type: 'defender', positionLabel: 'RB', attack: 3, defense: 3, zones: [3, 4], isStar: true, unlocked: true, unlockCondition: 'Unlocked', icons: ['attack', 'defense', 'pass'], iconPositions: [{ type: 'attack', position: 'slot1-topRight' }, { type: 'defense', position: 'slot1-bottomRight' }, { type: 'pass', position: 'slot2-middleLeft' }], completeIcon: 'attack', immediateEffect: 'instant_shot' },
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
    case 'press': return { symbol: '⚡', color: '#FB8C00' };
    case 'breakthrough': return { symbol: '💨', color: '#9C27B0' };
    case 'breakthroughAll': return { symbol: '💥', color: '#E91E63' };
  }
}

export function canPlaceCardAtSlot(
  card: PlayerCard,
  fieldSlots: { zone: number; slots: { position: number; playerCard: PlayerCard | null }[] }[],
  zone: number,
  slotPosition: number,
  isFirstTurn: boolean
): boolean {
  const targetZone = fieldSlots.find(z => z.zone === zone);
  if (!targetZone) return false;
  const targetSlot = targetZone.slots.find(s => s.position === slotPosition);
  if (!targetSlot || targetSlot.playerCard) return false;
  if (!card.zones.includes(zone)) return false;

  if (zone === 1 && !isFirstTurn) {
    const zoneSlots = targetZone.slots;
    const hasAdjacentInZone = 
      (slotPosition > 0 && zoneSlots.find(s => s.position === slotPosition - 1)?.playerCard) ||
      (slotPosition < zoneSlots.length - 1 && zoneSlots.find(s => s.position === slotPosition + 1)?.playerCard);
    
    const zone2 = fieldSlots.find(z => z.zone === 2);
    const hasAdjacentBehind = zone2 && (
      zone2.slots.find(s => s.position === slotPosition)?.playerCard ||
      zone2.slots.find(s => s.position === slotPosition + 1)?.playerCard
    );
    
    if (!hasAdjacentInZone && !hasAdjacentBehind) return false;
  }

  return true;
}

export function canPlaceCardInZone(card: PlayerCard, zone: number): boolean {
  return card.zones.includes(zone);
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



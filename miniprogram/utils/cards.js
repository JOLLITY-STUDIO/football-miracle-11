const CARDS = {
  PLAYER_CARDS: [
    { id: 'H01', name: '进攻尖兵', realName: '张三', type: 'forward', positionLabel: 'ST', attack: 3, defense: 0, zones: [1, 2], isStar: false, icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], completeIcon: 'attack', immediateEffect: 'none' },
    { id: 'H02', name: '边路突击', realName: '李四', type: 'forward', positionLabel: 'LW', attack: 2, defense: 0, zones: [1, 2], isStar: false, icons: ['attack', 'attack', 'press', 'attack'], completeIcon: 'breakthrough', immediateEffect: 'none' },
    { id: 'H03', name: '灵巧边锋', realName: '王五', type: 'forward', positionLabel: 'RW', attack: 2, defense: 0, zones: [1, 2], isStar: false, icons: ['attack', 'attack', 'attack', 'press'], completeIcon: 'breakthrough', immediateEffect: 'none' },
    { id: 'H04', name: '中场核心', realName: '赵六', type: 'midfielder', positionLabel: 'CM', attack: 2, defense: 2, zones: [2, 3], isStar: false, icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], completeIcon: 'pass', immediateEffect: 'none' },
    { id: 'H05', name: '全能中场', realName: '孙七', type: 'midfielder', positionLabel: 'AMF', attack: 2, defense: 2, zones: [2, 3], isStar: false, icons: ['attack', 'attack', 'pass', 'press'], completeIcon: 'attack', immediateEffect: 'none' },
    { id: 'H06', name: '防守闸门', realName: '周八', type: 'midfielder', positionLabel: 'DMF', attack: 1, defense: 3, zones: [2, 3], isStar: false, icons: ['pass', 'press', 'pass', 'pass', 'pass'], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1' },
    { id: 'H07', name: '定海神针', realName: '吴九', type: 'defender', positionLabel: 'CB-L', attack: 0, defense: 3, zones: [3, 4], isStar: false, icons: ['pass', 'defense', 'defense'], completeIcon: 'defense', immediateEffect: 'none' },
    { id: 'H08', name: '后防中坚', realName: '郑十', type: 'defender', positionLabel: 'CB-R', attack: 0, defense: 3, zones: [3, 4], isStar: false, icons: ['pass', 'defense', 'defense'], completeIcon: 'defense', immediateEffect: 'none' },
    { id: 'H09', name: '助攻边卫', realName: '陈一', type: 'defender', positionLabel: 'LB', attack: 1, defense: 2, zones: [3, 4], isStar: false, icons: ['press', 'pass', 'defense'], completeIcon: 'pass', immediateEffect: 'draw_synergy_1' },
    { id: 'H10', name: '铁血边卫', realName: '林二', type: 'defender', positionLabel: 'RB', attack: 1, defense: 2, zones: [3, 4], isStar: false, icons: ['press', 'pass', 'defense'], completeIcon: 'pass', immediateEffect: 'draw_synergy_1' },
    { id: 'A01', name: '进攻尖兵', realName: '阿强', type: 'forward', positionLabel: 'ST', attack: 3, defense: 0, zones: [1, 2], isStar: false, icons: ['attack', 'attack', 'attack', 'attack', 'press', 'attack'], completeIcon: 'attack', immediateEffect: 'none' },
    { id: 'A02', name: '边路突击', realName: '阿明', type: 'forward', positionLabel: 'LW', attack: 2, defense: 0, zones: [1, 2], isStar: false, icons: ['attack', 'attack', 'press', 'attack'], completeIcon: 'breakthrough', immediateEffect: 'none' },
    { id: 'A03', name: '灵巧边锋', realName: '阿华', type: 'forward', positionLabel: 'RW', attack: 2, defense: 0, zones: [1, 2], isStar: false, icons: ['attack', 'attack', 'attack', 'press'], completeIcon: 'breakthrough', immediateEffect: 'none' },
    { id: 'A04', name: '中场核心', realName: '阿龙', type: 'midfielder', positionLabel: 'CM', attack: 2, defense: 2, zones: [2, 3], isStar: false, icons: ['attack', 'press', 'pass', 'pass', 'press', 'pass'], completeIcon: 'pass', immediateEffect: 'none' },
    { id: 'A05', name: '全能中场', realName: '阿海', type: 'midfielder', positionLabel: 'AMF', attack: 2, defense: 2, zones: [2, 3], isStar: false, icons: ['attack', 'attack', 'pass', 'press'], completeIcon: 'attack', immediateEffect: 'none' },
    { id: 'A06', name: '防守闸门', realName: '阿飞', type: 'midfielder', positionLabel: 'DMF', attack: 1, defense: 3, zones: [2, 3], isStar: false, icons: ['pass', 'press', 'pass', 'pass', 'pass'], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1' },
    { id: 'A07', name: '定海神针', realName: '阿勇', type: 'defender', positionLabel: 'CB-L', attack: 0, defense: 3, zones: [3, 4], isStar: false, icons: ['pass', 'defense', 'defense'], completeIcon: 'defense', immediateEffect: 'none' },
    { id: 'A08', name: '后防中坚', realName: '阿杰', type: 'defender', positionLabel: 'CB-R', attack: 0, defense: 3, zones: [3, 4], isStar: false, icons: ['pass', 'defense', 'defense'], completeIcon: 'defense', immediateEffect: 'none' },
    { id: 'A09', name: '助攻边卫', realName: '阿志', type: 'defender', positionLabel: 'LB', attack: 1, defense: 2, zones: [3, 4], isStar: false, icons: ['press', 'pass', 'defense'], completeIcon: 'pass', immediateEffect: 'draw_synergy_1' },
    { id: 'A10', name: '铁血边卫', realName: '阿辉', type: 'defender', positionLabel: 'RB', attack: 1, defense: 2, zones: [3, 4], isStar: false, icons: ['press', 'pass', 'defense'], completeIcon: 'pass', immediateEffect: 'draw_synergy_1' }
  ],
  STAR_CARDS: [
    { id: 'SF1', name: '明星前锋-王牌', realName: '梅西', type: 'forward', positionLabel: 'ST', attack: 4, defense: 1, zones: [1, 2], isStar: true, icons: ['attack', 'attack', 'attack', 'attack'], completeIcon: 'attack', immediateEffect: 'instant_shot' },
    { id: 'SF2', name: '明星前锋-闪电', realName: '姆巴佩', type: 'forward', positionLabel: 'LW', attack: 4, defense: 0, zones: [1, 2], isStar: true, icons: ['attack', 'attack', 'press', 'attack'], completeIcon: 'breakthrough', immediateEffect: 'none' },
    { id: 'SF3', name: '明星前锋-终结', realName: '哈兰德', type: 'forward', positionLabel: 'ST', attack: 5, defense: 0, zones: [1, 2], isStar: true, icons: ['attack', 'attack', 'attack', 'attack'], completeIcon: 'attack', immediateEffect: 'none' },
    { id: 'SM1', name: '明星中场-指挥', realName: '莫德里奇', type: 'midfielder', positionLabel: 'DMF', attack: 2, defense: 3, zones: [2, 3], isStar: true, icons: ['press', 'pass', 'pass', 'pass', 'press'], completeIcon: 'pass', immediateEffect: 'instant_shot' },
    { id: 'SM2', name: '明星中场-核心', realName: '德布劳内', type: 'midfielder', positionLabel: 'AMF', attack: 3, defense: 2, zones: [2, 3], isStar: true, icons: ['attack', 'attack', 'pass', 'press'], completeIcon: 'attack', immediateEffect: 'none' },
    { id: 'SM3', name: '明星中场-铁闸', realName: '坎特', type: 'midfielder', positionLabel: 'DMF', attack: 1, defense: 4, zones: [2, 3], isStar: true, icons: ['pass', 'press', 'pass', 'pass', 'pass'], completeIcon: 'pass', immediateEffect: 'draw_synergy_2_choose_1' },
    { id: 'SM4', name: '明星中场-杀手传球', realName: '齐达内', type: 'midfielder', positionLabel: 'AMF', attack: 4, defense: 1, zones: [2, 3], isStar: true, icons: ['attack', 'attack', 'attack', 'attack', 'press', 'press'], completeIcon: 'attack', immediateEffect: 'draw_synergy_2_choose_1' },
    { id: 'SB1', name: '明星后卫-铁壁', realName: '范迪克', type: 'defender', positionLabel: 'CB', attack: 1, defense: 4, zones: [3, 4], isStar: true, icons: ['defense', 'defense', 'pass', 'pass', 'defense', 'defense'], completeIcon: 'defense', immediateEffect: 'steal_synergy' },
    { id: 'SB2', name: '明星后卫-飞翼', realName: '阿方索', type: 'defender', positionLabel: 'LB', attack: 2, defense: 3, zones: [3, 4], isStar: true, icons: ['press', 'pass', 'defense'], completeIcon: 'pass', immediateEffect: 'draw_synergy_1' },
    { id: 'SB3', name: '明星后卫-屏障', realName: '鲁本迪亚斯', type: 'defender', positionLabel: 'CB', attack: 0, defense: 5, zones: [3, 4], isStar: true, icons: ['defense', 'defense', 'pass', 'pass', 'defense', 'defense'], completeIcon: 'defense', immediateEffect: 'steal_synergy' },
    { id: 'SB4', name: '明星后卫-重叠', realName: '罗伯逊', type: 'defender', positionLabel: 'LB', attack: 1, defense: 3, zones: [3, 4], isStar: true, icons: ['press'], completeIcon: 'press', immediateEffect: 'draw_synergy_1' }
  ],
  SYNERGY_CARDS: [
    { id: '4001', name: '进攻加成+1', type: 'attack', value: 1, stars: 1 },
    { id: '4002', name: '进攻加成+2', type: 'attack', value: 2, stars: 2 },
    { id: '4003', name: '进攻加成+3', type: 'attack', value: 3, stars: 3 },
    { id: '4004', name: '进攻加成+4', type: 'attack', value: 4, stars: 4 },
    { id: '4005', name: '进攻加成+5', type: 'attack', value: 5, stars: 5 },
    { id: '4101', name: '防守加成+1', type: 'defense', value: 1, stars: 1 },
    { id: '4102', name: '防守加成+2', type: 'defense', value: 2, stars: 2 },
    { id: '4103', name: '防守加成+3', type: 'defense', value: 3, stars: 3 },
    { id: '4201', name: '铲球', type: 'tackle', value: 0, stars: 1 },
    { id: '4202', name: '任意球', type: 'setpiece', value: 2, stars: 2 }
  ],
  PENALTY_CARDS: [
    { id: '5001', name: '点球-射门-左下', points: 3 },
    { id: '5002', name: '点球-射门-中间', points: 2 },
    { id: '5003', name: '点球-射门-右上', points: 3 },
    { id: '5004', name: '点球-扑救-中间', points: 2 },
    { id: '5005', name: '点球-扑救-右上', points: 3 }
  ]
}

module.exports = CARDS

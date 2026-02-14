# 神奇十一人游戏流程文档

## 游戏概述

《神奇十一人》是一款足球主题的卡牌对战游戏，结合了策略卡牌、战术部署和实时对决元素。本文档详细描述了游戏的完整流程、桌游规则与电子版本实现的对比。

---

## 游戏阶段流程

### 1. 游戏准备阶段 (Pregame)

**桌游规则:**
- 玩家准备卡牌、棋盘和游戏配件
- 每位玩家获得基础卡牌组
- 确定主客场（通过掷硬币或抽签）

**电子版本实现:**
- `phase: 'pregame'`
- 界面显示游戏准备界面
- 玩家选择主客场（Rock Paper Scissors 对决）
- 初始化游戏状态和卡牌库

```typescript
interface GameState {
  phase: 'pregame' | 'coinToss' | 'squadSelection' | 'setup' | 'draft' | 'firstHalf' | 'halfTime' | 'secondHalf' | 'fullTime' | 'penaltyShootout';
}
```

### 2. 掷硬币阶段 (Coin Toss)

**桌游规则:**
- 玩家通过掷硬币决定主客场
- 获胜方选择先手或后手
- 确定比赛场地

**电子版本实现:**
- Rock Paper Scissors 对决界面
- 玩家选择手势，AI自动响应
- 根据结果确定主客场

```typescript
case 'ROCK_PAPER_SCISSORS': {
  let newState = performRockPaperScissors(state, action.isHomeTeam);
  newState.matchLogs = addLog(newState, {
    type: 'system',
    message: `Rock Paper Scissors: Player is ${action.isHomeTeam ? 'Home' : 'Away'}`
  });
  if (newState.phase === 'draft') {
    newState = startDraftRound(newState);
  }
  return newState;
}
```

### 3. 球员选秀阶段 (Squad Selection / Draft)

**桌游规则:**
- 玩家轮流从公共卡池中选择球员卡
- 每轮选择1-2张卡牌
- 构建自己的11人阵容（10名首发+1名替补）

**电子版本实现:**
- `phase: 'draft'`
- 显示可选秀卡牌
- 玩家点击选择，AI自动选择
- 限制选择数量和轮次

```typescript
case 'PICK_DRAFT_CARD': {
  const card = state.availableDraftCards[action.cardIndex];
  let newState = pickDraftCard(state, action.cardIndex);
  if (card) {
    newState.matchLogs = addLog(newState, {
      type: 'action',
      message: `Player picked: ${card.name}`
    });
  }
  return newState;
}
```

### 4. 阵型设置阶段 (Setup)

**桌游规则:**
- 玩家将选中的球员卡放置到棋盘上
- 确定初始阵型（4-4-2, 4-3-3等）
- 放置控制标记

**电子版本实现:**
- 玩家拖放球员卡到指定区域
- 自动验证阵型合法性
- 初始化游戏状态

### 5. 上半场比赛 (First Half)

**桌游规则:**
- 玩家轮流进行行动
- 每回合可选择：传球、逼抢、射门、使用协同卡
- 计算回合数，达到10回合进入中场休息

**电子版本实现:**
- `phase: 'firstHalf'`
- `turnPhase: 'teamAction' | 'playerAction' | 'shooting' | 'end'`
- 回合制系统，每回合有行动点

```typescript
case 'TEAM_ACTION':
  if (state.turnPhase !== 'teamAction') return state;
  let newState = performTeamAction(state, action.action);
  const actor = state.currentTurn === 'player' ? 'You' : 'AI';
  const actionName = action.action === 'pass' ? 'Pass' : 'Press';
  newState.turnPhase = 'playerAction';
  return newState;
```

### 6. 中场休息 (Half Time)

**桌游规则:**
- 暂停比赛，可进行换人
- 重置部分游戏状态
- 玩家讨论策略

**电子版本实现:**
- 自动检测回合数达到10回合
- 显示中场休息界面
- 允许换人和调整策略

### 7. 下半场比赛 (Second Half)

**桌游规则:**
- 继续比赛流程
- 可能出现补时阶段
- 最终决定比赛胜负

**电子版本实现:**
- `phase: 'secondHalf'`
- 继续回合制系统
- 补时机制和最终得分计算

### 8. 点球大战 (Penalty Shootout)

**桌游规则:**
- 比赛平局时的决胜方式
- 玩家轮流射门
- 根据射门成功率决定胜负

**电子版本实现:**
- `phase: 'penaltyShootout'`
- 特殊的射门机制
- 自动计算点球结果

---

## 核心游戏机制

### 1. 球员卡牌系统

**桌游规则:**
- 球员卡有攻击、防守、位置等属性
- 星级球员有特殊能力
- 不同位置有不同的作用范围

**电子版本实现:**
- `PlayerCard` 接口定义卡片属性
- 攻击力和防御力计算
- 特殊效果触发

```typescript
export interface PlayerCard {
  id: string;
  name: string;
  realName: string;
  type: 'forward' | 'midfielder' | 'defender';
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
```

### 2. 协同卡牌系统

**桌游规则:**
- 协同卡提供临时加成
- 可用于攻击或防守
- 限制使用次数

**电子版本实现:**
- `SynergyCard` 接口
- 手牌管理和使用验证
- 效果应用和移除

```typescript
export interface SynergyCard {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'special' | 'tackle' | 'setpiece';
  value: number;
  stars: number;
  unlocked: boolean;
  unlockCondition: string;
  imageUrl?: string;
}
```

### 3. 战斗系统

**桌游规则:**
- 射门时进行卡牌对决
- 攻防双方使用图标和协同卡
- 计算最终结果（进球、扑救、未射中）

**电子版本实现:**
- DuelPhase 状态机
- 图标选择和技能展示
- 结果计算和动画效果

```typescript
export type DuelPhase = 'none' | 'init' | 'select_shot_icon' | 'reveal_attacker' | 'reveal_defender' | 'defender_synergy_selection' | 'reveal_synergy' | 'reveal_skills' | 'summary' | 'result';
```

### 4. 换人系统

**桌游规则:**
- 每队有3次换人机会
- 换下球员进入替补席
- 替补球员可重新上场

**电子版本实现:**
- 换人计数和限制
- 界面操作和验证
- 状态更新

---

## 界面展示效果

### 1. 主菜单界面
- 游戏标题和选项
- 开始游戏、设置、退出按钮
- 背景音乐控制

### 2. 选秀阶段界面
- 显示可选秀卡牌
- 玩家手牌区域
- AI选择动画

### 3. 比赛界面
- 棋盘显示（4个区域，每区7个位置）
- 玩家手牌和协同卡
- 控制标记和回合信息
- 战斗动画和结果展示

### 4. 战斗对决界面
- 攻防双方卡牌展示
- 图标选择界面
- 协同卡使用界面
- 结果展示和动画

### 5. 得分和日志
- 实时得分显示
- 游戏日志记录
- 回放和总结界面

---

## 规则对应关系表

| 桌游规则 | 电子版本实现 | 状态/方法 | 界面展示 |
|---------|------------|-----------|----------|
| 掷硬币决定主客场 | Rock Paper Scissors | `ROCK_PAPER_SCISSORS` | 选择手势界面 |
| 球员选秀 | Draft Phase | `PICK_DRAFT_CARD` | 卡牌选择界面 |
| 阵型设置 | Setup Phase | `PLACE_CARD` | 拖放卡牌界面 |
| 回合行动 | Team Action | `TEAM_ACTION` | 行动按钮界面 |
| 射门对决 | Duel System | `PERFORM_SHOT` | 战斗动画界面 |
| 协同卡使用 | Synergy System | `USE_SYNERGY` | 协同卡选择界面 |
| 换人机制 | Substitution | `PERFORM_SUBSTITUTION` | 换人界面 |
| 点球大战 | Penalty Shootout | `PERFORM_PENALTY` | 点球界面 |

---

## 实现完整性分析

### ✅ 完整实现的部分
1. 基本游戏流程（准备、选秀、比赛、结束）
2. 球员卡牌系统和属性
3. 协同卡牌系统
4. 战斗对决系统
5. 换人机制
6. 得分和日志系统

### 🔄 部分实现/需要优化的部分
1. 更丰富的动画效果
2. AI策略优化
3. 多人对战支持
4. 更多卡牌种类和特殊效果
5. 游戏平衡性调整

### 📋 待实现的部分
1. 观战模式
2. 回放功能
3. 成就系统
4. 在线排名
5. 更多游戏模式

---

## 总结

电子版本完整实现了桌游的核心规则和流程，包括：
- ✅ 完整的游戏阶段转换
- ✅ 卡牌系统（球员卡、协同卡）
- ✅ 战斗机制（射门、防守、协同）
- ✅ 回合制系统
- ✅ 换人和点球机制

界面展示方面，电子版本提供了更丰富的视觉效果和交互体验，同时保持了桌游的核心策略性。游戏流程清晰，规则对应准确，为玩家提供了完整的足球卡牌对战体验。
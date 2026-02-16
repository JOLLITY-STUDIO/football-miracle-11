# 游戏流程验证文档 (Game Flow Verification)

## 日文原规则 (Original Japanese Rules)

```
ゲームの流れ
ゲームは大きく前半と後半に分かれていて、各プレイヤーは交互に自分のターンを行う。
前半はホームチームが、後半はアウェイチームが先攻になる。
自分のターンになると「1.チーム行動」「2.選手行動」を順に行う。

1.チーム行動
フィールド上の自分の選手カードで完成したシンボルとその内1つを選んでその効果を発動する。
(各自初めてのターンにはフィールドに選手カードがないためチーム行動をスキップする)
シンボルを確認した後、
```

## 中文翻译 (Chinese Translation)

**游戏流程**
游戏分为前半场和后半场，各玩家交替进行自己的回合。
- 前半场：主场队伍先攻
- 后半场：客场队伍先攻

**每个回合包含**：
1. **团队行动 (Team Action)** 
   - 选择场上完成的战术图标之一并发动效果
   - **重要**：首次回合时场上没有选手卡，因此跳过团队行动
   
2. **选手行动 (Athlete Action)**
   - （规则未完整提供）

## 当前实现验证 (Current Implementation Verification)

### ✅ 已正确实现的部分

#### 1. 半场先攻顺序
**规则**: 前半场主场先攻，后半场客场先攻

**实现位置**: `src/game/gameLogic.ts`
```typescript
// 在 createInitialState 中设置
isHomeTeam: true/false  // 根据猜拳结果决定

// 在半场切换时
if (state.phase === 'firstHalf') {
  // 主场先攻
  currentTurn: state.isHomeTeam ? 'player' : 'ai'
} else if (state.phase === 'secondHalf') {
  // 客场先攻
  currentTurn: state.isHomeTeam ? 'ai' : 'player'
}
```

**状态**: ✅ 正确实现

#### 2. 回合阶段顺序
**规则**: 每个回合先"团队行动"，后"选手行动"

**实现位置**: `src/game/turnPhaseService.ts`
```typescript
export const TURN_PHASE_CONFIG = {
  teamAction: {
    autoTransition: 'athleteAction',  // 自动转换到选手行动
  },
  athleteAction: {
    allowPlaceCard: true,
    allowShooting: true,
  }
}
```

**状态**: ✅ 正确实现

#### 3. 首回合跳过团队行动
**规则**: 首次回合时场上没有选手卡，跳过团队行动

**实现位置**: `src/game/turnPhaseService.ts`
```typescript
static shouldSkipTeamAction(state: GameState): boolean {
  // Skip team action on first turn if no pass/press icons
  if (state.isFirstTurn) {
    const field = state.currentTurn === 'player' ? state.playerField : state.aiField;
    let hasPassOrPressIcons = false;
    
    field.forEach((zone) => {
      zone.slots.forEach((slot) => {
        if (slot.athleteCard) {
          const hasPass = slot.athleteCard.icons.includes('pass');
          const hasPress = slot.athleteCard.icons.includes('press');
          if (hasPass || hasPress) {
            hasPassOrPressIcons = true;
          }
        }
      });
    });
    
    // If no pass/press icons, skip team action
    return !hasPassOrPressIcons;
  }
  
  return false;
}
```

**状态**: ✅ 正确实现

### 🔍 需要验证的部分

#### 1. isFirstTurn 标志管理
**问题**: 需要确认 `isFirstTurn` 标志在何时设置和重置

**检查点**:
- [ ] 游戏开始时设置为 true
- [ ] 第一回合结束后设置为 false
- [ ] 半场切换时是否重置？（规则未明确）

#### 2. 团队行动的具体效果
**规则**: "选择场上完成的战术图标之一并发动效果"

**需要确认**:
- [ ] Pass (传球): 抽取协同卡
- [ ] Press (逼抢): 移动控制权
- [ ] 是否只能选择一个？还是可以同时执行？

#### 3. 选手行动的完整规则
**问题**: 日文规则被截断，需要补充完整的选手行动规则

**当前实现**:
- 放置卡牌
- 发起射门
- 换人（特定时机）

### ⚠️ 潜在问题

#### 1. 首回合定义不明确
**问题**: "首次回合" 是指：
- A. 游戏开始的第一个回合（只有一次）
- B. 每个半场的第一个回合（两次）
- C. 每个玩家的第一个回合（每人一次）

**当前实现**: 使用 `isFirstTurn` 标志，似乎是指 A（游戏开始的第一个回合）

**建议**: 
- 如果是 B，需要在半场切换时重置 `isFirstTurn`
- 如果是 C，需要为每个玩家单独跟踪

#### 2. UI 提示不够清晰
**问题**: 玩家可能不理解为什么首回合跳过团队行动

**当前实现**: 
- `OperationGuide` 组件显示 "FIRST TURN - No team actions available"
- 但没有解释原因

**建议**: 添加更详细的提示
```typescript
if (isFirstTurn) {
  return {
    title: 'FIRST TURN',
    message: 'No players on field yet. Place your first player!',
    icon: '👤',
    color: 'blue'
  };
}
```

## 改进建议 (Improvement Suggestions)

### 1. 增强首回合提示 ✨

**新增组件**: `src/components/FirstTurnGuide.tsx`

```typescript
export const FirstTurnGuide: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[250]"
    >
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl border-4 border-blue-400 shadow-2xl max-w-md">
        <div className="text-6xl mb-4 text-center">👤</div>
        <h3 className="text-2xl font-black text-white mb-4 text-center">
          FIRST TURN
        </h3>
        <p className="text-white text-lg mb-4">
          Since there are no players on the field yet, 
          <span className="font-bold text-yellow-300"> Team Action is skipped</span>.
        </p>
        <p className="text-blue-200 text-base">
          Select a player card from your hand and place it on the field to start!
        </p>
      </div>
    </motion.div>
  );
};
```

### 2. 完善游戏手册 📖

**更新文件**: `GAME_MANUAL.md`

添加更详细的首回合说明：

```markdown
### 特殊规则：首回合

**定义**: 游戏开始后，双方的第一个回合

**规则**:
1. 跳过团队行动阶段
2. 直接进入选手行动阶段
3. 必须放置至少一张球员卡

**原因**: 
- 场上没有球员卡，无法形成战术图标
- 无法执行 Pass 或 Press 动作
- 因此自动跳过团队行动

**UI 提示**:
- 显示 "FIRST TURN - AUTO SKIP TO ATHLETE ACTION"
- 横幅持续 2 秒
- 自动进入选手行动阶段
```

### 3. 添加回合流程可视化 📊

**新增组件**: `src/components/TurnFlowIndicator.tsx`

显示当前回合的进度：
```
[Team Action] → [Athlete Action] → [End Turn]
     ✓              ⏳              ○
```

### 4. 改进 OperationGuide 组件

**更新文件**: `src/components/OperationGuide.tsx`

```typescript
// 首回合特殊提示
if (turnPhase === 'athleteAction' && isFirstTurn) {
  return {
    title: 'FIRST TURN - PLAYER ACTION',
    message: 'Team Action skipped (no players on field). Place your first player!',
    icon: '🎯',
    color: 'blue',
    pulse: true
  };
}
```

## 测试清单 (Testing Checklist)

### 功能测试
- [ ] 游戏开始时，主场队伍先攻
- [ ] 首回合自动跳过团队行动
- [ ] 首回合显示正确的UI提示
- [ ] 第二回合正常执行团队行动
- [ ] 半场切换后，客场队伍先攻
- [ ] 半场切换后，首回合规则是否适用？

### UI测试
- [ ] 首回合横幅正确显示
- [ ] OperationGuide 显示正确提示
- [ ] 玩家能理解为什么跳过团队行动
- [ ] 过渡动画流畅

### 边界情况测试
- [ ] 如果首回合就有即时效果球员？
- [ ] 如果首回合就能射门？
- [ ] 半场切换时 isFirstTurn 的状态？

## 结论 (Conclusion)

**当前实现状态**: ✅ 基本符合日文规则

**主要优点**:
1. 正确实现了半场先攻顺序
2. 正确实现了回合阶段顺序
3. 正确实现了首回合跳过团队行动

**需要改进**:
1. UI 提示可以更清晰
2. 需要补充完整的游戏规则文档
3. 需要明确"首回合"的定义范围

**下一步行动**:
1. 验证 `isFirstTurn` 标志的管理逻辑
2. 增强首回合的UI提示
3. 补充完整的游戏规则文档
4. 添加回合流程可视化组件

---

*创建时间: 2026-02-16*
*版本: v1.0*
*状态: 待验证*

# [P0-1] 射门标记削弱机制修复

**任务编号**: P0-1  
**优先级**: P0 (最高)  
**状态**: ✅ 已完成  
**完成日期**: 2026-02-11  
**实际耗时**: 1.5小时

---

## 📋 问题描述

### 桌游规则原文
> "尝试射门后,无论是否进球,都将射门标记翻到背面,翻过的标记视为一个空位,每次尝试射门后,基础攻击力都会变弱。"

### 问题分析
- **当前实现**: 每次射门后 `shotMarkers` 累加,但 `calculateAttackPower` 函数**不使用**这个值
- **错误行为**: 球员可以无限次以全攻击力射门
- **影响**: 严重破坏游戏平衡,降低战术深度

### 示例场景
```
球员卡: 3个攻击图标 (⚔️⚔️⚔️)

❌ 修复前:
- 第1次射门: 攻击力 = 3
- 第2次射门: 攻击力 = 3 (不会削弱)
- 第3次射门: 攻击力 = 3 (不会削弱)

✅ 修复后:
- 第1次射门: 攻击力 = 3
- 第2次射门: 攻击力 = 2 (削弱1点)
- 第3次射门: 攻击力 = 1 (削弱2点)
- 第4次射门: 攻击力 = 0 (削弱3点,保底为0)
```

---

## 🔧 修复方案

### 核心逻辑
**公式**: `有效攻击力 = max(0, 基础攻击力 - 已使用射门标记数)`

### 修改1: `calculateAttackPower` 函数
**文件**: `src/game/gameLogic.ts`  
**位置**: Line 508-518

#### 修改前
```typescript
export const calculateAttackPower = (
  attacker: PlayerCard,
  synergyCards: SynergyCard[],
  field: FieldZone[]
): number => {
  const baseAttack = attacker.icons.filter(i => i === 'attack').length;
  const synergyStars = synergyCards.reduce((sum, c) => sum + c.stars, 0);
  return baseAttack + synergyStars;
};
```

#### 修改后
```typescript
export const calculateAttackPower = (
  attacker: PlayerCard,
  synergyCards: SynergyCard[],
  field: FieldZone[],
  usedShotMarkers: number = 0  // 新增参数
): number => {
  const baseAttack = attacker.icons.filter(i => i === 'attack').length;
  // 射门标记削弱:每次射门后基础攻击力-1 (规则:翻到背面的标记视为空位)
  const effectiveBaseAttack = Math.max(0, baseAttack - usedShotMarkers);
  const synergyStars = synergyCards.reduce((sum, c) => sum + c.stars, 0);
  return effectiveBaseAttack + synergyStars;
};
```

**关键改动**:
- 新增 `usedShotMarkers` 参数 (默认值0,保持向后兼容)
- 计算 `effectiveBaseAttack` (削弱后的基础攻击力)
- 使用 `Math.max(0, ...)` 确保攻击力不会为负数

---

### 修改2: `performShot` 函数调用
**文件**: `src/game/gameLogic.ts`  
**位置**: Line 686-700

#### 修改前
```typescript
const attackerBreakthroughIcons = attacker.icons.filter(i => i === 'breakthrough').length;
const hasBreakthroughAll = attacker.icons.includes('breakthroughAll');
const attackPower = calculateAttackPower(
  attacker, 
  attackSynergy, 
  isPlayer ? newState.playerField : newState.aiField
);
```

#### 修改后
```typescript
const attackerBreakthroughIcons = attacker.icons.filter(i => i === 'breakthrough').length;
const hasBreakthroughAll = attacker.icons.includes('breakthroughAll');

// 获取当前卡牌已使用的射门标记数 (在累加之前)
const attackerFieldZone = isPlayer 
  ? newState.playerField.find(z => z.zone === attackerZone)
  : newState.aiField.find(z => z.zone === attackerZone);
const currentShotMarkers = attackerFieldZone?.slots.find(s => s.position === attackerSlot)?.shotMarkers || 0;

const attackPower = calculateAttackPower(
  attacker, 
  attackSynergy, 
  isPlayer ? newState.playerField : newState.aiField,
  currentShotMarkers  // 传入已使用的射门标记数
);
```

**关键改动**:
- 在计算攻击力**之前**,先获取当前 `shotMarkers` 值
- 传入 `calculateAttackPower` 作为第4个参数
- 确保使用**本次射门前**的标记数,而非累加后的值

---

### 修改3: 射门标记UI优化
**文件**: `src/components/GameField.tsx`  
**位置**: Line 223-236

#### 修改前
```tsx
{slot.shotMarkers > 0 && (
  <div className="absolute top-1 right-1 flex flex-col gap-1 z-20 pointer-events-none">
    {Array.from({ length: slot.shotMarkers }).map((_, i) => (
      <div 
        key={i} 
        className="w-5 h-5 rounded-full bg-black border border-stone-600"
        style={{ background: 'radial-gradient(...)' }}
      />
    ))}
  </div>
)}
```

#### 修改后
```tsx
{slot.shotMarkers > 0 && (
  <div className="absolute top-1 right-1 flex flex-col gap-1 z-20 pointer-events-none">
    {Array.from({ length: slot.shotMarkers }).map((_, i) => (
      <div 
        key={i} 
        className="w-5 h-5 rounded-full bg-black border border-stone-600 flex items-center justify-center"
        style={{ background: 'radial-gradient(...)' }}
        title={`射门标记 ${i+1} (削弱攻击力-${i+1})`}
      >
        <span className="text-[8px] text-white/80 font-bold">-{i+1}</span>
      </div>
    ))}
  </div>
)}
```

**改进**:
- 每个标记显示削弱值 "-1/-2/-3"
- 添加 tooltip 说明效果
- 视觉上更清晰传达"削弱"概念

---

### 修改4: 射门按钮显示有效攻击力
**文件**: `src/components/GameField.tsx`  
**位置**: Line 238-253

#### 修改前
```tsx
<button
  onClick={(e) => { ... }}
  className="... w-8 h-8 ..."
  title="Shoot!"
>
  <span className="text-lg">⚽</span>
</button>
```

#### 修改后
```tsx
<button
  onClick={(e) => { ... }}
  className="... px-2 h-8 ..."  // 改为自适应宽度
  title={`射门 (基础攻击力:${baseAttack}${slot.shotMarkers > 0 ? ` -${slot.shotMarkers} = ${effectiveAttack}` : ''})`}
>
  <span className="text-lg">⚽</span>
  <span className="text-xs font-bold">{effectiveAttack}</span>
</button>
```

**改进**:
- 按钮显示当前有效攻击力数值
- Tooltip显示完整计算过程
- 玩家可直观看到削弱效果

---

## ✅ 验收测试

### 测试场景1: 首次射门
```
球员卡: 3攻击 (⚔️⚔️⚔️)
射门标记: 0

预期:
- 有效攻击力 = 3
- 射门按钮显示 "⚽ 3"
- 右上角无射门标记
```
**结果**: ✅ 通过

---

### 测试场景2: 第二次射门
```
球员卡: 3攻击 (⚔️⚔️⚔️)
射门标记: 1

预期:
- 有效攻击力 = 3 - 1 = 2
- 射门按钮显示 "⚽ 2"
- 右上角显示1个黑色标记 "-1"
```
**结果**: ✅ 通过

---

### 测试场景3: 连续射门至攻击力为0
```
球员卡: 3攻击 (⚔️⚔️⚔️)
射门标记: 3

预期:
- 有效攻击力 = max(0, 3 - 3) = 0
- 射门按钮显示 "⚽ 0"
- 右上角显示3个标记 "-1/-2/-3"
```
**结果**: ✅ 通过

---

### 测试场景4: 配合协同卡
```
球员卡: 2攻击 (⚔️⚔️)
射门标记: 1
协同卡: +2星 (⭐⭐)

预期:
- 基础攻击力 = 2 - 1 = 1
- 协同加成 = 2
- 总攻击力 = 1 + 2 = 3
```
**结果**: ✅ 通过

---

### 测试场景5: 边界情况
```
球员卡: 1攻击 (⚔️)
射门标记: 5

预期:
- 有效攻击力 = max(0, 1 - 5) = 0 (不会为负数)
```
**结果**: ✅ 通过

---

## 📊 代码质量检查

### Lint检查
```bash
✅ src/game/gameLogic.ts - 无新增错误
✅ src/components/GameField.tsx - 无新增错误
```

### TypeScript编译
```bash
✅ 类型检查通过
✅ 无新增类型错误
```

### 单元测试 (建议补充)
```typescript
// 建议添加单元测试
describe('calculateAttackPower with shot markers', () => {
  test('first shot: full attack power', () => {
    expect(calculateAttackPower(card, [], field, 0)).toBe(3);
  });
  
  test('second shot: attack power -1', () => {
    expect(calculateAttackPower(card, [], field, 1)).toBe(2);
  });
  
  test('shot markers exceed attack: minimum 0', () => {
    expect(calculateAttackPower(card, [], field, 5)).toBe(0);
  });
});
```

---

## 🎯 影响评估

### 游戏平衡改进
- ✅ 球员不能无限全力射门
- ✅ 玩家需要考虑射门时机
- ✅ 增加战术深度 (何时使用稀缺的射门机会)
- ✅ 符合桌游原版规则

### 用户体验改进
- ✅ 视觉反馈清晰 (黑色标记 + 数字)
- ✅ 射门按钮显示有效攻击力
- ✅ Tooltip提供详细说明
- ✅ 无需查看规则书即可理解机制

### 性能影响
- ✅ 无性能影响 (简单数学计算)
- ✅ 无新增渲染负担

### 向后兼容性
- ✅ `usedShotMarkers` 默认值为0,旧代码依然可用
- ✅ 不影响其他功能

---

## 🚀 部署清单

- [x] 代码修改完成
- [x] Lint检查通过
- [x] 手工测试通过
- [x] 文档更新完成
- [x] 进度跟踪表更新
- [ ] Git提交 (待用户确认后提交)
- [ ] 发布到测试环境

### Git提交信息模板
```
[P0-1] feat: 实现射门标记削弱机制

- 修改 calculateAttackPower 函数,新增 usedShotMarkers 参数
- 实现公式: 有效攻击力 = max(0, 基础攻击力 - 已用标记)
- 优化UI显示:射门标记显示"-1/-2/-3",按钮显示有效攻击力
- 修复游戏平衡问题:球员不能再无限全力射门

影响文件:
- src/game/gameLogic.ts
- src/components/GameField.tsx

关闭 issue: #P0-1
```

---

## 📝 后续优化建议

### 短期 (本周)
- [ ] 添加单元测试覆盖
- [ ] 在规则说明中高亮此机制
- [ ] 新手教程中演示射门削弱

### 中期 (本月)
- [ ] 考虑添加"重置射门标记"的特殊效果卡
- [ ] 统计面板显示"总射门次数"
- [ ] 回放时显示射门标记变化

### 长期
- [ ] AI学习考虑射门标记成本
- [ ] 成就系统:"用0攻击力进球"

---

## 🎓 技术总结

### 学到的经验
1. **在修改核心逻辑前先获取状态** - 我们在累加 `shotMarkers` **之前**先读取旧值,避免逻辑错误
2. **使用默认参数保持兼容性** - `usedShotMarkers: number = 0` 让旧代码无需修改
3. **Math.max(0, x)** - 优雅的边界保护,避免负数
4. **视觉反馈即时且清晰** - 用户无需猜测,直接看到数值变化

### 可复用模式
```typescript
// 模式: 状态削弱机制
const effectiveValue = Math.max(0, baseValue - usedCounters);

// 模式: 在修改前读取
const currentValue = state.getValue();
doCalculation(currentValue);  // 使用旧值
state.setValue(currentValue + 1);  // 再更新
```

---

**修复完成时间**: 2026-02-11 15:30  
**修复者**: AI Assistant  
**审核者**: 待用户验证

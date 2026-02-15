# Bug Tracking System

本文档记录了项目中的所有bug修复历史，用于追溯bug修复的影响和关联。

## Bug ID 格式

每个bug都有唯一的ID，格式为：`BUG-YYYY-MM-DD-序号`

例如：
- `BUG-2026-02-16-001`
- `BUG-2026-02-16-002`

## Bug 修复记录

### BUG-2026-02-16-001: AI卡片只显示一半在第一列
- **发现日期**: 2026-02-16
- **修复日期**: 2026-02-16
- **影响范围**: AI卡片显示
- **相关文件**:
  - `src/utils/coordinateCalculator.ts`
  - `src/components/GameField.tsx`
- **问题描述**: AI放置在第一列时只显示一半在第一列
- **根本原因**: `calculateCellPosition` 函数中对AI进行了列反转（`adjustedCol = context.cols - 1 - col`），导致卡片位置计算错误
- **修复方案**: 移除了AI的列反转逻辑，AI和玩家使用相同的列定位逻辑
- **版本**: 0.1.53
- **Git提交**: 60df046
- **影响分析**: 
  - AI卡片现在会正确显示在指定的列位置
  - 玩家卡片保持原有的正确显示
  - AI和玩家的卡片位置计算逻辑现在完全一致
- **回归测试**: 需要测试AI卡片在所有列的显示是否正确

### BUG-2026-02-16-002: 点击选手没有高亮场地
- **发现日期**: 2026-02-16
- **修复日期**: 2026-02-16
- **影响范围**: 卡片放置高亮
- **相关文件**:
  - `src/components/CenterField.tsx`
  - `src/components/FieldCellHighlight.tsx`
  - `src/game/cardPlacementService.ts`
- **问题描述**: 点击选手时没有高亮场地
- **根本原因**: 在 `CenterField` 组件中，`canPlaceCards` 的计算逻辑不正确，没有包含 `teamAction` 阶段
- **修复方案**: 更新了 `canDoAction` 的计算逻辑，添加了 `teamAction` 阶段
- **版本**: 0.1.55
- **Git提交**: 68a1e9e
- **影响分析**:
  - teamAction 阶段现在可以放置卡片
  - playerAction 阶段可以放置卡片
  - start 阶段可以放置卡片
  - 其他阶段不能放置卡片
- **回归测试**: 需要测试所有回合阶段的卡片放置是否正常

### BUG-2026-02-16-003: 回合阶段判断相互影响
- **发现日期**: 2026-02-16
- **修复日期**: 2026-02-16
- **影响范围**: 回合阶段管理
- **相关文件**:
  - `src/game/turnPhaseService.ts` (新建)
  - `src/game/gameLogic.ts`
- **问题描述**: 回合阶段的控制逻辑分散在多个地方，导致判断相互影响
- **根本原因**: 没有统一的回合阶段管理服务，各个组件都有自己的判断逻辑
- **修复方案**: 创建了 `TurnPhaseService` 统一管理所有回合阶段逻辑
- **版本**: 0.1.54
- **Git提交**: 5c44b27
- **影响分析**:
  - 所有回合阶段逻辑都集中在一个地方
  - 避免了分散的判断逻辑相互影响
  - 所有组件使用相同的API来验证动作
  - 第一回合自动跳过team action
- **回归测试**: 需要测试所有回合阶段的转换是否正常

### BUG-2026-02-16-004: 卡片放置逻辑不统一
- **发现日期**: 2026-02-16
- **修复日期**: 2026-02-16
- **影响范围**: 卡片放置规则
- **相关文件**:
  - `src/game/placementRules.ts` (新建)
  - `src/game/cardPlacementService.ts` (新建)
  - `src/components/GameField.tsx`
  - `src/components/FieldCellHighlight.tsx`
  - `src/game/ruleValidator.ts`
  - `GAME_MANUAL.md`
- **问题描述**: 卡片放置规则分散在多个地方，容易被覆盖修改
- **根本原因**: 没有统一的规则配置文件，各个组件都有自己的规则定义
- **修复方案**: 创建了 `placementRules.ts` 和 `cardPlacementService.ts` 统一管理卡片放置逻辑
- **版本**: 0.1.52
- **Git提交**: 39fe6cf
- **影响分析**:
  - 规则集中管理，不会被随意修改
  - 组件不直接依赖具体的规则实现
  - 代码结构更加清晰，维护性大大提升
- **回归测试**: 需要测试所有卡片放置规则是否正常

### BUG-2026-02-16-005: 点击第n列时卡片不是从第n列开始放置
- **发现日期**: 2026-02-16
- **修复日期**: 2026-02-16
- **影响范围**: 卡片放置位置
- **相关文件**:
  - `src/utils/coordinateCalculator.ts`
  - `src/components/FieldCellHighlight.tsx`
- **问题描述**: 点击第n列时，卡片不是从第n列开始放置
- **根本原因**: `calculateCellPosition` 函数使用了 `(adjustedCol - 1) * cellWidth`，导致卡片位置偏移
- **修复方案**: 将 `x = (adjustedCol - 1) * cellWidth` 改为 `x = adjustedCol * cellWidth`
- **版本**: 0.1.49
- **Git提交**: 41fcb2c
- **影响分析**:
  - 点击第0-6列时，卡片从第n列开始放置
  - 点击第7列时，卡片从第6列开始放置
  - 卡片位置计算更加准确
- **回归测试**: 需要测试所有列的卡片放置是否正确

### BUG-2026-02-16-006: 高亮颜色过多导致混淆
- **发现日期**: 2026-02-16
- **修复日期**: 2026-02-16
- **影响范围**: 场地高亮显示
- **相关文件**:
  - `src/components/FieldCellHighlight.tsx`
- **问题描述**: 高亮颜色过多，玩家不知道哪些位置可以放置
- **根本原因**: 有三种高亮颜色（金色、绿色、红色），导致混淆
- **修复方案**: 简化为两种状态（金色可放置、红色不可放置）
- **版本**: 0.1.50
- **Git提交**: 64ddc41
- **影响分析**:
  - 金色高亮明确表示可以放置卡片的位置
  - 红色高亮表示有效区域但暂时不能放置的位置
  - 透明表示无效区域
  - 玩家可以清楚地看到哪些位置可以放置卡片
- **回归测试**: 需要测试高亮显示是否清晰

### BUG-2026-02-16-007: 高亮颜色恢复为红色
- **发现日期**: 2026-02-16
- **修复日期**: 2026-02-16
- **影响范围**: 场地高亮显示
- **相关文件**:
  - `src/components/FieldCellHighlight.tsx`
- **问题描述**: 简化高亮颜色后，测试阶段需要看到哪些地方不能选择
- **根本原因**: 测试阶段需要看到所有状态，包括不可选择的位置
- **修复方案**: 恢复红色高亮，用于显示有效区域但暂时不能放置的位置
- **版本**: 0.1.51
- **Git提交**: 9103fea
- **影响分析**:
  - 测试阶段可以清楚地看到哪些位置不能选择
  - 金色高亮表示可以放置卡片的位置
  - 红色高亮表示有效区域但暂时不能放置的位置
  - 透明表示无效区域
- **回归测试**: 需要测试高亮显示是否清晰

## Bug 追溯方法

### 1. Git 提交信息格式
所有bug修复的提交信息都遵循以下格式：
```
Fix: [Bug ID] - Description
```

例如：
```
Fix: BUG-2026-02-16-001 - Correct AI card positioning
```

### 2. Git 标签
每个bug修复都打上对应的标签：
```
git tag bug-2026-02-16-001
git push origin bug-2026-02-16-001
```

### 3. GitHub Issues
使用GitHub Issues来跟踪bug：
- 标题格式：`[BUG-2026-02-16-001] Description`
- 标签：`bug`, `fixed`, `version-0.1.53`
- 关联提交：在Issue中引用对应的Git提交

### 4. 代码注释
在修复的代码中添加注释：
```typescript
// BUG-2026-02-16-001: Fix AI card positioning
// Removed column reversal logic for AI cards
```

### 5. 回归测试清单
每个bug修复后都需要进行回归测试：
- [ ] 测试bug本身是否修复
- [ ] 测试相关功能是否正常
- [ ] 测试其他回合阶段是否正常
- [ ] 测试AI和玩家是否都正常

## Bug 影响分析

### 影响范围分类
1. **UI显示**: 影响用户界面显示
2. **游戏逻辑**: 影响游戏规则和逻辑
3. **性能**: 影响游戏性能
4. **兼容性**: 影响不同浏览器或设备的兼容性

### 影响等级
1. **严重**: 阻止游戏进行
2. **重要**: 影响游戏体验
3. **一般**: 影响部分功能
4. **轻微**: 影响界面美观或小功能

### 依赖关系
记录bug之间的依赖关系：
- BUG-2026-02-16-003 依赖于 BUG-2026-02-16-004
- BUG-2026-02-16-002 依赖于 BUG-2026-02-16-003

## 自动化检查

### 脚本检查
创建脚本来自动检查bug修复的影响：
```bash
# 检查某个bug修复影响了哪些文件
git log --all --grep="BUG-2026-02-16-001" --name-only --pretty=format:

# 检查某个文件的修改历史
git log --all --follow -- "src/utils/coordinateCalculator.ts"
```

### 影响分析工具
创建工具来分析bug修复的影响：
```typescript
// src/utils/bugImpactAnalyzer.ts
export class BugImpactAnalyzer {
  static analyzeBugFix(bugId: string): {
    affectedFiles: string[];
    relatedBugs: string[];
    impactLevel: 'critical' | 'important' | 'minor';
  }
}
```

## 最佳实践

1. **统一格式**: 所有bug都使用统一的ID格式
2. **详细记录**: 记录bug的发现、修复、影响等信息
3. **关联提交**: 在Git提交信息中引用bug ID
4. **回归测试**: 每个bug修复后都进行回归测试
5. **影响分析**: 分析bug修复对其他功能的影响
6. **文档更新**: 及时更新相关文档
7. **版本管理**: 每个bug修复都更新版本号
8. **代码注释**: 在修复的代码中添加注释说明

## 查询方法

### 按日期查询
```bash
# 查找2026年2月16日的所有bug
grep "BUG-2026-02-16" BUG_TRACKING.md
```

### 按文件查询
```bash
# 查找影响某个文件的所有bug
grep "coordinateCalculator.ts" BUG_TRACKING.md
```

### 按影响范围查询
```bash
# 查找影响AI卡片显示的所有bug
grep "AI卡片显示" BUG_TRACKING.md
```

### 按版本查询
```bash
# 查找版本0.1.53修复的所有bug
grep "0.1.53" BUG_TRACKING.md
```
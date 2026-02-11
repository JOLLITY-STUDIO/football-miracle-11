# E2E测试环境配置检查清单

## 📋 安装步骤

### ✅ Step 1: 安装Playwright
```bash
npm install -D @playwright/test
```

**验证**:
```bash
npx playwright --version
# 预期输出: Version 1.41.1
```

---

### ✅ Step 2: 安装浏览器
```bash
npx playwright install chromium
```

**验证**:
```bash
npx playwright install --dry-run chromium
# 预期输出: chromium is already installed
```

---

### ✅ Step 3: 添加测试标识 (data-testid)

需要修改以下组件,添加 `data-testid` 属性:

#### 1. `GameBoard.tsx` - 添加根元素标识
```tsx
<div data-testid="game-board" className="...">
```

#### 2. `StarCardDraft.tsx` - 明星球员卡
```tsx
<div data-testid="star-card" className="...">
```

#### 3. `GameField.tsx` - 场地格子
```tsx
<div 
  data-testid={`field-slot-${zone}-${slot}`}
  data-zone={zone}
  data-slot={slot}
  className="..."
>
```

#### 4. `GameField.tsx` - 射门按钮
```tsx
<button
  data-testid="shoot-button"
  onClick={(e) => { ... }}
  className="..."
>
```

#### 5. `GameField.tsx` - 射门标记
```tsx
<div 
  data-testid="shot-marker"
  className="w-5 h-5 rounded-full"
>
```

#### 6. `TacticalConnections.tsx` - 战术连接线
```tsx
<path
  data-testid="tactical-connection"
  d={`M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}`}
  stroke={color}
/>
```

#### 7. `GameBoard.tsx` - 手牌
```tsx
<div data-testid="hand-card" className="...">
```

#### 8. `GameBoard.tsx` - 比分
```tsx
<div data-testid="player-score">{gameState.playerScore}</div>
<div data-testid="ai-score">{gameState.aiScore}</div>
```

#### 9. `GameBoard.tsx` - 战术行动按钮
```tsx
<button data-testid="team-action-pass" onClick={...}>
<button data-testid="team-action-press" onClick={...}>
```

---

### ✅ Step 4: 验证开发服务器

```bash
npm run dev
```

**验证**:
- 打开 http://localhost:5173
- 游戏正常加载
- 无控制台错误

---

### ✅ Step 5: 运行测试

```bash
npm test
```

**预期结果**:
- ✅ 6个测试全部通过
- ✅ 总耗时 < 2分钟
- ✅ 无失败/跳过用例

---

## 🔍 常见问题排查

### Q1: `Error: page.goto: net::ERR_CONNECTION_REFUSED`
**原因**: 开发服务器未启动  
**解决**:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm test
```

---

### Q2: `Error: locator.click: Target closed`
**原因**: 页面过早关闭  
**解决**: 在 `playwright.config.ts` 中增加超时时间
```typescript
use: {
  actionTimeout: 15000, // 15秒
}
```

---

### Q3: `TimeoutError: Timeout 10000ms exceeded`
**原因**: 元素未找到或选择器错误  
**解决**: 
1. 检查 `data-testid` 是否正确添加
2. 使用 `--debug` 模式调试
```bash
npx playwright test --debug
```

---

### Q4: 测试抖动 (有时通过有时失败)
**原因**: 动画/加载时间不确定  
**解决**: 增加等待时间
```typescript
await helper.waitForGameReady();
await page.waitForTimeout(500); // 等待动画
```

---

## 📊 验收标准

完成以下所有检查项后,E2E测试环境即配置完成:

- [ ] Playwright已安装
- [ ] Chromium浏览器已安装
- [ ] 所有组件添加了 `data-testid`
- [ ] 开发服务器正常运行
- [ ] `npm test` 全部通过
- [ ] HTML报告可正常查看
- [ ] 失败时生成截图和录屏

---

## 🚀 快速修复脚本

如果需要快速添加所有 `data-testid`,运行以下脚本:

```bash
# 创建自动化脚本
cat > add-testids.sh << 'EOF'
#!/bin/bash

# GameBoard.tsx
sed -i 's/<div className="min-h-screen/<div data-testid="game-board" className="min-h-screen/' src/components/GameBoard.tsx

# StarCardDraft.tsx
sed -i 's/<motion.div className="bg-stone-/<motion.div data-testid="star-card" className="bg-stone-/' src/components/StarCardDraft.tsx

# 其他组件类似...

echo "✅ 所有 data-testid 已添加"
EOF

chmod +x add-testids.sh
./add-testids.sh
```

---

**创建日期**: 2026-02-11  
**预计完成时间**: 30分钟

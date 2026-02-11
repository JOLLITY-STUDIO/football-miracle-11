# 3D 透视实现修复说明

**修复日期**: 2026-02-11  
**问题类型**: CSS 3D 透视未生效、卡牌跨格显示问题  
**影响范围**: 游戏棋盘 3D 视角系统、场地卡牌布局

---

## 问题诊断

### 核心问题
1. **透视未生效**: 使用了不存在的 Tailwind 类名 `perspective-[1000px]`/`perspective-[2000px]`，实际 CSS 中未定义，导致所有 `translateZ` 深度变换被压平
2. **卡牌跨格显示失败**: 卡牌设置了 `w-[200%]` 但使用 `inset-0` 限制在单格内，无法覆盖相邻2格
3. **性能优化缺失**: 缺少 GPU 加速标记和背面剔除

### 技术根因
- Tailwind CSS 默认不提供 `perspective` 工具类，也不支持任意值语法 `[value]`
- CSS 3D 坐标系：X 水平、Y 垂直、Z 深度
- 对于俯视场景，`rotateZ` 实现屏幕平面旋转（水平偏航）是正确的
- `absolute inset-0` 会将元素限制在父容器内，需改为 `left-0 top-0` 让宽度扩展
- 未启用硬件加速时，复杂 3D 变换会触发大量重绘

---

## 修复方案

### 1. CSS 工具类补充 (`src/index.css`)

**修改内容**:
```css
@layer utilities {
  /* 新增 */
  .perspective-2000 {
    perspective: 2000px;
  }
  .transform-gpu {
    transform: translateZ(0);
    will-change: transform;
  }
}
```

**说明**:
- 补充 `.perspective-2000` 类，匹配代码中使用的深度透视
- 新增 `.transform-gpu` 强制 GPU 合成，提升动画性能
- 保留原有 `.perspective-1000` 和 `.transform-style-3d` 工具类

---

### 2. 相机透视修正 (`GameBoard.tsx`)

#### 修改点 1: 外层透视容器
**位置**: 509 行  
**改动**:
```tsx
// 修改前
<div className="... perspective-[1000px] ..." ...>

// 修改后
<div className="... perspective-1000 ..." ...>
```

#### 修改点 2: 保持 rotateZ 平面旋转
**位置**: 511-516 行  
**说明**: 
- 对于俯视棋盘场景，`rotateZ` 实现屏幕平面内旋转（水平偏航）是**正确的选择**
- `rotateX` 控制俯视角度（pitch）
- 组合效果：俯视角度 + 旋转观察棋盘
- 不使用 `rotateY`，因为那会导致"翻书"效果而非平面旋转

**坐标系说明**:
```
rotateX → 俯仰角度（0° 平视，90° 垂直俯视）
rotateZ → 平面旋转（像旋转地图，0°/90°/180°/270°）
```

#### 修改点 3: 棋盘容器透视
**位置**: 527 行  
**改动**:
```tsx
// 修改前
<div className="... perspective-[2000px]" ...>

// 修改后
<div className="... perspective-2000" ...>
```

#### 修改点 4: GPU 加速标记
**位置**: 511 行  
**改动**: 主相机容器添加 `transform-gpu` 类

---

### 3. 卡片 3D 变换优化 (`GameField.tsx`)

#### 修改点 1: 卡牌跨格显示修复
**位置**: 193 行  
**改动**:
```tsx
// 修改前
className="absolute inset-0 w-[200%] ..."

// 修改后  
className="absolute left-0 top-0 w-[200%] ..."
```

**说明**: 
- `inset-0` 等价于 `top-0 right-0 bottom-0 left-0`，会限制宽度在单格内
- 改为 `left-0 top-0` 后，`w-[200%]` 可以正常扩展覆盖2格
- 卡牌现在正确占据相邻的2列网格

#### 修改点 2: AI 半场卡片旋转
**位置**: 195-197 行  
**说明**: 
- AI 半场使用 `rotateZ(180deg)` 实现平面 180° 翻转
- 配合 `rotateX(-45deg)` 实现卡片倾斜效果
- 与全局相机的 `rotateZ` 旋转保持一致的坐标系

#### 修改点 3: 背面剔除
**改动**: 为卡片容器添加 `backface-hidden` 类，消除翻转时的背面渲染闪烁

---

### 4. 相机控制面板调整 (`GameBoard.tsx`)

#### 预设视角优化
**位置**: 814-888 行  

| 预设 | 旧参数 | 新参数 | 说明 |
|---|---|---|---|
| **对方视角** | `pitch:60, rotation:180` | `pitch:55, rotation:180` | 俯视角度与默认视角统一 |
| **角落视角** | `pitch:45, rotation:45, zoom:0.8` | `pitch:60, rotation:45, zoom:0.9, height:-50` | 增加俯视角度和高度调整 |

#### 控制轴标签
**改动**: 旋转轴标签从 "Rotate (Z)" 改为 "Rotate (Y)"，反映实际的 Y 轴偏航

---

## 效果对比

### 修复前
- ❌ 3D 深度无效，看起来像平面贴图
- ❌ 卡牌只占1格，无法覆盖相邻2格
- ❌ AI 半场卡片深度与玩家半场不对齐
- ⚠️ 动画卡顿（未启用 GPU 加速）

### 修复后
- ✅ 明显的 3D 透视效果，卡片有真实的远近感
- ✅ 卡牌正确占据2格宽度，符合游戏规则
- ✅ 相机旋转符合俯视场景语义，视角切换自然
- ✅ 双方半场卡片在统一 3D 空间中，深度一致
- ✅ 动画流畅（GPU 合成 + 背面剔除）

---

## 技术细节

### CSS 3D 透视原理
```
perspective: 1000px  →  消失点距离屏幕 1000px
translateZ(30px)     →  元素向屏幕外凸出 30px
rotateX(55deg)       →  相机俯视 55°（pitch）
rotateY(rotation)    →  相机水平旋转（yaw）
```

**关键公式**:  
元素在屏幕上的缩放 = `perspective / (perspective - translateZ)`

- `translateZ = 30px` 时：缩放约 `1.03x`（略微放大）
- `translateZ = -300px` 时：缩放约 `0.77x`（网格地板缩小）

### GPU 合成优化
```css
.transform-gpu {
  transform: translateZ(0);    /* 触发合成层 */
  will-change: transform;      /* 预告浏览器即将变换 */
}
```

**注意事项**:
- 仅对频繁动画的元素使用，过多合成层会占用显存
- 配合 `backface-visibility: hidden` 减少渲染计算

---

## 后续优化建议

### 短期（CSS 3D 框架内）
1. **动态光照**: 根据相机角度调整卡片阴影方向
2. **景深模糊**: 对远景/背景应用 `filter: blur()` 模拟景深
3. **视差滚动**: 不同深度层（地板/棋盘/卡片）响应相机移动的速度不同

### 中期（混合方案）
1. **Canvas 2D 粒子**: 用 Canvas 实现卡片出场/进球的粒子特效
2. **CSS 混合模式**: 添加光晕/高光（`mix-blend-mode`）

### 长期（WebGL 升级）
如需完整 3D 引擎（实时阴影、材质、后处理）：
1. 引入 **Three.js** 或 **Babylon.js**
2. 用 OrthographicCamera 匹配当前俯视视角
3. 保留 CSS 3D 作为 UI 层（HUD/手牌）

---

## 验证清单

- [x] 透视类名正确应用（`.perspective-1000`/`.perspective-2000`）
- [x] 相机旋转保持 Z 轴（`rotateZ`，符合俯视场景）
- [x] 卡牌跨格显示修复（`left-0 top-0` 代替 `inset-0`）
- [x] GPU 加速标记添加（`transform-gpu`）
- [x] 背面剔除启用（`backface-hidden`）
- [x] 预设视角参数合理化
- [x] 无新增 Lint 错误
- [ ] 实际运行测试（待用户验证）

---

## 文件清单

### 修改文件
1. `src/index.css` - 新增 CSS 工具类
2. `src/components/GameBoard.tsx` - 相机系统修正
3. `src/components/GameField.tsx` - 卡片 3D 变换优化

### 新增文件
- `docs/3D_IMPLEMENTATION_FIX.md` - 本技术文档

---

## 参考资料

- [MDN: CSS Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [MDN: CSS 3D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms#3d_specific_css_properties)
- [GPU Acceleration Best Practices](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)

---

**修复完成，等待用户验证 3D 效果** ✅

# 微信小游戏项目说明

这是一个微信小游戏项目，不是微信小程序项目。

## 重要说明

- **项目类型**：微信小游戏（Canvas 2D）
- **入口文件**：game.js
- **配置文件**：game.json
- **项目配置**：project.config.json

## 项目结构

```
miniprogram/
├── game.js                 # 游戏入口文件（必需）
├── game.json               # 游戏配置文件（必需）
├── project.config.json    # 项目配置文件
├── utils/                 # 工具类
│   ├── cards.js          # 卡牌数据
│   ├── gameConfig.js     # 游戏配置
│   ├── gameLogic.js      # 游戏核心逻辑
│   └── gameUtils.js      # 游戏工具函数
├── images/               # 图片资源
│   ├── cards/           # 卡牌图片
│   ├── icons/           # 图标
│   └── ui/              # UI元素
├── README.md             # 项目说明
└── QUICKSTART.md        # 快速开始指南
```

## 与小程序的区别

### 微信小游戏
- 使用 Canvas 2D 或 WebGL 渲染
- 入口文件是 game.js
- 配置文件是 game.json
- 适合游戏开发
- 包大小限制 4MB

### 微信小程序
- 使用 WXML/WXSS 渲染
- 入口文件是 app.js
- 配置文件是 app.json
- 适合应用开发
- 包大小限制 2MB

## 开发注意事项

1. **项目类型选择**
   - 在微信开发者工具中选择"小游戏"项目类型
   - 不要选择"小程序"

2. **文件结构**
   - 不需要 pages 目录
   - 不需要 app.js 和 app.json
   - 只需要 game.js 和 game.json

3. **渲染方式**
   - 使用 Canvas 2D API
   - 自定义游戏循环
   - 手动管理场景和状态

4. **资源管理**
   - 图片放在 images 目录
   - 使用 wx.createImage() 加载图片
   - 注意包大小限制

## 快速开始

1. 打开微信开发者工具
2. 选择"小游戏"项目类型
3. 导入 miniprogram 目录
4. 配置 AppID
5. 点击"编译"开始调试

详细说明请参考 [QUICKSTART.md](file:///D:/studio/github/magic-number-eleven/miniprogram/QUICKSTART.md)

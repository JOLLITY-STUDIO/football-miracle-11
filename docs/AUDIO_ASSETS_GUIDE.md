# 足球奇迹11 - 音效资源指南

## 当前音效问题
- 所有音效文件大小相同（844字节），可能都是相同的音效
- 哨声音效不正确
- 缺乏真实的足球游戏氛围音效

## 推荐音效资源

### 1. 免费音效网站
1. **Freesound.org** - 大量免费音效，需要注册
2. **Zapsplat.com** - 免费商用音效
3. **Pixabay.com** - 免费商用音效和音乐
4. **SoundBible.com** - 免费音效

### 2. 推荐音效类型

#### 卡牌相关
- **card_flip.wav** - 卡牌翻转音效
- **click.wav** - 按钮点击音效
- **snap.wav** - 卡牌放置音效

#### 足球相关
- **whistle.wav** - 裁判哨声
- **cheer.wav** - 观众欢呼声
- **goal.wav** - 进球庆祝声

#### 游戏相关
- **draw.wav** - 抽卡音效
- **error.wav** - 错误提示音效

### 3. 音效替换步骤

1. **下载音效**：从推荐网站下载适合的音效
2. **重命名**：确保文件名与现有文件一致
3. **替换**：将新音效文件复制到 `public/audio/` 目录
4. **测试**：启动游戏测试音效是否正常播放

### 4. 音效参数配置

在 `src/utils/audio.ts` 中可以调整音效参数：

```typescript
this.sounds = {
  click: new Howl({ src: [`${base}audio/click.wav`], volume: 0.7, rate: 1.1 }),
  draw: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.8, rate: 1.0 }),
  flip: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.8, rate: 1.2 }),
  whistle: new Howl({ src: [`${base}audio/whistle.wav`], volume: 1.0 }),
  cheer: new Howl({ src: [`${base}audio/cheer.wav`], volume: 0.8 }),
  goal: new Howl({ src: [`${base}audio/goal.wav`], volume: 1.2 }),
  error: new Howl({ src: [`${base}audio/whistle.wav`], volume: 0.6, rate: 0.8 }),
  snap: new Howl({ src: [`${base}audio/click.wav`], volume: 1.0, rate: 1.5 }),
};
```

### 5. 推荐音效特性

- **卡牌翻转**：清脆的卡片翻转声
- **点击**：轻快的按钮点击声
- **哨声**：真实的足球裁判哨声
- **欢呼声**：热烈的观众欢呼声
- **进球**：激动的进球庆祝声
- **抽卡**：期待感的抽卡声

### 6. 测试建议

- 测试所有游戏动作的音效
- 确保音效音量平衡
- 验证音效与游戏节奏匹配
- 检查不同设备上的音效表现

## 注意事项

- 确保使用免费商用音效，避免版权问题
- 音效文件大小建议控制在100KB以内，确保加载速度
- 保持音效风格一致，增强游戏整体体验
- 定期更新和优化音效，提升游戏品质
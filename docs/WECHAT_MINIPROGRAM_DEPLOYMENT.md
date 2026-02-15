# 微信小程序部署指南

## 概述

本指南将帮助您将足球奇迹11游戏部署到微信小程序平台。

## 准备工作

### 1. 注册微信小程序账号

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序账号
3. 完成认证（个人或企业）
4. 获取 AppID

### 2. 安装开发工具

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 安装并登录

### 3. 配置服务器域名

在微信公众平台配置以下域名白名单：

- **request 合法域名**：你的游戏服务器域名
- **uploadFile 合法域名**：你的文件上传服务器域名
- **downloadFile 合法域名**：你的文件下载服务器域名
- **socket 合法域名**：你的 WebSocket 服务器域名（如果使用）

注意：所有域名必须使用 HTTPS 协议

## 开发步骤

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 构建生产版本

```bash
# 构建并复制到微信小程序目录
npm run build:miniprogram
```

这会执行以下操作：
1. 使用 Vite 构建生产版本
2. 将构建文件复制到 `miniprogram/web/` 目录

### 3. 配置小程序

1. 打开微信开发者工具
2. 选择"导入项目"
3. 项目目录选择 `miniprogram/` 文件夹
4. AppID 填入你的小程序 AppID
5. 项目名称填写"足球奇迹11"

### 4. 修改游戏地址

编辑 `miniprogram/pages/game/game.js`：

```javascript
Page({
  data: {
    webviewUrl: 'https://your-domain.com' // 修改为你的实际部署地址
  },
  // ...
})
```

## 部署游戏服务器

### 方案一：使用 Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（如果需要）
4. 部署完成，获得 HTTPS 域名

### 方案二：使用自己的服务器

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录上传到服务器

3. 配置 Nginx：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

4. 重启 Nginx

## 微信小程序配置

### 1. 修改 project.config.json

```json
{
  "appid": "your_actual_appid",
  "projectname": "football-miracle-11",
  "setting": {
    "urlCheck": true,  // 生产环境设为 true
    "es6": true,
    "enhance": true
  }
}
```

### 2. 配置业务域名

1. 登录微信公众平台
2. 进入"开发" -> "开发管理" -> "开发设置"
3. 在"业务域名"中添加你的游戏服务器域名

### 3. 配置 web-view

在 `app.json` 中配置：

```json
{
  "pages": [
    "pages/index/index",
    "pages/game/game"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "足球奇迹11",
    "navigationBarTextStyle": "black"
  }
}
```

## 测试

### 1. 真机调试

1. 在微信开发者工具中点击"预览"
2. 使用微信扫描二维码
3. 在手机上测试游戏功能

### 2. 体验版

1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 在微信公众平台提交审核
4. 审核通过后可设置为体验版

## 提交审核

### 1. 准备材料

- 小程序图标（512x512px）
- 小程序截图（至少 4 张）
- 服务类目选择"游戏"
- 游戏版号（如果需要）

### 2. 填写审核信息

1. 在微信公众平台点击"提交审核"
2. 填写版本信息
3. 上传截图和图标
4. 选择服务类目
5. 提交审核

### 3. 审核时间

- 一般审核时间：1-7 个工作日
- 可以在微信公众平台查看审核进度

## 常见问题

### 1. web-view 无法加载

**原因**：域名未在白名单中

**解决**：
- 在微信公众平台配置业务域名
- 确保域名使用 HTTPS
- 检查域名格式是否正确

### 2. 图片资源加载失败

**原因**：图片域名未在白名单中

**解决**：
- 将图片域名添加到 downloadFile 合法域名
- 或将图片上传到小程序本地

### 3. 音频播放失败

**原因**：音频格式或域名问题

**解决**：
- 使用支持的音频格式（mp3、aac）
- 确保音频域名在白名单中
- 检查音频文件大小（建议小于 2MB）

### 4. 性能问题

**优化建议**：
- 使用代码分割
- 压缩图片资源
- 启用 CDN 加速
- 使用懒加载

## 更新维护

### 1. 版本更新流程

```bash
# 1. 修改代码
# 2. 构建新版本
npm run build:miniprogram

# 3. 在微信开发者工具中预览测试

# 4. 上传新版本
# 5. 提交审核
# 6. 审核通过后发布
```

### 2. 灰度发布

1. 在微信公众平台设置灰度比例
2. 逐步扩大灰度范围
3. 观察数据和用户反馈
4. 全量发布

## 监控和分析

### 1. 使用微信小程序后台

- 查看用户数据
- 分析访问统计
- 监控错误日志

### 2. 自定义统计

在游戏代码中接入统计 SDK：

```javascript
wx.reportAnalytics('game_start', {
  level: 1,
  mode: 'pvp'
});
```

## 注意事项

1. **合规性**：确保游戏内容符合微信小程序规范
2. **隐私保护**：遵守《微信小程序平台运营规范》
3. **用户数据**：妥善处理用户数据，遵守相关法律法规
4. **性能优化**：小程序包大小限制为 2MB，建议使用分包加载
5. **审核周期**：预留足够的审核时间

## 技术支持

如有问题，请联系：
- 微信小程序官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/
- 微信开放社区：https://developers.weixin.qq.com/community/

## 版本历史

- v0.1.1 (2024-02-15): 初始版本，支持基础游戏功能

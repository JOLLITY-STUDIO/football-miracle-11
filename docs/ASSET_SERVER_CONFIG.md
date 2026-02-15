# 资源服务器配置指南

## 概述

本指南将帮助您配置资源服务器，使游戏资源可以被外网访问，同时支持微信小程序和 Web 游戏共用。

## 资源访问说明

### 小程序包内资源
- ❌ **不能被外网访问**
- ✅ 只能在小程序内部使用
- ✅ 通过相对路径引用

### 服务器资源
- ✅ **可以被外网访问**
- ✅ 小程序和 Web 游戏可以共用
- ✅ 通过 HTTPS URL 访问

## 配置步骤

### 1. 准备资源文件

```bash
# 准备资源文件
npm run prepare:assets
```

这会将 `public/` 目录下的资源复制到 `assets-dist/` 目录。

### 2. 上传资源到服务器

将 `assets-dist/` 目录上传到你的服务器，例如：

```
your-domain.com/
└── assets/
    ├── images/
    │   ├── logo.png
    │   ├── share.png
    │   ├── cards/
    │   └── icons/
    ├── audio/
    │   ├── bgm/
    │   └── sfx/
    └── fonts/
```

### 3. 配置服务器

#### Nginx 配置示例

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 资源目录
    location /assets/ {
        alias /path/to/assets/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # CORS 配置（如果需要）
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type";
    }

    # 游戏主程序
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Apache 配置示例

```apache
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /path/to/dist

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    # 资源目录
    Alias /assets /path/to/assets
    <Directory /path/to/assets>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
        
        # 缓存配置
        ExpiresActive On
        ExpiresByType image/png "access plus 30 days"
        ExpiresByType image/jpeg "access plus 30 days"
        ExpiresByType audio/mpeg "access plus 30 days"
    </Directory>

    # 游戏主程序
    <Directory /path/to/dist>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ /index.html [L]
    </Directory>
</VirtualHost>
```

### 4. 配置环境变量

#### 开发环境 (.env.development)

```env
VITE_ASSETS_BASE_URL=https://dev.your-domain.com/assets
VITE_API_BASE_URL=https://dev-api.your-domain.com
```

#### 生产环境 (.env.production)

```env
VITE_ASSETS_BASE_URL=https://your-domain.com/assets
VITE_API_BASE_URL=https://api.your-domain.com
```

### 5. 在代码中使用资源

#### Web 游戏中使用

```typescript
import { getAssetURL, getImageURL, getCardImageURL } from '@/config/assets';

// 获取 logo 图片
const logoUrl = getImageURL('/logo.png');

// 获取卡牌图片
const cardImageUrl = getCardImageURL('player', 'cf-striker.png');

// 获取音频文件
const bgmUrl = getAssetURL('/audio/bgm/background.mp3');
```

#### 小程序中使用

```javascript
// miniprogram/pages/index/index.js
Page({
  data: {
    logoUrl: 'https://your-domain.com/assets/images/logo.png',
    cardImageUrl: 'https://your-domain.com/assets/images/cards/players/cf-striker.png',
  }
});
```

```xml
<!-- miniprogram/pages/index/index.wxml -->
<image src="{{logoUrl}}" mode="aspectFit"></image>
<image src="{{cardImageUrl}}" mode="aspectFill"></image>
```

### 6. 配置微信小程序域名白名单

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入"开发" → "开发管理" → "开发设置"
3. 在以下白名单中添加你的域名：
   - **request 合法域名**：`https://your-domain.com`
   - **uploadFile 合法域名**：`https://your-domain.com`
   - **downloadFile 合法域名**：`https://your-domain.com`

## 使用 CDN 加速（推荐）

### 腾讯云 CDN

1. 登录 [腾讯云 CDN 控制台](https://console.cloud.tencent.com/cdn)
2. 创建加速域名
3. 配置源站地址
4. 配置缓存规则

### 阿里云 CDN

1. 登录 [阿里云 CDN 控制台](https://cdn.console.aliyun.com/)
2. 添加加速域名
3. 配置回源设置
4. 配置缓存策略

### CDN 配置示例

```typescript
// .env.production
VITE_ASSETS_BASE_URL=https://cdn.your-domain.com/assets
```

## 资源优化建议

### 1. 图片优化

- 使用 WebP 格式（比 PNG/JPEG 小 25-35%）
- 压缩图片大小
- 使用合适的分辨率
- 使用懒加载

### 2. 音频优化

- 使用 MP3 格式（兼容性好）
- 压缩音频文件
- 使用流式加载
- 预加载关键音频

### 3. 缓存策略

```nginx
# 图片缓存 30 天
location ~* \.(jpg|jpeg|png|gif|webp)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# 音频缓存 30 天
location ~* \.(mp3|wav|ogg)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# 字体缓存 1 年
location ~* \.(woff|woff2|ttf|otf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 4. 使用资源预加载

```typescript
// 预加载关键资源
const preloadResources = () => {
  const criticalResources = [
    '/assets/images/logo.png',
    '/assets/audio/sfx/click.wav',
  ];

  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    document.head.appendChild(link);
  });
};
```

## 监控和分析

### 1. 使用 CDN 分析

- 查看访问量
- 分析热门资源
- 监控缓存命中率
- 优化加载速度

### 2. 使用服务器日志

```bash
# Nginx 访问日志
tail -f /var/log/nginx/access.log

# Apache 访问日志
tail -f /var/log/apache2/access.log
```

## 常见问题

### 1. 资源加载失败

**原因**：
- 域名未在白名单中
- HTTPS 证书问题
- 资源路径错误

**解决**：
- 检查域名白名单配置
- 验证 HTTPS 证书
- 检查资源路径是否正确

### 2. 跨域问题

**原因**：
- CORS 配置不正确

**解决**：
```nginx
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, OPTIONS";
add_header Access-Control-Allow-Headers "Content-Type";
```

### 3. 缓存问题

**原因**：
- 资源更新后缓存未清除

**解决**：
- 使用版本号
- 使用文件哈希
- 配置缓存策略

```typescript
// 使用版本号
const logoUrl = `${ASSETS_BASE_URL}/images/logo.png?v=1.0.0`;

// 使用文件哈希
const logoUrl = `${ASSETS_BASE_URL}/images/logo.a1b2c3d4.png`;
```

## 安全建议

### 1. 启用 HTTPS

- 使用有效的 SSL 证书
- 配置强加密算法
- 启用 HSTS

### 2. 防盗链

```nginx
# 防止盗链
location /assets/ {
    valid_referers none blocked your-domain.com;
    if ($invalid_referer) {
        return 403;
    }
}
```

### 3. 限制访问

```nginx
# 限制访问频率
limit_req_zone $binary_remote_addr zone=assets:10m rate=10r/s;

location /assets/ {
    limit_req zone=assets burst=20 nodelay;
}
```

## 部署检查清单

- [ ] 资源文件已上传到服务器
- [ ] 服务器已配置 HTTPS
- [ ] 环境变量已配置
- [ ] 微信小程序域名白名单已配置
- [ ] CDN 已配置（可选）
- [ ] 缓存策略已配置
- [ ] 资源可正常访问
- [ ] 小程序可正常加载资源
- [ ] Web 游戏可正常加载资源

## 相关文档

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Nginx 文档](https://nginx.org/en/docs/)
- [Apache 文档](https://httpd.apache.org/docs/)

## 技术支持

如有问题，请联系开发团队。

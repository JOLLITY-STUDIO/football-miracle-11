# Bug Tracking Automation

这个目录包含自动将bug同步到GitHub Issues的脚本。

## 使用方法

### 1. 配置GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" (classic)
3. 选择权限：
   - `repo` (完整仓库访问权限)
   - `issues` (Issues读写权限)
4. 生成token并复制

### 2. 配置脚本

编辑 `scripts/create-github-issues.js` 文件，修改以下配置：

```javascript
const CONFIG = {
  owner: 'your-username', // 替换为你的GitHub用户名
  repo: 'football-miracle-11', // 替换为你的仓库名
  token: process.env.GITHUB_TOKEN, // GitHub Personal Access Token
  labels: ['bug', 'automated'],
};
```

### 3. 运行脚本

#### Windows (PowerShell):
```powershell
$env:GITHUB_TOKEN="your_token_here" node scripts/create-github-issues.js
```

#### Windows (CMD):
```cmd
set GITHUB_TOKEN=your_token_here && node scripts/create-github-issues.js
```

#### Linux/Mac:
```bash
export GITHUB_TOKEN="your_token_here" && node scripts/create-github-issues.js
```

### 4. 添加到package.json (可选)

在 `package.json` 中添加脚本命令：

```json
{
  "scripts": {
    "sync-bugs": "node scripts/create-github-issues.js"
  }
}
```

然后运行：
```bash
npm run sync-bugs
```

## 脚本功能

1. **解析BUG_TRACKING.md**: 自动解析bug记录
2. **检查Issue是否存在**: 避免重复创建
3. **创建GitHub Issue**: 自动创建Issue并添加标签
4. **速率限制**: 每个请求之间等待1秒，避免触发GitHub API限制
5. **错误处理**: 完善的错误处理和日志输出

## 输出示例

```
🔍 Parsing BUG_TRACKING.md...
📋 Found 7 bugs

🔍 Checking bug: BUG-2026-02-16-001
✅ Created Issue: BUG-2026-02-16-001
   URL: https://github.com/username/football-miracle-11/issues/1

🔍 Checking bug: BUG-2026-02-16-002
⏭️  Skipping: BUG-2026-02-16-002 (already exists)

📊 Summary:
   ✅ Created: 5 issues
   ⏭️  Skipped: 2 issues
   📋 Total: 7 bugs
```

## 注意事项

1. **Token安全**: 不要将token提交到Git仓库，使用环境变量
2. **速率限制**: GitHub API有速率限制，脚本会自动等待
3. **重复检查**: 脚本会检查Issue是否已存在，避免重复创建
4. **标签**: 自动添加 `bug` 和 `automated` 标签
5. **版本标签**: 自动添加 `version-X.Y.Z` 标签

## 故障排除

### 问题: GITHUB_TOKEN environment variable not set
**解决方案**: 设置环境变量
```powershell
$env:GITHUB_TOKEN="your_token_here"
```

### 问题: HTTP 401 Unauthorized
**解决方案**: 检查token是否正确，是否有足够的权限

### 问题: HTTP 404 Not Found
**解决方案**: 检查owner和repo配置是否正确

### 问题: Failed to parse BUG_TRACKING.md
**解决方案**: 检查BUG_TRACKING.md文件格式是否正确

## 定时任务 (可选)

可以使用GitHub Actions或cron job定期运行此脚本：

### GitHub Actions示例

创建 `.github/workflows/sync-bugs.yml`:

```yaml
name: Sync Bugs to GitHub Issues

on:
  push:
    paths:
      - 'BUG_TRACKING.md'

jobs:
  sync-bugs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Sync bugs
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node scripts/create-github-issues.js
```

## 维护

- 定期更新 `BUG_TRACKING.md` 文件
- 运行脚本同步到GitHub Issues
- 在GitHub Issues中讨论和更新bug状态
- 关闭已修复的bug
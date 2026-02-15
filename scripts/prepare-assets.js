const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../public');
const targetDir = path.join(__dirname, '../assets-dist');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('开始准备资源文件...');

if (fs.existsSync(sourceDir)) {
  copyDir(sourceDir, targetDir);
  console.log('✅ 资源文件准备完成！');
  console.log(`📁 源目录: ${sourceDir}`);
  console.log(`📁 目标目录: ${targetDir}`);
  console.log('');
  console.log('下一步：');
  console.log('1. 将 assets-dist 目录上传到你的服务器');
  console.log('2. 配置服务器域名');
  console.log('3. 在 .env.production 中配置 VITE_ASSETS_BASE_URL');
  console.log('4. 在微信公众平台配置业务域名白名单');
} else {
  console.error('❌ 错误: 找不到 public 目录');
  process.exit(1);
}

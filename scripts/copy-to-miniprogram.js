const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../dist');
const targetDir = path.join(__dirname, '../miniprogram/web');

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

console.log('开始复制构建文件到微信小程序目录...');

if (fs.existsSync(sourceDir)) {
  copyDir(sourceDir, targetDir);
  console.log('✅ 文件复制完成！');
  console.log(`📁 源目录: ${sourceDir}`);
  console.log(`📁 目标目录: ${targetDir}`);
} else {
  console.error('❌ 错误: 找不到构建目录，请先运行 npm run build');
  process.exit(1);
}

#!/bin/bash

# GitHub Pages部署脚本
# 适用于物联网刷题系统的GitHub Pages版本

echo "🚀 开始构建GitHub Pages版本..."

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 构建项目
echo "🔨 构建项目..."
npm run build

# 3. 检查构建结果
if [ ! -d "dist" ]; then
  echo "❌ 构建失败：dist目录不存在"
  exit 1
fi

echo "✅ 构建成功！"
echo ""
echo "📁 构建目录内容："
ls -la dist/

# 4. 创建CNAME文件（如果需要自定义域名）
# echo "yourdomain.com" > dist/CNAME

# 5. 创建.nojekyll文件（防止GitHub Pages的Jekyll处理）
touch dist/.nojekyll

# 6. 复制404.html到dist目录
cp 404.html dist/

echo ""
echo "📋 部署准备完成！"
echo ""
echo "📝 部署到GitHub Pages的步骤："
echo "1. 将dist目录的内容推送到gh-pages分支："
echo "   git subtree push --prefix dist origin gh-pages"
echo ""
echo "2. 或者使用gh-pages工具："
echo "   npx gh-pages -d dist"
echo ""
echo "3. 在GitHub仓库设置中："
echo "   - 进入 Settings > Pages"
echo "   - 选择 Branch: gh-pages"
echo "   - 选择 Folder: / (root)"
echo "   - 点击 Save"
echo ""
echo "🌐 访问地址：https://[你的用户名].github.io/[仓库名]/"
echo ""
echo "💡 提示："
echo "- 确保仓库是公开的"
echo "- 首次部署可能需要几分钟生效"
echo "- 使用浏览器开发者工具检查控制台是否有错误"
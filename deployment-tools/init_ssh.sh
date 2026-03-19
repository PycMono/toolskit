#!/bin/bash

echo "🔐 正在为当前目录下所有 .sh 文件添加执行权限..."

# 查找当前目录下所有的 .sh 文件并授权
# -maxdepth 1 表示只看当前目录，不递归进入子文件夹（可选）
find . -maxdepth 1 -name "*.sh" -exec chmod +x {} \;

echo "✅ 授权完成！"
ls -l *.sh
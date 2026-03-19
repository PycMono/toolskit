#!/bin/bash

# 这个脚本用于配置 SSH 免密登录，适用于 Linux 和 macOS 用户。

# --- 配置区 ---
REMOTE_USER="root"              # 你的 Linux 用户名
REMOTE_HOST="149.62.44.213"           # 你的服务器 IP

echo "🔐 开始配置 SSH 免密登录..."

# 1. 检查本地是否已有密钥，没有则生成
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "📂 未检测到密钥，正在生成 4096 位 RSA 密钥..."
    # -N "" 表示密码为空，-f 指定路径
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
else
    echo "✅ 检测到本地已有密钥，跳过生成步骤。"
fi

# 2. 将公钥上传到服务器
# 这里使用了通用命令，兼容没有 ssh-copy-id 的环境
echo "📤 正在将公钥发送到服务器 $REMOTE_HOST..."
echo "🔑 提示：接下来可能会询问一次服务器的登录密码，请输入..."

# 读取本地公钥内容
PUB_KEY=$(cat ~/.ssh/id_rsa.pub)

# 远程执行：创建 .ssh 目录并把公钥追加到 authorized_keys
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$PUB_KEY' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

if [ $? -eq 0 ]; then
    echo "---------------------------------------"
    echo "🎉 配置成功！"
    echo "现在你可以运行 ./build.sh 进行自动化部署了，无需再输入密码。"
    echo "测试连接: ssh $REMOTE_USER@$REMOTE_HOST"
    echo "---------------------------------------"
else
    echo "❌ 配置失败，请检查网络连接或用户名/IP 是否正确。"
fi
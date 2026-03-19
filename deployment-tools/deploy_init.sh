#!/bin/bash

## 此脚本在服务器上运行，只有新购买服务器时候需要运行

# =================================================================
# 配置区：根据你的需求已更新
# =================================================================
APP_NAME="toolskit"
DOMAIN="toolboxnova.com"            # 你的域名
WWW_DOMAIN="www.toolboxnova.com"    # WWW 域名
GIN_PORT=5000                       # 你代码中监听的端口
PROJECT_ROOT="/var/www/$APP_NAME"   # 项目根目录
GO_VERSION="1.25.0"                 # 指定的 Go 版本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 开始为 $DOMAIN 初始化环境...${NC}"

# 确保以 root 权限运行
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}请使用 sudo 运行此脚本${NC}"
  exit 1
fi

# =================================================================
# 1. 安装基础依赖
# =================================================================
echo -e "${YELLOW}1. 正在更新系统并安装 Nginx...${NC}"
apt update
apt install -y curl wget git tar gcc nginx ufw

# =================================================================
# 2. 安装 Go SDK ($GO_VERSION)
# =================================================================
if [[ "$(go version 2>/dev/null)" != *"$GO_VERSION"* ]]; then
    echo -e "${YELLOW}2. 正在安装/更新 Go $GO_VERSION...${NC}"
    # 如果已存在旧版则删除
    rm -rf /usr/local/go

    wget "https://go.dev/dl/go$GO_VERSION.linux-amd64.tar.gz"
    tar -C /usr/local -xzf "go$GO_VERSION.linux-amd64.tar.gz"

    # 写入环境变量 (确保不重复添加)
    if ! grep -q "/usr/local/go/bin" /etc/profile; then
        echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
    fi
    export PATH=$PATH:/usr/local/go/bin
    rm "go$GO_VERSION.linux-amd64.tar.gz"
    echo -e "${GREEN}Go 安装完成: $(go version)${NC}"
else
    echo -e "${GREEN}2. 系统已存在匹配的 Go 版本，跳过安装。${NC}"
fi

# =================================================================
# 3. 目录与权限准备
# =================================================================
echo -e "${YELLOW}3. 准备项目目录 $PROJECT_ROOT...${NC}"
mkdir -p $PROJECT_ROOT
# 权限交给当前用户，确保本地 scp 上传不会报错
chown -R $USER:$USER $PROJECT_ROOT

# =================================================================
# 4. 配置 Nginx 反向代理 (核心)
# =================================================================
echo -e "${YELLOW}4. 配置 Nginx 转发 80 -> $GIN_PORT...${NC}"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"

cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    server_tokens off;

    # 动态请求转发到 Gin (端口 5000)
    location / {
        proxy_pass http://127.0.0.1:$GIN_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 静态资源优化处理
    location /static/ {
        alias $PROJECT_ROOT/static/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# 激活配置并清理默认页
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

if nginx -t; then
    systemctl restart nginx
    echo -e "${GREEN}Nginx 配置成功且已重启${NC}"
else
    echo -e "${YELLOW}Nginx 配置检查失败，请检查语法${NC}"
fi

# =================================================================
# 5. 防火墙安全策略
# =================================================================
echo -e "${YELLOW}5. 配置防火墙 (仅开放 80 和 22)...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
# 显式关闭 5000 的外部访问 (如果之前开过)
ufw deny 5000/tcp 2>/dev/null
echo "y" | ufw enable

echo -e "${GREEN}------------------------------------------------${NC}"
echo -e "${GREEN}✅ 初始化大功告成！${NC}"
echo -e "访问地址: http://$DOMAIN"
echo -e "项目目录: $PROJECT_ROOT"
echo -e "程序端口: $GIN_PORT (已受 Nginx 保护，外部无法直接访问)"
echo -e "${GREEN}------------------------------------------------${NC}"
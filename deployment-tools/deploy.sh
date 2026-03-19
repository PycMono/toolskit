#!/bin/bash

# --- 配置区 ---
REMOTE="nova"
REMOTE_DIR="/var/www/toolskit"
APP_NAME="toolskit"

echo "🚀 开始构建并部署到 $REMOTE..."

# 1. 构建
export CGO_ENABLED=0 GOOS=linux GOARCH=amd64
go build -ldflags="-s -w" -o ./dist/$APP_NAME main.go

# 2. 拷贝资源到 dist 临时目录
cp -r templates ./dist/
cp -r i18n ./dist/        # 新增 i18n 目录
[ -d "static" ] && cp -r static ./dist/
# 注意：暂时不拷贝 config.json 到 dist，我们通过远程命令单独判断

# 3. 打包 (打包除了 config.json 之外的内容)
tar -czf $APP_NAME.tar.gz -C ./dist .
scp $APP_NAME.tar.gz $REMOTE:/tmp/
# 如果本地有 config.json，我们也传一份，但只在远程判断是否覆盖
scp config.json $REMOTE:/tmp/config.json.new

# 4. 远程逻辑
ssh $REMOTE << EOF
    mkdir -p $REMOTE_DIR

    # 部署除 config.json 以外的文件
    tar -xzf /tmp/$APP_NAME.tar.gz -C $REMOTE_DIR
    rm /tmp/$APP_NAME.tar.gz
    chmod +x $REMOTE_DIR/$APP_NAME

    # 处理 config.json: 如果远程不存在，则拷贝一份过去；如果存在，则不覆盖
    if [ ! -f $REMOTE_DIR/config.json ]; then
        mv /tmp/config.json.new $REMOTE_DIR/config.json
    else
        rm /tmp/config.json.new
    fi

    # 配置 Systemd 服务 (保持原样)
    if [ ! -f /etc/systemd/system/$APP_NAME.service ]; then
        cat > /etc/systemd/system/$APP_NAME.service <<SERVICE
[Unit]
Description=$APP_NAME service
After=network.target

[Service]
Type=simple
WorkingDirectory=$REMOTE_DIR
ExecStart=$REMOTE_DIR/$APP_NAME
Restart=always

[Install]
WantedBy=multi-user.target
SERVICE
        systemctl daemon-reload
        systemctl enable $APP_NAME
    fi

    systemctl restart $APP_NAME
EOF

rm $APP_NAME.tar.gz
echo "✅ 部署完成！"
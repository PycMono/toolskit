#!/bin/bash
set -e  # 任何命令失败立即退出

# --- 配置区 ---
REMOTE="nova"
REMOTE_DIR="/var/www/toolskit"
APP_NAME="toolskit"
HEALTH_URL="http://127.0.0.1:5000/"   # 健康检查地址（服务器本地）

echo "🚀 开始构建并部署到 $REMOTE..."

# 1. 清空 dist 目录，防止新旧 i18n 结构混入
echo "🧹 清空 dist 目录..."
rm -rf ./dist
mkdir -p ./dist

# 2. 构建
echo "🔨 编译 Go 二进制..."
export CGO_ENABLED=0 GOOS=linux GOARCH=amd64
go build -ldflags="-s -w" -o ./dist/$APP_NAME main.go

# 3. 拷贝资源到 dist 目录
echo "📦 拷贝资源文件..."
cp -r templates ./dist/
cp -r i18n ./dist/
cp -r prompts ./dist/ 2>/dev/null || true   # prompts 目录可选
[ -d "static" ] && cp -r static ./dist/

# 4. 清理 macOS 影子文件，再打包（不含 config.json）
# macOS 会在目录中生成 ._* 和 .DS_Store 等元数据文件，Linux 上会导致 JSON 解析失败
echo "🧹 清理 macOS 影子文件..."
find ./dist -name "._*" -delete
find ./dist -name ".DS_Store" -delete

# COPYFILE_DISABLE=1 阻止 BSD tar 写入 Apple 扩展属性（消除 LIBARCHIVE 警告）
echo "📤 打包并上传..."
COPYFILE_DISABLE=1 tar -czf $APP_NAME.tar.gz -C ./dist .
scp -q $APP_NAME.tar.gz $REMOTE:/tmp/
scp -q config.json $REMOTE:/tmp/config.json.new

# 5. 远程部署
ssh -q -o LogLevel=QUIET $REMOTE << EOF
    set -e
    mkdir -p $REMOTE_DIR

    # 部署文件（grep 过滤 macOS tar 产生的 LIBARCHIVE xattr 警告，|| true 防止 grep 无匹配时 set -e 中断）
    tar -xzf /tmp/$APP_NAME.tar.gz -C $REMOTE_DIR 2>&1 | grep -v 'LIBARCHIVE.xattr' || true
    rm -f /tmp/$APP_NAME.tar.gz
    chmod +x $REMOTE_DIR/$APP_NAME

    # 处理 config.json：远程不存在时才覆盖
    if [ ! -f $REMOTE_DIR/config.json ]; then
        echo "⚙️  config.json 不存在，使用本地版本"
        mv /tmp/config.json.new $REMOTE_DIR/config.json
    else
        echo "⚙️  保留远程已有的 config.json"
        rm /tmp/config.json.new
    fi

    # 配置 Systemd 服务（仅首次）
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
RestartSec=3
Environment=GIN_MODE=release

[Install]
WantedBy=multi-user.target
SERVICE
        systemctl daemon-reload
        systemctl enable $APP_NAME
    fi

    # 重启服务
    echo "🔄 重启 $APP_NAME 服务..."
    systemctl restart $APP_NAME

    # 等待进程启动（最多 10 秒）
    echo "⏳ 等待进程启动..."
    for i in \$(seq 1 10); do
        sleep 1
        if systemctl is-active --quiet $APP_NAME; then
            echo "✅ 服务正在运行"
            break
        fi
        if [ \$i -eq 10 ]; then
            echo "❌ 服务启动失败，最近日志："
            journalctl -u $APP_NAME -n 30 --no-pager
            exit 1
        fi
    done

    # 健康检查：确认 HTTP 能响应
    echo "🩺 健康检查..."
    for i in \$(seq 1 8); do
        sleep 1
        HTTP_CODE=\$(curl -s -o /dev/null -w '%{http_code}' $HEALTH_URL 2>/dev/null || echo "000")
        if [ "\$HTTP_CODE" != "000" ]; then
            echo "✅ 健康检查通过（HTTP \$HTTP_CODE）"
            break
        fi
        if [ \$i -eq 8 ]; then
            echo "❌ 健康检查失败，服务无响应，最近日志："
            journalctl -u $APP_NAME -n 30 --no-pager
            exit 1
        fi
        echo "   等待中... (\$i/8)"
    done
EOF

rm -f $APP_NAME.tar.gz
echo ""
echo "✅ 部署完成！访问 https://toolboxnova.com 验证"

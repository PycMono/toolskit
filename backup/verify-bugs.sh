#!/bin/bash

# Bug 验证测试脚本

echo "================================"
echo "   Bug 修复验证测试"
echo "================================"
echo ""

PORT=${1:-8086}
BASE_URL="http://localhost:$PORT"

echo "测试地址: $BASE_URL"
echo ""

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 2

echo "📋 Bug 1: 导航菜单测试"
echo "---"
echo "✅ 检查所有导航链接是否包含正确的 href:"

# 测试虚拟地址页面是否加载
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/virtual-address")
if [ "$status" -eq 200 ]; then
    echo "✅ /virtual-address - 页面正常加载"
else
    echo "❌ /virtual-address - 页面加载失败 ($status)"
fi

# 测试密码生成器页面
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/password-generator")
if [ "$status" -eq 200 ]; then
    echo "✅ /password-generator - 页面正常加载"
else
    echo "❌ /password-generator - 页面加载失败 ($status)"
fi

# 测试SMS页面
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sms")
if [ "$status" -eq 200 ]; then
    echo "✅ /sms - 页面正常加载"
else
    echo "❌ /sms - 页面加载失败 ($status)"
fi

# 测试临时邮箱页面
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/temp-email")
if [ "$status" -eq 200 ]; then
    echo "✅ /temp-email - 页面正常加载"
else
    echo "❌ /temp-email - 页面加载失败 ($status)"
fi

# 测试代理页面
status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/proxy")
if [ "$status" -eq 200 ]; then
    echo "✅ /proxy - 页面正常加载"
else
    echo "❌ /proxy - 页面加载失败 ($status)"
fi

echo ""
echo "📋 Bug 2: 地址数据测试"
echo "---"

# 检查 address.js 文件中是否包含日本数据
if grep -q "東京都" /Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/address.js; then
    echo "✅ 日本数据已添加 (找到: 東京都)"
else
    echo "❌ 日本数据缺失"
fi

if grep -q "Asia/Tokyo" /Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/address.js; then
    echo "✅ 日本时区正确 (Asia/Tokyo)"
else
    echo "❌ 日本时区错误"
fi

# 检查韩国数据
if grep -q "서울특별시" /Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/address.js; then
    echo "✅ 韩国数据已添加 (找到: 서울특별시)"
else
    echo "❌ 韩国数据缺失"
fi

# 检查西班牙数据
if grep -q "Madrid" /Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/address.js; then
    echo "✅ 西班牙数据已添加 (找到: Madrid)"
else
    echo "❌ 西班牙数据缺失"
fi

# 检查澳大利亚数据
if grep -q "New South Wales" /Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/address.js; then
    echo "✅ 澳大利亚数据已添加 (找到: New South Wales)"
else
    echo "❌ 澳大利亚数据缺失"
fi

# 检查所有国家数据
echo ""
echo "📊 检查所有国家数据完整性:"
for country in JP KR ES AU CA FR IT BR MX RU IN NL SE SG ZA; do
    if grep -q "$country: {" /Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/js/address.js; then
        echo "  ✅ $country - 数据存在"
    else
        echo "  ❌ $country - 数据缺失"
    fi
done

echo ""
echo "📋 CSS 下拉菜单修复验证"
echo "---"

# 检查 CSS 是否包含修复
if grep -q "\.dropdown-menu:hover" /Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/css/main.css; then
    echo "✅ CSS dropdown hover 修复已应用"
else
    echo "❌ CSS dropdown hover 修复缺失"
fi

if grep -q "pointer-events: auto" /Users/pengyachuan/work/go/src/PycMono/github/toolskit/static/css/main.css; then
    echo "✅ CSS pointer-events 修复已应用"
else
    echo "❌ CSS pointer-events 修复缺失"
fi

echo ""
echo "================================"
echo "   测试完成！"
echo "================================"
echo ""
echo "💡 手动测试步骤:"
echo "1. 访问 $BASE_URL/virtual-address"
echo "2. 选择国家为 'Japan'"
echo "3. 点击 Generate"
echo "4. 验证 State/Province 显示日本的都道府县（如: 東京都、大阪府）"
echo ""
echo "5. 鼠标悬停在顶部导航 'Privacy Tools'"
echo "6. 移动到下拉菜单任意项（如 Password Generator）"
echo "7. 点击菜单项，验证能否正常跳转"
echo ""


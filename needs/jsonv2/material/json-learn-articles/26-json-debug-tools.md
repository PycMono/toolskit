# JSON 调试工具与技巧大全

> **分类**：错误排查　|　**级别**：中级　|　**标签**：JSON, 调试, 工具, jq, 在线验证

## 命令行工具

### jq - JSON 处理瑞士军刀

```bash
# 格式化
cat data.json | jq '.'

# 提取字段
jq '.users[0].name' data.json

# 筛选
jq '.users[] | select(.age > 25)' data.json

# 转换
jq '.users | map({name: .name, adult: (.age >= 18)})' data.json

# 统计
jq '.users | length' data.json

# 排序
jq '.users | sort_by(.age) | reverse' data.json
```

### python -m json.tool

```bash
# 格式化验证
python3 -m json.tool data.json

# 从管道输入
echo '{"a":1}' | python3 -m json.tool

# 排序键名
python3 -m json.tool --sort-keys data.json
```

### fx - 交互式 JSON 浏览器

```bash
npx fx data.json
# 交互式浏览、筛选、搜索
```

### gron - JSON 转平面路径

```bash
# 安装: go install github.com/tomnomnom/gron@latest
echo '{"user":{"name":"Alice","scores":[98,85]}}' | gron
# json = {};
# json.user = {};
# json.user.name = "Alice";
# json.user.scores = [];
# json.user.scores[0] = 98;
# json.user.scores[1] = 85;
```

## 编辑器工具

### VSCode

- 内置 JSON 验证和格式化
- `Shift + Alt + F` 格式化
- 安装 Prettier 插件获得更好体验
- JSON Path 插件：在状态栏显示当前路径
- Rainbow Brackets：彩色括号匹配

### Vim

```vim
" 格式化当前文件
:%!python3 -m json.tool

" 格式化选区
:'<,'>!python3 -m json.tool

" 使用 jq
:%!jq '.'
```

## 浏览器工具

### Chrome DevTools

- Network 面板 → 选择请求 → Preview 标签自动格式化 JSON
- Console：`copy(JSON.stringify(obj, null, 2))` 复制格式化 JSON
- `JSON.parse()` 和 `JSON.stringify()` 直接在控制台使用

### 浏览器扩展

- JSON Formatter — 自动格式化页面上的 JSON
- JSONVue — 树形视图

## 在线工具

| 工具 | 特点 |
|------|------|
| ToolboxNova JSON Validator | 验证 + 格式化 + 压缩 |
| JSON Diff | 对比两个 JSON |
| JSON to TypeScript | 生成 TS 类型 |
| JSON Path Finder | 查找路径 |
| JSON Schema Generator | 生成 Schema |

## API 调试

### curl

```bash
# 发送 JSON 请求
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}' | jq '.'

# 查看完整响应头
curl -v https://api.example.com/data 2>&1 | head -20
```

### httpie

```bash
# 更友好的 HTTP 客户端，自动格式化 JSON
http POST api.example.com/users name=Alice email=alice@example.com
http GET api.example.com/users
```

## 小结

- jq 是命令行 JSON 处理的首选工具
- VSCode + Prettier 提供最佳编辑体验
- Chrome DevTools 内置 JSON 格式化
- curl + jq 组合调试 API
- 在线工具适合快速验证和转换

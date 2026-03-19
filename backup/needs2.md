# DevToolBox — 编程开发工具模块完整需求文档（新增补充）

> 本文档为前一份需求文档的补充，专项描述「编程开发」分类下的 6 个新增工具。
> 所有工具均为**纯前端实现**，无需后端接口，数据不上传服务器。
> 参考竞品已逐一列出，Copilot 按章节顺序逐步开发即可。

---

## 竞品参考汇总表

| 工具 | 竞品名称 | 竞品地址 |
|------|----------|----------|
| JSON 工具箱 | JSONLint | https://jsonlint.com |
| JSON 工具箱 | JSON Formatter & Validator | https://jsonformatter.curiousconcept.com |
| JSON 工具箱 | JSON Editor Online | https://jsoneditoronline.org |
| JSON 工具箱 | CodeBeautify JSON | https://codebeautify.org/jsonviewer |
| 正则测试 | Regex101 | https://regex101.com |
| 正则测试 | RegExr | https://regexr.com |
| 正则测试 | RegexPal | https://www.regexpal.com |
| Markdown 编辑 | StackEdit | https://stackedit.io |
| Markdown 编辑 | Dillinger | https://dillinger.io |
| Markdown 编辑 | Editor.md | https://pandao.github.io/editor.md |
| 时间戳转换 | Epoch Converter | https://www.epochconverter.com |
| 时间戳转换 | Timestamp.online | https://timestamp.online |
| 进制转换 | RapidTables | https://www.rapidtables.com/convert/number |
| 大小写转换 | ConvertCase | https://convertcase.net |
| 大小写转换 | TextConverter | https://www.textconverter.net |

---

## 路由补充（编程开发分类）

| 页面 | 路由 | 说明 |
|------|------|------|
| 编程工具导航 | `/tools` | 编程开发工具聚合页 |
| JSON 验证/格式化 | `/tools/json` | JSON 工具箱默认子页 |
| JSON 转义 | `/tools/json/escape` | JSON 字符串转义 |
| JSON 去转义 | `/tools/json/unescape` | JSON 字符串去转义 |
| JSON Repair | `/tools/json/repair` | JSON 修复 |
| JSON Minify | `/tools/json/minify` | JSON 压缩 |
| JSON Diff | `/tools/json/diff` | JSON 对比 |
| JSON Tree | `/tools/json/tree` | JSON 树形视图 |
| JSON Path | `/tools/json/path` | JSONPath 查询 |
| JSON to CSV | `/tools/json/csv` | JSON 转 CSV |
| JSON to YAML | `/tools/json/yaml` | JSON 转 YAML |
| JSON Schema | `/tools/json/schema` | JSON Schema 验证 |
| JWT 解码 | `/tools/json/jwt` | JWT 解码器 |
| 正则测试 | `/tools/regex` | 正则表达式测试器 |
| Markdown 编辑 | `/tools/markdown` | Markdown 实时编辑器 |
| 时间戳转换 | `/tools/timestamp` | Unix 时间戳工具 |
| 进制转换 | `/tools/base-converter` | 2/8/10/16 进制转换 |
| 大小写转换 | `/tools/case-converter` | snake/camel/kebab 等转换 |

---

## 功能七：JSON 工具箱

**路由入口**：`/tools/json`（默认展示「验证/格式化」子功能）  
**页面标题**：`JSON Formatter, Validator & Toolkit | DevToolBox`  
**Meta Description**：Free online JSON toolkit. Validate, format, minify, repair, diff, convert JSON. Real-time syntax highlighting with precise error location.  
**参考竞品**：jsonlint.com、jsoneditoronline.org、codebeautify.org/jsonviewer  
**实现方式**：纯前端 JavaScript，使用 Monaco Editor（或 CodeMirror 6）作为代码编辑器内核

---

### 7.1 页面整体布局

**顶部功能 Tab 导航栏**（横向滚动）：

```
✅ 验证/格式化  |  </>转义  |  {}去转义  |  🔧Repair  |  ⊖Minify  |  📋Diff  |  🌲Tree  |  ⤴Path  |  📊CSV  |  📄YAML  |  🛡Schema  |  🔑JWT  |  🗂All Tools
```

每个 Tab 对应独立路由（见上方路由表），点击切换路由但不刷新页面（前端路由）。  
右上角两个辅助按钮：`📚 Learn JSON`（跳转 JSON 学习文章页）、`🗃 Free Datasets`（跳转数据集页）。

---

### 7.2 子功能一：验证 / 格式化（`/tools/json`）

**布局**：左侧编辑器区（约 60% 宽度）+ 右侧状态/说明面板（约 40% 宽度）

**左侧编辑器区**：

- 使用 **Monaco Editor** 集成，配置 JSON 语言模式，启用语法高亮
- 编辑器顶部工具栏：
    - 输入来源切换：`✏️ 直接输入` | `📁 上传文件` | `🔗 从 URL 获取`
    - URL 输入时显示地址栏 + `抓取` 按钮，后端提供 `/api/tools/fetch-json?url=xxx` 接口代理抓取（避免跨域）
- 编辑器内占位示例：`{"name":"DevToolBox","version":1,"tools":["json","regex"]}`
- 编辑器底部操作按钮行：
    - 🔵 `✅ 验证` 按钮：触发语法校验，高亮错误行
    - 🟡 `⊣ 格式化` 按钮：美化 JSON，展开缩进
    - 缩进选项下拉：`2 空格` / `4 空格` / `Tab`
    - `⊗ 清空` 按钮
    - `📋 复制` 按钮（复制格式化结果）
    - `💾 下载` 按钮（下载为 .json 文件）

**错误高亮行为**：
- 实时（防抖 500ms）检测 JSON 语法错误
- 错误行在编辑器左侧显示红色波浪线 + 行号标记
- 编辑器下方显示错误摘要面板：`❌ 第 3 行，第 12 列：缺少逗号`
- 精确定位：点击错误提示，光标跳转到对应位置

**右侧状态面板**：

验证成功时：
```
✅ （绿色大对勾图标）
JSON 验证 / 格式化
即时检测 JSON 语法错误并一键美化缩进，精确定位问题行。

常见错误：
· 缺少引号
· 尾随逗号
· 注释（JSON 不支持）
· 单引号代替双引号
```

验证失败时：
```
❌ （红色叉号图标）
JSON 语法错误
第 X 行：{错误描述}
[查看错误详情 ▼]
```

右侧面板还显示 JSON 统计信息（验证成功后）：
- 文件大小（原始 / 格式化后）
- Key 数量、数组长度、嵌套深度

---

### 7.3 子功能二：转义（`/tools/json/escape`）

**布局**：上下两个等高文本框

- 上方：输入原始字符串（含特殊字符、换行、引号等）
- 操作按钮：`→ 转义` | `← 反向（去转义）` | `交换` | `复制结果` | `清空`
- 下方：显示转义后的 JSON 字符串（`"` → `\"`，换行 → `\n`，Tab → `\t` 等）
- 右侧说明：转义规则对照表（字符 → 转义序列，表格形式）

---

### 7.4 子功能三：去转义（`/tools/json/unescape`）

- 与转义功能相反，输入含转义序列的 JSON 字符串，输出还原后的可读文本
- 布局与转义相同

---

### 7.5 子功能四：Repair JSON（`/tools/json/repair`）

**功能描述**：自动修复常见 JSON 错误，无需手动逐行排查

**支持修复的错误类型**：
- 尾随逗号（trailing comma）
- 缺少引号的 key
- 单引号替换为双引号
- 注释（// 和 /* */）自动移除
- `undefined` 替换为 `null`
- 缺少方括号/花括号闭合
- 多余的根级逗号

**布局**：左侧输入（破损 JSON）→ 中间 `🔧 修复` 按钮 → 右侧输出（修复后 JSON）  
右侧额外显示修复报告：列出每条被修复的问题（类型 + 行号）

---

### 7.6 子功能五：Minify（`/tools/json/minify`）

- 输入格式化（带缩进）的 JSON，输出压缩为单行 JSON
- 显示压缩前后字节大小对比和压缩比例（如：`压缩率 62.3%，节省 1.2KB`）
- 一键复制压缩结果

---

### 7.7 子功能六：JSON Diff（`/tools/json/diff`）

**布局**：左右两个编辑器（JSON A / JSON B）+ 底部差异展示区

- 差异高亮：绿色=新增，红色=删除，黄色=修改
- 差异模式切换：`行级对比` / `语义对比（key 级别）`
- 显示差异数量统计：N 个新增，M 个删除，K 个修改

---

### 7.8 子功能七：Tree 视图（`/tools/json/tree`）

- 将 JSON 渲染为可折叠的树形结构
- 每个节点显示：key 名 + 数据类型标签（string/number/boolean/null/array/object）+ 值预览
- 支持全部展开 / 全部折叠
- 点击节点可复制该节点的 JSON 路径（如 `$.users[0].name`）
- 支持节点内联编辑（双击 value 可修改）

---

### 7.9 子功能八：JSONPath 查询（`/tools/json/path`）

- 上方输入 JSON 数据
- 中间输入 JSONPath 表达式（如 `$.store.book[*].author`）
- 下方实时显示匹配结果（高亮显示在原 JSON 中的位置）
- 内置常用 JSONPath 示例模板（下拉选择）
- 右侧 JSONPath 语法速查表

---

### 7.10 子功能九：JSON to CSV（`/tools/json/csv`）

- 输入 JSON 数组，自动提取 key 作为表头，每个对象作为一行
- 可选择：分隔符（逗号/Tab/分号）、是否包含表头行、字段选择（勾选需要导出的字段）
- 预览表格（前 10 行）
- 下载 CSV 文件按钮

---

### 7.11 子功能十：JSON to YAML（`/tools/json/yaml`）

- 左侧 JSON 输入，右侧 YAML 实时输出
- 支持反向转换（YAML → JSON）
- 使用 `js-yaml` 库实现

---

### 7.12 子功能十一：JSON Schema 验证（`/tools/json/schema`）

- 上方输入目标 JSON 数据
- 下方输入 JSON Schema（支持 Draft-07）
- 点击验证后显示：通过 ✅ 或错误列表（字段路径 + 错误原因）
- 内置 Schema 示例模板

---

### 7.13 子功能十二：JWT 解码（`/tools/json/jwt`）

**布局**：单列输入框 + 三色解码展示

- 输入 JWT Token（支持粘贴）
- 解码后分三块展示：
    - 🟥 **Header**（算法类型，如 `alg: HS256`）
    - 🟪 **Payload**（Claims，JSON 格式展示，含时间字段人性化显示：`exp: 2026-01-01 00:00:00 (已过期/剩余 X 天)`）
    - 🟩 **Signature**（仅展示，标注"签名验证需要密钥"）
- 自动检测 Token 是否过期（橙色警告）
- 支持 Base64URL 解码原始数据

---

## 功能八：正则表达式测试器

**路由**：`/tools/regex`  
**页面标题**：`Regex Tester - Test Regular Expressions Online | DevToolBox`  
**Meta Description**：Test and debug regular expressions online with real-time highlighting. Support JavaScript, Python, PCRE flavors with explanation and cheat sheet.  
**参考竞品**：regex101.com（首要参考）、regexr.com  
**实现方式**：纯前端 JavaScript

---

### 8.1 页面整体布局（三栏布局）

```
┌──────────────────────┬──────────────────────────────┬──────────────────┐
│   左侧：说明 & 速查   │   中间：主操作区（约 55%）    │   右侧：匹配详情  │
└──────────────────────┴──────────────────────────────┴──────────────────┘
```

---

### 8.2 中间主操作区

**正则输入框**：

```
/ [正则表达式内容] / [flags 输入框]     [语言下拉]
```

- 正则模式输入框：大字体单行输入，支持语法高亮（不同颜色区分：分组/量词/字符类/锚点）
- Flags 输入框：单独小输入框（g / i / m / s / u），点击可切换开关
- 语言选择下拉：`JavaScript` / `Python` / `PCRE (PHP)` / `Go`（当前版本以 JS 为主实现，其余标注说明）

**测试字符串区**：

- 多行文本框，支持大文本输入
- 所有匹配到的内容实时高亮（每个匹配用不同颜色区分捕获组）
- 悬停匹配高亮区域时，弹出 Tooltip 显示：匹配的捕获组内容

**功能模式 Tab 切换**：

| Tab | 功能 |
|-----|------|
| 匹配（Match） | 显示所有匹配结果 |
| 替换（Substitute） | 输入替换表达式，实时显示替换结果 |
| 分割（Split） | 以正则为分隔符分割字符串，显示结果数组 |

**替换模式**额外显示：
- 替换表达式输入框（支持 `$1`, `$2` 等反向引用）
- 替换结果实时预览

---

### 8.3 左侧说明面板

**正则表达式解释区（Explanation）**：

- 将正则表达式按 Token 拆解，每个 Token 配上中英文说明
- 例：`(\d{3})-(\d{4})` 拆解为：
    - `(` → 开始捕获组 1
    - `\d` → 匹配任意数字 [0-9]
    - `{3}` → 恰好重复 3 次
    - `)` → 结束捕获组 1
    - `-` → 匹配字面量 `-`
    - ...

**快速参考速查表（Cheat Sheet）**（可折叠）：

分类展示：
- 字符类：`.` `\d` `\D` `\w` `\W` `\s` `\S` `[abc]` `[^abc]`
- 锚点：`^` `$` `\b` `\B`
- 量词：`*` `+` `?` `{n}` `{n,}` `{n,m}` `*?`（懒惰模式）
- 分组：`()` `(?:)` `(?=)` `(?!)` `(?<=)` `(?<!)`
- 特殊字符：`\n` `\t` `\r` `\\`

每条规则格式：`语法` | `说明` | `示例`（可点击示例直接填入测试）

---

### 8.4 右侧匹配详情面板

**匹配统计**：
```
找到 X 个匹配，Y 个捕获组
执行时间：< 1ms
```

**匹配列表**（每条匹配展示）：
```
匹配 #1
  完整匹配：abc123
  位置：第 2 行，字符 5–11
  捕获组 1：abc
  捕获组 2：123
```

**代码生成器**（底部折叠面板）：
- 自动生成当前正则在各语言的使用代码片段
- 支持：JavaScript / Python / Go / Java
- 一键复制代码片段

---

## 功能九：Markdown 实时编辑器

**路由**：`/tools/markdown`  
**页面标题**：`Online Markdown Editor with Live Preview | DevToolBox`  
**Meta Description**：Free online Markdown editor with real-time synchronized preview. Supports GFM, tables, code highlight, export to HTML and PDF.  
**参考竞品**：stackedit.io、dillinger.io  
**实现方式**：纯前端，使用 `marked.js` + `highlight.js` 实现解析与代码高亮，`CodeMirror 6` 作为编辑器

---

### 9.1 页面整体布局

**顶部工具栏**（固定，深色背景）：

```
[文件名输入框]  |  新建  保存（LocalStorage）  下载▼  |  格式：MD HTML PDF  |  主题▼  |  同步滚动 ●
```

**主体双栏（左右等宽，可拖拽分割线调整比例）**：

- 左侧：Markdown 源码编辑区（CodeMirror，深色主题，行号显示）
- 右侧：实时预览区（Rendered HTML）
- 同步滚动：编辑区滚动时，预览区自动对齐到对应位置（Scroll Sync）

**模式切换**（顶部右侧）：
- `编辑模式`：只显示左侧编辑区（全宽）
- `预览模式`：只显示右侧预览区（全宽）
- `分栏模式`（默认）：左右分栏

---

### 9.2 编辑器工具栏（WYSIWYG 快捷按钮）

```
B  I  ~~  |  H1 H2 H3  |  链接  图片  |  ` 代码  ``` 代码块  |  引用  |  无序列表  有序列表  任务列表  |  表格  |  分割线  |  ↩撤销 ↪重做
```

每个按钮点击在当前光标处插入对应 Markdown 语法（或包裹选中文字）。

---

### 9.3 支持的 Markdown 语法

- **GFM（GitHub Flavored Markdown）**：全支持
- 表格（Table）
- 代码块语法高亮（使用 `highlight.js`，支持 100+ 语言）
- 任务列表（`- [x]`）
- 删除线（`~~text~~`）
- 自动链接
- Emoji（`:smile:` → 😊）
- **数学公式**：支持 `$...$` 行内公式和 `$$...$$` 块级公式（使用 KaTeX）
- **Mermaid 流程图**：支持 ` ```mermaid ` 代码块渲染为图形（使用 mermaid.js）

---

### 9.4 导出功能

- **导出 Markdown**（.md 文件，原样下载）
- **导出 HTML**（带完整 `<html>` 结构 + 内联 CSS，可直接在浏览器打开）
- **导出 PDF**（使用 `window.print()` + 打印样式表，引导用户使用浏览器打印为 PDF）
- **复制 HTML 源码**（复制渲染后的 HTML 字符串）

---

### 9.5 本地存储

- 编辑内容自动保存到 `localStorage`（每 3 秒 debounce）
- 页面刷新后自动恢复上次内容
- 支持多文件管理（左侧文件列表面板，可新建/切换/删除文档，存储在 `localStorage`）

---

### 9.6 主题与字体

- 编辑区主题：`Default（浅色）` / `Dark（深色）` / `Monokai` / `GitHub`
- 预览区主题：`GitHub 风格` / `简约白` / `深色`
- 字体大小调节滑块（12px – 20px）

---

### 9.7 右侧辅助面板（可折叠）

- 文档统计：字数、行数、字符数、阅读时间估计
- 目录大纲（TOC）：自动提取所有标题，点击跳转
- Markdown 语法速查表

---

## 功能十：时间戳工具

**路由**：`/tools/timestamp`  
**页面标题**：`Unix Timestamp Converter - Current Time & Date Tool | DevToolBox`  
**Meta Description**：Convert Unix timestamps to human-readable dates. Get current timestamp, batch convert, support all timezones.  
**参考竞品**：epochconverter.com、timestamp.online  
**实现方式**：纯前端 JavaScript

---

### 10.1 页面布局（三个功能区块）

---

**区块一：当前时间实时显示**

```
┌─────────────────────────────────────────────────┐
│  🕐 当前 Unix 时间戳                              │
│                                                  │
│   1 7 3 6 5 0 0 0 0 0   ← 实时跳动数字（秒级）   │
│   1736500000000          ← 毫秒级时间戳           │
│                                                  │
│   本地时间：2026-01-10 15:30:00 (CST, UTC+8)     │
│   UTC 时间：2026-01-10 07:30:00                  │
│   ISO 8601：2026-01-10T07:30:00.000Z             │
│   RFC 2822：Sat, 10 Jan 2026 07:30:00 +0000      │
│                                                  │
│   [ 📋 复制秒级戳 ]  [ 📋 复制毫秒戳 ]           │
└─────────────────────────────────────────────────┘
```

- 时间戳数字实时跳动（每秒更新）
- 多种格式同步显示

---

**区块二：时间戳 ↔ 日期互转**

**子区一：时间戳 → 日期**
- 输入框：Unix 时间戳（秒或毫秒，自动判断）
- 时区选择下拉（含全球主要时区，按地区分组）
- 转换结果展示（多种格式）：
    - 本地时间（按选定时区）
    - UTC 时间
    - 相对时间（如：3 年前 / 2 小时后）
    - 是否为夏令时

**子区二：日期 → 时间戳**
- 日期时间选择器（DateTimePicker）：年/月/日 时:分:秒
- 时区选择
- 转换结果：秒级戳 + 毫秒级戳（均可一键复制）

---

**区块三：时间差计算器**

- 开始时间输入（日期时间选择器）
- 结束时间输入（日期时间选择器）
- 计算结果（多单位显示）：
  ```
  相差：X 年 Y 月 Z 天 H 小时 M 分 S 秒
  总计：X 天 / X 小时 / X 分钟 / X 秒 / X 毫秒
  ```

---

**区块四：常用时间格式速查（静态对照表）**

| 格式名 | 格式模板 | 示例 |
|--------|----------|------|
| ISO 8601 | YYYY-MM-DDTHH:mm:ssZ | 2026-01-10T07:30:00Z |
| RFC 2822 | ddd, DD MMM YYYY | Sat, 10 Jan 2026 |
| 中文格式 | YYYY年MM月DD日 | 2026年01月10日 |
| Unix 秒 | 10位整数 | 1736500000 |
| Unix 毫秒 | 13位整数 | 1736500000000 |

---

## 功能十一：进制转换器

**路由**：`/tools/base-converter`  
**页面标题**：`Number Base Converter - Binary, Octal, Decimal, Hex | DevToolBox`  
**Meta Description**：Convert numbers between binary (base-2), octal (base-8), decimal (base-10), and hexadecimal (base-16) instantly.  
**参考竞品**：rapidtables.com/convert/number  
**实现方式**：纯前端 JavaScript（原生 `parseInt` + `toString` 方法）

---

### 11.1 页面布局

**主转换区（四合一联动输入框）**：

每个进制有独立输入框，任意一个输入框修改，其他三个**实时同步更新**：

```
┌─────────────────────────────────────────────────────────┐
│   二进制 (Base 2)                                        │
│   [  1111 0001  ]    📋复制                             │
│                                                          │
│   八进制 (Base 8)                                        │
│   [  361        ]    📋复制                             │
│                                                          │
│   十进制 (Base 10)                                       │
│   [  241        ]    📋复制                             │
│                                                          │
│   十六进制 (Base 16)                                     │
│   [  F1         ]    📋复制                             │
│                                                          │
│   自定义进制 (Base N)  [进制数: 32 ▼]                    │
│   [  7H         ]    📋复制                             │
└─────────────────────────────────────────────────────────┘
```

- 十六进制输入自动大小写容错（输入 `f1` 和 `F1` 均接受）
- 二进制输出每 4 位自动添加空格分组（方便阅读）
- 十六进制输出每 2 位添加空格分组（如 `FF 00 1A`）
- 自定义进制支持 2–36

**附加功能**：

- **位运算计算器**（独立区块）：
    - 输入两个十进制数 A 和 B
    - 显示：`AND`、`OR`、`XOR`、`NOT A`、`LEFT SHIFT`、`RIGHT SHIFT` 的结果
    - 同时展示二进制运算过程图解

- **ASCII / 字符转换**（独立区块）：
    - 输入字符（如 `A`），显示 ASCII 十进制（65）、十六进制（0x41）、二进制（01000001）
    - 反向：输入数值，显示对应字符

- **单位转换速查表**（静态表格）：数据存储单位 Bit / Byte / KB / MB / GB 互转公式

---

## 功能十二：大小写 / 命名格式转换器

**路由**：`/tools/case-converter`  
**页面标题**：`Text Case Converter - camelCase, snake_case, kebab-case | DevToolBox`  
**Meta Description**：Convert text between camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, Title Case and more.  
**参考竞品**：convertcase.net、textconverter.net  
**实现方式**：纯前端 JavaScript

---

### 12.1 页面布局

**输入区**：

- 顶部多行文本输入框（较大，约 6 行高）
- 占位符：`输入或粘贴你的文本...`
- 右侧按钮：清空、粘贴（调用 Clipboard API）、上传 TXT 文件

**转换结果区**（网格卡片布局，每种格式一张卡片）：

每张卡片格式：
```
┌─────────────────────────────┐
│  camelCase                  │
│  ──────────────────────     │
│  helloWorldExample          │
│                  [ 📋复制 ] │
└─────────────────────────────┘
```

**支持的转换格式（共 14 种）**：

| 格式名 | 示例输出 | 说明 |
|--------|----------|------|
| camelCase | `helloWorldExample` | 小驼峰，首词小写 |
| PascalCase | `HelloWorldExample` | 大驼峰，每词首字母大写 |
| snake_case | `hello_world_example` | 下划线连接，全小写 |
| SCREAMING_SNAKE | `HELLO_WORLD_EXAMPLE` | 下划线连接，全大写 |
| kebab-case | `hello-world-example` | 短横线连接，全小写 |
| COBOL-CASE | `HELLO-WORLD-EXAMPLE` | 短横线连接，全大写 |
| Train-Case | `Hello-World-Example` | 短横线连接，每词首字母大写 |
| dot.case | `hello.world.example` | 点号连接，全小写 |
| Title Case | `Hello World Example` | 每词首字母大写 |
| Sentence case | `Hello world example` | 仅句首大写 |
| UPPERCASE | `HELLO WORLD EXAMPLE` | 全部大写 |
| lowercase | `hello world example` | 全部小写 |
| aLtErNaTiNg | `hElLo WoRlD eXaMpLe` | 交替大小写 |
| Reversed | `elpMaxe dlroW olleH` | 反转字符串 |

**一键全部复制**按钮：复制所有格式的 JSON 对象（`{"camel":"...","snake":"...",...}`）

---

### 12.2 批量处理功能

**批量模式**（独立 Tab 切换）：
- 每行输入一个字符串（支持大量文本批量处理）
- 选择目标格式
- 点击转换后，每行输入对应转换一行输出
- 支持下载 CSV（原始文本 + 所有格式的转换结果）

---

### 12.3 智能分词规则说明

分词算法需处理以下输入格式，自动识别分词边界：
- 空格分隔：`hello world example` → 3 个词
- 已有 camelCase：`helloWorldExample` → 3 个词
- 已有 snake_case：`hello_world_example` → 3 个词
- 已有 kebab-case：`hello-world-example` → 3 个词
- 混合：`Hello_World-example` → 3 个词
- 全大写缩写处理：`parseHTTPRequest` → `parse` + `HTTP` + `Request`（保留缩写）

---

## 编程工具首页导航（`/tools`）

**路由**：`/tools`  
**页面标题**：`Developer Tools - JSON, Regex, Markdown & More | DevToolBox`

**顶部 Tab 导航（工具分类）**：
- 全部 / 隐私账号 / 编程开发 / 安全编解码 / 实时查询 / 多媒体 / 文案语言

**工具卡片网格区**（编程开发分类内容）：

| 卡片 | 图标 | 副标题 | 路由 |
|------|------|--------|------|
| JSON 格式化 | `{ }` 黄色 | 美化/压缩/校验 | `/tools/json` |
| 正则测试 | `(.*)` 红色 | 实时匹配/替换 | `/tools/regex` |
| Markdown | `M↓` 蓝色 | 实时预览 | `/tools/markdown` |
| 时间戳 | 🕐 青色 | 转换/当前时间 | `/tools/timestamp` |
| 进制转换 | `123` 橙色 | 2/8/10/16 进制 | `/tools/base-converter` |
| 大小写转换 | `Aa` 绿色 | snake/camel/kebab | `/tools/case-converter` |

---

## SEO 补充（编程工具页）

各工具页必须包含的额外 SEO 内容：

**JSON 工具页** 关键词：`json formatter online, json validator, json beautifier, jsonlint, json to csv`  
**正则页** 关键词：`regex tester online, regular expression tester, regex101 alternative`  
**Markdown 页** 关键词：`markdown editor online, markdown preview, dillinger alternative`  
**时间戳页** 关键词：`unix timestamp converter, epoch time, timestamp to date`  
**进制转换页** 关键词：`binary to decimal converter, hex converter, number base converter`  
**大小写页** 关键词：`camelcase converter, snake case converter, text case converter`

每个工具页底部增加 **FAQ 区块**（3–5 条常见问题，Accordion 折叠形式，有助于 Google Featured Snippets）：

示例（JSON 页 FAQ）：
- Q: 什么是 JSON 格式化？A: 将压缩的 JSON 字符串添加缩进和换行，使其易于阅读...
- Q: JSON 和 XML 有什么区别？A: JSON 更轻量、易读，是现代 API 的首选格式...
- Q: 如何修复 JSON 中的尾随逗号错误？A: 使用本页的 Repair 功能可自动修复...

---

## 依赖库汇总（前端，CDN 引入）

| 用途 | 库名 | CDN |
|------|------|-----|
| 代码编辑器 | Monaco Editor | https://cdn.jsdelivr.net/npm/monaco-editor |
| Markdown 解析 | marked.js | https://cdn.jsdelivr.net/npm/marked |
| 代码高亮 | highlight.js | https://cdnjs.cloudflare.com/ajax/libs/highlight.js |
| 数学公式 | KaTeX | https://cdn.jsdelivr.net/npm/katex |
| 流程图 | Mermaid.js | https://cdn.jsdelivr.net/npm/mermaid |
| YAML 解析 | js-yaml | https://cdn.jsdelivr.net/npm/js-yaml |
| 时间处理 | Day.js | https://cdn.jsdelivr.net/npm/dayjs |
| JWT 解码 | jwt-decode | https://cdn.jsdelivr.net/npm/jwt-decode |

---



## 一、搜索功能（编程工具模块）

### 1.1 搜索入口位置

编程工具模块的搜索与全站顶部导航搜索**共用同一个搜索框**，无需单独开发。  
顶部导航搜索框的搜索范围需扩展，将编程工具全部纳入索引：

**后端搜索索引数据需新增以下条目**（追加到 `/api/search` 接口返回的工具列表中）：

```json
[
  { "name": "JSON Formatter", "name_zh": "JSON 格式化", "desc": "Validate, format and minify JSON", "desc_zh": "验证、美化、压缩 JSON", "url": "/tools/json", "tags": ["json","formatter","validator","lint","beautify"] },
  { "name": "JSON Escape", "name_zh": "JSON 转义", "desc": "Escape and unescape JSON strings", "desc_zh": "JSON 字符串转义与还原", "url": "/tools/json/escape", "tags": ["json","escape","unescape","string"] },
  { "name": "JSON Repair", "name_zh": "JSON 修复", "desc": "Auto-fix broken JSON", "desc_zh": "自动修复损坏的 JSON", "url": "/tools/json/repair", "tags": ["json","repair","fix"] },
  { "name": "JSON Minify", "name_zh": "JSON 压缩", "desc": "Compress JSON to single line", "desc_zh": "压缩 JSON 为单行", "url": "/tools/json/minify", "tags": ["json","minify","compress"] },
  { "name": "JSON Diff", "name_zh": "JSON 对比", "desc": "Compare two JSON documents", "desc_zh": "对比两份 JSON 的差异", "url": "/tools/json/diff", "tags": ["json","diff","compare"] },
  { "name": "JSON Tree", "name_zh": "JSON 树视图", "desc": "Visualize JSON as a tree", "desc_zh": "以树形结构展示 JSON", "url": "/tools/json/tree", "tags": ["json","tree","viewer"] },
  { "name": "JSONPath Query", "name_zh": "JSONPath 查询", "desc": "Query JSON with JSONPath expressions", "desc_zh": "使用 JSONPath 表达式查询 JSON", "url": "/tools/json/path", "tags": ["json","jsonpath","query"] },
  { "name": "JSON to CSV", "name_zh": "JSON 转 CSV", "desc": "Convert JSON array to CSV", "desc_zh": "JSON 数组转 CSV 文件", "url": "/tools/json/csv", "tags": ["json","csv","convert","export"] },
  { "name": "JSON to YAML", "name_zh": "JSON 转 YAML", "desc": "Convert between JSON and YAML", "desc_zh": "JSON 与 YAML 互转", "url": "/tools/json/yaml", "tags": ["json","yaml","convert"] },
  { "name": "JSON Schema", "name_zh": "JSON Schema 验证", "desc": "Validate JSON against a schema", "desc_zh": "使用 Schema 验证 JSON 结构", "url": "/tools/json/schema", "tags": ["json","schema","validate"] },
  { "name": "JWT Decoder", "name_zh": "JWT 解码", "desc": "Decode and inspect JWT tokens", "desc_zh": "解码并查看 JWT Token 内容", "url": "/tools/json/jwt", "tags": ["jwt","decode","token","auth"] },
  { "name": "Regex Tester", "name_zh": "正则测试器", "desc": "Test regular expressions with live highlighting", "desc_zh": "实时高亮测试正则表达式", "url": "/tools/regex", "tags": ["regex","regexp","regular expression","test","match"] },
  { "name": "Markdown Editor", "name_zh": "Markdown 编辑器", "desc": "Online markdown editor with live preview", "desc_zh": "在线 Markdown 实时预览编辑器", "url": "/tools/markdown", "tags": ["markdown","editor","preview","md"] },
  { "name": "Timestamp Converter", "name_zh": "时间戳转换", "desc": "Convert Unix timestamps to dates", "desc_zh": "Unix 时间戳与日期互转", "url": "/tools/timestamp", "tags": ["timestamp","unix","epoch","date","time","convert"] },
  { "name": "Base Converter", "name_zh": "进制转换", "desc": "Convert between binary, octal, decimal, hex", "desc_zh": "二、八、十、十六进制互转", "url": "/tools/base-converter", "tags": ["binary","octal","decimal","hex","base","convert","number"] },
  { "name": "Case Converter", "name_zh": "大小写转换", "desc": "Convert text to camelCase, snake_case and more", "desc_zh": "文本在各种命名格式间转换", "url": "/tools/case-converter", "tags": ["camel","snake","kebab","pascal","case","convert","text"] }
]
```

### 1.2 搜索匹配规则（追加说明）

搜索接口 `GET /api/search?q=xxx&lang=zh` 匹配逻辑：

- 同时匹配 `name`、`name_zh`、`desc`、`desc_zh`、`tags` 字段
- 忽略大小写，支持拼音首字母搜索（可选，后期优化）
- `lang=zh` 时优先展示 `name_zh`，`lang=en` 时优先展示 `name`
- 结果按匹配权重排序：`name` 完全匹配 > `tags` 匹配 > `desc` 模糊匹配

### 1.3 搜索结果下拉联想（前端行为补充）

搜索联想下拉列表每条结果格式：
```
[工具图标]  JSON 格式化 / JSON Formatter
            验证、美化、压缩 JSON
            标签: json  formatter  validator        →  /tools/json
```

- 编程工具类结果在结果列表中显示分类标签 `🔧 编程开发`，与隐私工具类 `🔒 隐私账号` 做视觉区分
- 搜索无结果时显示：`未找到 "xxx"，试试 JSON、正则、时间戳...`

---

## 二、中英文切换（编程工具模块）

### 2.1 复用全站切换机制

编程工具页的语言切换**直接复用**全站顶部导航已有的 `?lang=zh/en` 机制，无需额外开发切换入口。

仅需补充以下翻译内容至 `/locales/zh.json` 和 `/locales/en.json`：

### 2.2 需新增的翻译 Key（`zh.json` 示例）

**工具导航页 `/tools`**：
```json
"tools.page_title": "开发者工具箱",
"tools.page_desc": "JSON、正则、Markdown、时间戳等 50+ 免费在线工具",
"tools.tab_all": "全部",
"tools.tab_privacy": "隐私账号",
"tools.tab_dev": "编程开发",
"tools.tab_encode": "安全编解码",
"tools.tab_query": "实时查询",
"tools.tab_media": "多媒体",
"tools.tab_text": "文案语言",
"tools.badge_new": "NEW"
```

**JSON 工具箱**：
```json
"json.title": "JSON 工具箱",
"json.tab_validate": "验证/格式化",
"json.tab_escape": "转义",
"json.tab_unescape": "去转义",
"json.tab_repair": "修复",
"json.tab_minify": "压缩",
"json.tab_diff": "对比",
"json.tab_tree": "树视图",
"json.tab_path": "JSONPath",
"json.tab_csv": "转 CSV",
"json.tab_yaml": "转 YAML",
"json.tab_schema": "Schema 验证",
"json.tab_jwt": "JWT 解码",
"json.btn_validate": "验证",
"json.btn_format": "格式化",
"json.btn_clear": "清空",
"json.btn_copy": "复制",
"json.btn_download": "下载",
"json.indent_2": "2 空格",
"json.indent_4": "4 空格",
"json.indent_tab": "Tab",
"json.input_placeholder": "粘贴 JSON 内容，实时验证语法并格式化",
"json.source_type": "输入来源",
"json.source_text": "直接输入",
"json.source_file": "上传文件",
"json.source_url": "从 URL 获取",
"json.valid_msg": "JSON 验证通过 ✅",
"json.error_msg": "第 {line} 行：{error}",
"json.stats_size": "文件大小",
"json.stats_keys": "键数量",
"json.stats_depth": "嵌套深度",
"json.repair_report": "修复报告",
"json.diff_a": "JSON A",
"json.diff_b": "JSON B",
"json.diff_added": "新增",
"json.diff_removed": "删除",
"json.diff_changed": "修改",
"json.jwt_header": "Header",
"json.jwt_payload": "Payload",
"json.jwt_signature": "Signature",
"json.jwt_expired": "Token 已过期",
"json.jwt_valid_until": "有效期至",
"json.faq_title": "常见问题"
```

**正则测试器**：
```json
"regex.title": "正则表达式测试器",
"regex.input_placeholder": "输入正则表达式",
"regex.flags_placeholder": "标志 (g/i/m/s)",
"regex.test_placeholder": "输入测试字符串...",
"regex.tab_match": "匹配",
"regex.tab_substitute": "替换",
"regex.tab_split": "分割",
"regex.replace_placeholder": "替换为（支持 $1 $2 反向引用）",
"regex.lang_js": "JavaScript",
"regex.lang_python": "Python",
"regex.lang_pcre": "PCRE (PHP)",
"regex.lang_go": "Go",
"regex.match_count": "找到 {n} 个匹配",
"regex.no_match": "无匹配",
"regex.explanation_title": "正则解释",
"regex.cheatsheet_title": "速查表",
"regex.codegen_title": "代码生成器",
"regex.match_detail": "匹配详情",
"regex.exec_time": "执行时间"
```

**Markdown 编辑器**：
```json
"md.title": "Markdown 实时编辑器",
"md.toolbar_new": "新建",
"md.toolbar_save": "保存",
"md.toolbar_export": "导出",
"md.toolbar_theme": "主题",
"md.toolbar_sync": "同步滚动",
"md.mode_edit": "编辑",
"md.mode_preview": "预览",
"md.mode_split": "分栏",
"md.export_md": "导出 Markdown",
"md.export_html": "导出 HTML",
"md.export_pdf": "导出 PDF",
"md.stats_words": "字数",
"md.stats_lines": "行数",
"md.stats_chars": "字符数",
"md.stats_read_time": "阅读时间",
"md.toc_title": "目录",
"md.cheatsheet_title": "Markdown 速查"
```

**时间戳工具**：
```json
"ts.title": "时间戳工具",
"ts.current_stamp": "当前 Unix 时间戳",
"ts.copy_sec": "复制秒级戳",
"ts.copy_ms": "复制毫秒戳",
"ts.to_date_title": "时间戳 → 日期",
"ts.to_stamp_title": "日期 → 时间戳",
"ts.diff_title": "时间差计算",
"ts.timezone": "时区",
"ts.result_local": "本地时间",
"ts.result_utc": "UTC 时间",
"ts.result_relative": "相对时间",
"ts.format_table_title": "常用时间格式",
"ts.diff_start": "开始时间",
"ts.diff_end": "结束时间",
"ts.diff_result": "时间差"
```

**进制转换**：
```json
"base.title": "进制转换器",
"base.binary": "二进制 (Base 2)",
"base.octal": "八进制 (Base 8)",
"base.decimal": "十进制 (Base 10)",
"base.hex": "十六进制 (Base 16)",
"base.custom": "自定义进制",
"base.bitwise_title": "位运算计算器",
"base.ascii_title": "ASCII / 字符转换",
"base.input_a": "操作数 A",
"base.input_b": "操作数 B"
```

**大小写转换**：
```json
"case.title": "大小写 / 命名格式转换",
"case.input_placeholder": "输入或粘贴你的文本...",
"case.btn_paste": "粘贴",
"case.btn_clear": "清空",
"case.btn_upload": "上传 TXT",
"case.btn_copy_all": "复制全部格式（JSON）",
"case.tab_single": "单条转换",
"case.tab_batch": "批量处理",
"case.batch_placeholder": "每行一个字符串，批量转换...",
"case.target_format": "目标格式",
"case.btn_convert": "转换",
"case.btn_download_csv": "下载 CSV"
```

### 2.3 `en.json` 对应翻译

`en.json` 中所有上述 Key 的值即为英文原文，例如：
```json
"json.title": "JSON Toolkit",
"json.btn_validate": "Validate",
"json.btn_format": "Format",
"regex.title": "Regex Tester",
"md.title": "Markdown Editor",
"ts.title": "Timestamp Converter",
"base.title": "Base Converter",
"case.title": "Case Converter"
```

### 2.4 语言切换行为（编程工具页特殊说明）

编程工具页中以下内容切换语言时**只切换 UI 标签文字，不影响功能区内容**：
- 用户已输入的 JSON / 正则 / Markdown 内容保持不变
- 切换语言后页面不重新加载（通过 JS 动态替换 DOM 文本节点，或后端 Partial Render）
- Monaco Editor 内的占位示例文字根据语言动态切换：
    - `zh`：`粘贴 JSON 内容，实时验证语法并格式化`
    - `en`：`Paste your JSON here to validate and format`

---

## 三、SEO 路由与页面优化（编程工具模块）

### 3.1 各页面完整 SEO Meta 规范

以下为每个编程工具页需要写入 `<head>` 的完整 SEO 内容，后端模板按路由动态注入：

---

**`/tools`（编程工具导航）**
```html
<title>Free Online Developer Tools - JSON, Regex, Markdown | DevToolBox</title>
<meta name="description" content="50+ free online developer tools. JSON formatter, regex tester, markdown editor, timestamp converter, base converter and more. No login required.">
<meta name="keywords" content="online developer tools, json formatter, regex tester, markdown editor, timestamp converter, free tools">
<link rel="canonical" href="https://devtoolbox.dev/tools">
<meta property="og:title" content="Free Online Developer Tools | DevToolBox">
<meta property="og:description" content="50+ free online developer tools. No login, no data stored.">
<meta property="og:url" content="https://devtoolbox.dev/tools">
<meta property="og:type" content="website">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Developer Tools",
  "url": "https://devtoolbox.dev/tools",
  "description": "Free online developer tools collection",
  "hasPart": [
    {"@type": "WebApplication", "name": "JSON Formatter", "url": "https://devtoolbox.dev/tools/json"},
    {"@type": "WebApplication", "name": "Regex Tester", "url": "https://devtoolbox.dev/tools/regex"},
    {"@type": "WebApplication", "name": "Markdown Editor", "url": "https://devtoolbox.dev/tools/markdown"}
  ]
}
</script>
```

---

**`/tools/json`（JSON 格式化）**
```html
<title>JSON Formatter & Validator Online - Free JSONLint | DevToolBox</title>
<meta name="description" content="Free online JSON formatter and validator. Validate JSON syntax, beautify with custom indentation, detect errors with exact line numbers. No data uploaded.">
<meta name="keywords" content="json formatter online, json validator, jsonlint, json beautifier, json checker, format json online, json pretty print">
<link rel="canonical" href="https://devtoolbox.dev/tools/json">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "JSON Formatter & Validator",
  "url": "https://devtoolbox.dev/tools/json",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
  "description": "Validate and format JSON online with real-time error detection"
}
</script>
```

---

**`/tools/json/jwt`（JWT 解码）**
```html
<title>JWT Decoder Online - Decode JWT Token Instantly | DevToolBox</title>
<meta name="description" content="Decode JWT tokens online. View header, payload and expiration. 100% client-side, your token never leaves the browser.">
<meta name="keywords" content="jwt decoder, jwt decode online, json web token decoder, jwt parser, decode jwt">
<link rel="canonical" href="https://devtoolbox.dev/tools/json/jwt">
```

---

**`/tools/regex`（正则测试器）**
```html
<title>Regex Tester Online - Test Regular Expressions | DevToolBox</title>
<meta name="description" content="Test and debug regular expressions online with real-time match highlighting. Support JavaScript, Python, PCRE. Includes regex explanation and cheat sheet.">
<meta name="keywords" content="regex tester online, regular expression tester, regex101 alternative, test regex online, regex checker, javascript regex tester">
<link rel="canonical" href="https://devtoolbox.dev/tools/regex">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Regex Tester",
  "url": "https://devtoolbox.dev/tools/regex",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
}
</script>
```

---

**`/tools/markdown`（Markdown 编辑器）**
```html
<title>Online Markdown Editor with Live Preview | DevToolBox</title>
<meta name="description" content="Free online markdown editor with real-time synchronized preview. Supports GFM, tables, code highlight, math formulas. Export to HTML and PDF.">
<meta name="keywords" content="markdown editor online, markdown live preview, dillinger alternative, stackedit alternative, online markdown, markdown to html">
<link rel="canonical" href="https://devtoolbox.dev/tools/markdown">
```

---

**`/tools/timestamp`（时间戳转换）**
```html
<title>Unix Timestamp Converter - Epoch Time to Date | DevToolBox</title>
<meta name="description" content="Convert Unix timestamps to human-readable dates and vice versa. Get current timestamp, calculate time differences, support all timezones.">
<meta name="keywords" content="unix timestamp converter, epoch converter, timestamp to date, date to timestamp, epoch time, unix time converter">
<link rel="canonical" href="https://devtoolbox.dev/tools/timestamp">
```

---

**`/tools/base-converter`（进制转换）**
```html
<title>Number Base Converter - Binary, Decimal, Hex, Octal | DevToolBox</title>
<meta name="description" content="Convert numbers between binary (base 2), octal (base 8), decimal (base 10) and hexadecimal (base 16). Includes bitwise calculator and ASCII converter.">
<meta name="keywords" content="binary to decimal, hex converter, octal converter, number base converter, binary calculator, base conversion online">
<link rel="canonical" href="https://devtoolbox.dev/tools/base-converter">
```

---

**`/tools/case-converter`（大小写转换）**
```html
<title>Text Case Converter - camelCase, snake_case, kebab-case | DevToolBox</title>
<meta name="description" content="Convert text between camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE, Title Case and 14 more formats instantly.">
<meta name="keywords" content="camelcase converter, snake case converter, kebab case, pascal case, text case converter, naming convention converter">
<link rel="canonical" href="https://devtoolbox.dev/tools/case-converter">
```

---

### 3.2 JSON 子路由 canonical 处理

JSON 工具箱的子路由（`/tools/json/escape`、`/tools/json/repair` 等）各自拥有独立的 `canonical` URL 和独立的 `<title>` + `<meta description>`：

| 路由 | title 关键词 |
|------|-------------|
| `/tools/json/escape` | JSON Escape / Unescape String Online |
| `/tools/json/repair` | JSON Repair Tool - Fix Broken JSON Online |
| `/tools/json/minify` | JSON Minifier - Compress JSON Online |
| `/tools/json/diff` | JSON Diff Tool - Compare Two JSON Files |
| `/tools/json/tree` | JSON Tree Viewer - Visualize JSON Structure |
| `/tools/json/path` | JSONPath Query Tester Online |
| `/tools/json/csv` | JSON to CSV Converter Online |
| `/tools/json/yaml` | JSON to YAML Converter Online |
| `/tools/json/schema` | JSON Schema Validator Online |

后端 Gin 路由文件中，每个子路由对应独立的 handler 函数，即使渲染同一个模板文件，也要通过 context 传入不同的 `PageTitle`、`MetaDesc`、`Canonical` 变量。

### 3.3 Hreflang 国际化标签

每个页面 `<head>` 中追加 hreflang 标签，告知 Google 该页面有中英文两个版本：

```html
<link rel="alternate" hreflang="en" href="https://devtoolbox.dev/tools/json?lang=en">
<link rel="alternate" hreflang="zh" href="https://devtoolbox.dev/tools/json?lang=zh">
<link rel="alternate" hreflang="x-default" href="https://devtoolbox.dev/tools/json">
```

Gin 中间件统一注入此逻辑，无需每个路由单独处理。

### 3.4 sitemap.xml 补充

将以下路由追加到 `/sitemap.xml` 动态生成逻辑中：

```xml
<url><loc>https://devtoolbox.dev/tools</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/json</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/escape</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/repair</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/minify</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/diff</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/tree</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/path</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/csv</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/yaml</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/schema</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/json/jwt</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/regex</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
<url><loc>https://devtoolbox.dev/tools/markdown</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/timestamp</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
<url><loc>https://devtoolbox.dev/tools/base-converter</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
<url><loc>https://devtoolbox.dev/tools/case-converter</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
```

---

## 四、Google Ads 友好配置（编程工具模块）

> 所有广告位均以占位 `<div>` 实现，通过配置开关控制是否渲染广告脚本，开发阶段仅显示灰色占位框。

### 4.1 广告位布局规范

每个编程工具页遵循以下广告位布局，不影响核心功能区：

```
┌──────────────────────────────────────────────────────────┐
│  顶部导航栏（全站固定）                                    │
├──────────────────────────────────────────────────────────┤
│  [广告位 A: 728×90 横幅，置于页面标题与功能区之间]          │
│  class="ad-slot" data-slot="top-banner" data-size="728x90" │
├──────────────────┬───────────────────────────────────────┤
│                  │  [广告位 B: 300×250 矩形]               │
│  核心功能区       │  class="ad-slot"                      │
│  （主编辑器/      │  data-slot="sidebar-top"               │
│   输入输出区）    │  data-size="300x250"                   │
│                  ├───────────────────────────────────────┤
│                  │  说明面板 / 速查表                      │
│                  ├───────────────────────────────────────┤
│                  │  [广告位 C: 300×250 矩形]               │
│                  │  class="ad-slot"                      │
│                  │  data-slot="sidebar-bottom"            │
│                  │  data-size="300x250"                   │
├──────────────────┴───────────────────────────────────────┤
│  FAQ 区块（对 SEO 有益，同时作为内容与广告之间的分隔）        │
├──────────────────────────────────────────────────────────┤
│  [广告位 D: 728×90 横幅，置于 FAQ 与 Footer 之间]           │
│  class="ad-slot" data-slot="bottom-banner" data-size="728x90" │
├──────────────────────────────────────────────────────────┤
│  Footer（全站固定）                                        │
└──────────────────────────────────────────────────────────┘
```

**特别说明**：
- Markdown 编辑器页（`/tools/markdown`）因功能区占全屏，广告位 A/D 仍保留，B/C 移至编辑器下方（编辑器折叠时显示）
- 正则测试器三栏布局中，广告位 B/C 放置在左侧说明面板的速查表下方（不遮挡匹配操作区）

### 4.2 广告位 HTML 模板（统一结构）

在 Go 模板 `templates/partials/ad_slot.html` 中定义：

```html
{{ define "ad_slot" }}
{{ if .AdsEnabled }}
<div class="ad-slot ad-slot--{{ .Slot }}" 
     data-slot="{{ .Slot }}" 
     data-size="{{ .Size }}"
     aria-label="Advertisement"
     role="complementary">
  <!-- Google AdSense 脚本由 JS 异步注入 -->
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="{{ .AdClient }}"
       data-ad-slot="{{ .AdUnitId }}"
       data-ad-format="{{ .AdFormat }}"
       data-full-width-responsive="true"></ins>
</div>
{{ else }}
<!-- 开发占位：广告位 {{ .Slot }} ({{ .Size }}) -->
<div class="ad-slot ad-slot--placeholder ad-slot--{{ .Slot }}" 
     style="background:#f0f0f0;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">
  AD SLOT: {{ .Slot }} ({{ .Size }})
</div>
{{ end }}
{{ end }}
```

各页面模板调用方式：
```html
{{ template "ad_slot" dict "AdsEnabled" .AdsEnabled "Slot" "top-banner" "Size" "728x90" "AdClient" .AdClient "AdUnitId" .AdUnitIds.TopBanner "AdFormat" "horizontal" }}
```

### 4.3 配置文件（`configs/config.yaml`）

```yaml
ads:
  enabled: false          # 开发阶段设为 false，上线后改为 true
  ad_client: "ca-pub-XXXXXXXXXXXXXXXX"   # Google AdSense Publisher ID
  ad_units:
    top_banner: "XXXXXXXXXX"
    sidebar_top: "XXXXXXXXXX"
    sidebar_bottom: "XXXXXXXXXX"
    bottom_banner: "XXXXXXXXXX"
```

### 4.4 Google AdSense 脚本异步加载

在 `templates/base.html` 的 `</body>` 前追加（仅当 `AdsEnabled=true` 时渲染）：

```html
{{ if .AdsEnabled }}
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ .AdClient }}" crossorigin="anonymous"></script>
<script>
  // 页面加载完成后初始化所有广告位
  window.addEventListener('load', function() {
    document.querySelectorAll('.adsbygoogle').forEach(function() {
      (adsbygoogle = window.adsbygoogle || []).push({});
    });
  });
</script>
{{ end }}
```

### 4.5 广告加载对用户体验的保护措施

以下措施确保广告不损害用户体验（Google Ads Policy 要求）：

- **广告位最小间距**：任意两个广告位之间，正文内容高度不少于 `400px`
- **广告不覆盖功能区**：`z-index` 严格低于功能组件（编辑器、模态框、下拉菜单）
- **广告加载失败静默**：广告位加载失败时不显示空白区域（CSS `min-height: 0` fallback）
- **移动端广告位**：仅保留广告位 A（顶部横幅，改为 `320×50` 移动横幅）和广告位 D（底部横幅），移除侧边栏广告避免遮挡内容
- **禁止在编辑器内部放置广告**：Monaco Editor、CodeMirror 渲染区域内不放置任何广告元素

### 4.6 Google Ads 内容合规性说明

编程工具页面内容需满足 Google Ads 内容政策：

- 所有工具功能描述使用中性、技术性语言
- FAQ 区块内容真实有效，不含关键词堆砌
- 页面不包含用户生成的隐私数据（编辑器内容不持久化到服务器）
- Privacy Policy 页（`/privacy-policy`）明确说明：本站使用 Google AdSense 展示广告，Google 可能使用 Cookie 根据用户访问记录展示个性化广告

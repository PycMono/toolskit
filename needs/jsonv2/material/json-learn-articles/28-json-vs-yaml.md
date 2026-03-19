# JSON vs YAML：何时用哪个

> **分类**：格式对比　|　**级别**：中级　|　**标签**：JSON, YAML, 对比, 配置文件

## 核心对比

| 维度 | JSON | YAML |
|------|------|------|
| 可读性 | 好 | 极好 |
| 注释 | ❌ | ✅ `#` |
| 多行字符串 | 需转义 | 原生支持 `|` `>` |
| 数据类型 | 6 种 | 更丰富 |
| 引号要求 | 必须双引号 | 大多可省略 |
| 尾随逗号 | ❌ | 无逗号 |
| 解析复杂度 | 简单 | 复杂 |
| 安全性 | 高 | 需注意 |

## 语法对比

**JSON：**
```json
{
  "server": {
    "host": "localhost",
    "port": 8080,
    "debug": true,
    "cors": ["http://localhost:3000", "https://example.com"],
    "database": {
      "driver": "postgres",
      "connection": "postgres://user:pass@localhost/db"
    }
  }
}
```

**YAML：**
```yaml
# 服务器配置
server:
  host: localhost
  port: 8080
  debug: true
  cors:
    - http://localhost:3000
    - https://example.com
  database:
    driver: postgres
    connection: postgres://user:pass@localhost/db
```

## YAML 独有特性

```yaml
# 1. 注释
name: Alice  # 这是注释

# 2. 多行字符串
description: |
  这是一段
  多行文本
  保留换行符

summary: >
  这段文本
  会被折叠成
  一行

# 3. 锚点和引用
defaults: &defaults
  timeout: 30
  retries: 3

production:
  <<: *defaults
  timeout: 60
```

## 何时选择 JSON

- API 数据交换
- 机器生成/消费的数据
- 需要严格解析的场景
- 浏览器环境
- 数据库存储

## 何时选择 YAML

- 配置文件（Docker Compose、Kubernetes、CI/CD）
- 需要注释的场景
- 人工编辑频繁的文件
- 多行文本较多的场景
- Ansible Playbook

## YAML 安全注意

```yaml
# 危险：某些 YAML 解析器会执行代码
!!python/object/apply:os.system ['rm -rf /']

# 类型歧义
country: NO        # 被解析为 false！
version: 1.0       # 被解析为浮点数
time: 12:30        # 被解析为秒数

# 安全做法：加引号
country: "NO"
version: "1.0"
```

## 互转

```python
import json, yaml

# JSON → YAML
with open('config.json') as f:
    data = json.load(f)
with open('config.yaml', 'w') as f:
    yaml.dump(data, f, default_flow_style=False, allow_unicode=True)

# YAML → JSON
with open('config.yaml') as f:
    data = yaml.safe_load(f)
with open('config.json', 'w') as f:
    json.dump(data, f, indent=2)
```

## 小结

JSON 适合数据交换和程序间通信。YAML 适合配置文件和人工编辑。注意 YAML 的安全隐患和类型歧义。

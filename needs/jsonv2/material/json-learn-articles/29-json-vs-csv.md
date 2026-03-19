# JSON vs CSV：数据交换格式选择

> **分类**：格式对比　|　**级别**：中级　|　**标签**：JSON, CSV, 对比, 数据交换

## 核心对比

| 维度 | JSON | CSV |
|------|------|-----|
| 结构 | 层次化 | 扁平化 |
| 数据类型 | 多种 | 全部是文本 |
| 嵌套 | ✅ 支持 | ❌ 不支持 |
| 文件大小 | 较大 | 较小 |
| 可读性 | 好 | 表格直观 |
| Excel 兼容 | 需转换 | 直接打开 |
| 流式处理 | 困难 | 简单 |

## 格式对比

**JSON：**
```json
[
  {"name": "Alice", "age": 25, "skills": ["Python", "Go"], "address": {"city": "Beijing"}},
  {"name": "Bob", "age": 30, "skills": ["Java"], "address": {"city": "Shanghai"}}
]
```

**CSV：**
```csv
name,age,skills,address_city
Alice,25,"Python;Go",Beijing
Bob,30,Java,Shanghai
```

## 何时选择 JSON

- 层次化/嵌套数据
- API 数据传输
- 数据类型需要保留（数值、布尔、null）
- 字段数量不固定
- NoSQL 数据库导入

## 何时选择 CSV

- 表格化的扁平数据
- 数据分析和可视化
- Excel/Google Sheets 使用
- 大数据量的简单记录
- 数据库批量导入

## 互转

```python
import json, csv

# JSON → CSV
with open('data.json') as jf:
    data = json.load(jf)

with open('data.csv', 'w', newline='', encoding='utf-8') as cf:
    writer = csv.DictWriter(cf, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)

# CSV → JSON
with open('data.csv', encoding='utf-8') as cf:
    reader = csv.DictReader(cf)
    data = list(reader)

with open('data.json', 'w', encoding='utf-8') as jf:
    json.dump(data, jf, indent=2, ensure_ascii=False)
```

## 小结

JSON 适合结构化 API 数据，CSV 适合扁平表格数据。选择取决于数据结构和使用场景。

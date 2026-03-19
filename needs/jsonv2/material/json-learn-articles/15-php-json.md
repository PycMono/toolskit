# PHP JSON 处理实战指南

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：PHP, json_encode, json_decode, API

## PHP JSON 核心函数

```php
<?php
$data = ['name' => '张三', 'age' => 28, 'skills' => ['PHP', 'MySQL']];

// 编码
$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// 解码为关联数组
$arr = json_decode($jsonStr, true);

// 解码为对象
$obj = json_decode($jsonStr);
echo $obj->name;
```

## 常用选项

| 选项 | 作用 |
|------|------|
| `JSON_PRETTY_PRINT` | 美化输出 |
| `JSON_UNESCAPED_UNICODE` | 保留中文 |
| `JSON_UNESCAPED_SLASHES` | 不转义斜杠 |
| `JSON_THROW_ON_ERROR` | 错误时抛异常（PHP 7.3+） |

## 错误处理

```php
<?php
try {
    $data = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    echo "JSON 错误: " . $e->getMessage();
}
```

## API 响应封装

```php
<?php
header('Content-Type: application/json; charset=utf-8');

function apiResponse($data, $code = 200, $message = 'success') {
    http_response_code($code);
    echo json_encode([
        'code' => $code, 'message' => $message,
        'data' => $data, 'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
```

## 常见陷阱

```php
<?php
// 空数组 vs 空对象
echo json_encode([]);              // []
echo json_encode(new stdClass);    // {}

// 非连续索引数组变对象
echo json_encode([1 => 'a', 3 => 'b']); // {"1":"a","3":"b"}

// 浮点精度
ini_set('serialize_precision', 14);  // PHP 7.1+ 修复
```

## 小结

- `json_encode()` + `json_decode()` 是核心
- 使用 `JSON_THROW_ON_ERROR` 进行错误处理
- `JSON_UNESCAPED_UNICODE` 保留中文
- 注意空数组/空对象的差异

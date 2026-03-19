# TypeScript 中的 JSON 类型安全

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：TypeScript, 类型安全, Zod, 接口

## 类型定义

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  roles: string[];
  address: { city: string; country: string };
}

type APIResponse<T> = {
  code: number;
  message: string;
  data: T;
  pagination?: { page: number; total: number };
};
```

## 运行时验证：Zod（推荐）

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).optional(),
  roles: z.array(z.string()),
  address: z.object({ city: z.string(), country: z.string() }),
});

type User = z.infer<typeof UserSchema>;

// 安全解析
const result = UserSchema.safeParse(JSON.parse(jsonStr));
if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error.errors);
}
```

## 类型守卫

```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' && obj !== null &&
    typeof (obj as User).id === 'number' &&
    typeof (obj as User).name === 'string'
  );
}
```

## Fetch 封装

```typescript
async function fetchJSON<T>(url: string, schema: z.ZodSchema<T>): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return schema.parse(await response.json());
}

const users = await fetchJSON('/api/users', z.array(UserSchema));
```

## JSON 工具类型

```typescript
type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];
```

## 小结

- `JSON.parse()` 返回 any，需额外类型安全措施
- 生产环境用 Zod 进行运行时验证
- `z.infer` 自动从 Schema 推导类型
- 封装 `fetchJSON<T>` 统一处理 API 请求

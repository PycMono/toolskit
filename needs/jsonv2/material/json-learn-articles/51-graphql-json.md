# GraphQL 中的 JSON：灵活的数据查询

> **分类**：实战应用　|　**级别**：高级　|　**标签**：GraphQL, API, 查询语言, JSON响应

## GraphQL vs REST

REST API 常见的痛点：

1. **过度获取**：`GET /users/1` 返回 20 个字段，但你只需要 name 和 email
2. **获取不足**：获取用户信息后，还要再请求 `/users/1/orders` 获取订单
3. **多次往返**：一个页面需要调用 5-6 个 API 才能拿到所有数据

GraphQL 用一个请求解决所有问题：**客户端声明需要什么数据，服务端精确返回**。

## 基本查询

### 请求（JSON 包裹的 GraphQL 查询）

```json
{
  "query": "{ user(id: 123) { name email orders { id total } } }"
}
```

更可读的格式：

```graphql
{
  user(id: 123) {
    name
    email
    orders {
      id
      total
      items {
        productName
        quantity
      }
    }
  }
}
```

### 响应（标准 JSON）

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com",
      "orders": [
        {
          "id": "ORD-001",
          "total": 299.00,
          "items": [
            { "productName": "机械键盘", "quantity": 1 }
          ]
        }
      ]
    }
  }
}
```

一次请求，获取了用户信息 + 订单列表 + 订单商品详情。REST 需要 3 个请求。

## 变更操作（Mutation）

### 请求

```json
{
  "query": "mutation { createUser(input: { name: \"Bob\", email: \"bob@example.com\" }) { id name createdAt } }",
  "variables": {}
}
```

使用变量（推荐）：

```json
{
  "query": "mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name createdAt } }",
  "variables": {
    "input": {
      "name": "Bob",
      "email": "bob@example.com",
      "role": "editor"
    }
  }
}
```

### 响应

```json
{
  "data": {
    "createUser": {
      "id": "125",
      "name": "Bob",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

## 错误处理

GraphQL 错误和 REST 不同——即使有错误，HTTP 状态码通常仍是 200：

```json
{
  "data": {
    "user": null
  },
  "errors": [
    {
      "message": "用户不存在",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user"],
      "extensions": {
        "code": "NOT_FOUND",
        "timestamp": "2025-01-15T10:00:00Z"
      }
    }
  ]
}
```

部分成功的情况（某些字段返回了数据，某些出错）：

```json
{
  "data": {
    "user": {
      "name": "Alice",
      "email": "alice@example.com",
      "creditScore": null
    }
  },
  "errors": [
    {
      "message": "信用评分服务暂时不可用",
      "path": ["user", "creditScore"],
      "extensions": { "code": "SERVICE_UNAVAILABLE" }
    }
  ]
}
```

## 实际代码示例

### 服务端（Node.js + Apollo Server）

```javascript
const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    orders: [Order!]!
  }

  type Order {
    id: ID!
    total: Float!
    status: String!
  }

  type Query {
    user(id: ID!): User
    users(page: Int, pageSize: Int): [User!]!
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => getUserById(id),
    users: (_, { page = 1, pageSize = 20 }) => getUsers(page, pageSize),
  },
  User: {
    orders: (user) => getOrdersByUserId(user.id), // 按需加载
  },
  Mutation: {
    createUser: (_, { input }) => createUser(input),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => console.log(`Server at ${url}`));
```

### 客户端请求

```javascript
async function fetchUser(userId) {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetUser($id: ID!) {
          user(id: $id) {
            name
            email
            orders {
              id
              total
              status
            }
          }
        }
      `,
      variables: { id: userId }
    })
  });

  const { data, errors } = await response.json();
  if (errors) {
    console.error("GraphQL errors:", errors);
  }
  return data?.user;
}
```

## GraphQL JSON 响应与 REST 对比

| 维度 | REST JSON | GraphQL JSON |
|------|-----------|-------------|
| 数据结构 | 服务端决定 | 客户端声明 |
| 过度获取 | 常见 | 不存在 |
| 多资源获取 | 多次请求 | 一次请求 |
| 错误格式 | HTTP 状态码 + body | 200 + errors 数组 |
| 缓存 | HTTP 缓存友好 | 需要特殊处理 |
| 学习曲线 | 低 | 中 |

## 何时选择 GraphQL

适合 GraphQL 的场景：
- 移动端（带宽敏感，需要精确控制数据量）
- 复杂的关联数据查询
- 多种客户端需要不同的数据结构
- 快速迭代的前端需求

适合 REST 的场景：
- 简单的 CRUD API
- 需要 HTTP 缓存
- 文件上传/下载
- 公开 API（更直观）

## 小结

- GraphQL 请求和响应都是 JSON 格式
- 客户端声明需要的字段，服务端精确返回，避免过度获取
- 一次请求获取多层关联数据，减少网络往返
- 错误通过 `errors` 数组返回，支持部分成功
- 适合复杂数据需求和多客户端场景

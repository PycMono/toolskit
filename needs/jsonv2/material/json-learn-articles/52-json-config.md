# JSON 配置文件最佳实践

> **分类**：实战应用　|　**级别**：高级　|　**标签**：配置文件, 最佳实践, package.json, tsconfig

## JSON 作为配置文件

JSON 是最常用的配置文件格式之一。`package.json`、`tsconfig.json`、`.eslintrc.json`、VS Code 的 `settings.json`——几乎每个现代开发工具都用 JSON 做配置。

## 常见配置文件解析

### package.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "My awesome application",
  "main": "dist/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "license": "MIT"
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### .eslintrc.json

```json
{
  "root": true,
  "env": {
    "browser": true,
    "node": true,
    "es2022": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error"
  }
}
```

## 应用配置设计

### 多环境配置

```
config/
├── default.json      # 默认配置
├── development.json  # 开发环境覆盖
├── production.json   # 生产环境覆盖
└── test.json         # 测试环境覆盖
```

```json
// config/default.json
{
  "server": {
    "host": "0.0.0.0",
    "port": 3000
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp",
    "pool": {
      "min": 2,
      "max": 10
    }
  },
  "cache": {
    "ttl": 3600,
    "prefix": "myapp:"
  },
  "logging": {
    "level": "info",
    "format": "json"
  }
}
```

```json
// config/production.json — 只覆盖需要改变的部分
{
  "server": {
    "port": 8080
  },
  "database": {
    "host": "db.production.internal",
    "pool": { "min": 10, "max": 50 }
  },
  "logging": {
    "level": "warn"
  }
}
```

### 配置合并（Node.js）

```javascript
const defaultConfig = require("./config/default.json");
const envConfig = require(`./config/${process.env.NODE_ENV || "development"}.json`);

// 深度合并
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

const config = deepMerge(defaultConfig, envConfig);
```

## JSON 配置的局限性

| 问题 | 说明 | 替代方案 |
|------|------|----------|
| 不支持注释 | 无法写说明 | JSON5 / JSONC |
| 不支持尾逗号 | 容易出错 | JSON5 / JSONC |
| 不支持多行字符串 | 长文本不方便 | YAML / TOML |
| 不支持环境变量引用 | `$DB_HOST` 无法内嵌 | 代码层面处理 |
| 不支持 include | 不能引用其他文件 | 代码层面处理 |

### JSONC（JSON with Comments）

VS Code 使用 JSONC 格式，支持注释和尾逗号：

```jsonc
{
  // 编辑器设置
  "editor.fontSize": 14,
  "editor.tabSize": 2,

  /* 终端设置 */
  "terminal.integrated.fontSize": 13,

  // 尾逗号是允许的
  "files.autoSave": "afterDelay",
}
```

## 安全注意事项

### 不要在 JSON 配置中存储密钥

```json
// ❌ 密钥不应在配置文件中
{
  "database": {
    "password": "super_secret_123"
  },
  "api_key": "sk-xxxxxxxxxxxx"
}

// ✓ 使用环境变量
{
  "database": {
    "password_env": "DB_PASSWORD"
  }
}
```

```javascript
// 代码中读取环境变量
const dbPassword = process.env[config.database.password_env];
```

### .gitignore

```gitignore
# 不要把敏感配置提交到代码仓库
config/local.json
config/secrets.json
.env
```

## JSON Schema 验证配置

为你的配置文件编写 JSON Schema，可以在编辑器中获得自动补全和错误提示：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["server", "database"],
  "properties": {
    "server": {
      "type": "object",
      "properties": {
        "host": { "type": "string", "default": "0.0.0.0" },
        "port": { "type": "integer", "minimum": 1, "maximum": 65535 }
      }
    },
    "database": {
      "type": "object",
      "required": ["host", "name"],
      "properties": {
        "host": { "type": "string" },
        "port": { "type": "integer", "default": 5432 },
        "name": { "type": "string" }
      }
    }
  }
}
```

在 VS Code 中，`settings.json` 会自动根据 Schema 提供补全。你的自定义配置也可以享受同样的体验。

## 小结

- JSON 是最流行的配置文件格式，被主流开发工具广泛使用
- 多环境配置推荐"默认 + 覆盖"模式
- JSON 不支持注释是主要局限，JSONC/JSON5 是解决方案
- 密钥和敏感信息不要放在 JSON 配置中，使用环境变量
- 为配置文件编写 JSON Schema，获得编辑器辅助和验证

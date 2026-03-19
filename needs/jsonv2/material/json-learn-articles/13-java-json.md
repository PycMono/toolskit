# Java JSON 处理：Gson 与 Jackson 实战

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：Java, Gson, Jackson, 序列化

## Java 中的 JSON 库选型

| 特性 | Gson | Jackson |
|------|------|---------|
| 开发者 | Google | FasterXML |
| 性能 | 中等 | 高 |
| Spring 集成 | 可用 | 默认集成 |

## Gson 基础

```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.11.0</version>
</dependency>
```

```java
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

Gson gson = new GsonBuilder().setPrettyPrinting().create();

// 序列化
User user = new User("Alice", 25, "alice@example.com");
String json = gson.toJson(user);

// 反序列化
User parsed = gson.fromJson(jsonStr, User.class);

// 处理泛型
Type listType = new TypeToken<List<User>>(){}.getType();
List<User> users = gson.fromJson(jsonArray, listType);
```

## Jackson 基础

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version>
</dependency>
```

```java
import com.fasterxml.jackson.databind.ObjectMapper;

ObjectMapper mapper = new ObjectMapper();
mapper.enable(SerializationFeature.INDENT_OUTPUT);

// 序列化与反序列化
String json = mapper.writeValueAsString(user);
User parsed = mapper.readValue(json, User.class);

// 树模型
JsonNode root = mapper.readTree(json);
String name = root.get("name").asText();
```

### Jackson 注解

```java
public class User {
    @JsonProperty("user_name")
    private String name;

    @JsonIgnore
    private String password;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String nickname;
}
```

## 错误处理

```java
try {
    User user = mapper.readValue(invalidJson, User.class);
} catch (JsonProcessingException e) {
    System.err.println("位置: 行 " + e.getLocation().getLineNr());
}
```

## 小结

- Gson 简单易用，适合快速开发
- Jackson 性能更好，Spring 默认集成
- 建议新项目使用 Jackson
- 使用 TypeToken/TypeReference 处理泛型

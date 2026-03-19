# C# / .NET JSON 序列化指南

> **分类**：多语言实战　|　**级别**：中级　|　**标签**：C#, .NET, System.Text.Json, Newtonsoft

## System.Text.Json（.NET 推荐）

```csharp
using System.Text.Json;

var options = new JsonSerializerOptions {
    WriteIndented = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

// 序列化
string json = JsonSerializer.Serialize(user, options);

// 反序列化
User parsed = JsonSerializer.Deserialize<User>(json, options);
```

### 属性注解

```csharp
using System.Text.Json.Serialization;

public class Product {
    [JsonPropertyName("product_id")]
    public int Id { get; set; }

    [JsonIgnore]
    public string InternalCode { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Description { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ProductStatus Status { get; set; }
}
```

## Newtonsoft.Json

```csharp
using Newtonsoft.Json;

string json = JsonConvert.SerializeObject(user, Formatting.Indented);
User user = JsonConvert.DeserializeObject<User>(json);

// 动态解析
dynamic obj = JsonConvert.DeserializeObject(json);
string name = obj.name;
```

### Newtonsoft 注解

```csharp
public class User {
    [JsonProperty("user_name")]
    public string Name { get; set; }

    [JsonIgnore]
    public string Password { get; set; }

    [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
    public string? Nickname { get; set; }
}
```

## ASP.NET Core 配置

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
```

## 小结

- 新项目推荐 System.Text.Json（性能更好）
- 复杂场景用 Newtonsoft.Json
- 使用属性注解控制序列化行为

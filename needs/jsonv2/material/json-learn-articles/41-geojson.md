# GeoJSON：地理数据的 JSON 表示

> **分类**：高级主题　|　**级别**：高级　|　**标签**：GeoJSON, 地理信息, 地图, RFC 7946

## 什么是 GeoJSON

GeoJSON（RFC 7946）是用 JSON 格式表示地理空间数据的标准。它可以描述点、线、面等几何形状及其属性，被主流地图库（Leaflet、Mapbox、Google Maps）和 GIS 工具原生支持。

## 几何类型

### Point（点）

```json
{
  "type": "Point",
  "coordinates": [116.4074, 39.9042]
}
```

坐标顺序：**[经度, 纬度]**（注意不是纬度在前）。

### LineString（线）

```json
{
  "type": "LineString",
  "coordinates": [
    [116.4074, 39.9042],
    [121.4737, 31.2304],
    [113.2644, 23.1291]
  ]
}
```

### Polygon（面）

```json
{
  "type": "Polygon",
  "coordinates": [[
    [116.0, 39.5],
    [117.0, 39.5],
    [117.0, 40.5],
    [116.0, 40.5],
    [116.0, 39.5]
  ]]
}
```

多边形的第一个和最后一个坐标必须相同（闭合）。外层数组支持多环（外环 + 内部空洞）。

### MultiPoint / MultiLineString / MultiPolygon

```json
{
  "type": "MultiPoint",
  "coordinates": [
    [116.4074, 39.9042],
    [121.4737, 31.2304]
  ]
}
```

### GeometryCollection

```json
{
  "type": "GeometryCollection",
  "geometries": [
    { "type": "Point", "coordinates": [116.4, 39.9] },
    { "type": "LineString", "coordinates": [[116.4, 39.9], [121.5, 31.2]] }
  ]
}
```

## Feature 和 FeatureCollection

实际应用中很少直接使用裸几何体。**Feature** 将几何体与属性绑定：

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [116.4074, 39.9042]
  },
  "properties": {
    "name": "天安门广场",
    "city": "北京",
    "visitors_per_year": 15000000
  }
}
```

**FeatureCollection** 是 Feature 的集合：

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [116.4074, 39.9042] },
      "properties": { "name": "北京", "population": 21540000 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [121.4737, 31.2304] },
      "properties": { "name": "上海", "population": 24870000 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [113.2644, 23.1291] },
      "properties": { "name": "广州", "population": 18676605 }
    }
  ]
}
```

## 实战：在地图上展示

### Leaflet (JavaScript)

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

<div id="map" style="height: 500px;"></div>
<script>
const map = L.map("map").setView([35, 110], 4);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const geojson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [116.4074, 39.9042] },
      properties: { name: "北京" }
    }
    // ... 更多 features
  ]
};

L.geoJSON(geojson, {
  onEachFeature: (feature, layer) => {
    layer.bindPopup(feature.properties.name);
  }
}).addTo(map);
</script>
```

### Python（shapely + geopandas）

```python
import geopandas as gpd
import json

# 从文件读取
gdf = gpd.read_file("cities.geojson")
print(gdf.head())

# 空间查询：找出某区域内的点
from shapely.geometry import box
bbox = box(110, 30, 120, 40)
cities_in_bbox = gdf[gdf.geometry.within(bbox)]

# 输出为 GeoJSON
print(cities_in_bbox.to_json())
```

## 注意事项

1. **坐标顺序是 [经度, 纬度]**，不是 [纬度, 经度]。这是最常见的错误
2. 坐标使用 WGS 84 坐标系（EPSG:4326），与 GPS 一致
3. 多边形必须闭合（首尾坐标相同）
4. 避免超大 GeoJSON 文件（>50MB），考虑使用 TopoJSON 或矢量切片
5. `properties` 可以包含任意键值对，没有固定 Schema

## GeoJSON vs TopoJSON

| 维度 | GeoJSON | TopoJSON |
|------|---------|----------|
| 标准 | RFC 7946 | D3.js 社区 |
| 体积 | 大（坐标重复） | 小（共享边界，可减 80%） |
| 兼容性 | 所有地图库原生支持 | 需要 topojson-client 转换 |
| 拓扑关系 | 无 | 有（相邻区域共享边界） |

## 小结

- GeoJSON 用 JSON 描述地理空间数据，支持点、线、面等几何类型
- 坐标顺序是 `[经度, 纬度]`，使用 WGS 84 坐标系
- Feature 将几何体和属性绑定，FeatureCollection 是常用的顶层结构
- 主流地图库（Leaflet、Mapbox、Google Maps）原生支持
- 大数据量场景考虑 TopoJSON 或矢量切片优化

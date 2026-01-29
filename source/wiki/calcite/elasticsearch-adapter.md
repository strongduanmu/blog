---
layout: wiki
wiki: calcite
order: 202
title: Elasticsearch 适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/elasticsearch_adapter.html

有关下载和构建 Calcite 的说明，请从[教程](/wiki/calcite/tutorial.html)开始。

一旦你成功编译了项目，就可以在这里返回并开始使用 Calcite 查询 Elasticsearch。首先，我们需要一个模型定义。模型为 Calcite 创建 Elasticsearch 适配器实例提供了必要的参数。模型可以包含物化视图的定义。模型定义中定义的表的名称对应于 Elasticsearch 中的索引。

下面给出一个模型文件的基本示例：

```json
{
  "version": "1.0",
  "defaultSchema": "elasticsearch",
  "schemas": [
    {
      "type": "custom",
      "name": "elasticsearch",
      "factory": "org.apache.calcite.adapter.elasticsearch.ElasticsearchSchemaFactory",
      "operand": {
        "coordinates": "{'127.0.0.1': 9200}"
      }
    }
  ]
}
```

假设此文件存储为 `model.json`，你可以通过 `sqlline` 连接到 Elasticsearch，如下所示：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=model.json admin admin
```

你也可以指定索引名称和路径前缀，它们由模型定义中的 `index` 和 `pathPrefix` 参数表示：

```json
...

      "operand": {
        "coordinates": "{'127.0.0.1': 9200}",
        "index": "usa",
        "pathPrefix": "path"
      }

...
```

现在 `sqlline` 将接受访问你的 Elasticsearch 的 SQL 查询。此适配器的目的是通过尽可能在 Elasticsearch 中直接利用过滤和排序，将查询编译为最有效的 Elasticsearch SEARCH JSON。

我们可以发出一个简单查询来获取存储在索引 `usa` 中的所有州名称。

```bash
sqlline> SELECT * from "usa";
```

```
_MAP={pop=13367, loc=[-72.505565, 42.067203], city=EAST LONGMEADOW, id=01028, state=MA}
_MAP={pop=1652, loc=[-72.908793, 42.070234], city=TOLLAND, id=01034, state=MA}
_MAP={pop=3184, loc=[-72.616735, 42.38439], city=HATFIELD, id=01038, state=MA}
_MAP={pop=43704, loc=[-72.626193, 42.202007], city=HOLYOKE, id=01040, state=MA}
_MAP={pop=2084, loc=[-72.873341, 42.265301], city=HUNTINGTON, id=01050, state=MA}
_MAP={pop=1350, loc=[-72.703403, 42.354292], city=LEEDS, id=01053, state=MA}
_MAP={pop=8194, loc=[-72.319634, 42.101017], city=MONSON, id=01057, state=MA}
_MAP={pop=1732, loc=[-72.204592, 42.062734], city=WALES, id=01081, state=MA}
_MAP={pop=9808, loc=[-72.258285, 42.261831], city=WARE, id=01082, state=MA}
_MAP={pop=4441, loc=[-72.203639, 42.20734], city=WEST WARREN, id=01092, state=MA}
```

在执行此查询时，Elasticsearch 适配器能够识别 `city` 可以被 Elasticsearch 过滤，`state` 可以被 Elasticsearch 按升序排序。

下面是给 Elasticsearch 的最终源 JSON：

```json
{
  "query": {
    "constant_score": {
      "filter": {
        "bool": {
          "must": [
            {
              "term": {
                "city": "springfield"
              }
            }
          ]
        }
      }
    }
  },
  "fields": [
    "city",
    "state"
  ],
  "script_fields": {},
  "sort": [
    {
      "state": "asc"
    }
  ]
}
```

你也可以在没有预先视图定义的情况下查询弹性搜索索引：

```bash
sqlline> SELECT _MAP['city'], _MAP['state'] from "elasticsearch"."usa" order by _MAP['state'];
```

## 使用滚动 API

对于没有聚合函数（如 `COUNT`、`MAX` 等）的查询，elastic 适配器默认使用滚动 API。这确保向最终用户返回一致且完整的数据集（惰性地并以批处理方式）。请注意，当所有查询结果被消耗时，滚动会自动清除（删除）。

## 支持的版本

目前，此适配器支持 ElasticSearch 6.x 版本（或更新版本）。通常，我们会遵循官方支持计划。此外，不支持类型（此适配器仅支持索引）。

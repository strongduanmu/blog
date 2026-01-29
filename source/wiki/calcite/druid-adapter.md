---
layout: wiki
wiki: calcite
order: 201
title: Druid 适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/druid_adapter.html

Druid 是一个快速的面向列的分布式数据存储。它允许你通过基于 JSON 的查询语言执行查询，特别是 OLAP 风格的查询。Druid 可以以批处理模式或连续方式加载；Druid 的主要区别之一是它能够从流源（如 Kafka）加载数据，并在几毫秒内使数据可用于查询。

Calcite 的 Druid 适配器允许你使用 SQL 查询数据，并将其与其他 Calcite 模式中的数据结合使用。

首先，我们需要一个模型定义。模型为 Calcite 创建 Druid 适配器实例提供了必要的参数。

下面给出一个模型文件的基本示例：

```json
{
  "version": "1.0",
  "defaultSchema": "wiki",
  "schemas": [
    {
      "type": "custom",
      "name": "wiki",
      "factory": "org.apache.calcite.adapter.druid.DruidSchemaFactory",
      "operand": {
        "url": "http://localhost:8082",
        "coordinatorUrl": "http://localhost:8081"
      },
      "tables": [
        {
          "name": "wiki",
          "factory": "org.apache.calcite.adapter.druid.DruidTableFactory",
          "operand": {
            "dataSource": "wikiticker",
            "interval": "1900-01-09T00:00:00.000Z/2992-01-10T00:00:00.000Z",
            "timestampColumn": {
              "name": "time",
              "type": "timestamp"
            },
            "dimensions": [
              "channel",
              "cityName",
              "comment",
              "countryIsoCode",
              "countryName",
              "isAnonymous",
              "isMinor",
              "isNew",
              "isRobot",
              "isUnpatrolled",
              "metroCode",
              "namespace",
              "page",
              "regionIsoCode",
              "regionName"
            ],
            "metrics": [
              {
                "name": "count",
                "type": "count"
              },
              {
                "name": "added",
                "type": "longSum",
                "fieldName": "added"
              },
              {
                "name": "deleted",
                "type": "longSum",
                "fieldName": "deleted"
              },
              {
                "name": "delta",
                "type": "longSum",
                "fieldName": "delta"
              },
              {
                "name": "user_unique",
                "type": "hyperUnique",
                "fieldName": "user_id"
              }
            ],
            "complexMetrics": [
              "user_id"
            ]
          }
        }
      ]
    }
  ]
}
```

此文件存储为 `druid/src/test/resources/druid-wiki-model.json`，因此你可以通过 `sqlline` 连接到 Druid，如下所示：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=druid/src/test/resources/druid-wiki-model.json admin admin
sqlline> select "countryName", cast(count(*) as integer) as c
         from "wiki"
         group by "countryName"
         order by c desc limit 5;
+----------------+------------+
| countryName    |     C      |
+----------------+------------+
|                | 35445      |
| United States  | 528        |
| Italy          | 256        |
| United Kingdom | 234        |
| France         | 205        |
+----------------+------------+
5 rows selected (0.279 seconds)
sqlline>
```

该查询显示了 2015-09-12（`wikiticker` 数据集涵盖的日期）维基百科编辑的前 5 个来源国家/地区。

现在让我们看看查询是如何评估的：

```bash
sqlline> !set outputformat csv
sqlline> explain plan for
         select "countryName", cast(count(*) as integer) as c
         from "wiki"
         group by "countryName"
         order by c desc limit 5;
'PLAN'
'EnumerableInterpreter
  BindableProject(countryName=[$0], C=[CAST($1):INTEGER NOT NULL])
    BindableSort(sort0=[$1], dir0=[DESC], fetch=[5])
      DruidQuery(table=[[wiki, wiki]], groups=[{4}], aggs=[[COUNT()]])
'
1 row selected (0.024 seconds)
```

该计划显示 Calcite 能够将查询的 `GROUP BY` 部分下推到 Druid，包括 `COUNT(*)` 函数，但不能下推 `ORDER BY ... LIMIT`。（我们计划取消此限制；请参阅 [CALCITE-1206]。）

## 复杂指标

Druid 有特殊的指标可以产生快速但近似的结果。目前有两种类型：

- `hyperUnique` - HyperLogLog 数据草图，用于估算维度的基数
- `thetaSketch` - Theta 草图，也用于估算维度的基数，但也可以用于执行集合操作。

在模型定义中，有一个名为 `complexMetrics` 的字符串数组，用于声明每个复杂指标的别名。该别名在 SQL 中使用，但是当 Calcite 为 druid 生成 JSON 查询时，将使用其真实列名。

## Foodmart 数据集

测试 VM 还包括一个数据集，该数据集将 Foodmart 模式的销售、产品和客户表非规范化为一个名为 "foodmart" 的单个 Druid 数据集。

你可以通过 `druid/src/test/resources/druid-foodmart-model.json` 模型访问它。

## 简化模型

如果在模型中提供的元数据较少，Druid 适配器可以自动从 Druid 发现它。以下是与前一个模式等效的模式，但删除了 `dimensions`、`metrics` 和 `timestampColumn`：

```json
{
  "version": "1.0",
  "defaultSchema": "wiki",
  "schemas": [
    {
      "type": "custom",
      "name": "wiki",
      "factory": "org.apache.calcite.adapter.druid.DruidSchemaFactory",
      "operand": {
        "url": "http://localhost:8082",
        "coordinatorUrl": "http://localhost:8081"
      },
      "tables": [
        {
          "name": "wiki",
          "factory": "org.apache.calcite.adapter.druid.DruidTableFactory",
          "operand": {
            "dataSource": "wikiticker",
            "interval": "1900-01-09T00:00:00.000Z/2992-01-10T00:00:00.000Z"
          }
        }
      ]
    }
  ]
}
```

Calcite 向 Druid 调度 `segmentMetadataQuery` 以发现表的列。

现在，让我们取出 `tables` 元素：

```json
{
  "version": "1.0",
  "defaultSchema": "wiki",
  "schemas": [
    {
      "type": "custom",
      "name": "wiki",
      "factory": "org.apache.calcite.adapter.druid.DruidSchemaFactory",
      "operand": {
        "url": "http://localhost:8082",
        "coordinatorUrl": "http://localhost:8081"
      }
    }
  ]
}
```

Calcite 通过 /druid/coordinator/v1/metadata/datasources REST 调用发现 "wikiticker" 数据源。现在 "wiki" 表元素已被删除，该表称为 "wikiticker"。Druid 中存在的任何其他数据源也将显示为表。

我们的模型现在是一个基于自定义模式工厂的模式，只有两个操作数，所以我们可以省略模型，并将操作数作为连接字符串的一部分提供：

```
jdbc:calcite:schemaFactory=org.apache.calcite.adapter.druid.DruidSchemaFactory; schema.url=http://localhost:8082; schema.coordinatorUrl=http://localhost:8081
```

事实上，这些是操作数的默认值，所以我们可以省略它们：

```
jdbc:calcite:schemaFactory=org.apache.calcite.adapter.druid.DruidSchemaFactory
```

现在，我们可以使用一个非常简单的连接字符串连接到 `sqlline`，并列出可用的表：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:schemaFactory=org.apache.calcite.adapter.druid.DruidSchemaFactory admin admin
sqlline> !tables
+-----------+-------------+------------+--------------+
| TABLE_CAT | TABLE_SCHEM | TABLE_NAME | TABLE_TYPE   |
+-----------+-------------+------------+--------------+
|           | adhoc       | foodmart   | TABLE        |
|           | adhoc       | wikiticker | TABLE        |
|           | metadata    | COLUMNS    | SYSTEM_TABLE |
|           | metadata    | TABLES     | SYSTEM_TABLE |
+-----------+-------------+------------+--------------+
```

我们看到两个系统表（`TABLES` 和 `COLUMNS`），以及 Druid 中的两个表（`foodmart` 和 `wikiticker`）。

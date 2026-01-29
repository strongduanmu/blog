---
layout: wiki
wiki: calcite
order: 206
title: Redis 适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/redis_adapter.html

Redis 是一个开源（BSD 许可）、内存中的数据结构存储，用作数据库、缓存和消息代理。它支持诸如字符串、哈希、列表、集合、具有范围查询的有序集合、位图、HyperLogLog、具有半径查询的地理空间索引和流等数据结构。Redis 具有内置复制、Lua 脚本、LRU 驱逐、事务和不同级别的磁盘持久性，并通过 Redis Sentinel 提供高可用性，以及通过 Redis Cluster 进行自动分区。

Calcite 的 Redis 适配器允许你使用 SQL 查询 Redis 中的数据，并将其与其他 Calcite 模式中的数据结合使用。

Redis 适配器允许查询存储在 Redis 中的实时数据。每个 Redis 键值对都显示为单行。可以通过使用表定义文件将行分解为单元格。支持 Redis `string`、`hash`、`sets`、`zsets`、`list` 值类型。

首先，我们需要一个模型定义。模型为 Calcite 创建 Redis 适配器实例提供了必要的参数。

下面给出一个模型文件的基本示例：

```json
{
  "version": "1.0",
  "defaultSchema": "foodmart",
  "schemas": [
    {
      "type": "custom",
      "name": "foodmart",
      "factory": "org.apache.calcite.adapter.redis.RedisSchemaFactory",
      "operand": {
        "host": "localhost",
        "port": 6379,
        "database": 0,
        "password": ""
      },
      "tables": [
        {
          "name": "json_01",
          "factory": "org.apache.calcite.adapter.redis.RedisTableFactory",
          "operand": {
            "dataFormat": "json",
            "fields": [
              {
                "name": "DEPTNO",
                "type": "varchar",
                "mapping": "DEPTNO"
              },
              {
                "name": "NAME",
                "type": "varchar",
                "mapping": "NAME"
              }
            ]
          }
        },
        {
          "name": "raw_01",
          "factory": "org.apache.calcite.adapter.redis.RedisTableFactory",
          "operand": {
            "dataFormat": "raw",
            "fields": [
              {
                "name": "id",
                "type": "varchar",
                "mapping": "id"
              },
              {
                "name": "city",
                "type": "varchar",
                "mapping": "city"
              },
              {
                "name": "pop",
                "type": "int",
                "mapping": "pop"
              }
            ]
          }
        },
        {
          "name": "csv_01",
          "factory": "org.apache.calcite.adapter.redis.RedisTableFactory",
          "operand": {
            "dataFormat": "csv",
            "keyDelimiter": ":",
            "fields": [
              {
                "name": "EMPNO",
                "type": "varchar",
                "mapping": 0
              },
              {
                "name": "NAME",
                "type": "varchar",
                "mapping": 1
              }
            ]
          }
        }
      ]
    }
  ]
}
```

此文件存储为 `redis/src/test/resources/redis-mix-model.json`，因此你可以通过 `sqlline` 连接到 Redis，如下所示：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=redis/src/test/resources/redis-mix-model.json admin admin
sqlline> !tables
+-----------+-------------+------------+--------------+---------+----------+------------+-----------+---------------------------+----------------+
| TABLE_CAT | TABLE_SCHEM | TABLE_NAME |  TABLE_TYPE  | REMARKS | TYPE_CAT | TYPE_SCHEM | TYPE_NAME | SELF_REFERENCING_COL_NAME | REF_GENERATION |
+-----------+-------------+------------+--------------+---------+----------+------------+-----------+---------------------------+----------------+
|           | foodmart    | csv_01     | TABLE        |         |          |            |           |                           |                |
|           | foodmart    | json_01    | TABLE        |         |          |            |           |                           |                |
|           | foodmart    | raw_01     | TABLE        |         |          |            |           |                           |                |
+-----------+-------------+------------+--------------+---------+----------+------------+-----------+---------------------------+----------------+
sqlline> Select a.DEPTNO, b.NAME from "csv_01" a left join "json_02" b on a.DEPTNO=b.DEPTNO;
+--------+----------+
| DEPTNO |   NAME   |
+--------+----------+
| 10     | "Sales1" |
+--------+----------+
1 row selected (3.304 seconds)
```

此查询显示了 CSV 格式表 `csv_01` 和 JSON 格式表 `json_02` 中的连接查询结果。

以下是有关字段的一些详细信息：

`keyDelimiter` 用于分割值，默认为冒号，分割后的值用于映射字段列。这仅适用于 CSV 格式。

`format` 键用于指定 Redis 中数据的格式。目前，它支持：`"csv"`、`"json"` 和 `"raw"`。`"raw"` 格式保持原始 Redis 键和值完整，仅使用一个字段键进行查询。下面不再描述详细信息。

`mapping` 的作用是将 Redis 的列映射到底层数据。由于 Redis 中没有列的概念，具体的映射方法根据格式而异。例如，对于 `"csv"`，我们知道 CSV 数据将在解析后形成。相应的列映射使用底层数组的索引（下标）。在上面的示例中，`EMPNO` 映射到索引 0，`NAME` 映射到索引 1，依此类推。

目前 Redis 适配器支持三种格式：raw、JSON 和 CSV。

## 示例：raw

raw 格式保持原始 Redis 键值格式，只有一列 `key`：

```bash
127.0.0.1:6379> LPUSH raw_02 "book1"
sqlline> select * from "raw_02";
+-------+
|  key  |
+-------+
| book2 |
| book1 |
+-------+
```

## 示例：JSON

JSON 格式解析 Redis 字符串值，并使用映射将字段转换为多列。

```bash
127.0.0.1:6379> LPUSH json_02 {"DEPTNO":10,"NAME":"Sales1"}
```

模式包含映射：

```json
{
   "name": "json_02",
   "factory": "org.apache.calcite.adapter.redis.RedisTableFactory",
   "operand": {
     "dataFormat": "json",
     "fields": [
       {
         "name": "DEPTNO",
         "type": "varchar",
         "mapping": "DEPTNO"
       },
       {
         "name": "NAME",
         "type": "varchar",
         "mapping": "NAME"
       }
     ]
   }
 }
```

```bash
sqlline> select * from "json_02";
+--------+----------+
| DEPTNO |   NAME   |
+--------+----------+
| 20     | "Sales2" |
| 10     | "Sales1" |
+--------+----------+
2 rows selected (0.014 seconds)
```

## 示例：CSV

CSV 格式解析 Redis 字符串值，并结合 fields 中的映射将其组合成多列。默认分隔符为 `:`。

```bash
127.0.0.1:6379> LPUSH csv_02 "10:Sales"
```

模式包含映射：

```json
{
  "name": "csv_02",
  "factory": "org.apache.calcite.adapter.redis.RedisTableFactory",
  "operand": {
    "dataFormat": "csv",
    "keyDelimiter": ":",
    "fields": [
      {
        "name": "DEPTNO",
        "type": "varchar",
        "mapping": 0
      },
      {
        "name": "NAME",
        "type": "varchar",
        "mapping": 1
      }
    ]
  }
}
```

```bash
sqlline> select * from "csv_02";
+--------+-------+
| DEPTNO | NAME  |
+--------+-------+
| 20     | Sales |
| 10     | Sales |
+--------+-------+
```

未来计划：
需要进一步完善更多 Redis 功能：例如 HyperLogLog 和 Pub/Sub。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

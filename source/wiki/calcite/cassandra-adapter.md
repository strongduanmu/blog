---
layout: wiki
wiki: calcite
order: 200
title: Cassandra 适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/cassandra_adapter.html

有关下载和构建 Calcite 的说明，请从[教程](/wiki/calcite/tutorial.html)开始。

一旦你成功编译了项目，就可以返回到这里，并开始使用 Calcite 查询 Cassandra。首先，我们需要一个模型定义。模型为 Calcite 创建 Cassandra 适配器实例提供了必要的参数。请注意，虽然模型可以包含物化视图的定义，但适配器将尝试自动填充 Cassandra 中定义的任何物化视图。

下面给出一个模型文件的基本示例：

```json
{
  "version": "1.0",
  "defaultSchema": "twissandra",
  "schemas": [
    {
      "name": "twissandra",
      "type": "custom",
      "factory": "org.apache.calcite.adapter.cassandra.CassandraSchemaFactory",
      "operand": {
        "host": "localhost",
        "keyspace": "twissandra"
      }
    }
  ]
}
```

需要注意，如果你的服务器需要身份验证，你可以和 `host` 和 `keyspace` 一起，再指定 `username` 和 `password` 属性。假设此文件存储为 `model.json`，你可以通过 `sqlline` 连接到 Cassandra，如下所示：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=model.json admin admin
```

现在 `sqlline` 将接受你访问 CQL 表的 SQL 查询。但是，你不仅限于发出 CQL 支持的查询。Calcite 允许你执行复杂的操作，例如聚合或连接。适配器将尝试通过尽可能在 Cassandra 中直接利用过滤和排序，将查询编译为最有效的 CQL。

例如，在示例数据集中有一个名为 `timeline` 的 CQL 表，其中 `username` 是分区键，`time` 是聚类键。

我们可以通过编写标准 SQL 发出简单查询来获取用户最新的推文 ID：

```sql
sqlline> SELECT "tweet_id"
         FROM "timeline"
         WHERE "username" = 'JmuhsAaMdw'
         ORDER BY "time" DESC LIMIT 1;
+--------------------------------------+
| tweet_id                             |
+--------------------------------------+
| f3d3d4dc-d05b-11e5-b58b-90e2ba530b12 |
+--------------------------------------+
```

在执行此查询时，Cassandra 适配器能够识别 `username` 是分区键，可以被 Cassandra 过滤。它还识别聚类键 `time` 并将排序下推到 Cassandra。

下面是给 Cassandra 的最终 CQL 查询：

```sql
SELECT username, time, tweet_id
FROM "timeline"
WHERE username = 'JmuhsAaMdw'
ORDER BY time DESC ALLOW FILTERING;
```

在提高适配器的灵活性和性能方面仍有大量工作要做，但如果你正在寻找一种快速方法来获得对存储在 Cassandra 中的数据的额外洞察，Calcite 应该会证明是有用的。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

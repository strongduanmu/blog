---
layout: wiki
wiki: calcite
order: 204
title: Geode 适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/geode_adapter.html

有关下载和构建 Calcite 的说明，请从[教程](/wiki/calcite/tutorial.html)开始。

> 可选：在 maven 构建中添加 `-Puberjdbc` 以创建一个独立的自包含 Geode JDBC 适配器 jar。

一旦你成功编译了项目，就可以回到这里，并开始使用 Calcite 查询 Apache Geode。首先，我们需要定义一个模型。模型为 Calcite 创建 Geode 适配器实例，提供了必要的参数。模型可以包含物化视图的定义，模型定义中的表的名称对应于 Geode 中的区域。

下面给出了模型文件的基本示例：

```json
{
  "version": "1.0",
  "defaultSchema": "geode",
  "schemas": [
    {
      "name": "geode_raw",
      "type": "custom",
      "factory": "org.apache.calcite.adapter.geode.rel.GeodeSchemaFactory",
      "operand": {
        "locatorHost": "localhost",
        "locatorPort": "10334",
        "regions": "Zips",
        "pdxSerializablePackagePath": ".*"
      }
    }
  ]
}
```

此适配器针对 `Geode 1.3.x`，`regions` 字段允许列出（逗号分隔）所有 Geode 区域以显示为关系表。

假设此文件存储为 `model.json`，你可以通过 `sqlline` 连接到 Geode，如下所示：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=model.json admin admin
```

现在 `sqlline` 将接收使用 OQL 访问区域的 SQL 查询，而且你不仅能执行 OQL 支持的查询，Calcite 还允许你执行复杂的操作，例如聚合或连接。适配器将尽可能尝试在 Geode 中直接利用过滤、排序和聚合，将查询编译为最有效的 OQL。

例如，在示例 Bookshop 数据集中有一个区域 `BookMaster`。

我们可以执行一个 SQL 查询，来获取按成本排序的年度零售成本：

```sql
sqlline> SELECT
           "yearPublished",
           SUM("retailCost") AS "totalCost"
         FROM "TEST"."BookMaster"
         GROUP BY "yearPublished"
         ORDER BY "totalCost";
+---------------+--------------------+
| yearPublished | totalCost          |
+---------------+--------------------+
| 1971          | 11.989999771118164 |
| 2011          | 94.9800033569336   |
+---------------+--------------------+
```

在执行此查询时，Geode 适配器能够识别出投影、分组和排序，这些运算符可以由 Geode 本地执行。

下面是下推到 Geode 的最终 OQL 查询：

```sql
SELECT yearPublished AS yearPublished,  SUM(retailCost) AS totalCost
FROM /BookMaster
GROUP BY yearPublished
ORDER BY totalCost ASC
```

Geode 中不支持的操作由 Calcite 本身处理。例如，以下在同一 `Bookshop` 数据集上的 JOIN 查询：

```sql
sqlline> SELECT
           "i"."itemNumber",
           "m"."author",
           "m"."retailCost"
         FROM "TEST"."BookInventory" "i"
           JOIN "TEST"."BookMaster" "m" ON "i"."itemNumber" = "m"."itemNumber"
         WHERE "m"."retailCost" > 20;
+------------+----------------+------------+
| itemNumber | author         | retailCost |
+------------+----------------+------------+
| 123        | Daisy Mae West | 34.99      |
+------------+----------------+------------+
```

将生成两个单独的下推 OQL 查询：

```sql
SELECT  itemNumber AS itemNumber, retailCost AS retailCost, author AS author
FROM /BookMaster
WHERE retailCost > 20;

SELECT  itemNumber AS itemNumber
FROM /BookInventory;
```

然后查询结果将在 Calcite 中进行连接。要选择 Geode 数组字段中的特定项目，请使用 `fieldName[index]` 语法：

```sql
sqlline> SELECT
           "loc" [0] AS "lon",
           "loc" [1] AS "lat"
         FROM "geode".ZIPS
```

要选择嵌套字段，请使用映射 `fieldName[nestedFiledName]` 语法：

```sql
sqlline> SELECT "primaryAddress" ['postalCode'] AS "postalCode"
         FROM "TEST"."BookCustomer"
         WHERE "primaryAddress" ['postalCode'] > '0';
```

这条 SQL 将投影 `BookCustomer.primaryAddress.postalCode` 值字段。

以下演示和视频教程提供了有关 Geode 适配器的更多详细信息：

- [使用 Apache Calcite 启用对 Apache Geode/GemFire 的 SQL/JDBC 访问](https://www.slideshare.net/slideshow/embed_code/key/2Mil7I0ZPMLuJU)（GeodeSummit/SpringOne 2017）
- [通过 SQL/JDBC 访问 Apache Geode/GemFire](https://www.linkedin.com/pulse/access-apache-geode-gemfire-over-sqljdbc-christian-tzolov)
- [使用 IntelliJ SQL/Database 工具探索 Geode & GemFire 数据](https://www.linkedin.com/pulse/explore-your-geode-gemfire-data-from-within-intellij-tool-tzolov)
- [使用 Apache Zeppelin 通过 SQL/JDBC 进行高级 Apache Geode 数据分析](https://www.linkedin.com/pulse/advanced-apache-geode-data-analytics-zeppelin-over-sqljdbc-tzolov)
- [对 Geode/Greenplum/... 的统一访问](https://www.linkedin.com/pulse/unified-access-geodegreenplum-christian-tzolov)
- [Apache Calcite 用于启用对 NoSQL 数据系统（如 Apache Geode）的 SQL 访问](https://schd.ws/hosted_files/apachebigdataeu2016/b6/ApacheCon2016ChristianTzolov.v3.pdf)（ApacheCon Big Data，2016）

在提高适配器的灵活性和性能方面，仍有大量工作要做，但如果你正在寻找一种快速方法，来获得对存储在 Geode 中的数据的额外查询，Calcite 应该会证明自己是有价值的。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

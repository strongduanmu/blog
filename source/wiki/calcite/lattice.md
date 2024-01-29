---
layout: wiki
wiki: Calcite 官方文档中文版
order: 104
title: Lattice 格
date: 2023-10-26 09:00:00
---

> 原文链接：https://calcite.apache.org/docs/lattice.html

Lattice 格是用于创建和填充物化视图以及识别物化视图可用于解决特定查询的框架。

## 概念

Lattice 格代表星形（或雪花）模式，而不是一般模式。特别是，所有关系都必须是多对一的，从星形中心的事实表开始。

该名称源自数学：[格](https://en.wikipedia.org/wiki/Lattice_(order))是一个[部分有序的集合](https://en.wikipedia.org/wiki/Partially_ordered_set)，其中任何两个元素都有唯一的最大下界和最小上界。

`HRU96`[^1] 观察到数据立方体的可能物化集合形成了一个格，并提出了一种算法来选择一组好的物化。Calcite的推荐算法就是由此衍生出来的。

Lattice 格定义使用 SQL 语句来表示星形。 SQL 是一种有用的速记方式，可以表示连接在一起的多个表，并为列名分配别名（它比发明一种新语言来表示关系、连接条件和基数更方便）。

与常规 SQL 不同，顺序很重要。如果**在 FROM 子句中将 A 放在 B 之前，并在 A 和 B 之间进行联接，则表示从 A 到 B 存在多对一外键关系**（例如，在示例格中，Sales 事实表出现在`时间维度表`之前和`产品维度表`之前。`产品维度表`出现在`产品类外部维度表`之前，位于雪花分支的下方）。

Lattice 格意味着约束。在 A 到 B 的关系中，A 上有一个外键（即 A 的外键的每个值在 B 的键中都有一个对应的值），并且 B 上有一个唯一的键（即没有一个键值出现超过一次）。这些约束非常重要，因为它允许优化器删除与未使用列的表的连接，并知道查询结果不会改变。

Calcite 不检查这些限制。如果违反，Calcite 将返回错误的结果。

Lattice 格是一个大的虚拟连接视图。它没有具体化（由于非规范化，它会比星型模式大几倍），并且你可能不想查询它（列太多）。那么它有什么用呢？正如我们上面所说：

1. 格子声明了一些非常有用的主键和外键约束；
2. 它帮助查询优化器将用户查询映射到过滤器连接聚合物化视图（DW 查询最有用的物化视图类型） ；
3. 为 Calcite 提供了一个框架，用于收集有关数据量和用户查询的统计信息；
4. 允许 Calcite 自动设计和填充物化视图。

大多数星型模式模型都会强制您选择列是维度还是度量。在格子中，每一列都是一个维度列（也就是说，它可以成为 GROUP BY 子句中的列之一，以查询特定维度的星型模式）。任何列也可以用于度量，你可以通过提供列和聚合函数来定义度量。

如果 `unit_sales` 更常被用作度量而不是维度，那也没关系。Calcite 的算法应该注意到它很少聚合，并且不倾向于创建在其上聚合的图块（我所说的应该是指`可以而且有一天会`，该算法目前在设计图块时不考虑查询历史记录）。

但有人可能想知道少于 5 件商品的订单比 100 件以上的订单利润更高还是更低。突然间，`unit_sales` 变成了一个维度。如果将列声明为维度列的成本几乎为零，我想让我们将它们全部设为维度列。

该模型允许使用不同的表别名多次使用特定的表。您可以使用它来建模 OrderDate 和 ShipDate，并对时间维度表有两种用途。

大多数 SQL 系统要求视图中的列名是唯一的。这在网格中很难实现，因为您经常在连接中包含主键列和外键列。所以 Calcite 允许您以两种方式引用列。如果该列是唯一的，您可以使用其名称 `["unit_sales"]`。无论它在格中是否唯一，它在其表中也将是唯一的，因此你可以通过其表别名来限定使用它。例如：

- `["销售额"，"单位销售额"]`；
- `["发货日期"，"时间 ID"]`；
- `["订单日期"，"时间 ID"]`。

`Tile` 块是 Lattice 格中的物化表格，具有特定的维度。[Lattice 格 JSON 元素](https://calcite.apache.org/docs/model.html#lattice) 中的 `tiles` 属性定义了一组要具体化的初始图块。

## 示范

创建一个包含 Lattice 格的模型：

```json
{
  "version": "1.0",
  "defaultSchema": "foodmart",
  "schemas": [ {
    "type": "jdbc",
    "name": "foodmart",
    "jdbcUser": "FOODMART",
    "jdbcPassword": "FOODMART",
    "jdbcUrl": "jdbc:hsqldb:res:foodmart",
    "jdbcSchema": "foodmart"
  },
  {
    "name": "adhoc",
    "lattices": [ {
      "name": "star",
      "sql": [
        "select 1 from \"foodmart\".\"sales_fact_1997\" as \"s\"",
        "join \"foodmart\".\"product\" as \"p\" using (\"product_id\")",
        "join \"foodmart\".\"time_by_day\" as \"t\" using (\"time_id\")",
        "join \"foodmart\".\"product_class\" as \"pc\" on \"p\".\"product_class_id\" = \"pc\".\"product_class_id\""
      ],
      "auto": true,
      "algorithm": true,
      "rowCountEstimate": 86837,
      "defaultMeasures": [ {
        "agg": "count"
      } ]
    } ]
  } ]
}
```

这是 [hsqldb-foodmart-lattice-model.json](https://github.com/apache/calcite/blob/main/core/src/test/resources/hsqldb-foodmart-lattice-model.json) 的精简版本，不包含 `tiles` 属性，因为我们将自动生成 Tile 块。下面让我们登录 sqlline 并连接到此模式：

```shell
$ sqlline version 1.3.0
sqlline> !connect jdbc:calcite:model=core/src/test/resources/hsqldb-foodmart-lattice-model.json "sa" ""
```

你会注意到连接需要几秒钟。Calcite 正在运行优化算法，并创建和填充物化视图。让我们运行一个查询并检查其计划：

```sql
sqlline> select "the_year","the_month", count(*) as c
. . . .> from "sales_fact_1997"
. . . .> join "time_by_day" using ("time_id")
. . . .> group by "the_year","the_month";
+----------+-----------+------+
| the_year | the_month |    C |
+----------+-----------+------+
| 1997     | September | 6663 |
| 1997     | April     | 6590 |
| 1997     | January   | 7034 |
| 1997     | June      | 6912 |
| 1997     | August    | 7038 |
| 1997     | February  | 6844 |
| 1997     | March     | 7710 |
| 1997     | October   | 6479 |
| 1997     | May       | 6866 |
| 1997     | December  | 8717 |
| 1997     | July      | 7752 |
| 1997     | November  | 8232 |
+----------+-----------+------+
12 rows selected (0.147 seconds)

sqlline> explain plan for
. . . .> select "the_year","the_month", count(*) as c
. . . .> from "sales_fact_1997"
. . . .> join "time_by_day" using ("time_id")
. . . .> group by "the_year","the_month";
+--------------------------------------------------------------------------------+
| PLAN                                                                           |
+--------------------------------------------------------------------------------+
| EnumerableCalc(expr#0..2=[{inputs}], the_year=[$t1], the_month=[$t0], C=[$t2]) |
|   EnumerableAggregate(group=[{3, 4}], C=[$SUM0($7)])                           |
|     EnumerableTableScan(table=[[adhoc, m{16, 17, 27, 31, 32, 36, 37}]])        |
+--------------------------------------------------------------------------------+
```

查询给出了正确的答案，但计划却有些令人惊讶。它不读取 `sales_fact_1997` 或 `time_by_day` 表，而是从名为 `m{16, 17, 27, 31, 32, 36, 37}` 的表中读取。这是在连接开始时创建的 Tile 块之一。

这是一个真实的表，你甚至可以直接查询它。它只有 120 行，因此是返回查询的更有效方法：

```sql
sqlline> !describe "adhoc"."m{16, 17, 27, 31, 32, 36, 37}"
+-------------+-------------------------------+--------------------+-----------+-----------------+
| TABLE_SCHEM | TABLE_NAME                    | COLUMN_NAME        | DATA_TYPE | TYPE_NAME       |
+-------------+-------------------------------+--------------------+-----------+-----------------+
| adhoc       | m{16, 17, 27, 31, 32, 36, 37} | recyclable_package | 16        | BOOLEAN         |
| adhoc       | m{16, 17, 27, 31, 32, 36, 37} | low_fat            | 16        | BOOLEAN         |
| adhoc       | m{16, 17, 27, 31, 32, 36, 37} | product_family     | 12        | VARCHAR(30)     |
| adhoc       | m{16, 17, 27, 31, 32, 36, 37} | the_month          | 12        | VARCHAR(30)     |
| adhoc       | m{16, 17, 27, 31, 32, 36, 37} | the_year           | 5         | SMALLINT        |
| adhoc       | m{16, 17, 27, 31, 32, 36, 37} | quarter            | 12        | VARCHAR(30)     |
| adhoc       | m{16, 17, 27, 31, 32, 36, 37} | fiscal_period      | 12        | VARCHAR(30)     |
| adhoc       | m{16, 17, 27, 31, 32, 36, 37} | m0                 | -5        | BIGINT NOT NULL |
+-------------+-------------------------------+--------------------+-----------+-----------------+

sqlline> select count(*) as c
. . . .> from "adhoc"."m{16, 17, 27, 31, 32, 36, 37}";
+-----+
|   C |
+-----+
| 120 |
+-----+
1 row selected (0.12 seconds)
```

让我们列出表格，您将看到更多的 Tile 块。还有模式表 `foodmart`、系统表 `TABLES` 和 `COLUMNS`，以及 Lattice 格本身，它显示的名称为 `star`。

```sql
sqlline> !tables
+-------------+-------------------------------+--------------+
| TABLE_SCHEM | TABLE_NAME                    | TABLE_TYPE   |
+-------------+-------------------------------+--------------+
| adhoc       | m{16, 17, 18, 32, 37}         | TABLE        |
| adhoc       | m{16, 17, 19, 27, 32, 36, 37} | TABLE        |
| adhoc       | m{4, 7, 16, 27, 32, 37}       | TABLE        |
| adhoc       | m{4, 7, 17, 27, 32, 37}       | TABLE        |
| adhoc       | m{7, 16, 17, 19, 32, 37}      | TABLE        |
| adhoc       | m{7, 16, 17, 27, 30, 32, 37}  | TABLE        |
| adhoc       | star                          | STAR         |
| foodmart    | customer                      | TABLE        |
| foodmart    | product                       | TABLE        |
| foodmart    | product_class                 | TABLE        |
| foodmart    | promotion                     | TABLE        |
| foodmart    | region                        | TABLE        |
| foodmart    | sales_fact_1997               | TABLE        |
| foodmart    | store                         | TABLE        |
| foodmart    | time_by_day                   | TABLE        |
| metadata    | COLUMNS                       | SYSTEM_TABLE |
| metadata    | TABLES                        | SYSTEM_TABLE |
+-------------+-------------------------------+--------------+
```

## 统计信息

选择要具体化 Lattice 格的哪些 Tile 块的算法取决于大量统计信息。它需要知道它正在考虑实现的每个列组合 (`a, b, c`) 的 `select count(distinct a, b, c) from star` 。因此，该算法在具有许多行和列的模式上需要很长时间。

我们正在开发 [数据分析器](https://issues.apache.org/jira/browse/CALCITE-1616) 来解决这个问题。

## Lattice 格建议器

如果你定义了一个 Lattice 格，Calcite 将在该 Lattice 格内进行自调整。但是如果你还没有定义格子怎么办？

输入格子建议器，它根据传入的查询构建 Lattice 格，并创建一个具有以下架构的模型 `"autoLattice": true`：

```json
{
  "version": "1.0",
  "defaultSchema": "foodmart",
  "schemas": [ {
    "type": "jdbc",
    "name": "foodmart",
    "jdbcUser": "FOODMART",
    "jdbcPassword": "FOODMART",
    "jdbcUrl": "jdbc:hsqldb:res:foodmart",
    "jdbcSchema": "foodmart"
  }, {
    "name": "adhoc",
    "autoLattice": true
  } ]
}
```

这是 [hsqldb-foodmart-lattice-model.json](https://github.com/apache/calcite/blob/main/core/src/test/resources/hsqldb-foodmart-lattice-model.json) 的精简版本，当你执行查询时，Calcite 将开始根据这些查询构建 Lattice 格。每个格都基于特定的事实表。当它在该事实表上看到更多查询时，它将演化 Lattice 格，将更多维度表连接到星形，并添加度量。

然后，每个网格将根据数据和查询进行自身优化。目标是创建相当小的汇总表（Tile 块），但基于更常用的属性和度量。

该功能仍处于实验阶段，但有可能使数据库比以前更加`自动优化`。

## 未来规划

以下是一些尚未实施的想法：

- 构建 Lattice 格的算法，考虑过去查询的日志；
- 物化视图管理器查看传入的查询并为它们构建 Tile 块。
- 物化视图管理器会删除未主动使用的 Tile 块；
- Lattice 格建议器根据传入查询添加 Lattice 格，将 Tile 块从现有 Lattice 格转移到新 Lattice 格，并删除不再使用的 Lattice 格；
- Tile 盖覆表水平拆分，重写算法可以通过将多个 Tile 块拼接在一起，并使用原始数据来填补漏洞来返回查询；
- 当底层数据发生更改时，用于使 Tile 块或 Tile 块水平分片失效的 API。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

## 参考文档

[^1]: [HRU96] V. Harinarayan, A. Rajaraman and J. Ullman. [Implementing data cubes efficiently](https://web.eecs.umich.edu/~jag/eecs584/papers/implementing_data_cube.pdf). In *Proc. ACM SIGMOD Conf.*, Montreal, 1996.


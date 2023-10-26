---
layout: wiki
wiki: Calcite 官方文档中文版
order: 102
title: 流式处理
date: 2023-10-26 09:00:00
---

> 原文链接：https://calcite.apache.org/docs/stream.html

TODO

Calcite 扩展了 SQL 和关系代数以支持流式查询。

## 介绍

流是持续、永久流动的记录的集合。与表不同，它们通常不存储在磁盘上，而是通过网络流动并在内存中短时间保存。

流是对表的补充，因为它们代表企业现在和未来正在发生的事情，而表则代表过去。将流归档到表中是很常见的。

与表一样，您通常希望使用基于关系代数的高级语言来查询流，根据模式进行验证，并进行优化以利用可用的资源和算法。

Calcite 的 SQL 是标准 SQL 的扩展，而不是另一种“类 SQL”语言。这种区别很重要，原因如下：

- 对于任何了解常规 SQL 的人来说，流式 SQL 都很容易学习。
- 语义很清晰，因为我们的目标是在流上产生相同的结果，就像表中存在相同的数据一样。
- 您可以编写组合流和表（或流的历史记录，基本上是内存中的表）的查询。
- 许多现有工具可以生成标准 SQL。

如果不使用该`STREAM`关键字，您将回到常规标准 SQL。

## 示例架构

我们的流式 SQL 示例使用以下架构：

- `Orders (rowtime, productId, orderId, units)`- 一个流和一个表
- `Products (rowtime, productId, name)`- 一张桌子
- `Shipments (rowtime, orderId)`- 一条流

## 一个简单的查询

让我们从最简单的流式查询开始：

```
SELECT STREAM *
FROM Orders;

  rowtime | productId | orderId | units
----------+-----------+---------+-------
 10:17:00 |        30 |       5 |     4
 10:17:05 |        10 |       6 |     1
 10:18:05 |        20 |       7 |     2
 10:18:07 |        30 |       8 |    20
 11:02:00 |        10 |       9 |     6
 11:04:00 |        10 |      10 |     1
 11:09:30 |        40 |      11 |    12
 11:24:11 |        10 |      12 |     4
```

此查询从`Orders`流中读取所有列和行。与任何流式查询一样，它永远不会终止。每当记录到达时，它就会输出一条记录`Orders`。

键入`Control-C`以终止查询。

关键字`STREAM`是流式 SQL 中的主要扩展。它告诉系统您对传入订单感兴趣，而不是现有订单。查询

```
SELECT *
FROM Orders;

  rowtime | productId | orderId | units
----------+-----------+---------+-------
 08:30:00 |        10 |       1 |     3
 08:45:10 |        20 |       2 |     1
 09:12:21 |        10 |       3 |    10
 09:27:44 |        30 |       4 |     2

4 records returned.
```

也有效，但会打印出所有现有订单，然后终止。我们将其称为*关系*查询，而不是*流式查询*。它具有传统的 SQL 语义。

`Orders`很特别，因为它既有流又有表。如果您尝试在表上运行流式查询，或在流上运行关系查询，Calcite 会给出错误：

```
SELECT * FROM Shipments;

ERROR: Cannot convert stream 'SHIPMENTS' to a table

SELECT STREAM * FROM Products;

ERROR: Cannot convert table 'PRODUCTS' to a stream
```

## 过滤行

就像在常规 SQL 中一样，您可以使用`WHERE`子句来过滤行：

```
SELECT STREAM *
FROM Orders
WHERE units > 3;

  rowtime | productId | orderId | units
----------+-----------+---------+-------
 10:17:00 |        30 |       5 |     4
 10:18:07 |        30 |       8 |    20
 11:02:00 |        10 |       9 |     6
 11:09:30 |        40 |      11 |    12
 11:24:11 |        10 |      12 |     4
```

## 投影表达式

在子句中使用表达式`SELECT`来选择要返回的列或计算表达式：

```
SELECT STREAM rowtime,
  'An order for ' || units || ' '
    || CASE units WHEN 1 THEN 'unit' ELSE 'units' END
    || ' of product #' || productId AS description
FROM Orders;

  rowtime | description
----------+---------------------------------------
 10:17:00 | An order for 4 units of product #30
 10:17:05 | An order for 1 unit of product #10
 10:18:05 | An order for 2 units of product #20
 10:18:07 | An order for 20 units of product #30
 11:02:00 | An order by 6 units of product #10
 11:04:00 | An order by 1 unit of product #10
 11:09:30 | An order for 12 units of product #40
 11:24:11 | An order by 4 units of product #10
```

我们建议您始终在子句`rowtime`中包含该列`SELECT` 。在每个流和流查询中拥有排序的时间戳使得稍后可以进行高级计算，例如`GROUP BY`和`JOIN`。

## 翻滚窗户

有多种方法可以计算流上的聚合函数。差异是：

- 每行输入多少行？
- 每个传入值是否出现在一个或多个总计中？
- 什么定义了“窗口”，即构成给定输出行的行集？
- 结果是流还是关系？

有多种窗口类型：

- 翻滚窗口（GROUP BY）
- 跳跃窗口（多 GROUP BY）
- 滑动窗口（窗口函数）
- 层叠窗口（窗口函数）

下图显示了使用它们的查询类型：

![窗户类型](https://calcite.apache.org/img/window-types.png)

首先，我们将查看一个由 Streaming 定义的 *滚动窗口*`GROUP BY`。这是一个例子：

```
SELECT STREAM CEIL(rowtime TO HOUR) AS rowtime,
  productId,
  COUNT(*) AS c,
  SUM(units) AS units
FROM Orders
GROUP BY CEIL(rowtime TO HOUR), productId;

  rowtime | productId |       c | units
----------+-----------+---------+-------
 11:00:00 |        30 |       2 |    24
 11:00:00 |        10 |       1 |     1
 11:00:00 |        20 |       1 |     7
 12:00:00 |        10 |       3 |    11
 12:00:00 |        40 |       1 |    12
```

结果是一个流。`productId`在 11 点钟，Calcite 会为自 10 点钟以来有订单的每个订单发出小计 ，时间戳为 11 点钟。12点，它会发出11:00到12:00之间发生的订单。每个输入行仅对一个输出行有贡献。

Calcite 如何知道 10:00:00 小计已在 11:00:00 完成，以便可以发出它们？它知道它`rowtime`正在增加，它也知道它`CEIL(rowtime TO HOUR)`也在增加。因此，一旦它在 11:00:00 或之后看到了一行，它就永远不会看到对 10:00:00 总计有贡献的行。

递增或递减的列或表达式被称为 *单调的*。

如果列或表达式的值稍微乱序，并且流具有声明特定值将永远不会再次出现的机制（例如标点符号或水印），则该列或表达式被称为准*单调*。

如果子句中没有单调或准单调表达式`GROUP BY`，Calcite 就无法取得进展，并且不允许查询：

```
SELECT STREAM productId,
  COUNT(*) AS c,
  SUM(units) AS units
FROM Orders
GROUP BY productId;

ERROR: Streaming aggregation requires at least one monotonic expression in GROUP BY clause
```

单调和准单调列需要在模式中声明。当记录进入流时，单调性被强制执行，并由从该流读取的查询假定。我们建议您为每个流提供一个名为 的时间戳列 `rowtime`，但您可以将其他列声明为单调的，`orderId`例如 。

[我们在下面](https://calcite.apache.org/docs/stream.html#punctuation)讨论标点符号、水印和其他取得进展的方法 。

## 翻滚车窗，改进

前面的翻滚窗口示例很容易编写，因为窗口为一小时。对于不是整个时间单位的间隔，例如 2 小时或 2 小时 17 分钟，不能使用`CEIL`，并且表达式会变得更加复杂。

Calcite 支持翻滚窗口的替代语法：

```
SELECT STREAM TUMBLE_END(rowtime, INTERVAL '1' HOUR) AS rowtime,
  productId,
  COUNT(*) AS c,
  SUM(units) AS units
FROM Orders
GROUP BY TUMBLE(rowtime, INTERVAL '1' HOUR), productId;

  rowtime | productId |       c | units
----------+-----------+---------+-------
 11:00:00 |        30 |       2 |    24
 11:00:00 |        10 |       1 |     1
 11:00:00 |        20 |       1 |     7
 12:00:00 |        10 |       3 |    11
 12:00:00 |        40 |       1 |    12
```

如您所见，它返回与上一个查询相同的结果。该`TUMBLE` 函数返回一个分组键，该分组键对于最终出现在给定汇总行中的所有行都相同；该`TUMBLE_END`函数采用相同的参数并返回该窗口结束的时间；还有一个`TUMBLE_START`功能。

`TUMBLE`有一个可选参数来对齐窗口。在以下示例中，我们使用 30 分钟间隔和 0:12 作为对齐时间，因此查询会在每小时过去 12 和 42 分钟发出摘要：

```
SELECT STREAM
  TUMBLE_END(rowtime, INTERVAL '30' MINUTE, TIME '0:12') AS rowtime,
  productId,
  COUNT(*) AS c,
  SUM(units) AS units
FROM Orders
GROUP BY TUMBLE(rowtime, INTERVAL '30' MINUTE, TIME '0:12'),
  productId;

  rowtime | productId |       c | units
----------+-----------+---------+-------
 10:42:00 |        30 |       2 |    24
 10:42:00 |        10 |       1 |     1
 10:42:00 |        20 |       1 |     7
 11:12:00 |        10 |       2 |     7
 11:12:00 |        40 |       1 |    12
 11:42:00 |        10 |       1 |     4
```

## 跳跃窗口

跳跃窗口是滚动窗口的概括，它允许数据在窗口中保留的时间长于发出间隔。

例如，以下查询发出时间戳为 11:00 的行，其中包含从 08:00 到 11:00 的数据（如果我们比较迂腐的话，则为 10:59.9），而时间戳为 12:00 的行包含从 09:00 到 11:00 的数据。 12:00。

```
SELECT STREAM
  HOP_END(rowtime, INTERVAL '1' HOUR, INTERVAL '3' HOUR) AS rowtime,
  COUNT(*) AS c,
  SUM(units) AS units
FROM Orders
GROUP BY HOP(rowtime, INTERVAL '1' HOUR, INTERVAL '3' HOUR);

  rowtime |        c | units
----------+----------+-------
 11:00:00 |        4 |    27
 12:00:00 |        8 |    50
```

在此查询中，由于保留期是发出期的 3 倍，因此每个输入行正好贡献 3 个输出行。想象一下，该`HOP`函数为传入行生成一组组键的集合，并将其值放入每个组键的累加器中。例如， `HOP(10:18:00, INTERVAL '1' HOUR, INTERVAL '3')`生成3个周期

```
[08:00, 09:00) [09:00, 10:00) [10:00, 11:00) 
```

这为那些对内置函数`HOP`和不满意的用户提供了允许用户定义分区函数的可能性`TUMBLE`。

我们可以构建复杂的复杂表达式，例如指数衰减的移动平均线：

```
SELECT STREAM HOP_END(rowtime),
  productId,
  SUM(unitPrice * EXP((rowtime - HOP_START(rowtime)) SECOND / INTERVAL '1' HOUR))
   / SUM(EXP((rowtime - HOP_START(rowtime)) SECOND / INTERVAL '1' HOUR))
FROM Orders
GROUP BY HOP(rowtime, INTERVAL '1' SECOND, INTERVAL '1' HOUR),
  productId
```

发出：

- 一行 at`11:00:00`包含行`[10:00:00, 11:00:00)`;
- 一行 at`11:00:01`包含 中的行`[10:00:01, 11:00:01)`。

该表达式对最近订单的权重比对旧订单的权重更大。将窗口从 1 小时延长到 2 小时或 1 年实际上对结果的准确性没有影响（但会使用更多的内存和计算）。

请注意，我们`HOP_START`在聚合函数 ( `SUM`) 内部使用，因为它是一个对于小计中所有行而言都是恒定的值。`SUM`对于典型的聚合函数（等`COUNT` ），这是不允许的。

如果您熟悉`GROUPING SETS`，您可能会注意到分区函数可以被视为 的泛化`GROUPING SETS`，因为它们允许输入行贡献多个小计。的辅助函数`GROUPING SETS`，例如`GROUPING()`和，可以在聚合函数内部使用，因此和可以以相同的方式使用`GROUP_ID`也就不足为奇了 。`HOP_START``HOP_END`

## 分组集

`GROUPING SETS`对于流式查询有效，前提是每个分组集都包含单调或准单调表达式。

`CUBE`和`ROLLUP`对于流查询无效，因为它们将生成至少一个聚合所有内容的分组集（如 `GROUP BY ()`）。

## 聚合后过滤

与在标准 SQL 中一样，您可以应用`HAVING`子句来过滤流发出的行`GROUP BY`：

```
SELECT STREAM TUMBLE_END(rowtime, INTERVAL '1' HOUR) AS rowtime,
  productId
FROM Orders
GROUP BY TUMBLE(rowtime, INTERVAL '1' HOUR), productId
HAVING COUNT(*) > 2 OR SUM(units) > 10;

  rowtime | productId
----------+-----------
 10:00:00 |        30
 11:00:00 |        10
 11:00:00 |        40
```

## 子查询、视图和 SQL 的闭包属性

前面的查询可以使用子查询上的子句`HAVING`来表示：`WHERE`

```
SELECT STREAM rowtime, productId
FROM (
  SELECT TUMBLE_END(rowtime, INTERVAL '1' HOUR) AS rowtime,
    productId,
    COUNT(*) AS c,
    SUM(units) AS su
  FROM Orders
  GROUP BY TUMBLE(rowtime, INTERVAL '1' HOUR), productId)
WHERE c > 2 OR su > 10;

  rowtime | productId
----------+-----------
 10:00:00 |        30
 11:00:00 |        10
 11:00:00 |        40
```

`HAVING`在 SQL 的早期引入，当时需要一种方法来在聚合*后*执行过滤。（回想一下，在行`WHERE`进入子句之前过滤行`GROUP BY`。）

从那时起，SQL 就成为一种数学封闭语言，这意味着您可以对表执行的任何操作也可以对查询执行。

*SQL的闭包特性*非常强大。它不仅使视图变得 `HAVING`过时（或者至少将其简化为语法糖），而且使视图成为可能：

```
CREATE VIEW HourlyOrderTotals (rowtime, productId, c, su) AS
  SELECT TUMBLE_END(rowtime, INTERVAL '1' HOUR),
    productId,
    COUNT(*),
    SUM(units)
  FROM Orders
  GROUP BY TUMBLE(rowtime, INTERVAL '1' HOUR), productId;

SELECT STREAM rowtime, productId
FROM HourlyOrderTotals
WHERE c > 2 OR su > 10;

  rowtime | productId
----------+-----------
 10:00:00 |        30
 11:00:00 |        10
 11:00:00 |        40
```

子句中的子查询`FROM`有时被称为“内联视图”，但实际上，它们比视图更基本。视图只是一种方便的方法，通过给片段命名并将它们存储在元数据存储库中，将 SQL 分割成可管理的块。

许多人发现嵌套查询和视图在流上比在关系上更有用。流式查询是连续运行的运算符的管道，并且这些管道通常会变得很长。嵌套查询和视图有助于表达和管理这些管道。

顺便说一句，子句`WITH`可以完成与子查询或视图相同的功能：

```
WITH HourlyOrderTotals (rowtime, productId, c, su) AS (
  SELECT TUMBLE_END(rowtime, INTERVAL '1' HOUR),
    productId,
    COUNT(*),
    SUM(units)
  FROM Orders
  GROUP BY TUMBLE(rowtime, INTERVAL '1' HOUR), productId)
SELECT STREAM rowtime, productId
FROM HourlyOrderTotals
WHERE c > 2 OR su > 10;

  rowtime | productId
----------+-----------
 10:00:00 |        30
 11:00:00 |        10
 11:00:00 |        40
```

## 流和关系之间的转换

回顾一下视图的定义`HourlyOrderTotals`。视图是流还是关系？

它不包含`STREAM`关键字，因此它是一个关系。然而，它是一种可以转换为流的关系。

您可以在关系查询和流查询中使用它：

```
# A relation; will query the historic Orders table.
# Returns the largest number of product #10 ever sold in one hour.
SELECT max(su)
FROM HourlyOrderTotals
WHERE productId = 10;

# A stream; will query the Orders stream.
# Returns every hour in which at least one product #10 was sold.
SELECT STREAM rowtime
FROM HourlyOrderTotals
WHERE productId = 10;
```

这种方法不限于视图和子查询。[按照 CQL [ 1](https://calcite.apache.org/docs/stream.html#ref1) ]中提出的方法，流式 SQL 中的每个查询都被定义为关系查询，并使用`STREAM`最顶层的关键字转换为流`SELECT`。

如果`STREAM`关键字出现在子查询或视图定义中，则它不起作用。

在查询准备时，Calcite 会确定查询中引用的关系是否可以转换为流或历史关系。

有时，流会提供其部分历史记录（例如 Apache Kafka [ [2](https://calcite.apache.org/docs/stream.html#ref2) ] 主题中最近 24 小时的数据），但不是全部。在运行时，Calcite 会确定是否有足够的历史记录来运行查询，如果没有，则给出错误。

## “饼图”问题：流上的关系查询

需要将流转换为关系的一种特殊情况发生在我所说的“饼图问题”中。想象一下，您需要编写一个带有图表的网页，如下所示，该图表总结了过去一小时内每种产品的订单数量。

![饼形图](https://calcite.apache.org/img/pie-chart.png)

但该`Orders`流只包含一些记录，而不是一个小时的摘要。我们需要对流的历史记录运行关系查询：

```
SELECT productId, count(*)
FROM Orders
WHERE rowtime BETWEEN current_timestamp - INTERVAL '1' HOUR
              AND current_timestamp;
```

如果流的历史记录`Orders`被假脱机到`Orders`表中，我们就可以回答查询，尽管成本很高。如果我们能够告诉系统将一小时的摘要具体化到一个表中，随着流的流动不断维护它，并自动重写查询以使用该表，那就更好了。

## 排序

的故事`ORDER BY`与 类似`GROUP BY`。语法看起来与常规 SQL 类似，但 Calcite 必须确保它能够及时提供结果。因此，它需要在键的前缘上有一个单调的表达`ORDER BY`。

```
SELECT STREAM CEIL(rowtime TO hour) AS rowtime, productId, orderId, units
FROM Orders
ORDER BY CEIL(rowtime TO hour) ASC, units DESC;

  rowtime | productId | orderId | units
----------+-----------+---------+-------
 10:00:00 |        30 |       8 |    20
 10:00:00 |        30 |       5 |     4
 10:00:00 |        20 |       7 |     2
 10:00:00 |        10 |       6 |     1
 11:00:00 |        40 |      11 |    12
 11:00:00 |        10 |       9 |     6
 11:00:00 |        10 |      12 |     4
 11:00:00 |        10 |      10 |     1
```

大多数查询将按照插入的顺序返回结果，因为引擎使用流算法，但您不应该依赖它。例如，考虑一下：

```
SELECT STREAM *
FROM Orders
WHERE productId = 10
UNION ALL
SELECT STREAM *
FROM Orders
WHERE productId = 30;

  rowtime | productId | orderId | units
----------+-----------+---------+-------
 10:17:05 |        10 |       6 |     1
 10:17:00 |        30 |       5 |     4
 10:18:07 |        30 |       8 |    20
 11:02:00 |        10 |       9 |     6
 11:04:00 |        10 |      10 |     1
 11:24:11 |        10 |      12 |     4
```

= 30的行`productId`显然是无序的，可能是因为`Orders`流被分区`productId`并且分区流在不同时间发送数据。

如果您需要特定的顺序，请添加显式的`ORDER BY`：

```
SELECT STREAM *
FROM Orders
WHERE productId = 10
UNION ALL
SELECT STREAM *
FROM Orders
WHERE productId = 30
ORDER BY rowtime;

  rowtime | productId | orderId | units
----------+-----------+---------+-------
 10:17:00 |        30 |       5 |     4
 10:17:05 |        10 |       6 |     1
 10:18:07 |        30 |       8 |    20
 11:02:00 |        10 |       9 |     6
 11:04:00 |        10 |      10 |     1
 11:24:11 |        10 |      12 |     4
```

Calcite 可能会`UNION ALL`通过合并使用来实现`rowtime`，这只是效率稍低一些。

您只需将 an 添加`ORDER BY`到最外面的查询即可。如果您需要`GROUP BY`在 a 之后执行`UNION ALL`，Calcite 将`ORDER BY` 隐式添加一个，以使 GROUP BY 算法成为可能。

## 表构造函数

该`VALUES`子句创建一个包含给定行集的内联表。

不允许流式传输。行集永远不会改变，因此流永远不会返回任何行。

```
> SELECT STREAM * FROM (VALUES (1, 'abc'));

ERROR: Cannot stream VALUES
```

## 推拉窗

标准 SQL 具有可在子句中使用的所谓“分析函数” `SELECT`。与 不同的是`GROUP BY`，这些记录不会崩溃。每输入一条记录，就会输出一条记录。但聚合函数是基于多行的窗口。

让我们看一个例子。

```
SELECT STREAM rowtime,
  productId,
  units,
  SUM(units) OVER (ORDER BY rowtime RANGE INTERVAL '1' HOUR PRECEDING) unitsLastHour
FROM Orders;
```

该功能毫不费力即可提供强大的功能。`SELECT`根据多个窗口规范，您可以在子句中包含多个函数。

以下示例返回过去 10 分钟平均订单大小大于上周平均订单大小的订单。

```
SELECT STREAM *
FROM (
  SELECT STREAM rowtime,
    productId,
    units,
    AVG(units) OVER product (RANGE INTERVAL '10' MINUTE PRECEDING) AS m10,
    AVG(units) OVER product (RANGE INTERVAL '7' DAY PRECEDING) AS d7
  FROM Orders
  WINDOW product AS (
    ORDER BY rowtime
    PARTITION BY productId))
WHERE m10 > d7;
```

为了简洁起见，这里我们使用这样的语法：使用子句部分定义窗口`WINDOW`，然后在每个子句中细化窗口`OVER`。如果您愿意，您还可以定义`WINDOW`子句中的所有窗口，或内联的所有窗口。

但真正的力量超越了语法。在幕后，该查询维护两个表，并使用 FIFO 队列在小计中添加和删除值。但是您可以访问这些表，而无需在查询中引入联接。

窗口聚合语法的一些其他功能：

- 您可以根据行数定义窗口。
- 该窗口可以引用尚未到达的行。（流将等待，直到他们到达）。
- 您可以计算与顺序相关的函数，例如`RANK`和 中位数。

## 层叠窗口

如果我们想要一个为每条记录返回结果的查询（如滑动窗口），但在固定时间段重置总计（如滚动窗口），该怎么办？这种模式称为*层叠窗口*。这是一个例子：

```
SELECT STREAM rowtime,
  productId,
  units,
  SUM(units) OVER (PARTITION BY FLOOR(rowtime TO HOUR)) AS unitsSinceTopOfHour
FROM Orders;
```

它看起来类似于滑动窗口查询，但单调表达式出现在`PARTITION BY`窗口的子句内。随着行时间从 10:59:59 移动到 11:00:00， `FLOOR(rowtime TO HOUR)`从 10:00:00 变为 11:00:00，因此开始一个新分区。在新的小时到达的第一行将开始新的总计；第二行的总计由两行组成，依此类推。

Calcite 知道旧分区将永远不会再次使用，因此会从其内部存储中删除该分区的所有小计。

使用级联和滑动窗口的分析函数可以组合在同一个查询中。

## 将流连接到表

涉及流的连接有两种：流到表连接和流到流连接。

如果表的内容没有改变，那么流到表的连接就很简单。此查询通过每种产品的标价丰富了订单流：

```
SELECT STREAM o.rowtime, o.productId, o.orderId, o.units,
  p.name, p.unitPrice
FROM Orders AS o
JOIN Products AS p
  ON o.productId = p.productId;

  rowtime | productId | orderId | units | name   | unitPrice
----------+-----------+---------+-------+ -------+-----------
 10:17:00 |        30 |       5 |     4 | Cheese |        17
 10:17:05 |        10 |       6 |     1 | Beer   |      0.25
 10:18:05 |        20 |       7 |     2 | Wine   |         6
 10:18:07 |        30 |       8 |    20 | Cheese |        17
 11:02:00 |        10 |       9 |     6 | Beer   |      0.25
 11:04:00 |        10 |      10 |     1 | Beer   |      0.25
 11:09:30 |        40 |      11 |    12 | Bread  |       100
 11:24:11 |        10 |      12 |     4 | Beer   |      0.25
```

如果表发生变化会发生什么？例如，假设产品 10 的单价在 11:00 增加到 0.35。11:00之前下的订单应采用旧价格，11:00之后下的订单应采用新价格。

实现此目的的一种方法是使用一个表来保存每个版本的开始和结束有效日期，`ProductVersions`如下例所示：

```
SELECT STREAM *
FROM Orders AS o
JOIN ProductVersions AS p
  ON o.productId = p.productId
  AND o.rowtime BETWEEN p.startDate AND p.endDate

  rowtime | productId | orderId | units | productId1 |   name | unitPrice
----------+-----------+---------+-------+ -----------+--------+-----------
 10:17:00 |        30 |       5 |     4 |         30 | Cheese |        17
 10:17:05 |        10 |       6 |     1 |         10 | Beer   |      0.25
 10:18:05 |        20 |       7 |     2 |         20 | Wine   |         6
 10:18:07 |        30 |       8 |    20 |         30 | Cheese |        17
 11:02:00 |        10 |       9 |     6 |         10 | Beer   |      0.35
 11:04:00 |        10 |      10 |     1 |         10 | Beer   |      0.35
 11:09:30 |        40 |      11 |    12 |         40 | Bread  |       100
 11:24:11 |        10 |      12 |     4 |         10 | Beer   |      0.35
```

实现此目的的另一种方法是使用具有时间支持的数据库（能够查找过去任何时刻的数据库内容），并且系统需要知道流的列`rowtime`对应`Orders`于表的事务时间戳 `Products`。

对于许多应用程序来说，不值得花费时间支持或版本化表的成本和精力。应用程序可以接受查询在重播时给出不同的结果：在此示例中，在重播时，产品 10 的所有订单都被分配了较晚的单价 0.35。

## 将流加入流

如果连接条件以某种方式迫使两个流彼此保持有限距离，则连接两个流是有意义的。在以下查询中，发货日期在订单日期的一小时内：

```
SELECT STREAM o.rowtime, o.productId, o.orderId, s.rowtime AS shipTime
FROM Orders AS o
JOIN Shipments AS s
  ON o.orderId = s.orderId
  AND s.rowtime BETWEEN o.rowtime AND o.rowtime + INTERVAL '1' HOUR;

  rowtime | productId | orderId | shipTime
----------+-----------+---------+----------
 10:17:00 |        30 |       5 | 10:55:00
 10:17:05 |        10 |       6 | 10:20:00
 11:02:00 |        10 |       9 | 11:58:00
 11:24:11 |        10 |      12 | 11:44:00
```

请注意，相当多的订单没有出现，因为它们在一小时内没有发货。当系统收到时间戳为 11:24:11 的订单 10 时，它已经从哈希表中删除了时间戳为 10:18:07 的订单 8（含）之前的订单。

正如您所看到的，将两个流的单调或准单调列连接在一起的“锁定步骤”对于系统取得进展是必要的。如果它不能推断出锁定步骤，它将拒绝执行查询。

## 数据管理语言

不仅查询对流有意义，而且查询也对流有意义。对流运行 DML 语句（ `INSERT`、`UPDATE`、`DELETE`以及它们的罕见表亲`UPSERT`和）也是有意义的。`REPLACE`

DML 很有用，因为它允许您具体化流或基于流的表，因此在经常使用值时可以节省精力。

考虑流应用程序通常如何由查询管道组成，每个查询将输入流转换为输出流。管道的组件可以是视图：

```
CREATE VIEW LargeOrders AS
SELECT STREAM * FROM Orders WHERE units > 1000;
```

或常设`INSERT`声明：

```
INSERT INTO LargeOrders
SELECT STREAM * FROM Orders WHERE units > 1000;
```

它们看起来很相似，并且在这两种情况下，管道中的下一步都可以读取，`LargeOrders`而不必担心它是如何填充的。效率上有区别：`INSERT`无论有多少消费者，语句都做同样的工作；该视图的工作与消费者的数量成正比，特别是如果没有消费者，则该视图不起作用。

其他形式的 DML 对流也有意义。例如，以下常设`UPSERT`语句维护一个表，该表具体化了最后一小时订单的摘要：

```
UPSERT INTO OrdersSummary
SELECT STREAM productId,
  COUNT(*) OVER lastHour AS c
FROM Orders
WINDOW lastHour AS (
  PARTITION BY productId
  ORDER BY rowtime
  RANGE INTERVAL '1' HOUR PRECEDING)
```

## 标点

即使单调键中没有足够的值来推出结果，标点符号[ [5 \]也允许流查询取得进展。](https://calcite.apache.org/docs/stream.html#ref5)

（我更喜欢术语“行时间边界”，并且水印[ [6](https://calcite.apache.org/docs/stream.html#ref6) ]是一个相关概念，但出于这些目的，标点符号就足够了。）

如果流启用了标点符号，则它可能无法排序，但仍然可以排序。因此，出于语义目的，按照排序流进行工作就足够了。

顺便说一句，如果无序流是*t 排序* （即每个记录保证在其时间戳的*t*秒内到达）或*k 排序*（即每个记录保证不超过*k 个*位置乱序）。因此，对这些流的查询可以与对带有标点符号的流的查询类似地进行规划。

而且，我们经常希望聚合不基于时间但仍然单调的属性。“一支球队在获胜状态和失败状态之间转换的次数”就是这样一个单调属性。系统需要自己弄清楚聚合这样的属性是安全的；标点符号不添加任何额外信息。

我想到了规划者的一些元数据（成本指标）：

1. 该流是否根据给定的属性（或多个属性）排序？
2. 是否可以根据给定属性对流进行排序？（对于有限关系，答案始终是“是”；对于流，它取决于标点符号的存在或属性和排序键之间的链接。）
3. 为了执行这种排序，我们需要引入什么延迟？
4. 执行该排序的成本是多少（CPU、内存等）？

[我们在BuiltInMetadata.Collation](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/BuiltInMetadata.Collation.html)中已经有了(1) 。对于 (2)，对于有限关系，答案始终为“真”。但我们需要为流实现 (2)、(3) 和 (4)。

## 流的状态

并非本文中的所有概念都已在 Calcite 中实现。其他的可以在 Calcite 中实现，但不能在特定的适配器中实现，例如 SamzaSQL [ [3](https://calcite.apache.org/docs/stream.html#ref3) ][ [4](https://calcite.apache.org/docs/stream.html#ref4) ]。

### 已实现

- 流媒体`SELECT`,,,,,, `WHERE`_ `GROUP BY`_ `HAVING`_`UNION ALL``ORDER BY`
- `FLOOR`和`CEIL`功能
- 单调性
- `VALUES`不允许串流

### 未实现

本文档中提供了以下功能，就好像方解石支持它们一样，但实际上它（尚未）不支持。完全支持意味着参考实现支持该功能（包括负面情况）并且 TCK 对其进行了测试。

- 流到流`JOIN`
- 流到表`JOIN`
- 流媒体观看
- 流式传输（`UNION ALL`合并`ORDER BY`）
- 流上的关系查询
- 流式窗口聚合（滑动和级联窗口）
- 检查子`STREAM`查询和视图中是否被忽略
- 检查流媒体`ORDER BY`不能有`OFFSET`或`LIMIT`
- 历史有限；在运行时，检查是否有足够的历史记录来运行查询。
- [准单调性](https://issues.apache.org/jira/browse/CALCITE-1096)
- `HOP`和`TUMBLE`（以及辅助`HOP_START`, `HOP_END`, `TUMBLE_START`, `TUMBLE_END`）功能

### 本文档中要做的事情

- 重新访问是否可以直播`VALUES`
- `OVER`定义流窗口的子句
- 考虑是否允许在流式查询中使用`CUBE`和`ROLLUP`，并理解某些级别的聚合永远不会完成（因为它们没有单调表达式），因此永远不会被发出。
- 修复`UPSERT`示例以删除过去一小时内未发生的产品的记录。
- 输出到多个流的DML；也许是标准声明的扩展 `REPLACE`。

## 功能

以下函数不存在于标准 SQL 中，但在流 SQL 中定义。

标量函数：

- `FLOOR(dateTime TO intervalType)`将日期、时间或时间戳值向下舍入为给定的间隔类型
- `CEIL(dateTime TO intervalType)`将日期、时间或时间戳值向上舍入为给定的间隔类型

分区函数：

- `HOP(t, emit, retain)`返回作为跳跃窗口一部分的行的组键的集合
- `HOP(t, emit, retain, align)`返回作为具有给定对齐方式的跳跃窗口一部分的行的组键的集合
- `TUMBLE(t, emit)`返回作为滚动窗口一部分的行的组键
- `TUMBLE(t, emit, align)`返回作为具有给定对齐方式的翻滚窗口一部分的行的组键

`TUMBLE(t, e)`相当于`TUMBLE(t, e, TIME '00:00:00')`.

`TUMBLE(t, e, a)`相当于`HOP(t, e, e, a)`.

`HOP(t, e, r)`相当于`HOP(t, e, r, TIME '00:00:00')`.

## 参考

- [ 1 ] [Arvind Arasu、Shivnath Babu 和 Jennifer Widom (2003) CQL 连续查询语言：语义基础和查询执行](https://ilpubs.stanford.edu:8090/758/)。
- [ 2 ] [阿帕奇卡夫卡](https://kafka.apache.org/documentation.html)。
- [ 3 ][阿帕奇·萨姆扎](https://samza.apache.org/)。
- [ 4 ] [SamzaSQL](https://github.com/milinda/samza-sql)。
- [ 5 ] [Peter A. Tucker、David Maier、Tim Sheard 和 Leonidas Fegaras (2003) 在连续数据流中利用标点符号语义](https://www.whitworth.edu/academic/department/mathcomputerscience/faculty/tuckerpeter/pdf/117896_final.pdf)。
- [ 6 ] [Tyler Akidau、Alex Balikov、Kaya Bekiroglu、Slava Chernyak、Josh Haberman、Reuven Lax、Sam McVeety、Daniel Mills、Paul Nordstrom 和 Sam Whittle (2013) MillWheel：互联网规模的容错流处理](https://research.google.com/pubs/pub41378.html)。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。
{% note color:green 目前星球刚创建，内部积累的资料还很有限，因此暂时不收费，感兴趣的同学可以联系我，免费邀请进入星球。 %}

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

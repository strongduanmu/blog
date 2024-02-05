---
layout: wiki
wiki: calcite
order: 101
title: 空间
date: 2023-10-24 09:00:00
---

> 原文链接：https://calcite.apache.org/docs/spatial.html

Calcite 的[目标](https://issues.apache.org/jira/browse/CALCITE-1968)是实现 《OpenGIS 简单功能实现规范 [1.2.1 版](https://www.opengeospatial.org/standards/sfs)》中的 SQL，这个规范是由 [PostGIS](https://postgis.net/) 和 [H2GIS](https://www.h2gis.org/) 等空间数据库实现的标准。

我们还旨在添加对[空间索引](https://issues.apache.org/jira/browse/CALCITE-1861)和其他形式的查询优化的优化器支持。

## 介绍

空间数据库是针对表示几何空间中定义的对象的数据，进行存储和查询优化的数据库。

Calcite 对空间数据的支持包括：

- [GEOMETRY](https://calcite.apache.org/docs/reference.html#data-types) 数据类型和[子类型](https://calcite.apache.org/docs/reference.html#spatial-types)，包括 `POINT`，`LINESTRING` 和 `POLYGON`；
- [空间函数](https://calcite.apache.org/docs/reference.html#spatial-functions)（以 `ST_` 作为前缀。我们已经实现了 OpenGIS 规范中 150 个中的大约 35 个）。

并且在某些时候还包括了查询重写以使用空间索引。

## 启用空间支持

虽然 `GEOMETRY` 数据类型是内置的，但默认情况下不启用这些功能。你需要在 JDBC 连接字符串中添加 `fun=spatial` 才能启用这些功能。例如，`sqlline`：

```sql
$ ./sqlline
> !connect jdbc:calcite:fun=spatial "sa" ""
SELECT ST_PointFromText('POINT(-71.064544 42.28787)');
+-------------------------------+
| EXPR$0                        |
+-------------------------------+
| {"x":-71.064544,"y":42.28787} |
+-------------------------------+
1 row selected (0.323 seconds)
```

## 查询重写

一种重写类使用了[希尔伯特空间填充曲线](https://en.wikipedia.org/wiki/Hilbert_curve)。假设表格具有表示点位置的列 `x` 和 `y`，以及表示该点沿曲线距离的列 `h` 。然后，涉及到固定点 `(x, y)` 距离的谓词可以被转换为涉及 h 的范围谓词。

假设我们有一张包含餐馆位置的表：

```sql
CREATE TABLE Restaurants (
  INT id NOT NULL PRIMARY KEY,
  VARCHAR(30) name,
  VARCHAR(20) cuisine,
  INT x NOT NULL,
  INT y NOT NULL,
  INT h  NOT NULL DERIVED (ST_Hilbert(x, y)))
SORT KEY (h);
```

优化器要求 `h` 是点 `(x, y)` 在希尔伯特曲线上的位置，并且还要求表按 `h` 排序。 DDL 语法中的 `DERIVED` 和 `SORT KEY` 子句是为了本示例的目的而新增的，但具有 `CHECK` 约束的聚簇表同样可以正常工作。

这个查询

```sql
SELECT *
FROM Restaurants
WHERE ST_DWithin(ST_Point(x, y), ST_Point(10.0, 20.0), 6)
```

可以被重写为

```sql
SELECT *
FROM Restaurants
WHERE (h BETWEEN 36496 AND 36520
    OR h BETWEEN 36456 AND 36464
    OR h BETWEEN 33252 AND 33254
    OR h BETWEEN 33236 AND 33244
    OR h BETWEEN 33164 AND 33176
    OR h BETWEEN 33092 AND 33100
    OR h BETWEEN 33055 AND 33080
    OR h BETWEEN 33050 AND 33053
    OR h BETWEEN 33033 AND 33035)
AND ST_DWithin(ST_Point(x, y), ST_Point(10.0, 20.0), 6)
```

重写的查询包含 `h` 上的范围集合，后面跟上原始的 `ST_DWithin` 谓词。范围谓词会被首先评估，并且它的速度非常快，因为表是按 `h` 排序的。

这是完整的转换集：

| 描述                                                         | 表达                                                         |
| :----------------------------------------------------------- | ------------------------------------------------------------ |
| 测试恒定矩形（X，X2，Y，Y2）是否包含点（a，b）。<br/><br/>重写以使用希尔伯特指数。 | ST_Contains(ST_Rectangle(X, X2, Y, Y2), ST_Point(a, b)))<br/><br/>h BETWEEN C1 AND C2<br/>OR …<br/>OR h BETWEEN $C_{2k}$ AND $C_{2k+1}$ |
| 测试常量几何图形 G 是否包含点 (a, b)。<br/><br/>重写为使用常量几何形状的边界框，该边界框也是常量，然后重写为希尔伯特范围，如上所述。 | ST_Contains(ST_Envelope(G), ST_Point(a, b))<br/><br/>ST_Contains(ST_Rectangle(X, X2, Y, Y2), ST_Point(a, b))) |
| 测试点 (a, b) 是否位于常量点 (X, Y) 周围的缓冲区内。<br/><br/>前面的特例，因为缓冲区是一个常量几何形状。 | ST_Contains(ST_Buffer(ST_Point(a, b), D), ST_Point(X, Y))    |
| 测试点（a，b）是否在恒定点（X，Y）的恒定距离 D 内。<br/><br/>首先，转换为缓冲区，然后使用之前的重写来获取常量几何形状。 | ST_DWithin(ST_Point(a, b), ST_Point(X, Y), D))<br/><br/>ST_Contains(ST_Buffer(ST_Point(X, Y), D), ST_Point(a, b)) |
| 测试恒定点（X，Y）是否在点（a，b）的恒定距离 D 内。<br/><br/>反转调用 `ST_DWithin` 的参数，然后使用之前的重写。 | ST_DWithin(ST_Point(X, Y), ST_Point(a, b), D))<br/><br/>T_Contains(ST_Buffer(ST_Point(X, Y), D), ST_Point(a, b)) |

上面的 `a` 和 `b` 是变量， `X` 、 `X2` 、 `Y` 、 `Y2` 和 `G` 是常量。

许多重写是不精确的：在某些点上谓词会返回 false，但重写的谓词会返回 true。例如，重写可能会将点是否在圆中的测试转换为该点是否在圆的边界正方形中的测试。这些重写值得执行，因为它们应用起来要快得多，并且通常允许对希尔伯特索引进行范围扫描。但为了安全起见，方解石应用原始谓词来消除误报。

## 致谢

Calcite 的 OpenGIS 实现使用了 [JTS 拓扑套件](https://github.com/locationtech/jts)。感谢从 JTS 社区获得的帮助。

在开发此功能时，我们广泛使用了 PostGIS 文档和测试以及 H2GIS 文档，并在规范不清楚时将两者作为参考实现进行查阅。感谢这些很棒的项目。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

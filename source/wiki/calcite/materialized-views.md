---
layout: wiki
wiki: calcite
order: 103
title: 物化视图
date: 2026-01-22 08:00:00
banner: /assets/banner/banner_12.jpg
---

> 原文链接：https://calcite.apache.org/docs/materialized_views.html

有几种不同的方法可以利用 Calcite 中的物化视图。

## 由 Calcite 维护的物化视图

有关详细信息，请参考 [Lattice 格](https://strongduanmu.com/wiki/calcite/lattice.html)。

## 将物化视图暴露给 Calcite

一些 Calcite 适配器以及依赖 Calcite 的项目都有自己的物化视图概念。

例如，Apache Cassandra 允许用户基于自动维护的现有表定义物化视图。 Cassandra 适配器自动将这些物化视图公开给 Calcite。

另一个例子是 Apache Hive。当在Hive中创建物化视图时，用户可以指定该视图是否可以用于查询优化。如果用户选择这样做，物化视图将注册到 Calcite。

通过在 Calcite 中注册物化视图，优化器有机会自动重写查询以使用这些视图。

### 基于视图的查询重写

基于视图的查询重写，可以获取预先存在的视图来返回给输入的查询，并重写查询以利用该视图。目前，Calcite 有两种基于视图的查询重写实现。

#### 通过规则转换进行替换

第一种方法基于视图替换。 `SubstitutionVisitor` 及其扩展的 `MaterializedViewSubstitutionVisitor`，会使用物化视图的等效表达式替换部分关系代数树。对物化视图的扫描和物化视图的定义都注册在优化器中，然后，优化器会尝试统一计划中被触发表达式的转换规则。表达式不需要等效于被替换的部分，如果需要，访问者可以在表达式之上添加剩余谓词。

以下示例取自 `SubstitutionVisitor` 的文档：

- 查询：`SELECT a, c FROM t WHERE x = 5 AND b = 4`；
- 目标（物化视图定义）：`SELECT a, b, c FROM t WHERE x = 5`；
- 结果：`SELECT a, c FROM mv WHERE b = 4`。

请注意， `result` 使用物化视图表 `mv` 和简化条件 `b = 4` 。

虽然这种方法可以完成大量重写，但它有一些局限性。由于该规则依赖于转换规则来创建查询中的表达式与物化视图之间的等价性，因此它可能需要详尽地枚举给定表达式的所有可能的等价重写，以找到物化视图替换。然而，在存在复杂视图（例如具有任意数量的连接运算符的视图）的情况下，这是不可扩展的。

#### 使用计划结构信息重写

反过来，又提出了一种替代规则，尝试通过提取有关要替换的表达式的一些结构信息来将查询与视图进行匹配。

`MaterializedViewRule` 建立在 `GL01`[^1] 中提出的想法之上，并引入了一些额外的扩展。该规则可以重写包含任意连接、过滤和投影运算符的表达式。此外，该规则可以重写以聚合运算符为根的表达式，并在必要时向上滚动聚合。反过来，如果可以从视图部分返回查询，它还可以使用 Union 运算符生成重写。

为了产生大量重写，该规则依赖于作为在数据库表上定义的约束而公开的信息，例如：**外键、主键、唯一键或非空**。

##### 重写覆盖范围

让我们用一些例子来说明 `MaterializedViewRule` 中实现的视图重写算法的覆盖范围。这些示例基于以下数据库模式。

```sql
CREATE TABLE depts(
  deptno INT NOT NULL,
  deptname VARCHAR(20),
  PRIMARY KEY (deptno)
);
CREATE TABLE locations(
  locationid INT NOT NULL,
  state CHAR(2),
  PRIMARY KEY (locationid)
);
CREATE TABLE emps(
  empid INT NOT NULL,
  deptno INT NOT NULL,
  locationid INT NOT NULL,
  empname VARCHAR(20) NOT NULL,
  salary DECIMAL (18, 2),
  PRIMARY KEY (empid),
  FOREIGN KEY (deptno) REFERENCES depts(deptno),
  FOREIGN KEY (locationid) REFERENCES locations(locationid)
);
```

##### 范围一：Join 重写

重写可以处理查询和视图定义中的不同连接顺序。此外，该规则尝试检测何时可以使用补偿谓词来使用视图来生成重写。

- 查询：

```sql
SELECT empid
FROM depts
JOIN (
  SELECT empid, deptno
  FROM emps
  WHERE empid = 1) AS subq
ON depts.deptno = subq.deptno
```

- 物化视图定义：

```sql
SELECT empid
FROM emps
JOIN depts USING (deptno)
```

- 重写：

```sql
SELECT empid
FROM mv
WHERE empid = 1
```

##### 范围二：聚合重写

- 查询：

```sql
SELECT deptno
FROM emps
WHERE deptno > 10
GROUP BY deptno
```

- 物化视图定义：

```sql
SELECT empid, deptno
FROM emps
WHERE deptno > 5
GROUP BY empid, deptno
```

- 重写：

```sql
SELECT deptno
FROM mv
WHERE deptno > 10
GROUP BY deptno
```

##### 范围三：聚合重写（使用聚合汇总）

- 查询：

```sql
SELECT deptno, COUNT(*) AS c, SUM(salary) AS s
FROM emps
GROUP BY deptno
```

- 物化视图定义：

```sql
SELECT empid, deptno, COUNT(*) AS c, SUM(salary) AS s
FROM emps
GROUP BY empid, deptno
```

- 重写：

```sql
SELECT deptno, SUM(c), SUM(s)
FROM mv
GROUP BY deptno
```

##### 范围四：查询部分重写

通过声明的约束，该规则可以检测仅附加列而不改变元组重数的连接，并产生正确的重写。

- 查询：

```sql
SELECT deptno, COUNT(*)
FROM emps
GROUP BY deptno
```

- 物化视图定义：

```sql
SELECT empid, depts.deptno, COUNT(*) AS c, SUM(salary) AS s
FROM emps
JOIN depts USING (deptno)
GROUP BY empid, depts.deptno
```

- 重写：

```sql
SELECT deptno, SUM(c)
FROM mv
GROUP BY deptno
```

##### 范围五：视图部分重写

- 查询：

```sql
SELECT deptname, state, SUM(salary) AS s
FROM emps
JOIN depts ON emps.deptno = depts.deptno
JOIN locations ON emps.locationid = locations.locationid
GROUP BY deptname, state
```

- 物化视图定义：

```sql
SELECT empid, deptno, state, SUM(salary) AS s
FROM emps
JOIN locations ON emps.locationid = locations.locationid
GROUP BY empid, deptno, state
```

- 重写：

```sql
SELECT deptname, state, SUM(s)
FROM mv
JOIN depts ON mv.deptno = depts.deptno
GROUP BY deptname, state
```

##### 范围六：联合 Union 重写

- 查询：

```sql
SELECT empid, deptname
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 10000
```

- 物化视图定义：

```sql
SELECT empid, deptname
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 12000
```

- 重写：

```sql
SELECT empid, deptname
FROM mv
UNION ALL
SELECT empid, deptname
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 10000 AND salary <= 12000
```

##### 范围七：使用聚合进行联合 Union 重写

- 查询：

```sql
SELECT empid, deptname, SUM(salary) AS s
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 10000
GROUP BY empid, deptname
```

- 物化视图定义：

```sql
SELECT empid, deptname, SUM(salary) AS s
FROM emps
JOIN depts ON emps.deptno = depts.deptno
WHERE salary > 12000
GROUP BY empid, deptname
```

- 重写：

```sql
SELECT empid, deptname, SUM(s)
FROM (
  SELECT empid, deptname, s
  FROM mv
  UNION ALL
  SELECT empid, deptname, SUM(salary) AS s
  FROM emps
  JOIN depts ON emps.deptno = depts.deptno
  WHERE salary > 10000 AND salary <= 12000
  GROUP BY empid, deptname) AS subq
GROUP BY empid, deptname
```

##### 使用限制

使用计划结构信息重写仍然存在一些使用限制。特别是，重写规则尝试将所有视图与每个查询进行匹配。我们计划实施更精细的过滤技术，例如 GL01[^1] 中描述的技术。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)





{% GoogleAdsense %}

## 参考文档

[^1]: [GL01] Jonathan Goldstein and Per-åke Larson. [Optimizing queries using materialized views: A practical, scalable solution](https://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.95.113). In *Proc. ACM SIGMOD Conf.*, 2001.

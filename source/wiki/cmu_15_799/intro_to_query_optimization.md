---
layout: wiki
wiki: cmu_15_799
order: 002
title: 查询优化简介
date: 2025-02-07 08:00:00
banner: /assets/banner/banner_2.jpg
---

## 课程目标

`15-799` 课程主要介绍数据库查询优化器的**现代实践**，以及查询优化器相关的**系统编程**。通过课程的学习，可以掌握如下 3 部分内容：

1. 查询优化器实现；
2. 编写正确且高效的代码；
3. 适当的文档 + 测试；

当前数据库的需求非常大，每个公司都会遇到数据库相关的问题，而**查询优化器是区分不同数据库能力的关键点**，因此学习查询优化器非常有价值，能够帮助大家更好地理解数据库并解决问题。

本课程包含了如下 2 个实战项目，项目 1 需要独立完成，项目 2 则需要团队合作：

* [Project #1 - Query Optimizer Evaluation](https://15799.courses.cs.cmu.edu/spring2025/project1.html)：动手体验流行的查询优化器，项目中你将使用 Apache Calcite 来优化 SQL 查询，然后在 Calcite（通过枚举适配器）和 DuckDB 上执行 SQL 查询；
* Project #2 - 根据示例项目，选择一个能够团队参与的项目（待定）。

## 查询优化

SQL 是一种声明性的查询语句，用户通常只需要通过 SQL 语句（如下展示），告诉数据库管理系统（`DBMS`）查询哪些数据，而不需要告诉它如何完成这些任务。

```sql
SELECT DISTINCT ename
FROM Emp E
	JOIN Dept D ON E.did = D.did
WHERE D.dname = 'Toy'
```

对于一个给定的查询，DBMS 会尝试找到一个正确并且高效的执行计划，这也是**本门课程的目标，即：正确（correct）、高效（best cost）地执行 SQL**。

### 诞生的背景

正确执行 SQL 是一个基本前提，满足了这个基本前提后，我们会更加关注 SQL 执行的效率。因此，我们需要通过代价（cost）这样的指标，来表示 SQL 执行计划的效率，从而可以对不同执行计划进行比较。

那么，**查询优化和现实世界有什么样的联系呢**？假设我们有 2 张表，分别是员工表（`Emp`）和部门表（`Dept`），我们使用如下的 SQL 语句，尝试从 `Toy` 部门查找到该部门下所有员工的不同名字。

```sql
SELECT DISTINCT ename
FROM Emp E
	JOIN Dept D ON E.did = D.did
WHERE D.dname = 'Toy'
```

为了能够有效地执行这条 SQL，我们会在 `Catalog` 中记录列索引，包括：聚簇索引（`Clustered Index`）和非聚簇索引（`Unclustered Index`），以及表的记录数和页数。除了这些信息，`Catalog` 中还会记录额外的元数据，或者表中内容的摘要，这些信息会用来确定基数估计（`Cardinality Estimation`）、谓词选择性（`Predicate Selectivity`）。

![按字面意思将 SQL 翻译为执行计划](/wiki/cmu_15_799/intro_to_query_optimization/translate-sql-to-query-plan-according-to-literal.png)

按照 SQL 字面意思，我们将 SQL 语句翻译为上图所示的执行计划，最底部我们对 `Emp` 和 `Dept` 进行扫描，然后对他们进行笛卡尔积运算。从图中可以看到，笛卡尔积运算需要进行大量的读写 IO 操作，并且后续的选择操作（包括：`Emp.did = Dept.did` 连接条件、`dname = 'Toy'` 过滤条件 ）需要重新读回全部写入数据。过滤操作完成后，我们会对最终的查询结果进行投影，得到我们需要的员工名字。

因此，如果我们直接将 SQL 按照字面意思翻译为执行计划，那么整个执行过程大约需要 200 万次 IO 操作，这个查询成本显然是非常高的。那么，**我们可以让这条 SQL 执行地更高效吗**？为了实现这个目标，首先可以假设 `I/Os` 是成本指标中的一项，我们可以根据 `I/Os` 大小，来简单确定某个执行计划是否是最优的，降低 `I/Os` 可以直接提升 SQL 执行效率。

前文生成的执行计划采用的是笛卡尔积 Join，这会产生大量的 `I/Os` 操作，为了减少 `I/Os` 成本，可以将关联条件 `E.did = D.did` 下推到 Join 中，这样就可以使用其他更高效的 Join 运算符，例如：`Page Nested-Loop Join`，下图展示了 `Page Nested-Loop Join` 的执行计划，由于提前过滤 Join 关联条件，整个执行计划只需要 5 万 4 千次 `I/Os`。

![将关联条件下推到 Join 运算符内部](/wiki/cmu_15_799/intro_to_query_optimization/push-join-condition-to-join-operator.png)

**优化器的职责就是识别出哪些执行计划效率低，并将这些低效率的执行计划优化为语义等价且高效的执行计划**。优化器可能会进行更进一步地优化，例如：使用 `Sort Merge Join` 来替换 `Page Nested-Loop Join`，这种操作本质上改变了 Join 运算符的物理运算符。

除了 Join 运算符层面的优化，优化器还可以对查询执行模型进行优化，例如我们使用物化模型（`Materialization Model`）进行查询，每个运算符都需要执行完所有操作，并将数据写入到临时文件中，然后再从临时文件中读取出来，这种执行模型没有采用流水线执行方式（`No Pipelining`）。我们可以尝试将执行模型切换为向量化执行模型（`Vectorization Model`），它可以充分利用流水线的优势，无需完成运算符的所有数据计算，只需要向上传递一个元组向量，整体的 `I/Os` 可以下降一半。

![向量化执行模型](/wiki/cmu_15_799/intro_to_query_optimization/vectorization-model.png)

前面我们讨论的主要是如何对 Join 运算符进行优化，除了 Join 优化外，还可以将谓词下推到 Join 运算符之下，从而大幅度减少 `I/Os`。`dname = 'Toy'` 是 `Dept` 表的谓词，如果在 Join 之后做谓词过滤，则会导致 Join 的计算量特别大，因此优化器会将谓词下推到 Join 运算符之下，这样优化后的 `I/Os` 可以降低到 37。

![谓词下推](/wiki/cmu_15_799/intro_to_query_optimization/push-down-filter.png)

经过这些优化，我们可以看出优化器的重要价值，从最开始的 200 万次 `I/Os`，一直减少到 37 次 `I/Os`，SQL 执行的性能也因此大幅度提升。以上展示的还只是一个简单的 SQL Case，对于复杂的 CTE，嵌套子查询，优化器带来的性能提升将会更高。

## 参考资料

* [EQOP Book ](https://www.microsoft.com/en-us/research/publication/extensible-query-optimizers-in-practice/) (Chapter 1)
* [An Overview of Query Optimization in Relational Systems](https://15799.courses.cs.cmu.edu/spring2025/papers/01-background/chaudhuri-pods1998.pdf) (S. Chaudhuri, PODS 1998) *(Optional)*

* [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/01-background.pdf)
* [课程 Video](https://www.youtube.com/watch?v=YWtH10gfcY0&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=1)
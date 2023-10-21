---
layout: wiki
wiki: Calcite 官方文档中文版
order: 003
title: 代数
date: 2021-12-07 11:15:27
---

> 原文链接：https://calcite.apache.org/docs/algebra.html

`关系代数`是 Calcite 的核心。每个查询都可以表示为一个 `关系运算符树`。你可以将 SQL 转换为关系代数，也可以直接构建关系运算符树。

优化器规则使用保持 `相同语义` 的 `数学恒等式` 来变换表达式树。例如，如果过滤器没有引用其他输入中的列，那么将过滤器推入到内部关联的输入则是有效的。

Calcite 通过反复地将优化器规则应用于关系表达式来优化查询。成本模型指导该过程，优化器引擎生成与原始语义相同，但成本较低的替代表达式。

优化过程是可扩展的。你可以添加自己的 `关系运算符`、`优化器规则`、`成本模型` 和 `统计信息`。

## 代数构建器

构建关系表达式的最简单方法是使用代数构建器 `RelBuilder`。下面是一个例子：

### 表扫描

```java
final FrameworkConfig config;
final RelBuilder builder = RelBuilder.create(config);
final RelNode node = builder.scan("EMP").build();
System.out.println(RelOptUtil.toString(node));
```

你可以在 `RelBuilderExample.java` 中找到这个例子和其他例子的完整代码。这段代码打印如下：

```
LogicalTableScan(table=[[scott, EMP]])
```

它创建了对 `EMP` 表的扫描，相当于如下 SQL：

```sql
SELECT * FROM scott.EMP;
```

### 添加投影

现在，让我们添加一个投影，相当于如下 SQL：

```sql
SELECT ename, deptno FROM scott.EMP;
```

我们只需要在调用 `build` 方法前，添加一个 `project` 方法调用：

```java
final RelNode node = builder.scan("EMP").project(builder.field("DEPTNO"), builder.field("ENAME")).build();
System.out.println(RelOptUtil.toString(node));
```

输出结果如下：

```
LogicalProject(DEPTNO=[$7], ENAME=[$1])
  LogicalTableScan(table=[[scott, EMP]])
```

对 `builder.field` 的两次调用创建了简单表达式，这些表达式从输入的关系表达式中返回字段。那也就是说，`scan` 方法的调用创建了 `TableScan`。Calcite 将它们转换为按序号的字段引用，例如：`$7` 和 `$1`。

### 添加过滤和聚合

下面是一个包含聚合和过滤的查询语句：

```java
final RelNode node = builder.scan("EMP").aggregate(builder.groupKey("DEPTNO"), builder.count(false, "C"), builder.sum(false, "S", builder.field("SAL"))).filter(builder.call(SqlStdOperatorTable.GREATER_THAN, builder.field("C"), builder.literal(10))).build();
System.out.println(RelOptUtil.toString(node));
```

相当于如下 SQL：

```sql
SELECT deptno, count(*) AS c, sum(sal) AS s FROM emp GROUP BY deptno HAVING count(*) > 10
```

并生成如下结果：

```
LogicalFilter(condition=[>($1, 10)])
  LogicalAggregate(group=[{7}], C=[COUNT()], S=[SUM($5)])
    LogicalTableScan(table=[[scott, EMP]])
```

### 压栈和出栈

构建器使用 `堆栈` 来存储第一步生成的关系表达式，并将它作为输入传递给下一步。这允许生成关系表达式的方法生成一个构建器。

在大多数情况下，你只需要使用 `build()` 这个堆栈方法，用来获取最后一个关系表达式，也就是树的根节点。

有时候堆栈会嵌套得非常深，以至于令人困惑。为了让这些事情清楚明了，你可以从堆栈中去除些表达式。例如，我们正在构建下面这个复杂的连接查询：

```
               join
             /      \
        join          join
      /      \      /      \
CUSTOMERS ORDERS LINE_ITEMS PRODUCTS
```

我们分三个阶段进行构建。先将中间结果存储在 `left` 和 `right` 变量中，然后使用 `push()` 方法，在创建最终的 `Join` 对象时，将它们放回堆栈中：

```java
final RelNode left = builder.scan("CUSTOMERS").scan("ORDERS").join(JoinRelType.INNER, "ORDER_ID").build();
final RelNode right = builder.scan("LINE_ITEMS").scan("PRODUCTS").join(JoinRelType.INNER, "PRODUCT_ID").build();
final RelNode result = builder.push(left).push(right).join(JoinRelType.INNER, "ORDER_ID").build();
```

### 转换约定

默认的 RelBuilder 会创建没有约定的逻辑 RelNode。但你可以通过 `adoptConvention()` 来进行切换，从而使用不同的约定：

```java
final RelNode result = builder.push(input).adoptConvention(EnumerableConvention.INSTANCE).sort(toCollation).build();
```

在这个案例中，我们在 `input` RelNode 之上创建了一个 `EnumerableSort`。

### 字段名称和序号

你可以通过名称或序号来引用一个字段。

序号是从零开始的。每个运算符保证它输出字段出现的顺序。例如，`Project` 返回每个标量表达式生成的字段。

运算符的字段名称需要保证是唯一的，但有时这也意味着，名称并不完全符合你的预期。例如，当你对 `EMP` 和 `DEPT` 进行关联时，其中一个输出字段会叫做 `DEPTNO`，而另一个输出字段则会叫做类似 `DEPTNO_1` 的名称。

一些关系表达式方法让你能够更好地控制字段名称：

- `project` 允许你使用 `alias(expr, fieldName)` 来包装表达式。它删除了包装器，但保留了建议的名称（只要它是唯一的）；
- `values(String[] fieldNames, Object... values)` 接受一个字段名称数组。如果数组中的任何元素为空，构建器将会生成一个唯一的名称；

如果一个表达式投影成输入字段，或投影成输入字段的一个转换，那么它将使用输入字段的名称。

一旦唯一的字段名称完成了分配，这些名称就是不可变的。如果你有一个特定的 `RelNode` 实例，你可以依赖字段名称的不变性。事实上，整个关系表达式也是不可变的。

但是，如果一个关系表达式已经通过了多个重写规则（参考 `RelOptRule`），结果表达式的字段名称可能看起来与原始表达式不太一样。这种情况下，最好按照序号来引用字段。

当你正在构建一个接受多个输入的关系表达式时，你需要考虑到那些点，从而构建字段引用。这在构建关联条件时经常出现。

假设你正在 `EMP` 和 `DEPT` 上构建一个关联查询，`EMP` 有 8 个字段 `EMPNO`、`ENAME`、`JOB`、`MGR`、`HIREDATE`、`SAL`、`COMM`、`DEPTNO`，`DEPT` 有 3 个字段 `DEPTNO`、`DNAME`、`LOC`。在内部，Calcite 使用偏移量来表示这些字段，存储在一个包含 11 个字段的组合输入行中：左侧输入的第一个字段是 `#0`（请记住，序号从 0 开始），右侧输入的第一个字段是 `#8`。

通过构建器 API，你可以指定哪个输入的哪个字段。要引用内部字段序号是 `#5` 的 `SAL`，可以写成 `builder.field(2, 0, "SAL")`，`builder.field(2, "EMP", "SAL")` 或 `builder.field(2, 0, 5)`。这个写法表示，在两个输入中，`#0` 输入的 `#5` 字段。为什么它需要知道有两个输入？因为它们存储在堆栈中，`#1` 输入位于堆栈顶部，`#0` 输入在其下方。如果我们不告诉构建器是两个输入，它不知道 `#0` 输入的深度。

类似地，要引用内部字段是 `#9 (8 + 1)` 的 `DNAME`，可以写成 `builder.field(2, 1, "DNAME")`，`builder.field(2, "DEPT", "DNAME")` 或 `builder.field(2, 1, 1)`。

### 递归查询

> 警告：当前 API 是实验性的，如有变更不会另行通知。

下面是一个递归查询的 SQL，用于生成 `1, 2, 3, ...10` 这样的序列：

```sql
WITH RECURSIVE aux(i) AS (VALUES (1) UNION ALL SELECT i + 1 FROM aux WHERE i < 10) SELECT * FROM aux
```

可以对 `TransientTable` 和 `RepeatUnion` 进行表扫描，来生成这个 SQL：

```java
final RelNode node = builder.values(new String[] {"i"}, 1).transientScan("aux").filter(builder.call(SqlStdOperatorTable.LESS_THAN, builder.field(0), builder.literal(10))).project(builder.call(SqlStdOperatorTable.PLUS, builder.field(0), builder.literal(1))).repeatUnion("aux", true).build();
System.out.println(RelOptUtil.toString(node));
```

生成结果如下：

```
LogicalRepeatUnion(all=[true])
  LogicalTableSpool(readType=[LAZY], writeType=[LAZY], tableName=[aux])
    LogicalValues(tuples=[[{ 1 }]])
  LogicalTableSpool(readType=[LAZY], writeType=[LAZY], tableName=[aux])
    LogicalProject($f0=[+($0, 1)])
      LogicalFilter(condition=[<($0, 10)])
        LogicalTableScan(table=[[aux]])
```

### 接口摘要

#### 关系运算符

以下方法会创建一个关系表达式 `RelNode`，并将它压入堆栈中，然后返回 `RelBuilder`。

| 方法                                                         | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `scan(tableName)`                                            | 创建一个 `TableScan`。                                       |
| `functionScan(operator, n, expr...)` <br/>`functionScan(operator, n, exprList)` | 创建 `n` 个最新的关系表达式 `TableFunctionScan`。            |
| `transientScan(tableName [, rowType])`                       | 在给定类型的 `TransientTable` 上创建 `TableScan`（如果未指定，将使用最新的关系表达式类型）。 |
| `values(fieldNames, value...)` <br/>`values(rowType, tupleList)` | 创建一个 `Values`。                                          |
| `filter([variablesSet, ] exprList)` <br/>`filter([variablesSet, ] expr...)` | 在给定谓词的 AND 上创建 `过滤器`（如果 `variablesSet` 指定，谓词可以引用这些变量）。 |
| `project(expr...)` <br/>`project(exprList [, fieldNames])`   | 创建一个投影。如果要覆盖默认名称，请使用 `alias` 来包装表达式，或指定 `fieldNames` 参数。 |
| `projectPlus(expr...)` <br/>`projectPlus(exprList)`          | `project` 的变体，保留了原始字段，并添加给定的表达式。       |
| `projectExcept(expr...)` <br/>`projectExcept(exprList)`      | `project` 的变体，保留了原始字段，并删除给定的表达式。       |
| `permute(mapping)`                                           | 创建一个使用 `mapping` 重新排列字段的投影。                  |
| `convert(rowType [, rename])`                                | 创建一个将字段转换为指定类型，或者重命名这些字段的投影。     |
| `aggregate(groupKey, aggCall...)` <br/>`aggregate(groupKey, aggCallList)` | 创建一个聚合。                                               |
| `distinct()`                                                 | 创建一个消除重复记录的聚合。                                 |
| `pivot(groupKey, aggCalls, axes, values)`                    | 添加旋转（`pivot 行转列`）操作，该操作使用每个度量和值的组合列，生成一个聚合来实现。 |
| `unpivot(includeNulls, measureNames, axisNames, axisMap)`    | 添加逆旋转（`unpivot 列转行`）操作，该操作为每个 `Values` 生成一个 `Join`，从而将每行转换为多行来实现。 |
| `sort(fieldOrdinal...)` <br/>`sort(expr...)` <br/>`sort(exprList)` | 创建一个 `Sort`。在第一种形式中，字段序号是从 `0` 开始的，负数序号表示降序。例如，`-2` 表示字段 `1` 降序。在其它的形式中，你可以将表达式包装在 `as`，`nullsFirst` 或 `nullsLast` 中。 |
| `sortLimit(offset, fetch, expr...)` <br/>`sortLimit(offset, fetch, exprList)` | 创建一个带有 `offset` 和 `limit` 的 `Sort`。                 |
| `limit(offset, fetch)`                                       | 创建一个不排序的 `Sort`，只适用于 `offset` 和 `limit`。      |
| `exchange(distribution)`                                     | 创建一个 `Exchange`。                                        |
| `sortExchange(distribution, collation)`                      | 创建一个 `SortExchange`。                                    |
| `correlate(joinType, correlationId, requiredField...)` <br/>`correlate(joinType, correlationId, requiredFieldList)` | 使用两个最新的关系表达式，创建一个 `Correlate`，它包含了一个可变名称以及左侧关联关系需要的字段表达式。 |
| `join(joinType, expr...)` <br/>`join(joinType, exprList)`<br/>`join(joinType, fieldName...)` | 使用两个最新的关系表达式，创建一个 `Join`。第一种形式，在布尔表达式上进行关联（使用 AND 组合多个条件）。最后一个形式，在命名字段上进行关联，每边必须有一个各自名称的字段。 |
| `semiJoin(expr)`                                             | 使用两个最新的关系表达式，创建一个半连接类型的 `Join`。      |
| `antiJoin(expr)`                                             | 使用两个最新的关系表达式，创建一个反连接类型的 `Join`。      |
| `union(all [, n])`                                           | 使用 `n`（默认两个）个最新的关系表达式，创建一个 `Union`。   |
| `intersect(all [, n])`                                       | 使用 `n`（默认两个）个最新的关系表达式，创建一个 `Intersect`。 |
| `minus(all)`                                                 | 使用两个最新的关系表达式，创建一个 `Minus`。                 |
| `repeatUnion(tableName, all [, n])`                          | 创建与 `TransientTable` （使用两个最新的关系表达式创建）相关联的 `RepeatUnion`，它具有 `n` 个最大迭代次数（默认为 `-1`，即没有限制）。 |
| `snapshot(period)`                                           | 创建指定的快照时间段的 `Snapshot`。                          |
| `match(pattern, strictStart,` `strictEnd, patterns, measures,` `after, subsets, allRows,` `partitionKeys, orderKeys,` `interval)` | 创建一个 `Match`。                                           |

参数类型：

- `expr`，`interval`：`RexNode`；
- `expr...`， `requiredField...`：`RexNode` 数组；
- `exprList`，`measureList`，`partitionKeys`，`orderKeys`， `requiredFieldList`：可迭代的 `RexNode`；
- `fieldOrdinal`：行内字段的序号（从 0 开始）；
- `fieldName`：字段名称，在行内唯一；
- `fieldName...`：字符串数组；
- `fieldNames`：可迭代的字符串；
- `rowType`：`RelDataType`；
- `groupKey`：`RelBuilder.GroupKey`；
- `aggCall...`：`RelBuilder.AggCall` 数组；
- `aggCallList`：可迭代的 `RelBuilder.AggCall`；
- `value...`：对象数组；
- `value`：对象；
- `tupleList`：可迭代的 `RexLiteral` 集合；
- `all`，`distinct`，`strictStart`，`strictEnd`，`allRows`：布尔值；
- `alias`：字符串；
- `correlationId`：`CorrelationId`；
- `variablesSet`：可迭代的 `CorrelationId`；
- `varHolder`：`RexCorrelVariable` `Holder`；
- `patterns`：键为字符串，值为 `RexNode` 的 Map；
- `subsets`：键为字符串，值为字符串有序集合的 Map；
- `distribution`：`RelDistribution`；
- `collation`：`RelCollation`；
- `operator`：`SqlOperator`；
- `joinType`：`JoinRelType`；

builder 方法执行了各种优化，具体包括：

- 如果要求按顺序投影所有列，`project`  则返回它的输入；

- `filter` 会打平条件表达式，所以，一个 `AND` 和 `OR` 可能有 2 个以上的子节点。`filter` 也会进行简化，例如将 `x = 1 AND TRUE` 转化为 `x = 1`；

- 如果你先使用 `sort`，然后使用 `limit` 时，效果就像你调用了 `sortLimit` 一样；

有一些注解方法，可以向堆栈顶部的关系表达式添加信息：

| 方法                  | 描述                                   |
| :-------------------- | :------------------------------------- |
| `as(alias)`           | 为堆栈顶部的关系表达式分配一个表别名。 |
| `variable(varHolder)` | 创建一个引用顶部关系表达式的相关变量。 |

#### 堆栈方法

| 方法                  | 描述                                                         |
| :-------------------- | :----------------------------------------------------------- |
| `build()`             | 从堆栈中弹出最新创建的关系表达式。                           |
| `push(rel)`           | 将关系表达式压入堆栈。前面提到的关系方法，例如 `scan`，会调用这个方法，但是用户代码一般不会调用。 |
| `pushAll(collection)` | 将一组关系表达式压入堆栈。                                   |
| `peek()`              | 返回最新放入堆栈的关系表达式，但不删除它。                   |

#### 标量表达式方法

以下方法返回标量表达式 `RexNode`。许多方法使用堆栈的内容。例如，`field("DEPTNO")` 返回被添加到堆栈中的关系表达式的 `DEPTNO` 字段的引用。

| 方法                                                         | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `literal(value)`                                             | 常量。                                                       |
| `field(fieldName)`                                           | 按照名称引用关系表达式最顶层的字段。                         |
| `field(fieldOrdinal)`                                        | 按照顺序引用关系表达式最顶层的字段。                         |
| `field(inputCount, inputOrdinal, fieldName)`                 | 按照名称引用关系表达式第 `inputCount - inputOrdinal`  个字段。 |
| `field(inputCount, inputOrdinal, fieldOrdinal)`              | 按照序号引用关系表达式第 `inputCount - inputOrdinal` 个字段。 |
| `field(inputCount, alias, fieldName)`                        | 按照表别名和字段名称，引用堆栈顶部最多 `inputCount - 1` 个元素的字段。 |
| `field(alias, fieldName)`                                    | 按照表别名和字段名称，引用关系表达式最顶层的字段。           |
| `field(expr, fieldName)`                                     | 按照名称引用记录值（`record-valued`）表达式字段。            |
| `field(expr, fieldOrdinal)`                                  | 按照序号引用记录值（`record-valued`）表达式字段。            |
| `fields(fieldOrdinalList)`                                   | 按照序号引用输入字段的表达式列表。                           |
| `fields(mapping)`                                            | 按照给定映射引用输入字段的表达式列表。                       |
| `fields(collation)`                                          | 表达式列表  `exprList`，`sort(exprList)` 将复制排序规则。    |
| `call(op, expr...)` <br/>`call(op, exprList)`                | 调用函数或运算符。                                           |
| `and(expr...)` <br/>`and(exprList)`                          | 逻辑与。会打平嵌套的 AND，并优化涉及 TRUE 和 FALSE 的情况。  |
| `or(expr...)` <br/>`or(exprList)`                            | 逻辑或。会打平嵌套的 OR，并优化涉及 TRUE 和 FALSE 的情况。   |
| `not(expr)`                                                  | 逻辑非。                                                     |
| `equals(expr, expr)`                                         | 等于。                                                       |
| `isNull(expr)`                                               | 检查表达式是否为空。                                         |
| `isNotNull(expr)`                                            | 检查表达式是否为非空。                                       |
| `alias(expr, fieldName)`                                     | 重命名表达式（仅作为 `project` 的参数时有效）。              |
| `cast(expr, typeName)` <br/>`cast(expr, typeName, precision)` <br/>`cast(expr, typeName, precision, scale)` | 将表达式转换为指定类型。                                     |
| `desc(expr)`                                                 | 将排序方向改为降序（仅作为 `sort` 或 `sortLimit` 的参数时有效）。 |
| `nullsFirst(expr)`                                           | 将排序顺序改为空值最先（仅作为 `sort` 或 `sortLimit` 的参数时有效）。 |
| `nullsLast(expr)`                                            | 将排序顺序改为空值最后（仅作为 `sort` 或 `sortLimit` 的参数时有效）。 |
| `cursor(n, input)`                                           | 引用第 `input` 个（从 0 开始）关系输入，关系输入是有 n 个输入的 `TableFunctionScan`（参考 `functionScan`）。 |

#### 模式方法

以下方法会返回用于 `match` 中的模式。

| 方法                                 | 描述         |
| :----------------------------------- | :----------- |
| `patternConcat(pattern...)`          | 连接模式     |
| `patternAlter(pattern...)`           | 替换模式     |
| `patternQuantify(pattern, min, max)` | 量化模式     |
| `patternPermute(pattern...)`         | 重新排列模式 |
| `patternExclude(pattern)`            | 排除模式     |

#### 分组键方法

以下方法会返回一个 `RelBuilder.GroupKey`。

| 方法                                                         | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `groupKey(fieldName...)`<br/>`groupKey(fieldOrdinal...)` <br/>`groupKey(expr...)` <br/>`groupKey(exprList)` | 创建一个指定表达式的分组键。                                 |
| `groupKey(exprList, exprListList)`                           | 创建一个使用分组集合的指定表达式的分组键。                   |
| `groupKey(bitSet [, bitSets])`                               | 创建一个指定输入列的分组键，如果指定了 `bitSets`，则指定输入列包含多个分组集合。 |

#### 聚合调用方法

以下方法会返回一个 `RelBuilder.AggCall`。

| 方法                                                         | 描述                                 |
| :----------------------------------------------------------- | :----------------------------------- |
| `aggregateCall(op, expr...)`<br/>`aggregateCall(op, exprList)` | 为指定的聚合函数创建一个调用。       |
| `count([ distinct, alias, ] expr...)`<br/>`count([ distinct, alias, ] exprList)` | 为 `COUNT` 聚合函数创建一个调用。    |
| `countStar(alias)`                                           | 为 `COUNT(*)` 聚合函数创建一个调用。 |
| `sum([ distinct, alias, ] expr)`                             | 为 `SUM` 聚合函数创建一个调用。      |
| `min([ alias, ] expr)`                                       | 为 `MIN` 聚合函数创建一个调用。      |
| `max([ alias, ] expr)`                                       | 为 `MAX` 聚合函数创建一个调用。      |

如果想要进一步地修改 `AggCall`，可以调用如下方法：

| 方法                                 | 描述                                                       |
| :----------------------------------- | :--------------------------------------------------------- |
| `approximate(approximate)`           | 允许聚合的近似值 `approximate`。                           |
| `as(alias)`                          | 为表达式分配一个列别名（请参考 SQL `AS`）。                |
| `distinct()`                         | 在聚合之前消除重复值（请参考 SQL `DISTINCT`）。            |
| `distinct(distinct)`                 | 如果配置了 `distinct`，则在聚合之前消除重复值。            |
| `filter(expr)`                       | 在聚合之前过滤行（请参考 SQL `FILTER (WHERE ...)`）。      |
| `sort(expr...)` `sort(exprList)`     | 在聚合之前对行进行排序（请参考 SQL `WITHIN GROUP`）。      |
| `unique(expr...)` `unique(exprList)` | 在聚合之前使行唯一（请参考 SQL `WITHIN DISTINCT`）。       |
| `over()`                             | 将这个 `AggCall` 转换为窗口聚合（参考下面的 `OverCall`）。 |

#### 窗口聚合调用方法

为了创建一个 `RelBuilder.OverCall`（它代表对窗口聚合函数的调用）， 需要先创建一个聚合调用，然后调用它的 `over()` 方法，例如：`count().over()`。

如果想要进一步地修改 `OverCall`，可以调用如下方法：

| 方法                                                | 描述                                                         |
| :-------------------------------------------------- | :----------------------------------------------------------- |
| `rangeUnbounded()`                                  | 创建一个无界的、基于范围的窗口，`RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。 |
| `rangeFrom(lower)`                                  | 创建一个基于范围的、有下界的窗口，`RANGE BETWEEN lower AND CURRENT ROW`。 |
| `rangeTo(upper)`                                    | 创建一个基于范围的、有上界的窗口，`RANGE BETWEEN CURRENT ROW AND upper`。 |
| `rangeBetween(lower, upper)`                        | 创建一个基于范围的窗口，`RANGE BETWEEN lower AND upper`。    |
| `rowsUnbounded()`                                   | 创建一个无界的、基于行的窗口，`ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。 |
| `rowsFrom(lower)`                                   | 创建一个基于行的、有下界的窗口，`ROWS BETWEEN lower AND CURRENT ROW`。 |
| `rowsTo(upper)`                                     | 创建一个基于行的、有上界的窗口，`ROWS BETWEEN CURRENT ROW AND upper`。 |
| `rowsBetween(lower, upper)`                         | 创建一个基于行的窗口，`ROWS BETWEEN lower AND upper`。       |
| `partitionBy(expr...)` <br/>`partitionBy(exprList)` | 根据指定的表达式对窗口进行分区（请参考 SQL `PARTITION BY`）。 |
| `orderBy(expr...)` <br/>`sort(exprList)`            | 对窗口中的行进行排序（请参考 SQL `ORDER BY`）。              |
| `allowPartial(b)`                                   | 设置是否允许部分宽度的窗口，默认为 `true`。                  |
| `nullWhenCountZero(b)`                              | 设置如果窗口中没有数据行时，聚合函数是否应该计算为空，默认 `false`。 |
| `as(alias)`                                         | 分配列别名（请参考 SQL `AS`），并将 `OverCall` 转换为 `RexNode`。 |
| `toRex()`                                           | 将 `OverCall` 转换为 `RexNode`。                             |



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。
{% note color:green 目前星球刚创建，内部积累的资料还很有限，因此暂时不收费，感兴趣的同学可以联系我，免费邀请进入星球。 %}

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

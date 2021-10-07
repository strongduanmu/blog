---
layout: wiki
wiki: Calcite 官方文档中文版
order: 003
title: 代数
comment_id: 'calcite_chinese_doc'
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

对 `builder.field` 的两次调用创建了简单表达式，这些表达式从输入的关系表达式中返回字段——那也就是说，`scan` 方法的调用创建了 `TableScan`。Calcite 将它们转换为按序数的字段引用，例如：`$7` 和 `$1`。

### 添加过滤和聚合

下面是一个包含聚合和过滤的查询语句：

```java
final RelNode node = builder.scan("EMP").aggregate(builder.groupKey("DEPTNO"), builder.count(false, "C"), builder.sum(false, "S", builder.field("SAL"))).filter(builder.call(SqlStdOperatorTable.GREATER_THAN, builder.field("C"), builder.literal(10))).build();
System.out.println(RelOptUtil.toString(node));
```

相当于SQL

```
SELECT deptno, count(*) AS c, sum(sal) AS s
FROM emp
GROUP BY deptno
HAVING count(*) > 10
```

并产生

```
LogicalFilter(condition=[>($1, 10)])
  LogicalAggregate(group=[{7}], C=[COUNT()], S=[SUM($5)])
    LogicalTableScan(table=[[scott, EMP]])
```

### 推挤

构建器使用堆栈来存储由一个步骤生成的关系表达式，并将其作为输入传递给下一步。这允许生成关系表达式的方法生成构建器。

大多数情况下，你将使用的唯一堆栈方法是`build()`, 获取最后一个关系表达式，即树的根。

有时堆栈会嵌套得如此之深，以至于令人困惑。为了让事情保持正直，你可以从堆栈中删除表达式。例如，这里我们正在构建一个浓密连接：

```
.
               join
             /      \
        join          join
      /      \      /      \
CUSTOMERS ORDERS LINE_ITEMS PRODUCTS
```

我们分三个阶段进行构建。将中间结果存储在变量 `left`and 中`right`，并`push()`在创建最终结果时将它们放回堆栈`Join`：

```
final RelNode left = builder
  .scan("CUSTOMERS")
  .scan("ORDERS")
  .join(JoinRelType.INNER, "ORDER_ID")
  .build();

final RelNode right = builder
  .scan("LINE_ITEMS")
  .scan("PRODUCTS")
  .join(JoinRelType.INNER, "PRODUCT_ID")
  .build();

final RelNode result = builder
  .push(left)
  .push(right)
  .join(JoinRelType.INNER, "ORDER_ID")
  .build();
```

### 转换约定

默认的 RelBuilder 创建没有约定的逻辑 RelNode。但是你可以通过`adoptConvention()`以下方式切换到使用不同的约定：

```
final RelNode result = builder
  .push(input)
  .adoptConvention(EnumerableConvention.INSTANCE)
  .sort(toCollation)
  .build();
```

在这种情况下，我们在输入 RelNode 之上创建一个 EnumerableSort。

### 字段名称和序数

你可以按名称或顺序引用字段。

序数是从零开始的。每个运算符保证其输出字段出现的顺序。例如，`Project`返回每个标量表达式生成的字段。

运算符的字段名称保证是唯一的，但有时这意味着名称并不完全符合你的预期。例如，当你将 EMP 连接到 DEPT 时，其中一个输出字段将被称为 DEPTNO，另一个将被称为 DEPTNO_1 之类的内容。

一些关系表达式方法可以让你更好地控制字段名称：

- `project`允许你使用`alias(expr, fieldName)`. 它删除包装器但保留建议的名称（只要它是唯一的）。
- `values(String[] fieldNames, Object... values)`接受一个字段名称数组。如果数组的任何元素为空，构建器将生成一个唯一的名称。

如果表达式投影输入字段或输入字段的强制转换，它将使用该输入字段的名称。

一旦分配了唯一的字段名称，这些名称就是不可变的。如果你有一个特定的`RelNode`实例，你可以依赖字段名称不变。事实上，整个关系表达式是不可变的。

但是，如果关系表达式已经通过了多个重写规则（请参阅 [RelOptRule](https://calcite.apache.org/javadocAggregate/org/apache/calcite/plan/RelOptRule.html)），则结果表达式的字段名称可能看起来与原始表达式不太一样。此时最好按序引用字段。

当你构建接受多个输入的关系表达式时，你需要构建考虑到这一点的字段引用。这在构建连接条件时最常发生。

假设你要在 EMP 上构建连接，它有 8 个字段 [EMPNO、ENAME、JOB、MGR、HIREDATE、SAL、COMM、DEPTNO] 和 DEPT，它有 3 个字段 [DEPTNO、DNAME、LOC]。在内部，Calcite 将这些字段表示为具有 11 个字段的组合输入行的偏移量：左侧输入的第一个字段是字段 #0（记住，从 0 开始），右侧输入的第一个字段是字段 #8。

但是通过构建器 API，你可以指定哪个输入的哪个字段。到参考“SAL”，内部字段＃5，写`builder.field(2, 0, "SAL")`，`builder.field(2, "EMP", "SAL")`或`builder.field(2, 0, 5)`。这意味着“两个输入的输入 #0 的字段 #5”。（为什么它需要知道有两个输入？因为它们存储在堆栈中；输入#1 位于堆栈顶部，输入#0 在其下方。如果我们不告诉构建器是两个输入，它不知道输入 #0 的深度。）

类似地，要引用“DNAME”，内部字段 #9 (8 + 1)，写`builder.field(2, 1, "DNAME")`, `builder.field(2, "DEPT", "DNAME")`, 或`builder.field(2, 1, 1)`。

### 递归查询

警告：当前的 API 是实验性的，如有更改，恕不另行通知。一个 SQL 递归查询，例如生成序列 1, 2, 3, ...10 的这个查询：

```
WITH RECURSIVE aux(i) AS (
  VALUES (1)
  UNION ALL
  SELECT i+1 FROM aux WHERE i < 10
)
SELECT * FROM aux
```

可以使用对 TransientTable 和 RepeatUnion 的扫描生成：

```
final RelNode node = builder
  .values(new String[] { "i" }, 1)
  .transientScan("aux")
  .filter(
      builder.call(
          SqlStdOperatorTable.LESS_THAN,
          builder.field(0),
          builder.literal(10)))
  .project(
      builder.call(
          SqlStdOperatorTable.PLUS,
          builder.field(0),
          builder.literal(1)))
  .repeatUnion("aux", true)
  .build();
System.out.println(RelOptUtil.toString(node));
```

它产生：

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

以下方法创建一个关系表达式 ( [RelNode](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/RelNode.html) )，将其压入堆栈，然后返回`RelBuilder`.

| 方法                                                         | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `scan(tableName)`                                            | 创建一个[TableScan](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/TableScan.html)。 |
| `functionScan(operator, n, expr...)` `functionScan(operator, n, exprList)` | 创建[TableFunctionScan](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/TableFunctionScan.html)中的`n`最近的关系表达式。 |
| `transientScan(tableName [, rowType])`                       | 在具有给定类型的[TransientTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TransientTable.html)上创建[TableScan](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/TableScan.html)（如果未指定，将使用最新的关系表达式的类型）。 |
| `values(fieldNames, value...)` `values(rowType, tupleList)`  | 创建一个[Values](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Values.html)。 |
| `filter([variablesSet, ] exprList)` `filter([variablesSet, ] expr...)` | 在给定谓词的 AND 上创建[过滤器](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Filter.html)；如果`variablesSet`指定，谓词可以引用这些变量。 |
| `project(expr...)` `project(exprList [, fieldNames])`        | 创建一个[项目](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Project.html)。要覆盖默认名称，请使用 包装表达式`alias`，或指定`fieldNames`参数。 |
| `projectPlus(expr...)` `projectPlus(exprList)`               | 其变体`project`保留原始字段并附加给定的表达式。              |
| `projectExcept(expr...)` `projectExcept(exprList)`           | 其变体`project`保留原始字段并删除给定的表达式。              |
| `permute(mapping)`                                           | 创建一个使用 排列字段的[项目](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Project.html)`mapping`。 |
| `convert(rowType [, rename])`                                | 创建[项目](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Project.html)的字段转换为指定的类型，也可选择重命名它们。 |
| `aggregate(groupKey, aggCall...)` `aggregate(groupKey, aggCallList)` | 创建一个[聚合](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Aggregate.html)。 |
| `distinct()`                                                 | 创建一个消除重复记录的[聚合](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Aggregate.html)。 |
| `pivot(groupKey, aggCalls, axes, values)`                    | 添加一个透视操作，通过为每个度量和值组合生成一个带有列的[聚合来](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Aggregate.html)实现 |
| `unpivot(includeNulls, measureNames, axisNames, axisMap)`    | 添加逆透视操作，通过生成[Join](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Join.html) to a [Values](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Values.html)将每一行转换为几行来实现 |
| `sort(fieldOrdinal...)` `sort(expr...)` `sort(exprList)`     | 创建一个[Sort](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Sort.html)。  在第一种形式中，字段序数是从 0 开始的，负序数表示降序；例如，-2 表示字段 1 降序。  在其他形式中，你可以将表达式包装在`as`,`nullsFirst`或 中`nullsLast`。 |
| `sortLimit(offset, fetch, expr...)` `sortLimit(offset, fetch, exprList)` | 创建一个带有偏移和限制的[排序](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Sort.html)。 |
| `limit(offset, fetch)`                                       | 创建一个[排序](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Sort.html)，不排序，只适用失调和限制。 |
| `exchange(distribution)`                                     | 创建一个[Exchange](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Exchange.html)。 |
| `sortExchange(distribution, collation)`                      | 创建一个[SortExchange](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/SortExchange.html)。 |
| `correlate(joinType, correlationId, requiredField...)` `correlate(joinType, correlationId, requiredFieldList)` | 创建[归属关系](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Correlate.html)最近的两个关系式的，具有可变名称和左边的关系需要的字段表达式。 |
| `join(joinType, expr...)` `join(joinType, exprList)` `join(joinType, fieldName...)` | 创建一个[加入](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Join.html)最近的两个关系式。  第一种形式连接布尔表达式（使用 AND 组合多个条件）。  最后一个表单在命名字段上连接；每边必须有每个名称的字段。 |
| `semiJoin(expr)`                                             | 创建一个[Join](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Join.html) with SEMI join 类型的两个最近的关系表达式。 |
| `antiJoin(expr)`                                             | 创建一个[Join](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Join.html) with ANTI join 类型的两个最近的关系表达式。 |
| `union(all [, n])`                                           | 创建一个[联盟](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Union.html)中的`n`（默认二）最近的关系表达式。 |
| `intersect(all [, n])`                                       | 创建一个[相交](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Intersect.html)的的`n`（默认二）最近的关系表达式。 |
| `minus(all)`                                                 | 创建两个最近关系表达式的[减号](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Minus.html)。 |
| `repeatUnion(tableName, all [, n])`                          | 创建一个与两个最近关系表达式的[TransientTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TransientTable.html)相关联的[RepeatUnion](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/RepeatUnion.html)，具有最大迭代次数（默认为 -1，即没有限制）。`n` |
| `snapshot(period)`                                           | 创建[快照](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Snapshot.html)的定快照时期。 |
| `match(pattern, strictStart,` `strictEnd, patterns, measures,` `after, subsets, allRows,` `partitionKeys, orderKeys,` `interval)` | 创建[匹配](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Match.html)。 |

参数类型：

- `expr`,`interval` [节点](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rex/RexNode.html)
- `expr...`, [RexNode](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rex/RexNode.html)`requiredField...`数组
- `exprList`，`measureList`，`partitionKeys`，`orderKeys`， `requiredFieldList`的可迭代 [RexNode](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rex/RexNode.html)
- `fieldOrdinal` 其行内字段的序数（从 0 开始）
- `fieldName` 字段名称，在其行内唯一
- `fieldName...` 字符串数组
- `fieldNames` 可迭代的字符串
- `rowType` [相关数据类型](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/type/RelDataType.html)
- `groupKey` [RelBuilder.GroupKey](https://calcite.apache.org/javadocAggregate/org/apache/calcite/tools/RelBuilder.GroupKey.html)
- `aggCall...`[RelBuilder.AggCall](https://calcite.apache.org/javadocAggregate/org/apache/calcite/tools/RelBuilder.AggCall.html)数组
- `aggCallList`可[迭代的 RelBuilder.AggCall](https://calcite.apache.org/javadocAggregate/org/apache/calcite/tools/RelBuilder.AggCall.html)
- `value...` 对象数组
- `value` 目的
- `tupleList`[RexLiteral](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rex/RexLiteral.html)列表的可[迭代对象](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rex/RexLiteral.html)
- `all`, `distinct`, `strictStart`, `strictEnd`,`allRows`布尔值
- `alias` 细绳
- `correlationId` [相关ID](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/CorrelationId.html)
- `variablesSet`可迭代的 [CorrelationId](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/CorrelationId.html)
- `varHolder` [持有人](https://calcite.apache.org/javadocAggregate/org/apache/calcite/util/Holder.html)的[RexCorrelVariable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rex/RexCorrelVariable.html)
- `patterns`键为字符串，值为[RexNode 的映射](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rex/RexNode.html)
- `subsets` 键为字符串的映射，值为字符串的有序集合
- `distribution` [相关分布](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/RelDistribution.html)
- `collation` [关系整理](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/RelCollation.html)
- `operator` [SqlOperator](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/SqlOperator.html)
- `joinType` [加入关系类型](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/JoinRelType.html)

builder 方法执行各种优化，包括：

- `project` 如果要求按顺序投影所有列，则返回其输入
- `filter`使条件变平（因此，`AND`并且`OR`可能有 2 个以上的孩子），简化（转换`x = 1 AND TRUE`为`x = 1`）
- 如果你`sort`当时申请`limit`，效果就像你打电话`sortLimit`

有一些注释方法可以向堆栈上的顶部关系表达式添加信息：

| 方法                  | 描述                               |
| :-------------------- | :--------------------------------- |
| `as(alias)`           | 为堆栈上的顶部关系表达式分配表别名 |
| `variable(varHolder)` | 创建引用顶部关系表达式的相关变量   |

#### 堆栈方法

| 方法                  | 描述                                                         |
| :-------------------- | :----------------------------------------------------------- |
| `build()`             | 从堆栈中弹出最近创建的关系表达式                             |
| `push(rel)`           | 将关系表达式压入堆栈。上面的关系方法比如`scan`，调用这个方法，但是用户代码一般不会 |
| `pushAll(collection)` | 将一组关系表达式压入堆栈                                     |
| `peek()`              | 返回最近放入堆栈的关系表达式，但不删除它                     |

#### 标量表达式方法

以下方法返回标量表达式 ( [RexNode](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rex/RexNode.html) )。

他们中的许多人使用堆栈的内容。例如，`field("DEPTNO")` 返回对刚刚添加到堆栈中的关系表达式的“DEPTNO”字段的引用。

| 方法                                                         | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `literal(value)`                                             | 持续的                                                       |
| `field(fieldName)`                                           | 按名称引用最顶层关系表达式的字段                             |
| `field(fieldOrdinal)`                                        | 按顺序引用最顶层关系表达式的字段                             |
| `field(inputCount, inputOrdinal, fieldName)`                 | 按名称引用第 ( `inputCount`- `inputOrdinal`) 个关系表达式的字段 |
| `field(inputCount, inputOrdinal, fieldOrdinal)`              | 按序数引用第 ( `inputCount`- `inputOrdinal`) 个关系表达式的字段 |
| `field(inputCount, alias, fieldName)`                        | 通过表别名和字段名称，`inputCount - 1`从堆栈顶部到最多元素引用一个字段 |
| `field(alias, fieldName)`                                    | 通过表别名和字段名称引用最顶层关系表达式的字段               |
| `field(expr, fieldName)`                                     | 按名称引用记录值表达式的字段                                 |
| `field(expr, fieldOrdinal)`                                  | 按序数引用记录值表达式的字段                                 |
| `fields(fieldOrdinalList)`                                   | 按序号引用输入字段的表达式列表                               |
| `fields(mapping)`                                            | 通过给定映射引用输入字段的表达式列表                         |
| `fields(collation)`                                          | 表达式列表, `exprList`, 这样`sort(exprList)`将复制排序规则   |
| `call(op, expr...)` `call(op, exprList)`                     | 调用函数或运算符                                             |
| `and(expr...)` `and(exprList)`                               | 逻辑与。展平嵌套的 AND，并优化涉及 TRUE 和 FALSE 的情况。    |
| `or(expr...)` `or(exprList)`                                 | 逻辑或。展平嵌套的 OR，并优化涉及 TRUE 和 FALSE 的情况。     |
| `not(expr)`                                                  | 逻辑非                                                       |
| `equals(expr, expr)`                                         | 等于                                                         |
| `isNull(expr)`                                               | 检查表达式是否为空                                           |
| `isNotNull(expr)`                                            | 检查表达式是否不为空                                         |
| `alias(expr, fieldName)`                                     | 重命名表达式（仅作为 的参数有效`project`）                   |
| `cast(expr, typeName)` `cast(expr, typeName, precision)` `cast(expr, typeName, precision, scale)` | 将表达式转换为给定类型                                       |
| `desc(expr)`                                                 | 将排序方向更改为降序（仅作为`sort`或的参数有效`sortLimit`）  |
| `nullsFirst(expr)`                                           | 首先将排序顺序更改为空值（仅作为`sort`或的参数有效`sortLimit`） |
| `nullsLast(expr)`                                            | 将排序顺序更改为最后一个空值（仅作为`sort`或的参数有效`sortLimit`） |
| `cursor(n, input)`                                           | 参考 a 的`input`th（基于 0 的）关系输入`TableFunctionScan`with`n`输入（请参阅`functionScan`） |

#### 模式方法

以下方法返回用于`match`.

| 方法                                 | 描述         |
| :----------------------------------- | :----------- |
| `patternConcat(pattern...)`          | 连接模式     |
| `patternAlter(pattern...)`           | 交替模式     |
| `patternQuantify(pattern, min, max)` | 量化模式     |
| `patternPermute(pattern...)`         | 置换一个模式 |
| `patternExclude(pattern)`            | 排除模式     |

#### 组键方法

以下方法返回一个 [RelBuilder.GroupKey](https://calcite.apache.org/javadocAggregate/org/apache/calcite/tools/RelBuilder.GroupKey.html)。

| 方法                                                         | 描述                                                      |
| :----------------------------------------------------------- | :-------------------------------------------------------- |
| `groupKey(fieldName...)` `groupKey(fieldOrdinal...)` `groupKey(expr...)` `groupKey(exprList)` | 创建给定表达式的组键                                      |
| `groupKey(exprList, exprListList)`                           | 使用分组集创建给定表达式的组键                            |
| `groupKey(bitSet [, bitSets])`                               | 创建给定输入列的组键，如果`bitSets`指定，则具有多个分组集 |

#### 聚合调用方法

以下方法返回一个 [RelBuilder.AggCall](https://calcite.apache.org/javadocAggregate/org/apache/calcite/tools/RelBuilder.AggCall.html)。

| 方法                                                         | 描述                           |
| :----------------------------------------------------------- | :----------------------------- |
| `aggregateCall(op, expr...)` `aggregateCall(op, exprList)`   | 创建对给定聚合函数的调用       |
| `count([ distinct, alias, ] expr...)` `count([ distinct, alias, ] exprList)` | 创建对`COUNT`聚合函数的调用    |
| `countStar(alias)`                                           | 创建对`COUNT(*)`聚合函数的调用 |
| `sum([ distinct, alias, ] expr)`                             | 创建对`SUM`聚合函数的调用      |
| `min([ alias, ] expr)`                                       | 创建对`MIN`聚合函数的调用      |
| `max([ alias, ] expr)`                                       | 创建对`MAX`聚合函数的调用      |

要进一步修改`AggCall`，请调用其方法：

| 方法                                 | 描述                                                |
| :----------------------------------- | :-------------------------------------------------- |
| `approximate(approximate)`           | 允许聚合的近似值 `approximate`                      |
| `as(alias)`                          | 为该表达式分配列别名（请参阅 SQL `AS`）             |
| `distinct()`                         | 在聚合之前消除重复值（请参阅 SQL `DISTINCT`）       |
| `distinct(distinct)`                 | 在聚合之前消除重复值如果 `distinct`                 |
| `filter(expr)`                       | 在聚合之前过滤行（请参阅 SQL `FILTER (WHERE ...)`） |
| `sort(expr...)` `sort(exprList)`     | 在聚合之前对行进行排序（请参阅 SQL `WITHIN GROUP`） |
| `unique(expr...)` `unique(exprList)` | 在聚合之前使行唯一（请参阅 SQL `WITHIN DISTINCT`）  |
| `over()`                             | 将其`AggCall`转换为窗口聚合（见`OverCall`下文）     |

#### 窗口聚合调用方法

要创建代表对窗口聚合函数的调用的 [RelBuilder.OverCall](https://calcite.apache.org/javadocAggregate/org/apache/calcite/tools/RelBuilder.OverCall.html)，请创建一个聚合调用，然后调用其`over()`方法，例如`count().over()`。

要进一步修改`OverCall`，请调用其方法：

| 方法                                           | 描述                                                         |
| :--------------------------------------------- | :----------------------------------------------------------- |
| `rangeUnbounded()`                             | 创建一个无界的基于范围的窗口， `RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` |
| `rangeFrom(lower)`                             | 创建一个基于范围的窗口，边界在下方， `RANGE BETWEEN lower AND CURRENT ROW` |
| `rangeTo(upper)`                               | 创建一个基于范围的窗口，在上面有界， `RANGE BETWEEN CURRENT ROW AND upper` |
| `rangeBetween(lower, upper)`                   | 创建一个基于范围的窗口， `RANGE BETWEEN lower AND upper`     |
| `rowsUnbounded()`                              | 创建一个无界的基于行的窗口， `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` |
| `rowsFrom(lower)`                              | 创建一个基于行的窗口，边界在下方， `ROWS BETWEEN lower AND CURRENT ROW` |
| `rowsTo(upper)`                                | 创建一个以行为边界的窗口， `ROWS BETWEEN CURRENT ROW AND upper` |
| `rowsBetween(lower, upper)`                    | 创建一个基于行的窗口， `ROWS BETWEEN lower AND upper`        |
| `partitionBy(expr...)` `partitionBy(exprList)` | 根据给定的表达式对窗口进行分区（请参阅 SQL `PARTITION BY`）  |
| `orderBy(expr...)` `sort(exprList)`            | 对窗口中的行进行排序（请参阅 SQL `ORDER BY`）                |
| `allowPartial(b)`                              | 设置是否允许部分宽度窗口；默认为真                           |
| `nullWhenCountZero(b)`                         | 设置如果窗口中没有行，聚合函数是否应评估为空；默认假         |
| `as(alias)`                                    | 分配列别名（请参阅 SQL `AS`）并将其转换`OverCall`为`RexNode` |
| `toRex()`                                      | 将其转换`OverCall`为`RexNode`                                |

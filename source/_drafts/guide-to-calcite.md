---
title: Calcite 入门指南
tags: [Calcite]
categories: [Calcite]
date: 2021-10-02 15:49:50
cover: 
---



> - CsvScannableTable: 实现了 `ScannableTable` 接口可以被 scan 的 table
> - CsvFilterableTable: 实现了 `FilterableTable` 接口和上面一样只是可以被 scan 的同时 filter(其实底层实现都是 CsvEnumerator，不过上面那个 filter 传入的 nil)
> - CsvTranslatableTable: 实现了 TranslatableTable 和 QueryableTable 接口， 可以被转换成 RelNode，这里的实现是转成 CsvTableScan, 一个实现了 EnumerableRel 接口的 tableScan(后面我们会看到 enumerableRel 的实现都是生成代码 expression tree 的实现)

TranslatableTable：将 SQL 语句转换为关系代数，然后基于关系代数进行优化。如果不实现该接口，则返回 EnumerableTableScan。

> Extension to Table that specifies how it is to be translated to a relational expression.
> It is optional for a Table to implement this interface. If Table does not implement this interface, it will be converted to an org.apache.calcite.adapter.enumerable.EnumerableTableScan. Generally a Table will implement this interface to create a particular subclass of RelNode, and also register rules that act on that particular subclass of RelNode.

EnumerableRel——A relational expression of one of the EnumerableConvention calling conventions.

TableScan——Relational operator that returns the contents of a table.

CsvProjectTableScanRule——Planner rule that projects from a CsvTableScan scan just the columns needed to satisfy a projection. If the projection's expressions are trivial, the projection is removed. 优化器规则，来自CsvTableScan的项目只扫描需要满足投影的列。如果投影的表达式是平凡的，投影就被删除。

Calcite 入门使用 - I (CSV Example)——https://zhuanlan.zhihu.com/p/53725382

CsvProjectTableScanRule:

```java
  /**
   * Rule configuration.
   */
  public interface Config extends RelRule.Config {
    // 只有 CsvTableScan 在 LogicalProject 之下，并且是唯一输入才能匹配到规则
    Config DEFAULT = EMPTY.withOperandSupplier(b0
      -> b0.operand(LogicalProject.class).oneInput(b1 -> b1.operand(CsvTableScan.class).noInputs())).as(Config.class);

    @Override
    default CsvProjectTableScanRule toRule() {
      return new CsvProjectTableScanRule(this);
    }
  }

// 关系代数查询树
LogicalProject
		  |
		  |
 CsvTableScan
```

推荐阅读：

[SQL over anything with an Optiq Adapter - DZone Java](http://link.zhihu.com/?target=https%3A//dzone.com/articles/sql-over-anything-optiq%3Futm_source%3Dtuicool%26utm_medium%3Dreferral) 对了这篇文章值得一看， optiq 是 calcite 之前的名字



关系代数是关系型数据库操作的理论基础，关系代数支持并、差、笛卡尔积、投影和选择等基本运算。关系代数也是 Calcite 的核心，任何一个查询都可以表示成由`关系运算符组成的树`。在 Calcite 中，它会先将 SQL 转换成关系表达式（relational expression），然后通过规则匹配（rules match）进行相应的优化，优化会有一个成本（cost）模型为参考。

## Calcite 中的一些概念

![calcite 基本概念](http://matt33.com/images/calcite/0-calcite.png)

| 类型          | 描述                                                         | 特点                                                         |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| RelOptRule    | transforms an expression into another。对 expression 做等价转换 | 根据传递给它的 RelOptRuleOperand 来对目标 RelNode 树进行规则匹配（内部包含了 `matches(RelNode rel)` 方法，用于匹配 RelNode 树），匹配成功后，会再次调用 `matches()` 方法（默认返回真）进行进一步检查。如果 `mathes()` 结果为真，则调用 `onMatch()` 进行转换。 |
| ConverterRule | Abstract base class for a rule which converts from one calling convention to another without changing semantics. | 它是 RelOptRule 的子类，专门用来做数据源之间的转换（Calling convention），**ConverterRule 一般会调用对应的 Converter 来完成工作**，比如说：JdbcToSparkConverterRule 调用 JdbcToSparkConverter 来完成对 JDBC Table 到 Spark RDD 的转换。 |
| RelNode       | relational expression，RelNode 会标识其 input RelNode 信息，这样就构成了一棵 RelNode 树 | 代表了**对数据的一个处理操作**，常见的操作有 Sort、Join、Project、Filter、Scan 等。它蕴含的是对整个 Relation 的操作，而不是对具体数据的处理逻辑。 |
| Converter     | A relational expression implements the interface `Converter` to indicate that it converts a physical attribute, or RelTrait of a relational expression from one value to another. | **用来把一种 RelTrait 转换为另一种 RelTrait 的 RelNode**。如 JdbcToSparkConverter 可以把 JDBC 里的 table 转换为 Spark RDD。如果需要在一个 RelNode 中处理来源于异构系统的逻辑表，Calcite 要求先用 Converter 把异构系统的逻辑表转换为同一种 Convention。 |
| RexNode       | Row-level expression                                         | 行表达式（标量表达式），蕴含的是对一行数据的处理逻辑。每个行表达式都有数据的类型。这是因为在 Valdiation 的过程中，编译器会推导出表达式的结果类型。常见的行表达式包括字面量 RexLiteral， 变量 RexVariable， 函数或操作符调用 RexCall 等。 RexNode 通过 RexBuilder 进行构建。 |
| RelTrait      | RelTrait represents the manifestation of a relational expression trait within a trait definition. | 用来定义逻辑表的物理相关属性（physical property），三种主要的 trait 类型是：Convention、RelCollation、RelDistribution； |
| Convention    | Calling convention used to repressent a single data source, inputs must be in the same convention | 继承自 RelTrait，类型很少，代表一个单一的数据源，一个 relational expression 必须在同一个 convention 中； |
| RelTraitDef   |                                                              | 主要有三种：ConventionTraitDef：用来代表数据源 RelCollationTraitDef：用来定义参与排序的字段；RelDistributionTraitDef：用来定义数据在物理存储上的分布方式（比如：single、hash、range、random 等）； |
| RelOptCluster | An environment for related relational expressions during the optimization of a query. | palnner 运行时的环境，保存上下文信息；                       |
| RelOptPlanner | A RelOptPlanner is a query optimizer: it transforms a relational expression into a semantically equivalent relational expression, according to a given set of rules and a cost model. | 也就是**优化器**，Calcite 支持RBO（Rule-Based Optimizer） 和 CBO（Cost-Based Optimizer）。Calcite 的 RBO （HepPlanner）称为启发式优化器（heuristic implementation ），它简单地按 AST 树结构匹配所有已知规则，直到没有规则能够匹配为止；Calcite 的 CBO 称为火山式优化器（VolcanoPlanner）成本优化器也会匹配并应用规则，当整棵树的成本降低趋于稳定后，优化完成，成本优化器依赖于比较准确的成本估算。RelOptCost 和 Statistic 与成本估算相关； |
| RelOptCost    | defines an interface for optimizer cost in terms of number of rows processed, CPU cost, and I/O cost. | 优化器成本模型会依赖；                                       |

# 参考文档

https://zhuanlan.zhihu.com/p/53725382

http://matt33.com/2019/03/07/apache-calcite-process-flow/

https://www.infoq.cn/article/new-big-data-hadoop-query-engine-apache-calcite

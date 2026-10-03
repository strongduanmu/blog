---
layout: wiki
wiki: cmu_15_799
order: 021
title: 实现：Apache Calcite
date: 2025-04-09 08:00:00
banner: /assets/banner/banner_1.jpg
---

## 课程视频

截至 2026 年 10 月 2 日，所给 B 站收藏夹收录到第 14 讲，官网 Schedule 未提供本讲视频链接。本页依据指定论文整理。

## 从课程框架走到可嵌入的优化器

第 20 讲依据指定阅读 [Apache Calcite: A Foundational Framework for Optimized Query Processing Over Heterogeneous Data Sources](https://15799.courses.cs.cmu.edu/spring2025/papers/20-calcite/p221-begoli.pdf)整理。Calcite 提供查询表示、规则、元数据和适配器机制，宿主系统提供数据访问与具体执行能力。

如果要给已有存储引擎增加 SQL 支持，首先需要解析与校验，然后形成关系表达式，再选择宿主能执行的物理计划。Calcite 把这些阶段做成可组合组件，系统可以接入整条流程，也可以只使用其中部分能力。

## 一条 SQL 怎样进入关系优化

```sql
SELECT department, SUM(salary)
FROM employees
WHERE active = TRUE
GROUP BY department;
```

下面是教学流程与逻辑树，具体打印形式取决于版本、表结构和配置：

```text
SQL 文本
  → SqlNode：语法结构
  → Validator：表列绑定、类型与语义校验
  → SqlToRelConverter：关系表达式
  → Planner：规则与代价搜索
  → 宿主执行计划或可执行表达式

LogicalAggregate(department, SUM(salary))
  LogicalFilter(active = TRUE)
    LogicalTableScan(employees)
```

这几个阶段解决不同问题。语法正确仍可能引用不存在的列；类型正确以后，还需要把聚合、过滤和子查询转成关系结构；有了结构，才进入实现与计划选择。

## RelNode 与 RexNode 的边界

`RelNode` 表示关系算子，具有输出行类型和输入关系。`RexNode` 等对象表示算子内部的标量表达式，例如过滤条件或投影计算。

在上面的树里，Filter 是一个 `RelNode`，`active = TRUE` 是标量表达式。Join 重排改变输入列顺序时，内部字段引用也需要调整。一个逻辑等价规则只复制标量表达式、却未更新列映射，会产生错误结果。

Calcite 的 `RelBuilder` 支持直接构造关系树，无须每次从 SQL 文本开始。[官方关系代数文档](https://calcite.apache.org/docs/algebra.html)提供了构造与打印示例。本文代码用于解释流程，不假设已有可运行的 Java 工程。

### 字段序号跟随行类型，规则必须更新映射

构造一张教学输入，列顺序为 `(id, department, salary, active)`。过滤里的 active 引用第 4 列，聚合里的 department 与 salary 分别引用第 2、3 列。Calcite 的标量输入引用通过行类型和字段位置确定，不能把字段名相同简单视为同一个引用。

如果列裁剪后输入只留下 `(department, salary, active)`，原先字段位置就发生变化：department、salary、active 分别变为第 1、2、3 列。规则构造新 Filter 与 Aggregate 时要同步调整引用。上面的序号按读者习惯从 1 开始；实际程序中的输入引用索引通常从 0 开始。

Join 交换也有相同问题。原输入为左表列在前、右表列在后，交换输入以后既要改 Join 条件的引用，也要恢复对外输出列的对应关系。结果类型、字段序号与表达式映射共同构成规则正确性的一部分。

## Trait 怎样表达执行要求

Trait 描述计划需要或提供的特征。常见对象包括 `Convention`（执行约定）、`RelCollation`（排序属性）和 `RelDistribution`（分布属性）。宿主需要配置相应 Trait 定义和转换能力，才能让属性参与自己的搜索。

Convention 标识计划应由哪种执行体系理解。例如逻辑表示、Calcite 的 Enumerable 体系以及某个远端适配器的执行约定，可以对应不同类别节点。Converter Rule 描述它们之间如何转换。

```text
目标：将结果交给本地执行体系

方案一：本地 Filter
          从远端取回全部 employees

方案二：远端 Filter
          将过滤后的结果转换为本地输入
```

第二种方案减少传输，前提是远端能按相同语义执行 `active = TRUE`。转换还可能改变排序、类型或数据组织，必须由节点属性和成本说明。

## VolcanoPlanner 的等价集与子集

在 `VolcanoPlanner` 中，`RelSet` 表达逻辑等价的关系表达式集合，`RelSubset` 对同一集合中不同 Trait 组合进行区分。它们帮助复用等价结构，同时为不同执行约定和属性记录有用实现。

同一个员工过滤结果，可以有远端约定、本地 Enumerable 约定等子集。父算子请求某种约定后，搜索需要通过实现或转换规则连到可用候选。只有逻辑节点而缺少物理实现规则时，搜索可能无法完成目标。

`HepPlanner` 主要用于按程序组织规则改写，`VolcanoPlanner` 用于基于代价的候选搜索。宿主可以组合它们，例如先规范化结构，再进行物理选择。各版本的调度和默认配置可能变化，分析具体实现时应固定版本；本页侧重论文与框架概念。

## 规则怎样让下推成为候选

假设远端数据源支持过滤和聚合，适配器可以提供相应节点与规则，把逻辑 Filter、Aggregate 转为远端实现，再在边界引入本地转换。

```text
本地 Aggregate
  本地 Filter
    远端 Scan → 本地转换

远端 Aggregate
  远端 Filter
    远端 Scan
  → 本地转换
```

这是计划形状示意。第二条路径可能传输更少的行，但远端计算成本、函数能力、字符比较和空值语义都会影响合法性与收益。[适配器文档](https://calcite.apache.org/docs/adapter.html)介绍了接入数据模型与访问能力的扩展点。

规则的 Pattern 匹配结构，条件函数检查前提，替换结果提供等价候选。被规则命中以后仍需有适当的代价与属性，候选才可能被选中。

## Metadata 与 Cost 怎样影响选择

元数据包含行数、选择率、唯一性等信息。`RelMetadataQuery` 为优化过程中访问这些信息提供统一入口，宿主可以提供自定义处理器；缺少统计时，默认估计可能无法反映真实数据。

物理节点还需要计算成本，体现 CPU、I/O、网络或宿主特有开销。异构查询中，两侧各自的相对成本必须能够放到同一比较体系里，否则便宜的转换边界可能只是模型缺项。

例如远端执行聚合后返回 100 行，本地读取原始一百万行后聚合。如果模型忽略传输，一些下推收益就不会被正确比较；如果忽略远端限制，又可能高估远端方案的价值。

### 两个 Convention 子集怎样通过转换连起来

设适配器约定名为 Remote，本地约定为 Local，这两个名称仅作教学示意。员工过滤结果属于同一个逻辑等价集合，可以有以下实现与边界：

```text
RelSet：active 员工的关系结果
  Remote 子集：RemoteFilter(RemoteScan)
  Local 子集：LocalFilter(RemoteToLocal(RemoteScan))
  Local 子集：RemoteToLocal(RemoteFilter(RemoteScan))
```

后两条都满足本地执行目标，一个取回所有员工再过滤，另一个取回已经过滤的员工。Converter 构成约定之间的可执行通道，Filter 下推规则则提供远端过滤实现。两类能力分别注册以后，完整候选才连得起来。

若只注册远端 Filter，却没有 Remote 到 Local 的转换，根目标仍可能无法完成；若只有转换没有远端 Filter，实现只能回到本地过滤。候选都可行以后，成本模型再决定选哪条路径。

给出一组人为设定的成本：远端扫描与传输一百万行合计 100，本地过滤成本 10；远端扫描过滤成本 30，传输一千行成本 1。两条本地完整候选成本分别为 110 与 31。模型若把传输成本都写成 0，就会改变比较依据，无法反映下推减少的数据量。

### 元数据查询也跟随改写后的逻辑结果

Filter 输出行数应从输入行数和条件选择率得到；Aggregate 输出行数依赖分组键的不同组合数量；Join 可能需要唯一性与关联信息。规则改变树以后，后续估计应针对新节点和新逻辑关系计算。

自定义元数据处理器要处理自己认识的节点，并在未知情况沿系统的委托或回退机制取得定义明确的结果。把未知统计当成精确 0，会让合法候选看起来免费，影响 Join 方向和资源判断。宿主应在调试输出中区分已知统计、模型估计与未知信息。

这条分析路径与课程中的接口一一对应：RelNode 暴露结构，Trait 表达执行需求，规则提供等价候选，Metadata 提供规模，Cost 把实现工作转换为选择依据。排查一条未下推的查询时，沿这个依赖顺序才能定位缺失环节。

## 顺着案例排查一条未下推的计划

先查看校验后的关系树，确认过滤仍引用预期列；再确认适配器能表示该条件、对应规则已经注册。然后检查目标 Convention 是否可达，转换节点和属性是否一致，最后比较元数据与成本。

这个顺序能把“规则没有匹配”“物理实现不可行”“候选合法但更贵”区分开来。深入源码时，可继续参考本站[VolcanoPlanner 分析](/blog/deep-understand-of-apache-calcite-volcano-planner.html)，其中以固定版本跟踪具体对象和调用过程。

## 参考资料

- [Apache Calcite: A Foundational Framework for Optimized Query Processing Over Heterogeneous Data Sources](https://15799.courses.cs.cmu.edu/spring2025/papers/20-calcite/p221-begoli.pdf) (E. Begoli et al., SIGMOD 2018) *(Primary)*

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

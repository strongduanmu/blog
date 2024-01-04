---
title: 深入理解 Apache Calcite ValcanoPlanner 优化器
tags: [Calcite]
categories: [Calcite]
banner: china
date: 2023-12-06 08:17:59
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
references:
  - title: 'Apache Calcite 优化器详解（二）'
    url: https://matt33.com/2019/03/17/apache-calcite-planner/
  - title: '万字详解 Calcite Volcano 优化器'
    url: https://zhuanlan.zhihu.com/p/640328243
  - title: 'Apache Calcite VolcanoPlanner 优化过程解析'
    url: https://zhuanlan.zhihu.com/p/283362100
  - title: 'Calcite Volcano Planner'
    url: https://aaaaaaron.github.io/2020/02/09/Calcite-Volcano-Planner/
  - title: 'Calcite 分析 - Volcano 模型'
    url: https://www.cnblogs.com/fxjwind/p/11325753.html
  - title: 'Traditional Query Optimization'
    url: https://note.youdao.com/s/2FGoKAwV
  - title: '揭秘 TiDB 新优化器：Cascades Planner 原理解析'
    url: https://cn.pingcap.com/blog/tidb-cascades-planner/
  - title: 'The Volcano Optimizer Generator: Extensibility and Efficient Search'
    url: https://15721.courses.cs.cmu.edu/spring2019/papers/22-optimizer1/graefe-icde1993.pdf
  - title: 'The Cascades Framework for Query Optimization'
    url: https://15721.courses.cs.cmu.edu/spring2018/papers/15-optimizer1/graefe-ieee1995.pdf
---

> 注意：本文基于 [Calcite 1.35.0](https://github.com/apache/calcite/tree/75750b78b5ac692caa654f506fc1515d4d3991d6) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

在上一篇[深入理解 Apache Calcite HepPlanner 优化器](https://strongduanmu.com/blog/deep-understand-of-apache-calcite-hep-planner.html)一文中，我们介绍了查询优化器的基本概念和用途，并结合 Calcite `HepPlanner` 深入分析了`启发式优化器`的实现原理。启发式优化器使用相对简单，它直接对逻辑执行计划进行等价变换从而实现 SQL 优化，常见的启发式优化包含了：`列裁剪`、`谓词下推`等。启发式优化器实现简单，自然也存在一些缺陷，例如：它对执行的顺序有要求，不同的执行顺序可能会导致优化规则的失效，使得优化达不到预期的效果。

正是由于启发式优化器存在这些问题，使得它无法适应所有的 SQL 场景，因此当前主流的数据库系统更多是使用`基于代价的优化器`，或者将两者结合使用。基于代价的优化器能够为多个等价的执行计划生成代价 `Cost` 信息，然后选择代价最小的选项作为最终的执行计划，从而达到提升 SQL 执行效率的目的。

本文将重点为大家介绍 Calcite 中基于代价的优化器 `VolcanoPlanner`，首先我们会了解 VolcanoPlanner 背后的理论基础——`Volcano/Cascades Optimizer`，然后会介绍 VolcanoPlanner 的核心概念以及执行流程，最后再深入探究 Calcite VolcanoPlanner 的源码细节，结合一些实际的 SQL 优化案例，期望能够让大家彻底搞懂 VolcanoPlanner 优化器。

## Volcano/Cascades 优化器

Calcite VolcanoPlanner 优化器是基于 `Goetz Graefe` 的两篇经典优化器论文 [The Volcano Optimizer Generator: Extensibility and Efficient Search](https://15721.courses.cs.cmu.edu/spring2019/papers/22-optimizer1/graefe-icde1993.pdf) 和 [The Cascades Framework for Query Optimization](https://15721.courses.cs.cmu.edu/spring2018/papers/15-optimizer1/graefe-ieee1995.pdf) 实现的，因此在探究 VolcanoPlanner 优化器实现细节之前，让我们先来回顾下这两篇论文的核心思想，方便后续的学习和理解。

### Volcano 优化器生成器

`Volcano Optimizer Generator` 的定位是一个优化器的`生成器`，其核心贡献是提供了一个搜索引擎。论文中提出了数据库查询优化器的基本框架，数据库实现者只需要为自己的 `Data Model` 实现相应的接口，便可以实现一个查询优化器。本文暂时忽略`生成器`相关的概念，只介绍论文在`优化器`方面提出的一些思路：

* Volcano Optimizer 使用两阶段优化的方式，它使用 `Logical Algebra` 来表示各种关系代数算子，而使用 `Physical Algebra` 来表示各种关系代数算子的实现算法。Logical Algebra 之间使用 `Transformation` 来完成变换，而 Logical Algebra 到 Physical Algebra 之间的转换则基于代价（`Cost-Based`）进行选择；

* Volcano Optimizer 中的变化都使用 `Rule` 来描述。例如 Logical Algebra 之间的变化使用 `Transformation Rule`，而 Logical Algebra 到 Physical Algebra 之间的转换使用 `Implementation Rule`；

* Volcano Optimizer 中各个算子、表达式的结果使用 `Property` 来表示。`Logical Propery` 可以从 Logical Algebra 中提取，主要包括算子的 Schema、统计信息等。`Physical Property` 可以从 Physical Algebra 中提取，表示算子所产生的数据具有的物理属性，比如按照某个 Key 排序、按照某个 Key 分布在集群中等；

* Volcano Optimizer 的搜索采用`自顶向下的动态规划算法`（记忆化搜索）。

### Cascades 优化器

`Cascades Optimizer` 是对 `Volcano Optimizer` 的进一步优化，Cascades Optimizer 提出了 `Memo`、`Rule`、`Pattern` 和 `Search Algorithm` 等基本概念，下面我们将围绕这些概念一一进行介绍。

#### Memo 数据结构

Cascades Optimizer 在搜索的过程中，它的搜索空间是一个关系代数算子树所组成的森林，而保存这个森林的数据结构就是 `Memo`。Memo 包含了两个最基本的概念：`Expression Group`（下文简称 `Group`） 和 `Group Expression`（对应关系代数算子）。每个 Group 中保存的是逻辑等价的 Group Expression，而 Group Expression 的子节点是由 Group 组成。下图是由五个 Group 组成的 Memo：

![Memo 组成结构](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/08/1701996404.png)

通过上面的 Memo 结构，我们可以提取出以下两棵等价的算子树，使用 Memo 结构存储下面两棵树，可以避免存储冗余的算子（如 `Scan A` 以及 `Scan B`）。

![等价算子树](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/08/1701996456.png)

#### Rule 的改进

在 Volcano Optimizer 中，Rule 被分为了 `Transformation Rule` 和 `Implementation Rule` 两种。其中 Transformation Rule 用来在 Memo 中添加等价的关系代数算子。Transformation Rule 具有原子性，只作用于算子树的一个局部小片段，每个 Transformation Rule 都有自己的匹配条件，通过不停的应用匹配上的 Transformation Rule 来扩展搜索空间，寻找可能的最优解。Implementation Rule 则是为 Group Expression 选择物理算子。在 Cascades Optimizer 中，不再区分这两类 Rule。

#### Pattern 匹配规则

`Pattern` 用于描述 Group Expression 的局部特征。每个 Rule 都有自己的 Pattern，只有满足了相应 Pattern 的 Group Expression 才能够应用该 Rule。下图中左侧定义了一个 `Selection -> Projection` 的 Pattern，并在右侧 Memo 中红色虚线内匹配上了 Group Expression。

![Pattern 匹配关系代数算子](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/08/1701996507.png)

#### Searching Algorithm

Cascades Optimizer 为 Rule 的应用顺序做了细致的设计，例如每个 Rule 都有 `promise` 和 `condition` 两个方法，其中 `promise` 用来表示 Rule 在当前搜索过程中的重要性，`promise` 值越高，则该规则越可能有用，当 `promise` 值小于等于 0 时，这个 Rule 就不会被执行。而 `condition` 直接通过返回一个布尔值决定一个 Rule 是否可以在当前过程中被应用。当一个 Rule 被成功应用之后，会计算下一步有可能会被应用的 Rule 的集合。

Cascades Optimizer 的搜索算法与 Volcano Optimizer 有所不同，Volcano Optimizer 将搜索分为两个阶段，在第一个阶段枚举所有逻辑等价的 Logical Algebra，而在第二阶段运用动态规划的方法自顶向下地搜索代价最小的 Physical Algebra。Cascades Optimizer 则将这两个阶段融合在一起，通过提供一个 `Guidance` 来指导 Rule 的执行顺序，**在枚举逻辑等价算子的同时也进行物理算子的生成**，这样做可以避免枚举所有的逻辑执行计划，但是**其弊端就是错误的 Guidance 会导致搜索在局部收敛，因而搜索不到最优的执行计划**。

Volcano/Cascades Optimzier 都使用了 `Branch-And-Bound` 方法对搜索空间进行剪枝。由于两者都采用了自顶向下的搜索，在搜索的过程中可以为算子设置其 `Cost Upper Bound`，如果在向下搜索的过程中还没有搜索到叶子节点就超过了预设的 Cost Upper Bound，就可以对这个搜索分支预先进行剪枝。

## VolcanoPlanner 基础介绍

前面部分我们介绍了 Volcano/Cascades 优化器的理论基础，想必大家已经对优化器的原理有了一些基础的认识。为了避免陷入代码细节，我们学习 VolcanoPlanner 之前，先来了解下 VolcanoPlanner 中涉及到的核心概念，理解这些概念会让我们阅读源码更加轻松。然后我们会从整体角度，再来学习下 VolcanoPlanner 的处理流程，看看 Calcite 逻辑计划是如何优化并转换为物理执行计划的。

### 核心概念

#### RelNode

Caclite 源码中对 RelNode 的定义为 `A RelNode is a relational expression`，即关系代数表达式，RelNode 继承 RelOptNode 接口，表示可以被优化器优化。关系代数表达式用于处理数据，所以他们通常使用动词命名，例如：`Sort`、`Join`、`Project`、`Filter`、`Scan` 等。在 Caclite 中，不建议直接实现 RelNode 接口，而是推荐继承 `AbstractRelNode` 抽象类。

AbstractRelNode 抽象类的核心属性和方法如下：

```java
public abstract class AbstractRelNode implements RelNode {

  	/**
     * RelTraitSet that describes the traits of this RelNode.
     */
    protected RelTraitSet traitSet;

    @Pure
    @Override
    public final @Nullable Convention getConvention(@UnknownInitialization AbstractRelNode this) {
        return traitSet == null ? null : traitSet.getTrait(ConventionTraitDef.INSTANCE);
    }
  
    @Override
    public final RelDataType getRowType() {
        if (rowType == null) {
            rowType = deriveRowType();
            assert rowType != null : this;
        }
        return rowType;
    }

    @Override
    public void register(RelOptPlanner planner) {
        Util.discard(planner);
    }

    @Override
    public List<RelNode> getInputs() {
        return Collections.emptyList();
    }

    @Override
    public double estimateRowCount(RelMetadataQuery mq) {
        return 1.0;
    }

    @Override
    public @Nullable RelOptCost computeSelfCost(RelOptPlanner planner, RelMetadataQuery mq) {
        // by default, assume cost is proportional to number of rows
        double rowCount = mq.getRowCount(this);
        return planner.getCostFactory().makeCost(rowCount, rowCount, 0);
    }
}
```

* `traitSet` 用于记录当前 RelNode 的物理特征 `RelTrait`，Calcite 中提供了 `Convention` 、`RelCollation` 和 `RelDistribution` 3 种物理特征，分别表示调用约定（代表某一种数据源，不同数据源上的算子需要使用 Converter 进行转换）、排序和分布特征；
* `getConvention` 方法是用于获取当前 RelNode 中记录的 Convention 特征；
* `getRowType` 用于获取当前数据行的类型信息，RelNode 根节点的 RelDataType 可以代表最终查询结果的行记录类型信息；
* `getInputs` 用于获取当前 RelNode 的子节点，RelNode 通过 inputs 组织成一个树形结构；
* `estimateRowCount` 方法用于估计当前 RelNode 返回的行数，行数信息可以用来计算 RelNode 的代价 Cost；
* `computeSelfCost` 方法用于计算当前 RelNode 的代价 Cost；
* `register` 方法用于注册当前 RelNode 特有的优化规则，例如：`InnodbTableScan` 实现了 register 方法，注册了和 `InnodbTableScan` 这类 RelNode 相关的优化规则。

#### RelSet

Calcite 对 `RelSet` 的定义为 `A RelSet is an equivalence-set of expressions`，即一组等价的关系代数集合，同一个 RelSet 中的关系代数具有相同的调用规约（Calling Convention）。RelSet 类中的核心属性如下：

```java
class RelSet {
  
    // 等价的关系代数集合
    final List<RelNode> rels = new ArrayList<>();

  	// 物理属性相同的等价关系代数集合
    final List<RelSubset> subsets = new ArrayList<>();
    
  	// 等价的 RelSet
    @MonotonicNonNull RelSet equivalentSet;
}
```

* RelSet 类是等价关系代数的集合类，不是 RelNode；
* 等价的关系代数集合存储在 `rels` 中，他们具有相同的调用规约，但是其他物理属性可能不相同，例如：RelCollation 和 RelDistribution；
* 物理属性相同的等价关系代数集合会存储在 `subsets` 中，`RelSubset` 对象会根据物理属性对关系代数进行归类，相同物理属性的关系代数会存储在同一个 RelSubset 中。

#### RelSubset

Caclite 对 `RelSubset` 的定义为 `Subset of an equivalence class where all relational expressions have the same physical properties.`，即 RelSet 等价类的子集，它会按照物理属性将关系代数 RelNode 进行分类，物理属性相同的 RelNode 会在同一个 RelSubSet 中。RelSubset 类中的核心属性如下：

```java
public class RelSubset extends AbstractRelNode {
    
    /**
     * Cost of best known plan (it may have improved since).
     */
    RelOptCost bestCost;
    
    /**
     * The set this subset belongs to.
     */
    final RelSet set;
    
    /**
     * Best known plan.
     */
    @Nullable RelNode best;
    
    /**
     * Returns the rel nodes in this rel subset.  All rels must have the same
     * traits and are logically equivalent.
     *
     * @return all the rels in the subset
     */
    public Iterable<RelNode> getRels() {
        return () -> Linq4j.asEnumerable(set.rels).where(v1 -> v1.getTraitSet().satisfies(traitSet)).iterator();
    }
}
```

* RelSubset 实现了 `AbstractRelNode`，是一个特殊的关系代数 RelNode；
* RelSubSet 中记录了**物理属性相同的关系代数 RelNode**，并且这些关系代数不是直接存储在 RelSubSet 中，而是通过引用 RelSet 对象并通过 traitSet 过滤得到；
* RelSubSet 会计算内部关系代数的**最优代价 bestCost**，并记录当前**最优的执行计划 best**，bestCost 和 best 会随着优化的执行而不断更新。

### 处理流程

介绍完 VolcanoPlanner 中的核心概念，让我们再来了解下 Calcite 优化器的处理流程，Julain 在 2016 年举办的 Hadoop Summit 大会上分享了 [Cost-based Query Optimization in Apache Phoenix using Apache Calcite](https://calcite.apache.org/community/#cost-based-query-optimization-in-apache-phoenix-using-apache-calcite)，其中介绍了 Caclite 优化器的处理流程，虽然已经过去了很久，但是仍然可以作为 VolcanoPlanner 的参考资料。

![Calcite Volcano Planner 处理流程](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/09/1702118316.png)

上图展示了 VolcanoPlanner 的处理流程，可以看到 SQL 语句被解析为 AST 后，通过 SqlToRelConverter 将 AST 转换为 RelNode 和 RexNode。RelNode Tree 就是我们常说的逻辑执行计划。方框内是 VolcanoPlanner 的核心流程，主要包含了如下几个关键步骤：

* 将匹配的规则 Rule 添加到 `RuleQueue` 中，Calcite 提供了 `IterativeRuleQueue` 和 `TopDownRuleQueue`；

* 应用匹配的规则 Rule，对 RelNode Tree 进行转换；

* 进行相应的迭代，直到 RuleQueue 中的 Rule 全部迭代完成或者代价 Cost 不再变化；

* 基于 RelNode 的代价和深度匹配 `Importance`，Importance 描述了 RuleMatch 的重要程度，Importance 大的优先处理，每一轮迭代都会实时调整。

除了以上的几个关键步骤外，图中还描述了 VolcanoPlanner 中的重要组成部分：`计划树（Plan Tree）`、`优化规则（Rules）`、`代价模型（Cost Model）` 和 `元数据提供器（Metadata Providers）`。计划树通过前文介绍的 RelSet 和 RelSubset 维护了优化过程中所需的数据结构，优化规则用于对 RelNode 进行优化，以生成等价且更优的关系代数，代价模型用于计算 RelNode 的代价和累积代价，元数据提供器则提供了代价计算所需的一些统计信息，例如：Filter 选择性、Join 选择性等。这些组成部分在 VolcanoPlanner 中相互配合，共同完成了优化过程，在下面的源码探秘部分，我们将一一进行研究学习。

## VolcanoPlanner 源码探秘

介绍完 VolcanoPlanner 中的核心概念和基础流程，想必大家对 VolcanoPlanner 已经有了初步地认识，但是想要彻底理解 VolcanoPlanner，还需要结合一些案例，对源码进行深入学习理解，才能知其然知其所以然。本小节将以 `CsvTest#testSelectSingleProjectGz` 测试 Case 为例，和大家一起探秘 VolcanoPlanner 源码。如下展示了测试 Case，使用了 `smart` 模型，表示使用 `TranslatableTable` 进行优化处理。

```java
@Test
void testSelectSingleProjectGz() throws SQLException {
    sql("smart", "select * from EMPS where name = 'Alice'").ok();
}
```

### VolcanoPlanner 初始化

首先，我们来跟踪下 VolcanoPlanner 初始化流程，看下在初始化阶段，优化器都做了哪些准备工作。执行示例程序，在 [CalcitePrepareImpl#createPlanner](https://github.com/apache/calcite/blob/967bb5acc5448bc8d6ee9b9f5fa3c5f0d71405c2/core/src/main/java/org/apache/calcite/prepare/CalcitePrepareImpl.java#L438) 方法中，我们可以看到如下初始化逻辑：

```java
/**
 * Creates a query planner and initializes it with a default set of rules.
 */
protected RelOptPlanner createPlanner(final CalcitePrepare.Context prepareContext, @Nullable Context externalContext, @Nullable RelOptCostFactory costFactory) {
    if (externalContext == null) {
        externalContext = Contexts.of(prepareContext.config());
    }
  	// 初始化 VolcanoPlanner，允许用户传入代价工厂 costFactory，默认使用 VolcanoCost.FACTORY
    final VolcanoPlanner planner = new VolcanoPlanner(costFactory, externalContext);
  	// 设置标量表达式 scalar expressions 的执行器
    planner.setExecutor(new RexExecutorImpl(DataContexts.EMPTY));
    planner.addRelTraitDef(ConventionTraitDef.INSTANCE);
    if (CalciteSystemProperty.ENABLE_COLLATION_TRAIT.value()) {
        planner.addRelTraitDef(RelCollationTraitDef.INSTANCE);
    }
  	// 是否开启自顶向下优化，会根据该参数是否开启，初始化不同类型的 RuleDriver 和 RuleQueue
    planner.setTopDownOpt(prepareContext.config().topDownOpt());
  	// 注册默认优化规则
    RelOptUtil.registerDefaultRules(planner, prepareContext.config().materializationsEnabled(), enableBindable);
    return planner;
}
```

创建 VolcanoPlanner 对象时，允许用户传入 `costFactory` 代价工厂，默认会使用 `VolcanoCost.FACTORY` 工厂类。初始化优化器时，同时会设置标量表达式（`scalar expressions`）执行器，负责计算表达式的结果。`setTopDownOpt` 方法会根据配置判断是否开启自顶向下优化，该配置默认为 false，同时会根据该参数初始化 `RuleDriver` 和 `RuleQueue`，本文先关注 Calcite 默认的 `IterativeRuleDriver` 和 `IterativeRuleQueue`，后续文章会再探讨 `Volcano & Cascades` 论文中提出的 `TopDownRuleDriver` 和 `TopDownRuleQueue`。

`RelOptUtil.registerDefaultRules` 方法会注册默认的优化规则，内部调用 `planner.addRule` 方法，将规则记录在优化器父类 `AbstractRelOptPlanner` 的 `mapDescToRule` 属性中。

```java 
@Experimental
public static void registerDefaultRules(RelOptPlanner planner, boolean enableMaterializations, boolean enableBindable) {
    if (CalciteSystemProperty.ENABLE_COLLATION_TRAIT.value()) {
        registerAbstractRelationalRules(planner);
    }
    registerAbstractRules(planner);
    registerBaseRules(planner);
    
    if (enableMaterializations) {
        registerMaterializationRules(planner);
    }
    if (enableBindable) {
        for (RelOptRule rule : Bindables.RULES) {
            planner.addRule(rule);
        }
    }
    planner.addRule(Bindables.BINDABLE_TABLE_SCAN_RULE);
    planner.addRule(CoreRules.PROJECT_TABLE_SCAN);
    planner.addRule(CoreRules.PROJECT_INTERPRETER_TABLE_SCAN);
    
    if (CalciteSystemProperty.ENABLE_ENUMERABLE.value()) {
        registerEnumerableRules(planner);
        planner.addRule(EnumerableRules.TO_INTERPRETER);
    }
    
    if (enableBindable && CalciteSystemProperty.ENABLE_ENUMERABLE.value()) {
        planner.addRule(EnumerableRules.TO_BINDABLE);
    }
    
    if (CalciteSystemProperty.ENABLE_STREAM.value()) {
        for (RelOptRule rule : StreamRules.RULES) {
            planner.addRule(rule);
        }
    }
    
    planner.addRule(CoreRules.FILTER_REDUCE_EXPRESSIONS);
}
```

Calcite JDBC 默认注册了 101 个优化规则，这些优化规则的作用，我们后续文章会进行分类学习，在实际使用中可以选择自己需要的优化规则去使用。到这里，Calicte 就完成了 VolcanoPlanner 的优化，并默认注册了 101 个优化规则。

![Calcite JDBC 默认注册的规则](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/17/1702769869.png)

### setRoot 流程

VolcanoPlanner 初始化完成后，又会调用 SqlParser 进行 SQL 解析，并使用 SqlToRelConverter 将 AST 转换为 RelNode 逻辑执行计划，可以得到如下的 Logical Plan：

```
LogicalProject(EMPNO=[$0], NAME=[$1], DEPTNO=[$2], GENDER=[$3], CITY=[$4], EMPID=[$5], AGE=[$6], SLACKER=[$7], MANAGER=[$8], JOINEDAT=[$9])
  LogicalFilter(condition=[=($1, 'Alice')])
    CsvTableScan(table=[[SALES, EMPS]], fields=[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]])
```

Calcite JDBC 流程中将优化器的调用封装在了 `Program` 中，如下示例展示了调用逻辑，最核心的方式是 `setRoot` 和 `findBestExp`，本小节先关注 `setRoot` 方法的实现逻辑，看看示例中的两次 setRoot 都进行了哪些处理。

```java
/**
 * Returns the standard program with user metadata provider.
 */
public static Program standard(RelMetadataProvider metadataProvider) {
    final Program program1 = (planner, rel, requiredOutputTraits, materializations, lattices) -> {
        for (RelOptMaterialization materialization : materializations) {
            planner.addMaterialization(materialization);
        }
        for (RelOptLattice lattice : lattices) {
            planner.addLattice(lattice);
        }
        // setRoot 设置 RelSubset 根节点        
        planner.setRoot(rel);
        // 变换 trait 属性，将 Convention NONE 变换为 ENUMERABLE
        final RelNode rootRel2 = rel.getTraitSet().equals(requiredOutputTraits)
                ? rel : planner.changeTraits(rel, requiredOutputTraits);
        assert rootRel2 != null;
        // setRoot 设置 RelSubset 根节点
        planner.setRoot(rootRel2);
        final RelOptPlanner planner2 = planner.chooseDelegate();
        // 查找最佳执行计划
        final RelNode rootRel3 = planner2.findBestExp();
        assert rootRel3 != null : "could not implement exp";
        return rootRel3;
    };
    
    return sequence(subQuery(metadataProvider), new Programs.DecorrelateProgram(),
            new Programs.TrimFieldsProgram(), program1, calc(metadataProvider));
}
```

#### 第一轮 setRoot

第一次调用 `setRoot` 方法，直接传递了原始的 RelNode，未进行 Trait 变换，`setRoot` 方法负责将 RelNode Tree 转换为 RelSubset Tree，并设置到 VolcanoPlanner 中的 `root` 属性中。如下是 `setRoot` 的代码实现，`registerImpl` 是其核心逻辑。

```java
// RelSubset 根节点
protected @MonotonicNonNull RelSubset root;

@Override
public void setRoot(RelNode rel) {
  	// 核心逻辑
    this.root = registerImpl(rel, null);
    if (this.originalRoot == null) {
        this.originalRoot = rel;
    }
    
    rootConvention = this.root.getConvention();
    ensureRootConverters();
}
```

`registerImpl` 方法用于注册新的关系代数表达式，并将匹配的规则加入到队列中。如果 `set`（等价集合） 参数不为 null，则将当前表达式加入到等价集合中，如果已经注册了相同的表达式，则无需将其加入到等价集合以及队列中。

```java
private RelSubset registerImpl(RelNode rel, @Nullable RelSet set) {
    // 如果 rel 已经是 RelSubset，则直接调用 registerSubset 注册
    if (rel instanceof RelSubset) {
        return registerSubset(set, (RelSubset) rel);
    }
    ...
    // Ensure that its sub-expressions are registered.
    // 监听该表达式将要注册的通知
    rel = rel.onRegister(this);
  	...
}
```

##### onRegister

第一次调用 `setRoot` 方法时，`rel` 参数为 `LogicalProject`，因此会调用后续逻辑进行处理，`onRegister` 方法会确保 RelNode 的子节点也注册生成 RelSubset。`AbstractRelNode#onRegister` 方法实现逻辑如下，`getInputs` 方法会获取当前 RelNode 的子节点（返回 LogicalFilter 子节点），并调用 `VolcanoPlanner#ensureRegistered` 方法，确保所有的子节点都会进行注册，然后重新 copy 生成新的 RelNode。

```java
@Override
public RelNode onRegister(RelOptPlanner planner) {
  	// 获取子节点
    List<RelNode> oldInputs = getInputs();
    List<RelNode> inputs = new ArrayList<>(oldInputs.size());
    for (final RelNode input : oldInputs) {
      	// 调用 VolcanoPlanner#ensureRegistered 注册子节点
        RelNode e = planner.ensureRegistered(input, null);
        assert e == input || RelOptUtil.equal("rowtype of rel before registration", input.getRowType(), "rowtype of rel after registration", e.getRowType(), Litmus.THROW);
        inputs.add(e);
    }
    RelNode r = this;
    if (!Util.equalShallow(oldInputs, inputs)) {
      	// 复制生成新的 RelNode
        r = copy(getTraitSet(), inputs);
    }
  	// 重新计算 Digest 摘要信息，是 RelNode 的唯一标识
    r.recomputeDigest();
    return r;
}
```

`VolcanoPlanner#ensureRegistered` 方法会对当前子节点 LogicalFilter 进行注册，先调用 getSubset 从 `mapRel2Subset` 获取当前 RelNode 对应的 RelSubset，如果不存在则调用 `VolcanoPlanner#register` 方法进行注册。 

```java
// 维护已注册的 RelNode 和 RelSubset 映射关系
private final IdentityHashMap<RelNode, RelSubset> mapRel2Subset = new IdentityHashMap<>();

@Override
public RelSubset ensureRegistered(RelNode rel, @Nullable RelNode equivRel) {
    RelSubset result;
    // 从 mapRel2Subset 中获取 RelSubset
    final RelSubset subset = getSubset(rel);
    if (subset != null) {
        if (equivRel != null) {
            final RelSubset equivSubset = getSubsetNonNull(equivRel);
            // 如果当前节点的等价集合和已知的等价集合不同，则进行合并
            if (subset.set != equivSubset.set) {
                merge(equivSubset.set, subset.set);
            }
        }
        result = canonize(subset);
    } else {
        // 如果 RelSubset 为空则进行注册
        result = register(rel, equivRel);
    }
		...
    return result;
}
```

`VolcanoPlanner#register` 方法会调用 `VolcanoPlanner#registerImpl` 对 LogicalFilter 节点进行注册，然后逻辑又重新回到了 `VolcanoPlanner#registerImpl` 方法。`onRegister` 方法会对 LogicalFilter 节点的子节点 `CsvTableScan` 进行注册，由于 CsvTableScan 节点没有子节点，因此在 onRegister 方法处理时会中断递归，此外，由于没有子节点，CsvTableScan 会返回当前 RelNode。

```java
@Override
public RelNode onRegister(RelOptPlanner planner) {
    // 获取子节点
    List<RelNode> oldInputs = getInputs();
    List<RelNode> inputs = new ArrayList<>(oldInputs.size());
    for (final RelNode input : oldInputs) {
        ...
    }
    RelNode r = this;
    if (!Util.equalShallow(oldInputs, inputs)) {
        // 复制生成新的 RelNode
        r = copy(getTraitSet(), inputs);
    }
    // 重新计算 Digest 摘要信息，是 RelNode 的唯一标识
    r.recomputeDigest();
    return r;
}
```

然后优化器会从双端队列 ruleCallStack 中获取首个元素，并记录到 `provenanceMap` 中，provenanceMap 用于记录 RelNode 的来源，包括 `UnknownProvenance`、`DirectProvenance` 和 `RuleProvenance`。如果当前参数的 RelSet 为 null，则会创建一个 RelSet 并添加到 `allSets` 中。`registerClass` 方法允许 RelNode 注册自己特有的优化规则，本案例中 `CsvTableScan` 注册了 `CsvRules.PROJECT_SCAN` 规则。完成规则注册后，优化器会调用 addRelToSet 和 fireRules 方法，这部分是 VolcanoPlanner 的核心逻辑，下面我们来一起深入分析下。

```java
private RelSubset registerImpl(RelNode rel, @Nullable RelSet set) {
    if (rel instanceof RelSubset) {
        return registerSubset(set, (RelSubset) rel);
    }
    // Ensure that its sub-expressions are registered.
    rel = rel.onRegister(this);
    // Record its provenance. (Rule call may be null.)
    // 从双端队列中获取 VolcanoRuleCall，并记录到 provenanceMap 中
    final VolcanoRuleCall ruleCall = ruleCallStack.peek();
    if (ruleCall == null) {
        provenanceMap.put(rel, Provenance.EMPTY);
    } else {
        provenanceMap.put(rel, new RuleProvenance(ruleCall.rule, ImmutableList.copyOf(ruleCall.rels), ruleCall.id));
    }
    ...
    // Place the expression in the appropriate equivalence set.
    // 如果当前 RelSet 为空，则创建一个 RelSet 并添加到 allSets 中
    if (set == null) {
        set = new RelSet(nextSetId++, Util.minus(RelOptUtil.getVariablesSet(rel), rel.getVariablesSet()), RelOptUtil.getVariablesUsed(rel));
        this.allSets.add(set);
    }
    ...
    // Allow each rel to register its own rules.
    // 触发当前 RelNode#register 方法，允许注册自己的优化规则
    // CsvTableScan#register 方法注册了 CsvRules.PROJECT_SCAN 规则
    registerClass(rel);
    // 当前节点注册完成后，调用 addRelToSet 添加到等价集合中
    RelSubset subset = addRelToSet(rel, set);
    ...
    // Queue up all rules triggered by this relexp's creation.
    // 对注册的规则进行匹配筛选
    fireRules(rel);
    ...
    return subset;
}
```

##### addRelToSet

每个 RelNode 注册完成后会调用 `addRelToSet` 添加到等价集 RelSet 中，`set.add(rel)` 内部会调用 [RelSet#getOrCreateSubset](https://github.com/apache/calcite/blob/c4042a34ef054b89cec1c47fefcbc8689bad55be/core/src/main/java/org/apache/calcite/plan/volcano/RelSet.java#L261) 方法，该方法会根据特征 Trait  判断 RelSubset 是否已经存在，不存在则创建 RelSubset 实例，此时 bestCost 为 VolcanoCost.INFINITY。然后会将返回的 RelSubset 维护到 `mapRel2Subset` 中，方便后续复用。`propagateCostImprovements` 会重新计算节点的代价，如果它的代价小于 RelSubset 的代价，则更新 RelSubset 中的 `bestCost` 和 `best`。

```java
private RelSubset addRelToSet(RelNode rel, RelSet set) {
    // 添加到等价集合中 RelSet 和 RelSubset 中，并返回 RelSubset
    RelSubset subset = set.add(rel);
    // 维护 Rel 和 Subset 映射关系
    mapRel2Subset.put(rel, subset);
    // While a tree of RelNodes is being registered, sometimes nodes' costs
    // improve and the subset doesn't hear about it. You can end up with
    // a subset with a single rel of cost 99 which thinks its best cost is
    // 100. We think this happens because the back-links to parents are
    // not established. So, give the subset another chance to figure out
    // its cost.
    try {
        // 重新计算是否存在更小的 cost，存在则更新 RelSubset 中的 bestCost 和 best
        propagateCostImprovements(rel);
    } catch (CyclicMetadataException e) {
        // ignore
    }
    if (ruleDriver != null) {
        ruleDriver.onProduce(rel, subset);
    }
    return subset;
}
```

`propagateCostImprovements` 方法的实现逻辑如下，方法内部定义了一个优先级队列，队列会根据 RelNode 的代价 RelOptCost 进行排序，从而方便获取最小代价的 RelNode。然后从队列中弹出 RelNode，并遍历 RelNode 对应 RelSet 中的 RelSubset，判断当前计算的代价是否小于已知的最小代价，如果代价更小则更新最小代价 bestCost 和最优计划 best。

```java
void propagateCostImprovements(RelNode rel) {
    RelMetadataQuery mq = rel.getCluster().getMetadataQuery();
    // RelNode 和 RelOptCost 映射，方便后续获取 RelOptCost
    Map<RelNode, RelOptCost> propagateRels = new HashMap<>();
    // 优先级队列，按照 RelOptCost 排序
    PriorityQueue<RelNode> propagateHeap = new PriorityQueue<>((o1, o2) -> {...});
    // 获取 RelNode 对应的代价
    propagateRels.put(rel, getCostOrInfinite(rel, mq));
    // 添加到队列中
    propagateHeap.offer(rel);
    RelNode relNode;
    // 从队列中弹出 RelNode
    while ((relNode = propagateHeap.poll()) != null) {
        RelOptCost cost = requireNonNull(propagateRels.get(relNode), "propagateRels.get(relNode)");
        // 遍历当前 RelNode 对应 RelSet 中的 RelSubset 集合（Trait 不同存储在不同 RelSubset 中）
        for (RelSubset subset : getSubsetNonNull(relNode).set.subsets) {
            // 判断 Trait 是否相同
            if (!relNode.getTraitSet().satisfies(subset.getTraitSet())) {
                continue;
            }
            // 判断代价是否小于已知最小代价
            if (!cost.isLt(subset.bestCost)) {
                continue;
            }
            // Update subset best cost when we find a cheaper rel or the current
            // best's cost is changed
            subset.timestamp++;
            LOGGER.trace("Subset cost changed: subset [{}] cost was {} now {}",
                    subset, subset.bestCost, cost);
            // 更新最小代价和最优计划
            subset.bestCost = cost;
            subset.best = relNode;
            // since best was changed, cached metadata for this subset should be removed
            mq.clearCache(subset);
            // 遍历 RelSubset 的父节点（CsvTableScan 对应 RelSet 的父节点为空）
            for (RelNode parent : subset.getParents()) {
                mq.clearCache(parent);
                // 计算父节点代价
                RelOptCost newCost = getCostOrInfinite(parent, mq);
                RelOptCost existingCost = propagateRels.get(parent);
                if (existingCost == null || newCost.isLt(existingCost)) {
                    // 如果父节点代价更小，则加入 propagateHeap 重新计算
                    propagateRels.put(parent, newCost);
                    if (existingCost != null) {
                        // Cost reduced, force the heap to adjust its ordering
                        propagateHeap.remove(parent);
                    }
                    propagateHeap.offer(parent);
                }
            }
        }
    }
}
```

计算 RelNode 代价是通过 `VolcanoPlanner#getCostOrInfinite` 方法，如果 getCost 返回的代价为 null，则会返回无穷大代价 infCost。getCost 方法会先判断当前 RelNode 是否已经是 RelSubset，如果是则直接返回 bestCost。然后根据 `noneConventionHasInfiniteCost` 标记以及当前 RelNode 的 Trait 判断是否针对 None Convention 直接返回无穷大代价，noneConventionHasInfiniteCost 参数可以通过 `VolcanoPlanner#setNoneConventionHasInfiniteCost` 方法设置。当前节点的代价计算是调用 `RelMetadataQuery#getNonCumulativeCost` 方法获取，然后获取子节点的代价进行累加，即 `RelNode 总代价 = RelNode 自身代价 + 所有子节点代价`。

```java
private RelOptCost getCostOrInfinite(RelNode rel, RelMetadataQuery mq) {
    RelOptCost cost = getCost(rel, mq);
    return cost == null ? infCost : cost;
}

@Override
public @Nullable RelOptCost getCost(RelNode rel, RelMetadataQuery mq) {
  	// 如果已经是 RelSubset，直接返回 bestCost
    if (rel instanceof RelSubset) {
        return ((RelSubset) rel).bestCost;
    }
  	// 根据 noneConventionHasInfiniteCost 标记以及当前 RelNode 的 Trait 判断是否针对 None Convention 直接返回无穷大代价
  	// noneConventionHasInfiniteCost 参数可以通过 VolcanoPlanner#setNoneConventionHasInfiniteCost 设置
    if (noneConventionHasInfiniteCost
            && rel.getTraitSet().getTrait(ConventionTraitDef.INSTANCE) == Convention.NONE) {
        return costFactory.makeInfiniteCost();
    }
  	// 获取当前 RelNode 的代价
    RelOptCost cost = mq.getNonCumulativeCost(rel);
    if (cost == null) {
        return null;
    }
  	// 判断代价是否为正数代价，不满足则返回最小代价
    if (!zeroCost.isLt(cost)) {
        // cost must be positive, so nudge it
        cost = costFactory.makeTinyCost();
    }
  	// 获取子节点的代价进行累加，即 RelNode 总代价 = RelNode 自身代价 + 所有子节点代价
    for (RelNode input : rel.getInputs()) {
        RelOptCost inputCost = getCost(input, mq);
        if (inputCost == null) {
            return null;
        }
        cost = cost.plus(inputCost);
    }
    return cost;
}
```

`RelMetadataQuery#getNonCumulativeCost` 方法如下，Calcite 会通过 Janino 动态生成 nonCumulativeCostHandler 对象，然后调用 `RelMdPercentageOriginalRows#getNonCumulativeCost` 方法，该方法会调用 RelNode#computeSelfCost 方法，此处为 CsvTableScan 实现的方法。CsvTableScan 会调用父类 TableScan 中的方法，此时会获取统计信息中获取行数信息 rowCount，然后使用优化器中的 CostFactory 计算代价。

```java
// RelMetadataQuery#getNonCumulativeCost 方法
public @Nullable RelOptCost getNonCumulativeCost(RelNode rel) {
    for (; ; ) {
        try {
            return nonCumulativeCostHandler.getNonCumulativeCost(rel, this);
        } catch (MetadataHandlerProvider.NoHandler e) {
            nonCumulativeCostHandler = revise(BuiltInMetadata.NonCumulativeCost.Handler.class);
        }
    }
}

// RelMdPercentageOriginalRows#getNonCumulativeCost 方法
public @Nullable RelOptCost getNonCumulativeCost(RelNode rel, RelMetadataQuery mq) {
    return rel.computeSelfCost(rel.getCluster().getPlanner(), mq);
}

// CsvTableScan#computeSelfCost 方法
public @Nullable RelOptCost computeSelfCost(RelOptPlanner planner, RelMetadataQuery mq) {
    // Multiply the cost by a factor that makes a scan more attractive if it
    // has significantly fewer fields than the original scan.
    //
    // The "+ 2D" on top and bottom keeps the function fairly smooth.
    //
    // For example, if table has 3 fields, project has 1 field,
    // then factor = (1 + 2) / (3 + 2) = 0.6
    return super.computeSelfCost(planner, mq).multiplyBy(((double) fields.length + 2D) / ((double) table.getRowType().getFieldCount() + 2D));
}

// TableScan#computeSelfCost 方法
@Override
public @Nullable RelOptCost computeSelfCost(RelOptPlanner planner, RelMetadataQuery mq) {
    double dRows = table.getRowCount();
    double dCpu = dRows + 1; // ensure non-zero cost
    double dIo = 0;
    return planner.getCostFactory().makeCost(dRows, dCpu, dIo);
}

// RelOptTableImpl#getRowCount 方法
@Override
public double getRowCount() {
    if (rowCount != null) {
        return rowCount;
    }
    if (table != null) {
      	// CSV 示例中未注册统计信息，默认为 Statistics.UNKNOWN，rowCount 为 null
        final Double rowCount = table.getStatistic().getRowCount();
        if (rowCount != null) {
            return rowCount;
        }
    }
  	// 默认返回 100d
    return 100d;
}
```

最终返回的 CsvTableScan VolcanoCost 对象如下图所示，记录了 `cpu`、`io` 和 `rowCount` 信息。

![CsvTableScan VolcanoCost 对象](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/22/1703207948.png)

`propagateCostImprovements` 方法会按照前文所述，将 RelSubset 中的代价和新计算的代价进行比较，如果发现更小代价，则会更新 bestCost 和 best 属性，RelSubset 更新后的对象如下图所示。

![更新代价后的 RelSubset](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/22/1703208192.png)

##### fireRules

生成完 RelSubset 并计算 RelNode 的代价后，VolcanoPlanner 会调用 `fireRules` 方法，对队列中的规则进行匹配筛选，fireRules 实现逻辑如下。

```java
/**
 * Fires all rules matched by a relational expression.
 *
 * @param rel Relational expression which has just been created (or maybe
 *            from the queue)
 */
void fireRules(RelNode rel) {
    for (RelOptRuleOperand operand : classOperands.get(rel.getClass())) {
        // 判断当前 Rel 是否匹配规则
        if (operand.matches(rel)) {
            final VolcanoRuleCall ruleCall;
            ruleCall = new DeferringRuleCall(this, operand);
            ruleCall.match(rel);
        }
    }
}
```

`classOperands` 中记录了 RelNode 和 RelOptRuleOperand 的对应关系，RelOptRuleOperand 用于判断 RelOptRule 是否可以用于某个关系代数。下图展示了 CsvTableScan 对应的 RelOptRuleOperand 集合，这些 RelOptRuleOperand 都是和 TableScan 相关的规则。

![classOperands 存储的优化规则](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/23/1703298241.png)

对于每一个 RelOptRuleOperand，都会调用其 `matches` 方法，方法内会判断 RelNode 是否是 RelOptRuleOperand 中记录的 clazz 实例，以及 RelNode 是否包含定义的 trait 特征，最后会使用 predicate 方法对 RelNode 进行匹配。

```java
public boolean matches(RelNode rel) {
    if (!clazz.isInstance(rel)) {
        return false;
    }
    if ((trait != null) && !rel.getTraitSet().contains(trait)) {
        return false;
    }
    return predicate.test(rel);
}
```

好奇的读者可能会问，RelOptRuleOperand 记录的这些信息是在什么时候初始化的？以 CsvProjectTableScanRule 为例，在该优化规则初始化时，会调用 `super(config)` 方法，使用 [OperandBuilderImpl.operand(config.operandSupplier())](https://github.com/apache/calcite/blob/bebe473fab2e242736614659ed6e5d04eeeb8bf5/core/src/main/java/org/apache/calcite/plan/RelRule.java#L123) 初始化 RelOptRuleOperand 类，感兴趣的朋友可以自行探究下。

RelOptRuleOperand 匹配成功后，会创建一个 `DeferringRuleCall`，该类表示对 Rule 的调用，并且可以延迟执行。然后调用 `DeferringRuleCall#match` 方法应用当前匹配的规则，match 方法会调用 `VolcanoRuleCall#matchRecurse` 方法，如果规则匹配则会调用 onMatch 方法。`DeferringRuleCall#onMatch` 方法会匹配规则以及 RelNode 封装成 VolcanoRuleMatch，然后添加到 RuleQueue 中。

```java
// VolcanoRuleCall#matchRecurse 方法
private void matchRecurse(int solve) {
    final List<RelOptRuleOperand> operands = getRule().operands;
		// 当求解顺序参数等于操作数时，判断当前 Rule 是否
    if (solve == operands.size()) {
        // We have matched all operands. Now ask the rule whether it
        // matches; this gives the rule chance to apply side-conditions.
        // If the side-conditions are satisfied, we have a match.
        if (getRule().matches(this)) {
            onMatch();
        }
    } else {
        ...
    }
}

// DeferringRuleCall#onMatch 方法
/**
 * Rather than invoking the rule (as the base method does), creates a
 * {@link VolcanoRuleMatch} which can be invoked later.
 */
protected void onMatch() {
    final VolcanoRuleMatch match = new VolcanoRuleMatch(volcanoPlanner, getOperand0(), rels, nodeInputs);
    volcanoPlanner.ruleDriver.getRuleQueue().addMatch(match);
}
```

至此，setRoot 就完成了对 CsvTableScan 节点的处理，为 CsvTableScan 生成了 RelSet 和 RelSubset，并筛选了 CsvTableScan 匹配的规则。CsvTableScan 对应的 RelSubset 会以 inputs 的形式返回，提供给 LogicalFilter 作为子节点，LogicalFilter 仍然会按照前文介绍的 `onRegister` -> `addRelToSet` -> `fireRules` 的流程进行处理，并同样返回 RelSubset 作为 LogicalProject 的子节点。LogicalFilter 和 LogicalProject 由于 Convention 为 None，因此计算代价时，他们的代价为正无穷，执行完第一轮 setRoot 方法，最终会得到如下的 RelSubset 树。

```
LogicalProject(subset=[rel#14:RelSubset#2.NONE.[]], EMPNO=[$0], NAME=[$1], DEPTNO=[$2], GENDER=[$3], CITY=[$4], EMPID=[$5], AGE=[$6], SLACKER=[$7], MANAGER=[$8], JOINEDAT=[$9])
  LogicalFilter(subset=[rel#12:RelSubset#1.NONE.[]], condition=[=($1, 'Alice')])
    CsvTableScan(subset=[rel#10:RelSubset#0.ENUMERABLE.[]], table=[[SALES, EMPS]], fields=[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]])
```

RelSubset 树是通过成员变量 `final RelSet set` 变量实现，RelSet 中维护了当前 RelNode，通过 RelNode 的 input 维护了 RelSubset 子节点，以此类推，形成了一颗 RelSubset 树，整体结构如下图所示。

![RelSubset 树结构](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/29/1703810657.png)

#### 第二轮 setRoot

在调用第二轮 setRoot 前，会优先判断当前 RelNode 的 Trait 是否和目标 Trait 相同，不相同则调用优化器的 `changeTraits` 方法变换特征。由于 RelNode 中的 Convention Trait 是 NONE，目标 Convention Trait 是 ENUMERABLE，因此会先调用 changeTraits 方法。

```java
final RelNode rootRel2 = rel.getTraitSet().equals(requiredOutputTraits) ? rel : planner.changeTraits(rel, requiredOutputTraits);
```

##### changeTraits

changeTraits 实现逻辑如下，会传入 RelNode 和期望的 RelTraitSet，然后先调用 ensureRegistered 确保所有的 RelNode 都注册成 RelSubset，然后调用 `getOrCreateSubset` 方法生成 RelTraitSet 对应的 RelSubset。

```java
public RelNode changeTraits(final RelNode rel, RelTraitSet toTraits) {
    RelSubset rel2 = ensureRegistered(rel, null);
    if (rel2.getTraitSet().equals(toTraits)) {
        return rel2;
    }
    return rel2.set.getOrCreateSubset(rel.getCluster(), toTraits, true);
}
```

此时，根节点 RelSubSet 的 Convention 已经变换为 ENUMERABLE，子节点 RelSubSet 的 Convention 仍然是 NONE，后续需要关注子节点 Convention 的变换时机。

![根节点 RelSubSet Convention](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/27/1703636903.png)

##### registerSubset

由于经过了第一轮 setRoot 以及 changeTraits 处理，`rootRel2` 变成了一颗 RelSubset 树，在第二轮 setRoot 调用 registerImpl 时，由于 RelNode 已经是 RelSubset，因此会调用 registerSubset 方法。

```java
// VolcanoPlanner#registerImpl 方法
private RelSubset registerImpl(RelNode rel, @Nullable RelSet set) {
    if (rel instanceof RelSubset) {
        return registerSubset(set, (RelSubset) rel);
    }
    ...
}
```

registerSubset 方法实现逻辑如下，首先会尝试对 RelSet 进行合并，由于当前案例中 `RelSet set` 为 null，未覆盖 merge 逻辑，后续我们会探索其他复杂案例的  RelSet 合并操作。`canonize` 方法用于处理当前 RelSubset 存在多个等价的 RelSubset 时，获取原始的 RelSubSet。

```java
private RelSubset registerSubset(@Nullable RelSet set, RelSubset subset) {
    if ((set != subset.set) && (set != null) && (set.equivalentSet == null)) {
        LOGGER.trace("Register #{} {}, and merge sets", subset.getId(), subset);
        merge(set, subset.set);
    }
    return canonize(subset);
}

/**
 * If a subset has one or more equivalent subsets (owing to a set having
 * merged with another), returns the subset which is the leader of the
 * equivalence class.
 *
 * @param subset Subset
 * @return Leader of subset's equivalence class
 */
private static RelSubset canonize(final RelSubset subset) {
    RelSet set = subset.set;
    if (set.equivalentSet == null) {
        return subset;
    }
    // 循环获取原始的 RelSet，然后创建对应 Trait 的 RelSubset
    do {
        set = set.equivalentSet;
    } while (set.equivalentSet != null);
    return set.getOrCreateSubset(subset.getCluster(), subset.getTraitSet(), subset.isRequired());
}
```

##### ensureRootConverters

最后会执行 `ensureRootConverters` 方法，确保根节点的等价集合都包含了 `AbstractConverter`，以便于发现代价更小的实现时，能够将 RelSubset 转换为根节点。ensureRootConverters 方法实现逻辑如下，如果根节点中记录的等价关系代数 RelNode 已经是 AbstractConverter，则直接添加到 subsets 集合中。然后判断根节点的所有 RelSubset，如果发现 `root trait` 和 `subset trait` 不同时，将会注册一个 AbstractConverter（AbstractConverter 是一个 RelNode，用于将一个关系代数转换为指定 Convention 的关系代数）。

```java
/**
 * Ensures that the subset that is the root relational expression contains
 * converters to all other subsets in its equivalence set.
 *
 * <p>Thus the planner tries to find cheap implementations of those other
 * subsets, which can then be converted to the root. This is the only place
 * in the plan where explicit converters are required; elsewhere, a consumer
 * will be asking for the result in a particular convention, but the root has
 * no consumers.
 */
void ensureRootConverters() {
    final Set<RelSubset> subsets = new HashSet<>();
    for (RelNode rel : root.getRels()) {
        if (rel instanceof AbstractConverter) {
            subsets.add((RelSubset) ((AbstractConverter) rel).getInput());
        }
    }
    for (RelSubset subset : root.set.subsets) {
        final ImmutableList<RelTrait> difference = root.getTraitSet().difference(subset.getTraitSet());
      	// 当 root trait 和 subset trait 不同时，注册一个 AbstractConverter（AbstractConverter 是一个 RelNode）
        if (difference.size() == 1 && subsets.add(subset)) {
            register(new AbstractConverter(subset.getCluster(), subset, difference.get(0).getTraitDef(), root.getTraitSet()), root);
        }
    }
}
```

然后调用 register 方法，分别将 AbstractConverter 和 root 节点作为参数传入，然后调用 ensureRegistered 方法将 RelNode 注册为 RelSubset，此处 root 节点已经为 RelSubset，所以会直接返回，并获取到 RelSubset 对应的 RelSet。

```java
public RelSubset register(RelNode rel, @Nullable RelNode equivRel) {
    final RelSet set;
    if (equivRel == null) {
        set = null;
    } else {
        ...
        equivRel = ensureRegistered(equivRel, null);
        set = getSet(equivRel);
    }
    return registerImpl(rel, set);
}
```

然后逻辑会再次调用到 registerImpl 方法，当发现当前节点是 Converter 时，会尝试将 Converter merge 到 Converter 子节点的 RelSet 中。

```java
private RelSubset registerImpl(RelNode rel, @Nullable RelSet set) {
    ...
    // Converters are in the same set as their children.
    if (rel instanceof Converter) {
        final RelNode input = ((Converter) rel).getInput();
        final RelSet childSet = castNonNull(getSet(input));
      	// 
        if ((set != null) && (set != childSet) && (set.equivalentSet == null)) {
            merge(set, childSet);
            ...
        } else {
            set = childSet;
        }
    }
    ...
}
```

第二轮 setRoot 结束后，RelSubset 的树形结构如下图所示，根节点的 Convention 变成了 ENUMERABLE，根节点 RelSet 中记录的 rels 增加了 AbstractConverter，subsets 增加了 Convention 为 ENUMERABLE 的 RelSubset，其他子节点的信息和第一轮 setRoot 一致。

![第二轮 setRoot RelSubset 树形结构](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/29/1703810113.jpg)

### findBestExp 流程

完成了 setRoot 流程后，最后一步就是调用 `findBestExp` 方法，根据 setRoot 阶段生成的 RelSubset 树以及其中记录的代价信息，寻找最优的执行计划。下面是 findBestExp 方法的实现，核心的处理逻辑主要是 `ruleDriver.drive()` 和 `buildCheapestPlan` 方法，`ruleDriver.drive()` 负责从 ruleQueue 中取出匹配的规则并进行关系代数变换，并和之前的代价进行比较以寻找每一个节点的最小代价实现。`buildCheapestPlan` 方法则遍历整个 RelSubset 树，寻找出全局最优的执行计划。

```java
/**
 * Finds the most efficient expression to implement the query given via
 * {@link org.apache.calcite.plan.RelOptPlanner#setRoot(org.apache.calcite.rel.RelNode)}.
 *
 * @return the most efficient RelNode tree found for implementing the given
 * query
 */
@Override
public RelNode findBestExp() {
    assert root != null : "root must not be null";
    // 确保所有等价集都包含 AbstractConverter，以便于发现代价更小的实现时，能够将 RelSubset 转换为根节点
    ensureRootConverters();
  	// 注册物化视图相关的关系代数，本文暂时不涉及，后续文章会单独解读物化视图和 Lattice 格
    registerMaterializations();
    // 寻找最优 plan，即 cost 最小的 plan，先找到每个节点的最优 plan，然后构建全局最优 plan
    // ruleDriver 包括 IterativeRuleDriver 和 TopDownRuleDriver 两种，本文案例使用的是 IterativeRuleDriver
    ruleDriver.drive();
    // 构建全局最优 plan
    RelNode cheapest = root.buildCheapestPlan(this);
    return cheapest;
}
```

#### drive

本文案例中 `driver` 的实现类为 `IterativeRuleDriver`，该方法负责应用规则，按照优化规则对关系代数进行变换。`IterativeRuleDriver#drive` 方法实现逻辑如下，该方法使用了一个 `while(true)` 死循环，会不断地从 `ruleQueue` 中弹出规则，并调用 `VolcanoRuleMatch#onMatch` 方法对关系代数进行变换。当 ruleQueue 中没有匹配的规则，或者优化器抛出了 `VolcanoTimeoutException` 时，此时会中断循环。

```java
public void drive() {
    while (true) {
        // 从 ruleQueue 中弹出匹配规则
        VolcanoRuleMatch match = ruleQueue.popMatch();
        if (match == null) {
            break;
        }
        // 判断规则是否匹配
        assert match.getRule().matches(match);
        try {
            // 调用 onMatch 方法对关系代数进行变换
            match.onMatch();
        } catch (VolcanoTimeoutException e) {
            LOGGER.warn("Volcano planning times out, cancels the subsequent optimization.");
            planner.canonize();
            break;
        }
        // The root may have been merged with another subset. Find the new root subset.
        planner.canonize();
    }
}
```

当前的案例中，preQueue 中记录了 2 个需要预先处理的匹配规则：`ExpandConversionRule` 和 `ProjectRemoveRule`，ruleQueue 包含了 4 个匹配规则，分别是 `EnumerableFilterRule`、`ProjectFilterTransposeRule`、`EnumerableProjectRule` 和 `ExpandConversionRule`。

ExpandConversionRule 则用于将 AbstractConverter 转换为 converters 链，converters 链会将原始的关系代数转换到目标特征。ProjectRemoveRule 负责将仅返回其输入的 Project 节点转换为其子节点，例如：`Project(ArrayReader(a), {$input0}) becomes ArrayReader(a)`。

EnumerableFilterRule 和 EnumerableProjectRule 在 Calcite 中属于 `ConverterRule`，负责将 LogicalFilter、LogicalProject 转换为 EnumerableFilter 和 EnumerableProject。ProjectFilterTransposeRule 会将 Project 和 Filter 进行转置变换，属于 `TransformationRule`。

![ruleQueue 包含的 VolcanoRuleMatch](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/30/1703897196.png)

从队列中弹出 `VolcanoRuleMatch` 后会调用 `VolcanoRuleMatch#onMatch` 方法进行关系代数变换，方法实现逻辑如下。VolcanoRuleMatch 继承了 `RelOptRuleCall`，RelOptRuleCall 代表了对 RelOptRule 的调用，并传递了一组关系表达式作为参数。开始 onMatch 前，会将当前的 VolcanoRuleCall 添加到 deque 头部，然后调用不同 rule 的 onMatch 方法，完成后 finally 代码块会从 deque 头部弹出。

```java
// VolcanoRuleMatch 继承了 RelOptRuleCall，RelOptRuleCall 代表了对 RelOptRule 的调用，并传递了一组关系表达式作为参数
protected void onMatch() {
    try {
        ...
        // 遍历 VolcanoRuleMatch 中记录的 rels
        for (int i = 0; i < rels.length; i++) {
            RelNode rel = rels[i];
            // 获取对应的 RelSubset
            RelSubset subset = volcanoPlanner.getSubset(rel);
            // 检查 subset 不能为空，并输出 debug 日志
        }
        ...
        // 将当前的 VolcanoRuleCall 添加到 deque 头部，push 内部调用 addFirst
        volcanoPlanner.ruleCallStack.push(this);
        try {
            // 调用 VolcanoRuleCall 中缓存的 rule#onMatch 方法
            getRule().onMatch(this);
        } finally {
            // 从 ruleCallStack 中弹出首个对象，调用 deque removeFirst 方法
            volcanoPlanner.ruleCallStack.pop();
        }
    } catch (Exception e) {
        throw new RuntimeException("Error while applying rule " + getRule() + ", args " + Arrays.toString(rels), e);
    }
}
```

以 `EnumerableFilterRule` 为例，onMatch 方法会先调用 `convert` 方法，将 LogicalFilter 转换为 EnumerableFilter，然后调用 transformTo 方法对 RelNode 树进行变换。

```java
public void onMatch(RelOptRuleCall call) {
    RelNode rel = call.rel(0);
    if (rel.getTraitSet().contains(inTrait)) {
        // 将 LogicalFilter 转换为 EnumerableFilter
        final RelNode converted = convert(rel);
        if (converted != null) {
            // 调用 transformTo 方法对 RelNode 树进行变换
            call.transformTo(converted);
        }
    }
}
```

`VolcanoRuleCall#transformTo` 实现逻辑如下，由于 EnumerableFilter 是转换的节点，会调用 ensureRegistered 方法对该节点进行重新注册，此时会计算 EnumerableFilter 的代价，并更新 RelSubset 中记录的最小代价。

```java
public void transformTo(RelNode rel, Map<RelNode, RelNode> equiv, RelHintsPropagator handler) {
    // 对 Hint 进行处理，将原始 RelNode 的 Hint 复制到新的 RelNode 中
    rel = handler.propagate(rels[0], rel);
    try {
        ...
        // Registering the root relational expression implicitly registers
        // its descendants. Register any explicit equivalences first, so we
        // don't register twice and cause churn.
        // 遍历等价集，并进行注册，本案例中 EnumerableFilter 等价集合为空
        for (Map.Entry<RelNode, RelNode> entry : equiv.entrySet()) {
            volcanoPlanner.ensureRegistered(entry.getKey(), entry.getValue());
        }
        // 注册 EnumerableFilter 并重新计算最小代价
        RelSubset subset = volcanoPlanner.ensureRegistered(rel, rels[0]);
        ...
    } catch (Exception e) {
        throw new RuntimeException("Error occurred while applying rule " + getRule(), e);
    }
}
```

变换完成后 RelSubset 树更新了 bestCost，并且 rels 中同时记录了 LogicalFilter 和 EnumerableFilter。

![EnumerableFilterRule 变换后结构](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2024/01/02/1704158875.png)

#### buildCheapestPlan

变换完成后，会调用 `RelSubset#buildCheapestPlan` 方法构建代价最小的执行计划，buildCheapestPlan 方法实现逻辑如下，首先会初始化 CheapestPlanReplacer 类，它负责遍历 RelSubset 树并将每个节点替换为代价最小的 RelNode，遍历完成后返回全局最小代价的执行计划。

```java
/**
 * Recursively builds a tree consisting of the cheapest plan at each node.
 */
RelNode buildCheapestPlan(VolcanoPlanner planner) {
    // 初始化树遍历器，会遍历 RelSubset 树并进行节点替换
    CheapestPlanReplacer replacer = new CheapestPlanReplacer(planner);
    // Replacer 内部维护了 final Map<Integer, RelNode> visited = new HashMap<>(); 记录当前节点是否遍历过
    final RelNode cheapest = replacer.visit(this, -1, null);
    ...
    return cheapest;
}
```

`CheapestPlanReplacer#visit` 是处理的核心逻辑，其实现细节如下，首先会根据 RelNode 的 Id 标识从 visited 中获取最优节点，如果当前节点已经遍历过则会直接返回。如果 visited 中未包含，则会判断节点是否为 RelSubset，案例中的节点已经都变换为 RelSubset，因此这一步会找出 RelSubset 中的最小代价 cheapest 进行替换。然后会继续遍历子节点寻找 cheapest 进行替换，替换后的子节点会和原子节点进行比对，不同则会将新的子节点复制到当前节点中。

```java
public RelNode visit(RelNode p, int ordinal, @Nullable RelNode parent) {
    // 每一个 RelNode 都有个唯一 Id
    final int pId = p.getId();
    // 从 visited 中获取当前节点是否已经遍历过，如果遍历过则直接返回
    RelNode prevVisit = visited.get(pId);
    if (prevVisit != null) {
        // return memoized result of previous visit if available
        return prevVisit;
    }
    // 判断当前节点为 RelSubset，则进行进一步处理
    if (p instanceof RelSubset) {
        RelSubset subset = (RelSubset) p;
        // 获取 RelSubset 中记录的最优 plan
        RelNode cheapest = subset.best;
        if (cheapest == null) {
            // 如果获取不到最优 plan，则抛出异常
            ...
            LOGGER.trace("Caught exception in class={}, method=visit", getClass().getName(), e);
            throw e;
        }
        p = cheapest;
    }
    ...
    // 获取当前节点的子节点，进行遍历处理，获取最优 plan
    List<RelNode> oldInputs = p.getInputs();
    List<RelNode> inputs = new ArrayList<>();
    for (int i = 0; i < oldInputs.size(); i++) {
        RelNode oldInput = oldInputs.get(i);
        // 遍历子节点
        RelNode input = visit(oldInput, i, p);
        inputs.add(input);
    }
    // 新的子节点和老的子节点不同，则将新的子节点复制到当前节点中
    if (!inputs.equals(oldInputs)) {
        final RelNode pOld = p;
        p = p.copy(p.getTraitSet(), inputs);
        planner.provenanceMap.put(p, new VolcanoPlanner.DirectProvenance(pOld));
    }
    // 记录到 visited
    visited.put(pId, p); // memoize result for pId
    return p;
}
```

最终，我们得到了如下的最优执行计划，Calcite 执行器会生成执行代码，执行并返回查询结果。

```
EnumerableFilter(condition=[=($1, 'Alice')])
  CsvTableScan(table=[[SALES, EMPS]], fields=[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]])
```

### 整体流程总结

![VolcanoPlanner 整体流程](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2024/01/03/1704245597.png)

前文我们以简单的查询语句为例，一起探究了 VolcanoPlanner 优化器实现细节，想必大家阅读完一定有所收获。为了加深大家对优化器的理解，最后我们再进行一些梳理总结，上图展示了 VolcanoPlanner 优化器的整体流程，总体上可以分为三步：

1. 第一步：注册优化器规则。通过调用 `addRule` 方法，我们可以快速将优化器规则注册进来，这些规则会维护在 VolcanoPlanner 的 classOperands 对象中，后续筛选规则时会从该对象中获取规则；
2. 第二步：初始化 `RelSubset`。这步会遍历逻辑计划树，将每个节点注册成为 RelSubset 并维护节点的代价信息，然后将逻辑计划树转换为 RelSubset 树，RelSubset 对象关联了所属的 `RelSet` 对象，该对象维护了当前节点的等价集合，RelSubset 中记录的是当前已知代价最小的关系代数。`fireRules` 方法负责筛选规则，会将匹配的规则添加到队列中；
3. 第三步：查找最优计划。根据前文初始化的 RelSubset 树以及队列中记录的匹配规则，该步骤会调用 `drive` 方法应用规则，然后通过 `onMatch` 方法对关系代数进行变换，完成变换后会重新计算代价信息，并更新 RelSubset 和 RelSet 对象。最后会调用 buildCheapestPlan 方法，从 RelSubset 树中获取整体代价最小的执行计划。

## 结语

本文首先介绍了 Volcano/Cascades 优化器的理论基础，Volcano 优化器生成器论文中介绍的 `Logical Algebra`、`Physical Algebra`、`Transformation Rule`，以及 Cascades 优化器论文中介绍的 `Memo` 数据结构，`Pattern` 匹配规则等概念在 Calcite VolcanoPlanner 中都有体现，大家在阅读代码时可以参考论文中的概念进行理解。

然后介绍了 VolcanoPlanner 中的一些基础概念——RelNode、RelSet 和 RelSubset，理解了这些概念对学习 VolcanoPlanner 原理非常有帮助。同时，我们参考了 Julain 分享的 [Cost-based Query Optimization in Apache Phoenix using Apache Calcite](https://calcite.apache.org/community/#cost-based-query-optimization-in-apache-phoenix-using-apache-calcite)，提前了解了 VolcanoPlanner 的处理流程，整体上对优化流程有了一些了解。最后，本文结合一个简单的案例，深入 Calcite 源码细节，带领大家一起探究了整个流程。

限于文章的篇幅以及案例的选择，VolcanoPlanner 优化器的一些细节本文无法全面覆盖，还请各位读者多多包涵。下一篇文章，我们将关注 **VolcanoPlanner 中的统计信息和代价模型，并会通过一个多表关联、聚合查询的案例，一起探究下 VolcanoPlanner 优化器是如何使用统计信息和代价模型进行代价计算，在多表关联、聚合查询 SQL 中，VolcanoPlanner 又会使用哪些优化方式得到最优执行计划**。欢迎大家持续关注后续文章，如果有感兴趣的问题，也欢迎大家留言交流。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

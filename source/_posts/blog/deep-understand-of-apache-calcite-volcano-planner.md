---
title: 深入理解 Apache Calcite ValcanoPlanner 优化器
tags: [Calcite]
categories: [Calcite]
banner: china
date: 2022-11-26 19:17:59
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
references:
  - title: 'Apache Calcite 优化器详解（二）'
    url: https://matt33.com/2019/03/17/apache-calcite-planner/
  - title: '万字详解 Calcite Volcano 优化器'
    url: https://zhuanlan.zhihu.com/p/640328243
  - title: 'Apache Calcite VolcanoPlanner 优化过程解析'
    url: https://zhuanlan.zhihu.com/p/283362100
---

重要概念：

- **RelNode**: 关系表达式
- **RelSet** ：一个表达式的等价集合, 具有相同语义。我们通常对具有最低代价的表达式感兴趣
- **RelSubset** ：RelSet 中包含 RelSubset，等价类的子集（记录了最有 best plan 和 best cost，也是一个 RelNode），其中所有关系表达式都具有相同的物理属性。包括调用convention和排序规则（排序顺序）等特征
- **Trait** ：描述 关系表达式 的特性

![Calcite Volcano Planner 处理流程](https://matt33.com/images/calcite/12-VolcanoPlanner.png)

以 testSelectSingleProjectGz 测试 Case 为例，Logical Plan 如下：Volcano Planner 优化流程如下：

```
LogicalProject(NAME=[$1])
  CsvTableScan(table=[[SALES, EMPS]], fields=[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]])
```

## setRoot 流程

setRoot 流程：进行初始化处理，并将 RelNode 转换为 RelSubset。如下是 setRoot 的代码清单，registerImpl 是其核心逻辑。

```java
  @Override public void setRoot(RelNode rel) {
    this.root = registerImpl(rel, null);
    if (this.originalRoot == null) {
      this.originalRoot = rel;
    }

    rootConvention = this.root.getConvention();
    ensureRootConverters();
  }
```

registerImpl 用于注册新的关系代数表达式，并将待匹配规则加入到队列中。如果 set（等价集合） 参数不为 null，则将当前表达式加入到等价集合中，如果已经注册了相同的表达式，则无需将其加入到等价集合以及队列中。

```java
  private RelSubset registerImpl(
      RelNode rel,
      @Nullable RelSet set) {
    // 如果 rel 已经是 RelSubset，则直接调用 registerSubset 注册
    if (rel instanceof RelSubset) {
      return registerSubset(set, (RelSubset) rel);
    }
    ...
      
    // Ensure that its sub-expressions are registered.
    // 监听该表达式将要注册的通知
    rel = rel.onRegister(this);
  }
```

getInputs 方法会获取子节点，并调用 ensureRegistered 方法，确保所有的节点都会进行注册。

```java
  @Override public RelNode onRegister(RelOptPlanner planner) {
    List<RelNode> oldInputs = getInputs();
    List<RelNode> inputs = new ArrayList<>(oldInputs.size());
    for (final RelNode input : oldInputs) {
      RelNode e = planner.ensureRegistered(input, null);
      assert e == input || RelOptUtil.equal("rowtype of rel before registration",
          input.getRowType(),
          "rowtype of rel after registration",
          e.getRowType(),
          Litmus.THROW);
      inputs.add(e);
    }
```

ensureRegistered 方法会对当前子节点进行注册，register 方法会调用 registerImpl 对子节点 CsvTableScan 进行注册。

```java
@Override public RelSubset ensureRegistered(RelNode rel, @Nullable RelNode equivRel) {
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
    // 如果 RelSubset 则进行注册
    result = register(rel, equivRel);
  }
	...
  return result;
}

// 维护已注册的 RelNode 和 RelSubset 映射关系
private final IdentityHashMap<RelNode, RelSubset> mapRel2Subset =
      new IdentityHashMap<>();
```

每个节点在注册完成后会调用 addRelToSet 添加到等价集中，并维护到 mapRel2Subset 中。然后重新计算每一个节点的代价，如果它的代价小于等价集合中的代价，则更新 RelSubset（记录了当前已知的最有 cost 和 plan）。

```java
RelSubset subset = addRelToSet(rel, set);

  private RelSubset addRelToSet(RelNode rel, RelSet set) {
    // 添加到等价集合中 RelSet 和 RelSubset 中
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
      // 重新计算是否有更小的 cost，getCostOrInfinite 方法逻辑待研究
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

完成上述的代价计算后，调用 fireRules(rel); 方法，对队列中的规则进行匹配筛选，已匹配的规则会在 findBestExp 阶段寻找最优解。

```java
  /**
   * Fires all rules matched by a relational expression.
   *
   * @param rel      Relational expression which has just been created (or maybe
   *                 from the queue)
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

## findBestExp 流程

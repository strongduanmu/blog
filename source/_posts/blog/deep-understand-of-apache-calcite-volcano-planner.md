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

重要概念：

- **RelNode**: 关系表达式
- **RelSet** ：关系表达式的等价集合，他们之间具有相同语义。我们通常对具有最低代价的表达式感兴趣
- **RelSubset** ：RelSet 中包含 RelSubset，等价类的子集（记录了最有 best plan 和 best cost，也是一个 RelNode），其中所有关系表达式都具有相同的物理属性。包括调用 convention 和排序规则（排序顺序）等特征。

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
    // 如果 RelSubset 为空则进行注册
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

findBestExp 方法会根据 setRoot 阶段生成的匹配规则以及 RelSubset 中记录的 cost，寻找最优执行计划。

```java
  /**
   * Finds the most efficient expression to implement the query given via
   * {@link org.apache.calcite.plan.RelOptPlanner#setRoot(org.apache.calcite.rel.RelNode)}.
   *
   * @return the most efficient RelNode tree found for implementing the given
   * query
   */
  @Override public RelNode findBestExp() {
    assert root != null : "root must not be null";
    // 确保所有等价集都包含 AbstractConverter，能够在获取最优 plan 后转换为 root
    ensureRootConverters();
    registerMaterializations();
    // 寻找最优 plan，即 cost 最小的 plan，先找到每个节点的最优 plan，然后构建全局最优 plan
    // ruleDriver 包括 IterativeRuleDriver 和 TopDownRuleDriver 两种，后续再深入分析对应的使用场景
    ruleDriver.drive();
    dumpRuleAttemptsInfo();
    // 构建全局最优 plan
    RelNode cheapest = root.buildCheapestPlan(this);
    return cheapest;
  }
```

IterativeRuleDriver#drive 方法使用了一个死循环，会不断地从 ruleQueue 中获取规则，当 ruleQueue 中没有规则时，或者抛出 VolcanoTimeoutException 时，此时会中断循环。onMatch 方法会不断地进行关系代数的转换。

```java
  @Override public void drive() {
    while (true) {
      assert planner.root != null : "RelSubset must not be null at this point";
      LOGGER.debug("Best cost before rule match: {}", planner.root.bestCost);

      VolcanoRuleMatch match = ruleQueue.popMatch();
      if (match == null) {
        break;
      }

      assert match.getRule().matches(match);
      try {
        match.onMatch();
      } catch (VolcanoTimeoutException e) {
        LOGGER.warn("Volcano planning times out, cancels the subsequent optimization.");
        planner.canonize();
        break;
      }

      // The root may have been merged with another
      // subset. Find the new root subset.
      planner.canonize();
    }

  }
```

ruleQueue 中包含的规则：

![image-20231128130927611](/Users/duanzhengqiang/blog/source/_posts/blog/image-20231128130927611.png)

onMatch 方法逻辑：

```java
// RelOptRuleCall 代表了对 RelOptRule 的调用，并传递了一组关系表达式作为参数，此处为 VolcanoRuleCall 实现类
protected void onMatch() {
    assert getRule().matches(this);
    volcanoPlanner.checkCancel();
    try {
      ...
      // 遍历当前节点 LogicalProject
      for (int i = 0; i < rels.length; i++) {
        RelNode rel = rels[i];
        // 获取当前节点的 RelSubset
        RelSubset subset = volcanoPlanner.getSubset(rel);
				// 检查 subset（不能为空...），并输出 debug 日志
      }
			...
      // 将当前的 VolcanoRuleCall 添加到 deque 头部，push 内部调用 addFirst
      volcanoPlanner.ruleCallStack.push(this);
      try {
        // 调用 VolcanoRuleCall 中缓存的 rule#onMatch 方法，当前是 EnumerableProjectRule，它也是一个 ConverterRule，用于将 LogicalProject 转换为 EnumerableProject。onMatch 方法会调用 rule#convert 方法，并进行 transformTo 转换。
        getRule().onMatch(this);
      } finally {
        // 从 ruleCallStack 中弹出首个对下，调用 deque removeFirst 方法
        volcanoPlanner.ruleCallStack.pop();
      }
    } catch (Exception e) {
      throw new RuntimeException("Error while applying rule " + getRule()
          + ", args " + Arrays.toString(rels), e);
    }
  }
```

![rels 对象结构，input 是子类的 RelSubset](/Users/duanzhengqiang/blog/source/_posts/blog/image-20231129082549997.png)

transformTo 方法会调用 org/apache/calcite/plan/volcano/VolcanoRuleCall.java:100 中的 transformTo 方法。

```java
// equiv 其他等价关系的映射首次调用为空 Map
@Override public void transformTo(RelNode rel, Map<RelNode, RelNode> equiv,
      RelHintsPropagator handler) {
  	// 判断 rel 是否为 PhysicalNode，PhysicalNode 不允许为 TransformationRule
    if (rel instanceof PhysicalNode
        && rule instanceof TransformationRule) {
      throw new RuntimeException(
          rel + " is a PhysicalNode, which is not allowed in " + rule);
    }
		// 对 Hint 进行处理，暂不关注
    rel = handler.propagate(rels[0], rel);
    try {
      ...
      // Registering the root relational expression implicitly registers
      // its descendants. Register any explicit equivalences first, so we
      // don't register twice and cause churn.
      // 遍历等价集，并进行注册，首次调用为空
      for (Map.Entry<RelNode, RelNode> entry : equiv.entrySet()) {
        volcanoPlanner.ensureRegistered(
            entry.getKey(), entry.getValue());
      }
      // The subset is not used, but we need it, just for debugging
      @SuppressWarnings("unused")
      RelSubset subset = volcanoPlanner.ensureRegistered(rel, rels[0]);

      if (volcanoPlanner.getListener() != null) {
        RelOptListener.RuleProductionEvent event =
            new RelOptListener.RuleProductionEvent(
                volcanoPlanner,
                rel,
                this,
                false);
        volcanoPlanner.getListener().ruleProductionSucceeded(event);
      }
    } catch (Exception e) {
      throw new RuntimeException("Error occurred while applying rule "
          + getRule(), e);
    }
  }
```

buildCheapestPlan 流程：

![image-20231129091835780](/Users/duanzhengqiang/blog/source/_posts/blog/image-20231129091835780.png)

递归调用 Relsubset Tree 并获取每一个节点上的最优 plan，然后组装返回全局最优 plan。

```java
/**
 * Recursively builds a tree consisting of the cheapest plan at each node.
 */
RelNode buildCheapestPlan(VolcanoPlanner planner) {
  // 初始化树遍历器，会遍历 RelSet Tree 并进行节点替换
  CheapestPlanReplacer replacer = new CheapestPlanReplacer(planner);
  // Replacer 内部维护了 final Map<Integer, RelNode> visited = new HashMap<>(); 记录当前节点是否遍历过
  final RelNode cheapest = replacer.visit(this, -1, null);

  if (planner.getListener() != null) {
    RelOptListener.RelChosenEvent event =
        new RelOptListener.RelChosenEvent(
            planner,
            null);
    planner.getListener().relChosen(event);
  }

  return cheapest;
}
```

replacer.visit 实现逻辑如下：

```java
    public RelNode visit(
        RelNode p,
        int ordinal,
        @Nullable RelNode parent) {
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
        RelNode input = visit(oldInput, i, p);
        inputs.add(input);
      }
      // 新的子节点和老的子节点不同，则将新的子节点复制到当前节点中
      if (!inputs.equals(oldInputs)) {
        final RelNode pOld = p;
        p = p.copy(p.getTraitSet(), inputs);
        planner.provenanceMap.put(
            p, new VolcanoPlanner.DirectProvenance(pOld));
      }
      // 记录到 visited
      visited.put(pId, p); // memoize result for pId
      return p;
    }
  }
```



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

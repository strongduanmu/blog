---
title: 深入理解 Calcite HepPlanner 优化器原理
tags: [Calcite]
categories: [Calcite]
date: 2023-02-12 19:32:33
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
---

## 什么是 RBO



## Calcite 中的 RBO 规则



## HepPlanner 中的基础概念

* `HepPlanner`：基于规则的启发式优化器，实现了 RelOptPlanner 优化器接口；
* `HepProgram`：提供了维护各种类型 HepInstruction 的容器，并支持指定 HepInstruction 被 HepPlanner 优化时处理的顺序；
* `HepProgramBuilder`：用于创建 HepProgram；
* `HepInstruction`：代表了 HepProgram 中的一个指令，目前包含了许多实现类，具体实现类的用途如下表所示：





## HepPlanner 优化器原理



代码版本：HEAD is now at 413eded69 [CALCITE-5275] Release Calcite 1.32.0 

https://github.com/apache/calcite/commit/413eded693a9087402cc1a6eefeca7a29445d337	



setRoot: 

```java
  //~ Methods ----------------------------------------------------------------

  @Override public void setRoot(RelNode rel) {
    将 RelNode 转换为 DAG HepRelVertex root
    root = addRelToGraph(rel);
    dumpGraph();
  }
```



findBestExp:

1.1. 先执行 executeProgram(mainProgram) 逻辑，并将 mainProgram 赋予 currentProgram，然后循环 currentProgram.instructions。

```java
    for (HepInstruction instruction : currentProgram.instructions) {
      instruction.execute(this);
      int delta = nTransformations - nTransformationsLastGC;
      if (delta > graphSizeLastGC) {
        // The number of transformations performed since the last
        // garbage collection is greater than the number of vertices in
        // the graph at that time.  That means there should be a
        // reasonable amount of garbage to collect now.  We do it this
        // way to amortize garbage collection cost over multiple
        // instructions, while keeping the highwater memory usage
        // proportional to the graph size.
        collectGarbage();
      }
    }
```

​      instruction.execute(this); execute 方法内部调用 applyRules 方法，按照规则进行优化。

```
applyRules(instruction.rules, true);
```

可以看到有三个优化规则。

![image-20220725193805278](index_files/image-20220725193805278.png)

HepMatchOrder 代表了基于规则优化的顺序，包含了 ARBITRARY（任意顺序）、BOTTOM_UP（自底向上）、TOP_DOWN（自顶向下） 和 DEPTH_FIRST（深度优先）。然后循环进行匹配：

```java
    boolean fixedPoint;
    do {
      Iterator<HepRelVertex> iter = getGraphIterator(requireNonNull(root, "root"));
      fixedPoint = true;
      while (iter.hasNext()) {
        HepRelVertex vertex = iter.next();
        for (RelOptRule rule : rules) {
          HepRelVertex newVertex =
              applyRule(rule, vertex, forceConversions);
          if (newVertex == null || newVertex == vertex) {
            continue;
          }
          ++nMatches;
          if (nMatches >= requireNonNull(currentProgram, "currentProgram").matchLimit) {
            return;
          }
          if (fullRestartAfterTransformation) {
            iter = getGraphIterator(requireNonNull(root, "root"));
          } else {
            // To the extent possible, pick up where we left
            // off; have to create a new iterator because old
            // one was invalidated by transformation.
            iter = getGraphIterator(newVertex);
            if (requireNonNull(currentProgram, "currentProgram").matchOrder
                == HepMatchOrder.DEPTH_FIRST) {
              nMatches =
                  depthFirstApply(iter, rules, forceConversions, nMatches);
              if (nMatches >= requireNonNull(currentProgram, "currentProgram").matchLimit) {
                return;
              }
            }
            // Remember to go around again since we're
            // skipping some stuff.
            fixedPoint = false;
          }
          break;
        }
      }
    } while (!fixedPoint);
```







## 参考文档

* [Calcite RBO 简介](https://zhuanlan.zhihu.com/p/65673329)

* [Apache Calcite 优化器详解（二）](http://matt33.com/2019/03/17/apache-calcite-planner/)

* [Calcite 启发式 Planner（HepPlanner）](https://zhuanlan.zhihu.com/p/61661909)

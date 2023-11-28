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
- **RelSubset** ：等价类的子集，其中所有关系表达式具有相同的物理属性(RelTraitSet}的实例，包括调用convention和排序规则（排序顺序）等特征
- **Trait** ：描述 关系表达式 的特性

---
layout: wiki
wiki: cmu_15_799
order: 021
title: 实现：Apache Calcite
date: 2025-04-09 08:00:00
banner: /assets/banner/banner_1.jpg
---

## 课程视频

官网当前未公开本讲视频，B 站收藏夹也暂无对应视频。

## 学习重点

本讲对应官网 Lecture #20：Implementation: Apache Calcite。学习时重点关注：

- Apache Calcite 如何提供解析、关系表达式、规则优化和适配器框架。
- Calcite 中 trait、rule、RelNode 和 planner 如何协同生成计划。
- 异构数据源场景下，通用优化框架如何平衡可扩展性和系统特定优化。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Apache Calcite: A Foundational Framework for Optimized Query Processing Over Heterogeneous Data Sources](https://15799.courses.cs.cmu.edu/spring2025/papers/20-calcite/p221-begoli.pdf) (E. Begoli et al., SIGMOD 2018) *(Primary)*

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

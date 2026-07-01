---
layout: wiki
wiki: cmu_15_799
order: 022
title: 实现：Orca
date: 2025-04-14 08:00:00
banner: /assets/banner/banner_2.jpg
---

## 课程视频

官网当前未公开本讲视频，B 站收藏夹也暂无对应视频。

## 学习重点

本讲对应官网 Lecture #21：Implementation: Orca。学习时重点关注：

- Orca 如何把元数据、逻辑表达式和物理实现解耦成模块化优化器架构。
- Greenplum 场景下，分布式查询优化需要显式处理数据分布和 motion。
- 优化器测试如何验证代价模型、规则和计划选择的正确性。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Orca: A Modular Query Optimizer Architecture for Big Data](https://15799.courses.cs.cmu.edu/spring2025/papers/21-orca/p337-soliman.pdf) (M.A. Soliman et al., SIGMOD 2014) *(Primary)*
- [Testing the Accuracy of Query Optimizers](https://15799.courses.cs.cmu.edu/spring2025/papers/21-orca/gu-dbtest2012.pdf) (Z. Gu et al., DBTest 2012) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

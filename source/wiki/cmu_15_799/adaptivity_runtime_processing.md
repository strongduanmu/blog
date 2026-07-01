---
layout: wiki
wiki: cmu_15_799
order: 019
title: 自适应：运行时处理
date: 2025-03-31 08:00:00
banner: /assets/banner/banner_19.jpg
---

## 课程视频

官网当前未公开本讲视频，B 站收藏夹也暂无对应视频。

## 学习重点

本讲对应官网 Lecture #18：Adaptivity: Runtime Processing。学习时重点关注：

- 运行时自适应优化如何在查询执行过程中响应实际数据分布。
- mid-query reoptimization、eddies 和 robust plan 如何降低估计错误损失。
- 运行时处理需要在额外监控成本和计划修正收益之间取舍。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Adaptive Query Processing in the Looking Glass](https://15799.courses.cs.cmu.edu/spring2025/papers/18-aqp/babu-cidr2015.pdf) (S. Babu et al., CIDR 2015) *(Primary)*
- [Looking Ahead Makes Query Plans Robust](https://15799.courses.cs.cmu.edu/spring2025/papers/18-aqp/p889-zhu.pdf) (J. Zhu et al., VLDB 2017) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

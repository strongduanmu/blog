---
layout: wiki
wiki: cmu_15_799
order: 017
title: 参数化查询优化
date: 2025-03-24 08:00:00
banner: /assets/banner/banner_17.jpg
---

## 课程视频

官网当前未公开本讲视频，B 站收藏夹也暂无对应视频。

## 学习重点

本讲对应官网 Lecture #16：Parametric Query Optimization。学习时重点关注：

- 参数化查询为什么会让同一 SQL 模板在不同参数下对应不同最优计划。
- parametric query optimization 如何刻画参数空间和 plan space。
- re-costing、plan cache 和在线优化如何在延迟与稳定性之间折中。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Leveraging Re-costing for Online Optimization of Parameterized Queries with Guarantees](https://15799.courses.cs.cmu.edu/spring2025/papers/16-parametric/dutt-sigmod2017.pdf) (A. Dutt et al., SIGMOD 2017) *(Primary)*
- [Progressive Parametric Query Optimization](https://15799.courses.cs.cmu.edu/spring2025/papers/16-parametric/bizarro-tkde2008.pdf) (P. Bizarro et al., TKDE 2009) (Optional)
- [Design and Analysis of Parametric Query Optimization Algorithms](https://15799.courses.cs.cmu.edu/spring2025/papers/16-parametric/ganguly-vldb1998.pdf) (S. Ganguly, VLDB 1998) (Optional)
- [Leveraging Query Logs and Machine Query Optimization Learning for Parametric Query Optimization](https://15799.courses.cs.cmu.edu/spring2025/papers/16-parametric/vaidya-vldb2022.pdf) (K. Vaidya et al., VLDB 2022) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

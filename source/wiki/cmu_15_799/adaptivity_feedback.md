---
layout: wiki
wiki: cmu_15_799
order: 018
title: 自适应：反馈
date: 2025-03-26 08:00:00
banner: /assets/banner/banner_18.jpg
---

## 课程视频

官网当前未公开本讲视频，B 站收藏夹也暂无对应视频。

## 学习重点

本讲对应官网 Lecture #17：Adaptivity: Feedback。学习时重点关注：

- 反馈机制如何利用真实执行统计修正优化器的错误假设。
- LEO 和 Plan Stitch 如何把历史执行信息转化为后续优化输入。
- 反馈优化如何避免过拟合单次执行，同时提升计划鲁棒性。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Plan Stitch: Harnessing the Best of Many Plans](https://15799.courses.cs.cmu.edu/spring2025/papers/17-feedback/p1123-ding.pdf) (B. Ding et al., VLDB 2018) *(Primary)*
- [LEO - DB2's LEarning Optimizer](https://15799.courses.cs.cmu.edu/spring2025/papers/17-feedback/stillger-vldb2001.pdf) (M. Stillger et al., VLDB 2001) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

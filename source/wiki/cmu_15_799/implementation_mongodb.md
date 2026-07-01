---
layout: wiki
wiki: cmu_15_799
order: 023
title: 实现：MongoDB
date: 2025-04-16 08:00:00
banner: /assets/banner/banner_3.jpg
---

## 课程视频

官网当前未公开本讲视频，B 站收藏夹也暂无对应视频。

## 学习重点

本讲对应官网 Lecture #22：Implementation: MongoDB。学习时重点关注：

- MongoDB 查询优化如何处理文档模型、索引选择和多计划竞争。
- first past the post 策略如何通过并行试跑选择计划。
- 多计划执行和 ROME 一类方法如何提升复杂工作负载下的鲁棒性。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [First Past the Post: Evaluating Query Optimization in MongoDB](https://15799.courses.cs.cmu.edu/spring2025/papers/23-mongodb/tao-adc2024.pdf) (D. Tao et al., ADC 2024) *(Primary)*
- [ROME: Robust Query Optimization via Parallel Multi-Plan Execution](https://15799.courses.cs.cmu.edu/spring2025/papers/23-mongodb/wei-sigmod2024.pdf) (Z. Wei et al., SIGMOD 2024) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

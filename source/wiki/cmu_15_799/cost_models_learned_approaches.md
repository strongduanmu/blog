---
layout: wiki
wiki: cmu_15_799
order: 016
title: 代价模型：学习型方法
date: 2025-03-19 08:00:00
banner: /assets/banner/banner_16.jpg
---

## 课程视频

官网当前未公开本讲视频，B 站收藏夹也暂无对应视频。

## 学习重点

本讲对应官网 Lecture #15：Cost Models: Learned Approaches。学习时重点关注：

- 学习型基数估计如何用模型替代或补充传统统计信息。
- 训练数据、工作负载漂移和模型泛化能力如何决定 learned estimator 是否可用。
- learned cost model 从头训练和复用传统优化器信号之间的取舍。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Learned Cardinality Estimation: An In-depth Study](https://15799.courses.cs.cmu.edu/spring2025/papers/15-learned/kim-sigmod2022.pdf) (K. Kim et al., SIGMOD 2022) *(Primary)*
- [Learned Cardinality Estimation: A Design Space Exploration and A Comparative Evaluation](https://15799.courses.cs.cmu.edu/spring2025/papers/15-learned/sun-vldb2022.pdf) (J. Sun et al., VLDB 2022) (Optional)
- [Are We Ready For Learned Cardinality Estimation?](https://15799.courses.cs.cmu.edu/spring2025/papers/15-learned/wang-vldb2021.pdf) (X. Wang et al., VLDB 2021) (Optional)
- [Rethinking Learned Cost Models: Why Start from Scratch?](https://15799.courses.cs.cmu.edu/spring2025/papers/15-learned/yang-sigmod2023.pdf) (J. Yang et al., SIGMOD 2023) (Optional)
- [An End-to-End Learning-based Cost Estimator](https://15799.courses.cs.cmu.edu/spring2025/papers/15-learned/p307-sun.pdf) (J. Sun et al., VLDB 2019) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

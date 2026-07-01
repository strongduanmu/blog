---
layout: wiki
wiki: cmu_15_799
order: 024
title: 实现：Microsoft Fabric
date: 2025-04-21 08:00:00
banner: /assets/banner/banner_4.jpg
---

## 课程视频

官网当前未公开本讲视频，B 站收藏夹也暂无对应视频。

## 学习重点

本讲对应官网 Lecture #23：Implementation: Microsoft Fabric。学习时重点关注：

- Microsoft Fabric 如何在 Lakehouse 生态中提供统一查询优化能力。
- Optimizer as a Service 如何把优化能力从单一数据库内核中抽离出来。
- 跨引擎、跨存储和跨数据模型优化需要统一哪些元数据与代价信号。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Unified Query Optimization in the Fabric Data Warehouse](https://15799.courses.cs.cmu.edu/spring2025/papers/24-fabric/bruno-sigmod2024.pdf) (N. Bruno et al., SIGMOD 2024) *(Primary)*
- [Towards Query Optimizer as a Service (QOaaS) in a Unified LakeHouse Ecosystem: Can One QO Rule Them All?](https://15799.courses.cs.cmu.edu/spring2025/papers/24-fabric/alotaibi-cidr2025.pdf) (R. Alotaibi et al., CIDR 2025) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

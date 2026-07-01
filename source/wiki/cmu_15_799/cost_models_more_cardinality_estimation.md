---
layout: wiki
wiki: cmu_15_799
order: 015
title: 代价模型：更多基数估计
date: 2025-03-12 08:00:00
banner: /assets/banner/banner_15.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836632894831&bvid=BV1ABKd6jEjs&cid=39520767576&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：14 - Lecture 14 - Cost Models More Cardinality Estimation](https://www.bilibili.com/video/BV1ABKd6jEjs)

## 学习重点

本讲对应官网 Lecture #14：Cost Models: More Cardinality Estimation。学习时重点关注：

- 更复杂的基数估计误差如何改变 SQL Server 等系统中的执行计划。
- TPC-DS、TPC-H、DSB 和真实工作负载如何覆盖比 JOB 更复杂的查询形态。
- 估计误差、代价模型误差和执行计划选择之间如何相互放大。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Analyzing the Impact of Cardinality Estimation on Execution Plans in Microsoft SQL Server](https://15799.courses.cs.cmu.edu/spring2025/papers/14-cardinalities2/lee-vldb2023.pdf) (K. Lee et al., VLDB 2023) *(Primary)*

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/14-cardinalities2.pdf)
- [课程 Video](https://www.youtube.com/watch?v=4sZZRiG_7Xg&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=14)
- [B 站视频](https://www.bilibili.com/video/BV1ABKd6jEjs)

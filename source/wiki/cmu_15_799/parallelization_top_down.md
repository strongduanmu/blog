---
layout: wiki
wiki: cmu_15_799
order: 011
title: 并行化：自上而下
date: 2025-02-17 08:00:00
banner: /assets/banner/banner_11.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836549072734&bvid=BV1pzKd61Emc&cid=39520370715&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：10 - Lecture 10 - Parallelization Top-Down](https://www.bilibili.com/video/BV1pzKd61Emc)

## 学习重点

本讲对应官网 Lecture #10：Parallelization: Top-Down。学习时重点关注：

- 自顶向下优化器如何把 memo、任务队列和规则应用并行化。
- Orca/Greenplum 一类优化器中的并发搜索如何处理共享状态。
- 并行搜索带来的确定性、调度和剪枝时机问题。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Parallelizing Extensible Query Optimizers](https://15799.courses.cs.cmu.edu/spring2025/papers/10-parallelization2/waas-sigmod2008.pdf) (F.M. Waas et al., SIGMOD 2008) *(Primary)*

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/10-parallelization2.pdf)
- [课程 Video](https://www.youtube.com/watch?v=joc82ibs4Xo&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=10)
- [B 站视频](https://www.bilibili.com/video/BV1pzKd61Emc)

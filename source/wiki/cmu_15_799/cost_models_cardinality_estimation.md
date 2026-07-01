---
layout: wiki
wiki: cmu_15_799
order: 014
title: 代价模型：基数估计
date: 2025-02-26 08:00:00
banner: /assets/banner/banner_14.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836599338941&bvid=BV1NvKd6EE4h&cid=39520699336&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：13 - Lecture 13 - Cost Models Cardinality Estimation](https://www.bilibili.com/video/BV1NvKd6EE4h)

## 学习重点

本讲对应官网 Lecture #13：Cost Models: Cardinality Estimation。学习时重点关注：

- 基数估计误差如何通过 Join 顺序和物理运算符选择影响最终性能。
- Join Order Benchmark 如何暴露真实查询中优化器估计误差。
- q-error 等指标如何衡量估计质量，以及它们和执行时间之间的关系。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Query Optimization Through the Looking Glass, and What We Found Running the Join Order Benchmark](https://15799.courses.cs.cmu.edu/spring2025/papers/13-cardinalities1/leis-vldbj2017.pdf) (V. Leis et al., VLDB Journal 2017) *(Primary)*
- [EQOP Book](https://www.microsoft.com/en-us/research/publication/extensible-query-optimizers-in-practice/) (Chapter 5.4-5.5) (Optional)
- [How Good are Query Optimizers, Really?](https://15799.courses.cs.cmu.edu/spring2025/papers/13-cardinalities1/p204-leis.pdf) (V. Leis et al., VLDB 2015) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/13-cardinalities1.pdf)
- [课程 Video](https://www.youtube.com/watch?v=Kf9Nj3zI9WI&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=13)
- [B 站视频](https://www.bilibili.com/video/BV1NvKd6EE4h)

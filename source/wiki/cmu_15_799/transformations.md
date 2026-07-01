---
layout: wiki
wiki: cmu_15_799
order: 007
title: 转换规则
date: 2025-02-03 08:00:00
banner: /assets/banner/banner_7.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836465121845&bvid=BV123Ko6XEXP&cid=39519850029&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：06 - Lecture 06 - Transformations](https://www.bilibili.com/video/BV123Ko6XEXP)

## 学习重点

本讲对应官网 Lecture #06：Transformations。学习时重点关注：

- 转换规则如何保持语义等价，并将逻辑表达式改写成更容易优化的形式。
- 规则匹配、规则触发和规则终止条件如何影响优化器正确性。
- Apache Calcite、Cascades 等框架中 transformation 的工程实现取舍。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [EQOP Book](https://www.microsoft.com/en-us/research/publication/extensible-query-optimizers-in-practice/) (Chapter 4.1-4.4, 4.6) *(Primary)*
- [Prairie: A Rule Specification Framework for Query Optimizers](https://15799.courses.cs.cmu.edu/spring2025/papers/06-transformations/das-icde1995.pdf) (D. Das, ICDE 1995) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/06-transformations.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/06-transformations.pdf)
- [课程 Video](https://www.youtube.com/watch?v=oyi02nNjU-o&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=6)
- [B 站视频](https://www.bilibili.com/video/BV123Ko6XEXP)

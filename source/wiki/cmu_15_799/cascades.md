---
layout: wiki
wiki: cmu_15_799
order: 006
title: Cascades
date: 2025-01-29 08:00:00
banner: /assets/banner/banner_6.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836431568299&bvid=BV1knKo62EM9&cid=39519781686&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：05 - Lecture 05 - Cascades](https://www.bilibili.com/video/BV1knKo62EM9)

## 学习重点

本讲对应官网 Lecture #05：Cascades。学习时重点关注：

- Cascades 如何在 Volcano 基础上统一转换规则、实现规则和 memo group。
- promise、任务队列和 group expression 如何影响搜索顺序。
- 为什么 Cascades 成为 SQL Server、Orca 等优化器实现的重要参考。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [EQOP Book](https://www.microsoft.com/en-us/research/publication/extensible-query-optimizers-in-practice/) (Chapter 2) *(Primary)*
- [The Cascades Framework for Query Optimization](https://15799.courses.cs.cmu.edu/spring2025/papers/05-cascades/graefe-ieee1995.pdf) (G. Graefe, IEEE Data Engineering Bulletin 1995) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/05-cascades.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/05-cascades.pdf)
- [课程 Video](https://www.youtube.com/watch?v=bjOIbEg0Stc&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=5)
- [B 站视频](https://www.bilibili.com/video/BV1knKo62EM9)

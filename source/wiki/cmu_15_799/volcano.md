---
layout: wiki
wiki: cmu_15_799
order: 005
title: Volcano
date: 2025-01-27 08:00:00
banner: /assets/banner/banner_5.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836414789449&bvid=BV11jKo6JEPv&cid=39519653878&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：04 - Lecture 04 - Volcano](https://www.bilibili.com/video/BV11jKo6JEPv)

## 学习重点

本讲对应官网 Lecture #04：Volcano。学习时重点关注：

- Volcano 如何从优化器生成器角度抽象逻辑表达式、物理运算符和搜索过程。
- 自顶向下搜索如何用 memo 结构避免重复优化同一个子问题。
- physical properties 和 enforcer 如何表达排序、分区等执行要求。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [The Volcano Optimizer Generator: Extensibility and Efficient Search](https://15799.courses.cs.cmu.edu/spring2025/papers/04-volcano/graefe-icde1993.pdf) (G. Graefe et al., ICDE 1993) *(Primary)*
- [Volcano - An Extensible and Parallel Query Evaluation System](https://15799.courses.cs.cmu.edu/spring2025/papers/04-volcano/graefe-icde1994.pdf) (G. Graefe et al., ICDE 1994) (Optional)
- [The EXODUS Optimizer Generator](https://15799.courses.cs.cmu.edu/spring2025/papers/04-volcano/graefe-sigmod1987.pdf) (G. Graefe et al., SIGMOD 1987) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/04-volcano.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/04-volcano.pdf)
- [课程 Video](https://www.youtube.com/watch?v=kguocoOxXKM&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=4)
- [B 站视频](https://www.bilibili.com/video/BV11jKo6JEPv)

---
layout: wiki
wiki: cmu_15_799
order: 012
title: 查询去嵌套
date: 2025-02-19 08:00:00
banner: /assets/banner/banner_12.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836565784419&bvid=BV1cyKd6GEgF&cid=39520502618&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：11 - Lecture 11 - Unnesting Queries](https://www.bilibili.com/video/BV1cyKd6GEgF)

## 学习重点

本讲对应官网 Lecture #11：Unnesting Queries。学习时重点关注：

- 相关子查询、嵌套查询和 Apply 运算符为什么会阻碍高效执行。
- 去嵌套如何把过程式依赖改写成关系代数中的 Join、聚合或窗口形式。
- 复杂 SQL 中 decorrelation 的适用条件和语义边界。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Improving Unnesting of Complex Queries](https://15799.courses.cs.cmu.edu/spring2025/papers/11-unnesting/neumann-btw2025.pdf) (T. Neumann, BTW 2025) *(Primary)*
- [Unnesting Arbitrary Queries](https://15799.courses.cs.cmu.edu/spring2025/papers/11-unnesting/neumann-btw2015.pdf) (T. Neumann et al., BTW 2015) (Optional)
- [EQOP Book](https://www.microsoft.com/en-us/research/publication/extensible-query-optimizers-in-practice/) (Chapter 4.5) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/11-unnesting.pdf)
- [课程 Video](https://www.youtube.com/watch?v=Ax4y8dPPYJA&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=11)
- [B 站视频](https://www.bilibili.com/video/BV1cyKd6GEgF)

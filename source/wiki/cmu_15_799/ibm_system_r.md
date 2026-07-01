---
layout: wiki
wiki: cmu_15_799
order: 003
title: IBM System R
date: 2025-01-15 08:00:00
banner: /assets/banner/banner_3.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836381234765&bvid=BV1XcKo68Egm&cid=39519522023&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：02 - Lecture 02 - IBM System R](https://www.bilibili.com/video/BV1XcKo68Egm)

## 学习重点

本讲对应官网 Lecture #02：IBM System R。学习时重点关注：

- System R 如何把访问路径选择建模为基于代价的搜索问题。
- 动态规划如何枚举 Join 顺序，并利用 interesting orders 保留后续可能有价值的排序结果。
- 选择率、基数估计和代价模型如何共同影响最终物理计划。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Access Path Selection in a Relational Database Management System](https://15799.courses.cs.cmu.edu/spring2025/papers/02-systemr/selinger-sigmod1979.pdf) (P.G. Selinger et al., SIGMOD 1979) *(Primary)*

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/02-systemr.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/02-systemr.pdf)
- [课程 Video](https://www.youtube.com/watch?v=62cAdANFhBg&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=2)
- [B 站视频](https://www.bilibili.com/video/BV1XcKo68Egm)

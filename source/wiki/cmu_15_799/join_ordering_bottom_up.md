---
layout: wiki
wiki: cmu_15_799
order: 008
title: Join 排序：自下而上
date: 2025-02-05 08:00:00
banner: /assets/banner/banner_8.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836481898121&bvid=BV1mgKo6WEDr&cid=39520043686&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：07 - Lecture 07 - Join Ordering Bottom-Up](https://www.bilibili.com/video/BV1mgKo6WEDr)

## 学习重点

本讲对应官网 Lecture #07：Join Ordering: Bottom-Up。学习时重点关注：

- 自下而上 Join 枚举如何从单表子计划逐步构造多表计划。
- left-deep、bushy plan 和 hypergraph Join 表达能力之间的差异。
- 动态规划、剪枝和搜索空间大小之间的权衡。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Adaptive Optimization of Very Large Join Queries](https://15799.courses.cs.cmu.edu/spring2025/papers/07-joins1/neumann-sigmod2018.pdf) (T. Neumann et al., SIGMOD 2018) *(Primary)*
- [Dynamic Programming Strikes Back](https://15799.courses.cs.cmu.edu/spring2025/papers/07-joins1/p539-moerkotte.pdf) (G. Moerkotte et al., SIGMOD 2008) (Optional)
- [DPconv: Super-Polynomially Faster Join Ordering](https://15799.courses.cs.cmu.edu/spring2025/papers/07-joins1/stoian-sigmod2025.pdf) (M. Stoian et al., SIGMOD 2025) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/07-joins1.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/07-joins1.pdf)
- [课程 Video](https://www.youtube.com/watch?v=CcUVvnYv7Hg&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=7)
- [B 站视频](https://www.bilibili.com/video/BV1mgKo6WEDr)

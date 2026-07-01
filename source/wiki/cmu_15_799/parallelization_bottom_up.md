---
layout: wiki
wiki: cmu_15_799
order: 010
title: 并行化：自下而上
date: 2025-02-12 08:00:00
banner: /assets/banner/banner_10.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836515454428&bvid=BV11VKo6HEkH&cid=39520241675&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：09 - Lecture 09 - Parallelization Bottom-Up](https://www.bilibili.com/video/BV11VKo6HEkH)

## 学习重点

本讲对应官网 Lecture #09：Parallelization: Bottom-Up。学习时重点关注：

- 自下而上并行化如何拆分动态规划搜索空间。
- 并行 Join 优化中的同步、去重和任务粒度如何影响吞吐。
- 大规模 Join 查询下，优化器运行时间本身如何成为瓶颈。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Efficient Massively Parallel Join Optimization for Large Queries](https://15799.courses.cs.cmu.edu/spring2025/papers/09-parallelization1/mancini-sigmod2022.pdf) (R. Mancini et al., SIGMOD 2022) *(Primary)*
- [Parallelizing Query Optimization](https://15799.courses.cs.cmu.edu/spring2025/papers/09-parallelization1/han-vldb2008.pdf) (W.S. Han et al., VLDB 2008) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/09-parallelization1.pdf)
- [课程 Video](https://www.youtube.com/watch?v=rg9XfV2W07Q&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=9)
- [B 站视频](https://www.bilibili.com/video/BV11VKo6HEkH)

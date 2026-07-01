---
layout: wiki
wiki: cmu_15_799
order: 009
title: Join 排序：自上而下
date: 2025-02-10 08:00:00
banner: /assets/banner/banner_9.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836498808242&bvid=BV1s5Ko6QEfL&cid=39520112196&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：08 - Lecture 08 - Join Ordering Top-Down](https://www.bilibili.com/video/BV1s5Ko6QEfL)

## 学习重点

本讲对应官网 Lecture #08：Join Ordering: Top-Down。学习时重点关注：

- 自顶向下 Join 枚举如何从目标表达式反向寻找可行分解。
- top-down enumeration 如何减少无关子计划生成。
- hypergraph Join 和复杂谓词如何改变 Join 顺序枚举难度。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Optimal Top-Down Join Enumeration](https://15799.courses.cs.cmu.edu/spring2025/papers/08-joins2/dehaan-sigmod2007.pdf) (D. DeHaan et al., SIGMOD 2007) *(Primary)*
- [Counter Strike: Generic Top-Down Join Enumeration for Hypergraphs](https://15799.courses.cs.cmu.edu/spring2025/papers/08-joins2/fender-vldb2013.pdf) (P. Fender et al., VLDB 2013) (Optional)
- [A New, Highly Efficient, and Easy To Implement Top-Down Join Enumeration Algorithm](https://15799.courses.cs.cmu.edu/spring2025/papers/08-joins2/fender-icde2011.pdf) (P. Fender et al., VLDB 2011) (Optional)
- [The Complexity of Transformation-Based Join Enumeration](https://15799.courses.cs.cmu.edu/spring2025/papers/08-joins2/pellenkoft-vldb1997.pdf) (A. Pellenkoft et al., VLDB 1997) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/08-joins2.pdf)
- [课程 Video](https://www.youtube.com/watch?v=vq_kt_XExfY&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=8)
- [B 站视频](https://www.bilibili.com/video/BV1s5Ko6QEfL)

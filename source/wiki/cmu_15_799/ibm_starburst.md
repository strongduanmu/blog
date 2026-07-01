---
layout: wiki
wiki: cmu_15_799
order: 004
title: IBM Starburst
date: 2025-01-22 08:00:00
banner: /assets/banner/banner_4.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836398011692&bvid=BV1y7Ko6UEVD&cid=39519650255&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：03 - Lecture 03 - IBM Starburst](https://www.bilibili.com/video/BV1y7Ko6UEVD)

## 学习重点

本讲对应官网 Lecture #03：IBM Starburst。学习时重点关注：

- Starburst 如何把查询重写和查询优化做成可扩展的规则系统。
- Query Graph Model 如何作为中间表示连接语义查询和物理执行计划。
- 函数式规则、解释执行和后续 DB2 优化器之间的关系。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Extensible Query Processing in Starburst](https://15799.courses.cs.cmu.edu/spring2025/papers/03-starburst/haas-sigmodrec1989.pdf) (L.M. Haas et al., SIGMOD Record 1989) *(Primary)*
- [EQOP Book](https://www.microsoft.com/en-us/research/publication/extensible-query-optimizers-in-practice/) (Chapter 3.1) (Optional)
- [Grammar-like Functional Rules for Representing Query Optimization Alternatives](https://15799.courses.cs.cmu.edu/spring2025/papers/03-starburst/p18-lohman.pdf) (G. Lohman, SIGMOD Record 1988) (Optional)
- [Extensible/Rule Based Query Rewrite Optimization in Starburst](https://15799.courses.cs.cmu.edu/spring2025/papers/03-starburst/pirahesh-sigmodrec1992.pdf) (H. Pirahesh et al., SIGMOD Record 1992) (Optional)
- [Implementing an Interpreter for Functional Rules in a Query Optimizer](https://15799.courses.cs.cmu.edu/spring2025/papers/03-starburst/lee-vldb1988.pdf) (M.K Lee et al., VLDB 1988) (Optional)
- [Query Optimization in the IBM DB2 Family](https://15799.courses.cs.cmu.edu/spring2025/papers/03-starburst/gassner-icdebul1993.pdf) (P. Gassner et al., IEEE Data Engineering Bulletin 1993) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/03-starburst.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/03-starburst.pdf)
- [课程 Video](https://www.youtube.com/watch?v=iXMiG1vdnyc&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=3)
- [B 站视频](https://www.bilibili.com/video/BV1y7Ko6UEVD)

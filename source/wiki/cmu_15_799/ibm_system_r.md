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


## 背景

![关系模型的开端](/wiki/cmu_15_799/ibm_system_r/dawn-of-relational-model.png)

在关系模型出现以前的 20 世纪 60 时代，早期的 `DBMS` 要求开发者编写如上图所示的存储过程，来实现各种查询需求。开发者需要基于当前的数据内容，自己选择数据访问路径，以及执行的顺序，当 `DBMS` 发生变化时，这些存储过程代码必须重写，开发成本巨大。

![关系模型](/wiki/cmu_15_799/ibm_system_r/relational-model.png)

基于这样的背景，关系模型应运而生。关系模型具有 3 个原则：1. 数据物理层和逻辑层之间的独立性；2. 完整性约束，确保用户不会插入错误数据，或者破坏数据；3. 声明式数据操作，即 SQL 语言，以便更好地查询数据。

## 参考资料

- [Access Path Selection in a Relational Database Management System](https://15799.courses.cs.cmu.edu/spring2025/papers/02-systemr/selinger-sigmod1979.pdf) (P.G. Selinger et al., SIGMOD 1979) *(Primary)*

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/02-systemr.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/02-systemr.pdf)
- [课程 Video](https://www.youtube.com/watch?v=62cAdANFhBg&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=2)
- [B 站视频](https://www.bilibili.com/video/BV1XcKo68Egm)

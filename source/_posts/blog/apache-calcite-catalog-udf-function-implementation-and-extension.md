---
title: Apache Calcite Catalog 拾遗之 UDF 函数实现和扩展
tags: [Calcite]
categories: [Calcite]
date: 2024-08-23 08:00:00
updated: 2024-08-23 08:00:00
cover: /assets/blog/2022/04/05/1649126780.jpg
references:
  - '[Apache Calcite 优化器详解（二）](https://matt33.com/2019/03/17/apache-calcite-planner/)'
banner: /assets/banner/banner_9.jpg
topic: calcite
---

> 注意：本文基于 [Calcite 1.35.0](https://github.com/apache/calcite/tree/75750b78b5ac692caa654f506fc1515d4d3991d6) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

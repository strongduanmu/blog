---
title: CBO 优化的基石——Apache Calcite 统计信息和代价模型详解
tags: [Calcite]
categories: [Calcite]
banner: china
references:
  - title: Metadata Management in Apache Calcite
    url: https://www.querifylabs.com/blog/metadata-management-in-apache-calcite
  - title: SparkSQL Catalyst － 基于代价优化（CBO）
    url: https://sq.sf.163.com/blog/article/178255009191530496
  - title: Calcite 官方文档中文版 - 适配器 - 统计和代价
    url: https://strongduanmu.com/wiki/calcite/adapters.html#%E7%BB%9F%E8%AE%A1%E5%92%8C%E4%BB%A3%E4%BB%B7
  - title: 数据库内核-CBO 优化器采样与代价模型
    url: https://zhuanlan.zhihu.com/p/669795368?utm_campaign=shareopn&utm_medium=social&utm_oi=985120462346670080&utm_psn=1726928506183983104&utm_source=wechat_session
  - title: 数据库等值查询与统计信息
    url: https://zhuanlan.zhihu.com/p/576987355
  - title: PolarDB-X CBO 优化器技术内幕
    url: https://zhuanlan.zhihu.com/p/370372242
  - title: PolarDB-X 面向 HTAP 的 CBO 优化器
    url: https://zhuanlan.zhihu.com/p/353161383
date: 2024-01-09 08:30:21
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
---

> 注意：本文基于 [Calcite 1.35.0](https://github.com/apache/calcite/tree/75750b78b5ac692caa654f506fc1515d4d3991d6) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

在上一篇[深入理解 Apache Calcite ValcanoPlanner 优化器](https://strongduanmu.com/blog/deep-understand-of-apache-calcite-volcano-planner.html)一文中，我们介绍了 Calcite VolcanoPlanner 的理论基础、核心概念和整体流程，VolcanoPlanner 在优化时会计算不同执行计划的代价 Cost，然后通过代价的比较，最终寻找出最小代价的执行计划。代价 Cost 的计算依赖于`统计信息`和`代价模型`，统计信息是否准确，代价模型是否合理，直接影响了 VolcanoPlanner 优化的效果。上一篇文章中，我们对 Calcite 统计信息和代价模型，只进行了简单的介绍，今天我将结合一个多表关联、聚合查询的案例，和大家一起探究下 Calcite 是如何使用统计信息和代价模型。

## 统计信息和代价模型

TODO



## Calcite RelMetadataQuery 实现

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

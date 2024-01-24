---
title: CBO 优化的基石——Apache Calcite 统计信息和代价模型详解
tags: [Calcite]
categories: [Calcite]
banner: china
references:
  - title: Metadata Management in Apache Calcite
    url: https://www.querifylabs.com/blog/metadata-management-in-apache-calcite
  - title: Calcite 官方文档中文版 - 适配器 - 统计和代价
    url: https://strongduanmu.com/wiki/calcite/adapters.html#%E7%BB%9F%E8%AE%A1%E5%92%8C%E4%BB%A3%E4%BB%B7
  - title: 数据库等值查询与统计信息
    url: https://zhuanlan.zhihu.com/p/576987355
  - title: PolarDB-X CBO 优化器技术内幕
    url: https://zhuanlan.zhihu.com/p/370372242
  - title: PolarDB-X 面向 HTAP 的 CBO 优化器
    url: https://zhuanlan.zhihu.com/p/353161383
  - title: 独家揭秘 | 阿里云分析型数据库 AnalyticDB 新一代 CBO 优化器技术
    url: https://developer.aliyun.com/article/751481
  - title: Oracle 多列统计信息
    url: https://blog.51cto.com/lhrbest/2712352
  - title: 【独家】一文看懂 MySQL 直方图
    url: https://mp.weixin.qq.com/s/1PfzgIh77kosxSyJOpd9UA
  - title: 数据库内核-CBO 优化器采样与代价模型
    url: https://zhuanlan.zhihu.com/p/669795368?utm_campaign=shareopn&utm_medium=social&utm_oi=985120462346670080&utm_psn=1726928506183983104&utm_source=wechat_session
date: 2024-01-09 08:30:21
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
---

> 注意：本文基于 [Calcite 1.35.0](https://github.com/apache/calcite/tree/75750b78b5ac692caa654f506fc1515d4d3991d6) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

在上一篇[深入理解 Apache Calcite ValcanoPlanner 优化器](https://strongduanmu.com/blog/deep-understand-of-apache-calcite-volcano-planner.html)一文中，我们介绍了 Calcite VolcanoPlanner 的理论基础、核心概念和整体流程，VolcanoPlanner 在优化时会计算不同执行计划的代价 Cost，然后通过代价的比较，最终寻找出最小代价的执行计划。代价 Cost 的计算依赖于`统计信息`和`代价模型`，统计信息是否准确，代价模型是否合理，直接影响了 VolcanoPlanner 优化的效果。上一篇文章中，我们对 Calcite 统计信息和代价模型，只进行了简单的介绍，今天我们将结合一个多表关联查询的案例，和大家一起探究下 Calcite 是如何使用统计信息和代价模型，以及在优化过程中，Calcite 会使用哪些优化规则来完成多表关联查询的优化。

## 统计信息和代价模型

在探究 Calcite 如何使用统计信息和代价模型之前，让我们先来了解下相关的基础知识，笔者参考了一些优秀的网络资料，进行了总结整理，原文链接见文末参考资料，感兴趣的读者可阅读研究。

### 统计信息

统计信息 `Statistic` 为优化器的 Cost 计算提供了必要的数据支撑，通常我们可以将统计信息划分为`基础统计信息`和`高级统计信息`。

基础统计信息负责大部分通用场景下的 Cost 计算，具体包括表级别的统计信息 `Row Count`，单个字段的统计信息：每个字段的 `NDV 值`（The Number of Distinct Values），`Max 值`，`Min 值`，`NULL 值`，`Histogram 值`（分布信息，用于区间查询）, `Count-Min Sketch 值`（用于等值查询），`DataSize 值` 等。由于基础统计信息对 Cost 计算至关重要，需要做到自动收集，自动更新，否则很可能因为基础统计信息的缺失，导致优化器产生灾难性的执行计划。

高级统计信息主要用于提升复杂场景下的决策质量，通常包括`多字段间的关联度`（Column Group）、`Functional Deplendency`、`数据倾斜` 等，高级统计信息需要手工触发，只有在必要的时候才会收集。

### 基数估计

有了统计信息后，我们就可以对执行计划中的各个算子进行基数估计（`Cardinality Estimation`），估算这些算子产生结果的行数（或基数）。如下图所示，通过基数估计我们可以选择更优的 `JOIN` 顺序以减少中间结果。`Scan` 算子的行数可以直接从表的统计信息 `Row Count` 获取，而对于 `Filter` 算子，可以使用输入的 `Scan` 算子的行数乘以谓词的选择性。

![基数估计在执行计划选择中的用途](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2024/01/23/1705969782.png)

下面展示了常用算子基数估计的例子：

- `Scan` 算子基数估计：统计信息中收集的表 Row Count；
- `Filter` 算子基数估计：对于唯一属性的谓词，相等条件下结果不超过一行，对于非唯一属性的谓词，相等条件下结果使用 `NDV` 估算选择率，然后计算结果。对于范围查询，我们可以使用直方图估算选择率，然后计算结果；
- `Join` 算子基数估计：`LeftRowCount * RightRowCount * Join Condition Selectivity`；
- `Union` 算子基数估计：`LeftRowCount + RightRowCount`；
- `Agg` 算子基数估计：Group By 列的 Distinct 值数量（NDV）。

### 代价模型

代价模型（`Cost Model`）是用于估算物理执行计划的代价，代价通常使用 `CPU`、`Memory`、`IO`、`Net` 四元组来描述，每一算子都会通过上述四元组来描述其代价。执行计划的代价即是其全部算子的代价之和，最终优化器会根据求和后的 CPU、Memory、IO、Net 加权计算出执行计划的最终代价。

* `CPU`：代表 CPU 的消耗数值；
* `Memory`：代表 Memory 的占用量；
* `IO`：代表磁盘的逻辑 IO 次数；
* `Net`：代表网络的逻辑 IO 次数（交互次数及传输量）；
* 最终 Cost = (CPU, Memory, IO, Net) · (w<sub>1</sub>, w<sub>2</sub>, w<sub>3</sub>, w<sub>4</sub>)，w 为权重向量。

## Calcite RelMetadataQuery 实现

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

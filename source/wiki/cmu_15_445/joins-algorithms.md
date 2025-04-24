---
layout: wiki
wiki: cmu_15_445
order: 012
title: Join 算法
date: 2025-04-23 09:15:27
banner: /assets/banner/banner_3.jpg
---

## Join 算法

### 为什么需要 Join 算法

为了避免不必要的数据信息重复，通常我们会在关系型数据库中，对表进行规范化处理，即：将不同的信息拆分为不同表进行存储。例如：我们会设计订单表 `t_order`，以及订单明细表 `t_order_item`，每个订单表 `t_order` 会有多个订单明细 `t_order_item`，如果我们想查询所有关于 `Andy` 的订单信息，这时候就需要将这 2 张表进行 `join`，获取到所有数据。

因此，我们需要使用 `Join` 来完成类似的需求，`Join` 可以**在不丢失任何数据的情况下，对原始的元组信息 Tuple 进行重组，查询出我们需要的数据**。

### Join 运算符介绍

本节课程主要关注使用等值条件的内连接 `Inner`，暂时只讨论 2 张表关联的情况。通过这些基础的 `Join` 运算，后续我们稍作调整就可以支持其他类型的 `Join` 运算，对于多路连接运算（多张表关联），我们会在高级课程 `15-721` 中介绍。

通常，我们会**将数据量更小的表作为执行计划树中的左表（或者叫外表）**，优化器会尝试估算 2 张表的数据量，然后生成对应的执行计划。

![查询计划](/wiki/cmu_15_445/joins-algorithms/query-plan.png)



## 参考资料

- [课程 Slides](https://15445.courses.cs.cmu.edu/spring2025/slides/12-joins.pdf)
- [课程 Notes](https://15445.courses.cs.cmu.edu/spring2025/notes/12-joins.pdf)
- [课程 Videos](https://www.youtube.com/watch?v=MFazkaZKs1s&list=PLSE8ODhjZXjYDBpQnSymaectKjxCy6BYq&index=13)
- [Database System Concepts 7th Edition Chapter 15.4 - 15.6](https://note.youdao.com/s/3WJhPmHm)
- [2019 年秋季版 CMU 数据库 15-445/645 中文翻译版 - Join 算法 - 01](https://www.simtoco.com/#/albums/video?id=1000233)
- [2019 年秋季版 CMU 数据库 15-445/645 中文翻译版 - Join 算法 - 02](https://www.simtoco.com/#/albums/video?id=1000235)
- [2019 年秋季版 CMU 数据库 15-445/645 中文翻译版 - Join 算法 - 03](https://www.simtoco.com/#/albums/video?id=1000237)
- [2019 年秋季版 CMU 数据库 15-445/645 中文翻译版 - Join 算法 - 04](https://www.simtoco.com/#/albums/video?id=1000239)
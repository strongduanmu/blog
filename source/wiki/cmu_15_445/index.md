---
layout: wiki
wiki: cmu_15_445
order: 001
title: 课程资料
date: 2023-10-31 09:15:27
banner: /assets/banner/banner_3.jpg
---

本系列后续笔记采用 Andy Pavlo 主讲的 **CMU 15-445/645：Intro to Database Systems（2025 年秋季）**。第一篇课程介绍与关系模型保留原文，其余内容按该版本第 02—25 讲逐课整理，每讲对应一篇文档。

正文已核对官方课件与课程笔记，图示从官方 PDF 清晰导出；录像中的口头补充与临时演示尚未逐节核对。首页同时提供每讲的官方课件和 YouTube 入口，便于对照学习。

## 官方资料

- [2025 秋季课程主页](https://15445.courses.cs.cmu.edu/fall2025/)
- [官方课表：课件、课程笔记与视频](https://15445.courses.cs.cmu.edu/fall2025/schedule.html)
- [BusTub 教学数据库](https://github.com/cmu-db/bustub)
- [CMU 数据库课程目录](https://db.cs.cmu.edu/courses/)

## 学习安排

前半部分从 SQL、页面和缓冲池走到索引、排序、连接与执行；后半部分依次学习优化器、事务、恢复和分布式系统。代码实验应使用所选学期的说明和对应版本，不将不同学期的接口要求直接混用。

## 课程目录

| 讲次 | 学习笔记 | 课件 | 视频 |
| --- | --- | --- | --- |
| 01 | [课程简介与关系模型](/wiki/cmu_15_445/course-introduction-and-the-relational-model.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/01-relationalmodel.pdf) | [YouTube](https://www.youtube.com/watch?v=7NPIENPr-zk) |
| 02 | [现代 SQL](/wiki/cmu_15_445/modern-sql.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/02-modernsql.pdf) | [YouTube](https://www.youtube.com/watch?v=O5gU9NQjCAs) |
| 03 | [数据库存储（一）](/wiki/cmu_15_445/database-storage-1.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/03-storage1.pdf) | [YouTube](https://www.youtube.com/watch?v=PRLXdIMJhOg) |
| 04 | [内存管理与缓冲池](/wiki/cmu_15_445/memory-management.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/04-bufferpool.pdf) | [YouTube](https://www.youtube.com/watch?v=8-2yv4z0VZc) |
| 05 | [数据库存储（二）](/wiki/cmu_15_445/database-storage-2.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/05-storage2.pdf) | [YouTube](https://www.youtube.com/watch?v=2_sTdS4h-bY) |
| 06 | [存储模型与压缩](/wiki/cmu_15_445/storage-models-and-compression.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/06-storage3.pdf) | [YouTube](https://www.youtube.com/watch?v=yWnToWrskXE) |
| 07 | [哈希表](/wiki/cmu_15_445/hash-tables.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/07-hashtables.pdf) | [YouTube](https://www.youtube.com/watch?v=nuNW8IfgPNU) |
| 08 | [索引与过滤器（一）](/wiki/cmu_15_445/indexes-and-filters-1.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/08-indexes1.pdf) | [YouTube](https://www.youtube.com/watch?v=u7ii_Lvm9rM) |
| 09 | [索引与过滤器（二）](/wiki/cmu_15_445/indexes-and-filters-2.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/09-indexes2.pdf) | [YouTube](https://www.youtube.com/watch?v=PjST2n7abAY) |
| 10 | [索引并发控制](/wiki/cmu_15_445/index-concurrency-control.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/10-indexconcurrency.pdf) | [YouTube](https://www.youtube.com/watch?v=YgOvfXl6pss) |
| 11 | [排序与聚合算法](/wiki/cmu_15_445/sorting-and-aggregation-algorithms.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/11-sorting.pdf) | [YouTube](https://www.youtube.com/watch?v=LzyKTpeIgts) |
| 12 | [Join 算法](/wiki/cmu_15_445/joins-algorithms.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/12-joins.pdf) | [YouTube](https://www.youtube.com/watch?v=YIdIaPopfpk) |
| 13 | [查询执行（一）](/wiki/cmu_15_445/query-execution-1.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/13-queryexecution1.pdf) | [YouTube](https://www.youtube.com/watch?v=E-UUd6cB57w) |
| 14 | [查询执行（二）](/wiki/cmu_15_445/query-execution-2.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/14-queryexecution2.pdf) | [YouTube](https://www.youtube.com/watch?v=Kzf1hGjtZOU) |
| 15 | [查询规划与优化（一）](/wiki/cmu_15_445/query-planning-and-optimization-1.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/15-optimization1.pdf) | [YouTube](https://www.youtube.com/watch?v=b53huOGcsZ8) |
| 16 | [查询规划与优化（二）](/wiki/cmu_15_445/query-planning-and-optimization-2.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/16-optimization2.pdf) | [YouTube](https://www.youtube.com/watch?v=azTHRpzl10o) |
| 17 | [并发控制理论](/wiki/cmu_15_445/concurrency-control-theory.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/17-concurrencycontrol.pdf) | [YouTube](https://www.youtube.com/watch?v=tMFAgvDViAI) |
| 18 | [两阶段锁并发控制](/wiki/cmu_15_445/two-phase-locking.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/18-twophaselocking.pdf) | [YouTube](https://www.youtube.com/watch?v=drStlhNbfHI) |
| 19 | [时间戳排序并发控制](/wiki/cmu_15_445/timestamp-ordering.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/19-timestampordering.pdf) | [YouTube](https://www.youtube.com/watch?v=risHwKeWbBM) |
| 20 | [多版本并发控制](/wiki/cmu_15_445/multi-version-concurrency-control.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/20-multiversioning.pdf) | [YouTube](https://www.youtube.com/watch?v=tUFha9-DuSk) |
| 21 | [数据库日志](/wiki/cmu_15_445/database-logging.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/21-logging.pdf) | [YouTube](https://www.youtube.com/watch?v=CedEy54pe3g) |
| 22 | [数据库恢复](/wiki/cmu_15_445/database-recovery.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/22-recovery.pdf) | [YouTube](https://www.youtube.com/watch?v=X2jc4qalNy0) |
| 23 | [分布式数据库系统（一）](/wiki/cmu_15_445/distributed-database-systems-1.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/23-distributed1.pdf) | [YouTube](https://www.youtube.com/watch?v=IFLQBWY6dlE) |
| 24 | [分布式数据库系统（二）](/wiki/cmu_15_445/distributed-database-systems-2.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/24-distributed2.pdf) | [YouTube](https://www.youtube.com/watch?v=pQh5fka3FC0) |
| 25 | [课程回顾与系统专题](/wiki/cmu_15_445/final-review-and-systems-potpourri.html) | [PDF](https://15445.courses.cs.cmu.edu/fall2025/slides/25-potpourri.pdf) | [YouTube](https://www.youtube.com/watch?v=qiVUf9X6ItM) |

## 中文参考

- [2019 秋季课程中文翻译](https://www.bilibili.com/video/BV1f7411z7dw/)
- [CMU 15-445 自学指南](https://csdiy.wiki/数据库系统/15445/)

中文翻译对应较早学期，可辅助理解术语；本系列第 02 讲之后的主题顺序和资料链接以 2025 秋季课表为准。

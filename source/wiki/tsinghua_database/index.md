---
layout: wiki
wiki: tsinghua_database
order: 001
title: 课程资料
date: 2024-03-18 08:00:00
banner: /assets/banner/banner_6.jpg
---

本系列根据清华大学李国良教授的《数据库管理系统》公开课程整理，围绕关系模型、数据库设计、存储、事务、索引、优化器与执行器，逐步理解数据库如何构建。

官方资料分为 16 章，B 站对应 23 段录像，其中第 14 章包含 8 个高级专题。笔记按这些录像单元分别成文，课程目录与每篇参考资料对应到官方 PDF；原查询优化流程图继续保留。正文目前按官方课件顺序核对，录像中的口头补充与临时演示尚未逐段核对。

## 课程资料

- [李国良教授课程主页：课件与视频](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)
- [B 站完整课程合集](https://www.bilibili.com/video/BV15u4y1Q71R/)
- [HuaDB 数据库内核实验文档](https://thu-db.github.io/huadb-doc/)
- [HuaDB 教学数据库源码](https://github.com/thu-db/huadb)

## 学习安排

先用关系模型、设计与 SQL 建立语义基础，再学习页面、缓冲区、日志与并发控制；进入查询处理后，将算法放回完整的优化和执行流程。第 14 章讨论不同负载、架构与硬件下的取舍，最后通过 GaussDB 和 SQLite 联系具体实现。系统案例与性能数字均按课程介绍时的版本和实验条件理解。

## 课程目录

| 章节 | 学习笔记 | 课件 | 视频 |
| --- | --- | --- | --- |
| 1 | [数据库概述](/wiki/tsinghua_database/database-overview.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides01.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=1) |
| 2 | [关系模型](/wiki/tsinghua_database/relational-model.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides02.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=2) |
| 3 | [数据库设计](/wiki/tsinghua_database/database-design.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides03.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=3) |
| 4 | [SQL](/wiki/tsinghua_database/sql.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides04.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=4) |
| 5 | [数据库存储](/wiki/tsinghua_database/database-storage.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides05.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=5) |
| 6 | [事务管理](/wiki/tsinghua_database/transaction-management.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides06.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=6) |
| 7 | [故障恢复](/wiki/tsinghua_database/crash-recovery.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides07.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=7) |
| 8 | [并发控制](/wiki/tsinghua_database/concurrency-control.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides08.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=8) |
| 9 | [数据库索引](/wiki/tsinghua_database/database-indexes.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides09.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=9) |
| 10 | [查询处理](/wiki/tsinghua_database/query-processing.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides10.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=10) |
| 11 | [查询优化](/wiki/tsinghua_database/query-optimization.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides11.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=11) |
| 12 | [查询执行](/wiki/tsinghua_database/query-execution.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides12.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=12) |
| 13 | [数据库安全](/wiki/tsinghua_database/database-security.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides13.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=13) |
| 14-1 | [高级数据库：分布式数据库](/wiki/tsinghua_database/distributed-databases.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=14) |
| 14-2 | [高级数据库：OLAP 数据库](/wiki/tsinghua_database/olap-databases.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=15) |
| 14-3 | [高级数据库：HTAP 数据库](/wiki/tsinghua_database/htap-databases.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=16) |
| 14-4 | [高级数据库：内存数据库](/wiki/tsinghua_database/in-memory-databases.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=17) |
| 14-5 | [高级数据库：云原生数据库](/wiki/tsinghua_database/cloud-native-databases.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=18) |
| 14-6 | [高级数据库：新硬件](/wiki/tsinghua_database/new-hardware.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=19) |
| 14-7 | [高级数据库：NoSQL 数据库](/wiki/tsinghua_database/nosql-databases.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=20) |
| 14-8 | [高级数据库：AI 与数据库](/wiki/tsinghua_database/ai-and-databases.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=21) |
| 15 | [GaussDB 简介](/wiki/tsinghua_database/gaussdb.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides15.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=22) |
| 16 | [SQLite 简介](/wiki/tsinghua_database/sqlite.html) | [PDF](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides16.pdf) | [B 站](https://www.bilibili.com/video/BV15u4y1Q71R/?p=23) |

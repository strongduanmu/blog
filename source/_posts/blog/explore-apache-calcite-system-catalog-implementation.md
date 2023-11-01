---
title: Apache Calcite System Catalog 实现探究
tags: [Calcite]
categories: [Calcite]
banner: china
date: 2023-10-30 08:45:38
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
references:
  - title: 'Introduction to Apache Calcite Catalog'
    url: https://note.youdao.com/s/YCJgUjNd
  - title: 'Apache Calcite 框架原理入门和生产应用'
    url: https://zhuanlan.zhihu.com/p/548933943
  - title: 'CMU 15-445 Database Storage II'
    url: https://15445.courses.cs.cmu.edu/fall2019/slides/04-storage2.pdf
  - title: 'CMU 15-445 Query Planning & Optimization I'
    url: https://15445.courses.cs.cmu.edu/fall2019/slides/14-optimization1.pdf
---

> 注意：本文基于 [Calcite 1.35.0](https://github.com/apache/calcite/tree/75750b78b5ac692caa654f506fc1515d4d3991d6) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

在上一篇 [Apache Calcite SQL Parser 原理剖析](http://localhost:4000/blog/implementation-principle-of-apache-calcite-sql-parser.html)一文中，我们详细介绍了 Apache Calcite SQL 解析引擎的实现原理，从基础的 JavaCC 使用，再到 Caclite SQL 解析引擎的内部实现，最后介绍了 Calcite SqlNode 体系和 SQL 生成。Calcite 在完成基础的 SQL 解析后，第二个关键的步骤就是 SQL 校验，而 SQL 校验则依赖用户向 Calcite 注册的系统目录（`System Catalog`），本文会先重点关注 Calcite 系统目录的实现，下一篇再深入探究 Calcite 校验器的内部机制。

## 什么是 System Catalog

![System Catalog 在数据库系统中的作用](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/30/1698628551.png)

在 [CMU 15-445 Query Planning & Optimization I](https://15445.courses.cs.cmu.edu/fall2019/slides/14-optimization1.pdf) 课程中介绍了数据库系统的整体架构，系统目录（`System Catalog`）主要负责存储数据库的元数据信息，具体包括：表、列、索引、视图、用户、权限以及内部统计信息等。从上图可以看出，系统目录在数据库绑定校验、逻辑计划树改写和执行计划优化等阶段发挥了重要作用。

不同数据库系统都有自己的元数据信息获取方法，ANSI 标准规定通过 [INFORMATION_SCHEMA](https://en.wikipedia.org/wiki/Information_schema) 只读视图查询元数据信息，目前大部分数据库都遵循了这个规范，同时也都提供了一些快捷命令，例如：MySQL `SHOW TABLES` 命令，PostgreSQL `\d` 命令。

## Calcite System Catalog 实现

TODO



## 结语

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

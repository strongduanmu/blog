---
title: Apache Calcite System Catalogs 实现探究
tags: [Calcite]
categories: [Calcite]
banner: china
date: 2023-10-30 08:45:38
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
references:
  - title: 'Apache Calcite 框架原理入门和生产应用'
    url: https://zhuanlan.zhihu.com/p/548933943
  - title: 'CMU 15-445 Query Planning & Optimization I'
    url: https://15445.courses.cs.cmu.edu/fall2019/slides/14-optimization1.pdf
---

## 前言

在上一篇 [Apache Calcite SQL Parser 原理剖析](http://localhost:4000/blog/implementation-principle-of-apache-calcite-sql-parser.html)一文中，我们详细介绍了 Apache Calcite SQL 解析引擎的实现原理，从基础的 JavaCC 使用，再到 Caclite SQL 解析引擎的内部实现，最后介绍了 Calcite SqlNode 体系和 SQL 生成。Calcite 在完成基础的 SQL 解析后，第二个关键的步骤就是 SQL 校验，而 SQL 校验则依赖于用户向 Calcite 注册的**系统目录**（`System Catalogs`），今天我们先关注 Calcite 系统目录的实现，下一篇再深入探究 Calcite 校验器的实现机制。

## 什么是 System Catalogs

![System Catalogs 在数据库系统中的作用](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/30/1698628551.png)

TODO

## Calcite System Catalogs 实现

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。
{% note color:green 目前星球刚创建，内部积累的资料还很有限，因此暂时不收费，感兴趣的同学可以联系我，免费邀请进入星球。 %}

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

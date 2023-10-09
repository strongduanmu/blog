---
title: Apache Calcite SQL Parser 原理剖析
tags: [Calcite, JavaCC]
categories: [Calcite]
banner: china
date: 2023-10-09 08:28:49
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
references:
  - title: 'JavaCC 从入门到出门'
    url: https://www.cnblogs.com/orlion/p/7096645.html
  - title: 'Calcite - 看懂 Parser.jj 中的 SqlSelect'
    url: https://www.jianshu.com/p/ddb5e4788500
---

## 前言

在 [Apache Calcite 快速入门指南](https://strongduanmu.com/blog/apache-calcite-quick-start-guide.html) 一文中我们介绍了 Caclite 的执行流程，包括了：`Parse`、`Validate`、`Optimize` 和 `Execute` 四个主要阶段。`Parse` 阶段是整个流程的基础，负责将用户输入的 SQL 字符串解析为 SqlNode 语法树，为后续的元数据校验、逻辑优化、物理优化和计划执行打好基础。Calcite SQL 解析采用的是 JavaCC 框架，本文首先会简要介绍 JavaCC 的使用规范，再结合 Calcite 源码对 SQL 解析引擎进行深入的探究学习。

![Calcite 执行流程](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/09/24/1695513880.png)

## JavaCC 简介

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了`Calcite 从入门到精通`知识星球，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。
{% note color:green 目前星球刚创建，内部积累的资料还很有限，因此暂时不收费，感兴趣的同学可以联系我，免费邀请进入星球。 %}

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

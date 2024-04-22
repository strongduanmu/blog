---
title: 深度探究 Apache Calcite SQL 校验器实现原理
tags: [Calcite]
categories: [Calcite]
references:
  - '[Apache Calcite 教程 - validate 校验](https://blog.csdn.net/QXC1281/article/details/90343560)'
  - '[Apache Calcite 校验流程源码解读](https://segmentfault.com/a/1190000040931285)'
  - '[Apache Calcite SQL 验证](https://zhuanlan.zhihu.com/p/513399371)'
  - '[Calcite SQL 元数据验证原理与实战](https://juejin.cn/post/7209852117297037368)'
  - '[Apache Calcite 处理流程详解（一）](https://matt33.com/2019/03/07/apache-calcite-process-flow/#SqlValidatorImpl-%E6%A3%80%E6%9F%A5%E8%BF%87%E7%A8%8B)'
  - '[数据库内核杂谈（四）：执行模式](https://www.infoq.cn/article/spfiSuFZENC6UtrftSDD)'
date: 2024-04-22 08:00:00
updated: 2024-04-22 08:00:00
cover: /assets/blog/2022/04/05/1649126780.jpg
banner: /assets/banner/banner_9.jpg
topic: calcite
---

> 注意：本文基于 [Calcite 1.35.0](https://github.com/apache/calcite/tree/75750b78b5ac692caa654f506fc1515d4d3991d6) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

在上一篇 [Apache Calcite System Catalog 实现探究](https://strongduanmu.com/blog/explore-apache-calcite-system-catalog-implementation.html)中，我们介绍了经典的数据库的处理流程，包括：`SQL 解析`、`SQL 绑定`、`SQL 优化`以及`计划执行`。SQL 绑定主要的作用是将 SQL 解析生成的 AST 和数据库的元数据进行绑定，从而生成具有语义的 AST。SQL 绑定会通过自底向上的方式遍历 AST，对抽象语法树中的节点进行绑定分析，绑定的过程中会将表、列等元数据附在语法树上，最后生成具有语义的语法树 `Bounded AST`。

Calcite 通过 SQL 校验器实现 SQL 绑定，SQL 校验器所需的 System Catalog 信息，我们在上篇文章已经做了详细的介绍，感兴趣的读者可以阅读回顾相关内容。本文将重点介绍 Calcite SQL 校验器的整体设计，梳理校验器中不同类的用途，然后通过一些案例来展示 SQL 校验器的整体流程，并对流程中的关键方法进行代码级别的分析，力求让大家能够深刻理解 Calcite 的 SQL 校验器。

## SQL 校验器整体设计

SQL 校验器的核心类为 `SqlValidator`，它负责使用 Calcite 元数据信息对 AST 进行验证，最终生成具有语义信息的 AST。在 Calcite 中，可以通过 `SqlValidatorUtil.newValidator` 方法快速创建一个 SqlValidator。

除了 SqlValidator 校验器类之外，Calcite 为了将 SQL 中的名称解析为对象，还在校验器内部构建了两个对象：`SqlValidatorScope` 和 `SqlValidatorNamespace`，SqlValidatorScope 表示名称解析的范围，代表了在查询中的某一个位置，当前可见的字段名和表名。`SqlValidatorNamespace` 则表示了校验过程中查询语句的数据源，不同的查询位置都有不同类型的 namespace 类，例如：表名对应的 `IdentifierNamespace`，Select 语句对应的 `SelectNamespace`，以及 `UNION`、`EXCEPT`、`INTERSECT` 对应的 `SetopNamespace`。下面我们针对核心的 SqlValidator、SqlValidatorScope 和 SqlValidatorNamespace 分别进行探究，了解其设计细节以及适用场景。

### SqlValidator

TODO

### SqlValidatorScope

TODO

### SqlValidatorNamespace

TODO

## SQL 校验器执行流程

TODO

## 结语

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

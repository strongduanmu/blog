---
layout: wiki
wiki: cmu_15_799
order: 002
title: 查询优化简介
date: 2025-02-07 08:00:00
banner: /assets/banner/banner_2.jpg
---

## 课程目标

`15-799` 课程主要介绍数据库查询优化器的**现代实践**，以及查询优化器相关的**系统编程**。通过课程的学习，可以掌握如下 3 部分内容：

1. 查询优化器实现；
2. 编写正确且高效的代码；
3. 适当的文档 + 测试；

当前数据库的需求非常大，每个公司都会遇到数据库相关的问题，而**查询优化器是区分不同数据库能力的关键点**，因此学习查询优化器非常有价值，能够帮助大家更好地理解数据库并解决问题。

本课程包含了如下 2 个实战项目，项目 1 需要独立完成，项目 2 则需要团队合作：

* [Project #1 - Query Optimizer Evaluation](https://15799.courses.cs.cmu.edu/spring2025/project1.html)：动手体验流行的查询优化器，项目中你将使用 Apache Calcite 来优化 SQL 查询，然后在 Calcite（通过枚举适配器）和 DuckDB 上执行 SQL 查询；
* Project #2 - 根据示例项目，选择一个能够团队参与的项目（待定）。

## 查询优化

TODO

## 参考资料

* [EQOP Book ](https://www.microsoft.com/en-us/research/publication/extensible-query-optimizers-in-practice/) (Chapter 1)
* [An Overview of Query Optimization in Relational Systems](https://15799.courses.cs.cmu.edu/spring2025/papers/01-background/chaudhuri-pods1998.pdf) (S. Chaudhuri, PODS 1998) *(Optional)*

* [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/01-background.pdf)
* [课程 Video](https://www.youtube.com/watch?v=YWtH10gfcY0&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=1)
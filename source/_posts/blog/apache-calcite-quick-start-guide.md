---
title: Apache Calcite 快速入门指南
tags: [Calcite]
categories: [Calcite]
date: 2022-07-10 14:46:43
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
---

## Calcite 简介

Apache Calcite 是一个动态数据管理框架，提供了：`SQL 解析`、`SQL 校验`、`SQL 查询优化`、`SQL 生成`以及`数据连接查询`等典型数据库管理功能。Calcite 的目标是 [One Size Fits All](http://www.slideshare.net/julianhyde/apache-calcite-one-planner-fits-all)，即一种方案适应所有需求场景，希望能为不同计算平台和数据源提供统一的查询引擎，并以类似传统数据库的访问方式（SQL 和高级查询优化）来访问不同计算平台和数据源上的数据。下图展示了 Calcite 的架构以及 Calcite 和数据处理系统的交互关系，从图中我们可以看出 Calcite 具有 4 种类型的组件。

{% image https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/07/31/1659246792.png width:550px padding:10px bg:white %}

1. 最外层是 `JDBC Client` 和数据处理系统（`Data Processing System`），JDBC Client 提供给用户，用于连接 Calcite 的 JDBC Server，数据处理系统则用于对接不同的数据存储引擎；

2. 内层是 Calcite 核心架构的流程性组件，包括负责接收 JDBC 请求的 `JDBC Server`，负责解析 SQL 语法的 `SQL Parser`，负责校验 SQL 语义的 `SQL Validator`，以及负责构建算子表达式的 `Expression Builder`；
3. 算子表达式（`Operator Expressions`）、元数据提供器（`Metadata Providers`）、可插拔优化规则（`Pluggable Rules`） 是用于适配不同逻辑的适配器，这些适配器都可以进行灵活地扩展；

4. 查询优化器（`Query Optimizer）`是整个 Calcite 的核心，负责对逻辑执行计划进行优化，基于 RBO 和 CBO 两种优化模型，得到可执行的最佳执行计划。

另外，Calcite 还具有灵活性（`Flexible`）、组件可插拔（`Embeddable`）和可扩展（`Extensible`）3 大核心特性，Calcite 的解析器、优化器都可以作为独立的组件使用。目前，Calcite 作为 SQL 解析与优化引擎，已经广泛使用在 Hive、Drill、Flink、Phoenix 和 Storm 等项目中。

## 快速入门

在了解了 Calcite 的基本架构和特点之后，我们以 Calcite 官方经典的 CSV 案例作为入门示例，来展示下 Calcite 强大的功能。



## 参考文档

* [Calcite 入门使用 - I (CSV Example)](https://zhuanlan.zhihu.com/p/53725382)

* [Apache Calcite 官方文档之 Tutorial 英文版](https://calcite.apache.org/docs/tutorial.html)

* [Apache Calcite 官方文档之 Tutorial 中文版](https://strongduanmu.com/wiki/calcite/tutorial.html)

* [Apache Calcite：Hadoop 中新型大数据查询引擎](https://www.infoq.cn/article/new-big-data-hadoop-query-engine-apache-calcite)

* [Apache Calcite: A Foundational Framework for Optimized Query Processing Over Heterogeneous Data Sources](https://arxiv.org/pdf/1802.10233.pdf)

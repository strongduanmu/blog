---
title: Apache Calcite：异构数据源之上的优化查询处理基础框架
tags: [Calcite, Query Optimization, Paper]
categories: [Calcite]
date: 2022-04-05 10:35:35
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
---

本文翻译自论文 [Apache Calcite: A Foundational Framework for Optimized Query Processing Over Heterogeneous DataSource](https://15721.courses.cs.cmu.edu/spring2019/papers/23-optimizer2/p221-begoli.pdf)，。

### 摘要



Apache Calcite is a foundational software framework that provides
query processing, optimization, and query language support to
many popular open-source data processing systems such as Apache
Hive, Apache Storm, Apache Flink, Druid, and MapD. Calcite’s ar-
chitecture consists of a modular and extensible query optimizer
with hundreds of built-in optimization rules, a query processor
capable of processing a variety of query languages, an adapter ar-
chitecture designed for extensibility, and support for heterogeneous
data models and stores (relational, semi-structured, streaming, and
geospatial). This flexible ,embeddable ,an dextensibl earchitectur
is what makes Calcite an attractive choice for adoption in big-
data frameworks. It is an active project that continues to introduce
support for the new types of data sources, query languages, and
approaches to query processing and optimization.



## 参考文档

https://blog.victorchu.info/posts/121d8993/

https://www.modb.pro/db/125516

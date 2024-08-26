---
title: Apache Calcite Catalog 拾遗之 UDF 函数实现和扩展
tags: [Calcite]
categories: [Calcite]
date: 2024-08-26 08:00:00
updated: 2024-08-26 08:00:00
cover: /assets/blog/2022/04/05/1649126780.jpg
references:
  - '[Apache Calcite——新增动态 UDF 支持](https://blog.csdn.net/it_dx/article/details/117948590)'
banner: /assets/banner/banner_9.jpg
topic: calcite
---

> 注意：本文基于 [Calcite main 分支 99a0df1](https://github.com/apache/calcite/commit/99a0df108a9f72805afb6d87ec5b2c0ed258f1ec) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

最近，很多星球朋友咨询关于 `Calcite UDF` 实现和扩展的问题，在之前 [Apache Calcite System Catalog 实现探究](https://strongduanmu.com/blog/explore-apache-calcite-system-catalog-implementation.html)一文中，我们简单介绍过 `Catalog` 中的 `Function` 对象，也了解到 Calcite 内置了很多函数实现，但在实际使用中内置函数往往无法满足要求，用户需要能够根据自己的需求，灵活地注册新的函数。Caclite 允许用户动态注册 UDF 函数，从而实现更加复杂的 SQL 逻辑，下面本文将深入探讨 Calcite UDF 的实现原理以及常用扩展方式，帮助大家更好地在项目中使用 Calcite UDF。

## Calcite UDF 简介

TODO

## 结语

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

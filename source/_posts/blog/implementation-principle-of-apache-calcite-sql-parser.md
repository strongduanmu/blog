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

在 [Apache Calcite 快速入门指南](https://strongduanmu.com/blog/apache-calcite-quick-start-guide.html) 一文中我们介绍了 Caclite 的执行流程，包括了：`Parse`、`Validate`、`Optimize` 和 `Execute` 四个主要阶段，

## JavaCC 简介

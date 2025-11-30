---
title: 使用 SQLancer 测试 ShardingSphere 联邦查询
tags: [SQLancer, ShardingSphere]
categories: [ShardingSphere]
date: 2025-11-15 08:24:20
updated: 2025-11-29 08:30:00
cover: /assets/blog/blog/sqlancer-logo.png
references:
  - '[SQLacner 官方文档](https://github.com/sqlancer/sqlancer)'
  - '[Finding Logic Bugs in Database Management Systems (Manuel Rigger, ETH SQLancer)](https://www.youtube.com/watch?v=Np46NQ6lqP8)'
  - '[Mining for logic bugs in the Citus extension to Postgres with SQLancer](https://techcommunity.microsoft.com/blog/adforpostgresql/mining-for-logic-bugs-in-the-citus-extension-to-postgres-with-sqlancer/1634393)'
  - '[数据库进阶测试三部曲 - 从 PQS 到 NoREC 再到 TLP](https://zhuanlan.zhihu.com/p/144725800)'
banner: /assets/banner/banner_12.jpg
---

## 前言

在上一篇文章 [ShardingSphere 联邦查询 GROUPING 聚合结果问题分析](http://localhost:4000/blog/analyze-wrong-result-for-shardingsphere-sql-federation-grouping-function.html)中，我们详细介绍了联邦查询引擎实现 `GROUPING` 聚合函数存在的问题，当时笔者曾提到 [SQLacner](https://github.com/sqlancer/sqlancer) 测试工具，它能够通过一些科学的方法来发现 SQL 逻辑问题，帮助提升联邦查询引擎的 SQL 支持度。本文将为大家详细介绍 SQLacner 测试工具，以及工具中内置的几种测试方法，然后我们会使用 SQLacner 工具，直接对联邦查询引擎进行测试，看看这个工具是否能够达到预期的测试效果，发现一些有价值的 SQL 漏洞。

## 什么是 SQLacner

[SQLacner](https://github.com/sqlancer/sqlancer) 项目，是由 [Manuel Rigger](https://www.manuelrigger.at/) 教授创建的，旨在发现数据库 SQL 引擎的逻辑 BUG，Manuel Rigger 教授曾在 Andy 组织的线上分享中介绍过 SQLacner，感兴趣的朋友可以观看 [Finding Logic Bugs in Database Management Systems](https://www.youtube.com/watch?v=Np46NQ6lqP8) 视频了解。

> SQLancer is a tool to automatically test Database Management Systems (DBMSs) in order to find bugs in their implementation. That is, it finds bugs in the code of the DBMS implementation, rather than in queries written by the user. SQLancer has found hundreds of bugs in mature and widely-known DBMSs.

根据官方文档介绍，SQLancer 是一款用于自动测试数据库管理系统的工具，用于查找**数据库实现逻辑中的错误**。它查找的是 **DBMS 实现代码中的错误**，而不是用户编写 SQL 中的错误。目前，SQLancer 已在众多主流的 DBMS 中发现了数百个错误。

下图展示了一个具体的逻辑错误：当用户输入 SQL 语句查询数据时，原本数据库中存在 2 条匹配的数据，但由于数据库的 SQL 引擎存在**逻辑错误**，最终只返回了 1 条数据。除了**少返回数据行**外，逻辑错误还包含：**错误返回过滤条件外的结果**，**返回的数据行内容错误**等。

![什么是逻辑错误](use-sqlancer-to-test-shardingsphere-sql-federation/what_is_logical_bugs.png)

**数据库逻辑错误**相比于**语法错误**危害性更大，语法错误会在执行阶段通过异常码反馈出来，中断当前的 SQL 执行，逻辑错误则会返回不正确的查询结果，用户无法通过任何信息识别出当前的逻辑错误，最终可能会导致严重的业务错误。

使用 SQLancer 测试工具，可以快速发现 SQL 逻辑问题，帮助提升 SQL 引擎的正确性，下面我们将分别介绍 SQLancer 常用的几种测试方法，看看这些方法是如何检测 SQL 逻辑问题。

## PQS 测试方法

![SQLancer PQS 测试原理](use-sqlancer-to-test-shardingsphere-sql-federation/sqlancer-pivoted-query-synthesis-technique.png)





TODO

## NoREC 测试方法

TODO

## TLP 测试方法

TODO

## CERT 测试方法

TODO

## 联邦查询测试实战

SQLancer 测试 java -jar sqlancer-*.jar --num-threads 4 --port 3307 --username root --password root mysql

TODO



{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

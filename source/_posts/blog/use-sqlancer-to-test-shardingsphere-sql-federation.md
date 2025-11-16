---
title: 使用 SQLancer 测试 ShardingSphere 联邦查询
tags: [SQLancer, ShardingSphere]
categories: [ShardingSphere]
date: 2025-11-15 08:24:20
updated: 2025-11-16 08:30:00
cover: /assets/blog/blog/sqlancer-logo.png
references:
  - '[SQLacner 官方文档](https://github.com/sqlancer/sqlancer)'
  - '[Mining for logic bugs in the Citus extension to Postgres with SQLancer](https://techcommunity.microsoft.com/blog/adforpostgresql/mining-for-logic-bugs-in-the-citus-extension-to-postgres-with-sqlancer/1634393)'
  - '[数据库进阶测试三部曲 - 从 PQS 到 NoREC 再到 TLP](https://zhuanlan.zhihu.com/p/144725800)'
banner: /assets/banner/banner_12.jpg
---

## 前言

在上一篇文章 [ShardingSphere 联邦查询 GROUPING 聚合结果问题分析](http://localhost:4000/blog/analyze-wrong-result-for-shardingsphere-sql-federation-grouping-function.html)中，我们详细介绍了联邦查询引擎实现 `GROUPING` 聚合函数存在的问题，当时笔者曾提到 [SQLacner](https://github.com/sqlancer/sqlancer) 测试工具，它能够通过一些科学的方法来发现 SQL 逻辑问题，帮助提升联邦查询引擎的 SQL 支持度。本文将为大家详细介绍 SQLacner 测试工具，以及工具中内置的几种测试方法，然后我们会使用 SQLacner 工具，直接对联邦查询引擎进行测试，看看这个工具是否能够达到预期的测试效果，发现一些有价值的 SQL 漏洞。

## 什么是 SQLacner



  [Manuel Rigger](https://www.manuelrigger.at/)

TODO

## PQS 测试方法

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

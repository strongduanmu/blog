---
title: Apache Calcite 在 MyCat2 中的实践探究
tags: [Calcite]
categories: [Calcite]
date: 2025-02-17 08:33:30
updated: 2025-02-17 08:33:30
cover: /assets/cover/calcite.jpg
references:
  - '[入门 MyCat2](https://www.yuque.com/ccazhw/ml3nkf/fb2285b811138a442eb850f0127d7ea3?)'
banner: /assets/banner/banner_8.jpg
topic: calcite
---

> 注意：本文基于 [MyCat2 main 分支 ced134b](https://github.com/strongduanmu/Mycat2/commit/ced134b06ce8ed0b5b7a9894359a50513532bbb7) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

[MyCat](https://www.mycat.org.cn/) 是曾经较为流行的一款分库分表中间件，能够支持海量数据的水平分片，以及读写分离、分布式事务等功能。[MyCat2](http://mycatone.top/) 在原有功能的基础上增加了分布式查询引擎，该引擎基于 [Calcite](https://calcite.apache.org/) 项目实现，能够**将 SQL 编译为关系代数表达式，并基于规则优化引擎和代价优化引擎，生成物理执行计划，实现对跨库、跨实例的分布式 SQL 的支持**。虽然 MyCat 项目已经停止维护，但是`分布式查询引擎功能`仍然值得我们学习，本文将带领大家一起探索 `Apache Calcite` 在 `MyCat2` 中的实践，学习如何基于 Calcite 构建分布式查询引擎。

## MyCat2 环境搭建



## 结语





{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)


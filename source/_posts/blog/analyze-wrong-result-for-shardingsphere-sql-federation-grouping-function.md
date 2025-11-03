---
title: ShardingSphere 联邦查询 GROUPING 聚合结果问题分析
tags: [Calcite]
categories: [Calcite]
date: 2025-11-03 08:52:14
updated: 2025-11-03 08:52:14
cover: /assets/cover/calcite.jpg
references:
  - '[DBPlusEngine 联邦查询](https://docs.sphere-ex.com/sphereex-dbplussuite/master/zh/docs/plugin-guide/sql-federation/)'
banner: /assets/banner/banner_1.jpg
topic: calcite
---

## 问题背景

上周笔者所在公司客户反馈，使用商业版联邦查询进行复杂 SQL 聚合分析时，出现了 `StringIndexOutOfBoundsException` 异常。根据客户反馈的异常信息，起初笔者觉得这只是一个简单的下标越界问题，于是快速通过 E2E 测试程序复现问题（如下图所示），并对下标越界的代码进行了增强。

![E2E 复现 StringIndexOutOfBoundsException](analyze-wrong-result-for-shardingsphere-sql-federation-grouping-function/string-index-out-of-bounds-exception.png)

但是问题似乎没有这么简单，修改后 E2E 测试仍然没有通过，根据断言结果来看，查询结果同样不符合预期，为了彻底搞清楚这个问题，笔者在周末进行了一番探索研究，最终解决了这个问题。调查问题过程中，笔者对 `GROUPING` 函数的语义有了更深的理解，为了方便自己以及其他有需要的同学参考学习，本文将对问题调查过程进行记录总结，如有介绍不详细或者错误之处，还恳请大家留言指导。

## 问题分析



## 问题解决



## 结语



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

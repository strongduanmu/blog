---
title: Calcite UDF 实战之 ShardingSphere 联邦查询适配 MySQL BIT_COUNT
tags: [Calcite, ShardingSphere]
categories: [Calcite]
date: 2024-11-14 08:39:40
updated: 2024-11-14 08:39:40
cover: /assets/cover/calcite.jpg
references:
  - '[Apache Calcite Catalog 拾遗之 UDF 函数实现和扩展](https://strongduanmu.com/blog/apache-calcite-catalog-udf-function-implementation-and-extension.html)'
  - '[Fix sql federaion case exception caused by upgrade calcite version to 1.38.0](https://github.com/apache/shardingsphere/issues/33385)'
  - '[Bit Functions and Operators](https://dev.mysql.com/doc/refman/8.4/en/bit-functions.html#function_bit-count)'
banner: /assets/banner/banner_7.jpg
topic: calcite
---

## 前言



{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

---
title: Apache Calcite Catalog 拾遗之类型系统实现
tags: [Calcite, ShardingSphere]
categories: [Calcite]
date: 2025-10-30 08:00:00
updated: 2025-10-30 08:00:00
cover: /assets/cover/calcite.jpg
references:
  - '[Calcite DeepWiki SQL Type System](https://deepwiki.com/apache/calcite/4.3-sql-type-system)'
  - '[ChatGPT 推荐 Calcite 类型系统学习路径](https://chatgpt.com/share/68f6df95-5cec-800b-83a5-178578d50e5d)'
  - '[Apache Calcite 的类型系统](https://blog.csdn.net/qq_31183071/article/details/102817214)'
  - '[PolarDB-X 类型系统概述](https://zhuanlan.zhihu.com/p/374130246)'
banner: /assets/banner/banner_7.jpg
topic: calcite
---

注意：本文基于 [Calcite main 分支 34989b0](https://github.com/apache/calcite/commit/34989b0ed7793cedf713c2f159de6247a730458c) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

在之前发布的[深度探究 Apache Calcite SQL 校验器实现原理](https://strongduanmu.com/blog/in-depth-exploration-of-implementation-principle-of-apache-calcite-sql-validator.html)一文中，我们详细介绍了 Calcite 校验器的实现原理，在 SQL 校验的过程中，Calcite 会不断调用 `deriveType` 进行类型推断，当时由于篇幅的原因，我们在文章中没有进行过多介绍。今天，让我们继续刨根问底，专门从 Calcite 类型系统的角度，深入探究 Calcite 的类型体系，了解在校验过程时如何进行类型推导和类型转换的。

## 类型推导



## 类型转换

### 显示转换



### 隐式转换



## 结语



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

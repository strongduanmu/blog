---
title: 以 Calcite 为例探究 Join 算子的常用实现
tags: [Calcite]
categories: [Calcite]
date: 2025-03-31 08:00:00
updated: 2025-03-31 08:00:00
cover: /assets/cover/calcite.jpg
references:
  - '[Calcite Join 处理 - I (执行器 & 简单 Reorder)](https://zhuanlan.zhihu.com/p/67725127)'
  - '[CMU 15-445 笔记 - Join 算法（Join Algorithms）](https://www.cnblogs.com/timothy020/p/18548006)'
banner: /assets/banner/banner_10.jpg
topic: calcite
---

TODO







{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)


---
layout: wiki
wiki: tsinghua_database
order: 017
title: 高级数据库：HTAP 数据库
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_5.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：高级数据库：HTAP 数据库课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1268442722&page=16&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 为什么需要 HTAP

HTAP 希望在统一的数据体系中同时支持 OLTP 与 OLAP，减少独立分析系统的数据准备延迟。实时风控、在线报表等场景既需要及时记录事务，也希望快速分析这些新变化。

课程从四个方面比较设计：数据新鲜度、事务与分析的资源隔离、应用使用的透明度，以及吞吐量和延迟。分析读到的数据更新不够及时，即使查询执行很快，也可能无法满足业务目标。

## 四种存储组合

主行存加内存列存，让事务更新行记录，分析利用列式副本，转换路径较短，但两类负载可能竞争同一机器资源。分布式行存加列存副本将负载分开，扩展与隔离更好，代价是同步与可见性延迟。

主行存加分布式列存为分析提供更独立的计算资源，仍需要定义列存追赶和快照边界。主列存加增量行存则让大部分数据保持分析友好的布局，将近期修改暂存在可更新区域，查询时合并两个来源。

![HTAP 的行存、列存及副本组合方式](/wiki/tsinghua_database/htap-databases/storage-architectures.webp)

课件中各方案的优缺点建立在对应架构假设下。实际性能还取决于同步协议、资源配置和负载，不能仅凭“有行存和列存”就推断已经兼顾了全部指标。

## 数据组织与同步

系统可以根据历史负载选择驻留内存的列，也可以按负载调整行列混合布局。选择越灵活，需要维护的布局与优化器搜索空间也越大。

同步方式包括内存增量合并、基于日志的增量传播，以及按主行存重建列存。内存路径减少部分持久日志处理，但扩展范围与故障处理受到约束；日志传播更容易跨节点追赶，却增加解析、转换和应用成本；重建实现直接，但大表全量工作昂贵。

![HTAP 在数据组织、同步、优化与调度上的关键问题](/wiki/tsinghua_database/htap-databases/htap-components.webp)

## 查询优化与资源调度

分析可以只读列存，也可以在同一快照要求下混合扫描行、列数据。未命中内存列时，要选择回到行存还是补充转换，不能只按理想命中路径估算。

负载驱动调度按当前需求分配资源，新鲜度驱动调度还要保证同步追赶不超过允许延迟。给分析更多资源可能加速查询，也可能拖慢事务或同步。HTAP 的调度因此需要同时观察事务延迟、分析耗时和数据滞后，而不是只追求一个吞吐数值。

## 参考资料

- [第 14 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

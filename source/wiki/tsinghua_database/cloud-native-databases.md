---
layout: wiki
wiki: tsinghua_database
order: 019
title: 高级数据库：云原生数据库
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_7.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：高级数据库：云原生数据库课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1268443819&page=18&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 从云托管到云原生

云托管可以将已有数据库部署到云实例上，运维与资源交付方式发生变化，实例内部仍可能保持计算、缓存和存储耦合。云原生专题则重点讨论如何利用共享存储、独立日志和资源池重新划分数据库职责。

这些是课程用于比较设计的架构方向，不是所有云产品都采用完全相同的组件和协议。

## 三种 OLTP 资源划分

计算与存储分离，使计算节点与持久容量能够分别扩展，数据不必随每个计算实例重新放置。远端存储带来访问延迟和网络成本，本地缓存仍很重要。

计算、日志、存储进一步分离，让低延迟日志服务与页面存储各自承担适合的任务。提交可以围绕日志的持久化安排，页面服务再应用日志生成可读页面，但系统必须定义日志、页面与可见性的共同顺序。

![计算、日志与页面存储的分离](/wiki/tsinghua_database/cloud-native-databases/compute-log-storage.webp)

计算、缓存、存储分离增加共享缓存层，减少不同计算节点反复从存储读取同一数据，并让内存也能独立调度。它同时引入缓存一致性、版本和额外故障边界，不能只计算命中时的读取收益。

## 主备同步与恢复

课程讨论日志与页面耦合或分离的数据组织，以及主备如何获取最新状态。部分设计将页面重做放到存储层，计算节点恢复时丢弃失效缓存、重新取得可用页面，减少本地重做过程。

“计算层不做重做”并不是“不需要恢复日志”，而是职责被移到其他层。双层缓存与存储容错还要保证缓存损坏、节点失联时，仍能找到满足提交与快照条件的数据。

## 云原生分析

OLAP 也可以采用存算分离，上层 Worker 分别处理分片，必要时交换中间结果。独立计算集群有利于隔离不同负载，但共享存储与网络仍可能形成竞争。

![云原生 OLAP 的计算层与存储层](/wiki/tsinghua_database/cloud-native-databases/olap-architecture.webp)

元数据可以支持剪枝、复制和版本管理，计算下推减少向上搬运的数据，本地缓存保留重复访问内容。下推与缓存结合时，要估计在远端计算和传回本地之间的成本，避免把所有工作都推给存储侧。

## 弹性与无服务器执行

资源可以按实例或更细任务粒度调度。无服务器形式降低用户直接管理实例的负担，底层仍需处理冷启动、任务状态、数据位置、缓存复用和失败重试。

扩缩容应结合数据分布与执行阶段：任务增加后是否有足够独立工作，已有状态是否需要迁移，最后汇总是否成为瓶颈，都会决定实际弹性收益。

## 参考资料

- [第 14 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

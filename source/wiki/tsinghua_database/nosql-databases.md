---
layout: wiki
wiki: tsinghua_database
order: 021
title: 高级数据库：NoSQL 数据库
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_9.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：高级数据库：NoSQL 数据库课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1268444447&page=20&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## NoSQL 的背景

NoSQL 常解释为 Not Only SQL，面向关系模型以外或更灵活的数据组织与访问需求。课程从互联网数据规模、半结构化内容和不同一致性要求出发，介绍多种模型。

这不是一套统一的功能保证。某个 NoSQL 产品可以支持事务和较强一致性，关系数据库也可以扩展 JSON、图或向量能力，不能按标签直接判断是否有模式、是否可靠或是否支持 SQL。

## 一致性与可用性

CAP 讨论网络分区发生时，线性一致性与所有非故障节点请求都能完成之间的限制；不能通过“选择不容忍网络分区”使真实分区消失，也不能简单按业务行业把系统分成固定的两类。

BASE 描述基本可用、软状态与最终一致的设计倾向。最终一致性要求在更新停止并满足传播等条件后，副本能够收敛，不表示任意时刻都能读到最新值。

有界过时限制版本或时间落后范围，会话一致性提供同一会话内的某些观察保证，一致前缀约束不能跳过前面的写入。具体系统可能组合不同保证，不能把这些名称当成完全相同的总排序。

![副本读取中的强一致与有界过时示例](/wiki/tsinghua_database/nosql-databases/consistency-models.webp)

## 键值、列族与文档

键值数据库围绕键定位值，常用于会话、缓存或按标识访问；哈希与有序结构分别适合不同查询。值可以复杂，但是否支持内部字段索引由系统决定。

列族将经常一起访问的列组织为组，列族内也可能按行或键排序保存。它与分析型数据库的逐列数组布局不是同一概念，不能仅因名称含“列”就推断相同存储与扫描方式。

文档数据库保存可嵌套的对象和数组，便于与应用结构对应，但字段路径、数组匹配、索引和约束仍需要设计。灵活模式减少预先固定结构的要求，并不让数据质量问题自动消失。

## 图、时序与多模

图模型以节点和边表达联系，适合遍历与关系分析，需要考虑邻接组织和跨分区边。时序系统围绕时间戳和测量主体组织数据，利用时间、数值的规律压缩，并安排写入、保留周期和时间窗口聚合。

多模数据库通过统一或协同接口支持多种模型，底层需要解决类型、索引、优化与一致性语义的组合，不能只把几种 API 并排放在一起。

## 向量数据库

向量表示把内容映射到数值空间，通过距离或相似度检索近邻。精确 KNN 计算满足度量定义的最近结果，ANN 用候选搜索换取较低成本，结果质量通常用召回率等指标评估。

![向量类型、向量算子与向量索引的系统位置](/wiki/tsinghua_database/nosql-databases/vector-database.webp)

课程比较原生向量系统与为已有数据库增加向量能力。挑战包括动态更新、持久化恢复、结构化过滤与向量检索顺序、多向量条件、降维以及并发性能。相似度取决于表示模型和距离定义，向量靠近并不自动证明内容事实正确。

## 参考资料

- [第 14 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

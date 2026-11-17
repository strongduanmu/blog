---
layout: wiki
wiki: tsinghua_database
order: 015
title: 高级数据库：分布式数据库
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_3.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：高级数据库：分布式数据库课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1268441250&page=14&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 从单机能力到分布式架构

第 14 章按八个专题展开，本篇对应第一个视频：分布式数据库。课程比较一主多备、多主、分库分表中间件和原生分布式设计，关注数据如何划分、事务如何协调，以及查询如何跨节点执行。

这些架构名称本身不能证明一致性和性能。是否能够跨分片事务、怎样复制、故障后哪些请求仍可完成，需要根据具体协议判断。

## 表与分片的分布

单节点表只保存在一处，复制表在多个节点保存相同数据，多分片表把数据拆到不同节点。小型只读维表可能适合复制，大表则通常需要分片；复制增加维护成本，分片增加跨节点访问的可能性。

![单节点表、复制表与多分片表的数据分布](/wiki/tsinghua_database/distributed-databases/table-distribution.webp)

水平分片按行划分，垂直分片按列划分。哈希分布有利于等值路由，范围分布可以利用范围剪枝，列表分布按预先定义的值组路由。需要一起访问的行能否共置，直接影响单分片事务比例与数据搬运。

## 原子提交与确定性执行

2PC 先准备投票，再发布提交或中止决定。参与者投赞成票前必须具备之后完成决定的能力，决定也需要持久化。已经准备但不知道结局的参与者，不能仅因协调器超时就自行回滚，否则可能与已经提交的节点冲突。

![分布式事务的两阶段提交过程](/wiki/tsinghua_database/distributed-databases/two-phase-commit.webp)

三阶段提交增加预提交状态，试图减少某些故障下的不确定性，但其推进保证依赖同步、故障和通信假设，并不能在任意网络分区下消除阻塞问题。

Calvin 则先为事务安排一致顺序，再按已知访问集合执行，减少执行期间的协调。它需要预先确定读写集合等条件，遇到数据依赖访问时需要额外处理；不能只把普通事务排一个队列就得到相同保证。

## 分布式并发与时钟

集中式锁或时间戳服务容易实现统一顺序，但需要处理瓶颈与高可用。分散管理减少集中压力，又使死锁检测与顺序维护更复杂。

Lamport 时钟维护因果先后的一致编号，反向并不能仅凭编号大小证明因果关系；向量时钟可以表达更多因果与并发信息，代价是随节点数量增长的元数据。混合逻辑时钟结合物理时间和逻辑计数，兼顾接近实际时间与单调顺序。

TrueTime 返回时间不确定区间，依靠时钟设施和协议使用这个区间，而不是假设每台机器都拥有完全相同的瞬时时间。MVCC 可见性和全局提交顺序要与时钟语义一起设计。

## 副本一致性与查询优化

Paxos、Raft 等共识协议可以维护复制状态与决定，但多数派复制不等于允许忽略任意数据分区的事务否决。原子提交、复制一致性和并发隔离仍是不同问题。

分布式查询首先根据条件剪枝分片，并尽量下推过滤和投影。连接两侧已经按同一连接键共同分区时，可以局部连接；否则可以重分布其中一侧或两侧，也可以广播小表。

![Gather、Broadcast 与 Redistribute 三类数据交换](/wiki/tsinghua_database/distributed-databases/data-exchange.webp)

Gather 汇总多路结果，Broadcast 复制到各目标节点，Redistribute 根据键重新分配。选择时应同时估算网络字节数、节点数量、内存和数据倾斜，避免只优化本地 Join 而把代价转移到网络。

## 参考资料

- [第 14 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

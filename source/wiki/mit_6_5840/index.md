---
layout: wiki
wiki: mit_6_5840
order: 001
title: 课程资料
date: 2026-11-17 22:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

本系列整理 **MIT 6.5840：Distributed Systems（原 6.824）2026 年春季课程**，以 Frans Kaashoek、Robert Morris 及嘉宾的最新公开课表为主线，按每次授课建立一篇笔记。内容从 MapReduce、RPC 和存储复制展开，经过共识、事务与缓存，最后讨论不可信存储、区块链和拜占庭容错。

正文已经对照 2026 年官方文字讲义、公开 slide 与阅读论文整理，尚未逐段核对录像中的口头补充和临时演示。多数讲次没有独立 slide，因此图示优先使用当年官方 slide，其余从指定原论文清晰截取；自行梳理的流程图在正文说明依据。

## 课程资料

- [2026 春季课程主页](https://pdos.csail.mit.edu/6.5840/)
- [官方课表：逐讲讲义、论文、FAQ 与实验](https://pdos.csail.mit.edu/6.5840/schedule.html)
- [课程说明与学习要求](https://pdos.csail.mit.edu/6.5840/general.html)
- [2021 官方课表与公开视频入口](http://nil.csail.mit.edu/6.824/2021/schedule.html)
- [2020 完整公开视频播放列表](https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB)
- [Go 官方交互教程](https://go.dev/tour/)

截至 2026 年 11 月 17 日，2026 课表未列逐讲公开录像；目录中的视频采用官方往年课表已提供的 2021 年录像，并明确标注年份。它们用于复习相同主题，讲次编号、课程安排及部分内容与 2026 年不同。其余讲次可直接对照官方讲义、课件与论文学习。

## 学习顺序

课程默认具备操作系统、计算机网络与编程基础。先通过 RPC 和 goroutine 理解消息及并发，再沿 Paxos、Raft 掌握复制状态机；随后比较分片事务、缓存和分布式计算，最后改变信任假设，学习 SUNDR、Bitcoin 与 PBFT。

阅读系统论文时，可以先确认工作负载和故障模型，再跟踪一次正常请求，最后逐项尝试丢包、延迟、重复执行与节点恢复。笔记中的性能数据和硬件条件均属于原论文版本，不直接作为当前产品的规格。

## 逐讲目录

| 2026 讲次 | 学习笔记 | 官方讲义或 slide | 公开录像 |
| --- | --- | --- | --- |
| 01 | [分布式系统导论与 MapReduce](/wiki/mit_6_5840/introduction-and-mapreduce.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l01.txt) | [2021](https://www.youtube.com/watch?v=WtZ7pcRSkOA) |
| 02 | [RPC、线程与并发控制](/wiki/mit_6_5840/rpc-and-threads.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-rpc.txt) | [2021](https://www.youtube.com/watch?v=oZR76REwSyA) |
| 03 | [GFS：大文件存储与主备复制](/wiki/mit_6_5840/gfs.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-gfs.txt) | [2021](https://www.youtube.com/watch?v=6ETFk1-53qU) |
| 04 | [Paxos：容错共识与多数派](/wiki/mit_6_5840/paxos.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-paxos.txt) | 课表未列对应公开录像 |
| 05 | [Go 并发模式：状态、调度与通信](/wiki/mit_6_5840/go-concurrency-patterns.html) | [Slide](https://pdos.csail.mit.edu/6.5840/notes/Go-MIT6824-2026.pdf) | [2021](https://www.youtube.com/watch?v=IdCbMO0Ey9I) |
| 06 | [Raft（一）：复制状态机与 leader 选举](/wiki/mit_6_5840/raft-1.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-raft.txt) | [2021](https://www.youtube.com/watch?v=R2-9bsKmEbo) |
| 07 | [Raft（二）：日志、安全性与快照](/wiki/mit_6_5840/raft-2.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-raft2.txt) | [2021](https://www.youtube.com/watch?v=h3JiQ_lnkE8) |
| 08 | [一致性模型与线性一致性](/wiki/mit_6_5840/linearizability.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-linearizability.txt) | 课表未列对应公开录像 |
| 09 | [ZooKeeper：协调服务与顺序保证](/wiki/mit_6_5840/zookeeper.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-zookeeper.txt) | [2021](https://www.youtube.com/watch?v=HYTDDLo2vSE) |
| 10 | [Raft 实验答疑：实现结构与调试](/wiki/mit_6_5840/raft-lab-qa.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-raft-QA.txt) | 课表未列对应公开录像 |
| 11 | [分布式事务：并发控制与两阶段提交](/wiki/mit_6_5840/distributed-transactions.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-2pc.txt) | [2021](https://www.youtube.com/watch?v=B6btpukqHpM) |
| 12 | [Spanner：广域事务与 TrueTime](/wiki/mit_6_5840/spanner.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-spanner.txt) | [2021](https://www.youtube.com/watch?v=ZulDvY429B8) |
| 13 | [Chain Replication：链式复制与故障恢复](/wiki/mit_6_5840/chain-replication.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-cr.txt) | [2021](https://www.youtube.com/watch?v=1uUcW-Mqg5o) |
| 14 | [FaRM：RDMA 与乐观并发控制](/wiki/mit_6_5840/farm.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-farm.txt) | [2021](https://www.youtube.com/watch?v=07xsfL5E8Ck)、[2021（续）](https://www.youtube.com/watch?v=XwU4jKhBxws) |
| 15 | [IronFleet：分布式系统的形式化验证](/wiki/mit_6_5840/ironfleet.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-ironfleet.txt) | 课表未列对应公开录像 |
| 16 | [Memcached：缓存扩展与一致性](/wiki/mit_6_5840/memcached.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-memcached.txt) | [2021](https://www.youtube.com/watch?v=eYZg0YJtFEE) |
| 17 | [AWS Lambda：按需容器加载与快照恢复](/wiki/mit_6_5840/aws-lambda.html) | [Slide](https://pdos.csail.mit.edu/6.5840/notes/mbrooker_cs_slides_2026.pdf) | 课表未列对应公开录像 |
| 18 | [Ray：分布式 Future 与 Ownership](/wiki/mit_6_5840/ray.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-ray.txt) | 课表未列对应公开录像 |
| 19 | [SUNDR：不可信存储与分叉一致性](/wiki/mit_6_5840/sundr.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-sundr.txt) | [2021](https://www.youtube.com/watch?v=FxwjSs_xSBM) |
| 20 | [Bitcoin：工作量证明与分叉收敛](/wiki/mit_6_5840/bitcoin.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-bitcoin.txt) | [2021](https://www.youtube.com/watch?v=yB6m8EjAqPU) |
| 21 | [PBFT：拜占庭容错与带证据的换主](/wiki/mit_6_5840/byzantine-fault-tolerance.html) | [讲义](https://pdos.csail.mit.edu/6.5840/notes/l-bft.txt) | 课表未列对应公开录像 |

第 10 讲为 Raft 实验答疑；第 22 次课是项目展示，相关安排见下面的项目入口。本系列的讲次编号以 2026 年课表为准。

## 实验与项目

| 实验 | 内容 | 对照学习 |
| --- | --- | --- |
| [Lab 1：MapReduce](https://pdos.csail.mit.edu/6.5840/labs/lab-mr.html) | 任务调度、超时与重试 | 第 1—2、5 讲 |
| [Lab 2：Key/Value Server](https://pdos.csail.mit.edu/6.5840/labs/lab-kvsrv1.html) | 不可靠网络、版本与调用语义 | 第 2、8 讲 |
| [Lab 3：Raft](https://pdos.csail.mit.edu/6.5840/labs/lab-raft1.html) | 选举、日志、持久化与快照 | 第 4、6—7、10 讲 |
| [Lab 4：KV Raft](https://pdos.csail.mit.edu/6.5840/labs/lab-kvraft1.html) | 在复制日志之上构建 KV 服务 | 第 6—8 讲 |
| [Lab 5：Sharded KV](https://pdos.csail.mit.edu/6.5840/labs/lab-shard1.html) | 分片、配置变更与迁移 | 第 9、11—13 讲 |
| [Final Project](https://pdos.csail.mit.edu/6.5840/project.html) | 官方项目要求与展示安排 | 综合应用课程内容 |

实验实现应以 2026 年实验页面和测试接口为准，旧录像中的包名、实验编号和截止时间仅作历史背景。

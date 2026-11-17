---
layout: wiki
wiki: cmu_15_445
order: 025
title: 分布式数据库系统（二）
date: 2025-12-01 08:00:00
banner: /assets/banner/banner_7.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：分布式数据库系统（二）课程视频" src="https://www.youtube-nocookie.com/embed/pQh5fka3FC0" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 跨节点事务的提交决定

一条事务访问多个分区后，不能让一部分永久提交、另一部分永久中止。原子提交要求参与者对事务结局保持一致，已经确定的结局不能随意改变；协议的推进能力则取决于存活节点和通信条件。

本讲从 OLTP 的提交协调转向 OLAP 的跨节点连接。两部分都需要消息交换，但不能将“数据处理完成”直接等同于“全局事务已提交”。

## Two-Phase Commit

2PC 的 Prepare 阶段由协调器询问参与者是否可以提交。参与者完成必要检查并持久化准备状态后投票；只要存在否决，就不能提交。全部参与者准备成功，协调器才能记录并发布 COMMIT 决定，否则发布 ABORT。

![2PC 中准备投票与最终提交的消息流](/wiki/cmu_15_445/distributed-database-systems-2/two-phase-commit.webp)

参与者收到最终决定后完成本地处理并确认。它们需要持久日志，以便重启后知道自己已经准备、提交还是中止。

2PC 的阻塞问题出现在“已经投赞成票，但还不知道最终决定”的状态。如果协调器失联，参与者不能仅因超时就自行中止，因为其他节点可能已经提交。它需要向能够证明决定的节点查询，或者等待协调器恢复；这也是原子性与可用性之间的实际约束。

Early Prepare 可以将最终一次远端操作的结果与准备投票合并，减少消息轮次。提前向客户端确认也必须以提交决定已经满足持久化和故障恢复要求为前提，不能把“收齐赞成票”本身当成已经安全落盘的决定。

## 共识与原子提交的关系

Paxos 使用带编号的提案和多数派交集维护一致决定。后来的提议者需要按协议保留已经可能被选定的值，不能任意用更高编号覆盖旧决定。Multi-Paxos 在稳定领导者下复用已经完成的领导阶段，减少后续日志项的消息成本。

这里需要区分普通共识与事务原子提交。多个资源管理器是否都愿意提交，是事务的业务条件；多数派通常用于复制某个决定或某个参与者的状态，不能因为多数数据分区愿意，就忽略其余分区的否决。补充阅读 Gray 与 Lamport 的 [Consensus on Transaction Commit](https://lamport.azurewebsites.net/video/consensus-on-transaction-commit.pdf)，其中讨论了使用共识构造 Paxos Commit，以及它与 2PC 的关系。

## CAP 与 PACELC

CAP 中的 Consistency 指线性一致性，不是 ACID 中“满足完整性约束”的 C。网络分区发生时，系统不能同时保证所有非故障节点的请求都得到完成响应，以及所有操作继续满足线性一致性。

这不是日常可以任意选择的“三选二”配置项。分区是必须面对的环境条件，不同请求和不同数据范围也可能有不同处理策略。PACELC 进一步提醒：即使没有网络分区，跨节点协调也存在延迟与一致性需求之间的取舍。

## 分布式 Join 的四种情况

连接的基本要求是把可能匹配的记录送到同一执行位置，随后可以使用前面介绍的本地 Join 算法。课件依次比较：

| 数据布局 | 处理方式 |
| --- | --- |
| 一侧已复制到各节点，另一侧分区 | 每个节点直接与本地分区连接 |
| 两侧按连接键共同分区 | 在对应分区内执行本地连接 |
| 一侧很小，但布局不满足连接 | 广播较小一侧后执行本地连接 |
| 两侧都未按连接键划分 | 将需要的数据 Shuffle 到对应连接分区 |

![Shuffle Join 按连接键重新分布两侧输入](/wiki/cmu_15_445/distributed-database-systems-2/shuffle-join.webp)

Broadcast 的成本与小表大小、接收节点数量有关；Shuffle 则需要考虑两侧数据量、网络带宽、分区倾斜和中间存储。不能只比较本地哈希表操作的速度。

Semi-Join Optimization 可以先发送连接键集合或 Bloom Filter，让远端过滤不可能匹配的记录，再发送剩余数据。Bloom Filter 的假阳性只增加后续工作，最终连接仍要精确比较。投影和过滤下推也能减少传输的列与行。

Shuffle 还可以用于重新平衡数据或调整后续阶段的并行度，其本质与单机并行执行中的 Repartition Exchange 相通。

## 参考资料

- [官方课件：第 24 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/24-distributed2.pdf)
- [官方课程笔记：第 24 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/24-distributed2.pdf)

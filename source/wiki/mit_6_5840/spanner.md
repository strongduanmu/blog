---
layout: wiki
wiki: mit_6_5840
order: 013
title: Spanner：广域事务与 TrueTime
date: 2026-11-17 22:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频（2021 年公开录像）

<div class="youtube-video" style="position:relative;width:100%;aspect-ratio:16 / 9;margin:1rem 0;">
  <iframe title="MIT 6.824 2021 · Spanner：广域事务与 TrueTime" src="https://www.youtube-nocookie.com/embed/ZulDvY429B8" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
</div>

## 把广域复制与跨分片事务组合起来

Spanner 论文的目标是跨数据中心保存副本，并支持跨分片事务。每个分片对应一个 Paxos 复制组，组内副本保存同一份数据；事务访问多个分片时，再在各组 leader 之间执行两阶段提交。

![Spanner 在 Paxos 复制组之上运行锁管理与事务协调](/wiki/mit_6_5840/spanner/paxos-and-transactions.webp)

读写事务采用锁控制冲突，把 prepare 与最终决定写入相关复制组。复制协调器和参与者，使单节点故障后仍能恢复事务状态。它仍然要付出跨数据中心通信、日志持久化以及锁等待的成本。

## 为什么单独优化只读事务

论文工作负载中只读事务占很大比例。若每次读取都找远端 leader、拿锁并参与提交协议，读延迟会受到写路径牵制。Spanner 用多版本数据，让只读事务选择同一个时间戳 s，对所有记录读取不晚于 s 的相应版本。

统一快照避免混合新旧状态。转账同时修改 x、y，审计事务要么看到转账前的两项值，要么看到之后的两项值；不能在读取 x 后，被一次新转账插入，再把更新后的 y 拼进同一个结果。

这里的无锁只读建立在整个时间戳与提交协议之上，不能据此认为任意采用 Snapshot Isolation 的读写事务都自动可串行化。

## 本地副本还要等待 safe time

副本不在某次写的 Paxos 多数中时，可能尚未收到需要的版本。读事务不能因为“选了时间戳”就直接从它的当前内容返回，必须确认该副本已能安全回答 s 时刻的查询。

safe time 表示副本可以提供完整一致快照的时间边界，既受 Paxos 日志推进影响，也受已经准备但未决定的事务限制。读取时间戳超过它时，需要等待复制或事务状态推进。因此本地读减少了正常路径的远程访问，并不保证每次都立即完成。

## TrueTime 显式表示时钟误差

TrueTime 返回 `[earliest, latest]` 区间，把不确定性放进 API。协议依赖真实时间落在这个区间内的假设，而不是假设所有机器拥有完全相同的时钟。

为说明外部一致性，讲义用简化规则解释：读写事务选择至少满足本地 TrueTime 上界以及参与者约束的提交时间戳 s；向外确认提交前，等待 `TT.now().earliest > s`。这段 commit wait 使 s 确定已经位于过去。

随后开始的只读事务可以选择新的时间戳来读取快照，并等待副本 safe time 足够。若 T1 已完成，T2 才开始，协议就能让 T2 的顺序位于 T1 之后；这是外部一致性所要求的真实时间约束。

## 为什么等待不能直接删除

如果写事务给一个仍在未来的时间戳后立刻返回，随后另一地区的读可能拿到更小时间戳，读到写之前的版本。这样事务各自的快照或许完整，却违背“先完成的写要被后开始的读看到”的要求。

TrueTime 的价值是限制并量化等待。误差区间越宽，commit wait 或读取等待可能越长；精确授时改善性能，但不能替代不确定区间、提交等待和 safe time 的协议作用。

读写路径、只读快照和实时顺序在这里各有职责。分析 Spanner 时，应该分别追踪：某个决定保存在哪个复制组，某次读取对应哪个快照，以及客户端成功返回时究竟保证了什么。

## 参考资料

- [Spanner](https://pdos.csail.mit.edu/6.5840/notes/l-spanner.txt)
- [Spanner (2012)](https://pdos.csail.mit.edu/6.5840/papers/spanner.pdf)
- [论文讨论 FAQ](https://pdos.csail.mit.edu/6.5840/papers/spanner-faq.txt)

---
layout: wiki
wiki: mit_6_5840
order: 007
title: Raft（一）：复制状态机与 leader 选举
date: 2026-11-17 22:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频（2021 年公开录像）

<div class="youtube-video" style="position:relative;width:100%;aspect-ratio:16 / 9;margin:1rem 0;">
  <iframe title="MIT 6.824 2021 · Raft（一）：复制状态机与 leader 选举" src="https://www.youtube-nocookie.com/embed/R2-9bsKmEbo" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
</div>

## 复制状态机先统一操作顺序

Raft 把共识组织成可用于复制状态机的日志。每个副本包含 Raft 层与应用层：Raft 负责同意命令顺序，应用按顺序执行命令并维护 KV 等业务状态。起始状态相同、命令相同、顺序相同且执行确定，副本才能得到相同结果。

![复制状态机通过共识日志向应用传递相同顺序的命令](/wiki/mit_6_5840/raft-1/replicated-state-machine.webp)

客户端请求到达 leader 的应用层，应用调用 Raft 的 `Start()`。leader 追加日志，通过 AppendEntries 复制；条目安全提交后，各节点再按顺序交给应用执行。`Start()` 返回日志位置只表示接收了提议，不能立即向客户端宣告操作完成。

## term 与三种角色

每个节点处于 follower、candidate 或 leader 状态。term 是单调增加的逻辑任期，一个 term 至多有一个 leader，也可能始终没有 leader。不同节点暂时知道不同 term 并不异常，消息传播会让旧节点跟随更高任期。

![Raft 的角色转换与可能没有 leader 的任期](/wiki/mit_6_5840/raft-1/election-and-terms.webp)

follower 在一段时间没有听到有效 leader 消息后，增加 term、投自己一票并发送 RequestVote。candidate 得到固定配置中多数节点的选票后成为 leader；每个节点在同一 term 中最多投一次票，因此两个 candidate 不可能同时取得多数。

真正的投票条件还包括日志的新旧比较，下一讲会解释这条约束。只有“每任期一票”能够保证选举安全，却不足以保证新 leader 保留全部已提交日志。

## 心跳与随机超时

leader 定期发送 AppendEntries，空日志的 AppendEntries 也承担心跳作用。follower 收到有效消息后推迟选举，减少不必要的角色切换。

如果所有 follower 同时超时，它们可能同时参选并瓜分选票。Raft 让选举超时随机化，使一个 candidate 有机会在其他节点参选之前收集多数。失败选举会进入更高 term 重试；随机化改善取得进展的机会，并不代替多数派与投票规则。

超时太短，会把短暂延迟误判成故障；太长，则增加真正故障后的停顿。安全性不能依赖“通常不会误判”，协议需要在发生误判和网络分区时仍然不产生冲突决定。

## 旧 leader 仍然活着怎么办

新 leader 当选，不代表旧 leader 立即得知。旧 leader 可能还在少数分区中接受 `Start()`，甚至继续向个别 follower 发消息，但它无法取得多数对新操作的认可。遇到更高 term 后，它应退回 follower。

这也解释了为什么 leader 身份本身不能作为读请求安全的充分证明：它可能已经过时。后续需要提交读命令或使用经过证明的读协议确认权威。

日志末尾暂时不同也不等于状态机已经分歧。旧 leader 可能只在自己这里追加条目，新 leader 又在相同位置追加另一条命令。协议允许尚未提交的后缀被覆盖，禁止的是两个状态机在同一日志位置执行不同命令。下一讲将把选举、日志修复与提交条件连起来。

## 参考资料

- [Fault Tolerance: Raft (1)](https://pdos.csail.mit.edu/6.5840/notes/l-raft.txt)
- [Raft (extended) (2014), to end of Section 5](https://pdos.csail.mit.edu/6.5840/papers/raft-extended.pdf)
- [论文讨论 FAQ](https://pdos.csail.mit.edu/6.5840/papers/raft-faq.txt)

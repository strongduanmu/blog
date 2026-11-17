---
layout: wiki
wiki: mit_6_5840
order: 022
title: PBFT：拜占庭容错与带证据的换主
date: 2026-11-17 22:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 从停止工作到主动作恶

Raft 假设参与者遵守协议，故障主要表现为崩溃或失去通信。拜占庭故障允许节点发送矛盾消息、伪造自己的执行结果、拒绝推进，多个坏节点还可能协同攻击。

PBFT 在已知成员集合内复制状态机，要求消息经过认证，攻击者不能伪造诚实节点身份。它与 Bitcoin 的开放成员、工作量竞争不同，目标是让少数恶意副本存在时，正常服务仍然具有一致的执行顺序。

## 为什么需要 3f+1 个副本

若仍用 `2f+1` 个副本，等待 `f+1` 个回复，两个集合的交集可能只有坏节点。它可以在一次写中声称接受新值，又在下一次读中与旧副本合谋返回旧值。

![PBFT 最小配置中的副本数、quorum 与安全活性条件](/wiki/mit_6_5840/byzantine-fault-tolerance/quorum-bound.webp)

在常用最小配置 `N=3f+1` 下，大小 `2f+1` 的两个 quorum 至少相交 `f+1` 个节点，其中至少一个诚实。与此同时，即使 f 个坏节点完全不回复，仍然有 `2f+1` 个诚实节点能够推进。

交集不是完整协议。还必须让诚实节点对“什么已经被确认”保存可核验的证据，避免换主后被另一组说法覆盖。

## 正常路径需要互相佐证

primary 为请求分配 view 与序号，发出 PRE-PREPARE。backup 验证请求摘要和编号，再向其他副本发送 PREPARE，使节点互相检查是否收到同一个提议。

原论文中，一个副本取得对应 PRE-PREPARE 和来自不同 backup 的 `2f` 份匹配 PREPARE，形成 prepared 条件，然后广播 COMMIT。收集 `2f+1` 份匹配 COMMIT，并等待此前序号执行完，才执行请求。

客户端等待 `f+1` 份一致回复即可确认结果，其中至少一份来自诚实副本。这个阈值与副本形成提交证据的 `2f+1` 不同；诚实副本之所以能够回复，是因为它已经完成内部协议，不能把客户端回复阈值直接拿来替代共识轮次。

## 为什么还要 COMMIT 阶段

只看到当前 primary 提议一致，还不足以保证新 view 能发现它。某个诚实节点也许已经 prepared，其他节点却缺少足够证据；若它立即执行，新 primary 可能收集到另一组不包含该证据的状态。

![恶意 primary 要求额外的互证轮次和可验证恢复证据](/wiki/mit_6_5840/byzantine-fault-tolerance/faulty-primary-recovery.webp)

COMMIT 把“已经 prepared”传播到足够多的副本。一个节点得到提交 quorum 后，至少有 `f+1` 个诚实节点保存对应准备证据，后续 view-change quorum 必须与这部分节点相交，使新 primary 无法无声遗漏已执行操作。

## 换主不能只相信新 primary

![PBFT 通过有证据的 view change 和轮换 primary 继续推进](/wiki/mit_6_5840/byzantine-fault-tolerance/view-change.webp)

副本检测长期无进展后触发 view change，提交 checkpoint 和 prepared 证据。新 primary 根据足够多的 VIEW-CHANGE 构造 NEW-VIEW，其他副本检查证据和选择规则，不能只接受一句“从这个序号继续”。

primary 按 view 轮换，避免坏节点反复把自己推回主节点。超时和网络最终稳定等条件服务于活性，安全性则依靠认证、quorum 和跨 view 的证据保留。

## 证明覆盖的范围与代价

PBFT 使用 checkpoint 和水位限制日志，还通过摘要、MAC 等优化减少消息和密码计算成本。全互连通信仍比普通主备复制昂贵，需要在故障模型与运维成本之间选择。

副本数量足够也不保证故障彼此独立。如果所有节点使用同一份存在相同漏洞的软件，攻击可能同时突破容错上限。协议的结论以“最多 f 个副本作恶”和相应密码假设为前提；超过这个范围后，不能继续承诺既有安全和恢复保证。

## 参考资料

- [Byzantine Fault Tolerance](https://pdos.csail.mit.edu/6.5840/notes/l-bft.txt)
- [PBFT 官方课件](https://pdos.csail.mit.edu/6.5840/notes/65840-pbft.pdf)
- [Practical BFT (1999)](https://pdos.csail.mit.edu/6.5840/papers/castro-practicalbft.pdf)
- [论文讨论 FAQ](https://pdos.csail.mit.edu/6.5840/papers/bft-faq.txt)

---
layout: wiki
wiki: mit_6_5840
order: 015
title: FaRM：RDMA 与乐观并发控制
date: 2026-11-17 22:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频（2021 年公开录像）

<div class="youtube-video" style="position:relative;width:100%;aspect-ratio:16 / 9;margin:1rem 0;">
  <iframe title="MIT 6.824 2021 · FaRM：RDMA 与乐观并发控制 · 1" src="https://www.youtube-nocookie.com/embed/07xsfL5E8Ck" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
</div>

<div class="youtube-video" style="position:relative;width:100%;aspect-ratio:16 / 9;margin:1rem 0;">
  <iframe title="MIT 6.824 2021 · FaRM：RDMA 与乐观并发控制 · 2" src="https://www.youtube-nocookie.com/embed/XwU4jKhBxws" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
</div>

## FaRM 为什么重新设计事务路径

FaRM 把数据放在数据中心内的分布式内存中，追求很短的事务延迟。数据按 region 分片，并保存主备副本；配置管理依赖 ZooKeeper 等可靠协调服务。论文的性能结论建立在内存容量、RDMA 网络和特定持久化机制之上。

![FaRM 用 RDMA 访问远程数据、事务日志和消息队列](/wiki/mit_6_5840/farm/architecture.webp)

普通 RPC 的成本不仅是网线上传播，还包括系统调用、协议处理、复制和上下文切换。单边 RDMA 允许网卡直接访问远端注册内存，减少远端 CPU 参与；kernel bypass 则缩短本机软件路径。它们不自动提供事务，协议必须适应这种访问方式。

## 内存持久化依赖什么

论文使用电池支持的方案：断电时保留足够时间停止服务并把内存写入 SSD，重启时再恢复。单机硬件或软件故障依靠其他副本继续工作。这里不能把普通 DRAM 写入称为天然持久，也不能假设所有故障永远彼此独立。

RDMA 写的硬件确认与应用处理完成同样不同。某些阶段只需确认记录安全到达所需内存，随后由远端 CPU 处理；协议需要明确哪些回复代表哪一种承诺。

## 乐观执行与版本检查

事务执行时不为每个读先加锁，而是读取对象及版本，把写集暂存在本地。提交阶段再验证这些读是否仍然有效，冲突时 abort 并重试。低冲突场景下，这比让所有读都经过远端加锁更经济。

![FaRM 提交按锁定、验证、备份提交和主副本提交推进](/wiki/mit_6_5840/farm/commit-protocol.webp)

提交先向写对象的 primary 发送 LOCK，检查读到的版本是否仍匹配，并取得写锁。只读对象通过 VALIDATE 检查版本和锁位。若对象被别的事务修改或锁住，当前事务不能继续沿原读结果提交。

## 只锁写集为什么不够

讲义使用两个事务说明 write skew：初始 x、y 都为 0，T1 读 x 为 0 后写 y=1，T2 读 y 为 0 后写 x=1。若都成功，结果为 `(1,1)`，却不存在产生该结果的串行顺序。

两个事务的写集不同，写锁都可能取得。对读集的验证使它们发现对方持锁或版本变化，至少拒绝冲突执行。乐观并发控制中的“乐观”指先执行后检查，不是可以省略读依赖检查。

## 先保证恢复证据，再暴露修改

通过验证后，协调器把 COMMIT-BACKUP 写到相关备份日志，再进入 COMMIT-PRIMARY。只有在协议要求的备份记录安全存在后，primary 才能发布新值、增加版本并释放锁。

向应用报告成功前，还需要留下足够的最终决定证据。否则协调器及部分副本失败后，幸存者可能只看到 LOCK，不知道验证是否通过，也不知道事务是否真的提交。恢复协议必须能够区分这些状态。

FaRM 与 Spanner 都结合分片、复制和跨分片提交，但优化对象不同：Spanner 处理广域延迟与时间，FaRM 重点压低单数据中心的 CPU 和持久化开销。把论文中的微秒级结果放回硬件、冲突率和工作负载中，才有比较意义。

## 参考资料

- [Optimistic Concurrency Control](https://pdos.csail.mit.edu/6.5840/notes/l-farm.txt)
- [FaRM (2015)](https://pdos.csail.mit.edu/6.5840/papers/farm-2015.pdf)
- [论文讨论 FAQ](https://pdos.csail.mit.edu/6.5840/papers/farm-faq.txt)

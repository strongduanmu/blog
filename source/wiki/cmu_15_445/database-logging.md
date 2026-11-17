---
layout: wiki
wiki: cmu_15_445
order: 022
title: 数据库日志
date: 2025-11-17 08:00:00
banner: /assets/banner/banner_4.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：数据库日志课程视频" src="https://www.youtube-nocookie.com/embed/CedEy54pe3g" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 恢复需要哪些信息

缓冲池让数据库不必每次更新都同步写入数据文件，但崩溃会丢失内存状态。恢复协议既要在正常执行时留下足够信息，也要在重启后根据这些信息恢复原子性和持久性。

UNDO 撤销未完成或中止事务的效果，REDO 重新应用需要恢复的修改。是否需要它们，与页面何时允许落盘、提交时必须写出哪些内容有关。

## STEAL 与 FORCE

STEAL 允许含有未提交修改的页面写入持久存储，NO-STEAL 则禁止这些修改覆盖已提交状态。FORCE 要求提交时将该事务的数据修改写出，NO-FORCE 允许数据页在提交后再写。

| 缓冲策略 | 对恢复的主要要求 |
| --- | --- |
| NO-STEAL + FORCE | 理想模型下不需要从落盘数据中 UNDO 或补做已提交修改 |
| STEAL + FORCE | 需要撤销可能已落盘的未提交修改 |
| NO-STEAL + NO-FORCE | 需要重做尚未落盘的已提交修改 |
| STEAL + NO-FORCE | 同时需要处理 UNDO 和 REDO |

一个页面可能同时包含多个事务的修改，不能简单在某个事务提交时将页面原样写出，就声称满足 NO-STEAL。课件先展示了这种区分，再引出能够解耦提交与数据页写回的方案。

## Shadow Paging

影子页面使用 Copy-on-Write：修改写到新的物理页面，旧页面映射继续表示已提交状态。提交前先确保新页面及其映射持久化，再原子地切换根指针，使整批修改同时进入当前数据库视图。

![影子页表指向新页面，提交时切换根入口](/wiki/cmu_15_445/database-logging/shadow-paging.webp)

它不必每次复制整个数据库，但仍有页面映射复制、碎片、垃圾回收和并发提交等问题。课程还以 SQLite 早期的回滚日志方式说明另一种思路：覆盖页面前先保存旧页面，故障时利用旧内容恢复；不要将所有日志都理解成相同的 redo 格式。

## Write-Ahead Logging

WAL 的核心是持久化顺序：**数据页覆盖持久存储之前，描述相应修改的日志必须已经持久化**。提交确认之前，还要确保该事务的日志及提交决定满足持久化要求。

![WAL 将日志持久化与数据页写回分开安排](/wiki/cmu_15_445/database-logging/write-ahead-log.webp)

由此，系统可以采用 STEAL + NO-FORCE。脏页可提前写出，因为日志允许恢复；提交不必强制写出所有数据页，因为已持久化日志能够补做。日志通常以顺序写组织，而数据页可以在后台按更合适的时机批量写回。

日志需要标识事务、对象和操作，按协议保留撤销、重做所需的信息。Group Commit 将多个事务的一段连续日志一起刷盘，摊薄同步写成本，但每个收到持久提交确认的事务仍必须被本次已持久化的范围覆盖。

日志结构数据文件与 WAL 的目的也不同：前者是数据的组织方式，后者保证修改与故障恢复之间的顺序，两者可以同时存在。

## 日志粒度与 CDC

Physical Logging 描述具体位置上的字节变化；Logical Logging 描述较高层操作；Physiological Logging 结合页面标识和页内逻辑操作，例如用槽位识别记录，而不依赖它在页内永远处于同一字节偏移。

逻辑日志可能更紧凑，但重放时要考虑操作确定性和并发次序。CDC 可以从修改日志中提取变更并发送给副本或外部系统，还需要区分事务提交与中止，以及下游已经处理到的位置。

## Checkpoint

如果重启每次都从最早日志恢复，恢复时间会不断增长。Checkpoint 保存足够的恢复进度信息，以缩小需要分析和重放的范围。

最简单的阻塞式实现停止新事务、等待活跃事务完成、刷出日志和脏页，再持久化检查点。它便于恢复，却暂停正常工作。检查点频率需要平衡运行时写入成本与重启时间；是否可以删除某段旧日志，还要考虑活跃事务、备份与复制等其他使用者，不能仅看它是否早于最新检查点。

## 参考资料

- [官方课件：第 21 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/21-logging.pdf)
- [官方课程笔记：第 21 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/21-logging.pdf)

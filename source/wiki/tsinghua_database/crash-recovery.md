---
layout: wiki
wiki: tsinghua_database
order: 008
title: 故障恢复
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_8.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：故障恢复课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1251721341&page=7&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 故障范围与恢复目标

课程从事务失败、系统崩溃、磁盘损坏和机房灾难依次讨论恢复。事务中止需要撤销局部效果，系统崩溃会丢失内存状态，介质损坏与灾难则可能连持久数据也不可读，不能只靠重启进程解决。

RPO 表示可以容忍的数据丢失范围，RTO 表示可以容忍的恢复时间。备份、日志、多副本和异地容灾分别覆盖不同故障，存在副本并不代表已经解决误操作后的历史恢复。

## 页面写回与日志

STEAL 允许未提交修改写入数据文件，因此需要撤销信息；NO-FORCE 允许提交时不强制写出全部数据页，因此需要重做信息。FORCE 和 NO-STEAL 可以简化某些恢复步骤，但会增加提交写入或缓冲空间压力。

WAL 约束日志与数据页的持久化次序：页面覆盖旧持久状态前，恢复所需日志必须先持久化；确认提交前，提交记录及相应重做信息也必须满足持久化要求。内存中存在一条日志，不等于它能够用于掉电恢复。

日志可以记录逻辑操作、物理字节修改，或页面加页内逻辑操作的混合。较高层日志可能紧凑，但重放需要考虑确定性、并发和数据布局变化。

## Undo、Redo 与影子页面

影子拷贝将修改写入副本，成功后切换入口；影子页面只复制被修改的部分。它避免直接覆盖当前已提交视图，但有映射维护、碎片和并发提交等问题。

纯 Undo 方案要在提交前写出数据，纯 Redo 方案要避免未提交修改进入当前持久数据，Undo/Redo 则允许更灵活地安排脏页写回。恢复先识别事务状态，再按协议重做、撤销；不同算法的扫描规则不能互相混用。

## ARIES 使用哪些状态

ARIES 引入几个相互关联的字段和表：LSN 标识日志顺序，pageLSN 表示页面已经应用到哪条更新；DPT 的 recLSN 表示该页面本轮变脏的起点；ATT 保存活跃事务状态和 lastLSN；prevLSN 连接同一事务的日志。

撤销操作生成 CLR，并通过 undoNextLSN 指出下一步还需撤销的位置。再次故障时，已经完成的补偿可以重做，原始更新不会被反复撤销。

![CLR 的 undoNextLSN 帮助恢复中再次故障后继续回滚](/wiki/tsinghua_database/crash-recovery/compensation-log.webp)

Fuzzy Checkpoint 保存事务表、脏页表和检查点边界，允许事务继续执行，无需每次暂停并刷完全部脏页。它为恢复提供起点，而不是一份完全静止的数据库副本。

## ARIES 的三个阶段

Analysis 从可用检查点向前扫描，重建 ATT、DPT，确定未结束事务和可能需要重做的页面。Redo 从最小 recLSN 开始重放历史，包括之后会被撤销的事务修改和 CLR。

对某条更新，若页面不在 DPT，或者日志 LSN 小于该页 recLSN，可以跳过；读取页面后，若 pageLSN 已大于等于日志 LSN，也可跳过。这里的等号边界很重要：recLSN 对应的第一次未刷盘更新仍可能需要重做，而 pageLSN 相等表示页面已经应用该更新。

Undo 沿未完成事务的日志链逆序撤销，写入 CLR，直到事务结束。课件的完整日志案例分别跟踪了分析时表的变化、重做时哪些页面被跳过，以及撤销如何沿指针推进。

![恢复过程中分析、重做和撤销的日志范围](/wiki/tsinghua_database/crash-recovery/aries-recovery.webp)

## 备份、时间点恢复与闪回

全量备份保存完整基础数据；增量备份保存自上次相关备份以来的变化，差异备份保存自某次全量以来的累计变化。恢复时需要正确的基础备份、备份链与日志，不能只保留最后一个小文件。

PITR 先恢复备份，再将归档日志重放到目标点，适用于日志覆盖范围内的历史恢复。闪回则利用保留的 Undo、历史版本或专门日志，支持历史查询、表或事务级回退等能力；保留窗口和支持粒度由实现决定。

## 多机恢复

主备架构通过日志传播维护副本，故障后切换提供服务。两地三中心通常结合较近距离的同步与远距离的异步复制，权衡确认延迟、RPO 和灾难范围。多活允许更多位置处理请求，也提高了冲突处理、复制一致性和故障切换的复杂度。

## 参考资料

- [第 7 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides07.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

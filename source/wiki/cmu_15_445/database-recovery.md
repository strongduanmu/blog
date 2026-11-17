---
layout: wiki
wiki: cmu_15_445
order: 023
title: 数据库恢复
date: 2025-11-19 08:00:00
banner: /assets/banner/banner_5.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：数据库恢复课程视频" src="https://www.youtube-nocookie.com/embed/X2jc4qalNy0" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## ARIES 的三个原则

上一讲建立了 WAL 与 STEAL + NO-FORCE 的关系。本讲使用 ARIES 解释重启恢复：遵守日志先行，REDO 时 Repeat History，UNDO 时也记录所做的补偿操作，以便恢复过程中再次崩溃后还能继续。

ARIES 的 REDO 不只重放已提交事务，它先恢复故障前已经发生的历史，再撤销未提交事务。将两个阶段直接合并为“只重放赢家”会遗漏这种设计。

## LSN 与正常执行

每条日志有唯一递增的 Log Sequence Number（LSN）。数据页的 pageLSN 表示最近应用到该页的日志，flushedLSN 表示日志已经持久化到哪里。写出页面前必须满足：

$$
\operatorname{pageLSN}\leq\operatorname{flushedLSN}
$$

![页面与日志通过 LSN 维护写入顺序](/wiki/cmu_15_445/database-recovery/log-sequence-numbers.webp)

同一事务的日志通过 prevLSN 连接。事务提交先生成 COMMIT，并将日志持久化到该记录，随后才能确认持久提交；TXN-END 表示后续清理已经完成，不必与 COMMIT 同时刷盘。

事务中止时，沿 prevLSN 逆序撤销修改。每次撤销生成 Compensation Log Record（CLR），记录补偿效果和 undoNextLSN。CLR 可以在 REDO 中重放，但不会再被 UNDO 撤销，undoNextLSN 帮助跳过已经完成的回滚步骤。

## 检查点、ATT 与 DPT

Active Transaction Table（ATT）记录尚未结束清理的事务、状态和 lastLSN；Dirty Page Table（DPT）记录可能尚未写回的页面，以及它首次变脏时的 recLSN。页面可能由活跃、已提交或正在回滚的事务修改，DPT 不是“未提交事务页面表”。

Fuzzy Checkpoint 不要求停止全部事务或立即刷完所有脏页。它通过检查点边界日志及 ATT、DPT 等信息保存恢复起点，再由后续日志补齐检查点期间的变化。检查点持久化完成后，Master Record 指向可用的检查点入口。

## Analysis

恢复先根据 Master Record 找到检查点，向前扫描日志，重建事务状态和脏页信息。遇到事务结束记录可从 ATT 移除，遇到提交记录更新状态；某页面第一次出现在需要跟踪的更新中时，记录相应 recLSN。

分析阶段得到的是哪些事务还需完成处理、哪些页面可能缺少修改，不意味着已经把页面恢复到了最终状态。

## Redo

从 DPT 中最小 recLSN 开始向前扫描。对于更新日志和 CLR，出现以下情况可以跳过：页面不在 DPT；日志 LSN 早于该页 recLSN；或者磁盘页的 pageLSN 已经大于等于当前日志 LSN。

需要重做时，应用日志中的操作，并将 pageLSN 设置为该日志 LSN。pageLSN 检查使重做可以重复运行，避免已经应用的更新被错误地再次累加。

## Undo

对仍需中止的事务，从各自 lastLSN 开始逆序处理，优先选择当前最大的待处理 LSN。普通更新生成 CLR 并撤销；遇到 CLR 则沿 undoNextLSN 继续。全部完成后，写出事务结束信息。

![ARIES 的分析、重做与撤销扫描范围](/wiki/cmu_15_445/database-recovery/aries-phases.webp)

Analysis 或 Redo 中再次崩溃，可以重新执行恢复；Undo 中再次崩溃，则通过已经持久化的 CLR 知道哪些补偿需要重做、哪些原始修改不应再次撤销。可靠恢复因此依赖正常运行、回滚与重启使用同一套日志顺序规则。

课程最后讨论恢复性能：后台写回可以与 REDO 配合，某些设计也允许按访问需要延迟完成回滚。它们都必须在开放新事务前或访问相关数据时，保证未完成事务的状态不会被错误地观察到。

## 参考资料

- [官方课件：第 22 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/22-recovery.pdf)
- [官方课程笔记：第 22 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/22-recovery.pdf)

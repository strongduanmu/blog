---
layout: wiki
wiki: cmu_15_445
order: 020
title: 时间戳排序并发控制
date: 2025-11-10 08:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：时间戳排序并发控制课程视频" src="https://www.youtube-nocookie.com/embed/risHwKeWbBM" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 用时间戳确定顺序

本讲先介绍 Timestamp Ordering 的思路：为事务分配唯一、可比较的时间戳，并使冲突操作符合相应的串行顺序。时间戳不一定就是墙上时钟，可以来自逻辑计数器、物理时钟或两者结合；实现还要处理分配竞争、跨节点协调与时钟变化。

## Optimistic Concurrency Control

OCC 假设冲突较少，先让事务执行，再在提交时检查是否可以接受这些读写。它通常维护私有修改和 Read Set、Write Set，避免其他事务看到尚未验证的结果。

Read Phase 读取数据并记录访问集合，修改先保存在私有工作区。Validation Phase 检查与重叠事务的冲突及次序。Write Phase 在验证成功后安装修改，使其按协议成为可见数据；失败则回滚重试。

![OCC 的读取、验证与写入阶段](/wiki/cmu_15_445/timestamp-ordering/occ-phases.webp)

验证不只是检查两个事务是否写同一记录。较早事务写过的对象如果被较晚事务在不合适的时机读取，也会破坏预定顺序。课件按两个事务的阶段是否重叠，分别检查写集与读集、写集与写集的交集。

Backward Validation 检查当前事务执行期间已提交事务的影响；Forward Validation 则考虑仍在运行、将位于后面的事务。具体实现还要保证验证与结果安装不会留下一个未被检查的竞态窗口。

冲突少时，OCC 避免了长期持锁和等待；冲突多时，事务可能完成大部分工作后才失败，复制、集合维护与时间戳分配也会有开销。

## 动态数据与幻读

前面的读写对象集合如果固定，保护已有对象就能分析冲突。但范围查询还关心当前不存在、以后可能插入的对象。

一个事务两次执行同样的范围查询，另一个事务在期间插入、删除或修改了符合条件的记录，结果集合就可能变化。仅锁住第一次扫描返回的记录，无法保护原本不存在的位置，这就是 Phantom Problem。

![已有记录上的锁不能阻止范围中出现新记录](/wiki/cmu_15_445/timestamp-ordering/phantom-problem.webp)

课程依次讨论了几种处理方式：锁整表等较大范围；提交时重新检查扫描结果；根据查询条件进行 Predicate Locking；利用有序索引保护键值、间隙或键范围。不同系统对 Gap Lock、Key-Range Lock 的定义和兼容规则不同，但共同目标是保护“可能满足查询条件的空间”。没有合适索引时，往往需要扩大保护范围。

## 隔离级别

课程按 SQL 传统异常分类比较四个级别。Read Uncommitted 可能读取未提交值；Read Committed 阻止脏读，但重复读取可能变化；Repeatable Read 保证已读记录的稳定性，但传统定义仍可能允许幻读；Serializable 要求与某个串行执行等价。

这是用于理解隔离约束的分类，不能据此推断所有产品的同名级别都使用同一种锁协议。尤其是采用 MVCC 的实现，快照范围、写冲突处理和幻读行为可能不同。下一讲将讨论 Snapshot Isolation，它也不能仅凭“读取稳定快照”就被视为 Serializable。

Strict Serializable 进一步要求串行顺序尊重事务之间的实时先后关系：一个事务已经完成后才开始的另一个事务，应位于它之后。`READ ONLY` 与 `READ WRITE` 则是访问模式提示，与隔离级别是不同维度，是否据此优化由具体系统决定。

## 参考资料

- [官方课件：第 19 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/19-timestampordering.pdf)
- [官方课程笔记：第 19 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/19-timestampordering.pdf)

---
layout: wiki
wiki: cmu_15_445
order: 018
title: 并发控制理论
date: 2025-11-03 08:00:00
banner: /assets/banner/banner_9.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：并发控制理论课程视频" src="https://www.youtube-nocookie.com/embed/tMFAgvDViAI" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 为什么需要事务

课程先用账户付款和并发更新说明两类问题：两个操作同时读写同一余额，可能覆盖对方的更新；修改只完成一部分时断电，又可能留下不完整状态。事务将一组数据库操作作为整体执行，并为并发与故障提供明确的正确性要求。

课件中的简化方案是一次只运行一个事务，并为修改保留数据库副本，成功后切换到新副本。它容易理解，但浪费并行能力，复制也很昂贵。真实实现需要在允许操作交错的同时维护正确结果。

事务从 `BEGIN` 开始，以 `COMMIT` 或 `ABORT` 结束。数据库可以撤销其管理的数据修改，但已经发出的邮件等外部操作不会因为数据库回滚而自动消失。

## ACID

Atomicity 要求事务的数据库效果全部生效或全部撤销。日志记录修改，提供回滚与恢复所需的信息；影子页面则通过保留旧页面、切换页面映射等方式实现原子切换，并不一定复制整个数据库。

Consistency 表示一致事务从满足约束的状态出发，完成后仍满足约束。数据库负责声明的约束，应用仍需保证业务逻辑本身正确。

Isolation 约束并发事务之间的相互影响。本讲使用可串行化作为主要标准；后续会讨论更弱隔离级别。Durability 则要求已确认提交的效果在系统故障后仍可恢复，它依赖正确的持久化协议以及相应故障模型。

## 调度与冲突

Schedule 描述多个事务读写操作的交错次序。Serial Schedule 不交错不同事务；Serializable Schedule 可以交错，但效果与某个串行顺序等价。两个合法串行顺序也可能得到不同结果，可串行化并不要求指定唯一顺序。

课件使用账户 A、B 转账与计息的例子：转账保持总额不变，计息应作用于符合某个串行顺序的账户状态。若计息恰好穿过转账的中间状态，就可能按错误总额计算。

![转账与计息的不正确交错](/wiki/cmu_15_445/concurrency-control-theory/bad-interleaving.webp)

两个操作冲突，需要同时满足：来自不同事务，访问同一对象，至少一个是写操作。读读不冲突；读写、写读和写写可能改变观察到的值或最终状态。不可重复读、脏读、丢失更新是相应异常中的典型情形。

## 冲突可串行化

若两个调度包含相同事务操作，并且每对冲突操作的相对次序相同，就称为冲突等价。一个调度与某个串行调度冲突等价时，它是冲突可串行化的。

小例子可以不断交换相邻的非冲突操作，观察能否得到串行调度。更方便的判定方法是构造依赖图：每个事务是节点；若 Ti 的操作先于 Tj 的冲突操作，则添加 Ti→Tj 的边。

![通过依赖图中的环判断冲突可串行化](/wiki/cmu_15_445/concurrency-control-theory/dependency-graph.webp)

**依赖图无环，当且仅当调度冲突可串行化。** 无环图的拓扑顺序给出一个等价的串行顺序；有环说明冲突次序形成相互依赖，无法按这种等价关系串行排列。

## 视图可串行化

View Equivalence 保留三类关系：哪些读操作读取初始值，哪些读操作读取哪个事务写入的值，以及哪个事务产生最终写入。它不要求保留所有冲突操作的次序，因此允许一些包含 Blind Write 的调度，而这些调度可能不是冲突可串行化的。

冲突可串行化是视图可串行化的子集。后者判定和运行时维护更困难，课程后续主要围绕可以高效实现的并发控制协议展开。还要单独考虑恢复性：一个调度可串行化，并不自动保证没有读取未提交数据或级联回滚。

## 参考资料

- [官方课件：第 17 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/17-concurrencycontrol.pdf)
- [官方课程笔记：第 17 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/17-concurrencycontrol.pdf)

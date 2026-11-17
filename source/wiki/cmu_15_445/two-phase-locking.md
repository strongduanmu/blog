---
layout: wiki
wiki: cmu_15_445
order: 019
title: 两阶段锁并发控制
date: 2025-11-05 08:00:00
banner: /assets/banner/banner_1.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：两阶段锁并发控制课程视频" src="https://www.youtube-nocookie.com/embed/drStlhNbfHI" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 事务锁与锁管理器

上一讲可以在完整调度上画依赖图，但系统运行时还不知道事务接下来要执行什么。锁协议通过限制当前操作，动态生成满足要求的调度。

Shared Lock（S）允许多个事务同时读取对象；Exclusive Lock（X）与其他 S、X 都互斥，用来保护修改。锁管理器维护对象上的持有者、等待者和模式，决定授予、等待或中止事务。锁表本身也需要短时 Latch 保护，但事务 Lock 与内部 Latch 的作用范围和生命周期不同。

仅在每次访问前加锁、访问后解锁，并不能保证可串行化，还需要规定一个事务如何安排所有锁。

## Two-Phase Locking

2PL 将事务的锁生命周期分成两个阶段：增长阶段只能获得新锁或升级；一旦释放第一把锁，就进入收缩阶段，此后只能释放，不能再获得新锁。

![两阶段锁的增长阶段与收缩阶段](/wiki/cmu_15_445/two-phase-locking/two-phase-locking.webp)

在对象范围固定并按协议保护访问的前提下，2PL 保证冲突可串行化，但仍可能发生死锁。基本 2PL 还可能提前释放写锁，使其他事务读到未提交修改，导致级联回滚。

Strong Strict 2PL，也称 Rigorous 2PL，将全部锁保留到提交或中止。Strict 2PL 则至少将排他锁保留到事务结束，共享锁可以较早释放，但仍要遵守 2PL。保留排他锁已经能够阻止其他事务读写未提交的修改；不能把 Strict 2PL 说成必然重新允许脏读。

## 死锁检测与预防

事务 T1 持有 A 等待 B，T2 持有 B 等待 A，就形成死锁。Waits-for Graph 以事务为节点，以“等待对方释放锁”为有向边，环表示等待依赖无法自行消除。它与上一讲的冲突依赖图用途不同。

![等待图中的死锁环](/wiki/cmu_15_445/two-phase-locking/deadlock.webp)

检测到环后，需要选择牺牲事务回滚，依据可以包含执行进度、已持有锁数量、年龄和重试次数。检测频率需要在 CPU 开销与等待时间之间权衡，也要避免某个事务反复成为牺牲者。

基于时间戳的预防则让等待只能沿一个方向发生。假设老事务优先级更高：

| 协议 | 老事务请求年轻事务持有的锁 | 年轻事务请求老事务持有的锁 |
| --- | --- | --- |
| Wait-Die | 等待 | 请求者回滚 |
| Wound-Wait | 中止年轻持有者 | 等待 |

重启时保留原始优先级，有助于避免不断被更新事务抢先。这里的时间戳用于安排等待方向，与下一讲按时间戳决定串行顺序的协议不要混淆。

## 多粒度锁与意向锁

逐条锁住十亿条记录会产生巨大管理成本，直接锁整表又会阻塞无关访问。多粒度锁使用数据库、表、页、元组等层级，允许按需要选择保护范围。

IS 表示准备在下层取得共享锁，IX 表示准备在下层取得排他锁，SIX 则同时具有当前子树的共享访问与下层排他意图。祖先上的意向锁使系统不必遍历全部子节点，就能判断一个粗粒度请求是否与已有细粒度访问冲突。

![多粒度锁的层级与意向模式](/wiki/cmu_15_445/two-phase-locking/lock-hierarchy.webp)

持有大量细粒度锁时可以尝试 Lock Escalation，将它们升级为较粗锁，以减少锁表开销；是否可以升级仍要检查兼容性。

## 实际 SQL 中的锁

数据库通常根据语句自动申请锁，`SELECT ... FOR UPDATE` 等语法则让应用表达后续修改意图，减少读完后再升级锁的冲突。`SKIP LOCKED` 会跳过当前无法锁定的记录，适合某些队列领取场景，但得到的是被跳过后的结果，不能直接用于要求完整结果的一般查询。

## 参考资料

- [官方课件：第 18 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/18-twophaselocking.pdf)
- [官方课程笔记：第 18 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/18-twophaselocking.pdf)

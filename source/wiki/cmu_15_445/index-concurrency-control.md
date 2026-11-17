---
layout: wiki
wiki: cmu_15_445
order: 011
title: 索引并发控制
date: 2025-09-29 08:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：索引并发控制课程视频" src="https://www.youtube-nocookie.com/embed/YgOvfXl6pss" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 逻辑正确与物理正确

前面介绍数据结构时，默认一次只有一个执行者操作它。多个线程或进程同时访问索引后，即使各自使用的插入、删除算法单独看是正确的，也可能读到正在修改的指针或丢失其他执行者的更新。

本讲关注内部数据结构的物理正确性。Lock 通常保护事务所看到的逻辑内容，例如一条记录是否允许被其他事务修改；Latch 则保护内存中的临界区，例如 B+Tree 节点正在分裂时，其他线程不能读取尚未完成的结构。Latch 的持有时间短，释放规则由数据结构实现负责，不能代替事务隔离。

读 Latch 允许多个读者并发持有；写 Latch 与其他读、写持有者互斥。用一把 Latch 保护整棵树容易实现，但也会将原本能够并行的访问串行化。

## Latch 的实现

课件先从 CPU 的原子指令讲起。Compare-and-Swap（CAS）比较某个内存位置与期望值，仅在相等时写入新值，比较与修改作为一个不可分割的操作完成。

Test-and-Set Spin Latch 让等待者循环尝试取得访问权，避免进入内核，但高竞争时会消耗 CPU，并使缓存行在核心间反复转移。OS Mutex 可以让等待线程休眠，适合等待较长的情况，不过调度和系统调用有成本。读写 Latch 则需要额外维护读者数量和等待状态，还要选择偏向读者、写者或公平调度的策略。

## 哈希表的并发访问

哈希查找通常只涉及一个桶或一条探测路径，比较容易确定需要保护的区域。可以按页面或块加 Latch，也可以进一步细化到槽位。粗粒度方案元数据少、加解锁次数少，细粒度方案允许更多独立访问并行，但管理成本更高。

使用 CAS 实现无 Latch 的槽位插入时，也需要完整的协议。例如先原子地声明一个空槽，再发布已初始化的内容；删除和槽位重用还涉及并发读者是否仍在访问旧内容。不能仅把普通赋值换成 CAS，就认为整个哈希表已经正确。扩容或目录变化同样需要协调。

## B+Tree 的 Latch Crabbing

B+Tree 的困难在于，一个叶子上的操作可能修改祖先节点。Latch Crabbing 又称 Latch Coupling：向下遍历时，先取得孩子的 Latch，再释放不再需要的祖先，保证路径交接过程中结构仍受保护。

读取时一般取得孩子的读 Latch 后即可释放父节点。插入、删除则要检查孩子是否安全：**安全意味着本次操作不会因分裂、合并等行为继续修改它的父节点**。插入关注节点是否还有容量，删除关注删除后是否需要重新分配或合并；根节点等特殊情况也需要单独处理。

![删除操作沿路径取得 Latch 并判断节点是否安全](/wiki/cmu_15_445/index-concurrency-control/latch-crabbing.webp)

如果孩子安全，就可以释放此前保留的祖先 Latch；否则继续保留可能需要修改的路径。课程依次用查找 `38`、删除 `38`、插入 `45` 和插入 `25` 展示了释放时机的差别。它们的区别来自节点容量和结构变化，不是简单地“读完一个节点就释放”。

## 乐观路径与叶子扫描

通常大多数更新并不引起结构调整。可以先以较轻的读 Latch 沿树下降，到叶子再取得写访问权。如果发现目标叶子不安全，就释放已经取得的 Latch，重新从根执行需要保留写 Latch 的路径。这里重试的是树操作，是否中止整个事务由更高层的事务协议决定。

范围扫描还需要沿叶子链表横向移动。这打破了单纯从根到叶的固定加锁顺序：一个线程等待右侧兄弟，另一个线程可能正为合并而等待左侧兄弟，形成环路。

![叶子扫描与删除访问兄弟节点时发生的等待](/wiki/cmu_15_445/index-concurrency-control/leaf-scan-conflict.webp)

课件采用 No-Wait 的思路处理横向访问：无法立即取得需要的叶子 Latch 时，释放当前持有者并重试，避免边持有边等待造成死锁。重试前需要记录可恢复的扫描位置，并正确处理并发插入、删除；这些物理访问规则仍要与后续的事务可见性规则配合。

## 参考资料

- [官方课件：第 10 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/10-indexconcurrency.pdf)
- [官方课程笔记：第 10 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/10-indexconcurrency.pdf)

---
layout: wiki
wiki: cmu_15_445
order: 005
title: 内存管理与缓冲池
date: 2025-09-08 08:00:00
banner: /assets/banner/banner_5.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：内存管理与缓冲池课程视频" src="https://www.youtube-nocookie.com/embed/8-2yv4z0VZc" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 缓冲池提供页面在内存中的驻留位置

缓冲池是一组固定大小的 Frame，用来暂存数据库页面。请求一个页时，管理器先检查是否命中；未命中则找到空闲或可替换 Frame，加载所需页面，再把有效内存交给使用者。

![Page Table 将逻辑页面映射到缓冲池 Frame](/wiki/cmu_15_445/memory-management/buffer-pool-metadata.webp)

Page Table 是内存中的驻留映射；上一讲的 Page Directory 记录磁盘文件与页面位置。两者解决不同层次的寻址问题，不能混为同一份目录。

## Dirty、Pin 与 Latch 各自保护什么

Dirty 标志说明页面内容被修改，当前内存版本不能直接丢弃。Pin/Reference 计数记录页面仍被使用，计数未归零时不能作为替换对象。

Latch 保护内存数据结构的短期并发访问，事务锁则维护事务层面的隔离语义。固定页面不等于获得读写它的互斥权，持有 Latch 也不等于已经实现事务隔离。

一次访问需要正确组合生命周期与并发控制：加载后增加引用，操作前获取适当保护，结束后释放；如果修改了内容，还要记录脏状态。页面在使用期间被复用为另一页，会造成严重的内存与数据错误。

## 为什么数据库希望控制 I/O

使用 `mmap` 可以把文件映射到地址空间，但页故障、脏页写回、错误通知和系统缓存策略会由操作系统参与决定。数据库知道日志顺序、查询关键路径和预取需求，因此常选择自己控制缓冲池。

Direct I/O 可以避免数据库缓存与文件系统缓存的重复副本，但并非所有系统都使用相同路径。写入完成、进入系统缓存和真正持久化也应区分，恢复协议不能只凭一次写调用返回就判断数据安全。

## LRU、CLOCK 与顺序洪泛

LRU 淘汰最近最久未用页；CLOCK 使用引用位与旋转指针近似近期性，减少精确维护访问顺序的开销。两者都要跳过仍被 Pin 的页面。

![CLOCK 在扫描引用位后选择可淘汰页面](/wiki/cmu_15_445/memory-management/clock-replacement.webp)

大规模顺序扫描可能把只读一次的数据送入缓存，挤走反复使用的热点页。这就是 Sequential Flooding。只看最近一次访问，难以区分“刚刚路过”与“长期热点”。

LRU-K 记录最近多次访问，用历史判断重复使用；分段 LRU 让新页面先进入较冷区域，再次访问后才提升。ARC 则结合近期性、频率与 Ghost List，根据工作负载调整两类页面的容量分配。

## 脏页与后台写回

淘汰干净页可以直接复用 Frame，脏页则需要先满足日志与写回要求。把写回全部留到请求急需空间时，容易增加前台停顿。

后台写入提前处理合适的脏页，扩大前台可以快速回收的空间。并发写回还需要检查写出期间页面是否再次改变，不能把较新修改错误地标为已经落盘。

## 多缓冲池、预取与扫描协作

![查询扫描可以共享已读取的数据范围](/wiki/cmu_15_445/memory-management/scan-sharing.webp)

多个缓冲池可以按对象或访问类别划分，降低竞争并为不同页面采用不同策略。预取依据执行计划、顺序扫描或索引信息，提前发出读取，隐藏之后的等待。

Scan Sharing 让具有相容访问需求的扫描共享读取工作，但查询仍须维护各自的一致性与输出语义。对于不值得长期缓存的临时数据或大扫描，也可以使用 Buffer Pool Bypass，减少对热点页的污染。

最终的替换与 I/O 调度需要共同考虑：数据的再次使用概率、读写关键程度、日志和索引类别、查询优先级，以及维护元数据本身的开销。

## 参考资料

- [官方课件：第 04 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/04-bufferpool.pdf)
- [官方课程笔记：第 04 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/04-bufferpool.pdf)

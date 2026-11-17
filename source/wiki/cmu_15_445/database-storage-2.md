---
layout: wiki
wiki: cmu_15_445
order: 006
title: 数据库存储（二）
date: 2025-09-10 08:00:00
banner: /assets/banner/banner_6.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：数据库存储（二）课程视频" src="https://www.youtube-nocookie.com/embed/2_sTdS4h-bY" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 缓冲池优化回顾

本讲先继续讨论多个缓冲池、预取与共享扫描。不同对象可以使用局部缓存策略，减少竞争；预取可以依据逻辑上的下一页发出请求，不要求页面在磁盘上物理连续；共享扫描则记录不同查询加入的位置，确保每个查询都遍历自己需要的范围。

这些优化利用了数据库对计划和访问模式的认识。它们与接下来存储结构的选择共同决定 I/O：缓存策略可以减少重复读取，但数据本身的更新与整理方式也会改变读写成本。

## 面向记录的读写路径

Slotted Page 读取先通过目录找到页面，载入缓冲池，再通过槽定位记录。插入时寻找有空间的页面，分配槽和记录空间；变长更新若放不下，就可能需要移动记录并更新相关定位信息。

这种方式便于读取一页中的记录，但删除会产生空洞，小更新也可能要求读取和写回整页；多个分散更新容易形成随机 I/O。在不能原地修改文件的存储环境中，还需要另一种组织方式。

## Index-Organized Storage

索引组织存储直接把表记录放进索引叶子等数据位置，常以主键排序。它与“无序 Heap 外加一个定位索引”不同，减少从索引找到位置后再次访问另一份表记录的步骤。

相应代价是记录位置与索引结构变化更紧密，使用其他访问路径时也需要知道怎样找到完整记录。课程将其作为物理组织方式，而不是把所有数据库索引都称为索引组织表。

## Log-Structured Storage

![不可变 SSTable 中的更新和删除记录 的写入和读取](/wiki/cmu_15_445/database-storage-2/log-structured-storage.webp)

日志结构存储将更新放入内存 MemTable，再按键排序、顺序写成不可变 SSTable。修改同一个键时可以追加新的版本或删除标记，而不立即寻找磁盘中的旧位置覆盖。

读取需要找到当前可见的最新版本。先检查内存结构，再依据文件范围、索引与过滤器定位磁盘文件；只要较新的删除标记仍然有效，就不能继续返回更旧的值。

这里的“日志结构数据组织”与后面恢复课程的 Write-Ahead Log 不是同一个概念。MemTable 尚未写成 SSTable 时怎样保证故障后可恢复，还需要持久化日志等机制。

## Compaction 用什么换来了顺序写

![合并文件并消除被覆盖的旧记录](/wiki/cmu_15_445/database-storage-2/compaction.webp)

不断追加会积累多个文件和旧版本。Compaction 通过合并排序文件整理数据，删除已经不再需要的版本，减少后续读取与空间占用。事务快照仍可能需要的版本，不能仅凭“不是最新值”就立即回收。

Universal Compaction 更接近在同一组文件中按数量、大小与重叠程度选择合并；Level Compaction 把文件按层组织，通常让较深层同层键范围不重叠，L0 保留不同约束。

顺序追加改善前台写入，但同一逻辑值可能在多轮合并中被反复写出，形成写放大。更多文件增加读放大，保留旧版本增加空间放大，策略需要根据负载在三者之间权衡。

## 项目把这些机制放在哪里

本讲末尾介绍 Buffer Pool Manager 项目，分别实现 ARC 替换器、磁盘调度和缓冲池管理。替换器回答淘汰谁，调度器组织实际读写，管理器维护页面到 Frame 的映射及其生命周期。

正确性检查要覆盖重复请求同一页、页面仍被固定、脏页淘汰、并发加载和失败路径。只有缓存命中示例能够运行，还不足以证明整个管理器正确。

## 参考资料

- [官方课件：第 05 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/05-storage2.pdf)
- [官方课程笔记：第 05 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/05-storage2.pdf)

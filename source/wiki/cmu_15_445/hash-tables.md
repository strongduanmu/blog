---
layout: wiki
wiki: cmu_15_445
order: 008
title: 哈希表
date: 2025-09-17 08:00:00
banner: /assets/banner/banner_8.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：哈希表课程视频" src="https://www.youtube-nocookie.com/embed/nuNW8IfgPNU" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 数据库不只在索引里使用哈希表

页面映射、内部目录、连接、聚合和表索引，都可能使用哈希结构。它们的生命周期与并发需求不同：一次查询中的临时哈希表，可以与长期共享的持久化索引采用不同设计。

实现需要选择哈希函数与冲突处理方式。平均常数级复杂度仍然包含哈希计算、键比较、缓存未命中和同步成本；哈希相同也不能直接当成键相同。

## Linear Probing 怎样处理冲突和删除

线性探测从键对应的槽开始，冲突时继续检查后续槽，并在数组末尾回绕。连续布局较紧凑，但装载率高时可能形成长探测区间。

![线性探测删除时用 Tombstone 保持查找链](/wiki/cmu_15_445/hash-tables/linear-probing-deletion.webp)

如果把中间槽直接清空，后续查找可能在这里提前结束，错误地认为更后面的键不存在。Tombstone 标记让查找继续，插入时则可以复用；另一方案移动后续条目填补空洞，但要维护每个键的合法探测路径。

固定大小的键和值可以内联保存；变长内容通常保存在其他区域，槽中保留位置、长度或哈希信息。非唯一键可以关联一个值列表，也可以保存多个相同键条目。

## 元数据与批量复用

空槽、删除标志和短哈希标签可以集中保存在更紧凑的元数据中，先筛选候选再访问完整键。已知键类型时，还可以为整数或短字符串选择专门布局。

临时哈希表反复清空时，可以用表和槽的版本号区分当前轮次，减少逐槽重置。但版本管理、容量与并发可见性仍需正确维护，不能只增加一个计数器就假定任何共享访问都安全。

## Cuckoo Hashing

Cuckoo 为一个键准备多个候选位置。插入发生冲突时，把已有条目移到它的另一候选位置，继续腾挪；出现循环或空间不足时，需要重新选择哈希种子或扩容。

查找只检查固定数量的候选位置，有利于限制探测次数；插入却可能付出较长搬迁链的成本。这里讨论的位置数量，不包括变长键的哈希与比较成本。

## 动态哈希怎样逐步扩展

链式哈希为桶追加后继结构，扩展直接，但需要追逐指针。Extendible Hashing 使用目录与桶的局部深度，把增长限制在需要拆分的桶上。

![可扩展哈希中的全局深度、局部深度与桶拆分](/wiki/cmu_15_445/hash-tables/extendible-hashing.webp)

桶满且局部深度小于全局深度时，可以拆桶并调整部分目录项；两者相等时，需要先扩展目录，再重新分配对应条目。多个目录项可以引用同一个桶，因此拆分后必须更新所有相关引用。

Linear Hashing 则维护一个逐步前进的 Split Pointer，按既定顺序分裂桶，而不一定立刻分裂刚刚溢出的桶。查找根据当前分裂轮次判断使用哪一级哈希映射。

![线性哈希按 Split Pointer 增量扩容](/wiki/cmu_15_445/hash-tables/linear-hashing.webp)

动态扩容减少了一次重建整张表的停顿，但增加了目录、分裂和查找状态。选择方案时，需要把工作负载中的读写比例、扩容频率与缓存行为一起考虑。

## 参考资料

- [官方课件：第 07 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/07-hashtables.pdf)
- [官方课程笔记：第 07 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/07-hashtables.pdf)

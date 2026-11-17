---
layout: wiki
wiki: cmu_15_445
order: 013
title: Join 算法
date: 2025-10-06 08:00:00
banner: /assets/banner/banner_4.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：Join 算法课程视频" src="https://www.youtube-nocookie.com/embed/YIdIaPopfpk" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## Join 算法

### 为什么需要 Join 算法

为了避免不必要的数据信息重复，通常我们会在关系型数据库中，对表进行规范化处理，即：将不同的信息拆分为不同表进行存储。例如：我们会设计订单表 `t_order`，以及订单明细表 `t_order_item`，每个订单表 `t_order` 会有多个订单明细 `t_order_item`，如果我们想查询所有关于 `Andy` 的订单信息，这时候就需要将这 2 张表进行 `join`，获取到所有数据。

因此，我们需要使用 `Join` 来完成类似的需求，`Join` 可以**在不丢失任何数据的情况下，对原始的元组信息 Tuple 进行重组，查询出我们需要的数据**。

### Join 运算符介绍

本节课程主要关注使用等值条件的内连接 `Inner`，暂时只讨论 2 张表关联的情况。通过这些基础的 `Join` 运算，后续我们稍作调整就可以支持其他类型的 `Join` 运算，对于多路连接运算（多张表关联），我们会在高级课程 `15-721` 中介绍。

在需要反复扫描内表的嵌套循环连接中，通常优先考虑将较小输入放在外侧；哈希连接则通常选择较小输入构建哈希表。具体方向仍取决于索引、内存和数据分布，优化器会尝试估算 2 张表的数据量，然后生成对应的执行计划。如下是一个典型的 `Join` 执行计划树，所有运算符按照树形结构排列，数据从叶子节点流向父节点，最终所有数据汇总到根节点，**根节点输出的就是查询的结果**。

{% image /wiki/cmu_15_445/joins-algorithms/query-plan.png width:280px Join 查询计划 padding:10px bg:white %}

Join 运算符在执行时，**需要考虑当前的节点需要向父节点输出哪些数据**，上图中的箭头表示了数据输出。此外，Join 运算符**还需要考虑执行的成本，如何判断一种 Join 算法比另一种更好**？

{% image /wiki/cmu_15_445/joins-algorithms/join-operator-output.png width:280px Join 运算符输出结果 padding:10px bg:white %}

针对第一个问题——**当前的节点需要向父节点输出哪些数据**，我们参考上图的示例，对于所有属于 `R` 中的元组，我们使用 `r` 表示（`r ∈ R `），而属于 `S` 中的元组，我们使用 `s` 表示（`s ∈ S `）。我们根据 Join 关联条件 `R.id = S.id` 判断不同的元组组合是否满足条件，满足关联条件的数据会输出到父节点。

**Join 输出的内容不是固定不变的，它可能会受查询处理模型、存储模型以及查询计划树的影响**。例如，当存储模型是基于行的存储模型，或者基于列的存储模型时，Join 输出的元组数据可能是基于行或者列存储的数据。此外，根据查询计划树对于数据的要求，Join 运算符输出的可能是部分属性，而非关联表的全部属性。

### 物化方式与成本模型

Early Materialization 将后续需要的列复制到连接结果中，下游不用再回表，但中间结果更宽。Late Materialization 先传递连接键和 Record ID，到需要输出其他列时再读取。列存系统尤其适合减少无关列的访问，实际实现也可以混合两种方式。

设外表 R 占 M 页、m 条记录，内表 S 占 N 页、n 条记录，可用 B 个缓冲页。以下模型统计输入和中间过程的页面 I/O，暂不统计输出结果写盘、CPU 与网络成本。输出规模仍然影响实际耗时，不能将它理解为免费。

## Nested Loop Join

最直接的算法为外表每一条记录扫描一遍内表，成本为 $M+mN$。Block Nested Loop Join 则一次保留一批外表页面，每次扫描内表时与这批页面中的全部记录比较。如果使用 B−2 页保存外表，一页扫描内表、一页输出，成本为：

$$
M+\left\lceil\frac{M}{B-2}\right\rceil N
$$

这里减少的是扫描内表的次数。即使比较的记录对数量没有同样幅度地减少，顺序页面复用也能显著降低 I/O。

如果内表在连接键上有索引，Index Nested Loop Join 可以为每条外表记录进行索引探测。设一次探测和取回匹配记录的成本为 C，则成本约为 $M+mC$。C 会受到树高、缓存命中、匹配条数和回表方式影响，并不是所有查询都共享一个固定值。

## Sort-Merge Join

先将两侧按连接键排序，再使用两个游标归并。键较小的一侧向前移动；键相等时，需要输出两侧同键记录的全部匹配组合。它不能在发现第一条匹配后立即跳过整个重复键组。

![Sort-Merge Join 对有序输入进行归并](/wiki/cmu_15_445/joins-algorithms/sort-merge-join.webp)

两侧键基本唯一时，归并读取约为 M+N，总成本还要加上两侧排序。若输入已经有序，或者上层本来就需要连接键顺序，可以省去部分工作。大量重复值可能需要保存或重新扫描同键组，而且结果本身也可能很大，不能始终套用一次线性扫描的理想成本。

## Hash Join

Basic Hash Join 先扫描 Build 侧，在连接键上构造哈希表，再扫描 Probe 侧，用同样的哈希函数寻找候选。哈希值相同仍可能发生碰撞，所以必须比较原始键。哈希连接适用于等值条件，附加的非等值条件可以在候选匹配后继续判断。

通常优先用较小输入构建哈希表，使它更容易放入内存。Build 阶段还可以生成 Bloom Filter，在 Probe 时提前排除不可能匹配的键，这属于 Sideways Information Passing。

### Grace Hash Join

Build 侧无法装入内存时，先对两侧输入使用相同的分区函数，将可能匹配的记录送到对应分区并写入磁盘。随后一次读取一对分区，为其中一侧建立内存哈希表，再探测另一侧。

![Grace Hash Join 的两侧分区与逐分区连接](/wiki/cmu_15_445/joins-algorithms/partitioned-hash-join.webp)

在一次分区就能使各分区 Build 侧装入内存的假设下，分区阶段读写两侧一次，连接阶段再读一次，成本为 $3(M+N)$。如果仍有分区过大，就需要递归分区，成本也随之增加。

数据倾斜是这里的重要限制。如果大量记录拥有同一个连接键，重复换哈希函数仍会将它们放到同一分区，需要对热点键采取单独处理方式。Hybrid Hash Join 可以将部分分区留在内存，减少这些分区的落盘与读回；它也需要在内存占用和分区数量之间安排空间。

## 比较算法时需要保留的条件

课件用 R 为 1000 页、100000 条，S 为 500 页、40000 条，B 为 100，每次 I/O 为 0.1ms 的教学模型比较不同算法。简单嵌套循环会反复读取内表，而块嵌套循环、排序归并和分区哈希能够大幅减少读写次数。这些数字用于展示模型中的数量级差异，不是不同数据库在真实硬件上的实测排名。

选择算法还要考虑筛选后的输入规模、已有索引和顺序、重复键分布、内存以及输出需求。小外表配合高选择性索引探测可能很有效，大规模等值连接常适合哈希，已有排序则会提高 Sort-Merge 的吸引力。

## 参考资料

- [官方课件：第 12 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/12-joins.pdf)
- [官方课程笔记：第 12 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/12-joins.pdf)

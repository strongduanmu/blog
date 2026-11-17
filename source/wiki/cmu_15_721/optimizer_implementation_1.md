---
layout: wiki
wiki: cmu_15_721
order: 015
title: 查询优化器实现（一）
date: 2024-03-18 08:00:00
banner: /assets/banner/banner_5.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-721：查询优化器实现（一）课程视频" src="https://www.youtube-nocookie.com/embed/DwX0X8CyBSg" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 优化器在选择什么

逻辑计划描述查询要产生什么关系，物理计划进一步指定访问路径、连接算法和其他执行方式。一个逻辑运算可以有多种实现，多个逻辑操作也可能由同一种物理策略共同完成。

优化器结合搜索空间、代价模型与枚举架构寻找计划。代价用于同一系统内比较候选，不一定直接表示时间；搜索空间经过裁剪、估计也可能不准，因此找到估计代价最小的计划，仍不等于获得真实运行的全局最优。

## 启发式重写怎样减少工作

![投影下推减少需要物化的属性](/wiki/cmu_15_721/optimizer_implementation_1/logical-rewrites.webp)

课程先从逻辑规则展开：拆分合取谓词，让各条件可以单独移动；把过滤尽量推到合适的输入侧；根据关联条件把笛卡尔积变成连接；在流水线阻塞点前去掉不再需要的列，减少物化体积。

规则必须保证等价，尤其涉及外连接、空值和函数求值时，要检查适用条件。纯启发式方法实现简单，但固定顺序和经验常数难以处理复杂的连接顺序与物理属性组合。

Ingres 的早期策略把多表查询分解成较小查询，再用前一步结果中的值代入后续单表查询。这样降低了当时实现搜索的复杂度，也可能产生大量重复执行，说明枚举方式本身会影响系统可以发现的计划。

## System R：先重写，再自下而上搜索

System R 先做启发式逻辑重写，再对物理实现估算代价。搜索从单表访问路径开始，逐步构造两表、三表和更多关系的连接子计划。

![自下而上建立并比较子计划](/wiki/cmu_15_721/optimizer_implementation_1/bottom-up-search.webp)

原始方案限制连接树形状以控制组合数量，同时保留有用的输出顺序。局部结果稍贵但已经排序的计划，可能为后续连接或排序节省更多工作，因此不能不看物理属性，只为一个关系集合保留单一最低数字。

优化器还需要终止策略，例如耗尽某个子问题、达到时间预算、找到足够低代价的计划，或达到转换次数限制。优化花费本身也是查询响应的一部分。

## 把搜索算法与规则分开

优化器框架把转换规则与搜索机制分离。规则描述什么结构可以变成什么等价结构，搜索器决定何时应用规则，以及怎样比较和复用结果。

Stratified Search 把不同规则放到不同阶段，例如先逻辑重写，再进行物理选择；Starburst 是课程中的代表。Unified Search 则在统一搜索中组织逻辑替换与物理实现，让原本阶段之间的边界不再完全固定。

![自上而下根据目标搜索物理实现](/wiki/cmu_15_721/optimizer_implementation_1/top-down-search.webp)

Volcano 从目标与所需物理属性出发进行搜索，复用已解决的子问题，并利用代价上界剪枝。某个实现需要输入有序时，搜索要继续向下传递要求，或者通过 Sort 等 Enforcer 建立该属性。

## Cascades 与随机搜索的入口

本讲后半部分介绍了 Cascades 的 Group、Multi-Expression、规则与 Memo。等价逻辑表达式及其物理实现组织在同一 Group 中，父表达式引用子 Group，避免把每棵完整计划树反复展开。任务化与规则优先级支持按需探索，下一讲继续展开这些结构。

课程也介绍随机搜索和 PostgreSQL 的遗传连接排序。它们在较大空间中探索候选，减少全面枚举的成本，但需要处理搜索预算、随机性和计划质量之间的关系。改变枚举方式之后，仍然需要可靠的代价比较与语义检查。

## 参考资料

- [官方课件：第 13 讲](https://15721.courses.cs.cmu.edu/spring2024/slides/13-optimizer1.pdf)
- [官方课程笔记：第 13 讲](https://15721.courses.cs.cmu.edu/spring2024/notes/13-optimizer1.pdf)
- [An Overview of Query Optimization in Relational Systems](https://15721.courses.cs.cmu.edu/spring2024/papers/13-optimizer1/chaudhuri-pods1998.pdf)
- [The Cascades Framework for Query Optimization](https://15721.courses.cs.cmu.edu/spring2024/papers/13-optimizer1/graefe-ieee1995.pdf)
- [Orca: A Modular Query Optimizer Architecture for Big Data](https://15721.courses.cs.cmu.edu/spring2024/papers/13-optimizer1/p337-soliman.pdf)

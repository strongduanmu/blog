---
layout: wiki
wiki: cmu_15_445
order: 016
title: 查询规划与优化（一）
date: 2025-10-27 08:00:00
banner: /assets/banner/banner_7.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：查询规划与优化（一）课程视频" src="https://www.youtube-nocookie.com/embed/b53huOGcsZ8" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 从 SQL 到物理计划

SQL 描述需要什么结果，没有规定访问哪一个索引、采用哪种 Join，也没有固定多表连接的顺序。本讲沿查询处理流程介绍优化器：解析器生成语法结构，Binder 查询 Catalog 将表名、列名绑定到具体对象，随后构造逻辑计划，经过重写和物理实现选择，交给执行器。

![从 SQL 解析、绑定到优化和执行的整体流程](/wiki/cmu_15_445/query-planning-and-optimization-1/optimizer-architecture.webp)

逻辑计划表达过滤、投影、连接等操作的含义；物理计划还要指定扫描方法、连接算法以及数据顺序等执行细节。两者不一定逐节点一一对应，例如多个逻辑操作可以融合到同一段执行代码中。

优化也有不同粒度：优化单条语句、包含子查询的查询块，以及存储过程或更大工作范围，能够利用的信息和需要处理的依赖并不相同。

## 关系代数等价变换

优化器首先需要保证结果等价，才有资格讨论更快。课程用选择下推说明：只引用一侧输入的过滤条件，满足等价条件时可以在 Join 前计算，减少进入 Join 的记录。

![将过滤条件下推到连接输入](/wiki/cmu_15_445/query-planning-and-optimization-1/predicate-pushdown.webp)

AND 连接的条件可以拆开，分别放到适合的位置；带连接条件的笛卡尔积可以转为 Join。投影下推则提前去掉不需要的列，减小中间记录宽度，但必须保留后续过滤、连接、排序所需的列。

这些规则都有前提。SQL 包含重复值、NULL、外连接及有副作用的表达式，不能将集合关系代数中的公式不加判断地照搬。例如外连接保留未匹配行，移动过滤条件可能改变这些行是否保留。

## 启发式与代价搜索

Heuristic-Based Optimization 使用规则匹配并改写计划，例如减少明显多余的列和表达式。Cost-Based Optimization 则枚举候选，估算每个候选的成本，再选择当前找到的较好计划。估算依赖统计信息和成本模型，不需要每次为了比较候选而执行完整查询。

搜索空间会随连接表数快速增长，优化器必须限制探索范围。课件列出了时间上限、成本阈值、穷尽候选以及规则应用次数等停止条件。因此优化结果取决于搜索范围、估算质量和优化时间预算，并不保证得到所有可能计划中的绝对最优者。

访问路径选择同时考虑选择率、索引结构、已有顺序、覆盖列、Zone Map 和压缩。单表查询也可能存在扫描与回表之间的取舍，Sargable 谓词表示能够利用索引搜索条件，并不意味着查询只存在一种合理访问方法。

## 多表连接搜索

课程区分从基本访问路径逐步组合计划的 Bottom-Up，以及从目标计划出发按规则探索等价实现的 Top-Down。

System R 风格使用动态规划：先为单表生成访问路径，再构造两表、三表等更大子集的计划。课件主要讨论 Left-Deep Join Tree，保留子问题的较优实现，避免反复求解同一部分。若后续需要某种排序等物理属性，不能只给每个子集留一个不区分属性的最低成本方案。

Top-Down 优化以逻辑表达式为起点，应用逻辑变换与物理实现规则，递归寻找子目标的实现。Memo 记录等价表达式和已完成的搜索，减少重复工作；排序、分区等物理属性也参与规划。它与查询执行时从根向下调用 `Next()` 是不同层面的“自顶向下”。

![优化器通过规则探索逻辑与物理候选](/wiki/cmu_15_445/query-planning-and-optimization-1/plan-search.webp)

## 表达式重写

最后，优化器还可以折叠常量、识别不可能成立的条件、合并相邻或重叠的范围。例如互斥等值条件可能直接得到空结果，不必进入数据扫描。执行这些改写仍需遵守类型转换、NULL 和函数语义，不能仅按文本形式替换。

## 参考资料

- [官方课件：第 15 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/15-optimization1.pdf)
- [官方课程笔记：第 15 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/15-optimization1.pdf)

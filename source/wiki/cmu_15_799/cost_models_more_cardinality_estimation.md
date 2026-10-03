---
layout: wiki
wiki: cmu_15_799
order: 015
title: 代价模型：更多基数估计
date: 2025-03-12 08:00:00
banner: /assets/banner/banner_15.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836632894831&bvid=BV1ABKd6jEjs&cid=39520767576&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：14 - Lecture 14 - Cost Models More Cardinality Estimation](https://www.bilibili.com/video/BV1ABKd6jEjs)

本页截图取自上方 B 站课程录像，标注时间可跳回对应位置；图中细字可配合文末的高清课件查看。正文里的教学数据与原课示例分别说明。

## 估计更准以后，计划究竟改了哪里

第 14 讲承接 JOB 分析，把问题扩展到 SQL Server 的更多工作负载、行存与列存执行方式。主要阅读 [Analyzing the Impact of Cardinality Estimation on Execution Plans in Microsoft SQL Server](https://15799.courses.cs.cmu.edu/spring2025/papers/14-cardinalities2/lee-vldb2023.pdf)。

这篇论文的实验重点包括：准确基数怎样影响执行计划，哪些逻辑表达式最需要准确估计，以及运行时技术怎样缓解某些误差。本文讨论论文中的实验设计和机制，不把实验结果推广成所有版本的产品行为。

## 把真实基数注入搜索

![用逻辑表达式标识注入真实基数，课程视频 18:00](/assets/wiki/cmu_15_799/cost_models_more_cardinality_estimation/video-1800.jpg)

[视频 18:00：用逻辑表达式标识注入真实基数](https://www.bilibili.com/video/BV1ABKd6jEjs/?t=1080)。课件说明为搜索中的逻辑表达式生成标识，反向构造 SQL 并执行，随后用相同标识在 Cascades 中取得真实行数。需要覆盖候选表达式，包含原计划没有使用的结构，才能比较另一种 Join 顺序或访问方式。


如果仅观察实际计划的估计与真实行数，能够发现错误，却无法回答“准确估计本来会选什么”。论文在优化器搜索中识别逻辑表达式，生成对应查询，执行得到真实基数，再让优化器按表达式标识取得这些数值。

需要覆盖的是优化过程中考虑的子表达式，包含可能最终未被选中的候选。只把原执行计划上的行数填回去，仍缺少其他 Join 顺序的准确输入。

```text
固定数据、索引与查询
识别搜索中的逻辑表达式
取得这些表达式的真实行数
重新优化，比较计划与执行结果
选择性恢复部分估计，分析关键表达式
```

这个实验框架用于隔离基数因素，测量中还需要控制缓存、并发、统计版本和搜索预算。生成真实基数的额外工作不能当作常规编译开销忽略。

## 准确基数影响的不只是 Join 顺序

![JOB 17a 修正前后的完整物理计划，课程视频 33:00](/assets/wiki/cmu_15_799/cost_models_more_cardinality_estimation/video-3300.jpg)

[视频 33:00：JOB 17a 修正前后的完整物理计划](https://www.bilibili.com/video/BV1ABKd6jEjs/?t=1980)。左侧大量 Index Nested Loop 和索引访问在右侧变成扫描、Hash Join 或 Merge Join 等组合。每个节点还并列展示估计与真实规模。先观察访问路径与 Join 算法，再看树形顺序，能够理解为什么准确基数的收益不只来自更换 Join 括号。


考虑一个教学查询：按客户筛选订单，再按商品统计销量。估计修正可能触发多个变化：

| 变化位置 | 可能出现的计划调整 | 依赖的判断 |
| --- | --- | --- |
| 基础访问 | Seek 与 Scan 的切换 | 命中行数、回表成本 |
| Join | 改变顺序、算法或构建侧 | 两侧规模与中间结果 |
| 聚合 | 推到 Join 之前或保留在之后 | 可合并性、分组数量 |
| 内存操作 | 改变内存需求与溢写风险 | 行数、行宽、可用资源 |

例如原来估计只命中 100 行，索引访问很便宜；真实命中 80 万行时，顺序扫描可能更合适。这个成本变化即使 Join 顺序保持相同，也可能明显改变运行时间。

聚合下推则要先满足语义前提。如果每个客户有大量订单，先分组可能减少 Join 输入；如果组合键的 NDV 接近行数，提前聚合就不一定节省工作。准确估计需要与合法规则一起发挥作用。

### 给访问方式画出一个教学分界点

设非覆盖索引访问成本为 `5 + 0.02 × 命中行数`，扫描成本为 100，两者相等时的命中行数为 `(100 − 5) / 0.02 = 4750`。从估计 4000 改成 5000 只变化 25%，却跨过选择边界；从 100 改成 1000 是十倍变化，两者都位于索引占优的一侧。

这个算例说明“需要优先修正的估计”与决策边界有关。真实模型还包含页复用、随机访问、覆盖索引、压缩和并行等因素，分界点不会简单固定为一个常数。论文利用实际优化器和真实基数，观察模型中的边界怎样影响计划。

对聚合下推也能做类似比较。某个合法分组能把一百万订单压缩成一万个组，提前聚合可能大幅减少 Join 输入；若实际组数接近一百万，预聚合本身会增加一次几乎没有压缩效果的工作。估计需要回答的是“这次合法变换能减少多少后续处理”，而不仅是一个孤立 NDV 是否准确。

## 为什么行存与列存表现不同

行存的索引 Seek 和回表容易受到选择率影响，少量命中与大量命中对应不同访问模式。列存能够批量读取所需列，压缩和向量化也改变了单位行成本。因此同一个基数误差，在两类执行环境中的后果可能不同。

某些列存方案更偏向大批量扫描与 Hash Join，计划变化的边界可能较少；行存则可能在索引访问与扫描之间频繁切换。论文中的具体比例应结合其数据、索引和执行器设置阅读，不能仅按存储格式预测一个新查询的表现。

## Bitmap Filter 怎样减少无效探测

![Hash Join 向探测侧传递 Bloom Filter，课程视频 58:00](/assets/wiki/cmu_15_799/cost_models_more_cardinality_estimation/video-5800.jpg)

[视频 58:00：Hash Join 向探测侧传递 Bloom Filter](https://www.bilibili.com/video/BV1ABKd6jEjs/?t=3480)。右侧箭头将构建侧键摘要送到探测侧扫描，先排除不可能匹配的行，再由正式 Join 验证。过滤信息提前使用可以减少实际工作，但保留真匹配和控制假阳性是必要条件。它改变运行中的输入规模，并不自动改变完整 Join 树。


Hash Join 构建侧可以产生过滤摘要，用于提前排除探测侧不可能匹配的键。例如客户表经过地区过滤后只剩少量编号，订单扫描时先用 Bitmap 或其他过滤表示检查客户编号，再进入正式 Join。

过滤器即使允许假阳性，也必须避免把真正匹配的行误删；最终 Join 再确认候选。这种技术减少实际进入 Join 的数据量，使某些原本估计较大的方案得到运行时帮助。

它仍受构建侧规模、摘要质量、过滤位置和扫描实现约束。过滤器太宽松、出现大量碰撞，或者生成与传输成本较高时，收益会下降。论文实验中运行时机制与编译决策相互影响，分析时要把它们分开观察。

## Adaptive Join 能修正哪一步

![Adaptive Join 在两种实现间延迟选择，课程视频 65:30](/assets/wiki/cmu_15_799/cost_models_more_cardinality_estimation/video-6530.jpg)

[视频 65:30：Adaptive Join 在两种实现间延迟选择](https://www.bilibili.com/video/BV1ABKd6jEjs/?t=3930)。课件把 Hash Join 与 Nested Loop 的路径放在同一个自适应节点里，运行时根据观察到的输入规模和阈值选择。它缓解当前节点的部分估计风险；此前扫描、树形结构和其他节点仍可能受到初始决策影响。


Adaptive Join 允许在执行中获得输入规模后，在预设实现之间选择。设某个输入到达后发现行数很少，系统可以采用适合小输入的路径；规模较大时采用另一条路径。具体能力与实验系统的实现范围有关。

这种局部选择能够缓解对应节点的规模误判，但整个 Join 树、已经完成的扫描和其他算子的资源选择仍受到初始计划影响。读到“自适应缓解估计错误”时，需要问清楚它改变哪个节点、何时决策、已付出的工作能否复用。

## 找到需要准确估计的最小区域

![Essential Logical Groups 与全部 Memo 组的关系，课程视频 50:30](/assets/wiki/cmu_15_799/cost_models_more_cardinality_estimation/video-5030.jpg)

[视频 50:30：Essential Logical Groups 与全部 Memo 组的关系](https://www.bilibili.com/video/BV1ABKd6jEjs/?t=3030)。横轴是搜索涉及的 Memo 组数量，纵轴是关键组数量，两轴采用对数尺度。关键组表示在论文实验设置下，对恢复准确基数计划效果特别重要的部分。不能简单把点的位置解释成误差最大的节点数，正文说明它与候选竞争和决策边界有关。


完整真实基数是一个上限式分析实验，生产系统更关心有限投入应放在哪里。论文进一步研究部分表达式的估计修正，观察能否恢复准确基数方案的主要收益。

可以用一个扩展示例理解：某查询过滤后估计为 100、真实为 120，对计划没有影响；另一个 Join 估计为 20、真实为 20 万，触发索引 Nested Loop 与大规模 Hash Join 的切换。后一个表达式更可能值得优先获取额外信息。

这个“重要性”取决于查询上下文，不能只按 Q-error 排序。一个两倍误差也可能刚好跨过访问或内存阈值，影响远大于一个无关节点的百倍误差。

### Essential Group 为什么不等于误差最大的节点

论文将 Essential Set 定义为满足两个条件的逻辑组集合 E：仅为 E 注入准确基数、其他组保留原估计时，得到与全量准确基数相同的计划；E 的任何真子集都无法继续得到该计划。这里是集合包含意义上的极小集合，可能存在多个，不要求它在所有可行集合中组数最少。Memo 中的 Group 对应一个逻辑子结果，最终计划只使用其中一部分，搜索还会比较许多其他候选。

假设 G1 的估计从 100 改成 120，候选排序保持不变；G2 从 4000 改成 5000，触发扫描替代 Seek；G3 虽然误差很大，却属于一个早已被其他条件淘汰的分支。G2 对当前计划更重要。这个小例子解释了为什么统计改进预算应该考虑候选竞争及计划敏感度。

识别关键组也受实验条件约束。索引、内存、规则集或其他组的估计发生变化后，候选之间的竞争可能改变，原来不重要的组变得重要。不能把某次实验识别的集合永久当作所有运行环境中的最小集合。

可以把诊断过程理解为干预：先得到完整准确基数的参考计划，再控制哪些组使用准确值，观察计划与执行效果怎样变化。生产系统通常承担不起逐个执行所有候选的成本，因此该方法首先服务于分析，再启发选择性采样、统计收集和反馈设计。

## 带着计划变化解释实验结果

阅读论文时，先区分工作负载中是否包含聚合、外连接、子查询等结构，再看准确基数改变了访问路径、Join 还是聚合位置。之后观察 Bitmap Filter 与 Adaptive Join 是否掩盖部分误差，最后回到需要优先修正的表达式集合。

排查实际查询也可以沿这个顺序：找到最早明显偏离的行数，说明它触发了什么计划选择，再判断要补统计、调整估计还是依靠运行时反馈。下一讲 [学习型方法](/wiki/cmu_15_799/cost_models_learned_approaches.html)会讨论更复杂的分布表示，同时继续用计划质量检验估计收益。

## 参考资料

- [Analyzing the Impact of Cardinality Estimation on Execution Plans in Microsoft SQL Server](https://15799.courses.cs.cmu.edu/spring2025/papers/14-cardinalities2/lee-vldb2023.pdf) (K. Lee et al., VLDB 2023) *(Primary)*

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/14-cardinalities2.pdf)
- [课程 Video](https://www.youtube.com/watch?v=4sZZRiG_7Xg&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=14)
- [B 站视频](https://www.bilibili.com/video/BV1ABKd6jEjs)

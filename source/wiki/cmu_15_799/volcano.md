---
layout: wiki
wiki: cmu_15_799
order: 005
title: Volcano
date: 2025-01-27 08:00:00
banner: /assets/banner/banner_5.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836414789449&bvid=BV11jKo6JEPv&cid=39519653878&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：04 - Lecture 04 - Volcano](https://www.bilibili.com/video/BV11jKo6JEPv)

本页截图取自上方 B 站课程录像，标注时间可跳回对应位置；图中细字可配合文末的高清课件查看。正文里的教学数据与原课示例分别说明。

## 优化一个结果，还要指定它怎样输出

第 04 讲从 EXODUS 讲到 Volcano 优化器生成器。Starburst 让物理候选能够通过规则扩展；Volcano 进一步把搜索组织成一个目标：为给定逻辑结果，寻找满足物理属性要求且代价最低的实现。本文主要依据 [1993 年优化器生成器论文](https://15799.courses.cs.cmu.edu/spring2025/papers/04-volcano/graefe-icde1993.pdf)。

先考虑一个教学查询：

```sql
SELECT c.id, o.amount
FROM customers AS c
JOIN orders AS o ON c.id = o.customer_id
WHERE c.region = 'East'
ORDER BY c.id;
```

逻辑上要返回符合地区条件的客户及其订单，物理上还要按客户编号排序。同一个逻辑 Join，可以用 Hash Join 后排序，也可以考虑满足输入要求的 Merge Join。优化器对这两种方案的比较，必须把子计划和属性补齐成本一起纳入。

### 与 Volcano 执行模型的关系

课程资料同时列出了 Volcano 查询执行系统论文。执行系统关注算子如何通过 `open`、`next`、`close` 等接口交互，优化器生成器关注怎样选出这些算子的组合。学习本讲时要区分这两个讨论对象：本文追踪的是优化搜索，执行接口只是最终计划的运行方式。

## 逻辑算子、物理算子与 Enforcer

![同一个逻辑结果的两层表示，课程视频 45:30](/assets/wiki/cmu_15_799/volcano/video-4530.jpg)

[视频 45:30：同一个逻辑结果的两层表示](https://www.bilibili.com/video/BV11jKo6JEPv/?t=2730)。右侧上方用逻辑算子表达要计算的结果，下方用扫描和具体 Join 实现表达执行算法。上方的小图例区分 Logical Op 与 Physical Op。观察替换前后哪些关系语义保持相同，哪些只是实现选择，再阅读 Transformation Rule 与 Implementation Rule 的分工。


逻辑算子描述关系运算，例如选择、投影和 Join；物理算子给出具体执行算法，例如顺序扫描、索引扫描和 Hash Join。逻辑等价并不要求物理执行过程相同。

Volcano 把转换分为两类：Transformation Rule 生成等价逻辑表达式，Implementation Rule 生成物理实现。内部等值 Join 的交换规则属于前者，Join 到 Hash Join 的实现规则属于后者。规则还需要条件函数，因为可匹配的结构未必满足所有语义和算法前提。

Enforcer 是属性补齐算子。例如子计划没有要求的顺序时加入 `Sort`，分布式实现需要改变数据分布时加入相应交换操作。这使属性处理成为显式规划动作，新属性也能独立扩展。

| 对象 | 回答的问题 | 示例 |
| --- | --- | --- |
| 逻辑算子 | 要计算什么结果 | `Join(customers, orders)` |
| 物理算子 | 用哪种算法计算 | `HashJoin`、`MergeJoin` |
| Enforcer | 怎样满足输出要求 | 在无序结果上加入 `Sort` |

## 逻辑属性与物理属性

逻辑属性跟随查询含义，例如输出列、类型、唯一性和推导出的基数信息。物理属性跟随具体实现，例如顺序、分区方式和数据位置。逻辑等价的候选可以共享一部分逻辑分析，同时产生不同的物理属性。

假设订单表的两条访问路径分别是：扫描代价 10、输出无序；索引访问代价 15、按 `customer_id` 有序。若父算子要求排序，无序扫描还要加上代价 20 的排序。比较结果变为 30 与 15；若父算子接受无序输入，扫描代价 10 更低。这里的数字仅用于说明属性对选择的影响。

因此记忆化搜索的键需要包含需求，概念上可以写为：

```text
Best(逻辑等价类, 所需物理属性, 可用外部参数)
```

外部参数指参数化子计划可以引用的外层值，例如 Index Nested Loop Join 内侧使用外侧的客户编号访问索引。具有不同参数依赖的子计划，不能直接当作同一个无条件扫描复用。

## 从根目标递归到子目标

![Forward Chaining 与 Backward Chaining，课程视频 55:30](/assets/wiki/cmu_15_799/volcano/video-5530.jpg)

[视频 55:30：Forward Chaining 与 Backward Chaining](https://www.bilibili.com/video/BV11jKo6JEPv/?t=3330)。上半部分从已有表达式触发规则，向外生成更多结果；下半部分从想要的输出出发，反向寻找能够产生它的算子，再提出输入目标。箭头表示搜索推导方向，执行数据仍从输入端产生。带属性的 FindBest 正是沿后者的目标分解来组织。


自顶向下（Top-Down）表示从完整查询的结果需求出发，向下提出子问题。它描述优化搜索方向；数据执行时通常仍从扫描端产生数据。

在示例中，根目标要求按 `c.id` 排序。搜索可以先考虑 Hash Join，递归寻找两个无序输入的最便宜方案，然后加入排序；也可以考虑 Merge Join，要求两个输入在 Join 键上有序，再递归比较有序访问与扫描加排序。

```text
FindBest(group, required_properties, limit):
    查找可复用的搜索结果
    展开需要考虑的等价逻辑表达式
    for 每个适用的物理实现:
        推导该实现对子输入的属性要求
        递归优化子输入
        计算子计划、当前算子与属性补齐的总成本
        更新满足 required_properties 的最优方案
    返回搜索状态与当前最优方案
```

这是教学伪代码，省略了参数绑定、规则匹配和搜索完成状态。递归的收益在于需求能够传给子问题。例如父节点根本不需要排序时，就无须为了一个未使用的顺序反复搜索有序实现。

### 把一个带排序的目标完整算一遍

为避免真实数据库的成本单位干扰理解，下面给出一组人为设定的代价。假设过滤后的客户和订单都有无序扫描与按 Join 键排序的访问方案：

| 子输入 | 无序实现 | 有序实现 |
| --- | ---: | ---: |
| 符合地区条件的客户 | 8 | 12 |
| 订单 | 10 | 18 |

假定 Hash Join 的局部成本为 20，完整 Join 结果排序成本为 25；Merge Join 的局部成本为 15，其输出顺序能满足示例的 `ORDER BY c.id`。这些属性假设用于当前教学模型，实际算子需要单独声明输出顺序。

根目标要求有序结果时，Hash Join 分支先请求两个无序子目标，得到 `8 + 10 + 20 = 38`，再由 Sort 补齐属性，总代价为 63。Merge Join 分支请求两个有序子目标，得到 `12 + 18 + 15 = 45`，因此该目标选择 Merge Join。

如果删去 `ORDER BY`，根目标接受无序结果，Hash Join 的总代价变为 38，Merge Join 仍为 45，此时选择改变。逻辑 Join 的结果内容相同，改变的是父目标要求的输出属性。实现时需要分别保存无序目标和有序目标的最优结果。

假设订单有序访问成本变为 40，还存在“无序扫描 10 + 输入排序 16”的方案。订单有序子目标会选择 26，Merge Join 的完整成本随之变为 `12 + 26 + 15 = 53`。搜索子目标时就能完成属性补齐，比固定使用某一条索引更灵活。

### Nested Loop 的内侧为何带外部参数

若存在 `orders(customer_id)` 索引，Index Nested Loop Join 可以对每个外侧客户执行一次 `customer_id = 当前客户编号` 的探测。内侧表达式依赖外侧参数，在未提供该编号时并不能返回完整订单表。

可以把内侧目标写为 `Best(orders 的匹配结果, 所需属性, 参数 c.id)`。参数绑定后，成本还与外侧行数相关：即使一次探测很便宜，重复十万次也可能比一次 Hash Join 更贵。把参数化访问与全表无条件访问混在同一缓存项里，会破坏语义和成本比较。

因此“逻辑结果 + 属性需求 + 参数依赖”是一组共同约束。对实现论文里的优化目标，先检查它要求返回哪些行、以什么顺序返回、运行时由谁提供参数，再讨论复用与剪枝。

## 等价类怎样避免重复工作

![Volcano 搜索中的候选与属性补齐，课程视频 65:30](/assets/wiki/cmu_15_799/volcano/video-6530.jpg)

[视频 65:30：Volcano 搜索中的候选与属性补齐](https://www.bilibili.com/video/BV11jKo6JEPv/?t=3930)。画面保留了多种逻辑形态及它们的物理实现，下方显示为满足需求而考虑的额外算子。顶部 ORDER BY 提出排序需求，红叉对应尚未补齐该顺序的 Hash Join 路径，右侧展示 Sort Enforcer。读图时分别跟踪逻辑等价关系、实现规则和属性需求，避免把每条红线都理解成执行时的数据流。


对三个内部 Join 输入，`(A ⋈ B) ⋈ C` 和 `A ⋈ (B ⋈ C)` 能表达相同结果。在不同候选里，`A`、`B`、`A ⋈ B` 等子问题会反复出现。Volcano 维护表达式与等价类的查找表，记录已经生成的结构和已求解的优化目标。

这种复用包括两层。结构复用避免一条交换规则反复生成相同表达式；优化结果复用避免再次对同一个子结果、同一种属性需求做完整代价搜索。实现时还要区分“正在搜索”“在某个限制下搜索失败”和“已经完成搜索”，否则会把不完整的信息当作最终答案。

例如在成本上限 8 下没有找到可行方案，只能说明当前目标没有低于 8 的已找到实现。后面在上限 30 下调用时，不能复用成“这个目标永远不可实现”。

## Branch-and-Bound 怎样减少搜索

分支定界（Branch-and-Bound）利用当前完整方案建立上界，再用部分方案的成本下界判断某条分支是否值得继续。

假定已经找到总代价 100 的完整方案。另一方案已确定的算子花费 70，一个子输入的最低成本为 40，即使剩余工作成本取 0，也已至少花费 110，于是能放弃这条分支。更早获得一条质量较好的完整计划，通常有助于后续剪枝。

这里的条件是下界确实不会高估该分支的最低可能成本。普通预测值可能比实际更高，直接用它删除分支会影响完整性；这种预测更适合优先安排搜索，或者作为明确接受近似的启发式策略。

“最优计划”还受搜索空间和模型约束。规则缺失、预算提前终止或估计不准时，真实运行最快的方案可能根本没有进入最终比较。

### 剩余预算怎样传给下一层

在非负、可加的教学成本模型中，根节点已有代价 60 的完整方案。另一个候选的局部算子成本为 12，已完成左输入的成本为 20，则右输入最多还能使用 `60 − 12 − 20 = 28` 的预算。若右侧可靠的成本下界为 31，这条分支可以立即停止。

如果右侧在上限 28 下搜索失败，应记录“该限制下没有满足条件的实现”。以后有另一个父候选愿意为同一右侧支付 40，仍需允许它继续搜索。这解释了为什么记忆化表除了计划与成本，还需要保存搜索限制和完成程度。

实际系统的成本可能涉及并行、流水线与多维资源，不能一律照搬减法。分支定界依赖整个成本组合方式与下界契约；本节的数字帮助理解预算传递，不代表所有优化器使用同一个公式。

### EXODUS 怎样学习规则应用的优先级

课程前半段回顾 EXODUS：MESH 保存访问计划，OPEN 是待应用变换的优先队列。每轮选择预期收益较大的规则，应用变换后立即生成相关物理实现、计算成本，再把新出现的可用变换加入 OPEN。

每条规则关联 Expected Cost Factor f。若当前计划成本为 C，系统用 `C × f` 预测变换后的成本；f 小于 1 表示历史上倾向于降成本，f 接近 1 表示平均影响较小。比如 C 为 100、f 为 0.7 时，预测成本为 70，这个数字用于安排搜索，最终候选仍要重新计算物理成本。

历史因子可以通过变换前后的观测更新。课程还介绍对前置规则的间接调整：某条规则本身没有立即降低成本，却暴露下一条高收益规则，搜索策略应有机会认识这种作用。父节点重新分析后得到收益，也可能影响相关规则的优先级。

这里学习的是“规则在哪些情况下值得先尝试”的搜索经验，与第 15 讲直接学习查询基数具有不同接口。Volcano 将搜索进一步组织为带属性的目标和递归子问题，所依赖的剪枝证明也需要与这种优先级预测分别理解。

## EXODUS 留下的问题与 Cascades 的改进方向

EXODUS 已经把规则与搜索分开，并通过 MESH 保存计划、OPEN 管理待应用的变换。但逻辑形式与物理组合容易重复记录，属性处理也不够独立。Volcano 改进了表达式复用、属性目标和面向目标的动态规划。

原始 Volcano 的 Generate-and-Test 思路仍会先展开某个等价类的逻辑候选，再比较物理实现。理解这个阶段划分时，可以对照论文算法中的逻辑生成与实现选择；它与整条编译流水线先做一次全局重写的划分处在不同层次。候选提前展开过多，仍可能产生最终用不到的工作。

下一讲 [Cascades](/wiki/cmu_15_799/cascades.html)会将这些工作表示成任务，让逻辑探索、物理实现和子输入优化更加灵活地交错执行。

## 参考资料

- [The Volcano Optimizer Generator: Extensibility and Efficient Search](https://15799.courses.cs.cmu.edu/spring2025/papers/04-volcano/graefe-icde1993.pdf) (G. Graefe et al., ICDE 1993) *(Primary)*
- [Volcano - An Extensible and Parallel Query Evaluation System](https://15799.courses.cs.cmu.edu/spring2025/papers/04-volcano/graefe-icde1994.pdf) (G. Graefe et al., ICDE 1994) (Optional)
- [The EXODUS Optimizer Generator](https://15799.courses.cs.cmu.edu/spring2025/papers/04-volcano/graefe-sigmod1987.pdf) (G. Graefe et al., SIGMOD 1987) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/04-volcano.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/04-volcano.pdf)
- [课程 Video](https://www.youtube.com/watch?v=kguocoOxXKM&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=4)
- [B 站视频](https://www.bilibili.com/video/BV11jKo6JEPv)

---
layout: wiki
wiki: cmu_15_799
order: 008
title: Join 排序：自下而上
date: 2025-02-05 08:00:00
banner: /assets/banner/banner_8.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836481898121&bvid=BV1mgKo6WEDr&cid=39520043686&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：07 - Lecture 07 - Join Ordering Bottom-Up](https://www.bilibili.com/video/BV1mgKo6WEDr)

本页截图取自上方 B 站课程录像，标注时间可跳回对应位置；图中细字可配合文末的高清课件查看。正文里的教学数据与原课示例分别说明。

## Join 顺序为什么需要专门的枚举算法

第 07 讲讨论自下而上的 Join 排序。转换规则可以从一棵树生成另一棵等价树，但反复使用交换律和结合律，会产生许多重复候选。专门的 Join 枚举算法直接利用查询图生成组合，减少重复和无效工作。

本讲主要阅读 [Adaptive Optimization of Very Large Join Queries](https://15799.courses.cs.cmu.edu/spring2025/papers/07-joins1/neumann-sigmod2018.pdf)。论文针对不同规模和结构的查询调整搜索策略；其中的“Adaptive”指编译时选择搜索方法，运行中的计划修正将在后面讨论。

## 用查询图表示一个四表查询

以下教学示例假定查询只有普通内部等值 Join：

```sql
SELECT *
FROM A
JOIN B ON A.id = B.a_id
JOIN C ON B.id = C.b_id
JOIN D ON C.id = D.c_id;
```

它形成链形图 `A — B — C — D`。顶点是关系，边是可用于连接两侧的谓词。`{A,B}` 和 `{C,D}` 分别连通，它们之间有 B、C 的连接条件，能构成一条合法 Join；`{A,C}` 缺少直接条件，在当前限制下需要笛卡尔积。

自下而上搜索先准备单表方案，再合成两表、三表，最终得到完整四表方案。构造较大集合时，较小集合的候选已经准备好，因此能够进行动态规划（Dynamic Programming，DP）。

## DP 的状态与递推

先忽略排序和分布，只讨论一种简化代价模型。记 `Best[S]` 为关系集合 S 的最便宜计划。候选划分必须满足两侧非空、不相交、并集为 S，并通过合法性检查：

```text
Best[S] = min over legal (L, R):
    Cost(Best[L]) + Cost(Best[R])
    + LocalJoinCost(Best[L], Best[R])
```

这条递推成立需要最优子结构：固定同样的属性需求后，替换成更便宜的子方案不会破坏父方案。实际物理优化还要扩展状态为 `Best[S, properties]`，保留排序、分布或参数依赖不同的有用候选。

```text
for 每张基本表 T:
    初始化 T 的访问候选
for size = 2 ... n:
    for 大小为 size 的关系集合 S:
        for S 的合法划分 (L, R):
            比较可用的 Join 实现与输入候选
            更新 S 在各属性需求下的最优方案
```

这是教学伪代码。若只保留 `Best[S]` 一条无序方案，父节点需要有序输入时，就可能错过总体更便宜的计划。

### 左深树与浓密树

左深树（Left-Deep Tree）每次把已有结果与一个基本关系连接；浓密树（Bushy Tree）的两边都允许是多表子树。

```text
左深：(((A ⋈ B) ⋈ C) ⋈ D)
浓密：((A ⋈ B) ⋈ (C ⋈ D))
```

假定 `A ⋈ B` 与 `C ⋈ D` 都能把各自输入大幅缩小，浓密树可以先处理两边，再合并中间结果。左深树限制了候选数量，也可能失去这类方案。哪一种更合适取决于执行算法、数据和搜索预算。

### 把四表 DP 表逐层填满

仍使用链形图 `A — B — C — D`，只枚举两侧都连通且之间存在连接条件的候选，暂时忽略属性差异与物理 Join 方向。为看清递推过程，设单表状态成本为 0，Join 局部成本等于该次 Join 的输出行数。以下行数均为教学假设：

| 集合 | 估计输出行数 |
| --- | ---: |
| AB | 100 |
| BC | 1000 |
| CD | 10 |
| ABC | 50 |
| BCD | 20 |
| ABCD | 5 |

第二层直接得到 `Best(AB)=100`、`Best(BC)=1000`、`Best(CD)=10`。像 AC 这样的集合不连通，在当前搜索范围内无需生成它的无笛卡尔积计划。

第三层中，ABC 有两个合法切分。`AB | C` 的总代价是 `100 + 0 + 50 = 150`，`A | BC` 是 `0 + 1000 + 50 = 1050`，因此保存 150。BCD 的两个切分分别为 `BC | D`，代价 1020，以及 `B | CD`，代价 30，因此保存 30。

最后比较根集合的三个切分：

| 最后一次 Join 的切分 | 子计划与局部成本 | 完整成本 |
| --- | --- | ---: |
| A 与 BCD | `0 + 30 + 5` | 35 |
| AB 与 CD | `100 + 10 + 5` | 115 |
| ABC 与 D | `150 + 0 + 5` | 155 |

于是本例选择 `A ⋈ (B ⋈ (C ⋈ D))`。第一次计算 CD 时，状态里同时保存它的构造方式；计算 BCD 时保存 `B | CD` 的指针；根状态保存 `A | BCD`。最后沿这些指针回溯，才能重建执行树，单独保存最小数字无法输出计划。

这里的代价模型只是展示 DP 的加法与状态复用。实际 Hash Join 至少要考虑输入规模、构建与探测成本，Nested Loop 还涉及重复访问。更换模型后，上面的行数和最优树并不构成真实数据库的性能结论。

### 一个集合需要保存多少个最优值

如果 AB 有无序代价 100、有序代价 120，而根节点需要有序结果，就不能只保存 100 后丢掉 120。无序方案补排序也许需要 60，此时有序候选更合适。状态可扩展成 `Best(S, properties)`，同一集合保存多个相关属性上下文。

更细的实现还会区分参数依赖、可用输出列和数据分布。DP 的最优子结构成立，依赖这些影响父节点选择的信息已进入状态。状态过粗会提前丢弃有用方案；状态过细则增大内存和搜索工作，需要用属性支配关系进行合法剪枝。

## 怎样少生成无效划分

DPsize 按集合大小枚举组合，循环规律清晰，但会反复产生不连通集合。DPsub 以子集划分组织搜索，同样需要判断合法性。对链形图，许多任意子集没有边相连，生成后再过滤会浪费工作。

DPccp 利用连通子图及其连通补图，直接枚举可连接的子图对。这里的 complement 指相对当前组合选择的另一侧集合，具体算法还用排除集避免重复。重点在于先利用图结构约束枚举，而后才生成物理候选。

DPHyp 将这种思路扩展到超图（Hypergraph）。一条超边能连接两个关系集合，表达需要多张表的谓词。例如 `A.x + B.x = C.x`，左侧只有同时拥有 A、B 才能计算，不能拆成普通的 A—C、B—C 两条等值边。处理外连接等非自由重排算子时，超图模型还要编码对应的合法性限制。[DPHyp 论文](https://15799.courses.cs.cmu.edu/spring2025/papers/07-joins1/p539-moerkotte.pdf)讨论了这类图驱动枚举。

排除笛卡尔积会缩小搜索空间，但也限定了“最优”的范围。查询图断开时仍需要连接不相交组件；某些选择率或索引场景也可能让含笛卡尔积的方案有竞争力。因此完整系统需要明确采用的限制和回退路径。

## 查询结构怎样影响搜索量

![按查询复杂度切换枚举策略，课程视频 13:00](/assets/wiki/cmu_15_799/join_ordering_bottom_up/video-1300.jpg)

[视频 13:00：按查询复杂度切换枚举策略](https://www.bilibili.com/video/BV1mgKo6WEDr/?t=780)。课件把查询分为 Small、Medium、Large，分别走完整优化、搜索空间线性化与更贪心的策略。判断复杂度时需要同时看关系数量和图结构。这里的 Adaptive Optimization 指编译时选择搜索算法，和后面执行中调整计划的 AQP 具有不同决策时机。


同样有十张表，链形图、星形图和团形图的连通子集数量不同。团形图中任意两表都有边，大量划分都是合法的；链形图则受到相邻关系限制。单纯按表数设阈值，无法完全反映编译难度。

精确 DP 的状态和组合在一般情况下呈指数增长。提高硬件速度只能扩大可承受的查询范围，处理数百张表仍需要控制空间。主阅读论文因此结合查询结构和规模，采用精确搜索、线性化与局部优化等策略。

### 线性化：固定叶子顺序，继续选择括号

![搜索空间线性化后的 Join 树，课程视频 30:30](/assets/wiki/cmu_15_799/join_ordering_bottom_up/video-3030.jpg)

[视频 30:30：搜索空间线性化后的 Join 树](https://www.bilibili.com/video/BV1mgKo6WEDr/?t=1830)。上方保留原查询图，下方固定一条关系序列，再对相邻子链组合进行 DP。固定叶子顺序后仍有多种括号与浓密树；它减少了允许探索的结构，因此最优性限定在线性化的空间内。可以把正文四表状态换成连续区间，观察哪些切分仍然允许。


先用启发式方法得到 `A, B, C, D` 的顺序，再只组合连续区间：`AB`、`BC`、`CD`、`ABC`、`BCD`。顺序固定以后，仍可选择 `(AB)(CD)` 或 `((AB)C)D`，因此仍能生成浓密树。

区间状态数量是 O(n²)，对每个区间遍历切分点的典型递推耗时是 O(n³)。这里的状态规模与递推时间要分开理解。代价是无法再自由交换叶子顺序，最终质量取决于线性化是否保留了有价值的区域。

课程介绍的 IKKBZ 算法在特定查询图与代价模型假设下寻找左深顺序。把循环图近似成生成树、把得到的顺序用于一般系统时，应把它看作搜索初始化或启发式约束；其理论最优性需要原始假设支持。

### 更大查询的局部改进

![GOO 合并节点后更新查询图，课程视频 45:30](/assets/wiki/cmu_15_799/join_ordering_bottom_up/video-4530.jpg)

[视频 45:30：GOO 合并节点后更新查询图](https://www.bilibili.com/video/BV1mgKo6WEDr/?t=2730)。红色标记给出当前被选择的关系对，图下方将它们合并成复合节点并重新计算后续边。Greedy Operator Ordering 每步做局部选择，后续搜索建立在已经确定的合并之上。与完整 DP 保存多种子结果不同，这种策略以较小编译开销换取受限的选择空间。


GOO（Greedy Operator Ordering，贪心算子排序）每次合并当前看来最便宜的一对输入。用“输入行数乘积 × 选择率”估计输出是一种直观的简化指标，但它忽略了之后的组合机会。

Iterative DP（迭代动态规划）先得到可执行方案，再在预算内精确或近似优化局部子树，逐步改善。随机搜索、模拟退火和遗传算法则用其他方式探索候选；它们需要说明停止条件、随机种子和结果稳定性。

## 大查询上的随机搜索

课程后半段还讨论 QuickPick、Simulated Annealing 与遗传搜索。它们在有限预算内考察一部分合法计划，目标是找到质量较好的方案；预算结束时保留目前最好的完整计划，不提供全空间枚举保证。

QuickPick 随机选择查询图中的边，逐步组合关系并形成 Join 树。采样可以偏向选择率较低的边，以增加先缩小中间结果的机会；候选成本不再有前景时，放弃当前尝试并重新开始。每次随机选择仍要满足 Join 语义、连通性和属性约束。

模拟退火从一个启发式计划开始，随机改变局部顺序。成本下降的合法变化可以接受；成本上升的合法变化按一定概率接受，从而离开局部最小值。接受概率随策略阶段调整，最后保留整个过程中找到的最优候选。若重排破坏外连接语义或物理输入要求，合法性检查应直接拒绝，不能靠概率容许错误。

课程用 PostgreSQL 的 GEQO 说明遗传搜索思路：维护一批候选，让低成本候选参与下一轮的组合与变化，再比较新生成的合法计划。课件示例里的“代”展示搜索迭代，不能直接把图中的每个物理算子当成实际实现的基因编码。

这些方法的结果还受随机种子、尝试次数和停止预算影响。比较算法时，可以固定种子复现一条搜索轨迹，再使用多个种子观察计划质量的分布；仅报告一次好运气找到的低成本计划，会掩盖不稳定性。完整 DP、线性化 DP、贪心和随机搜索分别控制不同层面的空间与预算，应按查询结构共同选择。

## 手工推演一次搜索

在四表链中，先写下四个单表状态，再写下 `{A,B}`、`{B,C}`、`{C,D}`。三表状态包括 `{A,B,C}` 与 `{B,C,D}`；完整集合可以比较 `A | BCD`、`AB | CD`、`ABC | D` 等切分。物理 Join 有方向，逻辑上去除对称划分后，仍要考虑构建侧或索引内侧的选择。

给每个输入和 Join 标上自设成本，观察最优子结果如何被多个父候选复用，再增加一个排序需求，看哪些状态需要保留额外实现。下一讲的 [自上而下 Join 排序](/wiki/cmu_15_799/join_ordering_top_down.html)会从完整集合开始递归切分，并利用当前上界提前结束部分分支。

## 参考资料

- [Adaptive Optimization of Very Large Join Queries](https://15799.courses.cs.cmu.edu/spring2025/papers/07-joins1/neumann-sigmod2018.pdf) (T. Neumann et al., SIGMOD 2018) *(Primary)*
- [Dynamic Programming Strikes Back](https://15799.courses.cs.cmu.edu/spring2025/papers/07-joins1/p539-moerkotte.pdf) (G. Moerkotte et al., SIGMOD 2008) (Optional)
- [DPconv: Super-Polynomially Faster Join Ordering](https://15799.courses.cs.cmu.edu/spring2025/papers/07-joins1/stoian-sigmod2025.pdf) (M. Stoian et al., SIGMOD 2025) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/07-joins1.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/07-joins1.pdf)
- [课程 Video](https://www.youtube.com/watch?v=CcUVvnYv7Hg&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=7)
- [B 站视频](https://www.bilibili.com/video/BV1mgKo6WEDr)

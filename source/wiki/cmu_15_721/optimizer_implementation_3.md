---
layout: wiki
wiki: cmu_15_721
order: 017
title: 查询优化器实现（三）
date: 2024-03-25 08:00:00
banner: /assets/banner/banner_7.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-721：查询优化器实现（三）课程视频" src="https://www.youtube-nocookie.com/embed/anVC4AJeXqw" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 为什么原来很好的计划会变差

查询文本没有变化，计划表现也可能变化：表中的数据量和分布改变了，索引被添加或删除了，分区方式不同了，预编译语句使用了新参数，或者一次 `ANALYZE` 更新了统计信息。

静态优化在执行前决定计划；动态优化在执行中持续决定处理方式；自适应优化则先生成计划，再根据运行反馈进行修正。本讲重点讨论第三类，并区分修正未来调用与改善当前调用。

## 保留历史与回退计划

Reversion-Based Plan Correction 记录历史计划、估计和实际运行指标。新计划出现回归时，可以对未来调用恢复此前表现较好的计划。

例如，新索引让优化器选择了索引访问与另一种连接算法，但错误的基数估计可能使实际访问成本更高。保留历史可以减少这种回归的持续影响，不过旧计划依赖的索引和其他物理条件仍需检查。

## Plan Stitch：组合不同计划的有效部分

![Plan Stitch 用 OR 节点组织可替换子计划](/wiki/cmu_15_721/optimizer_implementation_3/plan-stitching.webp)

Plan Stitch 不只在几个完整计划之间二选一，还识别其中等价的子计划，把它们放进带 OR 节点的候选图，再自下而上选择组合。等价匹配需要考虑逻辑表达式与物理属性，可先按访问关系集合等条件排除明显不相容的候选。

候选来自已有计划，搜索范围比从零枚举更受限制，因此不保证一定生成更好的计划。它的价值是复用已有经验，并在某个完整旧计划失效后，仍有机会保留其中可用的部分。

Redshift 的 Codegen Stitching 则在编译代码片段层面复用缓存，减少重新编译；DB2 的 LEO 把实际执行中观察到的信息反馈给统计和估计。它们改善的层次不同：一个侧重编译成本，一个侧重后续计划的判断依据。

## 当前查询已经跑偏时怎么办

执行器发现实际行为远离预期后，可以停止并重新规划。最直接的方法是从头开始；另一种方法保留已经生成的中间结果，把它们作为新计划的输入。是否值得重来，需要比较剩余错误计划的代价与重新优化、重新执行的代价。

![Lookahead Information Passing 用维表过滤信息约束事实表](/wiki/cmu_15_721/optimizer_implementation_3/lookahead-filters.webp)

Quickstep 的 Lookahead Information Passing 先为维表建立 Bloom Filter，再依据事实表记录对这些过滤器的探测效果调整处理顺序。课程讨论的方案针对星型模式和左深连接树，不能直接外推到任意连接图。

## 预先设置可以转向的计划点

Plan Pivot Point 在物化点等合适位置准备备选子计划，运行时依据观察到的数据选择路径。参数化优化可以给不同输入规模准备不同候选，通过 Choose-Plan 运算符决定采用哪条 Pipeline。

![参数化计划在运行时选择执行路径](/wiki/cmu_15_721/optimizer_implementation_3/plan-pivot.webp)

Proactive Reoptimization 进一步为估计保留不确定范围，在执行中检查实际值并选择可切换方案。为了切换，候选必须具有相容的状态与结果语义，不能仅因为另一条路径估计更便宜，就随时跳到执行中间。

## 计划稳定性也是系统能力

数据库还可以提供 Hint、固定优化器版本或复用旧版本计划，帮助应用逐步迁移。这些机制让运维能够控制变化，但长期固定计划也可能错过数据和硬件变化带来的改进。

课程希望优化器与执行器形成反馈关系：优化器提供备选与切换边界，执行器回报实际规模和资源消耗。评价自适应方案时，应同时考虑首轮查询、后续调用、反馈维护和回归处理，而不只观察最后一次执行。

## 参考资料

- [官方课件：第 15 讲](https://15721.courses.cs.cmu.edu/spring2024/slides/15-optimizer3.pdf)
- [官方课程笔记：第 15 讲](https://15721.courses.cs.cmu.edu/spring2024/notes/15-optimizer3.pdf)
- [Plan Stitch: Harnessing the Best of Many Plans](https://15721.courses.cs.cmu.edu/spring2024/papers/15-optimizer3/p1123-ding.pdf)
- [Adaptive Query Processing in the Looking Glass](https://15721.courses.cs.cmu.edu/spring2024/papers/15-optimizer3/babu-cidr2015.pdf)
- [Looking Ahead Makes Query Plans Robust](https://15721.courses.cs.cmu.edu/spring2024/papers/15-optimizer3/p889-zhu.pdf)

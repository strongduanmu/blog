---
layout: wiki
wiki: cmu_15_799
order: 017
title: 参数化查询优化
date: 2025-03-24 08:00:00
banner: /assets/banner/banner_17.jpg
---

## 课程视频

截至 2026 年 10 月 2 日，所给 B 站收藏夹收录到第 14 讲，官网 Schedule 未提供本讲视频链接。本页依据指定论文整理。

## 同一条 SQL 模板怎样选择不同计划

第 16 讲的笔记依据官网指定论文整理。参数化查询的 SQL 结构固定，常量在每次执行时绑定；不同参数可能让命中行数相差很大，从而改变最合适的访问方式和 Join 顺序。

```sql
SELECT o.order_id, o.amount
FROM orders AS o
JOIN customers AS c ON c.id = o.customer_id
WHERE c.region = :region
  AND o.order_date >= :start_date;
```

`:region`、`:start_date` 是教学占位符，实际语法取决于数据库或客户端。最近一天的小地区查询可能只命中很少订单，大地区的多年历史查询可能命中大部分表。长期复用同一物理计划，会把两种不同的数据规模压进相同实现。

## Optimize-Always 与 Optimize-Once

每次绑定参数后都重新优化，能够根据当前信息重新选择，但高频短查询可能承担明显的编译开销。只优化一次再复用，则节省编译时间，计划质量取决于最初参数是否具有代表性。

参数化查询优化（Parametric Query Optimization，PQO）在两者之间维护一小组计划，并根据新参数选择、重新估价或重新搜索。优化目标同时包含计划质量、优化开销和缓存规模。

本讲主阅读 [Leveraging Re-costing for Online Optimization of Parameterized Queries with Guarantees](https://15799.courses.cs.cmu.edu/spring2025/papers/16-parametric/dutt-sigmod2017.pdf)提出 SCR：Selectivity、Cost、Redundancy 三类检查。

## 参数值怎样映射到选择率空间

计划切换通常更接近选择率变化，而非参数文本的大小。日期差一天，可能碰上数据热点；两个地区名字不同，命中规模却可能接近。

对两个参数条件，概念上用 `(s_region, s_date)` 表示选择率向量。每个向量对应一个查询实例，计划 P 的代价函数写成 `Cost(P, s)`。PQO 希望用有限计划覆盖经常出现的区域。

下面的单参数模型只用于理解计划切换，成本系数为人为设定：

```text
索引方案：C_index(s) = 5 + 1000s
扫描方案：C_scan(s)  = 100
交点：s = 0.095
```

在这个简化模型中，选择率低于 9.5% 时索引便宜，超过时扫描便宜。真实模型包含回表、Join、缓存与溢写，边界可能不平滑，也可能有多个维度。

## Re-costing 保留结构，重算成本

重新优化会探索新的 Join 顺序、访问路径和实现；Re-costing（重新估价）固定已有计划结构，把当前参数对应的估计代入，计算该计划在新实例下的成本。

```text
已有计划 P
新参数 q
推导 q 对应的选择率及相关估计
保持 P 的算子和结构
重新计算 Cost(P, q)
```

重新估价通常比完整搜索便宜，但它只告诉我们已有 P 的新成本。即使 P 看起来很便宜，仍需要参照或界限才能判断是否足够接近当前实例的最优方案。

## SCR 的三次判断

### Selectivity Check

先比较新实例与已有代表实例的选择率向量。在论文的成本增长约束下，推导复用计划的次优程度上界。通过检查就直接复用，不必重新估价全部计划。

### Cost Check

选择率检查无法确认时，调用 Recost API，得到已有计划在新实例下的估计成本。这个更精细的值可以收紧上界；如果满足允许的次优程度，仍可复用计划。

### Redundancy Check

前两步都无法保证质量时，完整优化当前实例。得到新计划后，再检查它是否有必要进入缓存；如果已有计划已能满足允许的成本界限，就避免保存重复或收益很小的候选。

```text
选择率检查通过 → 复用
否则重新估价并检查成本 → 通过则复用
否则完整优化 → 检查新计划是否冗余 → 更新缓存
```

三步的计算开销逐渐增加，使常见且相近的实例尽量走较便宜的路径，同时为新的区域引入计划。

### 用一串参数实例观察计划集怎样增长

继续使用 `C_index(s)=5+1000s`、`C_scan(s)=100` 的教学模型，设允许模型成本次优倍率 λ 为 1.2。这个算例使用已知的两条完整成本函数解释复用结果；SCR 在实际算法中通过论文的界限证明检查能否通过，无需预先列出全空间的最优值。

| 选择率 s | 索引成本 | 扫描成本 | 当前缓存可能做出的选择 |
| --- | ---: | ---: | --- |
| 0.01 | 15 | 100 | 首次优化并缓存索引计划 |
| 0.02 | 25 | 100 | 索引仍是优质方案 |
| 0.08 | 85 | 100 | 索引仍有优势 |
| 0.50 | 505 | 100 | 需要引入扫描计划 |
| 0.10 | 105 | 100 | 两者都位于 1.2 倍允许范围内 |

第四个实例的参数落入新的成本区域，旧计划的重新估价显示它显著昂贵；如果已有检查无法证明质量，需要完整优化。第五个实例即使完整优化可能选扫描，索引计划的模型成本也仅为最优的 1.05 倍，在允许范围内，未必值得为这点差别每次付出完整搜索。

若缓存后来已有两个结构，另一次完整优化返回同样的扫描结构，就不必保存重复计划。若得到不同结构但已有计划在相应实例上也满足质量界限，Redundancy Check 还能控制计划集增长。能否删除一个旧计划则需要检查其覆盖用途，不能只因为刚产生新计划就立即丢掉旧结构。

### 多参数空间中的相近值未必相近

假定地区选择率由 0.01 增到 0.02，日期条件由 0.8 降到 0.4。若两条件独立，乘积选择率都为 0.008；若某地区的订单集中在最近日期，两组参数的联合结果可能不同。仅把参数转成两个单列选择率也未必捕捉全部相关性。

PQO 的保证沿论文指定的选择率与成本模型推导；相关统计不足时，模型可能把两个真实规模不同的实例当作接近。实际诊断应同时查看参数映射、基数估计和成本比较，判断错误发生在复用规则还是它所依赖的估计输入。

## 论文中的 Guarantees 有哪些前提

可允许的次优倍率常记为 λ：选择方案的模型成本不超过基准最优模型成本的 λ 倍。论文借助 Bounded Cost Growth（有界成本增长）等假设，根据选择率变化推导界限。

这些推导要求成本随选择率的变化满足相应约束，还依赖其他影响因素在比较期间保持一致等条件。溢写、缓存状态和可用资源若出现突变，简单成本函数未必符合所有前提。

因此模型成本保证要按其数学假设理解；真实执行时间还受基数错误和物理模型错误影响。原论文中 λ 的基准也由优化器及其成本体系定义，并非直接测得的所有物理实现中最低运行时间。

## 缓存有效性与参数漂移

索引被删除、表结构改变或语义配置变化时，已有计划可能不再合法；数据分布明显变化时，先前推导的复用区域也需要更新。缓存键要包含足以区分语义和可执行条件的信息。

工作负载长期集中在某些参数区域时，在线策略可以逐步覆盖它们。参数分布转向另一个区域时，需要重新优化部分实例，再控制缓存增长。只保留历史最常见计划，会在变化期产生较大的质量损失。

阅读实验时，同时看每次实例的次优程度、完整优化比例、重新估价成本和缓存计划数。单看缓存命中率，无法判断高命中是否带来了好计划。

## 参考资料

- [Leveraging Re-costing for Online Optimization of Parameterized Queries with Guarantees](https://15799.courses.cs.cmu.edu/spring2025/papers/16-parametric/dutt-sigmod2017.pdf) (A. Dutt et al., SIGMOD 2017) *(Primary)*
- [Progressive Parametric Query Optimization](https://15799.courses.cs.cmu.edu/spring2025/papers/16-parametric/bizarro-tkde2008.pdf) (P. Bizarro et al., TKDE 2009) (Optional)
- [Design and Analysis of Parametric Query Optimization Algorithms](https://15799.courses.cs.cmu.edu/spring2025/papers/16-parametric/ganguly-vldb1998.pdf) (S. Ganguly, VLDB 1998) (Optional)
- [Leveraging Query Logs and Machine Query Optimization Learning for Parametric Query Optimization](https://15799.courses.cs.cmu.edu/spring2025/papers/16-parametric/vaidya-vldb2022.pdf) (K. Vaidya et al., VLDB 2022) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

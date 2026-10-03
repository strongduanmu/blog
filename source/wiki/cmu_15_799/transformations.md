---
layout: wiki
wiki: cmu_15_799
order: 007
title: 转换规则
date: 2025-02-03 08:00:00
banner: /assets/banner/banner_7.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836465121845&bvid=BV123Ko6XEXP&cid=39519850029&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：06 - Lecture 06 - Transformations](https://www.bilibili.com/video/BV123Ko6XEXP)

本页截图取自上方 B 站课程录像，标注时间可跳回对应位置；图中细字可配合文末的高清课件查看。正文里的教学数据与原课示例分别说明。

## 一条规则要同时说明结构与语义前提

第 06 讲从优化器框架转向具体转换。规则扩展了搜索空间，代价模型比较这些候选；规则能否进入搜索，首先取决于它是否保留查询结果。本文按课件中的访问路径、Join、外连接和聚合展开，补充 SQL 示例说明条件。

SQL 使用多重集（Bag）语义，重复行通常被保留；比较可能产生 `UNKNOWN`；外连接还会补出 `NULL`。因此纸上的关系代数等式，落实到 SQL 时需要检查这些约束。一次转换也可能只是为后续规则创造机会，并不要求它立即减少成本。

## 从过滤条件到访问路径

![多个访问方法组合出的候选，课程视频 30:30](/assets/wiki/cmu_15_799/transformations/video-3030.jpg)

[视频 30:30：多个访问方法组合出的候选](https://www.bilibili.com/video/BV123Ko6XEXP/?t=1830)。课件为两个过滤条件建立不同索引路径，画面中还包含 Key Lookup。索引能定位部分条件，剩余条件可能需要取得数据后再次检查；计划合法性与具体成本依赖索引键、包含列和匹配规模。观察 Filter 最终落在哪一层，能判断哪些条件真正参与了访问。


下面的教学查询同时包含两个过滤条件：

```sql
SELECT order_id, customer_id, amount
FROM orders
WHERE customer_id = 42
  AND status = 'PAID';
```

若表上有客户索引，优化器可以先定位客户 42，再检查订单状态；若有状态索引，也可以先取得已付款订单，再过滤客户；还可以顺序扫描。选择取决于命中行数、表布局、回表开销和索引能提供的列。

覆盖索引保存了查询需要的列，可能减少访问基础表的次数。键列参与搜索或排序，`INCLUDE` 列主要补充返回值；两者的作用不同。部分索引只覆盖满足特定条件的行，规则需要证明查询条件蕴含索引条件。例如仅包含 `status = 'PAID'` 的索引适用于上面的查询，是否适用于参数化状态查询还要看编译时已知信息。

多个索引也可能联合使用：分别得到行标识集合，再做交集，最后取表中数据。PostgreSQL 的 Bitmap Scan 是这类思路的一种实现。额外的集合构造和回表同样有成本，索引更多并不直接意味着计划更便宜。

## Join 重排与谓词的位置

对普通内部 Join，交换律和结合律能生成多个顺序：

```text
(A ⋈ B) ⋈ C
A ⋈ (B ⋈ C)
(B ⋈ A) ⋈ C
```

实现这些规则时必须同步处理列编号和谓词。`A.id = B.a_id` 只能在同时拥有 A、B 列的节点上求值，`A.flag = 1` 则可以单独放到 A 的扫描之后。Join 树改变时，谓词既不能丢失，也不能移动到列尚未可用的位置。

谓词下推通常减少输入，但昂贵函数会改变取舍。设扫描 A 得到 100 万行，便宜的 Join 将它减少到 100 行，一个纯函数谓词每行需要大量 CPU。提前计算会调用 100 万次，Join 后计算只调用 100 次。这个扩展示例说明，谓词的选择率与计算成本都应纳入决策；带副作用或不确定性的函数还要检查求值语义。

### 物理算法也有适用范围

Hash Join 通常利用等值键寻找候选，再检查残余条件；Merge Join 要求适合归并的键与输入顺序；Nested Loop Join 的适用范围较宽，内侧索引访问可以让小外表场景非常便宜。逻辑规则产生 Join 顺序后，实现规则还要检查这些要求。

为了避免交换与结合规则重复生成相同树，系统会记录表达式和推导历史。Memo 能消除已生成结构的重复，规则屏蔽等策略还可以更早减少重复生成工作。

## 外连接转内连接：看过滤放在哪里

![Null-rejecting 谓词与外连接化简，课程视频 55:30](/assets/wiki/cmu_15_799/transformations/video-5530.jpg)

[视频 55:30：Null-rejecting 谓词与外连接化简](https://www.bilibili.com/video/BV123Ko6XEXP/?t=3330)。画面中的过滤位于 LEFT OUTER JOIN 上方，条件针对右侧 S 的字段。未匹配行的该字段被补成 NULL，过滤不会保留它，因此这类条件可能支持化简。关键是谓词在 Join 之后过滤补空行；正文把相同条件放入 ON 子句时，行为需要重新推导。


```sql
SELECT c.id, o.order_id
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.id
WHERE o.amount > 100;
```

没有订单的客户会被左连接保留，并把订单列填为 `NULL`；随后 `NULL > 100` 得到 `UNKNOWN`，`WHERE` 只保留 `TRUE`，这些客户最终被过滤掉。这个空值拒绝（Null-Rejecting）谓词使上面的左连接能够转换为内连接，扩大可重排空间。

把金额条件放进 `ON`，语义就变了：

```sql
SELECT c.id, o.order_id
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.id AND o.amount > 100;
```

此时没有大额订单的客户仍被保留。规则必须检查条件的作用位置，以及该条件对补空行的结果。[课程讲义的外连接部分](https://15799.courses.cs.cmu.edu/spring2025/notes/06-transformations.pdf)讨论了在常规优化器中处理这些变换的方法。

对于 `o.amount IS NULL`，补空行恰好能够通过过滤，因此前面的推导不成立。外连接的重排同样需要证明保留行和补空行为一致。

## 聚合下推为什么需要键和函数信息

![完整 GROUP BY 下推的条件与树形变化，课程视频 60:30](/assets/wiki/cmu_15_799/transformations/video-6030.jpg)

[视频 60:30：完整 GROUP BY 下推的条件与树形变化](https://www.bilibili.com/video/BV123Ko6XEXP/?t=3630)。上方 SQL 的聚合只使用一侧数据，画面同时列出另一侧主键、分组列和连接列的约束。右边将聚合放到 Join 下方，以较少的组参与连接。先核对键约束与聚合输入，再看树形变化，随后用正文的 SUM 与 AVG 例子分析为什么不能只凭“聚合更早”就执行规则。


假设 `customers.id` 是主键，考虑按客户统计订单金额：

```sql
SELECT c.id, SUM(o.amount) AS total
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
GROUP BY c.id;
```

可以先按订单的客户编号聚合，再连接客户：

```sql
SELECT c.id, x.total
FROM customers AS c
JOIN (
    SELECT customer_id, SUM(amount) AS total
    FROM orders
    GROUP BY customer_id
) AS x ON x.customer_id = c.id;
```

主键条件保证每个聚合行最多匹配一个客户行，两边保留相同的订单金额贡献。若一个客户有许多订单，先聚合可以显著减少 Join 输入；如果每个客户仅一笔订单，则额外聚合的收益可能很小。

Partial Group-By Pushdown（部分聚合下推）保留最终聚合，在下面先计算中间状态。例如 `SUM` 合并局部和，`COUNT` 合并局部计数；`AVG` 需要保存和与计数，最后做 `SUM(partial_sum) / SUM(partial_count)`。直接平均各分组平均值，会在分组大小不同时给出错误结果。

如果 Join 另一侧存在重复匹配，一个输入行可能被放大多次，聚合下推必须保存这种乘数效应。`DISTINCT` 聚合、空输入和浮点计算顺序也需要单独考虑。[课程讲义的 Group-By 部分](https://15799.courses.cs.cmu.edu/spring2025/notes/06-transformations.pdf)讨论了聚合参与计划选择的问题。

### AVG 的部分结果为什么需要两个字段

前面的 `SUM` 可以在分组后再次求和；`AVG` 则需要同时保留总和和有效值数量。考虑两个预聚合分组：第一组包含 `10, 20`，第二组包含 `100`。两个局部平均值分别为 15、100，直接求平均得到 57.5；原始三行的平均值应为 `130 / 3`，约 43.33。

教学上可用下面的状态表示部分平均值：

```text
partial = (SUM(amount), COUNT(amount))
merge   = (SUM(partial.sum), SUM(partial.count))
final   = total_sum / total_count
```

`COUNT(amount)` 只计算非 NULL 值，这与 AVG 的分母一致；`COUNT(*)` 在存在 NULL 时会改变结果。分母为 0 时，应保持 AVG 对没有有效值输入的语义，实际 SQL 还要处理除法类型、精度和除零条件。

这也解释了聚合优化为什么要认识函数的状态。`SUM`、`COUNT`、`MIN`、`MAX` 比较容易分阶段组合；`COUNT(DISTINCT x)` 还涉及不同分区之间值的重叠。仅传递各分区的不同值数量并相加，会重复计算跨分区出现的同一个值，需要能去重的集合或其他满足要求的状态表示。

### 投影下推后，哪些列必须留下

设查询只输出客户姓名与订单总额，连接条件使用客户编号，过滤条件使用订单日期。扫描端除了最终输出所需列，还必须保留后续算子的输入列：`customers.id` 用于 Join，`orders.customer_id` 用于匹配，`orders.date` 用于过滤，`orders.amount` 用于聚合。

若先把订单日期投影掉，再把日期过滤移动到扫描之后，表达式就无法计算。规则应从父节点向下收集需要的列集合，并结合过滤、连接与聚合的引用计算各输入的必需列。列减少后，行宽、网络传输和 Hash 表内存可能下降，这些收益再由物理阶段估计。

相同的约束也出现在表达式化简中。将 `x + 0` 简化为 `x` 时要考虑类型和溢出行为；移动 UDF 时要考虑它是否具有副作用、是否会因求值次数改变结果。规则的结构 Pattern 只负责定位，语义条件决定能否执行。

## 星形查询怎样提供搜索起点

星形模式用较大的事实表连接多个维度表，雪花模式再把维度拆成更细的层级。事实表中的订单可能连接客户、商品与日期维度，维度过滤可以先缩小需要保留的事实行。

优化器识别这种结构后，可以用维度过滤的选择率安排初始 Join 顺序，或者考虑由维度键产生的运行时过滤。这有助于在有限预算下尽早获得好计划。它是一种利用模式知识的策略，仍要检查约束和估计；更复杂的跨维度条件或高度相关的数据可能改变这个起点的价值。

## 用一小组数据检验规则

上面的外连接例子可以用三个客户验证：客户 1 没有订单，客户 2 只有金额 50 的订单，客户 3 有金额 200 的订单。条件放在 `WHERE` 时只输出客户 3；条件放在 `ON` 时三个客户都输出，前两位的订单列为空。

验证聚合规则时，再加入一个有两笔订单的客户，以及 Join 另一侧同键重复的情况。对重复行、空输入、`NULL` 和约束失效的反例逐个推导，比只在“正常数据”上看计划形状更能确认转换的范围。

后面的 [自下而上 Join 排序](/wiki/cmu_15_799/join_ordering_bottom_up.html)讨论怎样在这些合法候选中系统地搜索顺序。

## 参考资料

- [EQOP Book](https://www.microsoft.com/en-us/research/publication/extensible-query-optimizers-in-practice/) (Chapter 4.1-4.4, 4.6) *(Primary)*
- [Prairie: A Rule Specification Framework for Query Optimizers](https://15799.courses.cs.cmu.edu/spring2025/papers/06-transformations/das-icde1995.pdf) (D. Das, ICDE 1995) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/06-transformations.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/06-transformations.pdf)
- [课程 Video](https://www.youtube.com/watch?v=oyi02nNjU-o&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=6)
- [B 站视频](https://www.bilibili.com/video/BV123Ko6XEXP)

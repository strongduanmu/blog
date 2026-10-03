---
layout: wiki
wiki: cmu_15_799
order: 003
title: IBM System R
date: 2025-01-15 08:00:00
banner: /assets/banner/banner_3.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=116836381234765&bvid=BV1XcKo68Egm&cid=39519522023&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>



## 背景

![关系模型的开端](/wiki/cmu_15_799/ibm_system_r/dawn-of-relational-model.png)

在关系模型出现以前的 20 世纪 60 时代，早期的 `DBMS` 要求开发者编写如上图所示的存储过程，来实现各种查询需求。开发者需要基于当前的数据内容，自己选择数据访问路径，以及执行的顺序，当 `DBMS` 发生变化时，这些存储过程代码必须重写，开发成本巨大。

![关系模型](/wiki/cmu_15_799/ibm_system_r/relational-model.png)

基于这样的背景，关系模型应运而生。关系模型具有 3 个原则：**1. 数据物理层和逻辑层之间的独立性**；**2. 完整性约束**，确保用户不会插入错误数据，或者破坏数据；**3. 声明式数据操作**，即 SQL 语言，以便更好地查询数据。

### 早期 RDBMS

| 系统 | 机构 | 早期优化策略 |
| --- | --- | --- |
| Peterlee Relational Test Vehicle（PRTV） | IBM Research UK | 关系模型实验系统 |
| System R | IBM Research San Jose | 启发式规则 + 基于代价的 Join 搜索 |
| INGRES | U.C. Berkeley | 启发式规则与查询分解 |
| Oracle | Larry Ellison | 早期长期使用启发式优化 |
| Mimer | Uppsala University | 早期关系数据库实现 |

System R 于 1975 年，在 IBM San Jose Research Laboratory 启动。这个实验系统要验证一件当时并不确定的事——关系模型既能提供易用的声明式接口，也能达到生产系统所需的功能和性能。它后来直接影响了 SQL 标准和 IBM DB2，许多商业及开源数据库也沿用了它建立的优化框架。

TODO



### 查询优化器的演进路线

沿着查询优化器的发展，可以看到几条主要路线：

| 路线 | 代表系统 | 核心思路 |
| --- | --- | --- |
| 启发式优化 | INGRES、早期 Oracle | 依靠预先编码的经验规则改写计划 |
| 启发式 + 基于代价的 Join 搜索 | System R、早期 DB2 | 逻辑规则先简化计划，再用代价模型选择访问路径和 Join 顺序 |
| 分层搜索（Stratified Search） | IBM Starburst、后续 DB2 | 将不同优化阶段分层，并提高规则系统的可扩展性 |
| 统一搜索（Unified Search） | Volcano、Cascades、SQL Server、Greenplum | 在统一搜索框架中管理逻辑等价表达式与物理属性 |
| 随机化搜索 | 学术系统、PostgreSQL GEQO | 在大规模 Join 场景中用随机化方法控制优化耗时 |

System R 处在纯启发式方法与现代可扩展优化器之间：逻辑改写仍由一组固定规则完成，物理计划则交给代价模型和动态规划选择。

## 启发式查询优化

启发式优化按照固定规则改写逻辑计划。规则来自关系代数等价式和数据库实践经验，应用时并不计算两种计划各自要花多少成本。

### 关系代数等价规则

#### 选择运算

当谓词引用的列仍然处于作用域内时，选择运算可以在计划树中移动。合取谓词还可以拆分：

```text
σ(p1 ∧ p2 ∧ ... ∧ pn)(R)
    = σp1(σp2(...σpn(R)))
```

谓词拆开后，便能分别向数据源方向下推。优化器还会做一些直接的表达式化简：

```text
X = Y AND Y = 3        -> X = 3 AND Y = 3
X = 1 + 1              -> X = 2
X = YEAR('2025-01-15') -> X = 2025
```

#### Join 运算

Inner Join 具有交换律和结合律：

```text
R ⋈ S = S ⋈ R
(R ⋈ S) ⋈ T = R ⋈ (S ⋈ T)
```

借助这些等价式，优化器可以调换 Join 的输入顺序，重新组织 Join 树。但表一多，候选计划会迅速膨胀。对于包含 `n` 个关系的二元 Join，逻辑 Join 树数量随关系排列和 Catalan 数共同增长：

```text
O((n - 1)! × C(n - 1))
```

优化器不可能无限搜索，只能在计划质量和优化时间之间划定边界。

### 常见启发式规则

以课程中的三表查询为例：

```sql
SELECT ARTIST.NAME
FROM ARTIST, APPEARS, ALBUM
WHERE ARTIST.ID = APPEARS.ARTIST_ID
  AND APPEARS.ALBUM_ID = ALBUM.ID
  AND ALBUM.NAME = 'Mooshoo Tribute'
ORDER BY ARTIST.ID;
```

对这条 SQL，最直接的几步改写是：

1. **拆分合取谓词**：把 `WHERE` 中的三个条件拆成可以独立移动的谓词；
2. **谓词下推**：将 `ALBUM.NAME = 'Mooshoo Tribute'` 下推到 `ALBUM` 扫描，将 Join 谓词移动到对应两张表之上；
3. **笛卡尔积替换**：将“笛卡尔积 + 等值过滤”转换为 Inner Join；
4. **投影下推**：在需要物化数据的流水线阻塞点之前移除无用列，减少中间数据宽度。

前三项通常都能稳定减少工作量。投影下推更依赖执行引擎：行存还是列存、是否向量化、何时物化，都会改变它的实际收益。

### 启发式方法的能力边界

启发式方法容易实现和调试，处理简单查询时也足够快。但规则一多，问题就逐渐暴露出来：

- 固定规则经常依赖经验阈值或“魔法常量”；
- 多条规则之间存在依赖时，规则应用顺序难以控制；
- 缺少统计信息和代价模型时，优化器无法可靠判断两个合法计划中哪一个更快；
- Join 顺序对中间结果规模影响巨大，仅凭固定规则难以做出稳定选择。

### INGRES 的查询分解

早期 INGRES 处理多表查询的办法很直白：把复杂查询拆成一串“单变量查询（Single-Variable Query）”。每一步只访问一张真实表，并读取上一步生成的临时表。

前面的三表查询大致会被拆成这样：

```sql
-- 第一步：找到目标专辑
SELECT ALBUM.ID AS ALBUM_ID INTO TEMP1
FROM ALBUM
WHERE ALBUM.NAME = 'Mooshoo Tribute';

-- 第二步：找到专辑中出现的艺人
SELECT APPEARS.ARTIST_ID INTO TEMP2
FROM APPEARS, TEMP1
WHERE APPEARS.ALBUM_ID = TEMP1.ALBUM_ID
ORDER BY APPEARS.ARTIST_ID;

-- 第三步：查询艺人姓名
SELECT ARTIST.NAME
FROM ARTIST, TEMP2
WHERE ARTIST.ID = TEMP2.ARTIST_ID;
```

执行从最内层开始，结果再代入下一层。这种做法绕开了直接优化多表 Join 的难题，但 Join 顺序基本由 SQL 写法和分解顺序决定，还可能重复执行同一查询、频繁读写临时表。

## System R 查询处理流程

原论文把一条 SQL 的处理过程分成四步：

| 阶段 | 主要职责 |
| --- | --- |
| Parsing | 检查 SQL 语法，将语句拆成一个或多个 Query Block |
| Optimization | 绑定表和列、检查类型、读取目录统计信息、枚举并选择访问计划 |
| Code Generation | 将优化器输出的 ASL（Access Specification Language）计划编译为机器码 |
| Execution | 调用底层 RSS，通过选定的访问路径执行扫描和 Join |

`SELECT` 列表、`FROM` 列表和 `WHERE` 谓词树共同组成一个 Query Block。SQL 中每出现一个子查询，就会多出一个 Query Block。System R 逐块优化，优化器也就无法轻易跨过这个边界重排整个查询。

在优化阶段，系统会：

1. 从系统目录验证表、列和类型；
2. 读取表、索引和统计信息；
3. 确定多个 Query Block 的求值顺序；
4. 枚举每个关系的访问路径；
5. 对多表 Query Block 枚举 Join 顺序和 Join 方法；
6. 选择总估算代价最低的计划，并把它写成 ASL 树。

程序里的 SQL 可以只编译一次，之后反复执行。优化成本能够被多次运行摊薄，因此 System R 愿意在编译阶段多花一点时间寻找更好的计划。

## 存储系统与访问路径

### RSS 与 RSI

System R 把物理存储、索引、锁、日志和恢复放在底层的 Research Storage System（`RSS`）中。执行代码通过 Research Storage Interface（`RSI`）调用它。

RSS 暴露的是面向元组的扫描接口，调用方式很简单：

```text
OPEN -> NEXT -> NEXT -> ... -> CLOSE
```

元组存放在 4KB 页面中，并且不会跨页。页面再组成 Segment；一个 Segment 可以混放多个关系，一个关系则只属于一个 Segment。

### Segment Scan

Segment Scan 大致相当于今天的全表扫描。它逐页检查 Segment 中的所有非空页，只返回属于目标关系的元组。由于同一个 Segment 里可能混放多个关系，扫描成本还取决于目标关系占了多少页面。

### Index Scan

System R 使用 B-Tree 索引，叶子节点保存 `(key, tuple identifier)`。叶子页首尾相连，扫描器可以先沿着叶子链读取一段键值，再根据 tuple identifier 找到数据页。

索引分为两类：

- **Clustered Index**：数据元组的物理邻近关系与索引键顺序一致。按索引扫描时，同一数据页通常只需要读取一次；
- **Non-clustered Index**：索引顺序与数据页布局缺少对应关系。多个相邻索引项可能指向不同数据页，也可能反复访问同一数据页。

两类索引的成本差别很大。非聚簇索引一旦命中很多记录，最坏情况接近“每条记录随机读一次页面”，这时顺序扫描往往更便宜。

## SARG：能够用于访问路径的谓词

SARG 是 Search Argument 的缩写。在 System R 中，能够整理成下面这种形式的谓词称为 Sargable Predicate：

```text
column comparison-operator value
```

例如：

```sql
WHERE val >= 123 AND val <= 456
```

如果 `val` 上有索引，Index Scan 可以直接定位到第一个匹配键，沿叶子链读到范围终点，无需扫描整个索引。

对于复合索引，谓词引用的列需要构成索引键的前缀。例如 `(name, location)` 索引可以匹配：

```sql
WHERE name = 'SMITH'
  AND location = 'SAN JOSE'
```

扫描器可以接收一组 SARG，直接在 RSS 内部过滤元组。不匹配的元组不会越过 RSI 交给上层，CPU 工作和接口调用都会减少。无法缩小索引范围的条件则作为残余谓词，留到上层计算。

课程视频还演示了一个容易忽略的问题：选择访问路径不能只匹配列名，还得理解表达式。比如下面两个排序键在数学上等价：

```sql
ORDER BY val
ORDER BY val + 0
```

只有做过常量折叠、表达式规范化或等价推导，优化器才知道第二种写法也能利用 `val` 索引的顺序。不同 DBMS 对这类表达式的识别能力并不一致；索引用不用得上，取决于绑定、重写和优化几个环节能否接上。

## 统计信息

System R 从系统目录中读取下列统计量：

| 统计量 | 含义 |
| --- | --- |
| `NCARD(T)` | 关系 `T` 的元组数量 |
| `TCARD(T)` | Segment 中包含关系 `T` 元组的数据页数量 |
| `P(T)` | Segment 非空页中包含 `T` 元组的页面比例 |
| `ICARD(I)` | 索引 `I` 中不同键值的数量 |
| `NINDX(I)` | 索引 `I` 占用的页面数量 |

这些统计量会在批量加载或创建索引时初始化，也可以通过 `UPDATE STATISTICS` 更新。System R 不会在每次 `INSERT`、`DELETE` 或 `UPDATE` 后同步刷新全部统计信息，否则系统目录会承受额外 I/O 和锁竞争，甚至成为串行瓶颈。

这个矛盾今天仍然存在。统计信息更新得越勤、记录得越细，维护成本越高；数据摘要越旧、越粗，优化器判断失误的概率也越大。

## 选择率与基数估计

### 选择率因子

谓词的选择率因子（`Selectivity Factor`，记为 `F`）表示预计有多大比例的元组能通过该条件。System R 根据谓词类型和索引统计，用一组固定公式估算 `F`。

原论文中的典型公式如下：

| 谓词 | 选择率估算 |
| --- | --- |
| `column = value`，列上有索引 | `1 / ICARD(index)` |
| `column = value`，没有索引统计 | `1 / 10` |
| `column1 = column2`，两列都有索引 | `1 / MAX(ICARD(index1), ICARD(index2))` |
| `column > value` 等单边范围，数值边界已知 | `(high - value) / (high - low)` |
| 单边范围，无法插值 | `1 / 3` |
| `column BETWEEN value1 AND value2` | `(value2 - value1) / (high - low)` |
| `BETWEEN` 无法插值 | `1 / 4` |
| `column IN (value-list)` | `列表长度 × F(column = value)`，上限为 `1 / 2` |
| `p1 AND p2` | `F(p1) × F(p2)` |
| `p1 OR p2` | `F(p1) + F(p2) - F(p1) × F(p2)` |
| `NOT p` | `1 - F(p)` |

这些公式建立在两个很强的假设上：

1. **均匀分布假设**：每个不同键值拥有近似相同的元组数量；
2. **独立性假设**：多个谓词相互独立，因此合取选择率可以直接相乘。

真实数据经常既有倾斜，也有相关性。城市与邮编就高度相关，`city = 'Pittsburgh' AND zip_code = '15213'` 不能当作两个独立事件。直接把两个选择率相乘会严重低估行数，这个误差还会沿计划树一直传到上层。

### Query Cardinality 与 RSI Cardinality

System R 用下面的公式估算一个 Query Block 最终会返回多少行：

```text
QCARD = FROM 中所有关系的 NCARD 乘积
        × 所有布尔因子的选择率乘积
```

这个结果记为 `QCARD`。

另一个指标 `RSICARD` 估算 RSS 需要经 RSI 交给上层多少元组。它只计算能在 RSS 内部执行的 SARG：

```text
RSICARD = FROM 中所有关系的 NCARD 乘积
          × 所有 Sargable 谓词的选择率乘积
```

两者的差值来自谓词的执行位置。RSS 能提前过滤多少记录，RSI 就能少传多少；残余谓词仍要等候选元组返回上层后再判断。

## System R 代价模型

### 总体公式

System R 的代价公式很简单：

```text
COST = PAGE FETCHES + W × RSI CALLS
```

- `PAGE FETCHES`：预计读取的页面数，用来近似 I/O 成本；
- `RSI CALLS`：预计从存储层返回的元组数，用来近似 CPU 成本；
- `W`：CPU 相对于 I/O 的权重，可以随硬件调整。

Cost 是优化器内部比较计划的相对值。`W` 把 RSI 调用折算到能够与页面读取相加的尺度；只要候选计划的排序大体正确，这个数值就达到了目的。

只数页面，会漏掉谓词计算、元组构造和接口调用等 CPU 工作；只数元组，又分不出顺序 I/O、随机 I/O 和数据布局的差别。这个简单的加权公式把两类开销放进了同一个比较尺度。

### 单表访问成本

原论文中的几种典型成本如下：

| 访问方式 | 主要成本特征 |
| --- | --- |
| 唯一索引 + 等值谓词 | 读取索引页和数据页，再返回一个元组，论文简化为 `1 + 1 + W` |
| 匹配谓词的聚簇索引 | 选择率乘以索引页与数据页数量，再加 RSI 调用成本 |
| 匹配谓词的非聚簇索引 | 数据页访问上界可能接近命中元组数，缓存能够降低重复页面读取 |
| 未匹配谓词的索引 | 需要扫描完整索引及相应数据范围，索引价值主要来自输出顺序 |
| Segment Scan | 扫描 Segment 页面，再加满足 SARG 的 RSI 调用成本 |

对应的代表性公式为：

```text
匹配谓词的聚簇索引：
F(predicates) × (NINDX(I) + TCARD(T)) + W × RSICARD

匹配谓词的非聚簇索引（数据无法驻留缓冲区时）：
F(predicates) × (NINDX(I) + NCARD(T)) + W × RSICARD

Segment Scan：
TCARD(T) / P(T) + W × RSICARD
```

`TCARD(T) / P(T)` 得到目标关系所在 Segment 的非空页总数。Segment Scan 必须检查所有这些页面，其中只有 `P(T)` 的比例真正含有目标关系的元组。

### 与现代 PostgreSQL 的对照

课程视频用 PostgreSQL 作了对照。它的计划 Cost 同样采用相对单位，并以 `seq_page_cost` 为常用基准。PostgreSQL 18 默认把顺序读取一页设为 `1.0`、随机读取一页设为 `4.0`，再叠加这些参数：

- `random_page_cost`：随机读取页面的相对成本；
- `cpu_tuple_cost`：处理一行的 CPU 成本；
- `cpu_index_tuple_cost`：处理一个索引项的 CPU 成本；
- `cpu_operator_cost`：执行一个运算符或函数的 CPU 成本；
- 并行启动、并行元组传递等额外成本。

参数和公式比 System R 丰富了许多，思路仍是一脉相承：把不同资源的消耗换算成相对代价，用总成本给候选计划排序。

## Interesting Orders

### 为什么“最便宜的子计划”可能导致昂贵的完整计划

假设同一张表有两个访问计划：

- 计划 A：顺序扫描，局部成本为 100，输出无序；
- 计划 B：索引扫描，局部成本为 120，输出已经按照 `artist_id` 排序。

如果上层要执行 `ORDER BY artist_id` 或 Merge Join，计划 A 还得花 80 做一次排序，总成本变成 180；计划 B 可以沿用现成的顺序，总成本仍是 120。

所以，一个关系集合只留局部最便宜的计划还不够。输出顺序会改变上层算子的成本，它本身也是计划状态的一部分。

### System R 的处理方式

System R 把后续可能派上用场的输出顺序称为 `Interesting Order`。它可能来自：

- `ORDER BY` 指定的最终输出顺序；
- `GROUP BY` 需要的分组顺序；
- 等值 Join 列需要的 Merge Join 输入顺序。

对于每个关系集合，优化器保留：

1. 最便宜的无序计划；
2. 每一种 Interesting Order 下成本最低的计划。

当查询要求最终有序时，优化器比较：

```text
已有目标顺序的最低成本计划

VS.

最低成本无序计划 + 最终 Sort 成本
```

Join 谓词还可以建立顺序等价类。例如：

```text
E.DNO = D.DNO
D.DNO = F.DNO
```

则 `E.DNO`、`D.DNO` 和 `F.DNO` 属于同一个有序性等价类，优化器只需为该等价类保存最低成本计划，减少重复状态。

`Interesting Order` 已经有了现代优化器“物理属性（Physical Property）”的雏形。今天的系统还会跟踪数据分区、分布位置、并行度、唯一性和数据格式等属性。

## 多表 Join 优化

### System R 支持的 Join 算法

原始的 System R 优化器主要在两种 Join 实现之间选择。

#### Nested Loop Join

```text
for each tuple in outer:
    open a scan on inner
    find tuples matching the join predicate
    emit joined tuples
```

外表每产生一个元组，就拿它的 Join Key 到内表查找。内表的 Join 列上有合适索引时，这一步可以直接定位；没有索引时，反复扫描内表会非常昂贵。

其代价抽象为：

```text
C_nested_loop(path_outer, path_inner)
    = C_outer(path_outer) + N_outer × C_inner(path_inner)
```

#### Merge Scan Join

Merge Scan Join 要求两边都按 Join Key 排好序，再同步向前扫描。输入可能已经由索引提供顺序，也可能要先显式 Sort，并把结果写入临时结构。

```text
C_merge(path_outer, path_inner)
    = C_outer(path_outer) + N_outer × C_inner(path_inner)

如果 Inner 预先排序并存入临时数据：
C_inner(sorted_list)
    = TEMP_PAGES / N_outer + W × RSI_CARD

完整代价还要加入必要的 Outer Sort 和 Inner Sort 成本。
```

这版优化器还没有 Hash Join。同一个多表计划中可以混用 Nested Loop Join 和 Merge Scan Join。

### 为什么选择左深树

System R 把 `n` 表 Join 拆成连续的二表 Join，前一步的结果始终作为下一步的 Outer：

```text
(((R1 ⋈ R2) ⋈ R3) ⋈ R4)
```

这种形状叫作左深树（Left-Deep Tree）。它适合当时的系统，原因有两点：

1. 搜索空间显著小于包含 Bushy Tree 的完整空间；
2. 前一个 Join 的输出可以直接流水线传给下一个 Join，只有排序等阻塞操作需要物化中间结果。

Bushy Tree 则可以分别计算 `(R1 ⋈ R2)` 和 `(R3 ⋈ R4)`，最后连接两个中间结果。有些查询用这种树更快，代价是往往要同时保留或物化多份中间结果。受当时的内存和优化时间限制，System R 只搜索左深树。

### 延迟笛卡尔积

扩展当前关系集合时，System R 优先加入有 Join 谓词相连的表。只有剩下的表都连不上，才会考虑笛卡尔积。

例如，若 Join Graph 为：

```text
T1 -- T2 -- T3
```

那么 `T1 -> T3 -> T2` 会过早产生 `T1 × T3`，通常不会进入候选集合。`T1 -> T2 -> T3` 和 `T3 -> T2 -> T1` 每一步都有 Join 谓词，可以正常扩展。

### 自下而上的动态规划

System R 用关系集合作为状态，从单表开始，逐层构造更大的 Join 子计划。

可以把核心状态写成：

```text
Best[S, O] = 关系集合 S 在输出顺序 O 下的最低成本计划
```

其中 `O` 可以是无序状态，也可以是一种 Interesting Order。

搜索过程是：

1. **初始化单表计划**：枚举每张表的 Segment Scan 和各个 Index Scan；
2. **保留单表赢家**：为无序状态和每一种 Interesting Order 分别保留最低成本访问计划；
3. **扩展关系集合**：把一个新关系作为 Inner，连接到已有的 `k - 1` 表 Outer 计划；
4. **枚举物理实现**：比较不同 Inner 访问路径、Nested Loop Join、Merge Scan Join，以及必要的 Sort；
5. **估算代价与输出属性**：计算结果基数、累计成本和输出顺序；
6. **按等价状态剪枝**：对于相同的关系集合与输出顺序，仅保留成本最低的计划；
7. **迭代到完整集合**：重复以上步骤，直到计划包含 Query Block 中的全部关系；
8. **处理最终顺序**：比较天然满足 `ORDER BY` / `GROUP BY` 的计划和“最低成本无序计划 + Sort”。

伪代码如下：

```text
for each relation R:
    for each access path p of R:
        update Best[{R}, output_order(p)] with p

for size = 2 ... n:
    for each relation subset S with |S| = size:
        for each inner relation R in S:
            outer_set = S - {R}
            if R connects to outer_set or Cartesian product is unavoidable:
                for each retained outer plan in Best[outer_set, *]:
                    for each legal access path and join method:
                        candidate = join(outer_plan, R)
                        update Best[S, output_order(candidate)]
```

动态规划能够剪枝，是因为关系集合和物理属性都相同时，更贵的子计划不会在后续突然翻盘。物理属性不同的计划则不能放在一起比较；一种顺序也许暂时更贵，却可能省掉后面的 Join、排序或分组成本。

原论文给出的状态数量上界约为：

```text
2^n × Interesting Order 的数量
```

实际状态通常少得多，因为连接图、左深树、延迟笛卡尔积和属性等价类都会裁掉一批候选。

### 三表查询示例

回到课程中的 `ARTIST`、`APPEARS`、`ALBUM` 查询。假设目录统计与索引信息表明：

```text
ARTIST  -> Sequential Scan
APPEARS -> Sequential Scan
ALBUM   -> Index Lookup on NAME
```

优化器会这样展开搜索：

1. 从 `ALBUM.NAME = 'Mooshoo Tribute'` 的高选择性索引查找开始构造候选计划；
2. 枚举 `ALBUM ⋈ APPEARS`、`APPEARS ⋈ ARTIST` 等有 Join 边连接的二表计划；
3. 对每个关系集合分别比较 Nested Loop Join 与 Merge Scan Join；
4. 为无序输出、按 `ARTIST.ID` 排序的输出以及 Join Key 顺序分别保留低成本计划；
5. 将剩余关系加入二表计划，生成完整三表计划；
6. 比较保序计划与“无序计划 + Sort”，满足最终 `ORDER BY ARTIST.ID`。

这里没有哪项决策是孤立的：`ALBUM` 的过滤选择率影响 Join 顺序，Join 顺序改变中间结果规模，访问路径带来的顺序又会改变后续 Merge Join 和最终 Sort 的成本。

## 嵌套查询

System R 会把嵌套查询拆成独立的 Query Block。

### 非相关标量子查询

```sql
SELECT name
FROM employee
WHERE salary > (SELECT AVG(salary) FROM employee);
```

内部 Query Block 只执行一次。假设结果是 `100000`，System R 会把这个值代入外层谓词：

```sql
SELECT name
FROM employee
WHERE salary > 100000;
```

### 返回集合的非相关子查询

```sql
SELECT name
FROM employee
WHERE department_number IN (
    SELECT department_number
    FROM department
    WHERE location = 'DENVER'
);
```

子查询结果先存进临时列表，外层谓词再查这个列表。

### 相关子查询

```sql
SELECT name
FROM employee x
WHERE salary > (
    SELECT salary
    FROM employee
    WHERE employee_number = x.manager
);
```

相关子查询依赖外层元组中的 `x.manager`，原则上每来一个外层元组就要重跑一次。System R 会借助顺序减少重复工作：如果外层输入按 `manager` 排序，连续几条记录引用同一个经理，就能复用上一次的子查询结果。优化器甚至会估算，为此先按相关列排序是否划算。

逐块执行和替换很容易实现，却可能带来重复计算和昂贵的物化。现代优化器通常会尝试对子查询去相关，把它改写成 Join，再放进更大的关系表达式中统一优化。

## 正确理解 System R 的“最优”

所谓 System R 的“最优”，准确地说，是**在既定搜索空间中，由当前代价模型判断出的最低成本计划**。它受三层边界约束：

1. **搜索空间边界**：主要枚举左深树，Bushy Tree 等候选计划被排除；
2. **代价模型边界**：页面读取和 RSI 调用是近似指标，缓存、并发、流水线等行为被简化；
3. **基数估计边界**：均匀分布、谓词独立和默认选择率会产生估算误差。

即使所有允许的 Join 顺序都枚举到了，错误的基数和成本仍会把优化器带向错误计划。搜索越彻底，只能越确定地找到“估算值最低”的那个；它跑起来是否真的快，还得看估算是否靠谱。

## 原论文的实验结论

Selinger 等人在论文中给出了当时的初步测试结果：

- Cost 的绝对值经常与实际开销存在偏差，但候选计划的相对排序在很多测试中保持正确；
- 优化器在大多数测试中选择了候选搜索空间里的真实最优访问路径；
- 二表 Join 的优化开销约等于 5 到 20 次数据库检索；
- 在 IBM 370/158 上，典型优化仅需几千字节存储和零点几秒 CPU 时间；
- 八表 Join 可以在数秒内完成优化；
- SQL 程序编译一次、运行多次时，优化成本能够在多次执行中摊销。

这些数字只能放在 1979 年的软硬件环境里看。论文真正验证的是：Cost 不必精确等于运行时间，只要候选计划的相对次序大体可靠，就足以指导优化器做选择。

## 局限性与后续演进

### 规则系统难以维护

System R 主要用过程式代码实现启发式规则。规则变多以后，触发条件、应用次序和规则之间的影响会纠缠成复杂的控制流。后来的 IBM Starburst 改用更声明式、也更容易扩展的规则系统。

### 左深树会遗漏优秀计划

左深树便于流水线执行，也能压住搜索规模。到了分析型、并行或分布式查询中，Bushy Tree 有时能同时计算两个分支，或者先把两组关系各自过滤到很小再连接。只搜索左深树，就会漏掉这类计划。

### 物理属性表达能力有限

System R 为排序单独引入 Interesting Order，用额外逻辑维护有序和无序计划。现代优化器把顺序、分布、分区、并行性等都表示为 Physical Property，属性要求因而可以沿计划树统一地下传和满足。

### Query Block 隔离限制全局优化

逐块优化降低了实现难度，也把 Join 重排、谓词下推和中间结果复用限制在 Query Block 内。查询去相关技术把嵌套查询改写成 Join，才让这些操作能跨过原来的边界。

### 简单统计假设造成误差传播

均匀分布看不到热点值，单列统计看不到跨列相关性，固定默认值只能粗略兜底。底层节点一旦低估基数，偏差就会继续影响上层的 Join 算法、Join 顺序、内外表选择和物化策略。

现代数据库会用直方图、Most Common Values、采样和多列扩展统计来改善估算。PostgreSQL 就支持函数依赖、跨列 `n-distinct` 和多列 MCV，用来修正简单独立性假设带来的误差。

## System R 留下来的几条经验

### 剪枝之前，先定义什么叫“等价”

只有当两个候选计划的语义和物理属性对上层完全相同时，动态规划才能安全地淘汰较贵的那个。关系集合相同而输出顺序不同，仍然是两个状态；过早只留成本最低的计划，反而会破坏最优子结构。

### Cost 靠基数估计打地基

Join 成本高度依赖 Outer 和 Inner 的行数。底层的基数误差经过几层乘法放大，足以让 Join 顺序和算法一起选错。调试执行计划时，需要把 `estimated rows` 和 `actual rows` 对照着看，先找到误差最早出现的节点。

### 索引还会带来顺序

索引除了过滤数据，还能提供顺序。一次局部成本稍高的索引扫描，可能替 Merge Join、`GROUP BY`、`ORDER BY` 或 `LIMIT` 省下一次昂贵的排序。

### 优化器本身也有时间预算

搜索得越广，找到好计划的概率越高，编译时间和内存消耗也涨得越快。左深树、连接图约束、属性等价类、动态规划剪枝和随机化搜索，本质上都在分配这笔时间预算。

### Cost 用来比较，反馈用来校准

Cost 用相对单位给计划排序。硬件、缓存命中率、网络、并发和数据分布一直在变，统计信息更新、代价参数校准和运行时反馈负责让这把尺子尽量贴近真实环境。

## 结语

System R 把查询优化变成了一个可以落地的工程问题：先用等价规则改写逻辑计划，再根据统计信息估算选择率、基数和成本，最后用动态规划挑选访问路径、Join 顺序与 Join 算法。今天常见的基于代价优化器，骨架仍然是这一套。

其中最有生命力的想法是 `Interesting Orders`。它要求优化器在比较子计划时，不只看眼前的成本，还要保留可能被上层利用的输出顺序。后来，顺序被扩展成更一般的物理属性，数据分布、分区方式和并行度也被纳入同一套框架。

System R 的局限同样清楚：左深树缩小了搜索空间，均匀分布和谓词独立简化了基数估计，Query Block 隔离降低了实现复杂度。这些限制让系统在当时的硬件上跑得起来，也留下了后来几十年持续改进的方向。

查询优化器至今仍在回答 System R 面对的三个问题：有哪些计划可选，怎样估算它们的代价，以及如何在有限时间里找到足够好的那个。后来的优化器复杂了许多，这三个问题没有变。

## 参考资料

- [Access Path Selection in a Relational Database Management System](https://15799.courses.cs.cmu.edu/spring2025/papers/02-systemr/selinger-sigmod1979.pdf) (P. G. Selinger et al., SIGMOD 1979) *(Primary)*
- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)
- [课程 Slides](https://15799.courses.cs.cmu.edu/spring2025/slides/02-systemr.pdf)
- [课程 Notes](https://15799.courses.cs.cmu.edu/spring2025/notes/02-systemr.pdf)
- [课程 Video](https://www.youtube.com/watch?v=62cAdANFhBg&list=PLSE8ODhjZXjYCZfIbmEWH7f6MnYqyPwCE&index=2)
- [B 站视频](https://www.bilibili.com/video/BV1XcKo68Egm)

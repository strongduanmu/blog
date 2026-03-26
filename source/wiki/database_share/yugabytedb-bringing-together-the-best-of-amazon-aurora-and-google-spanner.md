---
layout: wiki
wiki: database_share
title: YugabyteDB：把 PostgreSQL 接到分布式内核上，到底难在哪
date: 2026-03-18 08:40:00
banner: /assets/banner/banner_9.jpg
references:
  - '[CMU Database Group Event Page](https://db.cs.cmu.edu/events/db-seminar-spring-2020-db-group-yugabytedb-bringing-together-the-best-of-amazon-aurora-and-google-spanner/)'
  - '[CMU Database Group - Quarantine Tech Talks: YugabyteDB (Video)](https://www.youtube.com/watch?v=DAFQcYXK2-o)'
  - '[YugabyteDB – Distributed SQL Database on Kubernetes (Slides)](https://www.yugabyte.com/wp-content/uploads/2021/05/Yugabyte-Distributed-SQL-DB-on-Kubernetes-Webinar-March-25-2021.pdf)'
  - '[Distributed PostgreSQL on a Google Spanner Architecture – Query Layer](https://www.yugabyte.com/blog/distributed-postgresql-on-a-google-spanner-architecture-query-layer/)'
  - '[Enhancing RocksDB for Speed & Scale (Removing Double WAL)](https://www.yugabyte.com/blog/enhancing-rocksdb-for-speed-scale/)'
  - '[DocDB Raft Enhancements & Leader Leases Architecture](https://github.com/YugaByte/yugabyte-db/blob/master/architecture/design/docdb-raft-enhancements.md)'
  - '[Packed Rows Technical Detail in DocDB](https://docs.yugabyte.com/stable/architecture/docdb/packed-rows/)'
  - '[YugabyteDB Distributed Transactions](https://docs.yugabyte.com/stable/architecture/transactions/distributed-txns/)'
  - '[Evolving Clock Sync for Distributed Databases (HLC vs TrueTime)](https://www.yugabyte.com/blog/evolving-clock-sync-for-distributed-databases/)'
---

![](/wiki/database_share/yugabytedb-bringing-together-the-best-of-amazon-aurora-and-google-spanner/yogabytedb-share.png)

`YugabyteDB` 最有意思的地方，不是它也做分布式 `SQL`，而是它先承认了一件事：关系型数据库里那些真正难啃、而且已经被 `PostgreSQL` 啃了二十多年的东西，不该再从头造一遍；真正该重做的，是下面那层复制、时钟、分片和事务。这个判断听起来保守，落到工程里却相当激进，因为你不是在做一个新的 `KV`，而是在把一整套成熟 `SQL` 语义接到分布式内核上。

如果这件事只是“把 `PostgreSQL` 接到一个分布式存储上”就能完成，那分布式 `SQL` 早就不是难题了。真正卡人的，是系统目录怎么分布式化，强一致读怎么别把跨地域延迟放大到没法用，跨分片事务怎么收尾，日志和存储引擎怎么避免重复写盘。`YugabyteDB` 的价值，不在一句“兼容 `PostgreSQL`”，而在它把这些缝一个个补成了能跑的系统。

## 1. 架构演进背景：它到底想补哪道缝

`YugabyteDB` 的设计目标，很大程度上就卡在 `Aurora` 和 `Spanner` 中间那道缝里。前者把云上关系数据库做得很实用，后者把全球强一致数据库做到了工程极限，但两边各有代价。

### 1.1 `Amazon Aurora`：把存储做成分布式，不等于写入也分布式

`Aurora` 最厉害的地方，是把“计算与存储分离”和“日志即数据库（`The Log is the Database`）”这条路走通了。存储层跨 `AZ` 多副本，可靠性和扩容体验都很好，对 `MySQL`、`PostgreSQL` 的兼容也足够友好。

但从一致性和写扩展的角度看，它的计算层还是典型的主从思路：

- **写入瓶颈**：写请求仍然压在单主节点上，读可以靠只读副本横向扩展，写不行。
- **全局一致性不足**：跨区域复制更多是异步思路，很难在长 RTT 网络里给出严格的全局 `ACID` 承诺。

### 1.2 `Google Spanner`：把分布式写做对了，但门槛也一起抬高了

`Spanner` 走的是另一条路：从一开始就把多副本共识、全局事务和跨地域部署放进系统骨架里，所以它能做真正的水平多主写，也能在全球范围内维持强一致。

问题在于，这套能力不是白来的：

- **时间同步依赖专有条件**：`Spanner` 的外部一致性高度依赖 `TrueTime`，而 `TrueTime` 背后是原子钟和 `GPS` 这类大多数公有云、私有云都没有的硬件条件。
- **生态迁移成本高**：早期 `SQL` 方言和传统关系型生态的兼容性不强，应用迁移不是“改几行配置”能解决的事。

所以 `YugabyteDB` 想拿的，并不是“把两家的优点拼在一起”这么简单的配方，而是一个更克制的目标：不用专有硬件，也别要求用户离开 `PostgreSQL` 生态，但写扩展、强一致和高可用这些硬指标不能退。

| **架构维度**        | **传统 RDBMS**         | **Amazon Aurora**  | **Google Spanner**           | **YugabyteDB**              |
| ------------------- | ---------------------- | ------------------ | ---------------------------- | --------------------------- |
| **计算与存储解耦**  | 否                     | 是                 | 是                           | 是                          |
| **写入水平扩展**    | 否                     | 否（受限单主）     | 是                           | 是                          |
| **事务时间戳同步**  | 单机时钟               | 区域集中式时钟     | 专有硬件原子钟（`TrueTime`） | 纯软件混合逻辑时钟（`HLC`） |
| **开源生态/兼容性** | 标准生态（`PG/MySQL`） | 兼容（`PG/MySQL`） | 专有方言/逐步支持 `SQL`      | 开源并复用 `PostgreSQL`     |

## 2. 系统宏观设计：先把边界画清楚

这个目标一旦定下来，架构几乎自然就会分成两层：

1. **查询层（`Query Layer`）**：无状态计算节点，负责连接管理、协议解析、`SQL` 分析、分布式查询规划和执行。当前主要提供兼容 `PostgreSQL` 的 `YSQL`，以及兼容 `Cassandra` 的 `YCQL`。
2. **存储层（`Storage Layer`）**：也就是 `DocDB`。它负责分片、复制、持久化，以及分布式事务落地时真正绕不过去的那些一致性问题。

这个切分看上去常规，但它背后的判断很关键：`SQL` 兼容性和分布式内核不是一类问题，混在一起重做，复杂度会指数上涨；边界画清楚，至少能把“哪里该复用，哪里必须自研”说明白。

## 3. `YSQL` 查询引擎：最难的决定，往往是别重写

`YSQL` 早期并不是一开始就选了“复用 `PostgreSQL` 源码”这条路。团队先试过用 `C++` 直接重写连接器和查询规划器，沿着做 `YCQL` 的思路继续往前推。

### 3.1 为什么重写一套 `RDBMS` 很快会失控

问题很快就暴露了：成熟关系数据库的复杂度，远不是把 `SELECT`、`INSERT`、`UPDATE`、`DELETE` 做出来就够。

一个很典型的例子是 `psql` 里的 `\\d`。它看起来像个简单命令，实际会展开成又长又绕的查询，里面夹着系统目录表、`LEFT JOIN`、子查询、`CASE WHEN`、系统函数和一堆特殊排序规则。也就是说，你如果连“看表结构”都想兼容，就会被迫同时补齐一大串关系型数据库的底层能力：

- 复杂 `WHERE` 过滤（含正则匹配与 `IN` 条件）。
- 多级 `CASE WHEN` 条件分支。
- 多系统目录表 `LEFT JOIN` 与嵌套子查询。
- 特定 `ORDER BY` 规则与系统函数（如 `pg_catalog.pg_table_is_visible()`）。

这时候问题就不是“还有多少功能没写”，而是“你是不是在不自觉地重写一个新的 `PostgreSQL`”。存储过程（`Stored Procedures`）、触发器（`Triggers`）、部分索引（`Partial Indexes`）、多维数组、`JSONB`、视图（`Views`）这些都不是装饰件，少一块，兼容性的洞就会直接露出来。

### 3.2 复用 `PostgreSQL`，真正的难点反而浮上来了

所以团队后来换了方向：不再重写查询层，而是直接引入 `PostgreSQL` 源码，最初基于 `v10.4`，并把工程结构做成便于跟进上游版本的样子。

这一步的意义不是“省事”，而是把问题逼回了真正该解决的地方。`Parser`、`Analyzer`、`Rewriter`、`Planner` 这些东西，`PostgreSQL` 已经打磨得足够深；真正新的工作，是怎么让这些本来默认单机本地磁盘的组件，和一个分布式存储层正常说话。

这里最硬的一块就是**系统目录（`System Catalogs`）的分布式化**。原生 `PostgreSQL` 的元数据表在本地磁盘上，查询它们几乎默认“就在我身边”。`YugabyteDB` 则要把这些系统表放进 `DocDB`，做成受 `Raft` 保护的独立 `Tablet`。这样一来，计算节点挂了，元数据不会跟着丢；但相应地，原本本地读的路径变成了要通过 `RPC` 找到对应 `Leader`。这件事看起来不像事务那样显眼，却是把 `PostgreSQL` 真正接上分布式内核的第一个关口。

## 4. `DocDB` 存储内核：上层借来的快，下层必须自己扛

`DocDB` 是 `YugabyteDB` 真正下重手的地方。它受 `Spanner` 启发，但实现上并不是简单照搬，而是围绕“商品硬件 + 低延迟 + 可恢复”这几个约束做工程权衡。

### 4.1 数据分片与路由

`YugabyteDB` 对 `SQL` 表做透明分片，主要有两种策略：

1. **哈希分片（`Hash-based Sharding`）**：默认策略。对主键（`Primary Key`）哈希后分布到不同分片，适合打散写热点并均衡并发 I/O。
2. **范围分片（`Range-based Sharding`）**：按主键顺序切分，适合范围查询（如 `WHERE timestamp BETWEEN X AND Y`），可减少跨节点聚合（`Scatter-Gather`）开销。

这两种策略本身不新鲜，真正关键的是分片之后，复制、恢复和查询路径都还得兜得住。

### 4.2 消除双重日志开销：别让同一笔写入落两次盘

每个节点上的 `Tablet` 最终落到 `RocksDB`（`LSM-Tree`）里。`RocksDB` 自己本来就有 `WAL`，而分布式复制这边又有 `Raft Log`。如果两边都老老实实写一遍，麻烦就来了。

按最直觉的做法，一次写入会经历两次持久化：

1. 写请求先通过 `Raft Log` 在副本间复制。
2. 各节点再将相同变更写入本地 `RocksDB WAL` 以支持崩溃恢复。

这就是典型的**双重日志惩罚（`Double Journal Tax`）**：同一份数据，为了两套恢复语义被迫写盘两次，延迟和 I/O 放大都会立刻变得难看。

`YugabyteDB` 的处理方式很直接：禁用 `RocksDB` 自带 `WAL`，把 `Raft Log` 变成唯一事实来源（`Source of Truth`）。系统再用元数据跟踪 `Memtable` 已经覆盖到哪个 `Raft Sequence ID`，节点恢复时只回放缺的那一段 `Raft` 记录。这样做的本质，是把“复制日志”和“崩溃恢复日志”合并成一条链，不再为同一件事维护两套真相。

| **组件设计**     | **传统分布式 RocksDB 架构**  | **YugabyteDB DocDB 优化架构**           |
| ---------------- | ---------------------------- | --------------------------------------- |
| **分布式日志**   | `Raft Log`（共识与复制）     | `Raft Log`（唯一持久化保障）            |
| **单机预写日志** | `RocksDB WAL`（双写 I/O）    | 已禁用                                  |
| **崩溃恢复依据** | 依赖 `WAL`，再校验共识       | 依据 `Raft Sequence ID` 回放 `Raft Log` |
| **垃圾回收策略** | `WAL` 与 `Raft Log` 独立清理 | `Memtable` 落盘后统一截断 `Raft Log`    |

### 4.3 数据模型映射与 `Packed Rows`

关系表怎么落到底层 `LSM-Tree` 键值对里，也是个很见功力的地方。早期 `DocDB` 走的是“按列拆分”的细粒度路线：一行拆成多个键值对，键（`DocKey`）里再编码哈希、主键、列标识（`Column ID`）和 `MVCC` 时间戳。

这种设计对局部更新很友好，但一旦表变宽、扫描变多，成本就会抬头。比如一张 50 列的表插入一行，就可能生成约 50 个底层键值对，元数据膨胀和寻址开销都会跟着上来。

所以从 `v2.20` 开始，引入了 `Packed Rows`，把一行里的多个非主键列在写入时序列化打包成一个更大的键值对：

- `INSERT`：整行打包写入，批量导入吞吐显著提升。
- **顺序扫描（`Sequential Scans`）**：单次读取可解出整行，降低寻址与反复拼接开销。
- `UPDATE`：部分列更新仍可作为增量键值对写入，避免重写整行。
- **后台压缩（`Compactions`）**：`RocksDB` 合并 `SSTable` 时自动融合增量更新，重建紧凑行，兼顾更新效率与扫描性能。

这里能看出 `DocDB` 的一个风格：它不追求概念上最整齐的抽象，而是反复在“更新成本”和“扫描成本”之间找平衡。

## 5. 跨地域延迟优化：强一致系统最后都会撞上 RTT

在跨国部署里，强一致系统最后都会被网络 RTT 教做人。算法没错，不代表时延能忍。传统 `Raft` 的一致性读，往往需要 `Leader` 额外确认自己还是多数派认可的领导者，这在跨地域场景里就意味着一次又一次宝贵的网络往返。

### 5.1 领导者租约（`Leader Leases`）

为了解这个问题，`YugabyteDB` 引入了 `Leader Leases`，把“每次读取都去确认一次”改成“在一段可证明安全的时间窗口里，本地直接判断”：

1. **租约获取**：新 `Leader` 当选后需等待旧 `Leader` 租约自然过期，再接管读写。
2. **租约续期**：`Leader` 在 `AppendEntries` 中携带续租信息；若超期且未获多数确认，则主动 `Step down`。
3. **时钟偏移控制**：租约计算同时纳入 `RPC` 延迟与最大时钟漂移（`max-drift-between-nodes`）约束，保证正确性。

在合法租约内，`Leader` 可以直接基于本地状态处理读取，少掉一次跨地域确认。你会发现，这里又回到了一个老问题：分布式数据库很多时候不是“没有算法”，而是“算法成立，但代价太贵”，所以需要用租约这种工程手段把代价压下来。

### 5.2 组提交（`Group Commits`）

高并发小写入场景下，另一个常见问题是复制太碎。每个请求都单独走一遍 `Raft`，网络和磁盘都会被琐碎成本拖住。`DocDB` 的做法是引入 `Group Commits`，在发送前把多个并发请求聚成批量 `Raft` 记录，再统一复制和持久化。

但批量不能乱批。系统在内部共识标识里引入 `Op ID`，保证批量提交时顺序约束仍然成立，不会为了吞吐把一致性边界磨掉。

系统还支持动态 `Leader` 均衡（`Leader Balancing`），尽量把分片主节点打散到不同物理机，避免热点集中；跨地域部署时，也能通过亲和领导者（`Affinitized Leaders`）把主写路径拉近应用侧。说到底，强一致不只是一道协议题，它同时也是一道拓扑和路径选择题。

## 6. 全局分布式事务：真正把系统抬上去的，是这里

真正把一个系统从“分布式存储”抬到“分布式 `SQL` 数据库”这个档位上的，往往不是复制，而是跨分片、跨节点事务。没有这一层，很多业务上的表面兼容其实都站不住。

在纯软件前提下，`YugabyteDB` 主要靠 **混合逻辑时钟（`HLC`）** 和优化版两阶段提交（`2PC`）来把这件事做成。

### 6.1 `HLC`：物理时间与逻辑时间融合

`HLC` 把物理时钟（比如 `NTP` 时间）和逻辑时钟（`Lamport Clock`）揉在一起。每个节点维护自己的 `HLC`，也就是“物理时间 + 逻辑计数器”：

- 本地事务发生时，若物理时间前进，逻辑计数器归零；若物理时间不变，则递增计数器区分顺序。
- 节点间 `RPC` 传播 `HLC`；接收方若发现对端时间更“新”，会提升本地时间并更新逻辑计数。

它的好处是，不用单独引入一个集中式时间戳服务（`Timestamp Oracle`），也能让不同节点上的事务时间具备全局可比较性，为 `MVCC` 和快照隔离（`Snapshot Isolation`）打底。换句话说，`YugabyteDB` 在这里承认了一个现实：没有 `TrueTime` 那种硬件条件，就别假装自己有绝对时间，老老实实把“足够可比较的时间”做好。

### 6.2 `Transaction Status Tablet` 驱动的提交流程

时间序有了之后，还得有人对“这笔事务到底算提交还是回滚”负责。`YugabyteDB` 在去中心化优化 `2PC` 的基础上，引入 **事务状态分片（`Transaction Status Tablet`）** 来保存关键状态，尽量避免传统协调者单点故障带来的长时间阻塞。

![分布式事务 - 写入流程](/wiki/database_share/yugabytedb-bringing-together-the-best-of-amazon-aurora-and-google-spanner/distributed-transaction-write-path.jpg)

典型分布式写事务流程如下：

1. **初始化**：客户端 `BEGIN` 后，协调节点生成全局事务 ID，并在状态分片写入 `Pending` 记录。
2. **意向写入**：各参与分片写入带事务 ID 的临时记录（`Provisional Records`），不直接覆盖旧值。
3. **提交裁决**：全部参与分片确认后，状态分片将事务标记为 `Committed`，并分配最终 `HLC` 时间戳。
4. **异步清理**：后台将临时记录转正为带最终时间戳的正式版本；若读请求遇到临时记录，可回查状态分片判定可见性。

这里比较关键的一点是：事务的最终裁决不再只活在某个协调者进程的内存里，而是托管在受 `Raft` 保护的状态分片里。这样一来，协调者挂掉不再等于整个事务进入尴尬悬空状态。这不是把 `2PC` 变得“优雅”，而是把它从工程上变得更不容易出事故。

## 7. 跨集群复制与工程质量：能跑起来还不够

到这里，系统的主干已经差不多清楚了。但一个数据库能不能长期拿来用，看的不只是主路径，还有跨集群复制和故障验证这些“平时不显眼，出事时最要命”的部分。

### 7.1 `xCluster` 异步复制与 `CDC`

在数据主权要求严格，或者地域距离远到同步复制代价过高时，`YugabyteDB` 用 `xCluster` 提供跨地域异步复制能力。

![xCluster 异步复制](/wiki/database_share/yugabytedb-bringing-together-the-best-of-amazon-aurora-and-google-spanner/xcluster-sync.png)

它底层依赖变更数据捕获（`CDC`, `Change Data Capture`），从 `DocDB` / `Raft` 变更日志里提取变化，再通过 `RPC` 或 `gRPC` 推到目标集群。这条链路支撑的其实是很现实的场景：异地灾备、跨区域只读、副本集群隔离负载。强一致不是所有链路都要同步到底，系统也得知道哪里该退一步。

### 7.2 CI/CD、混沌测试与一致性验证

分布式数据库最怕的一件事，是论文和演示都成立，只有线上不成立。`YugabyteDB` 在单元测试、压力测试之外，还结合内存与并发问题检查工具（如 `Sanitizers`）去压底层 `C++` 的稳定性。

更关键的是持续集成 `Jepsen` 混沌测试，去模拟网络分区、时钟漂移、节点故障这些真正会把分布式系统撕开的场景，并在高并发事务压力下验证一致性语义，比如脏读、丢失更新有没有冒出来。只有这种测试长期扛得住，前面那些架构判断才不只是 PPT 上的判断。

同时，因为上层查询能力直接复用 `PostgreSQL`，官方回归测试集也就成了一面很实际的镜子：你到底只是“长得像 `PostgreSQL`”，还是在行为上也尽量接近它。

## 8. 结语

所以我看 `YugabyteDB`，最值得记住的不是某个缩写，而是它的工程取舍：能复用的地方绝不重写，必须自己负责的地方就一路下沉到日志、租约、时钟和事务状态。分布式数据库最怕的是每一层都只做一半，看起来什么都有，真正接起来到处漏风；`YugabyteDB` 难得的地方，是它把这些最容易漏风的缝，补成了一条完整链路。

也因为这样，它看起来不像一个“横空出世”的新系统，更像一台被仔细拼好的机器。上层借时间，下层拿硬功，最后换来的不是概念上的新鲜，而是一个更难被轻易复制的工程答案。



{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

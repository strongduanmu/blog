---
layout: wiki
wiki: cmu_15_799
order: 020
title: 用户自定义函数优化
date: 2025-04-02 08:00:00
banner: /assets/banner/banner_20.jpg
---

## 课程视频

截至 2026 年 10 月 2 日，所给 B 站收藏夹收录到第 14 讲，官网 Schedule 未提供本讲视频链接。本页依据指定论文整理。

## 函数调用怎样隐藏查询结构

第 19 讲依据官网指定论文整理，主要阅读 [Froid: Optimization of Imperative Programs in a Relational Database](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p432-ramachandra.pdf)。主题是把部分命令式 UDF 转成关系表达式，让常规优化器重新看到其中的数据访问、过滤和聚合。

UDF（User-Defined Function，用户自定义函数）方便复用业务逻辑。标量 UDF 返回一个值，表值函数返回一组行；内联与优化方式取决于函数语言和系统实现。本讲重点围绕论文中的标量 T-SQL UDF。

```sql
SELECT c.id, customer_total(c.id)
FROM customers AS c
WHERE c.region = 'East';
```

假设函数内部查询订单并求和。逐个客户调用函数时，内部 SQL 可能反复执行；外层优化器如果只看到一个函数调用，就很难把地区过滤、订单访问和聚合放到同一个搜索空间中。

## 不透明调用有哪些成本

逐行调用会产生函数入口、变量环境与内部查询的开销。函数内部 SQL 单独优化，可能使用不了外层已知条件；外层也可能无法准确估计函数计算量，难以选择过滤或 Join 的位置。

函数逐行处理还会限制批量化和某些并行机会。这里的具体限制以论文研究的执行方式为准，其他数据库和不同函数语言可能已经采用不同机制。

Froid 的处理链可以理解为：识别支持的函数语句，生成关系表示，把它替换到调用查询里，再使用已有关系优化能力。

## 用变量状态构造关系表达式

下面用伪代码描述教学函数，省略 SQL 方言的声明语法：

```text
customer_total(id):
    total = 查询该客户订单金额的 SUM
    if total IS NULL:
        total = 0
    if total >= 1000:
        return total * 0.9
    return total
```

变量 `total` 在不同步骤具有不同值。Froid 用关系中的列表示这些变量状态，按顺序组合赋值和控制流。

| 命令式结构 | 关系表示思路 |
| --- | --- |
| 声明与赋值 | 单行关系或投影中的列值 |
| 内部查询 | 子查询对应的关系表达式 |
| 条件分支 | 保存谓词状态并用条件表达式合并结果 |
| 顺序语句 | 按变量依赖组合表达式 |
| 返回值 | 形成最终返回列 |

论文把函数划分为 Region（程序区域），包括顺序区域和条件区域等，再自底向上构造整体表达式。Apply 算子连接前一个区域与依赖它的后一个区域，明确后者引用的变量。

这种表示要保留过程语义：赋值顺序、条件是否成立、返回位置与空值行为。它与普通文本展开相比，需要额外的变量和控制流分析。

## 内联后怎样变成集合处理

对于上面的纯函数示例，最终关系计算可以近似理解成：先统计每个客户的订单金额，连接目标客户，再根据总额计算返回值。下面是便于阅读的教学等价 SQL，假定 `customers.id` 是主键，且函数的数值类型与表达式相符：

```sql
SELECT c.id,
       CASE WHEN COALESCE(x.total, 0) >= 1000
            THEN COALESCE(x.total, 0) * 0.9
            ELSE COALESCE(x.total, 0)
       END AS customer_total
FROM customers AS c
LEFT JOIN (
    SELECT customer_id, SUM(amount) AS total
    FROM orders
    GROUP BY customer_id
) AS x ON x.customer_id = c.id
WHERE c.region = 'East';
```

左连接保留没有订单的客户，`COALESCE` 对应函数中把空和转换成 0 的行为。内联出的初始表达式未必就是这棵简化树；它还需要去相关、投影化简等规则，才能形成更紧凑的物理方案。

外层地区过滤进入共同搜索空间后，优化器可以进一步考虑先过滤客户、通过索引读取相关订单，或一次扫描后聚合。具体选择仍由规模与成本决定。

### 沿一个客户跟踪变量列的变化

假设客户 1 的订单金额为 400、800，客户 2 没有订单，客户 3 的唯一订单金额为 NULL。按前面的函数逻辑，各区域的状态如下：

| 客户 | 查询赋值后的 total | 空值处理后 | 阈值分支 | 返回值 |
| --- | ---: | ---: | --- | ---: |
| 1 | 1200 | 1200 | 达到 1000 | 1080 |
| 2 | NULL | 0 | 未达到 1000 | 0 |
| 3 | NULL | 0 | 未达到 1000 | 0 |

关系转换可以把这些阶段理解成 `total_1`、`total_2`、`result` 三列。第一列承接 SUM 子查询，第二列承接空值处理，最后一列根据条件生成。列名只是为了区分赋值版本，不代表 Froid 必须按这个名称生成计划。

如果函数随后先执行 `total = total + 100`，再判断阈值，就必须让条件读取更新后的状态。把所有对 total 的引用直接替换成最初的 SUM，会丢失命令式顺序。关系表达式中的依赖边与 Apply 让这些读取与写入关系保持明确。

常规优化器再将初始关系树化简。例如 `total_1` 除了参与 `COALESCE` 已无其他用途，可以裁掉中间列；阈值条件与返回表达式可以合并进投影。过程转换先保证语义，再用已有规则消除冗余。

## 编译器优化怎样复用关系规则

常量传播、死代码消除和程序切片等命令式编译优化，在关系表示中可以通过表达式化简、列裁剪与过滤推导产生对应效果。

如果外层查询已经说明某个分支条件恒真，相关条件表达式就可能被简化；一个变量赋值后从未用于返回值或后续计算，其对应列可能被裁掉。优化器还需要保证被删除的计算没有必须保留的副作用或错误行为。

Froid 论文的原始支持范围有明确边界。其实现重点包括声明、赋值、查询、分支、返回以及部分函数调用；不能由程序区域的概念直接推断所有循环和所有语言特性都支持内联。

## 为什么内联还需要 Outlining 和 Batching

内联大型函数会扩大计划树，产生更多相关子查询和候选。搜索时间、Memo 内存和计划大小可能因此增长。[Outlining 论文](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/arch-vldb2024.pdf)讨论先把程序整理为适合优化的区域，再决定内联边界。

Batching（批处理）则把多个调用参数集中处理，减少逐次调用和数据访问。它需要保留参数与返回值的对应关系，以及重复参数和空输入的语义。[批处理论文](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p13-franz.pdf)针对这种方法展开。

Aggify 将适合的游标循环提升为自定义聚合，用聚合状态和组合逻辑表达计算。该方向说明部分循环可以通过专门转换进入集合执行，但需要证明状态更新和合并保持语义。

### 重复参数批处理后，怎样恢复调用结果

假设外层调用参数依次是客户编号 `1, 1, 2`。若函数纯粹依赖当前客户编号与同一可见数据快照，可以把不同参数组成 `{1, 2}`，批量计算结果，再映射回三个调用位置。客户 1 的结果应返回两次，客户 2 返回一次。

批处理需要保留调用身份，不能只返回去重后的两行。若两个相同参数的调用之间存在状态变化、函数读取时间或随机值，又不能直接共享一次结果。论文中的批处理必须遵守其支持的函数语义与执行约束。

Outlining 则控制哪些程序区域进入关系搜索。一个有许多分支和内部查询的大函数全部展开后，候选数可能迅速增长。将适合统一优化的数据访问区域暴露出来，同时为其他区域保留边界，有助于控制编译与计划体积；具体边界选择需要按对应论文算法判断。

因此观察优化前后计划时，除了函数调用是否消失，还应记录内部查询执行次数、相关参数域大小、Memo 或计划规模，以及编译时间。执行速度的提升需要与额外搜索成本一起比较。

## 阅读一个函数时先确定依赖

先找函数输入、表访问、变量赋值和返回值，再确定每条语句引用哪些先前状态。把一个客户、无订单客户、含空金额客户和阈值附近客户的返回值逐步算出来，随后检查关系改写是否一致。

最后观察执行计划：是否还存在逐行调用，是否保留相关 Apply，订单扫描被调用几次，编译时间是否因内联增长。函数优化的收益来自暴露结构与复用规则，效果需要由这些具体变化解释。

## 参考资料

- [Froid: Optimization of Imperative Programs in a Relational Database](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p432-ramachandra.pdf) (K. Ramachandra et al., VLDB 2017) *(Primary)*
- [The Key to Effective UDF Optimization: Before Inlining, First Perform Outlining](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/arch-vldb2024.pdf) (S. Arch et al., VLDB 2024) (Optional)
- [Dear User-Defined Functions, Inlining isn’t working out so great for us. Let’s try batching to make our relationship work. Sincerely, SQL](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p13-franz.pdf) (K. Franz et al., CIDR 2024) (Optional)
- [Aggify: Lifting the Curse of Cursor Loops using Custom Aggregates](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/gupta-sigmod20.pdf) (S. Gupta et al., SIGMOD 2020) (Optional)
- [Compiling PL/SQL Away](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p1-duta-cidr20.pdf) (C. Duta et al., CIDR 2020) (Optional)
- [Procedural Extensions of SQL: Understanding Their Usage in the Wild](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p1378-ramachandra.pdf) (S. Gupta et al., VLDB 2021) (Optional)
- [Functional-Style SQL UDFs With a Capital ‘F’](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/duta-sigmod20.pdf) (C. Duta et al., SIGMOD 2020) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

---
layout: wiki
wiki: tsinghua_database
order: 007
title: 事务管理
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_7.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：事务管理课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1251720964&page=6&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 事务与 ACID

事务将一组操作视为一个数据库工作单元。银行转账需要扣减一个账户并增加另一个账户，只完成其中一半会破坏业务约束；多个事务同时访问余额，又需要避免读到不应观察的中间结果。

Atomicity 要求整体生效或整体撤销，Consistency 要求事务维护约束，Isolation 限制并发相互影响，Durability 保证确认提交的效果能够在相应故障后恢复。数据库机制与正确的应用逻辑共同承担一致性，不能指望事务自动修正错误的业务计算。

## 调度与可串行化

Schedule 记录不同事务操作的交错次序，同时保留每个事务内部规定的顺序。串行调度逐个执行事务；可串行化调度允许交错，但必须与某个串行执行等价。

两个不同事务访问同一对象，且至少一个是写操作时，就可能冲突。交换相邻非冲突操作不会改变相应冲突关系；若能通过这种交换得到串行调度，原调度就是冲突可串行化的。

优先图以事务为节点。Ti 的操作先于 Tj 的冲突操作时，添加 Ti→Tj；图无环时，可以按拓扑次序找到等价串行顺序，有环则不是冲突可串行化。

![通过冲突操作构造事务优先图](/wiki/tsinghua_database/transaction-management/precedence-graph.webp)

视图可串行化要求保留初始值读取、读取来源和最终写入者。它允许一些冲突等价无法接受的 Blind Write 调度，范围更大，判断和运行时保证也更困难。只比较某一组输入下的最终值相同，不足以证明两个调度对任意合法状态都等价。

## 可恢复与无级联调度

可串行化主要讨论并发结果，还需要考虑事务可能中止。若 T2 读取 T1 写入的数据，T2 应等 T1 提交后才能提交，否则 T1 中止时，已经向用户确认的 T2 可能无法被正确撤销。这是可恢复调度要求的提交先后关系。

![可恢复、不可恢复与级联回滚的差别](/wiki/tsinghua_database/transaction-management/recoverable-schedules.webp)

可恢复调度仍可能发生级联回滚：T2 尚未提交，但已经读取了 T1 的未提交数据，T1 中止会迫使 T2 一起回滚。无级联调度进一步要求只读取已提交事务的写入，因此避免这种读依赖造成的回滚传播。

## 隔离级别

课程按传统 SQL 异常分类介绍四个级别：读未提交可能出现脏读；读已提交消除脏读，但同一记录重复读取可能变化；可重复读约束已有记录的重复读取，传统定义仍可能允许幻读；可串行化则要求整体结果与串行执行等价。

幻读涉及符合条件的记录集合变化，不能仅靠锁住已返回记录解决。不同数据库的同名隔离级别可能基于快照或不同锁策略实现，实际行为应结合具体产品理解。

## 实现这些保证的组件

Undo 提供撤销修改所需信息，Redo 提供重做修改所需信息；并发控制安排允许发生的读写顺序，完整性约束检查数据是否满足声明规则。这些组件相互配合，后续课程会分别展开恢复与并发协议，而不是让一个模块独立完成全部 ACID 保证。

## 参考资料

- [第 6 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides06.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

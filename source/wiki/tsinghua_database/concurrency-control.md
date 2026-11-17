---
layout: wiki
wiki: tsinghua_database
order: 009
title: 并发控制
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_9.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：并发控制课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1251721748&page=8&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 并发控制的几条路线

本讲先讨论悲观锁，再介绍时间戳、乐观验证和多版本机制。它们共同回答：多个事务操作交错时，哪些访问可以继续，哪些必须等待或回滚，以及最终能够提供什么隔离保证。

## 两阶段锁与死锁

共享锁允许并发读，排他锁保护修改。2PL 在增长阶段获取锁，释放第一把锁后进入收缩阶段，此后不能再获取或升级锁。遵守协议可以保证固定对象集合上的冲突可串行化，但基本 2PL 仍可能级联回滚。

Strict 2PL 将排他锁保留到结束，Strong Strict 2PL 将全部锁保留到结束。课件通过锁数量随事务执行变化的曲线，区分了两种释放方式。

![Strict 2PL 与 Strong Strict 2PL 的锁释放时机](/wiki/tsinghua_database/concurrency-control/strict-locking.webp)

Wait-Die 只允许老事务等待年轻事务，反向请求者回滚；Wound-Wait 则让老请求者中止年轻持有者，年轻请求者等待老持有者。统一等待方向避免环路，重试保留原优先级有助于减少饥饿。

死锁检测通过等待图找环并选择牺牲者，超时则是较简单但可能误伤正常长等待的处理方式。树形协议按规定的数据访问顺序避免死锁，它是另一套加锁规则，不能直接等同于任意提前释放的 2PL。

## 多粒度锁、范围与 Latch

多粒度锁在数据库、表、页、记录之间选择保护范围。IS、IX、SIX 等意向模式告诉祖先节点，下层存在何种访问，避免粗粒度加锁时遍历全部后代。

范围查询还需要防止新记录进入满足条件的区间，可以通过谓词锁或索引区间锁保护潜在记录。只锁已存在的行不能自动解决幻读。

Latch 保护内部数据结构的短时临界区，事务 Lock 保护逻辑访问与隔离。自旋锁等实现适合短临界区，但高竞争下会产生 CPU 和缓存一致性成本。

## 时间戳排序

事务获得时间戳 TS，每个对象维护最大读时间戳 R_TS 与最大写时间戳 W_TS。基本单版本规则为：读操作若 `TS < W_TS`，说明预定顺序所需的旧值已经被覆盖，需要拒绝；写操作若早于对象的 R_TS 或 W_TS，也会违反次序。

Thomas Write Rule 在没有其他读约束冲突时，允许忽略已经过时的写入，减少不必要回滚。它放宽了可接受调度范围，因此分析时不能仍假定与基本冲突排序规则完全相同。

基本时间戳顺序并不自动保证可恢复性。严格变体还要处理未提交版本，必要时等待其结局，避免事务使用之后可能撤销的状态。

## 乐观并发控制

OCC 分为读、验证、写三个阶段。执行期间记录读写集合并保留私有修改，提交时验证重叠事务是否改变了它所依赖的状态，成功后才安装写入。

反向验证检查执行期间已经提交的事务，正向验证检查仍在运行的事务。检查包含读写与写写关系，以及各阶段是否重叠；不能只验证写集合没有交集。冲突少时减少等待，冲突多时则可能在完成大量计算后才回滚。

![OCC 的正向验证与反向验证范围](/wiki/tsinghua_database/concurrency-control/occ-validation.webp)

## 多版本协议

MVCC 为逻辑记录保留多个物理版本，根据事务时间戳与提交状态决定可见性。课程分别将它与时间戳排序、锁和 OCC 结合，展示同一种版本存储可以配合不同并发协议。

读者访问旧版本减少了与写者的直接冲突，但多版本本身不代表可串行化。实现仍需检查相应读写依赖和写冲突；Snapshot Isolation 可能出现不同记录上的 Write Skew。

版本可以追加到表空间，也可以存入回滚段；可以保存完整记录，也可以保存差异。索引指向逻辑标识或物理版本链头，会影响更新时需要修改多少索引入口。

![逻辑记录的版本链与不同版本存储方式](/wiki/tsinghua_database/concurrency-control/version-storage.webp)

逻辑删除使用标记或墓碑版本，物理回收必须等版本不再对需要保留的快照可见。长事务会推迟回收边界，也会让版本链变长。比较协议时，应同时检查隔离级别、恢复性、等待、回滚和元数据成本，而不只看“是否加锁”。

## 参考资料

- [第 8 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides08.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

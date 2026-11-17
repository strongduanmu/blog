---
layout: wiki
wiki: cmu_15_445
order: 021
title: 多版本并发控制
date: 2025-11-12 08:00:00
banner: /assets/banner/banner_3.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：多版本并发控制课程视频" src="https://www.youtube-nocookie.com/embed/tUFha9-DuSk" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 多个物理版本与可见性

MVCC 为一个逻辑对象保留多个物理版本。写事务创建或发布新版本，读事务根据自己的可见性规则选择合适版本，因此普通快照读可以读取旧版本，与写入并行进行。

“读写互不阻塞”描述的是版本化读取带来的主要收益，不表示系统没有任何锁或 Latch。同一对象的并发写入、索引修改、内存结构维护和回收仍需协调。版本的可见性也不总以事务开始时刻为界，取决于隔离级别和快照定义。

![事务通过时间范围选择可见版本](/wiki/cmu_15_445/multi-version-concurrency-control/version-visibility.webp)

MVCC 涉及并发协议、版本存储、垃圾回收、索引与删除，不能把它当作某一种固定的并发控制算法。

## Snapshot Isolation 与 Write Skew

Snapshot Isolation 使事务读取一致的已提交快照，并让自己的修改对自己可见。并发事务若修改同一对象，需要按实现检测并解决写冲突；只修改不同对象则仍可能同时提交。

课程用黑白弹珠说明 Write Skew：一个事务把自己看到的白弹珠变成黑色，另一个把自己看到的黑弹珠变成白色。两个事务修改的行互不重叠，却都基于旧快照作出决定，最终混合结果可能不对应任何串行顺序。

![Snapshot Isolation 下不同记录上的写偏斜](/wiki/cmu_15_445/multi-version-concurrency-control/write-skew.webp)

因此一致快照加写写冲突检测并不自动保证可串行化，还需要处理读写依赖等额外条件。

## 版本存储

Append-Only Storage 将版本放在同一表空间，更新追加新元组，并维护版本链。Oldest-to-Newest 的链头稳定但查新版本可能遍历较长路径；Newest-to-Oldest 便于当前查询，但新版本发布可能需要更新入口。

Time-Travel Storage 将当前版本留在主表，把旧完整版本移到历史区域。Delta Storage 则主要保存被修改字段的旧值等增量，旧快照沿链应用这些信息重建需要的状态。前者历史版本读取较直接，后者减少复制，但重建成本可能增加。

![当前记录与历史增量构成的版本链](/wiki/cmu_15_445/multi-version-concurrency-control/delta-storage.webp)

链表方向、完整版本还是增量、时间戳编码以及未提交版本标记都会影响访问过程。时间戳区间只是可见性判定的一部分，还需识别版本创建者是否已经提交。

## 垃圾回收

旧版本不能仅因有了新版本就立即删除，仍有活跃快照需要它时必须保留。回收还要防止某个并发执行者仍持有被释放对象的指针。

Tuple-Level GC 可以后台扫描页面，也可以在访问版本链时协作清理；后台扫描可借助脏页信息跳过未变化的区域，协作清理则可能长期碰不到冷数据。Transaction-Level GC 记录事务创建或替换的版本，待它们不再对需要保留的快照可见后成批回收。

长事务会延后回收边界，造成版本链增长和空间占用。支持历史查询还需要额外的保留策略，不能让普通 GC 将历史数据提前删掉。

## 索引与删除

索引可以指向逻辑标识，再通过间接层找到物理版本；也可以直接指向物理链头。前者增加一次间接访问，后者在链头移动时可能需要更新更多索引入口。

不同快照中可能存在相同键对应的不同版本或逻辑记录，索引返回候选后还要检查可见性。物理索引包含重复入口，不代表同一可见状态允许违反唯一约束。

删除通常先记录 Deleted Flag 或创建 Tombstone Version，表示从某个时点起逻辑记录已删除。旧快照仍可能读取删除前版本，直到所有需要保留的读者都不再可见后，才清理版本和索引入口。

## 参考资料

- [官方课件：第 20 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/20-multiversioning.pdf)
- [官方课程笔记：第 20 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/20-multiversioning.pdf)

---
layout: wiki
wiki: tsinghua_database
order: 018
title: 高级数据库：内存数据库
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_6.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：高级数据库：内存数据库课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1268443099&page=17&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 数据在内存后，瓶颈发生变化

内存数据库围绕数据主要驻留内存的假设设计访问路径。课件将磁盘数据库的页号加槽位定位，与内存中的记录指针对比：前者需要页面缓存和页表，后者可以直接访问记录，但对象移动、并发与生命周期仍需管理。

![磁盘页面访问与内存记录访问的区别](/wiki/tsinghua_database/in-memory-databases/storage-comparison.webp)

消除大部分磁盘读取后，缓存失效、指针跳转、锁管理、日志与解释执行的成本更突出。把原有数据库文件全部缓存进内存，并不自动获得为这些成本重新设计的引擎。

## 数据组织与内存索引

行存适合事务记录访问，列存适合扫描少量列，混合布局则结合负载。分区把数据与执行资源关联，可以减少部分共享结构竞争，也可能引入跨分区事务成本。

T-Tree 尝试兼顾二叉搜索与节点内多个键的空间利用，Trie 按键片段导航，压缩路径减少单孩子节点。ART 根据孩子数量在 Node4、Node16、Node48、Node256 等布局间切换，避免所有节点都预留完整指针数组。

其中第三种布局使用 256 个键位置索引和最多 48 个子指针，通常称为 Node48，课件左侧文字中的 Node64 为笔误。

![ART 根据分支数量选择不同节点布局](/wiki/tsinghua_database/in-memory-databases/art-nodes.webp)

CSS Tree 通过数组布局和计算位置减少指针，CSB+Tree 将同一父节点的孩子连续组织为组，减少指针数量并改善缓存访问。Masstree 等结构则组合不同组织方式处理键片段。它们优化的是内存访问与布局，不能只比较大 O 复杂度。

## 并发、持久化与恢复

锁管理器在内存路径中可能很昂贵，课程因此介绍 OCC、MVCC 和分区内串行执行等方案。选择取决于冲突比例与事务范围，不能推断内存系统都不使用锁。

持久内存以外的普通 DRAM 会掉电丢失，因此仍需日志、检查点和持久备份。只保存周期性快照会丢失之后尚未备份的更新；若承诺持久提交，就必须通过相应日志或复制协议保存这部分信息。

重启需要恢复数据、版本与索引，数据全部装回内存也可能耗时。备机持续追赶可以降低部分恢复成本，但同样需要定义已复制到何处及何时确认提交。

## 查询执行与内存不足

编译和数据驱动执行减少通用算子调用，向量化提供紧凑循环。具体采用哪种方式，仍要平衡查询复杂度、编译时间和中间状态大小。

Anti-Caching 将冷数据主动移到较慢介质，保留热数据在内存；查询访问冷记录时再恢复。冷热识别、索引是否仍常驻，以及迁移过程中的指针有效性，都会影响效果。压缩也能扩大有效容量，但必须计入解码与随机访问成本。

## 参考资料

- [第 14 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

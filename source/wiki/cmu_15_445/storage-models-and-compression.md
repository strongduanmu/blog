---
layout: wiki
wiki: cmu_15_445
order: 007
title: 存储模型与压缩
date: 2025-09-15 08:00:00
banner: /assets/banner/banner_7.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：存储模型与压缩课程视频" src="https://www.youtube-nocookie.com/embed/yWnToWrskXE" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 工作负载决定访问方式

OLTP 通常处理少量实体的短事务，例如购物车和下单；OLAP 则扫描较大范围、执行连接与聚合，从已有业务数据中推导信息。HTAP 尝试让事务与分析需求在同一系统中协作。

不能只按“读多还是写多”判断全部负载。一次请求读取多少列、多少行，更新是否分散，以及是否需要很快看到新数据，都会影响物理布局。

## 行存、列存与 PAX

NSM 把同一记录的属性放在一起，适合点访问和整行更新。DSM 把同一列的值连续存放，扫描少数列时减少无关读取，相同类型和值域也更便于编码。

列存需要恢复不同列之间的行对应关系。固定宽度或字典编号可以通过位置对齐；显式 Tuple ID 则提供另一种定位方式，但增加每列的元数据。

![PAX 把行组内部组织为列块](/wiki/cmu_15_445/storage-models-and-compression/pax-layout.webp)

PAX 先划分行组，再在组内按列存储。它在列式处理和跨列读取的局部性之间折中，也是现代分析文件格式常见的组织思路。

## 压缩为什么会影响查询执行

压缩降低磁盘和内存占用，让一次读取包含更多有效值，同时增加编码与解码工作。数据库需要无损表示，并希望尽量延后解压，甚至直接在编码上完成部分操作。

压缩粒度可以是整个块、一条记录、一个属性值，或一列中的多个值。粒度越大越可能利用重复性，但访问单值时也可能需要处理更多数据。通用字节压缩不理解列与谓词，往往需要先恢复一整块。

## 列编码怎样利用数据规律

RLE 将连续相同值表示为值、起点和长度，聚簇后效果通常更好。Bitpacking 根据实际范围减少每个整数的位数；Mostly Encoding 为少数超出常见位宽的值保留异常路径。

Bitmap 为不同值保存出现位置，便于通过位运算组合条件；值域较大时，完整位图数量也会增加，因此需要评估稀疏压缩结构。Delta 记录相邻值的差，对有序或局部变化较小的数据尤其有意义。

![字典编码与保序编号](/wiki/cmu_15_445/storage-models-and-compression/dictionary-encoding.webp)

字典把原始值映射成较小编号。相等比较可以转换成编号比较；若要直接用编号做范围判断，编号顺序还必须与原值顺序相容，或者先把条件转换为正确的编号范围。

这也说明字典不是把字符串换成任意哈希值：它必须能够恢复原始内容，并处理编码与解码所需的映射。

## 事务与分析共存时的混合组织

课程最后讨论把更新友好的行式结构与扫描友好的列式结构组合。Fractured Mirror 为同一份逻辑数据维护不同物理布局；Delta Store 先接收小更新，再逐步合并到主列存。

![Delta Store 接收更新后合并进列式主存储](/wiki/cmu_15_445/storage-models-and-compression/delta-store.webp)

这种组合把“每条更新都重写压缩列块”变成批量整理，但引入两类状态。查询需要合并两边的可见数据，后台转换也要维护事务语义。因此混合存储的收益不仅取决于压缩率，还取决于更新速度、合并成本与新鲜度要求。

## 参考资料

- [官方课件：第 06 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/06-storage3.pdf)
- [官方课程笔记：第 06 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/06-storage3.pdf)

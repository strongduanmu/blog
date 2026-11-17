---
layout: wiki
wiki: cmu_15_721
order: 005
title: 数据格式与编码（二）
date: 2024-01-29 08:00:00
banner: /assets/banner/banner_4.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-721：数据格式与编码（二）课程视频" src="https://www.youtube-nocookie.com/embed/h3EOs7GH7hM" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 嵌套结构也需要列式表示

这一讲先继续上一讲的嵌套数据。Dremel 风格的 Shredding 把 `Name.Language.Code` 等叶子路径拆成列，同时保存层级信息。Definition Level 表示路径定义到了哪一层，Repetition Level 用于区分重复结构在哪一层开始新的元素。

![嵌套记录拆列后保留路径层级](/wiki/cmu_15_721/data_formats_and_encoding_2/nested-shredding.webp)

这些信息让系统只读取部分叶子列时，仍能辨认缺失值和重复元素，并恢复需要的结构。Length+Presence 的方式则直接记录各层长度与存在性。两种方法都在回答同一个问题：怎样把树拆成可扫描的列，同时保留重新组织记录的依据。

## BtrBlocks：根据数据选择嵌套编码

既有格式中的变长 Run、相邻值依赖与整块解压，会增加执行开销。BtrBlocks 从数据特征出发，为列块挑选编码，再继续压缩编码产生的输出。

它先采样，尝试可用方案，选择收益较好的编码，然后递归进行有限轮次的选择。采样并不是随意抽取独立值，而是从不重叠的随机位置抽取小段连续数据，以保留局部重复特征。课件给出的 64K 个值示例使用 10 段、每段 64 个值的样本。

可选方案包括单值/RLE、频率编码、FOR 与 Bitpacking、字典、Pseudodecimals、FSST，以及表示空值和异常值的 Roaring Bitmap。这样做把压缩决策放到数据块层面，避免假定一整列始终具有同一种分布。

FSST 把频繁出现的短字符串片段替换为单字节编码，支持不解压前面字符串就访问后面的字符串。它保留了随机访问能力，与把许多字符串一起交给通用块压缩不同。

## Roaring Bitmap：按局部密度选择容器

![Roaring Bitmap 的分区与容器](/wiki/cmu_15_721/data_formats_and_encoding_2/roaring-containers.webp)

Roaring 将整数按高位划分成块，在块中保存低 16 位。局部元素较少时使用整数数组，较密集时使用位图，也可以使用 Run 容器压缩连续区间。课件以 4096 个元素作为数组与位图之间的切换界限。

这种分层表示避免为稀疏值域分配完整位图，同时允许密集区域使用高效的位运算。BtrBlocks 用它记录空值和异常位置，后续执行可以依据位置集合恢复列值。

## FastLanes：先调整布局，再考虑指令

RLE 和 Delta 能压缩数据，但也会引入计算依赖。例如，普通 Delta 解码需要前一个值，直接把相邻值塞进 SIMD 各 Lane，并不能消除这种依赖。

![FastLanes 统一转置布局与不同编码的组织方式](/wiki/cmu_15_721/data_formats_and_encoding_2/fastlanes-layout.webp)

FastLanes 重新排列一批值，把能独立处理的数据放到不同 Lane 的计算链上。它使用虚拟的 1024 位 SIMD 模型描述算法，再映射到不同宽度的硬件向量或标量代码。虚拟宽度是一种布局与算法约定，并不要求机器具有 1024 位 SIMD 指令。

这里的目标是让编码布局适应数据并行，而不只是把已有解码循环换成更宽的指令。转置后的数据仍需依据索引恢复逻辑位置；关系查询没有显式排序时，也不应把物理存储顺序当成结果顺序。

## Bit-Slicing 与 BitWeaving

Bit-Slicing 把一组整数按位拆开，每个位平面保存所有记录在该位上的值。比较操作可以先处理高位；某些记录的结果已经确定时，就不必继续读取它们的低位。

聚合也可以使用位平面。对于非负整数列，第 k 个位平面中 1 的数量乘以 2 的 k 次方，就是这一位对总和的贡献；把各位贡献相加即可得到总和。`POPCNT` 可以高效计算一个机器字中的 1 的数量。

![BitWeaving 水平布局上的比较与选择结果](/wiki/cmu_15_721/data_formats_and_encoding_2/bitweaving-comparison.webp)

BitWeaving/H 在一个机器字中放入多个值，并留出分隔位，借助普通算术与位运算并行完成比较。BitWeaving/V 沿位平面组织数据，结合向量比较与提前剪枝。它们的共同点是尽量在压缩表示上计算，减少先恢复完整值的工作。

比较产生的位掩码还需要转成后续运算符能使用的行位置。可以逐位枚举，也可以用预计算位置表加快转换。压缩收益最终取决于整个执行链：读取、解码、比较与结果表示都应纳入评价。

## 参考资料

- [官方课件：第 03 讲](https://15721.courses.cs.cmu.edu/spring2024/slides/03-data2.pdf)
- [官方课程笔记：第 03 讲](https://15721.courses.cs.cmu.edu/spring2024/notes/03-data2.pdf)
- [The FastLanes Compression Layout: Decoding > 100 Billion Integers per Second with Scalar Code](https://15721.courses.cs.cmu.edu/spring2024/papers/03-data2/p2132-afroozeh.pdf)
- [BtrBlocks: Efficient Columnar Compression for Data Lakes](https://15721.courses.cs.cmu.edu/spring2024/papers/03-data2/kuschewski-sigmod23.pdf)
- [BitWeaving: Fast Scans for Main Memory Data Processing](https://15721.courses.cs.cmu.edu/spring2024/papers/03-data2/li-sigmod2013.pdf)

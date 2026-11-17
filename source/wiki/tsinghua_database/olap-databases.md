---
layout: wiki
wiki: tsinghua_database
order: 016
title: 高级数据库：OLAP 数据库
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_4.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：高级数据库：OLAP 数据库课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1268442307&page=15&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## OLAP 与事务负载

本篇对应高级数据库的第二个专题。OLTP 记录业务事件并完成短事务，OLAP 对较大范围的数据执行聚集、连接和探索式查询，服务统计分析。两类负载的访问规模、并发方式和性能指标不同，也影响存储与执行器的设计。

数据仓库通过 ETL 整合不同业务源，再为分析提供统一数据。主题定义关注的业务，维度提供时间、地区等分析角度，度量描述销量、金额等指标；事实表保存事件及度量，维表解释分析属性。

![数据仓库中的主题、维度、度量与事实表](/wiki/tsinghua_database/olap-databases/data-warehouse.webp)

MOLAP 以多维结构组织分析，ROLAP 建立在关系系统之上，HOLAP 结合两者。上卷、下钻、切片、切块和旋转等操作改变观察粒度与角度，底层仍需要完成相应过滤、分组与数据访问。

## 分布式分析架构

课件使用 MPP 架构说明协调节点与多个数据节点如何协作：计划被分发到数据所在位置，各节点并行执行，再交换和汇总结果。扩展性能还取决于分片、倾斜、网络与资源调度，并不是节点数增加就一定线性加速。

## 列式组织与增量数据

分析查询经常扫描大量行的少数列。列存可以减少无关列 I/O，使同类型值连续保存，更容易压缩和批量处理。课件还展示了列压缩单元、描述元数据、删除位图与行式 Delta 的配合：新更新先进入便于修改的区域，再合并到列式主体。

![列式压缩单元、描述信息与行存 Delta](/wiki/tsinghua_database/olap-databases/columnar-storage.webp)

## 编码为什么依赖分布

字典编码将重复长值映射为较短编码。RLE 保存连续相同值的值与长度，适合有较长重复段的列；差值编码保存相邻值或相对基准的差，再压缩较小数值。

课件进一步给出针对不同分布的方案：前部存在很长主值段时保存该段计数；固定块全部相同时用一个值替代整块；稀疏编码移除最频繁值并用位图保留位置；局部字典在块内不同值少时降低编码宽度。

![稀疏编码用默认值与位置位图减少存储](/wiki/tsinghua_database/olap-databases/sparse-encoding.webp)

选择方案需要把字典、位图、计数等元数据一起计入空间。压缩率高也不一定意味着查询更快，还要看随机定位、解码和能否直接在编码数据上计算。

## 列索引与执行

Zone Map 保存区域的最小、最大值，谓词与范围无交集时跳过该区域。Bloom Filter 排除一定不存在的等值键，命中后仍需精确检查。

向量化和编译执行减少逐行解释开销，物化视图则复用提前计算的结果。它们分别针对访问数据量、处理数据成本和重复工作，需要结合使用；任何摘要和物化结果都必须满足查询语义及更新新鲜度要求。

## 参考资料

- [第 14 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides14.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

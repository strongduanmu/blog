---
layout: wiki
wiki: tsinghua_database
order: 006
title: 数据库存储
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_6.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：数据库存储课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1251720757&page=5&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 存储管理的层次

数据库不能只依赖文件系统保存字节，还需要知道记录在哪个页面、页面属于哪个表、哪里有空闲空间，以及正在使用的页面能否被替换。本讲依次讨论介质、空间、页面、文件、元数据、缓冲区与行列存储。

磁盘访问包含寻道、旋转与传输，顺序访问能够摊薄前两类开销；SSD 减少了机械定位成本，但随机 I/O、写入与持久化仍有各自代价。空间通常按表空间、段、区、页组织，一次分配连续页面有助于后续顺序访问。课件的页面与区大小用于说明该布局，不是所有产品的固定标准。

## 页面与记录组织

定长记录可以通过固定槽位计算偏移，用 Bitmap 标记槽位是否占用。删除后复用槽位，避免为了维持连续顺序移动全部后续记录。

变长记录使用槽目录。页头和槽信息从一端增长，记录从另一端增长，中间保留空闲区域。槽记录偏移和长度，索引通过页号、槽号定位记录；页内压缩时可以移动记录并修改槽信息，减少对外部引用的影响。

![变长记录页面中的槽目录与记录空间](/wiki/tsinghua_database/database-storage/slotted-page.webp)

## 文件组织与空闲空间

堆表不按键排序，插入容易找到可用位置，没有索引时查询通常需要扫描。顺序表有利于按键范围读取，但插入和维护顺序有成本。哈希组织面向等值定位，B+Tree 兼顾点查与范围；多表聚簇则将经常一起访问的相关表记录放得更近。

课件使用多级空闲空间数组记录各页面可用空间，上层保存下层范围的摘要，插入时从上到下寻找能够容纳记录的页。找不到时申请新页面，并更新空间元数据。删除和更新也可能改变页面可用空间，不能只在建表时维护一次。

![多级空闲空间摘要帮助定位可插入页面](/wiki/tsinghua_database/database-storage/free-space-map.webp)

Catalog 保存表、列、索引、约束等元数据，系统自身可以通过关系模式管理这些描述。它们帮助解析器理解名称，也帮助执行器解释页面中的内容。

## 缓冲区管理

缓冲区缓存磁盘数据页和索引页，页表建立页号到内存帧的映射。读请求先查缓存，未命中时取得可用帧并读取磁盘。被修改的页标记为脏页，替换前需要按恢复协议处理写回。

正在使用的页面通过 Pin 暂时禁止驱逐；Latch 保护页面内容和管理结构免于并发修改。Pin 不等于事务锁，也不负责阻止另一个事务修改业务数据。

LRU 根据最近访问淘汰，LFU 关注访问次数，LRU-K 使用更长的历史区分重复访问与偶然访问。课件展示了大于缓存的顺序扫描如何不断挤出页面，说明简单 LRU 可能受到扫描污染。

日志缓冲与数据缓冲需要协调：提交先满足日志持久化要求，数据页可以稍后写回；写出数据页前也必须满足对应 WAL 顺序。后续故障恢复章节将详细解释这一点。

## 行存储与列存储

行存把一条记录的属性放在一起，适合读取完整记录和局部更新。列存把同列值集中保存，分析查询可以少读无关列，同类型值也更适合压缩与批量计算。

列式执行仍需要通过位置或标识关联同一逻辑行，最终返回结果时再按需求重组。布局选择应结合读哪些列、扫描多少行、更新频率和压缩方式，不能只根据“分析更快”就忽略维护成本。

## 参考资料

- [第 5 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides05.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

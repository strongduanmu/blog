---
layout: wiki
wiki: cmu_15_445
order: 004
title: 数据库存储（一）
date: 2025-09-03 08:00:00
banner: /assets/banner/banner_4.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-445：数据库存储（一）课程视频" src="https://www.youtube-nocookie.com/embed/PRLXdIMJhOg" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 磁盘型数据库怎样处理超过内存的数据

本课程主要研究磁盘型 DBMS：持久化数据保存在非易失设备上，执行计算前，把需要的部分送入内存。缓存、DRAM、SSD 与 HDD 的容量和访问延迟相差很大，访问模式也会影响带宽和等待时间。

目标不只是减少读取次数，还要组织顺序访问、提前准备后续数据，并在一个请求等待 I/O 时继续推进其他工作。缓冲池负责缓存页面，执行器向它请求数据，而不需要自己管理每次文件读取。

## 文件、页面与间接寻址

存储管理器把数据库文件组织成页面。Page ID 经过映射得到文件位置与偏移，上层组件使用逻辑编号请求页面，底层可以调整实际放置方式。

数据库页面、操作系统虚拟内存页与设备写入单元是不同概念。数据库页大小未必等于设备能够原子写入的粒度，写到一半发生故障时，需要日志、校验或其他恢复设计处理不完整页面。

Heap File 是无序页面集合。Page Directory 记录页面位置、类型、空闲空间等信息，帮助找到可容纳新记录的页面；这份目录也必须持久化并与实际页面同步。

## Slotted Page 怎样容纳变长记录

![槽数组与记录数据从页面两端增长](/wiki/cmu_15_445/database-storage-1/slotted-page.webp)

页面头保存页大小、校验和、版本或事务相关信息。简单地在页尾不断追加记录，遇到删除与变长更新时会出现空洞和定位困难。

Slotted Page 使用槽数组保存记录偏移：槽数组从一侧增长，记录内容从另一侧增长，中间是可用空间。页面内移动记录后，只需更新槽中的偏移，引用方仍能通过槽号定位。

Record ID 可以包含文件、页号与槽号，表示数据库内部的位置。它通常不是应用应该长期依赖的业务标识，记录移动、页面重组或存储策略变化，都可能影响物理定位。

## 记录头、属性与内存对齐

记录由元数据和属性值组成。记录头可以保存可见性与空值位图；表模式已经在目录中，不需要为每行重复保存完整结构定义。

![按属性大小与对齐要求组织记录](/wiki/cmu_15_445/database-storage-1/tuple-alignment.webp)

CPU 和数据类型可能具有对齐要求，属性之间因此出现 Padding。调整物理属性顺序有机会减少填充，但数据库仍需保留逻辑列到物理位置的映射，不能改变用户看到的列语义。

## 常见类型怎样变成字节

整数通常使用固定宽度二进制表示；浮点数使用近似表示，`DECIMAL/NUMERIC` 则维护精度与小数位数。课程通过数值示例说明，不能用“显示出来相同”代替对精确与近似计算的区分。

字符串与二进制数据通常记录长度和内容，或通过指针/偏移引用另一段数据。时间类型可以编码为整数等内部形式，但单位、基准与时区语义由类型和实现决定。

空值可以通过集中位图、保留编码或独立标记表示。选择保留值时，需要保证它不会和合法业务值混淆；逐属性标记则可能增加对齐与空间开销。

## 大字段超出一页时怎么办

较大的字符串或 BLOB 可以保存在溢出页中，记录内保留定位信息；也可以内联一段前缀，减少部分比较时的额外读取。另一些方案把值保存在外部文件，数据库能否为外部内容提供事务与恢复保证，需要单独确认。

这一讲从文件走到页、槽和属性，把“数据库存储一行”拆成了多层定位与表示。下一讲继续讨论已经载入内存的页面怎样共享、固定和替换。

## 参考资料

- [官方课件：第 03 讲](https://15445.courses.cs.cmu.edu/fall2025/slides/03-storage1.pdf)
- [官方课程笔记：第 03 讲](https://15445.courses.cs.cmu.edu/fall2025/notes/03-storage1.pdf)

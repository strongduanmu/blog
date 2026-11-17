---
layout: wiki
wiki: tsinghua_database
order: 024
title: SQLite 简介
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_12.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：SQLite 简介课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1269847523&page=23&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 嵌入式数据库的运行方式

SQLite 作为库嵌入应用，在应用进程内执行 SQL，不需要为普通本地访问单独运行数据库服务。它适合应用数据、设备和本地文件等场景，仍提供关系查询和事务，而不是只能保存简单键值。

## 从连接到字节码

应用通过 `sqlite3_open_v2()` 建立连接，`sqlite3_prepare_v2()` 将 SQL 编译为语句对象，`sqlite3_step()` 驱动执行并逐行返回结果，最后释放语句与连接。一个连接可以准备多个语句，每个语句保存自己的执行程序与状态。

![SQLite 连接、Statement 与虚拟机的关系](/wiki/tsinghua_database/sqlite/connection-statements.webp)

词法分析识别 Token，Lemon 生成的解析器处理语法，名称与类型等语义分析后生成 VDBE 字节码。VDBE 按指令操作寄存器、游标和下层存储接口。这里的“编译 SQL”主要指生成虚拟机程序，不能直接等同于前面 LLVM 生成原生机器码的路径。相关分层可对照 [SQLite 架构文档](https://www.sqlite.org/arch.html)。

查询优化包括规则改写、访问路径与连接顺序选择，索引与统计影响估算。课件中的通用优化类别用于回顾概念，不能仅凭该分类就断言 SQLite 已经实现某种 AI 优化器。

## B-Tree、Pager 与文件

存储后端分为 B-Tree、Pager 和 OS 接口。B-Tree 管理表及索引条目，Pager 管理页面缓存、日志和文件事务，VFS 抽象具体平台的文件访问与同步等能力。

![SQLite 的 B-Tree、Pager 与操作系统接口](/wiki/tsinghua_database/sqlite/storage-architecture.webp)

页面包含页头、单元指针与内容区域，较大的记录可能使用溢出页。表和索引所存键与 Payload 不同，解释布局时要区分对应页面类型，不能将整个文件都当成一种叶子结构。

## 回滚日志模式

Rollback Journal 在覆盖数据库文件之前保存旧页面，并按要求持久化日志。之后写入数据文件，提交时通过使日志失效等动作形成原子提交点；中途失败时，利用有效的 Hot Journal 恢复旧页面。

Shared、Reserved、Pending、Exclusive 等锁状态协调读取和写入，确保覆盖文件时不会让其他访问者观察到不完整变化。日志文件存在只是恢复判断的一部分，还要检查有效性和锁状态，不能见到任意同名文件就直接回滚。详见 [SQLite 原子提交说明](https://www.sqlite.org/atomiccommit.html)。

多数据库连接还可能通过 Super-Journal 协调多个回滚日志，它保存参与文件关系，提交与清理顺序也随之变化。

## WAL 模式

WAL 将新页面版本追加到独立日志，原数据库文件暂时保留旧内容，Checkpoint 再把可写回的内容合入主文件。读事务记录自己的 End Mark，查页时只考虑该边界内的合适版本，不能无条件读取日志中全局最新页面。

![WAL 文件、WAL-Index 与原始数据库页面](/wiki/tsinghua_database/sqlite/wal-layout.webp)

WAL-Index 帮助快速查找页面位置，避免每次顺序扫描全部日志。普通 WAL 支持读者与写者并发，但同一时刻仍只有一个写者；长读事务可能阻碍检查点推进，使日志增长。

常见 WAL 实现依赖同一主机上的共享状态，不适合把同一个数据库放到网络文件系统供多台主机直接共享。对多个 ATTACH 数据库，WAL 保证各数据库自己的事务原子性，并不保证整个集合跨文件原子提交。这些边界可对照 [SQLite WAL 文档](https://www.sqlite.org/wal.html)。

两种模式改变的是提交和恢复组织，持久性仍依赖同步配置与文件系统、存储设备提供的保证。选择时应结合读写并发、事务大小和检查点，而不是只看日志写入是否顺序。

## 参考资料

- [第 16 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides16.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

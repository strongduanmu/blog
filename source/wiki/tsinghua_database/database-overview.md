---
layout: wiki
wiki: tsinghua_database
order: 002
title: 数据库概述
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：数据库概述课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1251719286&page=1&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 数据库在系统中的位置

课程先从数据的组织和使用出发。数据可以是数字、文本、时间，也可以是图像、音频或向量；数据库将相关数据长期、有组织地保存，数据库管理系统（DBMS）负责管理这些数据，并为应用提供访问能力。

数据库系统的范围更大，还包括数据库、管理软件、开发工具、应用以及使用和管理它的人。不能把数据库文件、DBMS 进程和整个业务系统当成同一个概念。

## 从学生选课查询理解关系数据

课件使用 Student、Course 和 SC 三张表。Student 记录学生，Course 记录课程，SC 保存学号、课程号与成绩。查询“赵宇的数据库课程成绩”时，需要先找到学生学号和课程号，再查选课记录；这些关联关系决定了数据如何组合。

![学生、课程与选课记录组成的关系数据](/wiki/tsinghua_database/database-overview/student-course-schema.webp)

结构化数据能够用明确的模式描述，JSON、XML 等半结构化数据保留了较灵活的组织形式，图片、音视频等又有不同的处理需求。分类用于理解组织方式，并不意味着某一种 DBMS 只能处理其中一类对象。

## DBMS 的主要组成

查询接口层通过 SQL、JDBC、ODBC 等方式接收请求。查询处理层完成解析和优化，生成物理执行计划；查询执行层运行计划中的算子；存储管理层管理文件、页面、记录、索引和缓冲区。事务管理与安全机制贯穿这些层级。

![查询接口、查询处理、执行与存储管理之间的关系](/wiki/tsinghua_database/database-overview/dbms-architecture.webp)

例如一条连接查询，优化器需要决定先过滤哪张表、采用什么 Join，执行器再通过索引或扫描访问页面。页面缓存减少重复 I/O，而日志与并发控制保证多用户、故障场景下仍满足事务要求。

数据库周边还包括迁移、备份、监控、调优和开发工具。引擎实现是课程的重点，但应用能否方便使用，也依赖这些配套能力。

## 课程的学习路径

课程先讲关系模型、数据库设计和 SQL，建立数据表达与查询语义；随后进入存储、事务、恢复、并发控制和索引；再讨论查询处理、优化和执行。安全与高级数据库专题放在这些基础之后，最后通过 GaussDB 和 SQLite 联系具体系统。

实验配合 HuaDB 学习存储、事务和查询组件。阅读实验时，应结合其接口和版本理解实现要求，不能直接套用其他教学数据库的类和数据结构。

## 数据库的发展线索

数据管理从人工管理、文件系统发展到数据库系统。层次模型用树组织对象，网状模型支持更复杂联系；关系模型使用表和声明式操作，使逻辑数据描述与具体访问过程进一步分离。

课程随后按应用与架构区分几个发展方向。OLTP 关注短事务和并发更新，OLAP 关注大规模分析，HTAP 试图在同一数据体系中兼顾二者。分布式数据库处理跨节点存储、查询和事务，云原生设计进一步利用存算分离和资源池化。

新硬件带来多核、NUMA、持久内存等机会，也改变原有瓶颈。AI4DB 用学习方法辅助优化、配置和运维，DB4AI 则让数据库支持 AI 数据与任务。后续专题会逐一展开，而不是将它们看成取代存储、事务和优化器基础的另一套知识。

## 参考资料

- [第 1 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides01.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

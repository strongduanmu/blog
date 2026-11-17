---
layout: wiki
wiki: cmu_15_721
order: 001
title: 课程资料
date: 2023-10-31 09:15:27
banner: /assets/banner/banner_8.jpg
---

本系列采用 Andy Pavlo 主讲的 **CMU 15-721：Advanced Database Systems（2024 年春季）**，围绕现代分析型数据库的存储格式、执行引擎、并行处理、优化器和系统实现整理学习笔记。

目前正文依据该版本的官方 slide 与课程笔记，按课件顺序整理；尚未逐节核对录像中的口头补充与临时演示。课程图示直接从官方 PDF 清晰导出，保留原有图例、代码与实验条件。产品设计与性能数据均放在原课程和论文的版本背景下理解。

## 官方资料

- [2024 春季课程主页](https://15721.courses.cs.cmu.edu/spring2024/)
- [官方课表：课件、课程笔记与阅读论文](https://15721.courses.cs.cmu.edu/spring2024/schedule.html)
- [CMU Database Group 官方 YouTube 播放列表](https://www.youtube.com/playlist?list=PLSE8ODhjZXjYa_zX-KeMJui7pcN1rIaIJ)
- [CMU 数据库课程目录](https://db.cs.cmu.edu/courses/)

## 学习安排

课程默认具备数据库基础与系统编程知识。可以先复习关系模型、存储、索引、查询处理和事务，再跟随每讲对应论文理解实现上的取舍。

前半部分从文件布局走到执行与并行算法；第 13—16 讲集中讨论优化器；最后六讲把各组件放回具体数据库。第 00 讲单独记录课程概览与项目安排，不把资料首页当作一节技术课。

## 课程目录

| 讲次 | 学习笔记 | 课件 | 视频 |
| --- | --- | --- | --- |
| 00 | [课程概览与学习安排](/wiki/cmu_15_721/course_overview.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/00-introduction.pdf) | [YouTube](https://www.youtube.com/watch?v=NLycrsJ1jI8) |
| 01 | [现代分析型数据库系统](/wiki/cmu_15_721/modern_analytical_database_systems.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/01-modernolap.pdf) | [YouTube](https://www.youtube.com/watch?v=5J-I8Mj8tss) |
| 02 | [数据格式与编码（一）](/wiki/cmu_15_721/data_formats_and_encoding_1.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/02-data1.pdf) | [YouTube](https://www.youtube.com/watch?v=1hdynBJo3ew) |
| 03 | [数据格式与编码（二）](/wiki/cmu_15_721/data_formats_and_encoding_2.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/03-data2.pdf) | [YouTube](https://www.youtube.com/watch?v=h3EOs7GH7hM) |
| 04 | [查询执行与处理（一）](/wiki/cmu_15_721/query_execution_and_processing_1.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/04-execution1.pdf) | [YouTube](https://www.youtube.com/watch?v=tsbbwiWw9VE) |
| 05 | [查询执行与处理（二）](/wiki/cmu_15_721/query_execution_and_processing_2.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/05-execution2.pdf) | [YouTube](https://www.youtube.com/watch?v=et54i_Rplik) |
| 06 | [向量化查询执行](/wiki/cmu_15_721/vectorized_query_execution.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/06-vectorization.pdf) | [YouTube](https://www.youtube.com/watch?v=yU1S8gwjGEw) |
| 07 | [代码生成与查询编译](/wiki/cmu_15_721/code_generation_and_compilation.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/07-compilation.pdf) | [YouTube](https://www.youtube.com/watch?v=UPQ53hM6AWE) |
| 08 | [查询调度与协调](/wiki/cmu_15_721/scheduling_and_coordination.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/08-scheduling.pdf) | [YouTube](https://www.youtube.com/watch?v=VZjzKVfU46k) |
| 09 | [并行哈希连接算法](/wiki/cmu_15_721/hash_join_algorithms.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/09-hashjoins.pdf) | [YouTube](https://www.youtube.com/watch?v=S40K8iGa8Ek) |
| 10 | [多路连接与最坏情况最优连接](/wiki/cmu_15_721/multi_way_join_algorithms.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/10-multiwayjoins.pdf) | [YouTube](https://www.youtube.com/watch?v=1aHT3KitTYo) |
| 11 | [服务端逻辑与用户自定义函数](/wiki/cmu_15_721/server_side_logic_execution.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/11-udfs.pdf) | [YouTube](https://www.youtube.com/watch?v=FaS-E-oq-X4) |
| 12 | [数据库网络协议](/wiki/cmu_15_721/networking_protocols.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/12-networking.pdf) | [YouTube](https://www.youtube.com/watch?v=0tfDldfzlR8) |
| 13 | [查询优化器实现（一）](/wiki/cmu_15_721/optimizer_implementation_1.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/13-optimizer1.pdf) | [YouTube](https://www.youtube.com/watch?v=DwX0X8CyBSg) |
| 14 | [查询优化器实现（二）](/wiki/cmu_15_721/optimizer_implementation_2.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/14-optimizer2.pdf) | [YouTube](https://www.youtube.com/watch?v=B9gJa5ZLg8s) |
| 15 | [查询优化器实现（三）](/wiki/cmu_15_721/optimizer_implementation_3.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/15-optimizer3.pdf) | [YouTube](https://www.youtube.com/watch?v=anVC4AJeXqw) |
| 16 | [查询优化器代价模型](/wiki/cmu_15_721/cost_models.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/16-costmodels.pdf) | 官方课表未提供录像 |
| 17 | [系统分析：Google Dremel 与 BigQuery](/wiki/cmu_15_721/system_analysis_bigquery.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/17-bigquery.pdf) | [YouTube](https://www.youtube.com/watch?v=VOZax1tbvxw) |
| 18 | [系统分析：Databricks 与 Photon](/wiki/cmu_15_721/system_analysis_databricks.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/18-databricks.pdf) | [YouTube](https://www.youtube.com/watch?v=PwnUf6_0H0k) |
| 19 | [系统分析：Snowflake](/wiki/cmu_15_721/system_analysis_snowflake.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/19-snowflake.pdf) | [YouTube](https://www.youtube.com/watch?v=NhWp1bTG0Cw) |
| 20 | [系统分析：DuckDB](/wiki/cmu_15_721/system_analysis_duckdb.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/20-duckdb.pdf) | [YouTube](https://www.youtube.com/watch?v=4iD4h4sGLz4) |
| 21 | [系统分析：Yellowbrick](/wiki/cmu_15_721/system_analysis_yellowbrick.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/21-yellowbrick.pdf) | [YouTube](https://www.youtube.com/watch?v=hkTK6Auh5vE) |
| 22 | [系统分析：Amazon Redshift](/wiki/cmu_15_721/system_analysis_redshift.html) | [PDF](https://15721.courses.cs.cmu.edu/spring2024/slides/22-redshift.pdf) | [YouTube](https://www.youtube.com/watch?v=T9-MM8oHzsM) |

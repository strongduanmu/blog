---
layout: wiki
wiki: cmu_15_799
order: 020
title: 用户自定义函数优化
date: 2025-04-02 08:00:00
banner: /assets/banner/banner_20.jpg
---

## 课程视频

官网当前未公开本讲视频，B 站收藏夹也暂无对应视频。

## 学习重点

本讲对应官网 Lecture #19：User-Defined Function Optimizations。学习时重点关注：

- UDF 为什么会隐藏关系代数结构，从而阻碍优化器理解查询。
- Froid 如何将命令式程序转化为关系表达式以支持内联优化。
- outlining、batching、自定义聚合等方法如何扩展 UDF 优化空间。

## 核心问题

- 这个主题解决了查询优化器中的哪一类搜索、估计或工程实现问题？
- 它依赖哪些输入信息，例如统计信息、代价模型、物理属性或历史反馈？
- 它如何影响最终生成的物理执行计划，以及失败时会造成什么性能问题？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲涉及的关键算法、数据结构和系统实现。
- [ ] 记录和现有数据库系统相关的实现例子。

## 参考资料

- [Froid: Optimization of Imperative Programs in a Relational Database](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p432-ramachandra.pdf) (K. Ramachandra et al., VLDB 2017) *(Primary)*
- [The Key to Effective UDF Optimization: Before Inlining, First Perform Outlining](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/arch-vldb2024.pdf) (S. Arch et al., VLDB 2024) (Optional)
- [Dear User-Defined Functions, Inlining isn’t working out so great for us. Let’s try batching to make our relationship work. Sincerely, SQL](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p13-franz.pdf) (K. Franz et al., CIDR 2024) (Optional)
- [Aggify: Lifting the Curse of Cursor Loops using Custom Aggregates](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/gupta-sigmod20.pdf) (S. Gupta et al., SIGMOD 2020) (Optional)
- [Compiling PL/SQL Away](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p1-duta-cidr20.pdf) (C. Duta et al., CIDR 2020) (Optional)
- [Procedural Extensions of SQL: Understanding Their Usage in the Wild](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/p1378-ramachandra.pdf) (S. Gupta et al., VLDB 2021) (Optional)
- [Functional-Style SQL UDFs With a Capital ‘F’](https://15799.courses.cs.cmu.edu/spring2025/papers/19-udfs/duta-sigmod20.pdf) (C. Duta et al., SIGMOD 2020) (Optional)

- [课程 Schedule](https://15799.courses.cs.cmu.edu/spring2025/schedule.html)

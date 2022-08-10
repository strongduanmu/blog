---
title: Polardb-X 学习笔记
tags: [Polardb-X]
---

# PolarDB-X 入门

PolarDB-X 是一款面向超高并发、海量存储、复杂查询场景设计的云原生分布式数据库系统。其采用 `Shared Nothing` 与`存储计算分离`架构，支持水平扩展、分布式事务、混合负载等能力，具备企业级、云原生、高可用、高度兼容 MySQL 系统及生态等特点。

> Shared Nothing 说明参考：https://www.cnblogs.com/kzwrcom/p/6397709.html、https://www.jianshu.com/p/403df7516bdc

源码编译安装模式：如果想从源码编译安装 PolarDB-X，可参考[这里](https://github.com/ApsaraDB/galaxysql/blob/main/docs/zh_CN/quickstart-development.md)。如果对 PolarDB-X 的设计细节感兴趣，可关注我们的[知乎专栏](https://www.zhihu.com/org/polardb-x) 。

本地编译，参考：https://github.com/ApsaraDB/galaxysql/blob/main/CONTRIBUTING.md

```shell
git clone https://github.com/strongduanmu/galaxysql.git
cd galaxysql
git submodule add https://github.com/strongduanmu/galaxyglue.git polardbx-rpc
# 编译打包
mvn install -D maven.test.skip=true -D env=release
```

和查询优化相关的文章：

* [PolarDB-X 面向 HTAP 的 CBO 优化器](https://zhuanlan.zhihu.com/p/336084031)
* [PolarDB-X 向量化执行引擎（1）](https://zhuanlan.zhihu.com/p/337574939)
* [PolarDB-X 向量化引擎（2）](https://zhuanlan.zhihu.com/p/339514444)
* [分布式数据库如何实现 Join？](https://zhuanlan.zhihu.com/p/349420901)
* [子查询漫谈](https://zhuanlan.zhihu.com/p/350009405)
* [查询性能优化之 Runtime Filter](https://zhuanlan.zhihu.com/p/354754979)
* [PolarDB-X 中的计算下推](https://zhuanlan.zhihu.com/p/366312701)
* [PolarDB-X CBO 优化器技术内幕](https://zhuanlan.zhihu.com/p/370372242)
* [论文解读：Multi-way Join 列式内存数据库Join优化](https://zhuanlan.zhihu.com/p/378858715)
* [分布式数据库如何实现 Join（二）](https://zhuanlan.zhihu.com/p/379967662)
* [优化器技术演进：统计信息feedback](https://zhuanlan.zhihu.com/p/381127564)
* [论文解读：机器学习加持的查询优化器(SIGMOD 2021 Best Paper)](https://zhuanlan.zhihu.com/p/391159830)

# 源码笔记

FastsqlParser#parse——提供Fast SQL Parser AST到Calcite AST的转换 Calcite Parser based on FastSql Parser



## 参考文档

* [PolarDB-X 本地 debug 环境搭建](https://u01f1kqxrl.feishu.cn/docs/doccnPOyXLhQadDfvYIUDWfD9gg)




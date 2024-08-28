---
title: PolarDB-X 开发环境搭建笔记
tags: [PolarDB-X]
categories: [PolarDB-X]
date: 2024-08-28 08:00:00
updated: 2024-08-28 08:00:00
cover: /assets/cover/polardb-x.png
banner: /assets/banner/banner_1.jpg
references:
  - '[quickstart-how-to-debug-cn](https://github.com/polardb/polardbx-sql/blob/main/docs/zh_CN/quickstart-how-to-debug-cn.md)'
  - '[PolarDB-X 官方文档](https://polardbx.com/document?type=PolarDB-X)'
---

> 注意：本文基于 [PolarDB-X main 分支 6309889](https://github.com/polardb/polardbx-sql/commit/63098891f8ad59d51f1d336db7c46539cc0ed91b) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

笔者为了学习 `Calcite` 相关的技术，最近尝试在本地搭建 `PolarDB-X` 开发环境，从而可以**深入探索 PolarDB-X 是如何基于 Calcite 构建 HTAP 数据库**。本文记录了完整的搭建过程，希望能够帮助对 Calcite 或者 PolarDB-X 其他功能感兴趣的朋友。

## PolarDB-X 简介

首先，我们先来了解下 PolarDB-X 数据库，根据[官方文档](https://polardbx.com/document?type=PolarDB-X)介绍，PolarDB-X 是一款面向**超高并发、海量存储、复杂查询场景**设计的云原生分布式数据库系统。其采用 `shared-nothing` 与存储计算分离架构，支持**水平扩展、分布式事务、混合负载**等能力，具备企业级、云原生、高可用、高度兼容 MySQL 系统及生态等特点。

![PolarDB-X 架构](polardb-x-dev-environment-setup-note/architecture.png)

如上图所示，PolarDB-X 采用 `shared-nothing` 与`存储计算分离`架构进行设计，系统由 `CN`、`DN`、`GMS` 和 `CDC` 4 个核心组件组成，下面我们分别介绍下不同组件的功能职责。

- 计算节点（`CN, Compute Node`，代码仓库：[polardbx-sql](https://github.com/polardb/polardbx-sql)）：

计算节点是系统的入口，采用无状态设计，包括 `SQL 解析器`、`优化器`、`执行器`等模块。负责数据分布式路由、计算及动态调度，负责分布式事务 2PC 协调、全局二级索引维护等，同时提供 SQL 限流、三权分立等企业级特性。

- 存储节点（`DN, Data Node`，代码仓库：[polardbx-engine](https://github.com/polardb/polardbx-engine)）：

存储节点负责数据的持久化，基于多数派 `Paxos` 协议提供数据高可靠、强一致保障，同时**通过 MVCC 维护分布式事务可见性**。

- 元数据服务（`GMS, Global Meta Service`，代码仓库：[polardbx-engine](https://github.com/polardb/polardbx-engine)）：

元数据服务负责维护全局强一致的 `Table/Schema`、`Statistics` 等系统 Meta 信息，维护账号、权限等安全信息，同时**提供全局授时服务**（即 `TSO`）。

- 日志节点（`CDC, Change Data Capture`，代码仓库：[polardbx-cdc](https://github.com/polardb/polardbx-cdc)）：

日志节点提供完全兼容 `MySQL Binlog` 格式和协议的增量订阅能力，提供兼容 `MySQL Replication` 协议的主从复制能力。

## PolarDB-X 开发环境搭建



## PolarDB-X 入门使用 & Debug






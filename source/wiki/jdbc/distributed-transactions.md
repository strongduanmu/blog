---
layout: wiki
wiki: jdbc
order: 013
title: 第十二章 分布式事务
date: 2022-02-29 11:15:27
comment_id: 'jdbc_distributed_transactions'
banner: /assets/banner/banner_9.jpg
---

分布式事务允许应用程序同时访问和更新多个数据源，同时保持事务的原子性、一致性、隔离性和持久性（`ACID`）特性。本章介绍 `JDBC API` 对分布式事务的支持。

## 12.1 基础设施

分布式事务需要以下基础设施角色：

- **事务管理器**：控制事务边界并管理两阶段提交协议，通常由 `JTA` 实现提供。
- **实现了 `XADataSource`、`XAConnection` 和 `XAResource` 的 `JDBC` 驱动程序**。
- **对应用程序可见的 `DataSource` 实现**：位于每个 `XADataSource` 之上，并与事务管理器交互；这部分通常由应用服务器提供。

图 12-1 展示了分布式事务的基础设施。

![图 12-1 分布式事务基础设施](/wiki/jdbc/distributed-transactions/figure-12-1-distributed-transaction-infrastructure.png)

**图 12-1 分布式事务基础设施**

## 12.2 `XADataSource` 和 `XAConnection`

`XADataSource` 接口是 `XAConnection` 对象的工厂。`XAConnection` 表示可以参与分布式事务的物理连接。

```java
// Create an XAConnection
XAConnection xac = xads.getXAConnection("user", "password");

// Get the XAResource
XAResource xar = xac.getXAResource();

// Get a logical Connection
Connection con = xac.getConnection();
```

### 12.2.1 部署 `XADataSource` 对象

`XADataSource` 对象通常由应用服务器完成配置和部署。

### 12.2.2 获取连接

应用程序通过 `XAConnection` 获取逻辑 `Connection` 对象，并由应用服务器负责与事务管理器协作。

## 12.3 `XAResource`

`XAResource` 接口定义了分布式事务使用的契约。它基于 `X/Open CAE` 规范。`XAResource` 的关键方法包括：

- `start`：开始一个事务分支上的工作。
- `end`：结束一个事务分支上的工作。
- `prepare`：为提交事务作准备。
- `commit`：提交事务。
- `rollback`：回滚事务。

## 12.4 事务管理

### 12.4.1 两阶段提交

两阶段提交协议用于保证分布式事务的原子性：

1. **准备阶段**：事务管理器询问所有资源管理器是否已准备好提交。
2. **提交阶段**：如果所有资源管理器都准备就绪，事务管理器就通知它们执行提交。

## 12.5 关闭连接

当应用程序完成分布式事务工作后，应关闭逻辑连接。底层物理连接可能会被返回到连接池中，而不是立即断开。

## 12.6 `XAResource` 接口的限制

`XAResource` 接口存在一些限制：

- 不支持嵌套事务。
- 同一个事务分支不能跨多个线程共享。
- 某些数据库可能并不完整支持 `XA` 规范。

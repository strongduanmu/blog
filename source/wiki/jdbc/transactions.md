---
layout: wiki
wiki: jdbc
order: 011
title: 第十章 事务
date: 2022-02-29 11:15:27
comment_id: 'jdbc_transactions'
banner: /assets/banner/banner_9.jpg
---

事务用于在并发访问时保证数据完整性、应用程序语义的正确性，以及数据视图的一致性。所有符合 JDBC 规范的驱动程序都必须支持事务。JDBC API 的事务管理遵循 SQL:2003 规范，涉及以下概念：

- 自动提交模式
- 事务隔离级别
- 保存点

本章介绍与单个 `Connection` 对象关联的事务语义。涉及多个 `Connection` 对象的事务在第 12 章“分布式事务”中讨论。

## 10.1 事务边界和自动提交

何时开始一个新事务，通常由 JDBC 驱动程序或底层数据源隐式决定。尽管某些数据源实现了显式的 `"begin transaction"` 语句，但 JDBC API 并没有提供与之完全对应的显式开启事务方法。通常，当当前 SQL 语句需要事务且尚未存在事务时，就会启动一个新事务。某条 SQL 语句是否需要事务，也由 SQL:2003 作出规定。

`Connection` 的 `auto-commit` 属性决定事务何时结束。启用自动提交后，每条 SQL 语句完成时都会立即提交事务。语句何时算作“完成”，取决于语句类型，以及应用程序在执行语句后的操作：

- 对于数据操作语言（`DML`）语句（例如 `INSERT`、`UPDATE`、`DELETE`）以及 `DDL` 语句，语句在执行结束后即可视为完成。
- 对于 `SELECT` 语句，语句在其关联的结果集关闭时才视为完成。
- 对于 `CallableStatement` 对象或返回多个结果的语句，语句在所有关联的结果集都已关闭，并且所有更新计数和输出参数都已检索时完成。

### 10.1.1 禁用自动提交模式

代码示例 10-1 展示了如何关闭自动提交。

```java
// Assume con is a Connection object
con.setAutoCommit(false);
```

**代码示例 10-1 设置自动提交为关闭**

关闭自动提交后，每个事务都必须通过 `Connection.commit` 显式提交，或通过 `Connection.rollback` 显式回滚。这适用于由驱动程序上层管理事务的场景，例如：

- 当应用程序需要将多个 SQL 语句分组到单个事务中时
- 当事务由应用服务器管理时

在某些场景下，关闭自动提交还可能改善性能。

## 10.2 事务隔离级别

事务隔离级别定义了当前事务与其他事务所做更新之间的隔离程度。JDBC API 定义了以下事务隔离级别：

| 隔离级别 | 描述 |
|----------|------|
| `TRANSACTION_NONE` | 表示驱动程序不支持事务 |
| `TRANSACTION_READ_UNCOMMITTED` | 允许脏读、不可重复读和幻读 |
| `TRANSACTION_READ_COMMITTED` | 防止脏读，但允许不可重复读和幻读 |
| `TRANSACTION_REPEATABLE_READ` | 防止脏读和不可重复读，但允许幻读 |
| `TRANSACTION_SERIALIZABLE` | 防止脏读、不可重复读和幻读 |

### 10.2.1 使用 `setTransactionIsolation` 方法

`Connection` 接口提供了 `setTransactionIsolation` 方法来设置隔离级别。

```java
con.setTransactionIsolation(Connection.TRANSACTION_SERIALIZABLE);
```

### 10.2.2 性能考虑

更高的隔离级别通常会带来更大的性能开销，因为它们往往需要更多锁和更多系统资源。应用程序应当在数据一致性要求与系统性能之间做好权衡。

## 10.3 保存点

保存点用于在事务中设置标记，使应用程序能够将事务部分回滚到指定位置。

### 10.3.1 设置和回滚到保存点

```java
// Set a savepoint
Savepoint savepoint = con.setSavepoint("SAVEPOINT_1");

// ... execute some SQL statements ...

// Rollback to the savepoint
con.rollback(savepoint);
```

### 10.3.2 释放保存点

```java
// Release a savepoint
con.releaseSavepoint(savepoint);
```

保存点一旦释放就不能再用于回滚。

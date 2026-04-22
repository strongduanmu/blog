---
layout: wiki
wiki: jdbc
order: 012
title: 第十一章 连接池
date: 2022-02-29 11:15:27
comment_id: 'jdbc_connection_pooling'
banner: /assets/banner/banner_9.jpg
---

连接池支持对物理连接进行缓存和重用，从而提高应用程序的性能与可扩展性。本章描述了 `JDBC API` 对连接池的支持。

## 11.1 `ConnectionPoolDataSource` 和 `PooledConnection`

通常由 `JDBC` 驱动程序实现 `ConnectionPoolDataSource` 接口，而应用服务器则通过它获取 `PooledConnection` 对象。

`PooledConnection` 对象表示到数据源的物理连接。应用程序本身并不会直接使用 `PooledConnection`，而是使用从它获取的逻辑 `Connection` 对象。

```java
// Create a PooledConnection
PooledConnection pc = cpds.getPooledConnection("user", "password");

// Get a logical Connection
Connection con = pc.getConnection();
```

图 11-1 展示了连接池的整体结构。

![图 11-1 连接池](/wiki/jdbc/connection-pooling/figure-11-1-connection-pooling.png)

**图 11-1 连接池**

## 11.2 连接事件

当应用程序调用 `Connection.close` 时，逻辑连接会被关闭，但底层物理连接不会被真正关闭，而是返回连接池以供复用。为了让连接池管理器能够得知这些状态变化，`JDBC` 使用 `JavaBeans` 风格的事件通知机制。

当连接事件发生时，例如逻辑连接被关闭或物理连接发生严重错误时，`PooledConnection` 会通知已注册的 `ConnectionEventListener`。

```java
// Add a connection event listener
pc.addConnectionEventListener(new MyConnectionEventListener());
```

## 11.3 三层环境中的连接池

在三层环境中，连接池通常由中间层服务器管理。应用服务器会向客户端暴露一个实现了 `DataSource` 的对象，从而将连接池机制对应用程序透明化。

## 11.4 `DataSource` 实现与连接池

支持连接池的 `DataSource` 实现会在内部管理一组物理连接。当应用程序调用 `getConnection` 时，它拿到的是逻辑连接，而不是直接持有池中的物理连接对象。

## 11.5 部署

`ConnectionPoolDataSource` 对象通常由应用服务器进行配置与部署。客户端应用程序通常只需要通过 `JNDI` 或其他命名服务查找到相应的 `DataSource`，而不需要直接感知底层连接池实现。

## 11.6 池化连接的语句重用

`JDBC API` 还支持在池化连接之上复用语句对象，尤其是 `PreparedStatement`。这一机制可以减少重复创建预处理语句带来的成本。

图 11-2 展示了池化连接重用 `PreparedStatement` 的逻辑视图。

![图 11-2 池化连接重用预处理语句的逻辑视图](/wiki/jdbc/connection-pooling/figure-11-2-pooled-statements.png)

**图 11-2 池化连接重用预处理语句的逻辑视图**

### 11.6.1 使用池化语句

```java
// Get a pooled connection
PooledConnection pc = cpds.getPooledConnection();
Connection con = pc.getConnection();

// Prepare a statement
PreparedStatement pstmt = con.prepareStatement("SELECT * FROM employees");

// Use the statement
ResultSet rs = pstmt.executeQuery();

// Close the logical connection (statement may be reused)
con.close();
```

应用程序可以通过 `DatabaseMetaData.supportsStatementPooling` 判断数据源是否支持语句池化。如果返回值为 `true`，应用程序就可以在性能敏感场景中更有信心地使用 `PreparedStatement`。

### 11.6.2 关闭池化语句

应用程序关闭池化语句的方式，与关闭普通语句完全相同。对于应用程序来说，语句是否参与池化通常是透明的。逻辑语句关闭后，底层物理语句可能会被返回到池中，以供后续复用。

## 11.7 语句事件

`StatementEvent` 类表示与预处理语句池相关的事件。当语句被关闭或由于错误失效时，驱动程序可以触发相应事件，并由 `StatementEventListener` 接收通知。

## 11.8 `ConnectionPoolDataSource` 属性

`ConnectionPoolDataSource` 接口定义了以下标准属性：

| 属性名 | 类型 | 描述 |
|--------|------|------|
| `maxStatements` | `int` | 可以池化的最大语句数 |
| `initialPoolSize` | `int` | 池的初始大小 |
| `minPoolSize` | `int` | 池的最小大小 |
| `maxPoolSize` | `int` | 池的最大大小 |
| `maxIdleTime` | `int` | 空闲连接在被丢弃前允许保持空闲的最大秒数 |
| `propertyCycle` | `int` | 属性检查周期，以秒为单位 |

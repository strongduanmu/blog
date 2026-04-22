---
layout: wiki
wiki: jdbc
order: 004
title: 第三章 新特性摘要
date: 2022-02-29 11:15:27
comment_id: 'jdbc_summary_of_new_features'
banner: /assets/banner/banner_9.jpg
---

## 3.1 变更概述

`JDBC 4.2 API` 在以下领域引入了新内容和变更：

### 新增功能

#### `REF CURSOR` 支持
多个数据库支持 `REF CURSOR` 数据类型，用于从存储过程返回结果集。`JDBC` 4.2 增加了对 `REF CURSOR` 数据类型的支持。

#### 大更新计数支持
此前，返回更新计数的 `JDBC` 方法通常返回 `int` 值。随着数据规模不断增长，这在某些环境中已经不足以表达真实结果。`JDBC` 4.2 因此增加了对大更新计数的支持。

#### `java.sql.DriverAction` 接口
该接口可由希望在被 `DriverManager` 注销时收到通知的驱动程序实现。

#### `java.sql.SQLType` 接口
用于创建表示通用 `SQL` 类型（称为 `JDBC` 类型或供应商特定类型）的对象的接口。

#### `java.sql.JDBCType` 枚举
用于标识通用 `SQL` 类型的枚举，称为 `JDBCType`。目的是使用 `JDBCType` 代替 `Types.java` 中定义的常量。

### 新增类型映射

#### 表 `B-4` 新增映射（从 `Java` 对象到 `JDBC` 类型的映射）

- 添加了 `java.time.LocalDate` 到 `JDBC DATE` 的映射支持
- 添加了 `java.time.LocalTime` 到 `JDBC TIME` 的映射支持
- 添加了 `java.time.LocalDateTime` 到 `JDBC TIMESTAMP` 的映射支持
- 添加了 `java.time.OffsetTime` 到 `JDBC TIME_WITH_TIMEZONE` 的映射支持
- 添加了 `java.time.OffsetDateTime` 到 `JDBC TIMESTAMP_WITH_TIMEZONE` 的映射支持

#### 表 `B-5` 新增映射（`setObject` 和 `setNull` 在 `Java` 对象类型和目标 `JDBC` 类型之间的转换）

- 允许 `java.time.LocalDate` 转换为 `CHAR`、`VARCHAR`、`LONGVARCHAR` 和 `DATE`
- 允许 `java.time.LocalTime` 转换为 `CHAR`、`VARCHAR`、`LONGVARCHAR` 和 `TIME`
- 允许 `java.time.LocalDateTime` 转换为 `CHAR`、`VARCHAR`、`LONGVARCHAR` 和 `TIMESTAMP`
- 允许 `java.time.OffsetTime` 转换为 `CHAR`、`VARCHAR`、`LONGVARCHAR` 和 `TIME_WITH_TIMEZONE`
- 允许 `java.time.OffsetDateTime` 转换为 `CHAR`、`VARCHAR`、`LONGVARCHAR`、`TIME_WITH_TIMEZONE` 和 `TIMESTAMP_WITH_TIMEZONE`

#### 表 `B-6` 新增映射（使用 `ResultSet getter` 方法检索 `JDBC` 类型）

- 允许 `getObject` 返回 `TIME_WITH_TIMEZONE`、`TIMESTAMP_WITH_TIMEZONE`

## `JDBC API` 变更

以下是对现有 `JDBC` 接口的变更：

### `BatchUpdateException`
- 添加了新的构造函数以支持大更新计数
- 添加了 `getLargeUpdateCounts` 方法

### `Connection`
- 添加了 `abort`、`getNetworkTimeout`、`getSchema`、`setNetworkTimeout`、`setSchema` 方法
- 明确了 `getMapType`、`setSchema`、`setMapType` 方法

### `CallableStatement`
- 重载了 `registerOutParameter` 和 `setObject` 方法
- 明确了 `getObject` 方法

### `Date`
- 添加了 `toInstant`、`toLocalDate` 方法
- 重载了 `valueOf` 方法

### `DatabaseMetaData`
- 添加了 `supportsRefCursors`、`getMaxLogicalLobSize` 方法
- 明确了 `getIndexInfo` 方法

### `Driver`
- 明确了 `acceptsURL` 和 `connect` 方法

### `DriverManager`
- 重载了 `registerDriver` 方法
- 明确了 `getConnection`、`deregisterDriver` 和 `registerDriver` 方法

### `PreparedStatement`
- 添加了 `executeLargeUpdate` 方法
- 重载了 `setObject` 方法

### `ResultSet`
- 重载了 `updateObject` 方法
- 明确了 `getObject` 方法

### `Statement`
- 添加了 `executeLargeBatch`、`executeLargeUpdate`、`getLargeUpdateCount`、`getLargeMaxRows` 和 `setLargeMaxRows` 方法
- 明确了 `setEscapeProcessing` 方法

### `SQLInput`
- 添加了 `readObject` 方法

### `SQLOutput`
- 添加了 `writeObject` 方法

### `Time`
- 添加了 `toInstant`、`toLocalTime` 方法
- 重载了 `valueOf` 方法

### `Timestamp`
- 添加了 `from`、`toInstant`、`toLocalDateTime` 方法
- 重载了 `valueOf` 方法

### `Types`
- 添加了 `REF_CURSOR`、`TIME_WITH_TIMEZONE` 和 `TIMESTAMP_WITH_TIMEZONE` 类型

### `SQLXML`
- 明确了 `getSource` 和 `setResult` 方法

### `DataSource` 和 `XADataSource`
- 明确了必须提供无参构造函数

有关受这些变更影响的类和接口列表，请参见第 5 章“类和接口”。

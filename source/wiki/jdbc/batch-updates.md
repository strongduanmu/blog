---
layout: wiki
wiki: jdbc
order: 015
title: 第十四章 批处理更新
date: 2022-02-29 11:15:27
comment_id: 'jdbc_batch_updates'
banner: /assets/banner/banner_9.jpg
---

批处理更新允许将多个更新操作作为一个单元提交给数据源，这可以显著提高性能。

## 14.1 批处理更新描述

批处理更新机制允许应用程序将多个 `SQL` 语句组合成一个批次，并将它们作为一个单元发送到数据源。

### 14.1.1 语句

`Statement` 对象可以使用 `addBatch` 方法添加多个 `SQL` 语句。

```java
Statement stmt = con.createStatement();
stmt.addBatch("INSERT INTO employees VALUES (1, 'John')");
stmt.addBatch("INSERT INTO employees VALUES (2, 'Jane')");
stmt.addBatch("INSERT INTO employees VALUES (3, 'Bob')");
int[] updateCounts = stmt.executeBatch();
```
### 14.1.2 成功执行

当批处理成功执行时，`executeBatch` 方法返回一个更新计数数组，指示每个命令影响的行数。

### 14.1.3 执行期间处理失败

如果批处理中的某个命令失败，将抛出 `BatchUpdateException`。此异常包含一个更新计数数组，指示在失败之前成功执行的命令的结果。

```java
try {
    int[] updateCounts = stmt.executeBatch();
} catch (BatchUpdateException bue) {
    int[] updateCounts = bue.getUpdateCounts();
    // Handle the failure
}
```
### 14.1.4 `PreparedStatement` 对象

`PreparedStatement` 对象也可以使用批处理更新。

```java
PreparedStatement pstmt = con.prepareStatement(
    "INSERT INTO employees VALUES (?, ?)"
);

pstmt.setInt(1, 1);
pstmt.setString(2, "John");
pstmt.addBatch();

pstmt.setInt(1, 2);
pstmt.setString(2, "Jane");
pstmt.addBatch();

int[] updateCounts = pstmt.executeBatch();
```
### 14.1.5 `CallableStatement` 对象

`CallableStatement` 对象支持批处理更新，但有一些限制。批处理中只能包含输出参数为注册为输出参数的调用。

## 14.2 批处理更新中的错误处理

当批处理更新中发生错误时，`JDBC` 驱动程序可能采用以下两种行为之一：

1. **继续处理** — 驱动程序继续处理剩余的命令
2. **停止处理** — 驱动程序在第一个错误后停止处理

`DatabaseMetaData.supportsBatchUpdates` 方法可用于确定驱动程序是否支持批处理更新。

## 14.3 大更新计数

`JDBC` 4.2 添加了对大更新计数的支持。当更新可能影响超过 `Integer.MAX_VALUE` 行时，应使用 `executeLargeBatch`、`getLargeUpdateCounts` 和 `getLargeUpdateCount` 方法。

```java
long[] largeUpdateCounts = stmt.executeLargeBatch();
```
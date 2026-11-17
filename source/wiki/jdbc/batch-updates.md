---
layout: wiki
wiki: jdbc
order: 015
title: 第十四章 批处理更新
date: 2022-02-29 11:15:27
comment_id: 'jdbc_batch_updates'
banner: /assets/banner/banner_9.jpg
---

批处理更新将多个更新操作作为一个单元提交给数据源，可以显著提高性能。

## 14.1 批处理更新描述

应用程序可以将多条 SQL 语句加入同一个批次，再将整个批次作为一个单元发送给数据源。

### 14.1.1 语句

调用 `Statement.addBatch`，可以依次将多条 SQL 语句加入批次。

```java
Statement stmt = con.createStatement();
stmt.addBatch("INSERT INTO employees VALUES (1, 'John')");
stmt.addBatch("INSERT INTO employees VALUES (2, 'Jane')");
stmt.addBatch("INSERT INTO employees VALUES (3, 'Bob')");
int[] updateCounts = stmt.executeBatch();
```

### 14.1.2 成功执行

批次执行成功后，`executeBatch` 返回更新计数数组，表示各条命令影响的行数。

### 14.1.3 处理执行失败

批次中的某条命令执行失败时，会抛出 `BatchUpdateException`。异常中的更新计数数组记录了失败前已成功执行的命令的结果。

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

`CallableStatement` 支持批处理更新，但批次中的存储过程调用只能使用输入参数，或不带任何参数。

## 14.2 批处理更新中的错误处理

批处理更新发生错误时，JDBC 驱动程序可能采用以下两种处理方式之一：

1. **继续处理** — 驱动程序继续处理剩余的命令
2. **停止处理** — 驱动程序在第一个错误后停止处理

`DatabaseMetaData.supportsBatchUpdates` 方法可用于确定驱动程序是否支持批处理更新。

## 14.3 大更新计数

JDBC 4.2 添加了对大更新计数的支持。当更新可能影响的行数超过 `Integer.MAX_VALUE` 时，应当使用 `executeLargeBatch`、`getLargeUpdateCounts` 和 `getLargeUpdateCount` 等方法。

```java
long[] largeUpdateCounts = stmt.executeLargeBatch();
```

---
layout: wiki
wiki: jdbc
order: 008
title: 第七章 数据库元数据
date: 2022-02-29 11:15:27
comment_id: 'jdbc_database_metadata'
banner: /assets/banner/banner_9.jpg
---

`DatabaseMetaData` 接口提供有关数据源的信息。应用程序可以借此判断数据源是否支持某项能力或某组能力。例如，应用程序可以判断它是否支持可滚动结果集，或者是否支持使用 `Connection.commit` 和 `Connection.rollback`。应用程序还可以借助 `DatabaseMetaData` 接口了解：

- 数据源的限制
- 数据源中包含的 `SQL` 对象及其属性
- 数据源提供的事务支持

`DatabaseMetaData` 接口还定义了 40 多个字段，这些字段会作为多个 `DatabaseMetaData` 方法返回值中的常量使用。

本章概述 `DatabaseMetaData` 接口，并通过示例介绍元数据方法的分类，以及 `JDBC 4.2 API` 中新增或修改的方法。若需要完整定义，仍应参考 `JDBC API` 规范。

> **注意**：`JDBC` 还定义了 `ResultSetMetaData` 接口，该接口会在第 15 章“结果集”中介绍。

## 7.1 创建 `DatabaseMetaData` 对象

`DatabaseMetaData` 对象通过 `Connection` 的 `getMetaData` 方法创建。创建之后，应用程序就可以利用它动态发现底层数据源的信息。代码示例 7-1 展示了如何创建 `DatabaseMetaData` 对象，并用它查询表名允许的最大长度。

```java
// con is a Connection object
DatabaseMetaData dbmd = con.getMetaData();
int maxLen = dbmd.getMaxTableNameLength();
```

**代码示例 7-1 创建和使用 `DatabaseMetaData` 对象**

## 7.2 检索一般信息

有些 `DatabaseMetaData` 方法用于发现数据源的一般信息以及其实现细节，例如：

- `getURL`
- `getUserName`
- `getDatabaseProductVersion`、`getDriverMajorVersion` 和 `getDriverMinorVersion`
- `getSchemaTerm`、`getCatalogTerm` 和 `getProcedureTerm`
- `nullsAreSortedHigh` 和 `nullsAreSortedLow`
- `usesLocalFiles` 和 `usesLocalFilePerTable`
- `getSQLKeywords`

## 7.3 确定功能支持

大量 `DatabaseMetaData` 方法可用于判断驱动程序或底层数据源是否支持某个功能或某组功能。其中，一些方法只回答“是否支持”，另一些方法则描述支持级别。

用于判断单项能力是否受支持的方法示例包括：

- `supportsAlterTableWithDropColumn`
- `supportsBatchUpdates`
- `supportsTableCorrelationNames`
- `supportsPositionedDelete`
- `supportsFullOuterJoins`
- `supportsStoredProcedures`
- `supportsMixedCaseQuotedIdentifiers`

用于描述支持级别的方法示例包括：

- `supportsANSI92EntryLevelSQL`
- `supportsCoreSQLGrammar`

## 7.4 数据源限制

另一组方法用于返回数据源所施加的各种限制，例如：

- `getMaxRowSize`
- `getMaxStatementLength`
- `getMaxTablesInSelect`
- `getMaxConnections`
- `getMaxCharLiteralLength`
- `getMaxColumnsInTable`

这些方法通常返回 `int` 值。返回值为 `0` 表示没有限制，或者该限制未知。

## 7.5 `SQL` 对象及其属性

还有一些 `DatabaseMetaData` 方法用于返回给定数据源中的 `SQL` 对象信息，并描述这些对象的属性。这组方法通常返回 `ResultSet` 对象，其中每一行对应一个特定对象。例如，`getUDTs` 会返回一个 `ResultSet`，其中每一行都对应数据源中定义的一个 `UDT`。

这一类方法的示例包括：

- `getSchemas`
- `getCatalogs`
- `getTables`
- `getPrimaryKeys`
- `getProcedures`
- `getProcedureColumns`
- `getUDTs`
- `getFunctions`
- `getFunctionColumns`

从 `DatabaseMetaData` 方法返回的 `ResultSet` 对象具有 `TYPE_FORWARD_ONLY` 的结果集类型以及 `CONCUR_READ_ONLY` 的并发模式。可以通过 `ResultSet.getHoldability` 判断该 `ResultSet` 的保持性，因为默认保持性取决于具体实现。

`JDBC` 驱动程序供应商可以在标准列之外返回额外的列，但这些额外列必须通过列标签访问。这样一来，未来版本的 `JDBC` 规范就能够在不破坏现有应用程序的前提下，为现有 `DatabaseMetaData` 方法增加新列。

## 7.6 事务支持

少量方法用于描述数据源支持的事务语义，例如：

- `supportsMultipleTransactions`
- `getDefaultTransactionIsolation`

## 7.7 新方法

`JDBC 4.2 API` 引入了以下新的 `DatabaseMetaData` 方法：

- `supportsRefCursors`：用于指示驱动程序或底层数据源是否支持 `REF CURSOR`。
- `getMaxLogicalLobSize`：用于检索驱动程序所支持的最大逻辑 `LOB` 大小。

这些方法的完整定义可参见 `JDBC API` 规范中的 `javadoc`。

## 7.8 修改的方法

`JDBC 4.2 API` 修改了以下现有 `DatabaseMetaData` 方法的定义：

- `getIndexInfo`：返回结果中的 `CARDINALITY` 和 `PAGES` 列现在返回 `long` 值。

`JDBC 4.2 API` 规范中包含这些方法的更新定义。

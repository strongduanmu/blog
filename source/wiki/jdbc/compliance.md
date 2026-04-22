---
layout: wiki
wiki: jdbc
order: 007
title: 第六章 合规性
date: 2022-02-29 11:15:27
comment_id: 'jdbc_compliance'
banner: /assets/banner/banner_9.jpg
---

本章标识了 `JDBC` 驱动程序实现声称合规所需支持的功能。任何未标识的功能都被视为合规的可选项。

## 6.1 定义

为了避免歧义，我们在讨论合规性时将使用以下术语：

- **`JDBC` 驱动程序实现** — 支持 `JDBC` 技术的驱动程序及其底层数据源。驱动程序可以提供底层数据源未实现的功能支持。它还可以提供标准语法/语义与数据源实现的本机 `API` 之间的映射。

- **相关规范** — 本文档、`API` 规范和相关的 `SQL` 规范。如果某个功能在多个文档中描述，这也是优先级顺序。对于 `JDBC API`，它是 `SQL92` 加上 `SQL:2003` 和 `X/Open SQL CLI` 的相关部分。

- **支持的功能** — `JDBC API` 实现支持该功能的标准语法和语义（如相关规范中定义）的功能。

- **部分支持的功能** — 某些方法通过标准语法和语义实现，而某些必需方法抛出 `SQLFeatureNotSupportedException` 以表示不支持的功能。

- **扩展** — 任何相关规范未涵盖的功能，或已涵盖功能的非标准实现。

- **完全实现** — 用于描述接口的术语，其所有方法都已实现以支持相关规范中定义的语义。任何方法都不能因为未实现而抛出异常。

- **必须实现** — 必须实现的接口，尽管接口上的某些方法被视为可选。未实现的方法必须抛出 `SQLFeatureNotSupportedException` 以表示相应功能不受支持。

## 6.2 指南和要求

以下指南适用于 `JDBC` 合规性：

- `JDBC API` 实现必须支持 `Entry Level SQL92`，以及 `SQL` 命令 `DROP TABLE`（见下方注释）。`Entry Level SQL92` 代表了 `JDBC API` 实现必须支持的 `SQL` 能力基线。对于基于 `SQL99` 或 `SQL:2003` 的功能访问，也应以与相应规范兼容的方式提供。

- 驱动程序必须支持转义语法。转义语法在第 13 章"语句"中描述。

- 驱动程序必须支持事务。有关详细信息，请参阅第 10 章"事务"。

- 如果 `DatabaseMetaData` 方法指示支持给定功能，则必须通过相关规范中描述的标准语法和语义支持该功能，并满足第 31 页"`JDBC 4.2 API` 合规性"中概述的要求。如果与标准不同，这可能需要驱动程序提供到数据源本机 `API` 或 `SQL` 方言的映射。

  如果支持某个功能，则必须实现所有相关的元数据方法。例如，如果 `JDBC API` 实现支持 `RowSet` 接口，它还必须实现 `RowSetMetaData` 接口。

- 驱动程序应该提供对底层数据源实现的每个功能的访问，包括扩展 `JDBC API` 的功能。其意图是使用 `JDBC API` 的应用程序能够访问与本机应用程序相同的功能集。

- 如果 `JDBC` 驱动程序不支持或仅提供对可选功能的部分支持，则相应的 `DatabaseMetaData` 方法必须指示该功能不受支持。任何未实现功能的方法都必须抛出 `SQLFeatureNotSupportedException`。

> **注意** — `JDBC API` 实现需要支持 `SQL92 Transitional Level` 中定义的 `DROP TABLE` 命令。不过，对 `DROP TABLE` 的 `CASCADE` 和 `RESTRICT` 选项的支持是可选的。此外，当存在引用被删除表的视图或完整性约束时，`DROP TABLE` 的行为属于实现定义。

## 6.3 `JDBC 4.2 API` 合规性

符合 `JDBC` 规范的驱动程序必须执行以下操作：

- 遵守上述指南和要求

- 支持自动加载驱动程序的 `java.sql.Driver` 实现

- 支持 `TYPE_FORWARD_ONLY` 的 `ResultSet` 类型

- 支持 `CONCUR_READ_ONLY` 的 `ResultSet` 并发

- 支持批处理更新

- 完全实现以下接口：
  - `java.sql.DatabaseMetaData`
  - `java.sql.ParameterMetaData`
  - `java.sql.ResultSetMetaData`
  - `java.sql.Wrapper`

### 6.3.1 `DataSource` 接口要求

必须实现 `DataSource` 接口，但以下可选方法除外：
- `getParentLogger`

### 6.3.2 `Driver` 接口要求

必须实现 `Driver` 接口，但以下可选方法除外：
- `getParentLogger`

### 6.3.3 `Connection` 接口要求

必须实现 `Connection` 接口，但以下可选方法除外：
- `createArrayOf` — 除非驱动程序支持相关数据类型
- `createBlob` — 除非驱动程序支持相关数据类型
- `createClob` — 除非驱动程序支持相关数据类型
- `createNClob` — 除非驱动程序支持相关数据类型
- `createSQLXML` — 除非驱动程序支持相关数据类型
- `createStruct` — 除非驱动程序支持相关数据类型
- `getNetworkTimeout`
- `getTypeMap` — 除非驱动程序支持相关数据类型
- `setTypeMap` — 除非驱动程序支持相关数据类型
- `prepareStatement(String sql, int[] columnIndexes)`
- `prepareStatement(String sql, String[] columnNames)`
- `setSavepoint`
- `rollback(java.sql.Savepoint savepoint)`
- `releaseSavepoint`
- `setNetworkTimeout`

### 6.3.4 `Statement` 接口要求

必须实现 `Statement` 接口，但以下可选方法除外：
- `cancel`
- `execute(String sql, Statement.RETURN_GENERATED_KEYS)`
- `execute(String sql, int[] columnIndexes)`
- `execute(String sql, String[] columnNames)`
- `executeUpdate(String sql, Statement.RETURN_GENERATED_KEYS)`
- `executeUpdate(String sql, int[] columnIndexes)`
- `executeUpdate(String sql, String[] columnNames)`
- `getGeneratedKeys`
- `getMoreResults(Statement.KEEP_CURRENT_RESULT)` — 除非 `DatabaseMetaData.supportsMultipleOpenResults()` 返回 `true`
- `getMoreResults(Statement.CLOSE_ALL_RESULTS)` — 除非 `DatabaseMetaData.supportsMultipleOpenResults()` 返回 `true`
- `setCursorName`

### 6.3.5 `PreparedStatement` 接口要求

必须实现 `PreparedStatement` 接口，但以下可选方法除外：
- `prepareStatement(String sql, Statement.RETURN_GENERATED_KEYS)`
- `getMetaData`
- `setArray`, `setBlob`, `setClob`, `setNClob`, `setNCharacterStream`, `setNString`, `setRef`, `setRowId`, `setSQLXML` 和 `setURL` — 除非驱动程序支持相关数据类型
- `setNull(int parameterIndex, int sqlType, String typeName)` — 除非驱动程序支持相关数据类型
- `setUnicodeStream`
- 不带长度参数的 `setAsciiStream`, `setBinaryStream`, `setCharacterStream`, `setNCharacterStream`

### 6.3.6 `CallableStatement` 接口要求

如果 `DatabaseMetaData.supportsStoredProcedures()` 返回 `true`，则必须实现 `CallableStatement` 接口，但以下可选方法除外：
- `getArray`, `getBlob`, `getClob`, `getNClob`, `getNCharacterStream`, `getNString`, `getRef`, `getRowId`, `getSQLXML` 和 `getURL` — 除非驱动程序支持相关数据类型
- `getBigDecimal(int parameterIndex, int scale)`
- `getObject(int i, Class type)`
- `getObject(String colName, Class type)`
- `setArray`, `setBlob`, `setClob`, `setNClob`, `setNCharacterStream`, `setNString`, `setRef`, `setRowId`, `setSQLXML` 和 `setURL` — 除非驱动程序支持相关数据类型
- `setNull(int parameterIndex, int sqlType, String typeName)` — 除非驱动程序支持相关数据类型
- `setAsciiStream`, `setBinaryStream`, `setCharacterStream`, `setNCharacterStream` — 不带长度参数

### 6.3.7 `ResultSet` 接口要求

必须实现 `ResultSet` 接口，但以下可选方法除外：
- `getArray`, `getBlob`, `getClob`, `getNClob`, `getNCharacterStream`, `getNString`, `getRef`, `getRowId`, `getSQLXML` 和 `getURL` — 除非驱动程序支持相关数据类型
- `getBigDecimal(int columnIndex, int scale)`
- `getUnicodeStream`
- `getObject(int i, Class type)`
- `getObject(String colName, Class type)`
- 不带长度参数的 `updateAsciiStream`, `updateBinaryStream`, `updateCharacterStream`, `updateNCharacterStream`

## 6.4 `Java EE JDBC` 合规性

`Java EE JDBC` 合规性包括 `JDBC API` 合规性，并额外增加以下要求：

- 必须完全实现以下接口：
  - `javax.sql.DataSource`
  - `javax.sql.ConnectionPoolDataSource`
  - `javax.sql.XADataSource`

- 必须完全实现以下接口：
  - `javax.sql.PooledConnection`
  - `javax.sql.XAConnection`

- 如果实现 `RowSet` 接口，则必须完全实现 `javax.sql.RowSetMetaData`。

`JDBC` 3.0 之前定义的类和接口必须继续支持使用它们的应用程序。向后兼容性的详细信息在 `J2SE` 平台规范中提供。

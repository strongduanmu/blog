---
layout: wiki
wiki: jdbc
order: 007
title: 第六章 合规性
date: 2022-02-29 11:15:27
comment_id: 'jdbc_compliance'
banner: /assets/banner/banner_9.jpg
---

本章明确 JDBC 驱动程序实现声明符合规范时必须支持的功能。未列为必需项的功能，均视为合规性要求中的可选项。

## 6.1 定义

为避免歧义，本章使用以下术语讨论合规性：

- **JDBC 驱动程序实现** — 指 JDBC 驱动程序及其底层数据源。驱动程序可以补充底层数据源尚未实现的功能，也可以在标准语法、语义与数据源的本地 API 之间提供映射。

- **相关规范** — 指本文档、API 规范和相关 SQL 规范。同一功能在多个文档中都有描述时，也按这个顺序确定优先级。对于 JDBC API，相关 SQL 规范包括 SQL92，以及 SQL:2003 和 X/Open SQL CLI 的相关部分。

- **支持的功能** — 指 JDBC API 实现能够按照相关规范定义的标准语法和语义提供的功能。

- **部分支持的功能** — 指部分方法按照标准语法和语义实现，但另一些必需方法通过抛出 `SQLFeatureNotSupportedException` 表示不支持相应功能。

- **扩展** — 任何相关规范未涵盖的功能，或已涵盖功能的非标准实现。

- **完全实现** — 用于描述接口，表示接口中的所有方法均已实现，并支持相关规范定义的语义。任何方法都不能以尚未实现为由抛出异常。

- **必须实现** — 表示该接口必须提供实现，但其中某些方法可以是可选的。未实现的方法必须抛出 `SQLFeatureNotSupportedException`，表明不支持相应功能。

## 6.2 指南和要求

以下指南适用于 JDBC 合规性：

- JDBC API 实现必须支持 Entry Level SQL92，以及 SQL 命令 `DROP TABLE`（见下方注释）。Entry Level SQL92 代表了 JDBC API 实现必须支持的 SQL 能力基线。对于基于 SQL99 或 SQL:2003 的功能访问，也应以与相应规范兼容的方式提供。

- 驱动程序必须支持转义语法。转义语法在第 13 章“语句”中描述。

- 驱动程序必须支持事务。有关详细信息，请参阅第 10 章“事务”。

- 如果 `DatabaseMetaData` 方法表明支持某项功能，实现就必须按照相关规范定义的标准语法和语义提供该功能，并满足第 6.3 节“JDBC 4.2 API 合规性”的要求。当数据源的本地 API 或 SQL 方言与标准不一致时，驱动程序可能需要提供相应映射。

  如果支持某个功能，则必须实现所有相关的元数据方法。例如，如果 JDBC API 实现支持 `RowSet` 接口，它还必须实现 `RowSetMetaData` 接口。

- 驱动程序应当允许应用程序访问底层数据源提供的每一项功能，包括超出 JDBC API 范围的扩展功能。这样，JDBC 应用程序就能够获得与本地应用程序相同的功能集。

- 如果 JDBC 驱动程序不支持某项可选功能，或只提供部分支持，相应的 `DatabaseMetaData` 方法必须报告不支持该功能。未实现的方法必须抛出 `SQLFeatureNotSupportedException`。

> **注意** — JDBC API 实现需要支持 SQL92 Transitional Level 中定义的 `DROP TABLE` 命令。不过，对 `DROP TABLE` 的 `CASCADE` 和 `RESTRICT` 选项的支持是可选的。此外，当存在引用被删除表的视图或完整性约束时，`DROP TABLE` 的行为属于实现定义。

## 6.3 JDBC 4.2 API 合规性

符合 JDBC 规范的驱动程序必须满足以下要求：

- 遵守上述指南和要求

- 支持自动加载驱动程序的 `java.sql.Driver` 实现

- 支持 `TYPE_FORWARD_ONLY` 的 `ResultSet` 类型

- 支持 `CONCUR_READ_ONLY` 的 `ResultSet` 并发模式

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

`Java EE JDBC` 合规性包括 JDBC API 合规性，并额外增加以下要求：

- 必须完全实现以下接口：
  - `javax.sql.DataSource`
  - `javax.sql.ConnectionPoolDataSource`
  - `javax.sql.XADataSource`

- 必须完全实现以下接口：
  - `javax.sql.PooledConnection`
  - `javax.sql.XAConnection`

- 如果实现 `RowSet` 接口，则必须完全实现 `javax.sql.RowSetMetaData`。

JDBC 3.0 之前定义的类和接口必须继续支持使用它们的应用程序。向后兼容性的详细要求见 J2SE 平台规范。

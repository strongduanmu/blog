---
layout: wiki
wiki: jdbc
order: 006
title: 第五章 类和接口
date: 2022-02-29 11:15:27
comment_id: 'jdbc_classes_and_interfaces'
banner: /assets/banner/banner_9.jpg
---

以下类和接口构成了 `JDBC API`。

## 5.1 `java.sql` 包

`JDBC API` 的核心包含在 `java.sql` 包中。`java.sql` 中的枚举、类和接口如下所示。枚举和类以粗体显示；接口以普通样式显示。

- `java.sql.Array`
- `java.sql.BatchUpdateException`
- `java.sql.Blob`
- `java.sql.CallableStatement`
- `java.sql.Clob`
- `java.sql.ClientInfoStatus`
- `java.sql.Connection`
- `java.sql.DataTruncation`
- `java.sql.DatabaseMetaData`
- `java.sql.Date`
- `java.sql.Driver`
- `java.sql.DriverAction`
- `java.sql.DriverManager`
- `java.sql.DriverPropertyInfo`
- **`java.sql.JDBCType`**
- `java.sql.NClob`
- `java.sql.ParameterMetaData`
- `java.sql.PreparedStatement`
- `java.sql.PseudoColumnUsage`
- `java.sql.Ref`
- `java.sql.ResultSet`
- `java.sql.ResultSetMetaData`
- `java.sql.RowId`
- `java.sql.RowIdLifeTime`
- `java.sql.Savepoint`
- `java.sql.SQLClientInfoException`
- `java.sql.SQLData`
- `java.sql.SQLDataException`
- `java.sql.SQLException`
- `java.sql.SQLFeatureNotSupportedException`
- `java.sql.SQLInput`
- `java.sql.SQLIntegrityConstraintViolationException`
- `java.sql.SQLInvalidAuthorizationSpecException`
- `java.sql.SQLNonTransientConnectionException`
- `java.sql.SQLNonTransientException`
- `java.sql.SQLOutput`
- `java.sql.SQLPermission`
- `java.sql.SQLSyntaxErrorException`
- `java.sql.SQLTimeoutException`
- `java.sql.SQLTransactionRollbackException`
- `java.sql.SQLTransientConnectionException`
- `java.sql.SQLTransientException`
- **`java.sql.SQLType`**
- `java.sql.SQLXML`
- `java.sql.SQLWarning`
- `java.sql.Statement`
- `java.sql.Struct`
- `java.sql.Time`
- `java.sql.Timestamp`
- `java.sql.Types`
- `java.sql.Wrapper`

以下类和接口在 `JDBC 4.2 API` 中是新增或更新的，其中新增项以粗体突出显示：

- `java.sql.BatchUpdateException`
- `java.sql.CallableStatement`
- `java.sql.Connection`
- `java.sql.DatabaseMetaData`
- `java.sql.Date`
- `java.sql.Driver`
- **`java.sql.DriverAction`**
- `java.sql.DriverManager`
- **`java.sql.JDBCType`**
- `java.sql.SQLPermission`
- `java.sql.PreparedStatement`
- `java.sql.ResultSet`
- `java.sql.SQLInput`
- `java.sql.SQLOutput`
- **`java.sql.SQLType`**
- `java.sql.SQLXML`
- `java.sql.Statement`
- `java.sql.Types`
- `java.sql.Timestamp`
- `javax.sql.XADataSource`

图 5-1 展示了 `java.sql` 包中主要类和接口之间的关系。

![图 5-1 `java.sql` 包中主要类和接口之间的关系](/wiki/jdbc/classes-and-interfaces/figure-5-1-java-sql-relationships.png)

**图 5-1 `java.sql` 包中主要类和接口之间的关系**

## 5.2 `javax.sql` 包

以下列表包含 `javax.sql` 包中的类和接口。类以粗体突出显示；接口以普通样式显示。

- `javax.sql.CommonDataSource`
- **`javax.sql.ConnectionEvent`**
- `javax.sql.ConnectionEventListener`
- `javax.sql.ConnectionPoolDataSource`
- `javax.sql.DataSource`
- `javax.sql.PooledConnection`
- `javax.sql.RowSet`
- **`javax.sql.RowSetEvent`**
- `javax.sql.RowSetInternal`
- `javax.sql.RowSetListener`
- `javax.sql.RowSetMetaData`
- `javax.sql.RowSetReader`
- `javax.sql.RowSetWriter`
- **`javax.sql.StatementEvent`**
- `javax.sql.StatementEventListener`
- `javax.sql.XAConnection`
- `javax.sql.XADataSource`

> **注意**：`javax.sql` 包中的类和接口最初作为 `JDBC 2.0 Optional Package` 提供。此前，该可选包与作为 `J2SE 1.2` 一部分的 `java.sql` 包是分开的。从 `J2SE 1.4` 开始，这两个包都成为了 `Java SE` 的组成部分。

图 5-2、图 5-3、图 5-4 和图 5-5 分别展示了 `DataSource` 对象、连接池、分布式事务和 `RowSet` 相关的主要关系。

![图 5-2 `javax.sql.DataSource` 和 `java.sql.Connection` 之间的关系](/wiki/jdbc/classes-and-interfaces/figure-5-2-datasource-connection.png)

**图 5-2 `javax.sql.DataSource` 和 `java.sql.Connection` 之间的关系**

![图 5-3 连接池涉及的关系](/wiki/jdbc/classes-and-interfaces/figure-5-3-connection-pooling.png)

**图 5-3 连接池涉及的关系**

![图 5-4 分布式事务支持涉及的关系](/wiki/jdbc/classes-and-interfaces/figure-5-4-distributed-transactions.png)

**图 5-4 分布式事务支持涉及的关系**

![图 5-5 `RowSet` 关系](/wiki/jdbc/classes-and-interfaces/figure-5-5-rowset-relationships.png)

**图 5-5 `RowSet` 关系**

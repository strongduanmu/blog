---
layout: wiki
wiki: jdbc
order: 009
title: 第八章 异常
date: 2022-02-29 11:15:27
comment_id: 'jdbc_exceptions'
banner: /assets/banner/banner_9.jpg
---

`SQLException` 类及其子类型提供有关访问数据源时发生的错误和警告的信息。

## 8.1 `SQLException`

当与数据源交互期间发生错误时，会抛出 `SQLException` 实例。该异常包含以下信息：

- **错误的文本描述** — 包含描述的 `String` 可以通过调用 `SQLException.getMessage` 方法检索。

- **`SQLState`** — 包含 `SQLState` 的 `String` 可以通过调用 `SQLException.getSQLState` 方法检索。`SQLState` 字符串的值将取决于设置该值的底层数据源。`X/Open` 和 `SQL:2003` 都定义了 `SQLState` 值以及应该设置它们的条件。尽管这些值集有重叠，但 `SQL:2003` 定义的值不是 `X/Open` 的超集。`DatabaseMetaData` 方法 `getSQLStateType` 允许应用程序确定数据源返回的 `SQLState` 是 `X/Open` 还是 `SQL:2003`。

- **错误代码** — 这是一个整数值，用于标识导致抛出 `SQLException` 的错误。其值和含义是实现特定的，可能是底层数据源返回的实际错误代码。可以使用 `SQLException.getErrorCode` 方法检索错误代码。

- **原因** — 这是导致此 `SQLException` 发生的另一个 `Throwable`。

- **对任何"链式"异常的引用** — 如果发生多个错误，则通过此链引用异常。可以通过对抛出的异常递归调用 `SQLException.getNextException` 方法来检索所有链式异常。如果没有更多异常被链接，`getNextException` 方法返回 `null`。

`SQLException` 有多个子类，将在第 8-48 页的 8.5 节"分类 `SQLException`"中描述。

### 8.1.1 支持 `Java SE` 链式异常

`SQLException` 类及其子类已被增强以支持 `Java SE` 链式异常功能，也称为原因功能。支持此功能的更改包括：

- 添加了四个构造函数以支持 `cause` 参数
- 向 `SQLException` 类添加了支持，以支持 `J2SE` 5.0 中引入的增强 `For-Each` 循环，允许导航 `SQLException` 及其原因关系，而无需在每次调用 `getNextException` 后调用 `getCause`
- `getCause` 方法可能返回非 `SQLException` 以及 `SQLException`

有关其他信息，请参阅 `JDBC API` 规范。

### 8.1.2 导航 `SQLException`

在执行 `SQL` 语句期间可能会发生一个或多个异常，每个异常都有自己的潜在因果关系。这意味着当 `JDBC` 应用程序捕获 `SQLException` 时，可能存在其他 `SQLException` 链接到原始抛出的 `SQLException`。要访问其他链式 `SQLException`，应用程序将递归调用 `getNextException` 直到返回 `null` 值。

`SQLException` 可能具有因果关系，由一个或多个导致抛出 `SQLException` 的 `Throwable` 组成。您可以递归调用方法 `SQLException.getCause`，直到返回 `null` 值，以导航原因链。

以下代码演示了应用程序如何导航 `SQLException` 及其原因。

```java
catch(SQLException ex) {
    while(ex != null) {
        System.out.println("SQLState:" + ex.getSQLState());
        System.out.println("Error Code:" + ex.getErrorCode());
        System.out.println("Message:" + ex.getMessage());
        Throwable t = ex.getCause();
        while(t != null) {
            System.out.println("Cause:" + t);
            t = t.getCause();
        }
        ex = ex.getNextException();
    }
}
```
**代码示例 8-1 导航 `SQLException` 和原因**

### 8.1.2.1 使用 `For-Each` 循环处理 `SQLException`

`JDBC` 应用程序可以使用 `Java SE` `For-Each` 循环增强来导航 `SQLException` 及其原因关系。

以下代码演示了如何将 `For-Each` 循环与 `SQLException` 一起使用。

```java
catch(SQLException ex) {
    for(Throwable e : ex ) {
        System.out.println("Error encountered: " + e);
    }
}
```
**代码示例 8-2 使用 `For-Each` 循环处理 `SQLException`**

## 8.2 `SQLWarning`

`SQLWarning` 是 `SQLException` 的子类。如果以下接口中的方法遇到数据库访问警告，将生成 `SQLWarning` 对象：

- `Connection`
- `DataSet`
- `Statement`
- `ResultSet`

当方法生成 `SQLWarning` 对象时，不会通知调用者发生了数据访问警告。必须在适当的对象上调用 `getWarnings` 方法来检索 `SQLWarning` 对象。但是，在某些情况下可能会抛出 `SQLWarning` 的 `DataTruncation` 子类，有关更多详细信息，请参阅第 8-46 页的 8.3 节"`DataTruncation`"。

如果发生多个数据访问警告，它们将链接到第一个警告，并且可以通过递归调用 `SQLWarning.getNextWarning` 方法来检索。如果链中没有更多警告，`getNextWarning` 返回 `null`。

后续的 `SQLWarning` 对象将继续添加到链中，直到执行下一个语句，或者对于 `ResultSet` 对象，当游标重新定位时，此时将删除链中的所有 `SQLWarning` 对象。

## 8.3 `DataTruncation`

`DataTruncation` 类是 `SQLWarning` 的子类，在数据被截断时提供信息。当在写入数据源时发生数据截断时，将抛出 `DataTruncation` 对象。即使生成了警告，被截断的数据值也可能已写入数据源。当在从数据源读取时发生数据截断时，将报告 `SQLWarning`。

`DataTruncation` 对象包含以下信息：

- 描述性 `String` "Data `truncation`"
- 当从数据源读取时发生数据截断时的 `SQLState` "01004"
- 当向数据源写入时发生数据截断时的 `SQLState` "22001"
- 一个布尔值，指示是截断了列值还是参数。如果截断了参数，`DataTruncation.getParameter` 方法返回 `true`；如果截断了列值，则返回 `false`。
- 一个 int，给出被截断的列或参数的索引。如果列或参数的索引未知，`DataTruncation.getIndex` 方法返回 -1。如果索引未知，`DataTruncation.getParameter` 和 `DataTruncation.getRead` 方法返回的值未定义。
- 一个布尔值，指示截断是发生在读取还是写入操作上。如果截断发生在读取上，`DataTruncation.getRead` 方法返回 `true`；如果截断发生在写入上，则返回 `false`。
- `DataTruncation.getDataSize` 方法返回一个 int，表示应该传输的数据字节数。如果正在执行数据转换，此数字可能是近似的。如果大小未知，该值可能是 -1。
- 一个 int，指示实际传输的字节数。`DataTruncation.getTransferSize` 方法返回实际传输的字节数，如果字节数未知则返回 -1。

### 8.3.1 静默截断

`Statement.setMaxFieldSize` 方法允许设置最大大小（以字节为单位）。此限制仅适用于 `BINARY`、`VARBINARY`、`LONGVARBINARY`、`CHAR`、`VARCHAR`、`LONGVARCHAR`、`NCHAR`、`NVARCHAR` 和 `LONGNVARCHAR` 数据类型。

如果使用 `setMaxFieldSize` 设置了限制，并且尝试读取超过限制的数据，则由于超过设置限制而发生的任何截断将不会被报告。

## 8.4 `BatchUpdateException`

`BatchUpdateException` 对象提供有关在执行语句批处理期间发生的错误的信息。此异常的行为在第 14 章"批处理更新"中描述。

## 8.5 分类 `SQLException`

分类 `SQLException` 提供了到常见 `SQLState` 类值和到不与特定 `SQLState` 类值关联的常见错误状态的标准映射。`SQLState` 类值在 `SQL:2003` 规范中定义。`JDBC` 驱动程序也可能为 `JDBC` 驱动程序检测到的错误抛出分类 `SQLException`。新的 `SQLException` 子类将为 `JDBC` 程序员提供一种方法来编写更可移植的错误处理代码。

新的 `SQLException` 将分为三个异常类别：

- `SQLNonTransientException`
- `SQLTransientException`
- `SQLRecoverableException`

### 8.5.1 非瞬态 `SQLException`

非瞬态 `SQLException` 必须扩展 `SQLNonTransientException` 类。在重试相同操作将失败的情况下（除非纠正了 `SQLException` 的原因），将抛出非瞬态 `SQLException`。在发生 `SQLNonTransientConnectionException` 以外的非瞬态 `SQLException` 后，应用程序可以假定连接仍然有效。对于指示非瞬态错误但下表中未指定的 `SQLState` 类值，实现可以抛出 `SQLNonTransientException` 类的实例。

**表 8-1 非瞬态 `SQLException` 子类**

| `SQL` `State` 类 | `SQLNonTransientException` 子类 |
|-------------|------------------------------|
| 0A | `SQLFeatureNotSupportedException` |
| 08 | `SQLNonTransientConnectionException` |
| 22 | `SQLDataException` |
| 23 | `SQLIntegrityConstraintViolationException` |
| 28 | `SQLInvalidAuthorizationSpecException` |
| 42 | `SQLSyntaxErrorException` |

`JDBC` 驱动程序实现也可能为表 8-1 中未指定的供应商特定的非瞬态条件抛出 `NonTransientSQLException`。

> **注意** — 当违反模式对象的可访问性时，也会发生 `SQLSyntaxException`，例如，基于 `SQL:2003` 规范中给出的规则。

### 8.5.2 瞬态 `SQLException`

瞬态 `SQLException` 必须扩展 `SQLTransientException` 类。在先前失败的操作可能在没有应用程序级功能干预的情况下重试操作时成功的情况下，将抛出瞬态 `SQLException`。在发生 `SQLTransientConnectionException` 以外的瞬态 `SQLException` 后，应用程序可以假定连接仍然有效。对于指示瞬态错误但下表中未指定的 `SQLState` 类值，实现可以抛出 `SQLTransientException` 类的实例。

**表 8-2 瞬态 `SQLException` 子类**

| `SQL` `State` 类 | `SQLTransientException` 子类 |
|-------------|---------------------------|
| 08 | `SQLTransientConnectionException` |
| 40 | `SQLTransactionRollbackException` |
| `N/A` | `SQLTimeoutException` |

`JDBC` 驱动程序实现也可能为表 8-2 中未指定的供应商特定的瞬态条件抛出 `TransientSQLException`。

### 8.5.3 `SQLRecoverableException`

如果应用程序执行一些恢复步骤并重试整个事务，或者在分布式事务的情况下重试事务分支，失败的操作可能会成功，在这种情况下将抛出 `SQLRecoverableException`。至少，恢复包括关闭当前连接并获取新连接。在 `SQLRecoverableException` 之后，应用程序必须假定连接不再有效。

## 8.6 `SQLClientInfoException`

当设置一个或多个指定客户端属性的 `Connection.setClientInfo` 方法发生失败时，将抛出 `SQLClientInfoException`。`SQLClientInfoException` 包含指示哪些客户端信息属性未设置的信息。

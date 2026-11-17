---
layout: wiki
wiki: jdbc
order: 009
title: 第八章 异常
date: 2022-02-29 11:15:27
comment_id: 'jdbc_exceptions'
banner: /assets/banner/banner_9.jpg
---

`SQLException` 类及其子类用于描述访问数据源时发生的错误和警告。

## 8.1 `SQLException`

与数据源交互时，如果发生错误，就会抛出 `SQLException`。该异常包含以下信息：

- **错误的文本描述** — 通过 `SQLException.getMessage` 方法获取，返回值为 `String`。

- **`SQLState`** — 通过 `SQLException.getSQLState` 方法获取，返回值为 `String`。具体取值由底层数据源决定。X/Open 和 SQL:2003 都定义了 `SQLState` 的取值及适用条件。两者虽然有重叠，但 SQL:2003 定义的取值并不是 X/Open 的超集。应用程序可以通过 `DatabaseMetaData.getSQLStateType` 判断数据源使用的是哪一套定义。

- **错误代码** — 用于标识导致 `SQLException` 的错误，类型为整数。具体取值和含义由实现决定，也可能直接使用底层数据源返回的错误代码。应用程序可以通过 `SQLException.getErrorCode` 获取。

- **原因** — 指引发当前 `SQLException` 的另一个 `Throwable` 对象。

- **异常链中的后续异常** — 发生多个错误时，这些异常会通过异常链关联起来。应用程序可以反复调用 `SQLException.getNextException`，依次获取后续异常；返回 `null` 时，表示异常链已遍历完毕。

`SQLException` 的各个子类将在第 8.5 节“`SQLException` 异常分类”中介绍。

### 8.1.1 支持 Java SE 链式异常

`SQLException` 类及其子类支持 Java SE 的链式异常机制，即通过 cause 记录异常原因。为支持这一机制，API 作出了以下改进：

- 添加了四个构造函数以支持 `cause` 参数
- 为 `SQLException` 添加对 J2SE 5.0 增强 for-each 循环的支持，使应用程序能够遍历异常及其原因，而不必在每次调用 `getNextException` 后再调用 `getCause`
- `getCause` 返回的原因既可能是 `SQLException`，也可能是其他类型的异常

有关其他信息，请参阅 JDBC API 规范。

### 8.1.2 遍历 `SQLException`

执行 SQL 语句时，可能发生一个或多个异常，每个异常也可能有自己的原因链。因此，应用程序捕获一个 `SQLException` 后，还可能需要处理与它关联的其他 `SQLException`。反复调用 `getNextException`，直到返回 `null`，即可遍历这些异常。

每个 `SQLException` 还可能关联一条原因链，由引发该异常的一个或多个 `Throwable` 对象组成。从 `SQLException.getCause` 开始，继续调用原因对象的 `getCause`，直到返回 `null`，即可遍历原因链。

下面的代码展示了如何遍历 `SQLException` 异常链，以及每个异常的原因链。

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

**代码示例 8-1 遍历 `SQLException` 及其原因**

### 8.1.2.1 使用 for-each 循环处理 `SQLException`

JDBC 应用程序也可以使用 Java SE 的增强 for-each 循环，遍历 `SQLException` 及其原因。

以下代码演示了如何将 for-each 循环与 `SQLException` 一起使用。

```java
catch(SQLException ex) {
    for(Throwable e : ex ) {
        System.out.println("Error encountered: " + e);
    }
}
```

**代码示例 8-2 使用 for-each 循环处理 `SQLException`**

## 8.2 `SQLWarning`

`SQLWarning` 是 `SQLException` 的子类。如果以下接口中的方法遇到数据库访问警告，将生成 `SQLWarning` 对象：

- `Connection`
- `DataSet`
- `Statement`
- `ResultSet`

方法生成 `SQLWarning` 对象时，不会主动通知调用者。应用程序必须在相应对象上调用 `getWarnings`，才能获取警告。不过，`SQLWarning` 的子类 `DataTruncation` 在某些情况下会作为异常抛出，具体见第 8.3 节“`DataTruncation`”。

发生多个数据访问警告时，后续警告会链接到第一个警告。应用程序可以反复调用 `SQLWarning.getNextWarning` 遍历警告链，返回 `null` 时表示没有更多警告。

后续的 `SQLWarning` 会继续追加到警告链中。执行下一条语句时，链中的警告会被清除；对于 `ResultSet`，则在游标重新定位时清除。

## 8.3 `DataTruncation`

`DataTruncation` 是 `SQLWarning` 的子类，用于描述数据截断。向数据源写入数据时，如果发生截断，就会抛出 `DataTruncation`；即使报告了警告，截断后的值也可能已经写入数据源。从数据源读取数据时，如果发生截断，则通过 `SQLWarning` 报告。

`DataTruncation` 对象包含以下信息：

- 描述字符串 `"Data truncation"`
- 当从数据源读取时发生数据截断时的 `SQLState` "01004"
- 当向数据源写入时发生数据截断时的 `SQLState` "22001"
- 一个布尔值，指示是截断了列值还是参数。如果截断了参数，`DataTruncation.getParameter` 方法返回 `true`；如果截断了列值，则返回 `false`。
- 被截断的列或参数的索引，类型为 `int`，可通过 `DataTruncation.getIndex` 获取。索引未知时返回 `-1`，此时 `getParameter` 和 `getRead` 的返回值未定义。
- 一个布尔值，指示截断是发生在读取还是写入操作上。如果截断发生在读取上，`DataTruncation.getRead` 方法返回 `true`；如果截断发生在写入上，则返回 `false`。
- `DataTruncation.getDataSize` 返回应当传输的字节数，类型为 `int`。涉及数据转换时，这个值可能只是近似值；大小未知时，可能返回 `-1`。
- 实际传输的字节数，类型为 `int`，通过 `DataTruncation.getTransferSize` 获取。字节数未知时返回 `-1`。

### 8.3.1 静默截断

`Statement.setMaxFieldSize` 方法允许设置最大大小（以字节为单位）。此限制仅适用于 `BINARY`、`VARBINARY`、`LONGVARBINARY`、`CHAR`、`VARCHAR`、`LONGVARCHAR`、`NCHAR`、`NVARCHAR` 和 `LONGNVARCHAR` 数据类型。

如果设置了 `setMaxFieldSize` 限制，读取的数据超过该限制时，由此产生的截断不会被报告。

## 8.4 `BatchUpdateException`

`BatchUpdateException` 对象提供有关在执行语句批处理期间发生的错误的信息。此异常的行为在第 14 章“批处理更新”中描述。

## 8.5 `SQLException` 异常分类

对 `SQLException` 进行分类，可以在异常类型与常见 `SQLState` 类值之间建立标准映射，也可以表示未关联特定 `SQLState` 类值的常见错误。`SQLState` 类值由 SQL:2003 定义。驱动程序自身检测到错误时，也可以抛出相应类别的异常。这些 `SQLException` 子类有助于开发者编写可移植的错误处理代码。

新增的 `SQLException` 子类分为三类：

- `SQLNonTransientException`
- `SQLTransientException`
- `SQLRecoverableException`

### 8.5.1 非瞬态 `SQLException`

非瞬态 `SQLException` 必须继承 `SQLNonTransientException`。如果不先消除异常原因，重试相同操作仍然会失败，此时会抛出非瞬态异常。在发生 `SQLNonTransientConnectionException` 以外的非瞬态 `SQLException` 后，应用程序可以假定连接仍然有效。对于表示非瞬态错误、但未在下表列出的 `SQLState` 类值，实现可以抛出 `SQLNonTransientException`。

**表 8-1 非瞬态 `SQLException` 子类**

| `SQLState` 类 | `SQLNonTransientException` 子类 |
|-------------|------------------------------|
| 0A | `SQLFeatureNotSupportedException` |
| 08 | `SQLNonTransientConnectionException` |
| 22 | `SQLDataException` |
| 23 | `SQLIntegrityConstraintViolationException` |
| 28 | `SQLInvalidAuthorizationSpecException` |
| 42 | `SQLSyntaxErrorException` |

对于表 8-1 未列出的供应商特定非瞬态错误，驱动程序也可以抛出 `SQLNonTransientException`。

> **注意** — 违反模式对象的可访问性规则时，也会抛出 `SQLSyntaxErrorException`，例如违反 SQL:2003 规定的相关规则。

### 8.5.2 瞬态 `SQLException`

瞬态 `SQLException` 必须继承 `SQLTransientException`。如果不需要应用程序采取额外措施，重试先前失败的操作就有可能成功，此时会抛出瞬态异常。在发生 `SQLTransientConnectionException` 以外的瞬态 `SQLException` 后，应用程序可以假定连接仍然有效。对于表示瞬态错误、但未在下表列出的 `SQLState` 类值，实现可以抛出 `SQLTransientException`。

**表 8-2 瞬态 `SQLException` 子类**

| `SQLState` 类 | `SQLTransientException` 子类 |
|-------------|---------------------------|
| 08 | `SQLTransientConnectionException` |
| 40 | `SQLTransactionRollbackException` |
| `N/A` | `SQLTimeoutException` |

对于表 8-2 未列出的供应商特定瞬态错误，驱动程序也可以抛出 `SQLTransientException`。

### 8.5.3 `SQLRecoverableException`

如果应用程序执行恢复操作后，重试整个事务或分布式事务中的事务分支，先前失败的操作就有可能成功，此时会抛出 `SQLRecoverableException`。恢复操作至少包括关闭当前连接并获取新连接。发生该异常后，应用程序必须认为当前连接已失效。

## 8.6 `SQLClientInfoException`

调用 `Connection.setClientInfo` 设置一个或多个客户端信息属性时，如果设置失败，就会抛出 `SQLClientInfoException`。应用程序可以通过该异常了解哪些属性未能设置。

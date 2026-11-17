---
layout: wiki
wiki: jdbc
order: 010
title: 第九章 连接
date: 2022-02-29 11:15:27
comment_id: 'jdbc_connections'
banner: /assets/banner/banner_9.jpg
---

`Connection` 对象表示通过 JDBC 驱动程序建立的数据源连接。数据源可以是 DBMS、遗留文件系统，或其他提供了相应 JDBC 驱动程序的系统。一个应用程序可以维护多个连接，这些连接既可以访问同一个数据源，也可以分别访问不同的数据源。

对于 JDBC 驱动程序，`Connection` 对象表示一个客户端会话，并关联用户 ID、会话中使用的 SQL 语句和结果集，以及当前生效的事务语义等状态信息。

应用程序可以通过以下两种方式之一获取连接：

- 使用与一个或多个 `Driver` 实现协作的 `DriverManager` 类。
- 使用 `DataSource` 实现。

优先推荐使用 `DataSource`，它能够提高应用程序的可移植性，简化代码维护，并让应用程序透明地使用连接池和分布式事务。所有建立到数据源连接的 Java EE 组件都使用 `DataSource` 对象来获取连接。

本章介绍各种类型的 JDBC 驱动程序以及 `Driver` 接口、`DriverManager` 类和基本 `DataSource` 接口的使用。支持连接池和分布式事务的 `DataSource` 实现在第 11 章“连接池”和第 12 章“分布式事务”中讨论。

## 9.1 驱动程序类型

JDBC 驱动程序有多种实现方式，可以分为以下四类：

- **Type 1** — 将 JDBC API 映射到其他数据访问 API，例如 `ODBC`。这类驱动程序通常依赖本地库，因此可移植性受到限制。JDBC-ODBC Bridge 驱动程序就属于 Type 1。

- **Type 2** — 部分使用 Java 编写，部分使用本地代码编写。它们通过数据源专用的本地客户端库访问数据，因此同样受到本地代码的可移植性限制。

- **Type 3** — 客户端使用纯 Java 实现，通过与数据库无关的协议与中间件服务器通信，再由中间件服务器将请求转发给数据源。

- **Type 4** — 纯 Java 驱动程序，通常使用网络协议或文件 `I/O` 与特定数据源通信。客户端直接连接到数据源。

## 9.2 `Driver` 接口

JDBC 驱动程序必须实现 `Driver` 接口，并提供在驱动程序加载时执行的静态初始化块。该初始化块负责创建驱动程序实例，并将其注册到 `DriverManager`，如代码示例 9-1 所示。

```java
public class AcmeJdbcDriver implements java.sql.Driver {
    static {
        java.sql.DriverManager.registerDriver(new AcmeJdbcDriver());
    }
    ...
}
```

**代码示例 9-1 `java.sql.Driver` 实现中的静态初始化块**

加载 `Driver` 实现类时，静态初始化块会自动注册驱动程序实例。

为了确保可以使用此机制加载驱动程序，驱动程序需要提供无参构造函数。

`DriverManager` 通过 `Driver` 接口的方法与已注册的驱动程序交互。其中，`acceptsURL` 用于判断某个驱动程序能否处理给定的 URL。

建立连接时，`DriverManager` 会调用驱动程序的 `connect` 方法，并传入 URL。如果驱动程序能够识别该 URL，就返回 `Connection` 对象；如果识别 URL 但无法建立数据库连接，则抛出 `SQLException`。如果无法识别 URL，则返回 `null`。

### 9.2.1 加载实现 `java.sql.Driver` 的驱动程序

初始化时，`DriverManager` 会尝试加载系统属性 `jdbc.drivers` 中指定的 JDBC 驱动程序类。

```bash
java -Djdbc.drivers=com.acme.jdbc.AcmeJdbcDriver Test
```

**代码示例 9-2 使用 `jdbc.drivers` 系统属性加载驱动程序**

`DriverManager.getConnection` 方法支持 Java SE 的服务提供者机制（Service Provider）。JDBC 4.0 驱动程序必须包含文件 `META-INF/services/java.sql.Driver`。该文件包含 JDBC 驱动程序中 `java.sql.Driver` 实现类的名称。代码示例 9-3 显示了 `META-INF/services/java.sql.Driver` 文件的内容，用于加载 `my.sql.Driver` 类。

```
my.sql.Driver
```

**代码示例 9-3 `META-INF/services/java.sql.Driver` 文件内容**

> **注意** — 已有应用程序通过 `Class.forName()` 加载 JDBC 驱动程序的方式仍然有效，无需修改。

## 9.3 `DriverAction` 接口

如果驱动程序希望在 `DriverManager.deregisterDriver` 注销它时收到通知，可以实现 `DriverAction` 接口。

`DriverAction` 实现并不面向应用程序直接使用。驱动程序可以将它定义为私有类，避免应用程序直接调用。

JDBC 驱动程序的静态初始化块必须调用 `DriverManager.registerDriver(java.sql.Driver, java.sql.DriverAction)`，向 `DriverManager` 指定驱动程序注销时需要调用的 `DriverAction` 实现。

```java
public class AcmeJdbcDriver implements java.sql.Driver {
    static DriverAction da;
    static {
        java.sql.DriverManager.registerDriver(new AcmeJdbcDriver(), da);
    }
    ...
}
```

**代码示例 9-4 注册驱动程序及其 `DriverAction` 实现的静态初始化块**

## 9.4 `DriverManager` 类

`DriverManager` 与 `Driver` 接口协作，管理 JDBC 客户端可用的驱动程序。客户端提供 URL 并请求连接时，`DriverManager` 会查找能够识别该 URL 的驱动程序，再通过它连接到相应的数据源。

关键的 `DriverManager` 方法包括：

- **`registerDriver`** — 将驱动程序加入可用驱动程序集合。该方法会在驱动程序加载过程中被隐式调用，通常由驱动程序的静态初始化块完成。

- **`getConnection`** — 供 JDBC 客户端建立连接。`DriverManager` 将调用中提供的 JDBC URL 依次传给列表中的驱动程序，直到某个驱动程序的 `connect` 方法能够识别它。驱动程序返回 `Connection` 对象后，再由 `DriverManager` 交给应用程序。

JDBC `URL` 的格式为：

```
jdbc:<subprotocol>:<subname>
```

其中，`subprotocol` 指定数据库连接机制，一种机制可以由一个或多个驱动程序支持；`subname` 的内容和语法则由 `subprotocol` 决定。

> **注意** — JDBC `URL` 不需要完全遵守 RFC 3986 "统一资源标识符 (URI): 通用语法" 中定义的 URI 语法。

代码示例 9-5 说明了 JDBC 客户端如何从 `DriverManager` 获取连接。

```java
// Set up arguments for the call to the getConnection method.
// The sub-protocol "derby" in the driver URL indicates the
// use of the derby JDBC driver.
String url = "jdbc:derby:sample";
String user = "SomeUser";
String passwd = "SomePwd";

// Get a connection from the first driver in the DriverManager
// list that recognizes the URL "jdbc:derby:sample".
// The call to getConnection will also load the driver if needed.
// When the driver is loaded, an instance of the driver is created
// and the registerDriver method is also called to make the driver
// available to clients.
Connection con = DriverManager.getConnection(url, user, passwd);
```

**代码示例 9-5 使用 `DriverManager` 加载驱动程序并获取连接**

`DriverManager` 还提供了另外两个 `getConnection` 重载方法：

- `getConnection(String url)` — 用于连接不需要用户名和密码的数据源。
- `getConnection(String url, java.util.Properties prop)` — 通过一组属性提供用户名、密码，以及建立连接可能需要的其他信息。

`DriverPropertyInfo` 类提供有关 JDBC 驱动程序可以理解的属性的信息。

有关更多详细信息，请参阅 JDBC API 规范。

## 9.5 `SQLPermission` 类

`SQLPermission` 类表示可能授予代码库的一组权限。

当前定义的唯一权限是 `setLog`。当 `Applet` 调用 `DriverManager` 方法 `setLogWriter` 和 `setLogStream` 之一时，`SecurityManager` 将检查 `setLog` 权限。如果代码库没有 `setLog` 权限，将抛出 `java.lang.SecurityException` 异常。

有关更多详细信息，请参阅 JDBC API 规范。

## 9.6 `DataSource` 接口

`DataSource` 接口在 JDBC 2.0 Optional Package 中引入，是获取数据源连接的首选方式。通过它获取的连接，与 `DriverManager` 通过 `Driver` 获取的连接一样，都实现了 `Connection` 接口。

使用 `DataSource` 时，应用程序可以通过数据源的逻辑名称获取连接，无需在代码中提供特定驱动程序的连接信息，从而提高可移植性。JNDI（Java Naming and Directory Interface，Java 命名与目录接口）命名服务负责将逻辑名称映射到 `DataSource` 对象。

`DataSource` 对象表示物理数据源，并负责提供连接。数据源或连接信息发生变化时，只需修改对象属性，无需改动应用程序代码。

`DataSource` 接口可以实现为透明地提供以下内容：

- 通过连接池提高性能和可扩展性
- 通过 `XADataSource` 接口支持分布式事务

> **注意** — `DataSource` 实现必须包含无参构造函数。

下面三节依次介绍 `DataSource` 的基本属性、JNDI 逻辑命名对可移植性和可维护性的作用，以及获取连接的方法。

连接池和分布式事务将在第 11 章“连接池”和第 12 章“分布式事务”中讨论。

### 9.6.1 `DataSource` 属性

JDBC API 定义了一组属性来标识和描述 `DataSource` 实现。具体需要哪些属性，取决于对象属于基本 `DataSource`、`ConnectionPoolDataSource` 还是 `XADataSource`。所有 `DataSource` 实现共同必需的属性只有 `description`。

标准属性包括：

- **`databaseName`** — 服务器上特定数据库的名称
- **`dataSourceName`** — 用于命名底层 `XADataSource` 或 `ConnectionPoolDataSource` 对象的名称
- **`description`** — 数据源的描述
- **`networkProtocol`** — 用于与数据源通信的网络协议
- **`password`** — 数据库密码
- **`portNumber`** — DBMS 服务器用于侦听连接的端口号
- **`roleName`** — 初始 SQL 角色名称
- **`serverName`** — 数据库服务器名称
- **`user`** — 用户的登录账户名称

### 9.6.2 JNDI API 和应用程序可移植性

将 `DataSource` 对象注册到 JNDI 命名服务后，应用程序就可以通过逻辑名称查找并获取它。连接细节与应用程序代码分离，有助于提高可移植性。

### 9.6.3 使用 `DataSource` 对象获取连接

通过 JNDI 获取 `DataSource` 对象后，应用程序就可以调用 `getConnection` 方法建立数据源连接。

```java
// Get the initial JNDI naming context
Context ctx = new InitialContext();

// Look up the data source in the naming service
DataSource ds = (DataSource)ctx.lookup("jdbc/AcmeDB");

// Get a connection from the data source
Connection con = ds.getConnection("user", "password");
```

### 9.6.4 关闭连接对象

#### 9.6.4.1 `Connection.close`

应用程序使用完连接后，应当调用 `Connection.close`，及时释放连接占用的资源。如果没有显式关闭连接，垃圾收集器可能在清理连接对象时将其关闭，但具体时间无法保证。

#### 9.6.4.2 `Connection.isClosed`

`isClosed` 方法返回一个布尔值，指示连接是否已关闭。

#### 9.6.4.3 `Connection.isValid`

`isValid` 方法用于验证连接是否仍然有效。该方法接受以秒为单位的超时值，在指定时间内验证成功时返回 `true`。

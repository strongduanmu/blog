---
layout: wiki
wiki: jdbc
order: 010
title: 第九章 连接
date: 2022-02-29 11:15:27
comment_id: 'jdbc_connections'
banner: /assets/banner/banner_9.jpg
---

`Connection` 对象表示通过支持 `JDBC` 技术的驱动程序与数据源的连接。数据源可以是 `DBMS`、遗留文件系统或具有相应 `JDBC` 驱动程序的其他数据源。使用 `JDBC API` 的单个应用程序可以维护多个连接。这些连接可以访问多个数据源，或者它们都可以访问单个数据源。

从 `JDBC` 驱动程序的角度来看，`Connection` 对象表示客户端会话。它具有关联的状态信息，例如用户 `ID`、在该会话中使用的一组 `SQL` 语句和结果集，以及生效的事务语义。

要获取连接，应用程序可以与以下任一项交互：

- 与一个或多个 `Driver` 实现一起工作的 `DriverManager` 类

或

- `DataSource` 实现

使用 `DataSource` 对象是首选方法，因为它增强了应用程序的可移植性，使代码维护更容易，并使应用程序能够透明地使用连接池和分布式事务。所有建立到数据源连接的 `Java EE` 组件都使用 `DataSource` 对象来获取连接。

本章描述了各种类型的 `JDBC` 驱动程序以及 `Driver` 接口、`DriverManager` 类和基本 `DataSource` 接口的使用。支持连接池和分布式事务的 `DataSource` 实现在第 11 章"连接池"和第 12 章"分布式事务"中讨论。

## 9.1 驱动程序类型

`JDBC` 驱动程序有许多可能的实现。这些实现分类如下：

- **`Type` 1** — 将 `JDBC API` 实现为到另一个数据访问 `API`（如 `ODBC`）的映射的驱动程序。此类型的驱动程序通常依赖于本机库，这限制了它们的可移植性。`JDBC`-`ODBC` `Bridge` 驱动程序是 `Type` 1 驱动程序的示例。

- **`Type` 2** — 部分用 `Java` 编程语言编写、部分用本机代码编写的驱动程序。这些驱动程序使用特定于它们连接的数据源的本机客户端库。同样，由于本机代码，它们的可移植性受到限制。

- **`Type` 3** — 使用纯 `Java` 客户端并使用与数据库无关的协议与中间件服务器通信的驱动程序。中间件服务器然后将客户端的请求传递给数据源。

- **`Type` 4** — 纯 `Java` 驱动程序，通常使用网络协议或文件 `I/O` 与特定数据源通信。客户端直接连接到数据源。

## 9.2 `Driver` 接口

`JDBC` 驱动程序必须实现 `Driver` 接口，并且实现必须包含在加载驱动程序时调用的静态初始化器。此初始化器向 `DriverManager` 注册其自身的新实例，如代码示例 9-1 所示。

```java
public class AcmeJdbcDriver implements java.sql.Driver {
    static {
        java.sql.DriverManager.registerDriver(new AcmeJdbcDriver());
    }
    ...
}
```
**代码示例 9-1 实现 `java.sql.Driver` 的驱动程序的静态初始化器示例**

当加载 `Driver` 实现时，静态初始化器将自动注册驱动程序的实例。

为了确保可以使用此机制加载驱动程序，驱动程序需要提供无参数构造函数。

`DriverManager` 类在希望与已注册驱动程序交互时调用 `Driver` 方法。`Driver` 接口还包括 `acceptsURL` 方法。`DriverManager` 可以使用此方法确定其已注册的驱动程序中应该用于给定 `URL` 的驱动程序。

当 `DriverManager` 尝试建立连接时，它调用该驱动程序的 `connect` 方法并将 `URL` 传递给驱动程序。如果 `Driver` 实现理解 `URL`，它将返回 `Connection` 对象，或者如果无法建立到数据库的连接则抛出 `SQLException`。如果 `Driver` 实现不理解 `URL`，它将返回 `null`。

### 9.2.1 加载实现 `java.sql.Driver` 的驱动程序

作为其初始化的一部分，`DriverManager` 类将尝试加载 "`jdbc.drivers`" 系统属性中引用的任何 `JDBC` 驱动程序类。

```bash
java -Djdbc.drivers=com.acme.jdbc.AcmeJdbcDriver Test
```
**代码示例 9-2 使用 `jdbc.drivers` 系统属性加载驱动程序**

`DriverManager.getConnection` 方法已被增强以支持 `Java` `Standard` `Edition` `Service Provider` 机制。`JDBC` 4.0 驱动程序必须包含文件 `META-INF/services/java.sql.Driver`。此文件包含 `JDBC` 驱动程序的 `java.sql.Driver` 实现的名称。代码示例 9-3 显示了 `META-INF/services/java.sql.Driver` 文件的内容，以便加载 `my.sql.driver` 类。

```
my.sql.Driver
```
**代码示例 9-3 `META-INF/services/java.sql.Driver` 文件内容**

> **注意** — 当前使用 `Class.forName`() 加载 `JDBC` 驱动程序的现有应用程序将继续工作而无需修改。

## 9.3 `DriverAction` 接口

当驱动程序希望被 `DriverManager` 方法 `deregisterDriver` 通知时，`JDBC` 驱动程序可以实现 `DriverAction` 接口。

`DriverAction` 实现不打算直接由应用程序使用。`JDBC` 驱动程序可以选择在私有类中创建其 `DriverAction` 实现，以避免直接调用它。

`JDBC` 驱动程序的静态初始化块必须调用 `DriverManager.registerDriver`(`java.sql.Driver`, `java.sql.DriverAction`) 以通知 `DriverManager` 在注销 `JDBC` 驱动程序时要调用的 `DriverAction` 实现。

```java
public class AcmeJdbcDriver implements java.sql.Driver {
    static DriverAction da;
    static {
        java.sql.DriverManager.registerDriver(new AcmeJdbcDriver(), da);
    }
    ...
}
```
**代码示例 9-4 实现 `java.sql.Driver` 和 `java.sql.DriverAction` 的驱动程序的静态初始化器示例**

## 9.4 `DriverManager` 类

`DriverManager` 类与 `Driver` 接口一起工作，以管理 `JDBC` 客户端可用的驱动程序集。当客户端请求连接并提供 `URL` 时，`DriverManager` 负责找到识别 `URL` 的驱动程序并使用它连接到相应的数据源。

关键的 `DriverManager` 方法包括：

- **`registerDriver`** — 此方法将驱动程序添加到可用驱动程序集，并在加载驱动程序时隐式调用。`registerDriver` 方法通常由每个驱动程序提供的静态初始化器调用。

- **`getConnection`** — `JDBC` 客户端调用以建立连接的方法。调用包括 `JDBC` `URL`，`DriverManager` 将其传递给列表中的每个驱动程序，直到找到一个其 `Driver.connect` 方法识别 `URL` 的驱动程序。该驱动程序将 `Connection` 对象返回给 `DriverManager`，`DriverManager` 又将其传递给应用程序。

`JDBC` `URL` 的格式为：

```
jdbc:<subprotocol>:<subname>
```
其中 `subprotocol` 定义了一种或多种驱动程序可能支持的数据库连接机制。`subname` 的内容和语法将取决于 `subprotocol`。

> **注意** — `JDBC` `URL` 不需要完全遵守 `RFC` 3986 "统一资源标识符 (`URI`): 通用语法" 中定义的 `URI` 语法。

代码示例 9-5 说明了 `JDBC` 客户端如何从 `DriverManager` 获取连接。

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

`DriverManager` 类还提供两个其他 `getConnection` 方法：

- `getConnection`(`String` url) — 用于连接不使用用户名和密码的数据源。
- `getConnection`(`String` url, `java.util.Properties` `prop`) — 允许客户端使用一组描述用户名和密码以及可能需要的任何附加信息的属性进行连接。

`DriverPropertyInfo` 类提供有关 `JDBC` 驱动程序可以理解的属性的信息。

有关更多详细信息，请参阅 `JDBC API` 规范。

## 9.5 `SQLPermission` 类

`SQLPermission` 类表示可能授予代码库的一组权限。

当前定义的唯一权限是 `setLog`。当 `Applet` 调用 `DriverManager` 方法 `setLogWriter` 和 `setLogStream` 之一时，`SecurityManager` 将检查 `setLog` 权限。如果代码库没有 `setLog` 权限，将抛出 `java.lang.SecurityException` 异常。

有关更多详细信息，请参阅 `JDBC API` 规范。

## 9.6 `DataSource` 接口

`DataSource` 接口在 `JDBC 2.0 `Optional Package` 中引入，是获取数据源连接的首选方法。实现 `DataSource` 接口的 `JDBC` 驱动程序返回实现与使用 `Driver` 接口的 `DriverManager` 返回的相同接口 `Connection` 的连接。使用 `DataSource` 对象通过使应用程序能够使用数据源的逻辑名称而不是必须提供特定于特定驱动程序的信息来增加应用程序的可移植性。逻辑名称通过使用 `Java` `Naming` and `Directory` `Interface`™ (`JNDI`) 的命名服务映射到 `DataSource` 对象。`DataSource` 对象表示物理数据源并提供到该数据源的连接。如果数据源或有关它的信息发生更改，只需修改 `DataSource` 对象的属性以反映更改；不需要更改应用程序代码。

`DataSource` 接口可以实现为透明地提供以下内容：

- 通过连接池提高性能和可扩展性
- 通过 `XADataSource` 接口支持分布式事务

> **注意** — `DataSource` 实现必须包含无参数构造函数。

接下来的三节讨论 (1) 基本 `DataSource` 属性，(2) 使用 `JNDI` `API` 的逻辑命名如何提高应用程序的可移植性并使其更易于维护，以及 (3) 如何获取连接。

连接池和分布式事务将在第 11 章"连接池"和第 12 章"分布式事务"中讨论。

### 9.6.1 `DataSource` 属性

`JDBC API` 定义了一组属性来标识和描述 `DataSource` 实现。特定实现所需的实际属性集取决于 `DataSource` 对象的类型，即它是基本 `DataSource` 对象、`ConnectionPoolDataSource` 对象还是 `XADataSource` 对象。所有 `DataSource` 实现所需的唯一属性是 `description`。

标准属性包括：

- **`databaseName`** — 服务器上特定数据库的名称
- **`dataSourceName`** — 用于命名底层 `XADataSource` 或 `ConnectionPoolDataSource` 对象的名称
- **`description`** — 数据源的描述
- **`networkProtocol`** — 用于与数据源通信的网络协议
- **`password`** — 数据库密码
- **`portNumber`** — `DBMS` 服务器用于侦听连接的端口号
- **`roleName`** — 初始 `SQL` 角色名称
- **`serverName`** — 数据库服务器名称
- **`user`** — 用户的登录帐户名称

### 9.6.2 `JNDI` `API` 和应用程序可移植性

`DataSource` 对象可以注册到 `JNDI` 命名服务，以便应用程序可以使用逻辑名称发现并检索它。这提供了应用程序可移植性，因为连接详细信息与代码分离。

### 9.6.3 使用 `DataSource` 对象获取连接

一旦使用 `JNDI` 检索到 `DataSource` 对象，应用程序就可以调用 `getConnection` 方法来获取到数据源的连接。

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

当应用程序使用完连接时，它应该调用 `Connection.close` 方法以立即释放连接占用的资源。如果应用程序不显式关闭连接，垃圾收集器可能会在清理连接对象时关闭它，但这不能保证何时发生。

#### 9.6.4.2 `Connection.isClosed`

`isClosed` 方法返回一个布尔值，指示连接是否已关闭。

#### 9.6.4.3 `Connection.isValid`

`isValid` 方法提供了一种机制来确定连接是否仍然有效。此方法接受一个超时值（以秒为单位），如果连接在此时间内成功验证，则返回 `true`。

---
layout: wiki
wiki: avatica
order: 001
title: 背景
date: 2025-01-26 12:15:27
banner: /assets/banner/banner_3.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/

Avatica 是一个用于构建数据库 JDBC 和 ODBC 驱动程序，以及 RPC 有线协议的框架。

![Avatica 架构](/wiki/avatica/background/avatica-architecture.png)

Avatica 的 Java 绑定依赖性非常小。尽管它是 Apache Calcite 的一部分，但它并不依赖于 Calcite 的其他部分。它仅依赖于 `JDK 8+` 和 `Jackson`。

Avatica 的有线协议是 JSON 或 HTTP 上的协议缓冲区。JSON 协议的 Java 实现使用 [Jackson](https://github.com/FasterXML/jackson)，将请求命令对象转换为 JSON，或从 JSON 转换为响应命令对象。

`Avatica-Server` 是 Avatica RPC 的 Java 实现。

核心概念：

- [Meta](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/Meta.html) 是一个本地 API，通过它能够实现任何 `Avatica provider` 提供程序；
- [AvaticaFactory](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/AvaticaFactory.html) 在 `Meta` 之上创建 JDBC 类的实现；
- [Service](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/remote/Service.html) 是一个接口，它实现了 `Meta` 在请求和响应命令对象方面的功能。

## JDBC

Avatica 通过 [AvaticaFactory](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/AvaticaFactory.html) 实现 JDBC。`AvaticaFactory` 的实现在 `Meta` 之上创建 JDBC 类 ([Driver](https://docs.oracle.com/javase/8/docs/api//java/sql/Driver.html)、[Connection](https://docs.oracle.com/javase/8/docs/api//java/sql/Connection.html)、[Statement](https://docs.oracle.com/javase/8/docs/api//java/sql/Statement.html)、[ResultSet](https://docs.oracle.com/javase/8/docs/api//java/sql/ResultSet.html)) 的实现。

## ODBC

Avatica ODBC 的工作尚未开始。

Avatica ODBC 将使用相同的有线协议，并可以使用 Java 中的相同服务器实现。ODBC 客户端将用 C 或 C++ 编写。

由于 Avatica 协议抽象了 `provider` 提供程序之间的许多差异，因此相同的 ODBC 客户端可用于不同的数据库。

虽然 Avatica 项目不包含 ODBC 驱动程序，但是有基于 Avatica 协议编写的 ODBC 驱动程序，例如 [Apache Phoenix 的 ODBC 驱动程序](http://hortonworks.com/hadoop-tutorial/bi-apache-phoenix-odbc/)。

## HTTP 服务

Avatica 服务端嵌入了 `Jetty HTTP` 服务器，提供了一个实现 `Avatica RPC` 协议的 [HttpServer](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/server/HttpServer.html) 类，可以作为独立的 Java 应用程序运行。

如果需要，可以通过扩展 `HttpServer` 类，并重写其 `configureConnector()` 方法，来配置 HTTP 服务器中的连接器。例如，用户可以将 `requestHeaderSize` 设置为 64K 字节，如下所示：

```java
HttpServer server = new HttpServer(handler) {
  @Override
  protected ServerConnector configureConnector(
      ServerConnector connector, int port) {
    HttpConnectionFactory factory = (HttpConnectionFactory)
        connector.getDefaultConnectionFactory();
    factory.getHttpConfiguration().setRequestHeaderSize(64 << 10);
    return super.configureConnector(connector, port);
  }
};
server.start();
```

## 项目结构

我们知道客户端库具有最小的依赖性非常重要。

Avatica 是 [Apache Calcite](https://calcite.apache.org/) 的一个子项目，在一个单独的存储库中维护。它不依赖于 Calcite 的任何其他部分。

软件包：

- [org.apache.calcite.avatica](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/package-summary.html) 核心框架；
- [org.apache.calcite.avatica.remote](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/remote/package-summary.html) 使用远程过程调用的 JDBC 驱动程序；
- [org.apache.calcite.avatica.server](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/server/package-summary.html) HTTP 服务器；
- [org.apache.calcite.avatica.util](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/util/package-summary.html) 实用程序。

## 状态

### 已实现的

- 创建连接 `create connection`、创建语句 `create statement`、元数据 `metadata`、准备 `prepare`、绑定 `bind`、执行 `execute`、获取 `fetch`；
- 通过 HTTP 使用 JSON 格式进行 RPC 调用；
- 本地实现；
- 通过现有的 JDBC 驱动程序实现；
- 复合 RPC 调用（将多个请求组合成一次往返）：
  - 执行 - 获取；
  - 元数据获取（元数据调用，例如 `getTables` 返回所有行）。

### 未实现的

- ODBC；
- RPC 调用：
  - CloseStatement；
  - CloseConnection；
- 复合 RPC 调用：
  - CreateStatement - Prepare；
  - CloseStatement - CloseConnection；
  - 准备 - 执行 - 获取（`Statement.executeQuery` 应该获取前 N 行）。
- 从语句表中删除语句；
- DML (INSERT, UPDATE, DELETE)；
- `Statement.execute` 应用于 SELECT 语句。

## 客户端

以下是可用的 Avatica 客户端列表，其中一些客户端是 [Apache Phoenix](http://phoenix.apache.org/) 的适配器，但也与其他 Avatica 后端兼容。非常欢迎为其他语言的客户端做出贡献！

### 适用于 Apache Phoenix 查询服务器的 Microsoft .NET 驱动程序

- [主页](https://github.com/Azure/hdinsight-phoenix-sharp)
- 语言：C#
- 许可证：[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Avatica 版本 1.2.0 及以上
- 维护者：Microsoft Azure

### Apache Phoenix/Avatica SQL 驱动程序

- [主页](https://github.com/apache/calcite-avatica-go)
- 语言：Go
- 许可证：[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Avatica 版本 1.8.0 及以上
- 维护者：Boostport 和 Apache Calcite 社区

### Avatica thin 客户端

- [主页](https://calcite.apache.org/avatica)
- 语言：Java
- 许可证：[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- 任何 Avatica 版本
- 维护者：Apache Calcite 社区

### 适用于 Python 的 Apache Phoenix 数据库适配器

- [主页](https://phoenix.apache.org/python.html)
- 语言：Python
- 许可证：[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Avatica 版本 1.2.0 及以上
- 维护者：Apache Phoenix 社区

### JavaScript 绑定到 Calcite Avatica 服务器

- [主页](https://github.com/waylayio/avatica-js)
- 语言：JavaScript
- 许可证：[MIT](https://opensource.org/licenses/MIT)
- 任何 Avatica 版本
- 维护者：`Waylay.io`

### Calcite Avatica CLI：基于 Go 的工具

- [主页](https://github.com/satyakommula96/calcite-cli)
- 语言：Go
- 许可证：[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Avatica 版本 1.8.0 及以上
- 维护者：[Satya Kommula](https://github.com/satyakommula96)



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)
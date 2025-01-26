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

Avatica 的 Java 绑定依赖性非常小。尽管它是 Apache Calcite 的一部分，但它并不依赖于 Calcite 的其他部分。它仅依赖于 JDK 8+ 和 Jackson。

Avatica 的有线协议是 JSON 或 HTTP 上的协议缓冲区。JSON 协议的 Java 实现使用 [Jackson](https://github.com/FasterXML/jackson) 将请求/响应命令对象转换为 JSON 或从 JSON 转换为 JSON。

Avatica-Server 是 Avatica RPC 的 Java 实现。

核心概念：

- [Meta](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/Meta.html) 是一个足以实现任何 Avatica 提供程序的本地 API；
- [AvaticaFactory](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/AvaticaFactory.html) 在 `Meta` 之上创建 JDBC 类的实现；
- [Service](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/remote/Service.html) 是一个接口，它实现了 `Meta` 在请求和响应命令对象方面的功能。

## JDBC

Avatica implements JDBC by means of [AvaticaFactory](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/AvaticaFactory.html). An implementation of `AvaticaFactory` creates implementations of the JDBC classes ([Driver](https://docs.oracle.com/javase/8/docs/api//java/sql/Driver.html), [Connection](https://docs.oracle.com/javase/8/docs/api//java/sql/Connection.html), [Statement](https://docs.oracle.com/javase/8/docs/api//java/sql/Statement.html), [ResultSet](https://docs.oracle.com/javase/8/docs/api//java/sql/ResultSet.html)) on top of a `Meta`.

## ODBC

Work has not started on Avatica ODBC.

Avatica ODBC would use the same wire protocol and could use the same server implementation in Java. The ODBC client would be written in C or C++.

Since the Avatica protocol abstracts many of the differences between providers, the same ODBC client could be used for different databases.

Although the Avatica project does not include an ODBC driver, there are ODBC drivers written on top of the Avatica protocol, for example [an ODBC driver for Apache Phoenix](http://hortonworks.com/hadoop-tutorial/bi-apache-phoenix-odbc/).

## HTTP Server

Avatica-server embeds the Jetty HTTP server, providing a class [HttpServer](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/server/HttpServer.html) that implements the Avatica RPC protocol and can be run as a standalone Java application.

Connectors in HTTP server can be configured if needed by extending `HttpServer` class and overriding its `configureConnector()` method. For example, user can set `requestHeaderSize` to 64K bytes as follows:

```
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

## Project structure

We know that it is important that client libraries have minimal dependencies.

Avatica is a sub-project of [Apache Calcite](https://calcite.apache.org/), maintained in a separate repository. It does not depend upon any other part of Calcite.

Packages:

- [org.apache.calcite.avatica](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/package-summary.html) Core framework
- [org.apache.calcite.avatica.remote](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/remote/package-summary.html) JDBC driver that uses remote procedure calls
- [org.apache.calcite.avatica.server](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/server/package-summary.html) HTTP server
- [org.apache.calcite.avatica.util](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/util/package-summary.html) Utilities

## Status

### Implemented

- Create connection, create statement, metadata, prepare, bind, execute, fetch
- RPC using JSON over HTTP
- Local implementation
- Implementation over an existing JDBC driver
- Composite RPCs (combining several requests into one round trip)
  - Execute-Fetch
  - Metadata-Fetch (metadata calls such as getTables return all rows)

### Not implemented

- ODBC
- RPCs
  - CloseStatement
  - CloseConnection
- Composite RPCs
  - CreateStatement-Prepare
  - CloseStatement-CloseConnection
  - Prepare-Execute-Fetch (Statement.executeQuery should fetch first N rows)
- Remove statements from statement table
- DML (INSERT, UPDATE, DELETE)
- Statement.execute applied to SELECT statement

## Clients

The following is a list of available Avatica clients. Several describe themselves as adapters for [Apache Phoenix](http://phoenix.apache.org/) but also work with other Avatica back-ends. Contributions for clients in other languages are highly welcomed!

### Microsoft .NET driver for Apache Phoenix Query Server

- [Home page](https://github.com/Azure/hdinsight-phoenix-sharp)
- Language: C#
- *License*: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Avatica version 1.2.0 onwards
- *Maintainer*: Microsoft Azure

### Apache Phoenix/Avatica SQL Driver

- [Home page](https://github.com/apache/calcite-avatica-go)
- *Language*: Go
- *License*: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Avatica version 1.8.0 onwards
- *Maintainer*: Boostport and the Apache Calcite community

### Avatica thin client

- [Home page](https://calcite.apache.org/avatica)
- *Language*: Java
- *License*: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Any Avatica version
- *Maintainer*: Apache Calcite community

### Apache Phoenix database adapter for Python

- [Home page](https://phoenix.apache.org/python.html)
- Language: Python
- *License*: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Avatica version 1.2.0 onwards
- *Maintainer*: Apache Phoenix community

### JavaScript binding to Calcite Avatica Server

- [Home page](https://github.com/waylayio/avatica-js)
- Language: JavaScript
- *License*: [MIT](https://opensource.org/licenses/MIT)
- Any Avatica version
- *Maintainer*: Waylay.io

### Calcite Avatica CLI: A Go-based Tool

- [Home page](https://github.com/satyakommula96/calcite-cli)
- Language: Go
- *License*: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- Avatica version 1.8.0 onwards
- *Maintainer*: [Satya Kommula](https://github.com/satyakommula96)



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)
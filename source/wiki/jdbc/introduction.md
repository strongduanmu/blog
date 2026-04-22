---
layout: wiki
wiki: jdbc
order: 002
title: 第一章 介绍
date: 2022-02-29 11:15:27
comment_id: 'jdbc_introduction'
banner: /assets/banner/banner_9.jpg
---

## 1.1 `JDBC API`

`JDBC API` 为 `Java` 编程语言提供了访问关系数据的编程接口。借助 `JDBC API`，使用 `Java` 编写的应用程序可以执行 `SQL` 语句、检索结果，并将修改写回到底层数据源。`JDBC API` 还支持在分布式、异构环境中同时与多个数据源交互。

`JDBC API` 基于 `X/Open SQL CLI`，而后者也是 `ODBC` 的基础。`JDBC` 为 `Java` 编程语言提供了一套自然且易于使用的映射，使开发者能够更方便地使用 `X/Open SQL CLI` 以及 `SQL` 标准中定义的抽象和概念。

自 1997 年 1 月推出以来，`JDBC API` 已被广泛接受和实现。该 `API` 的灵活性允许广泛的实现范围。

## 1.2 平台

`JDBC API` 是 `Java` 平台的一部分，包括 `Java SE` 和 `Java EE`。`JDBC API` 分为 `java.sql` 和 `javax.sql` 两个包，这两个包都包含在 `Java SE` 与 `Java EE` 平台中。

## 1.3 目标读者

本规范主要针对以下类型产品的供应商：

- 实现 `JDBC API` 的驱动程序
- 在驱动层之上提供中间层服务的应用服务器
- 使用 `JDBC API` 提供应用程序生成等服务的工具

本规范也旨在服务于以下目的：

- 为使用 `JDBC API` 的应用程序的最终用户提供入门介绍
- 为在 `JDBC API` 之上构建的其他 `API` 的开发者提供起点

## 1.4 致谢

`JDBC` 4.2 规范工作作为 `JSR-221` 的一部分，在 `Java` 社区进程下开展。本规范是 `JDBC` 4.2 专家组共同努力的成果，许多成员为此投入了大量时间。我们感谢以下成员的贡献：

- `Lance Andersen`，`Oracle`（规范负责人）
- `Mark Biamonte`，`DataDirect Technologies`
- `Volker Berlin`
- `Jesse Davis`，`DataDirect Technologies`
- `Christopher Farrar`，`IBM`
- `John Goodson`，`DataDirect Technologies`
- `Karim Khamis`，`Sybase`
- `Mark Matthews`，`Oracle`
- `Marco Paskamp`，`SAP AG`
- `Ajit Sabnis`，`Sybase`
- `Douglas Surber`，`Oracle`
- `Joe Weinstein`，`Oracle`

同样感谢在幕后帮助和支持这项工作的许多人，包括 `Ian Evans`、`Jeff Dinkins`、`Rick Hillegas`、`Eric Jendrock`、`Knut Anders Hatlen` 和 `Dag Wanvik`。

最后，我们还要感谢历任 `JDBC` 规范负责人为 `JDBC` 的成功所作出的贡献：`Graham Hamilton`、`Rick Cattell`、`Seth White`、`Jon Ellis`、`Linda Ho` 和 `Jonathan Bruce`。

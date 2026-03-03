---
layout: wiki
wiki: avatica
order: 008
title: 兼容性
date: 2025-01-30 16:00:00
banner: /assets/banner/banner_6.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/compatibility.html

鉴于 Avatica 的客户端-服务器模型，兼容性对 Apache Calcite Avatica 的用户和开发者来说非常重要，这并不令人意外。本文档定义了 Avatica 在不同版本的 Avatica 客户端和服务器之间关于兼容性方面所做的保证。本文档仍在编写中，许多领域仍需定义。欢迎随时贡献。

## Avatica 技术兼容性套件 (TCK)

[Avatica TCK 项目][github-tck] 是一个旨在自动测试 Avatica 客户端与 Avatica 服务器交互的框架。TCK 由一组 JUnit 测试、一个 YAML 配置文件和一个 Ruby 脚本定义。JUnit 测试调用 Avatica 客户端和服务器组件的特定部分，以验证它们按预期工作。Ruby 脚本使用 YAML 配置文件来定义要对其运行 JUnit 测试的客户端和服务器版本对集合。

在 YAML 配置文件中，一个名称（例如 `1.6.0`）和以下三项定义了一个 Avatica 版本：

1. Avatica 客户端 jar 的文件系统路径（例如 groupId=org.apache.calcite.avatica，artifactId=avatica）
2. 运行中的 Avatica 服务器实例的 URL
3. Avatica 客户端 JDBC 驱动程序连接 Avatica 服务器的 JDBC URL 模板

TCK 的用户通过 YAML 配置文件定义版本集合（由上述信息定义）和 [avatica-tck][github-tck] jar 的位置。项目中包含一个[示例 YAML 配置文件][github-tck-yml-file]。

传统上，Avatica 不提供 Avatica 服务器的任何实现，因为 Avatica 的价值在于集成项目（例如 Apache Drill 或 Apache Phoenix）。但是，出于兼容性测试的目的，Avatica 提供独立的服务器实例是合理的。Avatica 引入了一个新构件，包含原始 TCK 代码库，称为 [avatica-standalone-server][github-standalone-server]。此构件是一个可运行的 jar（例如 `java -jar`），它使用内存 [HSQLDB 数据库](http://hsqldb.org/)在随机端口上启动 Avatica 服务器实例。此构件使启动特定 Avatica 版本的 Avatica 服务器变得极其简单。

如前所述，Ruby 脚本是 TCK 的入口点。调用 Ruby 脚本会打印每个指定版本与自身以及 YAML 配置中所有其他版本进行测试的摘要。下面是一个示例摘要，是测试版本 1.6.0、1.7.1 和 1.8.0-SNAPSHOT 的结果：

```
Summary:

Identity test scenarios (ran 3)

Testing identity for version v1.6.0: Passed
Testing identity for version v1.7.1: Passed
Testing identity for version v1.8.0-SNAPSHOT: Failed

All test scenarios (ran 6)

Testing client v1.6.0 against server v1.7.1: Passed
Testing client v1.6.0 against server v1.8.0-SNAPSHOT: Failed
Testing client v1.7.1 against server v1.6.0: Passed
Testing client v1.7.1 against server v1.8.0-SNAPSHOT: Failed
Testing client v1.8.0-SNAPSHOT against server v1.6.0: Failed
Testing client v1.8.0-SNAPSHOT against server v1.7.1: Failed
```

并不总是期望所有测试的版本对都能通过，除非测试是专门针对 Avatica 本身的过去错误编写的。虽然 Avatica 尝试隐式处理所有这些边缘情况，但这并不总是可行或可取的。添加新测试用例就像在 [TCK 模块][github-tck-tests] 中编写 JUnit 测试用例一样简单，但目前没有任何自动化来验证测试用例作为 Maven 构建的一部分。

有关运行此 TCK 的更多信息，包括运行 TCK 的具体说明，请参阅提供的 [README][github-tck-readme] 文件。

[github-tck]: https://github.com/apache/calcite-avatica/tree/main/tck
[github-tck-tests]: https://github.com/apache/calcite-avatica/tree/main/tck/src/main/java/org/apache/calcite/avatica/tck/tests
[github-standalone-server]: https://github.com/apache/calcite-avatica/tree/main/standalone-server
[github-tck-readme]: https://github.com/apache/calcite-avatica/tree/main/tck/README.md
[github-tck-yml-file]: https://github.com/apache/calcite-avatica/tree/main/tck/src/main/resources/example_config.yml



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

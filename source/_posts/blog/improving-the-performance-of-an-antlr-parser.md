---
title: ANTLR 解析性能优化指南
tags: [Antlr]
categories: [Antlr]
date: 2024-06-26 18:00:00
updated: 2024-07-07 8:00:00
cover: /assets/blog/blog/introduction-to-antlr.png
banner: /assets/banner/banner_7.jpg
references:
  - '[Improving the performance of an ANTLR parser](https://tomassetti.me/improving-the-performance-of-an-antlr-parser/)'
---

> 本文翻译自 [Improving the performance of an ANTLR parser](https://tomassetti.me/improving-the-performance-of-an-antlr-parser/)，主要介绍了 Antlr 解析性能优化相关的经验，文中也增加了笔者个人的理解，期望对广大 Antlr 用户有所帮助。

## 前言

很多人问我们如何提高解析器的性能，有时解析器是用一些旧库完成的，有时解析器是用 ANTLR 创建的。在本文中，我们提供了一些关于提高 [ANTLR 解析器](https://tomassetti.me/antlr-mega-tutorial/)性能的建议。

首先，我们需要声明一下：**如果想要绝对最佳的性能，你可能需要选择自定义解析器**。你将会花费十倍的维护成本，并且效率会降低，但你将获得最佳的性能。这就是 C# 或 Java 等语言的官方解析器的构建方式。在这些情况下，自定义解析器是有意义的，但在绝大多数情况下，它没有意义。使用 ANTLR 或其他解析器生成器比手动编写自定义解析器要高效得多。此外，除非你有构建自定义解析器的经验，否则你的性能可能也会更差。

你还应该检查问题是否确实出在解析器上，而不是解析后执行的操作。在大多数应用程序中，解析只是程序所做工作的一小部分。毕竟，你不想只解析一些代码，而是希望利用解析获得的信息做一些事情。

现在这个问题已经解决了，让我们看看如何改进你的 [ANTLR 解析器](https://tomassetti.me/antlr-mega-tutorial/)。

## ANTLR 运行时有所不同

只需要一个 [ANTLR 工具](https://tomassetti.me/antlr-mega-tutorial/)就可以为所有支持的目标语言生成解析器。但是，每种支持的语言都需要不同的运行时。

每个运行时都会有不同的性能和潜在问题。运行时通常会遵循其各自语言的性能特征。例如，Python 运行时通常比 C# 运行时慢。根据运行时的成熟度，也有一些例外。例如，新的运行时的性能可能低于其可能的性能，因为它仍未针对性能进行优化。

你可以在官方文档中看到受支持目标的更新列表：[运行时库和代码生成目标](https://github.com/antlr/antlr4/blob/master/doc/targets.md)。

这意味着如果你遇到性能问题，更改运行时的目标语言可能会很有用。例如，你可以用 C++ 而不是 Python 生成解析器。这并不意味着你必须用另一种语言重写整个程序。解析器主要用于将代码转换为其他内容的管道中。解析器本身将生成解析树。然后可以将其转换为抽象语法树并由你的应用程序使用。我们为客户使用的常见策略是：

- 我们用 Java 创建解析器，将解析树转换为 AST，然后输出 JSON 或 XML 文件；
- 然后客户端应用程序将以他们喜欢的任何语言使用此文件；

这使我们能够确保获得的一定级别的性能，这些性能在 Python 中可能无法达到，并且它还允许客户端在自己的代码中继续使用 Python，这些代码会为了某些目标而消费 AST 结果。

## 一些示例数字

TODO

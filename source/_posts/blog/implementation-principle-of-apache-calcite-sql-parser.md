---
title: Apache Calcite SQL Parser 原理剖析
tags: [Calcite, JavaCC]
categories: [Calcite]
banner: china
date: 2023-10-09 08:28:49
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
references:
  - title: 'JavaCC 官方文档'
    url: https://javacc.github.io/javacc/
  - title: 'JavaCC Grammar 文档'
    url: https://javacc.github.io/javacc/documentation/grammar.html
  - title: 'JavaCC 实战'
    url: https://alphahinex.github.io/2022/05/01/javacc-in-action/
  - title: 'Calcite - 看懂 Parser.jj 中的 SqlSelect'
    url: https://www.jianshu.com/p/ddb5e4788500
---

## 前言

在 [Apache Calcite 快速入门指南](https://strongduanmu.com/blog/apache-calcite-quick-start-guide.html) 一文中我们介绍了 Caclite 的执行流程，包括了：`Parse`、`Validate`、`Optimize` 和 `Execute` 四个主要阶段。`Parse` 阶段是整个流程的基础，负责将用户输入的 SQL 字符串解析为 SqlNode 语法树，为后续的元数据校验、逻辑优化、物理优化和计划执行打好基础。Calcite SQL 解析采用的是 JavaCC 框架，本文首先会简要介绍 JavaCC 的使用规范，再结合 Calcite 源码对 SQL 解析引擎进行深入的探究学习。

![Calcite 执行流程](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/09/24/1695513880.png)

## JavaCC 简介

Calcite SQL Parser 使用了 JavaCC 框架， 根据 [JavaCC 官网](https://javacc.github.io/javacc/)介绍，JavaCC 是当前流行的解析生成器，它可以读取语法规则，并将语法规则转换为 Java 程序，通过生成的 Java 程序，可以很方便地完成语法解析过程中的词法分析和语法分析（和 JavaCC 类似，Antlr 是另外一款流行的解析器，读者感兴趣可以参考 [ANTLR 基础入门](https://strongduanmu.com/blog/introduction-to-antlr.html)）。

> Java Compiler Compiler (JavaCC) is the most popular **parser generator** for use with Java applications. A parser generator is a tool that **reads a grammar specification** and **converts it to a Java program that can recognize matches to the grammar**. In addition to the parser generator itself, JavaCC provides other standard capabilities related to parser generation such as **tree building** (via a tool called JJTree included with JavaCC), **actions and debugging**. 

JavaCC 的使用和编写 Java 代码类似，开发者需要在 `*.jj` 文件中编写语法规则以及对应的 Java 代码处理逻辑，JavaCC 语法描述遵循以下模板结构：

```bnf
javacc_input ::= javacc_options
                 "PARSER_BEGIN" "(" <IDENTIFIER> ")"
                 java_compilation_unit
                 "PARSER_END" "(" <IDENTIFIER> ")"
                 ( production )+
                 <EOF>

// JavaCC 配置项
javacc_options ::= [ "options" "{" ( option-binding )*; "}" ]

// 解析器类定义
CompilationUnit ::= ( PackageDeclaration )?
                    ( ImportDeclaration )*
                    ( TypeDeclaration )*

// 定义词法和语法规则
production ::= javacode_production
             | cppcode_production
             // 描述词法规则
             | regular_expr_production
             | token_manager_decls
             // 描述语法规则
             | bnf_production
```

* `javacc_options` 用于定义 JavaCC 解析配置项，格式为 `key=value`，例如：`IGNORE_CASE = true;`，声明在解析阶段忽略大小写；
* `java_compilation_unit` 用于定义 JavaCC 生成解析器类的定义，该代码块包含在 `PARSER_BEGIN` 和 `PARSER_END` 中；
* `production` 用于定义解析中关键的词法和语法规则，JavaCC 将词法规则（如保留字、表达式）和语法规则（BNF）都统一写在一个文件中，并支持使用正则表达式，使语法描述文件易读且易于维护；
  * `javacode_production` 
  * `regular_expr_production` 用于描述词法规则，可以通过 `SKIP` 指定要忽略的内容（空格、换行等），通过 `TOKEN` 定义语法中的保留字；
  * `bnf_production` 用于描述语法规则，能够支持复杂的语法描述，

TODO

```jj
options {
    JavaCC 配置项
}

PARSER_BEGIN(解析器类名)
package 包名;
import 库名;

public class 解析器类名 {
    Java 代码处理逻辑
}
PARSER_END(解析器类名)

解析逻辑

Token 定义
```





{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了`Calcite 从入门到精通`知识星球，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。
{% note color:green 目前星球刚创建，内部积累的资料还很有限，因此暂时不收费，感兴趣的同学可以联系我，免费邀请进入星球。 %}

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

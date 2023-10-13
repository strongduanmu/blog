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
  - title: 'JavaCC 语法文档'
    url: https://javacc.github.io/javacc/documentation/grammar.html
  - title: 'JavaCC 实战'
    url: https://alphahinex.github.io/2022/05/01/javacc-in-action/
  - title: 'Calcite - 看懂 Parser.jj 中的 SqlSelect'
    url: https://www.jianshu.com/p/ddb5e4788500
  - title: 'Apache Calcite SQL 解析及语法扩展'
    url: https://zhuanlan.zhihu.com/p/509681717
---

## 前言

在 [Apache Calcite 快速入门指南](https://strongduanmu.com/blog/apache-calcite-quick-start-guide.html) 一文中，我们介绍了 Caclite 的执行流程，包括：`Parse`、`Validate`、`Optimize` 和 `Execute` 四个主要阶段。`Parse` 阶段是整个流程的基础，负责将用户输入的 SQL 字符串解析为 SqlNode 语法树，为后续的元数据校验、逻辑优化、物理优化和计划执行打好基础。

Calcite SQL 解析采用的是 `JavaCC` 框架，本文首先会简要介绍 JavaCC 的使用规范，并结合 Calcite 源码对 JavaCC 的使用方式进行学习，然后我们会关注 Calcite SQL Parser 的实现以及 SqlNode 体系，最后我们会了解如何使用 `Freemarker` 模板对 Caclite 解析进行扩展，期望通过这些内容能够帮助大家深刻理解 Caclite SQL 解析。

![Calcite 执行流程](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/13/1697156972.png)

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
			 // 编写通用 Java 代码
production ::= javacode_production
             | cppcode_production
             // 描述词法规则
             | regular_expr_production
             | token_manager_decls
             // 描述语法规则
             | bnf_production
```

了解了 JavaCC 语法描述的基本结构后，我们结合 Calcite `Parser.jj` 文件，来具体看下这些规则应该如何配置，以及在 Calcite SQL Parser 中起到了什么作用。

* **javacc_options**：

用于定义 JavaCC 解析配置项，格式为 `key=value`，例如：`IGNORE_CASE = true;`，声明在解析阶段忽略大小写。`STATIC = false` 用于控制 JavaCC 生成的代码，成员变量和方法是否为静态方法，通常都是设置为 false。`UNICODE_INPUT = true` 则用于设置包括中文在内的各种字符解析。

```java
options {
    // JavaCC 配置项
    STATIC = false;
    IGNORE_CASE = true;
    UNICODE_INPUT = true;
}
```

* **java_compilation_unit**：

用于定义 JavaCC 生成解析器类的定义，该代码块包含在 `PARSER_BEGIN` 和 `PARSER_END` 中。Calcite 中使用 `Freemarker` 模板引擎，解析器类名由参数传入，然后继承 SqlAbstractParserImpl 抽象类，该类提供了如 `createCall` 等基础方法，以及 `getMetadata`、`getPos`、`parseSqlStmtEof` 等抽象方法。

```java
// 解析器开始标记
PARSER_BEGIN(${parser.class})

package ${parser.package};

import org.apache.calcite.avatica.util.Casing;

public class ${parser.class} extends SqlAbstractParserImpl
	// Java 处理逻辑

// 解析器结束标记
PARSER_END(${parser.class})
```

* **production**：

用于定义解析中关键的词法和语法规则，JavaCC 将词法规则（如保留字、表达式）和语法规则（BNF）都统一写在一个文件中，并支持使用正则表达式，使语法描述文件易读且易于维护。`production` 语法规则中包含了 `javacode_production`、`regular_expr_production` 和 `bnf_production` 几个重要的子规则，我们结合 Calcite 的示例来学习下这些规则的使用。

* **javacode_production**：

用于编写供解析器调用的通用 Java 代码，例如：`getPos` 方法获取 Token 的位置，该部分代码以 `JAVACODE` 关键字开始。

```java
// 公共方法，供解析器调用
JAVACODE protected SqlParserPos getPos()
{
    return new SqlParserPos(
        token.beginLine,
        token.beginColumn,
        token.endLine,
        token.endColumn);
}
```

* **regular_expr_production**：

用于描述词法规则，可以通过 `SKIP` 指定要忽略的内容（空格、换行等），通过 `TOKEN` 定义语法中的关键字，每个 Token 用尖括号标识，多个 Token 之间用竖线分隔。尖括号里面用冒号分隔，冒号前面是变量名，后面是对应的正则表达式。

```java
// 词法规则
<DEFAULT, DQID, BTID, BQID, BQHID> TOKEN :
{
    < HINT_BEG: "/*+">
|   < COMMENT_END: "*/" >
}
```

* **bnf_production**：

用于描述语法规则，能够支持复杂的语法描述，可以使用正则表达式中 `[]`、`()` 和 `|` 表示可选、必选和分支。

```java
// 语法规则和 Java 处理逻辑
/*****************************************
 * Syntactical Descriptions              *
 *****************************************/
SqlNode ExprOrJoinOrOrderedQuery(ExprContext exprContext) :
{
    SqlNode e;
    final List<Object> list = new ArrayList<Object>();
}
{
    // Lookhead to distinguish between "TABLE emp" (which will be
    // matched by ExplicitTable() via Query())
    // and "TABLE fun(args)" (which will be matched by TableRef())
    (
        LOOKAHEAD(2)
        e = Query(exprContext)
        e = OrderByLimitOpt(e)
        { return e; }
    |
        e = TableRef1(ExprContext.ACCEPT_QUERY_OR_JOIN)
        ( e = JoinTable(e) )*
        { list.add(e); }
        ( AddSetOpQuery(list, exprContext) )*
        { return SqlParserUtil.toTree(list); }
    )
}
```

## Calcite SQL Parser 实现

TODO

## Calcite SqlNode 体系 & SQL 生成

TODO



## Calcite SQL Parser 扩展

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了`Calcite 从入门到精通`知识星球，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。
{% note color:green 目前星球刚创建，内部积累的资料还很有限，因此暂时不收费，感兴趣的同学可以联系我，免费邀请进入星球。 %}

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

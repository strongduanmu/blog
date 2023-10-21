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

> 注意：本文基于 [Calcite 1.35.0](https://github.com/apache/calcite/tree/75750b78b5ac692caa654f506fc1515d4d3991d6) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

在 [Apache Calcite 快速入门指南](https://strongduanmu.com/blog/apache-calcite-quick-start-guide.html) 一文中，我们介绍了 Caclite 的执行流程，包括：`Parse`、`Validate`、`Optimize` 和 `Execute` 四个主要阶段。`Parse` 阶段是整个流程的基础，负责将用户输入的 SQL 字符串解析为 SqlNode 语法树，为后续的元数据校验、逻辑优化、物理优化和计划执行打好基础。

Calcite SQL 解析采用的是 `JavaCC` 框架，本文首先会简要介绍 JavaCC 的使用规范，并结合 Calcite 源码对 JavaCC 的使用方式进行学习。然后我们会关注 Calcite SQL Parser 的实现，以及如何使用 `Freemarker` 模板对 Caclite 解析进行扩展。最后我们再学习下解析后的 AST 对象——`SqlNode` 体系，以及基于 SqlNode 的 SQL 生成，期望通过这些内容能够帮助大家深刻理解 Caclite SQL 解析。

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

大致了解 JavaCC 语法描述的基本结构后，我们结合 Calcite `Parser.jj` 文件，来具体看下这些规则应该如何配置，以及在 Calcite SQL Parser 中起到了什么作用。

* **javacc_options** 规则：

用于定义 JavaCC 解析配置项，格式为 `key=value`，例如：`IGNORE_CASE = true;`，声明在解析阶段忽略大小写。`STATIC = false` 用于控制 JavaCC 生成的代码，成员变量和方法是否为静态方法，通常都是设置为 false。`UNICODE_INPUT = true` 则用于设置包括中文在内的各种字符解析。

```java
options {
    // JavaCC 配置项
    STATIC = false;
    IGNORE_CASE = true;
    UNICODE_INPUT = true;
}
```

* **java_compilation_unit** 规则：

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

* **production** 规则：

用于定义解析中关键的词法和语法规则，JavaCC 将词法规则（如保留字、表达式）和语法规则（BNF）都统一写在一个文件中，并支持使用正则表达式，使语法描述文件易读且易于维护。`production` 语法规则中包含了 `javacode_production`、`regular_expr_production` 和 `bnf_production` 几个重要的子规则，我们结合 Calcite 的示例来学习下这些规则的使用。

* **javacode_production** 规则：

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

* **regular_expr_production** 规则：

用于描述词法规则，可以通过 `SKIP` 指定要忽略的内容（空格、换行等），通过 `TOKEN` 定义语法中的关键字，每个 Token 用尖括号标识，多个 Token 之间用竖线分隔。尖括号里面用冒号分隔，冒号前面是变量名，后面是对应的正则表达式。

`DEFAULT`, `DQID`, `BTID`, `BQID`，`BQHID` 等是词法状态，其中 `DEFAULT`, `DQID`, `BTID`, `BQID` 是 4 种正常状态，除了如何识别带引号的标识符之外，他们的行为相同。`BQHID` 状态仅存在于表名的开头（例如紧靠在 `FROM` 或 `INSERT INTO` 后面），一旦遇到标识符，词法状态就会转移至 `BTID`。

```java
/*
Lexical states:

DEFAULT: Identifiers are quoted in brackets, e.g. [My Identifier]
DQID:    Identifiers are double-quoted, e.g. "My Identifier"
BTID:    Identifiers are enclosed in back-ticks, escaped using back-ticks,
         e.g. `My ``Quoted`` Identifier`
BQID:    Identifiers are enclosed in back-ticks, escaped using backslash,
         e.g. `My \`Quoted\` Identifier`,
         and with the potential to shift into BQHID in contexts where table
         names are expected, and thus allow hyphen-separated identifiers as
         part of table names
BQHID:   Identifiers are enclosed in back-ticks, escaped using backslash,
         e.g. `My \`Quoted\` Identifier`
         and unquoted identifiers may contain hyphens, e.g. foo-bar
IN_SINGLE_LINE_COMMENT:
IN_FORMAL_COMMENT:
IN_MULTI_LINE_COMMENT:

DEFAULT, DQID, BTID, BQID are the 4 'normal states'. Behavior is identical
except for how quoted identifiers are recognized.

The BQHID state exists only at the start of a table name (e.g. immediately after
FROM or INSERT INTO). As soon as an identifier is seen, the state shifts back
to BTID.

After a comment has completed, the lexer returns to the previous state, one
of the 'normal states'.
*/

// 词法规则
<DEFAULT, DQID, BTID, BQID, BQHID> TOKEN :
{
    < HINT_BEG: "/*+">
|   < COMMENT_END: "*/" >
}
```

* **bnf_production** 规则：

用于描述语法规则，能够支持复杂的语法描述，语法规则大体上类似于 Java 代码，首先是方法声明 `SqlNode ExprOrJoinOrOrderedQuery(ExprContext exprContext)`，后面紧跟着冒号 `:` 和两对花括号，第一对花括号用于声明变量，第二对花括号则用于编写解析逻辑。

JavaCC 语法规则很灵活，可以使用正则表达式， `[]`、`()` 和 `|` 分别表示可选、必选和分支。在解析分支语法时，可能需要通过大量的回溯操作才能完成分支的选择，JavaCC 为了优化回溯带来的性能问题，默认只向前查看一个 `TOKEN`（可满足大部分解析需求），可以通过 `LOOKAHEAD(2)` 指定向前查看的 `TOKEN` 数，从而做出最好的选择。

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

以上大致介绍了 Calcite SQL Parser 使用到的 JavaCC 相关知识，如果读者对 JavaCC 感兴趣，可以查看参考资料中的官方文档以及 JavaCC 博文进行学习。下面让我们再来学习下 Calcite SQL Parser 的整体实现，如何通过 Java 代码调用解析逻辑，实现 SQL 字符串到 AST 的解析。

## Calcite SQL Parser 实现

Calcite SQL Parser 的核心实现在 `calcite-core` 模块，在 `src/main` 下包含了 `codegen` 目录，`Parser.jj` 文件是 SQL Parser 相关的词法和语法规则文件，并且为了实现 SQL Parser 的扩展，Calcite 采用了 Freemarker 模板引擎，`config.fmpp` 和 `default_config.fmpp` 用于定义 Freemarker 模板的属性。

![Calcite SQL Parser 解析文件](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202310160859394.png)

Calcite SQL Parser 的入口类是 `SqlParser`，调用 `SQLParser.create` 可以快速创建解析对象，然后进行 SQL 解析。`SPAN`  类是 `SqlParserPos` 的构建器，构建的 `SqlParserPos` 对象主要用来记录 `TOKEN` 在 SQL 中的位置。`SqlAbstractParserImpl` 是解析的抽象类，Calcite 中生成的 `SqlParserImpl`、`SqlBabelParserImpl` 和 `SqlDdlParserImpl` 都继承了该抽象类。

![Calcite SQL Parser 核心类](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202310160913074.png)

Calcite SQL Parser 调用非常简单，按照如下示例可以快速地解析并获取 AST 对象。`SqlParser.create` 方法传入要解析的 SQL 字符串，以及一个 Config 对象。

```java
String sql = "select name from EMPS";
SqlParser sqlParser = SqlParser.create(sql, Config.DEFAULT);
SqlNode sqlNode = sqlParser.parseQuery();
System.out.println(sqlNode.toSqlString(MysqlSqlDialect.DEFAULT));
```

Config 对象则是通过 `Immutable` 注解自动生成的实现类，它实现了接口方法定义的解析相关配置。例如：包含引号的标识符如何处理大小写、不包含引号的标识符如何处理大小写以及是否大小写敏感等（更多 Config 配置读者可以参考 [Config 类源码](https://github.com/apache/calcite/blob/a0e119ea42def418957f214f539469f1aba76c18/core/src/main/java/org/apache/calcite/sql/parser/SqlParser.java#L266)）。

```java
Config withQuotedCasing(Casing casing);
Config withUnquotedCasing(Casing casing);
Config withCaseSensitive(boolean caseSensitive);
...
```

Calcite 解析器核心的 SqlParser 类除了提供静态 `create` 方法创建解析器对象外，还提供了如下的解析方法，用于处理不同场景下的 SQL 解析。

```java
// 解析 SQL 表达式
public SqlNode parseExpression() throws SqlParseException {...}
// 解析 SQL 查询语句
public SqlNode parseQuery() throws SqlParseException {...}
// 解析 SQL 查询语句
public SqlNode parseQuery(String sql) throws SqlParseException {...}
// 解析 SQL 语句
public SqlNode parseStmt() throws SqlParseException {...}
// 解析分号分隔的 SQL 语句
public SqlNodeList parseStmtList() throws SqlParseException {...}
```

我们以常用的 `parseQuery()` 方法为例，来看下方法内部调用了哪些 JavaCC 生成的方法。parseQuery 方法首先调用了 parser 对象的 `parseSqlStmtEof` 方法，而 parser 对象是 `SqlAbstractParserImpl` 抽象类的实现类，此处我们先关注 `SqlParserImpl` 实现类。

```java
/**
 * Parses a <code>SELECT</code> statement.
 *
 * @return A {@link org.apache.calcite.sql.SqlSelect} for a regular <code>
 * SELECT</code> statement; a {@link org.apache.calcite.sql.SqlBinaryOperator}
 * for a <code>UNION</code>, <code>INTERSECT</code>, or <code>EXCEPT</code>.
 * @throws SqlParseException if there is a parse error
 */
public SqlNode parseQuery() throws SqlParseException {
    try {
        return parser.parseSqlStmtEof();
    } catch (Throwable ex) {
        throw handleException(ex);
    }
}
```

SqlParserImpl 类是通过 JavaCC 动态生成的实现类，内部的 parseSqlStmtEof 方法定义如下，会继续调用内部的 `SqlStmtEof` 方法。而 SqlStmtEof 方法会调用 `SqlStmt` 方法，在该方法内部会判断当前 SQL 的首个 Token 的类型，查询语句会调用 `OrderedQueryOrExpr(ExprContext.ACCEPT_QUERY)` 方法。

```java
// org/apache/calcite/sql/parser/impl/SqlParserImpl.java:205
public SqlNode parseSqlStmtEof() throws Exception {
    return SqlStmtEof();
}

/**
 * Parses an SQL statement followed by the end-of-file symbol.
 */
final public SqlNode SqlStmtEof() throws ParseException {
    SqlNode stmt;
    stmt = SqlStmt();
    jj_consume_token(0); {
        if (true) return stmt;
    }
    throw new Error("Missing return statement in function");
}

/**
 * Parses an SQL statement.
 */
final public SqlNode SqlStmt() throws ParseException {
    SqlNode stmt;
    switch ((jj_ntk == -1) ? jj_ntk() : jj_ntk) {
        case RESET:
        case SET:
            stmt = SqlSetOption(Span.of(), null);
            break;
        case ALTER:
            stmt = SqlAlter();
            break;
        case A:
				// ...
        case SELECT:
				// ...
  	    case UNICODE_QUOTED_IDENTIFIER:
            stmt = OrderedQueryOrExpr(ExprContext.ACCEPT_QUERY);
            break;
        case EXPLAIN:
            stmt = SqlExplain();
            break;
        case DESCRIBE:
            stmt = SqlDescribe();
            break;
        case INSERT:
        case UPSERT:
            stmt = SqlInsert();
            break;
        case DELETE:
            stmt = SqlDelete();
            break;
        case UPDATE:
            stmt = SqlUpdate();
            break;
        case MERGE:
            stmt = SqlMerge();
            break;
        case CALL:
            stmt = SqlProcedureCall();
            break;
        default:
            jj_la1[27] = jj_gen;
            jj_consume_token(-1);
            throw new ParseException();
    } {
        if (true) return stmt;
    }
    throw new Error("Missing return statement in function");
}
```

OrderedQueryOrExpr 方法的定义如下，该方法主要用于处理行表达式以及包含可选 `ORDER BY` 的 SELECT 语句。从方法实现逻辑可以看出，它首先调用 QueryOrExpr 方法构造了 SqlSelect 对象，然后再调用 OrderByLimitOpt 方法包装成 SqlOrderBy 对象。

```java
/**
 * Parses either a row expression or a query expression with an optional
 * ORDER BY.
 *
 * <p>Postgres syntax for limit:
 *
 * <blockquote><pre>
 *    [ LIMIT { count | ALL } ]
 *    [ OFFSET start ]</pre>
 * </blockquote>
 *
 * <p>Trino syntax for limit:
 *
 * <blockquote><pre>
 *    [ OFFSET start ]
 *    [ LIMIT { count | ALL } ]</pre>
 * </blockquote>
 *
 * <p>MySQL syntax for limit:
 *
 * <blockquote><pre>
 *    [ LIMIT { count | start, count } ]</pre>
 * </blockquote>
 *
 * <p>SQL:2008 syntax for limit:
 *
 * <blockquote><pre>
 *    [ OFFSET start { ROW | ROWS } ]
 *    [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]</pre>
 * </blockquote>
 */
final public SqlNode OrderedQueryOrExpr(ExprContext exprContext) throws ParseException {
    SqlNode e;
    e = QueryOrExpr(exprContext);
    e = OrderByLimitOpt(e); {
        if (true) return e;
    }
    throw new Error("Missing return statement in function");
}
```

QueryOrExpr 方法内部会依次调用 `LeafQueryOrExpr`、`LeafQuery` 和 `SqlSelect` 方法，在 `SqlSelect` 方法内部，则会对查询语句的每个语法片段依次进行初始化，最终返回 SqlSelect 对象。SqlSelect 对象初始化的调用链路如下图所示。

![SqlSelect 初始化调用链路](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/18/1697586335.png)

## Calcite SQL Parser 扩展

尽管 Calcite SQL Parser 已经支持了主流数据库的 DML 语句解析，但是考虑到数据库生态的多样性，大多数据库都提供了特有的 SQL 方言。为了能够灵活地支持数据库方言，Calcite SQL Parser 支持用户扩展，通过 Freemarker 模板可以将 Calcite 内置的解析文件和用户自定义的解析文件整合到一个 JavaCC 文件中，从而实现 SQL 解析能力的扩展。

Calcite SQL Parser 语法扩展流程如下图所示，Calcite 在 templates 目录提供了内置的 `Parser.jj` 模板，在 includes 目录提供了扩展的 `compoundIdentifier.ftl` 和 `parserImpls.ftl` 模板。这些模板通过 `FMPP`（FreeMarker Preprocessor）可以生成最终的解析文件 `Parser.jj`，再交由 JavaCC 编译工具生成 SqlParserImpl 类。

![Calcite SQL Parser 语法扩展流程](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/18/1697590210.png)

`core` 模块 `build.gradle.kts` 中的脚本也印证了以上的处理流程，先执行 `FmppTask`，再执行 `JavaCCTask`。

```kotlin
val fmppMain by tasks.registering(org.apache.calcite.buildtools.fmpp.FmppTask::class) {
    config.set(file("src/main/codegen/config.fmpp"))
    templates.set(file("src/main/codegen/templates"))
}

val javaCCMain by tasks.registering(org.apache.calcite.buildtools.javacc.JavaCCTask::class) {
    dependsOn(fmppMain)
    val parserFile = fmppMain.map {
        it.output.asFileTree.matching { include("**/Parser.jj") }
    }
    inputFile.from(parserFile)
    packageName.set("org.apache.calcite.sql.parser.impl")
}
```

了解了 Calcite SQL Parser 语法扩展的流程后，我们再来看一个语法扩展的例子。在 `server` 模块，Calcite 使用相同的扩展方法，增加了对 DDL 语句的支持。下图展示了 `server` 模块语法扩展使用到的文件——`config.fmpp` 和 `parserImpls.ftl`。

![Server 模块语法扩展文件](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/18/1697604159.png)

`config.fmpp` 文件（如下所示）定义了 `Parser.jj` 模板中需要使用的参数，如果未配置则默认会使用 `default_config.fmpp` 中的参数。`parser` 下的 `package`、`class` 和 `imports` 用于定义生成的解析器类的`包名`、`类名`和`引入的包`。`keywords` 用于定义扩展语法中的关键字，`nonReservedKeywordsToAdd` 用于定义非保留的关键字。`createStatementParserMethods`、`dropStatementParserMethods ` 和 `truncateStatementParserMethods` 分别用于定义 DDL 语句中 `CREATE`、`DROP` 和 `TRUNCATE` 语句的初始化方法。`implementationFiles` 则用于定义这些方法的实现文件。

```json
data: {
  # Data declarations for this parser.
  #
  # Default declarations are in default_config.fmpp; if you do not include a
  # declaration ('imports' or 'nonReservedKeywords', for example) in this file,
  # FMPP will use the declaration from default_config.fmpp.
  parser: {
    # Generated parser implementation class package and name
    package: "org.apache.calcite.sql.parser.ddl",
    class: "SqlDdlParserImpl",

    # List of import statements.
    imports: [
      "org.apache.calcite.schema.ColumnStrategy"
      "org.apache.calcite.sql.SqlCreate"
      "org.apache.calcite.sql.SqlDrop"
      "org.apache.calcite.sql.SqlTruncate"
      "org.apache.calcite.sql.ddl.SqlDdlNodes"
    ]

    # List of new keywords. Example: "DATABASES", "TABLES". If the keyword is
    # not a reserved keyword, add it to the 'nonReservedKeywords' section.
    keywords: [
      "IF"
      "MATERIALIZED"
      "STORED"
      "VIRTUAL"
      "JAR"
      "FILE"
      "ARCHIVE"
    ]

    # List of non-reserved keywords to add;
    # items in this list become non-reserved
    nonReservedKeywordsToAdd: [
      # not in core, added in server
      "IF"
      "MATERIALIZED"
      "STORED"
      "VIRTUAL"
      "JAR"
      "FILE"
      "ARCHIVE"
    ]

    # List of methods for parsing extensions to "CREATE [OR REPLACE]" calls.
    # Each must accept arguments "(SqlParserPos pos, boolean replace)".
    # Example: "SqlCreateForeignSchema".
    createStatementParserMethods: [
      "SqlCreateForeignSchema"
      "SqlCreateMaterializedView"
      "SqlCreateSchema"
      "SqlCreateTable"
      "SqlCreateType"
      "SqlCreateView"
      "SqlCreateFunction"
    ]

    # List of methods for parsing extensions to "DROP" calls.
    # Each must accept arguments "(SqlParserPos pos)".
    # Example: "SqlDropSchema".
    dropStatementParserMethods: [
      "SqlDropMaterializedView"
      "SqlDropSchema"
      "SqlDropTable"
      "SqlDropType"
      "SqlDropView"
      "SqlDropFunction"
    ]

    # List of methods for parsing extensions to "TRUNCATE" calls.
    # Each must accept arguments "(SqlParserPos pos)".
    # Example: "SqlTruncateTable".
    truncateStatementParserMethods: [
      "SqlTruncateTable"
    ]

    # List of files in @includes directory that have parser method
    # implementations for parsing custom SQL statements, literals or types
    # given as part of "statementParserMethods", "literalParserMethods" or
    # "dataTypeParserMethods".
    # Example: "parserImpls.ftl".
    implementationFiles: [
      "parserImpls.ftl"
    ]
  }
}

# 定义引入 Freemarker 文件的路径
freemarkerLinks: {
  includes: includes/
}
```

以 `SqlCreateForeignSchema` 方法为例，它的实现逻辑在 `parserImpls.ftl` 中，和 Calcite 内置的语法解析逻辑类似，遵循同样的编写规则。

```java
SqlCreate SqlCreateForeignSchema(Span s, boolean replace) :
{
    final boolean ifNotExists;
    final SqlIdentifier id;
    SqlNode type = null;
    SqlNode library = null;
    SqlNodeList optionList = null;
}
{
    <FOREIGN> <SCHEMA> ifNotExists = IfNotExistsOpt() id = CompoundIdentifier()
    (
         <TYPE> type = StringLiteral()
    |
         <LIBRARY> library = StringLiteral()
    )
    [ optionList = Options() ]
    {
        return SqlDdlNodes.createForeignSchema(s.end(this), replace,
            ifNotExists, id, type, library, optionList);
    }
}
```

`server` 模块 `build.gradle.kts` 文件定义的 FMPP 任务稍有不同，它会指定 `core` 模块 `templates` 目录下的 `Parser.jj` 作为模板，扩展的语法定义会被整合到模板中，统一输出最终的 `Parser.jj` 文件。

```kotlin
val fmppMain by tasks.registering(org.apache.calcite.buildtools.fmpp.FmppTask::class) {
    inputs.dir("src/main/codegen").withPathSensitivity(PathSensitivity.RELATIVE)
    config.set(file("src/main/codegen/config.fmpp"))
    templates.set(file("$rootDir/core/src/main/codegen/templates"))
}

val javaCCMain by tasks.registering(org.apache.calcite.buildtools.javacc.JavaCCTask::class) {
    dependsOn(fmppMain)
    val parserFile = fmppMain.map {
        it.output.asFileTree.matching { include("**/Parser.jj") }
    }
    inputFile.from(parserFile)
    packageName.set("org.apache.calcite.sql.parser.ddl")
}
```

想观察整个过程的读者，可以尝试执行 `ServerParserTest#testCreateForeignSchema` 单元测试，可以看到 `build` 目录生成了统一的 `Parser.jj` 文件。然后经过 JavaCC 编译生成了 `SqlDdlParserImpl` 类。

![执行 DDL 单测编译生成 SqlDdlParserImpl](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/18/1697605707.png)

## Calcite SqlNode 体系 & SQL 生成

前面我们学习了 Calcite SQL Parser 的实现和扩展，在最后一个部分，我们再来了解下 Calcite SQL Parser 的最终产物——SqlNode。SqlNode 是 Calcite 中负责封装语义信息的基础类，除了在解析阶段使用外，它还在校验（`validate`）、转换 RelNode（`convert`）以及生成不同方言的 SQL（`toSqlString`）等阶段都发挥了重要作用。

SqlNode 是所有解析节点的父类，Calcite 中目前有 70 多个实现类，这些类共同组成了 SqlNode 体系。SqlNode 体系总体上可以分为 3 大类：`SqlCall`、`SqlLiteral` 和 `SqlIdentifier`。从下图中可以看出 `SqlNode` 抽象类定义了 `validate`、`unparse` 和 `accept` 等抽象方法，各实现类负责实现当前节点的处理逻辑，从而保证 SqlNode 体系能够完成元数据校验、SQL 方言生成等功能。

![SqlNode 体系分类](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/19/1697676145.png)

下面我们再来具体了解下 `SqlCall`、`SqlLiteral` 和 `SqlIdentifier` 这 3 类 SqlNode 分别包含了哪些子类，以及他们的具体作用。

* `SqlCall`：代表了对 SqlOperator 的调用，Calcite 中每个操作都可以对应一个 SqlCall，例如查询操作是 SqlSelectOperator，对应的 SqlNode 是 `SqlSelect`。常用的 SqlCall 实现类如下图所示，包含了`SqlSelect`、`SqlDelete`、`SqlUpdate`、`SqlInsert` 和 `SqlMerge` 等。

{% image https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/19/1697677726.png SqlCall 子类体系 width:500px padding:20px bg:white %}

以 SqlSelect 为例，类中包含了查询语句涉及的子句，`selectList` 代表了查询中的投影列，`from` 代表了查询的表，`where` 则代表了查询条件，其他字段也都和查询语句中的子句能够一一对应。

```java
/**
 * A <code>SqlSelect</code> is a node of a parse tree which represents a select
 * statement. It warrants its own node type just because we have a lot of
 * methods to put somewhere.
 */
public class SqlSelect extends SqlCall {
    //~ Static fields/initializers ---------------------------------------------

    // constants representing operand positions
    public static final int FROM_OPERAND = 2;
    public static final int WHERE_OPERAND = 3;
    public static final int HAVING_OPERAND = 5;
    public static final int QUALIFY_OPERAND = 7;

    SqlNodeList keywordList;
    SqlNodeList selectList;
    @Nullable SqlNode from;
    @Nullable SqlNode where;
    @Nullable SqlNodeList groupBy;
    @Nullable SqlNode having;
    SqlNodeList windowDecls;
    @Nullable SqlNode qualify;
    @Nullable SqlNodeList orderBy;
    @Nullable SqlNode offset;
    @Nullable SqlNode fetch;
    @Nullable SqlNodeList hints;
}
```

前文示例中的 `select name from EMPS` 语句，经过 Calcite SQL Parser 解析，最终能够得到如下的 AST 结构（SqlNode 树）：

![AST 抽象语法树](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/20/1697762396.png)

* `SqlIdentifier`：代表 SQL 中的标识符，例如 SQL 语句中的表名、字段名。
* `SqlLiteral`：主要用于封装 SQL 中的常量，通常也叫做字面量。

![SqlLiteral 子类体系](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/19/1697677850.png)

Calcite 支持了众多类型的常量，下表展示了常量类型及其含义，可供大家学习参考。

| 类型名称                                                 | 类型含义                                              | 值类型                            |
| -------------------------------------------------------- | ----------------------------------------------------- | --------------------------------- |
| SqlTypeName.NULL                                         | 空值。                                                | null                              |
| SqlTypeName.BOOLEAN                                      | Boolean 类型，包含：`TRUE`，`FALSE` 或者 `UNKNOWN`。  | Boolean 类型，null 代表 UNKNOWN。 |
| SqlTypeName.DECIMAL                                      | 精确数值，例如：`0`，`-.5`，`12345`。                 | BigDecimal                        |
| SqlTypeName.DOUBLE                                       | 近似数值，例如：`6.023E-23`。                         | BigDecimal                        |
| SqlTypeName.DATE                                         | 日期，例如：`DATE '1969-04'29'`。                     | Calendar                          |
| SqlTypeName.TIME                                         | 时间，例如：`TIME '18:37:42.567'`。                   | Calendar                          |
| SqlTypeName.TIMESTAMP                                    | 时间戳，例如：`TIMESTAMP '1969-04-29 18:37:42.567'`。 | Calendar                          |
| SqlTypeName.CHAR                                         | 字符常量，例如：`'Hello, world!'`。                   | NlsString                         |
| SqlTypeName.BINARY                                       | 二进制常量，例如：`X'ABC', X'7F'`。                   | BitString                         |
| SqlTypeName.SYMBOL                                       | 符号是一种特殊类型，用于简化解析。                    | An Enum                           |
| SqlTypeName.INTERVAL_YEAR .. SqlTypeName.INTERVAL_SECOND | 时间间隔，例如：`INTERVAL '1:34' HOUR`。              | SqlIntervalLiteral.IntervalValue. |

通过 SqlNode 体系的介绍，我们大致了解了不同类型 SqlNode 的用途，在 Calcite 中 SqlNode 还有一个强大的功能——SQL 生成。因为 Calcite 的目标是适配各种不同的存储引擎，提供统一的查询引擎，因此 Calcite 需要通过 SqlNode 语法树，生成不同存储引擎对应的 SQL 方言或者 DSL 语言。

在 SqlNode 中提供了 `toSqlString` 方法，允许用户传入不同的数据库方言，将 SqlNode 语法树转换为对应方言的 SQL 字符串。

```java
String sql = "select name from EMPS";
SqlParser sqlParser = SqlParser.create(sql, Config.DEFAULT);
SqlNode sqlNode = sqlParser.parseQuery();
System.out.println(sqlNode.toSqlString(MysqlSqlDialect.DEFAULT));
```

`toSqlString` 方法实现逻辑如下，它会调用重载方法并且额外传入参数 `forceParens`，该参数用于控制表达式是否需要使用括号。

```java
public SqlString toSqlString(@Nullable SqlDialect dialect) {
    return toSqlString(dialect, false);
}

public SqlString toSqlString(@Nullable SqlDialect dialect, boolean forceParens) {
    return toSqlString(c - >
        c.withDialect(Util.first(dialect, AnsiSqlDialect.DEFAULT))
        .withAlwaysUseParentheses(forceParens)
        .withSelectListItemsOnSeparateLines(false)
        .withUpdateSetListNewline(false)
        .withIndentation(0));
}
```

在 toSqlString 重载方法内部，会初始化 `SqlWriterConfig` 参数，该参数用于控制 SQL 翻译过程中的换行、是否添加标识符引号等行为。参数初始化完成后，会将参数设置作为 Lambda 函数传递到另一个重载方法中。在该重载方法内部，会创建 `SqlPrettyWriter` 作为 SQL 生成的容器，它会记录 SQL 生成过程中的 SQL 字符片段。SQL 生成的核心逻辑是 `unparse` 方法，调用时会传入容器 writer 类。

```java
public SqlString toSqlString(UnaryOperator < SqlWriterConfig > transform) {
    final SqlWriterConfig config = transform.apply(SqlPrettyWriter.config());
    SqlPrettyWriter writer = new SqlPrettyWriter(config);
    unparse(writer, 0, 0);
    return writer.toSqlString();
}
```

示例中最外层 SqlNode 为 SqlSelect，因此调用的方法为 [SqlSelect#unparse](https://github.com/apache/calcite/blob/2af15496511c151b3e166f0300af386f38b459ef/core/src/main/java/org/apache/calcite/sql/SqlSelect.java#L286)，具体逻辑如下。该方法会判断当前查询是否为子查询，是子查询则创建一个新的 `SqlWriter.Frame`，然后调用不同方言的 unparseCall 方法生成 SQL，如果不是子查询，则直接调用不同方言的 unparseCall 方法生成 SQL。

```java
// Override SqlCall, to introduce a sub-query frame.
@Override
public void unparse(SqlWriter writer, int leftPrec, int rightPrec) {
    if (!writer.inQuery() || getFetch() != null && (leftPrec > SqlInternalOperators.FETCH.getLeftPrec() || rightPrec > SqlInternalOperators.FETCH.getLeftPrec()) || getOffset() != null && (leftPrec > SqlInternalOperators.OFFSET.getLeftPrec() || rightPrec > SqlInternalOperators.OFFSET.getLeftPrec()) || getOrderList() != null && (leftPrec > SqlOrderBy.OPERATOR.getLeftPrec() || rightPrec > SqlOrderBy.OPERATOR.getRightPrec())) {
        // If this SELECT is the topmost item in a sub-query, introduce a new
        // frame. (The topmost item in the sub-query might be a UNION or
        // ORDER. In this case, we don't need a wrapper frame.)
        final SqlWriter.Frame frame = writer.startList(SqlWriter.FrameTypeEnum.SUB_QUERY, "(", ")");
        writer.getDialect().unparseCall(writer, this, 0, 0);
        writer.endList(frame);
    } else {
        writer.getDialect().unparseCall(writer, this, leftPrec, rightPrec);
    }
}
```

由于我们示例中生成的是 MySQL 的方言，因此调用的是 [MysqlSqlDialect#unparseCall](https://github.com/apache/calcite/blob/362cc566ed745b0be895cb290dd55c7164f6099f/core/src/main/java/org/apache/calcite/sql/dialect/MysqlSqlDialect.java#L218) 方法，具体实现逻辑如下。前文我们介绍了 SqlCall 的用于，它代表了对 SqlOperator 的调用，此处为 SqlSelectOperator，它对应的 SqlKind 为 `SELECT`，因此会先调用 `super.unparseCall` 方法。可以看到，除了 default 分支外，其他分支在处理不同方言的差异，例如：将 `POSITION` 操作转换成 MySQL 中的 `INSTR`，将 `LISTAGG` 转换为 MySQL 中的 `GROUP_CONCAT`。

```java
@Override
public void unparseCall(SqlWriter writer, SqlCall call,
    int leftPrec, int rightPrec) {
    switch (call.getKind()) {
        case POSITION:
            final SqlWriter.Frame frame = writer.startFunCall("INSTR");
            writer.sep(",");
            call.operand(1).unparse(writer, leftPrec, rightPrec);
            writer.sep(",");
            call.operand(0).unparse(writer, leftPrec, rightPrec);
            writer.endFunCall(frame);
            break;
        case FLOOR:
            if (call.operandCount() != 2) {
                super.unparseCall(writer, call, leftPrec, rightPrec);
                return;
            }

            unparseFloor(writer, call);
            break;

        case WITHIN_GROUP:
            final List < SqlNode > operands = call.getOperandList();
            if (operands.size() <= 0 || operands.get(0).getKind() != SqlKind.LISTAGG) {
                super.unparseCall(writer, call, leftPrec, rightPrec);
                return;
            }
            unparseListAggCall(writer, (SqlCall) operands.get(0),
                operands.size() == 2 ? operands.get(1) : null, leftPrec, rightPrec);
            break;

        case LISTAGG:
            unparseListAggCall(writer, call, null, leftPrec, rightPrec);
            break;

        default:
            super.unparseCall(writer, call, leftPrec, rightPrec);
    }
}
```

`super.unparseCall` 方法调用的是 [SqlDialect#unparseCall](https://github.com/apache/calcite/blob/9600147e7dcbb062d69a7277d7ba8304b27f5ca1/core/src/main/java/org/apache/calcite/sql/SqlDialect.java#L446)，由于 SqlKind 不是 `ROW`，逻辑会走到 `operator.unparse` 中，即 [SqlSelectOperator#unparse](https://github.com/apache/calcite/blob/c4042a34ef054b89cec1c47fefcbc8689bad55be/core/src/main/java/org/apache/calcite/sql/SqlSelectOperator.java#L134)。

```java
public void unparseCall(SqlWriter writer, SqlCall call, int leftPrec,
    int rightPrec) {
    SqlOperator operator = call.getOperator();
    switch (call.getKind()) {
        case ROW:
            // Remove the ROW keyword if the dialect does not allow that.
            if (!getConformance().allowExplicitRowValueConstructor()) {
                if (writer.isAlwaysUseParentheses()) {
                    // If writer always uses parentheses, it will have started parentheses
                    // that we now regret. Use a special variant of the operator that does
                    // not print parentheses, so that we can use the ones already started.
                    operator = SqlInternalOperators.ANONYMOUS_ROW_NO_PARENTHESES;
                } else {
                    // Use an operator that prints "(a, b, c)" rather than
                    // "ROW (a, b, c)".
                    operator = SqlInternalOperators.ANONYMOUS_ROW;
                }
            }
            // fall through
        default:
            operator.unparse(writer, call, leftPrec, rightPrec);
    }
}
```

[SqlSelectOperator#unparse](https://github.com/apache/calcite/blob/c4042a34ef054b89cec1c47fefcbc8689bad55be/core/src/main/java/org/apache/calcite/sql/SqlSelectOperator.java#L134) 方法会对 SELECT 语句按照顺序进行 SQL 生成，包括：Hint 注释、投影列、表、查询条件、分组条件等。在投影列、查询条件生成的过程中，会调用其他 SqlNode 的 unparse 方法，通过遍历语法树逐层调用，最终 writer 类获取了全部的 SQL   信息，通过 `toSqlString` 方法转换为最终的 SQL 字符串。SqlNode 生成不同方言的 SQL 调用的节点很多，本文限于篇幅就不一一介绍了，感兴趣的朋友可以自行 DEBUG 探究一下。

```java
@SuppressWarnings("deprecation")
@Override
public void unparse(SqlWriter writer, SqlCall call, int leftPrec, int rightPrec) {
    SqlSelect select = (SqlSelect) call;
    final SqlWriter.Frame selectFrame = writer.startList(SqlWriter.FrameTypeEnum.SELECT);
  	// 向 writer 容器中输出 SELECT 关键字
    writer.sep("SELECT");
    if (select.hasHints()) {
        writer.sep("/*+");
        castNonNull(select.hints).unparse(writer, 0, 0);
        writer.print("*/");
        writer.newlineAndIndent();
    }
    for (int i = 0; i < select.keywordList.size(); i++) {
        final SqlNode keyword = select.keywordList.get(i);
        keyword.unparse(writer, 0, 0);
    }
    writer.topN(select.fetch, select.offset);
    final SqlNodeList selectClause = select.selectList;
    // 向 writer 容器中输出投影列
    writer.list(SqlWriter.FrameTypeEnum.SELECT_LIST, SqlWriter.COMMA, selectClause);
    // 向 writer 容器中输出 FROM 关键字及表名
    if (select.from != null) {
        // Calcite SQL requires FROM but MySQL does not.
        writer.sep("FROM");
        // for FROM clause, use precedence just below join operator to make
        // sure that an un-joined nested select will be properly
        // parenthesized
        final SqlWriter.Frame fromFrame = writer.startList(SqlWriter.FrameTypeEnum.FROM_LIST);
        select.from.unparse(writer, SqlJoin.COMMA_OPERATOR.getLeftPrec() - 1, SqlJoin.COMMA_OPERATOR.getRightPrec() - 1);
        writer.endList(fromFrame);
    }
    // 向 writer 容器中输出 WHERE 关键字及查询条件
    SqlNode where = select.where;
    if (where != null) {
        writer.sep("WHERE");
        if (!writer.isAlwaysUseParentheses()) {
            SqlNode node = where;
            // decide whether to split on ORs or ANDs
            SqlBinaryOperator whereSep = SqlStdOperatorTable.AND;
            if ((node instanceof SqlCall) && node.getKind() == SqlKind.OR) {
                whereSep = SqlStdOperatorTable.OR;
            }
            // unroll whereClause
            final List < SqlNode > list = new ArrayList < > (0);
            while (node.getKind() == whereSep.kind) {
                assert node instanceof SqlCall;
                final SqlCall call1 = (SqlCall) node;
                list.add(0, call1.operand(1));
                node = call1.operand(0);
            }
            list.add(0, node);
            // unparse in a WHERE_LIST frame
            writer.list(SqlWriter.FrameTypeEnum.WHERE_LIST, whereSep,
                new SqlNodeList(list, where.getParserPosition()));
        } else {
            where.unparse(writer, 0, 0);
        }
    }
    // 向 writer 容器中输出分组查询条件
    if (select.groupBy != null) {
        SqlNodeList groupBy = select.groupBy.size() == 0 ? SqlNodeList.SINGLETON_EMPTY : select.groupBy;
        // if the DISTINCT keyword of GROUP BY is present it can be the only item
        if (groupBy.size() == 1 && groupBy.get(0) != null && groupBy.get(0).getKind() == SqlKind.GROUP_BY_DISTINCT) {
            writer.sep("GROUP BY DISTINCT");
            List < SqlNode > operandList = ((SqlCall) groupBy.get(0)).getOperandList();
            groupBy = new SqlNodeList(operandList, groupBy.getParserPosition());
        } else {
            writer.sep("GROUP BY");
        }
        writer.list(SqlWriter.FrameTypeEnum.GROUP_BY_LIST, SqlWriter.COMMA, groupBy);
    }
    if (select.having != null) {
        writer.sep("HAVING");
        select.having.unparse(writer, 0, 0);
    }
    if (select.windowDecls.size() > 0) {
        writer.sep("WINDOW");
        writer.list(SqlWriter.FrameTypeEnum.WINDOW_DECL_LIST, SqlWriter.COMMA, select.windowDecls);
    }
    if (select.qualify != null) {
        writer.sep("QUALIFY");
        select.qualify.unparse(writer, 0, 0);
    }
    if (select.orderBy != null && select.orderBy.size() > 0) {
        writer.sep("ORDER BY");
        writer.list(SqlWriter.FrameTypeEnum.ORDER_BY_LIST, SqlWriter.COMMA, select.orderBy);
    }
    writer.fetchOffset(select.fetch, select.offset);
    writer.endList(selectFrame);
}
```



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。
{% note color:green 目前星球刚创建，内部积累的资料还很有限，因此暂时不收费，感兴趣的同学可以联系我，免费邀请进入星球。 %}

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

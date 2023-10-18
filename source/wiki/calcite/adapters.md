---
layout: wiki
wiki: Calcite 官方文档中文版
order: 004
title: 适配器
date: 2021-12-12 11:15:27
---

> 原文链接：https://calcite.apache.org/docs/adapter.html

## 模式适配器

模式适配器允许 `Calcite` 读取特定类型的数据，并将这些数据显示为模式中的表。	

- [Cassandra 适配器](https://calcite.apache.org/docs/cassandra_adapter.html)（[calcite-cassandra](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/cassandra/package-summary.html)）；
- CSV 适配器（[示例/csv](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/csv/package-summary.html)）；
- [Druid 适配器](https://calcite.apache.org/docs/druid_adapter.html)（[calcite-druid](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/druid/package-summary.html)）；
- [Elasticsearch 适配器](https://calcite.apache.org/docs/elasticsearch_adapter.html)（[calcite-elasticsearch](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/elasticsearch/package-summary.html)）；
- [文件适配器](https://calcite.apache.org/docs/file_adapter.html)（[calcite-file](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/file/package-summary.html)）；
- [Geode 适配器](https://calcite.apache.org/docs/geode_adapter.html)（[calcite-geode](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/geode/package-summary.html)）；
- [InnoDB 适配器](https://calcite.apache.org/docs/innodb_adapter.html)（[calcite-innodb](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/innodb/package-summary.html)）；
- JDBC 适配器（[calcite-core](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/jdbc/package-summary.html) 的一部分）；
- MongoDB 适配器（[calcite-mongodb](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/mongodb/package-summary.html)）；
- [操作系统适配器](https://calcite.apache.org/docs/os_adapter.html)（[calcite-os](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/os/package-summary.html)）；
- [Pig 适配器](https://calcite.apache.org/docs/pig_adapter.html)（[calcite-pig](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/pig/package-summary.html)）；
- [Redis 适配器](https://calcite.apache.org/docs/redis_adapter.html)（[calcite-redis](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/redis/package-summary.html)）；
- Solr cloud 适配器（[solr-sql](https://github.com/bluejoe2008/solr-sql)）；
- Spark 适配器（[calcite-spark](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/spark/package-summary.html)）；
- Splunk 适配器（[calcite-splunk](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/splunk/package-summary.html)）；
- Eclipse 内存分析器 (MAT) 适配器（[mat-calcite-plugin](https://github.com/vlsi/mat-calcite-plugin)）；
- [Apache Kafka 适配器](https://calcite.apache.org/docs/kafka_adapter.html)。

### 其他语言接口

- Piglet（[calcite-piglet](https://calcite.apache.org/javadocAggregate/org/apache/calcite/piglet/package-summary.html)）在 [Pig Latin](https://pig.apache.org/docs/latest/basic.html) 的子集中运行查询；

## 引擎

许多项目和产品使用 `Apache Calcite` 进行 `SQL 解析`、`查询优化`、`数据虚拟化/联邦查询` 和 `物化视图重写`。他们中的一些列在了 [由 Calcite 提供支持](https://calcite.apache.org/docs/powered_by.html) 页面上。

## 驱动

驱动允许你从应用程序连接到 Calcite。

- [JDBC 驱动程序](https://calcite.apache.org/javadocAggregate/org/apache/calcite/jdbc/package-summary.html)；

JDBC 驱动由 [Avatica](https://calcite.apache.org/avatica/docs/) 提供支持。连接可以是本地连接或远程连接（基于 HTTP 协议传输的 `JSON` 或 `Protobuf`）。

JDBC 连接字符串的基本格式如下：

```
jdbc:calcite:property=value;property2=value2
```

其中 `property`，`property2` 是下面描述的这些属性。连接字符串遵循 `OLE DB` 连接字符串语法，由 Avatica 的 [ConnectStringParser](https://calcite.apache.org/avatica/javadocAggregate/org/apache/calcite/avatica/ConnectStringParser.html) 实现。

## JDBC 连接字符串参数

| 属性                                                         | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| [approximateDecimal](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#APPROXIMATE_DECIMAL) | 是否可以接受 `DECIMAL` 类型聚合函数返回近似结果。            |
| [approximateDistinctCount](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#APPROXIMATE_DISTINCT_COUNT) | 是否可以接受 `COUNT(DISTINCT ...)` 聚合函数返回近似结果。    |
| [approximateTopN](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#APPROXIMATE_TOP_N) | 是否可以接受 Top N 查询（`ORDER BY aggFun() DESC LIMIT n`）返回近似结果。 |
| [caseSensitive](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#CASE_SENSITIVE) | 标识符匹配是否区分大小写。如果未指定，将会使用 `lex` 中的值。 |
| [conformance](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#CONFORMANCE) | SQL 一致性级别。包含如下值：`DEFAULT`（默认值，类似于 `PRAGMATIC_2003`）、`LENIENT`、`MYSQL_5`、`ORACLE_10`、`ORACLE_12`、`PRAGMATIC_99`、`PRAGMATIC_2003`、`STRICT_92`、`STRICT_99`、`STRICT_2003`、`SQL_SERVER_2008`。 |
| [createMaterializations](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#CREATE_MATERIALIZATIONS) | Calcite 是否应该创建物化视图。默认为 false。                 |
| [defaultNullCollation](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#DEFAULT_NULL_COLLATION) | 如果查询中既未指定 `NULLS FIRST` 也未指定 `NULLS LAST`，应该如何对 `NULL` 值进行排序。默认值为 HIGH，对 NULL 值的排序与 Oracle 相同。 |
| [druidFetch](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#DRUID_FETCH) | 执行 SELECT 查询时，Druid 适配器应当一次获取多少行记录。     |
| [forceDecorrelate](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#FORCE_DECORRELATE) | 优化器是否应该尽可能地尝试去除相关子查询。默认为 true。      |
| [fun](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#FUN) | 内置函数和运算符的集合。有效值为 `standard`（默认值）、`oracle`、`spatial`，并且可以使用逗号组合，例如 `oracle,spatial`。 |
| [lex](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#LEX) | 词法分析策略。有效值为 `BIG_QUERY`、`JAVA`、`MYSQL`、`MYSQL_ANSI`、`ORACLE`（默认）、`SQL_SERVER`。 |
| [materializationsEnabled](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#MATERIALIZATIONS_ENABLED) | Calcite 是否应该使用物化视图。默认为 false。                 |
| [model](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#MODEL) | JSON/YAML 模型文件的 URI 或内联的 JSON（例如：`inline:{...}`） 、内联的 YAML（例如： `inline:...`）。 |
| [parserFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#PARSER_FACTORY) | 解析器工厂。实现 [`interface SqlParserImplFactory`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/parser/SqlParserImplFactory.html) 并具有公共默认构造函数或 `INSTANCE` 常量的类的名称。 |
| [quoting](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#QUOTING) | 如何引用标识符。值为 DOUBLE_QUOTE、BACK_TICK、BACK_TICK_BACKSLASH、BRACKET。如果未指定，则使用 `lex` 中的值。 |
| [quotedCasing](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#QUOTED_CASING) | 如果标识符被引用，设置如何存储标识符。值为 UNCHANGED、TO_UPPER、TO_LOWER。如果未指定，则使用 `lex` 中的值。 |
| [schema](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#SCHEMA) | 初始模式的名称。                                             |
| [schemaFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#SCHEMA_FACTORY) | 模式工厂。实现 [`interface SchemaFactory`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/SchemaFactory.html) 并具有公共默认构造函数或 `INSTANCE` 常量的类的名称。如果指定了 `model` 则忽略该参数。 |
| [schemaType](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#SCHEMA_TYPE) | 模式类型。值必须是 `MAP`（默认值）、`JDBC` 或 `CUSTOM`（如果指定了 `schemaFactory` 则隐式设置为 CUSTOM）。如果指定了 `model` 则忽略该参数。 |
| [spark](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#SPARK) | 指定是否应使用 Spark 作为引擎来处理无法推送到源系统的处理。如果为 false（默认值），Calcite 会生成实现 Enumerable 接口的代码。 |
| [timeZone](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#TIME_ZONE) | 时区，例如 `gmt-3`。默认是 JVM 的时区。                      |
| [typeSystem](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#TYPE_SYSTEM) | 类型系统。实现 [`interface RelDataTypeSystem`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/type/RelDataTypeSystem.html) 并具有公共默认构造函数或 `INSTANCE` 常量的类的名称。 |
| [unquotedCasing](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#UNQUOTED_CASING) | 如果标识符未加引号，设置如何存储标识符。值为 `UNCHANGED`、`TO_UPPER`、`TO_LOWER`。如果未指定，则使用 `lex` 中的值。 |
| [typeCoercion](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#TYPE_COERCION) | sql 节点校验时，如果类型不匹配是否进行隐式类型强转，默认为 true。 |

要基于内置模式类型连接到单个模式，你不需要指定 model 参数。例如，通过映射到 foodmart 数据库的 JDBC 模式适配器创建一个模式，并使用这个模式创建一个数据库连接。

```
jdbc:calcite:schemaType=JDBC; schema.jdbcUser=SCOTT; schema.jdbcPassword=TIGER; schema.jdbcUrl=jdbc:hsqldb:res:foodmart
```

同样，你可以基于用户定义的模式适配器连接到单个模式。例如：

```
jdbc:calcite:schemaFactory=org.apache.calcite.adapter.cassandra.CassandraSchemaFactory; schema.host=localhost; schema.keyspace=twissandra
```

与 Cassandra 适配器建立连接，可以通过编写如下的模型文件实现：

```json
{
  "version": "1.0",
  "defaultSchema": "foodmart",
  "schemas": [
    {
      type: 'custom',
      name: 'twissandra',
      factory: 'org.apache.calcite.adapter.cassandra.CassandraSchemaFactory',
      operand: {
        host: 'localhost',
        keyspace: 'twissandra'
      }
    }
  ]
}
```

请注意 `operand` 部分中的每个键，在连接字符串中使用都需要加上 `schema.` 前缀。

## 服务器

Calcite 的核心模块 (`calcite-core`) 支持 SQL 查询 (`SELECT`) 和 DML 操作 (`INSERT`， `UPDATE`， `DELETE`， `MERGE`)，但不支持 `CREATE SCHEMA` 或 `CREATE TABLE` 等 DDL 操作。正如我们将看到的，DDL 使元数据库中的状态模型变得复杂，并使解析器更难以扩展，因此我们将 DDL 排除在核心之外。

服务器模块 (`calcite-server`) 为 Calcite 添加了 DDL 支持。它扩展了 SQL 解析器，[使用与子项目相同的机制](https://calcite.apache.org/docs/adapter.html#extending-the-parser)，添加了一些 DDL 命令：

- `CREATE` 和 `DROP SCHEMA`；
- `CREATE` 和 `DROP FOREIGN SCHEMA`；
- `CREATE` 和 `DROP TABLE`（包括 `CREATE TABLE ... AS SELECT`）；
- `CREATE` 和 `DROP MATERIALIZED VIEW`；
- `CREATE` 和 `DROP VIEW`；
- `CREATE` 和 `DROP FUNCTION`；
- `CREATE` 和 `DROP TYPE`。

[SQL 参考](https://calcite.apache.org/docs/reference.html#ddl-extensions)中描述了这些命令。

要启用 Calite 服务器模块，请将 `calcite-server.jar` 包含在你的类路径中，并添加 `parserFactory=org.apache.calcite.sql.parser.ddl.SqlDdlParserImpl#FACTORY` 到 JDBC 连接字符串（请参阅连接字符串属性 [parserFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#PARSER_FACTORY)）。下面是一个使用 `sqlline` shell 的示例。

```sql
$ ./sqlline
sqlline version 1.3.0
> !connect jdbc:calcite:parserFactory=org.apache.calcite.sql.parser.ddl.SqlDdlParserImpl#FACTORY sa ""
> CREATE TABLE t (i INTEGER, j VARCHAR(10));
No rows affected (0.293 seconds)
> INSERT INTO t VALUES (1, 'a'), (2, 'bc');
2 rows affected (0.873 seconds)
> CREATE VIEW v AS SELECT * FROM t WHERE i > 1;
No rows affected (0.072 seconds)
> SELECT count(*) FROM v;
+---------------------+
|       EXPR$0        |
+---------------------+
| 1                   |
+---------------------+
1 row selected (0.148 seconds)
> !quit
```

`calcite-server` 模块是可选的。它的目标之一是使用可以从 SQL 命令行尝试的简单示例，来展示 Calcite 的功能（例如物化视图、外部表和自动生成列）。 `calcite-server` 使用的所有功能都可以通过 `calcite-core` 中的 API 获得。

如果你是子项目的作者，你的语法扩展不太可能与 `calcite-server` 中的语法扩展匹配，因此我们建议你通过[扩展核心解析器来](https://calcite.apache.org/docs/adapter.html#extending-the-parser)添加 SQL 语法扩展。如果你需要 DDL 命令，你可以将 `calcite-server` 复制粘贴到你的项目中。

目前，元数据库尚未持久化。当你执行 DDL 命令时，你正在通过添加和删除可从根 [`Schema`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/Schema.html) 访问的对象，来修改内存元数据库。同一 SQL 会话中的所有命令都将看到这些对象。你可以通过执行相同的 SQL 命令脚本在将来的会话中创建相同的对象。

Calcite 还可以充当数据虚拟化或联邦查询的服务器：Calcite 管理多个外部模式中的数据，但对于客户端而言，这些数据似乎都在同一个地方。Calcite 选择应在何处进行处理，以及是否创建数据副本以提高效率。`calcite-server` 模块是朝着这一目标迈出的一步；行业级解决方案需要进一步打包（使 Calcite 作为服务运行）、元数据库持久性、授权和安全性。

## 可扩展性

还有许多其他 API 允许你扩展 Calcite 的功能。

在本节中，我们将简要描述这些 API，让你了解可能发生的情况。要充分使用这些 API，你需要阅读其他文档，例如接口的 javadoc，并可能查找我们为它们编写的测试。

### 函数和运算符

有多种方法可以向 Calcite 添加运算符或函数。我们将首先描述最简单的（也是最不强大的）。

用户定义的函数是最简单的（但功能最弱）。它们编写起来很简单（你只需编写一个 Java 类并将其注册到你的模式中），但在参数的数量和类型、解析重载函数或派生的返回类型方面没有提供太多灵活性。

如果你想要这种灵活性，你可能需要编写一个用户定义的运算符（请参考 [`interface SqlOperator`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/SqlOperator.html) ）。

如果你的运算符不遵守标准 SQL 函数语法 `f(arg1, arg2, ...)`，那么你需要去 [扩展解析器](https://calcite.apache.org/docs/adapter.html#extending-the-parser)。

测试中有很多好的例子：[`class UdfTest`](https://github.com/apache/calcite/blob/master/core/src/test/java/org/apache/calcite/test/UdfTest.java) 测试了用户定义函数和用户定义聚合函数。

### 聚合函数

用户定义的聚合函数与用户定义的函数类似，但每个函数都有几个相应的 Java 方法，用于聚合生命周期中的每个阶段：

- `init` 创建一个累加器；
- `add` 将一行的值添加到累加器中；
- `merge` 将两个累加器合二为一；
- `result` 完成累加器并将其转换为结果。

举个例子，`SUM(int)` 的方法（伪代码）如下：

```java
struct Accumulator {
  final int sum;
}
Accumulator init() {
  return new Accumulator(0);
}
Accumulator add(Accumulator a, int x) {
  return new Accumulator(a.sum + x);
}
Accumulator merge(Accumulator a, Accumulator a2) {
  return new Accumulator(a.sum + a2.sum);
}
int result(Accumulator a) {
  return a.sum;
}
```

以下是计算列值为 4 和 7 的两行之和的调用序列：

```java
a = init()    # a = {0}
a = add(a, 4) # a = {4}
a = add(a, 7) # a = {11}
return result(a) # returns 11
```

### 窗口函数

窗口函数类似于聚合函数，但它应用于由 `OVER` 子句而不是 `GROUP BY` 子句收集的一组行。每个聚合函数都可以用作窗口函数，但存在一些关键区别。窗口函数看到的行可能是有序的，并且依赖于顺序的窗口函数（例如 `RANK` ）不能用作聚合函数。

TODO

另一个区别是窗口是不相交的（`non-disjoint`）：特定行可以出现在多个窗口中。例如，10:37 出现在 9:00-10:00 和 9:15-9:45 小时。

窗口函数是递增计算的：当时钟从 10:14 到 10:15 滴答作响时，可能有两行进入窗口，而三行离开。为此，窗口函数有一个额外的生命周期操作：

- `remove` 从累加器中删除一个值。

它的伪代码`SUM(int)`是：

```
Accumulator remove(Accumulator a, int x) {
  return new Accumulator(a.sum - x);
}
```

以下是计算前 2 行的移动总和的调用序列，其中 4 行的值为 4、7、2 和 3：

```
a = init()       # a = {0}
a = add(a, 4)    # a = {4}
emit result(a)   # emits 4
a = add(a, 7)    # a = {11}
emit result(a)   # emits 11
a = remove(a, 4) # a = {7}
a = add(a, 2)    # a = {9}
emit result(a)   # emits 9
a = remove(a, 7) # a = {2}
a = add(a, 3)    # a = {5}
emit result(a)   # emits 5
```

### 分组窗口函数

分组窗口函数是操作`GROUP BY`子句将记录聚集成集合的函数。内置的分组窗口函数是`HOP`、`TUMBLE`和`SESSION`。你可以通过实现来定义附加功能 [`interface SqlGroupedWindowFunction`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/fun/SqlGroupedWindowFunction.html)。

### 表函数和表宏

*用户定义表函数* 的定义方式与常规“标量”用户定义函数类似，但用于`FROM`查询子句中。以下查询使用名为 的表函数`Ramp`：

```
SELECT * FROM TABLE(Ramp(3, 4))
```

*用户定义的表宏*使用与表函数相同的 SQL 语法，但定义不同。它们不是生成数据，而是生成关系表达式。在查询准备期间调用表宏，然后可以优化它们生成的关系表达式。（Calcite 的视图实现使用表宏。）

[`class TableFunctionTest`](https://github.com/apache/calcite/blob/master/core/src/test/java/org/apache/calcite/test/TableFunctionTest.java) 测试表函数并包含几个有用的示例。

### 扩展解析器

假设你需要以与将来对语法的更改兼容的方式扩展 Calcite 的 SQL 语法。`Parser.jj`在你的项目中复制语法文件 将是愚蠢的，因为语法经常被编辑。

幸运的是，`Parser.jj`实际上是一个 [Apache FreeMarker](https://freemarker.apache.org/) 模板，其中包含可以替换的变量。解析器`calcite-core`使用变量的默认值（通常为空）实例化模板，但你可以覆盖。如果你的项目需要不同的解析器，你可以提供自己的`config.fmpp`和`parserImpls.ftl`文件，从而生成扩展解析器。

该`calcite-server`模块在 [ [CALCITE-707](https://issues.apache.org/jira/browse/CALCITE-707) ] 中创建并添加了 DDL 语句，例如`CREATE TABLE`，是你可以遵循的示例。另见 [`class ExtensionSqlParserTest`](https://github.com/apache/calcite/blob/master/core/src/test/java/org/apache/calcite/sql/parser/parserextensiontesting/ExtensionSqlParserTest.java)。

### 自定义接受和生成的 SQL 方言

要自定义解析器应接受、实现 [`interface SqlConformance`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html) 或使用 [`enum SqlConformanceEnum`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformanceEnum.html).

要控制如何为外部数据库生成 SQL（通常通过 JDBC 适配器），请使用 [`class SqlDialect`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/SqlDialect.html). 方言还描述了引擎的功能，例如它是否支持`OFFSET`和`FETCH`子句。

### 定义自定义架构

要定义自定义架构，你需要实现 [`interface SchemaFactory`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/SchemaFactory.html).

在查询准备期间，Calcite 将调用此接口以找出你的架构包含哪些表和子架构。当查询中引用架构中的表时，Calcite 将要求你的架构创建 [`interface Table`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/Table.html).

该表将被包装在 a 中 [`TableScan`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/TableScan.html) ，并将进行查询优化过程。

### 反思模式

反射模式 ( [`class ReflectiveSchema`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/java/ReflectiveSchema.html)) 是一种包装 Java 对象以使其显示为模式的方法。其集合值字段将显示为表格。

它不是一个模式工厂，而是一个实际的模式；你必须创建对象并通过调用 API 将其包装在架构中。

见 [`class ReflectiveSchemaTest`](https://github.com/apache/calcite/blob/master/core/src/test/java/org/apache/calcite/test/ReflectiveSchemaTest.java)。

### 定义自定义表

要定义自定义表，你需要实现 [`interface TableFactory`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TableFactory.html). 模式工厂是一组命名表，而表工厂在绑定到具有特定名称（以及可选的一组额外操作数）的模式时会生成单个表。

### 修改数据

如果你的表要支持 DML 操作（INSERT、UPDATE、DELETE、MERGE），则你的实现`interface Table`必须实现 [`interface ModifiableTable`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ModifiableTable.html).

### 流媒体

如果你的表支持流式查询，则你的实现`interface Table`必须实现 [`interface StreamableTable`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/StreamableTable.html).

参见 [`class StreamTest`](https://github.com/apache/calcite/blob/master/core/src/test/java/org/apache/calcite/test/StreamTest.java) 示例。

### 将操作推到你的桌子上

如果你希望将处理下推到自定义表的源系统，请考虑实现 [`interface FilterableTable`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/FilterableTable.html) 或 [`interface ProjectableFilterableTable`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ProjectableFilterableTable.html)。

如果你想要更多的控制，你应该写一个[计划规则](https://calcite.apache.org/docs/adapter.html#planner-rule)。这将允许你下推表达式，做出关于是否下推处理的基于成本的决定，以及下推更复杂的操作，例如连接、聚合和排序。

### 类型系统

你可以通过实现 [`interface RelDataTypeSystem`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/type/RelDataTypeSystem.html).

### 关系运算符

所有关系运算符都实现 [`interface RelNode`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/RelNode.html) 并扩展了 [`class AbstractRelNode`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/AbstractRelNode.html). 核心运营商（使用 [`SqlToRelConverter`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql2rel/SqlToRelConverter.html) 和覆盖常规关系代数）是 [`TableScan`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/TableScan.html)， [`TableModify`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/TableModify.html)， [`Values`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Values.html)， [`Project`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Project.html)， [`Filter`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Filter.html)， [`Aggregate`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Aggregate.html)， [`Join`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Join.html)， [`Sort`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Sort.html)， [`Union`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Union.html)， [`Intersect`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Intersect.html)， [`Minus`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Minus.html)， [`Window`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Window.html)和 [`Match`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Match.html)。

其中每一个都有一个“纯”逻辑子类， [`LogicalProject`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/logical/LogicalProject.html) 依此类推。任何给定的适配器都有对应的引擎可以有效实现的操作；例如，Cassandra 适配器有 [`CassandraProject`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/cassandra/CassandraProject.html) 但没有`CassandraJoin`.

你可以定义自己的子类`RelNode`以添加新运算符，或在特定引擎中实现现有运算符。

为了使运算符有用且强大，你需要 [规划器规则](https://calcite.apache.org/docs/adapter.html#planner-rule)将其与现有运算符相结合。（并且还提供元数据，见[下文](https://calcite.apache.org/docs/adapter.html#statistics-and-cost)）。这是代数，效果是组合的：你编写一些规则，但它们组合起来处理指数数量的查询模式。

如果可能，让你的运营商成为现有运营商的子类；那么你就可以重新使用或调整其规则。更好的是，如果你的运算符是一个可以根据现有运算符重写（再次通过规划器规则）的逻辑运算，那么你应该这样做。你将无需额外工作即可重复使用这些运算符的规则、元数据和实现。

### 计划规则

规划器规则 ( [`class RelOptRule`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/plan/RelOptRule.html)) 将关系表达式转换为等效的关系表达式。

规划器引擎注册了许多规划器规则并触发它们以将输入查询转换为更有效的内容。因此，规划器规则是优化过程的核心，但令人惊讶的是，每个规划器规则本身并不关心成本。计划引擎负责按顺序触发规则以产生最佳计划，但每个单独的规则只关心自己的正确性。

Calcite 有两个内置的规划器引擎： [`class VolcanoPlanner`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/plan/volcano/VolcanoPlanner.html) 使用动态规划，适用于穷举搜索，而 [`class HepPlanner`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/plan/hep/HepPlanner.html) 以更固定的顺序触发一系列规则。

### 调用约定

调用约定是特定数据引擎使用的协议。例如，卡桑德拉发动机具有关系运算符的集合， `CassandraProject`，`CassandraFilter`等等，并且这些操作符可以被相互连接，而无需从一个格式转换成另一种的数据。

如果数据需要从一种调用约定转换为另一种调用约定，Calcite 使用称为转换器的特殊关系表达式子类（请参阅 参考资料[`interface Converter`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/convert/Converter.html)）。但是当然转换数据有运行时成本。

在规划使用多个引擎的查询时，Calcite 根据其调用约定为关系表达式树的区域“着色”。规划器通过触发规则将操作推送到数据源中。如果引擎不支持特定操作，则不会触发规则。有时一项操作可能会发生在多个地方，最终会根据成本选择最佳方案。

调用约定是一个实现 的类 [`interface Convention`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/plan/Convention.html)、一个辅助接口（例如 [`interface CassandraRel`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/cassandra/CassandraRel.html)），以及[`class RelNode`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/RelNode.html) 为核心关系运算符（[`Project`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Project.html)、 [`Filter`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Filter.html)、 [`Aggregate`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/core/Aggregate.html)等）实现该接口的一组子类 。

### 内置 SQL 实现

如果适配器没有实现所有核心关系运算符，Calcite 如何实现 SQL？

答案是特定的内置调用约定 [`EnumerableConvention`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/adapter/enumerable/EnumerableConvention.html). 可枚举约定的关系表达式被实现为“内置”：Calcite 生成 Java 代码，编译它，并在它自己的 JVM 中执行。Enumerable 约定不如运行在面向列的数据文件上的分布式引擎那么有效，但它可以实现所有核心关系运算符和所有内置 SQL 函数和运算符。如果数据源无法实现关系运算符，则可枚举约定是一种后备。

### 统计和成本

Calcite 有一个元数据系统，允许你定义有关关系运算符的成本函数和统计信息，统称为*元数据*。每种元数据都有一个接口（通常）一个方法。例如，选择性由[`class RelMdSelectivity`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdSelectivity.html) 和 方法 定义 [`getSelectivity(RelNode rel, RexNode predicate)`](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMetadataQuery.html#getSelectivity-org.apache.calcite.rel.RelNode-org.apache.calcite.rex.RexNode-)。

有许多内置的元数据，包括 [排序规则](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdCollation.html)、 [列起源](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdColumnOrigins.html)、 [列唯一性](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdColumnUniqueness.html)、 [不同行数](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdDistinctRowCount.html)、 [分布](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdDistribution.html)、 [解释可见性](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdExplainVisibility.html)、 [表达式谱系](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdExpressionLineage.html)、 [最大行数](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdMaxRowCount.html)、 [节点类型](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdNodeTypes.html)、 [并行度](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdParallelism.html)、 [原始行百分比](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdPercentageOriginalRows.html)、 [人口大小](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdPopulationSize.html)、 [谓词](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdPredicates.html)、 [行计数](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdRowCount.html)、 [选择性](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdSelectivity.html)、 [大小](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdSize.html)、 [表引用](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdTableReferences.html)和 [唯一键](https://calcite.apache.org/javadocAggregate/org/apache/calcite/rel/metadata/RelMdUniqueKeys.html)；你也可以定义你自己的。

然后，你可以提供一个*元数据提供程序*，该*提供程序*为`RelNode`. 元数据提供程序可以处理内置和扩展元数据类型，以及内置和扩展`RelNode`类型。在准备查询时，Calcite 结合了所有适用的元数据提供者并维护一个缓存，以便给定的元数据（例如`x > 10`特定`Filter`运算符中条件的选择性）仅计算一次。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了`Calcite 从入门到精通`知识星球，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。
{% note color:green 目前星球刚创建，内部积累的资料还很有限，因此暂时不收费，感兴趣的同学可以联系我，免费邀请进入星球。 %}

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

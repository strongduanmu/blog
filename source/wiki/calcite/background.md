---
layout: wiki
wiki: Calcite 官方文档中文版
order: 001
title: 背景
cover: true
logo:
  src: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/07/01/1625102427.jpg
description: Apache Calcite 是一个动态数据管理框架，提供了如：SQL 解析、SQL 校验、SQL 查询优化、SQL 生成以及数据连接查询等典型数据库管理功能。目前，Apache Calcite 作为 SQL 解析与优化引擎，已经广泛使用在 Hive、Drill、Flink、Phoenix 和 Storm 等项目中。
comment_id: 'calcite_chinese_doc'
---

> 原文链接：https://calcite.apache.org/docs/

`Apache Calcite` 是一个动态数据管理框架。它包含了构成典型数据库管理系统的许多部分，但省略了一些关键功能，如：数据存储、处理数据的算法以及用于存储元数据的库。

Calcite 有意不介入存储和处理数据的业务。正如我们将看到的，这使得 Calcite 成为在应用程序与一个或多个数据存储位置和数据处理引擎之间进行调解的绝佳选择。 它也是构建数据库的完美基础：只需添加数据。为了说明这一点，让我们创建一个 Calcite 的空实例，然后将其指向一些数据。

```java
public static class HrSchema {
    public final Employee[] emps = 0;
    public final Department[] depts = 0;
}

Class.forName("org.apache.calcite.jdbc.Driver");
Properties info = new Properties();
info.setProperty("lex", "JAVA");
Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);
SchemaPlus rootSchema = calciteConnection.getRootSchema();
Schema schema = new ReflectiveSchema(new HrSchema());
rootSchema.add("hr", schema);
Statement statement = calciteConnection.createStatement();
ResultSet resultSet = statement.executeQuery("SELECT d.deptno, min(e.empid) FROM hr.emps AS e JOIN hr.depts AS d ON e.deptno = d.deptno GROUP BY d.deptno HAVING COUNT(*) > 1");
print(resultSet);
resultSet.close();
statement.close();
connection.close();
```

Where is the database? There is no database. The connection is completely empty until `new ReflectiveSchema` registers a Java object as a schema and its collection fields `emps` and `depts` as tables.

Calcite does not want to own data; it does not even have a favorite data format. This example used in-memory data sets, and processed them using operators such as `groupBy` and `join` from the linq4j library. But Calcite can also process data in other data formats, such as JDBC. In the first example, replace

```
Schema schema = new ReflectiveSchema(new HrSchema());
```

with

```
Class.forName("com.mysql.jdbc.Driver");
BasicDataSource dataSource = new BasicDataSource();
dataSource.setUrl("jdbc:mysql://localhost");
dataSource.setUsername("username");
dataSource.setPassword("password");
Schema schema = JdbcSchema.create(rootSchema, "hr", dataSource,
    null, "name");
```

and Calcite will execute the same query in JDBC. To the application, the data and API are the same, but behind the scenes the implementation is very different. Calcite uses optimizer rules to push the `JOIN` and `GROUP BY` operations to the source database.

In-memory and JDBC are just two familiar examples. Calcite can handle any data source and data format. To add a data source, you need to write an adapter that tells Calcite what collections in the data source it should consider “tables”.

For more advanced integration, you can write optimizer rules. Optimizer rules allow Calcite to access data of a new format, allow you to register new operators (such as a better join algorithm), and allow Calcite to optimize how queries are translated to operators. Calcite will combine your rules and operators with built-in rules and operators, apply cost-based optimization, and generate an efficient plan.

## 编写一个适配器

The subproject under example/csv provides a CSV adapter, which is fully functional for use in applications but is also simple enough to serve as a good template if you are writing your own adapter.

See the [tutorial](https://calcite.apache.org/docs/tutorial.html) for information on using the CSV adapter and writing other adapters.

See the [HOWTO](https://calcite.apache.org/docs/howto.html) for more information about using other adapters, and about using Calcite in general.

## 状态

The following features are complete.

- Query parser, validator and optimizer
- Support for reading models in JSON format
- Many standard functions and aggregate functions
- JDBC queries against Linq4j and JDBC back-ends
- Linq4j front-end
- SQL features: SELECT, FROM (including JOIN syntax), WHERE, GROUP BY (including GROUPING SETS), aggregate functions (including COUNT(DISTINCT …) and FILTER), HAVING, ORDER BY (including NULLS FIRST/LAST), set operations (UNION, INTERSECT, MINUS), sub-queries (including correlated sub-queries), windowed aggregates, LIMIT (syntax as [Postgres](https://www.postgresql.org/docs/8.4/static/sql-select.html#SQL-LIMIT)); more details in the [SQL reference](https://calcite.apache.org/docs/reference.html)
- Local and remote JDBC drivers; see [Avatica](https://calcite.apache.org/docs/avatica_overview.html)
- Several [adapters](https://calcite.apache.org/docs/adapter.html)
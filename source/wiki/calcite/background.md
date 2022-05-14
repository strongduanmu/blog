---
layout: wiki
wiki: Calcite 官方文档中文版
order: 001
title: 背景
date: 2021-11-11 11:15:27
comment_id: 'calcite_chinese_doc'
---

> 原文链接：https://calcite.apache.org/docs/

`Apache Calcite` 是一个动态数据管理框架。它包含了构成典型数据库管理系统的许多部分，但省略了一些关键功能，如：数据存储、处理数据的算法以及用于存储元数据的仓库。

Calcite 有意置身于存储和处理数据业务之外。正如我们将看到的，这使得 Calcite 成为应用程序与数据存储和数据处理引擎之间进行中转的绝佳选择。 它也是构建数据库的完美基础：只需添加数据。为了说明这一点，让我们创建一个 Calcite 的空实例，然后将其指向一些数据。

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

数据库在哪里？其实根本没有数据库。这个连接也完全是空的，直到 `new ReflectiveSchema` 注册了一个 Java 对象作为 `schema`， 并将它的集合字段 `emps` 和 `depts` 作为表，这时连接才有了数据。

Calcite 不想拥有数据，它甚至没有一个最喜欢的数据格式。这个示例使用了内存数据集，并使用 `linq4j` 库中的 `groupBy` 和 `join` 运算符处理这些数据。但是 Calcite 也可以处理其他数据格式的数据，例如 JDBC。在第一个示例中，将

```java
Schema schema = new ReflectiveSchema(new HrSchema());
```

替换成

```java
Class.forName("com.mysql.jdbc.Driver");
BasicDataSource dataSource = new BasicDataSource();
dataSource.setUrl("jdbc:mysql://localhost");
dataSource.setUsername("username");
dataSource.setPassword("password");
Schema schema = JdbcSchema.create(rootSchema, "hr", dataSource, null, "name");
```

Calcite 将在 JDBC 中执行相同的查询。对应用来说，数据和 API 是一样的，但背后的实现方式却大不相同。Calcite 使用优化器规则将 `JOIN` 和 `GROUP BY` 操作推送到源数据库。

内存和 JDBC 只是两个常见的例子。Calcite 可以处理任何数据源和数据格式。为了添加一个数据源，你需要编写一个适配器，来告诉 Calcite 应该将数据源中的哪些集合作为表。

对于更高级的集成，你可以编写优化器规则。优化器规则允许 Calcite 访问新格式的数据，允许你注册新的算子（比如一个更好的连接算法），也允许 Calcite 对如何将查询转换为算子进行优化。Calcite 会将你定义的规则、算子与内置的规则、算子相结合，使用基于成本的优化模型，生成一个高效的执行计划。

## 编写一个适配器

`example/csv` 目录下的子项目提供了一个功能齐全、可用于应用程序的 CSV 适配器。它也足够简单，如果您正在编写自己的适配器，它可以作为一个很好的模板。

关于使用 CSV 适配器和编写其他适配器的信息，请参阅 [教程](https://strongduanmu.com/wiki/calcite/tutorial.html)。

关于使用其他适配器以及常规使用 Calcite 的更多信息，请参阅 [如何去做](https://calcite.apache.org/docs/howto.html)。

## 状态

以下功能是已经完成。

- 查询解析器、校验器和优化器；
- 支持读取 JSON 格式的模型；
- 许多标准函数和聚合函数；
- 针对 `Linq4j` 和 JDBC 后端的 JDBC 查询；
- `Linq4j` 前端；
- SQL 特性：`SELECT`、`FROM`（包括 `JOIN` 语法）、`WHERE`、`GROUP BY`（包括 `GROUPING SETS`）、聚合函数（包括 `COUNT(DISTINCT ...)` 和 `FILTER`）、`HAVING`、`ORDER BY`（包括 `NULLS FIRST/LAST`）、集合操作（`UNION`、`INTERSECT`、`MINUS`)、子查询（包括相关子查询）、窗口聚合、`LIMIT`（如 [Postgres](https://www.postgresql.org/docs/8.4/static/sql-select.html#SQL-LIMIT) 语法）——更多详细信息参考 [SQL 参考](https://calcite.apache.org/docs/reference.html)；
- 本地和远程 JDBC 驱动程序——参考 [Avatica](https://calcite.apache.org/docs/avatica_overview.html)；
- 多个 [适配器](https://calcite.apache.org/docs/adapter.html)；


---
layout: wiki
wiki: Calcite 官方文档中文版
order: 002
title: 教程
comment_id: 'calcite_chinese_doc'
---

> 原文链接：https://calcite.apache.org/docs/tutorial.html

这是一个分步教程，展示了如何构建和连接 Calcite。它使用一个简单的适配器，使 `CSV` 文件的目录看起来像是包含表的模式。Calcite 完成剩下的工作，并提供完整的 SQL 接口。

`Calcite-example-CSV` 是一个功能齐全的 Calcite 适配器，它可以读取 [CSV（逗号分隔值）](https://en.wikipedia.org/wiki/Comma-separated_values)格式的文本文件。值得注意的是，几百行 Java 代码就足以提供完整的 SQL 查询功能。

CSV 还可用作构建适用于其他数据格式的适配器的模板。尽管代码行数不多，但它涵盖了几个重要的概念：

- 使用 SchemaFactory 和 Schema 接口的用户自定义模式；
- 在 JSON 格式的模型文件中声明模式；
- 在 JSON 格式的模型文件中声明视图；
- 使用 Table 接口的用户自定义表；
- 确定表的记录类型；
- Table 的简单实现，使用 ScannableTable 接口，直接枚举所有行；
- 更高级的实现，实现了FilterableTable，可以根据简单的谓词过滤掉行；
- Table 的高级实现，使用 TranslatableTable 的规划器规则转换为关系运算符。

## 下载和构建

你需要 Java（版本 8、9 或 10）和 Git。

```shell
$ git clone https://github.com/apache/calcite.git
$ cd calcite/example/csv
$ ./sqlline
```

## 第一条查询

现在让我们使用 [sqlline](https://github.com/julianhyde/sqlline) 连接到 Calcite，它是一个包含在 Calcite 项目中的 SQL shell 功能。

```shell
$ ./sqlline
sqlline> !connect jdbc:calcite:model=src/test/resources/model.json admin admin
```

如果您运行的是 Windows，则命令为 `sqlline.bat`。

执行元数据查询：

```shell
sqlline> !tables
+------------+--------------+-------------+---------------+----------+------+
| TABLE_CAT  | TABLE_SCHEM  | TABLE_NAME  |  TABLE_TYPE   | REMARKS  | TYPE |
+------------+--------------+-------------+---------------+----------+------+
| null       | SALES        | DEPTS       | TABLE         | null     | null |
| null       | SALES        | EMPS        | TABLE         | null     | null |
| null       | SALES        | HOBBIES     | TABLE         | null     | null |
| null       | metadata     | COLUMNS     | SYSTEM_TABLE  | null     | null |
| null       | metadata     | TABLES      | SYSTEM_TABLE  | null     | null |
+------------+--------------+-------------+---------------+----------+------+
```

（JDBC 专家注意：sqlline 的`!tables`命令只是在背后执行了 [`DatabaseMetaData.getTables()`](https://docs.oracle.com/javase/7/docs/api/java/sql/DatabaseMetaData.html#getTables(java.lang.String, java.lang.String, java.lang.String, java.lang.String[])) 。它还有其他命令来查询 JDBC 元数据，例如`!columns`和`!describe`。）

正如你所看见的，系统中有 5 张表：  `EMPS`，`DEPTS`和`HOBBIES`表在当前 `SALES`模式中，`COLUMNS`和 `TABLES`在系统`metadata`模式中。系统表始终存在于 Calcite 中，但其他表由模式的特定实现提供；在这个场景下，`EMPS`和`DEPTS`表是基于目录中的 `EMPS.csv`和`DEPTS.csv`文件 `resources/sales`。

让我们对这些表执行一些查询，以展示 Calcite 提供的 SQL 完整实现。首先，表扫描：

```shell
sqlline> SELECT * FROM emps;
+--------+--------+---------+---------+----------------+--------+-------+---+
| EMPNO  |  NAME  | DEPTNO  | GENDER  |      CITY      | EMPID  |  AGE  | S |
+--------+--------+---------+---------+----------------+--------+-------+---+
| 100    | Fred   | 10      |         |                | 30     | 25    | t |
| 110    | Eric   | 20      | M       | San Francisco  | 3      | 80    | n |
| 110    | John   | 40      | M       | Vancouver      | 2      | null  | f |
| 120    | Wilma  | 20      | F       |                | 1      | 5     | n |
| 130    | Alice  | 40      | F       | Vancouver      | 2      | null  | f |
+--------+--------+---------+---------+----------------+--------+-------+---+
```

再进行关联和分组：

```shell
sqlline> SELECT d.name, COUNT(*)
. . . .> FROM emps AS e JOIN depts AS d ON e.deptno = d.deptno
. . . .> GROUP BY d.name;
+------------+---------+
|    NAME    | EXPR$1  |
+------------+---------+
| Sales      | 1       |
| Marketing  | 2       |
+------------+---------+
```

最后，VALUES 运算符生成一个单行，这是测试表达式和 SQL 内置函数的快捷方法：

```shell
sqlline> VALUES CHAR_LENGTH('Hello, ' || 'world!');
+---------+
| EXPR$0  |
+---------+
| 13      |
+---------+
```

Calcite 有许多其他 SQL 特性。我们没有时间在这里介绍它们。你可以再写一些查询来试验。

## 模式探索

现在，Calcite 是如何找到这些表的？请记住，Calcite 内部对 CSV 文件一无所知（作为`没有存储层的数据库`，Calcite 不了解任何文件格式）。Calcite 知道这些表，是因为我们告诉去执行 `calcite-example-csv` 项目中的代码。

这个过程有几个步骤。首先，我们根据模型文件中的模式工厂类定义了一个模式。然后模式工厂创建了一个模式，并且这个模式创建几个表，每个表都知道如何通过扫描一个 CSV 文件来获取数据。最后，在 Calcite 解析了查询并生成计划来使用这些表之后，Calcite 在执行查询时调用这些表来读取数据。现在让我们更详细地了解这些步骤。

在 JDBC 连接字符串上，我们以 JSON 格式给出了模型的路径。下面是模型：

```json
{
  version: '1.0',
  defaultSchema: 'SALES',
  schemas: [
    {
      name: 'SALES',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.csv.CsvSchemaFactory',
      operand: {
        directory: 'sales'
      }
    }
  ]
}
```

这个模型定义了一个名为`SALES`的单个模式。该模式由插件类 [org.apache.calcite.adapter.csv.CsvSchemaFactory](https://github.com/apache/calcite/blob/master/example/csv/src/main/java/org/apache/calcite/adapter/csv/CsvSchemaFactory.java) 提供支持，它是 `calcite-example-csv` 项目的一部分，并实现了 Calcite 接口 [SchemaFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/SchemaFactory.html)。它的`create`方法实例化了一个模式，并从模型文件中传入了 `directory`参数：

```java
public Schema create(SchemaPlus parentSchema, String name,
    Map<String, Object> operand) {
  String directory = (String) operand.get("directory");
  String flavorName = (String) operand.get("flavor");
  CsvTable.Flavor flavor;
  if (flavorName == null) {
    flavor = CsvTable.Flavor.SCANNABLE;
  } else {
    flavor = CsvTable.Flavor.valueOf(flavorName.toUpperCase());
  }
  return new CsvSchema(
      new File(directory),
      flavor);
}
```

在模型的驱动下，模式工厂实例化了一个名为`SALES`的模式。该模式是 [org.apache.calcite.adapter.csv.CsvSchema](https://github.com/apache/calcite/blob/master/example/csv/src/main/java/org/apache/calcite/adapter/csv/CsvSchema.java) 的一个实例， 并实现了 Calcite 接口 [Schema](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/Schema.html)。

模式的一项工作是生成一系列的表（它还可以列出子模式和表函数，但这些是高级功能，`calcite-example-csv` 不支持它们）。这些表实现了 Calcite 的 [Table](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/Table.html) 接口。`CsvSchema`生成的表是[CsvTable](https://github.com/apache/calcite/blob/master/example/csv/src/main/java/org/apache/calcite/adapter/csv/CsvTable.java) 及其子类的实例 。

这是来自 `CsvSchema` 的相关代码，覆写了 `AbstractSchema` 基类中的 `getTableMap()` 方法。

```java
protected Map<String, Table> getTableMap() {
  // Look for files in the directory ending in ".csv", ".csv.gz", ".json",
  // ".json.gz".
  File[] files = directoryFile.listFiles(
      new FilenameFilter() {
        public boolean accept(File dir, String name) {
          final String nameSansGz = trim(name, ".gz");
          return nameSansGz.endsWith(".csv")
              || nameSansGz.endsWith(".json");
        }
      });
  if (files == null) {
    System.out.println("directory " + directoryFile + " not found");
    files = new File[0];
  }
  // Build a map from table name to table; each file becomes a table.
  final ImmutableMap.Builder<String, Table> builder = ImmutableMap.builder();
  for (File file : files) {
    String tableName = trim(file.getName(), ".gz");
    final String tableNameSansJson = trimOrNull(tableName, ".json");
    if (tableNameSansJson != null) {
      JsonTable table = new JsonTable(file);
      builder.put(tableNameSansJson, table);
      continue;
    }
    tableName = trim(tableName, ".csv");
    final Table table = createTable(file);
    builder.put(tableName, table);
  }
  return builder.build();
}

/** Creates different sub-type of table based on the "flavor" attribute. */
private Table createTable(File file) {
  switch (flavor) {
  case TRANSLATABLE:
    return new CsvTranslatableTable(file, null);
  case SCANNABLE:
    return new CsvScannableTable(file, null);
  case FILTERABLE:
    return new CsvFilterableTable(file, null);
  default:
    throw new AssertionError("Unknown flavor " + flavor);
  }
}
```

这个模式扫描目录并查找所有名称以 `.csv` 结尾的文件，并为它们创建表。在这种情况下，目录是`sales`并且包含文件`EMPS.csv`和`DEPTS.csv`，这些文件成为表`EMPS`和`DEPTS`。

## 模式中的表和视图

Note how we did not need to define any tables in the model; the schema generated the tables automatically.

You can define extra tables, beyond those that are created automatically, using the `tables` property of a schema.

Let’s see how to create an important and useful type of table, namely a view.

A view looks like a table when you are writing a query, but it doesn’t store data. It derives its result by executing a query. The view is expanded while the query is being planned, so the query planner can often perform optimizations like removing expressions from the SELECT clause that are not used in the final result.

Here is a schema that defines a view:	

```
{
  version: '1.0',
  defaultSchema: 'SALES',
  schemas: [
    {
      name: 'SALES',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.csv.CsvSchemaFactory',
      operand: {
        directory: 'sales'
      },
      tables: [
        {
          name: 'FEMALE_EMPS',
          type: 'view',
          sql: 'SELECT * FROM emps WHERE gender = \'F\''
        }
      ]
    }
  ]
}
```

The line `type: 'view'` tags `FEMALE_EMPS` as a view, as opposed to a regular table or a custom table. Note that single-quotes within the view definition are escaped using a back-slash, in the normal way for JSON.

JSON doesn’t make it easy to author long strings, so Calcite supports an alternative syntax. If your view has a long SQL statement, you can instead supply a list of lines rather than a single string:

```
{
  name: 'FEMALE_EMPS',
  type: 'view',
  sql: [
    'SELECT * FROM emps',
    'WHERE gender = \'F\''
  ]
}
```

Now we have defined a view, we can use it in queries just as if it were a table:

```
sqlline> SELECT e.name, d.name FROM female_emps AS e JOIN depts AS d on e.deptno = d.deptno;
+--------+------------+
|  NAME  |    NAME    |
+--------+------------+
| Wilma  | Marketing  |
+--------+------------+
```

## Custom tables[Permalink](https://calcite.apache.org/docs/tutorial.html#custom-tables)

Custom tables are tables whose implementation is driven by user-defined code. They don’t need to live in a custom schema.

There is an example in `model-with-custom-table.json`:

```
{
  version: '1.0',
  defaultSchema: 'CUSTOM_TABLE',
  schemas: [
    {
      name: 'CUSTOM_TABLE',
      tables: [
        {
          name: 'EMPS',
          type: 'custom',
          factory: 'org.apache.calcite.adapter.csv.CsvTableFactory',
          operand: {
            file: 'sales/EMPS.csv.gz',
            flavor: "scannable"
          }
        }
      ]
    }
  ]
}
```

We can query the table in the usual way:

```
sqlline> !connect jdbc:calcite:model=src/test/resources/model-with-custom-table.json admin admin
sqlline> SELECT empno, name FROM custom_table.emps;
+--------+--------+
| EMPNO  |  NAME  |
+--------+--------+
| 100    | Fred   |
| 110    | Eric   |
| 110    | John   |
| 120    | Wilma  |
| 130    | Alice  |
+--------+--------+
```

The schema is a regular one, and contains a custom table powered by [org.apache.calcite.adapter.csv.CsvTableFactory](https://github.com/apache/calcite/blob/master/example/csv/src/main/java/org/apache/calcite/adapter/csv/CsvTableFactory.java), which implements the Calcite interface [TableFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TableFactory.html). Its `create` method instantiates a `CsvScannableTable`, passing in the `file` argument from the model file:

```
public CsvTable create(SchemaPlus schema, String name,
    Map<String, Object> map, RelDataType rowType) {
  String fileName = (String) map.get("file");
  final File file = new File(fileName);
  final RelProtoDataType protoRowType =
      rowType != null ? RelDataTypeImpl.proto(rowType) : null;
  return new CsvScannableTable(file, protoRowType);
}
```

Implementing a custom table is often a simpler alternative to implementing a custom schema. Both approaches might end up creating a similar implementation of the `Table` interface, but for the custom table you don’t need to implement metadata discovery. (`CsvTableFactory` creates a `CsvScannableTable`, just as `CsvSchema` does, but the table implementation does not scan the filesystem for .csv files.)

Custom tables require more work for the author of the model (the author needs to specify each table and its file explicitly) but also give the author more control (say, providing different parameters for each table).

## Comments in models[Permalink](https://calcite.apache.org/docs/tutorial.html#comments-in-models)

Models can include comments using `/* ... */` and `//` syntax:

```
{
  version: '1.0',
  /* Multi-line
     comment. */
  defaultSchema: 'CUSTOM_TABLE',
  // Single-line comment.
  schemas: [
    ..
  ]
}
```

(Comments are not standard JSON, but are a harmless extension.)

## Optimizing queries using planner rules[Permalink](https://calcite.apache.org/docs/tutorial.html#optimizing-queries-using-planner-rules)

The table implementations we have seen so far are fine as long as the tables don’t contain a great deal of data. But if your customer table has, say, a hundred columns and a million rows, you would rather that the system did not retrieve all of the data for every query. You would like Calcite to negotiate with the adapter and find a more efficient way of accessing the data.

This negotiation is a simple form of query optimization. Calcite supports query optimization by adding *planner rules*. Planner rules operate by looking for patterns in the query parse tree (for instance a project on top of a certain kind of table), and replacing the matched nodes in the tree by a new set of nodes which implement the optimization.

Planner rules are also extensible, like schemas and tables. So, if you have a data store that you want to access via SQL, you first define a custom table or schema, and then you define some rules to make the access efficient.

To see this in action, let’s use a planner rule to access a subset of columns from a CSV file. Let’s run the same query against two very similar schemas:

```
sqlline> !connect jdbc:calcite:model=src/test/resources/model.json admin admin
sqlline> explain plan for select name from emps;
+-----------------------------------------------------+
| PLAN                                                |
+-----------------------------------------------------+
| EnumerableCalcRel(expr#0..9=[{inputs}], NAME=[$t1]) |
|   EnumerableTableScan(table=[[SALES, EMPS]])        |
+-----------------------------------------------------+
sqlline> !connect jdbc:calcite:model=src/test/resources/smart.json admin admin
sqlline> explain plan for select name from emps;
+-----------------------------------------------------+
| PLAN                                                |
+-----------------------------------------------------+
| EnumerableCalcRel(expr#0..9=[{inputs}], NAME=[$t1]) |
|   CsvTableScan(table=[[SALES, EMPS]])               |
+-----------------------------------------------------+
```

What causes the difference in plan? Let’s follow the trail of evidence. In the `smart.json` model file, there is just one extra line:

```
flavor: "translatable"
```

This causes a `CsvSchema` to be created with `flavor = TRANSLATABLE`, and its `createTable` method creates instances of [CsvTranslatableTable](https://github.com/apache/calcite/blob/master/example/csv/src/main/java/org/apache/calcite/adapter/csv/CsvTranslatableTable.java) rather than a `CsvScannableTable`.

`CsvTranslatableTable` implements the `TranslatableTable.toRel()` method to create [CsvTableScan](https://github.com/apache/calcite/blob/master/example/csv/src/main/java/org/apache/calcite/adapter/csv/CsvTableScan.java). Table scans are the leaves of a query operator tree. The usual implementation is `EnumerableTableScan`, but we have created a distinctive sub-type that will cause rules to fire.

Here is the rule in its entirety:

```
public class CsvProjectTableScanRule
    extends RelRule<CsvProjectTableScanRule.Config> {
  /** Creates a CsvProjectTableScanRule. */
  protected CsvProjectTableScanRule(Config config) {
    super(config);
  }

  @Override public void onMatch(RelOptRuleCall call) {
    final LogicalProject project = call.rel(0);
    final CsvTableScan scan = call.rel(1);
    int[] fields = getProjectFields(project.getProjects());
    if (fields == null) {
      // Project contains expressions more complex than just field references.
      return;
    }
    call.transformTo(
        new CsvTableScan(
            scan.getCluster(),
            scan.getTable(),
            scan.csvTable,
            fields));
  }

  private int[] getProjectFields(List<RexNode> exps) {
    final int[] fields = new int[exps.size()];
    for (int i = 0; i < exps.size(); i++) {
      final RexNode exp = exps.get(i);
      if (exp instanceof RexInputRef) {
        fields[i] = ((RexInputRef) exp).getIndex();
      } else {
        return null; // not a simple projection
      }
    }
    return fields;
  }

  /** Rule configuration. */
  public interface Config extends RelRule.Config {
    Config DEFAULT = EMPTY
        .withOperandSupplier(b0 ->
            b0.operand(LogicalProject.class).oneInput(b1 ->
                b1.operand(CsvTableScan.class).noInputs()))
        .as(Config.class);

    @Override default CsvProjectTableScanRule toRule() {
      return new CsvProjectTableScanRule(this);
    }
}
```

The default instance of the rule resides in the `CsvRules` holder class:

```
public abstract class CsvRules {
  public static final CsvProjectTableScanRule PROJECT_SCAN =
      CsvProjectTableScanRule.Config.DEFAULT.toRule();
}
```

The call to the `withOperandSupplier` method in the default configuration (the `DEFAULT` field in `interface Config`) declares the pattern of relational expressions that will cause the rule to fire. The planner will invoke the rule if it sees a `LogicalProject` whose sole input is a `CsvTableScan` with no inputs.

Variants of the rule are possible. For example, a different rule instance might instead match a `EnumerableProject` on a `CsvTableScan`.

The `onMatch` method generates a new relational expression and calls `RelOptRuleCall.transformTo()` to indicate that the rule has fired successfully.

## The query optimization process[Permalink](https://calcite.apache.org/docs/tutorial.html#the-query-optimization-process)

There’s a lot to say about how clever Calcite’s query planner is, but we won’t say it here. The cleverness is designed to take the burden off you, the writer of planner rules.

First, Calcite doesn’t fire rules in a prescribed order. The query optimization process follows many branches of a branching tree, just like a chess playing program examines many possible sequences of moves. If rules A and B both match a given section of the query operator tree, then Calcite can fire both.

Second, Calcite uses cost in choosing between plans, but the cost model doesn’t prevent rules from firing which may seem to be more expensive in the short term.

Many optimizers have a linear optimization scheme. Faced with a choice between rule A and rule B, as above, such an optimizer needs to choose immediately. It might have a policy such as “apply rule A to the whole tree, then apply rule B to the whole tree”, or apply a cost-based policy, applying the rule that produces the cheaper result.

Calcite doesn’t require such compromises. This makes it simple to combine various sets of rules. If, say you want to combine rules to recognize materialized views with rules to read from CSV and JDBC source systems, you just give Calcite the set of all rules and tell it to go at it.

Calcite does use a cost model. The cost model decides which plan to ultimately use, and sometimes to prune the search tree to prevent the search space from exploding, but it never forces you to choose between rule A and rule B. This is important, because it avoids falling into local minima in the search space that are not actually optimal.

Also (you guessed it) the cost model is pluggable, as are the table and query operator statistics it is based upon. But that can be a subject for later.

## JDBC adapter[Permalink](https://calcite.apache.org/docs/tutorial.html#jdbc-adapter)

The JDBC adapter maps a schema in a JDBC data source as a Calcite schema.

For example, this schema reads from a MySQL “foodmart” database:

```
{
  version: '1.0',
  defaultSchema: 'FOODMART',
  schemas: [
    {
      name: 'FOODMART',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.jdbc.JdbcSchema$Factory',
      operand: {
        jdbcDriver: 'com.mysql.jdbc.Driver',
        jdbcUrl: 'jdbc:mysql://localhost/foodmart',
        jdbcUser: 'foodmart',
        jdbcPassword: 'foodmart'
      }
    }
  ]
}
```

(The FoodMart database will be familiar to those of you who have used the Mondrian OLAP engine, because it is Mondrian’s main test data set. To load the data set, follow [Mondrian’s installation instructions](https://mondrian.pentaho.com/documentation/installation.php#2_Set_up_test_data).)

**Current limitations**: The JDBC adapter currently only pushes down table scan operations; all other processing (filtering, joins, aggregations and so forth) occurs within Calcite. Our goal is to push down as much processing as possible to the source system, translating syntax, data types and built-in functions as we go. If a Calcite query is based on tables from a single JDBC database, in principle the whole query should go to that database. If tables are from multiple JDBC sources, or a mixture of JDBC and non-JDBC, Calcite will use the most efficient distributed query approach that it can.

## The cloning JDBC adapter[Permalink](https://calcite.apache.org/docs/tutorial.html#the-cloning-jdbc-adapter)

The cloning JDBC adapter creates a hybrid database. The data is sourced from a JDBC database but is read into in-memory tables the first time each table is accessed. Calcite evaluates queries based on those in-memory tables, effectively a cache of the database.

For example, the following model reads tables from a MySQL “foodmart” database:

```
{
  version: '1.0',
  defaultSchema: 'FOODMART_CLONE',
  schemas: [
    {
      name: 'FOODMART_CLONE',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.clone.CloneSchema$Factory',
      operand: {
        jdbcDriver: 'com.mysql.jdbc.Driver',
        jdbcUrl: 'jdbc:mysql://localhost/foodmart',
        jdbcUser: 'foodmart',
        jdbcPassword: 'foodmart'
      }
    }
  ]
}
```

Another technique is to build a clone schema on top of an existing schema. You use the `source` property to reference a schema defined earlier in the model, like this:

```
{
  version: '1.0',
  defaultSchema: 'FOODMART_CLONE',
  schemas: [
    {
      name: 'FOODMART',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.jdbc.JdbcSchema$Factory',
      operand: {
        jdbcDriver: 'com.mysql.jdbc.Driver',
        jdbcUrl: 'jdbc:mysql://localhost/foodmart',
        jdbcUser: 'foodmart',
        jdbcPassword: 'foodmart'
      }
    },
    {
      name: 'FOODMART_CLONE',
      type: 'custom',
      factory: 'org.apache.calcite.adapter.clone.CloneSchema$Factory',
      operand: {
        source: 'FOODMART'
      }
    }
  ]
}
```

You can use this approach to create a clone schema on any type of schema, not just JDBC.

The cloning adapter isn’t the be-all and end-all. We plan to develop more sophisticated caching strategies, and a more complete and efficient implementation of in-memory tables, but for now the cloning JDBC adapter shows what is possible and allows us to try out our initial implementations.

## Further topics[Permalink](https://calcite.apache.org/docs/tutorial.html#further-topics)

There are many other ways to extend Calcite not yet described in this tutorial. The [adapter specification](https://calcite.apache.org/docs/adapter.html) describes the APIs involved.
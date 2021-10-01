---
layout: wiki
wiki: Calcite 官方文档中文版
order: 002
title: 教程
comment_id: 'calcite_chinese_doc'
---

> 原文链接：https://calcite.apache.org/docs/tutorial.html

这是一个分步骤教程，它展示了如何构建和连接 Calcite。它使用一个简单的适配器，使得 `CSV` 文件目录看起来像是一个包含表的模式。Calcite 则完成了剩余工作，并提供了一个完整的 SQL 接口。

`calcite-example-csv` 是一个功能齐全的 Calcite 适配器，它可以读取 `CSV` 格式的文本文件。同时值得注意的是，几百行 Java 代码就足以提供完整的 SQL 查询功能。

CSV 也可以作为构建其他数据格式适配器的模板。尽管代码行数不多，但它涵盖了几个重要的概念：

- 使用 `SchemaFactory` 和 `Schema` 接口的用户自定义模式；
- 在 JSON 格式的模型文件中声明模式；
- 在 JSON 格式的模型文件中声明视图；
- 使用 `Table` 接口的用户自定义表；
- 确定表的记录类型；
- Table 的简单实现——使用 `ScannableTable` 接口，直接枚举所有行；
- 更高级的实现——实现 `FilterableTable`，可以根据简单的谓词过滤掉行；
- Table 的高级实现——使用 `TranslatableTable` 的规划器规则转换为关系运算符；

## 下载和构建

你需要 `Java`（版本 8、9 或 10）和 `Git`。

```shell
$ git clone https://github.com/apache/calcite.git
$ cd calcite/example/csv
$ ./sqlline
```

## 首次查询

现在让我们使用 [sqlline](https://github.com/julianhyde/sqlline) 连接到 Calcite，`sqlline` 是一个包含在 Calcite 项目中的 SQL shell 功能。

```shell
$ ./sqlline
sqlline> !connect jdbc:calcite:model=src/test/resources/model.json admin admin
```

如果你运行的是 Windows，则命令为 `sqlline.bat`。

执行一个元数据查询：

```sql
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

> JDBC 专家们注意：sqlline 的 `!tables` 命令只是在背后执行了 `DatabaseMetaData.getTables()` 方法。它也提供了其他命令，可以用来查询 JDBC 元数据，例如 `!columns` 和 `!describe`。

正如你看见的，系统中有 5 张表： `EMPS`，`DEPTS` 和 `HOBBIES` 表在当前 `SALES` 模式中，`COLUMNS` 和  `TABLES` 表在系统 `metadata` 模式中。系统表始终存在于 Calcite 中，而其他表则由模式的具体实现提供。在这个场景下，`EMPS` 和 `DEPTS` 表是基于 `resources/sales` 目录下的 `EMPS.csv` 和 `DEPTS.csv` 文件。

让我们对这些表执行一些查询，来展示 Calcite 提供的 SQL 完整实现。首先，进行表扫描：

```sql
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

再进行关联和分组查询：

```sql
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

最后，`VALUES` 运算符会返回一个单行，这是测试表达式和 SQL 内置函数的快捷方法：

```sql
sqlline> VALUES CHAR_LENGTH('Hello, ' || 'world!');
+---------+
| EXPR$0  |
+---------+
| 13      |
+---------+
```

Calcite 有许多其他 SQL 特性。我们没有时间在这里介绍它们。你可以再写一些查询来进行实验。

## 模式发现

那么，Calcite 是如何发现这些表的呢？记住，Calcite 内核对 CSV 文件一无所知（作为一个没有存储层的数据库，Calcite 不了解任何文件格式）。Calcite 知道这些表，完全是因为我们告诉它去执行 `calcite-example-csv` 项目中的代码。

发现过程包含了几个步骤。首先，我们基于模型文件中的模式工厂类定义了一个模式。然后，模式工厂创建了一个模式，并且这个模式创建一些表，每个表都知道通过扫描 CSV 文件来获取数据。最后，在 Calcite 解析完查询并生成使用这些表的执行计划后，Calcite 会在执行查询时，调用这些表来读取数据。现在让我们更详细地了解这些步骤。

在 JDBC 连接字符串上，我们以 JSON 格式给出了模型的路径。下面是模型的内容：

```json
{
    "version": "1.0",
    "defaultSchema": "SALES",
    "schemas": [
        {
            "name": "SALES",
            "type": "custom",
            "factory": "org.apache.calcite.adapter.csv.CsvSchemaFactory",
            "operand": {
                "directory": "sales"
            }
        }
    ]
}
```

模型定义了一个名为 `SALES` 的单模式。这个模式由插件类 `org.apache.calcite.adapter.csv.CsvSchemaFactory` 提供支持，它是 `calcite-example-csv` 项目的一部分，并实现了 Calcite  `SchemaFactory` 接口。它的 `create` 方法，通过从模型文件中传入的 `directory` 参数，实例化了模式：

```java
public Schema create(SchemaPlus parentSchema, String name, Map<String, Object> operand) {
    String directory = (String) operand.get("directory");
    String flavorName = (String) operand.get("flavor");
    CsvTable.Flavor flavor;
    if (flavorName == null) {
        flavor = CsvTable.Flavor.SCANNABLE;
    } else {
        flavor = CsvTable.Flavor.valueOf(flavorName.toUpperCase());
    }
    return new CsvSchema(new File(directory), flavor);
}
```

在模型的驱动下，模式工厂实例化了一个名为 `SALES` 的单模式。这个模式是 `org.apache.calcite.adapter.csv.CsvSchema` 的一个实例， 并实现了 Calcite `Schema` 接口。

模式的一项工作是生成一系列的表（它还可以生成子模式和表函数，但这些是高级功能，`calcite-example-csv` 不支持它们）。这些表实现了 Calcite `Table` 接口。`CsvSchema` 生成的表是 `CsvTable` 及其子类的实例。

下面是 `CsvSchema` 的相关代码，它重写了 `AbstractSchema` 基类中的 `getTableMap()` 方法。

```java
protected Map<String, Table> getTableMap() {
    // Look for files in the directory ending in ".csv", ".csv.gz", ".json", ".json.gz".
    File[] files = directoryFile.listFiles(new FilenameFilter() {
        public boolean accept(File dir, String name) {
            final String nameSansGz = trim(name, ".gz");
            return nameSansGz.endsWith(".csv") || nameSansGz.endsWith(".json");
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

/**
 * Creates different sub-type of table based on the "flavor" attribute.
 */
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

这个模式扫描目录并查找所有名称以 `.csv` 结尾的文件，并为它们创建表。在这种场景下，目录是 `sales` ，目录下包含了文件 `EMPS.csv` 和 `DEPTS.csv`，这些文件对应表 `EMPS` 和 `DEPTS`。

## 模式中的表和视图

注意，我们不需要在模型中定义任何表，模式自动生成了这些表。除了这些自动创建的表之外，你还可以使用模式中的 `tables` 属性，定义额外的表。让我们看看，如何创建一个重要且有用的表类型，即视图。

当你在写一个查询时，视图看起来就像一个表，但它不存储数据。它通过执行查询获取结果。在查询语句被计划执行时，视图将会被展开，因此查询计划器通常可以执行优化，例如，删除那些在最终结果中未使用的 SELECT 子句表达式。

下面是一个定义视图的模式：

```json
{
    "version": "1.0",
    "defaultSchema": "SALES",
    "schemas": [
        {
            "name": "SALES",
            "type": "custom",
            "factory": "org.apache.calcite.adapter.csv.CsvSchemaFactory",
            "operand": {
                "directory": "sales"
            },
            "tables": [
                {
                    "name": "FEMALE_EMPS",
                    "type": "view",
                    "sql": "SELECT * FROM emps WHERE gender = 'F'"
                }
            ]
        }
    ]
}
```

 `"type": "view"` 这行将 `FEMALE_EMPS` 标记为视图，而不是常规表或自定义表。JSON 并不能简单地书写长字符串，因此 Calcite 支持另一种可选的语法。如果你的视图有很长的 SQL 语句，你可以将单个字符串改为多行列表：

```json
{
    "name": "FEMALE_EMPS",
    "type": "view",
    "sql": [
        "SELECT * FROM emps",
        "WHERE gender = 'F'"
    ]
}
```

现在，我们已经定义了一个视图，我们可以像使用表一样，在查询中使用它：

```sql
sqlline> SELECT e.name, d.name FROM female_emps AS e JOIN depts AS d on e.deptno = d.deptno;
+--------+------------+
|  NAME  |    NAME    |
+--------+------------+
| Wilma  | Marketing  |
+--------+------------+
```

## 自定义表

自定义表是其实现由用户定义的代码驱动的表。他们不需要生活在自定义模式中。

有一个例子`model-with-custom-table.json`：

```json
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

我们可以用通常的方式查询表：

```shell
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

该模式是一个常规模式，并包含一个由[org.apache.calcite.adapter.csv.CsvTableFactory](https://github.com/apache/calcite/blob/master/example/csv/src/main/java/org/apache/calcite/adapter/csv/CsvTableFactory.java)提供支持的自定义表 ，它实现了 Calcite 接口 [TableFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TableFactory.html)。它的`create`方法实例化 a `CsvScannableTable`，`file`从模型文件中传入参数：

```java
public CsvTable create(SchemaPlus schema, String name,
    Map<String, Object> map, RelDataType rowType) {
  String fileName = (String) map.get("file");
  final File file = new File(fileName);
  final RelProtoDataType protoRowType =
      rowType != null ? RelDataTypeImpl.proto(rowType) : null;
  return new CsvScannableTable(file, protoRowType);
}
```

实现自定义表通常是实现自定义模式的更简单的替代方法。这两种方法最终可能会创建类似的`Table`接口实现，但对于自定义表，你不需要实现元数据发现。（`CsvTableFactory` 创建一个`CsvScannableTable`，就像一样`CsvSchema`，但表实现不会扫描文件系统以查找 .csv 文件。）

自定义表需要模型的作者做更多的工作（作者需要明确指定每个表及其文件），但也给作者更多的控制权（例如，为每个表提供不同的参数）。

## 模型中的注释

模型可以使用`/* ... */`和`//`语法包含注释：

```json
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

（注释不是标准的 JSON，而是一种无害的扩展。）

## 使用规划器规则优化查询

到目前为止我们看到的表实现，只要表不包含大量数据就可以。但是，如果你的客户表有一百列和一百万行，你宁愿系统没有为每个查询检索所有数据。你希望 Calcite 与适配器协商并找到一种更有效的数据访问方式。

这种协商是查询优化的一种简单形式。Calcite 通过添加*规划器规则来*支持查询优化。规划器规则通过在查询解析树中查找模式（例如某种表顶部的项目）来操作，并用一组新的实现优化的节点替换树中匹配的节点。

规划器规则也是可扩展的，如模式和表。因此，如果你有一个要通过 SQL 访问的数据存储，则首先定义自定义表或模式，然后定义一些规则以提高访问效率。

要查看此操作，让我们使用规划器规则访问 CSV 文件中的列子集。让我们对两个非常相似的模式运行相同的查询：

```shell
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

是什么导致计划的差异？让我们跟随证据的踪迹。在 `smart.json`模型文件中，只有一行：

```properties
flavor: "translatable"
```

这会导致 a`CsvSchema`被创建 `flavor = TRANSLATABLE`，并且它的`createTable`方法创建[CsvTranslatableTable](https://github.com/apache/calcite/blob/master/example/csv/src/main/java/org/apache/calcite/adapter/csv/CsvTranslatableTable.java) 而不是 a 的实例 `CsvScannableTable`。

`CsvTranslatableTable`实现`TranslatableTable.toRel()` 创建[CsvTableScan](https://github.com/apache/calcite/blob/master/example/csv/src/main/java/org/apache/calcite/adapter/csv/CsvTableScan.java)的 方法 。表扫描是查询运算符树的叶子。通常的实现是 `EnumerableTableScan`，但我们创建了一个独特的子类型，它将导致规则触发。

这是完整的规则：

```java
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

规则的默认实例驻留在`CsvRules`holder 类中：

```java
public abstract class CsvRules {
  public static final CsvProjectTableScanRule PROJECT_SCAN =
      CsvProjectTableScanRule.Config.DEFAULT.toRule();
}
```

`withOperandSupplier`对默认配置中的方法（中的`DEFAULT`字段`interface Config`）的调用声明了将导致规则触发的关系表达式模式。如果规划器看到 a`LogicalProject`的唯一输入是`CsvTableScan`没有输入的 a ，它将调用该规则。

规则的变体是可能的。例如，不同的规则实例可能会匹配 a`EnumerableProject`上的 a `CsvTableScan`。

该`onMatch`方法生成一个新的关系表达式并调用 `RelOptRuleCall.transformTo()` 以指示规则已成功触发。

## 查询优化过程

关于 Calcite 的查询规划器有多聪明有很多要说的，但我们不会在这里说。聪明旨在减轻你的负担，规划规则的作者。

首先，Calcite 不会按照规定的顺序触发规则。查询优化过程遵循分支树的许多分支，就像下棋程序检查许多可能的移动序列一样。如果规则 A 和 B 都匹配查询运算符树的给定部分，则 Calcite 可以同时触发。

其次，Calcite 在计划之间进行选择时使用成本，但成本模型并不能阻止规则的触发，这在短期内似乎更昂贵。

许多优化器都有一个线性优化方案。如上所述，面对规则 A 和规则 B 之间的选择，这样的优化器需要立即选择。它可能有诸如“将规则 A 应用于整棵树，然后将规则 B 应用于整棵树”之类的策略，或者应用基于成本的策略，应用产生更便宜结果的规则。

方解石不需要这样的妥协。这使得组合各种规则集变得简单。如果，假设你想将识别物化视图的规则与从 CSV 和 JDBC 源系统读取的规则结合起来，你只需将所有规则的集合提供给 Calcite 并告诉它执行它。

方解石确实使用成本模型。成本模型决定最终使用哪个计划，有时会修剪搜索树以防止搜索空间爆炸，但它从不强迫你在规则 A 和规则 B 之间进行选择。 这很重要，因为它避免陷入局部最小值在实际上不是最佳的搜索空间中。

此外（你猜对了）成本模型是可插入的，它所基于的表和查询运算符统计也是如此。但这可能是以后的主题。

## JDBC 适配器

JDBC 适配器将 JDBC 数据源中的模式映射为 Calcite 模式。

例如，这个模式从 MySQL “foodmart” 数据库中读取：

```json
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

（FoodMart 数据库使用过 Mondrian OLAP 引擎的人应该比较熟悉，因为它是 Mondrian 的主要测试数据集。要加载数据集，请按照[Mondrian 的安装说明进行操作](https://mondrian.pentaho.com/documentation/installation.php#2_Set_up_test_data)。）

**当前限制**：JDBC 适配器当前只下推表扫描操作；所有其他处理（过滤、连接、聚合等）都发生在 Calcite 中。我们的目标是将尽可能多的处理下推到源系统，在我们进行时翻译语法、数据类型和内置函数。如果 Calcite 查询基于来自单个 JDBC 数据库的表，原则上整个查询应该转到该数据库。如果表来自多个 JDBC 源，或者 JDBC 和非 JDBC 的混合，Calcite 将尽可能使用最有效的分布式查询方法。

## 克隆 JDBC 适配器

克隆 JDBC 适配器会创建一个混合数据库。数据来自 JDBC 数据库，但在第一次访问每个表时被读入内存表。Calcite 基于这些内存表评估查询，实际上是数据库的缓存。

例如，以下模型从 MySQL “foodmart” 数据库读取表：

```json
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

另一种技术是在现有模式之上构建克隆模式。你可以使用该`source`属性来引用模型中先前定义的架构，如下所示：

```json
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

你可以使用这种方法在任何类型的模式上创建克隆模式，而不仅仅是 JDBC。

克隆适配器并不是万能的。我们计划开发更复杂的缓存策略，以及更完整和更高效的内存表实现，但现在克隆 JDBC 适配器展示了可能的内容，并允许我们尝试我们的初始实现。

## 更多主题

本教程中还没有描述许多其他方法来扩展 Calcite。该[适配器规格](https://calcite.apache.org/docs/adapter.html)说明参与的 API。

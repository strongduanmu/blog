---
layout: wiki
wiki: Calcite 官方文档中文版
order: 201
title: JSON/YAML 模型
date: 2023-10-26 09:00:00
---

> 原文链接：https://calcite.apache.org/docs/model.html

Calcite 模型可以表示为 JSON/YAML 文件。本文描述了这些文件的结构。还可以使用 `Schema` SPI 编程的方式构建模型。

## 元素 Elements

### 根 Root

#### JSON

```json
{
  version: '1.0',
  defaultSchema: 'mongo',
  schemas: [ Schema... ],
  types: [ Type... ]
}
```

#### YAML

```yaml
version: 1.0
defaultSchema: mongo
schemas:
- [Schema...]
types:
- [Type...]
```

* `version`（必填字符串）必须具有 value `1.0`；

* `defaultSchema`（可选字符串）。如果指定，它将是此模型中定义的模式名称（区分大小写），并将成为使用此模型的 Calcite 连接的默认模式；

* `schemas`（[模式 Schema ](https://calcite.apache.org/docs/model.html#schema)元素的可选列表）；

* `types`（所有模式共享的 [Type](https://calcite.apache.org/docs/model.html#type) 元素的可选列表）。

### 模式 Schema

TODO

发生在`root.schemas`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-1)

```
{
  name: 'foodmart',
  path: ['lib'],
  cache: true,
  materializations: [ Materialization... ]
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-1)

```
name: foodmart
path:
  lib
cache: true
materializations:
- [ Materialization... ]
```

`name`（必需字符串）是模式的名称。

`type`（可选字符串，默认`map`）表示子类型。值为：

- `map`对于[地图模式](https://calcite.apache.org/docs/model.html#map-schema)
- `custom`对于[自定义架构](https://calcite.apache.org/docs/model.html#custom-schema)
- `jdbc`对于[JDBC 模式](https://calcite.apache.org/docs/model.html#jdbc-schema)

`path`（可选列表）是用于解析此架构中使用的函数的 SQL 路径。如果指定，它必须是一个列表，并且列表的每个元素必须是字符串或字符串列表。例如，

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-2)

```
  path: [ ['usr', 'lib'], 'lib' ]
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-2)

```
path:
- [usr, lib]
- lib
```

声明一个包含两个元素的路径：模式“/usr/lib”和模式“/lib”。大多数模式都位于顶层，对于这些模式，您可以使用字符串。

`materializations`（ [Materialization](https://calcite.apache.org/docs/model.html#materialization)的可选列表）定义此模式中作为查询具体化的表。

`cache`（可选布尔值，默认 true）告诉 Calcite 是否缓存此模式生成的元数据（表、函数和子模式）。

- 如果`false`，Calcite 将在每次需要元数据时返回到模式，例如，每次需要表列表以验证针对模式的查询时。
- 如果`true`，Calcite 将在第一次读取元数据时缓存元数据。这可以带来更好的性能，特别是在名称匹配不区分大小写的情况下。

然而，这也导致了缓存陈旧的问题。特定模式实现可以重写该 `Schema.contentsHaveChangedSince`方法来告诉 Calcite 何时应考虑其缓存已过期。

在模式中显式创建的表、函数、类型和子模式不受此缓存机制的影响。它们总是立即出现在模式中，并且永远不会被刷新。

### 地图模式[永久链接](https://calcite.apache.org/docs/model.html#map-schema)

与基类[Schema](https://calcite.apache.org/docs/model.html#schema)一样，发生在`root.schemas`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-3)

```
{
  name: 'foodmart',
  type: 'map',
  tables: [ Table... ],
  functions: [ Function... ],
  types: [ Type... ]
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-3)

```
name: foodmart
type: map
tables:
- [ Table... ]
functions:
- [ Function... ]
types:
- [ Type... ]
name`,,,,继承自 [Schema](https://calcite.apache.org/docs/model.html#schema)。`type`_ `path`_`cache``materializations
```

`tables`（[表](https://calcite.apache.org/docs/model.html#table)元素的可选列表）定义此模式中的表。

`functions`（[函数](https://calcite.apache.org/docs/model.html#function)元素的可选列表）定义此模式中的函数。

`types`定义此模式中的类型。

### 自定义架构[永久链接](https://calcite.apache.org/docs/model.html#custom-schema)

与基类[Schema](https://calcite.apache.org/docs/model.html#schema)一样，发生在`root.schemas`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-4)

```
{
  name: 'mongo',
  type: 'custom',
  factory: 'org.apache.calcite.adapter.mongodb.MongoSchemaFactory',
  operand: {
    host: 'localhost',
    database: 'test'
  }
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-4)

```
name: mongo
type: custom
factory: org.apache.calcite.adapter.mongodb.MongoSchemaFactory
operand:
  host: localhost
  database: test
name`,,,,继承自 [Schema](https://calcite.apache.org/docs/model.html#schema)。`type`_ `path`_`cache``materializations
```

`factory`（必需字符串）是该模式的工厂类的名称。必须实现接口 [org.apache.calcite.schema.SchemaFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/SchemaFactory.html) 并具有公共默认构造函数。

`operand`（可选映射）包含要传递给工厂的属性。

### JDBC 模式[永久链接](https://calcite.apache.org/docs/model.html#jdbc-schema)

与基类[Schema](https://calcite.apache.org/docs/model.html#schema)一样，发生在`root.schemas`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-5)

```
{
  name: 'foodmart',
  type: 'jdbc',
  jdbcDriver: TODO,
  jdbcUrl: TODO,
  jdbcUser: TODO,
  jdbcPassword: TODO,
  jdbcCatalog: TODO,
  jdbcSchema: TODO
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-5)

```
name: foodmart
type: jdbc
jdbcDriver: TODO
jdbcUrl: TODO
jdbcUser: TODO
jdbcPassword: TODO
jdbcCatalog: TODO
jdbcSchema: TODO
name`,,,,继承自 [Schema](https://calcite.apache.org/docs/model.html#schema)。`type`_ `path`_`cache``materializations
```

`jdbcDriver`（可选字符串）是 JDBC 驱动程序类的名称。如果未指定，则使用 JDBC DriverManager 选择的任何类。

`jdbcUrl`（可选字符串）是 JDBC 连接字符串，例如“jdbc:mysql://localhost/foodmart”。

`jdbcUser`（可选字符串）是 JDBC 用户名。

`jdbcPassword`（可选字符串）是 JDBC 密码。

`jdbcCatalog`（可选字符串）是 JDBC 数据源中初始目录的名称。

`jdbcSchema`（可选字符串）是 JDBC 数据源中初始模式的名称。

### 物化[永久链接](https://calcite.apache.org/docs/model.html#materialization)

发生在`root.schemas.materializations`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-6)

```
{
  view: 'V',
  table: 'T',
  sql: 'select deptno, count(*) as c, sum(sal) as s from emp group by deptno'
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-6)

```
view: V
table: T
sql: select deptno, count(*) as c, sum(sal) as s from emp group by deptno
```

`view`（可选字符串）是视图的名称； null 表示该表已经存在并且填充了正确的数据。

`table`（必需字符串）是在查询中具体化数据的表的名称。如果`view`不为空，则该表可能不存在，如果不存在，Calcite 将创建并填充内存中的表。

`sql`（可选字符串，或将连接为多行字符串的字符串列表）是具体化的 SQL 定义。

### 桌子[永久链接](https://calcite.apache.org/docs/model.html#table)

发生在`root.schemas.tables`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-7)

```
{
  name: 'sales_fact',
  columns: [ Column... ]
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-7)

```
name: sales_fact
columns:
  [ Column... ]
```

`name`（必填字符串）是该表的名称。在架构中必须是唯一的。

`type`（可选字符串，默认`custom`）表示子类型。值为：

- `custom`对于[定制表](https://calcite.apache.org/docs/model.html#custom-table)
- `view`对于[视图](https://calcite.apache.org/docs/model.html#view)

`columns`[（ Column](https://calcite.apache.org/docs/model.html#column)元素列表，对于某些类型的表是必需的，对于其他类型的表是可选的，例如View）

### 看法[永久链接](https://calcite.apache.org/docs/model.html#view)

与基类[Table](https://calcite.apache.org/docs/model.html#table)一样，出现在`root.schemas.tables`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-8)

```
{
  name: 'female_emps',
  type: 'view',
  sql: "select * from emps where gender = 'F'",
  modifiable: true
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-8)

```
name: female_emps
type: view
sql: select * from emps where gender = 'F'
modifiable: true
```

`name`, `type`,从[Table](https://calcite.apache.org/docs/model.html#table)`columns`继承。

`sql`（必需的字符串，或将连接为多行字符串的字符串列表）是视图的 SQL 定义。

`path`（可选列表）是解析查询的 SQL 路径。如果未指定，则默认为当前架构。

`modifiable`（可选布尔值）是视图是否可修改。如果为 null 或未指定，Calcite 会推断视图是否可修改。

如果视图仅包含 SELECT、FROM、WHERE（无 JOIN、聚合或子查询）和每一列，则视图是可修改的：

- 在 SELECT 子句中指定一次；或者
- 出现在带有谓词的 WHERE 子句中`column = literal`；或者
- 可以为空。

第二个子句允许 Calcite 自动为隐藏列提供正确的值。它在多租户环境中很有用，其中`tenantId` 列是隐藏的、强制的（NOT NULL），并且对于特定视图具有常量值。

有关可修改视图的错误：

- 如果视图被标记`modifiable: true`且不可修改，Calcite 在读取模式时会抛出错误。
- 如果您向不可修改的视图提交 INSERT、UPDATE 或 UPSERT 命令，Calcite 在验证语句时会抛出错误。
- 如果 DML 语句创建的行不会出现在视图中（例如，上面`female_emps`、with 中的行`gender = 'M'`），Calcite 将在执行该语句时引发错误。

### 定制桌子[永久链接](https://calcite.apache.org/docs/model.html#custom-table)

与基类[Table](https://calcite.apache.org/docs/model.html#table)一样，出现在`root.schemas.tables`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-9)

```
{
  name: 'female_emps',
  type: 'custom',
  factory: 'TODO',
  operand: {
    todo: 'TODO'
  }
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-9)

```
name: female_emps
type: custom
factory: TODO
operand:
  todo: TODO
```

`name`, `type`,从[Table](https://calcite.apache.org/docs/model.html#table)`columns`继承。

`factory`（必需字符串）是该表的工厂类的名称。必须实现接口 [org.apache.calcite.schema.TableFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TableFactory.html) 并具有公共默认构造函数。

`operand`（可选映射）包含要传递给工厂的属性。

### 溪流[永久链接](https://calcite.apache.org/docs/model.html#stream)

有关表是否允许流式传输的信息。

发生在`root.schemas.tables.stream`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-10)

```
{
  stream: true,
  history: false
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-10)

```
stream: true
history: false
```

`stream`（可选；默认 true）是表是否允许流式传输。

`history`（可选；默认 false）是流的历史记录是否可用。

### 柱子[永久链接](https://calcite.apache.org/docs/model.html#column)

发生在`root.schemas.tables.columns`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-11)

```
{
  name: 'empno'
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-11)

```
name: empno
```

`name`（必填字符串）是该列的名称。

### 功能[永久链接](https://calcite.apache.org/docs/model.html#function)

发生在`root.schemas.functions`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-12)

```
{
  name: 'MY_PLUS',
  className: 'com.example.functions.MyPlusFunction',
  methodName: 'apply',
  path: []
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-12)

```
name: MY_PLUS
className: com.example.functions.MyPlusFunction
methodName: apply
path: {}
```

`name`（必需字符串）是该函数的名称。

`className`（必填字符串）是实现此函数的类的名称。

`methodName`（可选字符串）是实现此功能的方法的名称。

如果`methodName`指定，该方法必须存在（区分大小写），并且 Calcite 将创建一个标量函数。该方法可以是静态或非静态的，但如果是非静态的，则该类必须具有不带参数的公共构造函数。

如果`methodName`是“*”，Calcite 会为类中的每个方法创建一个函数。

如果`methodName`未指定，Calcite 会查找名为“eval”的方法，如果找到，则创建表宏或标量函数。它还查找方法“init”、“add”、“merge”、“result”，如果找到，则创建一个聚合函数。

`path`（可选的字符串列表）是解析此函数的路径。

### 类型[永久链接](https://calcite.apache.org/docs/model.html#type)

发生在`root.types`和 之内`root.schemas.types`。

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-13)

```
{
  name: 'mytype1',
  type: 'BIGINT',
  attributes: [
    {
      name: 'f1',
      type: 'BIGINT'
    }
  ]
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-13)

```
name: mytype1
type: BIGINT
attributes:
- name: f1
  type: BIGINT
```

`name`（必需字符串）是该类型的名称。

`type`（可选）是 SQL 类型。

`attributes`（可选）是该类型的属性列表。如果`attributes`和`type`两者存在于同一级别， `type`则优先。

### 格子[永久链接](https://calcite.apache.org/docs/model.html#lattice)

发生在`root.schemas.lattices`.

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-14)

```
{
  name: 'star',
  sql: [
    'select 1 from "foodmart"."sales_fact_1997" as "s"',
    'join "foodmart"."product" as "p" using ("product_id")',
    'join "foodmart"."time_by_day" as "t" using ("time_id")',
    'join "foodmart"."product_class" as "pc" on "p"."product_class_id" = "pc"."product_class_id"'
  ],
  auto: false,
  algorithm: true,
  algorithmMaxMillis: 10000,
  rowCountEstimate: 86837,
  defaultMeasures: [ {
    agg: 'count'
  } ],
  tiles: [ {
    dimensions: [ 'the_year', ['t', 'quarter'] ],
    measures: [ {
      agg: 'sum',
      args: 'unit_sales'
    }, {
      agg: 'sum',
      args: 'store_sales'
    }, {
      agg: 'count'
    } ]
  } ]
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-14)

```
name: star
sql: >
  select 1 from "foodmart"."sales_fact_1997" as "s"',
  join "foodmart"."product" as "p" using ("product_id")',
  join "foodmart"."time_by_day" as "t" using ("time_id")',
  join "foodmart"."product_class" as "pc" on "p"."product_class_id" = "pc"."product_class_id"
auto: false
algorithm: true
algorithmMaxMillis: 10000
rowCountEstimate: 86837
defaultMeasures:
- agg: count
tiles:
- dimensions: [ 'the_year', ['t', 'quarter'] ]
  measures:
  - agg: sum
    args: unit_sales
  - agg: sum
    args: store_sales
  - agg: 'count'
```

`name`（必填字符串）是该格子的名称。

`sql`（必需的字符串，或将连接为多行字符串的字符串列表）是定义该网格的事实表、维度表和连接路径的 SQL 语句。

`auto`（可选布尔值，默认 true）是执行查询时是否根据需要具体化图块。

`algorithm`（可选布尔值，默认 false）是否使用优化算法来建议和填充初始图块集。

`algorithmMaxMillis`（可选长整型，默认为-1，表示无限制）是运行算法的最大毫秒数。在此之后，获取算法迄今为止得出的最佳结果。

`rowCountEstimate`（可选 double，默认 1000.0）网格中的估计行数

`tiles`（[Tile](https://calcite.apache.org/docs/model.html#tile)元素的可选列表）是要预先创建的物化聚合的列表。

`defaultMeasures`[（可选的度量](https://calcite.apache.org/docs/model.html#measure)元素 列表）是图块默认应具有的度量列表。中定义的任何图块`tiles`仍然可以定义自己的度量，包括不在此列表中的度量。如果未指定，默认的度量列表只是“count(*)”：

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-15)

```
[ { name: 'count' } ]
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-15)

```
name: count
```

`statisticProvider`[（实现org.apache.calcite.materialize.LatticeStatisticProvider](https://calcite.apache.org/javadocAggregate/org/apache/calcite/materialize/LatticeStatisticProvider.html)的类的可选名称 ）提供每列中不同值数量的估计。

您可以使用类名，或类加静态字段。例子：

```
  "statisticProvider": "org.apache.calcite.materialize.Lattices#CACHING_SQL_STATISTIC_PROVIDER"
```

如果未设置，Calcite 将生成并执行 SQL 查询以查找真实值，并缓存结果。

另请参见：[格子](https://calcite.apache.org/docs/lattice.html)。

### 瓦[永久链接](https://calcite.apache.org/docs/model.html#tile)

发生在`root.schemas.lattices.tiles`.

```
{
  dimensions: [ 'the_year', ['t', 'quarter'] ],
  measures: [ {
    agg: 'sum',
    args: 'unit_sales'
  }, {
    agg: 'sum',
    args: 'store_sales'
  }, {
    agg: 'count'
  } ]
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-16)

```
dimensions: [ 'the_year', ['t', 'quarter'] ]
measures:
- agg: sum
  args: unit_sales
- agg: sum
  args: store_sales
- agg: count
```

`dimensions`（字符串列表或字符串列表，必需，但可以为空）定义此图块的维度。每个维度都是格子中的一列，就像一个`GROUP BY`子句。每个元素可以是字符串（晶格内列的唯一标签）或字符串列表（由表别名和列名组成的对）。

`measures`（[Measure](https://calcite.apache.org/docs/model.html#measure)元素的可选列表）是应用于参数的聚合函数的列表。如果未指定，则使用晶格的默认度量列表。

### 措施[永久链接](https://calcite.apache.org/docs/model.html#measure)

发生在`root.schemas.lattices.defaultMeasures` 和 之内`root.schemas.lattices.tiles.measures`。

#### JSON[永久链接](https://calcite.apache.org/docs/model.html#json-16)

```
{
  agg: 'sum',
  args: [ 'unit_sales' ]
}
```

#### YAML[永久链接](https://calcite.apache.org/docs/model.html#yaml-17)

```
agg: sum
args: unit_sales
```

`agg`是聚合函数的名称（通常是“count”、“sum”、“min”、“max”）。

`args`（可选）是列标签（字符串），或零个或多个列标签的列表

有效值为：

- 未指定：无参数
- null：没有参数
- 空列表：无参数
- String：单个参数，格子列的名称
- 列表：多个参数，每个参数一个列标签

与点阵维度不同，度量不能以限定格式 {@code [“table”, “column”]} 指定。定义晶格时，请确保要用作度量的每一列在晶格内都有唯一的标签（如有必要，请使用“{@code AS label}”），并在想要传递该列时使用该标签作为衡量参数。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

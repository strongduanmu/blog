---
layout: wiki
wiki: calcite
order: 201
title: JSON/YAML 模型
date: 2023-10-26 09:00:00
banner: /assets/banner/banner_4.jpg
---

> 原文链接：https://calcite.apache.org/docs/model.html

Calcite 模型可以表示为 `JSON/YAML` 文件。本文描述了这些文件的结构。还可以使用 `Schema` SPI 编程的方式构建模型。

## 根节点

**JSON：**

```json
{
  version: '1.0',
  defaultSchema: 'mongo',
  schemas: [ Schema... ],
  types: [ Type... ]
}
```

**YAML：**

```yaml
version: 1.0
defaultSchema: mongo
schemas:
- [Schema...]
types:
- [Type...]
```

* `version`：必填字符串，必须设置 version 属性值 `1.0`；

* `defaultSchema`：可选字符串，如果指定，它将作为此模型中定义的模式名称（区分大小写），并将成为使用此模型 Calcite 连接的默认模式；

* `schemas`：[模式](https://strongduanmu.com/wiki/calcite/model.html#%E6%A8%A1%E5%BC%8F)元素的可选列表；

* `types`：所有模式共享的[类型](https://strongduanmu.com/wiki/calcite/model.html#%E7%B1%BB%E5%9E%8B)元素可选列表。

## 模式

配置在 `root.schemas` 节点中。

**JSON：**

```json
{
  name: 'foodmart',
  path: ['lib'],
  cache: true,
  materializations: [ Materialization... ]
}
```

**YAML：**

```yaml
name: foodmart
path:
  lib
cache: true
materializations:
- [ Materialization... ]
```

* `name`：必填字符串，模式的名称；

* `type`：可选字符串，默认为 `map`，表示子类型。可选值为：

  - `map` 用于配置 [Map 模式](https://strongduanmu.com/wiki/calcite/model.html#map-%E6%A8%A1%E5%BC%8F)；

  - `custom` 用于配置[自定义模式](https://strongduanmu.com/wiki/calcite/model.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E6%A8%A1%E5%BC%8F)；

  - `jdbc` 用于配置 [JDBC 模式](https://strongduanmu.com/wiki/calcite/model.html#jdbc-%E6%A8%A1%E5%BC%8F)。


* `path`：可选列表，用于解析此模式中使用函数的 SQL 路径。如果指定，它必须是一个列表，并且列表的每个元素必须是字符串或字符串列表。例如，

**JSON：**

```json
  path: [ ['usr', 'lib'], 'lib' ]
```

**YAML：**

```yaml
path:
- [usr, lib]
- lib
```

声明一个包含两个元素的路径：模式 `/usr/lib` 和模式 `/lib`。大多数模式都位于顶层，对于这些模式，你可以使用字符串。

`materializations` （可选的[物化视图](https://strongduanmu.com/wiki/calcite/model.html#%E7%89%A9%E5%8C%96%E8%A7%86%E5%9B%BE)列表）定义此模式中作为查询物化视图的表。

`cache` （可选布尔值，默认 true）告诉 Calcite 是否缓存此模式生成的元数据（包括表、函数和子模式）。

- 如果设置为 `false` ，Calcite 将在每次需要元数据时访问模式，例如，每次需要表列表以验证某个模式中的查询时；
- 如果设置为 `true` ，Calcite 将在第一次读取元数据时缓存元数据。这可以带来更好的性能，特别是在名称匹配不区分大小写的情况下。

然而，这也导致了缓存陈旧的问题。特定模式实现可以重写 `Schema.contentsHaveChangedSince` 方法，来告诉 Calcite 何时应考虑缓存过期。

在模式中显式创建的表、函数、类型和子模式不受此缓存机制的影响。它们总是立即出现在模式中，并且永远不会被刷新。



{% GoogleAdsense %}

## Map 模式

与基类 [Schema](https://strongduanmu.com/wiki/calcite/model.html#%E6%A8%A1%E5%BC%8F) 一样，Map 模式同样出现在 `root.schemas` 中。

**JSON：**

```json
{
  name: 'foodmart',
  type: 'map',
  tables: [ Table... ],
  functions: [ Function... ],
  types: [ Type... ]
}
```

**YAML：**

```yaml
name: foodmart
type: map
tables:
- [ Table... ]
functions:
- [ Function... ]
types:
- [ Type... ]
```

`name` 、 `type` 、 `path` 、 `cache` 和 `materializations` 都继承自 [Schema](https://strongduanmu.com/wiki/calcite/model.html#%E6%A8%A1%E5%BC%8F)。

* `tables` （[表](https://strongduanmu.com/wiki/calcite/model.html#%E8%A1%A8)元素的可选列表）定义模式中的表；

* `functions`（[函数](https://strongduanmu.com/wiki/calcite/model.html#%E5%87%BD%E6%95%B0)元素的可选列表）定义模式中的函数；

* `types` 定义模式中的类型。

## 自定义模式

与基类 [Schema](https://strongduanmu.com/wiki/calcite/model.html#%E6%A8%A1%E5%BC%8F) 一样，自定义模式出现在 `root.schemas` 中。

**JSON：**

```json
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

**YAML：**

```yaml
name: mongo
type: custom
factory: org.apache.calcite.adapter.mongodb.MongoSchemaFactory
operand:
  host: localhost
  database: test
```

`name` 、 `type` 、 `path` 、 `cache` 和 `materializations` 都继承自 [Schema](https://strongduanmu.com/wiki/calcite/model.html#%E6%A8%A1%E5%BC%8F)。

* `factory`（必填字符串）是该模式的工厂类的名称。必须实现接口 [org.apache.calcite.schema.SchemaFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/SchemaFactory.html) 并具有公共默认构造函数；

* `operand`（可选映射）包含要传递给工厂的属性。

## JDBC 模式

与基类 [Schema](https://strongduanmu.com/wiki/calcite/model.html#%E6%A8%A1%E5%BC%8F) 一样，JDBC 模式出现在 `root.schemas` 中。

**JSON：**

```json
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

**YAML：**

```yaml
name: foodmart
type: jdbc
jdbcDriver: TODO
jdbcUrl: TODO
jdbcUser: TODO
jdbcPassword: TODO
jdbcCatalog: TODO
jdbcSchema: TODO
```

`name` 、 `type` 、 `path` 、 `cache` 和 `materializations` 继承自 [Schema](https://strongduanmu.com/wiki/calcite/model.html#%E6%A8%A1%E5%BC%8F)。

* `jdbcDriver`（可选字符串）是 JDBC 驱动程序类的名称。如果未指定，则使用 JDBC DriverManager 选择的任何类；
* `jdbcUrl`（可选字符串）是 JDBC 连接字符串，例如：`jdbc:mysql://localhost/foodmart`；

* `jdbcUser`（可选字符串）是 JDBC 用户名；

* `jdbcPassword`（可选字符串）是 JDBC 密码；

* `jdbcCatalog`（可选字符串）是 JDBC 数据源中初始目录的名称；

* `jdbcSchema`（可选字符串）是 JDBC 数据源中初始模式的名称。

## 物化视图

出现在 `root.schemas.materializations` 中。

**JSON：**

```json
{
  view: 'V',
  table: 'T',
  sql: 'select deptno, count(*) as c, sum(sal) as s from emp group by deptno'
}
```

**YAML：**

```yaml
view: V
table: T
sql: select deptno, count(*) as c, sum(sal) as s from emp group by deptno
```

* `view`（可选字符串）是视图的名称。`null` 表示该表已经存在，并且填充了正确的数据；

* `table`（必填字符串）是在查询中物化数据表的名称。如果 `view` 不为空，则该表可能不存在，如果不存在，Calcite 将创建并填充内存中的表；

* `sql`（可选字符串，或者可选的多行连接字符串列表）是具体化的 SQL 定义。

## 表

出现在 `root.schemas.tables` 中。

**JSON：**

```json
{
  name: 'sales_fact',
  columns: [ Column... ]
}
```

**YAML：**

```yaml
name: sales_fact
columns:
  [ Column... ]
```

* `name`（必填字符串）是该表的名称。在模式中必须是唯一的；

* `type`（可选字符串，默认为 `custom`）表示子类型。值为：

  - `custom` 用于[自定义表](https://strongduanmu.com/wiki/calcite/model.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E8%A1%A8)；

  - `view` 用于[视图](https://strongduanmu.com/wiki/calcite/model.html#%E8%A7%86%E5%9B%BE)。


* `columns`（[Column](https://strongduanmu.com/wiki/calcite/model.html#%E5%88%97) 元素列表，对于某些类型的表是必需的，对于其他类型的表是可选的，例如 View）。

## 视图

与基类 [Table](https://strongduanmu.com/wiki/calcite/model.html#%E8%A1%A8) 一样，出现在 `root.schemas.tables` 中。

**JSON：**

```json
{
  name: 'female_emps',
  type: 'view',
  sql: "select * from emps where gender = 'F'",
  modifiable: true
}
```

**YAML：**

```yaml
name: female_emps
type: view
sql: select * from emps where gender = 'F'
modifiable: true
```

`name` 、 `type` 、 `columns` 都继承自 [Table](https://strongduanmu.com/wiki/calcite/model.html#%E8%A1%A8)。

* `sql`（必填字符串，或者必填的多行字符串的字符串列表）是视图的 SQL 定义；

* `path`（可选列表）代表解析查询的 SQL 路径。如果未指定，则默认为当前模式；

* `modifiable`（可选布尔值）代表视图是否可修改。如果为 `null` 或未指定，Calcite 会推断视图是否可修改。

如果视图仅包含 `SELECT`、`FROM`、`WHERE`（无 `JOIN`、`聚合`或`子查询`）并且每列满足以下条件，则视图是可修改的：

- 在 SELECT 子句中指定一次；
- 出现在带有 `column = literal` 谓词的 WHERE 子句中；
- 可以为空。

第二个子句允许 Calcite 自动为隐藏列提供正确的值。它在多租户环境中很有用，其中 `tenantId` 列是隐藏的、强制的（NOT NULL），并且对于特定视图具有常量值。

有关可修改视图的错误：

- 如果视图标记为 `modifiable: true` 并且不可修改，Calcite 在读取模式时会抛出错误；
- 如果你向不可修改的视图提交 INSERT、UPDATE 或 UPSERT 命令，Calcite 在验证语句时会抛出错误；
- 如果 DML 语句创建的行不会出现在视图中（例如，上面 `female_emps` 中的行，带有 `gender = 'M'` ），Calcite 在执行该语句时会抛出错误。

## 自定义表

与基类 [Table](https://strongduanmu.com/wiki/calcite/model.html#%E8%A1%A8) 类似，出现在 `root.schemas.tables` 中。

**JSON：**

```json
{
  name: 'female_emps',
  type: 'custom',
  factory: 'TODO',
  operand: {
    todo: 'TODO'
  }
}
```

**YAML：**

```yaml
name: female_emps
type: custom
factory: TODO
operand:
  todo: TODO
```

`name` 、 `type` 、 `columns` 继承自 [Table](https://strongduanmu.com/wiki/calcite/model.html#%E8%A1%A8)。

* `factory` （必填字符串）是该表的工厂类的名称。必须实现接口 [org.apache.calcite.schema.TableFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TableFactory.html) 并具有公共默认构造函数；

* `operand`（可选映射）包含要传递给工厂的属性。

## 流式查询

有关表是否允许流式传输的信息。出现在 `root.schemas.tables.stream`。

**JSON：**

```json
{
  stream: true,
  history: false
}
```

**YAML：**

```yaml
stream: true
history: false
```

* `stream`（可选；默认 true）表示表是否允许流式传输；

* `history`（可选；默认 false）表示流的历史记录是否可用。

## 列

出现在 `root.schemas.tables.columns` 中。

**JSON：**

```json
{
  name: 'empno'
}
```

**YAML：**

```yaml
name: empno
```

* `name`（必填字符串）代表该列的名称。

## 函数

出现在 `root.schemas.functions` 中。

**JSON：**

```json
{
  name: 'MY_PLUS',
  className: 'com.example.functions.MyPlusFunction',
  methodName: 'apply',
  path: []
}
```

**YAML：**

```yaml
name: MY_PLUS
className: com.example.functions.MyPlusFunction
methodName: apply
path: {}
```

* `name`（必填字符串）表示该函数的名称；

* `className`（必填字符串）表示实现此函数类的名称；

* `methodName`（可选字符串）表示实现此功能方法的名称。

如果指定了 `methodName` ，则该方法必须存在（区分大小写），并且 Calcite 将创建一个标量函数。该方法可以是静态或非静态的，但如果是非静态的，则该类必须具有不带参数的公共构造函数。

如果 `methodName` 是 `*`，Calcite 会为类中的每个方法创建一个函数。

如果未指定 `methodName` ，Calcite 会查找名为 `eval` 的方法，如果找到，则创建表宏或标量函数。它还查找方法 `init`、`add`、`merge`、`result`，如果找到，则创建一个聚合函数。

* `path` （可选字符串列表）是解析此函数的路径。

## 类型

出现在 `root.types` 和 `root.schemas.types` 中。

**JSON：**

```json
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

**YAML：**

```yaml
name: mytype1
type: BIGINT
attributes:
- name: f1
  type: BIGINT
```

* `name`（必填字符串）表示该类型的名称；

* `type`（可选）表示 SQL 类型；

* `attributes`（可选）表示该类型的属性列表。如果 `attributes` 和 `type` 两者存在于同一级别，`type` 则优先。

## Lattice 格

出现在 `root.schemas.lattices` 中。

**JSON：**

```json
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

**YAML：**

```yaml
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

* `name`（必填字符串）表示该格的名称；

* `sql`（必填字符串，或者必填的多行字符串的字符串列表）表示定义该格的事实表、维度表和连接路径的 SQL 语句；

* `auto`（可选布尔值，默认 true）表示执行查询时，是否根据需要物化块；

* `algorithm`（可选布尔值，默认 false）表示是否使用优化算法，来建议和填充初始块集；

* `algorithmMaxMillis`（可选长整型，默认为 `-1`，表示无限制）表示运行算法的最大毫秒数。在此之后，获取算法迄今为止得出的最佳结果；

* `rowCountEstimate`（可选 double，默认 1000.0）表示网格中的估计行数；

* `tiles`（[Tile](https://strongduanmu.com/wiki/calcite/model.html#tile-%E5%9D%97) 元素的可选列表）表示要预先创建的物化聚合的列表；

* `defaultMeasures`（可选的[度量](https://calcite.apache.org/docs/model.html#measure)元素列表）表示图块默认应具有的度量列表。`tiles` 中定义的任何图块仍然可以定义自己的度量，包括不在此列表中的度量。如果未指定，默认的度量列表只是 `count(*)`：

**JSON：**

```json
[ { name: 'count' } ]
```

**YAML：**

```yaml
name: count
```

`statisticProvider` （实现 [org.apache.calcite.materialize.LatticeStatisticProvider](https://calcite.apache.org/javadocAggregate/org/apache/calcite/materialize/LatticeStatisticProvider.html) 的类的可选名称）提供每列中不同值数量的估计。

你可以使用类名，或类加静态字段。例子：

```properties
"statisticProvider": "org.apache.calcite.materialize.Lattices#CACHING_SQL_STATISTIC_PROVIDER"
```

如果未设置，Calcite 将生成并执行 SQL 查询以查找真实值，并缓存结果。

另请参见：[Lattice 格](https://strongduanmu.com/wiki/calcite/lattice.html)。

## Tile 块

出现在 `root.schemas.lattices.tiles` 中。

```json
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

**YAML：**

```yaml
dimensions: [ 'the_year', ['t', 'quarter'] ]
measures:
- agg: sum
  args: unit_sales
- agg: sum
  args: store_sales
- agg: count
```

* `dimensions` （字符串列表或字符串列表，必填，但可以为空）定义此 Tile 块的维度。每个维度都是 Lattice 格中的一列，就像一个 `GROUP BY` 子句。每个元素可以是字符串（Lattice 格内列的唯一标签）或字符串列表（由表别名和列名组成的对）；

* `measures`（[Measure](https://strongduanmu.com/wiki/calcite/model.html#%E5%BA%A6%E9%87%8F) 元素的可选列表）表示应用于参数的聚合函数列表。如果未指定，则使用 Lattice 格的默认度量列表。

## 度量

出现在 `root.schemas.lattices.defaultMeasures` 和 `root.schemas.lattices.tiles.measures` 中。

**JSON：**

```json
{
  agg: 'sum',
  args: [ 'unit_sales' ]
}
```

**YAML：**

```yaml
agg: sum
args: unit_sales
```

* `agg` 是聚合函数的名称（通常为 `count`、`sum`、`min`、`max`）；

* `args` （可选）是列标签（字符串），或零个或多个列标签的列表。

有效值为：

- 未指定：无参数；
- null：没有参数；
- 空列表：无参数；
- String：单个参数，格子列的名称；
- 列表：多个参数，每个参数一个列标签。

与点阵维度不同，度量不能以限定格式 `{@code [“table”, “column”]}` 指定。定义晶格时，请确保要用作度量的每一列在晶格内都有唯一的标签（如有必要，请使用 `“{@code AS label}”`），并在想要传递该列时使用该标签作为衡量参数。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

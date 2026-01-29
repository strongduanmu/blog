---
layout: wiki
wiki: calcite
order: 203
title: 文件适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/file_adapter.html

## 概述

文件适配器能够读取多种格式的文件，也可以通过各种协议（如 HTTP）读取文件。

例如，如果你定义：
- States - https://en.wikipedia.org/wiki/List_of_states_and_territories_of_the_United_States
- Cities - https://en.wikipedia.org/wiki/List_of_United_States_cities_by_population

然后你可以编写如下查询：

```sql
select
    count(*) "City Count",
    sum(100 * c."Population" / s."Population") "Pct State Population"
from "Cities" c, "States" s
where c."State" = s."State" and s."State" = 'California';
```

并了解加州有 69 个人口 10 万或更多的城市，占该州人口的近 1/2：

```
+---------------------+----------------------+
|     City Count      | Pct State Population |
+---------------------+----------------------+
| 69                  | 48.574217177106576   |
+---------------------+----------------------+
```

对于 CSV 等简单文件格式，文件是自我描述的，你甚至不需要模型。请参阅 CSV 文件和无模型浏览。

## 一个简单的例子

让我们从一个简单的例子开始。首先，我们需要一个模型定义，如下所示。

```json
{
  "version": "1.0",
  "defaultSchema": "SALES",
  "schemas": [ {
    "name": "SALES",
    "type": "custom",
    "factory": "org.apache.calcite.adapter.file.FileSchemaFactory",
    "operand": {
      "tables": [ {
        "name": "EMPS",
        "url": "file:file/src/test/resources/sales/EMPS.html"
      }, {
        "name": "DEPTS",
        "url": "file:file/src/test/resources/sales/DEPTS.html"
      } ]
    }
  } ]
}
```

模式被定义为表列表，每个表至少包含一个表名称和一个 URL。如果一个页面有多个表，你可以在表定义中包含 `selector` 和 `index` 字段来指定所需的表。如果没有表规范，文件适配器会选择页面上最大的表。

`EMPS.html` 包含一个 HTML 表格：

```html
<html>
  <body>
    <table>
      <thead>
        <tr>
          <th>EMPNO</th>
          <th>NAME</th>
          <th>DEPTNO</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>100</td>
          <td>Fred</td>
          <td>30</td>
        </tr>
        <tr>
          <td>110</td>
          <td>Eric</td>
          <td>20</td>
        </tr>
        <tr>
          <td>110</td>
          <td>John</td>
          <td>40</td>
        </tr>
        <tr>
          <td>120</td>
          <td>Wilma</td>
          <td>20</td>
        </tr>
        <tr>
          <td>130</td>
          <td>Alice</td>
          <td>40</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
```

模型文件存储为 `file/src/test/resources/sales.json`，因此你可以通过 `sqlline` 连接，如下所示：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=file/src/test/resources/sales.json admin admin
sqlline> select * from sales.emps;
+-------+--------+------+
| EMPNO | DEPTNO | NAME |
+-------+--------+------+
| 100   | 30     | Fred |
| 110   | 20     | Eric |
| 110   | 40     | John |
| 120   | 20     | Wilma |
| 130   | 40     | Alice |
+-------+--------+------+
5 rows selected
```

## 映射表

现在让我们看一个更复杂的例子。这次我们通过 HTTP 连接到 Wikipedia，读取美国州和城市的页面，并从这些页面上的 HTML 表格中提取数据。表格具有更复杂的格式，文件适配器帮助我们定位和解析这些表格中的数据。

可以简单定义表以立即获得满足感：

```json
{
  tableName: "RawCities",
  url: "https://en.wikipedia.org/wiki/List_of_United_States_cities_by_population"
}
```

并随后进行改进以获得更好的可用性/查询：

```json
{
  tableName: "Cities",
  url: "https://en.wikipedia.org/wiki/List_of_United_States_cities_by_population",
  path: "#mw-content-text > table.wikitable.sortable",
  index: 0,
  fieldDefs: [
    {th: "2012 rank", name: "Rank", type: "int", pattern: "(\\d+)", matchGroup: 0},
    {th: "City", selector: "a", selectedElement: 0},
    {th: "State[5]", name: "State", selector: "a:eq(0)"},
    {th: "2012 estimate", name: "Population", type: "double"},
    {th: "2010 Census", skip: "true"},
    {th: "Change", skip: "true"},
    {th: "2012 land area", name: "Land Area (sq mi)", type: "double", selector: ":not(span)"},
    {th: "2012 population density", skip: "true"},
    {th: "ANSI", skip: "true"}
  ]
}
```

连接并执行查询，如下所示。

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=file/src/test/resources/wiki.json admin admin
sqlline> select * from wiki."RawCities";
sqlline> select * from wiki."Cities";
```

请注意，`Cities` 比 `RawCities` 更容易使用，因为它的表定义有一个字段列表。

文件适配器使用 Jsoup 进行 HTML DOM 导航；表和字段的选择器遵循 Jsoup 选择器规范。

字段定义可用于重命名或跳过源字段，选择和调节单元格内容，以及设置数据类型。

### 解析单元格内容

文件适配器可以选择单元格内的 DOM 节点，替换所选元素内的文本，在所选文本内进行匹配，并为结果数据库列选择数据类型。处理步骤按描述的顺序应用，替换和匹配模式基于 Java 正则表达式。

### 更多示例

还有更多示例，形式为脚本：

```bash
$ ./sqlline -f file/src/test/resources/webjoin.sql
```

（运行 `webjoin.sql` 时，你将看到每个包含连接的查询的一些警告消息。这些是预期的，不会影响查询结果。这些消息将在下一个版本中被抑制。）

## CSV 文件和无模型浏览

有些文件描述自己的模式，对于这些文件，我们不需要模型。例如，`DEPTS.csv` 有一个整数 `DEPTNO` 列和一个字符串 `NAME` 列：

```
DEPTNO:int,NAME:string
10,"Sales"
20,"Marketing"
30,"Accounts"
```

你可以启动 `sqlline`，并将文件适配器指向该目录，每个 CSV 文件都变成一个表：

```bash
$ ls file/src/test/resources/sales-csv
 -rw-r--r-- 1 jhyde jhyde  62 Mar 15 10:16 DEPTS.csv
 -rw-r--r-- 1 jhyde jhyde 262 Mar 15 10:16 EMPS.csv.gz

$ ./sqlline -u "jdbc:calcite:schemaFactory=org.apache.calcite.adapter.file.FileSchemaFactory;schema.directory=file/src/test/resources/sales-csv"
sqlline> !tables
+-----------+-------------+------------+------------+
| TABLE_CAT | TABLE_SCHEM | TABLE_NAME | TABLE_TYPE |
+-----------+-------------+------------+------------+
|           | adhoc       | DEPTS      | TABLE      |
|           | adhoc       | EMPS       | TABLE      |
+-----------+-------------+------------+------------+

sqlline> select distinct deptno from depts;
+--------+
| DEPTNO |
+--------+
| 20     |
| 10     |
| 30     |
+--------+
3 rows selected (0.985 seconds)
```

## JSON 文件和无模型浏览

有些文件描述自己的模式，对于这些文件，我们不需要模型。例如，`DEPTS.json` 有一个整数 `DEPTNO` 列和一个字符串 `NAME` 列：

```json
[
  {
    "DEPTNO": 10,
    "NAME": "Sales"
  },
  {
    "DEPTNO": 20,
    "NAME": "Marketing"
  },
  {
    "DEPTNO": 30,
    "NAME": "Accounts"
  }
]
```

你可以启动 `sqlline`，并将文件适配器指向该目录，每个 JSON 文件都变成一个表：

```bash
$ ls file/src/test/resources/sales-json
 -rw-r--r-- 1 jhyde jhyde  62 Mar 15 10:16 DEPTS.json

$ ./sqlline -u "jdbc:calcite:schemaFactory=org.apache.calcite.adapter.file.FileSchemaFactory;schema.directory=file/src/test/resources/sales-json"
sqlline> !tables
+-----------+-------------+------------+------------+
| TABLE_CAT | TABLE_SCHEM | TABLE_NAME | TABLE_TYPE |
+-----------+-------------+------------+------------+
|           | adhoc       | DATE       | TABLE      |
|           | adhoc       | DEPTS      | TABLE      |
|           | adhoc       | EMPS       | TABLE      |
|           | adhoc       | EMPTY      | TABLE      |
|           | adhoc       | SDEPTS     | TABLE      |
+-----------+-------------+------------+------------+

sqlline> select distinct deptno from depts;
+--------+
| DEPTNO |
+--------+
| 20     |
| 10     |
| 30     |
+--------+
3 rows selected (0.985 seconds)
```

## 未来改进

我们正在继续增强适配器，并欢迎贡献新的解析能力（例如解析 JSON 文件）和能够动态形成 URL 以将过滤器下推。

---
layout: wiki
wiki: calcite
order: 209
title: Pig 适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/pig_adapter.html

## 概述

Pig 适配器允许你用 SQL 编写查询并使用 Apache Pig 执行它们。

## 一个简单的例子

让我们从一个简单的例子开始。首先，我们需要一个模型定义，如下所示。

```json
{
  "version": "1.0",
  "defaultSchema": "SALES",
  "schemas": [ {
    "name": "PIG",
    "type": "custom",
    "factory": "org.apache.calcite.adapter.pig.PigSchemaFactory",
    "tables": [ {
      "name": "t",
      "type": "custom",
      "factory": "org.apache.calcite.adapter.pig.PigTableFactory",
      "operand": {
        "file": "data.txt",
        "columns": ["tc0", "tc1"]
      }
    }, {
      "name": "s",
      "type": "custom",
      "factory": "org.apache.calcite.adapter.pig.PigTableFactory",
      "operand": {
        "file": "data2.txt",
        "columns": ["sc0", "sc1"]
      }
    } ]
  } ]
}
```

现在，如果你编写 SQL 查询

```sql
select *
from "t"
join "s" on "tc1" = "sc0"
```

Pig 适配器将生成 Pig Latin 脚本

```pig
t = LOAD 'data.txt' USING PigStorage() AS (tc0:chararray, tc1:chararray);
s = LOAD 'data2.txt' USING PigStorage() AS (sc0:chararray, sc1:chararray);
t = JOIN t BY tc1, s BY sc0;
```

然后使用 Pig 运行时执行它，通常是 Apache Hadoop 上的 MapReduce。

## 与 Piglet 的关系

Calcite 还有另一个名为 [Piglet](/wiki/calcite/reference.html) 的组件。它允许你用 Pig Latin 的子集编写查询，并使用任何适用的 Calcite 适配器执行它们。因此，Piglet 基本上与 Pig 适配器相反。

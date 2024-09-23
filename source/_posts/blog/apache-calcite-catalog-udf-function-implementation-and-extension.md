---
title: Apache Calcite Catalog 拾遗之 UDF 函数实现和扩展
tags: [Calcite]
categories: [Calcite]
date: 2024-09-23 08:00:00
updated: 2024-09-23 08:00:00
cover: /assets/cover/calcite.jpg
references:
  - '[Apache Calcite——新增动态 UDF 支持](https://blog.csdn.net/it_dx/article/details/117948590)'
  - '[Calcite 官方文档中文版-适配器-可扩展性](https://strongduanmu.com/wiki/calcite/adapters.html#%E5%8F%AF%E6%89%A9%E5%B1%95%E6%80%A7)'
banner: /assets/banner/banner_9.jpg
topic: calcite
---

> 注意：本文基于 [Calcite main 分支 99a0df1](https://github.com/apache/calcite/commit/99a0df108a9f72805afb6d87ec5b2c0ed258f1ec) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

最近，很多星友咨询关于 `Calcite UDF` 实现和扩展的问题，在之前 [Apache Calcite System Catalog 实现探究](https://strongduanmu.com/blog/explore-apache-calcite-system-catalog-implementation.html)一文中，我们简单介绍过 `Catalog` 中的 `Function` 对象，也了解到 Calcite 内置了很多函数实现，但在实际使用中内置函数往往无法满足要求，用户需要能够根据自己的需求，灵活地注册新的函数。Caclite 允许用户动态注册 UDF 函数，从而实现更加复杂的 SQL 逻辑，下面本文将深入探讨 Calcite 内置函数的实现原理，UDF 函数的实现原理以及扩展方式，帮助大家更好地在项目中使用 Calcite UDF。

## Calcite 函数简介

在日常开发、数据分析工作中，我们除了会使用常用的 SQL 语句外，还会经常用到函数来实现一些特殊功能，函数功能的强弱直接会影响我们的开发效率。Calcite 作为当前流行的计算引擎，对函数功能也有较好的支持，它内置了不同数据库的上百种常用函数，可以直接调用执行。此外，Calcite 也提供了 UDF 自定义函数能力，用户可以通过 Schema 注册 UDF，从而实现更灵活地 SQL 运算逻辑。

在了解 UDF 函数实现和扩展前，我们先来了解下 Calcite 函数的基本概念。Calcite 对函数的定义是：**接受参数并返回结果的命名表达式**，函数一般通过 Schema 进行注册，然后使用 `Schema#getFunctions` 获取函数，获取函数时会根据参数类型进行过滤。下面是 Schema 中 `Function` 接口声明：

```java
public interface Function {
    List<FunctionParameter> getParameters();
}
```

Function 接口提供了 `getParameters` 获取函数参数的方法，它包含了 `ScalarFunction`、`AggregateFunction`、`TableFunction` 和 `TableMarco` 等几个主要的子接口。ScalarFunction 对应标量函数，也就是函数返回的结果为一个标量，AggregateFunction 对应聚合函数，会将多个值聚合计算为一个标量返回。

TableFunction 和 TableMacro 都对应了表函数，会返回一个表，他们的区别是 TableMacro 会在编译期间进行调用，编译期展开表达式允许 Calcite 实现更加强大的查询优化，例如我们可以对视图在编译期进行展开。相比于 TableMacro，TableFunction 则需要在执行阶段才能知道表的结果。

下图展示了 Function 的继承体系，Function 接口的 4 个子接口 `ScalarFunction`、`AggregateFunction`、`TableFunction` 和 `TableMarco`，他们都有对应的 `Impl` 实现类，实现类中定义了很多函数处理相关的方法，下面小节我们将分别对这几类函数的内部实现进行探究。

![Calcite Function 继承体系](apache-calcite-catalog-udf-function-implementation-and-extension/calcite-function-inherit-class.png)

## 内置函数实现探究

### 标量函数

TODO

### 聚合函数

TODO

### 表函数 & 表宏

TODO

### 内置函数执行流程

TODO

## UDF 函数扩展实践

### UDF 标量函数扩展

TODO

探索 UDF 注册 Oracle 无括号函数支持

### UDAF 聚合函数扩展

TODO

### UDTF 表函数 & 表宏扩展

TODO

## 结语

Schema 中有 Function 接口，用于注册不同类型的函数

SqlFunction 继承 SqlOperator

SqlFunctionCategory 函数分类枚举
SqlBasicFunction SqlUnresolvedFunction
RexImpTable——注册 operator（包含函数，通过注解 @LibraryOperator 标记当前函数属于哪个方言）和 method（BuiltInMethod）对应关系，BuiltInMethod 中定义了对 SqlFunctions 等函数实现类的调用
SqlLibraryOperators 用于定义非标准运算和函数，由 SqlLibraryOperatorTableFactory 调用读取到 SqlOperatorTable 中
SqlStdOperatorTable 实现标准运算和函数

普通函数 SqlFunctions 函数实现逻辑
空间函数 SpatialTypeFunctions
JSON 函数 JsonFunctions

和 UDF 相关的 Jira：https://issues.apache.org/jira/browse/CALCITE-6363?jql=project%20%3D%20CALCITE%20AND%20resolution%20%3D%20Unresolved%20AND%20text%20~%20%22UDF%22%20ORDER%20BY%20created%20DESC%2C%20updated%20DESC%2C%20priority%20ASC

改动 UDF 函数重载逻辑：https://issues.apache.org/jira/browse/CALCITE-3000?jql=project%20%3D%20CALCITE%20AND%20resolution%20%3D%20Unresolved%20AND%20text%20~%20%22UDF%22%20ORDER%20BY%20priority%20DESC%2C%20updated%20DESC

UDF Test：calcite/core/src/test/java/org/apache/calcite/test/UdfTest.java at master · apache/calcite

PI 函数带不带括号的讨论：https://issues.apache.org/jira/browse/CALCITE-6566?page=com.atlassian.jira.plugin.system.issuetabpanels%3Aall-tabpanel

关于函数参数的讨论：https://mail.google.com/mail/u/0/#inbox/FMfcgzQXJGsbkVFdDsKlrjSHbGTVxflZ







TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

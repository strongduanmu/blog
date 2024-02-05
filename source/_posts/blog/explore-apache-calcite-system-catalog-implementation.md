---
title: Apache Calcite System Catalog 实现探究
tags: [Calcite]
categories: [Calcite]
date: 2023-10-30 08:45:38
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/04/05/1649126780.jpg
references:
  - '[Introduction to Apache Calcite Catalog](https://note.youdao.com/s/YCJgUjNd)'
  - '[Apache Calcite 框架原理入门和生产应用](https://zhuanlan.zhihu.com/p/548933943)'
  - '[CMU 15-445 Database Storage II](https://15445.courses.cs.cmu.edu/fall2019/slides/04-storage2.pdf)'
  - '[CMU 15-445 Query Planning & Optimization I](https://15445.courses.cs.cmu.edu/fall2019/slides/14-optimization1.pdf)'
  - '[Calcite 介绍](https://www.cnblogs.com/ulysses-you/p/9358186.html)'
banner: china
---

> 注意：本文基于 [Calcite 1.35.0](https://github.com/apache/calcite/tree/75750b78b5ac692caa654f506fc1515d4d3991d6) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

在上一篇 [Apache Calcite SQL Parser 原理剖析](https://strongduanmu.com/blog/implementation-principle-of-apache-calcite-sql-parser.html)一文中，我们详细介绍了 Apache Calcite SQL 解析引擎的实现原理，从基础的 JavaCC 使用，再到 Caclite SQL 解析引擎的内部实现，最后介绍了 Calcite SqlNode 体系和 SQL 生成。Calcite 在完成基础的 SQL 解析后，第二个关键的步骤就是 SQL 校验，而 SQL 校验则依赖用户向 Calcite 注册的系统目录（`System Catalog`），本文会先重点关注 Calcite 系统目录的实现，下一篇再深入探究 Calcite 校验器的内部机制。

## 什么是 System Catalog

![System Catalog 在数据库系统中的作用](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/10/30/1698628551.png)

在 [CMU 15-445 Query Planning & Optimization I](https://15445.courses.cs.cmu.edu/fall2019/slides/14-optimization1.pdf) 课程中介绍了数据库系统的整体架构，系统目录（`System Catalog`）主要负责存储数据库的元数据信息，具体包括：表、列、索引、视图、用户、权限以及内部统计信息等。从上图可以看出，系统目录在数据库绑定校验、逻辑计划树改写和执行计划优化等阶段发挥了重要作用。

不同数据库系统都有自己的元数据信息获取方法，ANSI 标准规定通过 [INFORMATION_SCHEMA](https://en.wikipedia.org/wiki/Information_schema) 只读视图查询元数据信息，目前大部分数据库都遵循了这个规范，同时也都提供了一些快捷命令，例如：MySQL `SHOW TABLES` 命令，PostgreSQL `\d` 命令等。

Calcite 作为流行的查询引擎，也提供了系统目录的支持，但是 Calcite 不直接存储系统目录中的元数据信息，用户需要通过 API 将元数据注册到 Calcite 中，才可以使用系统目录提供的能力。下面这个部分，让我们一起来深入了解下 `Calcite System Catalog` 的内部实现。

## Calcite System Catalog 实现

在 Caclite 中，Catalog 主要用来定义 SQL 查询过程中所需要的`元数据`和`命名空间`，具体实现类是 `CalciteSchema`（如下所示）。CalciteSchema 类中包含了 `Schema`、`Table`、`RelDataType`、`Function` 等核心对象，下面我们将针对这些对象进行逐一的介绍，了解他们在 Calcite System Catalog 体系中的作用和内部实现。

```java
public abstract class CalciteSchema {
    private final @Nullable CalciteSchema parent;
    public final Schema schema;
    public final String name;
    /**
     * Tables explicitly defined in this schema. Does not include tables in
     * {@link #schema}.
     */
    protected final NameMap<TableEntry> tableMap;
    protected final NameMultimap<FunctionEntry> functionMap;
    protected final NameMap<TypeEntry> typeMap;
    protected final NameMap<LatticeEntry> latticeMap;
    protected final NameSet functionNames;
    protected final NameMap<FunctionEntry> nullaryFunctionMap;
    protected final NameMap<CalciteSchema> subSchemaMap;
    private @Nullable List<? extends List<String>> path;
```

* **Schema**

根据 SQL 标准定义，Schema 是一个描述符的持久命名集合（`a persistent, named collection of descriptors`），Schema 中通常包含了`表`、`列`、`数据类型`、`视图`、`存储过程`、`关系`、`主键`和`外键`等对象。而 Schema 在 Calcite 中，则是针对数据库 Database 或 Catalog 的抽象，Schema 中可以包含子 Schema，也可以包含若干个表。

如下图所示，Calcite Schema 支持任意层级的嵌套，可以很方便地适配不同的数据库，借助 Schema 的嵌套结构，Calcite 衍生出了 `NameSpace` 概念，通过 NameSpace 可以对不同 Schema 下的对象进行有效地隔离。例如在最底层 SubSchema 中定义的表、函数等对象，只能在当前的 Schema 中使用，如果想要在多个 Schema 中共享对象，则可以考虑在共同的父 Schema 中进行定义。

![Calcite Schema 嵌套结构](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/11/09/1699492678.png)

[Schema](https://github.com/apache/calcite/blob/c4042a34ef054b89cec1c47fefcbc8689bad55be/core/src/main/java/org/apache/calcite/schema/Schema.java) 接口定义如下，可以看到它提供了 `getTable`、`getType`、`getFunctions` 和 `getSubSchema` 等访问方法，常见的 Schema 接口实现类有 AbstractSchema、CsvSchema、JdbcCatalogSchema 等。AbstractSchema 对 Schema 接口的方法进行了实现，并提供了可重写的 `getTableMap`、`getFunctionMultimap` 和 `getSubSchemaMap` 方法，用于向 Schema 中注册表、函数和子 Schema。CsvSchema 和 JdbcCatalogSchema 都是继承了 AbstractSchema 完成 Schema 注册，大家也可以参考该方式简化注册 Schema 的流程。

```java
public interface Schema {

    @Nullable Table getTable(String name);

    Set<String> getTableNames();
    
    @Nullable RelProtoDataType getType(String name);
    
    Set<String> getTypeNames();
    
    Collection<Function> getFunctions(String name);
    
    Set<String> getFunctionNames();
    
    @Nullable Schema getSubSchema(String name);
    
    Set<String> getSubSchemaNames();
  	...
}
```

通过上面介绍的方式，我们可以实现 Schema 的初始注册及查询，但如果我们需要在运行过程中对 Schema 进行修改，那又该如何操作呢？Calcite 提供了 Schema 的子接口 `SchemaPlus`，它对 Schema 接口进行了扩展，能够支持表、函数及 Schema 的添加和删除操作。用户通常无需直接实例化 SchemaPlus 的子类，Calcite 内部提供了 SchemaPlus 的生成方法，例如：`CalciteSchema#plus()` 方法。

```java
public interface SchemaPlus extends Schema {
    
    SchemaPlus add(String name, Schema schema);
    
    void add(String name, Table table);
    
    /**
     * Removes a table from this schema, used e.g. to clean-up temporary tables.
     */
    default boolean removeTable(String name) {
        // Default implementation provided for backwards compatibility, to be removed before 2.0
        return false;
    }
    
    void add(String name, Function function);
    
    void add(String name, RelProtoDataType type);
    
    void add(String name, Lattice lattice);
  	...
}
```

TODO

* **Table**

TODO

* **RelDataType**

TODO

* **Function**

TODO

## Calcite System Catalog 示例

TODO

## 结语

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309210909027.png)

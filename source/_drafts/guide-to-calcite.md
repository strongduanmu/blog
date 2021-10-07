---
title: Calcite 入门指南
tags: [Calcite]
categories: [Calcite]
date: 2021-10-02 15:49:50
cover: 
---



> - CsvScannableTable: 实现了 `ScannableTable` 接口可以被 scan 的 table
> - CsvFilterableTable: 实现了 `FilterableTable` 接口和上面一样只是可以被 scan 的同时 filter(其实底层实现都是 CsvEnumerator，不过上面那个 filter 传入的 nil)
> - CsvTranslatableTable: 实现了 TranslatableTable 和 QueryableTable 接口， 可以被转换成 RelNode，这里的实现是转成 CsvTableScan, 一个实现了 EnumerableRel 接口的 tableScan(后面我们会看到 enumerableRel 的实现都是生成代码 expression tree 的实现)

TranslatableTable：将 SQL 语句转换为关系代数，然后基于关系代数进行优化。如果不实现该接口，则返回 EnumerableTableScan。

> Extension to Table that specifies how it is to be translated to a relational expression.
> It is optional for a Table to implement this interface. If Table does not implement this interface, it will be converted to an org.apache.calcite.adapter.enumerable.EnumerableTableScan. Generally a Table will implement this interface to create a particular subclass of RelNode, and also register rules that act on that particular subclass of RelNode.

EnumerableRel——A relational expression of one of the EnumerableConvention calling conventions.

TableScan——Relational operator that returns the contents of a table.

CsvProjectTableScanRule——Planner rule that projects from a CsvTableScan scan just the columns needed to satisfy a projection. If the projection's expressions are trivial, the projection is removed. 优化器规则，来自CsvTableScan的项目只扫描需要满足投影的列。如果投影的表达式是平凡的，投影就被删除。

Calcite 入门使用 - I (CSV Example)——https://zhuanlan.zhihu.com/p/53725382


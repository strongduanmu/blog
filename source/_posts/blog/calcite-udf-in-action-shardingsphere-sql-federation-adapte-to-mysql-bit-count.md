---
title: Calcite UDF 实战之 ShardingSphere 联邦查询适配 MySQL BIT_COUNT
tags: [Calcite, ShardingSphere]
categories: [Calcite]
date: 2024-12-13 08:00:00
updated: 2024-12-16 08:00:00
cover: /assets/cover/calcite.jpg
references:
  - '[Apache Calcite Catalog 拾遗之 UDF 函数实现和扩展](https://strongduanmu.com/blog/apache-calcite-catalog-udf-function-implementation-and-extension.html)'
  - '[Fix sql federaion case exception caused by upgrade calcite version to 1.38.0](https://github.com/apache/shardingsphere/issues/33385)'
  - '[ShardingSphere 联邦查询](https://shardingsphere.apache.org/document/current/cn/features/sql-federation/)'
  - '[ShardingSphere 联邦查询使用配置](https://shardingsphere.apache.org/document/current/cn/user-manual/shardingsphere-jdbc/yaml-config/rules/sql-federation/)'
  - '[MySQL BIT_COUNT 函数文档](https://dev.mysql.com/doc/refman/8.4/en/bit-functions.html#function_bit-count)'
banner: /assets/banner/banner_7.jpg
topic: calcite
---

## 前言

熟悉 Apache ShardingSphere 的朋友们，可能听说过 SQL Federation 功能，它主要适用于海量数据水平分片场景下，提供对`跨节点关联查询`、`子查询`、`分页`、`排序`、`聚合查询`等复杂查询语句的支持。SQL Federation 功能内部使用了 Apache Calcite 项目，来实现 SQL 优化和执行。随着 [Calcite 1.38.0 版本](https://calcite.apache.org/docs/history.html#v1-38-0)的发布，Calcite 对于不同数据库的函数支持度进一步提升，为了提升 SQL Federation 功能支持度，升级 Calcite 至 1.38.0 版本也成为必然的选择。

由于升级前 ShardingSphere 使用的是 Caclite 1.35.0 版本，该版本和 1.38.0 相差了 1 年多，Calcite 内部进行了大量的优化和增强，因此升级后出现了 `BIT_COUNT` 函数无法执行的问题，下图展示了 ShardingSphere E2E 中出现异常的 `BIT_COUNT` Case。

![ShardingSphere E2E BIT_COUNT 异常](calcite-udf-in-action-shardingsphere-sql-federation-adapte-to-mysql-bit-count/shardingsphere-e2e-bit-count-error.png)

## BIT_COUNT 异常初探

根据 ShardingSphere E2E 中抛出的异常信息，主要可以分为两类：`NumberFormatException` 和 `CalciteContextException`，下面我们分别来看下这两类异常出现的原因，并探究下 `1.38.0` 版本对于 MySQL `BIT_COUNT` 函数的支持情况。

### NumberFormatException

首先，我们来看下 `NumberFormatException`，根据异常信息可以看出，Calcite 会将 BIT_COUNT 函数的参数，转换为 `BigDecimal` 类型，然后在初始化 `BigDecimal` 对象时，遇到了不支持的字符 `a`。检查联邦查询的测试 Case，确实存在包含字符 `a` 的 SQL。

```
java.lang.NumberFormatException: Character a is neither a decimal digit number, decimal point, nor "e" notation exponential mark.
	at java.base/java.math.BigDecimal.<init>(BigDecimal.java:522)
	at java.base/java.math.BigDecimal.<init>(BigDecimal.java:405)
	at java.base/java.math.BigDecimal.<init>(BigDecimal.java:838)
	at org.apache.calcite.linq4j.tree.Primitive.charToDecimalCast(Primitive.java:433)
	at Baz$1$1.current(Unknown Source)
	at org.apache.shardingsphere.sqlfederation.resultset.SQLFederationResultSet.next(SQLFederationResultSet.java:105)
	at com.zaxxer.hikari.pool.HikariProxyResultSet.next(HikariProxyResultSet.java)
	at org.apache.shardingsphere.test.e2e.engine.type.dql.BaseDQLE2EIT.assertRows(BaseDQLE2EIT.java:157)
	at org.apache.shardingsphere.test.e2e.engine.type.dql.BaseDQLE2EIT.assertResultSet(BaseDQLE2EIT.java:107)
	at org.apache.shardingsphere.test.e2e.engine.type.dql.GeneralDQLE2EIT.assertExecuteQueryForStatement(GeneralDQLE2EIT.java:99)
	at org.apache.shardingsphere.test.e2e.engine.type.dql.GeneralDQLE2EIT.assertExecuteQueryWithExpectedDataSource(GeneralDQLE2EIT.java:85)
	at org.apache.shardingsphere.test.e2e.engine.type.dql.GeneralDQLE2EIT.assertExecuteQuery(GeneralDQLE2EIT.java:62)
	at org.apache.shardingsphere.test.e2e.engine.type.dql.GeneralDQLE2EIT.assertExecuteQuery(GeneralDQLE2EIT.java:55)
```

在 MySQL 中执行可以发现，当 BIT_COUNT 函数的参数，包含了 `abcdefg` 等非数值字符时，BIT_COUNT 函数会返回 0，而非抛出异常。因此，我们需要为 Calcite 函数进行增强，来支持 BIT_COUNT 函数包含非法字符的 SQL 场景。

```sql
mysql> SELECT bit_count(123456), bit_count('123456'), bit_count('abcdefg');
+-------------------+---------------------+----------------------+
| bit_count(123456) | bit_count('123456') | bit_count('abcdefg') |
+-------------------+---------------------+----------------------+
|                 6 |                   6 |                    0 |
+-------------------+---------------------+----------------------+
1 row in set, 1 warning (0.00 sec)
```

### CalciteContextException

我们再来看下 `CalciteContextException` 异常，根据异常堆栈可以发现，该异常是 Calcite 进行元数据校验时抛出的，`checkOperandTypes` 方法在进行操作数类型判断时，发现当前 Case 中的 `BIT_COUNT(<JAVATYPE(CLASS JAVA.LANG.BOOLEAN)>)` 还不支持，因此抛出了异常，我们需要为 Calcite BIT_COUNT 函数适配 `Boolean` 类型的参数。

```
Caused by: org.apache.calcite.runtime.CalciteContextException: At line 0, column 0: Cannot apply 'BIT_COUNT' to arguments of type 'BIT_COUNT(<JAVATYPE(CLASS JAVA.LANG.BOOLEAN)>)'. Supported form(s): 'BIT_COUNT(<NUMERIC>)'
'BIT_COUNT(<BINARY>)'
	at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at java.base/jdk.internal.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at java.base/jdk.internal.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:490)
	at org.apache.calcite.runtime.Resources$ExInstWithCause.ex(Resources.java:511)
	at org.apache.calcite.sql.SqlUtil.newContextException(SqlUtil.java:952)
	at org.apache.calcite.sql.SqlUtil.newContextException(SqlUtil.java:937)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.newValidationError(SqlValidatorImpl.java:5899)
	at org.apache.calcite.sql.SqlCallBinding.newValidationSignatureError(SqlCallBinding.java:399)
	at org.apache.calcite.sql.type.FamilyOperandTypeChecker.checkSingleOperandType(FamilyOperandTypeChecker.java:137)
	at org.apache.calcite.sql.type.FamilyOperandTypeChecker.checkOperandTypes(FamilyOperandTypeChecker.java:172)
	at org.apache.calcite.sql.type.CompositeOperandTypeChecker.check(CompositeOperandTypeChecker.java:345)
	at org.apache.calcite.sql.type.CompositeOperandTypeChecker.checkOperandTypes(CompositeOperandTypeChecker.java:275)
	at org.apache.calcite.sql.SqlOperator.checkOperandTypes(SqlOperator.java:754)
	at org.apache.calcite.sql.SqlOperator.validateOperands(SqlOperator.java:496)
	at org.apache.calcite.sql.SqlFunction.deriveType(SqlFunction.java:350)
	at org.apache.calcite.sql.SqlFunction.deriveType(SqlFunction.java:232)
	at org.apache.calcite.sql.validate.SqlValidatorImpl$DeriveTypeVisitor.visit(SqlValidatorImpl.java:6967)
	at org.apache.calcite.sql.validate.SqlValidatorImpl$DeriveTypeVisitor.visit(SqlValidatorImpl.java:6954)
	at org.apache.calcite.sql.SqlCall.accept(SqlCall.java:168)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.deriveTypeImpl(SqlValidatorImpl.java:2006)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.deriveType(SqlValidatorImpl.java:1993)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.expandSelectItem(SqlValidatorImpl.java:505)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateSelectList(SqlValidatorImpl.java:5015)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateSelect(SqlValidatorImpl.java:4096)
	at org.apache.calcite.sql.validate.SelectNamespace.validateImpl(SelectNamespace.java:62)
	at org.apache.calcite.sql.validate.AbstractNamespace.validate(AbstractNamespace.java:95)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateNamespace(SqlValidatorImpl.java:1206)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateQuery(SqlValidatorImpl.java:1177)
	at org.apache.calcite.sql.SqlSelect.validate(SqlSelect.java:282)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateScopedExpression(SqlValidatorImpl.java:1143)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validate(SqlValidatorImpl.java:849)
	at org.apache.calcite.sql2rel.SqlToRelConverter.convertQuery(SqlToRelConverter.java:624)
	at org.apache.shardingsphere.sqlfederation.optimizer.statement.SQLStatementCompiler.compile(SQLStatementCompiler.java:55)
	at org.apache.shardingsphere.sqlfederation.optimizer.statement.SQLStatementCompilerEngine.compile(SQLStatementCompilerEngine.java:45)
	at org.apache.shardingsphere.sqlfederation.optimizer.SQLFederationCompilerEngine.compile(SQLFederationCompilerEngine.java:44)
	at org.apache.shardingsphere.sqlfederation.engine.SQLFederationEngine.compileQuery(SQLFederationEngine.java:227)
	at org.apache.shardingsphere.sqlfederation.engine.SQLFederationEngine.executeQuery(SQLFederationEngine.java:208)
	at org.apache.shardingsphere.driver.executor.engine.DriverExecuteQueryExecutor.executeQuery(DriverExecuteQueryExecutor.java:85)
	at org.apache.shardingsphere.driver.executor.engine.facade.DriverExecutorFacade.executeQuery(DriverExecutorFacade.java:104)
	at org.apache.shardingsphere.driver.jdbc.core.statement.ShardingSpherePreparedStatement.executeQuery(ShardingSpherePreparedStatement.java:180)
```

## MySQL BIT_COUNT 调研

初步分析了 ShardingSphere 联邦查询中的 BIT_COUNT 函数异常后，我们再来调研下 MySQL BIT_COUNT 函数，看下该函数的实际作用，以及它支持的参数类型。

根据 MySQL [BIT_COUNT 函数](https://dev.mysql.com/doc/refman/8.4/en/bit-functions.html#function_bit-count)文档说明，函数语法格式为 `BIT_COUNT(N)`，用于计算参数 `N` 的二进制形式中 `1` 的个数，如果参数为 NULL，BIT_COUNT 函数也会返回 NULL。

```
Returns the number of bits that are set in the argument N as an unsigned 64-bit integer, or NULL if the argument is NULL.
以无符号 64 位整数形式返回参数 N 中设置的位数，如果参数为 NULL，则返回 NULL。
```

MySQL 文档中并未具体说明 BIT_COUNT 具体支持哪些参数，我们使用 MySQL 来实际测试下 BIT_COUNT 函数。如下是一些常用类型的测试，包括数值类型、字符串类型，数值表达式，Boolean 类型以及 NULL。可以看到，当字符串中包含非 `0-9` 数字时，BIT_COUNT 函数会直接返回 0，而对于 Boolean 类型，会将 `true`、`false` 转换为 `1` 和 `0`，然后再进行 BIT_COUNT 计算。

```sql
mysql> SELECT bit_count(123456), bit_count('123456'), bit_count('abcdefg'), BIT_COUNT('abcdef1234'), bit_count(''), bit_count(1 + 1), bit_count(true), bit_count(null);
+-------------------+---------------------+----------------------+-------------------------+---------------+------------------+-----------------+-----------------+
| bit_count(123456) | bit_count('123456') | bit_count('abcdefg') | BIT_COUNT('abcdef1234') | bit_count('') | bit_count(1 + 1) | bit_count(true) | bit_count(null) |
+-------------------+---------------------+----------------------+-------------------------+---------------+------------------+-----------------+-----------------+
|                 6 |                   6 |                    0 |                       0 |             0 |                1 |               1 |            NULL |
+-------------------+---------------------+----------------------+-------------------------+---------------+------------------+-----------------+-----------------+
1 row in set, 3 warnings (0.00 sec)
```

除了数值类型外，BIT_COUNT 函数还支持日期/时间类型，MySQL BIT_COUNT 对于日期和时间的处理也比较特别，它会删除日期和时间格式中的非数字字符，例如：`BIT_COUNT(TIMESTAMP '1996-08-03 16:22:34')` 会转换为 `BIT_COUNT('19960803162234')` 进行计算。

```sql
mysql> SELECT BIT_COUNT(DATE '1996-08-03'), BIT_COUNT(TIME '16:22:34'), BIT_COUNT(TIMESTAMP '1996-08-03 16:22:34') UNION ALL
    -> SELECT BIT_COUNT(DATE '2001-01-01'), BIT_COUNT(TIME '12:20:00'), BIT_COUNT(TIMESTAMP '2001-01-01 12:20:00') UNION ALL
    -> SELECT BIT_COUNT(DATE '2002-05-03'), BIT_COUNT(TIME '13:12:14'), BIT_COUNT(TIMESTAMP '2002-05-03 13:12:14') UNION ALL
    -> SELECT BIT_COUNT(DATE '2005-09-07'), BIT_COUNT(TIME '06:02:04'), BIT_COUNT(TIMESTAMP '2005-09-07 06:02:04') UNION ALL
    -> SELECT BIT_COUNT(DATE '2007-01-01'), BIT_COUNT(TIME '23:09:59'), BIT_COUNT(TIMESTAMP '2007-01-01 23:09:59');
+------------------------------+----------------------------+--------------------------------------------+
| BIT_COUNT(DATE '1996-08-03') | BIT_COUNT(TIME '16:22:34') | BIT_COUNT(TIMESTAMP '1996-08-03 16:22:34') |
+------------------------------+----------------------------+--------------------------------------------+
|                           12 |                         11 |                                         24 |
|                           12 |                          8 |                                         22 |
|                           14 |                          5 |                                         22 |
|                           16 |                          9 |                                         25 |
|                           14 |                         10 |                                         21 |
+------------------------------+----------------------------+--------------------------------------------+
5 rows in set (0.03 sec)
```

此外，BIT_COUNT 函数还支持 `BINARY` 和 `VARBINARY` 类型以及负数等特殊类型和数值，下面展示了 `BINARY` 类型和 `-1` 计算 BIT_COUNT 值的结果。

```sql
mysql> SELECT BIT_COUNT(CAST(x'ad' AS BINARY(1))), BIT_COUNT(-1);
+-------------------------------------+---------------+
| BIT_COUNT(CAST(x'ad' AS BINARY(1))) | BIT_COUNT(-1) |
+-------------------------------------+---------------+
|                                   5 |            64 |
+-------------------------------------+---------------+
1 row in set (0.01 sec)
```

了解了 MySQL 中 BIT_COUNT 函数的含义，以及支持的类型后，下面我们再来探究下 Calcite 目前对 BIT_COUNT 函数的适配，以及我们如何扩展 BIT_COUNT 函数，能让它适配更多的 MySQL 数据类型，从而解决 ShardingSphere 联邦查询中出现的问题。

## Calcite BIT_COUNT 适配

### Calcite BIT_COUNT 现状梳理

之前社区完成的 BIT_COUNT 函数：https://issues.apache.org/jira/browse/CALCITE-3697

TODO



### Calcite BIT_COUNT 增强适配



TODO



## 结语

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

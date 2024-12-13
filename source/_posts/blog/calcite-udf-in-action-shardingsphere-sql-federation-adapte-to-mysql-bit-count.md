---
title: Calcite UDF 实战之 ShardingSphere 联邦查询适配 MySQL BIT_COUNT
tags: [Calcite, ShardingSphere]
categories: [Calcite]
date: 2024-12-13 08:00:00
updated: 2024-12-13 08:39:40
cover: /assets/cover/calcite.jpg
references:
  - '[Apache Calcite Catalog 拾遗之 UDF 函数实现和扩展](https://strongduanmu.com/blog/apache-calcite-catalog-udf-function-implementation-and-extension.html)'
  - '[Fix sql federaion case exception caused by upgrade calcite version to 1.38.0](https://github.com/apache/shardingsphere/issues/33385)'
  - '[ShardingSphere 联邦查询](https://shardingsphere.apache.org/document/current/cn/features/sql-federation/)'
  - '[ShardingSphere 联邦查询使用配置](https://shardingsphere.apache.org/document/current/cn/user-manual/shardingsphere-jdbc/yaml-config/rules/sql-federation/)'
banner: /assets/banner/banner_7.jpg
topic: calcite
---

## 前言

熟悉 Apache ShardingSphere 的朋友们，可能听说过 SQL Federation 功能，它主要适用于海量数据水平分片场景下，提供对`跨节点关联查询`、`子查询`、`分页`、`排序`、`聚合查询`等复杂查询语句的支持。SQL Federation 功能内部使用了 Apache Calcite 项目，来实现 SQL 优化和执行。随着 [Calcite 1.38.0 版本](https://calcite.apache.org/docs/history.html#v1-38-0)的发布，Calcite 对于不同数据库的函数支持度进一步提升，为了提升 SQL Federation 功能支持度，升级 Calcite 至 1.38.0 版本也成为必然的选择。

由于升级前 ShardingSphere 使用的 Caclite 1.35.0 版本，该版本和 1.38.0 相差了 1 年多，Calcite 内部进行了大量的优化和增强，因此升级后出现了 `BIT_COUNT` 函数无法执行的问题，下图展示了 ShardingSphere E2E 中出现异常的 `BIT_COUNT` Case。

![ShardingSphere E2E BIT_COUNT 异常](calcite-udf-in-action-shardingsphere-sql-federation-adapte-to-mysql-bit-count/shardingsphere-e2e-bit-count-error.png)

## BIT_COUNT 异常初探

根据 ShardingSphere E2E 中抛出的异常信息，主要可以分为两类：`NumberFormatException` 和 `CalciteContextException`，下面我们分别来看下这两类异常出现的原因，并探究下 `1.38.0` 版本对于 MySQL `BIT_COUNT` 函数的支持情况。

### NumberFormatException



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





### CalciteContextException



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



### Calcite BIT_COUNT 实现梳理

之前社区完成的 BIT_COUNT 函数：https://issues.apache.org/jira/browse/CALCITE-3697

TODO



## BIT_COUNT 函数调研

TODO



## Calcite BIT_COUNT 函数适配

TODO



## 结语

TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

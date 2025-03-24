---
title: Apache Calcite 在 MyCat2 中的实践探究
tags: [Calcite]
categories: [Calcite]
date: 2025-02-17 08:33:30
updated: 2025-03-23 08:00:00
cover: /assets/cover/calcite.jpg
references:
  - '[入门 MyCat2](https://www.yuque.com/ccazhw/ml3nkf/fb2285b811138a442eb850f0127d7ea3?)'
  - '[MyCat2 SQL 编写指导](https://www.yuque.com/ccazhw/ml3nkf/hdqguz)'
banner: /assets/banner/banner_8.jpg
topic: calcite
---

> 注意：本文基于 [MyCat2 main 分支 ced134b](https://github.com/strongduanmu/Mycat2/commit/ced134b06ce8ed0b5b7a9894359a50513532bbb7) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

[MyCat](https://www.mycat.org.cn/) 是曾经较为流行的一款分库分表中间件，能够支持海量数据的水平分片，以及读写分离、分布式事务等功能。[MyCat2](http://mycatone.top/) 在原有功能的基础上增加了分布式查询引擎，该引擎基于 [Calcite](https://calcite.apache.org/) 项目实现，能够**将 SQL 编译为关系代数表达式，并基于规则优化引擎和代价优化引擎，生成物理执行计划，实现对跨库、跨实例的分布式 SQL 的支持**。虽然 MyCat 项目已经停止维护，但是`分布式查询引擎功能`仍然值得我们学习，本文将带领大家一起探索 `Apache Calcite` 在 `MyCat2` 中的实践，学习如何基于 Calcite 构建分布式查询引擎。

## MyCat2 环境搭建

首先，我们需要本地启动 MyCat2 服务，参考[入门 MyCat2](https://www.yuque.com/ccazhw/ml3nkf/fb2285b811138a442eb850f0127d7ea3?)，MyCat2 配置分为服务器配置和 Schema 配置。服务器配置  `server.json` 中可以指定 MyCat2 对外提供服务的 IP 和端口，`serverVersion` 用于模拟 MySQL 版本，此处我们将 `serverVersion` 调整为 `8.0.40-mycat-2.0`。

```json
{
    "server": {
        "ip": "127.0.0.1",
        "mycatId": 1,
        "port": 8066,
        // 注意设置模拟的 MySQL 版本，与后端客户端版本对应
        "serverVersion": "8.0.40-mycat-2.0"
    }
}
```

Schema 对应了 MySQL 中的库，MyCat2 Schema 配置包含了库与表的配置，它是建立在集群的基础上，而集群则是建立在数据源的基础上。因此，我们在配置时，需要自下而上进行配置，先配置数据源，再加数据源构建为集群，然后在集群上配置库与表。

![MyCat2 库、表配置和集群、数据源的关系](explore-the-practice-of-apache-calcite-in-mycat2/mycat2-cluster-datasource.png)

MyCat2 中将 **Schema 划分为 2 类：原型库和业务库**，原型库 `prototype` 用于支持 MySQL 的**兼容性 SQL 和系统表 SQL**，这些 SQL 通常是由客户端或者 DAO 框架请求，普通用户一般不会使用。业务库顾名思义，就是指用户业务数据存储的库，通常会对这些库表进行水平分片、读写分离的配置。原型库和业务库都遵循上面的 Schema 配置方式，都可以配置在集群之上。

### 原型库配置

按照前文所属，我们先配置下 `prototype` 原型库的数据源，修改 `prototypeDs.datasource.json` 文件，将 MySQL 中的系统库 `mysql` 注册进来，数据源的名称为 `prototypeDs`。

```json
{
    "dbType": "mysql",
    "idleTimeout": 60000,
    "initSqls": [],
    "initSqlsGetConnection": true,
    "instanceType": "READ_WRITE",
    "maxCon": 1000,
    "maxConnectTimeout": 30000,
    "maxRetryCount": 5,
    "minCon": 1,
    "name": "prototypeDs",
    "password": "123456",
    "type": "JDBC",
    "url": "jdbc:mysql://localhost:3306/mysql?useUnicode=true&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8",
    "user": "root",
    "weight": 0
}
```

然后修改 `prototype.cluster.json`，将 `prototypeDs` 数据源构建为原型库集群，`prototype.cluster.json` 配置文件如下：

```json
{
    "clusterType": "MASTER_SLAVE",
    "heartbeat": {
        "heartbeatTimeout": 1000,
        "maxRetry": 3,
        "minSwitchTimeInterval": 300,
        "slaveThreshold": 0
    },
    "masters": [
        "prototypeDs"
    ],
    "maxCon": 200,
    "name": "prototype",
    "readBalanceType": "BALANCE_ALL",
    "switchType": "SWITCH"
}
```

配置完成后，我们搜索 `MycatCore` 类进行本地启动，出现如下的日志表示启动成功。

![MyCat2 启动成功](explore-the-practice-of-apache-calcite-in-mycat2/mycat2-startup.png)

启动成功后，可以使用 `mysql -h127.0.0.1 -uroot -p -P8066 --binary-as-hex=0 -c -A` 命令连接 MyCat2，密码为 `123456`。通过 `SHOW DATABASES` 可以看到，MyCat2 通过原型库默认提供了 3 个系统库。

```sql
> mysql -h127.0.0.1 -uroot -p -P8066 --binary-as-hex=0 -c -A                                                                                                                                           1 ✘ │ 13s
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 0
Server version: 8.0.40-mycat-2.0 MySQL Community Server - GPL

Copyright (c) 2000, 2024, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> SHOW DATABASES;
+--------------------+
| `Database`         |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
+--------------------+
3 rows in set (0.14 sec)
```

### 业务库配置

完成原型库配置后，我们再来配置业务库。和原型库的配置类似，我们同样需要先注册 MySQL 数据源，然后将数据源构建为集群。MyCat2 提供了一种注释 SQL，用来注册数据源和集群。我们使用 `mysql -h127.0.0.1 -uroot -p -P8066 --binary-as-hex=0 -c -A` 连接 MyCat2 服务，并执行以下 SQL 注册数据源。为了模拟 MySQL 主从同步，我们将从库的数据库设置为和主库相同。

```sql
/*+ mycat:createDataSource{
	"name":"ds_write_0",
	"url":"jdbc:mysql://127.0.0.1:3306/ds_write_0",
	"user":"root",
	"password":"123456"
} */;

/*+ mycat:createDataSource{
	"name":"ds_read_0",
	"url":"jdbc:mysql://127.0.0.1:3306/ds_write_0",
	"user":"root",
	"password":"123456"
} */;

/*+ mycat:createDataSource{
	"name":"ds_write_1",
	"url":"jdbc:mysql://127.0.0.1:3306/ds_write_1",
	"user":"root",
	"password":"123456"
} */;

/*+ mycat:createDataSource{
	"name":"ds_read_1",
	"url":"jdbc:mysql://127.0.0.1:3306/ds_write_1",
	"user":"root",
	"password":"123456"
} */;
```

然后，我们基于创建的数据源构建集群，执行以下 SQL 创建集群：

```sql
/*! mycat:createCluster{
	"name":"c0",
	"masters":["ds_write_0"],
	"replicas":["ds_read_0"]
} */;

/*! mycat:createCluster{
	"name":"c1",
	"masters":["ds_write_1"],
	"replicas":["ds_read_1"]
} */;
```

创建完集群后，我们就可以创建一些不同维度的分片表，并通过这些表来观察 MyCat2 是如何支持分布式 SQL 的，执行如下 SQL 创建分片表。

```sql
CREATE DATABASE sharding_db;
USE sharding_db;

-- 创建 3 张不同维度的分片表
CREATE TABLE `sbtest_sharding_id` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `k` int(11) NOT NULL DEFAULT '0',
  `c` char(120) NOT NULL DEFAULT '',
  `pad` char(60) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) DBPARTITION BY HASH(id) DBPARTITIONS 2;
  
CREATE TABLE `sbtest_sharding_k` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `k` int(11) NOT NULL DEFAULT '0',
  `c` char(120) NOT NULL DEFAULT '',
  `pad` char(60) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) DBPARTITION BY HASH(k) DBPARTITIONS 2;

CREATE TABLE `sbtest_sharding_c` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `k` int(11) NOT NULL DEFAULT '0',
  `c` char(120) NOT NULL DEFAULT '',
  `pad` char(60) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) DBPARTITION BY HASH(c) DBPARTITIONS 2;
```

### 初始化数据

创建好分片表后，我们再使用 [sysbench](https://github.com/akopytov/sysbench) 工具向 `sbtest1` 表插入 10w 条数据，执行如下脚本初始化数据：

```bash
sysbench /opt/homebrew/Cellar/sysbench/1.0.20_6/share/sysbench/oltp_read_write.lua --tables=1 --table_size=100000 --mysql-user=root --mysql-password=123456 --mysql-host=127.0.0.1 --mysql-port=8066 --mysql-db=sharding_db prepare
```

由于 MyCat2 不支持 `INSERT ... SELECT ...` 语句，因此需要先使用 `mysqldump` 将 `sbtest1` 中的数据导出到文件。

```bash
mysqldump -h127.0.0.1 -uroot -p -P8066 sharding_db sbtest1 > sbtest1.sql
```

然后修改 `sbtest1.sql` 文件，注释掉文件中除了 `INSERT` 外的语句，并将 `sbtest1` 分别修改为 `sbtest_sharding_id`、`sbtest_sharding_k` 和 `sbtest_sharding_c`，然后执行 `mysql> source ~/sbtest1.sql` 导入数据到目标表。使用 `SELECT COUNT(1)` 检查各个表的数据量，都是 10w 条记录，符合我们的预期。

```sql
mysql> SELECT COUNT(1) FROM sbtest_sharding_id;
+----------+
| COUNT(1) |
+----------+
|   100000 |
+----------+

mysql> SELECT COUNT(1) FROM sbtest_sharding_k;
+----------+
| COUNT(1) |
+----------+
|   100000 |
+----------+

mysql> SELECT COUNT(1) FROM sbtest_sharding_c;
+----------+
| COUNT(1) |
+----------+
|   100000 |
+----------+
```

## MyCat2 Calcite 实践探究

### 执行流程概览

参考 [MyCat2 SQL 编写指导](https://www.yuque.com/ccazhw/ml3nkf/hdqguz)，MyCat2 SQL 执行流程如下，服务端接收到 SQL 字符串或模板化 SQL 后，会先将 SQL 解析为 SQL AST，然后使用 `Hack Router` 进行路由判断，如果是一些简单的单节点 SQL，`Hack Router` 会直接将 SQL 路由到 DB 中执行，其他复杂的 SQL 则会进入 DRDS 处理流程。DRDS 处理流程中，会使用 Calcite 对 SQL 语句进行编译，然后生成关系代数树，并经过逻辑优化和物理优化两步，最终执行返回 SQL 结果。

![MyCat2 SQL 执行流程](explore-the-practice-of-apache-calcite-in-mycat2/sql-execute-progress.png)

### 初看 SQL 执行

由于本文主要关注 MyCat2 对于 Calcite 的应用，因此后续介绍中其他流程不会过多探究，感兴趣的朋友可以下载源码自行研究。我们执行如下的 SQL 示例，来跟踪 MyCat2 的执行流程，并探索在 SQL 执行过程中，Calcite 查询引擎都进行了哪些优化。

```sql
SELECT * FROM sbtest_sharding_id i INNER JOIN sbtest_sharding_k k ON i.id = k.id INNER JOIN sbtest_sharding_c c ON k.id = c.id LIMIT 10;
```

首先，我们可以执行 `EXPLAIN` 语句，先观察下这条语句的执行计划（省略了执行计划中生成的执行代码 `Code` 部分）。对于这 3 张表的 JOIN 处理，MyCat2 优化器选择了 `SortMergeJoin` 的方式，从 MySQL 中查询 `sharding_db.sbtest_sharding_id` 和 `sharding_db.sbtest_sharding_k` 表时，会使用 `Join Key` 进行排序，对于已经排序的结果集，再拉取到内存中进行 `SortMergeJoin`。处理完 Join 后，会对结果集进行一次内存排序，然后和 `sharding_db.sbtest_sharding_c` 表再进行一次 `SortMergeJoin`，最终的结果集经过内存排序后获取出前 10 条结果。

可以看到，MyCat2 中将分片的逻辑表封装为 MycatView，MycatView 在内部下推执行时，会根据分片的规则改写为不同的真实 SQL，执行计划中的 `Each` 部分展示了下推 DB 执行的 SQL 语句，由于使用了 `SortMergeJoin`，因此下推语句中包含了 `ORDER BY` 排序处理。

```sql
mysql> EXPLAIN SELECT * FROM sbtest_sharding_id i INNER JOIN sbtest_sharding_k k ON i.id = k.id INNER JOIN sbtest_sharding_c c ON k.id = c.id LIMIT 10;
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Plan:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| MycatMemSort(fetch=[?0])                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|   MycatSortMergeJoin(condition=[=($4, $8)], joinType=[inner])                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|     MycatMemSort(sort0=[$4], dir0=[ASC])                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|       MycatSortMergeJoin(condition=[=($0, $4)], joinType=[inner])                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|         MycatView(distribution=[[sharding_db.sbtest_sharding_id]], mergeSort=[true])                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|         MycatView(distribution=[[sharding_db.sbtest_sharding_k]], mergeSort=[true])                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|     MycatView(distribution=[[sharding_db.sbtest_sharding_c]], mergeSort=[true])                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Each(targetName=c0, sql=SELECT * FROM sharding_db_0.sbtest_sharding_id_0 AS `sbtest_sharding_id` ORDER BY (`sbtest_sharding_id`.`id` IS NULL), `sbtest_sharding_id`.`id`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Each(targetName=c1, sql=SELECT * FROM sharding_db_1.sbtest_sharding_id_0 AS `sbtest_sharding_id` ORDER BY (`sbtest_sharding_id`.`id` IS NULL), `sbtest_sharding_id`.`id`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Each(targetName=c0, sql=SELECT * FROM sharding_db_0.sbtest_sharding_k_0 AS `sbtest_sharding_k` ORDER BY (`sbtest_sharding_k`.`id` IS NULL), `sbtest_sharding_k`.`id`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Each(targetName=c1, sql=SELECT * FROM sharding_db_1.sbtest_sharding_k_0 AS `sbtest_sharding_k` ORDER BY (`sbtest_sharding_k`.`id` IS NULL), `sbtest_sharding_k`.`id`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Each(targetName=c0, sql=SELECT * FROM sharding_db_0.sbtest_sharding_c_0 AS `sbtest_sharding_c` ORDER BY (`sbtest_sharding_c`.`id` IS NULL), `sbtest_sharding_c`.`id`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Each(targetName=c1, sql=SELECT * FROM sharding_db_1.sbtest_sharding_c_0 AS `sbtest_sharding_c` ORDER BY (`sbtest_sharding_c`.`id` IS NULL), `sbtest_sharding_c`.`id`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
170 rows in set (0.46 sec)
```

### 从 SQL 到执行计划

通过 MyCat2 的执行计划，我们对于分片表的多表关联查询有了初步的认识，下面我们来探究下 MyCat2 的代码实现，看看一条 SQL 是如何转换为执行计划的。我们执行如下的 SQL 语句：

```sql
SELECT * FROM sbtest_sharding_id i INNER JOIN sbtest_sharding_k k ON i.id = k.id INNER JOIN sbtest_sharding_c c ON k.id = c.id LIMIT 10;
```

MyCat2 SQL 执行的入口在 [MycatdbCommand](https://github.com/strongduanmu/Mycat2/blob/803bda6a02aa64d7fc16b521f04da06ce4bce2db/mycat2/src/main/java/io/mycat/commands/MycatdbCommand.java#L493) 类中，它会根据 SQL 语句的类型生成不同的 Handler 类，`SQLSelectStatement` 查询语句对应的是 `ShardingSQLHandler`。

![MycatdbCommand 入口获取 ShardingSQLHandler](explore-the-practice-of-apache-calcite-in-mycat2/mycat2-command.png)

获取到 `ShardingSQLHandler` 后，会调用 `AbstractSQLHandler#execute` 方法，最终会调用到 `ShardingSQLHandler#onExecute` 方法中，方法内部会使用 `hackRouter` 的 `analyse` 方法进行分析，用来决定 SQL 直接执行还是走 DRDS 执行。`analyse` 方法内部会先提取出语句中的表，然后调用 `checkVaildNormalRoute` 方法，对不同表的路由进行 `check` 并记录数据分布结果，最后根据数据分布结果决定执行方式。

```java
public class ShardingSQLHandler extends AbstractSQLHandler<SQLSelectStatement> {

    @Override
    protected Future<Void> onExecute(SQLRequest<SQLSelectStatement> request,
        MycatDataContext dataContext, Response response) {
        Optional<Future<Void>> op = Optional.empty();
        ...
        // SQL 模板化处理，转换为 select * from `sharding_db`.sbtest_sharding_id i inner join `sharding_db`.sbtest_sharding_k k on i.id = k.id inner join `sharding_db`.sbtest_sharding_c c on k.id = c.id limit ? 和参数 10
        DrdsSqlWithParams drdsSqlWithParams = DrdsRunnerHelper.preParse(request.getAst(), dataContext.getDefaultSchema());
        HackRouter hackRouter = new HackRouter(drdsSqlWithParams.getParameterizedStatement(), dataContext);
        try {
            // 分析 SQL 中表的数据分布，然后决定透传执行还是走 DRDS 执行
            if (hackRouter.analyse()) {
                Pair<String, String> plan = hackRouter.getPlan();
                return response.proxySelect(Collections.singletonList(plan.getKey()), plan.getValue(), drdsSqlWithParams.getParams());
            } else {
                return DrdsRunnerHelper.runOnDrds(dataContext, drdsSqlWithParams, response);
            }
        } catch (Throwable throwable) {
            LOGGER.error(request.getAst().toString(), throwable);
            return Future.failedFuture(throwable);
        }
    }
}
```

`DrdsRunnerHelper#runOnDrds` 方法逻辑如下，`getPlan` 用于获取 SQL 对应的执行计划，然后再调用 `getPlanImplementor` 获取执行计划的执行器，并执行 SQL 语句，然后返回 Future 对象等待返回结果。

```java
public static Future<Void> runOnDrds(MycatDataContext dataContext, DrdsSqlWithParams drdsSqlWithParams, Response response) {
    PlanImpl plan = getPlan(drdsSqlWithParams);
    PlanImplementor planImplementor = getPlanImplementor(dataContext, response, drdsSqlWithParams);
    return impl(plan, planImplementor);
}

@NotNull
public static PlanImpl getPlan(DrdsSqlWithParams drdsSqlWithParams) {
    QueryPlanner planner = MetaClusterCurrent.wrapper(QueryPlanner.class);
    PlanImpl plan;
    ParamHolder paramHolder = ParamHolder.CURRENT_THREAD_LOCAL.get();
    try {
        paramHolder.setData(drdsSqlWithParams.getParams(), drdsSqlWithParams.getTypeNames());
        CodeExecuterContext codeExecuterContext = planner.innerComputeMinCostCodeExecuterContext(drdsSqlWithParams);
        plan = new PlanImpl(codeExecuterContext.getMycatRel(), codeExecuterContext, drdsSqlWithParams.getAliasList());
    } finally {
    }
    return plan;
}
```

我们先重点关注 `getPlan` 方法是如何生成执行计划的，该方法内部调用的是 `QueryPlanner#innerComputeMinCostCodeExecuterContext` 方法，它负责从缓存中获取 `MyCatRelList` 执行计划，如果缓存中不存在则调用 `add` 方法生成执行计划，并将执行计划添加到缓存中。

```java
public CodeExecuterContext innerComputeMinCostCodeExecuterContext(DrdsSql sqlSelectStatement) {
    // 创建 RelOptCluster，内部注册 HintStrategyTable 处理 Hint 语法
    RelOptCluster relOptCluster = DrdsSqlCompiler.newCluster();
    // 从缓存中获取 MyCatRelList，如果不存在，则生成 MyCatRelList
    List<CodeExecuterContext> codeExecuterContexts = getAcceptedMycatRelList(sqlSelectStatement);
    int size = codeExecuterContexts.size();
    // 比较 Cost 获取最小的 CodeExecuterContext
}

public List<CodeExecuterContext> getAcceptedMycatRelList(DrdsSql drdsSql) {
    List<CodeExecuterContext> acceptedMycatRelList = planCache.getAcceptedMycatRelList(drdsSql);
    if (acceptedMycatRelList.isEmpty()) {
        synchronized (this) {
            // 从缓存中获取 MyCatRelList，存在直接返回
            acceptedMycatRelList = planCache.getAcceptedMycatRelList(drdsSql);
            if (!acceptedMycatRelList.isEmpty()) {
                return acceptedMycatRelList;
            } else {
                // 不存在则调用 add 方法生成 MyCatRelList，并添加到缓存中
                PlanResultSet add = planCache.add(false, drdsSql);
                return Collections.singletonList(add.getContext());
            }
        }
    } else {
        return acceptedMycatRelList;
    }
}
```

TODO

```java
public synchronized PlanResultSet add(boolean fix, DrdsSql drdsSql) {
    Long baselineId = null;
    // 获取 SQL 执行计划基线，用于提供稳定的执行计划
    Baseline baseline = this.getBaseline(drdsSql);
    DrdsSqlCompiler drdsSqlCompiler = MetaClusterCurrent.wrapper(DrdsSqlCompiler.class);
    OptimizationContext optimizationContext = new OptimizationContext();
    // 生成 MycatRel 执行计划树，内部包含了 RBO 和 CBO 优化
    MycatRel mycatRel = drdsSqlCompiler.dispatch(optimizationContext, drdsSql);
    RelJsonWriter relJsonWriter = new RelJsonWriter();
    mycatRel.explain(relJsonWriter);
    long hash = planIds.nextPlanId();
    // 生成新的执行计划基线
    BaselinePlan newBaselinePlan = new BaselinePlan(drdsSql.getParameterizedSQL(), relJsonWriter.asString(), hash, baselineId = baseline.getBaselineId(), null);
    getCodeExecuterContext(baseline,newBaselinePlan,optimizationContext, mycatRel);
    return saveBaselinePlan(fix, false, baseline, newBaselinePlan);
}
```

TODO

### 执行代码生成

```java
public static Future<Void> runOnDrds(MycatDataContext dataContext, DrdsSqlWithParams drdsSqlWithParams, Response response) {
    PlanImpl plan = getPlan(drdsSqlWithParams);
    PlanImplementor planImplementor = getPlanImplementor(dataContext, response, drdsSqlWithParams);
    return impl(plan, planImplementor);
}
```



TODO

## 结语





{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)


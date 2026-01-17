---
title: ShardingSphere Proxy 集成测试代码调试实战
tags: [Java, Remote Debugging, Docker, ShardingSphere]
categories: [In Action]
date: 2022-04-22 10:47:24
cover: /assets/blog/2022/07/21/1658403607.jpg
references:
  - '[ShardingSphere 集成测试文档](https://shardingsphere.apache.org/document/current/cn/test-manual/integration-test/)'
  - '[Testcontainer-01篇 基本入门](https://blog.csdn.net/mail_liuxing/article/details/99075606)'
  - '[How to locally debug containers started by Testcontainers](https://bsideup.github.io/posts/debugging_containers/)'
banner: /assets/banner/banner_8.jpg
---

## 前言

在[使用 Java 远程调试技术定位系统表加载问题](https://strongduanmu.com/blog/use-java-remote-debugging-to-locate-system-table-loading-bug/)一文中，我们了解了 Java 远程调试技术，以及如何使用远程调试来定位打包后的程序问题。最近，笔者在开发 ShardingSphere 过程中，又遇到了 ShardingSphere 集成测试相关的问题。ShardingSphere 集成测试使用了基于容器技术的 TestContainer，通过 TestContainer 能够快速地部署集成测试所依赖的容器，使得不同环境的测试变得简单。但是使用容器也使得代码调试变得更加困难，下面笔者将结合一个实际的社区 issue，来介绍下如何在容器中使用远程调试。

## 问题分析

最近，社区反馈了一个[集成测试相关的异常](https://github.com/apache/shardingsphere/issues/19419)，通过异常堆栈可以初步判断是由于 `SQL Federation` 测试 CASE 引起的，但是具体问题原因，还需要通过本地代码调试分析（本文使用 [0a53ca3](https://github.com/apache/shardingsphere/commit/0a53ca33616b09a4f98428129c44548b93e7d005) 进行演示，后续版本如有变化，请留言联系作者更新）。

![E2E 异常堆栈信息](/assets/blog/2022/07/21/1658401958.png)

首先，我们尝试本地复现这个异常，通过如下的命令构建 ShardingSphere-Proxy 镜像。

```bash
# Build Image
./mvnw -B clean install -am -pl test/e2e/sql -Pit.env.docker -DskipTests -Dspotless.apply.skip=true
```

然后修改 `test -> e2e -> sql` 模块下的 `it-env.properties` 配置文件，`modes` 用于指定运行模式，issue 中反馈的异常是在 `Cluster` 模式下运行的，`adapters` 用于指定接入端，`databases` 用于指定目标数据库。

```properties
#it.modes=Standalone,Cluster
it.run.modes=Cluster
it.run.additional.cases=false

#it.scenarios=db,tbl,readwrite_splitting,encrypt,shadow,dbtbl_with_readwrite_splitting,dbtbl_with_readwrite_splitting_and_encrypt,empty_rules
it.scenarios=tbl

# it.cluster.env.type=DOCKER,NATIVE
it.cluster.env.type=DOCKER

# it.cluster.adapters=jdbc,proxy
it.cluster.adapters=proxy

# it.cluster.databases=MySQL,PostgreSQL
it.cluster.databases=PostgreSQL
```

然后执行 `GeneralDQLIT` 测试程序，得到如下结果，异常信息和 issue 中反馈的一致，本地调试时发现 SQL 是连接容器中的 ShardingSphere-Proxy 服务，无法进一步定位 ShardingSphere-Proxy 中的逻辑。

![本地 E2E 重现异常](/assets/blog/2022/07/21/1658402730.png)

本地调试无法解决，我们只能再尝试使用远程调试的方式来定位问题，首先查看 `test -> e2e -> fixture` 模块中的 `start.sh` 脚本，由于该问题是 Proxy 启动后的运行时问题，因此无需将 `suspend` 设置为 `y`，此外被调试程序监听的端口为 3308。

```bash
JAVA_OPTS=" -Djava.awt.headless=true -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=3308"
```

由于 TestContainer 对外暴露的端口是随机生成的，调试程序无法获取到动态生成的端口，我们可以在 `ShardingSphereProxyClusterContainer` 中增加 log 输出 `3308` 映射的外部端口，并且在此位置打断点保证执行 SQL 逻辑前能够获取到外部端口。

```java
@Override
public DataSource getTargetDataSource(final String serverLists) {
    DataSource dataSource = targetDataSourceProvider.get();
    if (null == dataSource) {
        targetDataSourceProvider.set(StorageContainerUtils.generateDataSource(DataSourceEnvironment.getURL(databaseType, getHost(), getMappedPort(3307), config.getProxyDataSourceName()),
                ProxyContainerConstants.USERNAME, ProxyContainerConstants.PASSWORD));
    }
    log.info("Mapped port 3308: " + getMappedPort(3308));
    return targetDataSourceProvider.get();
}
```

配置完成后，我们再次执行 GeneralDQLIT 测试程序，在断点处获取外部映射端口。然后再配置调试程序，使用 IDEA 下载新的 ShardingSphere 源码，并在 IDEA 中添加如下的远程调试配置，然后执行远程调试程序，此时可以发现集成测试的请求已经转到调试程序中，终于可以进一步分析问题的原因了。

![IDEA Debug 配置](/assets/blog/2022/07/21/1658404492.png)



{% GoogleAdsense %}

## 问题解决

我们以下面的查询作为示例，使用远程调试技术来定位下问题，从异常提示来看 `content` 别名的使用方式在 PostgreSQL 下有语法异常，我们将 SQL 拷贝到原生 PostgreSQL 数据库执行，出现了同样的异常提示。

```sql
<test-case sql="SELECT user_id, CONCAT('SUM:', total, '.') content FROM (SELECT user_id, SUM(order_id_sharding) AS total FROM t_order_federate_sharding GROUP BY user_id HAVING SUM(order_id_sharding) > ?) AS temp" db-types="MySQL,PostgreSQL" scenario-types="tbl">
    <assertion parameters="1000:int" />
</test-case>

[ERROR] assertExecute[proxy: tbl -> PostgreSQL -> Literal -> SELECT user_id, CONCAT('SUM:', total, '.') content FROM (SELECT user_id, SUM(order_id_sharding) AS total FROM t_order_federate_sharding GROUP BY user_id HAVING SUM(order_id_sharding) > ?) AS temp](org.apache.shardingsphere.test.integration.engine.dql.GeneralDQLIT)  Time elapsed: 0.27 s  <<< ERROR!
org.postgresql.util.PSQLException: 
ERROR: syntax error at or near "content"
  位置：44
        at org.apache.shardingsphere.test.integration.engine.dql.GeneralDQLIT.assertExecuteForStatement(GeneralDQLIT.java:108)
        at org.apache.shardingsphere.test.integration.engine.dql.GeneralDQLIT.assertExecute(GeneralDQLIT.java:97)
```

查阅 PostgreSQL [SELECT 语句文档](https://www.postgresql.org/docs/current/sql-select.html)，我们可以找到如下的一段描述，你可以使用 `AS output_name` 为输出列指定名称，你也可以省略 AS，但是要求输出的名称不能和 PostgreSQL 的关键字冲突，而这个示例中的 content 就是一个 PostgreSQL 关键字，文档中同时也提供了解决方案，使用 AS 或者用双引号修饰输出字段。

> Just as in a table, every output column of a `SELECT` has a name. In a simple `SELECT` this name is just used to label the column for display, but when the `SELECT` is a sub-query of a larger query, the name is seen by the larger query as the column name of the virtual table produced by the sub-query. **To specify the name to use for an output column, write `AS` *`output_name`* after the column's expression. (You can omit `AS`, but only if the desired output name does not match any PostgreSQL keyword (see [Appendix C](https://www.postgresql.org/docs/current/sql-keywords-appendix.html)). For protection against possible future keyword additions, it is recommended that you always either write `AS` or double-quote the output name.**) If you do not specify a column name, a name is chosen automatically by PostgreSQL. If the column's expression is a simple column reference then the chosen name is the same as that column's name. In more complex cases a function or type name may be used, or the system may fall back on a generated name such as `?column?`.

我们为 content 别名添加 AS 之后再次进行测试，这时出现了如下异常，难道是 SQL Federation 内部逻辑有问题？

![E2E 调试](/assets/blog/2022/07/22/1658451043.png)

我们都知道 SQL Federation 是面向用户的逻辑 SQL 进行执行的，通过关系代数的等价变换，对逻辑执行计划进行优化，然后生成可执行的物理执行计划，而物理执行计划中最关键的就是算子下推，从底层的数据源上获取数据，因此我们来调试下这部分逻辑是否正常。

![SQL Federation 调试](/assets/blog/2022/07/22/1658451995.png)

通过 Debug 发现下推执行逻辑并无异常，返回的结果符合预期，我们再来看下集成测试断言的逻辑，ShardingSphere 集成测试在执行查询语句时，会将 ShardingSphere-Proxy 执行的结果和 PostgreSQL 上执行的结果进行对比，判断元数据以及数据行是否相同。

```java
protected final void assertResultSet(final ResultSet actualResultSet, final ResultSet expectedResultSet) throws SQLException {
    assertMetaData(actualResultSet.getMetaData(), expectedResultSet.getMetaData());
    assertRows(actualResultSet, expectedResultSet);
}
```

通过对比结果集，发现异常是由于结果集顺序引起的，因此需要为查询语句添加 `ORDER BY temp.user_id`，保证结果集顺序的稳定性。

![结果对比](/assets/blog/2022/07/22/1658452531.png)

修改完测试 SQL 后再次测试，集成测试能正常通过，结果如下。这个问题也提醒大家在编写 SQL 测试用例时，需要关注测试用例的有序性，默认的排序规则通常是不稳定的，需要通过显示地声明排序规则来避免意料之外的问题。

![修复后 E2E 测试](/assets/blog/2022/07/22/1658452827.png)



{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

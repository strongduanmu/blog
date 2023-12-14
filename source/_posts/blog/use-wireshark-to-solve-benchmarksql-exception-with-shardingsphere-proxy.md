---
title: 使用 Wireshark 解决 BenchmarkSQL 压测 Proxy 异常
tags: [Wireshark, ShardingSphere, In Action]
categories: [In Action]
banner: china
date: 2023-12-05 11:31:34
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/06/1701833859.png
references:
  - title: 'ShardingSphere-Proxy 数据库协议交互解读'
    url: https://mp.weixin.qq.com/s/M7uMynSeK2KwBSWHmCMWZQ
  - title: 'ShardingSphere-Proxy 前端协议问题排查方法及案例'
    url: https://mp.weixin.qq.com/s/ROtf-rFeFDeHjX2ln_Pk4Q
  - title: 'MySQL 技术内幕九：通信协议详解'
    url: https://zhuanlan.zhihu.com/p/144657586
  - title: 'MySQL 协议分析'
    url: https://www.cnblogs.com/davygeek/p/5647175.html
---

## 问题背景

最近 ShardingSphere 社区用户反馈，他使用 BenchmarkSQL 工具对 ShardingSphere Proxy 进行性能测试，在执行 `./runDatabaseBuild.sh props.mysql` 初始化数据阶段，出现了 `ArrayIndexOutOfBoundsException` 异常，而且异常能够稳定复现。考虑到 ShardingSphere 团队内部也覆盖了 BenchmarkSQL 测试，每天定时会拉取最新代码进行性能压测，保证 ShardingSphere 性能持续稳定，笔者一开始怀疑用户配置方面存在问题，但是查看之后并没有发现配置问题。为了搞清问题的原因，笔者开展了一番测试和调查，本文记录了调查的过程和问题的分析，最终通过 `Wireshark` 抓包确认异常是 ShardingSphere Proxy 协议实现不完善导致。

## 问题分析

### 异常初步分析

根据用户反馈的异常堆栈，程序是在 `LoadDataWorker#364` 行执行 `executeBatch` 时抛出了异常，可以看出 BenchmarkSQL 初始化数据使用的 JDBC `addBatch` 和 `executeBatch` 批量接口。

```
java.lang.ArrayIndexOutOfBoundsException: Index 38928 out of bounds for length 38928
        at com.mysql.cj.NativeQueryBindings.getBinding(NativeQueryBindings.java:191)
        at com.mysql.cj.NativeQueryBindings.setFromBindValue(NativeQueryBindings.java:198)
        at com.mysql.cj.jdbc.ClientPreparedStatement.setOneBatchedParameterSet(ClientPreparedStatement.java:591)
        at com.mysql.cj.jdbc.ClientPreparedStatement.executeBatchWithMultiValuesClause(ClientPreparedStatement.java:675)
        at com.mysql.cj.jdbc.ClientPreparedStatement.executeBatchInternal(ClientPreparedStatement.java:409)
        at com.mysql.cj.jdbc.StatementImpl.executeBatch(StatementImpl.java:795)
        at LoadDataWorker.loadWarehouse(LoadDataWorker.java:364)
        at LoadDataWorker.run(LoadDataWorker.java:187)
        at java.base/java.lang.Thread.run(Thread.java:1583)
```

最终 `ArrayIndexOutOfBoundsException` 异常出现在 MySQL 驱动中，`NativeQueryBindings#191` 逻辑根据参数偏移位 `parameterIndex` 获取对应的参数值。从异常信息 `Index 38928 out of bounds for length 38928` 可以看出，`bindValues` 数组当前只有 38928 个值，需要通过 `0-38927` 来获取，初步判断应该是 Proxy 对于预编译 SQL 中的参数处理存在问题。

```java
/**
 * Returns the structure representing the value that (can be)/(is)
 * bound at the given parameter index.
 * 
 * @param parameterIndex
 *            0-based
 * @param forLongData
 *            is this for a stream?
 * @return BindValue
 */
public BindValue getBinding(int parameterIndex, boolean forLongData) {
    if (this.bindValues[parameterIndex] != null && this.bindValues[parameterIndex].isStream() && !forLongData) {
        this.longParameterSwitchDetected = true;
    }
    return this.bindValues[parameterIndex];
}
```

### BenchmarkSQL 分析

大致了解了问题的可能方向后，先从 [benchmarksql](https://gitee.com/opengauss_sharding/benchmarksql) 仓库下载 BenchmarkSQL 程序，该程序目前支持了 ShardingSphere JDBC 和 Proxy 性能压测，本文暂时只关注 Proxy 压测出现的异常问题，JDBC 后续文章可以介绍使用方法。

下载完成后，修改 `props.mysql` 中的数据源配置，将 MySQL 数据源指向 ShardingSphere Proxy，再执行 `./runDatabaseBuild.sh props.mysql` 命令初始化数据。

```properties
db=mysql
driver=com.mysql.cj.jdbc.Driver
conn=jdbc:mysql://127.0.0.1:3307/encrypt_db?useSSL=false&useServerPrepStmts=true&rewriteBatchedStatements=true&cachePrepStmts=true&prepStmtCacheSize=8192&prepStmtCacheSqlLimit=8000
user=root
password=root

warehouses=1
loadWorkers=4
terminals=1
runTxnsPerTerminal=10
runMins=0
limitTxnsPerMin=300
terminalWarehouseFixed=false

//The following five values must add up to 100
//The default percentages of 45, 43, 4, 4 & 4 match the TPC-C spec
newOrderWeight=45
paymentWeight=43
orderStatusWeight=4
deliveryWeight=4
stockLevelWeight=4

// Directory name to create for collecting detailed result data.
// Comment this out to suppress.
resultDirectory=result/mysql/mysql8.0.direct.wh.81_%tY-%tm-%td_%tH%tM%tS
osCollectorScript=./misc/os_collector_linux.py
osCollectorInterval=1
osCollectorSSHAddr=chexiaopeng01@quick07v.mm.bjat.qianxin-inc.cn
osCollectorDevices=net_eth0 blk_sda
```

执行一段时间后，本地使用 BenchmarkSQL 程序复现异常，异常信息如下图所示：

![BenchmarkSQL 初始化数据异常](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2023/12/06/1701862834.png)



### 最小化 Demo 分析



## 问题解决



## 结语

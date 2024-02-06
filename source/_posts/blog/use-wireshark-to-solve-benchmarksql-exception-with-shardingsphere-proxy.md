---
title: 使用 Wireshark 解决 BenchmarkSQL 压测 Proxy 异常
tags: [Wireshark, ShardingSphere, In Action]
categories: [In Action]
date: 2023-12-05 11:31:34
cover: /assets/blog/2023/12/06/1701833859.png
references:
  - '[ShardingSphere-Proxy 数据库协议交互解读](https://mp.weixin.qq.com/s/M7uMynSeK2KwBSWHmCMWZQ)'
  - '[ShardingSphere-Proxy 前端协议问题排查方法及案例](https://mp.weixin.qq.com/s/ROtf-rFeFDeHjX2ln_Pk4Q)'
  - '[MySQL 技术内幕九：通信协议详解](https://zhuanlan.zhihu.com/p/144657586)'
  - '[MySQL 协议分析](https://www.cnblogs.com/davygeek/p/5647175.html)'
banner: /assets/banner/banner_1.jpg
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

大致了解问题发生的原因后，打算使用 BenchmarkSQL 复现该问题。首先从 [benchmarksql](https://gitee.com/opengauss_sharding/benchmarksql) 仓库下载 BenchmarkSQL 程序，该程序目前支持了 ShardingSphere JDBC 和 Proxy 性能压测，本文暂时只关注 Proxy 压测出现的异常问题，JDBC 后续文章可以介绍使用方法。

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

![BenchmarkSQL 初始化数据异常](/assets/blog/2023/12/06/1701862834.png)

为了方便问题分析，尝试使用 IDEA 配置 BenchmarkSQL 初始化程序进行 Debug 定位，首先看下 `runDatabaseBuild.sh` 脚本的逻辑，主要包含了：1. 初始化表结构；2. 加载数据；3. 初始化索引、外键等。根据前文的异常堆栈，是在第二步加载数据中出现的异常，因此先注释第二步的脚本，单独 Debug 执行。

```bash
#!/bin/sh
# ... 省略
BEFORE_LOAD="tableCreates"
AFTER_LOAD="indexCreates foreignKeys extraHistID buildFinish"

# 初始化表结构
for step in ${BEFORE_LOAD} ; do
    ./runSQL.sh "${PROPS}" $step
done

# 加载数据
#./runLoader.sh "${PROPS}" $*

# 初始化索引、外键等
for step in ${AFTER_LOAD} ; do
    ./runSQL.sh "${PROPS}" $step
done
```

调整完脚本后，尝试执行 `./runDatabaseBuild.sh props.mysql` 初始化表结构，如果多次执行则需要先执行清理脚本 `./runDatabaseDestroy.sh props.mysql`。然后参考 `./runLoader.sh "${PROPS}" $\*` 逻辑配置 IDEA 启动类，脚本实际调用了 LoadData 类。

```bash
#!/usr/bin/env bash
# ... 省略
myOPTQuickCSP="-Dquickcsp.loglevel.default=warn -Dquickcsp.loglevel.tde=warn -Dlogback.configurationFile=quickcsp.logback.xml  "
java -cp "$myCP" -Dprop=$PROPS $myOPTQuickCSP LoadData $*
```

可以通过 IDEA 直接打开 `src/LoadData` 工程，为了读取数据源配置，我们需要配置系统变量 prop 指定配置文件路径，然后执行 `LoadData#main` 方法进行初始化数据。根据异常堆栈的位置，设置条件断点，本地复现了异常。

![LoadData 复现异常](/assets/blog/2024/01/05/1704417767.png)

bindValues 只有 38928 个，按照 SQL 中的参数个数 17 计算，只设置了 2289 组参数，与逻辑中期望的 10000 组参数相差甚远。

![LoadData 导入数据逻辑](/assets/blog/2024/01/05/1704417811.png)

排查 MySQL 驱动逻辑发现 bindValues 是由 `parameterCount` 控制，可以看到 parameterCount 传递的值为 38928，和 10000 * 17 结果不一致，继续排查发现 `parameterCount` 是从服务端即 Proxy 获取。

![MySQL 驱动从 Proxy 读取 parameterCount](/assets/blog/2024/01/05/1704417857.png)

Proxy 中处理预编译 SQL Prepare 是通过 `MySQLComStmtPrepareExecutor` 类进行的，通过 debug 可以看出 Proxy 处理的 parameterCount 是符合预期的，并且也成功写入到 `MySQLComStmtPrepareOKPacket` 包中返回。问题看起来似乎有点复杂，Proxy 返回了正确的 parameterCount，而 MySQL 驱动接收到的却是一个错误的值，这到底是为什么？

### Wireshark 抓包分析

由于 BenchmarkSQL#LoadData 初始化逻辑较为复杂，其中还包含了其他业务表的处理，不利于问题的排查，本地尝试编写一个最小化 Demo 复现问题，逻辑如下：

```java
@Test
void assertBenchmarkSQL() throws SQLException {
    try (Connection connection = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3307/encrypt_db?useSSL=false&allowPublicKeyRetrieval=true&useServerPrepStmts=true&rewriteBatchedStatements=true&cachePrepStmts=true&prepStmtCacheSize=1000&prepStmtCacheSqlLimit=2048", "root", "root");
         PreparedStatement stmtStock = connection.prepareStatement("INSERT INTO bmsql_stock (s_i_id, s_w_id, s_quantity, s_dist_01, s_dist_02, s_dist_03, s_dist_04, s_dist_05, s_dist_06,  s_dist_07, s_dist_08, s_dist_09, s_dist_10,  s_ytd, s_order_cnt, s_remote_cnt, s_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
        for (int s_i_id = 1; s_i_id <= 100000; s_i_id++) {
            if (s_i_id != 1 && (s_i_id - 1) % 10000 == 0) {
                stmtStock.executeBatch();
                stmtStock.clearBatch();
            }
            stmtStock.setInt(1, s_i_id);
            stmtStock.setInt(2, s_i_id + 1);
            stmtStock.setInt(3, s_i_id + 2);
            stmtStock.setString(4, "");
            stmtStock.setString(5, "");
            stmtStock.setString(6, "");
            stmtStock.setString(7, "");
            stmtStock.setString(8, "");
            stmtStock.setString(9, "");
            stmtStock.setString(10, "");
            stmtStock.setString(11, "");
            stmtStock.setString(12, "");
            stmtStock.setString(13, "");
            stmtStock.setInt(14, 0);
            stmtStock.setInt(15, 0);
            stmtStock.setInt(16, 0);
            stmtStock.setString(17, "sData");
            stmtStock.addBatch();
        }
    }
}
```

执行单测程序，复现了前文的异常，Prxoy debug 仍然是同样的行为，Proxy 返回正确的 parameterCount，而 MySQL 驱动获取的结果却是错误的。

![最小化 Demo 复现异常](/assets/blog/2024/01/05/1704417635.png)

#### Wireshark 工具简介

为了弄清楚 Proxy 返回给 MySQL 驱动过程中发生了什么问题，我们需要通过抓包方式进行问题排查，由于该问题在本机已经复现，可以直接使用 `Wireshark` 进行抓包。本地打开 Wireshark 如下图所示，列表中展示了本机网卡，需要根据使用情况进行选择。

![Wireshark 网卡选择](/assets/blog/2024/01/05/1704429304.png)

当前 Demo 连接的是本地运行 Proxy 实例，客户端通过 127.0.0.1 端口 3307 进行连接，流量都经过 Loopback 网卡，因此选择 Loopback 作为抓包对象。选择网卡后，Wireshark 即开始抓包。由于网卡中可能会有很多其他进程的流量，需要过滤出指定端口的流量：

```
tcp.port == 3307
```

![根据 3307 端口过滤](/assets/blog/2024/01/05/1704430048.png)

**其他抓包注意事项：**

* Proxy 部署在服务上时，此时无法使用 Wireshark 进行抓包，可以使用 Linux 系统自带的 `tcpdump` 命令，tcpdump 的抓包结果文件可以通过 Wireshark 打开；

```bash
# 对网卡 eth0 抓包，过滤 TCP 端口 3307，并将抓包结果写入到 /path/to/dump.cap
tcpdump -i eth0 -w /path/to/dump.cap tcp port 3307
```

* 客户端连接 MySQL，可能会自动启用 SSL 加密，抓包结果无法直接解析出协议内容。对于 MySQL 命令行以及 JDBC 驱动，可以分别使用如下方式关闭 SSL。

```bash
# 使用 MySQL 命令行客户端可以指定参数禁用 SSL
mysql --ssl-mode=disable

# 使用 JDBC 可以在 URL 中增加参数
jdbc:mysql://127.0.0.1:3306/db?useSSL=false
```

#### Wireshark 读取抓包内容

Wireshark 支持读取多种抓包文件格式，包括 tcpdump 的抓包格式。Wireshark 默认会把 `3306` 端口解码为 MySQL 协议、`5432` 端口解码为 PostgreSQL 协议。对于 Proxy 可能使用不同端口的情况，可以使用 `Decode As...` 指定端口的解码协议。例如，Proxy 使用了 3307 端口，可以按照以下步骤把 3307 端口解码为 MySQL 协议：

![设置 3307 端口为 MySQL 协议](/assets/blog/2024/01/05/1704430568.png)

当 Wirekshark 能够解析出 MySQL 协议后，我们可以增加过滤条件，只显示 MySQL 协议数据：

```
tcp.port == 3307 and mysql
```

![过滤 3307 端口和 MySQL 协议](/assets/blog/2024/01/05/1704430876.png)

#### 使用 Wireshark 抓包定位

了解了 Wireshark 基本使用方式后，我们执行前文编写的最小化 Demo，抓包获取到了如下报文信息，响应报文中返回的 parameterCount 为 38928，转换为 16 进制为 9810（2 字节），而以类似的方式计算 170000 对应的 16 进制是 029810（3 字节）。

![最小化 Demo 测试 Proxy 抓包](/assets/blog/2024/01/05/1704431027.png)

可以看出报文返回的信息丢失了一个字节，那么 MySQL 协议里面 parameterCount 最多可以传输几个字节呢？参考 [MySQL 协议文档](https://dev.mysql.com/doc/dev/mysql-server/latest/page_protocol_com_stmt_prepare.html#sect_protocol_com_stmt_prepare_response_ok)及 MySQLComStmtPrepareOKPacket 实现，parameterCount 参数最大只能存储 2 字节的数值，即 ffff=65535。

```java
/**
 * COM_STMT_PREPARE_OK packet for MySQL.
 * 
 * @see <a href="https://dev.mysql.com/doc/dev/mysql-server/latest/page_protocol_com_stmt_prepare.html#sect_protocol_com_stmt_prepare_response_ok">COM_STMT_PREPARE_OK</a>
 */
@RequiredArgsConstructor
public final class MySQLComStmtPrepareOKPacket extends MySQLPacket {
    
    private static final int STATUS = 0x00;
    
    private final int statementId;
    
    private final int columnCount;
    
    private final int parameterCount;
    
    private final int warningCount;
    
    @Override
    protected void write(final MySQLPacketPayload payload) {
        payload.writeInt1(STATUS);
        payload.writeInt4(statementId);
        // TODO Column Definition Block should be added in future when the meta data of the columns is cached.
        payload.writeInt2(columnCount);
        payload.writeInt2(parameterCount);
        payload.writeReserved(1);
        payload.writeInt2(warningCount);
    }
}
```

既然 MySQL 协议中定义的 parameterCount 最大为 65535，那么 BenchmarkSQL 测试原生 MySQL 也应当报错，而实际反馈原生 MySQL 不会出现异常。为了一探究竟，我们打算再测试下原生 MySQL，看下协议上是如何处理的。调整 JDBC URL 直接指向 MySQL 数据库，并执行单测程序。

![最小化 Demo 测试 MySQL 抓包](/assets/blog/2024/01/05/1704431482.png)

测试并抓包后发现，原生 MySQL 同样不支持 2 字节以上的 parameterCount，MySQL 会直接抛出异常。此时 MySQL 驱动捕获到 `1390` 异常码后，会将预编译 SQL 转换为非预编译 SQL，直接将参数拼接在 VALUES 中，然后再次发起请求。

![MySQL 驱动根据异常码再次发起请求](/assets/blog/2024/01/05/1704431609.png)

到这里问题终于明确了，Proxy 对于预编译参数超过 65535 的情况，未进行异常校验，导致通过 Netty 返回报文时丢失了一个字节，进而出现 MySQL 驱动中报出的参数 Index 越界异常。

## 问题解决

使用 Wireshark 我们搞清楚了 Proxy 执行 BenchmarkSQL 出现参数 Index 越界的原因，当预编译参数超过 65535 时，需要参考 MySQL 的行为抛出异常，此时 MySQL 驱动会再次发起非预编译的请求，将参数拼接在 VALUES 中。在 Proxy MySQLComStmtPrepareExecutor 类中，我们增加对参数个数的校验，超过 65535 则抛出异常。

```java
private Collection<DatabasePacket> createPackets(final SQLStatementContext sqlStatementContext, final int statementId, final MySQLServerPreparedStatement serverPreparedStatement) {
    Collection<DatabasePacket> result = new LinkedList<>();
    Collection<Projection> projections = getProjections(sqlStatementContext);
    int parameterCount = sqlStatementContext.getSqlStatement().getParameterCount();
    ShardingSpherePreconditions.checkState(parameterCount <= MAX_PARAMETER_COUNT, TooManyPlaceholdersException::new);
    result.add(new MySQLComStmtPrepareOKPacket(statementId, projections.size(), parameterCount, 0));
    int characterSet = connectionSession.getAttributeMap().attr(MySQLConstants.MYSQL_CHARACTER_SET_ATTRIBUTE_KEY).get().getId();
    int statusFlags = ServerStatusFlagCalculator.calculateFor(connectionSession);
    if (parameterCount > 0) {
        result.addAll(createParameterColumnDefinition41Packets(sqlStatementContext, characterSet, serverPreparedStatement));
        result.add(new MySQLEofPacket(statusFlags));
    }
    if (!projections.isEmpty() && sqlStatementContext instanceof SelectStatementContext) {
        result.addAll(createProjectionColumnDefinition41Packets((SelectStatementContext) sqlStatementContext, characterSet));
        result.add(new MySQLEofPacket(statusFlags));
    }
    return result;
}
```

异常码和异常信息都参考 MySQL 进行定义，完整的修复代码请参考 [PR#29296](https://github.com/apache/shardingsphere/pull/29296/files)。

```java
ER_PS_MANY_PARAM(XOpenSQLState.GENERAL_ERROR, 1390, "Prepared statement contains too many placeholders"),
```

修改完成后，再次使用 BenchmarkSQL 进行测试，此时异常问题已经得到了解决。

![BenchmarkSQL 测试通过](/assets/blog/2024/01/05/1704433581.jpg)

## 结语

本文介绍了 BenchmarkSQL 测试 Proxy 出现参数 Index 越界异常后，使用 Wireshark 排查问题的过程。通过强大的 Wireshark 工具，我们很清晰地观测到请求过程中出现的问题，进而找到解决问题的方案，这也印证了那句老话「**工欲善其事，必先利其器**」。本案例的排查思路也适合其他 Proxy 接入端的问题，希望对大家有用，由于本人对 Wireshark 使用经验有限，如果问题也欢迎指正。

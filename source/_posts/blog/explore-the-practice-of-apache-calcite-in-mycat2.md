---
title: Apache Calcite 在 MyCat2 中的实践探究
tags: [Calcite]
categories: [Calcite]
date: 2025-02-17 08:33:30
updated: 2025-03-02 08:33:30
cover: /assets/cover/calcite.jpg
references:
  - '[入门 MyCat2](https://www.yuque.com/ccazhw/ml3nkf/fb2285b811138a442eb850f0127d7ea3?)'
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

完成原型库配置后，我们再来配置业务库。和原型库的配置类似，我们同样需要先注册 MySQL 数据源，然后将数据源构建为集群。



## 结语





{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)


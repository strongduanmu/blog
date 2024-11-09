---
title: BenchmarkSQL & ShardingSphere-JDBC 性能测试实战
date: 2024-02-20 18:07:01
tags: [In Action, ShardingSphere]
categories: [ShardingSphere]
cover: /assets/blog/2021/06/25/1624608310.png
banner: /assets/banner/banner_9.jpg
references:
  - '[BenchmarkSQL ShardingSphere Proxy 分片性能测试](https://shardingsphere.apache.org/document/current/cn/test-manual/performance-test/benchmarksql-proxy-sharding-test/)'
  - '[TPC-C 基准性能测试](https://book.tidb.io/session4/chapter3/tpc-c.html)'
  - '[BenchmarkSQL 性能测试（openGauss）](https://www.modb.pro/db/44107)'
  - '[ShardingSphere-JDBC 可选插件](https://shardingsphere.apache.org/document/current/cn/user-manual/shardingsphere-jdbc/optional-plugins/)'
---

## TPC-C 模型简介

[TPC](https://www.tpc.org/tpcc/) 是一系列事务处理和数据库基准测试的规范。其中TPC-C（Transaction Processing Performance Council）是针对 OLTP 的基准测试模型。TPC-C 测试模型给基准测试提供了一种统一的测试标准，可以大体观察出数据库服务稳定性、性能以及系统性能等一系列问题。对数据库展开 TPC-C 基准性能测试，一方面可以衡量数据库的性能，另一方面可以衡量采用不同硬件软件系统的性价比，也是被业内广泛应用并关注的一种测试模型。

TODO

## BenchmarkSQL 使用入门

TODO

## ShardingSphere-JDBC 性能测试实战

```bash
# 1. 创建 jdbc 依赖 lib 目录
cd ~/Downloads
mkdir shardingsphere-jdbc-lib
cd shardingsphere-jdbc-lib

# 2. 增加软链到 BenchmarkSQL lib/ext 目录
ln -s /Users/duanzhengqiang/Downloads/shardingsphere-jdbc-lib /Users/duanzhengqiang/IdeaProjects/benchmarksql-og/lib/ext
unlink /Users/duanzhengqiang/IdeaProjects/benchmarksql-og/lib/ext

# 3. 下载 JDBC 和 Cluster ZK Jar 包
-- 下载 JDBC Jar 包：https://maven.apache.org/plugins/maven-dependency-plugin/examples/copying-artifacts.html
mvn dependency:copy -Dartifact=org.apache.shardingsphere:shardingsphere-jdbc:5.4.2-SNAPSHOT -Dpackaging=jar -DoutputDirectory=/Users/duanzhengqiang/Downloads/shardingsphere-jdbc-lib

mvn dependency:copy -Dartifact=org.apache.shardingsphere:shardingsphere-cluster-mode-repository-zookeeper:5.4.2-SNAPSHOT -Dpackaging=jar -DoutputDirectory=/Users/duanzhengqiang/Downloads/shardingsphere-jdbc-lib

# 4. 进去 SS 项目路径，下载 JDBC 和 Cluster ZK 依赖 Jar 包
cd /Users/duanzhengqiang/IdeaProjects/shardingsphere/jdbc
-- 下载 JDBC Jar 包依赖，copy-dependencies 依赖 pom 文件
mvn dependency:copy-dependencies -DoutputDirectory=/Users/duanzhengqiang/Downloads/shardingsphere-jdbc-lib

cd /Users/duanzhengqiang/IdeaProjects/shardingsphere/mode/type/cluster/repository/provider/zookeeper
mvn dependency:copy-dependencies -DoutputDirectory=/Users/duanzhengqiang/Downloads/shardingsphere-jdbc-lib
```

TODO



{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

---
title: 使用 Java 远程调试技术定位系统表加载问题
tags: [Java, Remote Debugging]
categories: [In Action]
date: 2022-03-30 11:15:27
cover: /assets/blog/2022/03/30/1648635657.jpg
banner: /assets/banner/banner_10.jpg
---

## 背景

在最近的工作中，笔者负责开发了 `ShardingSphere 系统表` 功能，该功能会在 ShardingSphere 启动时模拟不同数据库的系统表，从而兼容各种数据库客户端，避免客户端查询系统表时出现报错。按照正常开发的流程，笔者对功能进行了较为全面的测试，然后将功能提测给测试同学。本以为一切会很顺序，但在功能测试的第一步就出现了问题——ShardingSphere 打包后启动起来，Zookeeper 中无法查询到系统表的元数据。**为什么直接通过 IDEA 启动测试正常，打包之后启动就无法加载系统表呢？**为了搞清问题的原因，笔者开始了后文中的一番调查。

## 问题排查

根据 `打包后 ShardingSphere 无法加载系统表` 这个现象，首先想到的就是打包后的程序是否丢失了系统表配置文件。为了排查丢失配置文件的可能性，笔者使用 `JD-GUI` 对打包后的 jar 包进行反编译，得到如下结果：

![1648687778](/assets/blog/2022/03/31/1648687778.png)

从结果可以看出，ShardingSphere 加载系统表所使用的配置文件都存在，并未出现配置文件丢失的情况。为了进一步定位打包程序的问题，我们需要使用远程调试技术，了解打包程序内部运行的逻辑。



{% GoogleAdsense %}

## 远程调试

Java 远程调试技术主要是基于 `JDWP（Java Debug Wire Protocol）` 协议，而 `JDWP` 协议是 Java 语言中用于调试程序和被调试程序之间进行通信的协议。调试程序和被调试程序可以位于同一台机器上，也可以位于不同的机器上。要使用 JDWP 进行远程调试，首先需要在被调试程序中配置如下参数：

```bash
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=8888 -jar xxx.jar
```

`java -agentlib:jdwp` 用于开启远程调试功能，它会在 `address` 参数对应的端口上开启监听，等待调试程序连接。`JDWP` 中的具体参数含义，我们可以使用 `java -agentlib:jdwp=help` 进行查看，具体结果如下：

```
               Java Debugger JDWP Agent Library
               --------------------------------

  (see http://java.sun.com/products/jpda for more information)

jdwp usage: java -agentlib:jdwp=[help]|[<option>=<value>, ...]

Option Name and Value            Description                       Default
---------------------            -----------                       -------
suspend=y|n                      wait on startup?                  y
transport=<name>                 transport spec                    none
address=<listen/attach address>  transport spec                    ""
server=y|n                       listen for debugger?              n
launch=<command line>            run debugger on event             none
onthrow=<exception name>         debug on throw                    none
onuncaught=y|n                   debug on any uncaught?            n
timeout=<timeout value>          for listen/attach in milliseconds n
mutf8=y|n                        output modified utf-8             n
quiet=y|n                        control over terminal messages    n

Obsolete Options
----------------
strict=y|n
stdalloc=y|n

Examples
--------
  - Using sockets connect to a debugger at a specific address:
    java -agentlib:jdwp=transport=dt_socket,address=localhost:8000 ...
  - Using sockets listen for a debugger to attach:
    java -agentlib:jdwp=transport=dt_socket,server=y,suspend=y ...

Notes
-----
  - A timeout value of 0 (the default) is no timeout.

Warnings
--------
  - The older -Xrunjdwp interface can still be used, but will be removed in
    a future release, for example:
        java -Xdebug -Xrunjdwp:[help]|[<option>=<value>, ...]
```

* `transport`：表示调试程序和被调试程序间的通信协议，`dt_socket` 表示使用 `socket` 方式进行通信；
* `server`：表示是否为调试程序开启监听，`y` 表示开启，默认为 `n` 表示不开启；
* `suspend`：表示是否在被调试程序启动阶段等待调试程序连接，配置成 `y` 可以用来调试启动流程，如果不需要调试启动流程，设置为 `n` 即可；
* `address`：被调试程序监听的端口；

除了上面介绍的常用配置方式之外，还可以通过 `java -Xdebug -Xrunjdwp:transport` 开启远程调试，这种方式是 `JDK 1.5` 及之前版本开启远程调试的方式，在 `JDK 1.5` 之后的版本，官方都推荐使用 `java -agentlib:jdwp` 方式。

```bash
java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=8888 -jar xxx.jar
```

在了解了 `JDWP` 远程调试的使用方式后，笔者为 ShardingSphere 启动脚本添加了如下参数，由于加载系统表逻辑是在启动流程中，因此使用了 `suspend=y` 参数：

```bash
JAVA_OPTS=" -Djava.awt.headless=true -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=8000"
JAVA_MEM_OPTS=" -server -Xmx2g -Xms2g -Xmn1g -Xss1m -XX:AutoBoxCacheMax=4096 -XX:+UseNUMA -XX:+DisableExplicitGC -XX:LargePageSizeInBytes=128m ${VERSION_OPTS} -Dio.netty.leakDetection.level=DISABLED "
MAIN_CLASS=org.apache.shardingsphere.proxy.Bootstrap
nohup java ${JAVA_OPTS} ${JAVA_MEM_OPTS} -classpath ${CLASS_PATH} ${MAIN_CLASS} >> ${STDOUT_FILE} 2>&1 &
```

启动 ShardingSphere 后，我们在 IDEA 中配置远程调试，选择 `Run/Debug Configurations -> Remote JVM Debug`，然后配置被调试程序的 Host 和 Port。

![1648780219](/assets/blog/2022/04/01/1648780219.png)

保存之后，我们使用 IDEA Debug 模式启动程序，可以看到在 ShardingSphere 启动过程中，程序会停在我们设置的断点处。

![1648780577](/assets/blog/2022/04/01/1648780577.png)

## 问题优化

通过 JDWP 远程调试技术，笔者在系统表加载的流程中发现了问题的原因，在 IDEA 中可以正常运行的 `File#listFiles()` 方法，打包之后返回的结果却为 null，这导致系统表元数据为空。

![1648780752](/assets/blog/2022/04/01/1648780752.png)

查阅了一些资料后发现，当源码打成 JAR 包后，由于 JAR 包是一个压缩包，无法直接使用 `File API` 去访问压缩包中的文件，需要使用流进行文件的读写。针对这个问题，笔者对系统表配置读取的逻辑进行了如下调整：

```java
private static Collection<InputStream> getSchemaStreams(final String schemaName, final DatabaseType databaseType) {
    SystemSchemaBuilderRule builderRule = SystemSchemaBuilderRule.valueOf(databaseType.getName(), schemaName);
    Collection<InputStream> result = new LinkedList<>();
    for (String each : builderRule.getTables()) {
      	// 使用 Stream 加载系统表配置文件
        result.add(SystemSchemaBuilder.class.getClassLoader().getResourceAsStream("schema/" + databaseType.getName().toLowerCase() + "/" + schemaName + "/" + each + ".yaml"));
    }
    return result;
}

private static ShardingSphereSchema createSchema(final Collection<InputStream> schemaStreams, final TableMetaDataYamlSwapper swapper) {
    Map<String, TableMetaData> tables = new LinkedHashMap<>(schemaStreams.size(), 1);
    for (InputStream each : schemaStreams) {
        YamlTableMetaData metaData = new Yaml().loadAs(each, YamlTableMetaData.class);
        tables.put(metaData.getName(), swapper.swapToObject(metaData));
    }
    return new ShardingSphereSchema(tables);
}
```

经过调整之后，重新进行了打包测试，问题终于迎刃而解。通过这次问题的调查，笔者深刻认识到功能自测不能只在开发环境中进行测试，更应该考虑实际部署的环境，按照真实场景进行测试，从而充分暴露这些潜在的问题，希望后续的开发工作中能避免类似的问题。

![1648781791](/assets/blog/2022/04/01/1648781791.png)

## 参考文档

* [JDWP 官方文档](https://docs.oracle.com/javase/8/docs/technotes/guides/troubleshoot/introclientissues005.html)

* [IDEA 远程调试 Java 代码指南](https://segmentfault.com/a/1190000023887621)
* [学习 Java 的调试技术](https://www.aneasystone.com/archives/2017/09/java-debugging.html)
* [Java Application Remote Debugging](https://www.baeldung.com/java-application-remote-debugging)
* [SpringBoot 打包为 JAR 包后访问不到 Resources 下的文件问题](https://homxuwang.github.io/2019/12/26/SpringBoot%E6%89%93%E5%8C%85%E4%B8%BAJAR%E5%8C%85%E5%90%8E%E8%AE%BF%E9%97%AE%E4%B8%8D%E5%88%B0Resources%E4%B8%8B%E7%9A%84%E6%96%87%E4%BB%B6%E9%97%AE%E9%A2%98/)



{% quot 欢迎关注 %}

欢迎关注「**端小强的博客**」微信公众号，会不定期分享日常学习和工作经验，欢迎大家关注交流。

![微信公众号](/assets/wechat/gongzhonghao.png)

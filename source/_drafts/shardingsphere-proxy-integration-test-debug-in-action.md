---
title: ShardingSphere Proxy 集成测试代码调试实战
tags: [Java, Remote Debugging, Docker, ShardingSphere]
categories: [In Action]
date: 2022-04-22 10:47:24
cover: https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/386ebad56c264cecbb308f933eb09b7b~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp
---

ShardingSphereProxyContainer:

```java
private void mapConfigurationFiles() {
    String containerPath = "/opt/shardingsphere-proxy/conf";
    withClasspathResourceMapping("/env/common/proxy/conf/", containerPath, BindMode.READ_ONLY);
    withClasspathResourceMapping("/env/scenario/" + scenario + "/proxy/conf/" + databaseType.getName().toLowerCase(), containerPath, BindMode.READ_ONLY);
    withEnv("JAVA_OPTS", "-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=127.0.0.1:3308");
    withCreateContainerCmdModifier(cmd -> {
        cmd.withPortBindings(
                new PortBinding(Ports.Binding.bindPort(3307), new ExposedPort(3307)), 
                new PortBinding(Ports.Binding.bindPort(3308), new ExposedPort(3308)));
    });
}
```



源码地址：https://github.com/strongduanmu/shardingsphere/pull/new/proxy-container-debug



https://u01f1kqxrl.feishu.cn/wiki/wikcnc48Wz7giAKIaajj4vuS6Nh

> 顺道学习下 Docker 网络

报错链接：https://github.com/apache/shardingsphere/runs/6121308876?check_suite_focus=true

## 参考文档

* [How to locally debug containers started by Testcontainers](https://bsideup.github.io/posts/debugging_containers/)
* [Testcontainer-01篇 基本入门](https://blog.csdn.net/mail_liuxing/article/details/99075606)

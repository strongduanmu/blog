---
title: Java AOT 编译框架 GraalVM 快速入门
tags: [JVM, GraalVM]
categories: [GraalVM]
date: 2024-08-05 08:00:00
updated: 2024-08-05 08:00:00
cover: /assets/cover/graalvm.png
banner: /assets/banner/banner_11.jpg
topic: jvm
references:
  - '[GraalVM Documentation](https://www.graalvm.org/jdk21/docs/)'
  - '[GraalVM 与 Java 静态编译：原理与应用](https://yd.qq.com/web/reader/05e320207280c16e05e5bc3)'
  - '[SubstrateVM：AOT 编译框架](https://time.geekbang.org/column/article/41582)'
  - '[云原生时代，Java 的危与机](https://www.infoq.cn/article/rqfww2r2zpyqiolc1wbe)'
---

## GraalVM 诞生的背景

过去 20 多年，Java 通过语言层虚拟化，实现了`平台无关`、`架构中立`等特性，彻底屏蔽了不同操作系统、不同指令集架构带来的差异，因而 Java 语言也取得了巨大的成功。但随着云原生时代的到来，面对相同的问题，云原生选择了操作系统层虚拟化方案，通过容器实现不可变基础设施，将程序连同它的运行环境一起封装到镜像里，已经变成一种主流的应用程序分发方式。

云原生的兴起，同时也促进了微服务、`Serverless` 等技术发展，它们对镜像体积、内存消耗、启动速度，以及达到最高性能的时间等方面提出了新的要求，而这些却是 Java 语言所不擅长的领域。由于 Java 基于 JVM 虚拟机运行，哪怕再小的程序都需要带着完整的虚拟机和标准类库，使得镜像拉取和容器创建的效率降低。此外，Java 语言还存在基础内存开销和冷启动等问题，这些问题限制了 Java 语言在云原生环境下的应用。

为了紧跟云原生时代的发展，GraalVM 应运而生。

TODO

## 结语

TODO

https://github.com/micronaut-projects/micronaut-spring/tree/master/examples/greeting-service

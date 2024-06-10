---
layout: wiki
wiki: mat
order: 002
title: 基础教程
date: 2024-06-10 08:15:27
banner: /assets/banner/banner_9.jpg
---

> 原文链接：https://help.eclipse.org/latest/topic/org.eclipse.mat.ui.help/gettingstarted/basictutorial.html?cp=51_1_0

如果你使用的是安装在 Eclipse 中的内存分析器，而不是独立的内存分析器，请首先使用以下方式打开`内存分析`透视图：`窗口` > `透视图` > `打开透视图` > `其他...` > `内存分析`。

本教程提供了熟悉内存分析器的**起点**。

## 获取堆转储（Heap Dump）

内存分析器可与[堆转储](https://help.eclipse.org/latest/index.jsp?topic=%2Forg.eclipse.mat.ui.help%2Fconcepts%2Fheapdump.html)配合使用。此类堆转储包含有关给定时间点上所有活跃 Java 对象的信息。所有当前 Java 虚拟机都可以写入堆转储，但具体步骤取决于供应商、版本和操作系统。有关详细信息，请参阅[获取堆转储](https://help.eclipse.org/latest/topic/org.eclipse.mat.ui.help/tasks/acquiringheapdump.html)部分。

1. 如果你在 Eclipse 帮助中心内查看此页面，请打开示例堆转储；
2. 使用 Java 6 启动您的应用程序，为了本教程的目的，我们在 Windows 上使用 Java 6 和 JConsole（JDK 版本需要根据 MAT 版本决定）；
3. 启动 `<jre6>/bin/jconsole.exe` 并选择正在运行的应用程序（在本例中为 Eclipse）：

![JConsole 中选择连接 JVM 虚拟机](https://help.eclipse.org/latest/topic/org.eclipse.mat.ui.help/gettingstarted/basictutorial_jconsole_open.png)

4. 从 `com.sun.management.HotSpotDiagnostic` `MBean` 中选择操作 `dumpHeap`。第一个参数 p0 是堆转储文件的完整路径。请确保为其指定文件扩展名 `.hprof`。第二个参数 p1 应保留为 true，因为我们只对活动对象感兴趣；

![选择 HotspotDiagnostics mbean 的 dumpHeap 方法](https://help.eclipse.org/latest/topic/org.eclipse.mat.ui.help/gettingstarted/basictutorial_jconsole_mbean.png)


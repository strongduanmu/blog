---
title: 无关性的基石之 Java 字节码技术初探
tags: [JVM]
categories: [JVM]
date: 2024-07-02 08:31:00
updated: 2024-07-02 08:31:00
cover: /assets/cover/jvm.png
banner: /assets/banner/banner_3.jpg
references:
  - '[Java 虚拟机指令操作码和助记符映射关系](https://strongduanmu.com/blog/opcode-mnemonics-by-opcode.html)'
---

## 前言

熟悉 Java 语言的朋友应该都听过 `Write Once, Run Anywhere.` 这样的口号，它主要阐述地是 Java 语言的跨平台特性。工程师只需要编写一次 Java 源码，再通过 Java 编译器将源码编译为字节码文件，就可以很方便地在不同操作系统的 JVM 上进行分发运行。**Java 字节码技术是 Java 语言实现平台无关性的基石，也是学习 JVM 虚拟机实现的基础**，了解 Java 字节码技术，可以帮助大家理解后续的类加载机制，以及 JVM 编译优化相关的内容。因此，本系列首先从 Java 字节码技术开始，和大家一起初步探究字节码的设计和实现。

## 什么是字节码

字节码即 `Java ByteCode`，它由单个字节（`byte`）的指令组成，理论上最多支持 256 个操作码（`opcode`），实际上 Java 只使用了 200 左右的操作码，还有一些操作码则保留下来，用于调试操作。操作码也可以称为指令，根据指令的特性，可以将字节码分为如下的 4 大类：

1. **栈操作指令**，包括与局部变量交互的指令；
2. **程序流程控制指令**；
3. **对象操作指令**，包括方法调用指令；
4. **算术运算以及类型转换指令**。

除此之外，还有一些用于执行专门任务的指令，例如同步指令、异常指令等，完整的 JVM 指令可以参考 [Java 虚拟机指令操作码和助记符映射关系](https://strongduanmu.com/blog/opcode-mnemonics-by-opcode.html)。

## 结语

TODO

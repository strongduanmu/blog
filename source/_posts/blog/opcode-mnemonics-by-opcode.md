---
title: Java 虚拟机指令操作码和助记符映射关系
tags: [JVM]
categories: [JVM]
date: 2024-06-25 18:50:22
updated: 2024-06-25 18:50:22
cover: /assets/cover/jvm.png
banner: /assets/banner/banner_9.jpg
references:
  - '[Chapter 7. Opcode Mnemonics by Opcode](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-7.html)'
---

## 前言

本文整理了 **Java 虚拟机指令操作码和助记符之间的映射关系**，可以用于日常学习 Java 字节码时快速查阅。需要注意的是，操作码 `186` 对应的 `invokedynamic` 指令是 JDK 7 版本新增的指令，在 JDK 7 之前的版本没有该指令。

## 常量

| 字节码（十进制） | 字节码（十六进制） | 助记符      | 指令含义                                                     |
| ---------------- | ------------------ | ----------- | ------------------------------------------------------------ |
| 00               | 0x00               | nop         |                                                              |
| 01               | 0x01               | aconst_null | 将 null 推至栈顶                                             |
| 02               | 0x02               | iconst_m1   | 将 int 型 -1 推至栈顶                                        |
| 03               | 0x03               | iconst_0    | 将 int 型 0 推至栈顶                                         |
| 04               | 0x04               | iconst_1    | 将 int 型 1 推至栈顶                                         |
| 05               | 0x05               | iconst_2    | 将 int 型 2 推至栈顶                                         |
| 06               | 0x06               | iconst_3    | 将 int 型 3 推至栈顶                                         |
| 07               | 0x07               | iconst_4    | 将 int 型 4 推至栈顶                                         |
| 08               | 0x08               | iconst_5    | 将 int 型 5 推至栈顶                                         |
| 09               | 0x09               | lconst_0    | 将 long 型 0 推至栈顶                                        |
| 10               | 0x0a               | lconst_1    | 将 long 型 1 推至栈顶                                        |
| 11               | 0x0b               | fconst_0    | 将 float 型 0 推至栈顶                                       |
| 12               | 0x0c               | fconst_1    | 将 float 型 1 推至栈顶                                       |
| 13               | 0x0d               | fconst_2    | 将 float 型 2 推至栈顶                                       |
| 14               | 0x0e               | dconst_0    | 将 double 型 0 推至栈顶                                      |
| 15               | 0x0f               | dconst_1    | 将 double 型 1 推至栈顶                                      |
| 16               | 0x10               | bipush      | 将单字节的常量值（-128~127）推至栈顶                         |
| 17               | 0x11               | sipush      | 将一个短整型常量（-32768~32767）推至栈顶                     |
| 18               | 0x12               | ldc         | 将 int, float 或 String 型常量值从常量池中推至栈顶           |
| 19               | 0x13               | ldc_w       | 将 int, float 或 String 型常量值从常量池中推至栈顶（宽索引） |
| 20               | 0x14               | ldc2_w      | 将 long 或 double 型常量值从常量池中推至栈顶（宽索引）       |

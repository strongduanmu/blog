---
title: GraalVM 编译动态链接库之 MySQL UDF 实现
tags: [JVM, GraalVM]
categories: [GraalVM]
date: 2024-09-07 20:00:00
updated: 2024-09-07 20:00:00
cover: /assets/cover/graalvm.png
banner: /assets/banner/banner_7.jpg
topic: jvm
references:
  - '[MySQL 最佳实践——如何使用 C++ 实现 MySQL 用户定义函数](http://mysql.taobao.org/monthly/2019/02/08/)'
  - '[Build a Native Shared Library](https://www.graalvm.org/latest/reference-manual/native-image/guides/build-native-shared-library/)'
  - '[Golang 编写 MySQL UDF](https://mritd.com/2023/05/23/write-mysql-udf-in-golang/)'
  - '[Adding a Loadable Function](https://dev.mysql.com/doc/extending-mysql/8.0/en/adding-loadable-function.html)'
---

## 前言

在之前发布的 [Java AOT 编译框架 GraalVM 快速入门](http://localhost:4000/blog/graalvm-compilation-of-dynamic-link-library-mysql-udf-implementation.html)一文中，我们介绍了 `GraalVM` 编译器的基础知识，对比了 GraalVM 和传统 JVM 之间的优势和劣势，并通过 Demo 示例展示了如何将 JVM 程序编译为原生可执行程序。GraalVM 除了编译出原生可执行程序外，还可以用于编译动态链接库，提供给 `C`、`C++` 等原生语言调用，GraalVM 编译动态链接库的能力大大提升了 Java 和原生语言之间的互操作性。本文将为大家介绍如何使用 GraalVM 编译动态链接库，并使用 C 语言调用动态链接库，从而实现基于 `SM4` 加解密的 `MySQL UDF`。

## GraalVM 动态链接库

参考官方文档 [Build a Native Shared Library](https://www.graalvm.org/latest/reference-manual/native-image/guides/build-native-shared-library/)，GraalVM 编译动态链接库，需要将 `--shared` 参数传递给 `native-image` 工具，默认会将 `main` 方法作为动态链接库的入口点方法，具体的编译命令如下：

```bash
# 指定 class name
native-image <class name> --shared
# 指定 jar 文件
native-image -jar <jarfile> --shared
```

如果类中不包含 `mian` 方法，则需要通过 `-o` 参数指定库名称，并且在 Java 类中通过 `@CEntryPoint` 注解，指定需要导出的入口点方法，使用 `-o` 参数指定库名称的命令如下：

```bash
native-image --shared -o <libraryname> <class name>
native-image --shared -jar <jarfile> -o <libraryname>
```

使用 `@CEntryPoint` 注解导出某个方法为动态链接库，需要满足以下条件：

* 方法必须声明为静态方法；
* 在要导出的方法上，使用 `@CEntryPoint` 注解进行标记；
* 方法参数需要增加额外的 `IsolateThread` 或 `Isolate` 类型参数，该参数用于提供当前线程的执行上下文；
* 方法返回类型只能是 Java 基础类型，以及 `org.graalvm.nativeimage.c.type` 包中的类型；
* 导出方法的名称必须保证唯一，否则 `native-image` 构建将会失败，如果未在 `@CEntryPoint` 注解中通过 `name` 指定名称，则必须在构建时提供 `-o <libraryName>` 选项。

下面展示了动态链接库入口方法示例，通过 `name` 指定了动态链接库函数名为 `function_name`，该函数有 3 个参数：`thread`、`a` 和 `b`，`thread` 用于提供当前线程的执行上下文，`a` 和 `b` 都是基础类型，因此可以直接使用在函数中。函数逻辑比较简单，将入参 a 和 b 的值相加求和，然后返回 int 类型的结果。

```java
@CEntryPoint(name = "function_name")
static int add(IsolateThread thread, int a, int b) {
    return a + b;
}
```

## MySQL UDF



## GraalVM 实现 MySQL UDF 实战



## 结语


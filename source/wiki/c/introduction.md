---
layout: wiki
wiki: c
order: 002
title: C 语言入门
date: 2024-08-09 12:15:27
banner: /assets/banner/banner_2.jpg
---

## 初识 C 语言

1969 年，美国贝尔实验室的肯-汤普森（`Ken Thompson`）与丹尼斯-里奇（`Dennis Ritchie`）一起开发了 Unix 操作系统。Unix 是用`汇编语言`写的，依赖于计算机硬件。为了程序的 `可读性` 和 `可移植性`，他们决定使用高级语言重写。但是，当时的高级语言无法满足他们的要求，汤普森就在 BCPL 语言的基础上发明了 `B 语言`。1972 年，丹尼斯-里奇（`Dennis Ritchie`）在 B 语言的基础上重新设计了一种新语言，这种新语言取代了 B 语言，称为 `C 语言`。1973 年， 整个 Unix 系统都使用 C 语言重写。

此后，这种语言快速流传，广泛用于各种操作系统和系统软件的开 发。如 `UNIX`、`MS-DOS`、`Microsoft Windows` 及 `Linux` 等。1988 年，美国国家标准协会（`ANSI`）正式将 C 语言标准化 ，标志着 C 语言开始稳定和规范化。

## 为什么要学习 C 语言

1. C **语言具有可移植性好、跨平台的特点**，用 C 编写的代码可以在不同的操作系统和硬件平台上编译和运行；

2. C **语言在许多领域应用广泛**；

   - `操作系统`：C 广泛用于开发操作系统，如 `Unix`、`Linux` 和 `Windows`；

   - `嵌入式系统`：C 是一种用于开发嵌入式系统（如微控制器、微处理器和其他电子设备）的流行语言；

   - `系统软件`：C 用于开发设备驱动程序、编译器和汇编器等系统软件；

   - `网络`：C 语言广泛用于开发网络应用程序，例如 `Web` 服务器、 网络协议和网络驱动程序；

   - `数据库系统`：C 用于开发数据库系统，例如 `Oracle`、`MySQL` 和 `PostgreSQL`；

   - `游戏`：由于 C 能够处理低级硬件交互，因此经常用于开发计算机游戏；

   - `人工智能`：C 用于开发人工智能和机器学习应用程序，例如神经网络和深度学习算法；

   - `科学应用`：C 用于开发科学应用程序，例如仿真软件和数值分析工具；

   - `金融应用`：C 用于开发股票市场分析和交易系统等金融应用；

3. C 语言能够直接对硬件进行操作、管理内存、跟操作系统对话，这使得它是一种非常接近底层的语言，非常适合写需要**跟硬件交互、有极高性能要求的程序**；

4. **学习 C 语言有助于快速上手其他编程语言**，比如 C++（原先是 C 语言的一个扩展，在 C 语言的基础上嫁接了面向对象编程）、C#、 Java、PHP、Javascript、Perl 等，这些语言都继承或深受 C 语言的影响和启发；

5. C 语言长盛不衰。至今，**依然是最广泛使用、最流行的编程语言之一**。包括很多大学将 C 语言作为计算机教学的入门语言，拥有庞大 而活跃的用户社区，这意味着有许多资源和库可供开发人员使用。

## C 语言的版本选择

随着微型计算机的日益普及，出现了许多 C 语言版本。

- 版本 1——`K&R C`：

`K&R C` 指的是 C 语言的原始版本。1978 年，C 语言的发明者布莱恩-柯林（Brian Kernighan）和丹尼斯-里奇（Dennis Ritchie）合写了一本著名的教材《C 编程语言》（`The C programming language`）。由于 C 语言还没有成文的语法标准，这本书就成了公认标准，以两位作者的姓氏首字母作为版本简称 `K&R C`。

- 版本 2——`ANSI C`（又称 `C89` 或 `C90`）：

C 语言的原始版本非常简单，对很多情况的描述非常模糊，加上 C 语法依然在快速发展，要求将 C 语言标准化的呼声越来越高。1989 年，美国国家标准协会（ANSI）制定了一套 C 语言标准，并于次年被国际标准化组织（ISO）通过。它被称为 `ANSI C`，也可以按照发布年份，称为 `C89` 或 `C90`。

* 版本 3——`C99`：

C 语言标准的第一次大型修订，发生在 1999 年，增加了许多语言特性，比如双斜杠（`//`）的注释语法，可变长度数组、灵活的数组成 员、复数、内联函数和指定的初始值设定项。这个版本称为 `C99`，是目前最流行的 C 版本。

* 版本 4——`C11`：

2011 年，标准化组织再一次对 C 语言进行修订，增加了`_Generic`、 `static_assert` 和原子类型限定符，这个版本称为 `C11`。

> 需要强调的是，修订标准的原因不是因为原标准不能用，而是需要跟进新的技术。

* 版本 5——`C17`：

`C11` 标准在 2017 年进行了修补，但发布是在 2018 年。新版本只是解决了 `C11` 的一些缺陷，没有引入任何新功能。这个版本称为 `C17`。 

* 版本 6——`C23`：

2023 年预计发布，计划进一步增强安全性，消除实现定义的行为，引入模块化语言概念等新特性，使 C 语言在安全和可靠性方面有重大 提高。

## 第一个 C 语言程序——Hello World

C 语言的源代码文件，以**后缀名** `.c` **结尾**，下面是我们学习的第一个 C 语言程序——Hello World。

```c
// 引入 C 语言标准输入输出头文件
#include <stdio.h>

// C 语言入口 main 函数
int main() {
  	// 通过 printf 输出字符串
    printf("Hello, World!\n");
    return 0;
}
```

我们将它保存在 `HelloWorld.c` 文件中，并使用 `gcc` 编译器进行编译，`-o` 参数指定了输出二进制文件的名称，此外，还可以指定 `-std` 参数指定编译的 C 语言标准：

```bash
gcc -o HelloWorld HelloWorld.c
gcc -std=c99 -o HelloWorld HelloWorld.c
```

编译完成后，我们就得到了一个可执行程序，使用如下的命令执行，可以看到输出了 `Hello, World!`：

```bash
./HelloWorld
Hello, World!
```

## 使用 CLion IDE 开发 C 程序

IDE（`Integrated Development Environment`，集成开发环境）相较于文本开发工具，它可以把代码编写、编译、执行、调试等多种功能综合到一起，有效地提升开发效率。`CLion` 是一款由 JetBrains 推出的跨平台 C/C++ 集成开发环境，它具有智能编辑器、`CMake` 构建支持、调试器、单元测试、代码分析等功能，可以极大提高 C/C++ 开发效率。

下图展示了使用 CLion 创建项目，用户可以选择创建 C 可执行文件，还是 C 库文件，并可以选择对应的 C 语言标准。

![使用 CLion 创建项目](/wiki/c/introduction/create-projection-wtih-clion.png)

创建完成后，项目中自带了一个 `main.c` 文件，直接选择右上角的 Run 或 Debug 按钮，可以执行 C 程序，下方的 Debug 窗口展示了执行结果。

![创建完成的 Clion 项目](/wiki/c/introduction/created_project.png)

为了方便后续 C 语言的学习，我们需要在 `c_lecture` 项目中创建多个子目录，如下图所示，我们创建了 `hello_world` 目录，并将前文练习的 HelloWorld 源码复制过来，可以发现执行出现了报错，这是因为一个 C 程序中只允许存在一个 main 函数。

![项目中包含多个 main 函数](/wiki/c/introduction/multi-main-in-same-project.png)

为了解决这个问题，我们需要安装 `C/C++ Single File Execution` 插件，然后在需要执行的代码中右键选择 `Add executable for single c/cpp file`，此时 `CMakeLists.txt` 文件中多处了一行 `add_executable(HelloWorld hello_world/HelloWorld.c)`，然后我们再右击项目文件夹，选择 `Reload CMake Project` 进行刷新，此时再次执行 HelloWorld 程序，发现可以正常执行。

```cmake
cmake_minimum_required(VERSION 3.28)
project(c_lecture C)

set(CMAKE_C_STANDARD 99)

add_executable(main main.c)
add_executable(HelloWorld hello_world/HelloWorld.c)
```

## C 程序的运行流程

C 程序从编写到执行总共需要 4 个步骤：`编辑`、`编译`、`链接`和`执行`，编辑指的是编写 C 源码，并将源码存储为 `.c` 源文件的过程。编译则是使用编译器，将源码转换为目标程序的过程，如果程序没有任何报错，则会生成一个扩展名为 `.obj` 的二进制文件。由于 C 程序中需要引入其他依赖库，因此链接会将编译好的目标程序，以及其他依赖的程序库链接到一起，形成统一的可执行二进制程序。有了可执行程序，最终我们可以直接在命令行中执行程序。

![C 程序的运行流程](/wiki/c/introduction/c-program-execute-sequence.png)

## C 语言的注释

C 语言中支持两种注释类型：

1. **单行注释**：

```c
// 单行注释
```

2. **多行注释**（**或块注释**）：

```c
/*
这是第一行注释 
这是第二行注释 
这是第三行注释
*/
```




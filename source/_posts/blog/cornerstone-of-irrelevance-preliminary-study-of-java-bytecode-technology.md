---
title: 无关性的基石之 Java 字节码技术初探
tags: [JVM]
categories: [JVM]
date: 2024-07-02 08:31:00
updated: 2024-07-14 07:30:00
cover: /assets/cover/jvm.png
banner: /assets/banner/banner_3.jpg
topic: jvm
references:
  - '[Java 虚拟机指令操作码和助记符映射关系](https://strongduanmu.com/blog/opcode-mnemonics-by-opcode.html)'
  - '[JVM 虚拟机规范（SE7）中文版](https://strongduanmu.com/share/jvm/JVM%20%E8%99%9A%E6%8B%9F%E6%9C%BA%E8%A7%84%E8%8C%83%EF%BC%88SE7%EF%BC%89%E4%B8%AD%E6%96%87%E7%89%88.pdf)'
  - '[Java 代码优化之解读 JVM 字节码)](https://blog.csdn.net/weixin_44950987/article/details/100570710)'
  - '[JVM Bytecode for Dummies (and the Rest of Us Too)](https://www.youtube.com/watch?v=rPyqB1l4gko)'
---

## 前言

熟悉 Java 语言的朋友应该都听过 `Write Once, Run Anywhere.` 这样的口号，它主要阐述地是 Java 语言的跨平台特性。工程师只需要编写一次 Java 源码，再通过 Java 编译器将源码编译为字节码文件，就可以很方便地在不同操作系统的 JVM 上进行分发运行。**Java 字节码技术是 Java 语言实现平台无关性的基石，也是学习 JVM 虚拟机实现的基础**，了解 Java 字节码技术，可以帮助大家理解后续的类加载机制，以及 JVM 编译优化相关的内容。因此，本系列首先从 Java 字节码技术开始，和大家一起初步探究字节码的设计和实现。

## 什么是字节码

字节码即 `Java ByteCode`，它由单个字节（`byte`）的指令组成，理论上最多可以支持 256 个操作码（`opcode`），而实际上 Java 只使用了 200 左右的操作码，还有一些操作码则保留下来，用于调试等操作。操作码通常也称为指令，后面会跟随零至多个参数，即操作数（`operand`）。根据指令的特性，可以将字节码分为如下的 4 大类：

1. **栈操作指令**，包括与局部变量交互的指令；
2. **程序流程控制指令**；
3. **对象操作指令**，包括方法调用指令；
4. **算术运算以及类型转换指令**。

除此之外，还有一些用于执行专门任务的指令，例如**同步指令、异常指令**等，完整的 JVM 指令可以参考 [Java 虚拟机指令操作码和助记符映射关系](https://strongduanmu.com/blog/opcode-mnemonics-by-opcode.html)。

## 如何查看字节码

### 通过 `javap` 命令查看

JDK 工具自带了 `javap` 命令，可以用于查看 class 文件中的字节码，执行 `javap -h` 可以查看该命令详细的使用说明。用户使用 `javap` 命令时，需要在后面指定参数以及 class 字节码文件名，常用的参数有 `-c` 和  `-v` ，`-c` 参数用于对代码进行反编译，可以查看 class 文件中的字节码信息，`-v` 参数则用于打印附加信息，例如：`constant pool` 常量池信息。

```bash
❯ javap -h
Usage: javap <options> <classes>
where possible options include:
  -? -h --help -help               Print this help message # 打印帮助信息
  -version                         Version information # 版本信息
  -v  -verbose                     Print additional information # 打印附加信息，例如：constant pool 常量池信息
  -l                               Print line number and local variable tables # 打印行号和本地变量表
  -public                          Show only public classes and members # 仅显示 public 类和成员
  -protected                       Show protected/public classes and members # 显示 protected/public 类和成员
  -package                         Show package/protected/public classes 
                                   and members (default) # 显示 package/protected/public 类和成员（默认）
  -p  -private                     Show all classes and members # 显示所有类和成员
  -c                               Disassemble the code # 对代码进行反编译
  -s                               Print internal type signatures # 打印内部类型签名
  -sysinfo                         Show system info (path, size, date, MD5 hash) 
                                   of class being processed # 显示系统信息（路径、大小、日期、MD5 哈希值）
  -constants                       Show final constants # 显示 final 常量
  --module <module>, -m <module>   Specify module containing classes to be disassembled
  --module-path <path>             Specify where to find application modules
  --system <jdk>                   Specify where to find system modules
  --class-path <path>              Specify where to find user class files
  -classpath <path>                Specify where to find user class files
  -cp <path>                       Specify where to find user class files
  -bootclasspath <path>            Override location of bootstrap class files
```

我们编写一个如下的简单 `HelloByteCode` 程序作为示例，程序 `main` 方法创建了一个 `HelloByteCode` 对象（源码请参考 [HelloByteCode](https://github.com/strongduanmu/jvm-lecture/blob/b6d9fdb4ed79fc3c77de5e70e75c4f1630a04475/src/main/java/com/strongduanmu/jvm/bytecode/HelloByteCode.java#L3)），并调用了 `sayHello` 方法，输出 `Hello, ByteCode!` 字符串。

```java
public final class HelloByteCode {
    
    public static void main(String[] args) {
        HelloByteCode helloByteCode = new HelloByteCode();
        helloByteCode.sayHello();
    }
    
    private void sayHello() {
        System.out.println("Hello, ByteCode!");
    }
}
```

然后我们使用 `javac` 命令将源码编译为字节码，`-g` 参数用于生成所有 debug 信息，`javac` 命令默认开启了优化功能，会去除字节码中的本地变量表 `LocalVariableTable`。

```bash
javac -g HelloByteCode.java
```

获取到字节码文件后，我们再通过 `javap` 命令查看字节码信息，`-c` 参数用于对代码进行反编译，`-v` 参数则用于打印附加信息。如下展示了完整的字节码信息，大家可以先尝试理解下字节码的含义，在下个小节我们将对字节码进行深入探究。

```bash
❯ javap -c -v HelloByteCode
Warning: File ./HelloByteCode.class does not contain class HelloByteCode
Classfile /Users/duanzhengqiang/IdeaProjects/jvm-lecture/src/main/java/com/strongduanmu/jvm/bytecode/HelloByteCode.class
  Last modified 2024年7月5日; size 736 bytes
  MD5 checksum 591e8e496f42a858607d95d6db85bdd8
  Compiled from "HelloByteCode.java"
public final class com.strongduanmu.jvm.bytecode.HelloByteCode
  minor version: 0
  major version: 55
  flags: (0x0031) ACC_PUBLIC, ACC_FINAL, ACC_SUPER
  this_class: #2                          // com/strongduanmu/jvm/bytecode/HelloByteCode
  super_class: #8                         // java/lang/Object
  interfaces: 0, fields: 0, methods: 3, attributes: 1
Constant pool:
   #1 = Methodref          #8.#24         // java/lang/Object."<init>":()V
   #2 = Class              #25            // com/strongduanmu/jvm/bytecode/HelloByteCode
   #3 = Methodref          #2.#24         // com/strongduanmu/jvm/bytecode/HelloByteCode."<init>":()V
   #4 = Methodref          #2.#26         // com/strongduanmu/jvm/bytecode/HelloByteCode.sayHello:()V
   #5 = Fieldref           #27.#28        // java/lang/System.out:Ljava/io/PrintStream;
   #6 = String             #29            // Hello, ByteCode!
   #7 = Methodref          #30.#31        // java/io/PrintStream.println:(Ljava/lang/String;)V
   #8 = Class              #32            // java/lang/Object
   #9 = Utf8               <init>
  #10 = Utf8               ()V
  #11 = Utf8               Code
  #12 = Utf8               LineNumberTable
  #13 = Utf8               LocalVariableTable
  #14 = Utf8               this
  #15 = Utf8               Lcom/strongduanmu/jvm/bytecode/HelloByteCode;
  #16 = Utf8               main
  #17 = Utf8               ([Ljava/lang/String;)V
  #18 = Utf8               args
  #19 = Utf8               [Ljava/lang/String;
  #20 = Utf8               helloByteCode
  #21 = Utf8               sayHello
  #22 = Utf8               SourceFile
  #23 = Utf8               HelloByteCode.java
  #24 = NameAndType        #9:#10         // "<init>":()V
  #25 = Utf8               com/strongduanmu/jvm/bytecode/HelloByteCode
  #26 = NameAndType        #21:#10        // sayHello:()V
  #27 = Class              #33            // java/lang/System
  #28 = NameAndType        #34:#35        // out:Ljava/io/PrintStream;
  #29 = Utf8               Hello, ByteCode!
  #30 = Class              #36            // java/io/PrintStream
  #31 = NameAndType        #37:#38        // println:(Ljava/lang/String;)V
  #32 = Utf8               java/lang/Object
  #33 = Utf8               java/lang/System
  #34 = Utf8               out
  #35 = Utf8               Ljava/io/PrintStream;
  #36 = Utf8               java/io/PrintStream
  #37 = Utf8               println
  #38 = Utf8               (Ljava/lang/String;)V
{
  public com.strongduanmu.jvm.bytecode.HelloByteCode();
    descriptor: ()V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 3: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   Lcom/strongduanmu/jvm/bytecode/HelloByteCode;

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: (0x0009) ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=2, args_size=1
         0: new           #2                  // class com/strongduanmu/jvm/bytecode/HelloByteCode
         3: dup
         4: invokespecial #3                  // Method "<init>":()V
         7: astore_1
         8: aload_1
         9: invokevirtual #4                  // Method sayHello:()V
        12: return
      LineNumberTable:
        line 6: 0
        line 7: 8
        line 8: 12
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      13     0  args   [Ljava/lang/String;
            8       5     1 helloByteCode   Lcom/strongduanmu/jvm/bytecode/HelloByteCode;
}
SourceFile: "HelloByteCode.java"
```

### 通过 `jclasslib` 查看

除了通过 `javap` 命令查看之外，我们还可以通过 [jclasslib](https://github.com/ingokegel/jclasslib) 可视化查看字节码。`jclasslib` 不仅提供了 Idea 插件，还提供了独立的软件包，大家可以按需选择使用。由于使用方式类似，本文以 Idea 插件的方式展示如何通过 `jclasslib` 查看字节码，首先选中 `HelloByteCode` 源码文件，然后选择 `View -> Show Bytecode With Jclasslib`。

![通过 jclasslib 查看字节码](cornerstone-of-irrelevance-preliminary-study-of-java-bytecode-technology/show-bytecode-with-jclasslib.png)

选择完成后，可以在右侧的 Tab 中查看字节码。此外，`jclasslib` 插件在查看字节码时，可以点击 `Show JVM Spec` 查看 JVM 虚拟机规范，查看相关字节码指令的作用。

![jclasslib 展示的字节码](cornerstone-of-irrelevance-preliminary-study-of-java-bytecode-technology/jclasslib-bytecode-view.png)

## 深入理解字节码

### Classfile

前文介绍了两种查看字节码的方法，想必大家对于字节码中的内容还有诸多疑问。本节我将带领大家逐行分析，一起深入探究字节码的内容，尝试理解字节码的含义与作用。首先，我们来看下字节码中的 `Classfile`，具体内容如下：

```plaintext
Classfile /Users/duanzhengqiang/IdeaProjects/jvm-lecture/src/main/java/com/strongduanmu/jvm/bytecode/HelloByteCode.class
  Last modified 2024年7月5日; size 736 bytes
  MD5 checksum 591e8e496f42a858607d95d6db85bdd8
  Compiled from "HelloByteCode.java"
```

`Classfile` 声明了当前字节码来源的 `class` 文件路径，并在 Classfile 下方显示了 `class` 文件的最近修改时间，MD5 校验值以及编译的来源文件。

### Class 基础信息

```plaintext
public final class com.strongduanmu.jvm.bytecode.HelloByteCode
  minor version: 0
  major version: 55
  flags: (0x0031) ACC_PUBLIC, ACC_FINAL, ACC_SUPER
  this_class: #2                          // com/strongduanmu/jvm/bytecode/HelloByteCode
  super_class: #8                         // java/lang/Object
  interfaces: 0, fields: 0, methods: 3, attributes: 1
```

第二部分 `public final class com.strongduanmu.jvm.bytecode.HelloByteCode` 则展示了 Class 类的版本号区间 `[minor version: 0, major version: 55]`，`major version: 55` 对应了 JDK 11，表示当前 Class 类支持 JDK 11 及以下版本。

`flags` 代表了访问标识符，`0x0031` 是访问标识符值的累加，`ACC_PUBLIC` 表示当前是一个 public 类，`ACC_FINAL` 表示当前是一个 final 类，`ACC_SUPER` 则是 JDK 早期用于标记当前类显式声明的父类，从 JDK 1.1 开始，所有类都必须显式声明它们的父类（即使是 `Object`），因此 `ACC_SUPER` 访问标志实际上总是被设置。更多访问标识符的说明请参考下表：

| 标记名         | 值     | 含义                                                  |
| -------------- | ------ | ----------------------------------------------------- |
| ACC_PUBLIC     | 0x0001 | 可以被包的类外访问。                                  |
| ACC_FINAL      | 0x0010 | 不允许有子类。                                        |
| ACC_SUPER      | 0x0020 | 当用到 invokespecial 指令时，需要特殊处理的父类方法。 |
| ACC_INTERFACE  | 0x0200 | 标识定义的是接口而不是类。                            |
| ACC_ABSTRACT   | 0x0400 | 不能被实例化。                                        |
| ACC_SYNTHETIC  | 0x1000 | 标识并非 Java 源码生成的代码。                        |
| ACC_ANNOTATION | 0x2000 | 标识注解类型。                                        |
| ACC_ENUM       | 0x4000 | 标识枚举类型。                                        |

`this_class` 表示当前 class 类，后面跟随的 `#2` 表示引用常量池中的第二个常量，即注释中显示的 `com/strongduanmu/jvm/bytecode/HelloByteCode`。`super_class` 表示当前 class 类的超类，`#8` 表示常量池中的第八个常量，即 `java/lang/Object`。`interfaces: 0, fields: 0, methods: 3, attributes: 1` 表示当前 class 类中接口、字段、方法和属性的数量。

### 常量池

```plaintext
Constant pool:
   #1 = Methodref          #8.#24         // java/lang/Object."<init>":()V
   #2 = Class              #25            // com/strongduanmu/jvm/bytecode/HelloByteCode
   #3 = Methodref          #2.#24         // com/strongduanmu/jvm/bytecode/HelloByteCode."<init>":()V
   #4 = Methodref          #2.#26         // com/strongduanmu/jvm/bytecode/HelloByteCode.sayHello:()V
   #5 = Fieldref           #27.#28        // java/lang/System.out:Ljava/io/PrintStream;
   #6 = String             #29            // Hello, ByteCode!
   #7 = Methodref          #30.#31        // java/io/PrintStream.println:(Ljava/lang/String;)V
   #8 = Class              #32            // java/lang/Object
   #9 = Utf8               <init>
  #10 = Utf8               ()V
  #11 = Utf8               Code
  #12 = Utf8               LineNumberTable
  #13 = Utf8               LocalVariableTable
  #14 = Utf8               this
  #15 = Utf8               Lcom/strongduanmu/jvm/bytecode/HelloByteCode;
  #16 = Utf8               main
  #17 = Utf8               ([Ljava/lang/String;)V
  #18 = Utf8               args
  #19 = Utf8               [Ljava/lang/String;
  #20 = Utf8               helloByteCode
  #21 = Utf8               sayHello
  #22 = Utf8               SourceFile
  #23 = Utf8               HelloByteCode.java
  #24 = NameAndType        #9:#10         // "<init>":()V
  #25 = Utf8               com/strongduanmu/jvm/bytecode/HelloByteCode
  #26 = NameAndType        #21:#10        // sayHello:()V
  #27 = Class              #33            // java/lang/System
  #28 = NameAndType        #34:#35        // out:Ljava/io/PrintStream;
  #29 = Utf8               Hello, ByteCode!
  #30 = Class              #36            // java/io/PrintStream
  #31 = NameAndType        #37:#38        // println:(Ljava/lang/String;)V
  #32 = Utf8               java/lang/Object
  #33 = Utf8               java/lang/System
  #34 = Utf8               out
  #35 = Utf8               Ljava/io/PrintStream;
  #36 = Utf8               java/io/PrintStream
  #37 = Utf8               println
  #38 = Utf8               (Ljava/lang/String;)V
```

`Constant pool` 表示常量池，其中声明了字节码中需要使用的常量，`#1`、`#2` 等表示常量的编号，字节码中使用常量时，只需要引用相关的编号即可。`Methodref`、`Class`、`Fieldref` 是常量的类型，分别表示方法引用，Class 类以及字段引用，更多常量类型可参考如下常量类型表格。常量中可以通过编号引用其他常量，例如：`#8.#24`，代表了对 `Object` 对象 `init` 方法的引用，字节码注释 `java/lang/Object."<init>":()V` 已经很好地向我们展示了方法引用。

| 常量类型                    | 值   | 含义                                                         |
| --------------------------- | ---- | ------------------------------------------------------------ |
| CONSTANT_Class              | 7    | 类或接口                                                     |
| CONSTANT_Fieldref           | 9    | 字段引用                                                     |
| CONSTANT_Methodref          | 10   | 类方法引用                                                   |
| CONSTANT_InterfaceMethodref | 11   | 接口方法引用                                                 |
| CONSTANT_String             | 8    | `java.lang.String` 类型的常量                                |
| CONSTANT_Integer            | 3    | 4 字节整型常量                                               |
| CONSTANT_Float              | 4    | 4 字节浮点型常量                                             |
| CONSTANT_Long               | 5    | 8 字节长整型常量                                             |
| CONSTANT_Double             | 6    | 8 字节双精度浮点型常量                                       |
| CONSTANT_NameAndType        | 12   | 字段或方法的名称和类型，类型通过字段描述符（例如：`[Ljava/lang/String;`）或方法描述符（例如：`(Ljava/lang/String;)V`）进行表示 |
| CONSTANT_Utf8               | 1    | `UTF-8` 编码表示的字符串常量值                               |
| CONSTANT_MethodHandle       | 15   | 方法句柄                                                     |
| CONSTANT_MethodType         | 16   | 方法类型                                                     |
| CONSTANT_InvokeDynamic      | 18   | `invohecynamic` 动态方法调用                                 |

### 字节码

介绍完常量池后，我们再来关注下最核心的字节码指令，由于本文示例程序中包含了私有方法，因此需要使用 `javap -c -v -p HelloByteCode` 查看包含私有方法在内的所有成员变量和方法。如下展示了字节码信息，可以看到总共包含了 3 个方法——`HelloByteCode` 构造方法、`main` 方法、`sayHello` 方法，下面我们将分别进行探究学习。

```java
{
  public com.strongduanmu.jvm.bytecode.HelloByteCode();
    descriptor: ()V
    flags: (0x0001) ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 3: 0
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       5     0  this   Lcom/strongduanmu/jvm/bytecode/HelloByteCode;

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: (0x0009) ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=2, args_size=1
         0: new           #7                  // class com/strongduanmu/jvm/bytecode/HelloByteCode
         3: dup
         4: invokespecial #9                  // Method "<init>":()V
         7: astore_1
         8: aload_1
         9: invokevirtual #10                 // Method sayHello:()V
        12: return
      LineNumberTable:
        line 6: 0
        line 7: 8
        line 8: 12
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      13     0  args   [Ljava/lang/String;
            8       5     1 helloByteCode   Lcom/strongduanmu/jvm/bytecode/HelloByteCode;

  private void sayHello();
    descriptor: ()V
    flags: (0x0002) ACC_PRIVATE
    Code:
      stack=2, locals=1, args_size=1
         0: getstatic     #13                 // Field java/lang/System.out:Ljava/io/PrintStream;
         3: ldc           #19                 // String Hello, ByteCode!
         5: invokevirtual #21                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         8: return
      LineNumberTable:
        line 11: 0
        line 12: 8
      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0       9     0  this   Lcom/strongduanmu/jvm/bytecode/HelloByteCode;
}
```

#### HelloByteCode 构造方法

```java
public com.strongduanmu.jvm.bytecode.HelloByteCode();
  descriptor: ()V
  flags: (0x0001) ACC_PUBLIC
  Code:
    stack=1, locals=1, args_size=1
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return
    LineNumberTable:
      line 3: 0
    LocalVariableTable:
      Start  Length  Slot  Name   Signature
          0       5     0  this   Lcom/strongduanmu/jvm/bytecode/HelloByteCode;
```

HelloByteCode 构造方法是 Java 编译器默认生成的，了解 Java 的朋友都知道，当我们在程序中没有定义任何构造方法时，Java 编译器会默认生成无参的构造方法。`public com.strongduanmu.jvm.bytecode.HelloByteCode();` 是构造方法的方法声明，HelloByteCode 前面会带上完整的包路径。

`descriptor` 则是方法描述符，`()V` 中 `()` 表示入参，默认构造方法的入参为空，`()` 之后是返回值，由于构造方法没有任何返回值，因此返回值为 `void`，缩写为 `V`。

`flags` 表示访问标识符，`ACC_PUBLIC` 表示该构造方法为 `public` 构造方法，更多访问标识符类型可参考 [Class 基础信息](#class-基础信息)。

`Code` 则对应了具体的代码逻辑，`stack=1, locals=1, args_size=1` 中的 `stack` 表示当前方法执行时最大的栈使用深度，`HelloByteCode` 构造方法栈深度为 1，`locals` 表示本地变量表中槽位的个数，`args_size` 表示方法的参数个数。好奇的同学可能会问——**默认无参构造方法的参数个数为 1？**TODO

![Local Variable 和 Stack 转换关系](cornerstone-of-irrelevance-preliminary-study-of-java-bytecode-technology/local-variable-and-stack-relationship.png)

TODO

#### main 方法

```java
public static void main(java.lang.String[]);
  descriptor: ([Ljava/lang/String;)V
  flags: (0x0009) ACC_PUBLIC, ACC_STATIC
  Code:
    stack=2, locals=2, args_size=1
       0: new           #7                  // class com/strongduanmu/jvm/bytecode/HelloByteCode
       3: dup
       4: invokespecial #9                  // Method "<init>":()V
       7: astore_1
       8: aload_1
       9: invokevirtual #10                 // Method sayHello:()V
      12: return
    LineNumberTable:
      line 6: 0
      line 7: 8
      line 8: 12
    LocalVariableTable:
      Start  Length  Slot  Name   Signature
          0      13     0  args   [Ljava/lang/String;
          8       5     1 helloByteCode   Lcom/strongduanmu/jvm/bytecode/HelloByteCode;
```





#### sayHello 方法

```java
private void sayHello();
  descriptor: ()V
  flags: (0x0002) ACC_PRIVATE
  Code:
    stack=2, locals=1, args_size=1
       0: getstatic     #13                 // Field java/lang/System.out:Ljava/io/PrintStream;
       3: ldc           #19                 // String Hello, ByteCode!
       5: invokevirtual #21                 // Method java/io/PrintStream.println:(Ljava/lang/String;)V
       8: return
    LineNumberTable:
      line 11: 0
      line 12: 8
    LocalVariableTable:
      Start  Length  Slot  Name   Signature
          0       9     0  this   Lcom/strongduanmu/jvm/bytecode/HelloByteCode;
```





### SourceFile

`SourceFile` 内容比较简单，用于声明当前 class 文件的源文件，此处为 `HelloByteCode.java`。

## 字节码执行过程

TODO

## 常用字节码指令

TODO

## 结语

TODO

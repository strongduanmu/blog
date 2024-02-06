---
title: ANTLR 基础入门
tags: [Antlr]
categories: [Antlr]
date: 2021-07-31 08:57:21
cover: /assets/blog/blog/introduction-to-antlr.png
banner: /assets/banner/banner_12.jpg
---

## 什么是 ANTLR

> ANTLR (ANother Tool for Language Recognition) is a powerful parser generator for reading, processing, executing, or translating structured text or binary files. It's widely used to build languages, tools, and frameworks. From a grammar, ANTLR generates a parser that can build and walk parse trees.

根据[官网](https://www.antlr.org/)定义，ANTLR 是一款强大的语法分析器生成工具，可用于`读取`、`处理`、`执行`或者`翻译`结构化文本或二进制文件。ANTLR 根据语法，可以生成对应的语法分析器，并自动构建语法分析树（一种描述语法和输入文本匹配关系的数据结构），通过自动生成的语法分析树的遍历器，用户可以方便地执行自定义的业务逻辑代码。

ANTLR 被广泛应用于学术及工业领域，是众多语言、工具及框架的基石。Hive、ShardingSphere 使用 ANTLR 实现 SQL 的词法和语法解析，Hibernate 框架使用 ANTLR 来处理 HQL 语言。除了这些著名的项目之外，还可以用 ANTLR 来构建各种实用的工具，例如：配置文件读取工具、历史代码转换工具、JSON 解析器等。学习并使用 ANTLR，能够有效地提高我们工作中处理问题的效率，让我们事半功倍。

## 安装 ANTLR

ANTLR 由 Java 语言编写，因此在安装之前需要先安装 Java，ANTLR 运行需要的 Java 版本为 1.6 及以上。安装 ANTLR 非常简单，只需要下载最新的 jar 包——`antlr-4.8-complete.jar`，jar 包提供了两部分功能：

- 一个将语法转换成词法分析器和语法分析器的工具；
- 生成的词法分析器、语法分析器依赖的运行时环境；

通过 ANTLR 工具，能够将用户定义的语法文件转换成可以识别该语法文件所描述语言的程序。

首先下载最新版 jar 包，并将 jar 包加入到`CLASSPATH`环境变量中：

```bash
cd /usr/local/lib
sudo curl -O https://www.antlr.org/download/antlr-4.8-complete.jar
# 设置环境变量，点号代表当前目录
export CLASSPATH=".:/usr/local/lib/antlr-4.8-complete.jar:$CLASSPATH"
```

配置完成后，可以通过如下的两种方式来检查 ANTLR 是否正确安装：

```bash
# 第一种：java -jar直接运行ANTLR的jar包
java -jar /usr/local/lib/antlr-4.8-complete.jar
# 第二种：直接调用org.antlr.v4.Tool类
java org.antlr.v4.Tool
# 得到以下结果代表正确安装
# ANTLR Parser Generator  Version 4.8
#  -o ___              specify output directory where all output is generated
#  -lib ___            specify location of grammars, tokens files
#  -atn                generate rule augmented transition network diagrams
#  -encoding ___       specify grammar file encoding; e.g., euc-jp
#  -message-format ___ specify output style for messages in antlr, gnu, vs2005
#  -long-messages      show exception details when available for errors and warnings
#  -listener           generate parse tree listener (default)
#  -no-listener        don't generate parse tree listener
#  -visitor            generate parse tree visitor
#  -no-visitor         don't generate parse tree visitor (default)
#  -package ___        specify a package/namespace for the generated code
#  -depend             generate file dependencies
#  -D<option>=value    set/override a grammar-level option
#  -Werror             treat warnings as errors
#  -XdbgST             launch StringTemplate visualizer on generated code
#  -XdbgSTWait         wait for STViz to close before continuing
#  -Xforce-atn         use the ATN simulator for all predictions
#  -Xlog               dump lots of logging info to antlr-timestamp.log
#  -Xexact-output-dir  all output goes into -o dir regardless of paths/package
```

为了简化执行命令，可以设置如下别名，以后使用`antlr4`命令即可：

```bash
alias antlr4='java -Xmx500M -cp "/usr/local/lib/antlr-4.8-complete.jar:$CLASSPATH" org.antlr.v4.Tool'
```

按照惯例，让我们首先来编写一个简单的`Hello World`程序来初步认识 ANTLR。首先，需要创建一个语法文件`HelloWorld.g4`，用来描述基本的语法规范，文件内容如下：

```g4
grammar HelloWorld;         // 定义一个名为HelloWorld的语法
r  : 'hello' ID ;           // 定义一个语法规则，匹配一个关键字hello和一个紧随其后的标识符
ID : [a-z]+ ;               // 匹配小写字母组成的标识符
WS : [ \t\r\n]+ -> skip ;   // 忽略空格、Tab、换行以及\r
```

文件开头的`grammar HelloWorld`定义了语法名，ANTLR 中规定语法名必须和文件名保持一致。`r`为语法规则，必须以小写字母开头。`ID`和`WS`为词法规则，必须以大写字母开头。定义好语法文件之后，需要使用前文定义的`antlr4`命令来生成词法分析器和语法分析器：

```bash
# 生成词法分析器和语法分析器
antlr4 HelloWorld.g4
# 查看生成文件
ls -all
# drwxr-xr-x  11 duanmu  staff   352  6  1 23:25 .
# drwx------@ 31 duanmu  staff   992  6  1 23:24 ..
# -rw-r--r--   1 duanmu  staff   321  6  1 23:24 HelloWorld.g4
# -rw-r--r--   1 duanmu  staff   308  6  1 23:25 HelloWorld.interp
# -rw-r--r--   1 duanmu  staff    27  6  1 23:25 HelloWorld.tokens
# -rw-r--r--   1 duanmu  staff  1334  6  1 23:25 HelloWorldBaseListener.java
# -rw-r--r--   1 duanmu  staff  1055  6  1 23:25 HelloWorldLexer.interp
# -rw-r--r--   1 duanmu  staff  3582  6  1 23:25 HelloWorldLexer.java
# -rw-r--r--   1 duanmu  staff    27  6  1 23:25 HelloWorldLexer.tokens
# -rw-r--r--   1 duanmu  staff   571  6  1 23:25 HelloWorldListener.java
# -rw-r--r--   1 duanmu  staff  3899  6  1 23:25 HelloWorldParser.java
```

在 ANTLR 生成的所有文件中，主要作用如下：

- `HelloWorldLexer.java`——该文件包含了一个词法分析器类的定义，ANTLR 通过定义的词法规则，将输入字符序列解析成词汇符号，词法分析器定义如下：

```java
public class HelloWorldLexer extends Lexer { ... }
```

- `HelloWorldParser.java`——该文件包含了一个语法分析器类的定义，语法分析器专门用来识别前文定义的`'hello' ID`语法规则，语法分析器定义如下：

```java
public class HelloWorldParser extends Parser { ... }
```

- `HelloWorld.tokens`——ANTLR 会给我们定义的词法符号指定一个数字形式的类型，然后将他们的对应关系存储到该文件中，通过`tokens`中的内容，ANTLR 可以在多个小型语法间同步全部的词法符号类型，`tokens`内容如下：

```properties
T__0=1
ID=2
WS=3
'hello'=1
```

- `HelloWorldListener.java`——ANTLR 默认会生成语法规则对应的语法分析树，在遍历语法分析树时，会触发一系列事件，并通知`HelloWorldListener`监听器对象。`HelloWorldBaseListener.java`是该接口的默认实现，我们只需要重写感兴趣的回调方法即可，监听器实现如下：

```java
public interface HelloWorldListener extends ParseTreeListener { ... }
```

生成文件之后，需要执行`javac *.java`，将生成的文件进行编译。ANTLR 提供了一个名为`TestRig`的调试工具，可以详细列出匹配输入文本过程中的信息，该工具类似于一个 main 方法，参数中接收一个`语法名`和一个`起始规则名`，前文案例中语法名为`HelloWorld`，起始规则名为`r`。可以为`java org.antlr.v4.gui.TestRig`命令设置别名，方便后面操作：

```bash
alias grun='java org.antlr.v4.gui.TestRig'
```

然后执行以下命令`grun HelloWorld r -tokens`显示识别过程中生成的词法符号：

```bash
# 使用Hello语法和r规则启动TestRig
grun HelloWorld r -tokens
# 输入要识别的语句
hello world
# 输入回车符结束输入（Mac下输入Crtl+D，Win下输入Ctrl+Z）
# [@0,0:4='hello',<'hello'>,1:0]
# [@1,6:10='world',<ID>,1:6]
# [@2,12:11='<EOF>',<EOF>,2:0]
```

每行输出代表一个词法符号，以`world`词法符号为例，输出结果为`[@1,6:10='world',<ID>,1:6]`，`@1`表示第二个词法符号（从 0 开始），由输入文本的第 6 个位置到第 10 个位置的文本组成（从 0 开始），内容是`world`，词法符号类型为`ID`，位于文本的第 1 行（从 1 开始），第 6 个位置处（从 0 开始）。

使用`-gui`参数可以图形化展示出语法分析树：

```bash
grun HelloWorld r -gui
hello world
```

![](/assets/blog/blog/202308110755878.png)

在命令行直接输入`grun`，可以查看其他参数的帮助信息：

```bash
grun
# java org.antlr.v4.gui.TestRig GrammarName startRuleName
#   [-tokens] [-tree] [-gui] [-ps file.ps] [-encoding encodingname]
#   [-trace] [-diagnostics] [-SLL]
#   [input-filename(s)]
# Use startRuleName='tokens' if GrammarName is a lexer grammar.
# Omitting input-filename makes rig read from stdin.

# -tokens 打印出词法符号流
# -tree 以Lisp格式打印语法树
# -gui 可视化方式展示语法树
# -ps file.ps 以PostScript格式生成可视化语法树，然后存储到file.ps中
# -encoding encodingname 指定编码
# -trace 打印规则名称，及离开规则时的词法符号
# -diagnostics 开启解析过程中的调试信息输出
# -SLL 使用功能稍弱的解析策略
```

为了方便操作，可以将前文相关的命令添加到`.bash_profile`文件中，避免重复设置：

```bash
# 设置到~/.bash_profile中
sudo vim ~/.bash_profile
# .bash_profile添加内容
export CLASSPATH=".:/usr/local/lib/antlr-4.8-complete.jar:$CLASSPATH"
alias antlr4='java -Xmx500M -cp "/usr/local/lib/antlr-4.8-complete.jar:$CLASSPATH" org.antlr.v4.Tool'
# 为java TestRig命令设置别名
alias grun='java -Xmx500M -cp "/usr/local/lib/antlr-4.8-complete.jar:$CLASSPATH" org.antlr.v4.gui.TestRig'
```

## 理解 ANTLR 语法分析

### ANTLR 语法分析流程

完成了 ANTLR 安装之后，我们来了解下 ANTLR 中的语法分析流程。ANTLR 的语法分析流程和我们大脑阅读文章的过程类似，在阅读一个句子前，我们会通过潜意识将单个字符聚集成单词，然后获取每个单词的含义，再理解整个句子的含义。

ANTLR 语法分析可以分为两个阶段：

- 第一个阶段为词法分析阶段，将字符聚集为单词或者符号（词法符号`token`）的过程称为词法分析（`lexical analysis`），通常把可以将输入文本转换为词法符号的程序称为词法分析器（`lexer`），词法分析器可以将相关的词法符号归类，例如：INT（整数）、ID（标识符）、FLOAT（浮点数）等；
- 第二个阶段为语法分析阶段，输入的词法符号被消费来识别语法结构，ANTLR 生成的语法分析器会构建一个语法分析树（`parse tree`）数据结构，该数据结构记录了语法分析器识别出输入语句的过程，以及该结构的各组成部分；

以赋值语句`sp = 100;`为例，ANTLR 会根据如下的语法规则生成词法分析器和语法分析器：

```g4
assign : ID '=' expr ';' ;
```

整个语法分析的过程如下：

![](/assets/blog/blog/202308110756627.png)

首先，输入的字符串`sp = 100;`，经过词法分析器`lexer`可以转换为多个词法符号，再经过语法分析器`parser`，生成对应的语法分析树。语法分析树的内部节点是词组名（对应语法规则中的`assign`和`expr`），这些名字用于识别它们的子节点，并将子节点归类。根节点是一个抽象的名字，此处为`stat`（statement 的缩写），叶子节点对应输入的词法符号。

ANTLR 工具根据前文定义的 assign 语法规则，会生成一个递归下降的语法分析器（`recursive-descent parsers`）。递归下降的语法分析器实际是若干递归方法的集合，每个方法对应一条规则，下降的过程就是从语法分析树的根节点开始，朝着叶子节点（词法符号）进行解析的过程。

ANTLR 根据 assign 规则生成的的方法大致实现如下：

```java
// assign : ID '=' expr ';' ;
void assign() { // 根据assign规则生成的方法
    match(ID);  // 将当前输入的符号和ID比较，然后将其消费掉
    match('=');
    expr();     // 通过调用expr()方法来匹配一个表达式
    match(';');
}
```

`assign()`方法主要验证词汇符号是否存在，以及是否满足语法规定的顺序。调用`match()`方法则对应语法分析树的叶子节点。通过`stat()`、`assign()`和`expr()`的调用描述出的调用路线图可以很好地映射到语法分析树的节点上。

在 ANTLR 中，assign 语法规则对应的语法分析树，可以映射成如下类型：

![](/assets/blog/blog/202308110756615.png)

左图中`stat`、`assign`、`expr`代表的是规则节点（`RuleNode`），对应 ANTLR 语法定义中的规则名称，`sp`、`100`对应的是终端节点（`TerminalNode`），即词法符号。

右图中的`StatContext`、`AssignContext`、`ExprContext`为 RuleNode 的子类，代表该节点的上下文信息，包括词法符号及其开始和结束位置等，同时提供了访问该节点中全部元素的方法，例如：`AssignContext`类提供了方法`ID()`和方法`expr()`来访问标识符节点和代表表达式的子树。TerminalNode 则代表叶子结点信息，没有子节点。

我们可以手动编写出访问语法分析树的代码，来访问 Context 和 TerminalNode 中存储的信息，从而实现`结果计算`、`数据结构更新`、`打印输出`等功能。但实际上，ANTLR 已经自动生成了语法分析树的遍历器，可以直接供我们使用，下面我们就来了解下 ANTLR 提供的两种遍历树的机制。

### ANTLR 语法树遍历

ANTLR 的运行库提供了两种遍历树的机制——`语法分析树监听器`和`语法分析树访问器`。ANTLR 默认会生成语法分析树监听器，内置的`ParseTreeWalker`类会进行深度优先遍历（如下图所示），遍历树的不同节点时，会触发不同的事件，语法分析树监听器会对不同的事件作出相应的处理。

![](/assets/blog/blog/202308110757919.png)

ANTLR 默认为每个语法文件生成了一个 ParseTreeListener 的子类，语法中的每条规则都有对应的`enter`和`exit`方法，用户可以自行实现 ParseTreeListener 接口，来实现自己的业务逻辑。ParseTreeWalker 类对 ParseTreeListener 接口完整的调用流程如下图：

![](/assets/blog/blog/202308110757402.png)

监听器机制的优势在于对语法分析树的遍历是自动的，用户无需编写遍历语法分析树的代码，也无需让监听器显示地访问子节点。

如果用户希望控制遍历语法分析树的过程，想要显示地访问子节点，那么可以使用语法分析树访问器。前文 HelloWorld 入门案例中，添加`-visitor`参数，即可生成对应的语法分析树访问器：

```bash
antlr4 HelloWorld.g4 -visitor
```

通常，语法分析树访问器对树的遍历过程如下：

![](/assets/blog/blog/202308110757456.png)

ANTLR 默认会提供访问器接口及一个默认实现类，用户只需要实现自己感兴趣的方法即可。

## ANTLR 入门实战

前文我们介绍了 ANTLR 的语法分析过程，了解了语法分析树遍历的两种机制——`监听器`和`访问器`分别是如何运行的。下面我们将通过一个简单的案例——简版计算器，来演示实战中如何使用访问器实现具体的功能，监听器使用大家可以自行参考官方文档或文末的参考书籍进行尝试。

为了方便实现，我们要实现的简版计算器功能，暂时只支持基本的`整数加减乘除`。下面的示例包含了计算器功能的全部特性：

```text
193
a = 5
b = 6
a + b * 2
(1 + 2) * 3
```

根据示例，我们可以抽取出一些计算器语法规则的特征——计算器中的表达式语言由一系列的语句组成，每个语句都由换行符终止。一个语句可以是一个表达式，也可以是一个赋值语句或一个空行。

根据语法规则特征，我们可以编写出如下的语法规则：

```g4
grammar Calculator;
// 引入Literals词法规则
import Literals;

// 起始规则
prog
    : stat+
    ;

stat
    : CLEAR NEWLINE             # clear
    | NEWLINE                   # blank
    | expr NEWLINE              # printExpr
    | ID '=' expr NEWLINE       # assign
    ;

expr
    : expr op=('*'|'/') expr    # mulDiv
    | expr op=('+'|'-') expr    # addSub
    | INT                       # int
    | ID                        # id
    | '(' expr ')'              # parens
    ;
```

`Calculator`语法规则中定义`prog`为起始规则，包含了一个或多个子规则`stat+`，`expr`语法规则中定义了加减乘除运算规则以及括号运算。`stat`和`expr`语法规则中使用`|`来分隔若干备选分支，由于 ANTLR 默认只会为每个规则生成一个方法，不方便对每个备选分支进行操作，因此需要给每个备选分支加上标签，标签以`#`开头，可以是任意符号，但是不能与规则名冲突，加上标签后，就可以方便地获取每个备选分支对应的事件。

语法中使用圆括号`()`可以把一些符合组合成子规则，例如：`op=('*'|'/')`，其中`op`为词法符号标签，`('*'|'/')`为乘法或除法组合的子规则。

`Calculator`语法规则中使用了`import`语法导入，语法导入适合用于将非常大的语法拆分成较小的逻辑单元，通常是将语法拆分成两部分：`语法分析器语法`和`词法分析器语法`。通常，语法分析器语法定义使用`grammar`进行声明，而词法分析器语法定义则使用`lexer grammar`声明。`Calculator`语法规则中导入的词法分析器`Literals`如下，定义了计算器程序中所需的整数、ID、换行符、加减乘除符号等词法符号：

```g4
lexer grammar Literals;
import Alphabet;

// 清除中间变量
CLEAR
    : C L E A R
    ;

// 整数词法符号
INT
    : [0-9]+
    ;

// ID词法符号
ID
    : [a-zA-Z]+
    ;

// 换行符
NEWLINE
    : '\r'? '\n'
    ;

// 忽略空白符
WS
    : [ \t\r\n]+ -> skip
    ;

// 乘法
MUL
    : '*'
    ;

// 除法
DIV
    : '/'
    ;

// 加法
ADD
    : '+'
    ;

// 减法
SUB
    : '-'
    ;
```

区别于前文直接使用命令行的方式，本例中会使用 IDEA 进行计算器程序开发，首先需要在 IDEA 中安装`ANTLR v4`插件，该插件可以快速地对语法规则进行解析，生成语法分析树。

![](/assets/blog/blog/202308110758553.png)

以前文的语法规则为例，我们使用`ANTLR v4`插件进行语法解析，例如：选中语法规则`stat`，然后右击，选择`Test Rule stat`，出现`ANTLR Preview`界面，输入`a = 5`，右侧能够实时显示出对应的语法分析树，语法调试非常方便。

![](/assets/blog/blog/202308110758311.png)

其次，我们需要在项目中引入[antlr4-maven-plugin](https://www.antlr.org/api/maven-plugin/latest/index.html)插件，该插件规定了语法规则文件的路径，默认路径如下：

```text
src/main/
    |
    +--- antlr4/... .g4 files organized in the required package structure
            |
            +--- imports/  .g4 files that are imported by other grammars.
```

引入该插件只需要在`maven`中添加如下插件，`libDirectory`指定需要语法导入的规则所在的路径，`listener`和`visitor`分别对应是否生成语法分析树监听器和访问器：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.antlr</groupId>
            <artifactId>antlr4-maven-plugin</artifactId>
            <executions>
                <execution>
                    <id>antlr</id>
                    <configuration>
                        <libDirectory>src/main/antlr4/imports/</libDirectory>
                        <listener>false</listener>
                        <visitor>true</visitor>
                    </configuration>
                    <goals>
                        <goal>antlr4</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

安装好插件后，执行`mvn package`会自动生成语法分析树访问器，生成的代码位于`target/generated-sources`目录下：

![](/assets/blog/blog/202308110758590.png)

下面，我们需要编写一个计算器表达式解析程序的访问器，由于返回的结果为只包含整数，因此泛型可以声明为`Integer`，访问器代码实现如下：

```java
/**
 * Desc: Calculator 访问器
 * Date: 2020/7/4
 *
 * @author duanzhengqiang
 */
public class CalculatorEvalVisitor extends CalculatorBaseVisitor<Integer> {

    /**
     * 计算器程序中间变量存储
     */
    private final Map<String, Integer> calculatorMemory = new HashMap<>();

    /**
     * 解析 expr NEWLINE 规则
     *
     * @param ctx
     * @return
     */
    @Override
    public Integer visitPrintExpr(CalculatorParser.PrintExprContext ctx) {
        // 解析expr子节点的值
        Integer value = visit(ctx.expr());
        // 打印结果并返回一个假值
        System.out.println(value);
        return 0;
    }

    /**
     * 解析 ID '=' expr NEWLINE 规则
     *
     * @param ctx
     * @return
     */
    @Override
    public Integer visitAssign(CalculatorParser.AssignContext ctx) {
        String id = ctx.ID().getText();
        // 解析expr子节点的值
        Integer value = visit(ctx.expr());
        calculatorMemory.put(id, value);
        return 0;
    }

    /**
     * 解析 NEWLINE
     *
     * @param ctx
     * @return
     */
    @Override
    public Integer visitBlank(CalculatorParser.BlankContext ctx) {
        System.out.println();
        return 0;
    }

    /**
     * 解析 CLEAR
     *
     * @param ctx
     * @return
     */
    @Override
    public Integer visitClear(CalculatorParser.ClearContext ctx) {
        calculatorMemory.clear();
        System.out.println("clear success!");
        return 0;
    }

    /**
     * 解析 expr ('*'|'/') expr 规则
     *
     * @param ctx
     * @return
     */
    @Override
    public Integer visitMulDiv(CalculatorParser.MulDivContext ctx) {
        Integer leftValue = visit(ctx.expr(0));
        Integer rightValue = visit(ctx.expr(1));
        // 判断操作符控制乘除法
        if (ctx.op.getType() == CalculatorParser.MUL) {
            return leftValue * rightValue;
        }
        return leftValue / rightValue;
    }

    /**
     * 解析 expr op=('+'|'-') expr 规则
     *
     * @param ctx
     * @return
     */
    @Override
    public Integer visitAddSub(CalculatorParser.AddSubContext ctx) {
        Integer leftValue = visit(ctx.expr(0));
        Integer rightValue = visit(ctx.expr(1));
        // 判断操作符控制加减法
        if (ctx.op.getType() == CalculatorParser.ADD) {
            return leftValue + rightValue;
        }
        return leftValue - rightValue;
    }

    /**
     * 解析 INT
     *
     * @param ctx
     * @return
     */
    @Override
    public Integer visitInt(CalculatorParser.IntContext ctx) {
        return Integer.parseInt(ctx.INT().getText());
    }

    /**
     * 解析 ID
     *
     * @param ctx
     * @return
     */
    @Override
    public Integer visitId(CalculatorParser.IdContext ctx) {
        // 获取中间存储的变量
        String id = ctx.ID().getText();
        return calculatorMemory.getOrDefault(id, 0);
    }

    /**
     * 解析 '(' expr ')' 规则
     *
     * @param ctx
     * @return
     */
    @Override
    public Integer visitParens(CalculatorParser.ParensContext ctx) {
        // 返回子表达式的值
        return visit(ctx.expr());
    }
}
```

对于赋值语句（`ID '=' expr NEWLINE`），会将解析结果存储到计算器的内存中，当用户输入对应的变量名时（`ID`），会从内存中获取该值，如果用户输入`CLEAR`，则会清空内存中存储的值。对于乘除法，由于位于语法规则的最左边，处理时优先执行，根据词法符号标签`op`的类型，执行相应的乘法或除法操作，加减法解析与乘除法则类似。

最后，我们需要编写一个测试程序，来验证计算器程序是否正常运行。我们从`calculator_test.txt`文件中读取一些常见的计算操作，然后转换为字符流输入到词法解析器中，词法解析器负责将字符流拆分为词法符号，并且存储到`tokenStream`中，最后语法解析器会将词法符号解析成语法分析树。语法分析器访问器`CalculatorEvalVisitor`对语法分析树进行解析，返回对应的结果。

```java
/**
 * Desc: 计算器程序测试类
 * Date: 2020/7/4
 *
 * @author duanzhengqiang
 */
public class CalculatorTest {

    @Test
    public void testCalculatorVisitor() throws IOException {
        InputStream inputStream = CalculatorTest.class.getClassLoader().getResourceAsStream("calculator_test.txt");
        // 字符流
        CharStream charStream = CharStreams.fromStream(Objects.requireNonNull(inputStream));
        // 词法分析器拆分词法符号
        CalculatorLexer lexer = new CalculatorLexer(charStream);
        // 词法符号存储到tokenStream中
        CommonTokenStream commonTokenStream = new CommonTokenStream(lexer);
        // 语法解析器接受词法符号，构建AST
        CalculatorParser parser = new CalculatorParser(commonTokenStream);
        // 语法解析
        ParseTree parseTree = parser.prog();
        // 创建语法树访问器执行计算器逻辑
        CalculatorEvalVisitor visitor = new CalculatorEvalVisitor();
        visitor.visit(parseTree);
    }
}
```

执行测试程序，根据文本中输入的表达式，可以计算得到如下结果：

```text
# 输入文本
193
a = 5
b = 6
a + b * 2
(1 + 2) * 3
b = 9
(a * b) / (a + 1)
CLEAR
a
b
# 输出结果
193
17
9
7
clear success!
0
0
```

本案例源码参考 Github 仓库中的[antlr-learn/calculator](https://github.com/strongduanmu/antlr-learn.git)。ANTLR 的功能非常强大，上面的示例只是一个入门的应用，大家如果对 ANTLR 感兴趣，欢迎参与 ShardingSphere 项目的 SQL 解析，在实战中加深对 ANTLR 的理解。

## 参考文档

- [ANTLR4 权威指南（dtba）](https://pan.baidu.com/s/131vpkh5jxyq9CBG86HhQTA)
- [Getting Started with ANTLR v4](https://github.com/antlr/antlr4/blob/master/doc/getting-started.md)

---
title: Apache Calcite Catalog 拾遗之 UDF 函数实现和扩展
tags: [Calcite]
categories: [Calcite]
date: 2024-09-23 08:00:00
updated: 2024-10-02 08:00:00
cover: /assets/cover/calcite.jpg
references:
  - '[Apache Calcite——新增动态 UDF 支持](https://blog.csdn.net/it_dx/article/details/117948590)'
  - '[Calcite 官方文档中文版-适配器-可扩展性](https://strongduanmu.com/wiki/calcite/adapters.html#%E5%8F%AF%E6%89%A9%E5%B1%95%E6%80%A7)'
  - '[如何在 Calcite 注册函数](https://zhuanlan.zhihu.com/p/65472726)'
  - '[Calcite 的初步使用——Calcite 添加自定义函数](https://articles.zsxq.com/id_sl3habfw53xv.html)'
banner: /assets/banner/banner_9.jpg
topic: calcite
---

> 注意：本文基于 [Calcite main 分支 99a0df1](https://github.com/apache/calcite/commit/99a0df108a9f72805afb6d87ec5b2c0ed258f1ec) 版本源码进行学习研究，其他版本可能会存在实现逻辑差异，对源码感兴趣的读者**请注意版本选择**。

## 前言

最近，很多星友咨询关于 `Calcite UDF` 实现和扩展的问题，在之前 [Apache Calcite System Catalog 实现探究](https://strongduanmu.com/blog/explore-apache-calcite-system-catalog-implementation.html)一文中，我们简单介绍过 `Catalog` 中的 `Function` 对象，也了解到 Calcite 内置了很多函数实现，但在实际使用中内置函数往往无法满足要求，用户需要能够根据自己的需求，灵活地注册新的函数。Caclite 允许用户动态注册 UDF 函数，从而实现更加复杂的 SQL 逻辑，下面本文将深入探讨 Calcite 内置函数的实现原理，UDF 函数的实现原理以及扩展方式，帮助大家更好地在项目中使用 Calcite UDF。

## Calcite 函数简介

在日常开发、数据分析工作中，我们除了会使用常用的 SQL 语句外，还会经常用到函数来实现一些特殊功能，函数功能的强弱直接会影响我们的开发效率。Calcite 作为当前流行的计算引擎，对函数功能也有较好的支持，它内置了不同数据库的上百种常用函数，可以直接调用执行。此外，Calcite 也提供了 UDF 自定义函数能力，用户可以通过 Schema 注册 UDF，从而实现更灵活地 SQL 运算逻辑。

在了解 UDF 函数实现和扩展前，我们先来了解下 Calcite 函数的基本概念。Calcite 对函数的定义是：**接受参数并返回结果的命名表达式**，函数一般通过 Schema 进行注册，然后使用 `Schema#getFunctions` 获取函数，获取函数时会根据参数类型进行过滤。下面是 Schema 中 `Function` 接口声明：

```java
public interface Function {
    List<FunctionParameter> getParameters();
}
```

Function 接口提供了 `getParameters` 获取函数参数的方法，它包含了 `ScalarFunction`、`AggregateFunction`、`TableFunction` 和 `TableMarco` 等几个主要的子接口。ScalarFunction 对应标量函数，也就是函数返回的结果为一个标量，AggregateFunction 对应聚合函数，会将多个值聚合计算为一个标量返回。

TableFunction 和 TableMacro 都对应了表函数，会返回一个表，他们的区别是 TableMacro 会在编译期间进行调用，编译期展开表达式允许 Calcite 实现更加强大的查询优化，例如我们可以对视图在编译期进行展开。相比于 TableMacro，TableFunction 则需要在执行阶段才能知道表的结果。

下图展示了 Function 的继承体系，Function 接口的 4 个子接口 `ScalarFunction`、`AggregateFunction`、`TableFunction` 和 `TableMarco`，他们都有对应的 `Impl` 实现类，实现类中定义了很多函数处理相关的方法，下面小节我们将分别对这几类函数的内部实现进行探究。

![Calcite Function 继承体系](apache-calcite-catalog-udf-function-implementation-and-extension/calcite-function-inherit-class.png)

## 内置函数实现探究

### 标量函数

标量函数（`ScalarFunction`）是指**将输入数据转换为输出数据的函数，通常用于对单个字段值进行计算和转换**。例如：`ABS(num)` 函数，它负责将每行输入的 `num` 字段值转换为绝对值再输出。

下图展示了标量函数在 Schema 对象中的继承体系，核心的实现逻辑在 `ScalarFunctionImpl` 类中，它实现了 `ScalarFunction` 和 `ImplementableFunction` 接口，并继承了 `ReflectiveFunctionBase` 抽象类，下面我们分别来介绍下这些接口和类的作用。

![标量函数继承体系](apache-calcite-catalog-udf-function-implementation-and-extension/scalar-function-inherit-class.png)

* ScalarFunction 接口：

`ScalarFunction` 接口继承了 `Function` 接口，并在接口中声明了 `getReturnType` 方法，用于表示标量函数返回值的类型。

```java
/**
 * Function that returns a scalar result.
 */
public interface ScalarFunction extends Function {
    /**
     * Returns the return type of this function, constructed using the given
     * type factory.
     *
     * @param typeFactory Type factory
     */
    RelDataType getReturnType(RelDataTypeFactory typeFactory);
}
```

* ImplementableFunction 接口：

`ImplementableFunction` 接口用于声明该函数可以转换为 Java 代码进行执行，接口中提供了 `getImplementor` 方法，可以返回一个函数实现器 `CallImplementor`。

```java
/**
 * Function that can be translated to java code.
 *
 * @see ScalarFunction
 * @see TableFunction
 */
public interface ImplementableFunction extends Function {
    /**
     * Returns implementor that translates the function to linq4j expression.
     *
     * @return implementor that translates the function to linq4j expression.
     */
    CallImplementor getImplementor();
}
```

`CallImplementor` 接口中声明了 `implement` 方法，可以将函数转换为 `linq4j` 表达式，用于函数逻辑的调用（`linq4j` 参考了 `.NET` 中的 `LINQ（Language-Integrated Query）` 功能，可以实现类似于 SQL 的声明式语法，后续我们专门写一篇文章介绍 `linq4j`）。

```java
public interface CallImplementor {
    /**
     * Implements a call.
     *
     * @param translator Translator for the call
     * @param call Call that should be implemented
     * @param nullAs The desired mode of {@code null} translation
     * @return Translated call
     */
    Expression implement(RexToLixTranslator translator, RexCall call, RexImpTable.NullAs nullAs);
}
```

* ReflectiveFunctionBase 抽象类：

`ReflectiveFunctionBase` 抽象类用于处理基于方法实现的函数，负责将方法参数映射为 `List<FunctionParameter>`。在初始化 ReflectiveFunctionBase 时，会传入函数逻辑对应的 `Method` 对象，`ParameterListBuilder` 类会根据 method 对象构造 `List<FunctionParameter>`。

```java
/**
 * Creates a ReflectiveFunctionBase.
 *
 * @param method Method that is used to get type information from
 */
protected ReflectiveFunctionBase(Method method) {
    this.method = method;
    this.parameters = builder().addMethodParameters(method).build();
}
```

`ParameterListBuilder` 类的核心逻辑为 `addMethodParameters` 方法，内部会遍历方法参数，通过 ReflectUtil 工具类获取参数名称（优先从 Parameter 注解中获取名称，无注解则使用参数名）和参数是否可选（优先从 Parameter 注解中获取是否可选，无注解则为 false），然后将 `type`、`name` 和 `optional` 参数传入 `add` 方法，用于创建 FunctionParameter 对象。

```java
public ParameterListBuilder addMethodParameters(Method method) {
    final Class<?>[] types = method.getParameterTypes();
    for (int i = 0; i < types.length; i++) {
        add(types[i], ReflectUtil.getParameterName(method, i), ReflectUtil.isParameterOptional(method, i));
    }
    return this;
}
```

`add` 方法实现逻辑如下，主要将传入的 `type` 参数通过 `typeFactory` 构建为 `RelDataType` 类型，将 `name` 和 `optional` 封装到对应的 `FunctionParameter` 接口方法中。此外，还根据参数的个数生成了 `ordinal` 序号，并封装到 `getOrdinal` 方法中。

```java
public ParameterListBuilder add(final Class<?> type, final String name, final boolean optional) {
    final int ordinal = builder.size();
    builder.add(new FunctionParameter() {
        @Override
        public String toString() {
            return ordinal + ": " + name + " " + type.getSimpleName() + (optional ? "?" : "");
        }
        
        // 基于 0 的参数序号
        @Override
        public int getOrdinal() {
            return ordinal;
        }
        
        // 参数名称
        @Override
        public String getName() {
            return name;
        }
        
        // 参数类型
        @Override
        public RelDataType getType(RelDataTypeFactory typeFactory) {
            return typeFactory.createJavaType(type);
        }
        
        // 参数是否可选，可选参数可以在函数调用时省略
        @Override
        public boolean isOptional() {
            return optional;
        }
    });
    return this;
}
```

除了 FunctionParameter 构建逻辑外，ReflectiveFunctionBase 还提供了 `classHasPublicZeroArgsConstructor` 和 `classHasPublicFunctionContextConstructor` 方法，用于判断函数逻辑类是否提供了无关构造方法，以及包含 `FunctionContext`（提供函数调用的相关信息，可以使函数在构造期间提前执行，无需每次调用执行，具体可以参考 [FunctionContext](https://github.com/apache/calcite/blob/b2e9e6cba1e2ce28368d1281f527a9e53f4628ca/core/src/main/java/org/apache/calcite/schema/FunctionContext.java#L24-L85)）的构造方法，这些构造方法会在函数初始化时进行调用，不包含可能会抛出异常。

* ScalarFunctionImpl 类：

`ScalarFunctionImpl` 类实现了 ScalarFunction 和 ImplementableFunction 接口中的相关方法，内部方法通过调用如下的私有构造方法进行初始化。如下展示了 ScalarFunctionImpl 了的构造方法，首先会调用 `super(method)` 初始化函数参数 `List<FunctionParameter>`，然后将函数实现器 CallImplementor 存储在成员变量中。 

```java
/**
 * Private constructor.
 */
private ScalarFunctionImpl(Method method, CallImplementor implementor) {
    super(method);
    this.implementor = implementor;
}
```

ScalarFunctionImpl 核心的创建逻辑是由公共的 `create` 方法触发的，外部调用将函数方法 Method 对象传递给 `create` 方法。方法内部会先判断 Method 是否为静态方法，非静态方法如果没有无参构造方法，或者没有包含 FunctionContext 的构造方法，则会抛出异常。

如果检查通过，则根据 Method 对象创建 CallImplementor 函数实现器，然后调用私有的 ScalarFunctionImpl 构造方法，将 Method 对象和 CallImplementor 函数实现器传递给构造方法。

```java
public static ScalarFunction create(Method method) {
    if (!isStatic(method)) {
        Class<?> clazz = method.getDeclaringClass();
        if (!classHasPublicZeroArgsConstructor(clazz) && !classHasPublicFunctionContextConstructor(clazz)) {
            throw RESOURCE.requireDefaultConstructor(clazz.getName()).ex();
        }
    }
    CallImplementor implementor = createImplementor(method);
    return new ScalarFunctionImpl(method, implementor);
}
```

创建 CallImplementor 函数实现器的逻辑如下，首先会调用 `getNullPolicy` 方法，返回 `NullPolicy` 枚举类型用于描述函数（或运算符）何时返回 NULL。

```java
private static CallImplementor createImplementor(final Method method) {
    final NullPolicy nullPolicy = getNullPolicy(method);
    return RexImpTable.createImplementor(new ReflectiveCallNotNullImplementor(method), nullPolicy, false);
}
```

`NullPolicy` 枚举类包含了 `ALL`、`STRICT`、`SEMI_STRICT`、`ANY`、`ARG0` 和 `NONE`。`ALL` 表示只有所有的参数为 NULL，函数结果采返回 NULL。`STRICT` 表示只有一个参数为 NULL 使，函数结果返回 NULL。`SEMI_STRICT` 表示有 1 个或多个参数为 NULL 时，函数结果返回 NULL。`ANY` 表示只要有任意一个参数为 NULL，则函数结果返回 NULL，`ANY` 和 `STRICT` 比较类似，Caclite 更推荐使用 `STRICT` 类型。`ARG0` 表示第一个参数为 NULL 时，函数结果返回 NULL。`NONE` 表示不指定 NULL 策略，由函数逻辑进行处理。

这些枚举类型中，`STRICT`、`SEMI_STRICT` 比较常用，Calcite 分别为他们提供了 `Strict` 和 `SemiStrict` 注解，可以标注在函数方法或类上，用来声明 NULL 值策略。

```java
public enum NullPolicy {
    /**
     * Returns null if and only if all of the arguments are null;
     * If all of the arguments are false return false otherwise true.
     */
    ALL,
    /**
     * Returns null if and only if one of the arguments are null.
     */
    STRICT,
    /**
     * Returns null if one of the arguments is null, and possibly other times.
     */
    SEMI_STRICT,
    /**
     * If any of the arguments are null, return null.
     */
    ANY,
    /**
     * If the first argument is null, return null.
     */
    ARG0, NONE
}
```

获取到 NullPolicy 后，调用 `RexImpTable.createImplementor()` 方法创建函数实现器，由于函数实现器中的 `implement` 方法在执行阶段才会调用，我们将在后面的 ScalarFunction 案例中进行详细介绍。

### 聚合函数

聚合函数（`AggregateFunction`）是指**将多个值组合转换为标量值输出的函数**。例如：`SUM(num)` 函数，它负责将每行输入的 `num` 字段值进行累加，最终输出累加总和。Calcite 聚合函数内部包含了一个累加的过程，通过聚合函数内部的 `init` 方法进行初始化，并创建一个累加器，然后通过 `add` 方法将当前行的值添加到累加器中进行计算，使用 `merge` 方法可以将两个累加器合二为一，最后计算完成通过 `result` 方法返回结果。

下图展示了聚合函数在 Schema 对象中的继承体系，核心的实现逻辑在 `AggregateFunctionImpl` 类中，它实现了 `AggregateFunction` 和 `ImplementableAggFunction` 接口，下面我们分别来介绍下这些接口和类的作用。

![聚合函数继承体系](apache-calcite-catalog-udf-function-implementation-and-extension/aggregate-function-inherit-class.png)

* AggregateFunction 接口：

`AggregateFunction` 接口继承了 `Function` 接口，并在接口中声明了 `getReturnType` 方法，用于表示聚合函数返回值的类型。

```java
/**
 * Function that combines several values into a scalar result.
 */
public interface AggregateFunction extends Function {
    /**
     * Returns the return type of this function, constructed using the given
     * type factory.
     *
     * @param typeFactory Type factory
     */
    RelDataType getReturnType(RelDataTypeFactory typeFactory);
}
```

* ImplementableAggFunction 接口：

`ImplementableAggFunction` 接口用于声明该函数可以转换为 Java 代码进行执行，接口中提供了 `getImplementor` 方法，可以返回一个聚合函数实现器 `AggImplementor`，`windowContext` 用于标记当前聚合函数是否包含在窗口运算中。

```java
public interface ImplementableAggFunction extends AggregateFunction {
    /**
     * Returns implementor that translates the function to linq4j expression.
     *
     * @param windowContext true when aggregate is used in window context
     * @return implementor that translates the function to linq4j expression.
     */
    AggImplementor getImplementor(boolean windowContext);
}
```

`AggImplementor` 接口可以实现聚合函数所需的初始化、累加以及获取结果方法，如下展示了 `AggImplementor` 接口中的方法，`getStateType` 方法可以返回聚合函数实现时，中间变量的类型，例如：字符串连接函数，它的中间变量类型可以是 StringBuilder。`implementReset`、`implementAdd` 和 `implementResult` 分别对应了聚合函数的初始化、累加和获取结果方法，AggImplementor 接口的实现类，会根据不同的聚合函数类型实现其逻辑。

```java
public interface AggImplementor {
    
    // 返回聚合函数实现时，中间变量的类型
    // 例如：字符串连接函数，它的中间变量类型可以是 StringBuilder
    List<Type> getStateType(AggContext info);
    
    // 将中间变量重置为初识状态
    // 应使用 AggResetContext.accumulator() 来引用状态变量
    void implementReset(AggContext info, AggResetContext reset);
    
    // 将新增加的当前值，累加到中间变量
    void implementAdd(AggContext info, AggAddContext add);
    
    // 根据中间变量计算结果值
    Expression implementResult(AggContext info, AggResultContext result);
}
```

* AggregateFunctionImpl 类：

`AggregateFunctionImpl` 类实现了 `AggregateFunction` 和 `ImplementableAggFunction` 接口，通过私有的构造方法进行初始化，构造方法如下，`declaringClass` 表示聚合函数对应的实现类，`params` 表示聚合函数的参数，`valueTypes` 表示聚合函数参数的类型，`accumulatorType` 表示聚合器的类型，`resultType` 表示函数结果类型。

`initMethod`、`addMethod`、`mergeMethod` 和 `resultMethod` 分别表示聚合函数初始化方法、累加方法、合并方法和结果方法，`isStatic` 表示 `initMethod` 是否为静态方法。

```java
private AggregateFunctionImpl(Class<?> declaringClass, List<FunctionParameter> params, List<Class<?>> valueTypes, Class<?> accumulatorType, Class<?> resultType, Method initMethod, Method addMethod, @Nullable Method mergeMethod, @Nullable Method resultMethod) {
    this.declaringClass = declaringClass;
    this.valueTypes = ImmutableList.copyOf(valueTypes);
    this.parameters = params;
    this.accumulatorType = accumulatorType;
    this.resultType = resultType;
    this.initMethod = requireNonNull(initMethod, "initMethod");
    this.addMethod = requireNonNull(addMethod, "addMethod");
    this.mergeMethod = mergeMethod;
    this.resultMethod = resultMethod;
    this.isStatic = isStatic(initMethod);
    assert resultMethod != null || accumulatorType == resultType;
}
```

由于 AggregateFunctionImpl 构造方法是私有的，通常 Calcite 内部都是通过 `create` 方法来创建 AggregateFunctionImpl 对象。

TODO

```java
// 聚合函数累加器
struct Accumulator {
    final int sum;
}

// 聚合函数初始化方法
Accumulator init() {
    return new Accumulator(0);
}

// 聚合函数累加方法
Accumulator add(Accumulator a, int x) {
    return new Accumulator(a.sum + x);
}

// 聚合函数合并方法
Accumulator merge(Accumulator a, Accumulator a2) {
    return new Accumulator(a.sum + a2.sum);
}

// 聚合函数获取结果方法
int result(Accumulator a) {
    return a.sum;
}
```





TODO

### 表函数 & 表宏

表函数（`TableFunction`）是指**在执行阶段将某些数据转换为表的函数**，表宏（`TableMacro`）是指**在编译阶段将某些数据转换为表的函数**。表函数或者表宏，通常会使用在 FROM 子句中，作为一张表进行使用，例如：`SELECT * FROM XML_EXTRACT("/opt/csv/test.csv")`，`XML_EXTRACT` 就是一个表函数，它负责从 `test.csv` 文件中获取数据，并返回一张表。

下图展示了表函数和表宏在 Schema 对象中的继承体系，表函数的核心实现逻辑在 `TableFunctionImpl` 类中，它实现了 `ImplementableFunction` 和 `TableFunction` 接口，并继承了 `ReflectiveFunctionBase` 抽象类。表宏的核心实现逻辑在 `TableMarcoImpl` 类中，它实现了 `TableMarco` 接口，并继承了 `ReflectiveFunctionBase` 抽象类，下面我们分别来介绍下这些接口和类的作用。

![表函数 & 表宏继承体系](apache-calcite-catalog-udf-function-implementation-and-extension/table-function-marco-inherit-class.png)





TODO

### 函数执行流程

我们以 CoreQuidemTest（https://github.com/julianhyde/quidem） 为例，看看 `functions.iq` 中的函数是如何执行的。

TODO

## UDF 函数扩展实践

### UDF 标量函数扩展

TODO

探索 UDF 注册 Oracle 无括号函数支持

### UDAF 聚合函数扩展

TODO

### UDTF 表函数 & 表宏扩展

TODO

## 结语

Schema 中有 Function 接口，用于注册不同类型的函数

SqlFunction 继承 SqlOperator

SqlFunctionCategory 函数分类枚举
SqlBasicFunction SqlUnresolvedFunction
RexImpTable——注册 operator（包含函数，通过注解 @LibraryOperator 标记当前函数属于哪个方言）和 method（BuiltInMethod）对应关系，BuiltInMethod 中定义了对 SqlFunctions 等函数实现类的调用
SqlLibraryOperators 用于定义非标准运算和函数，由 SqlLibraryOperatorTableFactory 调用读取到 SqlOperatorTable 中
SqlStdOperatorTable 实现标准运算和函数

普通函数 SqlFunctions 函数实现逻辑
空间函数 SpatialTypeFunctions
JSON 函数 JsonFunctions

和 UDF 相关的 Jira：https://issues.apache.org/jira/browse/CALCITE-6363?jql=project%20%3D%20CALCITE%20AND%20resolution%20%3D%20Unresolved%20AND%20text%20~%20%22UDF%22%20ORDER%20BY%20created%20DESC%2C%20updated%20DESC%2C%20priority%20ASC

改动 UDF 函数重载逻辑：https://issues.apache.org/jira/browse/CALCITE-3000?jql=project%20%3D%20CALCITE%20AND%20resolution%20%3D%20Unresolved%20AND%20text%20~%20%22UDF%22%20ORDER%20BY%20priority%20DESC%2C%20updated%20DESC

UDF Test：calcite/core/src/test/java/org/apache/calcite/test/UdfTest.java at master · apache/calcite

PI 函数带不带括号的讨论：https://issues.apache.org/jira/browse/CALCITE-6566?page=com.atlassian.jira.plugin.system.issuetabpanels%3Aall-tabpanel

关于函数参数的讨论：https://mail.google.com/mail/u/0/#inbox/FMfcgzQXJGsbkVFdDsKlrjSHbGTVxflZ

CoreQuidemTest（各种测试语句）：https://github.com/apache/calcite/tree/99a0df108a9f72805afb6d87ec5b2c0ed258f1ec/core/src/test/resources/sql







TODO



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

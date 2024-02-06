---
title: Java8 新特性实战
tags: [Java8]
categories: [Java]
date: 2020-01-12 09:00:00
cover: /assets/blog/2022/02/10/1644493506.jpg
banner: china
---

## 前言

Java8 是 Oracle 公司在 2014 年 3 ⽉发布的版本，是 Java5 之后最重要的版本，带来了诸多⽅⾯的新特性，包括语⾔、类库、编译器及 JVM 等新特性。本⽂重点介绍 Java8 中语法相关的新特性，主要包括 `Lambda 表达式`、`Stream API`、`New Date API`、`Optional` 等。

![1644542238](/assets/blog/2022/02/11/1644542238.png)

## Lambda 表达式

### 什么是 Lambda

> Lambda expression is a new feature which is introduced in Java 8. A lambda expression is `an anonymous function`. A function that doesn’t have a name and doesn’t belong to any class. The concept of lambda expression was first introduced in LISP programming language.

Lambda 这个概念最早起源于 LISP 语言，Java8 中引入了这个特性，Lambda 表达式本质上是一个匿名函数，这个函数没有名称并且不属于任何类。

### 为什么需要 Lambda

在 Java8 之前的版本中，如果我们需要实现 `行为参数化`，必须将特定的行为包装在某个类中，然后将对象传递给具体方法进行执行。使用匿名内部类的实现如下：

```java
ExecutorService executorService = Executors.newFixedThreadPool(2);

executorService.execute(new Runnable() {
    @Override
    public void run() {
        System.out.println("查询材料库存数！");
    }
});
executorService.execute(new Runnable() {
    @Override
    public void run() {
        System.out.println("查询材料门店销量！");
    }
});
```

这种方式写出的代码十分冗长，实际我们想要执行的其实就是 run 方法中的功能，Java8 提供了 Lambda 表达式来解决这个问题，经过 Lambda 表达式改造的代码清晰简洁：

```java
ExecutorService executorService = Executors.newFixedThreadPool(2);

executorService.execute(() -> System.out.println("查询材料库存数！"));
executorService.execute(() -> System.out.println("查询材料门店销量！"));
```

### 如何使用 Lambda

Lambda 表达式由参数、箭头和主体组成。Lambda 的基本语法如下，有两种基本形式：

```java
// 单行语句
(parameters) -> expression
executorService.execute(() -> System.out.println("查询材料库存数！"));

// 多行语句
(parameters) -> { statements; }
executorService.execute(() -> {
    System.out.println("查询材料门店销量！");
    System.out.println("查询材料门店销量！");
});
```

{% image /assets/blog/2022/02/11/1644543745.png width:500px padding:20px bg:white %}

- 参数列表：`函数式接口` 中的抽象方法对应的参数列表，前文例子中函数式接口为 Runnable 接口，抽象方法为 run 方法，为空参数方法；
- 箭头：Lambda 表达式的标志符号，用来分隔参数列表和 Lambda 主体；
- Lambda 主体：功能代码块，多行需要使用 `花括号 {}`；

那么究竟在哪里可以使用 Lambda 表达式——在函数式接口上使用 Lambda 表达式，前文示例中的 Runnable 接口就是一个函数式接口。

```java
@FunctionalInterface
public interface Runnable {
    /**
     * When an object implementing interface <code>Runnable</code> is used
     * to create a thread, starting the thread causes the object's
     * <code>run</code> method to be called in that separately executing
     * thread.
     * <p>
     * The general contract of the method <code>run</code> is that it may
     * take any action whatsoever.
     *
     * @see     java.lang.Thread#run()
     */
    public abstract void run();
}
```

### 函数式接⼝

那么什么是函数式接口呢？简单来说，就是 `只定义了一个抽象方法的接口`。Lambda 表达式允许直接以内联的方式为函数式接口的抽象方法提供实现，并把整个表达式作为函数式接口的实例。

在 Java8 中，提供了 `@FunctionalInterface` 注解来专门表示函数式接口，该注解不是必须的，但是添加了该注解编译器会进行语法检查，保证接口中只能包含一个抽象方法。

观察下如下接口是否符合函数式接口的定义？

```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}

@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}

@FunctionalInterface
public interface Comparator<T> {

    int compare(T o1, T o2);

    boolean equals(Object obj);

    default Comparator<T> reversed() {
        return Collections.reverseOrder(this);
    }
    ...
    public static <T extends Comparable<? super T>> Comparator<T> reverseOrder() {
        return Collections.reverseOrder();
    }
    ...
}
```

为什么 Comparator 接口也是函数式接口？可以参考 FunctionalInterface 注解的 javadoc：

> If an interface declares an abstract method overriding one of the public methods of java.lang.Object, that also does not count toward the interface's abstract method count since any implementation of the interface will have an implementation from java.lang.Object or elsewhere.
>
> Note that instances of functional interfaces can be created with lambda expressions, method references, or constructor references.

如果一个接口中定义了一个抽象方法——重写 Object 基类中的公有方法，那么这个抽象方法不会被算入接口抽象方法的计数中，因为任何一个这个接口的实现类本来就会通过继承 Object 基类来实现该方法。

Java8 新增了 `java.util.function` 包，在 function 包中引入了一些常用的函数式接口：

<style type="text/css">
.tg  {border-collapse:collapse;border-color:#ccc;border-spacing:0;}
.tg td{background-color:#fff;border-color:#ccc;border-style:solid;border-width:1px;color:#333;
  font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg th{background-color:#f0f0f0;border-color:#ccc;border-style:solid;border-width:1px;color:#333;
  font-family:Arial, sans-serif;font-size:14px;font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg .tg-baqh{text-align:center;vertical-align:top}
.tg .tg-0lax{text-align:left;vertical-align:top}
</style>
<table class="tg">
<thead>
  <tr>
    <th class="tg-baqh">函数式接口</th>
    <th class="tg-baqh">函数描述符</th>
    <th class="tg-baqh">原始类型特化</th>
    <th class="tg-baqh">说明</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-0lax">Predicate&lt;T&gt;</td>
    <td class="tg-0lax">T -&gt; boolean</td>
    <td class="tg-0lax">IntPredicate, LongPredicate, DoublePredicate</td>
    <td class="tg-0lax">断言型接口</td>
  </tr>
  <tr>
    <td class="tg-0lax">Consumer&lt;T&gt;</td>
    <td class="tg-0lax">T -&gt; void</td>
    <td class="tg-0lax">IntConsumer, LongConsumer, DoubleConsumer</td>
    <td class="tg-0lax">消费型接口</td>
  </tr>
  <tr>
    <td class="tg-0lax">Function&lt;T, R&gt;</td>
    <td class="tg-0lax">T -&gt; R</td>
    <td class="tg-0lax">IntFunction&lt;R&gt;, IntToDoubleFunction, IntToLongFunction, LongFunction&lt;R&gt;, LongToDoubleFunction, LongToIntFunction, DoubleFunction&lt;R&gt;, ToIntFunction&lt;T&gt;, ToDoubleFunction&lt;T&gt;, ToLongFunction&lt;T&gt;</td>
    <td class="tg-0lax">函数型接口</td>
  </tr>
  <tr>
    <td class="tg-0lax">Supplier&lt;T&gt;</td>
    <td class="tg-0lax">() -&gt; T</td>
    <td class="tg-0lax">BooleanSupplier, IntSupplier, LongSupplier, DoubleSupplier</td>
    <td class="tg-0lax">供给型接口</td>
  </tr>
  <tr>
    <td class="tg-0lax">UnaryOperator&lt;T&gt;</td>
    <td class="tg-0lax">T -&gt; T</td>
    <td class="tg-0lax">IntUnaryOperator, LongUnaryOperator, DoubleUnaryOperator</td>
    <td class="tg-0lax">一元操作型接口</td>
  </tr>
  <tr>
    <td class="tg-0lax">BinaryOperator&lt;T&gt;</td>
    <td class="tg-0lax">(T, T) -&gt; T</td>
    <td class="tg-0lax">IntBinaryOperator, LongBinaryOperator, DoubleBinaryOperator</td>
    <td class="tg-0lax">二元操作型接口</td>
  </tr>
  <tr>
    <td class="tg-0lax">BiPredicate&lt;L, R&gt;</td>
    <td class="tg-0lax">(L, R) -&gt; boolean</td>
    <td class="tg-0lax"></td>
    <td class="tg-0lax">二元断言型接口</td>
  </tr>
  <tr>
    <td class="tg-0lax">BiConsumer&lt;T, U&gt;</td>
    <td class="tg-0lax">(T, U) -&gt; void</td>
    <td class="tg-0lax">ObjIntConsumer&lt;T&gt;, ObjLongConsumer&lt;T&gt;, ObjDoubleConsumer&lt;T&gt;</td>
    <td class="tg-0lax">二元消费型接口</td>
  </tr>
  <tr>
    <td class="tg-0lax">BiFunction&lt;T, U, R&gt;</td>
    <td class="tg-0lax">(T, U) -&gt; R</td>
    <td class="tg-0lax">ToIntBiFunction&lt;T, U&gt;, ToLongBiFunction&lt;T, U&gt;, ToDoubleBiFunction&lt;T, U&gt;</td>
    <td class="tg-0lax">二元函数型接口</td>
  </tr>
</tbody>
</table>

- `Predicate<T>`：断言型接口，抽象方法为 `boolean test(T t)`，传入一个参数，返回一个布尔值。

```java
// 断言型接口
Predicate<Integer> predicate = t -> t.equals(30);
System.out.println(predicate.test(35));

// 断言型接口原始类型特化
IntPredicate intPredicate = t -> t > 30;
System.out.println(intPredicate.test(25));
```

- `Consumer<T>`：消费型接口，抽象方法为 `void accept(T t)`，传入一个参数，没有返回值。

```java
// 消费型接口
// Consumer<String> consumer = t -> System.out.println(t);
Consumer<String> consumer = System.out::println;
consumer.accept("张三");
```

- `Function<T,R>`：函数型接口，抽象方法为 `R apply(T t)`，传入一个参数，返回另一个值。

```java
// 函数型接口
// Function<Integer, String> function = (t) -> String.valueOf(t);
Function<Integer, String> function = String::valueOf;
System.out.println(function.apply(2020));
```

- `Supplier<T>`：供给型接口，抽象方法为 `T get()`，不传入参数，返回一个结果。

```java
// 生产型接口
Supplier<String> supplier = () -> "2020年世界和平！";
System.out.println(supplier.get());
```

- `UnaryOperator<T>`：一元操作型接口，继承自 `Function<T, T>`接口，传入一个参数，返回该参数。

```java
// 一元操作型接口
// UnaryOperator<String> unaryOperator = t -> t.toUpperCase();
UnaryOperator<Integer> unaryOperator = t -> t + 1;
System.out.println(unaryOperator.apply(99));
```

### ⽅法引⽤&构造⽅法引⽤

方法引用是特殊场景下 Lambda 表达式的一种简洁写法。如果某个方法刚好满足了 Lambda 表达式的形式，那么就可以用方法引用来表示 Lambda 表达式。

方法引用&构造方法引用有四类：

- `类名::静态方法名`——在 lambda 表达式中，调用了某个类的静态方法；
- `对象::实例方法名`——在 lambda 表达式中，调用了某个外部对象的实例方法；
- `类名::实例方法名`——在 lambda 表达式中，调用了 lambda 参数列表中的对象实例方法；
- `类名::new`——在 lambda 表达式中，调用了构造方法创建对象；

```java
List<String> nums = Lists.newArrayList("-11", "111", "23", "14", "6", "18");

// 类名::静态方法名，在 lambda 表达式中，调用了某个类的静态方法
// nums.sort(Comparator.comparing(num -> Integer.valueOf(num)));
nums.sort(Comparator.comparing(Integer::valueOf));
System.out.println("--类名::静态方法名--" + nums);

// 对象::实例方法名，在 lambda 表达式中，调用了某个外部对象的实例方法
// Supplier<Integer> supplier = () -> nums.size();
Supplier<Integer> supplier = nums::size;
System.out.println(supplier.get());

// 类名::实例方法名，在 lambda 表达式中，调用了 lambda 参数列表中的对象实例方法
// nums.sort(Comparator.comparing(num -> num.length()));
nums.sort(Comparator.comparing(String::length));
System.out.println("--类名::实例方法名--" + nums);

// 类名::new，在 lambda 表达式中，调用了构造方法创建对象
/*
Function<String, BigInteger> function = new Function<String, BigInteger>() {
    @Override
    public BigInteger apply(String s) {
        return new BigInteger(s);
    }
};
*/
Function<String, BigInteger> function = BigInteger::new;
System.out.println(function.apply("12345678901234567890"));
```

## Stream API

### 什么是 Stream

Stream API 是对集合功能的增强，借助于 Lambda 表达式，能够极大地提高编程效率和程序可读性。Stream 处理集合数据时，将要处理的元素看做一种流，流在管道中传输，并且可以在管道的节点上处理，包括筛选、去重、排序、聚合等。元素流在管道中经过中间操作的处理，最后由结束操作得到处理结果。

使用 Stream API 具有以下优势：

- 提升性能——Stream 会记录下过程操作、并对这些操作进行叠加，最后在一个迭代循环中执行所有叠加的操作，减少迭代次数；
- 代码简洁——函数式编程风格的代码简洁、意图明确；
- 多核友好——只需调用 parallel()方法，即可实现并行程序，简化编码；

使用 Stram API 前的编码风格：

```java
List<Staff> staffs = Lists.newArrayList(Staff.builder().name("james").age(35).build(), Staff.builder().name("wade").age(37).build(),
        Staff.builder().name("kobe").age(41).build(), Staff.builder().name("rose").age(31).build());
List<Staff> results = Lists.newArrayList();
// 筛选出年龄大于35岁的员工
for (Staff staff : staffs) {
    if (staff.getAge() <= 35) {
        continue;
    }
    results.add(staff);
}
System.out.println(results);
```

使用 Stram API 后的编码风格：

```java
List<Staff> staffs = Lists.newArrayList(Staff.builder().name("james").age(35).build(), Staff.builder().name("wade").age(37).build(),
        Staff.builder().name("kobe").age(41).build(), Staff.builder().name("rose").age(31).build());
// 使用 Stream API 进行筛选
List<Staff> streamResults = staffs.stream().filter(staff -> staff.getAge() > 35).collect(Collectors.toList());
System.out.println(streamResults);
```

### 如何创建 Stream

通常创建 Stream 都是调用集合（Collection）类中的 stream()方法或者 parallelStream()方法，可以对应生成串行流和并行流。

```java
// 从 List 创建 Stream
Lists.newArrayList(123, 11, 323, 2).stream().map(num -> num * 2).forEach(System.out::println);
// 直接从 Stream 创建
Stream.of(123, 11, 323, 2).map(num -> num * 2).forEach(System.out::println);
```

也可以使用 IntStream、LongStream、DoubleStream 从基本类型创建 Stream，基本类型创建的 Stream 支持一些特殊的结束操作——sum()、average()、max()。

```java
// 通过 IntStream 直接创建
System.out.println(IntStream.of(123, 11, 323, 2).max().orElse(-1));
```

Stream 和 IntStream、LongStream、DoubleStream 之间可以相互装换：

```java
// 从 Stream 转换成 IntStream
Stream.of("123", "11", "323", "2").mapToInt(Integer::parseInt).average().ifPresent(System.out::println);
// 从 IntStream 转换成 Stream
IntStream.of(123, 11, 323, 2).mapToObj(num -> "f6" + num).forEach(System.out::println);
```

### 常⽤ Stream 操作

Stream 操作具有如下特点：

- Stream 操作不会修改原始的数据；
- 操作无状态，不依赖外部变量，在 Stream 操作内部引用外部非 final 变量会报错（外部变量默认 final，修改之后会报错）；
- Stream 中记录中间操作，并对这些操作进行叠加，最后在一个迭代循环中执行所有叠加的操作，生成结果；

根据 Stream 操作的执行阶段，可以分为两类：

- `中间操作`：总是会惰式执行，调用中间操作只会生成一个标记了该操作的新 Stream，中间操作的结果仍然是 Stream，可以继续使用 Stream API 连续调用。中间操作又可以分为 `有状态操作` 和 `无状态操作`，有状态操作是指该操作只有拿到所有元素之后才能继续执行，而无状态操作则不受之前元素的影响；
- `结束操作`：会触发实际计算，计算发生时会把所有中间操作以 pipeline 的方式执行，这样可以减少迭代次数。结束操作的结果通常是一个非 Stream 结果，计算完成之后 Stream 就会失效（`只能遍历一次`）；

常用的 Stream 操作如下图：

<style type="text/css">
.tg  {border-collapse:collapse;border-color:#ccc;border-spacing:0;}
.tg td{background-color:#fff;border-color:#ccc;border-style:solid;border-width:1px;color:#333;
  font-family:Arial, sans-serif;font-size:14px;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg th{background-color:#f0f0f0;border-color:#ccc;border-style:solid;border-width:1px;color:#333;
  font-family:Arial, sans-serif;font-size:14px;font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg .tg-baqh{text-align:center;vertical-align:top}
.tg .tg-0lax{text-align:left;vertical-align:top}
</style>
<table class="tg">
<thead>
  <tr>
    <th class="tg-baqh" colspan="3">Stream 操作分类</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-baqh" rowspan="2">中间操作</td>
    <td class="tg-baqh">无状态</td>
    <td class="tg-0lax">unordered(), filter(), map(), mapToInt(), mapToLong(), mapToDobule(), flatMap(), flatMapToInt(), flatMapToLong(), flatMapToDobule(), peek()</td>
  </tr>
  <tr>
    <td class="tg-baqh">有状态</td>
    <td class="tg-0lax">distinct(), sorted(), limit(), skip()</td>
  </tr>
  <tr>
    <td class="tg-baqh" rowspan="2">结束操作</td>
    <td class="tg-baqh">非短路操作</td>
    <td class="tg-0lax">forEach(), forEachOrdered(), toArray(), reduce(), collect(), max(), min(), count()</td>
  </tr>
  <tr>
    <td class="tg-baqh">短路操作</td>
    <td class="tg-0lax">anyMatch(), allMatch(), noneMatch(), findFirst(), findAny()</td>
  </tr>
</tbody>
</table>

#### 常⽤的中间操作

- filter——根据 Predicate 条件，过滤出符合条件的元素：

```java
// Stream<T> filter(Predicate<? super T> predicate)

// 过滤绝对值开根号大于15的数字
Lists.newArrayList(112, 131, 323, 234, 730, 177, -226, 434)
        .stream().filter(num -> Math.sqrt(Math.abs(num)) > 15).forEach(System.out::println);
```

- sorted——对集合中的元素进行排序：

```java
// Stream<T> sorted(Comparator<? super T> comparator)

// 字符串装换成数字排序
List<String> nums = Lists.newArrayList("112", "131", "323", "234", "730", "177", "-226", "434");
nums.stream().sorted(Comparator.comparingInt(Integer::parseInt)).forEach(System.out::println);
```

- map——对集合中的每个元素按照 mapper 操作进行转换，转换前后 Stream 中元素的个数不会改变，但元素的类型取决于转换之后的类型：

```java
// Stream<R> map(Function<? super T,? extends R> mapper)

// map操作：对集合中的每个元素按照 mapper 操作进行转换
Lists.newArrayList("a1", "a2", "a3", "a4", "a5").stream().map(String::toUpperCase).forEach(System.out::println);
```

- flatMap——map 方法只能把一个对象转换成另一个对象，如果需要将一个对象转换成多个，需要使用 flatMap：

```java
// Stream<R> flatMap(Function<? super T,? extends Stream<? extends R>> mapper)

// flatMap 操作：找出所有员工的兴趣爱好
List<Staff> staffs = Lists.newArrayList(Staff.builder().name("张三").age(18).hobbies(Lists.newArrayList("篮球", "足球", "围棋")).build(),
        Staff.builder().name("李四").age(27).hobbies(Lists.newArrayList("书法", "围棋", "乒乓球")).build(),
        Staff.builder().name("王五").age(33).hobbies(Lists.newArrayList("品茶", "读书", "篮球")).build());
Set<String> hobbies = staffs.stream().map(Staff::getHobbies).flatMap(Collection::stream).collect(Collectors.toSet());
System.out.println(hobbies);
```

#### 常用的结束操作

- forEach——对每一个元素的执行指定的 action 操作：

```java
// void forEach(Consumer<? super T> action)

// forEach 操作：对每一个元素的执行指定的 action 操作
Lists.newArrayList(112, 131, 323, 234, 730, 177, -226, 434).forEach(System.out::println);
```

- collect——collect 方法接收一个 Collector 参数，Collector 可以将 Stream 转换成集合，如 List、Set 或 Map。JDK 内置了很多常用的 Collector，大多数场景下不需要自己实现：

```java
// <R, A> R collect(Collector<? super T, A, R> collector);

// collect 操作：将 Stream 转换成集合，如：List、Set、Map
// Map<String, Staff> staffMap = staffs.stream().collect(Collectors.toMap((Staff::getName), Function.identity()));
Map<String, Staff> staffMap = staffs.stream().collect(Collectors.toMap((Staff::getName), Function.identity(), (oldValue, newValue) -> newValue));
System.out.println(staffMap);
```

将 Stream 元素转换成 map 的时候，需要特别注意：key 必须是唯一的，否则会抛出 IllegalStateException 。如果想主动规避这个问题，需要我们传入一个 merge function，来指定重复的元素映射的方式。也可以使用 Collectors.groupingBy()，按照指定 key 分组的方式来代替：

```java
// collect 操作：按照指定 key 分组
Map<String, List<Staff>> staffsMap = staffs.stream().collect(Collectors.groupingBy((Staff::getName)));
System.out.println(staffsMap);
```

- reduce——reduce 操作可以实现从一组元素中生成一个值，sum()、max()、min()、count()等都是 reduce 操作，将他们单独设为函数方便日常使用。redeue 方法定义了三种重载形式：

第一种方法声明为：`Optional<T> reduce(BinaryOperator<T> accumulator);` 参数为累加器，返回值为 Optional 对象，通过 accumulator 计算得到一个最终结果，通过 Optional 对象中返回：

```java
// 实现#号拼接字符串
// 第一次执行时第一个参数是 Stream 中的第一个元素，第二个参数是 Stream 参数中的第二个元素
// 后面每次执行的中间结果赋给第一个参数，然后第二个参数为 Stream 中的下一个元素，依次执行，最后返回一个 Optional
Lists.newArrayList("d4", "c3", "a1", "b2", "f5").stream().sorted().reduce((s1, s2) -> {
    System.out.println("s1:" + s1);
    System.out.println("s2:" + s2);
    System.out.println("--------");
    return s1 + "#" + s2;
}).ifPresent(System.out::println);
// 执行结果
s1:a1
s2:b2
--------
s1:a1#b2
s2:c3
--------
s1:a1#b2#c3
s2:d4
--------
s1:a1#b2#c3#d4
s2:f5
--------
a1#b2#c3#d4#f5
```

第二种方法声明为：`T reduce(T identity, BinaryOperator<T> accumulator);` 新增了一个初始化类型。

```java
// 第一次执行时第一个参数是指定的初始对象，第二个参数是 Stream 参数中的第一个元素
// 后面每次执行的中间结果赋给第一个参数，然后第二个参数为 Stream 中的下一个元素，依次执行，最后返回一个和初始值类型相同的结果
System.out.println(Stream.of(1, 2, 3, 4, 5).reduce(10, (p1, p2) -> {
    System.out.println("p1:" + p1);
    System.out.println("p2:" + p2);
    System.out.println("--------");
    return p1 + p2;
}));
// 执行结果
p1:10
p2:1
--------
p1:11
p2:2
--------
p1:13
p2:3
--------
p1:16
p2:4
--------
p1:20
p2:5
--------
25
```

第三种方法声明为：`<U> U reduce(U identity, BiFunction<U, ? super T, U> accumulator, BinaryOperator<U> combiner);` 在初始对象和累加器基础上，添加了组合器 combiner。

```java
// 第三种方式，求单词长度之和，使用串行流和并行流分别执行
System.out.println(Stream.of("d4", "c3", "a1", "b2", "f5").reduce(0, (o1, o2) -> {
    String threadName = Thread.currentThread().getName();
    System.out.println("BiFunction--" + threadName);
    System.out.println("o1:" + o1 + "--" + threadName);
    System.out.println("o2:" + o2 + "--" + threadName);
    return o1 + o2.length();
}, (o1, o2) -> {
    String threadName = Thread.currentThread().getName();
    System.out.println("BinaryOperator--" + threadName);
    System.out.println("o1:" + o1 + "--" + threadName);
    System.out.println("o2:" + o2 + "--" + threadName);
    return o1 + o2;
}));
// 执行结果
BiFunction--main
o1:0--main
o2:d4--main
BiFunction--main
o1:2--main
o2:c3--main
BiFunction--main
o1:4--main
o2:a1--main
BiFunction--main
o1:6--main
o2:b2--main
BiFunction--main
o1:8--main
o2:f5--main
10
```

执行以上的案例发现 BinaryOperator 并没有执行，此时的操作与第二种方式类似，我们将 Stream 转换为并行流再尝试一下：

```java
BiFunction--main
o1:0--main
o2:a1--main
BiFunction--ForkJoinPool.commonPool-worker-3
o1:0--ForkJoinPool.commonPool-worker-3
o2:d4--ForkJoinPool.commonPool-worker-3
BiFunction--ForkJoinPool.commonPool-worker-2
o1:0--ForkJoinPool.commonPool-worker-2
o2:f5--ForkJoinPool.commonPool-worker-2
BiFunction--ForkJoinPool.commonPool-worker-3
o1:0--ForkJoinPool.commonPool-worker-3
o2:b2--ForkJoinPool.commonPool-worker-3
BinaryOperator--ForkJoinPool.commonPool-worker-3
o1:2--ForkJoinPool.commonPool-worker-3
o2:2--ForkJoinPool.commonPool-worker-3
BinaryOperator--ForkJoinPool.commonPool-worker-3
o1:2--ForkJoinPool.commonPool-worker-3
o2:4--ForkJoinPool.commonPool-worker-3
BiFunction--ForkJoinPool.commonPool-worker-1
o1:0--ForkJoinPool.commonPool-worker-1
o2:c3--ForkJoinPool.commonPool-worker-1
BinaryOperator--ForkJoinPool.commonPool-worker-1
o1:2--ForkJoinPool.commonPool-worker-1
o2:2--ForkJoinPool.commonPool-worker-1
BinaryOperator--ForkJoinPool.commonPool-worker-1
o1:4--ForkJoinPool.commonPool-worker-1
o2:6--ForkJoinPool.commonPool-worker-1
10
```

发现在并行流中，BinaryOperator 执行了，查阅资料发现，为了避免并行竞争，将每个线程的任务单独维护了一个结果，然后通过组合器 combiner 进行最终结果的合并。

- match——用来判断某一种规则是否与流对象匹配。所有的匹配操作都是结束操作，只返回一个 boolean 类型的结果。

```java
// match操作：用来判断某一种规则是否与流对象匹配
boolean anyMatch = staffs.stream().anyMatch((staff) -> staff.getName().startsWith("张"));
System.out.println(anyMatch);
boolean allMatch = staffs.stream().allMatch((staff) -> staff.getAge().equals(34));
System.out.println(allMatch);
boolean noneMatch = staffs.stream().noneMatch((staff) -> staff.getAge().equals(34));
System.out.println(noneMatch);
```

## New Date API

Java8 另一项新特性是新的时间和日期 API，它们被包含在 java.time 包中。借助新的时间和日期 API 可以更简洁地处理时间和日期。

### 为什么需要 New Date API

在 Java8 之前的时间和日期 API 有很多缺陷，具体如下：

- Java 的 `java.util.Date` 和 `java.util.Calendar` 类易用性差，而且不是线程安全的；

- 对日期的计算方式繁琐，容易出错——月份是从 0 开始的，从 Calendar 中获取的月份需要加一才能表示当前月份；

由于以上这些问题，Java 社区出现了一些第三方时间日期库——Joda-Time，Java8 充分借鉴了 Joda 库的一些优点，提供了一套新的时间和日期 API。

### 日期&时间类

Java8 中常用的日期和时间类主要有 LocalDate、LocalTime、LocalDateTime、Instant、Duration 和 Period。

- LocalDate、LocalTime、LocalDateTime

LocalDate 类表示一个具体的日期，但不包含具体时间，也不包含时区信息。可以通过 LocalDate 的静态方法 of() 创建一个实例，LocalDate 也包含一些方法用来获取年份、月份、天、星期几等：

```java
// 初始化日期
LocalDate localDate = LocalDate.of(2020, 1, 10);
// 年份 2020
System.out.println(localDate.getYear());
// 年份中第几天 10
System.out.println(localDate.getDayOfYear());
// 月份 JANUARY
Month month = localDate.getMonth();
System.out.println(month);
// 月份中的第几天 10
System.out.println(localDate.getDayOfMonth());
// 一周的第几天：FRIDAY
System.out.println(localDate.getDayOfWeek());
// 月份的天数 31
System.out.println(localDate.lengthOfMonth());
// 是否为闰年 true
System.out.println(localDate.isLeapYear());
```

LocalTime 和 LocalDate 类似，他们之间的区别在于 LocalDate 不包含具体时间，而 LocalTime 包含具体时间：

```java
// 初始化一个时间：17:50:40
LocalTime localTime = LocalTime.of(17, 50, 40);
// 时：17
System.out.println(localTime.getHour());
// 分：50
System.out.println(localTime.getMinute());
// 秒：40
System.out.println(localTime.getSecond());
```

LocalDateTime 类是 LocalDate 和 LocalTime 的结合体，可以通过 of()方法直接创建，也可以调用 LocalDate 的 atTime() 方法或 LocalTime 的 atDate() 方法将 LocalDate 或 LocalTime 合并成一个 LocalDateTime：

```java
LocalDateTime localDateTime = LocalDateTime.of(2020, Month.JANUARY, 10, 17, 50, 40);

LocalDate localDate = LocalDate.of(2020, Month.JANUARY, 10);
LocalTime localTime = LocalTime.of(17, 50, 40);
LocalDateTime combineLocalDateTime = localDate.atTime(localTime);
// LocalDateTime combineLocalDateTime = localTime.atDate(localDate);
// 从 LocalDateTime 中获取年月日时分秒
System.out.println(combineLocalDateTime.getYear());
System.out.println(combineLocalDateTime.getMonth());
System.out.println(combineLocalDateTime.getDayOfMonth());
System.out.println(combineLocalDateTime.getHour());
System.out.println(combineLocalDateTime.getMinute());
System.out.println(combineLocalDateTime.getSecond());

// LocalDateTime 转化成 LocalDate 或 LocalTime
LocalDate transferLocalDate = localDateTime.toLocalDate();
LocalTime transferLocalTime = localDateTime.toLocalTime();
```

- Instant——Instant 用于表示一个时间戳，可以精确到纳秒，可以使用 now() 方法创建，也可以通过 ofEpochSecond() 方法创建。

```java
// Instant可以使用 now() 方法创建，也可以通过 ofEpochSecond 方法创建
Instant now = Instant.now();
// 2020-01-12T16:16:41.723Z
System.out.println(now);

// ofEpochSecond 方法第一个参数表示从 1970-01-01 00:00:00 开始到现在的秒数
// ofEpochSecond 方法第二个参数表示纳秒数，0~999,999,999
Instant instant = Instant.ofEpochSecond(9999, 1000);
// 1970-01-01T02:46:39.000001Z
System.out.println(instant);
```

- Duration——Duration 表示一个时间段，可以通过 Duration.between() 或 Duration.of() 方法创建。

```java
// 使用 of 创建 Duration，统一一个单位设置
Duration duration1 = Duration.of(7, ChronoUnit.DAYS);
Duration duration2 = Duration.of(3000, ChronoUnit.SECONDS);

// 2018-07-03 09:00:00
LocalDateTime start = LocalDateTime.of(2018, Month.JULY, 3, 9, 0, 0);
// 2020-01-13 18:00:00
LocalDateTime end = LocalDateTime.of(2020, Month.JANUARY, 13, 18, 0, 0);
Duration duration = Duration.between(start, end);

// 总天数
System.out.println(duration.toDays());
// 总小时数
System.out.println(duration.toHours());
// 总分钟数
System.out.println(duration.toMinutes());
// 总秒数
System.out.println(duration.getSeconds());
```

- Period——Period 和 Duration 类似，不同之处在于 Period 是以年月日来衡量一个时间段。

```java
// 创建2年3个月6天的范围，年月日单独字段设置
Period period1 = Period.of(2, 3, 6);

// 从 2018-07-03 到 2020-01-13
Period period2 = Period.between(LocalDate.of(2018, 7, 3), LocalDate.of(2020, 1, 13));
System.out.println(period2.getYears());
System.out.println(period2.getMonths());
System.out.println(period2.getDays());
```

### 日期操作和格式化

- 日期操作——常用的日期操作有增减天数、月数，查找本月最后一个周五等操作：

```java
// 2019-12-01
LocalDate date = LocalDate.of(2019, 12, 1);
// 修改日期为 2020-01-13 2020-01-13
LocalDate newDate = date.withYear(2020).withMonth(1).withDayOfMonth(13);
System.out.println(newDate);
// 增加一年，减一个月，加十天 2020-12-23
LocalDate localDate = newDate.plusYears(1).minusMonths(1).plus(10, ChronoUnit.DAYS);
System.out.println(localDate);

// 查找本月最后一个周五 2020-01-31
System.out.println(LocalDate.now().with(TemporalAdjusters.lastInMonth(DayOfWeek.FRIDAY)));
```

- 日期格式化——新的日期 API 中提供了一个 DateTimeFormatter 类用于处理日期格式化操作，日期类中调用 format() 方法，传入 DateTimeFormatter 参数：

```java
// 20200113
System.out.println(LocalDateTime.now().format(DateTimeFormatter.BASIC_ISO_DATE));
// 2020-01-13
System.out.println(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
// 11:02:38.148
System.out.println(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_TIME));
// 2020-01-13
System.out.println(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
```

## Optional

### 什么是 Optional

在 Optional 出现之前，Java 的 NullPointerException 问题令人头疼，我们需要手动添加很多判空逻辑：

{% image /assets/blog/2022/02/11/1644542092.jpg width:600px padding:20px bg:#2B2B2B %}

为了减少这样的 null 值判断，Java8 借鉴了 Guava Optional，提供了新的 Optional 容器。根据官方文档定义，Optional 是一个容器对象，容器中可能包含也可能不包含一个非空对象。如果对象存在，isPresent() 将会返回 true，get()方法将会返回一个值。

> A container object which may or may not contain a non-null value. If a value is present, isPresent() will return true and get() will return the value.

### 如何使用 Optional

- of、ofNullable——分别为非 null 值和可为 null 值创建一个 Optional：

```java
// 使用 of 为非 null 值创建 Optional，ofNullable
String name = "张三";
Integer age = LocalDate.now().isAfter(LocalDate.of(2020, 1, 10)) ? null : 0;
Optional<String> nameOptional = Optional.of(name);
Optional<Integer> ageOptional = Optional.ofNullable(age);
```

- isPresent——判断 Optional 中是否存在值，存在则返回 true，不存在则返回 false：

```java
// 使用 isPresent 判断 Optional 是否存在值
System.out.println(nameOptional.isPresent());
System.out.println(ageOptional.isPresent());
```

- ifPresent——如果存在值则执行函数式接口 Consumer 中的逻辑，否则不操作：

```java
// nameOptional.ifPresent(value -> System.out.println(value));
nameOptional.ifPresent(System.out::println);
ageOptional.ifPresent(System.out::println);

// 执行结果
// 张三
```

- get——如果有值直接返回，否则抛出 NoSuchElementException 异常：

```java
System.out.println(nameOptional.get());
// NoSuchElementException: No value present
// System.out.println(ageOptional.get());
```

- orElse、orElseGet、orElseThrow——orElse 有值则直接返回，为 null 时返回参数设置的默认值；orElseGet 方法与 orElse 方法类似，只是提供了一个函数式接口 Supplier，用来生成默认值；orElseThrow 允许传入一个 Lambda 表达式，来指定为空时抛出异常信息：

```java
// orElse 设置为空时的默认值
System.out.println(nameOptional.orElse("李四"));
System.out.println(ageOptional.orElse(20));
// orElseGet 设置为空时的默认值
System.out.println(ageOptional.orElseGet(() -> 20));
// orElseThrow 设置为空时抛出的异常
System.out.println(ageOptional.orElseThrow(RuntimeException::new));
```

- map、flatMap——map 允许传入一个 Function 对原始值进行转化，生成一个新的值，然后返回 Optional；flatMap 用法类似，只是传入的 lambda 表达式要求返回值为 Optional：

```java
// 使用 map、flatMap 映射得到 Optional
nameOptional.map(value -> value.replace("三", "四")).ifPresent(System.out::println);
nameOptional.flatMap(value -> Optional.of(value.replace("三", "四"))).ifPresent(System.out::println);
```

- filter——通过传入的条件 Predicate 对原始值进行过滤，然后返回 Optional：

```java
// 使用 filter 对原始值进行过滤
System.out.println(nameOptional.filter(value -> value.length() > 2).isPresent());
```

### 使用 Optional 的注意事项

- 不要将 Optional 作为方法参数传递——使用 Optional 作为方法参数传递，如果使用方法时传递了 null，那么这时候就会 NullPointerException，我们不得不加上非空判断，这样就违背了引入 Optional 的初衷；

```java
/**
 * 根据名称过滤员工
 *
 * @param staffs
 * @param name
 * @param age
 * @return
 */
public static List<Staff> filterStaffByNameAndAge(List<Staff> staffs, String name, Optional<Integer> age) {
    return staffs.stream()
            .filter(p -> p.getName().equals(name))
            .filter(p -> p.getAge() >= age.orElse(0))
            .collect(Collectors.toList());
}

// 使用 Optional 的注意事项——不要作为方法参数传递
List<Staff> staffs = Lists.newArrayList(Staff.builder().name("张三").age(18).build(),
        Staff.builder().name("李四").age(27).hobbies(Lists.newArrayList("书法", "围棋", "乒乓球")).build(),
        Staff.builder().name("王五").age(35).hobbies(Lists.newArrayList("读书", "篮球", "爬山")).build());
filterStaffByNameAndAge(staffs, "李四", null);
```

- 不要将 Optional 作为类中的成员变量，因为 Optional 不支持序列化；

```java
// 使用 Optional 的注意事项——不要作为类中的字段，不支持序列化
Staff staff = Staff.builder().name("张三").telephoneNumber(Optional.of("12345678900")).build();

try {
    // java.io.NotSerializableException: java.util.Optional
    ObjectOutputStream outputStream = new ObjectOutputStream(new FileOutputStream("object.txt"));
    outputStream.writeObject(staff);
} catch (Exception e) {
    System.out.println(e.toString());
}
```

## 参考文档

- [Java 8 的新特性—终极版](https://www.jianshu.com/p/5b800057f2d8)
- [Java8 新特性，你应该了解这些](https://juejin.im/post/5ae6bfb66fb9a07a9b35bac1#heading-7)
- [Guide To Java 8 Optional](https://www.baeldung.com/java-optional)
- [一文带你玩转 Java8 Stream 流，从此操作集合 So Easy](https://juejin.im/post/5cc124a95188252d891d00f2)

---
layout: wiki
wiki: calcite
order: 202
title: 如何参与
date: 2023-10-26 09:00:00
---

> 原文链接：https://calcite.apache.org/docs/howto.html

以下是有关使用 Calcite 及其各种适配器的一些杂项文档。

## 从分发的源代码构建

先决条件是你的路径上有 Java（JDK 8、9、10、11、12、13、14、15、16、17、18 或 19）和 Gradle（版本 7.6.1）。

解压分发的源代码 `.tar.gz` 文件， `cd` 到解压源文件的根目录，然后使用 Gradle 进行构建：

```bash
$ tar xvfz apache-calcite-1.36.0-src.tar.gz
$ cd apache-calcite-1.36.0-src
$ gradle build
```

[运行测试](https://strongduanmu.com/wiki/calcite/howto.html#%E8%BF%90%E8%A1%8C%E6%B5%8B%E8%AF%95)描述了如何运行更多或更少的测试（但你应该使用 `gradle` 命令而不是 `./gradlew` ）。

## 从 Git 构建

先决条件是你的路径上有 git 和 Java（JDK 8、9、10、11、12、13、14、15、16、17、18 或 19）。

创建 GitHub 存储库的本地副本，然后 `cd` 到其根目录，再使用包含的 Gradle 包装器进行构建：

```bash
$ git clone https://github.com/apache/calcite.git
$ cd calcite
$ ./gradlew build
```

Calcite 包含许多机器生成的代码。默认情况下，它们会在每次构建时重新生成，但这会产生负面影响，即在非机器生成的代码未更改时导致整个项目重新编译。

通常，当相关模板发生更改时，会自动调用重新生成，并且它应该透明地工作。但是，如果你的 IDE 不生成源（例如 `core/build/javacc/javaCCMain/org/apache/calcite/sql/parser/impl/SqlParserImpl.java` ），那么你可以手动调用 `./gradlew generateSources` 任务。

[运行测试](https://strongduanmu.com/wiki/calcite/howto.html#%E8%BF%90%E8%A1%8C%E6%B5%8B%E8%AF%95)描述了如何运行更多或更少的测试。

## Gradle 与 Gradle 包装器

Calcite 使用 Gradle Wrapper 来创建一致的构建环境。在典型情况下，你不需要手动安装 Gradle， `./gradlew` 会为你下载正确的版本并验证预期的校验和。

如果你愿意，可以手动安装 Gradle，但请注意这可能会导致版本不匹配。

有关 Gradle 的更多信息，请查看以下链接：[Gradle 五件事](https://docs.gradle.org/current/userguide/what_is_gradle.html#five_things) 和 [Gradle 多项目构建](https://docs.gradle.org/current/userguide/intro_multi_project_builds.html)。

## 升级 Gradle 和 Gradle 包装器

[Gradle 的文档](https://docs.gradle.org/current/userguide/upgrading_version_7.html)提供了有关如何升级 Gradle 的详细信息。以下是步骤列表：

1. 运行 `./gradlew help --warning-mode=all` 以查明你是否正在使用任何已弃用的功能；
2. 修复弃用的问题并重复上一步以确认它们已修复。 Gradle 文档在这一步可能非常有帮助，因为它包含有关弃用以及如何处理它们的信息；
3. 运行 `./gradlew wrapper --gradle-version <new_gradle_version>` 来升级 Gradle。如有必要，它还会升级 Gradle Wrapper。此步骤还会更新 `gradle/wrapper/gradle-wrapper.properties` ，包括校验和；
4. 如果需要，检查并更新 `gradle.properties` 中的 Kotlin 版本。应根据 [Kotlin 兼容性矩阵](https://docs.gradle.org/current/userguide/compatibility.html#kotlin)进行检查；
5. 步骤 3 将从 `gradle/wrapper/gradle-wrapper.properties` 中删除标头，因此现在运行 `./gradlew autostyleApply` 将其添加回来；
6. 根据官方 [Gradle 版本校验和](https://gradle.org/release-checksums/)检查 `gradle/wrapper/gradle-wrapper.properties` 中更新的 Gradle 版本和校验和；
7. 尝试构建项目并运行测试；使用[故障排除指南](https://docs.gradle.org/current/userguide/troubleshooting.html#troubleshooting)调试任何错误；
8. 更新本指南中的 Gradle 版本。

## 运行测试

构建时测试套件将默认运行，除非你指定 `-x test`：

```bash
$ ./gradlew assemble # build the artifacts
$ ./gradlew build -x test # build the artifacts, verify code style, skip tests
$ ./gradlew check # verify code style, execute tests
$ ./gradlew test # execute tests
$ ./gradlew style # update code formatting (for auto-correctable cases) and verify style
$ ./gradlew autostyleCheck checkstyleAll # report code style violations
$ ./gradlew -PenableErrorprone classes # verify Java code with Error Prone compiler, requires Java 11
```

你可以使用 `./gradlew assemble` 构建工件并跳过所有测试和验证。

还有其他选项可以控制运行哪些测试以及在什么环境中运行，如下所示。

- `-Dcalcite.test.db=DB` （其中 DB 为 `h2` 、 `hsqldb` 、 `mysql` 或 `postgresql` ）允许你更改 JDBC 测试套件的数据源。 Calcite 的测试套件需要一个填充有 foodmart 数据集的 JDBC 数据源。
  - `hsqldb` 默认使用 hsqldb 内存数据库；
  - 所有其他都访问测试虚拟机（请参阅下面的[集成测试](https://strongduanmu.com/wiki/calcite/howto.html#%E8%BF%90%E8%A1%8C%E9%9B%86%E6%88%90%E6%B5%8B%E8%AF%95)）。 `mysql` 和 `postgresql` 可能比 hsqldb 快一些，但你需要填充它（即配置虚拟机）。
- `-Dcalcite.debug` 将额外的调试信息打印到标准输出；
- `-Dcalcite.test.splunk` 启用针对 Splunk 运行的测试。Splunk 必须已安装并正在运行；
- `./gradlew testSlow` 运行需要更长时间执行的测试。例如，有些测试可以在内存中创建虚拟 TPC-H 和 TPC-DS 模式，并根据这些基准运行测试。

注意：测试是在分叉的 JVM 中执行的，因此使用 Gradle 运行测试时不会自动传递系统属性。默认情况下，构建脚本传递以下 `-D...` 属性（请参阅 `build.gradle.kts` 中的 `passProperty` ）：

- `java.awt.headless`；
- `junit.jupiter.execution.parallel.enabled`， 默认：`true`；
- `junit.jupiter.execution.timeout.default`， 默认：`5 m`；
- `user.language`， 默认：`TR`；
- `user.country`， 默认：`tr`；
- `calcite.**` （启用 `calcite.test.db` 及上述其他内容）。

## 运行集成测试

为了测试 Calcite 的外部适配器，应使用测试虚拟机。 VM 包括 Cassandra、Druid、H2、HSQLDB、MySQL、MongoDB 和 PostgreSQL。

测试虚拟机需要 5GiB 磁盘空间，构建需要 30 分钟。

注意：你可以使用 [calcite-test-dataset](https://github.com/vlsi/calcite-test-dataset) 填充你自己的数据库，但建议使用测试虚拟机，以便可以重现测试环境。

### 虚拟机准备

0. 安装依赖项：[Vagrant](https://www.vagrantup.com/) 和 [VirtualBox](https://www.virtualbox.org/)；

1) 在与 Calcite 存储库相同的级别克隆：https://github.com/vlsi/calcite-test-dataset.git 仓库。例如：

```
code
  +-- calcite
  +-- calcite-test-dataset
```

注意：集成测试搜索 `../calcite-test-dataset` 或 `../../calcite-test-dataset`。你可以通过 `calcite.test.dataset` 系统属性指定完整路径。

2. 构建并启动 VM：

```bash
cd calcite-test-dataset && mvn install
```

### 虚拟机管理

测试虚拟机由 Vagrant 配置，因此应使用常规 Vagrant `vagrant up` 和 `vagrant halt` 来启动和停止虚拟机。 [calcite-test-dataset](https://github.com/vlsi/calcite-test-dataset) 自述文件中列出了不同数据库的连接字符串。

### 建议的测试流程

注意：测试虚拟机应在启动集成测试之前启动。Calcite 本身不会启动/停止虚拟机。

命令行：

- 执行常规单元测试（不需要外部数据）：没有变化。 `./gradlew test` 或 `./gradlew build`；
- 对所有数据库执行所有测试： `./gradlew test integTestAll`；
- 仅执行外部数据库的测试，不包括单元测试： `./gradlew integTestAll`；
- 执行 PostgreSQL JDBC 测试： `./gradlew integTestPostgresql`；
- 仅执行 MongoDB 测试： `./gradlew :mongo:build`。

在 IDE 中执行：

- 执行常规单元测试：没有变化；
- 执行 MongoDB 测试：使用 `calcite.integrationTest=true` 系统属性运行 `MongoAdapterTest.java`；
- 执行 MySQL 测试：使用设置 `-Dcalcite.test.db=mysql` 运行 `JdbcTest` 和 `JdbcAdapterTest`；
- 执行 PostgreSQL 测试：使用设置 `-Dcalcite.test.db=postgresql` 运行 `JdbcTest` 和 `JdbcAdapterTest`。

### 集成测试技术细节

使用外部数据的测试是在 Gradle 的集成测试阶段执行的。我们目前不使用集成前测试/集成后测试，但是，我们将来可以使用它。构建通过/失败的验证是在验证阶段执行的。集成测试应命名为 `...IT.java` ，因此在单元测试执行时不会拾取它们。

## 贡献

请参阅[开发者指南-贡献](https://strongduanmu.com/wiki/calcite/develop.html#%E8%B4%A1%E7%8C%AE)。

## 入门

请参阅[开发者指南-入门](https://strongduanmu.com/wiki/calcite/develop.html#%E5%85%A5%E9%97%A8)。

## 设置 IDE 进行贡献

### 设置 IntelliJ IDEA

下载高于 (2018.X) 的 [IntelliJ IDEA](https://www.jetbrains.com/idea/) 版本。版本 2019.2 和 2019.3 已经过社区成员的测试，看起来很稳定。对于不使用 Gradle 构建（版本 1.21.0 及之前版本）的方解石源，旧版本的 IDEA 仍然可以正常工作。

按照安装 IDEA 的标准步骤并设置 Calcite 目前支持的 JDK 版本之一。

首先[从命令行构建 Calcite](https://calcite.apache.org/docs/howto.html#building-from-a-source-distribution)。

转到 `文件 > 打开...` 并打开 Calcite 的根 `build.gradle.kts` 文件。当 IntelliJ 询问你是否要将其作为项目或文件打开时，请选择项目。另外，当它询问你是否想要一个新窗口时，请选择是。 IntelliJ 的 Gradle 项目导入器应该处理其余的事情。

你可以在 [GitHub](https://gist.github.com/gianm/27a4e3cad99d7b9b6513b6885d3cfcc9) 上导入部分实现的 IntelliJ 代码样式配置。它并没有做让 Calcite 的样式检查器满意所需的一切，但它做了相当多的事情。要导入，请转至首选项 > 编辑器 > 代码样式，单击方案旁边的齿轮，然后单击导入方案 > IntelliJ IDEA 代码样式 XML。

导入程序完成后，测试项目设置。例如，使用 Navigate > Symbol 导航到方法 `JdbcTest.testWinAgg` 并输入 `testWinAgg` 。右键单击并选择运行（或等效的键盘快捷键）来运行 `testWinAgg` 。

### 设置 NetBeans

从主菜单中，选择 `文件 > 打开项目`，然后导航到带有小 Gradle 图标的项目名称 (Calcite)，然后选择打开。等待 NetBeans 完成所有依赖项的导入。

为了确保项目配置成功，请导航到 `org.apache.calcite.test.JdbcTest` 中的方法 `testWinAgg` 。右键单击该方法并选择运行重点测试方法。 NetBeans 将运行 Gradle 进程，你应该在命令输出窗口中看到一行 `Running org.apache.calcite.test.JdbcTest` ，后跟 `"BUILD SUCCESS"` 。

注意：尚不清楚 NetBeans 是否在项目导入时自动生成相关源，因此你可能需要在导入项目之前（以及更新模板解析器源和项目版本时）运行 `./gradlew generateSources`。

## 追踪（Tracing）

要启用追踪，请将以下标志添加到 java 命令行：

```properties
-Dcalcite.debug=true
```

第一个标志使 Calcite 将其生成的 Java 代码（以执行查询）打印到 stdout。如果你正在调试像这样的神秘问题，它特别有用：

```
Exception in thread "main" java.lang.ClassCastException: Integer cannot be cast to Long  at Baz$1$1.current(Unknown Source)
```

默认情况下，Calcite 使用 SLF4J 的 Log4j 绑定。提供了一个配置文件，它将 INFO 级别的日志记录输出到 `core/src/test/resources/log4j.properties` 中的控制台。你可以修改 rootLogger 的级别以增加详细程度，或者更改特定类的级别（如果你愿意）。

```properties
# Change rootLogger level to WARN
log4j.rootLogger=WARN, A1
# Increase level to DEBUG for RelOptPlanner
log4j.logger.org.apache.calcite.plan.RelOptPlanner=DEBUG
# Increase level to TRACE for HepPlanner
log4j.logger.org.apache.calcite.plan.hep.HepPlanner=TRACE
```

## 在 Intellij 中调试生成的类

Calcite 使用 [Janino](https://janino-compiler.github.io/janino/) 生成 Java 代码。生成的类可以交互式调试（请参阅 [Janino 教程](https://janino-compiler.github.io/janino/)）。

要调试生成的类，请在启动 JVM 时设置两个系统属性：

- `-Dorg.codehaus.janino.source_debugging.enable=true`；
- `-Dorg.codehaus.janino.source_debugging.dir=C:\tmp` （此属性是可选的；如果未设置，Janino 将在系统的默认临时文件位置创建临时文件，例如基于 Unix 的系统上的 `/tmp`）。

代码生成后，可以进入 Intellij 将包含生成的临时文件的文件夹标记为生成的源根或源根，也可以在启动 JVM 时直接将 `org.codehaus.janino.source_debugging.dir` 的值设置为现有的源根。

## CSV 适配器

请参阅[教程](https://calcite.apache.org/docs/tutorial.html)。

## MongoDB 适配器

首先，下载并安装 Calcite，然后安装 [MongoDB](https://www.mongodb.org/downloads)。

注意：你可以从上面的集成测试虚拟机使用 MongoDB。

将 MongoDB 的邮政编码数据集导入 MongoDB：

```bash
$ curl -o /tmp/zips.json https://media.mongodb.org/zips.json
$ mongoimport --db test --collection zips --file /tmp/zips.json
Tue Jun  4 16:24:14.190 check 9 29470
Tue Jun  4 16:24:14.469 imported 29470 objects
```

登录 MongoDB 以检查它是否存在：

```bash
$ mongo
MongoDB shell version: 2.4.3
connecting to: test
> db.zips.find().limit(3)
{ "city" : "ACMAR", "loc" : [ -86.51557, 33.584132 ], "pop" : 6055, "state" : "AL", "_id" : "35004" }
{ "city" : "ADAMSVILLE", "loc" : [ -86.959727, 33.588437 ], "pop" : 10616, "state" : "AL", "_id" : "35005" }
{ "city" : "ADGER", "loc" : [ -87.167455, 33.434277 ], "pop" : 3205, "state" : "AL", "_id" : "35006" }
> exit
bye
```

使用 [mongo-model.json](https://github.com/apache/calcite/blob/main/mongodb/src/test/resources/mongo-model.json) Calcite 模型进行连接：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=mongodb/src/test/resources/mongo-model.json admin admin
Connecting to jdbc:calcite:model=mongodb/src/test/resources/mongo-model.json
Connected to: Calcite (version 1.x.x)
Driver: Calcite JDBC Driver (version 1.x.x)
Autocommit status: true
Transaction isolation: TRANSACTION_REPEATABLE_READ
sqlline> !tables
+------------+--------------+-----------------+---------------+
| TABLE_CAT  | TABLE_SCHEM  |   TABLE_NAME    |  TABLE_TYPE   |
+------------+--------------+-----------------+---------------+
| null       | mongo_raw    | zips            | TABLE         |
| null       | mongo_raw    | system.indexes  | TABLE         |
| null       | mongo        | ZIPS            | VIEW          |
| null       | metadata     | COLUMNS         | SYSTEM_TABLE  |
| null       | metadata     | TABLES          | SYSTEM_TABLE  |
+------------+--------------+-----------------+---------------+
sqlline> select count(*) from zips;
+---------+
| EXPR$0  |
+---------+
| 29467   |
+---------+
1 row selected (0.746 seconds)
sqlline> !quit
Closing: org.apache.calcite.jdbc.FactoryJdbc41$CalciteConnectionJdbc41
$
```

## Splunk 适配器

要针对 Splunk 运行测试套件和示例查询，请按照 [Splunk 教程](https://docs.splunk.com/Documentation/Splunk/6.0.2/PivotTutorial/GetthetutorialdataintoSplunk)中的说明加载 Splunk 的 `tutorialdata.zip` 数据集。

（此步骤是可选的，但它为示例查询提供了一些有趣的数据。如果你打算使用 `-Dcalcite.test.splunk=true` 运行测试套件，则这也是必要的。）

## 实现一个适配器

可以通过实现 `CalcitePrepare.Context` 创建新的适配器：

```java
import org.apache.calcite.adapter.java.JavaTypeFactory;
import org.apache.calcite.jdbc.CalcitePrepare;
import org.apache.calcite.jdbc.CalciteSchema;

public class AdapterContext implements CalcitePrepare.Context {
  @Override
  public JavaTypeFactory getTypeFactory() {
    // adapter implementation
    return typeFactory;
  }

  @Override
  public CalciteSchema getRootSchema() {
    // adapter implementation
    return rootSchema;
  }
}
```

### 用 Java 测试适配器

下面的示例显示了如何使用自定义上下文（在本例中为 `AdapterContext` ）将 SQL 查询提交到 `CalcitePrepare` 。 Calcite 使用 `Context` 提供的资源准备并实现查询执行。 `CalcitePrepare.PrepareResult` 提供对底层枚举和枚举方法的访问。可枚举本身自然可以是某些适配器特定的实现。

```java
import org.apache.calcite.jdbc.CalcitePrepare;
import org.apache.calcite.prepare.CalcitePrepareImpl;
import org.junit.Test;

public class AdapterContextTest {
  @Test
  public void testSelectAllFromTable() {
    AdapterContext ctx = new AdapterContext();
    String sql = "SELECT * FROM TABLENAME";
    Class elementType = Object[].class;
    CalcitePrepare.PrepareResult<Object> prepared =
        new CalcitePrepareImpl().prepareSql(ctx, sql, null, elementType, -1);
    Object enumerable = prepared.getExecutable();
    // etc.
  }
}
```

# 面向开发者的高级主题

如果你要向代码库的特定部分添加功能，则可能会对以下部分感兴趣。如果你只是从源代码构建并运行测试，则不需要了解这些主题。

## Java 类型工厂

当 Calcite 比较类型（ `RelDataType` 的实例）时，它要求它们是同一对象。如果有两个不同的类型实例引用相同的 Java 类型，Calcite 可能无法识别它们是否匹配。建议：

* 在 Calcite 上下文中使用 `JavaTypeFactory` 的单个实例；

- 存储类型，以便始终为相同类型返回相同的对象。

## 重建生成的 Protocol Buffer 代码

Calcite 的 Avatica Server 组件支持使用 [Protocol Buffers](https://developers.google.com/protocol-buffers/) 的 RPC 序列化。在 Avatica 的上下文中，Protocol Buffers 可以生成由模式定义的消息集合。该库本身可以使用新模式解析旧的序列化消息。在不保证客户端和服务器具有相同版本的对象的环境中，这是非常需要的。

通常，Protocol Buffers 库生成的代码不需要仅在每次构建时重新生成，仅当架构更改时才需要重新生成。

首先，安装Protobuf 3.0：

```bash
$ wget https://github.com/google/protobuf/releases/download/v3.0.0-beta-1/protobuf-java-3.0.0-beta-1.tar.gz
$ tar xf protobuf-java-3.0.0-beta-1.tar.gz && cd protobuf-3.0.0-beta-1
$ ./configure
$ make
$ sudo make install
```

然后，重新生成编译后的代码：

```bash
$ cd avatica/core
$ ./src/main/scripts/generate-protobuf.sh
```

## 创建优化器规则

创建一个扩展 `RelRule` 的类（或者偶尔是一个子类）。

```java
/** Planner rule that matches a {@link Filter} and futzes with it.
 *
 * @see CoreRules#FILTER_FUTZ
 */
class FilterFutzRule extends RelRule<FilterFutzRule.Config> {
  /** Creates a FilterFutzRule. */
  protected FilterFutzRule(Config config) {
    super(config);
  }

  @Override onMatch(RelOptRuleCall call) {
    final Filter filter = call.rels(0);
    final RelNode newRel = ...;
    call.transformTo(newRel);
  }

  /** Rule configuration. */
  interface Config extends RelRule.Config {
    Config DEFAULT = EMPTY.as(Config.class)
        .withOperandSupplier(b0 ->
            b0.operand(LogicalFilter.class).anyInputs())
        .as(Config.class);

    @Override default FilterFutzRule toRule() {
      return new FilterFutzRule(this);
    }
  }
}
```

类名应指示匹配的基本 RelNode 类型，有时后跟规则的作用，然后是单词 `Rule` 。示例： `ProjectFilterTransposeRule` 、 `FilterMergeRule` 。

该规则必须有一个以 `Config` 作为参数的构造函数。它应该是 `protected` ，并且只会从 `Config.toRule()` 调用。

该类必须包含一个名为 `Config` 的接口，该接口扩展 `RelRule.Config` （或规则的超类的配置）。

`Config` 必须实现 `toRule` 方法并创建规则。

`Config` 必须有一个名为 `DEFAULT` 的成员来创建典型配置。至少，它必须调用 `withOperandSupplier` 来创建典型的算子树。

该规则不应具有静态 `INSTANCE` 字段。持有者类中应该有一个规则实例，例如 `CoreRules` 或 `EnumerableRules` ：

```java
public class CoreRules {
  ...

  /** Rule that matches a {@link Filter} and futzes with it. */
  public static final FILTER_FUTZ = FilterFutzRule.Config.DEFAULT.toRule();
}
```

持有者类可以包含具有不同参数的规则的其他实例（如果常用）。

如果规则是使用多种操作数模式实例化的（例如，使用相同 RelNode 基类的不同子类，或者使用不同的谓词），则配置可能包含一个方法 `withOperandFor` 以使其更容易构建常见的操作数模式（参见 `FilterAggregateTransposeRule` 示例）。 

# 提交者的高级主题

以下部分是 Calcite 提交者，特别是发布经理感兴趣的。

## 通过 GitHub 管理 Calcite 仓库

提交者拥有对 Calcite 的 [ASF git 存储库](https://gitbox.apache.org/repos/asf#calcite)的写入权限，该存储库托管项目的源代码以及网站。

GitBox 上的所有存储库都可以在 GitHub 上使用，并启用写入访问权限，包括打开/关闭/合并拉取请求和解决问题的权限。

为了利用 GitHub 服务，提交者应通过[帐户链接页面](https://gitbox.apache.org/setup/)链接其 ASF 和 GitHub 帐户。

步骤如下：

- 将你的 GitHub 用户名设置到你的 [Apache 配置文件](https://id.apache.org/)中；
- 在你的 GitHub 帐户上启用 [GitHub 2FA](https://help.github.com/articles/securing-your-account-with-two-factor-authentication-2fa/)；
- 激活 GitHub 2FA 会更改身份验证过程，并可能影响你[访问 GitHub](https://help.github.com/en/github/authenticating-to-github/accessing-github-using-two-factor-authentication#using-two-factor-authentication-with-the-command-line) 的方式。你可能需要建立个人访问令牌或将公共 SSH 密钥上传到 GitHub，具体取决于你使用的协议（HTTPS 与 SSH）；
- 使用[帐户链接页面](https://gitbox.apache.org/setup/)合并你的 Apache 和 GitHub 帐户（你应该在 GitBox 中看到 3 个绿色对勾）；
- 至少等待 30 分钟，你将收到邀请你加入 Apache GitHub 组织的电子邮件；
- 接受邀请并验证你是[团队成员](https://github.com/orgs/apache/teams/calcite-committers/members)。

## 合并拉取请求

这些是针对 Calcite 提交者的说明，他已审查了贡献者的拉取请求，发现它令人满意，并将其合并到 main。通常贡献者不是提交者（否则，在你在审查中批准后，他们会自己提交）。

有些类型的持续集成测试不会针对 PR 自动运行。可以通过向 PR 添加适当的标签来显式触发这些测试。例如，你可以通过添加 `slow-tests-needed` 标签来运行慢速测试。由你决定是否需要在合并之前运行这些附加测试。

如果 PR 有多个提交，请将它们压缩为单个提交。提交消息应遵循[贡献指南](https://calcite.apache.org/develop/#contributing)中概述的约定。如果存在冲突，最好要求贡献者执行此步骤，否则最好手动执行此操作，因为这样可以节省时间，也可以避免向 GitHub 上的许多人发送不必要的通知消息。

如果通过命令行（而不是通过 GitHub Web 界面）执行合并，请确保消息包含一行 `Close apache/calcite#YYY`，其中 YYY 是 GitHub 拉取请求标识符。

当 PR 合并并推送后，请务必更新 JIRA 案例。你必须：

- 解决问题（不要关闭它，因为这将由发布经理完成）；
- 选择`已修复`作为解决原因；
- 在`修复版本`字段中标记适当的版本（例如 1.20.0）；
- 添加评论（例如，`已修复……`），其中包含指向解决问题的提交的超链接（在 GitHub 或 GitBox 中），并感谢贡献者的贡献（如果贡献者是已经是提交者了）。提供的超链接应该是相对于主分支的。你应该能够通过浏览来识别提交——https://github.com/apache/calcite/commits/main/。

## 设置 PGP 签名密钥

按照[此处](https://www.apache.org/dev/release-signing)的说明创建密钥对（在 macOS 上，我执行了 `brew install gpg` 和 `gpg --full-generate-key`）。

按照 [KEYS](https://dist.apache.org/repos/dist/release/calcite/KEYS) 文件中的说明将你的公钥添加到 `KEYS` 文件中。如果你没有更新 `KEYS` 文件的权限，请向 PMC 寻求帮助（ `KEYS` 文件不存在于 git 存储库或发布 tar 球中，因为这是[多余的](https://issues.apache.org/jira/browse/CALCITE-1746)）。

为了能够制作候选版本，请确保将密钥上传到 https://keyserver.ubuntu.com 和/或 http://pool.sks-keyservers.net:11371（Nexus 使用的密钥服务器）。

## 设置 Nexus 存储库凭据

Gradle 提供了多种[配置项目属性](https://docs.gradle.org/current/userguide/build_environment.html#sec:gradle_configuration_properties)的方法。例如，你可以更新 `$HOME/.gradle/gradle.properties`。

注意：构建脚本会打印缺少的属性，因此你可以尝试运行它并让它抱怨缺少的属性。

使用以下选项：

```properties
asfCommitterId=

asfNexusUsername=
asfNexusPassword=
asfSvnUsername=
asfSvnPassword=

asfGitSourceUsername=
asfGitSourcePassword=
```

注意：

- `asfNexusUsername` 和 `asfSvnUsername` 都是你的 apache id， `asfNexusPassword` 和 `asfSvnPassword` 是相应的密码；
- Git 源帐户可以配置为 Gitbox（默认）或 Github。对于 Gitbox， `asfGitSourceUsername` 是你的 apache id， `asfGitSourcePassword` 是相应的密码。对于 Github， `asfGitSourceUsername` 是你的 GitHub id，而 `asfGitSourcePassword` 不是你的 GitHub 密码，你需要在 https://github.com/settings/tokens 中选择 `Personal access tokens`。

当使用 [asflike-release-environment](https://github.com/vlsi/asflike-release-environment) 时，凭据取自 `asfTest...` （例如 `asfTestNexusUsername=test` ）

注意：如果你想使用 `gpg-agent` ，你需要传递一些更多的属性：

```properties
useGpgCmd=true
signing.gnupg.keyName=
signing.gnupg.useLegacyGpg=
```

## 制作快照

在你开始之前：

- 确保你使用的是 JDK 8。注意：如果你使用基于 OpenJDK 的 Java，则需要 Java 8u202 或更高版本。
- 使用 `-Dcalcite.test.db=hsqldb` （默认）确保构建和测试成功。

```bash
# Make sure that there are no junk files in the sandbox
git clean -xn
# Publish snapshot artifacts
./gradlew clean publish -Pasf
```

## 制作候选版本

注意：发布构建（`dist.apache.org` 和 `repository.apache.org`）通过 [stage-vote-release-plugin](https://github.com/vlsi/vlsi-release-plugins/tree/master/plugins/stage-vote-release-plugin) 进行管理。

在你开始之前：

- 请查阅[发布仪表板](https://issues.apache.org/jira/secure/Dashboard.jspa?selectPageId=12333950)以快速了解发布状态，并采取适当的操作来解决待处理的票证或将其移至另一个版本/待办事项；
- 发送电子邮件至 dev@calcite.apache.org 通知 RC 构建过程正在启动，因此 `main` 分支处于代码冻结状态，直至另行通知；
- 如上所述设置签名密钥；
- 确保你使用的是 JDK 8（而不是 9 或 10）；
- 检查 `README` 和 `site/_docs/howto.md` 的版本号是否正确；
- 检查 `site/_docs/howto.md` 是否具有正确的 Gradle 版本；
- 检查 `NOTICE` 是否具有当前版权年份；
- 检查 `calcite.version` 在 `/gradle.properties` 中是否具有正确的值；
- 确保构建和测试成功；
- 确保 `./gradlew javadoc` 成功（即没有给出错误；警告也可以）；
- 使用 `./gradlew dependencyCheckUpdate dependencyCheckAggregate` 生成依赖项之间发生的漏洞的报告。如果在依赖项中发现新的严重漏洞，请向 private@calcite.apache.org 报告；
- 确定JDK、操作系统和Guava支持的配置。这些可能与先前版本的发行说明中描述的相同。将它们记录在发行说明中。要测试 Guava 版本 x.y，请指定 `-Pguava.version=x.y`；
- 使用属性的可选测试：
  - `-Dcalcite.test.db=mysql`；
  - `-Dcalcite.test.db=hsqldb`；
  - `-Dcalcite.test.mongodb`；
  - `-Dcalcite.test.splunk`。
- 使用任务的可选测试：
  - `./gradlew testSlow`；
- 将发行说明添加到 `site/_docs/history.md` 。如果要发布的版本已存在发行说明，但已被注释掉，请删除注释（ `{% comment %}` 和 `{% endcomment %}` ）。包括提交历史记录、对该版本做出贡献的人员姓名，并说明该版本针对哪些版本的 Java、Guava 和操作系统进行了测试；
- 确保每个[已解决的 JIRA 案例](https://issues.apache.org/jira/issues/?jql=project%20%3D%20CALCITE%20AND%20status%20%3D%20Resolved%20and%20fixVersion%20is%20null)（包括重复的案例）都分配了一个修复版本（很可能是我们即将发布的版本）。

生成贡献者列表：

```bash
# Commits since 1.35
range=calcite-1.35.0..HEAD
# distinct authors
git log --abbrev-commit --pretty=format:'%aN,' $range | sort -u
# most prolific authors
git log --abbrev-commit --pretty=format:'%aN' $range | sort | uniq -c | sort -nr
# number of JIRA cases
git log --abbrev-commit --pretty=format:'%f' $range | awk -F- '$1 == "CALCITE" {print $2}' | sort -u | wc
```

使用 Spatial 和 Oracle 函数表进行冒烟测试 `sqlline` ：

```bash
$ ./sqlline
> !connect jdbc:calcite:fun=spatial,oracle "sa" ""
SELECT NVL(ST_Is3D(ST_PointFromText('POINT(-71.064544 42.28787)')), TRUE);
+--------+
| EXPR$0 |
+--------+
| false  |
+--------+
1 row selected (0.039 seconds)
> !quit
```

候选版本进程不会添加提交，因此即使失败也不会造成任何影响。它可能会留下 `-rc` 标记，如果需要可以将其删除。

如果你愿意，你可以在 [asflike-release-environment](https://github.com/vlsi/asflike-release-environment) 的帮助下执行试运行发布；它会执行相同的步骤，但会将更改推送到模拟 Nexus、Git 和 SVN 服务器。

如果任何步骤失败，请解决问题，然后从头开始。

### 开始候选版本构建

选择一个候选版本索引并确保它不会干扰该版本之前的候选版本。

```bash
# Tell GPG how to read a password from your terminal
export GPG_TTY=$(tty)

# Make sure that there are no junk files in the sandbox
git clean -xn

# Dry run the release candidate (push to asf-like-environment)
./gradlew prepareVote -Prc=0

# Push release candidate to ASF servers
# If you prefer to use Github account, change pushRepositoryProvider to GITHUB
./gradlew prepareVote -Prc=0 -Pasf -Pasf.git.pushRepositoryProvider=GITBOX
```

### 故障排除

- `net.rubygrapefruit.platform.NativeException: Could not start 'svnmucc'` ：确保你的计算机中安装了 `svnmucc` 命令；
- `Execution failed for task ':closeRepository' ... Possible staging rules violation. Check repository status using Nexus UI` ：登录 Nexus UI 查看实际错误。如果是 `Failed: Signature Validation. No public key: Key with id: ... was not able to be located` ，请确保你已将密钥上传到 Nexus 使用的密钥服务器，请参阅上文；
- [[CALCITE-5573]](https://issues.apache.org/jira/browse/CALCITE-5573) 签署构建时 GradleprepareVote 失败；
- [[VLSI-RELEASE-PLUGINS-64]](https://github.com/vlsi/vlsi-release-plugins/issues/64) 由于缺少 `nexus.txt`，任务 `:releaseRepository` 执行失败。

### 检查构建

- `release/build/distributions` 目录中应包含以下 3 个文件，其中包括：
  - `apache-calcite-X.Y.Z-src.tar.gz`；
  - `apache-calcite-X.Y.Z-src.tar.gz.asc`；
  - `apache-calcite-X.Y.Z-src.tar.gz.sha512`。
- 请注意，文件名以 `apache-calcite-` 开头；
- 在源发行版 `.tar.gz` （当前没有二进制发行版）中，检查所有文件是否属于名为 `apache-calcite-X.Y.Z-src` 的目录；
- 该目录必须包含文件 `NOTICE` 、 `LICENSE` 、 `README` 、 `README.md`；
  - 检查 `README` 中的版本是否正确；
  - 检查 `NOTICE` 中的版权年份是否正确；
  - 检查 `LICENSE` 是否与签入 git 的文件相同。
- 确保以下文件不会出现在源发行版中： `KEYS` 、 `gradlew` 、 `gradlew.bat` 、 `gradle-wrapper.jar` 、 `gradle-wrapper.properties`；
- 确保源发行版中没有 `KEYS` 文件；
- 在每个 .jar（例如 `core/build/libs/calcite-core-X.Y.Z.jar` 和 `mongodb/build/libs/calcite-mongodb-X.Y.Z-sources.jar` ）中，检查 `META-INF` 目录是否包含 `LICENSE` 、 `NOTICE`；
- 检查 PGP，按照[此文档](https://httpd.apache.org/dev/verification.html)。

验证 Nexus 存储库中的暂存构建：

- 访问 https://repository.apache.org/ 并登录；
- 在 `Build Promotion` 下，单击 `Staging Repositories`；
- 在 `Staging Repositories` 选项卡中应该有一行包含配置文件 `org.apache.calcite` 和状态 `closed`；
- 浏览工件树并确保 .jar、.pom、.asc 文件存在。

## 尝试发布失败后进行清理

如果某些内容不正确，你可以修复它，提交它，并为下一个候选人做好准备。候选版本标签可能会保留一段时间。

## 验证发布

```bash
# Check that the signing key (e.g. DDB6E9812AD3FAE3) is pushed
gpg --recv-keys key

# Check keys
curl -O https://dist.apache.org/repos/dist/release/calcite/KEYS

# Sign/check sha512 hashes
# (Assumes your O/S has a 'shasum' command.)
function checkHash() {
  cd "$1"
  for i in *.{pom,gz}; do
    if [ ! -f $i ]; then
      continue
    fi
    if [ -f $i.sha512 ]; then
      if [ "$(cat $i.sha512)" = "$(shasum -a 512 $i)" ]; then
        echo $i.sha512 present and correct
      else
        echo $i.sha512 does not match
      fi
    else
      shasum -a 512 $i > $i.sha512
      echo $i.sha512 created
    fi
  done
}
checkHash apache-calcite-X.Y.Z-rcN
```

## 通过 Apache 投票流程获得发布批准

通过向开发者列表发送电子邮件来开始投票。如果成功完成，Gradle `prepareVote` 任务会在最后打印草稿邮件。你可以在 `/build/prepareVote/mail.txt` 中找到草稿。

投票结束后，发送结果：

```
Subject: [RESULT] [VOTE] Release apache-calcite-X.Y.Z (release candidate N)
To: dev@calcite.apache.org

Thanks to everyone who has tested the release candidate and given
their comments and votes.

The tally is as follows.

N binding +1s:
<names>

N non-binding +1s:
<names>

No 0s or -1s.

Therefore, I am delighted to announce that the proposal to release
Apache Calcite X.Y.Z has passed.

Thanks everyone. We’ll now roll the release out to the mirrors.

There was some feedback during voting. I shall open a separate
thread to discuss.

Julian
```

## 发布版本

成功发布投票后，我们需要将版本推送到镜像和其他任务。

选择发布日期。这是基于你预计宣布发布的时间。这通常是投票结束后的一天。请记住，UTC 日期在太平洋时间下午 4 点更改。

```bash
# Dry run publishing the release (push to asf-like-environment)
./gradlew publishDist -Prc=0

# Publish the release to ASF servers
# If you prefer to use Github account, change pushRepositoryProvider to GITHUB
./gradlew publishDist -Prc=0 -Pasf -Pasf.git.pushRepositoryProvider=GITBOX
```

如果由于某种原因 `publishDist` 任务失败（例如[未能发布 nexus 存储库](https://github.com/vlsi/vlsi-release-plugins/issues/64)，仍然可以手动执行发布任务。如果你不确定需要做什么，请在开发列表中寻求帮助。

如果 `releaseRepository` 任务打印如下内容：

```
> Task :releaseRepository
Initialized stagingRepositoryId orgapachecalcite-1219 for repository nexus
GET request failed. 404: Not Found, body: [errors:[[id:*, msg:No such repository: orgapachecalcite-1219]]]
Requested operation was executed successfully in attempt 83 (maximum allowed 601)
```

很可能存储库已成功发布，你可以在 [ASF Nexus](https://repository.apache.org/) 中检查它。

Svnpubsub 将发布到[发布存储库](https://dist.apache.org/repos/dist/release/calcite)并几乎立即传播到[镜像](https://www.apache.org/dyn/closer.cgi/calcite)。因此无需等待超过十五分钟即可宣布发布。

如果现在有超过 2 个版本，请清除最旧的版本：

```bash
cd ~/dist/release/calcite
svn rm apache-calcite-X.Y.Z
svn ci
```

旧版本将保留在[版本存档](https://archive.apache.org/dist/calcite/)中。

你应该会收到一封来自 [Apache Reporter Service]() 的电子邮件。请务必在电子邮件中链接的网站上添加最新版本的版本号和日期。

一旦发布提交/标签到达 ASF 远程并触发相应的 [Github 工作流程](https://github.com/apache/calcite/blob/main/.github/workflows/)，新版本的发行说明和 javadoc 将自动部署到网站。

通过复制 [site/_posts/2016-10-12-release-1.10.0.md](site/_posts/2016-10-12-release-1.10.0.md) 添加发布公告，并根据需要调整 `history.md` 中的发布日期。按照 [site/README.md](https://github.com/apache/calcite/blob/main/site/README.md) 中的说明在本地预览更改，然后提交更改并将其推送到 `main` 分支。请注意，由于 [CALCITE-5584](https://issues.apache.org/jira/browse/CALCITE-5584)，该提交应作为最后一次提交推送到 Github，不要将其与`准备下一次开发迭代`提交链接。

确保正确显示网站的所有更改（新闻、发行说明、javadoc）。

在 JIRA 中，搜索[此版本中解决的所有问题](https://issues.apache.org/jira/issues/?jql=project%20%3D%20CALCITE%20and%20fixVersion%20%3D%201.5.0%20and%20status%20%3D%20Resolved%20and%20resolution%20%3D%20Fixed)，然后进行批量更新（选择 `transition issues` 选项），将其状态更改为“已关闭”，并添加更改注释“已在版本 X.Y.Z (YYYY-MM) 中解决” -DD)”（适当填写版本号和日期）。取消选中“发送此更新的邮件”。在 Calcite 项目的[发布选项卡](https://issues.apache.org/jira/projects/CALCITE?selectedItem=com.atlassian.jira.jira-projects-plugin%3Arelease-page&status=released-unreleased)下，将发布 X.Y.Z 标记为已发布。如果尚不存在，请为下一个版本创建一个新版本（例如，X.Y+1.Z）。为了使[发布仪表板](https://issues.apache.org/jira/secure/Dashboard.jspa?selectPageId=12333950)反映下一个版本的状态，请更改为[仪表板提供支持的 JIRA 过滤器](https://issues.apache.org/jira/issues/?filter=12346388)中的修复版本并保存更改。

增加 `/gradle.properties` 中的 `calcite.version` 值，提交并推送更改，并显示消息“准备下一次开发迭代”（请参阅 [ed1470a](https://github.com/apache/calcite/commit/ed1470a3ea53a78c667354a5ec066425364eca73) 作为参考）。

重新打开 `main` 分支。发送电子邮件至 dev@calcite.apache.org 通知 `main` 代码冻结已结束并且可以恢复提交。

通过使用 `@apache.org` 地址向 announce@apache.org 发送电子邮件来宣布发布。你可以使用[1.20.0 公告](https://mail-archives.apache.org/mod_mbox/www-announce/201906.mbox/%3CCA%2BEpF8tcJcZ41rVuwJODJmyRy-qAxZUQm9OxKsoDi07c2SKs_A%40mail.gmail.com%3E)作为模板。请务必包含项目的简短描述。

## 发布网站

请参阅 [site/README.md](https://github.com/apache/calcite/blob/main/site/README.md) 中的说明 。

# PMC 成员的高级主题

## 处理 JIRA 帐户请求

以下是一些在处理添加 JIRA 帐户作为贡献者的请求时可以使用的电子邮件模板。

### 帐户已添加到贡献者列表

```
Hello [INSERT NAME HERE],

Thanks for your interest in becoming a Calcite contributor! I have added your username ([INSERT USERNAME HERE])
to the contributors group in JIRA. Happy contributing!

If you have not subscribed to our development list (dev@calcite.apache.org) yet, I encourage you to do so by
emailing dev-subscribe@calcite.apache.org. Further information about our mailing lists is available here:
https://calcite.apache.org/community/#mailing-lists

Best regards,
[INSERT YOUR NAME HERE]
```

### 找不到帐户

```
Hello [INSERT NAME HERE],

Thanks for your interest in becoming a Calcite contributor! I am sorry to inform you that I was unable to
find your account ([INSERT USERNAME HERE]) in JIRA and was not able to add you to the contributors group.
Please let me know the correct username by return email and I will process your request again.

If you do not have an ASF JIRA account, please follow the instructions here to request one:
https://calcite.apache.org/develop/#i-do-not-have-an-asf-jira-account-want-to-request-an-account-and-be-added-as-a-contributor

Best regards,
[INSERT YOUR NAME HERE]
```



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

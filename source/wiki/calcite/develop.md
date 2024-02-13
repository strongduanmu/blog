---
layout: wiki
wiki: calcite
order: 203
title: 开发 Calcite
date: 2024-02-13 09:00:00
---

> 原文链接：https://calcite.apache.org/develop/

想要帮助添加功能或修复错误吗？

## 源代码

你可以通过[下载 Release 版本](https://calcite.apache.org/downloads)或从源代码控制获取源代码。

Calcite 使用 git 进行版本控制。标准源位于 Apache，但大多数人发现 Github 镜像更加用户友好。

## 下载源码、构建并运行测试

前提条件是你的路径上有 Git 和 Java（JDK 8u220 或更高版本，首选 11）。

注意：早期的 OpenJDK 1.8 版本（例如 1.8u202 之前的版本）已知在为类型注释生成字节码时存在问题（请参阅[JDK-8187805](https://bugs.openjdk.java.net/browse/JDK-8187805)、 [JDK-8187805](https://bugs.openjdk.java.net/browse/JDK-8187805)、 [JDK-8210273](https://bugs.openjdk.java.net/browse/JDK-8210273)、 [JDK-8160928](https://bugs.openjdk.java.net/browse/JDK-8160928)、 [JDK-8144185](https://bugs.openjdk.java.net/browse/JDK-8144185)），因此请确保你使用的是最新的 Java。

创建 Git 存储库的本地副本 `cd` 到其根目录，然后使用 Gradle 进行构建：

```bash
$ git clone https://github.com/apache/calcite.git
$ cd calcite
$ ./gradlew build
```

HOWTO 描述了如何[从源代码发行版进行构建](https://calcite.apache.org/docs/howto.html#building-from-a-source-distribution)、[设置用于贡献的 IDE](https://calcite.apache.org/docs/howto.html#setting-up-an-ide-for-contributing)、[运行更多或更少的测试](https://calcite.apache.org/docs/howto.html#running-tests)以及[运行集成测试](https://calcite.apache.org/docs/howto.html#running-integration-tests)。

## JIRA 帐户

Calcite 使用 [JIRA](https://issues.apache.org/jira/browse/CALCITE) 进行问题/案例管理。你必须拥有 JIRA 帐户才能记录案例和问题。

### 我已经有一个 ASF JIRA 帐户并希望添加为贡献者

如果你已有 ASF JIRA 帐户，则无需注册新帐户。请使用以下模板发送电子邮件至 jira-requests@calcite.apache.org，以便我们将你的帐户添加到 JIRA 的贡献者列表中：

[[在你的电子邮件客户端中打开模板]](mailto:jira-requests@calcite.apache.org?subject=Add me as a contributor to JIRA&body=Hello, Please add me as a contributor to JIRA. My JIRA username is: [INSERT YOUR JIRA USERNAME HERE] Thanks, [INSERT YOUR NAME HERE])

```
Subject: Add me as a contributor to JIRA

Hello,

Please add me as a contributor to JIRA.
My JIRA username is: [INSERT YOUR JIRA USERNAME HERE]

Thanks,
[INSERT YOUR NAME HERE]
```

### 我没有 ASF JIRA 帐户，想要申请一个帐户并添加为贡献者

请使用 [ASF 的自助服务设施](https://selfserve.apache.org/jira-account.html)申请帐户。

## 贡献

我们欢迎贡献。

如果你打算做出重大贡献，请先与我们联系！它有助于就总体方法达成一致。为你提议的功能记录 [JIRA 案例](https://issues.apache.org/jira/browse/CALCITE)或在开发列表上开始讨论。

在打开新的 JIRA 案例之前，请查看现有问题。你计划处理的功能或错误可能已经存在。

如果需要创建一个新问题，提供简洁且有意义的摘要行非常重要。它应该暗示最终用户试图做什么、在哪个组件中以及看到了什么问题。如果不清楚所需的行为是什么，请改写：例如，`验证器关闭模型文件`为`验证器不应关闭模型文件`。

该案例的贡献者应随时重新措辞并澄清摘要内容。如果你在澄清时删除了信息，请将其放入案例描述中。

设计讨论可能发生在不同的地方（电子邮件线程、Github 评论），但 JIRA 案例是这些讨论的典型场所。链接到它们或在案例中总结它们。

在实现案例时，尤其是新功能时，请确保案例包含变更的功能规范。例如，`在 CREATE TABLE 命令中添加 IF NOT EXISTS 子句；如果表已经存在，则该命令是无操作的`。如果规范在设计讨论或实施期间发生变化，请更新描述。

在实现功能或修复错误时，请在开始处理代码之前尝试创建 JIRA 案例。这让其他人有机会在你走得太远（审阅者认为是）错误的道路之前塑造该功能。

寻求与问题相关的反馈的最佳位置是开发人员列表。请避免在 JIRA 案例中标记特定人员以寻求反馈。这阻碍了其他贡献者参与讨论并提供有价值的反馈。

如果存在似乎与特定提交相关的回归，请随时在讨论中标记相应的贡献者。

如果你要立即处理该问题，请立即将其分配给你自己。要将问题分配给自己，你必须在 JIRA 中注册为贡献者。为此，请按照 JIRA 帐户部分中概述的说明进行操作。

如果你致力于在即将发布的版本之前解决问题，请相应地设置修复版本（例如 1.20.0），否则将其留空。

如果你发现一个现有问题，请将其标记为`正在进行`，并在完成后将其标记为 `pull-request-available`。

如果出于任何原因你决定某个问题不能进入正在进行的版本，请将修复版本重置为空白。

在发布期间，发布经理会将当前版本未完成的问题更新到下一个版本。

在某些情况下，JIRA 问题可能会在讨论（或其他原因）中得到解决，而无需进行更改。在这种情况下，参与讨论的贡献者应该：

- 解决问题（不要关闭它）；
- 选择适当的解决原因（`重复`、`无效`、`无法修复`等）；
- 如果不明显，请添加带有推理的评论。

Fork GitHub 存储库，并为你的功能创建一个分支。

开发你的功能和测试用例，并确保 `./gradlew build` 成功（如果你的更改需要的话，请运行额外的测试）。

将更改提交到你的分支，并使用以 JIRA 案例编号开头的注释，如下所示：

```
[CALCITE-345] AssertionError in RexToLixTranslator comparing to date literal
```

如果你的更改有多个提交，请使用 `git rebase -i main` 将它们压缩为单个提交，并使你的代码与主线上的最新代码保持同步。

为了保持提交历史记录的干净和统一，你应该遵守以下准则。

- 阅读以前提交的消息，并遵循他们的风格；
- 提交消息的第一行必须是对更改的简洁且有用的描述；
- 该消息通常（但并非总是）与 JIRA 主题相同。如果 JIRA 主题不清楚，请更改它（如果澄清的话，可以将原始主题移至 JIRA 案例的描述中）；
- 在 JIRA id 后保留一个空格字符；
- 以大写字母开头；
- 不要以句号结束；
- 使用祈使语气（`添加处理程序…… Add a handler …`）而不是过去时（`添加处理程序…… Added a handler …`）或现在时（`添加处理程序…… Adds a handler …`）；
- 如果可能，请描述你更改的用户可见行为（`FooCommand 现在创建目录，如果它不存在`），而不是实现（`为 FileNotFound 添加处理程序`）；
- 如果你正在修复错误，那么描述该错误就足够了（`如果用户未知，则出现 NullPointerException`），人们会正确地推测你的更改的目的是修复该错误。

然后将你的提交推送到 GitHub，并创建从你的分支到方解石主分支的拉取请求。更新 JIRA 案例以引用你的拉取请求，提交者将审查你的更改。

拉取请求可能需要更新（提交后），主要原因有以下三个：

1. 你在提交拉取请求后发现了问题；
2. 审稿人要求进一步修改；
3. CI 构建失败，并且失败不是由你的更改引起的。

为了更新拉取请求，你需要在分支中提交更改，然后将提交推送到 GitHub。我们鼓励你在以前现有的提交之上使用常规（non-rebased）提交。

将更改推送到 GitHub 时，你应该避免使用 `--force` 参数及其替代方案。你可以选择在某些条件下强制推送更改：

- 拉取请求是在不到 10 分钟前提交的，并且没有与之相关的待讨论（在 PR 和/或 JIRA 中）；
- 审阅者明确要求你执行一些需要使用 `--force` 选项的修改。

在特殊情况下，CI 构建失败，并且失败不是由你的更改引起的，创建一个空提交 ( `git commit --allow-empty` ) 并推送它。

## 空安全

Apache Calcite 使用 Checker Framework 来避免意外的 `NullPointerExceptions` 。你可以在 https://checkerframework.org/ 找到详细的文档。

注意：目前仅验证主代码，因此在测试代码中不强制执行 nullness 注释。

要在本地执行 Checker 框架，请使用以下命令：

```bash
./gradlew -PenableCheckerframework :linq4j:classes :core:classes
```

下面简单介绍一下空安全编程：

- 默认情况下，参数、返回值和字段不可为 null，因此请不要使用 `@NonNull`；

- 局部变量从表达式推断为空，因此你可以编写 `Object v = ...` 而不是 `@Nullable Object v = ...`；

- 避免使用 `javax.annotation.*` 注释。 `jsr305` 中的注释不支持 `List<@Nullable String>` 等情况，因此最好坚持使用 `org.checkerframework.checker.nullness.qual.Nullable` 。不幸的是，Guava（从 `29-jre` 开始）同时具有 `jsr305` 和 `checker-qual` 依赖项，因此你可能需要配置 IDE 以排除 `javax.annotation.*` 来自代码完成的注释；

- Checker 框架逐个验证代码。这意味着，它无法解释方法执行顺序。这就是为什么 `@Nullable` 字段应该在使用它们的每个方法中进行验证。如果将逻辑拆分为多个方法，你可能需要验证一次 null，然后通过不可为 null 的参数传递它。对于以 null 开头并随后变为非 null 的字段，请使用 `@MonotonicNonNull` 。对于已检查是否为 null 的字段，请使用 `@RequiresNonNull`；

- 如果你绝对确定该值不为空，则可以使用 `org.apache.calcite.linq4j.Nullness.castNonNull(T)` 。 `castNonNull` 背后的意图就像 `trustMeThisIsNeverNullHoweverTheVerifierCantTellYet(...)`；

- 但是，如果表达式可为空，则需要将其传递给非空方法，请使用 `Objects.requireNonNull` 。它允许获得包含上下文信息的更好的错误消息；

- Checker Framework 附带了带注释的 JDK，但是，可能存在无效注释。在这种情况下，可以将存根文件放置到 `/src/main/config/checkerframework` 以覆盖注释。文件具有 `.astub` 扩展名非常重要，否则它们将被忽略；

- 在数组类型中，类型注释紧邻其引用的类型组件（数组或数组组件）之前出现。 [Java 语言规范](https://docs.oracle.com/javase/specs/jls/se8/html/jls-9.html#jls-9.7.4)对此进行了解释。

```java
String nonNullable;
@Nullable String nullable;

java.lang.@Nullable String fullyQualifiedNullable;

// array and elements: non-nullable
String[] x;

// array: nullable, elements: non-nullable
String @Nullable [] x;

// array: non-nullable, elements: nullable
@Nullable String[] x;

// array: nullable, elements: nullable
@Nullable String @Nullable [] x;

// arrays: nullable, elements: nullable
// x: non-nullable
// x[0]: non-nullable
// x[0][0]: nullable
@Nullable String[][] x;

// x: nullable
// x[0]: non-nullable
// x[0][0]: non-nullable
String @Nullable [][] x;

// x: non-nullable
// x[0]: nullable
// x[0][0]: non-nullable
String[] @Nullable [] x;
```

- 默认情况下，泛型参数可以为可为空和不可为空：

```java
class Holder<T> { // can be both nullable
    final T value;
    T get() {
        return value; // works
    }
    int hashCode() {
        return value.hashCode(); // error here since T can be nullable
    }
```

- 但是，默认边界是不可为空的，因此如果你编写 `<T extends Number>` ，那么它与 `<T extends @NonNull Number>` 相同：

```
class Holder<T extends Number> { // note how this T never permits nulls
    final T value;
    Holder(T value) {
        this.value = value;
    }
    static <T> Holder<T> empty() {
        return new Holder<>(null); // fails since T must be non-nullable
    }
```

- 如果你需要“可为空或不可为空 `Number` ”，则使用 `<T extends @Nullable Number>`。如果需要确保类型始终可为空，请使用 `<@Nullable T>` ，如下所示：

```java
class Holder<@Nullable T> { // note how this requires T to always be nullable
    protected T get() { // Default implementation.
        // Default implementation returns null, so it requires that T must always be nullable
        return null;
    }
    static void useHolder() {
        // T is declared as <@Nullable T>, so Holder<String> would not compile
        Holder<@Nullable String> holder = ...;
        String value = holder.get();
    }
```

## 持续集成测试

Calcite 利用 [GitHub Actions](https://github.com/apache/calcite/actions?query=branch%3Amain) 进行持续集成测试。

## 入门

Calcite 是一个社区，因此加入该项目的第一步是自我介绍。加入[开发人员列表](https://mail-archives.apache.org/mod_mbox/calcite-dev/)并发送电子邮件。

如果你有机会参加[聚会](https://www.meetup.com/Apache-Calcite/)，或在会议上与[社区成员](https://calcite.apache.org/develop/#project-members)见面，那也很棒。

选择要执行的初始任务。它应该是非常简单的事情，例如错误修复或我们[标记为新手的 Jira 任务](https://issues.apache.org/jira/issues/?jql=labels%20%3D%20newbie%20%26%20project%20%3D%20Calcite%20%26%20status%20%3D%20Open)。请遵循[贡献指南](https://calcite.apache.org/develop/#contributing)来承诺你的更改。

我们重视所有有助于建立充满活力的社区的贡献，而不仅仅是代码。你可以通过测试代码、帮助验证版本、编写文档、改进网站或仅回答列表中的问题来做出贡献。

在你做出一些有用的贡献后，我们可能会邀请你成为[提交者](https://community.apache.org/contributors/)。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

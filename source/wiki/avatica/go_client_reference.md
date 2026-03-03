---
layout: wiki
wiki: avatica
order: 013
title: Go 客户端参考
date: 2025-01-30 17:00:00
banner: /assets/banner/banner_1.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/go_client_reference.html

Avatica Go 客户端是一个用于 Go [database/sql](https://golang.org/pkg/database/sql/) 包的 Avatica 驱动程序。

它也可以与 Apache Phoenix 项目的 Phoenix Query Server 一起使用，因为 Phoenix Query Server 底层使用 Avatica。

* TOC
{:toc}

## 快速入门
使用 Go modules 安装：

```shell
$ go get github.com/apache/calcite-avatica-go
```


## 使用方法

Avatica Go 驱动程序实现了 Go 的 `database/sql/driver` 接口，因此，需要导入 Go 的 `database/sql` 包和驱动程序：

```go
import "database/sql"
import _ "github.com/apache/calcite-avatica-go/v5"

db, err := sql.Open("avatica", "http://localhost:8765")
```

然后简单地使用数据库连接来查询数据，例如：

```go
rows := db.Query("SELECT COUNT(*) FROM test")
```

## DSN（数据源名称）

DSN 的格式如下（可选部分用方括号标记）：

```shell
http://address:port[/schema][?parameter1=value&...parameterN=value]
```

换句话说，协议（http）、地址和端口是必需的，但 schema（模式）和参数是可选的。

<strong><a name="schema" href="#schema">schema</a></strong>

`schema` 路径设置此连接使用的默认 schema（模式）。例如，如果将其设置为 `myschema`，则执行查询 `SELECT * FROM my_table` 将等同于 `SELECT * FROM myschema.my_table`。如果设置了 schema，仍然可以通过提供 schema 前缀来操作其他 schema 中的表：`SELECT * FROM myotherschema.my_other_table`。

参数尽可能引用 Java 实现使用的选项。支持以下参数：

<strong><a name="authentication" href="#authentication">authentication</a></strong>

对 Avatica 进行身份验证时使用的身份验证类型。有效值为 `BASIC`（HTTP Basic 认证）、`DIGEST`（HTTP Digest 认证）和 `SPNEGO`（Kerberos with SPNEGO 认证）。

<strong><a name="avaticaUser" href="#avaticaUser">avaticaUser</a></strong>

对 Avatica 进行身份验证时使用的用户名。如果 `authentication` 为 `BASIC` 或 `DIGEST`，则此参数是必需的。

<strong><a name="avaticaPassword" href="#avaticaPassword">avaticaPassword</a></strong>

对 Avatica 进行身份验证时使用的密码。如果 `authentication` 为 `BASIC` 或 `DIGEST`，则此参数是必需的。

<strong><a name="principal" href="#principal">principal</a></strong>

对 Avatica 进行身份验证时使用的 Kerberos principal（主体）。它应该采用 `primary/instance@realm` 的形式，其中 instance 是可选的。如果 `authentication` 为 `SPNEGO` 并且您希望驱动程序执行 Kerberos 登录，则此参数是必需的。

<strong><a name="keytab" href="#keytab">keytab</a></strong>

对 Avatica 进行身份验证时使用的 Kerberos keytab 的路径。如果 `authentication` 为 `SPNEGO` 并且您希望驱动程序执行 Kerberos 登录，则此参数是必需的。

<strong><a name="krb5Conf" href="#krb5Conf">krb5Conf</a></strong>

对 Avatica 进行身份验证时使用的 Kerberos 配置文件的路径。如果 `authentication` 为 `SPNEGO` 并且您希望驱动程序执行 Kerberos 登录，则此参数是必需的。

<strong><a name="krb5CredentialsCache" href="#krb5CredentialsCache">krb5CredentialsCache</a></strong>

对 Avatica 进行身份验证时使用的 Kerberos credential cache（凭据缓存）文件的路径。如果 `authentication` 为 `SPNEGO` 并且您已经登录 Kerberos 并希望驱动程序使用现有凭据，则此参数是必需的。

<strong><a name="location" href="#location">location</a></strong>

`location` 将被设置为反序列化的 `time.Time` 值的位置。它必须是一个有效的时区。如果要使用本地时区，请使用 `Local`。默认情况下，此值设置为 `UTC`。

<strong><a name="maxRowsTotal" href="#maxRowsTotal">maxRowsTotal</a></strong>

`maxRowsTotal` 参数设置给定查询返回的最大行数。默认情况下，此值设置为 `-1`，因此对返回的行数没有限制。

<strong><a name="frameMaxSize" href="#frameMaxSize">frameMaxSize</a></strong>

`frameMaxSize` 参数设置一个 frame（帧）中返回的最大行数。根据返回的行数并受 `maxRowsTotal` 限制，查询结果集可以在多个帧中包含行。这些额外的帧将根据需要获取。`frameMaxSize` 允许您控制每个帧中的行数，以适应应用程序的性能特征。默认情况下，此值设置为 `-1`，因此对帧中的行数没有限制。

<strong><a name="transactionIsolation" href="#transactionIsolation">transactionIsolation</a></strong>

设置 `transactionIsolation` 允许您使用连接设置事务的隔离级别。该值应该是一个正整数，类似于 JDBC 规范定义的事务级别。默认值为 `0`，这意味着不支持事务。这是为了处理 Calcite/Avatica 与多种类型的后端一起工作的事实，其中一些后端没有事务支持。如果您使用 Apache Phoenix 4.7 或更高版本，我们建议将其设置为 `4`，这是支持的最大隔离级别。

`transactionIsolation` 支持的值为：

| 值 | JDBC 常量                       | 描述                                                                              |
|:---|:--------------------------------|:----------------------------------------------------------------------------------|
| 0  | none                            | 不支持事务                                                                        |
| 1  | `TRANSACTION_READ_UNCOMMITTED`  | 可能发生脏读、不可重复读和幻读。                                                  |
| 2  | `TRANSACTION_READ_COMMITTED`    | 防止脏读，但可能发生不可重复读和幻读。                                            |
| 4  | `TRANSACTION_REPEATABLE_READ`   | 防止脏读和不可重复读，但可能发生幻读。                                            |
| 8  | `TRANSACTION_SERIALIZABLE`      | 防止脏读、不可重复读和幻读。                                                      |

<strong><a name="batching" href="#batching">batching</a></strong>

当您想要写入大量数据时，可以启用批处理，而不是为每次执行调用服务器。通过使用 [ExecuteBatchRequest](https://calcite.apache.org/avatica/docs/protobuf_reference.html#executebatchrequest)，驱动程序将批处理 `Exec()` 并在使用 `Close()` 关闭语句时将它们发送到服务器。语句对象是线程安全的，可以被多个 go-routine 使用，但只有在语句关闭后，更改才会发送到服务器。

```go
// 使用 phoenix 时
stmt, _ := db.Prepare(`UPSERT INTO ` + dbt.tableName + ` VALUES(?)`)
var wg sync.WaitGroup
for i := 1; i <= 6; i++ {
    wg.Add(1)
    go func(num int) {
        defer wg.Done()

        _, err := stmt.Exec(num)

        if err != nil {
            dbt.Fatal(err)
        }
    }(i)
}
wg.Wait()

// 当 batching=true 时，只有在调用 Close() 时才会执行语句
err = stmt.Close()
```

## time.Time 支持

以下数据类型会自动转换为 `time.Time` 或从 `time.Time` 转换：`TIME`、`DATE` 和 `TIMESTAMP`。

重要的是要理解 Avatica 和底层数据库会忽略时区。如果将 `time.Time` 保存到数据库，时区将被忽略，反之亦然。这就是为什么您需要确保 DSN 中的 `location` 参数设置为与您插入数据库的 `time.Time` 值的位置相同的值。

我们建议使用 `UTC`，这是 `location` 的默认值。

## Apache Phoenix 错误代码
Go 客户端支持在发生错误时检索错误代码。当您希望在发生特定类型的错误时采取特定操作时，这非常有用。

如果返回的错误是 ResponseError，则错误上的 `Name` 字段将返回相应的 Apache Phoenix 错误代码：

```go
_, err := db.Exec("SELECT * FROM table_that_does_not_exist") // 查询未定义的表

// 首先，断言错误类型
perr, ok := err.(avatica.ResponseError)

// 如果无法断言
if !ok {
    // 错误不是 Avatica ResponseError
}

// 打印 Apache Phoenix 错误代码
fmt.Println(perr.Name) // 输出：table_undefined
```

## 版本兼容性

| 驱动程序版本 | Phoenix 版本 | Calcite-Avatica 版本 |
|:-------------|:-------------|:---------------------|
| 3.x.x        | >= 4.8.0     | >= 1.11.0            |

{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

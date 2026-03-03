---
layout: wiki
wiki: avatica
order: 007
title: 安全
date: 2025-01-30 16:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/security.html

安全是客户端与 Avatica 服务器之间的一个重要话题。大多数 JDBC 驱动程序和数据库都实现了某种程度的身份验证和授权，以限制客户端允许执行的操作。

同样，Avatica 也必须限制哪些用户可以连接和与服务器交互。Avatica 主要处理身份验证，而授权则委托给底层数据库。默认情况下，Avatica 不提供任何身份验证。Avatica 确实能够使用 Kerberos、HTTP Basic 和 HTTP Digest 进行客户端身份验证。

Avatica 提供的身份验证和授权旨在*替代*底层数据库提供的身份验证和授权。典型的 `user` 和 `password` JDBC 属性**始终**会传递给 Avatica 服务器，这将导致服务器强制执行这些凭据。因此，这里提到的 Avatica 身份验证类型仅在未使用底层数据库的身份验证和授权功能时才有意义。（Kerberos/SPNEGO 集成是一个例外，因为模拟功能专门设计用于将 Kerberos 身份传递给数据库——如果需要，新的高级实现也可以遵循相同的方法）。

## 目录
{: #table-of-contents }

* [HTTP Basic 身份验证](#http-basic-authentication)
* [HTTP Digest 身份验证](#http-digest-authentication)
* [Kerberos 与 SPNEGO 身份验证](#kerberos-with-spnego-authentication)
* [自定义身份验证](#custom-authentication)
* [客户端实现](#client-implementation)
* [TLS](#tls)

## HTTP Basic 身份验证
{: #http-basic-authentication }

Avatica 支持通过 [HTTP Basic](https://en.wikipedia.org/wiki/Basic_access_authentication) 进行身份验证。这是一种基于用户名-密码的简单身份验证方式，在不受信任的网络上操作时最终是不安全的。Basic 身份验证仅在传输加密（例如 TLS）时才是安全的，因为凭据是以明文形式传递的。此身份验证是对所提供的 JDBC 身份验证的补充。如果凭据已经传递给数据库，则此身份验证是不必要的。

### 启用 Basic 身份验证

```java
String propertiesFile = "/path/to/jetty-users.properties";
// 允许所有角色
String[] allowedRoles = new String[]  {"*"};
// 只允许特定角色
allowedRoles = new String[] { "users", "admins" };
HttpServer server = new HttpServer.Builder()
    .withPort(8765)
    .withHandler(new LocalService(), Driver.Serialization.PROTOBUF)
    .withBasicAuthentication(propertiesFile, allowedRoles)
    .build();
```

属性文件必须采用 Jetty 可使用的格式。此文件中的每一行格式为：`username: password[,rolename ...]`

例如：

```properties
bob: b0b5pA55w0rd,users
steve: 5teve5pA55w0rd,users
alice: Al1cepA55w0rd,admins
```

密码也可以混淆为 MD5 哈希或单向加密（"CRYPT"）。有关更多信息，请参阅 [Jetty 官方文档](http://www.eclipse.org/jetty/documentation/current/configuring-security-secure-passwords.html)。

## HTTP Digest 身份验证
{: #http-digest-authentication }

Avatica 还支持 [HTTP Digest](https://en.wikipedia.org/wiki/Digest_access_authentication)。这对 Avatica 来说是可取的，因为它不需要使用 TLS 来保护 Avatica 客户端和服务器之间的通信。其配置与 HTTP Basic 身份验证非常相似。此身份验证是对所提供的 JDBC 身份验证的补充。如果凭据已经传递给数据库，则此身份验证是不必要的。

### 启用 Digest 身份验证

```java
String propertiesFile = "/path/to/jetty-users.properties";
// 允许所有角色
String[] allowedRoles = new String[]  {"*"};
// 只允许特定角色
allowedRoles = new String[] { "users", "admins" };
HttpServer server = new HttpServer.Builder()
    .withPort(8765)
    .withHandler(new LocalService(), Driver.Serialization.PROTOBUF)
    .withDigestAuthentication(propertiesFile, allowedRoles)
    .build();
```

属性文件必须采用 Jetty 可使用的格式。此文件中的每一行格式为：`username: password[,rolename ...]`

例如：

```properties
bob: b0b5pA55w0rd,users
steve: 5teve5pA55w0rd,users
alice: Al1cepA55w0rd,admins
```

密码也可以混淆为 MD5 哈希或单向加密（"CRYPT"）。有关更多信息，请参阅 [Jetty 官方文档](http://www.eclipse.org/jetty/documentation/current/configuring-security-secure-passwords.html)。

## Kerberos 与 SPNEGO 身份验证
{: #kerberos-with-spnego-authentication }

由于 Avatica 通过 HTTP 接口操作，简单受保护的 GSSAPI 协商机制（[SPNEGO](https://en.wikipedia.org/wiki/SPNEGO)）是一个合乎逻辑的选择。此机制利用 "HTTP Negotiate" 身份验证扩展与 Kerberos 密钥分发中心（KDC）通信以验证客户端。

### 在服务器中启用 SPNEGO/Kerberos 身份验证

Avatica 服务器可以通过使用 JAAS 配置文件登录或以编程方式登录来操作。默认情况下，经过身份验证的客户端将作为 Avatica 服务器的 kerberos 用户执行查询。[模拟（Impersonation）](#impersonation)是允许在服务器中以实际最终用户身份运行操作的功能。

需要注意的是，Avatica 服务器使用的 Kerberos 主体**必须**具有 `HTTP` 的 primary（其中 Kerberos 主体的形式为 `primary[/instance]@REALM`）。这是由 [RFC-4559](https://tools.ietf.org/html/rfc4559) 指定的。

#### 编程式登录

这种方法不需要外部文件配置，只需要主体的 keytab 文件。

```java
HttpServer server = new HttpServer.Builder()
    .withPort(8765)
    .withHandler(new LocalService(), Driver.Serialization.PROTOBUF)
    .withSpnego("HTTP/host.domain.com@DOMAIN.COM")
    .withAutomaticLogin(
        new File("/etc/security/keytabs/avatica.spnego.keytab"))
    .build();
```

#### JAAS 配置文件登录

**自 Avatica 1.20.0 起，Jetty 已移除此功能，这意味着 Avatica 也不支持通过 JAAS 配置文件进行 Avatica 服务器登录。Avatica 编程式登录是唯一的方式。**

JAAS 配置文件可以通过系统属性 `java.security.auth.login.config` 设置。用户必须在启动调用 Avatica 服务器的 Java 应用程序时设置此属性。此文件的存在将自动在首次使用 Avatica 服务器时根据需要执行登录。调用与编程式登录几乎相同。

```java
HttpServer server = new HttpServer.Builder()
    .withPort(8765)
    .withHandler(new LocalService(), Driver.Serialization.PROTOBUF)
    .withSpnego("HTTP/host.domain.com@DOMAIN.COM")
    .build();
```

JAAS 配置文件的内容非常具体：

```java
com.sun.security.jgss.accept  {
  com.sun.security.auth.module.Krb5LoginModule required
  storeKey=true
  useKeyTab=true
  keyTab=/etc/security/keytabs/avatica.spnego.keyTab
  principal=HTTP/host.domain.com@DOMAIN.COM;
};
```

确保为您的系统正确设置 `keyTab` 和 `principal` 属性。

#### 额外允许的域

Avatica 1.20.0 之前的版本提供了 API 来指定 `additionalAllowedRealms` 列表。虽然此 API 可能已被其他 Avatica 集成者利用，但此 API 唯一提供的用途是指定额外的 Kerberos 域（服务器主体所属的 kerberos 域之外的其他域），这些域应该被允许对 Avatica 服务器进行身份验证。

随着 Avatica 1.20.0 中的 Jetty 更新，此功能被移除，没有替代方案。任何具有有效 Kerberos 凭据且可以根据运行 Avatica 服务器的主机上的 krb5.conf 文件进行验证的用户，都应该能够对 Avatica 进行身份验证。请查阅您的 JVM 以确定默认 krb5.conf 文件的加载位置，以及如果需要覆盖此文件时应使用的 Java 系统属性。

### 模拟
{: #impersonation }

模拟是 Avatica 服务器的一项功能，允许 Avatica 客户端执行服务器端调用（例如底层 JDBC 调用）。由于执行此类操作的含义取决于实际系统，因此公开了一个回调供下游集成者实现。

例如，以下是创建 Apache Hadoop `UserGroupInformation` "代理用户"的示例。此示例获取一个表示 Avatica 服务器身份的 `UserGroupInformation` 对象，使用客户端的用户名创建一个"代理用户"，并以该客户端的身份但使用服务器的身份执行操作。

```java
public class PhoenixDoAsCallback implements DoAsRemoteUserCallback {
  private final UserGroupInformation serverUgi;

  public PhoenixDoAsCallback(UserGroupInformation serverUgi) {
    this.serverUgi = Objects.requireNonNull(serverUgi);
  }

  @Override
  public <T> T doAsRemoteUser(String remoteUserName, String remoteAddress, final Callable<T> action) throws Exception {
    // 在服务器用户（真实用户）之上代理此用户
    UserGroupInformation proxyUser = UserGroupInformation.createProxyUser(remoteUserName, serverUgi);

    // 检查是否允许模拟此用户
    // 如果不允许作为此用户进行模拟，将抛出 AuthorizationException
    ProxyUsers.authorize(proxyUser, remoteAddress);

    // 作为此代理用户执行实际调用
    return proxyUser.doAs(new PrivilegedExceptionAction<T>() {
      @Override
      public T run() throws Exception {
        return action.call();
      }
    });
  }
}
```

#### 远程用户提取

在某些情况下，可能需要代表另一个用户执行某些查询。例如，[Apache Knox](https://knox.apache.org) 有一个网关服务，可以作为所有对后端 Avatica 服务器请求的代理。在这种情况下，我们不希望以 Knox 用户身份运行查询，而是与 Knox 通信的真实用户。

目前有两个选项可以从 HTTP 请求中提取"真实"用户：

* HTTP 请求中的经过身份验证的用户，`org.apache.calcite.avatica.server.HttpRequestRemoteUserExtractor`（默认）
* HTTP 查询字符串中参数的值，`org.apache.calcite.avatica.server.HttpQueryStringParameterRemoteUserExtractor`（例如 "doAs"）

Avatica 的实现可以使用 `AvaticaServerConfiguration` 并提供 `RemoteUserExtractor` 的实现来配置此功能。如上所述，提供了两个实现。

```java
config = new AvaticaServerConfiguration() {
  /* ... */
  @Override public RemoteUserExtractor getRemoteUserExtractor() {
    // 我们通过 "doAs" 查询字符串参数提取"真实"用户
    return new HttpQueryStringParameterRemoteUserExtractor("doAs");
  }
  /* ... */
};
```

## 自定义身份验证
{: #custom-authentication }

Avatica 服务器允许用户通过 HTTPServer Builder 插入他们的自定义身份验证机制。如果用户想要组合各种身份验证类型的功能，这很有用。示例包括将基本身份验证与模拟结合，或添加相互身份验证与模拟。更多示例可在 `CustomAuthHttpServerTest` 类中找到。

注意：用户需要借助 `ServerCustomizers` 配置自己的 `ServerConnectors` 和 `Handlers`。

```java
AvaticaServerConfiguration configuration = new ExampleAvaticaServerConfiguration();
HttpServer server = new HttpServer.Builder()
    .withCustomAuthentication(configuration)
    .withPort(8765)
    .build();
```

## 客户端实现
{: #client-implementation }

许多 HTTP 客户端库，例如 [Apache Commons HttpComponents](https://hc.apache.org/)，已经支持执行 Basic、Digest 和 SPNEGO 身份验证。如有疑问，请参考这些实现之一，因为它可能是正确的。

### SPNEGO

有关手动构建 SPNEGO 支持的信息，请参阅 [RFC-4559](https://tools.ietf.org/html/rfc4559)，其中描述了如何通过使用 `WWW-Authenticate=Negotiate` HTTP 标头进行身份验证握手来验证客户端。在 Avatica 1.20.0 之前，此握手是针对 Avatica 服务器的每个 HTTP 调用完成的。

从 Avatica 1.20.0 开始，Avatica 已更新为使用更新版本的 Jetty，其中包括执行一次基于 SPNEGO 的身份验证握手，然后设置一个 cookie，该 cookie 可用于重新识别客户端，而无需执行后续的 SPNEGO 握手。

这是一个值得注意的变化，因为它将有效减少 Avatica 客户端必须对服务器进行的 HTTP 调用数量，这通常会导致接近 2 倍的性能提升（因为每个 HTTP 调用有 1 毫秒级的下限）。但是，如果 cookie 被泄露，另一个客户端可能以为其设置 cookie 的用户身份访问 Avatica。因此，重要的是配置 Avatica 服务器[使用 TLS](#tls) 来验证其客户端。

更多信息请参阅 [CALCITE-4152](https://issues.apache.org/jira/browse/CALCITE-4152)。

### 基于密码的

对于 HTTP Basic 和 Digest 身份验证，[avatica_user]({{site.baseurl}}/docs/client_reference.html#avatica-user) 和 [avatica_password]({{site.baseurl}}/docs/client_reference.html#avatica-password) 属性用于向服务器标识客户端。如果底层数据库（Avatica 服务器内的 JDBC 驱动程序）需要自己的用户和密码组合，则通过 Avatica JDBC 驱动程序中的传统 "user" 和 "password" 属性设置。这也意味着在 Avatica 中添加 HTTP 级身份验证可能是多余的。

## TLS
{: #tls }

使用 TLS 部署 Avatica 服务器是常见做法，就像任何 HTTP 服务器一样。为此，使用 `withTls(File, String, File, String)` 方法提供服务器的 TLS 私钥（也称为 keystore）和证书颁发机构的公钥（也称为 truststore）作为 Java Key Store（JKS）文件，以及用于验证 JKS 文件未被篡改的密码。

```java
HttpServer server = new HttpServer.Builder()
    .withTLS(new File("/avatica/server.jks"), "MyKeystorePassword",
        new File("/avatica/truststore.jks"), "MyTruststorePassword")
    .build();
```

如果您希望将默认的 `JKS` keystore 格式更改为例如 `BCFKS`，请使用 `withTls(File, String, File, String, String)` 方法将 keystore 格式作为第五个参数提供。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

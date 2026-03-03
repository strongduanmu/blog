---
layout: wiki
wiki: avatica
order: 003
title: 客户端参考
date: 2025-01-30 14:30:00
banner: /assets/banner/banner_2.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/client_reference.html

Avatica 提供了一个参考实现的客户端，形式为 Java JDBC 客户端，通过 HTTP 与 Avatica 服务器进行交互。这个客户端可以像任何其他 JDBC 驱动程序一样使用。客户端可以通过 JDBC 连接 URL 指定许多可用的选项。

提醒一下，Avatica 的 JDBC 连接 URL 为：

  `jdbc:avatica:remote:[option=value[;option=value]]`

以下是支持的选项列表：

<strong><a name="url" href="#url">url</a></strong>

: _描述_：此属性是一个 URL，指向 Avatica 服务器的位置，驱动程序将与该服务器进行通信。

: _默认值_：此属性的默认值为 `null`。用户必须为此属性提供一个值。

: _必需_：是。

<strong><a name="serialization" href="#serialization">serialization</a></strong>

: _描述_：Avatica 支持多种序列化机制来格式化客户端和服务器之间的数据。此属性用于确保客户端和服务器使用相同的序列化机制。当前的有效值包括 `json` 和 `protobuf`。

: _默认值_：`json` 是默认值。

: _必需_：否。

<strong><a name="authentication" href="#authentication">authentication</a></strong>

: _描述_：Avatica 客户端可以指定其与 Avatica 服务器进行身份验证的方式。希望使用特定身份验证形式的客户端应在此属性中指定适当的值。此属性当前的有效值为：`NONE`、`BASIC`、`DIGEST` 和 `SPNEGO`。

: _默认值_：`null`（意味着"无身份验证"，等同于 `NONE`）。

: _必需_：否。

<strong><a name="timeZone" href="#timeZone">timeZone</a></strong>

: _描述_：用于日期和时间的时区。此属性的有效值由 [RFC 822](https://www.ietf.org/rfc/rfc0822.txt) 定义，例如：`GMT`、`GMT-3`、`EST` 或 `PDT`。

: _默认值_：此属性的默认值为 `null`，这将导致 Avatica 驱动程序使用 JVM 指定的默认时区，通常可以通过 `user.timezone` 系统属性进行覆盖。

: _必需_：否。

<strong><a name="httpclient-factory" href="#httpclient-factory">httpclient_factory</a></strong>

: _描述_：Avatica 客户端是一个"高级" HTTP 客户端。因此，有许多库和 API 可用于进行 HTTP 调用。为了确定应该使用哪种实现，提供了一个接口 `AvaticaHttpClientFactory`，可用于控制如何选择 `AvaticaHttpClient` 实现。

: _默认值_：`AvaticaHttpClientFactoryImpl`。

: _必需_：否。

<strong><a name="httpclient-impl" href="#httpclient-impl">httpclient_impl</a></strong>

: _描述_：当使用默认的 `AvaticaHttpClientFactoryImpl` HTTP 客户端工厂实现时，该工厂应该为给定的客户端配置选择正确的客户端实现。此属性可用于覆盖特定的 HTTP 客户端实现。如果未提供，`AvaticaHttpClientFactoryImpl` 将自动选择 HTTP 客户端实现。

: _默认值_：`null`。

: _必需_：否。

<strong><a name="avatica-user" href="#avatica-user">avatica_user</a></strong>

: _描述_：这是 Avatica 客户端用于向 Avatica 服务器标识自己的用户名。它独立于传统的"用户" JDBC 属性。仅当 Avatica 配置为 HTTP Basic 或 Digest 身份验证时才需要。

: _默认值_：`null`。

: _必需_：否。

<strong><a name="avatica-password" href="#avatica-password">avatica_password</a></strong>

: _描述_：这是 Avatica 客户端用于向 Avatica 服务器标识自己的密码。它独立于传统的"密码" JDBC 属性。仅当 Avatica 配置为 HTTP Basic 或 Digest 身份验证时才需要。

: _默认值_：`null`。

: _必需_：否。

<strong><a name="principal" href="#principal">principal</a></strong>

: _描述_：Avatica JDBC 驱动程序可以使用 Kerberos 主体，在尝试联系 Avatica 服务器之前自动执行 Kerberos 登录。如果提供了此属性，还应该提供 `keytab`，并且 Avatica 服务器应该配置为 SPNEGO 身份验证。用户可以执行自己的 Kerberos 登录；此选项仅作为便利提供。

: _默认值_：`null`。

: _必需_：否。

<strong><a name="keytab" href="#keytab">keytab</a></strong>

: _描述_：Kerberos keytab 包含用于使用 `principal` 执行 Kerberos 登录的秘密材料。该值应该是本地文件系统上常规文件的路径。

: _默认值_：`null`。

: _必需_：否。

<strong><a name="truststore" href="#truststore">truststore</a></strong>

: _描述_：本地文件系统上 Java KeyStore (JKS) 文件的路径，其中包含在 TLS 握手中要信任的证书颁发机构。仅在使用 HTTPS 时才需要。

: _默认值_：`null`。

: _必需_：否。

<strong><a name="truststore_password" href="#truststore_password">truststore_password</a></strong>

: _描述_：由 <a href="#truststore">truststore</a> 指定的 Java KeyStore 文件的密码。

: _默认值_：`null`。

: _必需_：仅在提供了 `truststore` 时。

<strong><a name="keystore_type" href="#keystore_type">keystore_type</a></strong>

: _描述_：由 <a href="#truststore">truststore</a> 指定的 truststore 文件的格式。如果使用非 JKS 格式的 keystore（例如 BCFKS），则需要指定此项。此设置适用于 keystore 和 truststore 文件。对于默认 JVM 中未包含的格式，必须将相应的安全提供程序安装并配置到 JVM 中，或添加到应用程序类路径并进行配置。

: _默认值_：`null`。

: _必需_：否。

<strong><a name="fetch_size" href="#fetch_size">fetch_size</a></strong>

: _描述_：要获取的行数。如果设置了 <a href="https://docs.oracle.com/javase/8/docs/api/java/sql/Statement.html#setFetchSize-int-">Statement:setFetchSize</a>，则该值会覆盖 fetch_size。

: _默认值_：`100`。

: _必需_：否。

<strong><a name="transparent_reconnection" href="#transparent_reconnection">transparent_reconnection</a></strong>

: _描述_：在 1.5.0 和 1.20.0 之间的 Java 客户端版本中，如果连接对象从服务器缓存中过期，则会透明地重新创建客户端的连接对象。此行为破坏了 JDBC 合规性，并可能导致事务性写入工作负载的数据丢失，已在 1.21.0 中移除。将此属性设置为 `true` 可恢复 1.20.0 的行为。

: _默认值_：`false`。

: _必需_：否。

<strong><a name="use_client_side_lb" href="#use_client_side_lb">use_client_side_lb</a></strong>

: _描述_：启用客户端负载均衡。

: _默认值_：`false`。

: _必需_：否。

<strong><a name="lb_urls" href="#lb_urls">lb_urls</a></strong>

: _描述_：以逗号分隔的 URL 列表，例如 "URL1,URL2...URLn"，供客户端负载均衡器使用。根据负载均衡策略，负载均衡器从列表中选择一个 URL。

: _默认值_：`null`。

: _必需_：否。

<strong><a name="lb_strategy" href="#lb_strategy">lb_strategy</a></strong>

: _描述_：客户端负载均衡器使用的负载均衡策略。它必须是一个完全限定的 Java 类名，实现 `org.apache.calcite.avatica.ha.LBStrategy`。提供了三个实现：`org.apache.calcite.avatica.ha.RandomSelectLBStrategy`、`org.apache.calcite.avatica.ha.RoundRobinLBStrategy` 和 `org.apache.calcite.avatica.ha.ShuffledRoundRobinLBStrategy`。

: _默认值_：`org.apache.calcite.avatica.ha.ShuffledRoundRobinLBStrategy`。

: _必需_：否。

<strong><a name="lb_connection_failover_retries" href="#lb_connection_failover_retries">lb_connection_failover_retries</a></strong>

: _描述_：负载均衡器尝试使用另一个 URL 重试连接的次数（故障转移）。当连接失败时，负载均衡器使用负载均衡策略选择的另一个 URL 重试连接。

: _默认值_：`3`。

: _必需_：否。

<strong><a name="lb_connection_failover_sleep_time" href="#lb_connection_failover_sleep_time">lb_connection_failover_sleep_time</a></strong>

: _描述_：负载均衡器在尝试下一次连接故障转移重试之前休眠的时间（以毫秒为单位）。

: _默认值_：`1000`。

: _必需_：否。

<strong><a name="http_connection_timeout" href="#http_connection_timeout">http_connection_timeout</a></strong>

: _描述_：建立 Avatica HTTP 客户端和服务器之间连接的超时时间（以毫秒为单位）。

: _默认值_：`180000`（3 分钟）。

: _必需_：否。

<strong><a name="http_response_timeout" href="#http_response_timeout">http_response_timeout</a></strong>

: _描述_：Avatica HTTP 客户端和服务器之间连接的套接字超时时间（以毫秒为单位）。

: _默认值_：`180000`（3 分钟）。

: _必需_：否。

{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

---
layout: wiki
wiki: avatica
order: 012
title: 历史
date: 2025-01-30 16:00:00
banner: /assets/banner/banner_10.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/history.html

有关完整的发布列表，请参阅 <a href="https://github.com/apache/calcite-avatica/releases">github</a>。下载可在[下载页面]({{ site.baseurl }}/downloads/avatica.html)获取。

## <a href="https://github.com/apache/calcite-avatica/releases/tag/rel/avatica-1.27.0">1.27.0</a> / 2025-09-30
{: #v1-27-0}

Avatica 1.27.0 包含依赖升级、Gradle 8.14 以及对 MySQL 无符号类型的支持。

兼容性：此版本在 Linux、macOS、Microsoft Windows 上测试；
使用 JDK/OpenJDK 版本 8、11、17、21、23；
其他软件版本如 `gradle.properties` 中所指定。

此版本的贡献者：
Francis Chuang（发布经理）、
Istvan Toth、
Niels Pardon、
Richard Antal、
Stamatis Zampetakis、
Zhengqiang Duan。

功能和错误修复

* [<a href="https://issues.apache.org/jira/browse/CALCITE-1480">CALCITE-1480</a>]
  支持为 TLS 指定密码套件和算法
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5094">CALCITE-5094</a>]
  Calcite JDBC 适配器和 Avatica 应支持 MySQL 的 TINYINT、SMALLINT、INT、BIGINT 无符号类型
* [<a href="https://issues.apache.org/jira/browse/CALCITE-7099">CALCITE-7099</a>]
  将 httpclient5 从 5.4.1 更新到 5.5
* [<a href="https://issues.apache.org/jira/browse/CALCITE-7167">CALCITE-7167</a>]
  在 Avatica 中将 Jetty 从 9.4.56.v20240826 升级到 9.4.58.v20250814
* [<a href="https://issues.apache.org/jira/browse/CALCITE-7168">CALCITE-7168</a>]
  在 Avatica 中将 httpcore5 从 5.3.1 更新到 5.3.5
* [<a href="https://issues.apache.org/jira/browse/CALCITE-7169">CALCITE-7169</a>]
  在 Avatica 中将 protobuf 从 3.25.5 更新到 3.25.8
* [<a href="https://issues.apache.org/jira/browse/CALCITE-7172">CALCITE-7172</a>]
  在 Avatica 中将 checkstyle 版本从 10.19.0 更新到 10.26.1
* [<a href="https://issues.apache.org/jira/browse/CALCITE-7165">CALCITE-7165</a>]
  将 OWASP 插件版本更新到 12.1.3 以支持 JDK >= 11
* [<a href="https://issues.apache.org/jira/browse/CALCITE-7177">CALCITE-7177</a>]
  在 Avatica 中将 Guava 从 33.4.0-jre 更新到 33.4.8-jre
* [<a href="https://issues.apache.org/jira/browse/CALCITE-7171">CALCITE-7171</a>]
  在 Avatica 中将 Jackson 从 2.15.4 更新到 2.18.4.1 并切换到使用 jackson-bom

构建和测试

* [<a href="https://issues.apache.org/jira/browse/CALCITE-6851">CALCITE-6851</a>]
  ShadingTest.validateShadedJar 在首次/清洁构建时失败
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6854">CALCITE-6854</a>]
  ConnectionPropertiesHATest 在 Windows 上的 eclipse-temurin:8 docker 容器中运行时失败
* [<a href="https://issues.apache.org/jira/browse/CALCITE-7166">CALCITE-7166</a>]
  在 Avatica 中将 Gradle 从 8.7 更新到 8.14.3

网站和文档

* 在 /site 中将 json 从 2.10.1 升级到 2.10.2
* 在 /site 中将 rexml 从 3.4.1 升级到 3.4.2

## <a href="https://github.com/apache/calcite-avatica/releases/tag/rel/avatica-1.26.0">1.26.0</a> / 2025-02-24
{: #v1-26-0}

Avatica 1.26.0 包含错误修复、依赖升级以及对 JDK 23 和 Gradle 8.7 的支持。

兼容性：此版本在 Linux、macOS、Microsoft Windows 上测试；
使用 JDK/OpenJDK 版本 8、11、17、23；
其他软件版本如 `gradle.properties` 中所指定。

此版本的贡献者：
Chris Dennis、
Francis Chuang（发布经理）、
Istvan Toth、
Mihai Budiu、
Sergey Nuyanzin、
Villő Szűcs。

功能和错误修复

* [<a href="https://issues.apache.org/jira/browse/CALCITE-6421">CALCITE-6421</a>]
  添加对 JDK 22 的支持
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6530">CALCITE-6530</a>]
  Avatica 服务器中的 HTTP 会话永不过期
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6529">CALCITE-6529</a>]
  在 AvaticaCommonsHttpClientImpl 中使用持久 sessionContext
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6601">CALCITE-6601</a>]
  在 Avatica 中将 ByteBuddy 版本从 1.14.10 升级到 1.15.1
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6661">CALCITE-6661</a>]
  在 Avatica 中将 shadow 插件从 8.0.0 更新到 8.1.1，asm 从 7.1 更新到 9.7.1
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6657">CALCITE-6657</a>]
  在 Avatica 中将 checkstyle 从 10.3.2 更新到 10.19.0
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6656">CALCITE-6656</a>]
  在 Avatica 中将 owasp 插件从 5.2.2 更新到 10.0.4
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6660">CALCITE-6660</a>]
  在 Avatica 中将 protobuf-java 从 3.21.9 更新到 3.25.5
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6659">CALCITE-6659</a>]
  在 Avatica 中将 Jetty 从 9.4.44.v20210927 更新到 9.4.56.v20240826
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6729">CALCITE-6729</a>]
  确保 TypedValue 允许本地表示的子类型
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6671">CALCITE-6671</a>]
  在 Avatica 中将 httpclient5 更新到 5.4.1，httpcore 更新到 5.3.1
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6670">CALCITE-6670</a>]
  使用 org.apache.calcite.avatica.shaded 作为重定位库的基础包
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6687">CALCITE-6687</a>]
  在 Avatica 中为 Gradle 构建环境添加 org.ow2.asm 的依赖约束
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6658">CALCITE-6658</a>]
  在 Avatica 中将 Jackson 从 2.15.2 更新到 2.15.4
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6669">CALCITE-6669</a>]
  Httpcore/Httpclient 在 shaded Avatica jar 中未重定位
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6590">CALCITE-6590</a>]
  在 Avatica 中使用反射处理 Java SecurityManager 弃用
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6807">CALCITE-6807</a>]
  在 Avatica 中将 Guava 从 32.1.1-jre 更新到 33.4.0-jre
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6811">CALCITE-6811</a>]
  在 Avatica 中重构已弃用的 httpclient API 使用
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6828">CALCITE-6828</a>]
  在 Avatica 中将 Kerby 从 1.1.1 升级到 2.1.0
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6826">CALCITE-6826</a>]
  在 Avatica 中将 Junit 从 4.12.0 更新到 4.13.2

构建和测试

* [<a href="https://issues.apache.org/jira/browse/CALCITE-6354">CALCITE-6354</a>]
  使用 docker-compose 运行测试时使用 gradle docker 镜像
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6359">CALCITE-6359</a>]
  更新 GitHub Actions 工作流以使用 docker compose v2
* 更新 CI 配置以适应最新的 guava
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6808">CALCITE-6808</a>]
  在 Avatica 中使用 JDK23 而不是 JDK22 进行最新 JVM 的 CI 测试
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6799">CALCITE-6799</a>]
  ConnectionPropertiesHATest 在 MacOS 上不稳定
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5136">CALCITE-5136</a>]
  Avatica 构建（或 CI）如果有弃用警告必须失败
* 从 docker-compose 文件中移除版本属性

网站和文档

* [<a href="https://issues.apache.org/jira/browse/CALCITE-6351">CALCITE-6351</a>]
  更新 Jekyll 网站模板的 LICENSE
* 在 /site 中将 rexml 从 3.2.5 升级到 3.2.8
* 在 /site 中将 rexml 从 3.2.8 升级到 3.3.3
* 在 /site 中将 rexml 从 3.3.3 升级到 3.3.6
* Site：使用 git 协议从 GitHub 克隆源代码失败
* 在 /site 中将 rexml 从 3.3.6 升级到 3.3.9
* 在 /site 中将 webrick 从 1.7.0 升级到 1.8.2
* Site：修复 index.md 中的拼写错误
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6842">CALCITE-6842</a>]
  升级 Jekyll 网站生成中使用的易受攻击的 ruby 库
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6843">CALCITE-6843</a>]
  由于 ASF 的内容安全策略，在网站上自托管 Lato 字体
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6845">CALCITE-6845</a>]
  自托管网站图片

## <a href="https://github.com/apache/calcite-avatica/releases/tag/rel/avatica-1.25.0">1.25.0</a> / 2024-04-05
{: #v1-25-0}

Avatica 1.25.0 是一个常规版本，具有对 JDK 21、Gradle 8.5 的支持以及一些错误修复。

*破坏性变更*：由于 [<a href="https://issues.apache.org/jira/browse/CALCITE-6282">CALCITE-6282</a>] 和 [<a href="https://issues.apache.org/jira/browse/CALCITE-6248">CALCITE-6248</a>]，非法日期不再被转换接受，时间精度在返回 TIME 结果时不会被忽略。如果您依赖此行为，您的应用程序可能会中断。

兼容性：此版本在 Linux、macOS、Microsoft Windows 上测试；
使用 JDK/OpenJDK 版本 8、11、17、21；
其他软件版本如 `gradle.properties` 中所指定。

此版本的贡献者：
Benchao Li、
Francis Chuang（发布经理）、
Istvan Toth、
Mihai Budiu、
Satya Kommula、
Sergey Nuyanzin、
Vaibhav Joshi。

功能和错误修复

* [<a href="https://issues.apache.org/jira/browse/CALCITE-6280">CALCITE-6280</a>]
  Avatica http 服务器泄露 Jetty 版本号
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6209">CALCITE-6209</a>]
  长查询在 3 分钟后因 "java.net.SocketTimeoutException: Read timed out" 失败
  通过新的 'http_response_timeout' URL 选项使套接字超时可配置
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6137">CALCITE-6137</a>]
  将 Gradle 从 8.1.1 升级到 8.5，支持 jdk21
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6282">CALCITE-6282</a>]
  Avatica 在返回 TIME 结果时忽略时间精度
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6248">CALCITE-6248</a>]
  非法日期被转换接受

构建和测试

* 使用 docker 发布脚本推广发布时安装 git 并设置 safe.directory
* 为 GitHub PR 禁用 JIRA 工作日志通知
* 应用与 Calcite 相同的 vcs.xml

网站和文档

* [<a href="https://issues.apache.org/jira/browse/CALCITE-6212">CALCITE-6212</a>]
  为 javadoc 任务配置 locale = en_US
* 将 Calcite CLI 工具添加到网站上的 Avatica 客户端列表

## <a href="https://github.com/apache/calcite-avatica/releases/tag/rel/avatica-1.24.0">1.24.0</a> / 2023-12-04
{: #v1-24-0}

Apache Calcite Avatica 1.24.0 主要是依赖升级以及一些小的错误修复和功能。

*破坏性变更*：由于 [CALCITE-5678](https://issues.apache.org/jira/browse/CALCITE-5678)，不满足公历的日期字面量将被拒绝。

兼容性：此版本在 Linux、macOS、Microsoft Windows 上测试；
使用 Oracle JDK 8、9、10、11、12、13、14、15、16、17、18、19；
使用 IBM Java 8；
Guava 版本 14.0.1 到 32.1.1-jre；
其他软件版本如 `gradle.properties` 中所指定。

此版本的贡献者：
Evgeniy Stanilovskiy、
Francis Chuang（发布经理）、
Greg Hart、
Istvan Toth、
Mihai Budiu、
Richard Antal、
Sergey Nuyanzin、
TJ Banghart、
Vaibhav Joshi、
Will Noble

功能和错误修复

* [<a href="https://issues.apache.org/jira/browse/CALCITE-5494">CALCITE-5494</a>]
  DateTimeUtilsTest 中的时区测试应在 Europe/London 通过
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5440">CALCITE-5440</a>]
  将 gradle 从 7.4.2 升级到 7.6.1
* 将 forbidden apis 从 3.2 升级到 3.4
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5567">CALCITE-5567</a>]
  将 mockito 从 4.4.0 更新到 4.11.0 并启用 jdk19
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5678">CALCITE-5678</a>]
  根据 ISO-8601 验证日期、时间和时间戳字面量
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5581">CALCITE-5581</a>]
  在 Avatica 驱动程序中实现基本客户端负载均衡
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5803">CALCITE-5803</a>]
  将 Avatica 迁移到 Gradle 8.1.1
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5812">CALCITE-5812</a>]
  创建 javadoc 聚合时 Gradle 任务失败
  从 javadoc 聚合中排除 "bom" 项目，因为它没有 "main" 和 "test" 对象导致 "tasks" 失败。
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5804">CALCITE-5804</a>]
  将 jackson 版本从 2.14.1 升级到 2.15.2
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5748">CALCITE-5748</a>]
  支持 Guava 32.1.1-jre
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5890">CALCITE-5890</a>]
  在 Avatica 客户端中处理非 JKS 信任库
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5981">CALCITE-5981</a>]
  `TIMESTAMPDIFF` 函数返回不正确的结果
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6034">CALCITE-6034</a>]
  向 `MetaColumn` 构造函数添加 `isAutoIncrement` 和 `isGenerated` 参数
* [<a href="https://issues.apache.org/jira/browse/CALCITE-5536">CALCITE-5536</a>]
  清理 `AvaticaResultSetConversionsTest` 和 `AbstractCursor` 中的一些魔术数字
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6113">CALCITE-6113</a>]
  在 Avatica 中将 HttpComponents Core 更新到 5.2.3，HttpComponents Client 更新到 5.2.1
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6141">CALCITE-6141</a>]
  添加 `jdk8.checkstyle` 属性，在 java 8 的情况下使用 `jdk8.checkstyle`

构建和测试

* [<a href="https://issues.apache.org/jira/browse/CALCITE-6106">CALCITE-6106</a>]
  为 avatica docker-compose 发布命令从 gradle 切换到 eclipse-temurin 镜像
* [<a href="https://issues.apache.org/jira/browse/CALCITE-6107">CALCITE-6107</a>]
  将 vlsi-release-plugins 升级到 1.90
* 使用 eclipse-temurin:8 镜像
* 在 docker 发布脚本中安装 svn
* 使用 docker 发布脚本推广发布时安装 svn

---

有关更早的版本历史，请参阅[原文链接](https://calcite.apache.org/avatica/docs/history.html)。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

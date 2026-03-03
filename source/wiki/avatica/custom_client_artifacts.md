---
layout: wiki
wiki: avatica
order: 009
title: 自定义客户端构件
date: 2025-01-30 16:00:00
banner: /assets/banner/banner_7.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/custom_client_artifacts.html

从 Apache Calcite Avatica 1.9.0 开始，提供了两个构件（jar），支持通过 JDBC 客户端访问 Avatica 服务器。

{% highlight xml %}
<dependencies>
  <!-- Shaded 构件 -->
  <dependency>
    <groupId>org.apache.calcite.avatica</groupId>
    <artifactId>avatica</artifactId>
  </dependency>
  <!-- Non-shaded 构件 -->
  <dependency>
    <groupId>org.apache.calcite.avatica</groupId>
    <artifactId>avatica-core</artifactId>
  </dependency>
</dependencies>
{% endhighlight %}

为了与以前版本的约定保持一致，`org.apache.calcite.avatica:avatica` 是一个包含 Avatica 客户端代码库所有必要依赖的 JAR。那些可以安全重定位的类都会被重定位，以减少潜在的类路径问题。

Avatica 1.9.0 将引入一个新构件 `org.apache.calcite.avatica:avatica-core`，它只包含 Avatica 客户端类，不包含任何捆绑的依赖项。此构件使用户能够构建一个包含与 Avatica 当前依赖的不同版本 JAR 的类路径。这是一种"效果因情况而异"或"会使保修失效"类型的决定（因为您正在使用未经我们测试的依赖项使用 Avatica）；但是，一些下游项目确实提供了跨版本兼容性的合理保证。

## 构建您自己的 Avatica 客户端构件

在某些情况下，提供特定版本的 Avatica 依赖项可能是有益的。以下是一个简短的 `pom.xml`，概述了如何做到这一点。

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>myorg.custom.client</groupId>
  <artifactId>my-special-app-client</artifactId>
  <packaging>jar</packaging>
  <name>Special Application Client Artifact</name>
  <description>A custom artifact which uses Apache Calcite Avatica for my Org's Special Application</description>

  <properties>
    <myorg.prefix>myorg.custom.client</myorg.prefix>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.apache.calcite.avatica</groupId>
      <artifactId>avatica-core</artifactId>
      <version>1.9.0</version>
    </dependency>
    <dependency>
      <groupId>org.apache.httpcomponents</groupId>
      <artifactId>httpclient</artifactId>
      <!-- 覆盖 avatica-core 中的版本 (4.5.2) 以解决 httpclient 中的假设错误 -->
      <version>4.5.3</version>
    </dependency>
    <!-- 为"特殊应用程序"包含 Guava -->
    <dependency>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
      <version>17.0</version>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-shade-plugin</artifactId>
        <executions>
          <execution>
            <phase>package</phase>
            <goals>
              <goal>shade</goal>
            </goals>
            <configuration>
              <!-- 重定位 Jackson、Protobuf、Apache Commons HttpClient 和 HttpComponents，但不重定位 Guava。
                   假设的"特殊应用程序"会期望 Guava 在标准位置 -->
              <relocations>
                <relocation>
                  <pattern>com.fasterxml.jackson</pattern>
                  <shadedPattern>${myorg.prefix}.com.fasterxml.jackson</shadedPattern>
                </relocation>
                <relocation>
                  <pattern>com.google.protobuf</pattern>
                  <shadedPattern>${myorg.prefix}.com.google.protobuf</shadedPattern>
                </relocation>
                <relocation>
                  <pattern>org.apache.http</pattern>
                  <shadedPattern>${myorg.prefix}.org.apache.http</shadedPattern>
                </relocation>
                <relocation>
                  <pattern>org.apache.commons</pattern>
                  <shadedPattern>${myorg.prefix}.org.apache.commons</shadedPattern>
                </relocation>
              </relocations>
              <createDependencyReducedPom>false</createDependencyReducedPom>
            </configuration>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>
{% endhighlight %}



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

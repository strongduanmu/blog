---
layout: wiki
wiki: avatica
order: 010
title: Docker 镜像
date: 2025-01-30 16:00:00
banner: /assets/banner/banner_8.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/docker.html

## Avatica 的 Docker 镜像

[Docker](https://en.wikipedia.org/wiki/Docker_(software)) 是一款流行的软件，使其他软件能够"在任何地方"运行。在 Avatica 的上下文中，我们可以使用 Docker 来实现随处运行的 Avatica 服务器。这些 Docker 容器可用于轻松创建服务器，用于开发自定义 Avatica 客户端，或封装数据库访问以测试使用 Avatica 的软件。

### 基础 "avatica-server" Docker 镜像

Avatica 提供了许多 Docker 容器。这些镜像中的每一个都基于一个"父级" "avatica-server" Docker 镜像。

此 Docker 镜像不绑定到特定数据库（它不包含特定数据库的 JDBC 驱动程序）。它只包含 Java 运行时和 Avatica Standalone Server jar（包含 Avatica 服务器的所有必要依赖项）。此 docker 镜像对最终用户没有直接用处；它对那些想要将 Avatica 与自己选择的数据库一起使用的人很有用。

此 Docker 镜像部署到 [Apache Docker Hub 账户](https://hub.docker.com/r/apache/calcite-avatica)，并在每次 Avatica 发布时更新。

### 特定数据库的 Docker 镜像

为了使想要使用特定数据库的最终用户的生活更轻松，为一些常见数据库提供了 Docker 镜像。当前数据库包括：

* [HyperSQL](http://hsqldb.org) (2.3.1)
* [MySQL](https://www.mysql.com/) (客户端 5.1.41，支持 MySQL 服务器 4.1、5.0、5.1、5.5、5.6、5.7)
* [PostgreSQL](https://www.postgresql.org/) (客户端 42.0.0，支持 PostgreSQL 服务器 >=8.3)

这些镜像未部署，因为每个数据库驱动程序的许可证各不相同。请在任何软件项目中使用前理解并接受每个驱动程序的许可证。

这些镜像中的每一个都包含一个 `build.sh` 脚本，该脚本将使用最新的 `avatica-server` Docker 镜像构建 docker 镜像。生成的 Docker 镜像将根据以下格式命名：`avatica-<database>-server`。例如，`avatica-hsqldb-server`、`avatica-mysql-server` 和 `avatica-postgresql-server`。

此外，为上述数据库（不包括 HyperSQL）提供了 [Docker Compose](https://github.com/docker/compose) 配置文件，这些文件配置数据库的标准 Docker 镜像，然后将 Avatica 连接到该 Docker 容器。例如，PostgreSQL docker-compose 配置文件将启动一个 PostgreSQL 实例和一个 Avatica 服务器实例，每个实例都在自己的容器中，暴露一个针对"真实" PostgreSQL 数据库配置的 Avatica 服务器。

所有 `Dockerfile` 和 `docker-compose.yml` 文件都在每个版本的归档中方便地提供。以下是版本 1.27.0 的布局：

```
avatica-docker-1.27.0/
avatica-docker-1.27.0/hypersql/
avatica-docker-1.27.0/mysql/
avatica-docker-1.27.0/postgresql/
avatica-docker-1.27.0/Dockerfile
avatica-docker-1.27.0/hypersql/build.sh
avatica-docker-1.27.0/hypersql/Dockerfile
avatica-docker-1.27.0/mysql/build.sh
avatica-docker-1.27.0/mysql/docker-compose.yml
avatica-docker-1.27.0/mysql/Dockerfile
avatica-docker-1.27.0/postgresql/build.sh
avatica-docker-1.27.0/postgresql/docker-compose.yml
avatica-docker-1.27.0/postgresql/Dockerfile
```

#### 运行

每个提供的特定数据库 Docker 镜像都设置了一个 `ENTRYPOINT`，封装了大部分 Java 命令。可以指定以下选项：

```
Usage: <main class> [options]
  Options:
    -h, -help, --help
       Print the help message
       Default: false
    -p, --port
       Port the server should bind
       Default: 0
    -s, --serialization
       Serialization method to use
       Default: PROTOBUF
       Possible Values: [JSON, PROTOBUF]
  * -u, --url
       JDBC driver url for the server
```

例如，要连接到 MySQL 服务器，可以使用以下命令：

```
$ ./avatica-docker-*/mysql/build.sh
$ docker run --rm -it avatica-mysql-server \
    -u jdbc:mysql://<fqdn>:3306/my_database
```

要调试这些 docker 镜像，可以覆盖 `ENTRYPOINT` 以启动 shell：

```
$ docker run --rm --entrypoint='' -it avatica-mysql-server /bin/sh
```

### 为自定义数据库运行 Docker 容器

提供的 `avatica-server` Docker 镜像设计为对于想要公开自己选择数据库的开发者通常可重用。可以通过复制 `avatica-mysql-server` 或 `avatica-postgresql-server` 所做的工作来创建自定义 Dockerfile，但这也可以通过 Docker 卷实现。

例如，假设我们在本地机器上有一个包含数据库 JDBC 驱动程序的 JAR `/home/user/my-database-jars/my-database-jdbc-1.0.jar`。我们可以运行以下命令来使用此 JDBC 驱动程序针对我们的数据库启动自定义 Avatica 服务器。

```
$ docker run --rm -p 8765:8765 \
    -v /home/user/my-database-jars/:/my-database-jars --entrypoint="" -it avatica-server \
    /usr/bin/java -cp "/home/avatica/classpath/*:/my-database-jars/*" \
    org.apache.calcite.avatica.standalone.StandaloneServer -p 8765 \
    -u "jdbc:my_jdbc_url"
```

此命令执行以下操作：

* 在本地机器上暴露内部端口 8765 为 8765
* 使用 Docker 卷功能将本地目录 "home/user/my-database-jars" 映射到 Docker 容器中的 "/my-database-jars"
* 将该映射目录添加到 Java classpath
* 为数据库设置正确的 JDBC URL



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

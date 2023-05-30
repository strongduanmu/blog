---
title: MySQL 5.7.40 安装及初始化配置指南
tags: [MySQL]
categories: [MySQL]
date: 2022-11-18 09:00:00
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/12/25/1640431841.jpg
---

## 前言

MySQL 是当前主流的开源关系型数据库，学习 MySQL 能够帮助我们更好地理解关系型数据库的实现原理，在日常工作实践中也能更加从容地面对各种数据库层面的问题。本文是 MySQL 系列的第一篇，主要记录了 `MySQL 5.7.40` 安装及初始化配置的步骤，MySQL 安装环境为 `CentOS 7`，可以参考 [CentOS 开发环境搭建笔记](https://strongduanmu.com/blog/centos-dev-environment-setup-note/)在 Virtual Box 虚拟机上搭建 CentOS 7 环境。

## MySQL 下载

首先，需要从 [MySQL 官网](https://dev.mysql.com/downloads/mysql/)下载 `MySQL 5.7.40` 的通用二进制安装包，具体如下图所示，我们选择 64 位安装包：

> 选择通用二进制安装包，主要是考虑到这种安装方式较为简单，并且在不同的 Linux 发行版上具有很好的通用性，此外还可以灵活地指定安装路径，在一台机器上安装多个 MySQL 实例。

![1669080676](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/11/22/1669080676.png)

下载完成后，我们使用 `scp` 命令将二进制安装包拷贝到服务器的 `/usr/local` 目录下。

```bash
scp mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz root@192.168.56.101:/usr/local
```

使用 `ll` 查看上传结果：

```bash
-rw-r--r--. 1 root root 678001736 Aug 10 14:06 mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz
```

上传完成后使用 `md5sum` 校验 md5 值，避免下载的二进制包被篡改。

```bash
md5sum mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz
# ce0ef7b9712597f44f4ce9b9d7414a24  mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz
```

然后解压二进制安装包：

```bash
tar zxvf mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz
```

解压后 MySQL 安装包的目录结构如下：

| 目录            | 内容                                                         |
| :-------------- | :----------------------------------------------------------- |
| `bin`           | [**mysqld**](https://dev.mysql.com/doc/refman/5.7/en/mysqld.html) 服务端，客户端以及工具程序 |
| `docs`          | Info 格式的 MySQL 手册                                       |
| `man`           | Unix 手册                                                    |
| `include`       | 包含（头文件）文件                                           |
| `lib`           | 库                                                           |
| `share`         | 错误消息、字典和用于数据库安装的 SQL                         |
| `support-files` | 其他支持文件                                                 |

## MySQL 单实例安装

参考 MySQL 官方文档 [Installing MySQL on Unix/Linux Using Generic Binaries](https://dev.mysql.com/doc/refman/5.7/en/binary-installation.html) 进行安装，安装之前需要先确保系统上没有安装过 MySQL，并且需要删除 `/etc/my.cnf` 和 `/etc/mysql` 目录中的配置。可以使用如下命令检查是否已安装 MySQL：

```bash
# yum 命令
yum list installed mysql*
# rpm 命令
rpm -qa | grep mysql*
```

如果已安装则通过如下命令进行卸载：

```bash
# yum 命令
yum -y remove mysql*
# rpm 命令
rpm -e mysql
```

删除配置：

```bash
rm -rf /etc/my.cnf
rm -rf /etc/mysql
```

此外，MySQL 依赖 libaio 和 libnuma 库，需要在安装 MySQL 前进行安装：

```bash
# search for info
yum search libaio
yum search numa
# install library
yum install libaio.x86_64 -y
yum install numactl.x86_64 -y
```

由于 MySQL 5.7.19 开始，通用二进制安装包的 tar 包格式变为了 EL6，因此需要 MySQL 客户端 **bin/mysql** needs `libtinfo.so.5` 库，需要在 64 位系统上创建一个链接来解决：

```bash
ln -sf libncurses.so.5.6 /lib64/libtinfo.so.5
```



## MySQL 多实例安装



## MySQL 配置及初始化



## 参考文档

* [Installing MySQL on Unix/Linux Using Generic Binaries](https://dev.mysql.com/doc/refman/5.7/en/binary-installation.html)

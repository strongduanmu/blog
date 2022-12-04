---
title: MySQL 5.7.40 安装及配置指南
tags: [MySQL]
categories: [MySQL]
date: 2022-11-18 09:00:00
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/12/25/1640431841.jpg
---

## 前言

本文介绍了`MySQL5.7.25`的二进制包及RPM包的安装方式，部署环境为`CentOS6.4`，主要记录了两种方式的安装过程，同时介绍了MySQL的基本配置信息。



## 准备工作

从 https://dev.mysql.com/downloads/mysql/ 官网下载 

![1669080676](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/11/22/1669080676.png)



除了RPM包，[MySQL官网](https://dev.mysql.com/downloads/mysql/5.7.html#downloads)还提供了二进制包和源码包，三种安装方式中，RPM包安装最简单，源码包安装最复杂，主要差异如下：

| 特点           | RPM包                                           | 二进制包                                                  | 源码包                 |
| -------------- | ----------------------------------------------- | --------------------------------------------------------- | ---------------------- |
| 优点           | 安装简单                                        | 安装简单，可以指定安装路径，一台机器可以安装多个MySQL实例 | 可按需定制，灵活性最好 |
| 缺点           | 安装路径不可修改，一台机器只能安装一个MySQL实例 | 已经编译，不能定制编译参数                                | 安装过程复杂           |
| 下载二进制包： |                                                 |                                                           |                        |



使用 scp 命令将二进制安装包和 asc 文件拷贝到服务器上。

```bash
scp mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz root@192.168.56.101:/opt/mysql
```

使用 `ll` 查看上传结果：

```bash
-rw-r--r--. 1 root root 678001736 Aug 10 14:06 mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz
```

上传完成后使用 `md5sum` 校验 md5 值，避免下载的二进制包被篡改。

```
[root@localhost mysql]# md5sum mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz
ce0ef7b9712597f44f4ce9b9d7414a24  mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz
```

然后解压二进制安装包：

```bash
tar -xvf mysql-5.7.40-linux-glibc2.12-x86_64.tar.gz
```

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

## MySQL 安装

TODO

## 参考文档

* [Installing MySQL on Unix/Linux Using Generic Binaries](https://dev.mysql.com/doc/refman/5.7/en/binary-installation.html)

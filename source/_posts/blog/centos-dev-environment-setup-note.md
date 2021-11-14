---
title: CentOS 开发环境搭建笔记
tags: [Linux, VirtualBox, CentOS]
categories: [Linux]
date: 2021-11-07 20:37:44
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636874726.jpg
---

## 前言

虽然日常办公使用 Mac 已经非常便利，但偶尔还是需要使用 Linux 环境进行一些开发工作。为了方便使用，本文使用 `VirtualBox` 搭建了一个简单的 `CentOS` 开发环境，同时配置了 `Host-Only` 和 `Nat` 两种网络连接方式，保证了虚拟机中的 Linux 服务器，能够同时连接本机和互联网。

## 准备工作

搭建 CentOS 开发环境之前，需要先完成以下准备工作：

* 安装 `VirtualBox 6.1`；
* 下载 `CentOS-7-x86_64-Minimal-1708.iso` 镜像（官网 [下载地址](https://www.centos.org/download/)）；

## 创建虚拟机

首先，打开 VirtualBox，然后选择 `新建`，创建虚拟机，然后填入名称 `centos7`，并选择虚拟机的类型 `Linux` 和版本 `Red Hat (64-bit)`。

![1636877014](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636877014.jpg)

然后设置虚拟机的内存大小，该设置按照实际使用场景进行调整即可。

![1636877195](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636877195.jpg)

下一步，选择虚拟硬盘的文件类型，因为不需要在其他虚拟化软件中使用，所以我们选择默认的 `VDI` 文件类型。然后分配文件的大小，我们暂时分配 `20 GB`。

![1636877532](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636877532.jpg)

选择创建，这时候我们就得到了一个 `centos7` 虚拟机。不过在安装之前，我们还要进行一些设置，来保证虚拟机能够正常启动和运行。

## 设置虚拟机

首先，我们要对虚拟机的系统启动顺序进行设置。选中列表中的虚拟机，然后选择 `设置-系统`，并将 `软驱` 移动到启动顺序的最后。

![1636877818](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636877818.jpg)

然后再选择 `存储-控制器-没有盘片`，点击右侧的光盘图标，分配光驱，选择前面下载的 `CentOS-7-x86_64-Minimal-1708.iso` 镜像文件。

![1636878123](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636878123.jpg)

## 设置虚拟网卡

在设置虚拟网卡前，先来了解下 VirtualBox 支持的网络模式。VirtualBox 可选的网络模式有七种，分别是 `Not attached`、`Network Address Translation (NAT)`、`NAT Network`、`Bridged networking`、`Internal networking`、`Host-only networking`  和 `Generic networking`。

* `Not attached` 模式相当于没插网线，因此网络是断开的，无法连接主机和外网；
* `Network Address Translation (NAT)` 模式支持访问主机和外网，但是主机和外网及其他虚拟机都不能直接访问该虚拟机，`NAT` 网络模式是 VirtualBox 默认的网络模式；
* `NAT Network` 模式和 `Network Address Translation (NAT)` 模式类似，唯一的区别是该模式下，虚拟机之间可以相互访问；
* `Bridged networking` 模式下，虚拟机相当于内网的一台机器，因此可以访问内网中的其他机器以及外网，内网中的其他机器也可以直接访问它，在该模式下，虚拟机之间也可以相互访问；
* `Internal networking` 模式下，只有虚拟机之间可以相互访问；
* `Host-only networking` 模式下，只有虚拟机和主机、虚拟机和虚拟机之间可以相互访问；
* `Generic networking` 模式很少使用，本文暂时忽略；

虚拟机可以同时设置多张网卡，例如设置两张网卡，一张网卡使用 `NAT` 模式，支持访问外网，另一张网卡选择 `Host-only networking` 模式，虚拟机、主机以及其他虚拟机可以相互访问。

在不同的网络模式下，虚拟机、主机、局域网/外网之间的可访问规则，可以参考如下的表格。

| Mode       | VM→Host | VM←Host                                                      | VM1↔VM2 | VM→Net/LAN | VM←Net/LAN                                                   |
| ---------- | ------- | ------------------------------------------------------------ | ------- | ---------- | ------------------------------------------------------------ |
| Host-only  | +       | +                                                            | +       | –          | –                                                            |
| Internal   | –       | –                                                            | +       | –          | –                                                            |
| Bridged    | +       | +                                                            | +       | +          | +                                                            |
| NAT        | +       | [Port forward](https://www.virtualbox.org/manual/ch06.html#natforward) | –       | +          | [Port forward](https://www.virtualbox.org/manual/ch06.html#natforward) |
| NATservice | +       | [Port forward](https://www.virtualbox.org/manual/ch06.html#network_nat_service) | +       | +          | [Port forward](https://www.virtualbox.org/manual/ch06.html#network_nat_service) |

在了解了 VirtualBox 支持的网络模式后，我们来进行虚拟网卡的设置，本文采用 `Host-Only` 和 `Nat` 组合的配置方式。

选择 `菜单-管理-主机网络管理器`，然后创建如下的虚拟网卡。

![1636880984](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636880984.jpg)

然后配置 `centos7` 虚拟机的网卡，网卡 1 配置为 `Host-Only`，网卡 2 配置为 `Nat` 。

![1636881121](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636881121.jpg)

![1636881140](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636881140.jpg)

## 启动虚拟机

完成虚拟机配置后，点击 `启动` 按钮，启动虚拟机。启动过程中，需要设置 root 用户的密码，以及创建新用户。

![1636881371](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636881371.jpg)

启动安装完成之后，点击 `reboot` 进行重启。

![1636881437](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636881437.jpg)

然后使用 root 用户重新登录，并查看 IP 信息，发现获取不到 IP 信息。

![1636881522](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636881522.jpg)

## 虚拟机 IP 设置

重启虚拟机之后，发现获取不到 IP 信息，还需要配合网卡设置虚拟机 IP。首先，进入 `/etc/sysconfig/network-scripts/` 目录下，查看该目录下的网卡文件，存在两个网卡 `enp0s3`，`enp0s8`。

![1636881922](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636881922.jpg)

修改  `enp0s3`，`enp0s8` 网卡配置：

```properties
# Host-Only网卡，设置成静态ip，用于与主机器通信
# vim /etc/sysconfig/network-scripts/ifcfg-enp0s3
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=static
IPADDR=192.168.56.101
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=enp0s3
UUID=5d50000d-2081-4e44-8806-a4c1024b0d51
DEVICE=enp0s3
ONBOOT=yes

# Nat网卡，设置成动态获取ip，用于连接互联网
# vim /etc/sysconfig/network-scripts/ifcfg-enp0s8
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=dhcp
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=enp0s8
UUID=27155750-2243-48d2-895d-8b79b0fd0d64
DEVICE=enp0s8
ONBOOT=yes
```

然后使用如下命令重启网络，发现并没有生效。

```shell
service network restart
```

查阅资料后，发现需要关闭网络管理器 `NetwokManager`，才能够使静态 IP 生效。

```shell
systemctl stop NetworkManager
systemctl disable NetworkManager
```

关闭 `NetwokManager` 之后，再次修改网卡配置，并重启网络服务，发现 IP 已经配置完成。

![1636882498](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636882498.jpg)

最后，使用 Mac 命令行连接虚拟机进行测试，输入 `ssh root@192.168.56.101`，终于成功登录上服务器。现在，终于可以享受在 Linux 环境下开发的乐趣了。

![1636882727](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/11/14/1636882727.png)

## 参考文档

* [VirtualBox的各种网络模式要如何选择](https://segmentfault.com/a/1190000020231540)
* [CentOS 7 配置静态 IP 不生效](https://blog.csdn.net/weixin_37569048/article/details/96852643)


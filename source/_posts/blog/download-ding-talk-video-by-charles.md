---
title: Charles 抓包下载钉钉群直播视频
date: 2021-06-19 10:46:35
tags: [Charles, FFmpeg]
categories: [Tool]
cover: /assets/blog/2021/06/19/1624088349.jpg
banner: /assets/banner/banner_8.jpg
---

## 前言

作为一名爱学习的技术青年，博主经常会加入一些技术讨论群，参与技术大佬的直播分享，但是由于日常工作繁忙，经常会错过很多精彩的直播，因此想将直播视频下载下来，充分利用上下班的时间进行回看。但是往往事与愿违，大部分群管理员都会设置不允许下载回放 ( 如下图 ) ，幸好强大的互联网提供了各种 NB 工具，最终使用 `Charles` 和 `FFmpeg` 工具，成功实现了钉钉直播视频下载。

![1624070842](/assets/blog/2021/06/19/1624070842.jpg)

## Charles 配置

要下载钉钉群直播视频，我们需要先使用 Charles 抓包，获取直播视频的下载链接。如果本地没有安装过 Charles，需要从 [官网](https://www.charlesproxy.com/download/) 下载并安装，安装完成后可使用如下注册码：

```text
Registered Name: https://zhile.io
License Key: 48891cf209c6d32bf4
```

安装完成后，需要配置 Charles 代理，首先选择 `Proxy -> macOS Proxy` 菜单开启代理。

![1624070886](/assets/blog/2021/06/19/1624070886.jpg)

然后再选择 `Proxy -> Proxy Settings` 菜单，对代理进行配置，需要开启 `HTTP` 代理——选择 `Use HTTP proxy`。

![1624070907](/assets/blog/2021/06/19/1624070907.jpg)

由于钉钉群直播使用了 HTTPS 协议，因此需要安装 Charles 根证书，并设置 SSL 代理，支持加密数据的获取。安装 Charles 根证书操作很简单，选择 `Help -> SSL Proxying -> Install Charles Root Certificate` 即可完成安装。通常会出现如下界面 ( 未出现可自行打开 Mac 系统自带软件——钥匙串访问 ) ，如果证书显示不被信任，则双击进行设置，设置为始终信任。

![1624070928](/assets/blog/2021/06/19/1624070928.jpg)

最后再设置 SSL 代理，选择 `Proxy -> SSL Proxying Settings` 菜单，出现如下界面后，选中 `Enable SSL Proxying`，然后添加一个代理规则，Host 设置为 `*`，由于是抓取 HTTPS 协议请求，Port 设置为 `443`。

![1624070945](/assets/blog/2021/06/19/1624070945.jpg)

## Charles 抓包

Charles 配置完成后，打开钉钉群直播视频，然后观察 Charles 抓包内容，获取到如下请求信息，其中 `*.alicdn.com` 格式的请求，为钉钉群视频直播地址。展开抓取到的请求信息后，发现了完整的视频地址，最后我们要做的就是想办法下载 `m3u8` 格式的视频。

![1624070969](/assets/blog/2021/06/19/1624070969.jpg)

## FFmpeg 下载视频

下载视频之前，也许有小伙伴会好奇什么是 M3U8？参考网络上的相关博客，可以得到如下信息：

> `M3U8` 是 `Unicode` 版本的 `M3U`，用 UTF-8 编码。M3U 和 M3U8 文件都是苹果公司使用的 `HTTP Live Streaming` 协议格式的基础，这种协议格式可以在 iPhone 和 Macbook 等设备播放。
> `HLS` 的工作原理是把整个流分成一个个小的基于 `HTTP` 的文件来下载，每次只下载一些。当媒体流正在播放时，客户端可以选择从许多不同的备用源中以不同的速率下载同样的资源，允许流媒体会话适应不同的数据速率。

那么如何下载 `M3U8` 格式的视频呢？我们可以借助强大的 `FFmpeg` 工具来下载，通过 `homebrew` 可以快速在 Mac 上安装 FFmpeg。

```bash
brew install ffmpeg
```

安装过程中，如果出现 `LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to github.com:443` 错误，可以执行以下命令关闭 IPV6 网络 ( 参考 [文档](https://stackoverflow.com/questions/48987512/ssl-connect-ssl-error-syscall-in-connection-to-github-com443) ) ：

```bash
networksetup -setv6off Wi-Fi
```

安装完成后，我们只需要执行以下命令，即可下载 `M3U8` 格式视频，并转化为 `MP4` 格式。

```bash
ffmpeg -i "https://lzdliving.alicdn.com/live_hp/2fa194dc-044e-43f6-b964-3a09a43a3594_merge.m3u8?app_type=mac&auth_key=1616907608-0-0-fbfbee74d55b0a048ccc2f0e8920e6db&cid=038194bc5bde7a7bf9c1b126d48869e6&token=320f03dcb114f8f29e8c91a9427170f2sKmfXOG-gLUuCtVdMRfWRg21jiq2T6lwgb42XfmE2d6coCLyz7G1xNXtbbBvlxOsoKTqzHQNo002uoxS1IcHoxbzpEciQpOou8zu98qyQ_I=&token2=64f9833b15d8c3a85b466e4826bd8243HLTpjGeXPtMi9cWSIC0qXEDmDYjrQ7LPfJ3rwNMcHsqxiRko0EXzbbsEGe7KiSV92saXKu8Lp8QjI-WHrlFopaW-cSar4_kpYJcom0FY9gA&version=6.0.0" ~/Downloads/数据集成 Elasticsearch 实时同步.mp4
```

下载完成后，我们可以在 Download 文件夹找到对应的视频文件，使用 `ffplay ~/Downloads/数据集成 Elasticsearch 实时同步.mp4` 命令进行播放测试，可以看到效果非常完美。

![1624070987](/assets/blog/2021/06/19/1624070987.jpg)

## 参考文档

-   [钉钉群直播提取视频文件](https://yzxoi.top/archives/1274)
-   [搞定 m3u8 视频下载](https://sspai.com/post/43468)
-   [m3u8 文件格式详解](https://www.jianshu.com/p/e97f6555a070)

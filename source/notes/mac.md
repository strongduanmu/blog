---
menu_id: notes
wiki: notes
layout: wiki
title: Mac
order: 40
banner: /assets/banner/banner_10.jpg
---

## Mac 安装提示：已损坏，无法打开

解决步骤：

```bash
# 1. 在命令行执行以下命令
sudo spctl --master-disable

# 2. 打开系统设置，点击安全与隐私，在软件来源处选择任意来源
# 3. 执行以下命令
xattr -rc /Applications/prettyZoo.app
```

## Mac 快速开启 HTTP 服务

```bash
# 启动 Apache 服务
sudo apachectl start
# 重启 Apache 服务
sudo apachectl restart
# 关闭 Apache 服务
sudo apachectl stop

# 修改端口：打开 /etc/apache2/httpd.conf
# 将默认 80 端口改为 8080
open /etc/apache2
# 打开 HTTP 服务根目录
open /Library/WebServer/Documents
# 访问 localhost:8080 会出现 It works! 提示
```

## Hackintosh 更新驱动

Hackintosh 安装完成后，出现有线耳机无法输入声音的情况，咨询黑苹果大佬后建议更新 AppleALC 驱动 1.8.7。首先，执行如下命令，下载 `Kext Updater` 软件获取最新驱动。

```bash
brew install --cask kext-updater
```

安装完成后打开 `Kext Updater`，点击 Check 检测最新驱动，完成后最新的驱动会下载到桌面 `Kext-Updates` 文件夹下。

![Kext Updater 更新驱动](/assets/blog/2023/11/14/1699923359.png)

然后执行以下命令挂在 EFI 分区，此时将 `AppleALC.kext` 文件复制到 `/Volumes/Untitled 1/EFI/OC/Kexts` 目录下（记得备份原始文件）。

```bash
sudo diskutil mount disk0s1
```

然后重启电脑再次测试声音输入。

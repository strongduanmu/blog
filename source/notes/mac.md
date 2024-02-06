---
menu_id: notes
wiki: notes
layout: wiki
title: Mac
order: 40
---

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

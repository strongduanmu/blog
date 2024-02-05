---
menu_id: notes
wiki: notes
layout: wiki
title: VirtualBox
order: 50
---

## Kernel driver not installed (rc=-1908)

Mac 上使用 VirtualBox 虚拟机安装系统出现如下异常：

```
Kernel driver not installed (rc=-1908)
Make sure the kernel module has been loaded successfully.
where: suplibOsInit what: 3 VERR_VM_DRIVER_NOT_INSTALLED (-1908) - The support driver is not installed. On linux, open returned ENOENT. 
```

首先需要在 `系统偏好设置-安全性与隐私` 中，允许 VirtualBox 加载，然后再执行如下命令重启 VirtualBox。

```bash
sudo /Library/Application\ Support/VirtualBox/LaunchDaemons/VirtualBoxStartup.sh restart
```

重启 VirtualBox 后再次尝试，可以正常安装或使用系统了。

![1660094128](https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2022/08/10/1660094128.png)

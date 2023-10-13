---
robots: noindex,nofollow
sitemap: false
menu_id: notes
layout: wiki
seo_title: Ubuntu
order: 50
---

## Ubuntu 22.04 显示白屏解决方案

解决方案来源：https://askubuntu.com/questions/1437167/ubuntu-22-04-1-lts-white-screen-after-boot

* 使用 `gedit` 编辑 `grub` 文件：

```bash
sudo gedit /etc/default/grub
```

* 将如下的 `GRUB_CMDLINE_LINUX_DEFAULT` 值修改为 `quiet splash nomodeset`。

```bash
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash" -> GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
```

* 最后执行如下命令更新 `grub`：

```bash
sudo update-grub2
```

重启测试，白屏问题已经解决。

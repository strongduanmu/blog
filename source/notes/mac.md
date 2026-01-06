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

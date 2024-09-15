---
menu_id: notes
wiki: notes
layout: wiki
order: 20
title: Shell
banner: /assets/banner/banner_9.jpg
---

## scp

```bash
# 复制本地文件到远程，命令格式：scp [-P<port>] <local_file_path> <username>@<host>:<remote_directory>
scp -P22 ~/Downloads/perf.svg root@100.75.35.101:/root

# 复制远程文件到本地，命令格式：scp [-P<port>] <username>@<host>:<remote_file_path> <local_directory>
scp -P22 root@100.75.35.101:/root/perf.svg ~/Downloads

# 复制远程文件到其他主机，命令格式：scp [-P<port>] <remote_file_path> <username>@<host>:<remote_directory>
scp -P22 root@100.75.35.101:/root/perf.svg root@100.75.35.102:/root
```

## rename

```bash
# 批量重命名，将 tcl 目录下 *.java 文件名称中的 MySQL 替换为 Doris
rename 's/MySQL/Doris/' tcl/*.java
```


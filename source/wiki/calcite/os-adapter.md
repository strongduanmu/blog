---
layout: wiki
wiki: calcite
order: 208
title: 操作系统适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/os_adapter.html

## 概述

操作系统适配器允许你使用 SQL 查询访问操作系统和环境中的数据。

它旨在解决传统上使用 UNIX 命令管道解决的问题，但具有 SQL 的强大功能和类型安全性。

该适配器还包括一个名为 `sqlsh` 的包装器，允许你从喜爱的 shell 执行命令。

## 安全警告

操作系统适配器会启动进程，并且可能是一个安全漏洞。它包含在 Calcite 的 "plus" 模块中，默认情况下不启用。在安全敏感的情况下启用它之前，你必须仔细考虑。

## 兼容性

我们尝试在每个操作系统上支持所有表，并确保表具有相同的列。但我们严重依赖操作系统命令，这些命令差异很大。因此：

- 这些命令仅适用于 Linux 和 macOS（不适用于 Windows，即使使用 Cygwin）；
- `vmstat` 在 Linux 和 macOS 之间的列非常不同；
- `files` 和 `ps` 具有相同的列名，但语义不同；
- 其他命令基本相同。

## 一个简单的例子

每个 bash 黑客都知道要找到 3 个最大的文件，你需要输入：

```bash
$ find . -type f -print0 | xargs -0 ls -l  | sort -nr -k 5 | head -3
-rw-r--r-- 1 jhyde jhyde 194877 Jul 16 16:10 ./validate/SqlValidatorImpl.java
-rw-r--r-- 1 jhyde jhyde  73826 Jul  4 21:51 ./fun/SqlStdOperatorTable.java
-rw-r--r-- 1 jhyde jhyde  39214 Jul  4 21:51 ./type/SqlTypeUtil.java
```

这实际上是一个关系操作管道，每个元组由空格分隔的字段行表示。如果我们能够将文件列表作为关系访问并在 SQL 查询中使用它会怎样？如果我们能够轻松地从 shell 执行该 SQL 查询会怎样？这就是 `sqlsh` 所做的：

```bash
$ sqlsh select size, path from files where type = 'f' order by size desc limit 3
194877 validate/SqlValidatorImpl.java
73826 fun/SqlStdOperatorTable.java
39214 type/SqlTypeUtil.java
```

## sqlsh

`sqlsh` 启动与 Calcite 的连接，其默认模式是操作系统适配器。

它使用 JAVA 词法模式，这意味着未加引号的表和列名称保持其编写时的大小写。这与 bash 等 shell 的行为一致。

必须小心处理 shell 元字符（如 `*`、`>`、`<`、`(` 和 `)`）。通常添加反斜杠就足够了。

## 表和命令

操作系统适配器包含以下表：

- `cpu_info` - CPU 信息（来自 oshi）
- `cpu_time` - CPU 时间（来自 oshi）
- `du` - 磁盘使用情况（基于 `du` 命令）
- `files` - 文件（基于 `find` 命令）
- `git_commits` - Git 提交（基于 `git log`）
- `interface_addresses` - 网络地址（来自 oshi）
- `interface_details` - 网络接口（来自 oshi）
- `java_info` - Java 信息（来自 oshi）
- `memory_info` - 内存（来自 oshi）
- `mounts` - 文件系统挂载（来自 oshi）
- `os_version` - 操作系统版本（来自 oshi）
- `ps` - 进程（基于 `ps` 命令）
- `stdin` - 标准输入
- `system_info` - 系统信息（来自 oshi）
- `vmstat` - 虚拟内存（基于 `vmstat` 命令）

大多数表实现为表函数之上的视图。

添加新数据源很简单；欢迎贡献你的！

## 示例：du

有多少类文件，总大小是多少？在 `bash` 中：

```bash
$ du -ka . | grep '\.class$' | awk '{size+=$1} END {print FNR, size}'
4416 27960
```

在 `sqlsh` 中：

```bash
$ sqlsh select count\(\*\), sum\(size_k\) from du where path like '%.class'
4416 27960
```

反斜杠是必需的，因为 `(`、`*`、`)` 和 `'` 是 shell 元字符。

## 示例：files

有多少文件和目录？在 `bash` 中，你会使用 `find`：

```bash
$ find . -printf "%Y %p\n" | grep '/test/' | cut -d' ' -f1 | sort | uniq -c
    143 d
   1336 f
```

在 `sqlsh` 中，使用 `files` 表：

```bash
$ sqlsh select type, count\(\*\) from files where path like '%/test/%' group by type
d 143
f 1336
```

## 示例：ps

哪些用户有正在运行的进程？在 `sqlsh` 中：

```bash
$ sqlsh select distinct ps.\`user\` from ps
avahi
root
jhyde
syslog
nobody
daemon
```

`ps.` 限定符和反引号是必需的，因为 USER 是 SQL 保留字。

现在是一个 "前 N 个" 问题：哪些用户的进程最多？在 `bash` 中：

```bash
$ ps aux | awk '{print $1}' | sort | uniq -c | sort -nr | head -3
```

在 `sqlsh` 中：

```bash
$ ./sqlsh select count\(\*\), ps.\`user\` from ps group by ps.\`user\` order by 1 desc limit 3
185 root
69 jhyde
2 avahi
```

## 示例：vmstat

我的内存如何？

```bash
$ ./sqlsh -o mysql select \* from vmstat
+--------+--------+----------+----------+----------+-----------+---------+---------+-------+-------+-----------+-----------+--------+--------+--------+--------+--------+
| proc_r | proc_b | mem_swpd | mem_free | mem_buff | mem_cache | swap_si | swap_so | io_bi | io_bo | system_in | system_cs | cpu_us | cpu_sy | cpu_id | cpu_wa | cpu_st |
+--------+--------+----------+----------+----------+-----------+---------+---------+-------+-------+-----------+-----------+--------+--------+--------+--------+--------+
|     12 |      0 |    54220 |  5174424 |   402180 |   4402196 |       0 |       0 |    15 |    35 |         3 |         2 |      7 |      1 |     92 |      0 |      0 |
+--------+--------+----------+----------+----------+-----------+---------+---------+-------+-------+-----------+-----------+--------+--------+--------+--------+--------+
(1 row)
```

## 示例：explain

要找出表有哪些列，请使用 `explain`：

```bash
$ sqlsh explain plan with type for select \* from du
size_k BIGINT NOT NULL,
path VARCHAR NOT NULL,
size_b BIGINT NOT NULL
```

## 示例：git

每年有多少次提交和不同的作者？`git_commits` 表基于 `git log` 命令。

```bash
./sqlsh select floor\(commit_timestamp to year\) as y, count\(\*\), count\(distinct author\) from git_commits group by y order by 1
2012-01-01 00:00:00 180 6
2013-01-01 00:00:00 502 13
2014-01-01 00:00:00 679 36
2015-01-01 00:00:00 470 45
2016-01-01 00:00:00 465 67
2017-01-01 00:00:00 279 53
```

请注意，`group by y` 是可能的，因为 `sqlsh` 使用 Calcite 的宽松模式。

## 示例：stdin

打印标准输入，为每行添加一个编号。

```bash
$ (echo cats; echo and dogs) | cat -n -
     1  cats
     2  and dogs
```

在 `sqlsh` 中：

```bash
$ (echo cats; echo and dogs) | ./sqlsh select \* from stdin
1 cats
2 and dogs
```

## 示例：输出格式

`-o` 选项控制输出格式。

```bash
$ ./sqlsh -o mysql select min\(size_k\), max\(size_k\) from du
+--------+--------+
| EXPR$0 | EXPR$1 |
+--------+--------+
|      0 |  94312 |
+--------+--------+
(1 row)
```

格式选项：

- spaced - 字段之间有空格（默认）
- headers - 与 spaced 相同，但有标题
- csv - 逗号分隔值
- json - JSON，每行一个对象
- mysql - 对齐的表，与 MySQL 使用的格式相同

## 示例：jps

提供所有当前 java 进程 pid 的显示。在 `sqlsh` 中：

```bash
$ ./sqlsh select distinct jps.\`pid\`, jps.\`info\` from jps
+--------+---------------------+
| pid    |  info               |
+--------+---------------------+
|  49457 | RemoteMavenServer   |
|  48326 | KotlinCompileDaemon |
+--------+---------------------+
(1 row)
```

## 进一步工作

操作系统适配器是在 [CALCITE-1896] 中创建的，但尚未完成。

进一步工作的一些想法：

- 在未加引号的表名中允许 '-' 和 '.'（以匹配典型的文件名）
- 允许序号字段引用，例如 '$3'。这对于没有命名字段的文件（例如 `stdin`）会有帮助，但即使字段有名称，你也可以使用它们。还有 '$0' 表示整个输入行。
- 使用文件适配器，例如 `select * from file.scott.emp` 将使用文件适配器打开文件 `scott/emp.csv`
- 更多基于 git 的表，例如分支、标签、每次提交中更改的文件
- `wc` 函数，例如 `select path, lineCount from git_ls_files cross apply wc(path)`
- 移动 `sqlsh` 命令，或者至少将其下面的 java 代码移动到 sqlline 中



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

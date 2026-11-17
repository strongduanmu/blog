---
layout: wiki
wiki: jdbc
order: 001
title: 前言
date: 2022-02-29 11:15:27
comment_id: 'jdbc_4.2_specification'
banner: /assets/banner/banner_9.jpg
---

> 原文链接：https://download.oracle.com/otndocs/jcp/jdbc-4_2-mrel2-spec/

本文档取代了以下早期规范，并整合了其中的内容：

- `"JDBC: A Java SQL API"`
- `"JDBC 2.1 API"`
- `"JDBC 2.0 Standard Extension API"`
- `"JDBC 3.0 Specification"`

本文档为 JDBC API 引入了一系列新特性，同时改进了 JDBC 3.0 及更早版本中已有功能的规范说明。对于 JDBC 3.0 API 的变更，文档会尽可能作出标记，便于读者识别。带有 JDBC 4.2 API 标记的部分，则说明了本次修订新增或更新的内容。

读者还可以下载 API 规范（Javadoc API 及其注释），查阅 JDBC 类和接口的完整、准确的定义。相关文档下载地址：https://jcp.org/en/jsr/detail?id=221

## 排版约定

| 字体样式 | 含义 | 示例 |
|---------|------|------|
| `AaBbCc123` | 命令、文件和目录名称；屏幕上的计算机输出 | 编辑您的 `.login` 文件。使用 `ls -a` 列出所有文件。`% You have mail.` |
| *`AaBbCc123`* | 用户输入的内容，用于与计算机输出区分 | `% su Password:` |
| **`AaBbCc123`** | 书名、新词或术语、需要强调的词语 | 阅读《用户指南》第 6 章。这些被称为类选项。您必须是超级用户才能执行此操作。 |
| `AaBbCc123` | 命令行变量，使用时需替换为实际名称或值 | 要删除文件，请输入 `rm filename` |

## 提交反馈

有关本规范的意见和问题，请发送至：`jsr-221-comments@jcp.org`

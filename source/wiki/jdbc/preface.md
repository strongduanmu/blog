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

本文档取代并整合了以下先前规范的内容：

- `"JDBC: A Java SQL API"`
- `"JDBC 2.1 API"`
- `"JDBC 2.0 Standard Extension API"`
- `"JDBC 3.0 Specification"`

本文档为 `JDBC API` 引入了一系列新特性，并整合了多项规范改进，重点关注 `JDBC 3.0 API` 及更早版本中引入的能力。在可能的情况下，对 `JDBC 3.0 API` 的调整都会作出标记，以便于识别。请留意 `JDBC 4.2 API` 标记，以了解本次修订规范中新增或更新的具体内容。

读者还可以下载 `API` 规范（`Javadoc API` 及注释），以获取 `JDBC` 类和接口的完整而精确的定义。相关文档可从以下页面获取：https://jcp.org/en/jsr/detail?id=221

## 排版约定

| 字体样式 | 含义 | 示例 |
|---------|------|------|
| `AaBbCc123` | 命令、文件和目录名称；屏幕上的计算机输出 | 编辑您的 `.login` 文件。使用 `ls -a` 列出所有文件。`% You have mail.` |
| *`AaBbCc123`* | 您输入的内容，与屏幕上的计算机输出形成对比 | `% su Password:` |
| **`AaBbCc123`** | 书名、新词或术语、需要强调的词语 | 阅读《用户指南》第 6 章。这些被称为类选项。您必须是超级用户才能执行此操作。 |
| `AaBbCc123` | 命令行变量；用实际名称或值替换 | 要删除文件，请输入 `rm filename` |

## 提交反馈

请将有关本规范的任何意见和问题发送至：`jsr-221-comments@jcp.org`

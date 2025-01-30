---
layout: wiki
wiki: avatica
order: 002
title: 路线图
date: 2025-01-30 12:15:27
banner: /assets/banner/banner_1.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/roadmap.html

## 状态

### 已实现

- 创建连接 `create connection`、创建语句 `create statement`、元数据 `metadata`、准备 `prepare`、绑定 `bind`、执行 `execute`、获取 `fetch`；
- 通过 HTTP 使用 JSON 进行 RPC 调用；
- 本地实现；
- 通过现有的 JDBC 驱动程序实现；
- 复合 RPC 调用（将多个请求组合成一次往返）：
  - `执行` - `获取`；
  - 元数据获取（元数据调用，例如 `getTables` 返回所有行）。

### 未实现

- ODBC
- RPC 调用：
  - CloseStatement；
  - CloseConnection。
- 复合 RPC 调用：
  - CreateStatement - Prepare；
  - CloseStatement - CloseConnection；
  - 准备 - 执行 - 获取（`Statement.executeQuery` 应该获取前 N 行）；
- 从语句表中删除语句；
- DML (INSERT, UPDATE, DELETE)；
- `Statement.execute` 应用于 SELECT 语句。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)
---
layout: wiki
wiki: jdbc
order: 019
title: 第十八章 与连接器的关系
date: 2022-02-29 11:15:27
comment_id: 'jdbc_relationship_to_connectors'
banner: /assets/banner/banner_9.jpg
---

连接器架构定义了一种标准方式来打包和部署资源适配器，允许 `Java EE` 容器将其连接、事务和安全管理与外部资源的管理集成。本章描述了 `JDBC API` 与连接器架构的关系。

## 18.1 系统约定

连接器架构定义了一组系统约定，资源适配器必须支持这些约定才能与 `Java EE` 应用服务器集成：

- **连接管理约定** — 允许应用程序服务器池化到底层 `EIS` 的连接
- **事务管理约定** — 允许应用程序服务器管理事务
- **安全性约定** — 允许应用程序服务器进行安全性集成
- **生命周期管理约定** — 允许应用程序服务器管理资源适配器的生命周期

## 18.2 将连接器系统约定映射到 `JDBC` 接口

`JDBC API` 接口与连接器系统约定之间存在以下映射：

| 连接器约定 | `JDBC` 接口 |
|-----------|----------|
| `ConnectionFactory` | `DataSource` |
| `Connection` | `Connection` |
| `ConnectionEventListener` | `ConnectionEventListener` |
| `ConnectionEvent` | `ConnectionEvent` |
| `ManagedConnectionFactory` | `ConnectionPoolDataSource` / `XADataSource` |
| `ManagedConnection` | `PooledConnection` / `XAConnection` |

### 18.2.1 连接管理

`JDBC` 连接池接口 (`ConnectionPoolDataSource`, `PooledConnection`) 对应于连接器连接管理约定。

### 18.2.2 事务管理

`JDBC` 事务接口 (`XADataSource`, `XAConnection`, `XAResource`) 对应于连接器事务管理约定。

### 18.2.3 安全性

`JDBC API` 使用标准的用户名/密码认证机制。

## 18.3 以连接器 `RAR` 文件格式打包 `JDBC` 驱动程序

`JDBC` 驱动程序可以打包为资源适配器存档 (`RAR`) 文件，以便部署到 `Java EE` 应用服务器。`RAR` 文件包含：

- **`ra.xml`** — 部署描述符
- **`JDBC` 驱动程序类** — 驱动程序实现
- **任何本地库** — 驱动程序所需的本地代码

### 18.3.1 部署描述符

`ra.xml` 部署描述符指定：

- 资源适配器类
- 连接工厂接口和实现
- 连接接口和实现
- 受管连接工厂类
- 配置属性

### 18.3.2 部署

将 `RAR` 文件部署到应用服务器后，应用程序可以：

1. 使用 `JNDI` 查找 `DataSource`
2. 获取连接
3. 执行 `SQL` 操作

## 18.4 迁移路径

对于希望迁移到连接器架构的 `JDBC` 驱动程序供应商，建议采取以下步骤：

1. 实现 `ManagedConnectionFactory` 接口（通常通过包装现有的 `XADataSource` 或 `ConnectionPoolDataSource`）
2. 实现 `ManagedConnection` 接口（通常通过包装现有的 `XAConnection` 或 `PooledConnection`）
3. 创建 `ra.xml` 部署描述符
4. 将驱动程序打包为 `RAR` 文件

这种迁移允许驱动程序利用 `Java EE` 应用服务器提供的基础设施服务，同时保持与现有 `JDBC` 应用程序的兼容性。

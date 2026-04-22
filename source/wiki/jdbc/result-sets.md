---
layout: wiki
wiki: jdbc
order: 016
title: 第十五章 结果集
date: 2022-02-29 11:15:27
comment_id: 'jdbc_result_sets'
banner: /assets/banner/banner_9.jpg
---

`ResultSet` 对象表示执行 `SQL` 查询返回的结果集。本章描述 `ResultSet` 接口的功能。

## 15.1 `ResultSet` 对象的类型

### 15.1.1 `ResultSet` 类型

`JDBC` 定义了三种 `ResultSet` 类型：

- **`TYPE_FORWARD_ONLY`** — 游标只能向前移动
- **`TYPE_SCROLL_INSENSITIVE`** — 游标可以向前和向后滚动，但对底层更改不敏感
- **`TYPE_SCROLL_SENSITIVE`** — 游标可以向前和向后滚动，并且对底层更改敏感

### 15.1.2 `ResultSet` 并发性

`JDBC` 定义了两种并发模式：

- **`CONCUR_READ_ONLY`** — `ResultSet` 不能用于更新数据库
- **`CONCUR_UPDATABLE`** — `ResultSet` 可用于更新数据库

### 15.1.3 `ResultSet` 可保持性

可保持性指定 `ResultSet` 在事务提交时是否保持打开：

- **`HOLD_CURSORS_OVER_COMMIT`** — 在事务提交时保持游标打开
- **`CLOSE_CURSORS_AT_COMMIT`** — 在事务提交时关闭游标

#### 15.1.3.1 确定 `ResultSet` 可保持性

可以通过 `DatabaseMetaData.getResultSetHoldability()` 方法确定默认可保持性。

### 15.1.4 指定 `ResultSet` 类型、并发性和可保持性

创建 `Statement`、`PreparedStatement` 或 `CallableStatement` 时可以指定这些属性。

## 15.2 创建和操作 `ResultSet` 对象

### 15.2.1 创建 `ResultSet` 对象

`ResultSet` 对象通过执行查询来创建。

```java
Statement stmt = con.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM employees");
```
### 15.2.2 游标移动

`ResultSet` 提供了移动游标的方法：

- `next()`：移动到下一行
- `previous()`：移动到上一行
- `absolute(int row)`：移动到指定行
- `relative(int rows)`：按相对位移移动指定行数
- `first()`、`last()`：移动到第一行或最后一行
- `beforeFirst()`、`afterLast()`：移动到结果集之前或之后

### 15.2.3 检索值

#### 15.2.3.1 数据类型转换

`ResultSet` 提供了各种 `getXXX` 方法来检索不同类型的数据。

```java
int id = rs.getInt("id");
String name = rs.getString("name");
Date hireDate = rs.getDate("hire_date");
```
#### 15.2.3.2 `ResultSet` 元数据

`ResultSetMetaData` 接口提供有关 `ResultSet` 结构的信息。

```java
ResultSetMetaData rsmd = rs.getMetaData();
int columnCount = rsmd.getColumnCount();
String columnName = rsmd.getColumnName(1);
```
#### 15.2.3.3 检索 `NULL` 值

当列值为 `SQL NULL` 时，`getXXX` 方法返回特定的默认值：

- 数值类型返回 0
- 布尔类型返回 `false`
- 对象类型返回 `null`

可以使用 `wasNull()` 方法确定最后一个读取的值是否为 `SQL NULL`。

### 15.2.4 修改 `ResultSet` 对象

对于可更新的 `ResultSet`，可以使用以下方法修改数据：

#### 15.2.4.1 更新行

```java
rs.updateString("name", "New Name");
rs.updateRow();
```
#### 15.2.4.2 删除行

```java
rs.deleteRow();
```
#### 15.2.4.3 插入行

```java
rs.moveToInsertRow();
rs.updateInt("id", 100);
rs.updateString("name", "New Employee");
rs.insertRow();
rs.moveToCurrentRow();
```
#### 15.2.4.4 定位更新和删除

可以使用 `ResultSet` 中的定位更新和删除功能。

### 15.2.5 关闭 `ResultSet` 对象

当应用程序完成使用 `ResultSet` 时，应该关闭它以释放资源。

```java
rs.close();
```
## 15.3 性能提示

对于大型结果集，考虑使用以下技术：

- 使用 `setFetchSize()` 控制从数据库获取的行数
- 使用 `setFetchDirection()` 优化游标移动
- 适当选择 `ResultSet` 类型以平衡功能和性能

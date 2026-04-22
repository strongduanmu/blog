---
layout: wiki
wiki: jdbc
order: 014
title: 第十三章 语句
date: 2022-02-29 11:15:27
comment_id: 'jdbc_statements'
banner: /assets/banner/banner_9.jpg
---

`Statement` 对象用于执行 `SQL` 语句并检索结果。`JDBC API` 提供了三种类型的语句接口：

- **`Statement`** — 用于执行不带参数的简单 `SQL` 语句
- **`PreparedStatement`** — 用于执行带或不带 `IN` 参数的预编译 `SQL` 语句
- **`CallableStatement`** — 用于执行存储过程调用

## 13.1 `Statement` 接口

`Statement` 接口是执行 `SQL` 语句的基本接口。

### 13.1.1 创建语句

`Statement` 对象使用 `Connection.createStatement`() 方法创建。

```java
Statement stmt = con.createStatement();
```
#### 13.1.1.1 设置 `ResultSet` 特性

`createStatement` 方法可以接受参数来指定返回的 `ResultSet` 的类型、并发性和可保持性。

```java
Statement stmt = con.createStatement(
    ResultSet.TYPE_SCROLL_INSENSITIVE,
    ResultSet.CONCUR_UPDATABLE
);
```
### 13.1.2 执行 `Statement` 对象

#### 13.1.2.1 返回 `ResultSet` 对象

`executeQuery` 方法用于执行返回 `ResultSet` 的 `SQL` 查询。

```java
ResultSet rs = stmt.executeQuery("SELECT * FROM employees");
```
#### 13.1.2.2 返回更新计数

`executeUpdate` 方法用于执行 `DML` 语句（`INSERT`、`UPDATE`、`DELETE`）和 `DDL` 语句。

```java
int updateCount = stmt.executeUpdate("DELETE FROM employees WHERE id = 100");
```
#### 13.1.2.3 返回未知或多个结果

`execute` 方法用于执行可能返回多个结果或返回类型未知的语句。

```java
boolean isResultSet = stmt.execute(sql);
if (isResultSet) {
    ResultSet rs = stmt.getResultSet();
} else {
    int updateCount = stmt.getUpdateCount();
}
```
### 13.1.3 限制 `Statement` 对象的执行时间

`Statement` 接口提供了设置查询超时的方法。

```java
stmt.setQueryTimeout(10); // 10 seconds
```
### 13.1.4 关闭 `Statement` 对象

当应用程序完成使用 `Statement` 对象时，应该关闭它以释放资源。

```java
stmt.close();
```
## 13.2 `PreparedStatement` 接口

`PreparedStatement` 接口扩展了 `Statement` 接口，添加了设置参数的功能。

### 13.2.1 创建 `PreparedStatement` 对象

`PreparedStatement` 对象使用 `Connection.prepareStatement`() 方法创建。

```java
PreparedStatement pstmt = con.prepareStatement(
    "SELECT * FROM employees WHERE department_id = ?"
);
```
#### 13.2.1.1 设置 `ResultSet` 特性

与 `Statement` 类似，可以指定 `ResultSet` 的特性。

### 13.2.2 设置参数

`PreparedStatement` 提供了各种 `setXXX` 方法来设置参数值。

#### 13.2.2.1 类型转换

`JDBC` 定义了从 `Java` 类型到 `SQL` 类型的标准映射。

#### 13.2.2.2 国家字符集转换

`setNString`、`setNClob` 等方法用于处理国家字符集数据。

#### 13.2.2.3 使用 `setObject` 方法进行类型转换

`setObject` 方法可以将任意 `Java` 对象转换为适当的 `SQL` 类型。

```java
pstmt.setObject(1, myObject, Types.VARCHAR);
```
#### 13.2.2.4 设置 `NULL` 参数

`setNull` 方法用于将参数设置为 `SQL` `NULL`。

```java
pstmt.setNull(1, Types.VARCHAR);
```
#### 13.2.2.5 清除参数

`clearParameters` 方法清除所有参数值。

```java
pstmt.clearParameters();
```
### 13.2.3 执行 `PreparedStatement` 对象

`PreparedStatement` 对象使用 `executeQuery`、`executeUpdate` 或 `execute` 方法执行。

## 13.3 `CallableStatement` 接口

`CallableStatement` 接口扩展了 `PreparedStatement` 接口，添加了对存储过程调用的支持。

### 13.3.1 创建 `CallableStatement` 对象

`CallableStatement` 对象使用 `Connection.prepareCall`() 方法创建。

```java
CallableStatement cstmt = con.prepareCall("{call getEmployee(?, ?)}");
```
### 13.3.2 设置参数

#### 13.3.2.1 `IN` 参数

`IN` 参数使用与 `PreparedStatement` 相同的 `setXXX` 方法设置。

#### 13.3.2.2 `OUT` 参数

`OUT` 参数必须使用 `registerOutParameter` 方法注册。

```java
cstmt.registerOutParameter(2, Types.VARCHAR);
```
#### 13.3.2.3 `INOUT` 参数

`INOUT` 参数需要设置值并注册输出类型。

```java
cstmt.setString(1, "input");
cstmt.registerOutParameter(1, Types.VARCHAR);
```
#### 13.3.2.4 清除参数

`clearParameters` 方法清除所有参数值。

### 13.3.3 执行 `CallableStatement` 对象

#### 13.3.3.1 返回单个 `ResultSet` 对象

#### 13.3.3.2 返回更新计数

#### 13.3.3.3 返回未知或多个结果

#### 13.3.3.4 `REF` `Cursor` 支持

`JDBC` 4.2 添加了对 `REF CURSOR` 数据类型的支持。

## 13.4 转义语法

`JDBC` 定义了转义语法以提供数据库独立性。

### 13.4.1 标量函数

```
{fn scalar_function}
```
### 13.4.2 日期和时间字面量

```
{d 'yyyy-mm-dd'}
{t 'hh:mm:ss'}
{ts 'yyyy-mm-dd hh:mm:ss.f...'}
```
### 13.4.3 外连接

```
{oj outer-join}
```
### 13.4.4 存储过程和函数

```
{call procedure_name(?, ...)}
{? = call function_name(?, ...)}
```
### 13.4.5 `LIKE` 转义字符

```
{escape 'escape-character'}
```
### 13.4.6 限制返回行

```
LIMIT rows
```
## 13.5 获取自动生成的值

`JDBC` 提供了获取自动生成键的机制。

```java
Statement stmt = con.createStatement();
stmt.execute(insertSQL, Statement.RETURN_GENERATED_KEYS);
ResultSet rs = stmt.getGeneratedKeys();
```
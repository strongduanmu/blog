---
layout: wiki
wiki: jdbc
order: 018
title: 第十七章 自定义类型映射
date: 2022-02-29 11:15:27
comment_id: 'jdbc_customized_type_mapping'
banner: /assets/banner/banner_9.jpg
---

`JDBC API` 支持将 `SQL` 用户定义类型 (`UDT`) 自定义映射到 `Java` 编程语言中的类。本章描述了这种映射机制。

## 17.1 类型映射

类型映射是一个 `java.util.Map` 对象，它将 `SQL UDT` 名称与 `Java` 类关联起来。每个连接都维护一个类型映射，可以通过 `Connection.getTypeMap()` 方法获取。

```java
Map<String, Class<?>> typeMap = con.getTypeMap();
typeMap.put("SCHEMA.ADDRESS", Address.class);
con.setTypeMap(typeMap);
```
## 17.2 类约定

自定义映射的 `Java` 类必须实现 `java.sql.SQLData` 接口。`SQLData` 接口定义了以下方法：

- `readSQL(SQLInput stream, String typeName)`：从 `SQL` 数据流读取数据
- `writeSQL(SQLOutput stream)`：将数据写入 `SQL` 数据流
- `getSQLTypeName()`：返回 `SQL` 类型名称

## 17.3 `SQL` 数据流

### 17.3.1 检索数据

当使用 `getObject` 方法检索 `UDT` 时，`JDBC` 驱动程序会：

1. 确定类型映射中是否定义了该 `UDT` 的自定义映射
2. 如果有，创建相应 `Java` 类的实例
3. 调用 `readSQL` 方法填充对象

```java
Address addr = (Address) rs.getObject("address_column");
```
### 17.3.2 存储数据

当使用 `setObject` 方法存储 `Java` 对象时，`JDBC` 驱动程序会：

1. 检查对象是否实现 `SQLData` 接口
2. 如果是，调用 `writeSQL` 方法序列化对象

```java
pstmt.setObject(1, address);
```
## 17.4 示例

### 17.4.1 `SQL` 结构化类型

```sql
CREATE TYPE ADDRESS AS (
    street VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(2),
    zip VARCHAR(10)
);
```
### 17.4.2 `SQLData` 实现

```java
public class Address implements SQLData {
    private String street;
    private String city;
    private String state;
    private String zip;
    private String sqlType;

    public String getSQLTypeName() {
        return sqlType;
    }

    public void readSQL(SQLInput stream, String typeName) throws SQLException {
        sqlType = typeName;
        street = stream.readString();
        city = stream.readString();
        state = stream.readString();
        zip = stream.readString();
    }

    public void writeSQL(SQLOutput stream) throws SQLException {
        stream.writeString(street);
        stream.writeString(city);
        stream.writeString(state);
        stream.writeString(zip);
    }

    // Getters and setters...
}
```
### 17.4.3 在 `Java` 编程语言中镜像 `SQL` 继承

当 `SQL` 结构化类型参与继承层次结构时，`Java` 类也应该反映这种层次结构。

### 17.4.4 `SQL DISTINCT` 类型映射示例

```sql
CREATE TYPE MONEY AS DECIMAL(10, 2);
```
```java
public class Money implements SQLData {
    private BigDecimal amount;
    private String sqlType;

    public String getSQLTypeName() {
        return sqlType;
    }

    public void readSQL(SQLInput stream, String typeName) throws SQLException {
        sqlType = typeName;
        amount = stream.readBigDecimal();
    }

    public void writeSQL(SQLOutput stream) throws SQLException {
        stream.writeBigDecimal(amount);
    }
}
```
## 17.5 变换组的效果

变换组是 `SQL:2003` 的一项功能，允许根据上下文以不同方式表示 `UDT`。`JDBC` 驱动程序可能支持也可能不支持此功能。

## 17.6 方法的通用性

自定义类型映射方法也适用于：

- `Distinct` 类型
- 结构化类型
- 数组元素

## 17.7 `NULL` 数据

当 `SQL UDT` 值为 `NULL` 时，`getObject` 方法返回 `Java null`。

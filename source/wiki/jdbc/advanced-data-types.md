---
layout: wiki
wiki: jdbc
order: 017
title: 第十六章 高级数据类型
date: 2022-02-29 11:15:27
comment_id: 'jdbc_advanced_data_types'
banner: /assets/banner/banner_9.jpg
---

`JDBC API` 提供了对 `SQL:2003` 高级数据类型的支持，包括 `BLOB`、`CLOB`、`ARRAY`、`REF`、`STRUCT`、`XML` 等。

## 16.1 `SQL` 类型分类

`SQL` 类型可以分为以下几类：

- **基本类型** — `CHAR`、`VARCHAR`、`INTEGER`、`DECIMAL` 等
- **高级类型** — `BLOB`、`CLOB`、`ARRAY`、`REF`、`STRUCT` 等
- **用户定义类型 (`UDT`)** — `DISTINCT`、`STRUCTURED` 等

## 16.2 高级数据类型映射

`JDBC` 定义了从 `SQL` 高级类型到 `Java` 类型的标准映射。

## 16.3 `Blob`、`Clob` 和 `NClob` 对象

### 16.3.1 `Blob`、`Clob` 和 `NClob` 实现

`JDBC` 驱动程序必须提供 `Blob`、`Clob` 和 `NClob` 接口的实现。

### 16.3.2 创建 `Blob`、`Clob` 和 `NClob` 对象

可以使用 `Connection.createBlob()`、`Connection.createClob()` 和 `Connection.createNClob()` 方法创建这些对象。

```java
Blob blob = con.createBlob();
blob.setBytes(1, data);

Clob clob = con.createClob();
clob.setString(1, "text data");
```
### 16.3.3 在 `ResultSet` 中检索 `BLOB`、`Clob` 和 `NClob` 值

```java
Blob blob = rs.getBlob("blob_column");
Clob clob = rs.getClob("clob_column");
```
### 16.3.4 访问 `Blob`、`Clob` 和 `NClob` 对象数据

```java
// Blob
byte[] data = blob.getBytes(1, (int) blob.length());

// Clob
String text = clob.getSubString(1, (int) clob.length());
```
### 16.3.5 存储 `Blob`、`Clob` 和 `NClob` 对象

```java
PreparedStatement pstmt = con.prepareStatement(
    "INSERT INTO documents VALUES (?, ?)"
);
pstmt.setBlob(1, blob);
pstmt.setClob(2, clob);
pstmt.executeUpdate();
```
### 16.3.6 修改 `Blob`、`Clob` 和 `NClob` 对象

这些对象提供了修改其内容的方法。

### 16.3.7 释放 `Blob`、`Clob` 和 `NClob` 资源

```java
blob.free();
clob.free();
```
## 16.4 `SQLXML` 对象

`SQLXML` 接口提供了对 `XML` 数据的支持。

### 16.4.1 创建 `SQLXML` 对象

```java
SQLXML sqlxml = con.createSQLXML();
sqlxml.setString("<root><element>value</element></root>");
```
### 16.4.2 在 `ResultSet` 中检索 `SQLXML` 值

```java
SQLXML sqlxml = rs.getSQLXML("xml_column");
```
### 16.4.3 访问 `SQLXML` 对象数据

```java
String xmlString = sqlxml.getString();

// Or using StAX
XMLStreamReader reader = sqlxml.getSource(XMLStreamReader.class);
```
### 16.4.4 存储 `SQLXML` 对象

```java
pstmt.setSQLXML(1, sqlxml);
```
### 16.4.5 初始化 `SQLXML` 对象

使用 `getSource` 和 `setResult` 方法可以初始化 `SQLXML` 对象。

### 16.4.6 释放 `SQLXML` 资源

```java
sqlxml.free();
```
## 16.5 `Array` 对象

`Array` 接口提供了对 `SQL ARRAY` 类型的支持。

### 16.5.1 `Array` 实现

`JDBC` 驱动程序必须提供 `Array` 接口的实现。

### 16.5.2 创建 `Array` 对象

```java
Array array = con.createArrayOf("INTEGER", new Object[]{1, 2, 3});
```
### 16.5.3 检索 `Array` 对象

```java
Array array = rs.getArray("array_column");
```
### 16.5.4 存储 `Array` 对象

```java
pstmt.setArray(1, array);
```
### 16.5.5 更新 `Array` 对象

```java
rs.updateArray("array_column", array);
```
### 16.5.6 释放 `Array` 资源

```java
array.free();
```
## 16.6 `Ref` 对象

`Ref` 接口提供了对 `SQL REF` 类型的支持。

### 16.6.1 检索 `REF` 值

```java
Ref ref = rs.getRef("ref_column");
```
### 16.6.2 检索引用的值

```java
Object obj = ref.getObject();
```
### 16.6.3 存储 `Ref` 对象

```java
pstmt.setRef(1, ref);
```
### 16.6.4 存储引用的值

### 16.6.5 元数据

可以使用 `ResultSetMetaData` 获取 `Ref` 列的类型信息。

## 16.7 `Distinct` 类型

`Distinct` 类型是基于单个预定义类型的用户定义类型。

### 16.7.1 检索 `Distinct` 类型

`Distinct` 类型被检索为其基础类型。

### 16.7.2 存储 `Distinct` 类型

`Distinct` 类型作为其基础类型存储。

### 16.7.3 元数据

可以使用 `DatabaseMetaData` 获取 `Distinct` 类型的信息。

## 16.8 结构化类型

结构化类型是由一个或多个属性组成的用户定义类型。

### 16.8.1 创建结构化对象

```java
Struct struct = con.createStruct("ADDRESS",
    new Object[]{"123 Main St", "Springfield", "IL"});
```
### 16.8.2 检索结构化类型

```java
Struct struct = (Struct) rs.getObject("address_column");
Object[] attributes = struct.getAttributes();
```
### 16.8.3 存储结构化类型

```java
pstmt.setObject(1, struct);
```
### 16.8.4 元数据

可以使用 `DatabaseMetaData` 获取结构化类型的信息。

## 16.9 `DataLink`

`DATALINK` 类型表示对数据源外部数据的引用。

### 16.9.1 检索对外部数据的引用

```java
URL url = rs.getURL("url_column");
```
### 16.9.2 存储对外部数据的引用

```java
pstmt.setURL(1, new URL("http://example.com/data"));
```
### 16.9.3 元数据

可以使用 `ResultSetMetaData` 确定 `DATALINK` 列。

## 16.10 `RowId` 对象

`RowId` 接口提供了对 `SQL` `ROWID` 类型的支持。

### 16.10.1 `RowId` 有效性的生命周期

`RowId` 值的有效性取决于数据库实现。

### 16.10.2 检索 `RowId` 值

```java
RowId rowId = rs.getRowId("rowid_column");
```
### 16.10.3 使用 `RowId` 值

```java
pstmt.setRowId(1, rowId);
```
## 16.11 自定义类型映射

### 16.11.1 类型映射

可以为 `UDT` 定义自定义类型映射，将 `SQL` 类型映射到 `Java` 类。

### 16.11.2 类约定

映射的 `Java` 类必须实现 `SQLData` 接口。

### 16.11.3 `SQL` 数据流

#### 16.11.3.1 检索数据

使用 `SQLInput` 方法从流中读取数据。

#### 16.11.3.2 存储数据

使用 `SQLOutput` 方法将数据写入流。

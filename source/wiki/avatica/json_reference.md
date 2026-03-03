---
layout: wiki
wiki: avatica
order: 004
title: JSON 参考
date: 2025-01-30 14:45:00
banner: /assets/banner/banner_4.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/json_reference.html

由于 Avatica 使用 JSON 来序列化通过 HTTP 传输发送的消息，因此 RPC 层与客户端使用的语言无关。虽然 Avatica 服务器是用 Java 编写的，但这使得客户端可以使用任何语言与服务器交互，而不限于 Java。

下面记录了 JSON 请求和响应对象的规范。这些 JSON 对象的程序化绑定仅在 Java 中可用。对于 Java 之外的支持，请参阅 Protocol Buffer [绑定](../avatica_protobuf_reference.html)

## 索引

### 请求
<ul>
  <li><a href="#catalogsrequest">CatalogsRequest</a></li>
  <li><a href="#closeconnectionrequest">CloseConnectionRequest</a></li>
  <li><a href="#closestatementrequest">CloseStatementRequest</a></li>
  <li><a href="#columnsrequest">ColumnsRequest</a></li>
  <li><a href="#commitrequest">CommitRequest</a></li>
  <li><a href="#connectionsyncrequest">ConnectionSyncRequest</a></li>
  <li><a href="#createstatementrequest">CreateStatementRequest</a></li>
  <li><a href="#databasepropertyrequest">DatabasePropertyRequest</a></li>
  <li><a href="#executerequest">ExecuteRequest</a></li>
  <li><a href="#executebatchrequest">ExecuteBatchRequest</a></li>
  <li><a href="#fetchrequest">FetchRequest</a></li>
  <li><a href="#openconnectionrequest">OpenConnectionRequest</a></li>
  <li><a href="#prepareandexecutebatchrequest">PrepareAndExecuteBatchRequest</a></li>
  <li><a href="#prepareandexecuterequest">PrepareAndExecuteRequest</a></li>
  <li><a href="#preparerequest">PrepareRequest</a></li>
  <li><a href="#rollbackrequest">RollbackRequest</a></li>
  <li><a href="#schemasrequest">SchemasRequest</a></li>
  <li><a href="#syncresultsrequest">SyncResultsRequest</a></li>
  <li><a href="#tabletypesrequest">TableTypesRequest</a></li>
  <li><a href="#tablesrequest">TablesRequest</a></li>
  <li><a href="#typeinforequest">TypeInfoRequest</a></li>
</ul>

### 响应
<ul>
  <li><a href="#closeconnectionresponse">CloseConnectionResponse</a></li>
  <li><a href="#closestatementresponse">CloseStatementResponse</a></li>
  <li><a href="#commitresponse">CommitResponse</a></li>
  <li><a href="#connectionsyncresponse">ConnectionSyncResponse</a></li>
  <li><a href="#createstatementresponse">CreateStatementResponse</a></li>
  <li><a href="#databasepropertyresponse">DatabasePropertyResponse</a></li>
  <li><a href="#errorresponse">ErrorResponse</a></li>
  <li><a href="#executebatchresponse">ExecuteBatchResponse</a></li>
  <li><a href="#executeresponse">ExecuteResponse</a></li>
  <li><a href="#fetchresponse">FetchResponse</a></li>
  <li><a href="#openconnectionresponse">OpenConnectionResponse</a></li>
  <li><a href="#prepareresponse">PrepareResponse</a></li>
  <li><a href="#resultsetresponse">ResultSetResponse</a></li>
  <li><a href="#rollbackresponse">RollbackResponse</a></li>
  <li><a href="#syncresultsresponse">SyncResultsResponse</a></li>
</ul>

### 其他
<ul>
  <li><a href="#avaticaparameter">AvaticaParameter</a></li>
  <li><a href="#avaticaseverity">AvaticaSeverity</a></li>
  <li><a href="#avaticatype">AvaticaType</a></li>
  <li><a href="#columnmetadata">ColumnMetaData</a></li>
  <li><a href="#connectionproperties">ConnectionProperties</a></li>
  <li><a href="#cursorfactory">CursorFactory</a></li>
  <li><a href="#databaseproperty">DatabaseProperty</a></li>
  <li><a href="#frame">Frame</a></li>
  <li><a href="#querystate">QueryState</a></li>
  <li><a href="#rep">Rep</a></li>
  <li><a href="#rpcmetadata">RpcMetadata</a></li>
  <li><a href="#signature">Signature</a></li>
  <li><a href="#statetype">StateType</a></li>
  <li><a href="#statementhandle">StatementHandle</a></li>
  <li><a href="#statementtype">StatementType</a></li>
  <li><a href="#style">Style</a></li>
  <li><a href="#typedvalue">TypedValue</a></li>
</ul>

## 请求

作为 Avatica 请求接受的所有 JSON 对象的集合。所有请求都包含一个 `request` 属性，该属性唯一地标识具体的请求。

### CatalogsRequest

此请求用于获取数据库中可用的目录名称。

```json
{
  "request": "getCatalogs",
  "connectionId": "000000-0000-0000-00000000"
}
```

`connectionId`（必需字符串）要使用的连接的标识符。

### CloseConnectionRequest

此请求用于关闭 Avatica 服务器中由给定 ID 标识的连接对象。

```json
{
  "request": "closeConnection",
  "connectionId": "000000-0000-0000-00000000"
}
```

`connectionId`（必需字符串）要关闭的连接的标识符。

### CloseStatementRequest

此请求用于关闭 Avatica 服务器中由给定 ID 标识的语句对象。

```json
{
  "request": "closeStatement",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345
}
```

`connectionId`（必需字符串）语句所属的连接的标识符。

`statementId`（必需整数）要关闭的语句的标识符。

### ColumnsRequest

此请求用于根据一些可选的过滤条件获取数据库中的列。

```json
{
  "request": "getColumns",
  "connectionId": "000000-0000-0000-00000000",
  "catalog": "catalog",
  "schemaPattern": "schema_pattern.*",
  "tableNamePattern": "table_pattern.*",
  "columnNamePattern": "column_pattern.*"
}
```

`connectionId`（必需字符串）要在其上获取列的连接的标识符。

`catalog`（可选字符串）用于限制返回列的目录名称。

`schemaPattern`（可选字符串）针对模式以限制返回列的 Java 模式。

`tableNamePattern`（可选字符串）针对表名以限制返回列的 Java 模式。

`columnNamePattern`（可选字符串）针对列名以限制返回列的 Java 模式。

### CommitRequest

此请求用于在 Avatica 服务器中由给定 ID 标识的连接上发出 `commit` 提交。

```json
{
  "request": "commit",
  "connectionId": "000000-0000-0000-00000000"
}
```

`connectionId`（必需字符串）要在其上调用提交的连接的标识符。

### ConnectionSyncRequest

此请求用于确保客户端和服务器对数据库属性有一致的视图。

```json
{
  "request": "connectionSync",
  "connectionId": "000000-0000-0000-00000000",
  "connProps": ConnectionProperties
}
```

`connectionId`（必需字符串）要同步的连接的标识符。

`connProps`（可选嵌套对象）要在客户端和服务器之间同步的 <a href="#connectionproperties">ConnectionProperties</a> 对象。

### CreateStatementRequest

此请求用于在 Avatica 服务器中创建新语句。

```json
{
  "request": "createStatement",
  "connectionId": "000000-0000-0000-00000000"
}
```

`connectionId`（必需字符串）用于创建语句的连接的标识符。

### DatabasePropertyRequest

此请求用于获取所有<a href="#databaseproperty">数据库属性</a>。

```json
{
  "request": "databaseProperties",
  "connectionId": "000000-0000-0000-00000000"
}
```

`connectionId`（必需字符串）获取数据库属性时要使用的连接的标识符。

### ExecuteBatchRequest

此请求用于在 PreparedStatement 上执行批量更新。

```json
{
  "request": "executeBatch",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "parameterValues": [ [ TypedValue, TypedValue, ... ], [ TypedValue, TypedValue, ...], ... ]
}
```

`connectionId`（必需字符串）获取数据库属性时要使用的连接的标识符。

`statementId`（必需整数）使用上述连接创建的语句的标识符。

`parameterValues`（必需数组数组）<a href="#typedvalue">TypedValue</a> 的数组的数组。数组中的每个元素是对一行的更新，而外部数组表示整"批"更新。

### ExecuteRequest

此请求用于执行 PreparedStatement，可选择使用要绑定到语句中参数的值。

```json
{
  "request": "execute",
  "statementHandle": StatementHandle,
  "parameterValues": [TypedValue, TypedValue, ... ],
  "maxRowCount": 100
}
```

`statementHandle`（必需对象）一个 <a href="#statementhandle">StatementHandle</a> 对象。

`parameterValues`（可选嵌套对象数组）预处理语句中每个参数的 <a href="#typedvalue">TypedValue</a>。

`maxRowCount`（必需长整型）响应中返回的最大行数。

### FetchRequest

此请求用于从先前创建的语句中获取一批行。

```json
{
  "request": "fetch",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "offset": 0,
  "fetchMaxRowCount": 100
}
```

`connectionId`（必需字符串）要使用的连接的标识符。

`statementId`（必需整数）使用上述连接创建的语句的标识符。

`offset`（必需整数）要获取的结果集的位置偏移量。

`fetchMatchRowCount`（必需整数）对此请求的响应中返回的最大行数。

### OpenConnectionRequest

此请求用于在 Avatica 服务器中打开新连接。

```json
{
  "request": "openConnection",
  "connectionId": "000000-0000-0000-00000000",
  "info": {"key":"value", ...}
}
```

`connectionId`（必需字符串）要在服务器中打开的连接的标识符。

`info`（可选字符串到字符串映射）包含创建连接时要包含的属性的映射。

### PrepareAndExecuteBatchRequest

此请求用作创建语句并在该语句中执行一批 SQL 命令的简写。

```json
{
  "request": "prepareAndExecuteBatch",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "sqlCommands": [ "SQL Command", "SQL Command", ... ]
}
```

`connectionId`（必需字符串）要使用的连接的标识符。

`statementId`（必需整数）由上述连接创建的要使用的语句的标识符。

`sqlCommands`（必需字符串数组）SQL 命令数组。

### PrepareAndExecuteRequest

此请求用作创建语句并在单个调用中获取第一批结果而无需任何参数替换的简写。

```json
{
  "request": "prepareAndExecute",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "sql": "SELECT * FROM table",
  "maxRowCount": 100,
}
```

`connectionId`（必需字符串）要使用的连接的标识符。

`statementId`（必需整数）由上述连接创建的要使用的语句的标识符。

`sql`（必需字符串）SQL 语句。

`maxRowCount`（必需长整型）响应中返回的最大行数。

### PrepareRequest

此请求用于在 Avatica 服务器中使用给定查询创建新语句。

```json
{
  "request": "prepare",
  "connectionId": "000000-0000-0000-00000000",
  "sql": "SELECT * FROM table",
  "maxRowCount": 100,
}
```

`connectionId`（必需字符串）要使用的连接的标识符。

`sql`（必需字符串）SQL 语句。

`maxRowCount`（必需长整型）响应中返回的最大行数。

### SyncResultsRequest

此请求用于将 ResultSet 的迭代器重置为 Avatica 服务器中的特定偏移量。

```json
{
  "request": "syncResults",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "state": QueryState,
  "offset": 200
}
```

`connectionId`（必需字符串）要使用的连接的标识符。

`statementId`（必需整数）要使用的语句的标识符。

`state`（必需对象）<a href="#querystate">QueryState</a> 对象。

`offset`（必需长整型）要定位到的 ResultSet 中的偏移量。

### RollbackRequest

此请求用于在 Avatica 服务器中由给定 ID 标识的连接上发出 `rollback` 回滚。

```json
{
  "request": "rollback",
  "connectionId": "000000-0000-0000-00000000"
}
```

`connectionId`（必需字符串）要在其上调用回滚的连接的标识符。

### SchemasRequest

此请求用于获取数据库中与提供的条件匹配的模式。

```json
{
  "request": "getSchemas",
  "connectionId": "000000-0000-0000-00000000",
  "catalog": "name",
  "schemaPattern": "pattern.*"
}
```

`connection_id` 要从中获取模式的连接的标识符。

`catalog`（可选字符串）要从中获取模式的目录的名称。

`schemaPattern`（可选字符串）要获取的模式的 Java 模式。

### TableTypesRequest

此请求用于获取此数据库中可用的表类型。

```json
{
  "request": "getTableTypes",
  "connectionId": "000000-0000-0000-00000000"
}
```

`connectionId` 要从中获取表类型的连接的标识符。

### TablesRequest

此请求用于获取此数据库中按提供的条件过滤的可用表。

```json
{
  "request": "getTables",
  "connectionId": "000000-0000-0000-00000000",
  "catalog": "catalog_name",
  "schemaPattern": "schema_pattern.*",
  "tableNamePattern": "table_name_pattern.*",
  "typeList": [ "TABLE", "VIEW", ... ]
}
```

`catalog`（可选字符串）用于限制获取的表的目录名称。

`connectionId` 要从中获取表的连接的标识符。

`schemaPattern`（可选字符串）表示要在获取的表中包含的模式的 Java 模式。

`tableNamePattern`（可选字符串）表示要在获取的表中包含的表名的 Java 模式。

`typeList`（可选字符串数组）用于限制获取的表的表类型列表。

### TypeInfoRequest

此请求用于获取此数据库中可用的类型。

```json
{
  "request": "getTypeInfo",
  "connectionId": "000000-0000-0000-00000000"
}
```

`connectionId` 要从中获取类型的连接的标识符。

## 响应

从 Avatica 作为响应返回的所有 JSON 对象的集合。所有响应都包含一个 `response` 属性，该属性唯一地标识具体的响应。

### CloseConnectionResponse

对 <a href="#closeconnectionrequest">CloseConnectionRequest</a> 的响应。

```json
{
  "response": "closeConnection",
  "rpcMetadata": RpcMetadata
}
```

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### CloseStatementResponse

对 <a href="#closestatementrequest">CloseStatementRequest</a> 的响应。

```json
{
  "response": "closeStatement",
  "rpcMetadata": RpcMetadata
}
```

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### CommitResponse

对 <a href="#commitrequest">CommitRequest</a> 的响应。

```json
{
  "response": "commit"
}
```

此响应没有额外的属性。

### ConnectionSyncResponse

对 <a href="#connectionsyncrequest">ConnectionSyncRequest</a> 的响应。响应中包含的属性是 Avatica 服务器中连接的属性。

```json
{
  "response": "connectionSync",
  "connProps": ConnectionProperties,
  "rpcMetadata": RpcMetadata
}
```

`connProps` 已同步的 <a href="#connectionproperties">ConnectionProperties</a>。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### CreateStatementResponse

对 <a href="#createstatementrequest">CreateStatementRequest</a> 的响应。创建的语句的 ID 包含在响应中。客户端将在后续调用中使用此 `statementId`。

```json
{
  "response": "createStatement",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "rpcMetadata": RpcMetadata
}
```

`connectionId` 用于创建语句的连接的标识符。

`statementId` 创建的语句的标识符。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### DatabasePropertyResponse

对 <a href="#databasepropertyrequest">DatabasePropertyRequest</a> 的响应。有关可用属性键的信息，请参阅 <a hred="#databaseproperty">DatabaseProperty</a>。

```json
{
  "response": "databaseProperties",
  "map": { DatabaseProperty: Object, DatabaseProperty: Object, ... },
  "rpcMetadata": RpcMetadata
}
```

`map` <a href="#databaseproperty">DatabaseProperty</a> 到该属性值的映射。该值可能是某种基本类型或基本类型的数组。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### ErrorResponse

执行请求时捕获错误的响应。任何请求都可能返回此响应。

```json
{
  "response": "error",
  "exceptions": [ "stacktrace", "stacktrace", ... ],
  "errorMessage": "The error message",
  "errorCode": 42,
  "sqlState": "ABC12",
  "severity": AvaticaSeverity,
  "rpcMetadata": RpcMetadata
}
```

`exceptions` 字符串化的 Java StackTrace 列表。

`errorMessage` 人类可读的错误消息。

`errorCode` 此错误的数字代码。

`sqlState` 此错误的五个字符的字母数字代码。

`severity` 一个 <a href="#avaticaseverity">AvaticaSeverity</a> 对象，表示错误的严重程度。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### ExecuteBatchResponse

对 <a href="#executebatchrequest">ExecuteBatchRequest</a> 和 <a href="#prepareandexecutebatchrequest">PrepareAndExecuteRequest</a> 的响应，封装了一批更新的更新计数。

```json
{
  "response": "executeBatch",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "updateCounts": [ 1, 1, 0, 1, ... ],
  "missingStatement": false,
  "rpcMetadata": RpcMetadata
}
```

`connectionId` 用于创建语句的连接的标识符。

`statementId` 创建的语句的标识符。

`updateCounts` 与执行的批处理中包含的每个更新对应的整数数组。

`missingStatement` 如果操作因语句未缓存在服务器中而失败，则为 true，否则为 false。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### ExecuteResponse

对 <a href="#executerequest">ExecuteRequest</a> 的响应，包含元数据查询的结果。

```json
{
  "response": "executeResults",
  "resultSets": [ ResultSetResponse, ResultSetResponse, ... ],
  "missingStatement": false,
  "rpcMetadata": RpcMetadata
}
```

`resultSets` <a href="#resultsetresponse">ResultSetResponse</a> 的数组。

`missingStatement` 一个布尔值，表示请求是否因缺少语句而失败。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### FetchResponse

对 <a href="#fetchrequest">FetchRequest</a> 的响应，包含查询的请求。

```json
{
  "response": "fetch",
  "frame": Frame,
  "missingStatement": false,
  "missingResults": false,
  "rpcMetadata": RpcMetadata
}
```

`frame` 包含获取结果的 <a href="#frame">Frame</a>。

`missingStatement` 一个布尔值，表示请求是否因缺少语句而失败。

`missingResults` 一个布尔值，表示请求是否因缺少 ResultSet 而失败。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### OpenConnectionResponse

对 <a href="#openconnectionrequest">OpenConnectionRequest</a> 的响应。客户端应在后续调用中使用的连接的 ID 由客户端在请求中提供。

```json
{
  "response": "openConnection",
  "rpcMetadata": RpcMetadata
}
```

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### PrepareResponse

对 <a href="#preparerequest">PrepareRequest</a> 的响应。此响应包含一个 <a href="#statementhandle">StatementHandle</a>，客户端必须使用它来从语句中获取结果。

```json
{
  "response": "prepare",
  "statement": StatementHandle,
  "rpcMetadata": RpcMetadata
}
```

`statement` 一个 <a href="#statementhandle">StatementHandle</a> 对象。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### ResultSetResponse

包含查询结果和类型详细信息的响应。

```json
{
  "response": "resultSet",
  "connectionId": "000000-0000-0000-00000000",
  "statementId": 12345,
  "ownStatement": true,
  "signature": Signature,
  "firstFrame": Frame,
  "updateCount": 10,
  "rpcMetadata": RpcMetadata
}
```

`connectionId` 用于生成此响应的连接的标识符。

`statementId` 用于生成此响应的语句的标识符。

`ownStatement` 结果集是否拥有自己的专用语句。如果为 true，则当结果集关闭时，服务器必须自动关闭语句。例如，这用于 JDBC 元数据结果集。

`signature` 一个非可选的嵌套对象 <a href="#signature">Signature</a>。

`firstFrame` 一个可选的嵌套对象 <a href="#frame">Frame</a>。

`updateCount` 对于正常结果集，此数字始终为 `-1`。任何其他值表示仅包含此计数而不包含其他数据的"虚拟"结果集。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### RollbackResponse

对 <a href="#rollbackrequest">RollBackRequest</a> 的响应。

```json
{
  "response": "rollback"
}
```

此响应没有额外的属性。

### SyncResultsResponse

对 <a href="#syncresultsrequest">SyncResultsRequest</a> 的响应。当 `moreResults` 为 true 时，应该发出 <a href="#fetchrequest">FetchRequest</a> 以获取下一批记录。当 `missingStatement` 为 true 时，必须使用 <a href="#preparerequest">PrepareRequest</a> 或适当的 DDL 请求（例如 <a href="#catalogsrequest">CatalogsRequest</a> 或 <a href="#schemasrequest">SchemasRequest</a>）重新创建语句。

```json
{
  "response": "syncResults",
  "moreResults": true,
  "missingStatement": false,
  "rpcMetadata": RpcMetadata
}
```

`moreResults` 一个布尔值，表示根据请求"同步"的 ResultSet 是否存在结果。

`missingStatement` 一个布尔值，表示 ResultSet 的语句是否仍然存在。

`rpcMetadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

## 其他

### AvaticaParameter

此对象描述结果中列的"简单"或标量 JDBC 类型表示。这不包括复杂类型，如数组。

```json
{
  "signed": true,
  "precision": 10,
  "scale": 2,
  "parameterType": 8,
  "typeName": "integer",
  "className": "java.lang.Integer",
  "name": "number"
}
```

`signed` 一个布尔值，表示列是否为有符号数值。

`precision` 此列支持的最大数值精度。

`scale` 此列支持的最大数值刻度。

`parameterType` 对应于 JDBC Types 类的整数，表示列的类型。

`typeName` 此列的 JDBC 类型名称。

`className` 支持此列的 JDBC 类型的 Java 类。

`name` 列的名称。

### AvaticaSeverity

此枚举描述 Avatica 服务器中错误的各种关注级别。

取值之一：

* `UNKNOWN`
* `FATAL`
* `ERROR`
* `WARNING`

### AvaticaType

此对象描述列的简单或复杂类型。复杂类型将在 `component` 或 `columns` 属性中包含额外信息，描述复杂父类型的嵌套类型。

```json
{
  "type": "scalar",
  "id": "identifier",
  "name": "column",
  "rep": Rep,
  "columns": [ ColumnMetaData, ColumnMetaData, ... ],
  "component": AvaticaType
}
```

`type` 取值之一：`scalar`、`array`、`struct`。

`id` 对应于 JDBC Types 类中对象类型的数值。

`name` JDBC 类型的可读名称。

`rep` 一个嵌套的 <a href="#rep">Rep</a> 对象，Avatica 用于保存额外的类型信息。

`columns` 对于 `STRUCT` 类型，该 `STRUCT` 中包含的列的列表。

`component` 对于 `ARRAY` 类型，该 `ARRAY` 中包含的元素的类型。

### ColumnMetaData

此对象表示列的 JDBC ResultSetMetaData。

```json
{
  "ordinal": 0,
  "autoIncrement": true,
  "caseSensitive": true,
  "searchable": false,
  "currency": false,
  "nullable": 0,
  "signed": true,
  "displaySize": 20,
  "label": "Description",
  "columnName": "col1",
  "schemaName": "schema",
  "precision": 10,
  "scale": 2,
  "tableName": "table",
  "catalogName": "catalog",
  "type": AvaticaType,
  "readOnly": false,
  "writable": true,
  "definitelyWritable": true,
  "columnClassName": "java.lang.String"
}
```

`ordinal` 位置偏移编号。

`autoIncrement` 一个布尔值，表示列是否自动递增。

`caseSensitive` 一个布尔值，表示列是否区分大小写。

`searchable` 一个布尔值，表示此列是否支持所有 WHERE 搜索子句。

`currency` 一个布尔值，表示此列是否表示货币。

`nullable` 一个数字，表示此列是否支持空值。

* 0 = 不允许空值
* 1 = 允许空值
* 2 = 不知道是否允许空值

`signed` 一个布尔值，表示列是否为有符号数值。

`displaySize` 列的字符宽度。

`label` 此列的描述。

`columnName` 列的名称。

`schemaName` 此列所属的模式。

`precision` 此列支持的最大数值精度。

`scale` 此列支持的最大数值刻度。

`tableName` 此列所属的表的名称。

`catalogName` 此列所属的目录的名称。

`type` 一个嵌套的 <a href="#avaticatype">AvaticaType</a>，表示列的类型。

`readOnly` 一个布尔值，表示列是否为只读。

`writable` 一个布尔值，表示列是否可能被更新。

`definitelyWritable` 一个布尔值，表示列是否肯定可以被更新。

`columnClassName` 支持列类型的 Java 类的名称。

### ConnectionProperties

此对象表示给定 JDBC 连接的属性。

```json
{
  "connProps": "connPropsImpl",
  "autoCommit": true,
  "readOnly": true,
  "transactionIsolation": 0,
  "catalog": "catalog",
  "schema": "schema"
}
```

`autoCommit`（可选布尔值）一个布尔值，表示事务是否启用了 autoCommit 自动提交。

`readOnly`（可选布尔值）一个布尔值，表示 JDBC 连接是否为只读。

`transactionIsolation`（可选整数）一个整数，根据 JDBC 规范表示事务隔离级别。此值类似于 `java.sql.Connection` 中定义的值。

* 0 = 不支持事务
* 1 = 可能发生脏读、不可重复读和幻读。
* 2 = 防止脏读，但可能发生不可重复读和幻读。
* 4 = 防止脏读和不可重复读，但可能发生幻读。
* 8 = 防止脏读、不可重复读和幻读。

`catalog`（可选字符串）获取连接属性时要包含的目录的名称。

`schema`（可选字符串）获取连接属性时要包含的模式的名称。

`isDirty`（内部布尔值）仅用于内部目的的布尔值（Avatica 协议不需要）。此字段将在未来的版本中从协议中移除。

### CursorFactory

此对象表示将无类型对象转换为某些结果的必要类型所需的信息。

```json
{
  "style": Style,
  "clazz": "java.lang.String",
  "fieldNames": [ "column1", "column2", ... ]
}
```

`style` 一个字符串，表示包含对象的 <a href="#style">Style</a> 样式。

### DatabaseProperty

此对象表示通过 Avatica 服务器的连接公开的数据库属性。

取值之一：

* `GET_STRING_FUNCTIONS`
* `GET_NUMERIC_FUNCTIONS`
* `GET_SYSTEM_FUNCTIONS`
* `GET_TIME_DATE_FUNCTIONS`
* `GET_S_Q_L_KEYWORDS`
* `GET_DEFAULT_TRANSACTION_ISOLATION`

### Frame

此对象表示一批结果，跟踪结果中的偏移量以及 Avatica 服务器中是否还有更多结果需要获取。

```json
{
  "offset": 100,
  "done": true,
  "rows": [ [ val1, val2, ... ], ... ]
}
```

`offset` 这些 `rows` 在包含结果集中的起始位置。

`done` 一个布尔值，表示此结果集是否还有更多结果。

`rows` 对应于结果集的行和列的数组的数组。

### QueryState

此对象表示在 Avatica 服务器中创建 ResultSet 的方式。ResultSet 可以由用户提供的 SQL 或带有该操作参数的 DatabaseMetaData 操作创建。

```json
{
  "type": StateType,
  "sql": "SELECT * FROM table",
  "metaDataOperation": MetaDataOperation,
  "operationArgs": ["arg0", "arg1", ... ]
}
```

`type` 一个 <a href="#statetype">StateType</a> 对象，表示支持此查询的 ResultSet 的操作类型。

`sql` 创建此查询的 ResultSet 的 SQL 语句。如果 `type` 为 `SQL`，则必需。

`metaDataOperation` 创建此查询的 ResultSet 的 DML 操作。如果 `type` 为 `METADATA`，则必需。

`operationArgs` 调用的 DML 操作的参数。如果 `type` 为 `METADATA`，则必需。

### Rep

此枚举表示某个值的具体 Java 类型。

取值之一：

* `PRIMITIVE_BOOLEAN`
* `PRIMITIVE_BYTE`
* `PRIMITIVE_CHAR`
* `PRIMITIVE_SHORT`
* `PRIMITIVE_INT`
* `PRIMITIVE_LONG`
* `PRIMITIVE_FLOAT`
* `PRIMITIVE_DOUBLE`
* `BOOLEAN`
* `BYTE`
* `CHARACTER`
* `SHORT`
* `INTEGER`
* `LONG`
* `FLOAT`
* `DOUBLE`
* `JAVA_SQL_TIME`
* `JAVA_SQL_TIMESTAMP`
* `JAVA_SQL_DATE`
* `JAVA_UTIL_DATE`
* `BYTE_STRING`
* `STRING`
* `NUMBER`
* `OBJECT`

### RpcMetadata

此对象包含 Avatica 服务器返回的各种每次调用/上下文元数据。

```json
{
  "serverAddress": "localhost:8765"
}
```

`serverAddress` 创建此对象的服务器的 `host:port`。

### Signature

此对象表示在 Avatica 服务器中准备语句的结果。

```json
{
  "columns": [ ColumnMetaData, ColumnMetaData, ... ],
  "sql": "SELECT * FROM table",
  "parameters": [ AvaticaParameter, AvaticaParameter, ... ],
  "cursorFactory": CursorFactory,
  "statementType": StatementType
}
```

`columns` 表示结果集模式的 <a href="#columnmetadata">ColumnMetaData</a> 对象的数组。

`sql` 执行的 SQL。

`parameters` 表示类型特定详细信息的 <a href="#avaticaparameter">AvaticaParameter</a> 对象的数组。

`cursorFactory` 一个 <a href="#cursorfactory">CursorFactory</a> 对象，表示帧的 Java 表示。

`statementType` 一个 <a href="#statementtype">StatementType</a> 对象，表示语句的类型。

### StateType

此枚举表示是使用用户提供的 SQL 还是 DatabaseMetaData 操作来创建某个 ResultSet。

取值之一：

* `SQL`
* `METADATA`

### StatementHandle

此对象封装了在 Avatica 服务器中创建的语句的所有信息。

```json
{
  "connectionId": "000000-0000-0000-00000000",
  "id": 12345,
  "signature": Signature
}
```

`connectionId` 此语句所属的连接的标识符。

`id` 语句的标识符。

`signature` 语句的 <a href="#signature">Signature</a> 对象。

### StatementType

此枚举表示语句的类型。

取值之一：

* `SELECT`
* `INSERT`
* `UPDATE`
* `DELETE`
* `UPSERT`
* `MERGE`
* `OTHER_DML`
* `CREATE`
* `DROP`
* `ALTER`
* `OTHER_DDL`
* `CALL`

### Style

此枚举表示值的通用类型"类"。

取值之一：

* `OBJECT`
* `RECORD`
* `RECORD_PROJECTION`
* `ARRAY`
* `LIST`
* `MAP`

### TypedValue

此对象封装了行中列的类型和值。

```json
{
  "type": "type_name",
  "value": object
}
```

`type` 引用存储在 `value` 中的对象类型的名称。

`value` JDBC 类型的 JSON 表示。

下表记录了每个 <a href="#rep">Rep</a> 值如何序列化为 JSON 值。有关 JSON 中有效属性的更多信息，请参阅 [JSON 文档](http://json-spec.readthedocs.org/en/latest/reference.html)。

| <a href="#rep">Rep</a> 值 | 序列化 | 描述 |
| PRIMITIVE_BOOLEAN | boolean ||
| BOOLEAN | boolean ||
| PRIMITIVE_BYTE | number | `byte` 的数值。 |
| BYTE | number ||
| PRIMITIVE_CHAR | string ||
| CHARACTER | string ||
| PRIMITIVE_SHORT | number ||
| SHORT | number ||
| PRIMITIVE_INT | number ||
| INTEGER | number ||
| PRIMITIVE_LONG | number ||
| LONG | number ||
| PRIMITIVE_FLOAT | number ||
| FLOAT | number ||
| PRIMITIVE_DOUBLE | number ||
| DOUBLE | number ||
| BIG_INTEGER | number | 由 Jackson 隐式处理。 |
| BIG_DECIMAL | number | 由 Jackson 隐式处理。 |
| JAVA_SQL_TIME | number | 作为整数，自午夜以来的毫秒数。 |
| JAVA_SQL_DATE | number | 作为整数，自纪元以来的天数。 |
| JAVA_SQL_TIMESTAMP | number | 作为长整型，自纪元以来的毫秒数。 |
| JAVA_UTIL_DATE | number | 作为长整型，自纪元以来的毫秒数。 |
| BYTE_STRING | string | Base64 编码的字符串。 |
| STRING | string | |
| NUMBER | number | 一般数字，未知具体类型。 |
| OBJECT | null | 由 Jackson 隐式转换。 |
| NULL | null | 由 Jackson 隐式转换。 |
| ARRAY | N/A | 由 Jackson 隐式处理。 |
| STRUCT | N/A | 由 Jackson 隐式处理。 |
| MULTISET | N/A | 由 Jackson 隐式处理。 |

{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

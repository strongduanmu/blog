---
layout: wiki
wiki: avatica
order: 005
title: Protocol Buffers 参考
date: 2025-01-30 15:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/avatica/docs/protobuf_reference.html

自 1.5.0 版本起，Avatica 还支持 [Protocol Buffers](https://developers.google.com/protocol-buffers/) 作为消息格式。Protocol Buffer（简称 protobuf）的实现与 JSON 实现极其相似。一些差异包括 protobuf 扩展的类型支持（如原生字节数组）以及无法区分字段的默认值和字段值的缺失。

与 JSON 的其他显著结构差异包括添加了 `WireMessage` 消息，用于标识服务器返回的包装消息的类型（类似于 JSON 消息上的 `request` 或 `response` 属性），以及将包含 `Object` 值的 `TypedValue` 更改为可选强类型值的集合（因为 protobuf 原生不支持在运行时解包的 `Object` 类型）。

除非使用 `required` 修饰符另有说明，否则所有协议缓冲区消息中的所有字段默认都是 `optional` 可选的。

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
  <li><a href="#executebatchrequest">ExecuteBatchRequest</a></li>
  <li><a href="#executerequest">ExecuteRequest</a></li>
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
  <li><a href="#columnvalue">ColumnValue</a></li>
  <li><a href="#connectionproperties">ConnectionProperties</a></li>
  <li><a href="#cursorfactory">CursorFactory</a></li>
  <li><a href="#databaseproperty">DatabaseProperty</a></li>
  <li><a href="#frame">Frame</a></li>
  <li><a href="#querystate">QueryState</a></li>
  <li><a href="#rep">Rep</a></li>
  <li><a href="#row">Row</a></li>
  <li><a href="#rpcmetadata">RpcMetadata</a></li>
  <li><a href="#signature">Signature</a></li>
  <li><a href="#statetype">StateType</a></li>
  <li><a href="#statementhandle">StatementHandle</a></li>
  <li><a href="#statementtype">StatementType</a></li>
  <li><a href="#style">Style</a></li>
  <li><a href="#typedvalue">TypedValue</a></li>
  <li><a href="#updatebatch">UpdateBatch</a></li>
  <li><a href="#wiremessage">WireMessage</a></li>
</ul>

## 请求

作为 Avatica 请求接受的所有 protobuf 对象的集合。所有请求对象在发送到 Avatica 之前都应包装在 `WireMessage` 中。

### CatalogsRequest

此请求用于获取数据库中可用的目录名称。

```protobuf
message CatalogsRequest {
  string connection_id = 1;
}
```

`connection_id` 要使用的连接的标识符。

### CloseConnectionRequest

此请求用于关闭 Avatica 服务器中由给定 ID 标识的连接对象。

```protobuf
message CloseConnectionRequest {
  string connection_id = 1;
}
```

`connection_id` 要关闭的连接的标识符。

### CloseStatementRequest

此请求用于关闭 Avatica 服务器中由给定 ID 标识的语句对象。

```protobuf
message CloseStatementRequest {
  string connection_id = 1;
  uint32 statement_id = 2;
}
```

`connection_id` 语句所属的连接的标识符。

`statement_id` 要关闭的语句的标识符。

### ColumnsRequest

此请求用于根据一些可选的过滤条件获取数据库中的列。

```protobuf
message ColumnsRequest {
  string catalog = 1;
  string schema_pattern = 2;
  string table_name_pattern = 3;
  string column_name_pattern = 4;
  string connection_id = 5;
  bool   has_catalog = 6;
  bool   has_schema_pattern = 7;
  bool   has_table_name_pattern = 8;
  bool   has_column_name_pattern = 9;
}
```

`catalog` 用于限制返回列的目录名称。

`schema_pattern` 针对模式以限制返回列的 Java 模式。

`table_name_pattern` 针对表名以限制返回列的 Java 模式。

`column_name_pattern` 针对列名以限制返回列的 Java 模式。

`connection_id` 用于获取列的连接的标识符。

`has_catalog` 表示是否设置了 `catalog` 的布尔值。

`has_schema_pattern` 表示是否设置了 `schema_pattern` 的布尔值。

`has_table_name_pattern` 表示是否设置了 `table_name_pattern` 的布尔值。

`has_column_name_pattern` 表示是否设置了 `column_name_pattern` 的布尔值。

### CommitRequest

此请求用于在 Avatica 服务器中由给定 ID 标识的连接上发出 `commit` 提交。

```protobuf
message CommitRequest {
  string connection_id = 1;
}
```

`connection_id` 要在其上调用提交的连接的标识符。

### ConnectionSyncRequest

此请求用于确保客户端和服务器对数据库属性有一致的视图。

```protobuf
message ConnectionSyncRequest {
  string connection_id = 1;
  ConnectionProperties conn_props = 2;
}
```

`connection_id` 要同步的连接的标识符。

`conn_props` 要在客户端和服务器之间同步的 <a href="#connectionproperties">ConnectionProperties</a> 对象。

### CreateStatementRequest

此请求用于在 Avatica 服务器中创建新语句。

```protobuf
message CreateStatementRequest {
  string connection_id = 1;
}
```

`connection_id` 用于创建语句的连接的标识符。

### DatabasePropertyRequest

此请求用于获取所有<a href="#databaseproperty">数据库属性</a>。

```protobuf
message DatabasePropertyRequest {
  string connection_id = 1;
}
```

`connection_id` 获取数据库属性时要使用的连接的标识符。

### ExecuteBatchRequest

此请求用于对 PreparedStatement 执行一批更新。

```protobuf
message ExecuteBatchRequest {
  string connection_id = 1;
  uint32 statement_id = 2;
  repeated UpdateBatch updates = 3;
}
```

`connection_id` 引用连接的字符串。

`statement_id` 引用语句的整数。

`updates` <a href="#updatebatch">UpdateBatch</a> 的列表；更新批次。

### ExecuteRequest

此请求用于执行 PreparedStatement，可选择使用要绑定到语句中参数的值。

```protobuf
message ExecuteRequest {
  StatementHandle statementHandle = 1;
  repeated TypedValue parameter_values = 2;
  uint64 deprecated_first_frame_max_size = 3;
  bool has_parameter_values = 4;
  int32 first_frame_max_size = 5;
}
```

`statementHandle` 一个 <a href="#statementhandle">StatementHandle</a> 对象。

`parameter_values` 预处理语句中每个参数的 <a href="#typedvalue">TypedValue</a>。

`deprecated_first_frame_max_size` *已弃用*，改用 `first_frame_max_size`。以前是响应中返回的最大行数。

`has_parameter_values` 表示用户是否为 `parameter_values` 字段设置了值的布尔值。

`first_frame_max_size` 第一个 `Frame` 中返回的最大行数。

### FetchRequest

此请求用于从先前创建的语句中获取一批行。

```protobuf
message FetchRequest {
  string connection_id = 1;
  uint32 statement_id = 2;
  uint64 offset = 3;
  uint32 fetch_max_row_count = 4; // Deprecated!
  int32 frame_max_size = 5;
}
```

`connection_id` 要使用的连接的标识符。

`statement_id` 使用上述连接创建的语句的标识符。

`offset` 要获取的结果集的位置偏移量。

`fetch_match_row_count` 对此请求的响应中返回的最大行数。负数表示无限制。*已弃用*，使用 `frame_max_size`。

`frame_max_size` 响应中返回的最大行数。负数表示无限制。

### OpenConnectionRequest

此请求用于在 Avatica 服务器中打开新连接。

```protobuf
message OpenConnectionRequest {
  string connection_id = 1;
  map<string, string> info = 2;
}
```

`connection_id` 要在服务器中打开的连接的标识符。

`info` 包含创建连接时要包含的属性的映射。

### PrepareAndExecuteBatchRequest

此请求用作创建语句并对该语句执行一批更新的简写。

```protobuf
message PrepareAndExecuteBatchRequest {
  string connection_id = 1;
  uint32 statement_id = 2;
  repeated string sql_commands = 3;
}
```

`connection_id` 要使用的连接的标识符。

`statement_id` 由上述连接创建的要使用的语句的标识符。

`sql_commands` 要执行的 SQL 命令列表；一个批次。

### PrepareAndExecuteRequest

此请求用作创建语句并在单个调用中获取第一批结果而无需任何参数替换的简写。

```protobuf
message PrepareAndExecuteRequest {
  string connection_id = 1;
  uint32 statement_id = 4;
  string sql = 2;
  uint64 max_row_count = 3; // Deprecated!
  int64 max_rows_total = 5;
  int32 first_frame_max_size = 6;
}
```

`connection_id` 要使用的连接的标识符。

`statement_id` 由上述连接创建的要使用的语句的标识符。

`sql` SQL 语句。

`max_row_count` 响应中返回的最大行数。*已弃用*，使用 `max_rows_total`。

`max_rows_total` 此查询应返回的最大行数（所有 `Frame` 中）。

`first_frame_max_size` `ExecuteResponse` 中的第一个 `Frame` 中应包含的最大行数。

### PrepareRequest

此请求用于在 Avatica 服务器中使用给定查询创建新语句。

```protobuf
message PrepareRequest {
  string connection_id = 1;
  string sql = 2;
  uint64 max_row_count = 3; // Deprecated!
  int64 max_rows_total = 4;
}
```

`connection_id` 要使用的连接的标识符。

`sql` SQL 语句。

`max_row_count` 响应中返回的最大行数。*已弃用*，改用 `max_rows_total`。

`max_rows_total` 查询总共返回的最大行数。

### SyncResultsRequest

此请求用于将 ResultSet 的迭代器重置为 Avatica 服务器中的特定偏移量。

```protobuf
message SyncResultsRequest {
  string connection_id = 1;
  uint32 statement_id = 2;
  QueryState state = 3;
  uint64 offset = 4;
}
```

`connection_id` 要使用的连接的标识符。

`statement_id` 要使用的语句的标识符。

`state` <a href="#querystate">QueryState</a> 对象。

`offset` 要定位到的 ResultSet 中的偏移量。

### RollbackRequest

此请求用于在 Avatica 服务器中由给定 ID 标识的连接上发出 `rollback` 回滚。

```protobuf
message RollbackRequest {
  string connection_id = 1;
}
```

`connection_id` 要在其上调用回滚的连接的标识符。

### SchemasRequest

此请求用于获取数据库中与提供的条件匹配的模式。

```protobuf
message SchemasRequest {
  string catalog = 1;
  string schema_pattern = 2;
  string connection_id = 3;
  bool   has_catalog = 4;
  bool   has_schema_pattern = 5;
}
```

`catalog` 要从中获取模式的目录的名称。

`schema_pattern` 要获取的模式的 Java 模式。

`connection_id` 要从中获取模式的连接的标识符。

`has_catalog` 表示是否设置了 `catalog` 的布尔值。

`has_schema_pattern` 表示是否设置了 `schema_pattern` 的布尔值。

### TableTypesRequest

此请求用于获取此数据库中可用的表类型。

```protobuf
message TableTypesRequest {
  string connection_id = 1;
}
```

`connection_id` 要从中获取表类型的连接的标识符。

### TablesRequest

此请求用于获取此数据库中按提供的条件过滤的可用表。

```protobuf
message TablesRequest {
  string catalog = 1;
  string schema_pattern = 2;
  string table_name_pattern = 3;
  repeated string type_list = 4;
  bool has_type_list = 6;
  string connection_id = 7;
  bool   has_catalog = 8;
  bool   has_schema_pattern = 9;
  bool   has_table_name_pattern = 10;
}
```

`catalog` 用于限制获取的表的目录名称。

`schema_pattern` 表示要在获取的表中包含的模式的 Java 模式。

`table_name_pattern` 表示要在获取的表中包含的表名的 Java 模式。

`type_list` 用于限制获取的表的表类型列表。

`has_type_list` 表示是否提供了字段 `type_list` 的布尔值。

`connection_id` 要从中获取表的连接的标识符。

`has_catalog` 表示是否设置了 `catalog` 的布尔值。

`has_schema_pattern` 表示是否设置了 `schema_pattern` 的布尔值。

`has_table_name_pattern` 表示是否设置了 `table_name_pattern` 的布尔值。

### TypeInfoRequest

此请求用于获取此数据库中可用的类型。

```protobuf
message TypeInfoRequest {
  string connection_id = 1;
}
```

`connection_id` 要从中获取类型的连接的标识符。

## 响应

作为 Avatica 请求接受的所有 protobuf 对象的集合。所有响应对象在从 Avatica 返回之前都将包装在 `WireMessage` 中。

### CloseConnectionResponse

对 <a href="#closeconnectionrequest">CloseConnectionRequest</a> 的响应。

```protobuf
message CloseConnectionResponse {
  RpcMetadata metadata = 1;
}
```

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### CloseStatementResponse

对 <a href="#closestatementrequest">CloseStatementRequest</a> 的响应。

```protobuf
message CloseStatementResponse {
  RpcMetadata metadata = 1;
}
```

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### CommitResponse

对 <a href="#commitrequest">CommitRequest</a> 的响应。

```protobuf
message CommitResponse {

}
```

此响应没有属性。

### ConnectionSyncResponse

对 <a href="#connectionsyncrequest">ConnectionSyncRequest</a> 的响应。响应中包含的属性是 Avatica 服务器中连接的属性。

```protobuf
message ConnectionSyncResponse {
  ConnectionProperties conn_props = 1;
  RpcMetadata metadata = 2;
}
```

`conn_props` 已同步的 <a href="#connectionproperties">ConnectionProperties</a>。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### CreateStatementResponse

对 <a href="#createstatementrequest">CreateStatementRequest</a> 的响应。创建的语句的 ID 包含在响应中。客户端将在后续调用中使用此 `statement_id`。

```protobuf
message CreateStatementResponse {
  string connection_id = 1;
  uint32 statement_id = 2;
  RpcMetadata metadata = 3;
}
```

`connection_id` 用于创建语句的连接的标识符。

`statement_id` 创建的语句的标识符。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### DatabasePropertyResponse

对 <a href="#databasepropertyrequest">DatabasePropertyRequest</a> 的响应。有关可用属性键的信息，请参阅 <a hred="#databaseproperty">DatabaseProperty</a>。

```protobuf
message DatabasePropertyResponse {
  repeated DatabasePropertyElement props = 1;
  RpcMetadata metadata = 2;
}
```

`props` <a href="#databaseproperty">DatabaseProperty</a> 的集合。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### ErrorResponse

执行请求时捕获错误的响应。任何请求都可能返回此响应。

```protobuf
message ErrorResponse {
  repeated string exceptions = 1;
  bool has_exceptions = 7;
  string error_message = 2;
  Severity severity = 3;
  uint32 error_code = 4;
  string sql_state = 5;
  RpcMetadata metadata = 6;
}
```

`exceptions` 字符串化的 Java StackTrace 列表。

`has_exceptions` 表示是否存在 `exceptions` 的布尔值。

`error_message` 人类可读的错误消息。

`error_code` 此错误的数字代码。

`sql_state` 此错误的五个字符的字母数字代码。

`severity` 一个 <a href="#avaticaseverity">AvaticaSeverity</a> 对象，表示错误的严重程度。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### ExecuteBatchResponse

对 <a href="#executebatchrequest">ExecuteBatchRequest</a> 和 <a href="#prepareandexecutebatchrequest">PrepareAndExecuteBatchRequest</a> 的响应。

```protobuf
message ExecuteBatchResponse {
  string connection_id = 1;
  uint32 statement_id = 2;
  repeated uint32 update_counts = 3;
  bool missing_statement = 4;
  RpcMetadata metadata = 5;
}
```

`connection_id` 引用所使用的连接的 ID。

`statment_id` 引用所使用的语句的 ID。

`update_counts` 与批处理中每个更新的更新计数对应的整数值数组。

`missing_statement` 表示请求是否因缺少语句而失败的布尔值。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### ExecuteResponse

对 <a href="#executerequest">ExecuteRequest</a> 的响应，包含元数据查询的结果。

```protobuf
message ExecuteResponse {
  repeated ResultSetResponse results = 1;
  bool missing_statement = 2;
  RpcMetadata metadata = 3;
}
```

`results` <a href="#resultsetresponse">ResultSetResponse</a> 的数组。

`missing_statement` 表示请求是否因缺少语句而失败的布尔值。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### FetchResponse

对 <a href="#fetchrequest">FetchRequest</a> 的响应，包含查询的请求。

```protobuf
message FetchResponse {
  Frame frame = 1;
  bool missing_statement = 2;
  bool missing_results = 3;
  RpcMetadata metadata = 4;
}
```

`frame` 包含获取结果的 <a href="#frame">Frame</a>。

`missing_statement` 表示请求是否因缺少语句而失败的布尔值。

`missing_results` 表示请求是否因缺少 ResultSet 而失败的布尔值。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### OpenConnectionResponse

对 <a href="#openconnectionrequest">OpenConnectionRequest</a> 的响应。客户端应在后续调用中使用的连接的 ID 由客户端在请求中提供。

```protobuf
message OpenConnectionResponse {
  RpcMetadata metadata = 1;
}

```

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### PrepareResponse

对 <a href="#preparerequest">PrepareRequest</a> 的响应。此响应包含一个 <a href="#statementhandle">StatementHandle</a>，客户端必须使用它来从语句中获取结果。

```protobuf
message PrepareResponse {
  StatementHandle statement = 1;
  RpcMetadata metadata = 2;
}
```

`statement` 一个 <a href="#statementhandle">StatementHandle</a> 对象。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### ResultSetResponse

包含查询结果和类型详细信息的响应。

```protobuf
message ResultSetResponse {
  string connection_id = 1;
  uint32 statement_id = 2;
  bool own_statement = 3;
  Signature signature = 4;
  Frame first_frame = 5;
  uint64 update_count = 6;
  RpcMetadata metadata = 7;
}
```

`connection_id` 用于生成此响应的连接的标识符。

`statement_id` 用于生成此响应的语句的标识符。

`own_statement` 结果集是否拥有自己的专用语句。如果为 true，则当结果集关闭时，服务器必须自动关闭语句。例如，这用于 JDBC 元数据结果集。

`signature` 一个嵌套对象 <a href="#signature">Signature</a>。此字段仅对返回数据的查询存在。

`first_frame` 一个可选的嵌套对象 <a href="#frame">Frame</a>。

`update_count` 对于正常结果集，此数字始终为 `-1`。任何其他值表示仅包含此计数而不包含其他数据的"虚拟"结果集。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

### RollbackResponse

对 <a href="#rollbackrequest">RollBackRequest</a> 的响应。

```protobuf
message RollbackResponse {

}
```

此响应没有属性。

### SyncResultsResponse

对 <a href="#syncresultsrequest">SyncResultsRequest</a> 的响应。当 `moreResults` 为 true 时，应该发出 <a href="#fetchrequest">FetchRequest</a> 以获取下一批记录。当 `missingStatement` 为 true 时，必须使用 <a href="#preparerequest">PrepareRequest</a> 或适当的 DDL 请求（例如 <a href="#catalogsrequest">CatalogsRequest</a> 或 <a href="#schemasrequest">SchemasRequest</a>）重新创建语句。

```protobuf
message SyncResultsResponse {
  bool missing_statement = 1;
  bool more_results = 2;
  RpcMetadata metadata = 3;
}
```

`more_results` 表示根据请求"同步"的 ResultSet 是否存在结果的布尔值。

`missing_statement` 表示 ResultSet 的语句是否仍然存在的布尔值。

`metadata` <a href="#rpcmetadata">服务器元数据</a>关于此调用的信息。

## 其他

### AvaticaParameter

此对象描述结果中列的"简单"或标量 JDBC 类型表示。这不包括复杂类型，如数组。

```protobuf
message AvaticaParameter {
  bool signed = 1;
  uint32 precision = 2;
  uint32 scale = 3;
  uint32 parameter_type = 4;
  string class_name = 5;
  string class_name = 6;
  string name = 7;
}
```

`signed` 一个布尔值，表示列是否为有符号数值。

`precision` 此列支持的最大数值精度。

`scale` 此列支持的最大数值刻度。

`parameter_type` 对应于 JDBC Types 类的整数，表示列的类型。

`type_name` 此列的 JDBC 类型名称。

`class_name` 支持此列的 JDBC 类型的 Java 类。

`name` 列的名称。

### AvaticaSeverity

此枚举描述 Avatica 服务器中错误的各种关注级别。

```protobuf
enum Severity {
  UNKNOWN_SEVERITY = 0;
  FATAL_SEVERITY = 1;
  ERROR_SEVERITY = 2;
  WARNING_SEVERITY = 3;
}
```

### AvaticaType

此对象描述列的简单或复杂类型。复杂类型将在 `component` 或 `columns` 属性中包含额外信息，描述复杂父类型的嵌套类型。

```protobuf
message AvaticaType {
  uint32 id = 1;
  string name = 2;
  Rep rep = 3;
  repeated ColumnMetaData columns = 4;
  AvaticaType component = 5;
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

```protobuf
message ColumnMetaData {
  uint32 ordinal = 1;
  bool auto_increment = 2;
  bool case_sensitive = 3;
  bool searchable = 4;
  bool currency = 5;
  uint32 nullable = 6;
  bool signed = 7;
  uint32 display_size = 8;
  string label = 9;
  string column_name = 10;
  string schema_name = 11;
  uint32 precision = 12;
  uint32 scale = 13;
  string table_name = 14;
  string catalog_name = 15;
  bool read_only = 16;
  bool writable = 17;
  bool definitely_writable = 18;
  string column_class_name = 19;
  AvaticaType type = 20;
}
```

`ordinal` 位置偏移编号。

`auto_increment` 一个布尔值，表示列是否自动递增。

`case_sensitive` 一个布尔值，表示列是否区分大小写。

`searchable` 一个布尔值，表示此列是否支持所有 WHERE 搜索子句。

`currency` 一个布尔值，表示此列是否表示货币。

`nullable` 一个数字，表示此列是否支持空值。

* 0 = 不允许空值
* 1 = 允许空值
* 2 = 不知道是否允许空值

`signed` 一个布尔值，表示列是否为有符号数值。

`display_size` 列的字符宽度。

`label` 此列的描述。

`column_name` 列的名称。

`schema_name` 此列所属的模式。

`precision` 此列支持的最大数值精度。

`scale` 此列支持的最大数值刻度。

`table_name` 此列所属的表的名称。

`catalog_name` 此列所属的目录的名称。

`type` 一个嵌套的 <a href="#avaticatype">AvaticaType</a>，表示列的类型。

`read_only` 一个布尔值，表示列是否为只读。

`writable` 一个布尔值，表示列是否可能被更新。

`definitely_writable` 一个布尔值，表示列是否肯定可以被更新。

`column_class_name` 支持列类型的 Java 类的名称。

### ConnectionProperties

此对象表示给定 JDBC 连接的属性。

```protobuf
message ConnectionProperties {
  bool is_dirty = 1;
  bool auto_commit = 2;
  bool has_auto_commit = 7;
  bool read_only = 3;
  bool has_read_only = 8;
  uint32 transaction_isolation = 4;
  string catalog = 5;
  string schema = 6;
}
```

`is_dirty` 表示属性是否已更改的布尔值。此字段不应存在，因为它从未出现，并将在未来的版本中从协议中移除。

`auto_commit` 表示事务是否启用了 autoCommit 自动提交的布尔值。

`has_auto_commit` 表示是否设置了 `auto_commit` 的布尔值。

`read_only` 表示 JDBC 连接是否为只读的布尔值。

`has_read_only` 表示是否设置了 `read_only` 的布尔值。

`transaction_isolation` 一个整数，根据 JDBC 规范表示事务隔离级别。此值类似于 `java.sql.Connection` 中定义的值。

* 0 = 不支持事务
* 1 = 可能发生脏读、不可重复读和幻读。
* 2 = 防止脏读，但可能发生不可重复读和幻读。
* 4 = 防止脏读和不可重复读，但可能发生幻读。
* 8 = 防止脏读、不可重复读和幻读。

`catalog` 获取连接属性时要使用的目录的名称。

`schema` 获取连接属性时要使用的模式的名称。

### CursorFactory

此对象表示将无类型对象转换为某些结果的必要类型所需的信息。

```protobuf
message CursorFactory {
  enum Style {
    OBJECT = 0;
    RECORD = 1;
    RECORD_PROJECTION = 2;
    ARRAY = 3;
    LIST = 4;
    MAP = 5;
  }

  Style style = 1;
  string class_name = 2;
  repeated string field_names = 3;
}
```

`style` 一个字符串，表示包含对象的 <a href="#style">Style</a> 样式。

`class_name` `RECORD` 或 `RECORD_PROJECTION` 的名称。

### DatabaseProperty

此对象表示通过 Avatica 服务器的连接公开的数据库属性。

```protobuf
message DatabaseProperty {
  string name = 1;
  repeated string functions = 2;
}
```

`name` 数据库属性的名称。

`functions` 属性值的集合。

### Frame

此对象表示一批结果，跟踪结果中的偏移量以及 Avatica 服务器中是否还有更多结果需要获取。

```protobuf
message Frame {
  uint64 offset = 1;
  bool done = 2;
  repeated Row rows = 3;
}
```

`offset` 这些 `rows` 在包含结果集中的起始位置。

`done` 一个布尔值，表示此结果集是否还有更多结果。

`rows` <a href="#row">Row</a> 的集合。

### Row

此对象表示关系数据库表中的一行。

```protobuf
message Row {
  repeated ColumnValue value = 1;
}
```

`value` <a href="#columnvalue">ColumnValue</a> 的集合，行中的列。

### ColumnValue

```protobuf
message ColumnValue {
  repeated TypedValue value = 1; // Deprecated!
  repeated ColumnValue array_value = 2;
  boolean has_array_value = 3;
  TypedValue scalar_value = 4;
}
```

`value` Calcite-1.6 之前序列化 <a href="#typedvalue">TypedValue</a> 的方式。不再使用。

`array_value` 如果此列是数组（不是标量），则为此列的值。

`has_array_value` 如果设置了 `array_value`，则应设置为 true。

`scalar_value` 如果此列是标量（不是数组），则为此列的值。

### QueryState

此对象表示在 Avatica 服务器中创建 ResultSet 的方式。ResultSet 可以由用户提供的 SQL 或带有该操作参数的 DatabaseMetaData 操作创建。

```protobuf
message QueryState {
  StateType type = 1;
  string sql = 2;
  MetaDataOperation op = 3;
  repeated MetaDataOperationArgument args = 4;
  bool has_args = 5;
  bool has_sql = 6;
  bool has_op = 7;
}
```

`type` 一个 <a href="#statetype">StateType</a> 对象，表示支持此查询的 ResultSet 的操作类型。

`sql` 创建此查询的 ResultSet 的 SQL 语句。如果 `type` 为 `SQL`，则必需。

`op` 创建此查询的 ResultSet 的 DML 操作。如果 `type` 为 `METADATA`，则必需。

`args` 调用的 DML 操作的参数。如果 `type` 为 `METADATA`，则必需。

`has_args` 表示是否提供了字段 `args` 的布尔值。

`has_sql` 表示是否提供了字段 `sql` 的布尔值。

`has_op` 表示是否提供了字段 `op` 的布尔值。

### Rep

此枚举表示某个值的具体 Java 类型。

```protobuf
enum Rep {
  PRIMITIVE_BOOLEAN = 0;
  PRIMITIVE_BYTE = 1;
  PRIMITIVE_CHAR = 2;
  PRIMITIVE_SHORT = 3;
  PRIMITIVE_INT = 4;
  PRIMITIVE_LONG = 5;
  PRIMITIVE_FLOAT = 6;
  PRIMITIVE_DOUBLE = 7;
  BOOLEAN = 8;
  BYTE = 9;
  CHARACTER = 10;
  SHORT = 11;
  INTEGER = 12;
  LONG = 13;
  FLOAT = 14;
  DOUBLE = 15;
  BIG_INTEGER = 25;
  BIG_DECIMAL = 26;
  JAVA_SQL_TIME = 16;
  JAVA_SQL_TIMESTAMP = 17;
  JAVA_SQL_DATE = 18;
  JAVA_UTIL_DATE = 19;
  BYTE_STRING = 20;
  STRING = 21;
  NUMBER = 22;
  OBJECT = 23;
  NULL = 24;
  ARRAY = 27;
  STRUCT = 28;
  MULTISET = 29;
}
```

### RpcMetadata

此对象包含 Avatica 服务器返回的各种每次调用/上下文元数据。

```protobuf
message RpcMetadata {
  string server_address = 1;
}
```

`serverAddress` 创建此对象的服务器的 `host:port`。

### Signature

此对象表示在 Avatica 服务器中准备语句的结果。

```protobuf
message Signature {
  repeated ColumnMetaData columns = 1;
  string sql = 2;
  repeated AvaticaParameter parameters = 3;
  CursorFactory cursor_factory = 4;
  StatementType statementType = 5;
}
```

`columns` 表示结果集模式的 <a href="#columnmetadata">ColumnMetaData</a> 对象的数组。

`sql` 执行的 SQL。

`parameters` 表示类型特定详细信息的 <a href="#avaticaparameter">AvaticaParameter</a> 对象的数组。

`cursor_factory` 一个 <a href="#cursorfactory">CursorFactory</a> 对象，表示帧的 Java 表示。

`statementType` 语句的类型。

### StateType

此枚举表示是使用用户提供的 SQL 还是 DatabaseMetaData 操作来创建某个 ResultSet。

```protobuf
enum StateType {
  SQL = 0;
  METADATA = 1;
}
```

### StatementHandle

此对象封装了在 Avatica 服务器中创建的语句的所有信息。

```protobuf
message StatementHandle {
  string connection_id = 1;
  uint32 id = 2;
  Signature signature = 3;
}
```

`connection_id` 此语句所属的连接的标识符。

`id` 语句的标识符。

`signature` 语句的 <a href="#signature">Signature</a> 对象。

### StatementType

此消息表示语句的类型。

```protobuf
enum StatementType {
  SELECT = 0;
  INSERT = 1;
  UPDATE = 2;
  DELETE = 3;
  UPSERT = 4;
  MERGE = 5;
  OTHER_DML = 6;
  CREATE = 7;
  DROP = 8;
  ALTER = 9;
  OTHER_DDL = 10;
  CALL = 11;
}
```

### Style

此枚举表示值的通用类型"类"。在 <a href="#cursorfactory">CursorFactory</a> 中定义。

```protobuf
enum Style {
  OBJECT = 0;
  RECORD = 1;
  RECORD_PROJECTION = 2;
  ARRAY = 3;
  LIST = 4;
  MAP = 5;
}
```

### TypedValue

此对象封装了行中列的类型和值。

```protobuf
message TypedValue {
  Rep type = 1;
  bool bool_value = 2;
  string string_value = 3;
  sint64 number_value = 4;
  bytes bytes_value = 5;
  double double_value = 6;
  bool null = 7;
  repeated TypedValue array_value = 8;
  Rep component_type = 9;
  bool implicitly_null = 10;
}
```

`type` 引用哪个属性填充了列值的名称。

`bool_value` 布尔值。

`string_value` 字符/字符串值。

`number_value` 数值（非 `double`）。

`bytes_value` 字节数组值。

`double_value` `double` 值。

`null` 表示值是否为 null 的布尔值。

`array_value` TypedValue 消息的重复，每个都是 array_value 的一个元素（递归）。

`component_type` 当此 TypedValue 表示数组时，这是数组类型的表示。

`implicitly_null` 用于区分显式（用户设置）和隐式（用户未设置）空值的布尔值。

下表记录了每个 <a href="#rep">Rep</a> 值如何对应于此消息中的属性：

| <a href="#rep">Rep</a> 值 | <a href="#typedvalue">TypedValue</a> 属性 | 描述 |
| PRIMITIVE_BOOLEAN | `bool_value` ||
| BOOLEAN | `bool_value` ||
| PRIMITIVE_BYTE | `number_value` | `byte` 的数值。 |
| BYTE | `number_value` ||
| PRIMITIVE_CHAR | `string_value` ||
| CHARACTER | `string_value` ||
| PRIMITIVE_SHORT | `number_value` ||
| SHORT | `number_value` ||
| PRIMITIVE_INT | `number_value` ||
| INTEGER | `number_value` ||
| PRIMITIVE_LONG | `number_value` ||
| LONG | `number_value` ||
| PRIMITIVE_FLOAT | `number_value` ||
| FLOAT | `number_value` | IEEE 754 浮点"单格式"位布局。 |
| PRIMITIVE_DOUBLE | `number_value` ||
| DOUBLE | `number_value` ||
| BIG_INTEGER | `bytes_value` | BigInteger 的二进制补码表示。请参阅 `BigInteger#toByteArray()`。 |
| BIG_DECIMAL | `string_value` | 值的字符串化表示。请参阅 `BigDecimal#toString()`。 |
| JAVA_SQL_TIME | `number_value` | 作为整数，自午夜以来的毫秒数。 |
| JAVA_SQL_DATE | `number_value` | 作为整数，自纪元以来的天数。 |
| JAVA_SQL_TIMESTAMP | `number_value` | 作为长整型，自纪元以来的毫秒数。 |
| JAVA_UTIL_DATE | `number_value` | 作为长整型，自纪元以来的毫秒数。 |
| BYTE_STRING | `bytes_value` ||
| STRING | `string_value` | 这必须是 UTF-8 字符串。 |
| NUMBER | `number_value` | 一般数字，未知具体类型。 |
| OBJECT | `null` | 我们可以序列化的唯一一般对象是"null"。非 null 的 OBJECT 将抛出错误。 |
| NULL | `null` ||
| ARRAY | N/A | 未处理。 |
| STRUCT | N/A | 未处理。 |
| MULTISET | N/A | 未处理。 |

### UpdateBatch

这是一个消息，用作 <a href="#typedvalue">TypedValue</a> 集合的包装器。

```protobuf
message UpdateBatch {
  repeated TypedValue parameter_values = 1;
}
```

`parameter_values` 一个 SQL 命令更新的参数值集合。

### WireMessage

此消息包装所有 `Request` 和 `Response`。

```protobuf
message WireMessage {
  string name = 1;
  bytes wrapped_message = 2;
}
```

`name` 包装消息的 Java 类名。

`wrapped_message` 由 `name` 指定的相同类型的包装消息的序列化表示。

{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/xingqiu/calcite_xingqiu.png)

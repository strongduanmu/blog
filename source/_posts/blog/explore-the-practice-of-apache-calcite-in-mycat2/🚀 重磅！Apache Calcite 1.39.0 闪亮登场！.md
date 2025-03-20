### **🚀 重磅！Apache Calcite 1.39.0 闪亮登场！**

Calcite 社区上周正式发布了 1.39.0 版本！这是继 1.38.0 后时隔 5 个月的重大更新，由 45 位贡献者共同完成，累计修复 209 项问题。本次更新重点支持了 **VARIANT/UUID 数据类型**和 **动态规划 Join 重排序算法（DPhyp）**，大幅优化复杂查询性能；新增多方言函数兼容性（如 Oracle SYSDATE、Hive CRC32 等），增强 Arrow 适配器对时间、精度类型的支持。同时修复了子查询、窗口函数、类型推断等关键问题，欢迎 Calcite 用户关注并升级！

------

### **核心功能更新**

1. **数据类型扩展**
   - **VARIANT 类型**：支持存储半结构化数据（类似 JSON），新增 `TYPEOF` 和 `VARIANTNULL` 函数用于类型识别与处理。
   - **UUID 类型**：原生支持全局唯一标识符，修复了与 `BINARY` 类型转换的准确性。
2. **查询优化增强**
   - **Checked Arithmetic**：为 `TINYINT` 等短整型启用算术溢出检查，BigQuery 和 SQL Server 方言默认启用。
   - **DPhyp 算法**：基于动态规划的 Join 重排序算法，显著提升复杂多表 Join 查询性能。
3. **多方言兼容性升级**
   - **Oracle**：新增 `CONVERT`、`SYSDATE`、`SYSTIMESTAMP` 函数。
   - **Hive/Spark**：支持 `CRC32`、`BIN`、`HEX`、`BASE64` 等函数。
   - **PostgreSQL**：新增 `SPLIT_PART` 函数，迁移 `DATEADD/DATEDIFF` 至 Redshift 方言。
   - **MSSQL**：支持 `%` 取模运算符和 `CEILING` 函数。
4. **Arrow 适配器改进**
   - 新增 `TIME`、带精度的 `DECIMAL` 支持，修复日期类型自动转为 `TIMESTAMP` 的问题。

------

### **重大变更与废弃**

1. **API 调整**
   - 新增 `RelDataTypeFactory#enforceTypeWithNullability`，修复可为空 `ROW` 类型处理问题。
   - `RelMdUniqueKeys` 默认唯一键推导上限为 1000，避免内存溢出。
   - **废弃警告**：`Schema.getTable()` 等旧方法标记为废弃，建议改用新 API。
2. **方言行为变更**
   - Spark/PostgreSQL 的 `GREATEST/LEAST` 函数实现统一。
   - BigQuery/SQL Server 整数运算默认开启溢出检查。

------

### **关键问题修复**

1. **查询逻辑优化**
   - 修复 `SOME` 子查询空值处理错误（CALCITE-6778）、`JOIN` 条件错误引用右表列问题（CALCITE-6824）。
   - 修正窗口函数 `ROW_NUMBER` 的代码生成逻辑（CALCITE-6837）。
2. **类型系统完善**
   - 优化 `UNNEST` 对可空 `ROW` 数组的推断（CALCITE-6813），`CAST` 操作保留字段原名（CALCITE-6770）。
3. **适配器修复**
   - **Elasticsearch**：修复 `NOT IN` 过滤条件错误转换（CALCITE-6867）。
   - **JDBC**：优化 Snowflake/Vertica 的 `LIMIT` 生成逻辑，修复多表 Join 别名冲突（CALCITE-6221）。

------

**完整更新详情**：[Apache Calcite 1.39.0 Release Notes](https://calcite.apache.org/docs/history.html#v1-39-0)
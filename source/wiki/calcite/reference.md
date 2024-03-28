---
layout: wiki
wiki: calcite
order: 200
title: 参考指南
date: 2023-10-26 09:00:00
banner: /assets/banner/banner_1.jpg
---

> 原文链接：https://calcite.apache.org/docs/reference.html

该页面描述了 Calcite 的默认 SQL 解析器识别的 SQL 方言。

## 语法

SQL 语法采用了 [BNF](ttps://en.wikipedia.org/wiki/Backus–Naur_Form) 风格。

```sql
statement:
      setStatement
  |   resetStatement
  |   explain
  |   describe
  |   insert
  |   update
  |   merge
  |   delete
  |   query

statementList:
      statement [ ';' statement ]* [ ';' ]

setStatement:
      [ ALTER { SYSTEM | SESSION } ] SET identifier '=' expression

resetStatement:
      [ ALTER { SYSTEM | SESSION } ] RESET identifier
  |   [ ALTER { SYSTEM | SESSION } ] RESET ALL

explain:
      EXPLAIN PLAN
      [ WITH TYPE | WITH IMPLEMENTATION | WITHOUT IMPLEMENTATION ]
      [ EXCLUDING ATTRIBUTES | INCLUDING [ ALL ] ATTRIBUTES ]
      [ AS JSON | AS XML | AS DOT ]
      FOR { query | insert | update | merge | delete }

describe:
      DESCRIBE DATABASE databaseName
  |   DESCRIBE CATALOG [ databaseName . ] catalogName
  |   DESCRIBE SCHEMA [ [ databaseName . ] catalogName ] . schemaName
  |   DESCRIBE [ TABLE ] [ [ [ databaseName . ] catalogName . ] schemaName . ] tableName [ columnName ]
  |   DESCRIBE [ STATEMENT ] { query | insert | update | merge | delete }

insert:
      { INSERT | UPSERT } INTO tablePrimary
      [ '(' column [, column ]* ')' ]
      query

update:
      UPDATE tablePrimary
      SET assign [, assign ]*
      [ WHERE booleanExpression ]

assign:
      identifier '=' expression

merge:
      MERGE INTO tablePrimary [ [ AS ] alias ]
      USING tablePrimary
      ON booleanExpression
      [ WHEN MATCHED THEN UPDATE SET assign [, assign ]* ]
      [ WHEN NOT MATCHED THEN INSERT VALUES '(' value [ , value ]* ')' ]

delete:
      DELETE FROM tablePrimary [ [ AS ] alias ]
      [ WHERE booleanExpression ]

query:
      values
  |   WITH [ RECURSIVE ] withItem [ , withItem ]* query
  |   {
          select
      |   selectWithoutFrom
      |   query UNION [ ALL | DISTINCT ] query
      |   query EXCEPT [ ALL | DISTINCT ] query
      |   query MINUS [ ALL | DISTINCT ] query
      |   query INTERSECT [ ALL | DISTINCT ] query
      }
      [ ORDER BY orderItem [, orderItem ]* ]
      [ LIMIT [ start, ] { count | ALL } ]
      [ OFFSET start { ROW | ROWS } ]
      [ FETCH { FIRST | NEXT } [ count ] { ROW | ROWS } ONLY ]

withItem:
      name
      [ '(' column [, column ]* ')' ]
      AS '(' query ')'

orderItem:
      expression [ ASC | DESC ] [ NULLS FIRST | NULLS LAST ]

select:
      SELECT [ hintComment ] [ STREAM ] [ ALL | DISTINCT ]
          { * | projectItem [, projectItem ]* }
      FROM tableExpression
      [ WHERE booleanExpression ]
      [ GROUP BY [ ALL | DISTINCT ] { groupItem [, groupItem ]* } ]
      [ HAVING booleanExpression ]
      [ WINDOW windowName AS windowSpec [, windowName AS windowSpec ]* ]
      [ QUALIFY booleanExpression ]

selectWithoutFrom:
      SELECT [ ALL | DISTINCT ]
          { * | projectItem [, projectItem ]* }

projectItem:
      expression [ [ AS ] columnAlias ]
  |   tableAlias . *

tableExpression:
      tableReference [, tableReference ]*
  |   tableExpression [ NATURAL ] [ { LEFT | RIGHT | FULL } [ OUTER ] ] JOIN tableExpression [ joinCondition ]
  |   tableExpression CROSS JOIN tableExpression
  |   tableExpression [ CROSS | OUTER ] APPLY tableExpression

joinCondition:
      ON booleanExpression
  |   USING '(' column [, column ]* ')'

tableReference:
      tablePrimary
      [ FOR SYSTEM_TIME AS OF expression ]
      [ pivot ]
      [ unpivot ]
      [ matchRecognize ]
      [ [ AS ] alias [ '(' columnAlias [, columnAlias ]* ')' ] ]

tablePrimary:
      [ [ catalogName . ] schemaName . ] tableName
      '(' TABLE [ [ catalogName . ] schemaName . ] tableName ')'
  |   tablePrimary [ hintComment ] [ EXTEND ] '(' columnDecl [, columnDecl ]* ')'
  |   [ LATERAL ] '(' query ')'
  |   UNNEST '(' expression ')' [ WITH ORDINALITY ]
  |   [ LATERAL ] TABLE '(' [ SPECIFIC ] functionName '(' expression [, expression ]* ')' ')'

columnDecl:
      column type [ NOT NULL ]

hint:
      hintName
  |   hintName '(' hintOptions ')'

hintOptions:
      hintKVOption [, hintKVOption ]*
  |   optionName [, optionName ]*
  |   optionValue [, optionValue ]*

hintKVOption:
      optionName '=' stringLiteral
  |   stringLiteral '=' stringLiteral

optionValue:
      stringLiteral
  |   numericLiteral

columnOrList:
      column
  |   '(' column [, column ]* ')'

exprOrList:
      expr
  |   '(' expr [, expr ]* ')'

pivot:
      PIVOT '('
      pivotAgg [, pivotAgg ]*
      FOR pivotList
      IN '(' pivotExpr [, pivotExpr ]* ')'
      ')'

pivotAgg:
      agg '(' [ ALL | DISTINCT ] value [, value ]* ')'
      [ [ AS ] alias ]

pivotList:
      columnOrList

pivotExpr:
      exprOrList [ [ AS ] alias ]

unpivot:
      UNPIVOT [ INCLUDING NULLS | EXCLUDING NULLS ] '('
      unpivotMeasureList
      FOR unpivotAxisList
      IN '(' unpivotValue [, unpivotValue ]* ')'
      ')'

unpivotMeasureList:
      columnOrList

unpivotAxisList:
      columnOrList

unpivotValue:
      column [ AS literal ]
  |   '(' column [, column ]* ')' [ AS '(' literal [, literal ]* ')' ]

values:
      { VALUES | VALUE } expression [, expression ]*

groupItem:
      expression
  |   '(' ')'
  |   '(' expression [, expression ]* ')'
  |   CUBE '(' expression [, expression ]* ')'
  |   ROLLUP '(' expression [, expression ]* ')'
  |   GROUPING SETS '(' groupItem [, groupItem ]* ')'

window:
      windowName
  |   windowSpec

windowSpec:
      '('
      [ windowName ]
      [ ORDER BY orderItem [, orderItem ]* ]
      [ PARTITION BY expression [, expression ]* ]
      [
          RANGE numericOrIntervalExpression { PRECEDING | FOLLOWING }
      |   ROWS numericExpression { PRECEDING | FOLLOWING }
      ]
      ')'
```

在 `insert` 中，如果 `INSERT` 或 `UPSERT` 语句未指定目标列列表，则查询必须具有与目标表相同的列数，某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isInsertSubsetColumnsAllowed--)除外。

在 `merge` 中，至少必须存在 `WHEN MATCHED` 和 `WHEN NOT MATCHED` 子句之一。

`tablePrimary` 只能在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#allowExtend--)中包含 `EXTEND` 子句；在这些相同的一致性级别中，insert 中的任何列都可以由 `columnDecl` 替换，这与将其包含在 EXTEND 子句中具有类似的效果。

在 `orderItem` 中，如果 `expression` 是正整数 n，则表示 SELECT 子句中的第 n 项。

在查询中，`count` 和 `start` 可以分别是无符号整数字面量或值为整数的动态参数。

聚合查询是在 SELECT 子句中包含 GROUP BY 或 HAVING 子句，或包含聚合函数的查询。在聚合查询的 SELECT、HAVING 和 ORDER BY 子句中，所有表达式必须是当前组内的常量（即：由 GROUP BY 子句定义的分组常量或常量）、或者是聚合函数，或者是常量和聚合函数的组合。聚合和分组函数只能出现在聚合查询中，并且只能出现在 SELECT、HAVING 或 ORDER BY 子句中。

标量子查询是指用作表达式的子查询。如果子查询没有返回行，则值为 NULL，如果它返回多于一行，则会报错。

`IN`、`EXISTS`、`UNIQUE` 和标量子查询，可以出现在任何可以出现表达式的位置（例如 JOIN 的 SELECT 子句、WHERE 子句、ON 子句，或作为聚合函数的参数）。

`IN`、`EXISTS`、`UNIQUE` 或标量子查询可以是相关的，即：它可以引用一个封闭查询中 FROM 子句的表。

`GROUP BY DISTINCT` 删除重复的分组集（例如：`GROUP BY DISTINCT GROUPING SETS ((a), (a, b), (a))` 相当于 `GROUP BY GROUPING SETS ((a), (a, b))`），`GROUP BY ALL` 和 `GROUP BY` 是等价的。

`selectWithoutFrom` 相当于 `VALUES`，但它不是标准 SQL，并且仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isMinusAllowed--)中允许使用。

`MINUS` 相当于 `EXCEPT`，但不是标准 SQL，仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isMinusAllowed--)中允许使用。

`CROSS APPLY` 和 `OUTER APPLY` 仅允许在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isApplyAllowed--)中使用。

`LIMIT start, count` 等价于 `LIMIT count OFFSET start`，但仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isLimitStartCountAllowed--)中允许使用。

在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isOffsetLimitAllowed--)中，`OFFSET start` 可能发生在 `LIMIT count` 之前。

`VALUE` 与 `VALUES` 等效，但不是标准 SQL，并且仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isValueAllowed--)中允许使用。

## 关键字

以下是 SQL 关键字的列表。保留的关键字使用粗体展示。

A, **ABS**, ABSENT, ABSOLUTE, ACTION, ADA, ADD, ADMIN, AFTER, **ALL**, **ALLOCATE**, **ALLOW**, **ALTER**, ALWAYS, **AND**, **ANY**, APPLY, **ARE**, **ARRAY**, ARRAY_AGG, ARRAY_CONCAT_AGG, **ARRAY_MAX_CARDINALITY**, **AS**, ASC, **ASENSITIVE**, ASSERTION, ASSIGNMENT, **ASYMMETRIC**, **AT**, **ATOMIC**, ATTRIBUTE, ATTRIBUTES, **AUTHORIZATION**, **AVG**, BEFORE, **BEGIN**, **BEGIN_FRAME**, **BEGIN_PARTITION**, BERNOULLI, **BETWEEN**, **BIGINT**, **BINARY**, **BIT**, **BLOB**, **BOOLEAN**, **BOTH**, BREADTH, **BY**, C, **CALL**, **CALLED**, **CARDINALITY**, CASCADE, **CASCADED**, **CASE**, **CAST**, CATALOG, CATALOG_NAME, **CEIL**, **CEILING**, CENTURY, CHAIN, **CHAR**, **CHARACTER**, CHARACTERISTICS, CHARACTERS, **CHARACTER_LENGTH**, CHARACTER_SET_CATALOG, CHARACTER_SET_NAME, CHARACTER_SET_SCHEMA, **CHAR_LENGTH**, **CHECK**, **CLASSIFIER**, CLASS_ORIGIN, **CLOB**, **CLOSE**, **COALESCE**, COBOL, **COLLATE**, COLLATION, COLLATION_CATALOG, COLLATION_NAME, COLLATION_SCHEMA, **COLLECT**, **COLUMN**, COLUMN_NAME, COMMAND_FUNCTION, COMMAND_FUNCTION_CODE, **COMMIT**, COMMITTED, **CONDITION**, CONDITIONAL, CONDITION_NUMBER, **CONNECT**, CONNECTION, CONNECTION_NAME, **CONSTRAINT**, CONSTRAINTS, CONSTRAINT_CATALOG, CONSTRAINT_NAME, CONSTRAINT_SCHEMA, CONSTRUCTOR, **CONTAINS**, CONTAINS_SUBSTR, CONTINUE, **CONVERT**, **CORR**, **CORRESPONDING**, **COUNT**, **COVAR_POP**, **COVAR_SAMP**, **CREATE**, **CROSS**, **CUBE**, **CUME_DIST**, **CURRENT**, **CURRENT_CATALOG**, **CURRENT_DATE**, **CURRENT_DEFAULT_TRANSFORM_GROUP**, **CURRENT_PATH**, **CURRENT_ROLE**, **CURRENT_ROW**, **CURRENT_SCHEMA**, **CURRENT_TIME**, **CURRENT_TIMESTAMP**, **CURRENT_TRANSFORM_GROUP_FOR_TYPE**, **CURRENT_USER**, **CURSOR**, CURSOR_NAME, **CYCLE**, DATA, DATABASE, **DATE**, **DATETIME**, DATETIME_DIFF, DATETIME_INTERVAL_CODE, DATETIME_INTERVAL_PRECISION, DATETIME_TRUNC, DATE_DIFF, DATE_TRUNC, **DAY**, DAYOFWEEK, DAYOFYEAR, DAYS, **DEALLOCATE**, **DEC**, DECADE, **DECIMAL**, **DECLARE**, **DEFAULT**, DEFAULTS, DEFERRABLE, DEFERRED, **DEFINE**, DEFINED, DEFINER, DEGREE, **DELETE**, **DENSE_RANK**, DEPTH, **DEREF**, DERIVED, DESC, **DESCRIBE**, DESCRIPTION, DESCRIPTOR, **DETERMINISTIC**, DIAGNOSTICS, **DISALLOW**, **DISCONNECT**, DISPATCH, **DISTINCT**, DOMAIN, DOT, **DOUBLE**, DOW, DOY, **DROP**, **DYNAMIC**, DYNAMIC_FUNCTION, DYNAMIC_FUNCTION_CODE, **EACH**, **ELEMENT**, **ELSE**, **EMPTY**, ENCODING, **END**, **END-EXEC**, **END_FRAME**, **END_PARTITION**, EPOCH, **EQUALS**, ERROR, **ESCAPE**, **EVERY**, **EXCEPT**, EXCEPTION, EXCLUDE, EXCLUDING, **EXEC**, **EXECUTE**, **EXISTS**, **EXP**, **EXPLAIN**, **EXTEND**, **EXTERNAL**, **EXTRACT**, **FALSE**, **FETCH**, **FILTER**, FINAL, FIRST, **FIRST_VALUE**, **FLOAT**, **FLOOR**, FOLLOWING, **FOR**, **FOREIGN**, FORMAT, FORTRAN, FOUND, FRAC_SECOND, **FRAME_ROW**, **FREE**, **FRIDAY**, **FROM**, **FULL**, **FUNCTION**, **FUSION**, G, GENERAL, GENERATED, GEOMETRY, **GET**, **GLOBAL**, GO, GOTO, **GRANT**, GRANTED, **GROUP**, **GROUPING**, **GROUPS**, GROUP_CONCAT, **HAVING**, HIERARCHY, **HOLD**, HOP, **HOUR**, HOURS, **IDENTITY**, IGNORE, ILIKE, IMMEDIATE, IMMEDIATELY, IMPLEMENTATION, **IMPORT**, **IN**, INCLUDE, INCLUDING, INCREMENT, **INDICATOR**, **INITIAL**, INITIALLY, **INNER**, **INOUT**, INPUT, **INSENSITIVE**, **INSERT**, INSTANCE, INSTANTIABLE, **INT**, **INTEGER**, **INTERSECT**, **INTERSECTION**, **INTERVAL**, **INTO**, INVOKER, **IS**, ISODOW, ISOLATION, ISOYEAR, JAVA, **JOIN**, JSON, **JSON_ARRAY**, **JSON_ARRAYAGG**, **JSON_EXISTS**, **JSON_OBJECT**, **JSON_OBJECTAGG**, **JSON_QUERY**, **JSON_SCOPE**, **JSON_VALUE**, K, KEY, KEY_MEMBER, KEY_TYPE, LABEL, **LAG**, **LANGUAGE**, **LARGE**, LAST, **LAST_VALUE**, **LATERAL**, **LEAD**, **LEADING**, **LEFT**, LENGTH, LEVEL, LIBRARY, **LIKE**, **LIKE_REGEX**, **LIMIT**, **LN**, **LOCAL**, **LOCALTIME**, **LOCALTIMESTAMP**, LOCATOR, **LOWER**, M, MAP, **MATCH**, MATCHED, **MATCHES**, **MATCH_NUMBER**, **MATCH_RECOGNIZE**, **MAX**, MAXVALUE, **MEASURES**, **MEMBER**, **MERGE**, MESSAGE_LENGTH, MESSAGE_OCTET_LENGTH, MESSAGE_TEXT, **METHOD**, MICROSECOND, MILLENNIUM, MILLISECOND, **MIN**, **MINUS**, **MINUTE**, MINUTES, MINVALUE, **MOD**, **MODIFIES**, **MODULE**, **MONDAY**, **MONTH**, MONTHS, MORE, **MULTISET**, MUMPS, NAME, NAMES, NANOSECOND, **NATIONAL**, **NATURAL**, **NCHAR**, **NCLOB**, NESTING, **NEW**, **NEXT**, **NO**, **NONE**, **NORMALIZE**, NORMALIZED, **NOT**, **NTH_VALUE**, **NTILE**, **NULL**, NULLABLE, **NULLIF**, NULLS, NUMBER, **NUMERIC**, OBJECT, **OCCURRENCES_REGEX**, OCTETS, **OCTET_LENGTH**, **OF**, **OFFSET**, **OLD**, **OMIT**, **ON**, **ONE**, **ONLY**, **OPEN**, OPTION, OPTIONS, **OR**, **ORDER**, ORDERING, **ORDINAL**, ORDINALITY, OTHERS, **OUT**, **OUTER**, OUTPUT, **OVER**, **OVERLAPS**, **OVERLAY**, OVERRIDING, PAD, **PARAMETER**, PARAMETER_MODE, PARAMETER_NAME, PARAMETER_ORDINAL_POSITION, PARAMETER_SPECIFIC_CATALOG, PARAMETER_SPECIFIC_NAME, PARAMETER_SPECIFIC_SCHEMA, PARTIAL, **PARTITION**, PASCAL, PASSING, PASSTHROUGH, PAST, PATH, **PATTERN**, **PER**, **PERCENT**, **PERCENTILE_CONT**, **PERCENTILE_DISC**, **PERCENT_RANK**, **PERIOD**, **PERMUTE**, PIVOT, PLACING, PLAN, PLI, **PORTION**, **POSITION**, **POSITION_REGEX**, **POWER**, **PRECEDES**, PRECEDING, **PRECISION**, **PREPARE**, PRESERVE, **PREV**, **PRIMARY**, PRIOR, PRIVILEGES, **PROCEDURE**, PUBLIC, **QUALIFY**, QUARTER, QUARTERS, **RANGE**, **RANK**, READ, **READS**, **REAL**, **RECURSIVE**, **REF**, **REFERENCES**, **REFERENCING**, **REGR_AVGX**, **REGR_AVGY**, **REGR_COUNT**, **REGR_INTERCEPT**, **REGR_R2**, **REGR_SLOPE**, **REGR_SXX**, **REGR_SXY**, **REGR_SYY**, RELATIVE, **RELEASE**, REPEATABLE, REPLACE, **RESET**, RESPECT, RESTART, RESTRICT, **RESULT**, **RETURN**, RETURNED_CARDINALITY, RETURNED_LENGTH, RETURNED_OCTET_LENGTH, RETURNED_SQLSTATE, RETURNING, **RETURNS**, **REVOKE**, **RIGHT**, RLIKE, ROLE, **ROLLBACK**, **ROLLUP**, ROUTINE, ROUTINE_CATALOG, ROUTINE_NAME, ROUTINE_SCHEMA, **ROW**, **ROWS**, ROW_COUNT, **ROW_NUMBER**, **RUNNING**, **SAFE_CAST**, **SAFE_OFFSET**, **SAFE_ORDINAL**, **SATURDAY**, **SAVEPOINT**, SCALAR, SCALE, SCHEMA, SCHEMA_NAME, **SCOPE**, SCOPE_CATALOGS, SCOPE_NAME, SCOPE_SCHEMA, **SCROLL**, **SEARCH**, **SECOND**, SECONDS, SECTION, SECURITY, **SEEK**, **SELECT**, SELF, **SENSITIVE**, SEPARATOR, SEQUENCE, SERIALIZABLE, SERVER, SERVER_NAME, SESSION, **SESSION_USER**, **SET**, SETS, **SHOW**, **SIMILAR**, SIMPLE, SIZE, **SKIP**, **SMALLINT**, **SOME**, SOURCE, SPACE, **SPECIFIC**, **SPECIFICTYPE**, SPECIFIC_NAME, **SQL**, **SQLEXCEPTION**, **SQLSTATE**, **SQLWARNING**, SQL_BIGINT, SQL_BINARY, SQL_BIT, SQL_BLOB, SQL_BOOLEAN, SQL_CHAR, SQL_CLOB, SQL_DATE, SQL_DECIMAL, SQL_DOUBLE, SQL_FLOAT, SQL_INTEGER, SQL_INTERVAL_DAY, SQL_INTERVAL_DAY_TO_HOUR, SQL_INTERVAL_DAY_TO_MINUTE, SQL_INTERVAL_DAY_TO_SECOND, SQL_INTERVAL_HOUR, SQL_INTERVAL_HOUR_TO_MINUTE, SQL_INTERVAL_HOUR_TO_SECOND, SQL_INTERVAL_MINUTE, SQL_INTERVAL_MINUTE_TO_SECOND, SQL_INTERVAL_MONTH, SQL_INTERVAL_SECOND, SQL_INTERVAL_YEAR, SQL_INTERVAL_YEAR_TO_MONTH, SQL_LONGVARBINARY, SQL_LONGVARCHAR, SQL_LONGVARNCHAR, SQL_NCHAR, SQL_NCLOB, SQL_NUMERIC, SQL_NVARCHAR, SQL_REAL, SQL_SMALLINT, SQL_TIME, SQL_TIMESTAMP, SQL_TINYINT, SQL_TSI_DAY, SQL_TSI_FRAC_SECOND, SQL_TSI_HOUR, SQL_TSI_MICROSECOND, SQL_TSI_MINUTE, SQL_TSI_MONTH, SQL_TSI_QUARTER, SQL_TSI_SECOND, SQL_TSI_WEEK, SQL_TSI_YEAR, SQL_VARBINARY, SQL_VARCHAR, **SQRT**, **START**, STATE, STATEMENT, **STATIC**, **STDDEV_POP**, **STDDEV_SAMP**, **STREAM**, STRING_AGG, STRUCTURE, STYLE, SUBCLASS_ORIGIN, **SUBMULTISET**, **SUBSET**, SUBSTITUTE, **SUBSTRING**, **SUBSTRING_REGEX**, **SUCCEEDS**, **SUM**, **SUNDAY**, **SYMMETRIC**, **SYSTEM**, **SYSTEM_TIME**, **SYSTEM_USER**, **TABLE**, **TABLESAMPLE**, TABLE_NAME, TEMPORARY, **THEN**, **THURSDAY**, TIES, **TIME**, **TIMESTAMP**, TIMESTAMPADD, TIMESTAMPDIFF, TIMESTAMP_DIFF, TIMESTAMP_TRUNC, **TIMEZONE_HOUR**, **TIMEZONE_MINUTE**, TIME_DIFF, TIME_TRUNC, **TINYINT**, **TO**, TOP_LEVEL_COUNT, **TRAILING**, TRANSACTION, TRANSACTIONS_ACTIVE, TRANSACTIONS_COMMITTED, TRANSACTIONS_ROLLED_BACK, TRANSFORM, TRANSFORMS, **TRANSLATE**, **TRANSLATE_REGEX**, **TRANSLATION**, **TREAT**, **TRIGGER**, TRIGGER_CATALOG, TRIGGER_NAME, TRIGGER_SCHEMA, **TRIM**, **TRIM_ARRAY**, **TRUE**, **TRUNCATE**, **TRY_CAST**, **TUESDAY**, TUMBLE, TYPE, **UESCAPE**, UNBOUNDED, UNCOMMITTED, UNCONDITIONAL, UNDER, **UNION**, **UNIQUE**, **UNKNOWN**, UNNAMED, **UNNEST**, UNPIVOT, **UPDATE**, **UPPER**, **UPSERT**, USAGE, **USER**, USER_DEFINED_TYPE_CATALOG, USER_DEFINED_TYPE_CODE, USER_DEFINED_TYPE_NAME, USER_DEFINED_TYPE_SCHEMA, **USING**, UTF16, UTF32, UTF8, **VALUE**, **VALUES**, **VALUE_OF**, **VARBINARY**, **VARCHAR**, **VARYING**, **VAR_POP**, **VAR_SAMP**, VERSION, **VERSIONING**, VIEW, **WEDNESDAY**, WEEK, WEEKS, **WHEN**, **WHENEVER**, **WHERE**, **WIDTH_BUCKET**, **WINDOW**, **WITH**, **WITHIN**, **WITHOUT**, WORK, WRAPPER, WRITE, XML, **YEAR**, YEARS, ZONE.

## 标识符

标识符是 SQL 查询中使用的表、列和其他元数据元素的名称。

不带引号的标识符（例如 emp）必须以字母开头，并且只能包含字母、数字和下划线。它们被隐式转换为大写。

带引号的标识符，例如 `"Employee Name"` ，以双引号开头和结尾。它们几乎可以包含任何字符，包括空格和其他标点符号。如果您希望在标识符中包含双引号，请使用另一个双引号对其进行转义，例如：`"An employee called ""Fred""."`。

在 Calcite 中，将标识符与引用对象的名称匹配是区分大小写的。但请记住，未加引号的标识符在匹配之前会隐式转换为大写，并且如果它引用的对象是使用未加引号的标识符作为其名称创建的，则其名称也将转换为大写。

## 数据类型

### 标量类型

| 数据类型                          | 描述                         | 范围和示例字面量                                             |
| :-------------------------------- | :--------------------------- | :----------------------------------------------------------- |
| BOOLEAN                           | 逻辑值                       | 值：TRUE, FALSE, UNKNOWN                                     |
| TINYINT                           | 1 字节有符号整数             | 范围是 -128 到 127                                           |
| SMALLINT                          | 2 字节有符号整数             | 范围为 -32768 至 32767                                       |
| INTEGER, INT                      | 4 字节有符号整数             | 范围为 -2147483648 至 2147483647                             |
| BIGINT                            | 8 字节有符号整数             | 范围为 -9223372036854775808 至 9223372036854775807           |
| DECIMAL(p, s)                     | 定点数（即：小数点位置固定） | 示例：123.45 和 DECIMAL '123.45' 是相同的值，并且类型为 DECIMAL(5, 2) |
| NUMERIC(p, s)                     | 定点数（即：小数点位置固定） | DECIMAL 的同义词                                             |
| REAL                              | 4 字节浮点数                 | 6 位小数精度；示例：CAST(1.2 AS REAL)、CAST('Infinity' AS REAL) |
| DOUBLE                            | 8 字节浮点数                 | 15 位小数精度；示例：1.4E2、CAST('-Infinity' AS DOUBLE)、CAST('NaN' AS DOUBLE) |
| FLOAT                             | 8 字节浮点数                 | DOUBLE 的同义词                                              |
| CHAR(n), CHARACTER(n)             | 定宽字符串                   | 'Hello'、''（空字符串）、_latin1'Hello'、n'Hello'、_UTF16'Hello'、'Hello' 'there'（字面量分为多个部分）、e'Hello\nthere'（字面量包含 C 风格的转义符） |
| VARCHAR(n), CHARACTER VARYING(n)  | 变长字符串                   | 作为 CHAR(n)                                                 |
| BINARY(n)                         | 固定宽度的二进制字符串       | x'45F0AB'、x''（空二进制字符串）、x'AB' 'CD'（多部分二进制字符串字面量） |
| VARBINARY(n), BINARY VARYING(n)   | 变长二进制字符串             | 作为 BINARY(n)                                               |
| DATE                              | 日期                         | 示例：DATE “1969-07-20”                                      |
| TIME                              | 一天中的时间                 | 示例：TIME “20:17:40”                                        |
| TIMESTAMP [ WITHOUT TIME ZONE ]   | 日期和时间                   | 示例：TIMESTAMP '1969-07-20 20:17:40'                        |
| TIMESTAMP WITH LOCAL TIME ZONE    | 带有当地时区的日期和时间     | 示例：TIMESTAMP ‘1969-07-20 20:17:40 America/Los Angeles’    |
| TIMESTAMP WITH TIME ZONE          | 带时区的日期和时间           | 示例：TIMESTAMP ‘1969-07-20 20:17:40 America/Los Angeles’    |
| INTERVAL timeUnit [ TO timeUnit ] | 日期时间间隔                 | 示例：INTERVAL ‘1-5’ YEAR TO MONTH, INTERVAL ‘45’ DAY, INTERVAL ‘1 2:34:56.789’ DAY TO SECOND |
| GEOMETRY                          | 几何类型                     | 示例： ST_GeomFromText('POINT (30 10)')                      |

`timeUnit` 包含了以后可选值：

```sql
timeUnit:
  MILLENNIUM | CENTURY | DECADE | YEAR | QUARTER | MONTH | WEEK | DOY | DOW | DAY | HOUR | MINUTE | SECOND | EPOCH
```

注意：

- DATE、TIME 和 TIMESTAMP 没有时区。对于这些类型，甚至没有隐式时区，例如 UTC（如 Java 中）或本地时区。由用户或应用程序提供时区。反过来，TIMESTAMP WITH LOCAL TIME ZONE 不会在内部存储时区，但它将依赖于提供的时区来提供正确的语义。
- 仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#allowGeometry--)中才允许使用几何类型。
- 间隔字面量只能使用时间单位 YEAR、QUARTER、MONTH、WEEK、DAY、HOUR、MINUTE 和 SECOND。在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#allowPluralTimeUnits--)中，我们还允许使用复数形式：YEARS、QUARTERS、MONTHS、WEEKS、DAYS、HOURS、MINUTES 和 SECONDS。

### 非标量类型

TODO

| 类型     | 描述                                                       | 示例文字                              |
| :------- | :--------------------------------------------------------- | :------------------------------------ |
| 任何     | 所有类型的联合                                             |                                       |
| 未知     | 未知类型的值；用作占位符                                   |                                       |
| 排       | 具有 1 列或多列的行                                        | Example: row(f0 int null, f1 varchar) |
| MAP      | Collection of keys mapped to values                        | Example: (int, varchar) map           |
| MULTISET | Unordered collection that may contain duplicates           | Example: int multiset                 |
| ARRAY    | Ordered, contiguous collection that may contain duplicates | Example: varchar(10) array            |
| CURSOR   | Cursor over the result of executing a query                |                                       |

Note:

- Every `ROW` column type can have an optional [ NULL | NOT NULL ] suffix to indicate if this column type is nullable, default is not nullable.

### 空间类型

Spatial data is represented as character strings encoded as [well-known text (WKT)](https://en.wikipedia.org/wiki/Well-known_text) or binary strings encoded as [well-known binary (WKB)](https://en.wikipedia.org/wiki/Well-known_binary).

Where you would use a literal, apply the `ST_GeomFromText` function, for example `ST_GeomFromText('POINT (30 10)')`.

| DATA TYPE          | TYPE CODE | EXAMPLES IN WKT                                              |
| :----------------- | :-------- | :----------------------------------------------------------- |
| GEOMETRY           | 0         | generalization of Point, Curve, Surface, GEOMETRYCOLLECTION  |
| POINT              | 1         | `ST_GeomFromText('POINT (30 10)')` is a point in 2D space; `ST_GeomFromText('POINT Z(30 10 2)')` is point in 3D space |
| CURVE              | 13        | generalization of LINESTRING                                 |
| LINESTRING         | 2         | `ST_GeomFromText('LINESTRING (30 10, 10 30, 40 40)')`        |
| SURFACE            | 14        | generalization of Polygon, PolyhedralSurface                 |
| POLYGON            | 3         | `ST_GeomFromText('POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))')` is a pentagon; `ST_GeomFromText('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))')` is a pentagon with a quadrilateral hole |
| POLYHEDRALSURFACE  | 15        |                                                              |
| GEOMETRYCOLLECTION | 7         | a collection of zero or more GEOMETRY instances; a generalization of MULTIPOINT, MULTILINESTRING, MULTIPOLYGON |
| MULTIPOINT         | 4         | `ST_GeomFromText('MULTIPOINT ((10 40), (40 30), (20 20), (30 10))')` is equivalent to `ST_GeomFromText('MULTIPOINT (10 40, 40 30, 20 20, 30 10)')` |
| MULTICURVE         | -         | generalization of MULTILINESTRING                            |
| MULTILINESTRING    | 5         | `ST_GeomFromText('MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))')` |
| MULTISURFACE       | -         | generalization of MULTIPOLYGON                               |
| MULTIPOLYGON       | 6         | `ST_GeomFromText('MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))')` |

## 运算符和函数

### 运算符优先级

The operator precedence and associativity, highest to lowest.

| OPERATOR                                            | ASSOCIATIVITY |
| :-------------------------------------------------- | :------------ |
| .                                                   | left          |
| ::                                                  | left          |
| [ ] (collection element)                            | left          |
| + - (unary plus, minus)                             | right         |
| * / % \|\|                                          | left          |
| + -                                                 | left          |
| BETWEEN, IN, LIKE, SIMILAR, OVERLAPS, CONTAINS etc. | -             |
| < > = <= >= <> != <=>                               | left          |
| IS NULL, IS FALSE, IS NOT TRUE etc.                 | -             |
| NOT                                                 | right         |
| AND                                                 | left          |
| OR                                                  | left          |

Note that `::`,`<=>` is dialect-specific, but is shown in this table for completeness.

### 比较运算符

| OPERATOR SYNTAX                                   | DESCRIPTION                                                  |
| :------------------------------------------------ | :----------------------------------------------------------- |
| value1 = value2                                   | Equals                                                       |
| value1 <> value2                                  | Not equal                                                    |
| value1 != value2                                  | Not equal (only in certain [conformance levels](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isBangEqualAllowed--)) |
| value1 > value2                                   | Greater than                                                 |
| value1 >= value2                                  | Greater than or equal                                        |
| value1 < value2                                   | Less than                                                    |
| value1 <= value2                                  | Less than or equal                                           |
| value1 <=> value2                                 | Whether two values are equal, treating null values as the same |
| value IS NULL                                     | Whether *value* is null                                      |
| value IS NOT NULL                                 | Whether *value* is not null                                  |
| value1 IS DISTINCT FROM value2                    | Whether two values are not equal, treating null values as the same |
| value1 IS NOT DISTINCT FROM value2                | Whether two values are equal, treating null values as the same |
| value1 BETWEEN value2 AND value3                  | Whether *value1* is greater than or equal to *value2* and less than or equal to *value3* |
| value1 NOT BETWEEN value2 AND value3              | Whether *value1* is less than *value2* or greater than *value3* |
| string1 LIKE string2 [ ESCAPE string3 ]           | Whether *string1* matches pattern *string2*                  |
| string1 NOT LIKE string2 [ ESCAPE string3 ]       | Whether *string1* does not match pattern *string2*           |
| string1 SIMILAR TO string2 [ ESCAPE string3 ]     | Whether *string1* matches regular expression *string2*       |
| string1 NOT SIMILAR TO string2 [ ESCAPE string3 ] | Whether *string1* does not match regular expression *string2* |
| value IN (value [, value ]*)                      | Whether *value* is equal to a value in a list                |
| value NOT IN (value [, value ]*)                  | Whether *value* is not equal to every value in a list        |
| value IN (sub-query)                              | Whether *value* is equal to a row returned by *sub-query*    |
| value NOT IN (sub-query)                          | Whether *value* is not equal to every row returned by *sub-query* |
| value comparison SOME (sub-query or collection)   | Whether *value* *comparison* at least one row returned by *sub-query* or *collection* |
| value comparison ANY (sub-query or collection)    | Synonym for `SOME`                                           |
| value comparison ALL (sub-query or collection)    | Whether *value* *comparison* every row returned by *sub-query* or *collection* |
| EXISTS (sub-query)                                | Whether *sub-query* returns at least one row                 |
| UNIQUE (sub-query)                                | Whether the rows returned by *sub-query* are unique (ignoring null values) |

```
comp:
      =
  |   <>
  |   >
  |   >=
  |   <
  |   <=
  |   <=>
```

### 逻辑运算符

| OPERATOR SYNTAX        | DESCRIPTION                                                  |
| :--------------------- | :----------------------------------------------------------- |
| boolean1 OR boolean2   | Whether *boolean1* is TRUE or *boolean2* is TRUE             |
| boolean1 AND boolean2  | Whether *boolean1* and *boolean2* are both TRUE              |
| NOT boolean            | Whether *boolean* is not TRUE; returns UNKNOWN if *boolean* is UNKNOWN |
| boolean IS FALSE       | Whether *boolean* is FALSE; returns FALSE if *boolean* is UNKNOWN |
| boolean IS NOT FALSE   | Whether *boolean* is not FALSE; returns TRUE if *boolean* is UNKNOWN |
| boolean IS TRUE        | Whether *boolean* is TRUE; returns FALSE if *boolean* is UNKNOWN |
| boolean IS NOT TRUE    | Whether *boolean* is not TRUE; returns TRUE if *boolean* is UNKNOWN |
| boolean IS UNKNOWN     | Whether *boolean* is UNKNOWN                                 |
| boolean IS NOT UNKNOWN | Whether *boolean* is not UNKNOWN                             |

### 算术运算符和函数

| OPERATOR SYNTAX                 | DESCRIPTION                                                  |
| :------------------------------ | :----------------------------------------------------------- |
| + numeric                       | Returns *numeric*                                            |
| - numeric                       | Returns negative *numeric*                                   |
| numeric1 + numeric2             | Returns *numeric1* plus *numeric2*                           |
| numeric1 - numeric2             | Returns *numeric1* minus *numeric2*                          |
| numeric1 * numeric2             | Returns *numeric1* multiplied by *numeric2*                  |
| numeric1 / numeric2             | Returns *numeric1* divided by *numeric2*                     |
| numeric1 % numeric2             | As *MOD(numeric1, numeric2)* (only in certain [conformance levels](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isPercentRemainderAllowed--)) |
| POWER(numeric1, numeric2)       | Returns *numeric1* raised to the power of *numeric2*         |
| ABS(numeric)                    | Returns the absolute value of *numeric*                      |
| MOD(numeric1, numeric2)         | Returns the remainder (modulus) of *numeric1* divided by *numeric2*. The result is negative only if *numeric1* is negative |
| SQRT(numeric)                   | Returns the square root of *numeric*                         |
| LN(numeric)                     | Returns the natural logarithm (base *e*) of *numeric*        |
| LOG10(numeric)                  | Returns the base 10 logarithm of *numeric*                   |
| EXP(numeric)                    | Returns *e* raised to the power of *numeric*                 |
| CEIL(numeric)                   | Rounds *numeric* up, returning the smallest integer that is greater than or equal to *numeric* |
| FLOOR(numeric)                  | Rounds *numeric* down, returning the largest integer that is less than or equal to *numeric* |
| RAND([seed])                    | Generates a random double between 0 and 1 inclusive, optionally initializing the random number generator with *seed* |
| RAND_INTEGER([seed, ] numeric)  | Generates a random integer between 0 and *numeric* - 1 inclusive, optionally initializing the random number generator with *seed* |
| ACOS(numeric)                   | Returns the arc cosine of *numeric*                          |
| ASIN(numeric)                   | Returns the arc sine of *numeric*                            |
| ATAN(numeric)                   | Returns the arc tangent of *numeric*                         |
| ATAN2(numeric, numeric)         | Returns the arc tangent of the *numeric* coordinates         |
| CBRT(numeric)                   | Returns the cube root of *numeric*                           |
| COS(numeric)                    | Returns the cosine of *numeric*                              |
| COT(numeric)                    | Returns the cotangent of *numeric*                           |
| DEGREES(numeric)                | Converts *numeric* from radians to degrees                   |
| PI()                            | Returns a value that is closer than any other value to *pi*  |
| RADIANS(numeric)                | Converts *numeric* from degrees to radians                   |
| ROUND(numeric1 [, numeric2])    | Rounds *numeric1* to optionally *numeric2* (if not specified 0) places right to the decimal point |
| SIGN(numeric)                   | Returns the signum of *numeric*                              |
| SIN(numeric)                    | Returns the sine of *numeric*                                |
| TAN(numeric)                    | Returns the tangent of *numeric*                             |
| TRUNCATE(numeric1 [, numeric2]) | Truncates *numeric1* to optionally *numeric2* (if not specified 0) places right to the decimal point |

### 字符串运算符和函数

| OPERATOR SYNTAX                                              | DESCRIPTION                                                  |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| string \|\| string                                           | Concatenates two character strings                           |
| CHAR_LENGTH(string)                                          | Returns the number of characters in a character string       |
| CHARACTER_LENGTH(string)                                     | As CHAR_LENGTH(*string*)                                     |
| UPPER(string)                                                | Returns a character string converted to upper case           |
| LOWER(string)                                                | Returns a character string converted to lower case           |
| POSITION(substring IN string)                                | Returns the position of the first occurrence of *substring* in *string* |
| POSITION(substring IN string FROM integer)                   | Returns the position of the first occurrence of *substring* in *string* starting at a given point (not standard SQL) |
| TRIM( { BOTH \| LEADING \| TRAILING } string1 FROM string2)  | Removes the longest string containing only the characters in *string1* from the start/end/both ends of *string1* |
| OVERLAY(string1 PLACING string2 FROM integer [ FOR integer2 ]) | Replaces a substring of *string1* with *string2*             |
| SUBSTRING(string FROM integer)                               | Returns a substring of a character string starting at a given point |
| SUBSTRING(string FROM integer FOR integer)                   | Returns a substring of a character string starting at a given point with a given length |
| INITCAP(string)                                              | Returns *string* with the first letter of each word converter to upper case and the rest to lower case. Words are sequences of alphanumeric characters separated by non-alphanumeric characters. |

Not implemented:

- SUBSTRING(string FROM regexp FOR regexp)

### 二进制字符串运算符和函数

| OPERATOR SYNTAX                                              | DESCRIPTION                                                  |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| binary \|\| binary                                           | Concatenates two binary strings                              |
| OCTET_LENGTH(binary)                                         | Returns the number of bytes in *binary*                      |
| POSITION(binary1 IN binary2)                                 | Returns the position of the first occurrence of *binary1* in *binary2* |
| POSITION(binary1 IN binary2 FROM integer)                    | Returns the position of the first occurrence of *binary1* in *binary2* starting at a given point (not standard SQL) |
| OVERLAY(binary1 PLACING binary2 FROM integer [ FOR integer2 ]) | Replaces a substring of *binary1* with *binary2*             |
| SUBSTRING(binary FROM integer)                               | Returns a substring of *binary* starting at a given point    |
| SUBSTRING(binary FROM integer FOR integer)                   | Returns a substring of *binary* starting at a given point with a given length |

### 日期/时间函数

| OPERATOR SYNTAX                                | DESCRIPTION                                                  |
| :--------------------------------------------- | :----------------------------------------------------------- |
| LOCALTIME                                      | Returns the current date and time in the session time zone in a value of datatype TIME |
| LOCALTIME(precision)                           | Returns the current date and time in the session time zone in a value of datatype TIME, with *precision* digits of precision |
| 本地时间戳                                     | 以数据类型 TIMESTAMP 的值返回会话时区中的当前日期和时间      |
| 本地时间戳（精度）                             | 以数据类型 TIMESTAMP 的值返回会话时区中的当前日期和时间，精度为*precision* |
| 当前时间                                       | 返回会话时区中的当前时间，采用数据类型 TIMESTAMP WITH TIME ZONE 的值 |
| 当前日期                                       | 以数据类型 DATE 的值返回会话时区中的当前日期                 |
| CURRENT_TIMESTAMP                              | 返回会话时区中的当前日期和时间，采用数据类型 TIMESTAMP WITH TIME ZONE 的值 |
| EXTRACT(timeUnit FROM 日期时间)                | 从日期时间值表达式中提取并返回指定日期时间字段的值           |
| FLOOR(日期时间 TO 时间单位)                    | 将*日期时间*向下舍入为*timeUnit*                             |
| CEIL(日期时间 TO 时间单位)                     | 将*日期时间*向上舍入到*timeUnit*                             |
| 年（日期）                                     | 相当于`EXTRACT(YEAR FROM date)`。返回一个整数。              |
| 季度（日期）                                   | 相当于`EXTRACT(QUARTER FROM date)`。返回 1 到 4 之间的整数。 |
| 月（日期）                                     | 相当于`EXTRACT(MONTH FROM date)`。返回 1 到 12 之间的整数。  |
| 周（日期）                                     | 相当于`EXTRACT(WEEK FROM date)`。返回 1 到 53 之间的整数。   |
| 当年某日（日期）                               | 相当于`EXTRACT(DOY FROM date)`。返回 1 到 366 之间的整数。   |
| 某月某日（日期）                               | 相当于`EXTRACT(DAY FROM date)`。返回 1 到 31 之间的整数。    |
| 星期几（日期）                                 | 相当于`EXTRACT(DOW FROM date)`。返回 1 到 7 之间的整数。     |
| 小时（日期）                                   | 相当于`EXTRACT(HOUR FROM date)`。返回 0 到 23 之间的整数。   |
| 分钟（日期）                                   | 相当于`EXTRACT(MINUTE FROM date)`。返回 0 到 59 之间的整数。 |
| 第二（日期）                                   | 相当于`EXTRACT(SECOND FROM date)`。返回 0 到 59 之间的整数。 |
| TIMESTAMPADD（时间单位，整数，日期时间）       | 返回添加了（有符号）*整数**timeUnit*间隔的*日期时间*。相当于 `datetime + INTERVAL 'integer' timeUnit` |
| TIMESTAMPDIFF（时间单位，日期时间，日期时间2） | *返回datetime*和*datetime2之间的**timeUnit*间隔数（有符号）。相当于`(datetime2 - datetime) timeUnit` |
| LAST_DAY（日期）                               | 以数据类型 DATE 的值返回该月最后一天的日期；例如，对于 DATE'2020-02-10' 和 TIMESTAMP'2020-02-10 10:10:10' 均返回 DATE'2020-02-29' |

对 niladic 函数的调用（例如，`CURRENT_DATE`在标准 SQL 中不接受括号）。带括号的调用，例如在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#allowNiladicParentheses--)`CURRENT_DATE()`中被接受 。

未实现：

- CEIL(间隔)
- 楼层（间隔）
- \+ 间隔
- \- 间隔
- 间隔+间隔
- 间隔-间隔
- 间隔/间隔

### 系统函数

| 运算符语法     | 描述                                                       |
| :------------- | :--------------------------------------------------------- |
| 用户           | 相当于 CURRENT_USER                                        |
| 当前用户       | 当前执行上下文的用户名                                     |
| SESSION_USER   | 会话用户名                                                 |
| 系统用户       | 返回操作系统识别的当前数据存储用户的名称                   |
| 当前_路径      | 返回一个字符串，表示当前查找范围以引用用户定义的例程和类型 |
| 当前角色       | 返回当前活动角色                                           |
| CURRENT_SCHEMA | 返回当前模式                                               |

### 条件函数和运算符

| 运算符语法                                                   | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| CASE 值 WHEN value1 [, value11 ]* THEN result1 [ WHEN valueN [, valueN1 ]* THEN resultN ]* [ ELSE resultZ ] END | 简单案例                                                     |
| CASE WHEN 条件 1 THEN 结果 1 [ WHEN 条件 N THEN 结果 N ]* [ ELSE 结果 Z ] END | 搜索案例                                                     |
| NULLIF（值，值）                                             | 如果值相同则返回 NULL。  例如，`NULLIF(5, 5)`返回NULL；`NULLIF(5, 0)`返回 5。 |
| COALESCE(值, 值[, 值]*)                                      | 如果第一个值为 null，则提供一个值。  例如，`COALESCE(NULL, 5)`返回 5。 |

### 类型转换

通常，表达式不能包含不同数据类型的值。例如，表达式不能将 5 乘以 10，然后添加“JULIAN”。但是，Calcite 支持将值从一种数据类型隐式和显式转换为另一种数据类型。

#### 隐式和显式类型转换

Calcite 建议您指定显式转换，而不是依赖隐式或自动转换，原因如下：

- 使用显式数据类型转换函数时，SQL 语句更容易理解。
- 隐式数据类型转换可能会对性能产生负面影响，尤其是当列值的数据类型转换为常量数据类型而不是相反时。
- 隐式转换取决于它发生的上下文，并且在每种情况下可能不会以相同的方式工作。例如，从日期时间值到 VARCHAR 值的隐式转换可能会返回意外的格式。

隐式转换的算法可能会在 Calcite 版本之间发生变化。显式转换的行为更可预测。

#### 显式类型转换

| 运算符语法                          | 描述                                            |
| :---------------------------------- | :---------------------------------------------- |
| CAST（值 AS 类型）                  | 将值转换为给定类型。整数类型之间的转换朝 0 截断 |
| CONVERT（字符串，字符集1，字符集2） | *将字符串*从*charSet1*转换为*charSet2*          |
| CONVERT（使用转码名称的值）         | 将*值*从一种基本字符集更改为*transcodingName*   |
| TRANSLATE（值使用转码名称）         | 将*值*从一种基本字符集更改为*transcodingName*   |

支持的数据类型语法：

```
type:
      typeName
      [ collectionsTypeName ]*

typeName:
      sqlTypeName
  |   rowTypeName
  |   compoundIdentifier

sqlTypeName:
      char [ precision ] [ charSet ]
  |   varchar [ precision ] [ charSet ]
  |   DATE
  |   time
  |   timestamp
  |   GEOMETRY
  |   decimal [ precision [, scale] ]
  |   BOOLEAN
  |   integer
  |   BINARY [ precision ]
  |   varbinary [ precision ]
  |   TINYINT
  |   SMALLINT
  |   BIGINT
  |   REAL
  |   double
  |   FLOAT
  |   ANY [ precision [, scale] ]

collectionsTypeName:
      ARRAY | MULTISET

rowTypeName:
      ROW '('
      fieldName1 fieldType1 [ NULL | NOT NULL ]
      [ , fieldName2 fieldType2 [ NULL | NOT NULL ] ]*
      ')'

char:
      CHARACTER | CHAR

varchar:
      char VARYING | VARCHAR

decimal:
      DECIMAL | DEC | NUMERIC

integer:
      INTEGER | INT

varbinary:
      BINARY VARYING | VARBINARY

double:
      DOUBLE [ PRECISION ]

time:
      TIME [ precision ] [ timeZone ]

timestamp:
      TIMESTAMP [ precision ] [ timeZone ]

charSet:
      CHARACTER SET charSetName

timeZone:
      WITHOUT TIME ZONE
  |   WITH LOCAL TIME ZONE
```

#### 隐式类型转换

当转换有意义时，方解石会自动将值从一种数据类型转换为另一种数据类型。下表是方解石类型转换的矩阵。该表显示了所有可能的转换，而不考虑进行转换的上下文。管理这些细节的规则如下表所示。

| 从到               | 无效的 | 布尔值 | 天音 | 小智 | INT  | BIGINT | 十进制 | 浮点数或实数 | 双倍的 | 间隔 | 日期 | 时间 | 时间戳 | CHAR 或 VARCHAR | 二进制或 VARBINARY | 几何学 | 大批 |
| :----------------- | :----- | :----- | :--- | :--- | :--- | :----- | :----- | :----------- | :----- | :--- | :--- | :--- | :----- | :-------------- | :----------------- | :----- | :--- |
| 无效的             | 我     | 我     | 我   | 我   | 我   | 我     | 我     | 我           | 我     | 我   | 我   | 我   | 我     | 我              | 我                 | 我     | X    |
| 布尔值             | X      | 我     | X    | X    | X    | X      | X      | X            | X      | X    | X    | X    | X      | 我              | X                  | X      | X    |
| 天音               | X      | e      | 我   | 我   | 我   | 我     | 我     | 我           | 我     | e    | X    | X    | e      | 我              | X                  | X      | X    |
| 小智               | X      | e      | 我   | 我   | 我   | 我     | 我     | 我           | 我     | e    | X    | X    | e      | 我              | X                  | X      | X    |
| INT                | X      | e      | 我   | 我   | 我   | 我     | 我     | 我           | 我     | e    | X    | X    | e      | 我              | X                  | X      | X    |
| BIGINT             | X      | e      | 我   | 我   | 我   | 我     | 我     | 我           | 我     | e    | X    | X    | e      | 我              | X                  | X      | X    |
| 十进制             | X      | e      | 我   | 我   | 我   | 我     | 我     | 我           | 我     | e    | X    | X    | e      | 我              | X                  | X      | X    |
| 浮点/实数          | X      | e      | 我   | 我   | 我   | 我     | 我     | 我           | 我     | X    | X    | X    | e      | 我              | X                  | X      | X    |
| 双倍的             | X      | e      | 我   | 我   | 我   | 我     | 我     | 我           | 我     | X    | X    | X    | e      | 我              | X                  | X      | X    |
| 间隔               | X      | X      | e    | e    | e    | e      | e      | X            | X      | 我   | X    | X    | X      | e               | X                  | X      | X    |
| 日期               | X      | X      | X    | X    | X    | X      | X      | X            | X      | X    | 我   | X    | 我     | 我              | X                  | X      | X    |
| 时间               | X      | X      | X    | X    | X    | X      | X      | X            | X      | X    | X    | 我   | e      | 我              | X                  | X      | X    |
| 时间戳             | X      | X      | e    | e    | e    | e      | e      | e            | e      | X    | 我   | e    | 我     | 我              | X                  | X      | X    |
| CHAR 或 VARCHAR    | X      | e      | 我   | 我   | 我   | 我     | 我     | 我           | 我     | 我   | 我   | 我   | 我     | 我              | 我                 | 我     | 我   |
| 二进制或 VARBINARY | X      | X      | X    | X    | X    | X      | X      | X            | X      | X    | e    | e    | e      | 我              | 我                 | X      | X    |
| 几何学             | X      | X      | X    | X    | X    | X      | X      | X            | X      | X    | X    | X    | X      | 我              | X                  | 我     | X    |
| 大批               | X      | X      | X    | X    | X    | X      | X      | X            | X      | X    | X    | X    | X      | X               | X                  | X      | 我   |

i：隐式转换 / e：显式转换 / x：不允许

##### 转化背景和策略

- Set operation (`UNION`, `EXCEPT`, `INTERSECT`): compare every branch row data type and find the common type of each fields pair;
- Binary arithmetic expression (`+`, `-`, `&`, `^`, `/`, `%`): promote string operand to data type of the other numeric operand;
- Binary comparison (`=`, `<`, `<=`, `<>`, `>`, `>=`): if operands are `STRING` and `TIMESTAMP`, promote to `TIMESTAMP`; make `1 = true` and `0 = false` always evaluate to `TRUE`; if there is numeric type operand, find common type for both operands.
- `IN` sub-query: compare type of LHS and RHS, and find the common type; if it is struct type, find wider type for every field;
- `IN` expression list: compare every expression to find the common type;
- `CASE WHEN` expression or `COALESCE`: find the common wider type of the `THEN` and `ELSE` operands;
- Character + `INTERVAL` or character - `INTERVAL`: promote character to `TIMESTAMP`;
- Built-in function: look up the type families registered in the checker, find the family default type if checker rules allow it;
- User-defined function (UDF): coerce based on the declared argument types of the `eval()` method;
- `INSERT` and `UPDATE`: coerce a source field to counterpart target table field’s type if the two fields differ with type name or precision(scale).

Note:

Implicit type coercion of following cases are ignored:

- One of the type is `ANY`;
- Type coercion within `CHARACTER` types are always ignored, i.e. from `CHAR(20)` to `VARCHAR(30)`;
- Type coercion from a numeric to another with higher precedence is ignored, i.e. from `INT` to `LONG`.

##### 寻找共同类型的策略

- If the operator has expected data types, just take them as the desired one. (e.g. the UDF would have `eval()` method which has reflection argument types);
- If there is no expected data type but the data type families are registered, try to coerce the arguments to the family’s default data type, i.e. the String family will have a `VARCHAR` type;
- If neither expected data type nor families are specified, try to find the tightest common type of the node types, i.e. `INTEGER` and `DOUBLE` will return `DOUBLE`, the numeric precision does not lose for this case;
- If no tightest common type is found, try to find a wider type, i.e. `VARCHAR` and `INTEGER` will return `INTEGER`, we allow some precision loss when widening decimal to fractional, or promote to `VARCHAR` type.

### 值构造函数

| OPERATOR SYNTAX                         | DESCRIPTION                                                  |
| :-------------------------------------- | :----------------------------------------------------------- |
| ROW (value [, value ]*)                 | Creates a row from a list of values.                         |
| (value [, value ]* )                    | Creates a row from a list of values.                         |
| row ‘[’ index ‘]’                       | Returns the element at a particular location in a row (1-based index). |
| row ‘[’ name ‘]’                        | Returns the element of a row with a particular name.         |
| map ‘[’ key ‘]’                         | Returns the element of a map with a particular key.          |
| array ‘[’ index ‘]’                     | Returns the element at a particular location in an array (1-based index). |
| ARRAY ‘[’ value [, value ]* ‘]’         | Creates an array from a list of values.                      |
| MAP ‘[’ key, value [, key, value ]* ‘]’ | Creates a map from a list of key-value pairs.                |

### 集合函数

| OPERATOR SYNTAX                                           | DESCRIPTION                                                  |
| :-------------------------------------------------------- | :----------------------------------------------------------- |
| ELEMENT(value)                                            | Returns the sole element of an array or multiset; null if the collection is empty; throws if it has more than one element. |
| CARDINALITY(value)                                        | Returns the number of elements in an array or multiset.      |
| value MEMBER OF multiset                                  | Returns whether the *value* is a member of *multiset*.       |
| multiset IS A SET                                         | Whether *multiset* is a set (has no duplicates).             |
| multiset IS NOT A SET                                     | Whether *multiset* is not a set (has duplicates).            |
| multiset IS EMPTY                                         | Whether *multiset* contains zero elements.                   |
| multiset IS NOT EMPTY                                     | Whether *multiset* contains one or more elements.            |
| multiset SUBMULTISET OF multiset2                         | Whether *multiset* is a submultiset of *multiset2*.          |
| multiset NOT SUBMULTISET OF multiset2                     | Whether *multiset* is not a submultiset of *multiset2*.      |
| multiset MULTISET UNION [ ALL \| DISTINCT ] multiset2     | Returns the union *multiset* and *multiset2*, eliminating duplicates if DISTINCT is specified (ALL is the default). |
| multiset MULTISET INTERSECT [ ALL \| DISTINCT ] multiset2 | Returns the intersection of *multiset* and *multiset2*, eliminating duplicates if DISTINCT is specified (ALL is the default). |
| multiset MULTISET EXCEPT [ ALL \| DISTINCT ] multiset2    | Returns the difference of *multiset* and *multiset2*, eliminating duplicates if DISTINCT is specified (ALL is the default). |

See also: the UNNEST relational operator converts a collection to a relation.

### 句点谓词

| OPERATOR SYNTAX                      | DESCRIPTION |
| ------------------------------------ | ----------- |
| period1 CONTAINS datetime            |             |
| period1 CONTAINS period2             |             |
| period1 OVERLAPS period2             |             |
| period1 EQUALS period2               |             |
| period1 PRECEDES period2             |             |
| period1 IMMEDIATELY PRECEDES period2 |             |
| period1 SUCCEEDS period2             |             |
| period1 IMMEDIATELY SUCCEEDS period2 |             |

Where *period1* and *period2* are period expressions:

```
period:
      (datetime, datetime)
  |   (datetime, interval)
  |   PERIOD (datetime, datetime)
  |   PERIOD (datetime, interval)
```

### JDBC 函数转义

#### 数字

| OPERATOR SYNTAX                   | DESCRIPTION                                                  |
| :-------------------------------- | :----------------------------------------------------------- |
| {fn ABS(numeric)}                 | Returns the absolute value of *numeric*                      |
| {fn ACOS(numeric)}                | Returns the arc cosine of *numeric*                          |
| {fn ASIN(numeric)}                | Returns the arc sine of *numeric*                            |
| {fn ATAN(numeric)}                | Returns the arc tangent of *numeric*                         |
| {fn ATAN2(numeric, numeric)}      | Returns the arc tangent of the *numeric* coordinates         |
| {fn CBRT(numeric)}                | Returns the cube root of *numeric*                           |
| {fn CEILING(numeric)}             | Rounds *numeric* up, and returns the smallest number that is greater than or equal to *numeric* |
| {fn COS(numeric)}                 | Returns the cosine of *numeric*                              |
| {fn COT(numeric)}                 | Returns the cotangent of *numeric*                           |
| {fn DEGREES(numeric)}             | Converts *numeric* from radians to degrees                   |
| {fn EXP(numeric)}                 | Returns *e* raised to the power of *numeric*                 |
| {fn FLOOR(numeric)}               | Rounds *numeric* down, and returns the largest number that is less than or equal to *numeric* |
| {fn LOG(numeric)}                 | Returns the natural logarithm (base *e*) of *numeric*        |
| {fn LOG10(numeric)}               | Returns the base-10 logarithm of *numeric*                   |
| {fn MOD(numeric1, numeric2)}      | Returns the remainder (modulus) of *numeric1* divided by *numeric2*. The result is negative only if *numeric1* is negative |
| {fn PI()}                         | Returns a value that is closer than any other value to *pi*  |
| {fn POWER(numeric1, numeric2)}    | Returns *numeric1* raised to the power of *numeric2*         |
| {fn RADIANS(numeric)}             | Converts *numeric* from degrees to radians                   |
| {fn RAND(numeric)}                | Returns a random double using *numeric* as the seed value    |
| {fn ROUND(numeric1, numeric2)}    | Rounds *numeric1* to *numeric2* places right to the decimal point |
| {fn SIGN(numeric)}                | Returns the signum of *numeric*                              |
| {fn SIN(numeric)}                 | Returns the sine of *numeric*                                |
| {fn SQRT(numeric)}                | Returns the square root of *numeric*                         |
| {fn TAN(numeric)}                 | Returns the tangent of *numeric*                             |
| {fn TRUNCATE(numeric1, numeric2)} | Truncates *numeric1* to *numeric2* places right to the decimal point |

#### 字符串

| OPERATOR SYNTAX                              | DESCRIPTION                                                  |
| :------------------------------------------- | :----------------------------------------------------------- |
| {fn ASCII(string)}                           | Returns the ASCII code of the first character of *string*; if the first character is a non-ASCII character, returns its Unicode code point; returns 0 if *string* is empty |
| {fn CHAR(integer)}                           | Returns the character whose ASCII code is *integer* % 256, or null if *integer* < 0 |
| {fn CONCAT(character, character)}            | Returns the concatenation of character strings               |
| {fn INSERT(string1, start, length, string2)} | Inserts *string2* into a slot in *string1*                   |
| {fn LCASE(string)}                           | Returns a string in which all alphabetic characters in *string* have been converted to lower case |
| {fn LENGTH(string)}                          | Returns the number of characters in a string                 |
| {fn LOCATE(string1, string2 [, integer])}    | Returns the position in *string2* of the first occurrence of *string1*. Searches from the beginning of *string2*, unless *integer* is specified. |
| {fn LEFT(string, length)}                    | Returns the leftmost *length* characters from *string*       |
| {fn LTRIM(string)}                           | Returns *string* with leading space characters removed       |
| {fn REPLACE(string, search, replacement)}    | Returns a string in which all the occurrences of *search* in *string* are replaced with *replacement*; if *replacement* is the empty string, the occurrences of *search* are removed |
| {fn REVERSE(string)}                         | Returns *string* with the order of the characters reversed   |
| {fn RIGHT(string, length)}                   | Returns the rightmost *length* characters from *string*      |
| {fn RTRIM(string)}                           | Returns *string* with trailing space characters removed      |
| {fn SUBSTRING(string, offset, length)}       | Returns a character string that consists of *length* characters from *string* starting at the *offset* position |
| {fn UCASE(string)}                           | Returns a string in which all alphabetic characters in *string* have been converted to upper case |

#### 日期/时间

| OPERATOR SYNTAX                                      | DESCRIPTION                                                  |
| :--------------------------------------------------- | :----------------------------------------------------------- |
| {fn CURDATE()}                                       | Equivalent to `CURRENT_DATE`                                 |
| {fn CURTIME()}                                       | Equivalent to `LOCALTIME`                                    |
| {fn NOW()}                                           | Equivalent to `LOCALTIMESTAMP`                               |
| {fn YEAR(date)}                                      | Equivalent to `EXTRACT(YEAR FROM date)`. Returns an integer. |
| {fn QUARTER(date)}                                   | Equivalent to `EXTRACT(QUARTER FROM date)`. Returns an integer between 1 and 4. |
| {fn MONTH(date)}                                     | Equivalent to `EXTRACT(MONTH FROM date)`. Returns an integer between 1 and 12. |
| {fn WEEK(date)}                                      | Equivalent to `EXTRACT(WEEK FROM date)`. Returns an integer between 1 and 53. |
| {fn DAYOFYEAR(date)}                                 | Equivalent to `EXTRACT(DOY FROM date)`. Returns an integer between 1 and 366. |
| {fn DAYOFMONTH(date)}                                | Equivalent to `EXTRACT(DAY FROM date)`. Returns an integer between 1 and 31. |
| {fn DAYOFWEEK(date)}                                 | Equivalent to `EXTRACT(DOW FROM date)`. Returns an integer between 1 and 7. |
| {fn HOUR(date)}                                      | Equivalent to `EXTRACT(HOUR FROM date)`. Returns an integer between 0 and 23. |
| {fn MINUTE(date)}                                    | Equivalent to `EXTRACT(MINUTE FROM date)`. Returns an integer between 0 and 59. |
| {fn SECOND(date)}                                    | Equivalent to `EXTRACT(SECOND FROM date)`. Returns an integer between 0 and 59. |
| {fn TIMESTAMPADD(timeUnit, count, datetime)}         | Adds an interval of *count* *timeUnit*s to a datetime        |
| {fn TIMESTAMPDIFF(timeUnit, timestamp1, timestamp2)} | Subtracts *timestamp1* from *timestamp2* and returns the result in *timeUnit*s |

#### 系统

| OPERATOR SYNTAX             | DESCRIPTION                      |
| :-------------------------- | :------------------------------- |
| {fn DATABASE()}             | Equivalent to `CURRENT_CATALOG`  |
| {fn IFNULL(value1, value2)} | Returns value2 if value1 is null |
| {fn USER()}                 | Equivalent to `CURRENT_USER`     |

#### 转换

| OPERATOR SYNTAX           | DESCRIPTION              |
| :------------------------ | :----------------------- |
| {fn CONVERT(value, type)} | Cast *value* into *type* |

### 聚合函数

Syntax:

```
aggregateCall:
      agg '(' [ ALL | DISTINCT ] value [, value ]* ')'
      [ WITHIN DISTINCT '(' expression [, expression ]* ')' ]
      [ WITHIN GROUP '(' ORDER BY orderItem [, orderItem ]* ')' ]
      [ FILTER '(' WHERE condition ')' ]
  |   agg '(' '*' ')' [ FILTER (WHERE condition) ]
```

其中*agg*是下表中的运算符之一，或者是用户定义的聚合函数。

如果`FILTER`存在，则聚合函数仅考虑 *条件*评估为 TRUE 的行。

如果`DISTINCT`存在，则在传递给聚合函数之前消除重复的参数值。

如果`WITHIN DISTINCT`存在，则在传递给聚合函数之前，参数值在指定键的每个值中都是不同的。

如果`WITHIN GROUP`存在，则聚合函数在聚合值之前根据`ORDER BY`内部子句对输入行进行排序`WITHIN GROUP`。`WITHIN GROUP`仅允许用于假设集合函数 ( `RANK`、 `DENSE_RANK`和)、逆分布函数 (`PERCENT_RANK`和)和集合函数 ( 和)。`CUME_DIST``PERCENTILE_CONT``PERCENTILE_DISC``COLLECT``LISTAGG`

| 运算符语法                                        | 描述                                                         |
| :------------------------------------------------ | :----------------------------------------------------------- |
| ANY_VALUE（[ 全部 \| DISTINCT ] 值）              | 返回所有输入值中*value*的值之一；SQL 标准中没有指定这一点    |
| ARG_MAX（值，补偿）                               | 返回组中*comp*的*最大值*                                     |
| ARG_MIN（值，补偿）                               | 返回组中*comp*的*最小值*                                     |
| APPROX_COUNT_DISTINCT（值[，值]*）                | *返回value*的不同值的近似数量；数据库可以使用近似值，但不要求 |
| AVG（[ ALL \| DISTINCT ] 数字）                   | 返回所有输入值的*平均值（算术平均值）*                       |
| BIT_AND（[ 全部 \| DISTINCT ] 值）                | 返回所有非空输入值的按位与，如果没有则返回 null；支持整数和二进制类型 |
| BIT_OR( [ 全部 \| DISTINCT ] 值)                  | 返回所有非空输入值的按位或，如果没有则返回 null；支持整数和二进制类型 |
| BIT_XOR（[全部\|不同]值）                         | 返回所有非空输入值的按位异或，如果没有则返回 null；支持整数和二进制类型 |
| 收集（[全部\|不同]值）                            | 返回值的多重集                                               |
| 数数（*）                                         | 返回输入行数                                                 |
| COUNT([ 全部 \| DISTINCT ] 值 [, 值 ]*)           | *返回值*不为空的输入行数（如果*值*是复合值则完全不为空）     |
| COVAR_POP（数字1，数字2）                         | *返回所有输入值对 ( numeric1* , *numeric2* )的总体协方差     |
| COVAR_SAMP（数字1，数字2）                        | *返回所有输入值对 ( numeric1* , *numeric2* )的样本协方差     |
| 每个（条件）                                      | *如果条件*的所有值都为TRUE，则返回 TRUE                      |
| FUSION(多组)                                      | Returns the multiset union of *multiset* across all input values |
| INTERSECTION(multiset)                            | Returns the multiset intersection of *multiset* across all input values |
| LISTAGG( [ ALL \| DISTINCT ] value [, separator]) | Returns values concatenated into a string, delimited by separator (default ‘,’) |
| MAX( [ ALL \| DISTINCT ] value)                   | Returns the maximum value of *value* across all input values |
| MIN( [ ALL \| DISTINCT ] value)                   | Returns the minimum value of *value* across all input values |
| MODE(value)                                       | Returns the most frequent value of *value* across all input values |
| REGR_COUNT(numeric1, numeric2)                    | Returns the number of rows where both dependent and independent expressions are not null |
| REGR_SXX(numeric1, numeric2)                      | Returns the sum of squares of the dependent expression in a linear regression model |
| REGR_SYY(numeric1, numeric2)                      | Returns the sum of squares of the independent expression in a linear regression model |
| SOME(condition)                                   | Returns TRUE if one or more of the values of *condition* is TRUE |
| STDDEV( [ ALL \| DISTINCT ] numeric)              | Synonym for `STDDEV_SAMP`                                    |
| STDDEV_POP( [ ALL \| DISTINCT ] numeric)          | Returns the population standard deviation of *numeric* across all input values |
| STDDEV_SAMP( [ ALL \| DISTINCT ] numeric)         | Returns the sample standard deviation of *numeric* across all input values |
| SUM( [ ALL \| DISTINCT ] numeric)                 | Returns the sum of *numeric* across all input values         |
| VAR_POP( [ ALL \| DISTINCT ] value)               | Returns the population variance (square of the population standard deviation) of *numeric* across all input values |
| VAR_SAMP( [ ALL \| DISTINCT ] numeric)            | Returns the sample variance (square of the sample standard deviation) of *numeric* across all input values |

Not implemented:

- REGR_AVGX(numeric1, numeric2)
- REGR_AVGY(numeric1, numeric2)
- REGR_INTERCEPT(numeric1, numeric2)
- REGR_R2(numeric1, numeric2)
- REGR_SLOPE(numeric1, numeric2)
- REGR_SXY(numeric1, numeric2)

#### 有序集聚合函数

The syntax is as for *aggregateCall*, except that `WITHIN GROUP` is required.

In the following:

- *fraction* is a numeric literal between 0 and 1, inclusive, and represents a percentage

| OPERATOR SYNTAX                                              | DESCRIPTION                                                  |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| PERCENTILE_CONT(fraction) WITHIN GROUP (ORDER BY orderItem)  | Returns a percentile based on a continuous distribution of the column values, interpolating between adjacent input items if needed |
| PERCENTILE_DISC(fraction) WITHIN GROUP (ORDER BY orderItem [, orderItem ]*) | Returns a percentile based on a discrete distribution of the column values returning the first input value whose position in the ordering equals or exceeds the specified fraction |

### 窗口函数

Syntax:

```
windowedAggregateCall:
      agg '(' [ ALL | DISTINCT ] value [, value ]* ')'
      [ RESPECT NULLS | IGNORE NULLS ]
      [ WITHIN GROUP '(' ORDER BY orderItem [, orderItem ]* ')' ]
      [ FILTER '(' WHERE condition ')' ]
      OVER window
  |   agg '(' '*' ')'
      [ FILTER  '(' WHERE condition ')' ]
      OVER window
```

其中*agg*是下表中的运算符之一，或者是用户定义的聚合函数。

`DISTINCT`，`FILTER`并且`WITHIN GROUP`如聚合函数所述。

| 运算符语法                        | 描述                                                         |
| :-------------------------------- | :----------------------------------------------------------- |
| COUNT(值 [, 值 ]*) OVER 窗口      | *返回窗口中**值*不为空的行数（如果值为复合值则完全不为*空*） |
| COUNT(*) OVER 窗口                | *返回窗口*中的行数                                           |
| AVG(数字) OVER 窗口               | *返回窗口*中所有值的*数值*平均值（算术平均值）               |
| SUM(数字) OVER 窗口               | *返回窗口*中所有值的*数值*总和                               |
| MAX(值) OVER 窗口                 | *返回窗口*中所有值*的*最大值                                 |
| MIN(值) OVER 窗口                 | *返回窗口*中所有值*的*最小值                                 |
| RANK() OVER 窗口                  | 返回当前行有间隙的排名；与其第一个对等点的 ROW_NUMBER 相同   |
| DENSE_RANK() 超过窗口             | 返回当前行的排名，没有间隙；该函数对同级组进行计数           |
| ROW_NUMBER() 超过窗口             | 返回其分区内当前行的编号，从 1 开始计数                      |
| FIRST_VALUE(值) 超过窗口          | 返回在窗口框架第一行的行处计算的*值*                         |
| LAST_VALUE(值) 超过窗口           | 返回在窗框最后一行计算的*值*                                 |
| LEAD(值、偏移、默认) OVER 窗口    | 返回在分区内当前行之后的*偏移*行处计算的*值；*如果没有这样的行，则返回*default*。偏移*量*和*默认值*都是相对于当前行进行评估的。如果省略，*offset*默认为 1，*默认*为 NULL |
| LAG(值、偏移量、默认值) OVER 窗口 | 返回在分区内当前行之前的*偏移*行处计算的*值；*如果没有这样的行，则返回*default*。偏移*量*和*默认值*都是相对于当前行进行评估的。如果省略，*offset*默认为 1，*默认*为 NULL |
| NTH_VALUE(值, 第 n) OVER 窗口     | 返回在窗口框架的第*n*行处计算的*值*                          |
| NTILE(value) OVER 窗口            | 返回一个从 1 到*value 的*整数，尽可能均等地划分分区          |

笔记：

- You may specify null treatment (`IGNORE NULLS`, `RESPECT NULLS`) for `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE`, `LEAD` and `LAG` functions. The syntax handled by the parser, but only `RESPECT NULLS` is implemented at runtime.

Not implemented:

- COUNT(DISTINCT value [, value ]*) OVER window
- APPROX_COUNT_DISTINCT(value [, value ]*) OVER window
- PERCENT_RANK(value) OVER window
- CUME_DIST(value) OVER window

### 分组函数

| OPERATOR SYNTAX                          | DESCRIPTION                                                  |
| :--------------------------------------- | :----------------------------------------------------------- |
| GROUPING(expression [, expression ]*)    | Returns a bit vector of the given grouping expressions       |
| GROUP_ID()                               | Returns an integer that uniquely identifies the combination of grouping keys |
| GROUPING_ID(expression [, expression ]*) | Synonym for `GROUPING`                                       |

### 描述符

| OPERATOR SYNTAX             | DESCRIPTION                                                  |
| :-------------------------- | :----------------------------------------------------------- |
| DESCRIPTOR(name [, name ]*) | DESCRIPTOR appears as an argument in a function to indicate a list of names. The interpretation of names is left to the function. |

### 表函数

Table functions occur in the `FROM` clause.

Table functions may have generic table parameters (i.e., no row type is declared when the table function is created), and the row type of the result might depend on the row type(s) of the input tables. Besides, input tables are classified by three characteristics. The first characteristic is semantics. Input tables have either row semantics or set semantics, as follows:

- Row semantics means that the result of the table function depends on a row-by-row basis.
- Set semantics means that the outcome of the function depends on how the data is partitioned.

The second characteristic, which applies only to input tables with set semantics, is whether the table function can generate a result row even if the input table is empty.

- If the table function can generate a result row on empty input, the table is said to be “keep when empty”.
- The alternative is called “prune when empty”, meaning that the result would be pruned out if the input table is empty.

The third characteristic is whether the input table supports pass-through columns or not. Pass-through columns is a mechanism enabling the table function to copy every column of an input row into columns of an output row.

The input tables with set semantics may be partitioned on one or more columns. The input tables with set semantics may be ordered on one or more columns.

Note:

- The input tables with row semantics may not be partitioned or ordered.
- A polymorphic table function may have multiple input tables. However, at most one input table could have row semantics.

#### TUMBLE

In streaming queries, TUMBLE assigns a window for each row of a relation based on a timestamp column. An assigned window is specified by its beginning and ending. All assigned windows have the same length, and that’s why tumbling sometimes is named as “fixed windowing”. The first parameter of the TUMBLE table function is a generic table parameter. The input table has row semantics and supports pass-through columns.

| OPERATOR SYNTAX                                     | DESCRIPTION                                                  |
| :-------------------------------------------------- | :----------------------------------------------------------- |
| TUMBLE(data, DESCRIPTOR(timecol), size [, offset ]) | *指示timecol的**大小*间隔的翻滚窗口，可以选择在*offset*处对齐。 |

这是一个例子：

```
SELECT * FROM TABLE(
  TUMBLE(
    TABLE orders,
    DESCRIPTOR(rowtime),
    INTERVAL '1' MINUTE));

-- or with the named params
-- note: the DATA param must be the first
SELECT * FROM TABLE(
  TUMBLE(
    DATA => TABLE orders,
    TIMECOL => DESCRIPTOR(rowtime),
    SIZE => INTERVAL '1' MINUTE));
```

将范围为一分钟的滚动窗口应用于`orders` 表中的行。`rowtime`是表中带水印的列`orders`，用于通知数据是否完整。

#### 跳

*在流式查询中，HOP 分配覆盖大小*间隔内的行的窗口，并根据时间戳列移动每张*幻灯片。*分配的窗口可能有重叠，因此有时跳跃被称为“滑动窗口”。HOP 表函数的第一个参数是通用表参数。输入表具有行语义并支持传递列。

| 运算符语法                                              | 描述                                                         |
| :------------------------------------------------------ | :----------------------------------------------------------- |
| HOP(数据, DESCRIPTOR(timecol), 幻灯片, 大小 [, 偏移量]) | *指示timecol*的跳跃窗口，覆盖*size*间隔内的行，移动每张*幻灯片*并可选择以*offset*对齐。 |

这是一个例子：

```
SELECT * FROM TABLE(
  HOP(
    TABLE orders,
    DESCRIPTOR(rowtime),
    INTERVAL '2' MINUTE,
    INTERVAL '5' MINUTE));

-- or with the named params
-- note: the DATA param must be the first
SELECT * FROM TABLE(
  HOP(
    DATA => TABLE orders,
    TIMECOL => DESCRIPTOR(rowtime),
    SLIDE => INTERVAL '2' MINUTE,
    SIZE => INTERVAL '5' MINUTE));
```

对桌子上的行应用 5 分钟间隔大小的跳跃`orders` ，并每 2 分钟移动一次。`rowtime`是表顺序的带水印的列，表明数据的完整性。

#### 会议

在流式查询中，SESSION 分配基于*datetime*覆盖行的窗口。在会话窗口内，行的距离小于*间隔*。会话窗口适用于每个*键*。SESSION 表函数的第一个参数是通用表参数。输入表具有设定的语义并支持传递列。此外，如果输入表为空，SESSION 表函数将不会生成结果行。

| 运算符语法                                         | 描述                                                         |
| :------------------------------------------------- | :----------------------------------------------------------- |
| 会话（数据，描述符（时间列），描述符（键），大小） | *指示timecol的**大小*间隔的会话窗口。会话窗口适用于每个*键*。 |

这是一个例子：

```
SELECT * FROM TABLE(
  SESSION(
    TABLE orders PARTITION BY product,
    DESCRIPTOR(rowtime),
    INTERVAL '20' MINUTE));

-- or with the named params
-- note: the DATA param must be the first
SELECT * FROM TABLE(
  SESSION(
    DATA => TABLE orders PARTITION BY product,
    TIMECOL => DESCRIPTOR(rowtime),
    SIZE => INTERVAL '20' MINUTE));
```

对表 中的行应用具有 20 分钟非活动间隙的会话`orders`。 `rowtime`是表顺序的带水印的列，表明数据的完整性。会话适用于每个产品。

**注意**：`Tumble`、`Hop`和`Session`窗口表函数将原始表中的每一行分配给一个窗口。输出表具有与原始表相同的所有列以及两个附加列`window_start` 和`window_end`，分别表示窗口间隔的开始和结束。

### 分组窗口函数

**警告**：不推荐使用分组窗口函数。

分组窗口函数出现在`GROUP BY`子句中，并定义一个表示包含多行的窗口的键值。

在某些窗口函数中，一行可能属于多个窗口。例如，如果使用 分组查询 `HOP(t, INTERVAL '2' HOUR, INTERVAL '1' HOUR)`，则时间戳为“10:15:00”的行将出现在 10:00 - 11:00 和 11:00 - 12:00 总计中。

| 运算符语法                            | 描述                                                         |
| :------------------------------------ | :----------------------------------------------------------- |
| HOP（日期时间，幻灯片，大小[，时间]） | *表示日期时间*的跳跃窗口，覆盖*大小*间隔内的行，移动每张*幻灯片*，并且可以选择在*时间上对齐。* |
| 会话（日期时间，间隔[，时间]）        | *指示datetime**间隔*的会话窗口，可以选择在*时间*上对齐       |
| TUMBLE(日期时间, 间隔 [, 时间 ])      | *指示datetime*的*时间间隔*的滚动窗口，可以选择在*时间*上对齐 |

### 分组辅助功能

分组辅助函数允许您访问由分组窗口函数定义的窗口的属性。

| 运算符语法                           | 描述                                                |
| :----------------------------------- | :-------------------------------------------------- |
| HOP_END(表情,幻灯片,大小[,时间])     | 返回由函数调用定义的窗口末尾的*表达式*的值`HOP`     |
| HOP_START(表情,幻灯片,大小[,时间])   | 返回由函数调用定义的窗口开头的*表达式*的值`HOP`     |
| SESSION_END（表达式，间隔[，时间]）  | 返回由函数调用定义的窗口末尾的*表达式*的值`SESSION` |
| SESSION_START(表达式, 间隔[, 时间])  | 返回由函数调用定义的窗口开头的*表达式*的值`SESSION` |
| TUMBLE_END(表达式, 间隔 [, 时间 ])   | 返回由函数调用定义的窗口末尾的*表达式*的值`TUMBLE`  |
| TUMBLE_START(表达式, 间隔 [, 时间 ]) | 返回由函数调用定义的窗口开头的*表达式*的值`TUMBLE`  |

### 空间功能

在下面的：

- *geom*是几何；
- *geomCollection*是一个 GEOMETRYCOLLECTION；
- *点*是一个点；
- *lineString*是一个 LINESTRING；
- *iMatrix*是[DE-9IM 交集矩阵](https://en.wikipedia.org/wiki/DE-9IM)；
- *distance*、*tolerance*、*segmentLengthFraction*、*offsetDistance*均为 double 类型；
- *维度*、*quadSegs*、*srid*、*zoom*都是整数类型；
- *LayerType*为字符串；
- *gml是包含*[地理标记语言（GML）的](https://en.wikipedia.org/wiki/Geography_Markup_Language)字符串；
- *wkt是包含*[众所周知文本（WKT）的](https://en.wikipedia.org/wiki/Well-known_text)字符串；
- *wkb是包含*[众所周知的二进制 (WKB) 的](https://en.wikipedia.org/wiki/Well-known_binary)二进制字符串。

在“C”（“兼容性”）列中，“o”表示该函数实现了 OpenGIS Simple Features Implementing Specific for SQL [版本 1.2.1](https://www.opengeospatial.org/standards/sfs)；“p”表示该函数是 [PostGIS](https://www.postgis.net/docs/reference.html)对OpenGIS的扩展；“h”表示该函数是 [H2GIS](http://www.h2gis.org/docs/dev/functions/)扩展。

#### 几何转换函数（2D）

| C    | 运算符语法                                                  | 描述                                                         |
| :--- | :---------------------------------------------------------- | :----------------------------------------------------------- |
| p    | ST_AsBinary（几何）                                         | 同义词`ST_AsWKB`                                             |
| p    | ST_AsEWKB(几何)                                             | 同义词`ST_AsWKB`                                             |
| p    | ST_AsEWKT(几何)                                             | Converts GEOMETRY → EWKT                                     |
| p    | ST_AsGeoJSON(geom)                                          | Converts GEOMETRY → GeoJSON                                  |
| p    | ST_AsGML(geom)                                              | Converts GEOMETRY → GML                                      |
| p    | ST_AsText(geom)                                             | Synonym for `ST_AsWKT`                                       |
| o    | ST_AsWKB(geom)                                              | Converts GEOMETRY → WKB                                      |
| o    | ST_AsWKT(geom)                                              | Converts GEOMETRY → WKT                                      |
| o    | ST_Force2D(geom)                                            | 3D GEOMETRY → 2D GEOMETRY                                    |
| o    | ST_GeomFromEWKB(wkb [, srid ])                              | Synonym for `ST_GeomFromWKB`                                 |
| o    | ST_GeomFromEWKT(wkb [, srid ])                              | Converts EWKT → GEOMETRY                                     |
| o    | ST_GeomFromGeoJSON(json)                                    | Converts GeoJSON → GEOMETRY                                  |
| o    | ST_GeomFromGML(wkb [, srid ])                               | Converts GML → GEOMETRY                                      |
| o    | ST_GeomFromText(wkt [, srid ])                              | Synonym for `ST_GeomFromWKT`                                 |
| o    | ST_GeomFromWKB(wkb [, srid ])                               | Converts WKB → GEOMETRY                                      |
| o    | ST_GeomFromWKT(wkb [, srid ])                               | Converts WKT → GEOMETRY                                      |
| o    | ST_LineFromText(wkt [, srid ])                              | Converts WKT → LINESTRING                                    |
| o    | ST_LineFromWKB(wkt [, srid ])                               | Converts WKT → LINESTRING                                    |
| o    | ST_MLineFromText(wkt [, srid ])                             | Converts WKT → MULTILINESTRING                               |
| o    | ST_MPointFromText(wkt [, srid ])                            | Converts WKT → MULTIPOINT                                    |
| o    | ST_MPolyFromText(wkt [, srid ]) Converts WKT → MULTIPOLYGON |                                                              |
| o    | ST_PointFromText(wkt [, srid ])                             | Converts WKT → POINT                                         |
| o    | ST_PointFromWKB(wkt [, srid ])                              | Converts WKB → POINT                                         |
| o    | ST_PolyFromText(wkt [, srid ])                              | Converts WKT → POLYGON                                       |
| o    | ST_PolyFromWKB(wkt [, srid ])                               | Converts WKB → POLYGON                                       |
| p    | ST_ReducePrecision(geom, gridSize)                          | Reduces the precision of a *geom* to the provided *gridSize* |
| h    | ST_ToMultiPoint(geom)                                       | Converts the coordinates of *geom* (which may be a GEOMETRYCOLLECTION) into a MULTIPOINT |
| h    | ST_ToMultiLine(geom)                                        | Converts the coordinates of *geom* (which may be a GEOMETRYCOLLECTION) into a MULTILINESTRING |
| h    | ST_ToMultiSegments(geom)                                    | Converts *geom* (which may be a GEOMETRYCOLLECTION) into a set of distinct segments stored in a MULTILINESTRING |

Not implemented:

- ST_GoogleMapLink(geom [, layerType [, zoom ]]) GEOMETRY → Google map link
- ST_OSMMapLink(geom [, marker ]) GEOMETRY → OSM map link

#### Geometry conversion functions (3D)

| C    | OPERATOR SYNTAX  | DESCRIPTION               |
| :--- | :--------------- | :------------------------ |
| o    | ST_Force3D(geom) | 2D GEOMETRY → 3D GEOMETRY |

#### Geometry creation functions (2D)

| C    | OPERATOR SYNTAX                                   | DESCRIPTION                                                  |
| :--- | :------------------------------------------------ | :----------------------------------------------------------- |
| h    | ST_BoundingCircle(geom)                           | Returns the minimum bounding circle of *geom*                |
| h    | ST_Expand(geom, distance)                         | Expands *geom*’s envelope                                    |
| h    | ST_Expand(geom, deltaX, deltaY)                   | Expands *geom*’s envelope                                    |
| h    | ST_MakeEllipse(point, width, height)              | Constructs an ellipse                                        |
| p    | ST_MakeEnvelope(xMin, yMin, xMax, yMax [, srid ]) | Creates a rectangular POLYGON                                |
| h    | ST_MakeGrid(geom, deltaX, deltaY)                 | Calculates a regular grid of POLYGONs based on *geom*        |
| h    | ST_MakeGridPoints(geom, deltaX, deltaY)           | Calculates a regular grid of points based on *geom*          |
| o    | ST_MakeLine(point1 [, point ]*)                   | Creates a line-string from the given POINTs (or MULTIPOINTs) |
| p    | ST_MakePoint(x, y [, z ])                         | Synonym for `ST_Point`                                       |
| p    | ST_MakePolygon(lineString [, hole ]*)             | Creates a POLYGON from *lineString* with the given holes (which are required to be closed LINESTRINGs) |
| h    | ST_MinimumDiameter(geom)                          | Returns the minimum diameter of *geom*                       |
| h    | ST_MinimumRectangle(geom)                         | Returns the minimum rectangle enclosing *geom*               |
| h    | ST_OctogonalEnvelope(geom)                        | Returns the octogonal envelope of *geom*                     |
| o    | ST_Point(x, y [, z ])                             | Constructs a point from two or three coordinates             |

Not implemented:

- ST_RingBuffer(geom, distance, bufferCount [, endCapStyle [, doDifference]]) Returns a MULTIPOLYGON of buffers centered at *geom* and of increasing buffer size

### Geometry creation functions (3D)

Not implemented:

- ST_Extrude(geom, height [, flag]) Extrudes a GEOMETRY
- ST_GeometryShadow(geom, point, height) Computes the shadow footprint of *geom*
- ST_GeometryShadow(geom, azimuth, altitude, height [, unify ]) Computes the shadow footprint of *geom*

#### Geometry properties (2D)

| C    | OPERATOR SYNTAX                 | DESCRIPTION                                                  |
| :--- | :------------------------------ | :----------------------------------------------------------- |
| o    | ST_Boundary(geom [, srid ])     | Returns the boundary of *geom*                               |
| o    | ST_Centroid(geom)               | Returns the centroid of *geom*                               |
| o    | ST_CoordDim(geom)               | Returns the dimension of the coordinates of *geom*           |
| o    | ST_Dimension(geom)              | Returns the dimension of *geom*                              |
| o    | ST_Distance(geom1, geom2)       | Returns the distance between *geom1* and *geom2*             |
| h    | ST_ExteriorRing(geom)           | Returns the exterior ring of *geom*, or null if *geom* is not a polygon |
| o    | ST_GeometryType(geom)           | Returns the type of *geom*                                   |
| o    | ST_GeometryTypeCode(geom)       | Returns the OGC SFS type code of *geom*                      |
| p    | ST_EndPoint(lineString)         | Returns the last coordinate of *geom*                        |
| o    | ST_Envelope(geom [, srid ])     | Returns the envelope of *geom* (which may be a GEOMETRYCOLLECTION) as a GEOMETRY |
| o    | ST_Extent(geom)                 | Returns the minimum bounding box of *geom* (which may be a GEOMETRYCOLLECTION) |
| h    | ST_GeometryN(geomCollection, n) | Returns the *n*th GEOMETRY of *geomCollection*               |
| h    | ST_InteriorRingN(geom)          | Returns the nth interior ring of *geom*, or null if *geom* is not a polygon |
| h    | ST_IsClosed(geom)               | Returns whether *geom* is a closed LINESTRING or MULTILINESTRING |
| o    | ST_IsEmpty(geom)                | Returns whether *geom* is empty                              |
| o    | ST_IsRectangle(geom)            | Returns whether *geom* is a rectangle                        |
| h    | ST_IsRing(geom)                 | Returns whether *geom* is a closed and simple line-string or MULTILINESTRING |
| o    | ST_IsSimple(geom)               | Returns whether *geom* is simple                             |
| o    | ST_IsValid(geom)                | Returns whether *geom* is valid                              |
| h    | ST_NPoints(geom)                | Returns the number of points in *geom*                       |
| h    | ST_NumGeometries(geom)          | Returns the number of geometries in *geom* (1 if it is not a GEOMETRYCOLLECTION) |
| h    | ST_NumInteriorRing(geom)        | Synonym for `ST_NumInteriorRings`                            |
| h    | ST_NumInteriorRings(geom)       | Returns the number of interior rings of *geom*               |
| h    | ST_NumPoints(geom)              | Returns the number of points in *geom*                       |
| p    | ST_PointN(geom, n)              | Returns the *n*th point of a *geom*                          |
| p    | ST_PointOnSurface(geom)         | Returns an interior or boundary point of *geom*              |
| o    | ST_SRID(geom)                   | Returns SRID value of *geom* or 0 if it does not have one    |
| p    | ST_StartPoint(geom)             | Returns the first point of *geom*                            |
| o    | ST_X(geom)                      | Returns the x-value of the first coordinate of *geom*        |
| o    | ST_XMax(geom)                   | Returns the maximum x-value of *geom*                        |
| o    | ST_XMin(geom)                   | Returns the minimum x-value of *geom*                        |
| o    | ST_Y(geom)                      | Returns the y-value of the first coordinate of *geom*        |
| o    | ST_YMax(geom)                   | Returns the maximum y-value of *geom*                        |
| o    | ST_YMin(geom)                   | Returns the minimum y-value of *geom*                        |

Not implemented:

- ST_CompactnessRatio(polygon) Returns the square root of *polygon*’s area divided by the area of the circle with circumference equal to its perimeter
- ST_Explode(query [, fieldName]) Explodes the GEOMETRYCOLLECTIONs in the *fieldName* column of a query into multiple geometries
- ST_IsValidDetail(geom [, selfTouchValid ]) Returns a valid detail as an array of objects
- ST_IsValidReason(geom [, selfTouchValid ]) Returns text stating whether *geom* is valid, and if not valid, a reason why

#### Geometry properties (3D)

| C    | OPERATOR SYNTAX | DESCRIPTION                                           |
| :--- | :-------------- | :---------------------------------------------------- |
| p    | ST_Is3D(s)      | Returns whether *geom* has at least one z-coordinate  |
| o    | ST_Z(geom)      | Returns the z-value of the first coordinate of *geom* |
| o    | ST_ZMax(geom)   | Returns the maximum z-value of *geom*                 |
| o    | ST_ZMin(geom)   | Returns the minimum z-value of *geom*                 |

### Geometry predicates

| C    | OPERATOR SYNTAX                     | DESCRIPTION                                                  |
| :--- | :---------------------------------- | :----------------------------------------------------------- |
| o    | ST_Contains(geom1, geom2)           | Returns whether *geom1* contains *geom2*                     |
| p    | ST_ContainsProperly(geom1, geom2)   | Returns whether *geom1* contains *geom2* but does not intersect its boundary |
| p    | ST_CoveredBy(geom1, geom2)          | Returns whether no point in *geom1* is outside *geom2*.      |
| p    | ST_Covers(geom1, geom2)             | Returns whether no point in *geom2* is outside *geom1*       |
| o    | ST_Crosses(geom1, geom2)            | Returns whether *geom1* crosses *geom2*                      |
| o    | ST_Disjoint(geom1, geom2)           | Returns whether *geom1* and *geom2* are disjoint             |
| p    | ST_DWithin(geom1, geom2, distance)  | Returns whether *geom1* and *geom* are within *distance* of one another |
| o    | ST_EnvelopesIntersect(geom1, geom2) | Returns whether the envelope of *geom1* intersects the envelope of *geom2* |
| o    | ST_Equals(geom1, geom2)             | Returns whether *geom1* equals *geom2*                       |
| o    | ST_Intersects(geom1, geom2)         | 返回*geom1是否与**geom2*相交                                 |
| 哦   | ST_Overlaps(geom1, geom2)           | 返回*geom1是否与**geom2*重叠                                 |
| 哦   | ST_Relate(geom1, geom2)             | *返回geom1*和*geom2*的DE-9IM交集矩阵                         |
| 哦   | ST_Relate(geom1, geom2, iMatrix)    | 返回*geom1*和*geom2是否通过给定的交集矩阵**iMatrix*相关      |
| 哦   | ST_Touches(geom1, geom2)            | 返回*geom1*是否接触*geom2*                                   |
| 哦   | ST_Within(geom1, geom2)             | 返回*geom1*是否在*geom2内*                                   |

未实现：

- ST_OrderingEquals(geom1, geom2) 返回*geom1*是否等于*geom2*以及它们的坐标和组件几何图形以相同的顺序列出

#### 几何运算符（2D）

以下函数结合了 2D 几何图形。

| C    | 运算符语法                                       | 描述                                 |
| :--- | :----------------------------------------------- | :----------------------------------- |
| p    | ST_Buffer（几何，距离[，quadSegs，endCapStyle]） | *计算geom*周围的缓冲区               |
| p    | ST_Buffer（几何，距离[，bufferStyle]）           | *计算geom*周围的缓冲区               |
| 哦   | ST_ConvexHull(几何)                              | 计算包含*geom中所有点的最小凸多边形* |
| 哦   | ST_Difference(geom1, geom2)                      | 计算两个几何图形之间的差异           |
| 哦   | ST_SymDifference(geom1, geom2)                   | 计算两个几何图形之间的对称差         |
| 哦   | ST_Intersection(geom1, geom2)                    | *计算geom1*和*geom2*的交集           |
| p    | ST_OffsetCurve(几何、距离、bufferStyle)          | *计算线串*的偏移线                   |
| 哦   | ST_Union(geom1, geom2)                           | *计算geom1*和*geom2*的并集           |
| 哦   | ST_Union(geomCollection)                         | *计算geomCollection*中几何图形的并集 |

另请参见：`ST_Union`聚合函数。

#### 仿射变换函数（3D 和 2D）

以下函数转换 2D 几何图形。

| C    | 运算符语法                             | 描述                                                         |
| :--- | :------------------------------------- | :----------------------------------------------------------- |
| 哦   | ST_Rotate（几何，角度[，原点\| x，y]） | 将*几何图形绕**原点*（或点 ( *x* , *y* )）逆时针旋转*角度*（以弧度为单位） |
| 哦   | ST_Scale（几何、x 因子、y 因子）       | *通过将纵*坐标乘以指定的比例因子来缩放几何                   |
| 哦   | ST_翻译（几何，x，y）                  | 通过向量 (x, y)平移*geom*                                    |

未实现：

- ST_Scale(geom, xFactor, yFactor [, zFactor ])通过将纵坐标乘以指定的比例因子来缩放*geom*
- ST_Translate(geom, x, y, [, z]) 翻译*geom*

#### 几何编辑功能（2D）

以下函数修改 2D 几何图形。

| C    | 运算符语法                             | 描述                                                         |
| :--- | :------------------------------------- | :----------------------------------------------------------- |
| p    | ST_AddPoint(线串, 点 [, 索引])         | 将*点*添加到给定*索引处的**线串*（如果未指定*索引*，则添加到末尾） |
| H    | ST_Densify（几何，公差）               | 通过沿线段插入额外的顶点来加密*几何图形*                     |
| H    | ST_Flip坐标（几何）                    | *翻转几何体*的 X 和 Y 坐标                                   |
| H    | ST_孔（几何）                          | *返回几何体*中的孔（可能是 GEOMETRYCOLLECTION）              |
| H    | ST_Normalize（几何）                   | *将geom*转换为正常形式                                       |
| p    | ST_RemoveRepeatedPoints(geom [, 公差]) | *从几何*中删除重复的坐标                                     |
| H    | ST_RemoveHoles(几何)                   | *去除几何体*的孔                                             |
| p    | ST_RemovePoint（线串，索引）           | 删除*线串*中给定*索引处的**点*                               |
| H    | ST_Reverse（几何）                     | *反转几何坐标*的顺序                                         |

未实现：

- ST_CollectionExtract(geom,Dimension) 过滤*geom ，返回具有给定**维度*的那些成员的多几何图形（1 = 点，2 = 线串，3 = 多边形）

#### 几何编辑功能（3D）

以下函数修改 3D 几何图形。

| C    | 运算符语法            | 描述                            |
| :--- | :-------------------- | :------------------------------ |
| H    | ST_AddZ(geom, zToAdd) | *将zToAdd*添加到*geom*的 z 坐标 |

未实现：

- ST_Interpolate3DLine(geom) 返回带有 z 值插值的*geom*，如果不是线串或多行字符串，则返回 null
- ST_MultiplyZ(geom, zFactor) 返回z 值乘以*zFactor的**geom*
- ST_Reverse3DLine(geom [, sortOrder ]) 可能根据其第一个和最后一个坐标的 z 值反转*geom*
- *ST_UpdateZ(geom, newZ [, updateCondition ]) 更新geom*的 z 值
- *ST_ZUpdateLineExtremities(geom, startZ, endZ [, interpolate ]) 更新geom*的开始和结束 z 值

#### 几何测量功能（2D）

以下函数测量几何形状。

| C    | 运算符语法                                                   | 描述                                                         |
| :--- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| 哦   | ST_Area（几何）                                              | *返回geom*的面积（可能是 GEOMETRYCOLLECTION）                |
| H    | ST_ClosestCooperative(点，几何)                              | 返回最接近*点的**几何*坐标                                   |
| H    | ST_ClosestPoint(geom1, geom2)                                | *返回geom1*最接近*geom2*的点                                 |
| H    | ST_Furthest坐标（几何，点）                                  | *返回距离点*最远的*几何*坐标                                 |
| H    | ST_长度（几何）                                              | *返回geom*的长度                                             |
| H    | ST_LocateAlong（几何，segmentLengthFraction，offsetDistance） | *返回一个 MULTIPOINT，其中包含沿geom*线段的点，位于*segmentLengthFraction*和*offsetDistance* |
| H    | ST_LongestLine(geom1, geom2)                                 | *返回geom1*和*geom2*点之间的二维最长线串                     |
| H    | ST_MaxDistance(geom1, geom2)                                 | *计算geom1*和*geom2*之间的最大距离                           |
| H    | ST_周长（多边形）                                            | *返回多边形*周长（可能是 MULTIPOLYGON）                      |
| H    | ST_ProjectPoint(点, 线串)                                    | 项目*指向*线*串*（可能是多线串）                             |

#### 几何测量功能（3D）

未实现：

- ST_3DArea(geom) 返回多边形的 3D 面积
- ST_3DLength(geom) 返回线串的 3D 长度
- ST_3DPerimeter(geom) 返回多边形或 MULTIPOLYGON 的 3D 周长
- *ST_SunPosition(point [, timestamp ]) 计算点*和*时间戳*处的太阳位置（现在默认）

#### 几何处理功能（2D）

以下函数处理几何形状。

| C    | 运算符语法                                | 描述                                                         |
| :--- | :---------------------------------------- | :----------------------------------------------------------- |
| 哦   | ST_LineMerge(几何)                        | 合并线性分量的集合以形成最大长度的线串                       |
| 哦   | ST_MakeValid(几何)                        | 将给定的无效几何图形变为有效几何图形                         |
| 哦   | ST_Polygonize（几何）                     | 从*几何体的边缘创建一个多重多边形*                           |
| 哦   | ST_PrecisionReducer(geom, n)              | *将geom*的精度降低到小数点后*n位*                            |
| 哦   | ST_Simplify(几何，距离)                   | 使用具有*距离*容差的[Douglas-Peuker 算法](https://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm)简化*几何* |
| 哦   | ST_SimplifyPreserveTopology（几何，距离） | 简化*geom*，保留其拓扑                                       |
| 哦   | ST_Snap(geom1, geom2, 公差)               | *将geom1*和*geom2*捕捉在一起                                 |
| p    | ST_Split（几何，刀片）                    | 通过*刀片*分割*几何体*                                       |

未实现：

- ST_LineIntersector(geom1, geom2) 将*geom1*（线串）与*geom2分割*
- ST_LineMerge(geom) 合并线性分量的集合以形成最大长度的线串
- ST_MakeValid(geom [,preserveGeomDim[,preserveDuplicateCoord[,preserveCoordDim]]]) 使*geom*有效
- ST_RingSideBuffer(geom, distance, bufferCount [, endCapStyle [, doDifference]]) 计算一侧的环形缓冲区
- ST_SideBuffer(geom, distance [, bufferStyle ]) 计算一侧的单个缓冲区

#### 几何投影函数

由于其[使用条款的](https://epsg.org/terms-of-use.html)限制，EPSG 数据集与 Proj4J 分开发布。为了使用 Apache Calcite 中的投影函数，用户必须在其依赖项中包含 EPSG 数据集。

| C    | 运算符语法               | 描述                                                 |
| :--- | :----------------------- | :--------------------------------------------------- |
| 哦   | ST_SetSRID(geom, srid)   | 返回具有新 SRID 的*geom*副本                         |
| 哦   | ST_Transform(geom, srid) | *将geom*从一个坐标参考系 (CRS)转换为*srid*指定的 CRS |

#### 三角函数

未实现：

- *ST_Azimuth(point1, point2) 返回从point1*到*point2*的线段的方位角

#### 地形函数

未实现：

- ST_TriangleAspect(geom) 返回三角形的长宽比
- ST_TriangleContouring(query [, z1, z2, z3 ][, varArgs ]*) 根据类别将三角形分割成更小的三角形
- ST_TriangleDirection(geom) 计算三角形最陡上升的方向并将其作为线串返回
- ST_TriangleSlope(geom) 以百分比形式计算三角形的斜率
- ST_Voronoi(geom [, outDimension [, EnvelopePolygon ]]) 创建 Voronoi 图

#### 三角测量函数

| C    | 运算符语法                            | 描述                                   |
| :--- | :------------------------------------ | :------------------------------------- |
| H    | ST_ConstrainedDelaunay(geom [, 标志]) | 基于*geom计算约束 Delaunay 三角剖分*   |
| H    | ST_Delaunay(geom [, 标志])            | 基于*geom中的点计算 Delaunay 三角剖分* |

未实现：

- ST_Tessellate(polygon)用自适应三角形对*多边形（可能是 MULTIPOLYGON）进行细分*

#### 几何聚合函数

| C    | 运算符语法         | 描述                                 |
| :--- | :----------------- | :----------------------------------- |
| H    | ST_Accum(几何)     | *将geom*累加到数组中                 |
| H    | ST_Collect（几何） | *将geom*收集到 GeometryCollection 中 |
| H    | ST_Union（几何）   | *计算geom*中几何图形的并集           |

### JSON 函数

在下面的：

- *jsonValue*是包含 JSON 值的字符串；
- *path*是包含 JSON 路径表达式的字符串；模式标志`strict`or`lax`应该在*路径*的开头指定。

#### 查询功能

| 运算符语法                                                   | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| JSON_EXISTS(jsonValue, 路径 [ { TRUE \| FALSE \| UNKNOWN \| ERROR } ON ERROR ] ) | *jsonValue*是否满足使用JSON路径表达式*path*描述的搜索条件    |
| JSON_VALUE(jsonValue, 路径 [ 返回类型 ] [ { ERROR \| NULL \| DEFAULT expr } ON EMPTY ] [ { ERROR \| NULL \| DEFAULT expr } ON ERROR ] ) | 使用 JSON 路径表达式*路径从**jsonValue*中提取 SQL 标量       |
| JSON_QUERY(jsonValue, 路径 [ {WITHOUT [ ARRAY ] \| WITH [ CONDITIONAL \| UNCONDITIONAL ] [ ARRAY ] } WRAPPER ] [ { ERROR \| NULL \| EMPTY ARRAY \| EMPTY OBJECT } ON EMPTY ] [ { ERROR \| NULL \| EMPTY ARRAY \| EMPTY OBJECT } 错误]） | 使用*路径*JSON 路径表达式从*jsonValue*中提取 JSON 对象或 JSON 数组 |

笔记：

- and`ON ERROR`子句`ON EMPTY`定义抛出错误或即将返回空值时函数的回退行为。
- 该`ARRAY WRAPPER`子句定义了如何在`JSON_QUERY`函数中表示 JSON 数组结果。以下示例比较了包装器行为。

示例数据：

```
{"a": "[1,2]", "b": [1,2], "c": "hi"}
```

比较：

| 操作员                           | $.A       | $.B       | $.C        |
| :------------------------------- | :-------- | :-------- | :--------- |
| JSON_VALUE                       | [1, 2]    | 错误      | 你好       |
| 没有数组包装器的 JSON 查询       | 错误      | [1, 2]    | 错误       |
| 使用无条件数组包装器的 JSON 查询 | [“[1,2]”] | [ [1,2] ] | [ “你好” ] |
| 带条件数组包装器的 JSON 查询     | [“[1,2]”] | [1,2]     | [ “你好” ] |

未实现：

- JSON_TABLE

#### Constructor Functions

| OPERATOR SYNTAX                                              | DESCRIPTION                                                  |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| JSON_OBJECT( jsonKeyVal [, jsonKeyVal ]* [ nullBehavior ] )  | Construct JSON object using a series of key-value pairs      |
| JSON_OBJECTAGG( jsonKeyVal [ nullBehavior ] )                | Aggregate function to construct a JSON object using a key-value pair |
| JSON_ARRAY( [ jsonVal [, jsonVal ]* ] [ nullBehavior ] )     | Construct a JSON array using a series of values              |
| JSON_ARRAYAGG( jsonVal [ ORDER BY orderItem [, orderItem ]* ] [ nullBehavior ] ) | Aggregate function to construct a JSON array using a value   |

```
jsonKeyVal:
      [ KEY ] name VALUE value [ FORMAT JSON ]
  |   name : value [ FORMAT JSON ]

jsonVal:
      value [ FORMAT JSON ]

nullBehavior:
      NULL ON NULL
  |   ABSENT ON NULL
```

Note:

- The flag `FORMAT JSON` indicates the value is formatted as JSON character string. When `FORMAT JSON` is used, the value should be de-parse from JSON character string to a SQL structured value.
- `ON NULL` clause defines how the JSON output represents null values. The default null behavior of `JSON_OBJECT` and `JSON_OBJECTAGG` is `NULL ON NULL`, and for `JSON_ARRAY` and `JSON_ARRAYAGG` it is `ABSENT ON NULL`.
- If `ORDER BY` clause is provided, `JSON_ARRAYAGG` sorts the input rows into the specified order before performing aggregation.

#### Comparison Operators

| OPERATOR SYNTAX                 | DESCRIPTION                                    |
| :------------------------------ | :--------------------------------------------- |
| jsonValue IS JSON [ VALUE ]     | Whether *jsonValue* is a JSON value            |
| jsonValue IS NOT JSON [ VALUE ] | Whether *jsonValue* is not a JSON value        |
| jsonValue IS JSON SCALAR        | Whether *jsonValue* is a JSON scalar value     |
| jsonValue IS NOT JSON SCALAR    | Whether *jsonValue* is not a JSON scalar value |
| jsonValue IS JSON OBJECT        | Whether *jsonValue* is a JSON object           |
| jsonValue IS NOT JSON OBJECT    | Whether *jsonValue* is not a JSON object       |
| jsonValue IS JSON ARRAY         | Whether *jsonValue* is a JSON array            |
| jsonValue IS NOT JSON ARRAY     | Whether *jsonValue* is not a JSON array        |

### Dialect-specific Operators

The following operators are not in the SQL standard, and are not enabled in Calcite’s default operator table. They are only available for use in queries if your session has enabled an extra operator table.

To enable an operator table, set the [fun](https://calcite.apache.org/docs/adapter.html#jdbc-connect-string-parameters) connect string parameter.

The ‘C’ (compatibility) column contains value:

- ‘*’ for all libraries,
- ‘b’ for Google BigQuery (‘fun=bigquery’ in the connect string),
- ‘c’ for Apache Calcite (‘fun=calcite’ in the connect string),
- ‘h’ for Apache Hive (‘fun=hive’ in the connect string),
- ‘m’ for MySQL (‘fun=mysql’ in the connect string),
- ‘q’ for Microsoft SQL Server (‘fun=mssql’ in the connect string),
- ‘o’ for Oracle (‘fun=oracle’ in the connect string),
- ‘p’ for PostgreSQL (‘fun=postgresql’ in the connect string),
- ’s’ for Apache Spark (‘fun=spark’ in the connect string).

One operator name may correspond to multiple SQL dialects, but with different semantics.

BigQuery’s type system uses confusingly different names for types and functions:

- BigQuery’s `DATETIME` type represents a local date time, and corresponds to Calcite’s `TIMESTAMP` type;
- BigQuery’s `TIMESTAMP` type represents an instant, and corresponds to Calcite’s `TIMESTAMP WITH LOCAL TIME ZONE` type;
- The *timestampLtz* parameter, for instance in `DATE(timestampLtz)`, has Calcite type `TIMESTAMP WITH LOCAL TIME ZONE`;
- The `TIMESTAMP(string)` function, designed to be compatible the BigQuery function, return a Calcite `TIMESTAMP WITH LOCAL TIME ZONE`;
- Similarly, `DATETIME(string)` returns a Calcite `TIMESTAMP`.

| C            | OPERATOR SYNTAX                                              | DESCRIPTION                                                  |
| :----------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| p            | expr :: type                                                 | Casts *expr* to *type*                                       |
| m            | expr1 <=> expr2                                              | Whether two values are equal, treating null values as the same, and it’s similar to `IS NOT DISTINCT FROM` |
| *            | ACOSH(numeric)                                               | Returns the inverse hyperbolic cosine of *numeric*           |
| s            | ARRAY(expr [, expr ]*)                                       | Construct an array in Apache Spark                           |
| s            | ARRAY_APPEND(array, element)                                 | Appends an *element* to the end of the *array* and returns the result. Type of *element* should be similar to type of the elements of the *array*. If the *array* is null, the function will return null. If an *element* that is null, the null *element* will be added to the end of the *array* |
| s            | ARRAY_COMPACT(array)                                         | Removes null values from the *array*                         |
| b            | ARRAY_CONCAT(array [, array ]*)                              | Concatenates one or more arrays. If any input argument is `NULL` the function returns `NULL` |
| s            | ARRAY_CONTAINS(array, element)                               | Returns true if the *array* contains the *element*           |
| s            | ARRAY_DISTINCT(array)                                        | Removes duplicate values from the *array* that keeps ordering of elements |
| s            | ARRAY_EXCEPT(array1, array2)                                 | Returns an array of the elements in *array1* but not in *array2*, without duplicates |
| s            | ARRAY_INSERT(array, pos, element)                            | Places *element* into index *pos* of *array*. Array index start at 1, or start from the end if index is negative. Index above array size appends the array, or prepends the array if index is negative, with `NULL` elements. |
| s            | ARRAY_INTERSECT(array1, array2)                              | Returns an array of the elements in the intersection of *array1* and *array2*, without duplicates |
| s            | ARRAY_JOIN(array, delimiter [, nullText ])                   | Synonym for `ARRAY_TO_STRING`                                |
| b            | ARRAY_LENGTH(array)                                          | Synonym for `CARDINALITY`                                    |
| s            | ARRAY_MAX(array)                                             | Returns the maximum value in the *array*                     |
| s            | ARRAY_MIN(array)                                             | Returns the minimum value in the *array*                     |
| s            | ARRAY_POSITION(array, element)                               | Returns the (1-based) index of the first *element* of the *array* as long |
| s            | ARRAY_REMOVE(array, element)                                 | Remove all elements that equal to *element* from the *array* |
| s            | ARRAY_PREPEND(array, element)                                | Appends an *element* to the beginning of the *array* and returns the result. Type of *element* should be similar to type of the elements of the *array*. If the *array* is null, the function will return null. If an *element* that is null, the null *element* will be added to the beginning of the *array* |
| s            | ARRAY_REPEAT(element, count)                                 | Returns the array containing element count times.            |
| b            | ARRAY_REVERSE(array)                                         | Reverses elements of *array*                                 |
| s            | ARRAY_SIZE(array)                                            | Synonym for `CARDINALITY`                                    |
| b            | ARRAY_TO_STRING(array, delimiter [, nullText ])              | Returns a concatenation of the elements in *array* as a STRING and take *delimiter* as the delimiter. If the *nullText* parameter is used, the function replaces any `NULL` values in the array with the value of *nullText*. If the *nullText* parameter is not used, the function omits the `NULL` value and its preceding delimiter. Returns `NULL` if any argument is `NULL` |
| s            | ARRAY_UNION(array1, array2)                                  | Returns an array of the elements in the union of *array1* and *array2*, without duplicates |
| s            | ARRAYS_OVERLAP(array1, array2)                               | Returns true if *array1 contains at least a non-null element present also in \*array2*. If the arrays have no common element and they are both non-empty and either of them contains a null element null is returned, false otherwise |
| s            | ARRAYS_ZIP(array [, array ]*)                                | Returns a merged *array* of structs in which the N-th struct contains all N-th values of input arrays |
| s            | SORT_ARRAY(array [, ascendingOrder])                         | Sorts the *array* in ascending or descending order according to the natural ordering of the array elements. The default order is ascending if *ascendingOrder* is not specified. Null elements will be placed at the beginning of the returned array in ascending order or at the end of the returned array in descending order |
| *            | ASINH(numeric)                                               | Returns the inverse hyperbolic sine of *numeric*             |
| *            | ATANH(numeric)                                               | Returns the inverse hyperbolic tangent of *numeric*          |
| s            | BIT_LENGTH(binary)                                           | Returns the bit length of *binary*                           |
| s            | BIT_LENGTH(string)                                           | Returns the bit length of *string*                           |
| s            | BIT_GET(value, position)                                     | Returns the bit (0 or 1) value at the specified *position* of numeric *value*. The positions are numbered from right to left, starting at zero. The *position* argument cannot be negative |
| b            | CEIL(value)                                                  | Similar to standard `CEIL(value)` except if *value* is an integer type, the return type is a double |
| m s          | CHAR(integer)                                                | Returns the character whose ASCII code is *integer* % 256, or null if *integer* < 0 |
| b o p        | CHR(integer)                                                 | Returns the character whose UTF-8 code is *integer*          |
| b            | CODE_POINTS_TO_BYTES(integers)                               | Converts *integers*, an array of integers between 0 and 255 inclusive, into bytes; throws error if any element is out of range |
| b            | CODE_POINTS_TO_STRING(integers)                              | Converts *integers*, an array of integers between 0 and 0xD7FF or between 0xE000 and 0x10FFFF inclusive, into string; throws error if any element is out of range |
| o            | CONCAT(string, string)                                       | Concatenates two strings, returns null only when both string arguments are null, otherwise treats null as empty string |
| b m          | CONCAT(string [, string ]*)                                  | Concatenates one or more strings, returns null if any of the arguments is null |
| p q          | CONCAT(string [, string ]*)                                  | Concatenates one or more strings, null is treated as empty string |
| m p          | CONCAT_WS(separator, str1 [, string ]*)                      | Concatenates one or more strings, returns null only when separator is null, otherwise treats null arguments as empty strings |
| q            | CONCAT_WS(separator, str1, str2 [, string ]*)                | Concatenates two or more strings, requires at least 3 arguments (up to 254), treats null arguments as empty strings |
| m            | COMPRESS(string)                                             | Compresses a string using zlib compression and returns the result as a binary string |
| b            | CONTAINS_SUBSTR(expression, string [ , json_scope => json_scope_value ]) | Returns whether *string* exists as a substring in *expression*. Optional *json_scope* argument specifies what scope to search if *expression* is in JSON format. Returns NULL if a NULL exists in *expression* that does not result in a match |
| q            | CONVERT(type, expression [ , style ])                        | Equivalent to `CAST(expression AS type)`; ignores the *style* operand |
| p            | CONVERT_TIMEZONE(tz1, tz2, datetime)                         | Converts the timezone of *datetime* from *tz1* to *tz2*      |
| *            | COSH(numeric)                                                | Returns the hyperbolic cosine of *numeric*                   |
| *            | COTH(numeric)                                                | Returns the hyperbolic cotangent of *numeric*                |
| *            | CSC(numeric)                                                 | Returns the cosecant of *numeric* in radians                 |
| *            | CSCH(numeric)                                                | Returns the hyperbolic cosecant of *numeric*                 |
| b            | CURRENT_DATETIME([ timeZone ])                               | Returns the current time as a TIMESTAMP from *timezone*      |
| m            | DAYNAME(datetime)                                            | Returns the name, in the connection’s locale, of the weekday in *datetime*; for example, it returns ‘星期日’ for both DATE ‘2020-02-10’ and TIMESTAMP ‘2020-02-10 10:10:10’ |
| b            | DATE(timestamp)                                              | Extracts the DATE from a *timestamp*                         |
| b            | DATE(timestampLtz)                                           | Extracts the DATE from *timestampLtz* (an instant; BigQuery’s TIMESTAMP type), assuming UTC |
| b            | DATE(timestampLtz, timeZone)                                 | Extracts the DATE from *timestampLtz* (an instant; BigQuery’s TIMESTAMP type) in *timeZone* |
| b            | DATE(string)                                                 | Equivalent to `CAST(string AS DATE)`                         |
| b            | DATE(year, month, day)                                       | Returns a DATE value for *year*, *month*, and *day* (all of type INTEGER) |
| p q          | DATEADD(timeUnit, integer, datetime)                         | Equivalent to `TIMESTAMPADD(timeUnit, integer, datetime)`    |
| p q          | DATEDIFF(timeUnit, datetime, datetime2)                      | Equivalent to `TIMESTAMPDIFF(timeUnit, datetime, datetime2)` |
| q            | DATEPART(timeUnit, datetime)                                 | Equivalent to `EXTRACT(timeUnit FROM  datetime)`             |
| b            | DATETIME(date, time)                                         | Converts *date* and *time* to a TIMESTAMP                    |
| b            | DATETIME(date)                                               | Converts *date* to a TIMESTAMP value (at midnight)           |
| b            | DATETIME(date, timeZone)                                     | Converts *date* to a TIMESTAMP value (at midnight), in *timeZone* |
| b            | DATETIME(year, month, day, hour, minute, second)             | Creates a TIMESTAMP for *year*, *month*, *day*, *hour*, *minute*, *second* (all of type INTEGER) |
| b            | DATETIME_ADD(timestamp, interval)                            | Returns the TIMESTAMP value that occurs *interval* after *timestamp* |
| b            | DATETIME_DIFF(timestamp, timestamp2, timeUnit)               | Returns the whole number of *timeUnit* between *timestamp* and *timestamp2* |
| b            | DATETIME_SUB(timestamp, interval)                            | Returns the TIMESTAMP that occurs *interval* before *timestamp* |
| b            | DATETIME_TRUNC(timestamp, timeUnit)                          | Truncates *timestamp* to the granularity of *timeUnit*, rounding to the beginning of the unit |
| b            | DATE_FROM_UNIX_DATE(integer)                                 | Returns the DATE that is *integer* days after 1970-01-01     |
| p            | DATE_PART(timeUnit, datetime)                                | Equivalent to `EXTRACT(timeUnit FROM  datetime)`             |
| b            | DATE_ADD(date, interval)                                     | Returns the DATE value that occurs *interval* after *date*   |
| b            | DATE_DIFF(date, date2, timeUnit)                             | Returns the whole number of *timeUnit* between *date* and *date2* |
| b            | DATE_SUB(date, interval)                                     | Returns the DATE value that occurs *interval* before *date*  |
| b            | DATE_TRUNC(date, timeUnit)                                   | Truncates *date* to the granularity of *timeUnit*, rounding to the beginning of the unit |
| o            | DECODE(value, value1, result1 [, valueN, resultN ]* [, default ]) | Compares *value* to each *valueN* value one by one; if *value* is equal to a *valueN*, returns the corresponding *resultN*, else returns *default*, or NULL if *default* is not specified |
| p            | DIFFERENCE(string, string)                                   | 返回两个字符串相似度的度量，即它们的值具有共同的字符位置的数量`SOUNDEX`：如果值相同则为 4 ，如果值完全不同则为`SOUNDEX`0`SOUNDEX` |
| 乙           | ENDS_WITH(字符串1, 字符串2)                                  | 返回*string2是否是**string1*的后缀                           |
| 哦           | EXTRACT(xml, xpath, [, 命名空间])                            | 返回与 XPath 表达式匹配的一个或多个元素的 XML 片段。可选的命名空间值，指定前缀的默认映射或命名空间映射，在计算 XPath 表达式时使用 |
| 哦           | EXISTSNODE(xml, xpath, [, 命名空间])                         | 确定使用指定的 xpath 遍历 XML 文档是否会产生任何节点。如果对 XPath 表达式匹配的一个或多个元素的文档片段应用 XPath 遍历后没有剩余节点，则返回 0。如果还有任何节点，则返回 1。可选的命名空间值，指定前缀的默认映射或命名空间映射，在计算 XPath 表达式时使用。 |
| 米           | EXTRACTVALUE(xml, xpathExpr))                                | 返回第一个文本节点的文本，该文本节点是与 XPath 表达式匹配的一个或多个元素的子级。 |
| HS           | 阶乘（整数）                                                 | *返回整数*的阶乘，*整数*范围为 [0, 20]。否则，返回 NULL      |
| HS           | FIND_IN_SET(matchStr, textStr)                               | 返回逗号分隔的*textStr中给定**matchStr*的索引（从 1 开始）。如果未找到给定的*matchStr或**matchStr*包含逗号，则返回 0 。例如，FIND_IN_SET('bc', 'a,bc,def') 返回 2 |
| 乙           | 楼层（值）                                                   | 与标准类似，`FLOOR(value)`但如果*value*是整数类型，则返回类型是 double |
| 乙           | FORMAT_DATE（字符串，日期）                                  | 根据指定的格式*字符串*格式化*日期*                           |
| 乙           | FORMAT_DATETIME（字符串，时间戳）                            | 根据指定的格式*字符串*格式化*时间戳*                         |
| HS           | FORMAT_NUMBER（值，十进制值）                                | 将数字*值*格式化为“#,###,###.##”，四舍五入到小数位*DecimalVal*。如果*decimalVal*为0，则结果没有小数点或小数部分 |
| HS           | FORMAT_NUMBER（值，格式）                                    | 将数字*值*格式化为 MySQL 的 FORMAT*格式*，例如 '#,###,###.##0.00' |
| 乙           | FORMAT_TIME（字符串，时间）                                  | 根据指定的格式*字符串*格式化*时间*                           |
| 乙           | FORMAT_TIMESTAMP（字符串时间戳）                             | 根据指定的格式*字符串*格式化*时间戳*                         |
| s            | GETBIT（值，位置）                                           | 相当于`BIT_GET(value, position)`                             |
| 博           | GREATEST(expr [, expr ]*)                                    | 返回最大的表达式                                             |
| 黑社会       | IF(条件, 值1, 值2)                                           | 如果*条件*为 TRUE，则返回*value1* ，否则返回*value2*         |
| 乙           | IFNULL(值1,值2)                                              | 相当于`NVL(value1, value2)`                                  |
| p            | string1 ILIKE string2 [ ESCAPE string3 ]                     | *string1*是否匹配模式*string2*，忽略大小写（类似于`LIKE`）   |
| p            | string1 不喜欢 string2 [ ESCAPE string3 ]                    | *string1*是否与模式*string2*不匹配，忽略大小写（类似于`NOT LIKE`） |
| 博           | INSTR(字符串, 子字符串 [, 来自 [, 出现次数 ] ])              | *返回子字符串*在*string*中的位置，*从 from* （默认 1）开始搜索，直到找到*子字符串第 n 次**出现*（默认 1） |
| 米           | INSTR（字符串，子字符串）                                    | 相当于`POSITION(substring IN string)`                        |
| 乙           | IS_INF（值）                                                 | 返回*值*是否为无穷大                                         |
| 乙           | IS_NAN（值）                                                 | 返回*值*是否为 NaN                                           |
| 米           | JSON_TYPE(json值)                                            | *返回一个字符串值，表示jsonValue*的类型                      |
| 米           | JSON_DEPTH(json值)                                           | *返回一个整数值，表示jsonValue*的深度                        |
| 米           | JSON_PRETTY(jsonValue)                                       | *返回jsonValue*的漂亮打印                                    |
| 米           | JSON_LENGTH(jsonValue [, 路径])                              | *返回一个整数，表示jsonValue*的长度                          |
| 米           | JSON_INSERT(jsonValue, 路径, val [, 路径, val ]*)            | *返回一个 JSON 文档，插入jsonValue*、*path*、*val*的数据     |
| 米           | JSON_KEYS(jsonValue [, 路径])                                | *返回一个字符串，指示 JSON jsonValue*的键                    |
| 米           | JSON_REMOVE(jsonValue, 路径 [, 路径 ])                       | 使用一系列*路径表达式从**jsonValue*中删除数据并返回结果      |
| 米           | JSON_REPLACE(jsonValue, 路径, val [, 路径, val ]*)           | *返回一个 JSON 文档，替换jsonValue*、*path*、*val*的数据     |
| 米           | JSON_SET(jsonValue, 路径, val [, 路径, val ]*)               | *返回一个 JSON 文档，设置jsonValue*、*path*、*val*的数据     |
| 米           | JSON_STORAGE_SIZE（json值）                                  | *返回用于存储jsonValue*的二进制表示形式的字节数              |
| 博           | LEAST(expr [, expr ]* )                                      | 返回最少的表达式                                             |
| 图像格式     | 左（字符串，长度）                                           | 返回*字符串*中最左边的*长度字符*                             |
| 乙           | 长度（字符串）                                               | 相当于`CHAR_LENGTH(string)`                                  |
| HS           | LEVENSHTEIN(字符串1, 字符串2)                                | *返回string1*和*string2*之间的编辑距离                       |
| 乙           | LOG(数字1 [, 数字2 ])                                        | *返回numeric1以**numeric2*为底的对数，如果*numeric2*不存在，则返回以 e 为底的对数 |
| 博           | LPAD(字符串, 长度[, 模式])                                   | 返回一个字符串或字节值，该值由前面带有*模式*的*长度**字符串*组成 |
| 乙           | TO_BASE32（字符串）                                          | *将字符串*转换为 Base-32 编码形式并返回编码字符串            |
| 乙           | FROM_BASE32（字符串）                                        | 以字符串形式返回 base-32*字符串的解码结果*                   |
| 米           | TO_BASE64（字符串）                                          | *将字符串*转换为 base-64 编码形式并返回编码字符串            |
| BM           | FROM_BASE64（字符串）                                        | 将 Base-64*字符串*的解码结果作为字符串返回                   |
| 乙           | TO_HEX（二进制）                                             | *将二进制*转换为十六进制 varchar                             |
| 乙           | FROM_HEX(varchar)                                            | 将十六进制编码的*varchar*转换为字节                          |
| 博           | LTRIM（字符串）                                              | 返回从开头删除所有空格的*字符串*                             |
| s            | 地图（）                                                     | 返回一个空地图                                               |
| s            | MAP（键，值[，键，值]*）                                     | 返回具有给定*键*/*值*对的映射                                |
| s            | MAP_CONCAT(地图[,地图]*)                                     | 连接一个或多个地图。如果任何输入参数是`NULL`该函数返回`NULL`。请注意，方解石使用的是 LAST_WIN 策略 |
| s            | MAP_ENTRIES（地图）                                          | *以数组形式返回映射*的条目，条目的顺序未定义                 |
| s            | MAP_KEYS（地图）                                             | *以数组形式返回映射*的键，条目的顺序未定义                   |
| s            | MAP_VALUES（地图）                                           | *以数组形式返回映射*的值，条目的顺序未定义                   |
| s            | MAP_FROM_ARRAYS（数组1，数组2）                              | *返回从array1*和*array2*创建的映射。请注意，两个数组的长度应该相同，方解石使用 LAST_WIN 策略 |
| s            | MAP_FROM_ENTRIES（行数组）                                   | 返回从具有两个字段的行数组创建的映射。注意一行中的字段数必须为2。注意方解石使用的是LAST_WIN策略 |
| s            | STR_TO_MAP(字符串[, stringDelimiter [, keyValueDelimiter]])  | *使用分隔符将字符串*拆分为键/值对后返回映射。stringDelimiter 的默认分隔符为“,” ， *keyValueDelimiter的默认**分隔*符为“:” 。请注意，方解石使用的是 LAST_WIN 策略 |
| 图像格式     | MD5（字符串）                                                | *计算字符串*的 MD5 128 位校验和并将其作为十六进制字符串返回  |
| 米           | 月份名称（日期）                                             | *返回datetime*中月份的名称（在连接的区域设置中）；例如，它对于 DATE '2020-02-10' 和 TIMESTAMP '2020-02-10 10:10:10' 都返回 '二月' |
| 哦           | NVL(值1,值2)                                                 | 如果*value1*不为 null，则返回*value1 ，否则返回**value2*     |
| 乙           | 偏移量(索引)                                                 | 对数组进行索引时，将*index*包裹起来会返回从 0 开始的*索引处*`OFFSET`的值；*如果索引*越界则抛出错误 |
| 乙           | 序数（索引）                                                 | 类似于`OFFSET`除了*索引*从 1 开始                            |
| 乙           | PARSE_DATE（格式，字符串）                                   | 使用 format 指定的*格式将日期的**字符串*表示形式转换为 DATE 值 |
| 乙           | PARSE_DATETIME（格式，字符串）                               | 使用 format 指定的*格式将日期时间的**字符串*表示形式转换为 TIMESTAMP 值 |
| 乙           | PARSE_TIME（格式，字符串）                                   | 使用 format 指定的*格式将时间的**字符串*表示形式转换为 TIME 值 |
| 乙           | PARSE_TIMESTAMP（格式，字符串[，时区]）                      | 使用 format 指定的*格式将时间戳的**字符串*表示形式转换为*timeZone*中的 TIMESTAMP WITH LOCAL TIME ZONE 值 |
| HS           | PARSE_URL（urlString，partToExtract [，keyToExtract]）       | 从*urlString*返回指定的*partToExtract*。*partToExtract*的有效值包括 HOST、PATH、QUERY、REF、PROTOCOL、AUTHORITY、FILE 和 USERINFO。*keyToExtract*指定要提取的查询 |
| 乙           | POW(数字1,数字2)                                             | 返回*numeric1的**numeric2*次方                               |
| 乙           | REGEXP_CONTAINS（字符串，正则表达式）                        | 返回*字符串是否与正则**表达式*部分匹配                       |
| 乙           | REGEXP_EXTRACT(字符串, 正则表达式 [, 位置 [, 出现次数]])     | *返回string中与**regexp*匹配的子字符串，从*位置*（默认 1）开始搜索，直到找到第 n 个*匹配项*（默认 1）。如果没有匹配则返回NULL |
| 乙           | REGEXP_EXTRACT_ALL（字符串，正则表达式）                     | *返回string中与**regexp*匹配的所有子字符串的数组。如果没有匹配则返回空数组 |
| 乙           | REGEXP_INSTR(字符串, 正则表达式 [, 位置 [, 出现次数 [, 出现位置]]]) | *返回string中与**regexp*匹配的子字符串的从 1 开始的最低位置，从*位置*（默认 1）开始搜索，直到找到第 n 个*匹配项*（默认 1）。将occurrence_position（默认0）设置为1返回子字符串的结束位置+1。如果没有匹配则返回0 |
| 蒙特利尔银行 | REGEXP_REPLACE（字符串，正则表达式，代表[，位置[，出现次数[，匹配类型]]]） | 将与*regexp*匹配的*字符串*的所有子字符串替换为 expr 中起始*位置处的**rep*（如果省略，默认为 1），*occurrence*指定要搜索的匹配项的出现次数（如果省略，默认为 1），*matchType*指定如何执行匹配 |
| 乙           | REGEXP_SUBSTR(string, regexp [, position [, occurrence]])    | Synonym for REGEXP_EXTRACT                                   |
| b m p        | REPEAT(string, integer)                                      | Returns a string consisting of *string* repeated of *integer* times; returns an empty string if *integer* is less than 1 |
| b m          | REVERSE(string)                                              | Returns *string* with the order of the characters reversed   |
| b m p        | RIGHT(string, length)                                        | Returns the rightmost *length* characters from the *string*  |
| h s          | string1 RLIKE string2                                        | Whether *string1* matches regex pattern *string2* (similar to `LIKE`, but uses Java regex) |
| h s          | string1 NOT RLIKE string2                                    | Whether *string1* does not match regex pattern *string2* (similar to `NOT LIKE`, but uses Java regex) |
| b o          | RPAD(string, length[, pattern ])                             | Returns a string or bytes value that consists of *string* appended to *length* with *pattern* |
| b o          | RTRIM(string)                                                | Returns *string* with all blanks removed from the end        |
| b            | SAFE_ADD(numeric1, numeric2)                                 | Returns *numeric1* + *numeric2*, or NULL on overflow         |
| b            | SAFE_CAST(value AS type)                                     | Converts *value* to *type*, returning NULL if conversion fails |
| b            | SAFE_DIVIDE(numeric1, numeric2)                              | Returns *numeric1* / *numeric2*, or NULL on overflow or if *numeric2* is zero |
| b            | SAFE_MULTIPLY(numeric1, numeric2)                            | Returns *numeric1* * *numeric2*, or NULL on overflow         |
| b            | SAFE_NEGATE(numeric)                                         | Returns *numeric* * -1, or NULL on overflow                  |
| b            | SAFE_OFFSET(index)                                           | Similar to `OFFSET` except null is returned if *index* is out of bounds |
| b            | SAFE_ORDINAL(index)                                          | Similar to `OFFSET` except *index* begins at 1 and null is returned if *index* is out of bounds |
| b            | SAFE_SUBTRACT(numeric1, numeric2)                            | Returns *numeric1* - *numeric2*, or NULL on overflow         |
| *            | SEC(numeric)                                                 | Returns the secant of *numeric* in radians                   |
| *            | SECH(numeric)                                                | Returns the hyperbolic secant of *numeric*                   |
| b m p        | SHA1(string)                                                 | Calculates a SHA-1 hash value of *string* and returns it as a hex string |
| b p          | SHA256(string)                                               | Calculates a SHA-256 hash value of *string* and returns it as a hex string |
| b p          | SHA512(string)                                               | Calculates a SHA-512 hash value of *string* and returns it as a hex string |
| *            | SINH(numeric)                                                | Returns the hyperbolic sine of *numeric*                     |
| b m o p      | SOUNDEX(string)                                              | Returns the phonetic representation of *string*; throws if *string* is encoded with multi-byte encoding such as UTF-8 |
| s            | SOUNDEX(string)                                              | Returns the phonetic representation of *string*; return original *string* if *string* is encoded with multi-byte encoding such as UTF-8 |
| m            | SPACE(integer)                                               | Returns a string of *integer* spaces; returns an empty string if *integer* is less than 1 |
| b            | SPLIT(string [, delimiter ])                                 | Returns the string array of *string* split at *delimiter* (if omitted, default is comma) |
| b            | STARTS_WITH(string1, string2)                                | Returns whether *string2* is a prefix of *string1*           |
| m            | STRCMP(string, string)                                       | Returns 0 if both of the strings are same and returns -1 when the first argument is smaller than the second and 1 when the second one is smaller than the first one |
| b p          | STRPOS(string, substring)                                    | Equivalent to `POSITION(substring IN string)`                |
| b m o p      | SUBSTR(string, position [, substringLength ])                | Returns a portion of *string*, beginning at character *position*, *substringLength* characters long. SUBSTR calculates lengths using characters as defined by the input character set |
| *            | TANH(numeric)                                                | Returns the hyperbolic tangent of *numeric*                  |
| b            | TIME(hour, minute, second)                                   | Returns a TIME value *hour*, *minute*, *second* (all of type INTEGER) |
| b            | TIME(timestamp)                                              | Extracts the TIME from *timestamp* (a local time; BigQuery’s DATETIME type) |
| b            | TIME(instant)                                                | Extracts the TIME from *timestampLtz* (an instant; BigQuery’s TIMESTAMP type), assuming UTC |
| b            | TIME(instant, timeZone)                                      | Extracts the time from *timestampLtz* (an instant; BigQuery’s TIMESTAMP type), in *timeZone* |
| b            | TIMESTAMP(string)                                            | Equivalent to `CAST(string AS TIMESTAMP WITH LOCAL TIME ZONE)` |
| b            | TIMESTAMP(string, timeZone)                                  | Equivalent to `CAST(string AS TIMESTAMP WITH LOCAL TIME ZONE)`, converted to *timeZone* |
| b            | TIMESTAMP(date)                                              | Converts *date* to a TIMESTAMP WITH LOCAL TIME ZONE value (at midnight) |
| b            | TIMESTAMP(date, timeZone)                                    | Converts *date* to a TIMESTAMP WITH LOCAL TIME ZONE value (at midnight), in *timeZone* |
| b            | TIMESTAMP(timestamp)                                         | Converts *timestamp* to a TIMESTAMP WITH LOCAL TIME ZONE, assuming a UTC |
| b            | TIMESTAMP(timestamp, timeZone)                               | Converts *timestamp* to a TIMESTAMP WITH LOCAL TIME ZONE, in *timeZone* |
| b            | TIMESTAMP_ADD(timestamp, interval)                           | Returns the TIMESTAMP value that occurs *interval* after *timestamp* |
| b            | TIMESTAMP_DIFF(timestamp, timestamp2, timeUnit)              | Returns the whole number of *timeUnit* between *timestamp* and *timestamp2*. Equivalent to `TIMESTAMPDIFF(timeUnit, timestamp2, timestamp)` and `(timestamp - timestamp2) timeUnit` |
| b            | TIMESTAMP_MICROS(integer)                                    | Returns the TIMESTAMP that is *integer* microseconds after 1970-01-01 00:00:00 |
| b            | TIMESTAMP_MILLIS(integer)                                    | Returns the TIMESTAMP that is *integer* milliseconds after 1970-01-01 00:00:00 |
| b            | TIMESTAMP_SECONDS(integer)                                   | Returns the TIMESTAMP that is *integer* seconds after 1970-01-01 00:00:00 |
| b            | TIMESTAMP_SUB(timestamp, interval)                           | Returns the TIMESTAMP value that is *interval* before *timestamp* |
| b            | TIMESTAMP_TRUNC(timestamp, timeUnit)                         | Truncates *timestamp* to the granularity of *timeUnit*, rounding to the beginning of the unit |
| b            | TIME_ADD(time, interval)                                     | Adds *interval* to *time*, independent of any time zone      |
| b            | TIME_DIFF(time, time2, timeUnit)                             | Returns the whole number of *timeUnit* between *time* and *time2* |
| b            | TIME_SUB(time, interval)                                     | Returns the TIME value that is *interval* before *time*      |
| b            | TIME_TRUNC(time, timeUnit)                                   | Truncates *time* to the granularity of *timeUnit*, rounding to the beginning of the unit |
| m o p        | TO_CHAR(timestamp, format)                                   | Converts *timestamp* to a string using the format *format*   |
| b            | TO_CODE_POINTS(string)                                       | Converts *string* to an array of integers that represent code points or extended ASCII character values |
| o p          | TO_DATE(string, format)                                      | Converts *string* to a date using the format *format*        |
| o p          | TO_TIMESTAMP(string, format)                                 | Converts *string* to a timestamp using the format *format*   |
| b o p        | TRANSLATE(expr, fromString, toString)                        | Returns *expr* with all occurrences of each character in *fromString* replaced by its corresponding character in *toString*. Characters in *expr* that are not in *fromString* are not replaced |
| b            | TRUNC(numeric1 [, numeric2 ])                                | Truncates *numeric1* to optionally *numeric2* (if not specified 0) places right to the decimal point |
| q            | TRY_CAST(value AS type)                                      | Converts *value* to *type*, returning NULL if conversion fails |
| b            | UNIX_MICROS(timestamp)                                       | Returns the number of microseconds since 1970-01-01 00:00:00 |
| b            | UNIX_MILLIS(timestamp)                                       | Returns the number of milliseconds since 1970-01-01 00:00:00 |
| b            | UNIX_SECONDS(timestamp)                                      | Returns the number of seconds since 1970-01-01 00:00:00      |
| b            | UNIX_DATE(date)                                              | Returns the number of days since 1970-01-01                  |
| s            | URL_DECODE(string)                                           | 使用特定的编码方案解码“application/x-www-form-urlencoded”格式的字符串*，*解码错误时返回原始*字符串* |
| s            | URL_ENCODE（字符串）                                         | 使用特定的编码方案将*字符串*转换为“application/x-www-form-urlencoded”格式 |
| 哦           | XMLTRANSFORM（xml，xslt）                                    | 将 XSLT 转换*xslt*转换为 XML 字符串*xml*并返回结果           |

笔记：

- Calcite 没有 Redshift 库，因此使用 Postgres 库。这些函数`DATEADD`是`DATEDIFF`在 Redshift 而不是 Postgres 中实现的，但仍然出现在 Calcite 的 Postgres 库中

- 函数`DATEADD`, `DATEDIFF`,`DATE_PART`需要 Babel 解析器

- `JSON_TYPE`///如果参数为null则`JSON_DEPTH`返回`JSON_PRETTY`null`JSON_STORAGE_SIZE`

- `JSON_LENGTH`//如果第一个参数为null则返回`JSON_KEYS`null`JSON_REMOVE`

- ```plaintext
  JSON_TYPE
  ```

  通常返回一个大写字符串标志，指示 JSON 输入的类型。目前支持的类型标志有：

  - 整数
  - 细绳
  - 漂浮
  - 双倍的
  - 长的
  - 布尔值
  - 日期
  - 目的
  - 大批
  - 无效的

- ```plaintext
  JSON_DEPTH
  ```

  定义 JSON 值的深度如下：

  - 空数组、空对象或标量值的深度为 1；
  - 仅包含深度为 1 的元素的非空数组或仅包含深度为 1 的成员值的非空对象的深度为 2；
  - 否则，JSON 文档的深度大于 2。

- ```plaintext
  JSON_LENGTH
  ```

  定义 JSON 值的长度如下：

  - 标量值的长度为 1；
  - 数组或对象的长度是包含的元素数量。

方言特定的聚合函数。

| C    | 运算符语法                                                   | 描述                                                         |
| :--- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| C    | 骨料(m)                                                      | 在当前 GROUP BY 键的上下文中计算度量*m*                      |
| BP   | ARRAY_AGG( [ ALL \| DISTINCT ] 值 [ 尊重 NULLS \| 忽略 NULLS ] [ ORDER BY orderItem [, orderItem ]* ] ) | 将值收集到数组中                                             |
| BP   | ARRAY_CONCAT_AGG([ ALL \| DISTINCT ] 值 [ ORDER BY orderItem [, orderItem ]* ] ) | 将数组连接成数组                                             |
| p    | BOOL_AND（条件）                                             | 同义词`EVERY`                                                |
| p    | BOOL_OR（条件）                                              | 同义词`SOME`                                                 |
| 乙   | COUNTIF(条件)                                                | *返回条件*为 TRUE 的行数；相当于`COUNT(*) FILTER (WHERE condition)` |
| 米   | GROUP_CONCAT( [ ALL \| DISTINCT ] value [, value ]* [ ORDER BY orderItem [, orderItem ]* ] [ SEPARATOR 分隔符 ] ) | MySQL 特定的变体`LISTAGG`                                    |
| 乙   | 逻辑与（条件）                                               | 同义词`EVERY`                                                |
| 乙   | LOGICAL_OR（条件）                                           | 同义词`SOME`                                                 |
| s    | MAX_BY（值，补偿）                                           | 同义词`ARG_MAX`                                              |
| s    | MIN_BY（值，补偿）                                           | 同义词`ARG_MIN`                                              |
| 乙   | PERCENTILE_CONT(值, 分数 [ RESPECT NULLS \| IGNORE NULLS ] ) OVER windowSpec | 标准的同义词`PERCENTILE_CONT`，`PERCENTILE_CONT(value, fraction) OVER (ORDER BY value)`相当于标准`PERCENTILE_CONT(fraction) WITHIN GROUP (ORDER BY value)` |
| 乙   | PERCENTILE_DISC(值, 分数 [ RESPECT NULLS \| IGNORE NULLS ] ) OVER windowSpec | 标准的同义词`PERCENTILE_DISC`，`PERCENTILE_DISC(value, fraction) OVER (ORDER BY value)`相当于标准`PERCENTILE_DISC(fraction) WITHIN GROUP (ORDER BY value)` |
| BP   | STRING_AGG( [ ALL \| DISTINCT ] 值 [, 分隔符] [ ORDER BY orderItem [, orderItem ]* ] ) | 同义词`LISTAGG`                                              |

用法示例：

##### JSON_TYPE 示例

SQL

```
SELECT JSON_TYPE(v) AS c1,
  JSON_TYPE(JSON_VALUE(v, 'lax $.b' ERROR ON ERROR)) AS c2,
  JSON_TYPE(JSON_VALUE(v, 'strict $.a[0]' ERROR ON ERROR)) AS c3,
  JSON_TYPE(JSON_VALUE(v, 'strict $.a[1]' ERROR ON ERROR)) AS c4
FROM (VALUES ('{"a": [10, true],"b": "[10, true]"}')) AS t(v)
LIMIT 10;
```

结果

|  C1  |  C2  |  C3  |   C4   |
| :--: | :--: | :--: | :----: |
| 目的 | 大批 | 整数 | 布尔值 |

##### JSON_DEPTH 示例

SQL

```
SELECT JSON_DEPTH(v) AS c1,
  JSON_DEPTH(JSON_VALUE(v, 'lax $.b' ERROR ON ERROR)) AS c2,
  JSON_DEPTH(JSON_VALUE(v, 'strict $.a[0]' ERROR ON ERROR)) AS c3,
  JSON_DEPTH(JSON_VALUE(v, 'strict $.a[1]' ERROR ON ERROR)) AS c4
FROM (VALUES ('{"a": [10, true],"b": "[10, true]"}')) AS t(v)
LIMIT 10;
```

结果

|  C1  |  C2  |  C3  |  C4  |
| :--: | :--: | :--: | :--: |
|  3   |  2   |  1   |  1   |

##### JSON_LENGTH 示例

SQL

```
SELECT JSON_LENGTH(v) AS c1,
  JSON_LENGTH(v, 'lax $.a') AS c2,
  JSON_LENGTH(v, 'strict $.a[0]') AS c3,
  JSON_LENGTH(v, 'strict $.a[1]') AS c4
FROM (VALUES ('{"a": [10, true]}')) AS t(v)
LIMIT 10;
```

结果

|  C1  |  C2  |  C3  |  C4  |
| :--: | :--: | :--: | :--: |
|  1   |  2   |  1   |  1   |

##### JSON_INSERT 示例

SQL

```SQL
SELECT JSON_INSERT(v, '$.a', 10, '$.c', '[1]') AS c1,
  JSON_INSERT(v, '$', 10, '$.c', '[1]') AS c2
FROM (VALUES ('{"a": [10, true]}')) AS t(v)
LIMIT 10;
```



结果

| C1                             | C2                             |
| ------------------------------ | ------------------------------ |
| {“a”：1，“b”：[2]，“c”：“[1]”} | {“a”：1，“b”：[2]，“c”：“[1]”} |

##### JSON_KEYS 示例

SQL

```
SELECT JSON_KEYS(v) AS c1,
  JSON_KEYS(v, 'lax $.a') AS c2,
  JSON_KEYS(v, 'lax $.b') AS c2,
  JSON_KEYS(v, 'strict $.a[0]') AS c3,
  JSON_KEYS(v, 'strict $.a[1]') AS c4
FROM (VALUES ('{"a": [10, true],"b": {"c": 30}}')) AS t(v)
LIMIT 10;
```

结果

|     C1     |   C2   |  C3   |   C4   |   C5   |
| :--------: | :----: | :---: | :----: | :----: |
| [“a”，“b”] | 无效的 | [“C”] | 无效的 | 无效的 |

##### JSON_REMOVE 示例

SQL

```
SELECT JSON_REMOVE(v, '$[1]') AS c1
FROM (VALUES ('["a", ["b", "c"], "d"]')) AS t(v)
LIMIT 10;
```

结果

|    C1    |
| :------: |
| [“广告”] |

##### JSON_REPLACE 示例

SQL

```SQL
SELECT
JSON_REPLACE(v, '$.a', 10, '$.c', '[1]') AS c1,
JSON_REPLACE(v, '$', 10, '$.c', '[1]') AS c2
FROM (VALUES ('{\"a\": 1,\"b\":[2]}')) AS t(v)
limit 10;
```



结果

| C1                             | C2                              |
| ------------------------------ | ------------------------------- |
| {“a”：1，“b”：[2]，“c”：“[1]”} | {“a”:1 , “b”:[2] , “c”:“[1]”}”) |

##### JSON_SET 示例

SQL

```SQL
SELECT
JSON_SET(v, '$.a', 10, '$.c', '[1]') AS c1,
JSON_SET(v, '$', 10, '$.c', '[1]') AS c2
FROM (VALUES ('{\"a\": 1,\"b\":[2]}')) AS t(v)
limit 10;
```



结果

| C1                  | C2   |
| ------------------- | ---- |
| {“a”：10，“b”：[2]} | 10   |

##### JSON_STORAGE_SIZE 示例

SQL

```
SELECT
JSON_STORAGE_SIZE('[100, \"sakila\", [1, 3, 5], 425.05]') AS c1,
JSON_STORAGE_SIZE('{\"a\": 10, \"b\": \"a\", \"c\": \"[1, 3, 5, 7]\"}') AS c2,
JSON_STORAGE_SIZE('{\"a\": 10, \"b\": \"xyz\", \"c\": \"[1, 3, 5, 7]\"}') AS c3,
JSON_STORAGE_SIZE('[100, \"json\", [[10, 20, 30], 3, 5], 425.05]') AS c4
limit 10;
```

结果

|  C1  |  C2  |  C3  |  C4  |
| :--: | :--: | :--: | :--: |
|  29  |  35  |  37  |  36  |

#### 解码示例

SQL

```
SELECT DECODE(f1, 1, 'aa', 2, 'bb', 3, 'cc', 4, 'dd', 'ee') as c1,
  DECODE(f2, 1, 'aa', 2, 'bb', 3, 'cc', 4, 'dd', 'ee') as c2,
  DECODE(f3, 1, 'aa', 2, 'bb', 3, 'cc', 4, 'dd', 'ee') as c3,
  DECODE(f4, 1, 'aa', 2, 'bb', 3, 'cc', 4, 'dd', 'ee') as c4,
  DECODE(f5, 1, 'aa', 2, 'bb', 3, 'cc', 4, 'dd', 'ee') as c5
FROM (VALUES (1, 2, 3, 4, 5)) AS t(f1, f2, f3, f4, f5);
```

结果

|  C1  |  C2  |  C3  |  C4  |  C5  |
| :--: | :--: | :--: | :--: | :--: |
|  啊  |  BB  | 抄送 |  DD  |  伊  |

#### 翻译示例

SQL

```
SELECT TRANSLATE('Aa*Bb*Cc''D*d', ' */''%', '_') as c1,
  TRANSLATE('Aa/Bb/Cc''D/d', ' */''%', '_') as c2,
  TRANSLATE('Aa Bb Cc''D d', ' */''%', '_') as c3,
  TRANSLATE('Aa%Bb%Cc''D%d', ' */''%', '_') as c4
FROM (VALUES (true)) AS t(f0);
```

结果

|     C1      |     C2      |     C3      |     C4      |
| :---------: | :---------: | :---------: | :---------: |
| Aa_Bb_CcD_d | Aa_Bb_CcD_d | Aa_Bb_CcD_d | Aa_Bb_CcD_d |

## 用户定义函数

方解石是可延伸的。您可以使用用户代码定义每种函数。对于每种函数，通常有多种定义函数的方法，从方便到高效。

要实现*标量函数*，有 3 个选项：

- 创建一个具有公共静态方法的类`eval`，并注册该类；
- 创建一个具有公共非静态`eval`方法和不带参数的公共构造函数的类，并注册该类；
- 创建一个具有一个或多个公共静态方法的类，并注册每个类/方法组合。

要实现*聚合函数*，有两种选择：

- 创建一个具有 public static 和方法的类`init`，`add`并`result`注册该类；
- 创建一个具有公共非静态 和 方法的类`init`，以及一个不带参数的公共构造函数，并注册该类。`add``result`

`merge`（可选）向类添加公共方法；这允许 Calcite 生成合并小计的代码。

（可选）让您的类实现 [SqlSplittableAggFunction](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/SqlSplittableAggFunction.html) 接口；这使得 Calcite 可以跨多个聚合阶段分解函数，从汇总表中汇总，并通过连接推送它。

要实现*表函数*，有 3 个选项：

- `eval`创建一个具有返回 [ScannableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ScannableTable.html) 或 [QueryableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/QueryableTable.html)的静态方法的类，并注册该类；
- `eval`创建一个具有返回 [ScannableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ScannableTable.html) 或 [QueryableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/QueryableTable.html)的非静态方法的类，并注册该类；
- 创建一个具有一个或多个返回 [ScannableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ScannableTable.html) 或 [QueryableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/QueryableTable.html)的公共静态方法的类，并注册每个类/方法组合。

要实现*表宏*，有 3 个选项：

- `eval`创建一个具有返回 [TranslatableTable 的](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TranslatableTable.html)静态方法的类，并注册该类；
- `eval`创建一个具有返回 [TranslatableTable 的](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TranslatableTable.html)非静态方法的类，并注册该类；
- 创建一个具有一个或多个返回 [TranslatableTable 的](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TranslatableTable.html)公共静态方法的类，并注册每个类/方法组合。

Calcite 从实现函数的 Java 方法的参数和返回类型推导出函数的参数类型和结果类型。[此外，您可以使用参数](https://calcite.apache.org/javadocAggregate/org/apache/calcite/linq4j/function/Parameter.html)注释指定每个参数的名称和可选性 。

### 使用命名参数和可选参数调用函数

通常，当您调用函数时，需要按顺序指定其所有参数。但如果函数有很多参数，特别是如果您想随着时间的推移添加更多参数，这可能会成为问题。

为了解决这个问题，SQL 标准允许您按名称传递参数，并定义可选参数（即，具有默认值，如果未指定则使用默认值）。

假设您有一个 function `f`，声明如下伪语法：

```
FUNCTION f(
  INTEGER a,
  INTEGER b DEFAULT NULL,
  INTEGER c,
  INTEGER d DEFAULT NULL,
  INTEGER e DEFAULT NULL) RETURNS INTEGER
```

该函数的所有参数都有名称和parameters，并且 有默认值`b`，因此都是可选的。（在方解石中，是可选参数唯一允许的默认值； [将来](https://issues.apache.org/jira/browse/CALCITE-947)可能会改变。）`d``e``NULL``NULL`

当调用带有可选参数的函数时，可以省略列表末尾的可选参数，或者`DEFAULT` 对任何可选参数使用关键字。这里有些例子：

- `f(1, 2, 3, 4, 5)`按顺序为每个参数提供一个值；
- `f(1, 2, 3, 4)`省略`e`，获取其默认值`NULL`;
- `f(1, DEFAULT, 3)`省略`d`和`e`，并指定使用默认值`b`;
- `f(1, DEFAULT, 3, DEFAULT, DEFAULT)`和前面的例子效果一样；
- `f(1, 2)`不合法，因为`c`不是可选的；
- `f(1, 2, DEFAULT, 4)`不合法，因为`c`不是可选的。

您可以使用语法按名称指定参数`=>`。如果一个参数被命名，那么它们都必须被命名。参数可以是任何其他参数，但不得多次指定任何参数，并且您需要为每个参数提供一个不可选的值。这里有些例子：

- `f(c => 3, d => 1, a => 0)`相当于`f(0, NULL, 3, 1, NULL)`；
- `f(c => 3, d => 1)`不合法，因为您尚未指定 的值 `a`并且`a`不是可选的。

### SQL Hint

提示是给优化器的指令。在编写SQL时，您可能会知道优化器未知的数据信息。提示使您能够做出通常由优化器做出的决策。

- 规划器执行者：没有完美的规划器，因此实现提示以允许用户更好地控制执行是有意义的。例如：“永远不要将此子查询与其他子查询合并”( `/*+ no_merge */`)；“将这些表视为前导表”( `/*+ leading */`) 以影响连接顺序等；
- 附加元数据/统计信息：一些统计信息，例如“扫描的表索引”或“某些洗牌键的倾斜信息”对于查询来说是动态的，用提示配置它们会非常方便，因为我们来自规划器的规划元数据非常方便通常不太准确；
- 算子资源限制：在很多情况下，我们会给执行算子一个默认的资源配置，即最小并行度、内存（资源消耗 UDF）、特殊资源要求（GPU 或 SSD 磁盘）……对资源进行分析会非常灵活每个查询都有提示（不是作业）。

#### 句法

方解石支持两个位置的提示：

- 查询提示：关键字后`SELECT`；
- 表提示：位于引用的表名称之后。

例如：

```
SELECT /*+ hint1, hint2(a=1, b=2) */
...
FROM
  tableName /*+ hint3(5, 'x') */
JOIN
  tableName /*+ hint4(c=id), hint5 */
...
```

语法如下：

```
hintComment:
      '/*+' hint [, hint ]* '*/'

hint:
      hintName
  |   hintName '(' optionKey '=' optionVal [, optionKey '=' optionVal ]* ')'
  |   hintName '(' hintOption [, hintOption ]* ')'

optionKey:
      simpleIdentifier
  |   stringLiteral

optionVal:
      stringLiteral

hintOption:
      simpleIdentifier
   |  numericLiteral
   |  stringLiteral
```

它在方解石中处于实验阶段，尚未完全实施，我们已实施的是：

- 解析器支持上述语法；
- `RelHint`代表一个提示项；
- 在 sql-to-rel 转换和规划器规划期间传播提示的机制。

我们还没有添加任何内置提示项，如果我们认为提示足够稳定，我们会引入更多。

### MATCH_识别

`MATCH_RECOGNIZE`是一个 SQL 扩展，用于识别复杂事件处理 (CEP) 中的事件序列。

它在方解石中处于实验阶段，但尚未完全实施。

#### 句法

```
matchRecognize:
      MATCH_RECOGNIZE '('
      [ PARTITION BY expression [, expression ]* ]
      [ ORDER BY orderItem [, orderItem ]* ]
      [ MEASURES measureColumn [, measureColumn ]* ]
      [ ONE ROW PER MATCH | ALL ROWS PER MATCH ]
      [ AFTER MATCH skip ]
      PATTERN '(' pattern ')'
      [ WITHIN intervalLiteral ]
      [ SUBSET subsetItem [, subsetItem ]* ]
      DEFINE variable AS condition [, variable AS condition ]*
      ')'

skip:
      SKIP TO NEXT ROW
  |   SKIP PAST LAST ROW
  |   SKIP TO FIRST variable
  |   SKIP TO LAST variable
  |   SKIP TO variable

subsetItem:
      variable = '(' variable [, variable ]* ')'

measureColumn:
      expression AS alias

pattern:
      patternTerm [ '|' patternTerm ]*

patternTerm:
      patternFactor [ patternFactor ]*

patternFactor:
      patternPrimary [ patternQuantifier ]

patternPrimary:
      variable
  |   '$'
  |   '^'
  |   '(' [ pattern ] ')'
  |   '{-' pattern '-}'
  |   PERMUTE '(' pattern [, pattern ]* ')'

patternQuantifier:
      '*'
  |   '*?'
  |   '+'
  |   '+?'
  |   '?'
  |   '??'
  |   '{' { [ minRepeat ], [ maxRepeat ] } '}' ['?']
  |   '{' repeat '}'

intervalLiteral:
      INTERVAL 'string' timeUnit [ TO timeUnit ]
```

在*patternQuantifier*中，*repeat*是正整数，*minRepeat*和*maxRepeat*是非负整数。

### DDL 扩展

DDL 扩展仅在 calcite-server 模块中可用。要启用，请包含`calcite-server.jar`在类路径中，并添加 `parserFactory=org.apache.calcite.sql.parser.ddl.SqlDdlParserImpl#FACTORY` 到 JDBC 连接字符串（请参阅连接字符串属性 [parserFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#PARSER_FACTORY)）。

```
ddlStatement:
      createSchemaStatement
  |   createForeignSchemaStatement
  |   createTableStatement
  |   createTableLikeStatement
  |   createViewStatement
  |   createMaterializedViewStatement
  |   createTypeStatement
  |   createFunctionStatement
  |   dropSchemaStatement
  |   dropForeignSchemaStatement
  |   dropTableStatement
  |   dropViewStatement
  |   dropMaterializedViewStatement
  |   dropTypeStatement
  |   dropFunctionStatement

createSchemaStatement:
      CREATE [ OR REPLACE ] SCHEMA [ IF NOT EXISTS ] name

createForeignSchemaStatement:
      CREATE [ OR REPLACE ] FOREIGN SCHEMA [ IF NOT EXISTS ] name
      (
          TYPE 'type'
      |   LIBRARY 'com.example.calcite.ExampleSchemaFactory'
      )
      [ OPTIONS '(' option [, option ]* ')' ]

option:
      name literal

createTableStatement:
      CREATE TABLE [ IF NOT EXISTS ] name
      [ '(' tableElement [, tableElement ]* ')' ]
      [ AS query ]

createTableLikeStatement:
      CREATE TABLE [ IF NOT EXISTS ] name LIKE sourceTable
      [ likeOption [, likeOption ]* ]

likeOption:
      { INCLUDING | EXCLUDING } { DEFAULTS | GENERATED | ALL }

createTypeStatement:
      CREATE [ OR REPLACE ] TYPE name AS
      {
          baseType
      |   '(' attributeDef [, attributeDef ]* ')'
      }

attributeDef:
      attributeName type
      [ COLLATE collation ]
      [ NULL | NOT NULL ]
      [ DEFAULT expression ]

tableElement:
      columnName type [ columnGenerator ] [ columnConstraint ]
  |   columnName
  |   tableConstraint

columnGenerator:
      DEFAULT expression
  |   [ GENERATED ALWAYS ] AS '(' expression ')'
      { VIRTUAL | STORED }

columnConstraint:
      [ CONSTRAINT name ]
      [ NOT ] NULL

tableConstraint:
      [ CONSTRAINT name ]
      {
          CHECK '(' expression ')'
      |   PRIMARY KEY '(' columnName [, columnName ]* ')'
      |   UNIQUE '(' columnName [, columnName ]* ')'
      }

createViewStatement:
      CREATE [ OR REPLACE ] VIEW name
      [ '(' columnName [, columnName ]* ')' ]
      AS query

createMaterializedViewStatement:
      CREATE MATERIALIZED VIEW [ IF NOT EXISTS ] name
      [ '(' columnName [, columnName ]* ')' ]
      AS query

createFunctionStatement:
      CREATE [ OR REPLACE ] FUNCTION [ IF NOT EXISTS ] name
      AS classNameLiteral
      [ USING  usingFile [, usingFile ]* ]

usingFile:
      { JAR | FILE | ARCHIVE } filePathLiteral

dropSchemaStatement:
      DROP SCHEMA [ IF EXISTS ] name

dropForeignSchemaStatement:
      DROP FOREIGN SCHEMA [ IF EXISTS ] name

dropTableStatement:
      DROP TABLE [ IF EXISTS ] name

dropViewStatement:
      DROP VIEW [ IF EXISTS ] name

dropMaterializedViewStatement:
      DROP MATERIALIZED VIEW [ IF EXISTS ] name

dropTypeStatement:
      DROP TYPE [ IF EXISTS ] name

dropFunctionStatement:
      DROP FUNCTION [ IF EXISTS ] name
```

在*createTableStatement*中，如果指定*AS query ，则可以省略**tableElement*列表 ，或者可以省略任何*tableElement*的数据类型，在这种情况下，它只是重命名基础列。

在*columnGenerator*中，如果未指定`VIRTUAL`或`STORED`对于生成的列，`VIRTUAL`则为默认值。

在*createFunctionStatement*和*usingFile*中，*classNameLiteral* 和*filePathLiteral*是字符文字。

#### 声明用户定义类型的对象

在架构中定义并安装对象类型后，您可以使用它在任何 SQL 块中声明对象。例如，您可以使用对象类型来指定属性、列、变量、绑定变量、记录字段、表元素、形式参数或函数结果的数据类型。在运行时，创建对象类型的实例；也就是说，该类型的对象被实例化。每个对象可以保存不同的值。

例如，我们可以声明类型`address_typ`和`employee_typ`：

```
CREATE TYPE address_typ AS (
   street          VARCHAR(30),
   city            VARCHAR(20),
   state           CHAR(2),
   postal_code     VARCHAR(6));

CREATE TYPE employee_typ AS (
  employee_id       DECIMAL(6),
  first_name        VARCHAR(20),
  last_name         VARCHAR(25),
  email             VARCHAR(25),
  phone_number      VARCHAR(20),
  hire_date         DATE,
  job_id            VARCHAR(10),
  salary            DECIMAL(8,2),
  commission_pct    DECIMAL(2,2),
  manager_id        DECIMAL(6),
  department_id     DECIMAL(4),
  address           address_typ);
```

使用这些类型，您可以实例化对象，如下所示：

```
employee_typ(315, 'Francis', 'Logan', 'FLOGAN',
    '555.777.2222', DATE '2004-05-01', 'SA_MAN', 11000, .15, 101, 110,
     address_typ('376 Mission', 'San Francisco', 'CA', '94222'))
```



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

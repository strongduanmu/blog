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

`GROUP BY DISTINCT` 删除重复的分组集（例如：`GROUP BY DISTINCT GROUPING SETS ((a), (a, b), (a))` 等价于 `GROUP BY GROUPING SETS ((a), (a, b))`），`GROUP BY ALL` 和 `GROUP BY` 是等价的。

`selectWithoutFrom` 等价于 `VALUES`，但它不是标准 SQL，并且仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isMinusAllowed--)中允许使用。

`MINUS` 等价于 `EXCEPT`，但不是标准 SQL，仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isMinusAllowed--)中允许使用。

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

带引号的标识符，例如 `"Employee Name"` ，以双引号开头和结尾。它们几乎可以包含任何字符，包括空格和其他标点符号。如果你希望在标识符中包含双引号，请使用另一个双引号对其进行转义，例如：`"An employee called ""Fred""."`。

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
| CHAR(n), CHARACTER(n)             | 定长字符串                   | 'Hello'、''（空字符串）、_latin1'Hello'、n'Hello'、_UTF16'Hello'、'Hello' 'there'（字面量分为多个部分）、e'Hello\nthere'（字面量包含 C 风格的转义符） |
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

`timeUnit` 包含了以下可选值：

```sql
timeUnit:
  MILLENNIUM | CENTURY | DECADE | YEAR | QUARTER | MONTH | WEEK | DOY | DOW | DAY | HOUR | MINUTE | SECOND | EPOCH
```

注意：

- DATE、TIME 和 TIMESTAMP 没有时区。对于这些类型，甚至没有隐式时区，例如 UTC（如 Java 中）或本地时区。由用户或应用程序提供时区。反过来，TIMESTAMP WITH LOCAL TIME ZONE 不会在内部存储时区，但它将依赖于提供的时区来提供正确的语义。
- 仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#allowGeometry--)中才允许使用几何类型。
- 间隔字面量只能使用时间单位 YEAR、QUARTER、MONTH、WEEK、DAY、HOUR、MINUTE 和 SECOND。在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#allowPluralTimeUnits--)中，我们还允许使用复数形式：YEARS、QUARTERS、MONTHS、WEEKS、DAYS、HOURS、MINUTES 和 SECONDS。

### 非标量类型

| 类型     | 描述                         | 示例字面量                         |
| :------- | :--------------------------- | :--------------------------------- |
| ANY      | 所有类型的联合               |                                    |
| UNKNOWN  | 未知类型的值，用作占位符     |                                    |
| ROW      | 具有 1 列或多列的行          | 示例：row(f0 int null, f1 varchar) |
| MAP      | 键值对集合                   | 示例：(int, varchar) map           |
| MULTISET | 可能包含重复项的无序集合     | 示例：int multiset                 |
| ARRAY    | 可能包含重复项的有序连续集合 | 示例：varchar(10) array            |
| CURSOR   | 执行结果之上的游标           |                                    |

注意：

- 每个 `ROW` 列类型，都可以有一个可选的 `[ NULL | NOT NULL ]` 后缀，用来声明此列类型是否可为空，默认值是不可为空。

### 空间类型

空间数据使用字符串（众所周知的 [text (WKT)](https://en.wikipedia.org/wiki/Well-known_text) 编码）或者二进制字符串进行表示（众所周知的 [binary (WKB)](https://en.wikipedia.org/wiki/Well-known_binary) 编码）。

在要使用字面量的地方，应用 `ST_GeomFromText` 函数，例如 `ST_GeomFromText('POINT (30 10)')` 。

| 数据类型           | 类型编码 | WKT 中的示例                                                 |
| :----------------- | :------- | :----------------------------------------------------------- |
| GEOMETRY           | 0        | 点、曲线、曲面、几何集合的泛化                               |
| POINT              | 1        | `ST_GeomFromText('POINT (30 10)')` 是 2D 空间中的点； `ST_GeomFromText('POINT Z(30 10 2)')` 是 3D 空间中的点 |
| CURVE              | 13       | LINESTRING 的泛化                                            |
| LINESTRING         | 2        | `ST_GeomFromText('LINESTRING (30 10, 10 30, 40 40)')`        |
| SURFACE            | 14       | 多边形、多面体曲面的泛化                                     |
| POLYGON            | 3        | `ST_GeomFromText('POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))')` 是五边形； `ST_GeomFromText('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))')` 是一个有四边形孔的五边形 |
| POLYHEDRALSURFACE  | 15       |                                                              |
| GEOMETRYCOLLECTION | 7        | 零个或多个 GEOMETRY 实例的集合；多点、多线、多多边形的概括   |
| MULTIPOINT         | 4        | ST_GeomFromText('MULTIPOINT ((10 40), (40 30), (20 20), (30 10))') ` 等价于 `ST_GeomFromText('MULTIPOINT (10 40, 40 30, 20 20, 30 10)') |
| MULTICURVE         | -        | MULTILINESTRING 的泛化                                       |
| MULTILINESTRING    | 5        | `ST_GeomFromText('MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))')` |
| MULTISURFACE       | -        | MULTIPOLYGON 的泛化                                          |
| MULTIPOLYGON       | 6        | `ST_GeomFromText('MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), ((15 5, 40 10, 10 20, 5 10, 15 5)))')` |

## 运算符和函数

### 运算符优先级

运算符优先级和结合性，从高到低。

| 运算符                                            | 结合性 |
| :------------------------------------------------ | :----- |
| .                                                 | 左     |
| ::                                                | 左     |
| [ ]（集合元素）                                   | 左     |
| + -（一元加、减）                                 | 右     |
| * / % \|\|                                        | 左     |
| + -                                               | 左     |
| BETWEEN, IN, LIKE, SIMILAR, OVERLAPS, CONTAINS 等 | -      |
| < > = <= >= <> != <=>                             | 左     |
| IS NULL, IS FALSE, IS NOT TRUE 等                 | -      |
| NOT                                               | 右     |
| AND                                               | 左     |
| OR                                                | 左     |

注意：`::` 、 `<=>` 是特定于方言的，但为了完整性起见在此表中显示。

### 比较运算符

| 运算符语法                                        | 描述                                                         |
| :------------------------------------------------ | :----------------------------------------------------------- |
| value1 = value2                                   | 等于                                                         |
| value1 <> value2                                  | 不等于                                                       |
| value1 != value2                                  | 不相等（仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isBangEqualAllowed--)） |
| value1 > value2                                   | 大于                                                         |
| value1 >= value2                                  | 大于等于                                                     |
| value1 < value2                                   | 小于                                                         |
| value1 <= value2                                  | 小于等于                                                     |
| value1 <=> value2                                 | 两个值是否相等，将 null 值视为相同                           |
| value IS NULL                                     | 值是否为 null                                                |
| value IS NOT NULL                                 | 值是否不为 null                                              |
| value1 IS DISTINCT FROM value2                    | 两个值是否不相等，将 null 值视为相同                         |
| value1 IS NOT DISTINCT FROM value2                | 两个值是否相等，将 null 值视为相同                           |
| value1 BETWEEN value2 AND value3                  | value1 是否大于等于 value2 且小于等于 value3                 |
| value1 NOT BETWEEN value2 AND value3              | value1 是否小于 value2 并且大于 value3                       |
| string1 LIKE string2 [ ESCAPE string3 ]           | string1 是否与模式 string2 匹配                              |
| string1 NOT LIKE string2 [ ESCAPE string3 ]       | string1 是否与模式 string2 不匹配                            |
| string1 SIMILAR TO string2 [ ESCAPE string3 ]     | string1 是否与正则表达式 string2 匹配                        |
| string1 NOT SIMILAR TO string2 [ ESCAPE string3 ] | string1 是否与正则表达式 string2 不匹配                      |
| value IN (value [, value ]*)                      | value 是否等于列表中的值                                     |
| value NOT IN (value [, value ]*)                  | value 是否不等于列表中的每个值                               |
| value IN (sub-query)                              | value 是否等于子查询返回的行                                 |
| value NOT IN (sub-query)                          | value 是否不等于子查询返回的每一行                           |
| value comparison SOME (sub-query or collection)   | 是否值比较 SOME 的子查询或集合至少返回一行                   |
| value comparison ANY (sub-query or collection)    | `SOME` 的同义词                                              |
| value comparison ALL (sub-query or collection)    | 是否值比较 ALL 的子查询或集合返回所有值                      |
| EXISTS (sub-query)                                | 子查询是否至少返回一行                                       |
| UNIQUE (sub-query)                                | 子查询返回的行是否唯一（忽略空值）                           |

```sql
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

| 运算符语法             | 描述                                                |
| :--------------------- | :-------------------------------------------------- |
| boolean1 OR boolean2   | boolean1 为 TRUE 或者 boolean2 为 TRUE              |
| boolean1 AND boolean2  | boolean1 为 TRUE 并且 boolean2 为 TRUE              |
| NOT boolean            | 布尔值是否不为 TRUE；如果布尔值未知，则返回 UNKNOWN |
| boolean IS FALSE       | 布尔值是否为FALSE；如果布尔值未知则返回 FALSE       |
| boolean IS NOT FALSE   | 布尔值是否不为 FALSE；如果布尔值未知则返回 TRUE     |
| boolean IS TRUE        | 布尔值是否为 TRUE；如果布尔值未知则返回 FALSE       |
| boolean IS NOT TRUE    | 布尔值是否不为 TRUE；如果布尔值未知则返回 TRUE      |
| boolean IS UNKNOWN     | 布尔值是否未知                                      |
| boolean IS NOT UNKNOWN | 布尔值是否不为 UNKNOWN                              |

### 算术运算符和函数

| 运算符语法                      | 描述                                                         |
| :------------------------------ | :----------------------------------------------------------- |
| + numeric                       | 返回数字                                                     |
| - numeric                       | 返回负数                                                     |
| numeric1 + numeric2             | 返回 numeric1 加 numeric2                                    |
| numeric1 - numeric2             | 返回 numeric1 减去 numeric2                                  |
| numeric1 * numeric2             | 返回 numeric1 乘以 numeric2                                  |
| numeric1 / numeric2             | 返回 numeric1 除以 numeric2                                  |
| numeric1 % numeric2             | 作为 MOD(numeric1, numeric2)（仅在某些[一致性级别](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/validate/SqlConformance.html#isPercentRemainderAllowed--)） |
| POWER(numeric1, numeric2)       | 返回 numeric1 的 numeric2 次方                               |
| ABS(numeric)                    | 返回数字的绝对值                                             |
| MOD(numeric1, numeric2)         | 返回 numeric1 除以 numeric2 的余数（模）。仅当 numeric1 为负数时结果才为负数 |
| SQRT(numeric)                   | 返回数字的平方根                                             |
| LN(numeric)                     | 返回数值的自然对数（以 e 为底）                              |
| LOG10(numeric)                  | 返回 numeric 以 10 为底的对数                                |
| EXP(numeric)                    | 返回 e 的数值次方                                            |
| CEIL(numeric)                   | 将 numeric 向上舍入，返回大于或等于 numeric 的最小整数       |
| FLOOR(numeric)                  | 将数字向下舍入，返回小于或等于数字的最大整数                 |
| RAND([seed])                    | 生成 0 到 1（含）之间的随机双精度数，可选择使用种子初始化随机数生成器 |
| RAND_INTEGER([seed, ] numeric)  | 生成 0 到 numeric - 1（含）之间的随机整数，可选择使用种子初始化随机数生成器 |
| ACOS(numeric)                   | 返回数值的反余弦                                             |
| ASIN(numeric)                   | 返回数字的反正弦值                                           |
| ATAN(numeric)                   | 返回数值的反正切值                                           |
| ATAN2(numeric, numeric)         | 返回数字坐标的反正切值                                       |
| CBRT(numeric)                   | 返回数字的立方根                                             |
| COS(numeric)                    | 返回数字的余弦值                                             |
| COT(numeric)                    | 返回数值的余切值                                             |
| DEGREES(numeric)                | 将数值从弧度转换为度数                                       |
| PI()                            | 返回比任何其他值更接近 pi 的值                               |
| RADIANS(numeric)                | 将数值从度数转换为弧度                                       |
| ROUND(numeric1 [, numeric2])    | 将 numeric1 舍入到小数点右边可选的 numeric2（如果未指定 0）位 |
| SIGN(numeric)                   | 返回数字的符号                                               |
| SIN(numeric)                    | 返回数字的正弦值                                             |
| TAN(numeric)                    | 返回数字的正切值                                             |
| TRUNCATE(numeric1 [, numeric2]) | 将 numeric1 截断为可选的 numeric2（如果未指定 0）小数点右边的位置 |

### 字符串运算符和函数

| 运算符语法                                                   | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| string \|\| string                                           | 连接两个字符串                                               |
| CHAR_LENGTH(string)                                          | 返回字符串中的字符数                                         |
| CHARACTER_LENGTH(string)                                     | 像 CHAR_LENGTH(string) 一样，返回字符串中的字符数            |
| UPPER(string)                                                | 返回转换为大写字母的字符串                                   |
| LOWER(string)                                                | 返回转换为小写字母的字符串                                   |
| POSITION(substring IN string)                                | 返回 *string* 中 *substring* 第一次出现的位置                |
| POSITION(substring IN string FROM integer)                   | 返回从给定点开始在 *string* 中第一次出现 *substring* 的位置（非标准 SQL） |
| TRIM( { BOTH \| LEADING \| TRAILING } string1 FROM string2)  | 从 *string1* 的**开始/结束/两端**删除仅包含 *string1* 中字符的最长字符串 |
| OVERLAY(string1 PLACING string2 FROM integer [ FOR integer2 ]) | 用 *string2* 替换 *string1* 的子字符串                       |
| SUBSTRING(string FROM integer)                               | 返回从给定点开始的字符串的子字符串                           |
| SUBSTRING(string FROM integer FOR integer)                   | 返回从给定点开始、具有给定长度的字符串子字符串。             |
| INITCAP(string)                                              | 返回 *string*，其中每个单词的首字母转换为大写，其余字母转换为小写。单词是由非字母数字字符分隔的字母数字字符序列。 |

未实现：

- `SUBSTRING(string FROM regexp FOR regexp)`

### 二进制字符串运算符和函数

| 运算符语法                                                   | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| binary \|\| binary                                           | 连接两个二进制字符串                                         |
| OCTET_LENGTH(binary)                                         | 返回*二进制*的字节数                                         |
| POSITION(binary1 IN binary2)                                 | 返回 *binary1* 在 *binary2* 中第一次出现的位置               |
| POSITION(binary1 IN binary2 FROM integer)                    | 返回从给定点开始 *binary1* 在 *binary2* 中第一次出现的位置（非标准 SQL） |
| OVERLAY(binary1 PLACING binary2 FROM integer [ FOR integer2 ]) | 用 *binary2* 替换 *binary1* 的子字符串                       |
| SUBSTRING(binary FROM integer)                               | 返回从给定点开始的 *binary* 子字符串                         |
| SUBSTRING(binary FROM integer FOR integer)                   | 返回从给定点开始、具有给定长度的 *binary* 子字符串           |

### 日期/时间函数

| 运算符语法                                   | 描述                                                         |
| :------------------------------------------- | :----------------------------------------------------------- |
| LOCALTIME                                    | 以 TIME 数据类型的值返回会话时区的当前日期和时间             |
| LOCALTIME(precision)                         | 以 TIME 数据类型的值返回会话时区中的当前日期和时间，精度为 *precision* 位 |
| LOCALTIMESTAMP                               | 以 TIMESTAMP 数据类型的值返回会话时区的当前日期和时间        |
| LOCALTIMESTAMP(precision)                    | 以 TIMESTAMP 数据类型的值返回会话时区中的当前日期和时间，精度为 precision 位 |
| CURRENT_TIME                                 | 返回会话时区中的当前时间，数据类型为 TIMESTAMP WITH TIME ZONE |
| CURRENT_DATE                                 | 以 DATE 数据类型的值返回会话时区的当前日期                   |
| CURRENT_TIMESTAMP                            | 返回会话时区中的当前日期和时间，数据类型为 TIMESTAMP WITH TIME ZONE |
| EXTRACT(timeUnit FROM datetime)              | 从日期时间值表达式中提取并返回指定日期时间字段的值           |
| FLOOR(datetime TO timeUnit)                  | 将日期时间向下舍入为时间单位                                 |
| CEIL(datetime TO timeUnit)                   | 将日期时间向上舍入为时间单位                                 |
| YEAR(date)                                   | 等价于 EXTRACT(YEAR FROM date)，返回一个整数                 |
| QUARTER(date)                                | 等价于 EXTRACT(QUARTER FROM date)，返回 1 到 4 之间的整数    |
| MONTH(date)                                  | 等价于 EXTRACT(MONTH FROM date)。返回 1 到 12 之间的整数     |
| WEEK(date)                                   | 等价于 EXTRACT(WEEK FROM date)。返回 1 到 53 之间的整数      |
| DAYOFYEAR(date)                              | 等价于 EXTRACT(DOY FROM date)。返回 1 到 366 之间的整数      |
| DAYOFMONTH(date)                             | 等价于 EXTRACT(DAY FROM date)。返回 1 到 31 之间的整数       |
| DAYOFWEEK(date)                              | 等价于 EXTRACT(DOW FROM date)。返回 1 到 7 之间的整数        |
| HOUR(date)                                   | 等价于 EXTRACT(HOUR FROM date)。返回 0 到 23 之间的整数      |
| MINUTE(date)                                 | 等价于 EXTRACT(MINUTE FROM date)。返回 0 到 59 之间的整数    |
| SECOND(date)                                 | 等价于 EXTRACT(SECOND FROM date)。返回 0 到 59 之间的整数    |
| TIMESTAMPADD(timeUnit, integer, datetime)    | 返回添加了（有符号）整数时间单位间隔的日期时间。等价于 `datetime + INTERVAL 'integer' timeUnit` |
| TIMESTAMPDIFF(timeUnit, datetime, datetime2) | 返回 datetime 和 datetime2 之间的 timeUnit 间隔数（有符号）。等价于 `(datetime2 - datetime) timeUnit` |
| LAST_DAY(date)                               | 以 DATE 数据类型的值返回月份最后一天的日期；例如，对于 DATE’2020-02-10’ 和 TIMESTAMP’2020-02-10 10:10:10’，它均返回 DATE’2020-02-29’ |

在标准 SQL 中，对 niladic 函数（例如 CURRENT_DATE）的调用不接受括号。在某些一致性级别中，可以接受带括号的调用（例如 CURRENT_DATE()）。

未实现：

- `CEIL(interval)`
- `FLOOR(interval)`
- `+ interval`
- `- interval`
- `interval + interval`
- `interval - interval`
- `interval / interval`

### 系统函数

| 运算符语法     | 描述                                                       |
| :------------- | :--------------------------------------------------------- |
| USER           | 等价于 CURRENT_USER                                        |
| CURRENT_USER   | 当前执行上下文的用户名                                     |
| SESSION_USER   | 会话用户名                                                 |
| SYSTEM_USER    | 返回操作系统识别的当前数据存储用户的名称                   |
| CURRENT_PATH   | 返回一个字符串，表示当前查找范围以引用用户定义的例程和类型 |
| CURRENT_ROLE   | 返回当前活动角色                                           |
| CURRENT_SCHEMA | 返回当前模式                                               |

### 条件函数和运算符

| 运算符语法                                                   | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| CASE value<br/>WHEN value1 [, value11 ]* THEN result1<br/>[ WHEN valueN [, valueN1 ]* THEN resultN ]*<br/>[ ELSE resultZ ]<br/>END | 简单案例                                                     |
| CASE<br/>WHEN condition1 THEN result1<br/>[ WHEN conditionN THEN resultN ]*<br/>[ ELSE resultZ ]<br/>END | 搜索案例                                                     |
| NULLIF(value, value)                                         | 如果值相同则返回 NULL。例如，`NULLIF(5, 5)` 返回NULL；`NULLIF(5, 0)` 返回 5。 |
| COALESCE(value, value [, value ]*)                           | 如果第一个值为 null，则提供一个值。  例如，`COALESCE(NULL, 5)` 返回 5。 |

### 类型转换

通常，表达式不能包含不同数据类型的值。例如，表达式不能将 5 乘以 10，然后添加 `JULIAN`。但是，Calcite 支持将值从一种数据类型隐式和显式转换为另一种数据类型。

#### 隐式和显式类型转换

Calcite 建议你指定显式转换，而不是依赖隐式或自动转换，原因如下：

- 使用显式数据类型转换函数时，SQL 语句更容易理解；
- 隐式数据类型转换可能会对性能产生负面影响，尤其是当列值的数据类型转换为常量数据类型而不是与之相反时；
- 隐式转换取决于它发生的上下文，并且在每种情况下可能不会以相同的方式工作。例如，从日期时间值到 VARCHAR 值的隐式转换可能会返回意外的格式。

隐式转换的算法可能会在 Calcite 版本之间发生变化，显式转换的行为更可预测。

#### 显式类型转换

| 运算符语法                             | 描述                                              |
| :------------------------------------- | :------------------------------------------------ |
| CAST(value AS type)                    | 将值转换为给定类型。整数类型之间的转换会向 0 截断 |
| CONVERT(string, charSet1, charSet2)    | 将字符串从 charSet1 转换为 charSet2               |
| CONVERT(value USING transcodingName)   | 将值从一个基本字符集更改为 transcodingName        |
| TRANSLATE(value USING transcodingName) | 将值从一个基本字符集更改为 transcodingName        |

将字符串转换为 BINARY 或 VARBINARY 类型会生成字符串字符集中字符串编码的字节列表。如果字符串的字符无法使用其字符集表示，则会产生运行时错误。

支持的数据类型语法：

```sql
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

当这种转换有意义时，Calcite 会自动将值从一种数据类型转换为另一种数据类型。下表是 Calcite 类型转换矩阵，该表显示了所有可能的转换，而不考虑转换的上下文。管理这些细节的规则遵循该表。

| 从 - 到             | NULL | BOOLEAN | TINYINT | SMALLINT | INT  | BIGINT | DECIMAL | FLOAT OR REAL | DOUBLE | INTERVAL | DATE | TIME | TIMESTAMP | CHAR OR VARCHAR | BINARY OR VARBINARY | GEOMETRY | ARRAY |
| :------------------ | :--- | :------ | :------ | :------- | :--- | :----- | :------ | :------------ | :----- | :------- | :--- | :--- | :-------- | :-------------- | :------------------ | :------- | :---- |
| NULL                | i    | i       | i       | i        | i    | i      | i       | i             | i      | i        | i    | i    | i         | i               | i                   | i        | x     |
| BOOLEAN             | x    | i       | x       | x        | x    | x      | x       | x             | x      | x        | x    | x    | x         | i               | x                   | x        | x     |
| TINYINT             | x    | e       | i       | i        | i    | i      | i       | i             | i      | e        | x    | x    | e         | i               | x                   | x        | x     |
| SMALLINT            | x    | e       | i       | i        | i    | i      | i       | i             | i      | e        | x    | x    | e         | i               | x                   | x        | x     |
| INT                 | x    | e       | i       | i        | i    | i      | i       | i             | i      | e        | x    | x    | e         | i               | x                   | x        | x     |
| BIGINT              | x    | e       | i       | i        | i    | i      | i       | i             | i      | e        | x    | x    | e         | i               | x                   | x        | x     |
| DECIMAL             | x    | e       | i       | i        | i    | i      | i       | i             | i      | e        | x    | x    | e         | i               | x                   | x        | x     |
| FLOAT/REAL          | x    | e       | i       | i        | i    | i      | i       | i             | i      | x        | x    | x    | e         | i               | x                   | x        | x     |
| DOUBLE              | x    | e       | i       | i        | i    | i      | i       | i             | i      | x        | x    | x    | e         | i               | x                   | x        | x     |
| INTERVAL            | x    | x       | e       | e        | e    | e      | e       | x             | x      | i        | x    | x    | x         | e               | x                   | x        | x     |
| DATE                | x    | x       | x       | x        | x    | x      | x       | x             | x      | x        | i    | x    | i         | i               | x                   | x        | x     |
| TIME                | x    | x       | x       | x        | x    | x      | x       | x             | x      | x        | x    | i    | e         | i               | x                   | x        | x     |
| TIMESTAMP           | x    | x       | e       | e        | e    | e      | e       | e             | e      | x        | i    | e    | i         | i               | x                   | x        | x     |
| CHAR or VARCHAR     | x    | e       | i       | i        | i    | i      | i       | i             | i      | i        | i    | i    | i         | i               | i                   | i        | i     |
| BINARY or VARBINARY | x    | x       | x       | x        | x    | x      | x       | x             | x      | x        | e    | e    | e         | i               | i                   | x        | x     |
| GEOMETRY            | x    | x       | x       | x        | x    | x      | x       | x             | x      | x        | x    | x    | x         | i               | x                   | i        | x     |
| ARRAY               | x    | x       | x       | x        | x    | x      | x       | x             | x      | x        | x    | x    | x         | x               | x                   | x        | i     |

`i`：隐式转换 / `e`：显式转换 / `x`：不允许

##### 转化条件和策略

- 集合运算（`UNION`、`EXCEPT`、`INTERSECT`）：比较各分支行的数据类型，找出各字段对的公共类型；
- 二进制算术表达式（`+`、`-`、`&`、`^`、`/`、`%`）：将字符串操作数提升为另一个数字操作数的数据类型；
- 二进制比较（`=`、`<`、`<=`、`<>`、`>`、`>=`）：如果操作数为 `STRING` 和 `TIMESTAMP`，则提升为 `TIMESTAMP`；使 `1 = true` 和 `0 = false` 始终计算为 `TRUE`；如果有数字类型操作数，则为两个操作数找到共同的类型。
- `IN` 子查询：比较 LHS 和 RHS 的类型，找出共同的类型；如果是结构体类型，则为每个字段找到更宽的类型；
- `IN` 表达式列表：比较每个表达式以找到共同类型；
- `CASE WHEN` 表达式或 `COALESCE`：找到 `THEN` 和 `ELSE` 操作数的共同更宽类型；
- 字符 + `INTERVAL` 或字符 - `INTERVAL` ：将字符提升为 `TIMESTAMP`；
- 内置函数：查找检查器中注册的类型系列，如果检查器规则允许，则查找系列默认类型；
- 用户定义函数（UDF）：根据 `eval()` 方法声明的参数类型进行强制转换；
- `INSERT` 和 `UPDATE`：如果两个字段的类型名称或精度（比例）不同，则将源字段强制转换为对应的目标表字段的类型。

注意：

以下情况的隐式类型强制将被忽略：

- 其中一个类型是 `ANY`；
- `CHARACTER` 类型中的类型强制始终被忽略，即从 `CHAR(20)` 到 `VARCHAR(30)`；
- 从一个数字到另一个具有更高优先级的类型强制将被忽略，即从 `INT` 到 `LONG`。

##### 寻找相同类型的策略

- 如果操作符有预期的数据类型，则直接将其作为所需类型。（例如，UDF 会有 `eval()` 方法，该方法有反射参数类型）；
- 如果没有预期的数据类型，但已注册数据类型系列，则尝试将参数强制转换为系列的默认数据类型，即 String 系列将具有 `VARCHAR` 类型；
- 如果既未指定预期的数据类型也未指定系列，则尝试找到节点类型中最紧密的公共类型，即 `INTEGER` 和 `DOUBLE` 将返回 `DOUBLE`，这种情况下数字精度不会丢失；
- 如果没有找到最紧密的公共类型，则尝试找到更宽的类型，即 `VARCHAR` 和 `INTEGER` 将返回 `INTEGER`，在将小数扩展为小数时，我们允许一些精度损失，或者提升为 `VARCHAR` 类型。

### 值构造函数

| 运算符语法                              | 描述                                          |
| :-------------------------------------- | :-------------------------------------------- |
| ROW (value [, value ]*)                 | 根据值列表创建一行。                          |
| (value [, value ]* )                    | 根据值列表创建一行。                          |
| row ‘[’ index ‘]’                       | 返回行中特定位置的元素（从 1 开始的索引）。   |
| row ‘[’ name ‘]’                        | 返回具有特定名称的行元素。                    |
| map ‘[’ key ‘]’                         | 返回具有特定键的映射元素。                    |
| array ‘[’ index ‘]’                     | 返回数组中特定位置的元素（从 1 开始的索引）。 |
| ARRAY ‘[’ value [, value ]* ‘]’         | 根据值列表创建一个数组。                      |
| MAP ‘[’ key, value [, key, value ]* ‘]’ | 根据键值对列表创建映射。                      |

### 查询值构造函数

| 运算符语法           | 描述                                                         |
| :------------------- | :----------------------------------------------------------- |
| ARRAY (sub-query)    | 根据子查询的结果创建一个数组。示例：`ARRAY(SELECT empno FROM emp ORDER BY empno)` |
| MAP (sub-query)      | 根据键值对子查询的结果创建映射。示例：`MAP(SELECT empno, deptno FROM emp)` |
| MULTISET (sub-query) | 从子查询的结果中创建一个多重集。示例：`MULTISET(SELECT empno FROM emp)` |

### 集合函数

| 运算符语法                                                | 描述                                                         |
| :-------------------------------------------------------- | :----------------------------------------------------------- |
| ELEMENT(value)                                            | 返回数组或多集的唯一元素；如果集合为空，则返回 null；如果有多个元素，则抛出。 |
| CARDINALITY(value)                                        | 返回数组或多集内的元素数量。                                 |
| value MEMBER OF multiset                                  | 返回 *value* 是否是 *multiset* 的成员。                      |
| multiset IS A SET                                         | *multiset* 是否是一个集合（没有重复）。                      |
| multiset IS NOT A SET                                     | *multiset* 是否不是一个集合（有重复）。                      |
| multiset IS EMPTY                                         | *multiset* 是否包含零个元素。                                |
| multiset IS NOT EMPTY                                     | *multiset* 是否包含一个或多个元素。                          |
| multiset SUBMULTISET OF multiset2                         | *multiset* 是否是 *multiset2* 的子多集。                     |
| multiset NOT SUBMULTISET OF multiset2                     | *multiset* 是否不是 *multiset2* 的子多集。                   |
| multiset MULTISET UNION [ ALL \| DISTINCT ] multiset2     | 返回并集 *multiset* 和 *multiset2*，如果指定了 DISTINCT（ALL 为默认值），则消除重复项。 |
| multiset MULTISET INTERSECT [ ALL \| DISTINCT ] multiset2 | 返回 *multiset* 和 *multiset2* 的交集，如果指定了 DISTINCT（ALL 是默认值），则消除重复项。 |
| multiset MULTISET EXCEPT [ ALL \| DISTINCT ] multiset2    | 返回 *multiset* 和 *multiset2* 的差异，如果指定了 DISTINCT（ALL 是默认值），则消除重复项。 |

另请参阅：UNNEST 关系运算符将集合转换为关系。

### 时间段谓词

| 运算符语法                           | 描述                            |
| ------------------------------------ | ------------------------------- |
| period1 CONTAINS datetime            | period1 包含 datetime           |
| period1 CONTAINS period2             | period1 包含 period2            |
| period1 OVERLAPS period2             | period1 与 period2 重叠         |
| period1 EQUALS period2               | period1 等于 period2            |
| period1 PRECEDES period2             | period1 早于 period2            |
| period1 IMMEDIATELY PRECEDES period2 | period1 早于 period2 并没有间隔 |
| period1 SUCCEEDS period2             | period1 晚于 period2            |
| period1 IMMEDIATELY SUCCEEDS period2 | period1 晚于 period2 并没有间隔 |

其中 `period1` 和 `period2` 是时间段表达式：

```sql
period:
      (datetime, datetime)
  |   (datetime, interval)
  |   PERIOD (datetime, datetime)
  |   PERIOD (datetime, interval)
```

### JDBC 函数转义

#### 数字

| 运算符语法                        | 描述                                                         |
| :-------------------------------- | :----------------------------------------------------------- |
| {fn ABS(numeric)}                 | 返回 *numeric* 的绝对值                                      |
| {fn ACOS(numeric)}                | 返回 *numeric* 的反余弦                                      |
| {fn ASIN(numeric)}                | 返回 *numeric* 的反正弦值                                    |
| {fn ATAN(numeric)}                | 返回 *numeric* 的反正切                                      |
| {fn ATAN2(numeric, numeric)}      | 返回 *numeric* 坐标的反正切                                  |
| {fn CBRT(numeric)}                | 返回 *numeric* 的立方根                                      |
| {fn CEILING(numeric)}             | 将 *numeric* 向上舍入，并返回大于或等于 *numeric* 的最小数字 |
| {fn COS(numeric)}                 | 返回 *numeric* 的余弦                                        |
| {fn COT(numeric)}                 | 返回 *numeric* 的余切                                        |
| {fn DEGREES(numeric)}             | 将 *numeric* 从弧度转换为度                                  |
| {fn EXP(numeric)}                 | 返回 *e* 的 *numeric* 次方                                   |
| {fn FLOOR(numeric)}               | 将 *numeric* 向下舍入，并返回小于或等于 *numeric* 的最大数字 |
| {fn LOG(numeric)}                 | 返回 *numeric* 的自然对数（底数 *e*）                        |
| {fn LOG10(numeric)}               | 返回 *numeric* 的以 10 为底的对数                            |
| {fn MOD(numeric1, numeric2)}      | 返回 *numeric1* 除以 *numeric2* 的余数（模数），仅当 *numeric1* 为负数时，结果才为负数 |
| {fn PI()}                         | 返回一个比任何其他值都更接近 *pi* 的值                       |
| {fn POWER(numeric1, numeric2)}    | 返回 *numeric1* 的 *numeric2* 次幂                           |
| {fn RADIANS(numeric)}             | 将 *numeric* 从度数转换为弧度                                |
| {fn RAND(numeric)}                | 使用 *numeric* 作为种子值返回随机双精度值                    |
| {fn ROUND(numeric1, numeric2)}    | 将 *numeric1* 四舍五入为 *numeric2* 位，保留小数点后一位     |
| {fn SIGN(numeric)}                | 返回 *numeric* 的符号                                        |
| {fn SIN(numeric)}                 | 返回 *numeric* 的正弦值                                      |
| {fn SQRT(numeric)}                | 返回 *numeric* 的平方根                                      |
| {fn TAN(numeric)}                 | 返回 *numeric* 的正切                                        |
| {fn TRUNCATE(numeric1, numeric2)} | 将 *numeric1* 截断为 *numeric2* 位，保留小数点后一位         |

#### 字符串

| 运算符语法                                   | 描述                                                         |
| :------------------------------------------- | :----------------------------------------------------------- |
| {fn ASCII(string)}                           | 返回 *string* 第一个字符的 ASCII 码；如果第一个字符是非 ASCII 字符，则返回其 Unicode 代码点；如果 *string* 为空，则返回 0 |
| {fn CHAR(integer)}                           | 返回 ASCII 码为 *integer* % 256 的字符，如果 *integer* < 0，则返回 null |
| {fn CONCAT(character, character)}            | 返回字符串的连接                                             |
| {fn INSERT(string1, start, length, string2)} | 将 *string2* 插入到 *string1* 中的插槽中                     |
| {fn LCASE(string)}                           | 返回一个字符串，其中 *string* 中的所有字母字符都已转换为小写 |
| {fn LENGTH(string)}                          | 返回字符串中的字符数                                         |
| {fn LOCATE(string1, string2 [, integer])}    | 返回 *string1* 在 *string2* 中第一次出现的位置。除非指定了 *integer*，否则将从 *string2* 的开头进行搜索。 |
| {fn LEFT(string, length)}                    | 返回 *string* 最左边的 *length* 个字符                       |
| {fn LTRIM(string)}                           | 返回删除了前导空格字符的*字符串*                             |
| {fn REPLACE(string, search, replacement)}    | 返回一个字符串，其中 *string* 中出现的所有 *search* 均被 *replacement* 替换；如果 *replacement* 为空字符串，则删除出现的 *search* |
| {fn REVERSE(string)}                         | 返回字符顺序颠倒的*字符串*                                   |
| {fn RIGHT(string, length)}                   | 返回 *string* 最右边的 *length* 个字符                       |
| {fn RTRIM(string)}                           | 返回删除了尾随空格字符的 *string*                            |
| {fn SUBSTRING(string, offset, length)}       | 返回从 *string* 开始，由 *length* 个字符组成的字符串，起始于 *offset* 位置 |
| {fn UCASE(string)}                           | 返回一个字符串，其中 *string* 中的所有字母字符都已转换为大写 |

#### 日期/时间

| 运算符语法                                           | 描述                                                         |
| :--------------------------------------------------- | :----------------------------------------------------------- |
| {fn CURDATE()}                                       | 相当于 `CURRENT_DATE`                                        |
| {fn CURTIME()}                                       | 相当于 `LOCALTIME`                                           |
| {fn NOW()}                                           | 相当于`LOCALTIMESTAMP`                                       |
| {fn YEAR(date)}                                      | 相当于 `EXTRACT(YEAR FROM date)`。返回一个整数。             |
| {fn QUARTER(date)}                                   | 相当于 `EXTRACT(QUARTER FROM date)`。返回 1 到 4 之间的整数。 |
| {fn MONTH(date)}                                     | 相当于 `EXTRACT(MONTH FROM date)`。返回 1 到 12 之间的整数。 |
| {fn WEEK(date)}                                      | 相当于 `EXTRACT(WEEK FROM date)`。返回 1 到 53 之间的整数。  |
| {fn DAYOFYEAR(date)}                                 | 相当于 `EXTRACT(DOY FROM date)`。返回 1 到 366 之间的整数。  |
| {fn DAYOFMONTH(date)}                                | 相当于 `EXTRACT(DAY FROM date)`。返回 1 到 31 之间的整数。   |
| {fn DAYOFWEEK(date)}                                 | 相当于 `EXTRACT(DOW FROM date)`。返回 1 到 7 之间的整数。    |
| {fn HOUR(date)}                                      | 相当于 `EXTRACT(HOUR FROM date)`。返回 0 到 23 之间的整数。  |
| {fn MINUTE(date)}                                    | 相当于 `EXTRACT(MINUTE FROM date)`。返回 0 到 59 之间的整数。 |
| {fn SECOND(date)}                                    | 相当于 `EXTRACT(SECOND FROM date)`。返回 0 到 59 之间的整数。 |
| {fn TIMESTAMPADD(timeUnit, count, datetime)}         | 将 *count* *timeUnit*s 的间隔添加到日期时间                  |
| {fn TIMESTAMPDIFF(timeUnit, timestamp1, timestamp2)} | 从 *timestamp2* 中减去 *timestamp1* 并以 *timeUnit*s 形式返回结果 |

#### 系统

| 运算符语法                  | 描述                            |
| :-------------------------- | :------------------------------ |
| {fn DATABASE()}             | 相当于 `CURRENT_CATALOG`        |
| {fn IFNULL(value1, value2)} | 如果 value1 为空，则返回 value2 |
| {fn USER()}                 | 相当于 `CURRENT_USER`           |

#### 转换

| 运算符语法                | 描述                  |
| :------------------------ | :-------------------- |
| {fn CONVERT(value, type)} | 将 *值* 转换为 *类型* |

### 聚合函数

语法：

```sql
aggregateCall:
      agg '(' [ ALL | DISTINCT ] value [, value ]* ')'
      [ WITHIN DISTINCT '(' expression [, expression ]* ')' ]
      [ WITHIN GROUP '(' ORDER BY orderItem [, orderItem ]* ')' ]
      [ FILTER '(' WHERE condition ')' ]
  |   agg '(' '*' ')' [ FILTER (WHERE condition) ]
```

其中 *agg* 是下表中的运算符之一，或者是用户定义的聚合函数。

如果存在 `FILTER`，则聚合函数仅考虑*条件*计算结果为 TRUE 的行。

如果存在 `DISTINCT`，则重复的参数值在传递给聚合函数之前会被消除。

如果存在 `WITHIN DISTINCT`，则在传递给聚合函数之前，参数值在指定键的每个值内都会有所不同。

如果存在 `WITHIN GROUP`，则聚合函数会在聚合值之前根据 `WITHIN GROUP` 内的 `ORDER BY` 子句对输入行进行排序。`WITHIN GROUP` 仅允许用于假设集合函数（`RANK`、`DENSE_RANK`、`PERCENT_RANK` 和 `CUME_DIST`）、逆分布函数（`PERCENTILE_CONT` 和 `PERCENTILE_DISC`）和集合函数（`COLLECT` 和 `LISTAGG`）。

| 运算符语法                                        | 描述                                                         |
| :------------------------------------------------ | :----------------------------------------------------------- |
| ANY_VALUE( [ ALL \| DISTINCT ] value)             | 返回所有输入值中的一个值；这在 SQL 标准中没有指定            |
| ARG_MAX(value, comp)                              | 返回组中 comp 的最大值                                       |
| ARG_MIN(value, comp)                              | 返回组中 comp 的最小值                                       |
| APPROX_COUNT_DISTINCT(value [, value ]*)          | 返回 value 的不同值的近似数量；数据库可以使用近似值，但不需要 |
| AVG( [ ALL \| DISTINCT ] numeric)                 | 返回所有输入值的平均值（算术平均值）                         |
| BIT_AND( [ ALL \| DISTINCT ] value)               | 返回所有非空输入值的按位与，如果没有则返回空；支持整数和二进制类型 |
| BIT_OR( [ ALL \| DISTINCT ] value)                | 返回所有非空输入值的按位或，如果没有则返回空；支持整数和二进制类型 |
| BIT_XOR( [ ALL \| DISTINCT ] value)               | 返回所有非空输入值的按位异或，若无则返回空；支持整数和二进制类型 |
| COLLECT( [ ALL \| DISTINCT ] value)               | 返回值的多集                                                 |
| COUNT(*)                                          | 返回输入行的数量                                             |
| COUNT( [ ALL \| DISTINCT ] value [, value ]*)     | 返回值不为空的输入行数（如果值为复合值，则完全不为空）       |
| COVAR_POP(numeric1, numeric2)                     | 返回所有输入值对 (numeric1, numeric2) 的总体协方差           |
| COVAR_SAMP(numeric1, numeric2)                    | 返回所有输入值对 (numeric1, numeric2) 的样本协方差           |
| EVERY(condition)                                  | 如果条件的所有值都为 TRUE，则返回 TRUE                       |
| FUSION(multiset)                                  | 返回所有输入值的多重集的多重集并集                           |
| INTERSECTION(multiset)                            | 返回所有输入值的多重集的多重集交集                           |
| LISTAGG( [ ALL \| DISTINCT ] value [, separator]) | 返回连接成字符串的值，以分隔符分隔（默认为‘，’）             |
| MAX( [ ALL \| DISTINCT ] value)                   | 返回所有输入值中的最大值                                     |
| MIN( [ ALL \| DISTINCT ] value)                   | 返回所有输入值中的最小值                                     |
| MODE(value)                                       | 返回所有输入值中出现频率最高的值                             |
| REGR_COUNT(numeric1, numeric2)                    | 返回依赖表达式和独立表达式均不为空的行数                     |
| REGR_SXX(numeric1, numeric2)                      | 返回线性回归模型中因变量表达式的平方和                       |
| REGR_SYY(numeric1, numeric2)                      | 返回线性回归模型中独立表达式的平方和                         |
| SOME(condition)                                   | 如果条件中的一个或多个值为 TRUE，则返回 TRUE                 |
| STDDEV( [ ALL \| DISTINCT ] numeric)              | STDDEV_SAMP 的同义词                                         |
| STDDEV_POP( [ ALL \| DISTINCT ] numeric)          | 返回所有输入值的总体标准差                                   |
| STDDEV_SAMP( [ ALL \| DISTINCT ] numeric)         | 返回所有输入值的数字样本标准差                               |
| SUM( [ ALL \| DISTINCT ] numeric)                 | 返回所有输入值的数字总和                                     |
| VAR_POP( [ ALL \| DISTINCT ] value)               | 返回所有输入值的总体方差（总体标准差的平方）                 |
| VAR_SAMP( [ ALL \| DISTINCT ] numeric)            | 返回所有输入值的样本方差（样本标准差的平方）                 |

未实现的：

- REGR_AVGX(numeric1, numeric2)
- REGR_AVGY(numeric1, numeric2)
- REGR_INTERCEPT(numeric1, numeric2)
- REGR_R2(numeric1, numeric2)
- REGR_SLOPE(numeric1, numeric2)
- REGR_SXY(numeric1, numeric2)

#### 有序集聚合函数

语法与 *aggregateCall* 相同，但需要 `WITHIN GROUP`。

例如下面的：

- *分数* 是 0 到 1 之间的数字文字（包括 0 和 1），代表百分比；

| 运算符语法                                                   | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| PERCENTILE_CONT(fraction) WITHIN GROUP (ORDER BY orderItem)  | 根据列值的连续分布返回百分位数，如果需要，则在相邻的输入项之间进行插值 |
| PERCENTILE_DISC(fraction) WITHIN GROUP (ORDER BY orderItem [, orderItem ]*) | 根据列值的离散分布返回百分位数，返回排序中位置等于或超过指定分数的第一个输入值 |

### 窗口函数

语法：

```sql
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

其中 agg 是下表中的运算符之一，或者是用户定义的聚合函数。

`DISTINCT`、`FILTER` 和 `WITHIN GROUP` 与聚合函数的描述一致。

| 运算符语法                               | 描述                                                         |
| :--------------------------------------- | :----------------------------------------------------------- |
| COUNT(value [, value ]*) OVER window     | 返回 *window* 中 *value* 不为空的行数（如果 *value* 是复合的，则完全不为空） |
| COUNT(*) OVER window                     | 返回 *window* 中的行数                                       |
| AVG(numeric) OVER window                 | 返回 *window* 中所有值的 *numeric* 的平均值（算术平均值）    |
| SUM(numeric) OVER window                 | 返回 *window* 中所有值的 *numeric* 之和                      |
| MAX(value) OVER window                   | 返回 *window* 中所有值中 *value* 的最大值                    |
| MIN(value) OVER window                   | 返回 *window* 中所有值中 *value* 的最小值                    |
| RANK() OVER window                       | 返回当前行的排名（有间隙）；与其第一个对等行的 ROW_NUMBER 相同 |
| DENSE_RANK() OVER window                 | 返回当前行的排名，无间隙；该函数计算同组                     |
| ROW_NUMBER() OVER window                 | 返回分区内当前行的编号，从 1 开始计数                        |
| FIRST_VALUE(value) OVER window           | 返回在窗口框架第一行计算的值                                 |
| LAST_VALUE(value) OVER window            | 返回在窗口框架最后一行计算的值                               |
| LEAD(value, offset, default) OVER window | 返回在分区内当前行之后 *offset* 行处求值的 *value*；如果没有这样的行，则返回 *default*。*offset* 和 *default* 都是针对当前行求值的。如果省略，*offset* 默认为 1，*default* 默认为 NULL |
| LAG(value, offset, default) OVER window  | 返回在分区内当前行之前 *offset* 行处求值的 *value*；如果没有这样的行，则返回 *default*。*offset* 和 *default* 都是针对当前行求值的。如果省略，*offset* 默认为 1，*default* 默认为 NULL |
| NTH_VALUE(value, nth) OVER window        | 返回在窗口框架的第 *n* 行计算的值                            |
| NTILE(value) OVER window                 | 返回从 1 到 *value* 的整数，尽可能均匀地划分分区             |

注意：

- 你可以为 FIRST_VALUE、LAST_VALUE、NTH_VALUE、LEAD 和 LAG 函数指定空处理（IGNORE NULLS、RESPECT NULLS）。语法由解析器处理，但只有 RESPECT NULLS 在运行时实现。

未实现：

- COUNT(DISTINCT value [, value ]*) OVER window
- APPROX_COUNT_DISTINCT(value [, value ]*) OVER window
- PERCENT_RANK(value) OVER window
- CUME_DIST(value) OVER window

### 分组函数

| 运算符语法                               | 描述                         |
| :--------------------------------------- | :--------------------------- |
| GROUPING(expression [, expression ]*)    | 返回给定分组表达式的位向量   |
| GROUP_ID()                               | 返回唯一标识分组键组合的整数 |
| GROUPING_ID(expression [, expression ]*) | `GROUPING` 的同义词          |

### 描述符

| 运算符语法                  | 描述                                                         |
| :-------------------------- | :----------------------------------------------------------- |
| DESCRIPTOR(name [, name ]*) | DESCRIPTOR 作为函数中的参数出现，表示名称列表。名称的解释留给函数。 |

### 表函数

表函数出现在 `FROM` 子句中。

表函数可能具有通用表参数（即，创建表函数时未声明任何行类型），并且结果的行类型可能取决于输入表的行类型。此外，输入表按三个特征分类。第一个特征是语义。输入表具有行语义或集合语义，如下所示：

- 行语义意味着表函数的结果依赖于逐行；
- 集合语义意味着函数的结果取决于数据的分区方式。

第二个特性仅适用于具有集合语义的输入表，即即使输入表为空，表函数是否可以生成结果行。

- 如果表函数可以在空输入时生成结果行，则该表被称为`空时保留`；
- 另一种选择是`空时修剪`，这意味着如果输入表为空，结果将被修剪掉。

第三个特征是输入表是否支持传递列。传递列是一种机制，允许表函数将输入行的每一列复制到输出行的列中。

具有集合语义的输入表可以按一列或多列进行分区。具有集合语义的输入表可以按一列或多列进行排序。

注意：

- 具有行语义的输入表可能未被分区或排序；
- 多态表函数可能有多个输入表。但是，最多只有一个输入表可以具有行语义。

#### TUMBLE

在流式查询中，TUMBLE 根据时间戳列为关系的每一行分配一个窗口。分配的窗口由其开始和结束指定。所有分配的窗口都具有相同的长度，这就是为什么翻转有时被称为“固定窗口”。TUMBLE 表函数的第一个参数是通用表参数。输入表具有行语义并支持传递列。

| 运算符语法                                          | 描述                                                  |
| :-------------------------------------------------- | :---------------------------------------------------- |
| TUMBLE(data, DESCRIPTOR(timecol), size [, offset ]) | 表示 timecol 大小间隔的滚动窗口，可选择在偏移处对齐。 |

下面是一个例子：

```sql
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

将一分钟范围的滚动窗口应用于订单表中的行。rowtime 是订单表的水印列，用于告知数据是否完整。

#### HOP

在流式查询中，HOP 会分配覆盖大小间隔内的行的窗口，并根据时间戳列移动每个滑动窗口。分配的窗口可能会重叠，因此有时跳跃被称为`滑动窗口`。HOP 表函数的第一个参数是通用表参数。输入表具有行语义并支持传递列。

| 运算符语法                                              | 描述                                                         |
| :------------------------------------------------------ | :----------------------------------------------------------- |
| HOP(data, DESCRIPTOR(timecol), slide, size [, offset ]) | 表示 timecol 的跳跃窗口，覆盖 size 间隔内的行，移动每个幻灯片并可选择在偏移处对齐。 |

下面是一个例子：

```sql
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

对订单表的行应用 5 分钟间隔大小的跳跃，每 2 分钟移动一次。rowtime 是订单表的水印列，用于指示数据的完整性。

#### SESSION

在流式查询中，SESSION 根据日期时间分配覆盖行的窗口。在会话窗口内，行之间的距离小于间隔。会话窗口按键应用。SESSION 表函数的第一个参数是通用表参数。输入表具有设置语义并支持传递列。此外，如果输入表为空，SESSION 表函数将不会生成结果行。

| 运算符语法                                                | 描述                                                        |
| :-------------------------------------------------------- | :---------------------------------------------------------- |
| session(data, DESCRIPTOR(timecol), DESCRIPTOR(key), size) | 表示 timecol 大小为 interval 的会话窗口。会话窗口按键应用。 |

下面是一个例子：

```sql
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

对订单表中的行应用具有 20 分钟非活动间隔的会话。rowtime 是订单表中带水印的列，用于指示数据的完整性。会话按产品应用。

**注意**：Tumble、Hop 和 Session 窗口表函数将原始表中的每一行分配给一个窗口。输出表具有与原始表相同的所有列，以及两个附加列 window_start 和 window_end，分别表示窗口间隔的开始和结束。

### 分组窗口函数

**警告**：分组窗口函数已被弃用。

分组窗口函数出现在 GROUP BY 子句中，并定义一个表示包含多行的窗口的键值。

在某些窗口函数中，一行可能属于多个窗口。例如，如果使用 `HOP(t, INTERVAL '2' HOUR, INTERVAL '1' HOUR)` 对查询进行分组，则带有时间戳 `10:15:00` 的行将同时出现在 `10:00 - 11:00` 和 `11:00 - 12:00` 总计中。

| 运算符语法                            | 描述                                                         |
| :------------------------------------ | :----------------------------------------------------------- |
| HOP(datetime, slide, size [, time ])  | 表示日期时间的跳跃窗口，覆盖大小间隔内的行，移动每张幻灯片，并可选择在时间上对齐 |
| SESSION(datetime, interval [, time ]) | 表示日期时间间隔的会话窗口，可选择在时间上对齐               |
| TUMBLE(datetime, interval [, time ])  | 表示日期时间间隔的滚动窗口，可选择在时间上对齐               |

### 分组辅助函数

分组辅助函数允许您访问由分组窗口函数定义的窗口的属性。

| 运算符语法                                   | 描述                                                        |
| :------------------------------------------- | :---------------------------------------------------------- |
| HOP_END(expression, slide, size [, time ])   | 返回由 `HOP` 函数调用定义的窗口末尾的 *expression* 的值     |
| HOP_START(expression, slide, size [, time ]) | 返回由 `HOP` 函数调用定义的窗口开头的 *expression* 的值     |
| SESSION_END(expression, interval [, time])   | 返回由 `SESSION` 函数调用定义的窗口末尾的 *expression* 的值 |
| SESSION_START(expression, interval [, time]) | 返回由 `SESSION` 函数调用定义的窗口开头的 *expression* 的值 |
| TUMBLE_END(expression, interval [, time ])   | 返回由 `TUMBLE` 函数调用定义的窗口末尾的 *expression* 的值  |
| TUMBLE_START(expression, interval [, time ]) | 返回由 `TUMBLE` 函数调用定义的窗口开头的 *expression* 的值  |

### 空间函数

在以下内容中：

- *geom* 是一个 `GEOMETRY`；
- *geomCollection* 是一个 `GEOMETRYCOLLECTION`；
- *point* 是一个 `POINT`；
- *lineString* 是一个 `LINESTRING`；
- *iMatrix* 是 [DE-9IM 交叉矩阵](https://en.wikipedia.org/wiki/DE-9IM)；
- *distance*、*tolerance*、*segmentLengthFraction*、*offsetDistance* 都是 double 类型；
- *dimension*、*quadSegs*、*srid*、*zoom* 是整数类型；
- *layerType*是一个字符串；
- *gml* 是包含[地理标记语言 (GML)](https://en.wikipedia.org/wiki/Geography_Markup_Language) 的字符串；
- *wkt* 是包含 [众所周知的文本 (WKT)](https://en.wikipedia.org/wiki/Well-known_text) 的字符串；
- *wkb* 是包含 [众所周知的二进制 (WKB)](https://en.wikipedia.org/wiki/Well-known_binary) 的二进制字符串。

在 `C`（代表`兼容性`）列中，`o` 表示该函数实现了 SQL 的 OpenGIS 简单功能实现规范，版本 1.2.1；`p` 表示该函数是 OpenGIS 的 PostGIS 扩展；`h` 表示该函数是 H2GIS 扩展。

TODO

#### 几何转换函数（2D）

| C  （兼容性） | 运算符语法                                                  | 描述                                                         |
| :------------ | :---------------------------------------------------------- | :----------------------------------------------------------- |
| p             | ST_AsBinary(geom)                                           | `ST_AsWKB` 的同义词                                          |
| p             | ST_AsEWKB(geom)                                             | `ST_AsWKB` 的同义词                                          |
| p             | ST_AsEWKT(geom)                                             | 转换 GEOMETRY → EWKT                                         |
| p             | ST_AsGeoJSON(geom)                                          | 转换 GEOMETRY → GeoJSON                                      |
| p             | ST_AsGML(geom)                                              | 转换 GEOMETRY → GML                                          |
| p             | ST_AsText(geom)                                             | `ST_AsWKT` 的同义词                                          |
| o             | ST_AsWKB(geom)                                              | 转换 GEOMETRY → WKB                                          |
| o             | ST_AsWKT(geom)                                              | 转换 GEOMETRY → WKT                                          |
| o             | ST_Force2D(geom)                                            | 3D GEOMETRY → 2D GEOMETRY                                    |
| o             | ST_GeomFromEWKB(wkb [, srid ])                              | `ST_GeomFromWKB` 的同义词                                    |
| o             | ST_GeomFromEWKT(wkb [, srid ])                              | 转换 WKT → GEOMETRY                                          |
| o             | ST_GeomFromGeoJSON(json)                                    | 转换 GeoJSON → GEOMETRY                                      |
| o             | ST_GeomFromGML(wkb [, srid ])                               | 转换 GML → GEOMETRY                                          |
| o             | ST_GeomFromText(wkt [, srid ])                              | `ST_GeomFromWKT` 的同义词                                    |
| o             | ST_GeomFromWKB(wkb [, srid ])                               | 转换 WKB → GEOMETRY                                          |
| o             | ST_GeomFromWKT(wkb [, srid ])                               | 转换 WKT → GEOMETRY                                          |
| o             | ST_LineFromText(wkt [, srid ])                              | 转换 WKT → LINESTRING                                        |
| o             | ST_LineFromWKB(wkt [, srid ])                               | 转换 WKT → LINESTRING                                        |
| o             | ST_MLineFromText(wkt [, srid ])                             | 转换 WKT → MULTILINESTRING                                   |
| o             | ST_MPointFromText(wkt [, srid ])                            | 转换 WKT → MULTIPOINT                                        |
| o             | ST_MPolyFromText(wkt [, srid ]) Converts WKT → MULTIPOLYGON |                                                              |
| o             | ST_PointFromText(wkt [, srid ])                             | 转换 WKT → POINT                                             |
| o             | ST_PointFromWKB(wkt [, srid ])                              | 转换 WKB → POINT                                             |
| o             | ST_PolyFromText(wkt [, srid ])                              | 转换 WKT → POLYGON                                           |
| o             | ST_PolyFromWKB(wkt [, srid ])                               | 转换 WKB → POLYGON                                           |
| p             | ST_ReducePrecision(geom, gridSize)                          | 将 *geom* 的精度降低至提供的 *gridSize*                      |
| h             | ST_ToMultiPoint(geom)                                       | 将 *geom* 的坐标（可能是 GEOMETRYCOLLECTION）转换为 MULTIPOINT |
| h             | ST_ToMultiLine(geom)                                        | 将 *geom* 的坐标（可能是 GEOMETRYCOLLECTION）转换为 MULTILINESTRING |
| h             | ST_ToMultiSegments(geom)                                    | 将 *geom*（可能是 GEOMETRYCOLLECTION）转换为存储在 MULTILINESTRING 中的一组不同段 |

未实现：

- ST_GoogleMapLink(geom [, layerType [, zoom ]]) GEOMETRY → Google map link
- ST_OSMMapLink(geom [, marker ]) GEOMETRY → OSM map link

#### 几何转换函数（3D）

| C（兼容性） | 运算符语法       | 描述                      |
| :---------- | :--------------- | :------------------------ |
| o           | ST_Force3D(geom) | 2D GEOMETRY → 3D GEOMETRY |

#### 几何创建函数（2D）

| C（兼容性） | 运算符语法                                        | 描述                                                         |
| :---------- | :------------------------------------------------ | :----------------------------------------------------------- |
| h           | ST_BoundingCircle(geom)                           | 返回 *geom* 的最小边界圆                                     |
| h           | ST_Expand(geom, distance)                         | 扩展 *geom* 的包络                                           |
| h           | ST_Expand(geom, deltaX, deltaY)                   | 扩展 *geom* 的包络                                           |
| h           | ST_MakeEllipse(point, width, height)              | 构造一个椭圆                                                 |
| p           | ST_MakeEnvelope(xMin, yMin, xMax, yMax [, srid ]) | 创建一个矩形 POLYGON                                         |
| h           | ST_MakeGrid(geom, deltaX, deltaY)                 | 根据 *geom* 计算多边形的规则网格                             |
| h           | ST_MakeGridPoints(geom, deltaX, deltaY)           | 根据 *geom* 计算规则的点网格                                 |
| o           | ST_MakeLine(point1 [, point ]*)                   | 根据给定的 POINT（或 MULTIPOINT）创建线串                    |
| p           | ST_MakePoint(x, y [, z ])                         | `ST_Point` 的同义词                                          |
| p           | ST_MakePolygon(lineString [, hole ]*)             | 使用给定的孔（需要封闭的 LINESTRING）从 *lineString* 创建 POLYGON |
| h           | ST_MinimumDiameter(geom)                          | 返回 *geom* 的最小直径                                       |
| h           | ST_MinimumRectangle(geom)                         | 返回包围 *geom* 的最小矩形                                   |
| h           | ST_OctogonalEnvelope(geom)                        | 返回 *geom* 的八边形包络                                     |
| o           | ST_Point(x, y [, z ])                             | 根据两个或三个坐标构造一个点                                 |

未实现：

- `ST_RingBuffer(geom, distance, bufferCount [, endCapStyle [, doDifference]])` 返回以 *geom* 为中心且缓冲区大小不断增加的 MULTIPOLYGON 缓冲区。

### 几何创建函数（3D）

未实现：

- `ST Extrude(from, height [, flag])` 挤出几何图形；
- `ST_Geometry Shadow(geom_point, height)` 计算 *geom* 的阴影足迹；
- `ST_GeometryShadow(geom, azimuth, elevation, height [, unify ])` 计算 *geom* 的阴影覆盖范围。

#### 几何属性（2D）

| C（兼容性） | 运算符语法                      | 描述                                                         |
| :---------- | :------------------------------ | :----------------------------------------------------------- |
| o           | ST_Boundary(geom [, srid ])     | 返回 *geom* 的边界                                           |
| o           | ST_Centroid(geom)               | 返回 *geom* 的质心                                           |
| o           | ST_CoordDim(geom)               | 返回 *geom* 坐标的维度                                       |
| o           | ST_Dimension(geom)              | 返回 *geom* 的维度                                           |
| o           | ST_Distance(geom1, geom2)       | 返回 *geom1* 和 *geom2* 之间的距离                           |
| h           | ST_ExteriorRing(geom)           | 返回 *geom* 的外环，如果 *geom* 不是多边形，则返回 null      |
| o           | ST_GeometryType(geom)           | 返回 *geom* 的类型                                           |
| o           | ST_GeometryTypeCode(geom)       | 返回 *geom* 的 OGC SFS 类型代码                              |
| p           | ST_EndPoint(lineString)         | 返回 *geom* 的最后一个坐标                                   |
| o           | ST_Envelope(geom [, srid ])     | 返回 *geom* 的包络（可能是 GEOMETRYCOLLECTION）作为 GEOMETRY |
| o           | ST_Extent(geom)                 | Returns the minimum bounding box of *geom* (which may be a GEOMETRYCOLLECTION) |
| h           | ST_GeometryN(geomCollection, n) | 返回 *geomCollection* 的第 *n* 个 GEOMETRY                   |
| h           | ST_InteriorRingN(geom)          | 返回 *geom* 的第 n 个内环，如果 *geom* 不是多边形，则返回 null |
| h           | ST_IsClosed(geom)               | 返回 *geom* 是否为封闭的 LINESTRING 或 MULTILINESTRING       |
| o           | ST_IsEmpty(geom)                | 返回 *geom* 是否为空                                         |
| o           | ST_IsRectangle(geom)            | 返回 *geom* 是否为矩形                                       |
| h           | ST_IsRing(geom)                 | 返回 *geom* 是否为封闭的简单线串或 MULTILINESTRING           |
| o           | ST_IsSimple(geom)               | 返回 *geom* 是否简单                                         |
| o           | ST_IsValid(geom)                | 返回 *geom* 是否有效                                         |
| h           | ST_NPoints(geom)                | 返回 *geom* 中的点数                                         |
| h           | ST_NumGeometries(geom)          | 返回 *geom* 中的几何图形数量（如果不是 GEOMETRYCOLLECTION，则返回 1） |
| h           | ST_NumInteriorRing(geom)        | `ST_NumInteriorRings` 的同义词                               |
| h           | ST_NumInteriorRings(geom)       | 返回 *geom* 的内部环的数量                                   |
| h           | ST_NumPoints(geom)              | 返回 *geom* 中的点数                                         |
| p           | ST_PointN(geom, n)              | 返回 *geom* 的第 *n* 个点                                    |
| p           | ST_PointOnSurface(geom)         | 返回 *geom* 的内部或边界点                                   |
| o           | ST_SRID(geom)                   | 返回 *geom* 的 SRID 值，如果没有则返回 0                     |
| p           | ST_StartPoint(geom)             | 返回 *geom* 的第一个点                                       |
| o           | ST_X(geom)                      | 返回 *geom* 第一个坐标的 x 值                                |
| o           | ST_XMax(geom)                   | 返回 *geom* 的最大 x 值                                      |
| o           | ST_XMin(geom)                   | 返回 *geom* 的最小 x 值                                      |
| o           | ST_Y(geom)                      | 返回 *geom* 第一个坐标的 y 值                                |
| o           | ST_YMax(geom)                   | 返回 *geom* 的最大 y 值                                      |
| o           | ST_YMin(geom)                   | 返回 *geom* 的最小 y 值                                      |

未实现：

- `ST_CompactnessRatio(polygon)` 返回 *polygon* 面积除以其周长等于其周长的圆的面积的平方根；
- `ST_Explode(query [, field Name])` 将查询的 *field Name* 列中的`GEOMETRY COLLECTIONs`分解为多个几何图形；
- `ST_IsValidDetail(geom [, selfTouchValid ])` 返回有效细节作为对象数组；
- `ST_IsValidReason(geom [, selfTouchValid ])` 返回文本说明 *geom* 是否有效，如果无效，则说明原因。

#### 几何属性（3D）

| C（兼容性） | 运算符语法    | 描述                              |
| :---------- | :------------ | :-------------------------------- |
| p           | ST_Is3D(s)    | 返回 *geom* 是否至少有一个 z 坐标 |
| o           | ST_Z(geom)    | 返回 *geom* 第一个坐标的 z 值     |
| o           | ST_ZMax(geom) | 返回 *geom* 的最大 z 值           |
| o           | ST_ZMin(geom) | 返回 *geom* 的最小 z 值           |

### 几何谓词

| C（兼容性） | 运算符语法                          | 描述                                                         |
| :---------- | :---------------------------------- | :----------------------------------------------------------- |
| o           | ST_Contains(geom1, geom2)           | 返回 *geom1* 是否包含 *geom2*                                |
| p           | ST_ContainsProperly(geom1, geom2)   | 返回 *geom1* 是否包含 *geom2* 但与其边界不相交               |
| p           | ST_CoveredBy(geom1, geom2)          | 返回 *geom1* 中是否没有点位于 *geom2* 之外。                 |
| p           | ST_Covers(geom1, geom2)             | 返回 *geom2* 中是否没有点位于 *geom1* 之外                   |
| o           | ST_Crosses(geom1, geom2)            | 返回 *geom1* 是否与 *geom2* 相交                             |
| o           | ST_Disjoint(geom1, geom2)           | 返回 *geom1* 和 *geom2* 是否不相交                           |
| p           | ST_DWithin(geom1, geom2, distance)  | 返回 *geom1* 和 *geom* 是否在彼此的 *距离* 范围内            |
| o           | ST_EnvelopesIntersect(geom1, geom2) | 返回 *geom1* 的包络线是否与 *geom2* 的包络线相交             |
| o           | ST_Equals(geom1, geom2)             | 返回 *geom1* 是否等于 *geom2*                                |
| o           | ST_Intersects(geom1, geom2)         | 返回 *geom1* 是否与 *geom2* 相交                             |
| o           | ST_Overlaps(geom1, geom2)           | 返回 *geom1* 是否与 *geom2* 重叠                             |
| o           | ST_Relate(geom1, geom2)             | 返回 *geom1* 和 *geom2* 的 DE-9IM 交集矩阵                   |
| o           | ST_Relate(geom1, geom2, iMatrix)    | 返回 *geom1* 和 *geom2* 是否通过给定的交集矩阵 *iMatrix* 相关 |
| o           | ST_Touches(geom1, geom2)            | 返回 *geom1* 是否接触 *geom2*                                |
| o           | ST_Within(geom1, geom2)             | 返回 *geom1* 是否在 *geom2* 内                               |

未实现：

- `ST_OrderingEquals(geom1, geom2)` 返回 *geom1* 是否等于 *geom2* 以及它们的坐标和组件几何图形以相同的顺序列出。

#### 几何运算符（2D）

以下函数组合了 2D 几何图形。

| C（兼容性） | 运算符语法                                           | 描述                                   |
| :---------- | :--------------------------------------------------- | :------------------------------------- |
| p           | ST_Buffer(geom, distance [, quadSegs, endCapStyle ]) | 计算 *geom* 周围的缓冲区               |
| p           | ST_Buffer(geom, distance [, bufferStyle ])           | 计算 *geom* 周围的缓冲区               |
| o           | ST_ConvexHull(geom)                                  | 计算包含 *geom* 中所有点的最小凸多边形 |
| o           | ST_Difference(geom1, geom2)                          | 计算两个几何图形之间的差异             |
| o           | ST_SymDifference(geom1, geom2)                       | 计算两个几何体之间的对称差异           |
| o           | ST_Intersection(geom1, geom2)                        | 计算 *geom1* 和 *geom2* 的交集         |
| p           | ST_OffsetCurve(geom, distance, bufferStyle)          | 计算 *linestring* 的偏移线             |
| o           | ST_Union(geom1, geom2)                               | 计算 *geom1* 和 *geom2* 的并集         |
| o           | ST_Union(geomCollection)                             | 计算 *geomCollection* 中几何图形的并集 |

另请参考：`ST_Union` 聚合函数。

#### 仿射变换函数（3D 和 2D）

以下函数可变换 2D 几何图形。

| C（兼容性） | 运算符语法                                | 描述                                                         |
| :---------- | :---------------------------------------- | :----------------------------------------------------------- |
| o           | ST_Rotate(geom, angle [, origin \| x, y]) | 将 *geom* 绕 *origin* （或点 (*x*, *y*)）逆时针旋转 *angle* （以弧度为单位） |
| o           | ST_Scale(geom, xFactor, yFactor)          | 通过将纵坐标乘以指定的比例因子来缩放 *geom*                  |
| o           | ST_Translate(geom, x, y)                  | 将 *geom* 平移向量 (x, y)                                    |

未实现：

- `ST_Scale(geom, xFactor, yFactor [, zFactor ])` 通过将纵坐标乘以指定的比例因子来缩放 *geom*；
- `ST_Translate(geom, x, y, [, z])` 平移 *geom*。

#### 几何编辑功能（2D）

以下函数可修改 2D 几何图形。

| C（兼容性） | 运算符语法                                  | 描述                                                         |
| :---------- | :------------------------------------------ | :----------------------------------------------------------- |
| p           | ST_AddPoint(linestring, point [, index])    | 将 *point* 添加到给定 *index* 处的 *linestring*（如果未指定 *index*，则添加到末尾） |
| h           | ST_Densify(geom, tolerance)                 | 通过沿线段插入额外的顶点来加密 *geom*                        |
| h           | ST_FlipCoordinates(geom)                    | 翻转 *geom* 的 X 和 Y 坐标                                   |
| h           | ST_Holes(geom)                              | 返回 *geom* 中的孔（可能是 GEOMETRYCOLLECTION）              |
| h           | ST_Normalize(geom)                          | 将 *geom* 转换为正常形式                                     |
| p           | ST_RemoveRepeatedPoints(geom [, tolerance]) | 从 *geom* 中删除重复的坐标                                   |
| h           | ST_RemoveHoles(geom)                        | 移除 *geom* 的孔                                             |
| p           | ST_RemovePoint(linestring, index)           | 删除 *linestring* 中给定 *index* 处的 *point*                |
| h           | ST_Reverse(geom)                            | 反转 *geom* 坐标的顺序                                       |

未实现：

- `ST_CollectionExtract(geom, dimension)` 过滤 *geom*，返回具有给定 `dimension (1 = point, 2 = line-string, 3 = polygon)` 的成员的多重几何图形。

#### 几何编辑功能（3D）

以下函数可修改 3D 几何图形。

| C（兼容性） | 运算符语法            | 描述                            |
| :---------- | :-------------------- | :------------------------------ |
| H           | ST_AddZ(geom, zToAdd) | 将 zToAdd 添加到 geom 的 z 坐标 |

未实现：

- `ST_Interpolate3DLine(geom)` 返回带有 z 值插值的 *geom*，如果它不是线串或 MULTILINESTRING，则返回 null；
- `ST_MultiplyZ(geom, zFactor)` 返回 *geom* 的 z 值乘以 *zFactor*；
- `ST_Reverse3DLine(geom [, sortOrder ])` 可能会根据其第一个和最后一个坐标的 z 值反转 *geom*；
- `ST_UpdateZ(geom, newZ [, updateCondition ])` 更新 *geom* 的 z 值；
- `ST_ZUpdateLineExtremities(geom, startZ, endZ [, interpolate ])` 更新 *geom* 的起始和终止 z 值。

#### 几何测量功能（2D）

以下函数测量几何形状。

| C（兼容性） | 运算符语法                                                  | 描述                                                         |
| :---------- | :---------------------------------------------------------- | :----------------------------------------------------------- |
| o           | ST_Area(geom)                                               | 返回 *geom* 的面积（可能是 GEOMETRYCOLLECTION）              |
| h           | ST_ClosestCoordinate(point, geom)                           | 返回最接近 *point* 的 *geom* 坐标                            |
| h           | ST_ClosestPoint(geom1, geom2)                               | 返回 *geom1* 最接近 *geom2* 的点                             |
| h           | ST_FurthestCoordinate(geom, point)                          | 返回距离*点*最远的*几何*的坐标                               |
| h           | ST_Length(geom)                                             | 返回 *geom* 的长度                                           |
| h           | ST_LocateAlong(geom, segmentLengthFraction, offsetDistance) | 返回一个 MULTIPOINT，其中包含位于 *geom* 线段 *segmentLengthFraction* 和 *offsetDistance* 处的点 |
| h           | ST_LongestLine(geom1, geom2)                                | 返回 *geom1* 和 *geom2* 点之间的二维最长线串                 |
| h           | ST_MaxDistance(geom1, geom2)                                | 计算 *geom1* 和 *geom2* 之间的最大距离                       |
| h           | ST_Perimeter(polygon)                                       | 返回 *polygon* (可能是 MULTIPOLYGON) 的周长长度              |
| h           | ST_ProjectPoint(point, lineString)                          | 将 *point* 投影到 *lineString* 上（可能是 MULTILINESTRING）  |

#### 几何测量功能（3D）

未实现：

- `ST_3DArea(geom)` 返回多边形的三维面积；
- `ST_3DLength(geom)` 返回线串的 3D 长度；
- `ST_3DPerimeter(geom)` 返回多边形或MULTIPOLYGON的三维周长；
- `ST_SunPosition(point [, timestamp ])` 计算 *point* 和 *timestamp* 处的太阳位置（现在默认）。

#### 几何处理功能（2D）

以下函数处理几何图形。

| C（兼容性） | 运算符语法                                  | 描述                                                         |
| :---------- | :------------------------------------------ | :----------------------------------------------------------- |
| o           | ST_LineMerge(geom)                          | 合并线性组件的集合以形成最大长度的线串                       |
| o           | ST_MakeValid(geom)                          | 将给定的无效几何图形转换为有效几何图形                       |
| o           | ST_Polygonize(geom)                         | 从 *geom* 的边缘创建一个 MULTIPOLYGON                        |
| o           | ST_PrecisionReducer(geom, n)                | 将 *geom* 的精度降低至 *n* 位小数                            |
| o           | ST_Simplify(geom, distance)                 | 使用 [Douglas-Peuker 算法](https://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm) 和 *distance* 容差来简化 *geom* |
| o           | ST_SimplifyPreserveTopology(geom, distance) | 简化 *geom*，保留其拓扑结构                                  |
| o           | ST_Snap(geom1, geom2, tolerance)            | 将 *geom1* 和 *geom2* 对齐在一起                             |
| p           | ST_Split(geom, blade)                       | 通过 *blade* 分割 *geom*                                     |

未实现：

- `ST_LineIntersector(geom1, geom2)` 将 *geom1* （线串）与 *geom2* 分割；
- `ST_LineMerge(geom)` 合并线性组件的集合以形成最大长度的线串；
- `ST_MakeValid(geom [, retainGeomDim [, retainDuplicateCoord [, retainCoordDim]]])` 使 *geom* 有效；
- `ST_RingSideBuffer(geom, distance, bufferCount [, endCapStyle [, doDifference]])` 计算一侧的环形缓冲区；
- `ST_SideBuffer(geom, distance [, bufferStyle ])` 计算一侧的单个缓冲区。

#### 几何投影函数

由于 EPSG 数据集的[使用条款](https://epsg.org/terms-of-use.html)有限制，因此它与 Proj4J 分开发布。为了使用 Apache Calcite 中的投影函数，用户必须在其依赖项中包含 EPSG 数据集。

| C（兼容性） | 运算符语法               | 描述                                                        |
| :---------- | :----------------------- | :---------------------------------------------------------- |
| o           | ST_SetSRID(geom, srid)   | 返回具有新 SRID 的 *geom* 副本                              |
| o           | ST_Transform(geom, srid) | 将 *geom* 从一个坐标参考系统 (CRS) 转换为 *srid* 指定的 CRS |

#### 三角函数

未实现：

- `ST_Azimuth(point1, point2)` 返回从 *point1* 到 *point2* 的线段的方位角。

#### 地形函数

未实现：

- `ST_TriangleAspect(geom)` 返回三角形的纵横比；
- `ST_TriangleContouring(query [, z1, z2, z3 ][, varArgs ]*)` 将三角形按类别分割成更小的三角形；
- `ST_TriangleDirection(geom)` 计算三角形的最陡上升方向并将其以线串形式返回；
- `ST_TriangleSlope(geom)` 以百分比形式计算三角形的斜率；
- `ST_Voronoi(geom [, outDimension [, envelopePolygon ]])` 创建 Voronoi 图。

#### 三角测量函数

| C（兼容性） | 运算符语法                            | 描述                                       |
| :---------- | :------------------------------------ | :----------------------------------------- |
| h           | ST_ConstrainedDelaunay(geom [, flag]) | 根据 *geom* 计算受约束的 Delaunay 三角剖分 |
| h           | ST_Delaunay(geom [, flag])            | 根据 *geom* 中的点计算 Delaunay 三角剖分   |

未实现：

- `ST_Tessellate(polygon)` 使用自适应三角形对*多边形* (可能是 MULTIPOLYGON) 进行镶嵌。

#### 几何聚合函数

| C（兼容性） | 运算符语法       | 描述                                   |
| :---------- | :--------------- | :------------------------------------- |
| h           | ST_Accum(geom)   | 将 *geom* 累积到数组中                 |
| h           | ST_Collect(geom) | 将 *geom* 收集到 GeometryCollection 中 |
| h           | ST_Union(geom)   | 计算 *geom* 中几何的并集               |

### JSON 函数

在以下内容中：

- *jsonValue* 是包含 JSON 值的字符串；
- *path* 是包含 JSON 路径表达式的字符串；*path* 的开头应指定模式标志 `strict` 或 `lax`。

#### 查询函数

| 运算符语法                                                   | 描述                                                         |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| JSON_EXISTS(jsonValue, path [ { TRUE \| FALSE \| UNKNOWN \| ERROR } ON ERROR ] ) | *jsonValue* 是否满足使用 JSON 路径表达式 *path* 描述的搜索条件 |
| JSON_VALUE(jsonValue, path [ RETURNING type ] [ { ERROR \| NULL \| DEFAULT expr } ON EMPTY ] [ { ERROR \| NULL \| DEFAULT expr } ON ERROR ] ) | 使用 JSON 路径表达式 *path* 从 *jsonValue* 中提取 SQL 标量   |
| JSON_QUERY(jsonValue, path [ { WITHOUT [ ARRAY ] \| WITH [ CONDITIONAL \| UNCONDITIONAL ] [ ARRAY ] } WRAPPER ] [ { ERROR \| NULL \| EMPTY ARRAY \| EMPTY OBJECT } ON EMPTY ] [ { ERROR \| NULL \| EMPTY ARRAY \| EMPTY OBJECT } ON ERROR ] ) | 使用 *path* JSON 路径表达式从 *jsonValue* 中提取 JSON 对象或 JSON 数组 |

注意：

- `ON ERROR` 和 `ON EMPTY` 子句定义当抛出错误或即将返回空值时函数的回退行为；
- `ARRAY WRAPPER` 子句定义如何在 `JSON_QUERY` 函数中表示 JSON 数组结果。以下示例比较了包装器行为。

示例数据：

```json
{"a": "[1,2]", "b": [1,2], "c": "hi"}
```

比较：

| 运算符语法                                  | $.A         | $.B       | $.C      |
| :------------------------------------------ | :---------- | :-------- | :------- |
| JSON_VALUE                                  | [1, 2]      | error     | hi       |
| JSON QUERY WITHOUT ARRAY WRAPPER            | error       | [1, 2]    | error    |
| JSON QUERY WITH UNCONDITIONAL ARRAY WRAPPER | [ “[1,2]” ] | [ [1,2] ] | [ “hi” ] |
| JSON QUERY WITH CONDITIONAL ARRAY WRAPPER   | [ “[1,2]” ] | [1,2]     | [ “hi” ] |

未实现：

- JSON_TABLE

#### 构造函数

| 运算符语法                                                   | 描述                               |
| :----------------------------------------------------------- | :--------------------------------- |
| JSON_OBJECT( jsonKeyVal [, jsonKeyVal ]* [ nullBehavior ] )  | 使用一系列键值对构造 JSON 对象     |
| JSON_OBJECTAGG( jsonKeyVal [ nullBehavior ] )                | 使用键值对构建 JSON 对象的聚合函数 |
| JSON_ARRAY( [ jsonVal [, jsonVal ]* ] [ nullBehavior ] )     | 使用一系列值构造 JSON 数组         |
| JSON_ARRAYAGG( jsonVal [ ORDER BY orderItem [, orderItem ]* ] [ nullBehavior ] ) | 使用值构建 JSON 数组的聚合函数     |

```json
jsonKeyVal:
      [ KEY ] name VALUE value [ FORMAT JSON ]
  |   name : value [ FORMAT JSON ]

jsonVal:
      value [ FORMAT JSON ]

nullBehavior:
      NULL ON NULL
  |   ABSENT ON NULL
```

注意：

- 标志 `FORMAT JSON` 表示值被格式化为 JSON 字符串。当使用 `FORMAT JSON` 时，该值应该从 JSON 字符串解析为 SQL 结构化值；
- `ON NULL` 子句定义 JSON 输出如何表示空值。`JSON_OBJECT` 和 `JSON_OBJECTAGG` 的默认空行为是 `NULL ON NULL`，而对于 `JSON_ARRAY` 和 `JSON_ARRAYAGG`，则为 `ABSENT ON NULL`；
- 如果提供了 `ORDER BY` 子句，`JSON_ARRAYAGG` 会在执行聚合之前将输入行按指定顺序排序。

#### 比较运算符

| 运算符语法                      | 描述                             |
| :------------------------------ | :------------------------------- |
| jsonValue IS JSON [ VALUE ]     | *jsonValue* 是否为 JSON 值       |
| jsonValue IS NOT JSON [ VALUE ] | *jsonValue* 是否不是 JSON 值     |
| jsonValue IS JSON SCALAR        | *jsonValue* 是否是 JSON 标量值   |
| jsonValue IS NOT JSON SCALAR    | *jsonValue* 是否不是 JSON 标量值 |
| jsonValue IS JSON OBJECT        | *jsonValue* 是否为 JSON 对象     |
| jsonValue IS NOT JSON OBJECT    | *jsonValue* 是否不是 JSON 对象   |
| jsonValue IS JSON ARRAY         | *jsonValue* 是否为 JSON 数组     |
| jsonValue IS NOT JSON ARRAY     | *jsonValue* 是否不是 JSON 数组   |

### 特定方言运算符

以下运算符不在 SQL 标准中，并且未在 Calcite 的默认运算符表中启用。仅当您的会话启用了额外的运算符表时，它们才可用于查询。

要启用操作员表，请设置 [fun](https://calcite.apache.org/docs/adapter.html#jdbc-connect-string-parameters) 连接字符串参数。

“C”（兼容性）列包含值：

- ‘*’ 代表所有库，
- ‘b’ 代表 Google BigQuery（连接字符串中为 ‘fun=bigquery’），
- ‘c’ 代表 Apache Calcite（连接字符串中为 ‘fun=calcite’），
- ‘h’ 代表 Apache Hive（连接字符串中为 ‘fun=hive’），
- ‘m’ 代表 MySQL（连接字符串中为 ‘fun=mysql’），
- ‘q’ 代表 Microsoft SQL Server（连接字符串中为 ‘fun=mssql’），
- ‘o’ 代表 Oracle（连接字符串中为 ‘fun=oracle’），
- ‘p’ 代表 PostgreSQL（连接字符串中为 ‘fun=postgresql’），
- ‘s’ 代表 Apache Spark（连接字符串中为 ‘fun=spark’）。

一个操作符名称可能对应多种SQL方言，但语义不同。

- BigQuery 的类型系统对类型和函数使用了容易混淆的不同名称：

- BigQuery 的 `DATETIME` 类型表示本地日期时间，与 Calcite 的 `TIMESTAMP` 类型相对应；
- BigQuery 的 `TIMESTAMP` 类型表示瞬间，与 Calcite 的 `TIMESTAMP WITH LOCAL TIME ZONE` 类型相对应；
- *timestampLtz* 参数（例如 `DATE(timestampLtz)` 中的参数）具有 Calcite 类型 `TIMESTAMP WITH LOCAL TIME ZONE`；
- `TIMESTAMP(string)` 函数旨在与 BigQuery 函数兼容，返回 Calcite `TIMESTAMP WITH LOCAL TIME ZONE`；
- 类似地，`DATETIME(string)` 返回 Calcite `TIMESTAMP`。

| C（兼容性） | 运算符语法                                                   | 描述                                                         |
| :---------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| p           | expr :: type                                                 | 将 *expr* 转换为 *type*                                      |
| m           | expr1 <=> expr2                                              | 两个值是否相等，将空值视为相同，类似于`IS NOT DISTINCT FROM` |
| *           | ACOSH(numeric)                                               | 返回 *numeric* 的反双曲余弦值                                |
| s           | ARRAY([expr [, expr ]*])                                     | 在 Apache Spark 中构造一个数组。该函数允许用户使用 `ARRAY()` 创建一个空数组 |
| s           | ARRAY_APPEND(array, element)                                 | 将一个元素附加到数组末尾并返回结果。元素的类型应与数组元素的类型相似。如果数组为空，则函数将返回空值。如果元素为空，则将空元素添加到数组末尾 |
| s           | ARRAY_COMPACT(array)                                         | 从*数组*中删除空值                                           |
| b           | ARRAY_CONCAT(array [, array ]*)                              | 连接一个或多个数组。如果任何输入参数为“NULL”，则函数返回“NULL” |
| s           | ARRAY_CONTAINS(array, element)                               | 如果 *数组* 包含 *元素*，则返回 true                         |
| s           | ARRAY_DISTINCT(array)                                        | 从保持元素排序的数组中删除重复的值                           |
| s           | ARRAY_EXCEPT(array1, array2)                                 | 返回 *array1* 中存在但不存在于 *array2* 中的元素数组，且无重复 |
| s           | ARRAY_INSERT(array, pos, element)                            | 将 *元素* 放入 *数组* 的索引 *pos* 中。数组索引从 1 开始，如果索引为负数，则从末尾开始。数组大小之上的索引将使用 `NULL` 元素附加到数组中，如果索引为负数，则将 `NULL` 元素添加到数组前面。 |
| s           | ARRAY_INTERSECT(array1, array2)                              | 返回 *array1* 和 *array2* 交集处的元素数组，不包含重复项     |
| s           | ARRAY_JOIN(array, delimiter [, nullText ])                   | `ARRAY_TO_STRING` 的同义词                                   |
| b           | ARRAY_LENGTH(array)                                          | `CARDINALITY` 的同义词                                       |
| s           | ARRAY_MAX(array)                                             | 返回数组中的最大值                                           |
| s           | ARRAY_MIN(array)                                             | 返回数组中的最小值                                           |
| s           | ARRAY_POSITION(array, element)                               | 返回数组中第一个元素的（从 1 开始）索引                      |
| s           | ARRAY_REMOVE(array, element)                                 | 从*数组*中删除所有等于*元素*的元素                           |
| s           | ARRAY_PREPEND(array, element)                                | 将一个元素附加到数组的开头并返回结果。元素的类型应与数组元素的类型相似。如果数组为空，则函数将返回空。如果元素为空，则将空元素添加到数组的开头 |
| s           | ARRAY_REPEAT(element, count)                                 | 返回包含元素 count 次的数组。                                |
| b           | ARRAY_REVERSE(array)                                         | 反转*数组*的元素                                             |
| s           | ARRAY_SIZE(array)                                            | `CARDINALITY` 的同义词                                       |
| b           | ARRAY_TO_STRING(array, delimiter [, nullText ])              | 将 *array* 中元素的连接作为 STRING 返回，并以 *delimiter* 作为分隔符。如果使用 *nullText* 参数，则该函数会将数组中的任何 `NULL` 值替换为 *nullText* 的值。如果未使用 *nullText* 参数，则该函数会省略 `NULL` 值及其前面的分隔符。如果任何参数为 `NULL`，则返回 `NULL` |
| s           | ARRAY_UNION(array1, array2)                                  | 返回 *array1* 和 *array2* 的并集元素数组，不包含重复元素     |
| s           | ARRAYS_OVERLAP(array1, array2)                               | 如果 *array1 至少包含一个非空元素，并且该元素也存在于 \*array2* 中，则返回 true。如果两个数组没有共同元素，且两个数组都非空，并且其中一个数组包含一个空元素，则返回 null，否则返回 false |
| s           | ARRAYS_ZIP(array [, array ]*)                                | 返回合并的结构体*数组*，其中第 N 个结构体包含输入数组的所有第 N 个值 |
| s           | SORT_ARRAY(array [, ascendingOrder])                         | 根据数组元素的自然顺序，按升序或降序对 *数组* 进行排序。如果未指定 *ascendingOrder*，则默认顺序为升序。空元素将按升序放置在返回数组的开头，或按降序放置在返回数组的末尾 |
| *           | ASINH(numeric)                                               | 返回 *numeric* 的反双曲正弦值                                |
| *           | ATANH(numeric)                                               | 返回 *numeric* 的反双曲正切值                                |
| f           | BITAND_AGG(value)                                            | 相当于 `BIT_AND(value)`                                      |
| f           | BITOR_AGG(value)                                             | 相当于 `BIT_OR(value)`                                       |
| s           | BIT_LENGTH(binary)                                           | 返回*二进制*的位长度                                         |
| s           | BIT_LENGTH(string)                                           | 返回 *string* 的位长度                                       |
| s           | BIT_GET(value, position)                                     | 返回数字*值*指定*位置*的位（0 或 1）值。位置从右到左编号，从零开始。*位置*参数不能为负数 |
| b           | CEIL(value)                                                  | 与标准 `CEIL(value)` 类似，除非 *value* 是整数类型，否则返回类型为双精度 |
| m s         | CHAR(integer)                                                | 返回 ASCII 码为 *integer* % 256 的字符，如果 *integer* < 0，则返回 null |
| b o p       | CHR(integer)                                                 | 返回 UTF-8 代码为 *整数* 的字符                              |
| b           | CODE_POINTS_TO_BYTES(integers)                               | 将*整数*（0 到 255 之间的整数数组，含 0 和 255）转换为字节；如果任何元素超出范围，则会引发错误 |
| b           | CODE_POINTS_TO_STRING(integers)                              | 将 *整数*（0 到 0xD7FF 之间或 0xE000 到 0x10FFFF 之间的整数数组）转换为字符串；如果任何元素超出范围，则会引发错误 |
| o           | CONCAT(string, string)                                       | 连接两个字符串，仅当两个字符串参数都为空时才返回空，否则将空视为空字符串 |
| b m         | CONCAT(string [, string ]*)                                  | 连接一个或多个字符串，如果任何参数为空，则返回空             |
| p q         | CONCAT(string [, string ]*)                                  | 连接一个或多个字符串，null 被视为空字符串                    |
| m p         | CONCAT_WS(separator, str1 [, string ]*)                      | 连接一个或多个字符串，仅当分隔符为空时才返回空，否则将空参数视为空字符串 |
| q           | CONCAT_WS(separator, str1, str2 [, string ]*)                | 连接两个或多个字符串，需要至少 3 个参数（最多 254 个），将空参数视为空字符串 |
| m           | COMPRESS(string)                                             | 使用 zlib 压缩来压缩字符串并将结果作为二进制字符串返回       |
| b           | CONTAINS_SUBSTR(expression, string [ , json_scope => json_scope_value ]) | 返回 *string* 是否作为子字符串存在于 *expression* 中。可选的 *json_scope* 参数指定如果 *expression* 为 JSON 格式，则搜索的范围。如果 *expression* 中存在 NULL 且不匹配，则返回 NULL |
| q           | CONVERT(type, expression [ , style ])                        | 相当于 `CAST(expression AS type)`；忽略 *style* 操作数       |
| p           | CONVERT_TIMEZONE(tz1, tz2, datetime)                         | 将 *datetime* 的时区从 *tz1* 转换为 *tz2*                    |
| *           | COSH(numeric)                                                | 返回 *numeric* 的双曲余弦                                    |
| *           | COTH(numeric)                                                | 返回 *numeric* 的双曲余切                                    |
| *           | CSC(numeric)                                                 | 以弧度返回 *numeric* 的余割                                  |
| *           | CSCH(numeric)                                                | 返回 *numeric* 的双曲余割                                    |
| b           | CURRENT_DATETIME([ timeZone ])                               | 从 *timezone* 返回当前时间作为时间戳                         |
| m           | DAYNAME(datetime)                                            | 返回连接语言环境中 *datetime* 中的星期几名称；例如，对于 DATE ‘2020-02-10’ 和 TIMESTAMP ‘2020-02-10 10:10:10’，它均返回‘星期日’ |
| b           | DATE(timestamp)                                              | 从*时间戳*中提取日期                                         |
| b           | DATE(timestampLtz)                                           | 从 *timestampLtz*（一个瞬间；BigQuery 的 TIMESTAMP 类型）中提取 DATE，假设为 UTC |
| b           | DATE(timestampLtz, timeZone)                                 | 从 *timeZone* 中的 *timestampLtz*（瞬间；BigQuery 的 TIMESTAMP 类型）中提取 DATE |
| b           | DATE(string)                                                 | 相当于 `CAST(string AS DATE)`                                |
| b           | DATE(year, month, day)                                       | 返回 *year*、*month* 和 *day* 的 DATE 值（均为 INTEGER 类型） |
| p q         | DATEADD(timeUnit, integer, datetime)                         | 相当于 `TIMESTAMPADD(timeUnit, integer, datetime)`           |
| p q         | DATEDIFF(timeUnit, datetime, datetime2)                      | 相当于 `TIMESTAMPDIFF(timeUnit, datetime, datetime2)`        |
| q           | DATEPART(timeUnit, datetime)                                 | 相当于 `EXTRACT(timeUnit FROM datetime)`                     |
| b           | DATETIME(date, time)                                         | 将*日期*和*时间*转换为时间戳                                 |
| b           | DATETIME(date)                                               | 将*日期*转换为时间戳值（午夜）                               |
| b           | DATETIME(date, timeZone)                                     | 将 *date* 转换为 TIMESTAMP 值（午夜），以 *timeZone* 为单位  |
| b           | DATETIME(year, month, day, hour, minute, second)             | 为*年*、*月*、*日*、*时*、*分*、*秒* 创建时间戳（所有类型均为 INTEGER） |
| b           | DATETIME_ADD(timestamp, interval)                            | 返回在 *timestamp* 之后 *interval* 发生的 TIMESTAMP 值       |
| b           | DATETIME_DIFF(timestamp, timestamp2, timeUnit)               | 返回 *timestamp* 和 *timestamp2* 之间的 *timeUnit* 的整数    |
| b           | DATETIME_SUB(timestamp, interval)                            | 返回在 *timestamp* 之前 *interval* 发生的 TIMESTAMP          |
| b           | DATETIME_TRUNC(timestamp, timeUnit)                          | 将 *timestamp* 截断为 *timeUnit* 的粒度，四舍五入到单位的开头 |
| b s         | DATE_FROM_UNIX_DATE(integer)                                 | 返回 1970-01-01 之后 *整数* 天的 DATE                        |
| p           | DATE_PART(timeUnit, datetime)                                | 相当于 `EXTRACT(timeUnit FROM datetime)`                     |
| b           | DATE_ADD(date, interval)                                     | 返回在 *date* 之后 *interval* 发生的 DATE 值                 |
| b           | DATE_DIFF(date, date2, timeUnit)                             | 返回 *date* 和 *date2* 之间的 *timeUnit* 的整数              |
| b           | DATE_SUB(date, interval)                                     | 返回在 *date* 之前 *interval* 发生的 DATE 值                 |
| b           | DATE_TRUNC(date, timeUnit)                                   | 将 *date* 截断为 *timeUnit* 的粒度，四舍五入到单位的开头     |
| o s         | DECODE(value, value1, result1 [, valueN, resultN ]* [, default ]) | 将 *value* 与每个 *valueN* 值逐一进行比较；如果 *value* 等于 *valueN*，则返回相应的 *resultN*，否则返回 *default*，如果未指定 *default*，则返回 NULL |
| p           | DIFFERENCE(string, string)                                   | 返回两个字符串的相似度度量，即它们的 `SOUNDEX` 值具有相同的字符位置数：如果 `SOUNDEX` 值相同，则返回 4；如果 `SOUNDEX` 值完全不同，则返回 0 |
| f s         | ENDSWITH(string1, string2)                                   | 返回 *string2* 是否是 *string1* 的后缀                       |
| b p         | ENDS_WITH(string1, string2)                                  | 相当于 `ENDSWITH(string1, string2)`                          |
| s           | EXISTS(array, func)                                          | 返回谓词 *func* 是否对 *array* 中的一个或多个元素成立        |
| o           | EXISTSNODE(xml, xpath, [, namespaces ])                      | 确定使用指定的 xpath 遍历 XML 文档是否会产生任何节点。如果在 XPath 表达式匹配的元素或元素的文档片段上应用 XPath 遍历后没有剩余节点，则返回 0。如果剩余任何节点，则返回 1。可选命名空间值，用于指定前缀的默认映射或命名空间映射，在评估 XPath 表达式时使用。 |
| o           | EXTRACT(xml, xpath, [, namespaces ])                         | 返回与 XPath 表达式匹配的元素的 XML 片段。可选的命名空间值，用于指定前缀的默认映射或命名空间映射，在评估 XPath 表达式时使用 |
| m           | EXTRACTVALUE(xml, xpathExpr))                                | 返回 XPath 表达式匹配的元素或元素的子元素的第一个文本节点的文本。 |
| h s         | FACTORIAL(integer)                                           | 返回*integer*的阶乘，*integer*的范围是[0, 20]。否则返回NULL  |
| h s         | FIND_IN_SET(matchStr, textStr)                               | 返回逗号分隔的 *textStr* 中给定 *matchStr* 的索引（从 1 开始）。如果未找到给定的 *matchStr* 或 *matchStr* 包含逗号，则返回 0。例如，FIND_IN_SET(‘bc’, ‘a,bc,def’) 返回 2 |
| b           | FLOOR(value)                                                 | 与标准 `FLOOR(value)` 类似，除非 *value* 是整数类型，否则返回类型为双精度 |
| b           | FORMAT_DATE(string, date)                                    | 根据指定的格式 *string* 格式化 *date*                        |
| b           | FORMAT_DATETIME(string, timestamp)                           | 根据指定的格式 *string* 格式化 *timestamp*                   |
| h s         | FORMAT_NUMBER(value, decimalVal)                             | 将数字 *value* 格式化为 ‘#,###,###.##’，四舍五入到小数位 *decimalVal*。如果 *decimalVal* 为 0，则结果没有小数点或小数部分 |
| h s         | FORMAT_NUMBER(value, format)                                 | 将数字*值*格式化为 MySQL 的 FORMAT *格式*，如‘#,###,###.##0.00’ |
| b           | FORMAT_TIME(string, time)                                    | 根据指定的格式 *string* 格式化 *time*                        |
| b           | FORMAT_TIMESTAMP(string timestamp)                           | 根据指定的格式 *string* 格式化 *timestamp*                   |
| s           | GETBIT(value, position)                                      | 相当于 `BIT_GET(value, position)`                            |
| b o s       | GREATEST(expr [, expr ]*)                                    | 返回表达式中最大的一个                                       |
| b h s       | IF(condition, value1, value2)                                | 如果 *condition* 为 TRUE，则返回 *value1*，否则返回 *value2* |
| b s         | IFNULL(value1, value2)                                       | 相当于 `NVL(value1, value2)`                                 |
| p           | string1 ILIKE string2 [ ESCAPE string3 ]                     | *string1* 是否与模式 *string2* 匹配，忽略大小写（类似于 `LIKE`） |
| p           | string1 NOT ILIKE string2 [ ESCAPE string3 ]                 | *string1* 是否与模式 *string2* 不匹配，忽略大小写（类似于 `NOT LIKE`） |
| b o         | INSTR(string, substring [, from [, occurrence ] ])           | 返回 *string* 中 *substring* 的位置，从 *from* （默认 1）开始搜索，直到找到 *substring* 的第 n 次 *occurrence* （默认 1） |
| m           | INSTR(string, substring)                                     | 相当于 `POSITION(子字符串 IN 字符串)`                        |
| b           | IS_INF(value)                                                | 返回*值*是否无限                                             |
| b           | IS_NAN(value)                                                | 返回 *value* 是否为 NaN                                      |
| m           | JSON_TYPE(jsonValue)                                         | 返回一个字符串值，表示 *jsonValue* 的类型                    |
| m           | JSON_DEPTH(jsonValue)                                        | 返回一个整数值，表示 *jsonValue* 的深度                      |
| m           | JSON_PRETTY(jsonValue)                                       | 返回 *jsonValue* 的格式化打印                                |
| m           | JSON_LENGTH(jsonValue [, path ])                             | 返回一个整数，表示 *jsonValue* 的长度                        |
| m           | JSON_INSERT(jsonValue, path, val [, path, val ]*)            | 返回一个 JSON 文档，插入 *jsonValue*、*path*、*val* 的数据。 |
| m           | JSON_KEYS(jsonValue [, path ])                               | 返回表示 JSON *jsonValue* 的键的字符串                       |
| m           | JSON_REMOVE(jsonValue, path [, path ])                       | 使用一系列 *path* 表达式从 *jsonValue* 中删除数据并返回结果  |
| m           | JSON_REPLACE(jsonValue, path, val [, path, val ]*)           | 返回一个 JSON 文档，替换 *jsonValue*、*path*、*val* 的数据。 |
| m           | JSON_SET(jsonValue, path, val [, path, val ]*)               | 返回一个 JSON 文档，其中包含 *jsonValue*、*path*、*val* 的数据。 |
| m           | JSON_STORAGE_SIZE(jsonValue)                                 | 返回用于存储 *jsonValue* 二进制表示的字节数                  |
| b o s       | LEAST(expr [, expr ]* )                                      | 返回表达式中的最小值                                         |
| b m p s     | LEFT(string, length)                                         | 返回*字符串*最左边的*长度*个字符                             |
| f s         | LEN(string)                                                  | 相当于 `CHAR_LENGTH(string)`                                 |
| b f s       | LENGTH(string)                                               | 相当于 `CHAR_LENGTH(string)`                                 |
| h s         | LEVENSHTEIN(string1, string2)                                | 返回 *string1* 和 *string2* 之间的编辑距离                   |
| b           | LOG(numeric1 [, numeric2 ])                                  | 返回以 *numeric1* 为底数 *numeric2* 的对数，如果 *numeric2* 不存在，则返回以 e 为底数 |
| m s         | LOG2(numeric)                                                | 返回 *numeric* 的以 2 为底的对数                             |
| b o s       | LPAD(string, length [, pattern ])                            | 返回由 *string* 和 *length* 开头且带有 *pattern* 的字符串或字节值 |
| b           | TO_BASE32(string)                                            | 将 *string* 转换为 base-32 编码形式并返回编码字符串          |
| b           | FROM_BASE32(string)                                          | 以字符串形式返回 base-32 *string* 的解码结果                 |
| m           | TO_BASE64(string)                                            | 将 *string* 转换为 base-64 编码形式并返回编码字符串          |
| b m         | FROM_BASE64(string)                                          | 以字符串形式返回 base-64 *string* 的解码结果                 |
| b           | TO_HEX(binary)                                               | 将 *binary* 转换为十六进制 varchar                           |
| b           | FROM_HEX(varchar)                                            | 将十六进制编码的 *varchar* 转换为字节                        |
| b o s       | LTRIM(string)                                                | 返回从开头删除所有空格的 *string*                            |
| s           | MAP()                                                        | 返回空映射                                                   |
| s           | MAP(key, value [, key, value]*)                              | 返回具有给定 *key*/*value* 对的映射                          |
| s           | MAP_CONCAT(map [, map]*)                                     | 连接一个或多个地图。如果任何输入参数为“NULL”，则函数返回“NULL”。请注意，calcite 使用的是 LAST_WIN 策略 |
| s           | MAP_CONTAINS_KEY(map, key)                                   | 返回 *map* 是否包含 *key*                                    |
| s           | MAP_ENTRIES(map)                                             | 以数组形式返回 *map* 的条目，条目的顺序未定义                |
| s           | MAP_KEYS(map)                                                | 以数组形式返回 *map* 的键，条目的顺序未定义。                |
| s           | MAP_VALUES(map)                                              | 将 *map* 的值作为数组返回，条目的顺序未定义                  |
| s           | MAP_FROM_ARRAYS(array1, array2)                              | 返回由 *array1* 和 *array2* 创建的映射。请注意，两个数组的长度应该相同，并且 calcite 使用 LAST_WIN 策略 |
| s           | MAP_FROM_ENTRIES(arrayOfRows)                                | 返回由具有两个字段的行数组创建的映射。请注意，一行中的字段数必须为 2。请注意，calcite 使用 LAST_WIN 策略 |
| s           | STR_TO_MAP(string [, stringDelimiter [, keyValueDelimiter]]) | 使用分隔符将 *string* 拆分为键/值对后返回映射。*stringDelimiter* 的默认分隔符为‘,’，*keyValueDelimiter* 的默认分隔符为‘:’。请注意，calcite 使用的是 LAST_WIN 策略 |
| b m p s     | MD5(string)                                                  | 计算 *string* 的 MD5 128 位校验和并将其作为十六进制字符串返回 |
| m           | MONTHNAME(date)                                              | 返回连接的区域设置中 *datetime* 月份的名称；例如，对于 DATE ‘2020-02-10’ 和 TIMESTAMP ‘2020-02-10 10:10:10’，它均返回‘二月’ |
| o s         | NVL(value1, value2)                                          | 如果 *value1* 不为空，则返回 *value1*，否则返回 *value2*     |
| b           | OFFSET(index)                                                | 当索引一个数组时，将 *index* 包装在 `OFFSET` 中将返回基于 0 的 *index* 处的值；如果 *index* 超出范围，则会引发错误 |
| b           | ORDINAL(index)                                               | 与 `OFFSET` 类似，但 *index* 从 1 开始                       |
| b           | PARSE_DATE(format, string)                                   | 使用 *format* 指定的格式将日期的 *string* 表示形式转换为 DATE 值 |
| b           | PARSE_DATETIME(format, string)                               | 使用 *format* 指定的格式将日期时间的 *string* 表示形式转换为 TIMESTAMP 值 |
| b           | PARSE_TIME(format, string)                                   | 使用 *format* 指定的格式将时间的 *string* 表示形式转换为 TIME 值 |
| b           | PARSE_TIMESTAMP(format, string[, timeZone])                  | 使用 *format* 指定的格式将时间戳的 *string* 表示形式转换为 *timeZone* 中的 TIMESTAMP WITH LOCAL TIME ZONE 值 |
| h s         | PARSE_URL(urlString, partToExtract [, keyToExtract] )        | 从 *urlString* 返回指定的 *partToExtract*。*partToExtract* 的有效值包括 HOST、PATH、QUERY、REF、PROTOCOL、AUTHORITY、FILE 和 USERINFO。*keyToExtract* 指定要提取哪个查询 |
| b s         | POW(numeric1, numeric2)                                      | 返回 *numeric1* 的 *numeric2* 次方                           |
| p           | RANDOM()                                                     | 生成 0 到 1 之间的随机双精度数（含 0 和 1）                  |
| s           | REGEXP(string, regexp)                                       | 相当于 `string1 RLIKE string2`                               |
| b           | REGEXP_CONTAINS(string, regexp)                              | 返回 *string* 是否与 *regexp* 部分匹配                       |
| b           | REGEXP_EXTRACT(string, regexp [, position [, occurrence]])   | 返回 *string* 中与 *regexp* 匹配的子字符串，从 *position*（默认 1）开始搜索，直到找到第 n 次 *occurrence*（默认 1）。如果没有匹配，则返回 NULL |
| b           | REGEXP_EXTRACT_ALL(string, regexp)                           | 返回 *string* 中与 *regexp* 匹配的所有子字符串的数组。如果没有匹配，则返回一个空数组 |
| b           | REGEXP_INSTR(string, regexp [, position [, occurrence [, occurrence_position]]]) | 返回与 *regexp* 匹配的 *string* 中子字符串的最低 1 位置，从 *position*（默认 1）开始搜索，直到找到第 n 个 *occurrence*（默认 1）。将 indication_position（默认 0）设置为 1 将返回子字符串的结束位置 + 1。如果没有匹配，则返回 0 |
| m o p s     | REGEXP_LIKE(string, regexp [, flags])                        | 相当于 `string1 RLIKE string2`，但带有一个可选的搜索标志参数。支持的标志包括：<ul><li>i：不区分大小写匹配</li><li>c：区分大小写匹配</li><li>n：区分换行符匹配</li><li>s：不区分换行符匹配</li><li>m：多行</li></ul> |
| b m o       | REGEXP_REPLACE(string, regexp, rep [, pos [, occurrence [, matchType]]]) | 将 *string* 中与 *regexp* 匹配的所有子字符串替换为 expr 中起始 *pos* 处的 *rep*（如果省略，则默认为 1），*occurrence* 指定要搜索匹配的哪一次出现（如果省略，则默认为 1），*matchType* 指定如何执行匹配 |
| b           | REGEXP_SUBSTR(string, regexp [, position [, occurrence]])    | REGEXP_EXTRACT 的同义词                                      |
| b m p s     | REPEAT(string, integer)                                      | 返回由重复 *integer* 次的 *string* 组成的字符串；如果 *integer* 小于 1，则返回空字符串 |
| b m         | REVERSE(string)                                              | 返回字符顺序颠倒的*字符串*                                   |
| b m p s     | RIGHT(string, length)                                        | 返回*字符串*最右边的*长度*个字符                             |
| h s         | string1 RLIKE string2                                        | *string1* 是否与正则表达式模式 *string2* 匹配（类似于 `LIKE`，但使用 Java 正则表达式） |
| h s         | string1 NOT RLIKE string2                                    | *string1* 是否与正则表达式模式 *string2* 不匹配（类似于“NOT LIKE”，但使用 Java 正则表达式） |
| b o s       | RPAD(string, length[, pattern ])                             | 返回由 *string* 附加到 *length* 并使用 *pattern* 组成的字符串或字节值 |
| b o s       | RTRIM(string)                                                | 返回删除末尾所有空格的 *string*                              |
| b           | SAFE_ADD(numeric1, numeric2)                                 | 返回 *numeric1* + *numeric2*，溢出时返回 NULL。参数隐式转换为 BIGINT、DOUBLE 或 DECIMAL 类型之一 |
| b           | SAFE_CAST(value AS type)                                     | 将 *value* 转换为 *type*，如果转换失败则返回 NULL            |
| b           | SAFE_DIVIDE(numeric1, numeric2)                              | 返回 *numeric1* / *numeric2*，如果溢出或 *numeric2* 为零，则返回 NULL。参数隐式转换为 BIGINT、DOUBLE 或 DECIMAL 类型之一 |
| b           | SAFE_MULTIPLY(numeric1, numeric2)                            | 返回 *numeric1* * *numeric2*，或溢出时返回 NULL。参数隐式转换为 BIGINT、DOUBLE 或 DECIMAL 类型之一 |
| b           | SAFE_NEGATE(numeric)                                         | 返回 *numeric* * -1，或溢出时返回 NULL。参数隐式转换为 BIGINT、DOUBLE 或 DECIMAL 类型之一 |
| b           | SAFE_OFFSET(index)                                           | 与 `OFFSET` 类似，但如果 *index* 超出范围，则返回 null       |
| b           | SAFE_ORDINAL(index)                                          | 与 `OFFSET` 类似，但 *index* 从 1 开始，并且如果 *index* 超出范围则返回 null |
| b           | SAFE_SUBTRACT(numeric1, numeric2)                            | 返回 *numeric1* - *numeric2*，或溢出时返回 NULL。参数隐式转换为 BIGINT、DOUBLE 或 DECIMAL 类型之一 |
| *           | SEC(numeric)                                                 | 以弧度返回 *numeric* 的正割                                  |
| *           | SECH(numeric)                                                | 返回 *numeric* 的双曲正割                                    |
| b m p s     | SHA1(string)                                                 | 计算 *string* 的 SHA-1 哈希值并将其作为十六进制字符串返回    |
| b p         | SHA256(string)                                               | 计算 *string* 的 SHA-256 哈希值并将其作为十六进制字符串返回  |
| b p         | SHA512(string)                                               | 计算 *string* 的 SHA-512 哈希值并将其作为十六进制字符串返回  |
| *           | SINH(numeric)                                                | 返回 *numeric* 的双曲正弦值                                  |
| b m o p     | SOUNDEX(string)                                              | 返回 *string* 的语音表示；如果 *string* 使用多字节编码（如 UTF-8）进行编码，则抛出 |
| s           | SOUNDEX(string)                                              | 返回 *string* 的语音表示；如果 *string* 使用多字节编码（如 UTF-8）编码，则返回原始 *string* |
| m s         | SPACE(integer)                                               | 返回一个由 *整数* 空格组成的字符串；如果 *整数* 小于 1，则返回一个空字符串 |
| b           | SPLIT(string [, delimiter ])                                 | 返回以 *delimiter* 分隔的 *string* 字符串数组（如果省略，则默认为逗号）。如果 *string* 为空，则返回一个空数组，否则，如果 *delimiter* 为空，则返回一个包含原始 *string* 的数组。 |
| f s         | STARTSWITH(string1, string2)                                 | 返回 *string2* 是否是 *string1* 的前缀                       |
| b p         | STARTS_WITH(string1, string2)                                | 相当于 `STARTSWITH(string1, string2)`                        |
| m           | STRCMP(string, string)                                       | 如果两个字符串相同则返回 0，如果第一个参数小于第二个参数则返回 -1，如果第二个参数小于第一个参数则返回 1 |
| b p         | STRPOS(string, substring)                                    | 相当于 `POSITION(子字符串 IN 字符串)`                        |
| b m o p     | SUBSTR(string, position [, substringLength ])                | 返回 *string* 的一部分，从字符 *position* 开始，长度为 *substringLength* 个字符。SUBSTR 使用输入字符集定义的字符计算长度 |
| *           | TANH(numeric)                                                | 返回 *numeric* 的双曲正切                                    |
| b           | TIME(hour, minute, second)                                   | 返回 TIME 值 *小时*、*分钟*、*秒*（所有类型为 INTEGER）      |
| b           | TIME(timestamp)                                              | 从 *timestamp*（本地时间；BigQuery 的 DATETIME 类型）中提取时间 |
| b           | TIME(instant)                                                | 从 *timestampLtz*（一个瞬间；BigQuery 的 TIMESTAMP 类型）中提取时间，假设为 UTC |
| b           | TIME(instant, timeZone)                                      | 从 *timeZone* 中的 *timestampLtz*（瞬间；BigQuery 的 TIMESTAMP 类型）中提取时间 |
| b           | TIMESTAMP(string)                                            | 相当于 `CAST(string AS TIMESTAMP WITH LOCAL TIME ZONE)`      |
| b           | TIMESTAMP(string, timeZone)                                  | 相当于 `CAST(string AS TIMESTAMP WITH LOCAL TIME ZONE)`，转换为 *timeZone* |
| b           | TIMESTAMP(date)                                              | 将*日期*转换为带有本地时区的时间戳值（午夜）                 |
| b           | TIMESTAMP(date, timeZone)                                    | 将 *date* 转换为带有本地时区的时间戳值（午夜），以 *timeZone* 为单位 |
| b           | TIMESTAMP(timestamp)                                         | 将 *timestamp* 转换为带有本地时区的时间戳，假设为 UTC        |
| b           | TIMESTAMP(timestamp, timeZone)                               | 将 *timestamp* 转换为 *timeZone* 中的带有本地时区的时间戳    |
| b           | TIMESTAMP_ADD(timestamp, interval)                           | 返回在 *timestamp* 之后 *interval* 发生的 TIMESTAMP 值       |
| b           | TIMESTAMP_DIFF(timestamp, timestamp2, timeUnit)              | 返回 *timestamp* 和 *timestamp2* 之间的 *timeUnit* 的整数。相当于 `TIMESTAMPDIFF(timeUnit, timestamp2, timestamp)` 和 `(timestamp - timestamp2) timeUnit` |
| b s         | TIMESTAMP_MICROS(integer)                                    | 返回 1970-01-01 00:00:00 之后 *整数* 微秒的 TIMESTAMP        |
| b s         | TIMESTAMP_MILLIS(integer)                                    | 返回 1970-01-01 00:00:00 之后 *整数* 毫秒的 TIMESTAMP        |
| b s         | TIMESTAMP_SECONDS(integer)                                   | 返回 1970-01-01 00:00:00 之后 *整数* 秒的 TIMESTAMP          |
| b           | TIMESTAMP_SUB(timestamp, interval)                           | 返回 *timestamp* 之前 *interval* 的 TIMESTAMP 值             |
| b           | TIMESTAMP_TRUNC(timestamp, timeUnit)                         | 将 *timestamp* 截断为 *timeUnit* 的粒度，四舍五入到单位的开头 |
| b           | TIME_ADD(time, interval)                                     | 将*间隔*添加到*时间*，与任何时区无关                         |
| b           | TIME_DIFF(time, time2, timeUnit)                             | 返回 *time* 和 *time2* 之间的 *timeUnit* 的整数              |
| b           | TIME_SUB(time, interval)                                     | 返回 *time* 之前 *interval* 的 TIME 值                       |
| b           | TIME_TRUNC(time, timeUnit)                                   | 将 *time* 截断为 *timeUnit* 的粒度，四舍五入到单位的开头     |
| m o p       | TO_CHAR(timestamp, format)                                   | 使用格式 *format* 将 *timestamp* 转换为字符串                |
| b           | TO_CODE_POINTS(string)                                       | 将 *string* 转换为表示代码点或扩展 ASCII 字符值的整数数组    |
| o p         | TO_DATE(string, format)                                      | 使用格式 *format* 将 *string* 转换为日期                     |

注意：

- Calcite 没有 Redshift 库，因此改用 Postgres 库。函数 `DATEADD`、`DATEDIFF` 在 Redshift 中实现，而不是 Postgres，但它们仍然出现在 Calcite 的 Postgres 库中；

- 函数 `DATEADD`、`DATEDIFF`、`DATE_PART` 需要 Babel 解析器；
- 如果参数为 null，则 `JSON_TYPE` / `JSON_DEPTH` / `JSON_PRETTY` / `JSON_STORAGE_SIZE` 返回 null；
- 如果第一个参数为 null，则 `JSON_LENGTH` / `JSON_KEYS` / `JSON_REMOVE` 返回 null；
- `JSON_TYPE` 通常返回一个大写字符串标志，指示 JSON 输入的类型。目前支持的类型标志有：
  - INTEGER
  - STRING
  - FLOAT
  - DOUBLE
  - LONG
  - BOOLEAN
  - DATE
  - OBJECT
  - ARRAY
  - NULL

- `JSON_DEPTH` 定义 JSON 值的深度如下：
  - 空数组、空对象或标量值的深度为 1；
  - 仅包含深度为 1 的元素的非空数组或仅包含深度为 1 的成员值的非空对象深度为 2；
  - 否则，JSON 文档的深度大于 2。

- `JSON_LENGTH` 定义 JSON 值的长度如下：
  - 标量值的长度为 1；
  - 数组或对象的长度是其包含的元素数。


特定方言的聚合函数。

| C（兼容性） | 运算符语法                                                   | 描述                                                         |
| :---------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| c           | AGGREGATE(m)                                                 | 在当前 GROUP BY 键的上下文中计算度量 *m*                     |
| b p         | ARRAY_AGG( [ ALL \| DISTINCT ] value [ RESPECT NULLS \| IGNORE NULLS ] [ ORDER BY orderItem [, orderItem ]* ] ) | 将值收集到数组中                                             |
| b p         | ARRAY_CONCAT_AGG( [ ALL \| DISTINCT ] value [ ORDER BY orderItem [, orderItem ]* ] ) | 将数组连接成数组                                             |
| p s         | BOOL_AND(condition)                                          | `EVERY` 的同义词                                             |
| p s         | BOOL_OR(condition)                                           | `SOME` 的同义词                                              |
| b           | COUNTIF(condition)                                           | 返回*条件*为 TRUE 的行数；相当于 `COUNT(*) FILTER (WHERE 条件)` |
| m           | GROUP_CONCAT( [ ALL \| DISTINCT ] value [, value ]* [ ORDER BY orderItem [, orderItem ]* ] [ SEPARATOR separator ] ) | MySQL 特定的 `LISTAGG` 变体                                  |
| b           | LOGICAL_AND(condition)                                       | `EVERY` 的同义词                                             |
| b           | LOGICAL_OR(condition)                                        | `SOME` 的同义词                                              |
| s           | MAX_BY(value, comp)                                          | `ARG_MAX` 的同义词                                           |
| s           | MIN_BY(value, comp)                                          | `ARG_MIN` 的同义词                                           |
| b           | PERCENTILE_CONT(value, fraction [ RESPECT NULLS \| IGNORE NULLS ] ) OVER windowSpec | 标准 `PERCENTILE_CONT` 的同义词，其中 `PERCENTILE_CONT(value,fraction)OVER(ORDER BY value)` 相当于标准 `PERCENTILE_CONT(fraction)WITHIN GROUP(ORDER BY value)` |
| b           | PERCENTILE_DISC(value, fraction [ RESPECT NULLS \| IGNORE NULLS ] ) OVER windowSpec | 标准 `PERCENTILE_DISC` 的同义词，其中 `PERCENTILE_DISC(value,fraction)OVER(ORDER BY value)` 相当于标准 `PERCENTILE_DISC(fraction)WITHIN GROUP(ORDER BY value)` |
| b p         | STRING_AGG( [ ALL \| DISTINCT ] value [, separator] [ ORDER BY orderItem [, orderItem ]* ] ) | `LISTAGG` 的同义词                                           |

用法示例：

#### JSON_TYPE 示例

SQL

```sql
SELECT JSON_TYPE(v) AS c1,
  JSON_TYPE(JSON_VALUE(v, 'lax $.b' ERROR ON ERROR)) AS c2,
  JSON_TYPE(JSON_VALUE(v, 'strict $.a[0]' ERROR ON ERROR)) AS c3,
  JSON_TYPE(JSON_VALUE(v, 'strict $.a[1]' ERROR ON ERROR)) AS c4
FROM (VALUES ('{"a": [10, true],"b": "[10, true]"}')) AS t(v)
LIMIT 10;
```

结果

|   C1   |  C2   |   C3    |   C4    |
| :----: | :---: | :-----: | :-----: |
| OBJECT | ARRAY | INTEGER | BOOLEAN |

#### JSON_DEPTH 示例

SQL

```sql
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

#### JSON_LENGTH 示例

SQL

```sql
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

#### JSON_INSERT 示例

SQL

```sql
SELECT JSON_INSERT(v, '$.a', 10, '$.c', '[1]') AS c1,
  JSON_INSERT(v, '$', 10, '$.c', '[1]') AS c2
FROM (VALUES ('{"a": [10, true]}')) AS t(v)
LIMIT 10;
```

结果

| C1                             | C2                             |
| ------------------------------ | ------------------------------ |
| {“a”：1，“b”：[2]，“c”：“[1]”} | {“a”：1，“b”：[2]，“c”：“[1]”} |

#### JSON_KEYS 示例

SQL

```sql
SELECT JSON_KEYS(v) AS c1,
  JSON_KEYS(v, 'lax $.a') AS c2,
  JSON_KEYS(v, 'lax $.b') AS c2,
  JSON_KEYS(v, 'strict $.a[0]') AS c3,
  JSON_KEYS(v, 'strict $.a[1]') AS c4
FROM (VALUES ('{"a": [10, true],"b": {"c": 30}}')) AS t(v)
LIMIT 10;
```

结果

|     C1     |  C2  |  C3   |  C4  |  C5  |
| :--------: | :--: | :---: | :--: | :--: |
| [“a”, “b”] | NULL | [“c”] | NULL | NULL |

#### JSON_REMOVE 示例

SQL

```sql
SELECT JSON_REMOVE(v, '$[1]') AS c1
FROM (VALUES ('["a", ["b", "c"], "d"]')) AS t(v)
LIMIT 10;
```

结果

|     C1     |
| :--------: |
| [“a”, “d”] |

#### JSON_REPLACE 示例

SQL

```sql
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

#### JSON_SET 示例

SQL

```sql
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

#### JSON_STORAGE_SIZE 示例

SQL

```sql
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

```sql
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
|  aa  |  bb  |  cc  |  dd  |  ee  |

#### 翻译示例

SQL

```sql
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

### 高阶函数



```sql
lambdaExpression:
      parameters '->' expression

parameters:
      '(' [ identifier [, identifier ] ] ')'
  |   identifier
```

高阶函数未包含在 SQL 标准中，因此所有函数也将在[方言特定运算符](https://calcite.apache.org/docs/reference.html#dialect-specific-operators)中列出。

带有 lambda 参数的函数示例为 *EXISTS*。

### 用户定义函数

Calcite 是可扩展的。您可以使用用户代码定义每种函数。对于每种函数，通常有几种定义函数的方法，从方便到高效不等。

要实现*标量函数*，有 3 个选项：

- 创建一个具有公共静态 `eval` 方法的类，并注册该类；
- 创建一个具有公共非静态 `eval` 方法和无参数公共构造函数的类，并注册该类；
- 创建一个具有一个或多个公共静态方法的类，并注册每个类/方法组合。

要实现*聚合函数*，有 2 个选项：

- 创建一个具有公共静态 `init`、`add` 和 `result` 方法的类，并注册该类；
- 创建一个具有公共非静态 `init`、`add` 和 `result` 方法以及无参数的公共构造函数的类，并注册该类。

可选地，向类添加一个公共 `merge` 方法；这允许 Calcite 生成合并小计的代码。

可选地，让您的类实现 [SqlSplittableAggFunction](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/SqlSplittableAggFunction.html) 接口；这允许 Calcite 跨多个聚合阶段分解函数，从汇总表中汇总，并通过连接推送它。

要实现 *table 函数*，有 3 个选项：

- 创建一个具有静态 `eval` 方法的类，该方法返回 [ScannableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ScannableTable.html) 或 [QueryableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/QueryableTable.html)，并注册该类；
- 创建一个具有非静态 `eval` 方法的类，该方法返回 [ScannableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ScannableTable.html) 或 [QueryableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/QueryableTable.html)，并注册该类；
- 创建一个具有一个或多个公共静态方法的类，这些方法返回 [ScannableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ScannableTable.html) 或 [QueryableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/QueryableTable.html)，并注册每个类/方法组合。

要实现 *table 宏*，有 3 个选项：

- 创建一个具有静态 `eval` 方法的类，该方法返回 [TranslatableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TranslatableTable.html)，并注册该类；
- 创建一个具有非静态 `eval` 方法的类，该方法返回 [TranslatableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TranslatableTable.html)，并注册该类；
- 创建一个具有一个或多个公共静态方法的类，该方法返回 [TranslatableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TranslatableTable.html)，并注册每个类/方法组合。

Calcite 从实现函数的 Java 方法的参数和返回类型推断出函数的参数类型和结果类型。此外，您可以使用 [Parameter](https://calcite.apache.org/javadocAggregate/org/apache/calcite/linq4j/function/Parameter.html) 注释指定每个参数的名称和可选性。

#### 使用命名参数和可选参数调用函数

通常，调用函数时，需要按顺序指定其所有参数。但如果函数有很多参数，尤其是当您想随着时间的推移添加更多参数时，这可能会成为一个问题。

为了解决这个问题，SQL 标准允许您按名称传递参数，并定义可选参数（即，如果未指定参数，则使用默认值）。

假设您有一个函数 `f`，声明如下伪语法：

```sql
FUNCTION f(
  INTEGER a,
  INTEGER b DEFAULT NULL,
  INTEGER c,
  INTEGER d DEFAULT NULL,
  INTEGER e DEFAULT NULL) RETURNS INTEGER
```

该函数的所有参数都有名称，并且参数 `b`、`d` 和 `e` 的默认值为 `NULL`，因此是可选的（在 Calcite 中，`NULL` 是可选参数唯一允许的默认值；这可能会在[未来](https://issues.apache.org/jira/browse/CALCITE-947)发生变化）。

调用带有可选参数的函数时，您可以省略列表末尾的可选参数，或者对任何可选参数使用 `DEFAULT` 关键字。以下是一些示例：

- `f(1, 2, 3, 4, 5)` 按顺序为每个参数提供一个值；
- `f(1, 2, 3, 4)` 省略 `e`，获取其默认值 `NULL`；
- `f(1, DEFAULT, 3)` 省略 `d` 和 `e`，并指定使用默认值 `b`；
- `f(1, DEFAULT, 3, DEFAULT, DEFAULT)` 与上一个示例具有相同的效果；
- `f(1, 2)` 不合法，因为 `c` 不是可选的；
- `f(1, 2, DEFAULT, 4)` 不合法，因为 `c` 不是可选的。

您可以使用 `=>` 语法按名称指定参数。如果一个参数被命名，则所有参数都必须被命名。参数可以位于任何其他参数中，但不得多次指定任何参数，并且您需要为每个非可选参数提供一个值。以下是一些示例：

- `f(c => 3, d => 1, a => 0)` 等同于 `f(0, NULL, 3, 1, NULL)`;
- `f(c => 3, d => 1)` 不合法，因为您没有为 `a` 指定值，并且 `a` 不是可选的。

#### SQL Hint

提示是给优化器的指令。编写 SQL 时，您可能知道优化器不知道的数据信息。提示使您能够做出通常由优化器做出的决策。

- 规划器执行器：没有完美的规划器，因此实施提示以允许用户更好地控制执行是有意义的。例如：“永远不要将此子查询与其他子查询合并”（`/*+ no_merge */`）；“将这些表视为前导表”（`/*+ leading */`）以影响连接顺序等；
- 附加元数据/统计信息：某些统计信息（如“用于扫描的表索引”或“某些 shuffle 键的倾斜信息”）对于查询而言是动态的，使用提示配置它们会非常方便，因为我们从规划器获得的规划元数据通常不太准确；
- 运算符资源约束：在许多情况下，我们会为执行运算符提供默认的资源配置，即最小并行度、内存（消耗资源的 UDF）、特殊资源需求（GPU 或 SSD 磁盘）……使用每个查询（而不是作业）的提示来分析资源会非常灵活。

##### 语法

Calcite 支持两个位置的提示：

* 查询提示：紧跟在 `SELECT` 关键字之后；

* 表提示：紧跟在引用的表名之后。

例如：

```sql
SELECT /*+ hint1, hint2(a=1, b=2) */
...
FROM
  tableName /*+ hint3(5, 'x') */
JOIN
  tableName /*+ hint4(c=id), hint5 */
...
```

语法如下：

```sql
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

它在 Calcite 中处于实验阶段，尚未完全实现，我们已实现的内容包括：

- 解析器支持上述语法；
- `RelHint` 表示提示项；
- 在 sql-to-rel 转换和规划器规划期间传播提示的机制。

我们尚未添加任何内置提示项，如果我们认为提示足够稳定，我们会引入更多。

#### MATCH_RECOGNIZE

`MATCH_RECOGNIZE` 是一个 SQL 扩展，用于识别复杂事件处理 (CEP) 中的事件序列。

它在 Calcite 中处于实验阶段，尚未完全实现。

##### 语法

```sql
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

在 patternQuantifier 中，repeat 是正整数，minRepeat 和 maxRepeat 是非负整数。

## DDL 扩展

DDL 扩展仅在 calcite-server 模块中可用。要启用，请在类路径中包含 `calcite-server.jar`，并将 `parserFactory=org.apache.calcite.sql.parser.ddl.SqlDdlParserImpl#FACTORY` 添加到 JDBC 连接字符串（请参阅连接字符串属性 [parserFactory](https://calcite.apache.org/javadocAggregate/org/apache/calcite/config/CalciteConnectionProperty.html#PARSER_FACTORY)）。

```sql
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

在 *createTableStatement* 中，如果指定 *AS query*，则可以省略 *tableElement* 列表，也可以省略任何 *tableElement* 的数据类型，在这种情况下，它只会重命名基础列。

在 *columnGenerator* 中，如果没有为生成的列指定 `VIRTUAL` 或 `STORED`，则 `VIRTUAL` 为默认值。

在 *createFunctionStatement* 和 *usingFile* 中，*classNameLiteral* 和 *filePathLiteral* 是字符文字。

### 为用户定义类型声明对象

在架构中定义并安装对象类型后，您可以使用它在任何 SQL 块中声明对象。例如，您可以使用对象类型指定属性、列、变量、绑定变量、记录字段、表元素、形式参数或函数结果的数据类型。在运行时，将创建对象类型的实例；也就是说，实例化该类型的对象。每个对象可以保存不同的值。

例如，我们可以声明类型 `address_typ` 和 `employee_typ`：

```sql
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

使用这些类型，您可以按如下方式实例化对象：

```sql
employee_typ(315, 'Francis', 'Logan', 'FLOGAN',
    '555.777.2222', DATE '2004-05-01', 'SA_MAN', 11000, .15, 101, 110,
     address_typ('376 Mission', 'San Francisco', 'CA', '94222'))
```



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

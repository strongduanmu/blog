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
- *wkb* 是包含 [[众所周知的二进制 (WKB)](https://en.wikipedia.org/wiki/Well-known_binary) 的二进制字符串。

在 `C`（代表`兼容性`）列中，`o` 表示该函数实现了 SQL 的 OpenGIS 简单功能实现规范，版本 1.2.1；`p` 表示该函数是 OpenGIS 的 PostGIS 扩展；`h` 表示该函数是 H2GIS 扩展。

TODO

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
| s            | GETBIT（值，位置）                                           | 等价于`BIT_GET(value, position)`                             |
| 博           | GREATEST(expr [, expr ]*)                                    | 返回最大的表达式                                             |
| 黑社会       | IF(条件, 值1, 值2)                                           | 如果*条件*为 TRUE，则返回*value1* ，否则返回*value2*         |
| 乙           | IFNULL(值1,值2)                                              | 等价于`NVL(value1, value2)`                                  |
| p            | string1 ILIKE string2 [ ESCAPE string3 ]                     | *string1*是否匹配模式*string2*，忽略大小写（类似于`LIKE`）   |
| p            | string1 不喜欢 string2 [ ESCAPE string3 ]                    | *string1*是否与模式*string2*不匹配，忽略大小写（类似于`NOT LIKE`） |
| 博           | INSTR(字符串, 子字符串 [, 来自 [, 出现次数 ] ])              | *返回子字符串*在*string*中的位置，*从 from* （默认 1）开始搜索，直到找到*子字符串第 n 次**出现*（默认 1） |
| 米           | INSTR（字符串，子字符串）                                    | 等价于`POSITION(substring IN string)`                        |
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
| 乙           | 长度（字符串）                                               | 等价于`CHAR_LENGTH(string)`                                  |
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

- `JSON_TYPE` 通常返回一个大写字符串标志，指示 JSON 输入的类型。目前支持的类型标志有：
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
  
- `JSON_DEPTH` 定义 JSON 值的深度如下：
  - 空数组、空对象或标量值的深度为 1；
  - 仅包含深度为 1 的元素的非空数组或仅包含深度为 1 的成员值的非空对象的深度为 2；
  - 否则，JSON 文档的深度大于 2。
  
- `JSON_LENGTH` 定义 JSON 值的长度如下：
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
| 乙   | COUNTIF(条件)                                                | *返回条件*为 TRUE 的行数；等价于`COUNT(*) FILTER (WHERE condition)` |
| 米   | GROUP_CONCAT( [ ALL \| DISTINCT ] value [, value ]* [ ORDER BY orderItem [, orderItem ]* ] [ SEPARATOR 分隔符 ] ) | MySQL 特定的变体`LISTAGG`                                    |
| 乙   | 逻辑与（条件）                                               | 同义词`EVERY`                                                |
| 乙   | LOGICAL_OR（条件）                                           | 同义词`SOME`                                                 |
| s    | MAX_BY（值，补偿）                                           | 同义词`ARG_MAX`                                              |
| s    | MIN_BY（值，补偿）                                           | 同义词`ARG_MIN`                                              |
| 乙   | PERCENTILE_CONT(值, 分数 [ RESPECT NULLS \| IGNORE NULLS ] ) OVER windowSpec | 标准的同义词`PERCENTILE_CONT`，`PERCENTILE_CONT(value, fraction) OVER (ORDER BY value)`等价于标准`PERCENTILE_CONT(fraction) WITHIN GROUP (ORDER BY value)` |
| 乙   | PERCENTILE_DISC(值, 分数 [ RESPECT NULLS \| IGNORE NULLS ] ) OVER windowSpec | 标准的同义词`PERCENTILE_DISC`，`PERCENTILE_DISC(value, fraction) OVER (ORDER BY value)`等价于标准`PERCENTILE_DISC(fraction) WITHIN GROUP (ORDER BY value)` |
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

### 用户定义函数

方解石是可延伸的。你可以使用用户代码定义每种函数。对于每种函数，通常有多种定义函数的方法，从方便到高效。

要实现*标量函数*，有 3 个选项：

- 创建一个具有公共静态方法的类`eval`，并注册该类；
- 创建一个具有公共非静态`eval`方法和不带参数的公共构造函数的类，并注册该类；
- 创建一个具有一个或多个公共静态方法的类，并注册每个类/方法组合。

要实现*聚合函数*，有两种选择：

- 创建一个具有 public static 和方法的类`init`，`add`并`result`注册该类；
- 创建一个具有公共非静态 和 方法的类`init`，以及一个不带参数的公共构造函数，并注册该类。

`merge`（可选）向类添加公共方法；这允许 Calcite 生成合并小计的代码。

（可选）让你的类实现 [SqlSplittableAggFunction](https://calcite.apache.org/javadocAggregate/org/apache/calcite/sql/SqlSplittableAggFunction.html) 接口；这使得 Calcite 可以跨多个聚合阶段分解函数，从汇总表中汇总，并通过连接推送它。

要实现*表函数*，有 3 个选项：

- `eval`创建一个具有返回 [ScannableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ScannableTable.html) 或 [QueryableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/QueryableTable.html)的静态方法的类，并注册该类；
- `eval`创建一个具有返回 [ScannableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ScannableTable.html) 或 [QueryableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/QueryableTable.html)的非静态方法的类，并注册该类；
- 创建一个具有一个或多个返回 [ScannableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/ScannableTable.html) 或 [QueryableTable](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/QueryableTable.html)的公共静态方法的类，并注册每个类/方法组合。

要实现*表宏*，有 3 个选项：

- `eval`创建一个具有返回 [TranslatableTable 的](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TranslatableTable.html)静态方法的类，并注册该类；
- `eval`创建一个具有返回 [TranslatableTable 的](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TranslatableTable.html)非静态方法的类，并注册该类；
- 创建一个具有一个或多个返回 [TranslatableTable 的](https://calcite.apache.org/javadocAggregate/org/apache/calcite/schema/TranslatableTable.html)公共静态方法的类，并注册每个类/方法组合。

Calcite 从实现函数的 Java 方法的参数和返回类型推导出函数的参数类型和结果类型。[此外，你可以使用参数](https://calcite.apache.org/javadocAggregate/org/apache/calcite/linq4j/function/Parameter.html)注释指定每个参数的名称和可选性 。

#### 使用命名参数和可选参数调用函数

通常，当你调用函数时，需要按顺序指定其所有参数。但如果函数有很多参数，特别是如果你想随着时间的推移添加更多参数，这可能会成为问题。

为了解决这个问题，SQL 标准允许你按名称传递参数，并定义可选参数（即，具有默认值，如果未指定则使用默认值）。

假设你有一个 function `f`，声明如下伪语法：

```
FUNCTION f(
  INTEGER a,
  INTEGER b DEFAULT NULL,
  INTEGER c,
  INTEGER d DEFAULT NULL,
  INTEGER e DEFAULT NULL) RETURNS INTEGER
```

该函数的所有参数都有名称和parameters，并且 有默认值`b`，因此都是可选的。（在方解石中，是可选参数唯一允许的默认值； [将来](https://issues.apache.org/jira/browse/CALCITE-947)可能会改变。）

当调用带有可选参数的函数时，可以省略列表末尾的可选参数，或者`DEFAULT` 对任何可选参数使用关键字。这里有些例子：

- `f(1, 2, 3, 4, 5)`按顺序为每个参数提供一个值；
- `f(1, 2, 3, 4)`省略`e`，获取其默认值`NULL`;
- `f(1, DEFAULT, 3)`省略`d`和`e`，并指定使用默认值`b`;
- `f(1, DEFAULT, 3, DEFAULT, DEFAULT)`和前面的例子效果一样；
- `f(1, 2)`不合法，因为`c`不是可选的；
- `f(1, 2, DEFAULT, 4)`不合法，因为`c`不是可选的。

你可以使用语法按名称指定参数`=>`。如果一个参数被命名，那么它们都必须被命名。参数可以是任何其他参数，但不得多次指定任何参数，并且你需要为每个参数提供一个不可选的值。这里有些例子：

- `f(c => 3, d => 1, a => 0)`等价于`f(0, NULL, 3, 1, NULL)`；
- `f(c => 3, d => 1)`不合法，因为你尚未指定 的值 `a`并且`a`不是可选的。

#### SQL Hint

提示是给优化器的指令。在编写SQL时，你可能会知道优化器未知的数据信息。提示使你能够做出通常由优化器做出的决策。

- 规划器执行者：没有完美的规划器，因此实现提示以允许用户更好地控制执行是有意义的。例如：“永远不要将此子查询与其他子查询合并”( `/*+ no_merge */`)；“将这些表视为前导表”( `/*+ leading */`) 以影响连接顺序等；
- 附加元数据/统计信息：一些统计信息，例如“扫描的表索引”或“某些洗牌键的倾斜信息”对于查询来说是动态的，用提示配置它们会非常方便，因为我们来自规划器的规划元数据非常方便通常不太准确；
- 算子资源限制：在很多情况下，我们会给执行算子一个默认的资源配置，即最小并行度、内存（资源消耗 UDF）、特殊资源要求（GPU 或 SSD 磁盘）……对资源进行分析会非常灵活每个查询都有提示（不是作业）。

##### 句法

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

#### MATCH_识别

`MATCH_RECOGNIZE`是一个 SQL 扩展，用于识别复杂事件处理 (CEP) 中的事件序列。

它在方解石中处于实验阶段，但尚未完全实施。

##### 句法

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

在架构中定义并安装对象类型后，你可以使用它在任何 SQL 块中声明对象。例如，你可以使用对象类型来指定属性、列、变量、绑定变量、记录字段、表元素、形式参数或函数结果的数据类型。在运行时，创建对象类型的实例；也就是说，该类型的对象被实例化。每个对象可以保存不同的值。

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

使用这些类型，你可以实例化对象，如下所示：

```
employee_typ(315, 'Francis', 'Logan', 'FLOGAN',
    '555.777.2222', DATE '2004-05-01', 'SA_MAN', 11000, .15, 101, 110,
     address_typ('376 Mission', 'San Francisco', 'CA', '94222'))
```



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

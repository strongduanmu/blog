---
layout: wiki
wiki: calcite
order: 205
title: InnoDB 适配器
date: 2026-01-28 08:00:00
banner: /assets/banner/banner_5.jpg
---

> 原文链接：https://calcite.apache.org/docs/innodb_adapter.html

MySQL 是最流行的开源 SQL 数据库管理系统，由 Oracle Corporation 开发、分发和支持。InnoDB 是 MySQL 中一种通用的存储引擎，自 5.6 起成为默认的 MySQL 存储引擎，平衡了高可靠性和高性能。

Calcite 的 InnoDB 适配器允许你直接基于 InnoDB 数据文件查询数据，如下图所示，数据文件也称为 `.ibd` 文件。它利用了 innodb-java-reader。该适配器与 JDBC 适配器不同，后者映射 JDBC 数据源中的模式，需要 MySQL 服务器来提供响应。

```
                      SQL query
                       |     |
                      /       \
             ---------         ---------
            |                           |
            v                           v
+-------------------------+  +------------------------+
|      MySQL Server       |  | Calcite InnoDB Adapter |
|                         |  +------------------------+
| +---------------------+ |    +--------------------+
| |InnoDB Storage Engine| |    | innodb-java-reader |
| +---------------------+ |    +--------------------+
+-------------------------+

-------------------- File System --------------------

        +------------+      +-----+
        | .ibd files | ...  |     |    InnoDB Data files
        +------------+      +-----+
```

有了 `.ibd` 文件和相应的 DDL，InnoDB 适配器充当一个简单的 "MySQL 服务器"：它接受 SQL 查询，并尝试基于 innodb-java-reader 提供的 InnoDB 文件访问 API 来编译每个查询。它尽可能在 InnoDB 数据文件中直接进行投影、过滤和排序。

更重要的是，通过 DDL 语句，适配器是 "索引感知的"。它利用规则来选择要扫描的适当索引，例如，使用主键或辅助键来查找数据，然后尝试将某些条件下推到存储引擎。适配器还支持提示，以便用户可以告诉优化器使用特定的索引。

下面给出一个模型文件的基本示例，此模式从 MySQL "scott" 数据库读取：

```json
{
  "version": "1.0",
  "defaultSchema": "scott",
  "schemas": [
    {
      "name": "scott",
      "type": "custom",
      "factory": "org.apache.calcite.adapter.innodb.InnodbSchemaFactory",
      "operand": {
        "sqlFilePath": [ "/path/scott.sql" ],
        "ibdDataFileBasePath": "/usr/local/mysql/data/scott"
      }
    }
  ]
}
```

`sqlFilePath` 是一个 DDL 文件列表，你可以通过在命令行中执行 `mysqldump` 来生成表定义：

```bash
mysqldump -d -u<username> -p<password> -h <hostname> <dbname>
```

`/path/scott.sql` 的文件内容如下：

```sql
CREATE TABLE `DEPT`(
    `DEPTNO` TINYINT NOT NULL,
    `DNAME` VARCHAR(50) NOT NULL,
    `LOC` VARCHAR(20),
    UNIQUE KEY `DEPT_PK` (`DEPTNO`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `EMP`(
    `EMPNO` INT(11) NOT NULL,
    `ENAME` VARCHAR(100) NOT NULL,
    `JOB` VARCHAR(15) NOT NULL,
    `AGE` SMALLINT,
    `MGR` BIGINT,
    `HIREDATE` DATE,
    `SAL` DECIMAL(8,2) NOT NULL,
    `COMM` DECIMAL(6,2),
    `DEPTNO` TINYINT,
    `EMAIL` VARCHAR(100) DEFAULT NULL,
    `CREATE_DATETIME` DATETIME,
    `CREATE_TIME` TIME,
    `UPSERT_TIME` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`EMPNO`),
    KEY `ENAME_KEY` (`ENAME`),
    KEY `HIREDATE_KEY` (`HIREDATE`),
    KEY `CREATE_DATETIME_JOB_KEY` (`CREATE_DATETIME`, `JOB`),
    KEY `CREATE_TIME_KEY` (`CREATE_TIME`),
    KEY `UPSERT_TIME_KEY` (`UPSERT_TIME`),
    KEY `DEPTNO_JOB_KEY` (`DEPTNO`, `JOB`),
    KEY `DEPTNO_SAL_COMM_KEY` (`DEPTNO`, `SAL`, `COMM`),
    KEY `DEPTNO_MGR_KEY` (`DEPTNO`, `MGR`),
    KEY `AGE_KEY` (`AGE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

`ibdDataFileBasePath` 是 `.ibd` 文件的父文件路径。

假设模型文件存储为 `model.json`，你可以通过 sqlline 连接到 InnoDB 数据文件以执行查询，如下所示：

```bash
sqlline> !connect jdbc:calcite:model=model.json admin admin
```

我们可以通过编写标准 SQL 查询所有员工：

```bash
sqlline> select empno, ename, job, age, mgr from "EMP";
+-------+--------+-----------+-----+------+
| EMPNO | ENAME  |    JOB    | AGE | MGR  |
+-------+--------+-----------+-----+------+
| 7369  | SMITH  | CLERK     | 30  | 7902 |
| 7499  | ALLEN  | SALESMAN  | 24  | 7698 |
| 7521  | WARD   | SALESMAN  | 41  | 7698 |
| 7566  | JONES  | MANAGER   | 28  | 7839 |
| 7654  | MARTIN | SALESMAN  | 27  | 7698 |
| 7698  | BLAKE  | MANAGER   | 38  | 7839 |
| 7782  | CLARK  | MANAGER   | 32  | 7839 |
| 7788  | SCOTT  | ANALYST   | 45  | 7566 |
| 7839  | KING   | PRESIDENT | 22  | null |
| 7844  | TURNER | SALESMAN  | 54  | 7698 |
| 7876  | ADAMS  | CLERK     | 35  | 7788 |
| 7900  | JAMES  | CLERK     | 40  | 7698 |
| 7902  | FORD   | ANALYST   | 28  | 7566 |
| 7934  | MILLER | CLERK     | 32  | 7782 |
+-------+--------+-----------+-----+------+
```

在执行此查询时，InnoDB 适配器使用主键扫描 InnoDB 数据文件 `EMP.ibd`，主键在 MySQL 中也称为聚类 B+ 树索引，并且能够将投影下推到底层存储引擎。投影可以减少从存储引擎获取的数据大小。

我们可以通过过滤来查找一个员工。InnoDB 适配器通过在 `model.json` 中提供的 DDL 文件检索所有索引。

```bash
sqlline> select empno, ename, job, age, mgr from "EMP" where empno = 7782;
+-------+-------+---------+-----+------+
| EMPNO | ENAME |   JOB   | AGE | MGR  |
+-------+-------+---------+-----+------+
| 7782  | CLARK | MANAGER | 32  | 7839 |
+-------+-------+---------+-----+------+
```

InnoDB 适配器识别 `empno` 是主键，并使用聚类索引执行点查找，而不是全表扫描。

我们还可以对主键进行范围查询：

```bash
sqlline> select empno, ename, job, age, mgr from "EMP" where empno > 7782 and empno < 7900;
```

请注意，这种具有可接受范围的查询在 MySQL 使用 InnoDB 存储引擎时通常很高效，因为对于聚类 B+ 树索引，索引中接近的记录在数据文件中也接近，这有利于扫描。

我们可以通过辅助键查找员工。例如，在以下查询中，过滤条件是类型为 `VARCHAR` 的字段 `ename`。

```bash
sqlline> select empno, ename, job, age, mgr from "EMP" where ename = 'smith';
+-------+-------+-------+-----+------+
| EMPNO | ENAME |  JOB  | AGE | MGR  |
+-------+-------+-------+-----+------+
| 7369  | SMITH | CLERK | 30  | 7902 |
+-------+-------+-------+-----+------+
```

InnoDB 适配器在 MySQL 中几乎所有常用数据类型上都能很好地工作，有关支持的数据类型的更多信息，请参阅 innodb-java-reader。

我们可以通过组合键查询。例如，给定 `DEPTNO_MGR_KEY` 的辅助索引。

```bash
sqlline> select empno, ename, job, age, mgr from "EMP" where deptno = 20 and mgr = 7566;
+-------+-------+---------+-----+------+
| EMPNO | ENAME |   JOB   | AGE | MGR  |
+-------+-------+---------+-----+------+
| 7788  | SCOTT | ANALYST | 45  | 7566 |
| 7902  | FORD  | ANALYST | 28  | 7566 |
+-------+-------+---------+-----+------+
```

InnoDB 适配器利用匹配的键 `DEPTNO_MGR_KEY` 将过滤条件 `deptno = 20 and mgr = 7566` 下推。

在某些情况下，由于底层存储引擎 API 的限制，只能下推部分条件；其余条件保留在计划的其余部分。给定以下 SQL，只有 `deptno = 20` 被下推。

```sql
select empno, ename, job, age, mgr from "EMP" where deptno = 20 and upsert_time > '2018-01-01 00:00:00';
```

`innodb-java-reader` 仅支持使用索引进行具有上下限的范围查询，而不完全支持 `索引条件下推（ICP）`。存储引擎返回一系列行，Calcite 从获取的行中评估其余的 `WHERE` 条件。

对于以下 SQL，有多个索引满足左前缀索引规则：可能的索引是 `DEPTNO_JOB_KEY`、`DEPTNO_SAL_COMM_KEY` 和 `DEPTNO_MGR_KEY`。InnoDB 适配器根据 DDL 中定义的顺序选择其中一个；只有 `deptno = 20` 条件被下推，其余的 `WHERE` 条件由 Calcite 的内置执行引擎处理。

```bash
sqlline> select empno, deptno, sal from "EMP" where deptno = 20 and sal > 2000;
+-------+--------+---------+
| EMPNO | DEPTNO |   SAL   |
+-------+--------+---------+
| 7788  | 20     | 3000.00 |
| 7902  | 20     | 3000.00 |
| 7566  | 20     | 2975.00 |
+-------+--------+---------+
```

通过辅助键访问行需要通过辅助索引扫描并检索回 InnoDB 中的聚类索引，对于 "大" 扫描，这将引入许多随机 I/O 操作，因此性能通常不够好。请注意，上面的查询可以通过使用 `DEPTNO_SAL_COMM_KEY` 索引来获得更高的性能，因为覆盖索引不需要检索回聚类索引。我们可以通过提示强制使用 `DEPTNO_SAL_COMM_KEY` 索引，如下所示。

```bash
sqlline> select empno, deptno, sal from "EMP"/*+ index(DEPTNO_SAL_COMM_KEY) */ where deptno = 20 and sal > 2000;
```

提示可以在 `SqlToRelConverter` 中配置，要启用提示，你应该在 `SqlToRelConverter.ConfigBuilder` 中为 `TableScan` 注册 `index` HintStrategy。索引提示对基本 `TableScan` 关系节点生效，如果有条件匹配索引，索引条件也可以下推。对于以下 SQL，虽然没有任何索引可以使用，但通过利用覆盖索引，性能比全表扫描更好，我们可以强制使用 `DEPTNO_MGR_KEY` 在辅助索引中扫描。

```bash
sqlline> select empno,mgr from "EMP"/*+ index(DEPTNO_MGR_KEY) */ where mgr = 7839;
```

如果排序与使用的索引的自然排序匹配，则可以下推。

```bash
sqlline> select deptno,ename,hiredate from "EMP" where hiredate < '2020-01-01' order by hiredate desc;
+--------+--------+------------+
| DEPTNO | ENAME  |  HIREDATE  |
+--------+--------+------------+
| 20     | ADAMS  | 1987-05-23 |
| 20     | SCOTT  | 1987-04-19 |
| 10     | MILLER | 1982-01-23 |
| 20     | FORD   | 1981-12-03 |
| 30     | JAMES  | 1981-12-03 |
| 10     | KING   | 1981-11-17 |
| 30     | MARTIN | 1981-09-28 |
| 30     | TURNER | 1981-09-08 |
| 10     | CLARK  | 1981-06-09 |
| 30     | WARD   | 1981-02-22 |
| 30     | ALLEN  | 1981-02-20 |
| 20     | JONES  | 1981-02-04 |
| 30     | BLAKE  | 1981-01-05 |
| 20     | SMITH  | 1980-12-17 |
+--------+--------+------------+
```

## 关于时区

MySQL 将 `TIMESTAMP` 值从当前时区转换为 UTC 进行存储，并从 UTC 转换回当前时区进行检索。因此在此适配器中，MySQL 的 `TIMESTAMP` 被映射到 Calcite 的 `TIMESTAMP WITH LOCAL TIME ZONE`。每个会话的时区设置可以在 Calcite 连接配置 `timeZone` 中配置，这告诉 MySQL 服务器 `TIMESTAMP` 值所在的时区。目前 InnoDB 适配器无法将属性传递到底层存储引擎，但你可以在 `model.json` 中指定 `timeZone`，如下所示。请注意，只有在连接配置中设置了 `timeZone` 并且它与 InnoDB 适配器运行的系统默认时区不同时，才需要指定该属性。

```json
{
  "version": "1.0",
  "defaultSchema": "test",
  "schemas": [
    {
      "name": "test",
      "type": "custom",
      "factory": "org.apache.calcite.adapter.innodb.InnodbSchemaFactory",
      "operand": {
        "sqlFilePath": ["src/test/resources/data_types.sql"],
        "ibdDataFileBasePath": "src/test/resources/data",
        "timeZone": "America/Los_Angeles"
      }
    }
  ]
}
```

## 限制

`innodb-java-reader` 对 `.ibd` 文件有一些先决条件。

- 支持 `COMPACT` 和 `DYNAMIC` 行格式。不支持 `COMPRESSED`、`REDUNDANT` 和 `FIXED`。
- `innodb_file_per_table` 应设置为 `ON`，`innodb_file_per_table` 在 MySQL 5.6 及更高版本中默认启用。
- 页面大小应设置为 `16K`，这也是默认值。

有关更多信息，请参阅先决条件。

在数据一致性方面，你可以将适配器视为一个简单的 MySQL 服务器，能够直接通过 InnoDB 数据文件查询，通过从 MySQL 卸载来转储数据。如果页面没有从 InnoDB 缓冲池刷新到磁盘，则结果可能不一致（`.ibd` 文件中的 LSN 可能小于内存中的页面）。InnoDB 就性能而言利用预写日志，因此没有可用于刷新所有脏页的命令。只有内部机制管理何时何地将页面持久化到磁盘，例如页面清理线程、自适应刷新等。

目前 InnoDB 适配器不知道 `.ibd` 数据文件的行数和基数，因此它依赖简单的规则来执行优化。如果将来底层存储引擎可以提供此类指标和元数据，则可以通过利用基于成本的优化将其集成到 Calcite 中。



{% quot 写在最后 %}

笔者因为工作原因接触到 Calcite，前期学习过程中，深感 Calcite 学习资料之匮乏，因此创建了 [Calcite 从入门到精通知识星球](https://wx.zsxq.com/dweb2/index/group/51128414222814)，希望能够将学习过程中的资料和经验沉淀下来，为更多想要学习 Calcite 的朋友提供一些帮助。

![Calcite 从入门到精通](/assets/blog/blog/202309210909027.png)

---
layout: wiki
wiki: tsinghua_database
order: 005
title: SQL
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_5.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：SQL课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1251720540&page=4&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## SQL 的几个部分

课程沿学生选课数据库介绍 SQL：DDL 定义表、索引和视图，DML 查询并修改数据，DCL 管理权限，随后扩展到存储过程、函数、触发器及程序接口。不同产品的类型、过程语言和部分 DDL 语法存在差异，以下重点记录共同语义。

## 定义表、索引和视图

`CREATE TABLE` 指定列类型以及主键、外键、唯一性和检查约束，`ALTER TABLE` 修改结构，`DROP TABLE` 删除对象。索引独立描述访问结构，不会改变普通 SQL 查询的逻辑结果，也会带来写入维护成本。

普通视图保存查询定义，查询时再访问底层对象；物化视图保存实际结果，需要安排刷新或增量维护。课件的 Student_CS 视图限定计算机系学生，在它上面还能继续增加年龄等条件。

## 查询、分组与排序

`SELECT` 列表表达投影，`WHERE` 筛选输入行。范围、集合成员与模式匹配分别可以使用 `BETWEEN`、`IN`、`LIKE`。NULL 的判断使用 `IS NULL`，不能按普通相等比较处理。SQL 默认可能返回重复行，需要 `DISTINCT` 才执行去重。

聚集函数把多行合成状态，`GROUP BY` 按键分组，`HAVING` 过滤组。课程查询平均成绩超过 90 分的学生，可写成：

```sql
SELECT Sno, AVG(Grade) AS avg_grade
FROM SC
GROUP BY Sno
HAVING AVG(Grade) > 90;
```

![分组后计算平均成绩，再用 HAVING 筛选](/wiki/tsinghua_database/sql/group-by-having.webp)

`WHERE` 与 `HAVING` 面向的对象不同：一个过滤聚合前的行，一个过滤聚合后的组。`ORDER BY` 才规定最终顺序，多列排序依次比较，必要时添加稳定的次级键。

## 连接、子查询与集合运算

Student、SC 与 Course 可以通过学号、课程号连接。Course 关联自身的先修课程时，需要别名区分同一张表的两个角色：

```sql
SELECT c.Cname, p.Cname AS prerequisite
FROM Course AS c
JOIN Course AS p ON c.Cpno = p.Cno;
```

这里的内连接不会返回没有匹配先修课程的记录。若要保留所有课程，应按需求使用左外连接。

相关子查询引用外层当前行，不相关子查询则没有这种引用。课件使用“各系中年龄小于本系平均年龄的学生”说明相关条件：平均值需要按外层学生的系别计算。逻辑上的相关不代表执行器一定逐行重复运行，优化器可能将其改写。

![按所属院系计算平均年龄的相关子查询](/wiki/tsinghua_database/sql/correlated-subquery.webp)

`UNION`、`INTERSECT` 和 `EXCEPT` 组合兼容的结果，是否保留重复行还要区分对应的 `ALL` 形式与产品支持范围。

## 数据修改与权限

`INSERT` 可以插入字面量或查询结果，`UPDATE ... SET ... WHERE ...` 修改匹配记录，`DELETE ... WHERE ...` 删除匹配记录。没有 WHERE 时作用范围会扩大到整表，应结合语句目的判断。

`GRANT` 授予对象或系统权限，`REVOKE` 收回权限，后续安全章节会进一步讨论角色、授权传播与审计。

## 存储过程、函数与触发器

存储过程通过 `CALL` 等接口执行，参数可以传入或传出；函数通常作为表达式或表函数参与查询。具体参数形式、是否允许修改数据库等限制由过程语言和产品决定，不应把一种方言的规则推广到所有数据库。

变量、IF、LOOP、WHILE 让服务端程序能够表达流程控制。触发器则由指定事件激活，课件通过成绩更新时比较 OLD、NEW 值，将学生记录到进步或退步表。它隐含在原语句的执行过程中，因此还需要考虑递归、异常和事务回滚。

## 从应用访问数据库

嵌入式 SQL 在宿主语言中声明语句、传递变量，并用游标逐步读取结果。JDBC 和 ODBC 通过驱动接口建立连接、执行语句、处理结果与释放资源。

事务控制包含开始、提交、回滚和 Savepoint。回滚到保存点只撤销相应范围，不等于整个事务已经结束；自动提交模式也会影响一组 SQL 是否属于同一事务。

## 参考资料

- [第 4 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides04.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

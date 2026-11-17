---
layout: wiki
wiki: tsinghua_database
order: 003
title: 关系模型
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_3.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：关系模型课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1251719870&page=2&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 关系、模式与键

关系模型使用二维表表示数据。关系模式定义属性及其取值域，关系实例则是某个时刻保存的元组集合。属性是列，元组是行，关系的度表示属性数量，基数表示元组数量。

课程继续使用 Student、Course、SC。超键能够唯一标识元组；候选键是不含多余属性的超键；选定的候选键作为主键。SC 中一条选课记录由 `(Sno, Cno)` 共同标识，成绩依赖于这个组合，不能只用学号区分。

![学生、课程与选课表之间的键引用](/wiki/tsinghua_database/relational-model/keys-and-references.webp)

SC 的 Sno 引用 Student，Cno 引用 Course，构成外键关系。主属性是出现在任意候选键中的属性，不只是当前选定主键中的属性。

## 完整性约束

实体完整性要求主键唯一且不为空，复合主键的各个分量也不能为空。参照完整性约束外键与被引用对象的关系：插入引用前，被引用对象必须满足相应存在条件；删除被引用对象时，需要按照禁止、级联或其他声明的动作处理。

用户定义完整性表达业务规则，例如年龄或成绩范围。`NOT NULL`、`UNIQUE`、默认值等声明也参与数据约束；不同约束的作用不能互相替代，例如有默认值并不等于禁止 NULL。

## 基本关系代数

选择 $\sigma$ 保留满足谓词的元组，投影 $\pi$ 保留指定属性。课程的计算机系学生示例可以先选择 `Sdept = CS`，再投影 Sno、Sname。选择改变行集合，投影改变输出列；经典关系代数使用集合语义，SQL 默认保留重复行，需要另外区分。

并、差要求输入关系具备兼容的属性结构，笛卡尔积组合两侧所有元组，重命名用于解决关系或属性名称冲突。交可以由其他集合操作表达，赋值则给中间结果命名，便于组织复杂表达式。

## 连接、外连接与除法

Theta Join 对笛卡尔积应用连接条件，等值连接是其中条件为等式的情形。自然连接根据同名属性匹配，并消除重复连接列；真实查询必须确认同名列是否确实具有相同含义。

![Student 与 SC 的等值连接](/wiki/tsinghua_database/relational-model/student-enrollment-join.webp)

内连接只输出匹配组合。左外连接保留左侧未匹配记录，并用 NULL 补齐右侧列，右外连接和全外连接则扩大保留范围。

除运算表达“对给定集合中的所有值都满足”。课件用 R 中 a 同时关联 1、2、3，而 b 只关联其中一部分，说明 R÷S 只保留 a。选课场景中，先准备相应的学号、课程号关系和目标课程集合，就能表达“选修全部目标课程的学生”。

## 扩展运算与表达式

去重、广义投影、聚集、分组和排序扩充了基础操作。广义投影可以计算新表达式，分组聚集按一组属性划分元组，再计算 COUNT、SUM、AVG 等状态；排序指定输出顺序。

复杂表达式从内层子表达式向外求值。例如查询 1 号课程的学号和成绩，先在 SC 中选择 Cno=1，再投影 Sno、Grade。优化器以后会改变等价表达式的执行安排，但必须保留这些语义。

## 关系演算

关系代数通过操作组合描述结果，元组关系演算则用元组变量和谓词描述哪些元组应出现；域关系演算使用属性域上的变量。两者都把查询条件形式化，为声明式查询提供基础。理解这里的“描述结果”，有助于区分 SQL 的语义与数据库最终选择的访问算法。

## 参考资料

- [第 2 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides02.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

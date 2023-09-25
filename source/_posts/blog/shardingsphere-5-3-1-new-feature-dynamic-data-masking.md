---
title: ShardingSphere 5.3.1 新特性之动态数据脱敏
tags: [ShardingSphere]
categories: [ShardingSphere]
banner: china
date: 2023-01-17 10:27:56
cover: https://cdn.jsdelivr.net/gh/strongduanmu/cdn@master/2021/06/25/1624608310.png
---

# 背景

随着《网络安全法》的颁布施行，对个人隐私数据的保护已经上升到法律层面。传统的应用系统普遍缺少对个人隐私数据的保护措施。数据脱敏，可以实现在不需要对生产数据库中的数据进行任何改变的情况下，依据用户的角色、职责和其他定义规则，对生产数据库返回的数据进行专门的屏蔽、加密、隐藏和审计，确保业务用户、外包用户、运维人员、兼职雇员、合作伙伴、数据分析师、研发、测试和顾问，都能够恰如其分地访问生产环境的敏感数据。

根据业界的相关经验，数据脱敏通常可以分为静态脱敏和动态脱敏。静态脱敏是指通过脱敏任务，针对数据库系统使用脱敏算法对敏感数据进行遮盖、加密或替换，并将脱敏后的数据保存到目标位置。动态脱敏相对于静态脱敏则更加灵活，可以针对每次查询的数据进行脱敏，脱敏数据不需要落地保存。ShardingSphere 5.3.1 版本提供了动态数据脱敏功能，用户通过 ShardingSphere 进行查询，ShardingSphere 会根据用户预先配置的脱敏规则，在返回结果前根据脱敏算法进行处理，再将脱敏后的数据返回给用户。

# 实现方案

## 脱敏与微内核

基于 ShardingSphere 微内核及可插拔架构，数据脱敏功能只需要实现结果归并引擎 SPI 就可以实现功能的灵活扩展。如下图所示，ShardingSphere 微内核中已经包含了 `SQL 解析`、`SQL 路由`、`SQL 执行`等核心逻辑，ShardingSphere 5.3.1 版本提供的动态脱敏功能，只是对其他功能查询结果的增强处理，因此只需要实现归并引擎中的 ResultDecoratorEngine 和 ResultDecorator 即可实现脱敏功能。

![ShardingSphere 可插拔架构](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309251036380.png)

为了实现数据脱敏功能，本次在 features 模块中增加 `shardingsphere-mask` 模块，该模块包含了 `shardingsphere-mask-api`、`shardingsphere-mask-core` 和 `shardingsphere-mask-distsql`，各个模块的作用如下：

- `shardingsphere-mask-api`：脱敏 API 模块，包含了脱敏功能的 Rule 配置，以及脱敏算法 SPI 接口；
- `shardingsphere-mask-core`：脱敏功能的核心模块，包含了 Rule 的初始化逻辑，脱敏算法实现以及结果归并装饰器实现逻辑；
- `shardingsphere-mask-distsql`：脱敏功能的 DistSQL 模块，用户可以通过 DistSQL 动态地修改脱敏规则；

除了内核流程之外，脱敏功能在内核中的定位也同样值得我们关注。我们知道，ShardingSphere 强大的可插拔架构，允许我们任意地组合叠加内核功能，新增的脱敏功能也不例外，用户可以单独使用脱敏功能，也可以将脱敏和分片、加密等功能叠加使用，组成更加完善的分布式数据库解决方案。

下图展示了目前 ShardingSphere 内核功能的关系，总体上可以将内核功能划分为三个级别：基于列级别的功能、基于表级别的功能和基于数据源级别的功能。基于列级别的功能包括了数据加密和数据脱敏，主要针对列进行增强处理，基于表级别的功能则包含了数据分片和内置的单表管理，基于数据源级别的功能目前最为丰富，包括了 SphereEx 商业版提供的双写功能，ShardingSphere 开源版本提供的读写分离、高可用发现和影子库功能，这些都是围绕数据库流量治理相关的功能。ShardingSphere 会按照这三个层级关系依次进行处理，而在每一个层级内部，则是根据 Order 进行处理，例如：当用户同时使用加密和脱敏功能时，会优先处理加密逻辑，将存储在数据库中的密文数据进行解密，然后再使用脱敏算法进行数据脱敏。

![ShardingSphere 内核功能分层](https://cdn.jsdelivr.net/gh/strongduanmu/cdn/blog/202309251037711.png)

## 脱敏 YAML API & DistSQL

介绍完脱敏和微内核的关系后，我们再来了解下脱敏功能的 API 和 DistSQL，用户可以基于 YAML 配置或者使用 DistSQL 进行脱敏规则的配置。首先，我们来了解下 YAML API 的配置方式，用户只需要在 `- !MASK` 下的 tables 中配置脱敏列及脱敏算法即可，maskAlgorithm 定义的脱敏算法名称，需要与 maskAlgorithms 中的名称保持一致。

脱敏 YAML API 主要配置属性如下：

- maskAlgorithm：指定脱敏算法，动态脱敏根据脱敏算法进行数据处理；

```yaml
databaseName: mask_db

dataSources:
  ds_0:
    url: jdbc:mysql://127.0.0.1:3306/demo_ds_0?serverTimezone=UTC&useSSL=false
    username: root
    password: 123456
    connectionTimeoutMilliseconds: 30000
    idleTimeoutMilliseconds: 60000
    maxLifetimeMilliseconds: 1800000
    maxPoolSize: 50
    minPoolSize: 1
  ds_1:
    url: jdbc:mysql://127.0.0.1:3306/demo_ds_1?serverTimezone=UTC&useSSL=false
    username: root
    password: 123456
    connectionTimeoutMilliseconds: 30000
    idleTimeoutMilliseconds: 60000
    maxLifetimeMilliseconds: 1800000
    maxPoolSize: 50
    minPoolSize: 1
        
# MASK rule 配置
rules:
- !MASK
  tables:
    t_user:
      columns:
        password:
          maskAlgorithm: md5_mask
        email:
          maskAlgorithm: mask_before_special_chars_mask
        telephone:
          maskAlgorithm: keep_first_n_last_m_mask

  maskAlgorithms:
    md5_mask:
      type: MD5
    mask_before_special_chars_mask:
      type: MASK_BEFORE_SPECIAL_CHARS
      props:
        special-chars: '@'
        replace-char: '*'
    keep_first_n_last_m_mask:
      type: KEEP_FIRST_N_LAST_M
      props:
        first-n: 3
        last-m: 4
        replace-char: '*'
```

此外，考虑到一些用户存在动态更新脱敏规则的需求，ShardingSphere 5.3.1 版本同时提供了脱敏 DistSQL 的支持，满足用户在运行阶段动态更新脱敏规则的需要，脱敏 DistSQL 语法如下，包含了创建、修改、删除和查看脱敏规则等常用的 DistSQL 语句。

```SQL
-- 创建脱敏规则
CREATE MASK RULE t_user (
    COLUMNS(
        (NAME=password, TYPE(NAME='MD5')),
        (NAME=email, TYPE(NAME='MASK_BEFORE_SPECIAL_CHARS', PROPERTIES("special-chars"="@", "replace-char"="*"))),
        (NAME=telephone, TYPE(NAME='KEEP_FIRST_N_LAST_M', PROPERTIES("first-n"=3, "last-m"=4, "replace-char"="*")))
    )
);

-- 修改脱敏规则
ALTER MASK RULE t_user (
    COLUMNS(
        (NAME=password, TYPE(NAME='MD5', PROPERTIES("salt"="123abc"))),
        (NAME=email, TYPE(NAME='MASK_BEFORE_SPECIAL_CHARS', PROPERTIES("special-chars"="@", "replace-char"="*"))),
        (NAME=telephone, TYPE(NAME='TELEPHONE_RANDOM_REPLACE', PROPERTIES("network-numbers"="123,180")))
    )
);

-- 删除脱敏规则
DROP MASK RULE t_user;

-- 查看脱敏规则
SHOW MASK RULES FROM mask_db;
```

更多详细的 DistSQL 语法说明，请参考[数据脱敏 DistSQL 文档](https://shardingsphere.apache.org/document/5.3.1/cn/user-manual/shardingsphere-proxy/distsql/syntax/rdl/rule-definition/mask/create-mask-rule/)。

## 内置脱敏算法

ShardingSphere 5.3.1 本次发布也包含了大量内置的脱敏算法，算法基于 MaskAlgorithm SPI 接口实现，用户可以根据自己的业务需求进行灵活扩展。

```Java
/**
 * Mask algorithm.
 * 
 * @param <I> type of plain value
 * @param <O> type of mask value
 */
public interface MaskAlgorithm<I, O> {
    
    /**
     * Mask.
     *
     * @param plainValue plain value
     * @return mask value
     */
    O mask(I plainValue);
}
```

内置的脱敏算法主要可以分为三类，哈希脱敏、遮盖脱敏和替换脱敏，具体算法清单如下：

<table>
<thead>
  <tr>
    <th>分类</th>
    <th>名称</th>
    <th>说明</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>哈希脱敏</td>
    <td>MD5</td>
    <td>基于 MD5 的数据脱敏算法</td>
  </tr>
  <tr>
    <td rowspan="6">遮盖脱敏</td>
    <td>KEEP_FIRST_N_LAST_M</td>
    <td>保留前 n 后 m 数据脱敏算法</td>
  </tr>
  <tr>
    <td>KEEP_FROM_X_TO_Y</td>
    <td>保留自 x 至 y 数据脱敏算法</td>
  </tr>
  <tr>
    <td>MASK_FIRST_N_LAST_M</td>
    <td>遮盖前 n 后 m 数据脱敏算法</td>
  </tr>
  <tr>
    <td>MASK_FROM_X_TO_Y</td>
    <td>遮盖自 x 至 y 数据脱敏算法</td>
  </tr>
  <tr>
    <td>MASK_BEFORE_SPECIAL_CHARS</td>
    <td>特殊字符前遮盖数据脱敏算法</td>
  </tr>
  <tr>
    <td>MASK_AFTER_SPECIAL_CHARS</td>
    <td>特殊字符后遮盖数据脱敏算法</td>
  </tr>
  <tr>
    <td rowspan="3">替换脱敏</td>
    <td>PERSONAL_IDENTITY_NUMBER_RANDOM_REPLACE</td>
    <td>身份证号随机替换数据脱敏算法</td>
  </tr>
  <tr>
    <td>MILITARY_IDENTITY_NUMBER_RANDOM_REPLACE</td>
    <td>军官证随机替换数据脱敏算法</td>
  </tr>
  <tr>
    <td>TELEPHONE_RANDOM_REPLACE</td>
    <td>⼿机号随机替换数据脱敏算法</td>
  </tr>
</tbody>
</table>

脱敏算法目前还在不断完善中，更多关于算法参数的说明，请参考[脱敏算法文档](https://shardingsphere.apache.org/document/5.3.1/cn/user-manual/common-config/builtin-algorithm/mask/#哈希脱敏算法)，也欢迎大家积极参与贡献，一起完善脱敏算法。

# 脱敏实战

在最后一个部分，我们通过一个实战来具体了解下数据脱敏功能。通常对于企业内部的敏感数据，我们会选择数据脱敏和数据加密配合使用，Database 层存储数据时采用数据加密进行保护，避免数据丢失造成安全问题。在数据查询阶段，则会根据规则进行数据解密和数据脱敏，避免敏感数据直接展示。因此，本文实战部分选择了数据脱敏和数据加密叠加使用的场景，通过 DistSQL 进行动态更新，向大家展示下数据脱敏功能的实际效果。

首先，我们下载 ShardingSphere Proxy 5.3.1 版本 ，并配置 `server.yaml` 进行空启动，然后使用 `mysql -u root -h 127.0.0.1 -P 3307 -p -c -A` 连接 Proxy，并执行 `CREATE DATABASE mask_db;` 创建脱敏逻辑数据库。

```SQL
-- 创建脱敏逻辑数据库
CREATE DATABASE mask_db;
-- 切换到 mask_db
USE mask_db;
```

创建完逻辑数据库后，我们使用 DistSQL 注册存储资源，并初始化脱敏和加密规则。

```SQL
-- 注册存储资源
REGISTER STORAGE UNIT ds_0 (
    HOST="127.0.0.1",
    PORT=3306,
    DB="demo_ds_0",
    USER="root",
    PASSWORD="123456",
    PROPERTIES("maximumPoolSize"=10)
), ds_1 (
    HOST="127.0.0.1",
    PORT=3306,
    DB="demo_ds_1",
    USER="root",
    PASSWORD="123456",
    PROPERTIES("maximumPoolSize"=10)
);

-- 创建脱敏规则
CREATE MASK RULE t_user (
    COLUMNS(
        (NAME=password, TYPE(NAME='MD5')),
        (NAME=email, TYPE(NAME='MASK_BEFORE_SPECIAL_CHARS', PROPERTIES("special-chars"="@", "replace-char"="*"))),
        (NAME=telephone, TYPE(NAME='KEEP_FIRST_N_LAST_M', PROPERTIES("first-n"=3, "last-m"=4, "replace-char"="*")))
    )
);

-- 创建加密规则
CREATE ENCRYPT RULE t_user (
    COLUMNS(
        (NAME=user_name, CIPHER=user_name_cipher, ENCRYPT_ALGORITHM(TYPE(NAME='AES', PROPERTIES('aes-key-value'='123456abc')))),
        (NAME=password, CIPHER =password_cipher, ENCRYPT_ALGORITHM(TYPE(NAME='AES', PROPERTIES('aes-key-value'='123456abc')))),
        (NAME=email, CIPHER =email_cipher, ENCRYPT_ALGORITHM(TYPE(NAME='AES', PROPERTIES('aes-key-value'='123456abc')))),
        (NAME=telephone, CIPHER =telephone_cipher, ENCRYPT_ALGORITHM(TYPE(NAME='AES', PROPERTIES('aes-key-value'='123456abc'))))
    )
);
```

脱敏规则和加密规则创建完成后，我们可以通过 DistSQL `SHOW` 语句查看脱敏和加密规则：

```SQL
-- 查看脱敏规则
mysql> SHOW MASK RULES FROM mask_db;
+--------+-----------+---------------------------+-----------------------------------+
| table  | column    | algorithm_type            | algorithm_props                   |
+--------+-----------+---------------------------+-----------------------------------+
| t_user | password  | MD5                       |                                   |
| t_user | email     | MASK_BEFORE_SPECIAL_CHARS | replace-char=*,special-chars=@    |
| t_user | telephone | KEEP_FIRST_N_LAST_M       | first-n=3,replace-char=*,last-m=4 |
+--------+-----------+---------------------------+-----------------------------------+
3 rows in set (0.01 sec)

-- 查看加密规则
mysql> SHOW ENCRYPT RULES FROM mask_db;
+--------+--------------+------------------+--------------+-----------------------+-------------------+----------------+-------------------------+---------------------+----------------------+-----------------+------------------+--------------------------+
| table  | logic_column | cipher_column    | plain_column | assisted_query_column | like_query_column | encryptor_type | encryptor_props         | assisted_query_type | assisted_query_props | like_query_type | like_query_props | query_with_cipher_column |
+--------+--------------+------------------+--------------+-----------------------+-------------------+----------------+-------------------------+---------------------+----------------------+-----------------+------------------+--------------------------+
| t_user | user_name    | user_name_cipher |              |                       |                   | AES            | aes-key-value=123456abc |                     |                      |                 |                  | true                     |
| t_user | password     | password_cipher  |              |                       |                   | AES            | aes-key-value=123456abc |                     |                      |                 |                  | true                     |
| t_user | email        | email_cipher     |              |                       |                   | AES            | aes-key-value=123456abc |                     |                      |                 |                  | true                     |
| t_user | telephone    | telephone_cipher |              |                       |                   | AES            | aes-key-value=123456abc |                     |                      |                 |                  | true                     |
+--------+--------------+------------------+--------------+-----------------------+-------------------+----------------+-------------------------+---------------------+----------------------+-----------------+------------------+--------------------------+
4 rows in set (0.01 sec)
```

创建完规则后，我们创建如下的 t_user 表并进行数据初始化：

```SQL
DROP TABLE IF EXISTS t_user;

CREATE TABLE t_user (user_id INT PRIMARY KEY, user_name VARCHAR(50) NOT NULL, password VARCHAR(50) NOT NULL, email VARCHAR(50) NOT NULL, telephone CHAR(50) NOT NULL, creation_date DATE NOT NULL);

INSERT INTO t_user(user_id, user_name, password, email, telephone, creation_date) values(10, 'zhangsan', '111111', 'zhangsan@gmail.com', '12345678900', '2017-08-08'),
(11, 'lisi', '222222', 'lisi@gmail.com', '12345678901', '2017-08-08'),
(12, 'wangwu', '333333', 'wangwu@gmail.com', '12345678902', '2017-08-08'),
(13, 'zhaoliu', '444444', 'zhaoliu@gmail.com', '12345678903', '2017-08-08'),
(14, 'zhuqi', '555555', 'zhuqi@gmail.com', '12345678904', '2017-08-08'),
(15, 'liba', '666666', 'liba@gmail.com', '12345678905', '2017-08-08'),
(16, 'wangjiu', '777777', 'wangjiu@gmail.com', '12345678906', '2017-08-08'),
(17, 'zhuda', '888888', 'zhuda@gmail.com', '12345678907', '2017-08-08'),
(18, 'suner', '999999', 'suner@gmail.com', '12345678908', '2017-08-08'),
(19, 'zhousan', '123456', 'zhousan@gmail.com', '12345678909', '2017-08-08'),
(20, 'tom', '234567', 'tom@gmail.com', '12345678910', '2017-08-08'),
(21, 'kobe', '345678', 'kobe@gmail.com', '12345678911', '2017-08-08'),
(22, 'jerry', '456789', 'jerry@gmail.com', '12345678912', '2017-08-08'),
(23, 'james', '567890', 'james@gmail.com', '12345678913', '2017-08-08'),
(24, 'wade', '012345', 'wade@gmail.com', '12345678914', '2017-08-08'),
(25, 'rose', '000000', 'rose@gmail.com', '12345678915', '2017-08-08'),
(26, 'bosh', '111222', 'bosh@gmail.com', '12345678916', '2017-08-08'),
(27, 'jack', '222333', 'jack@gmail.com', '12345678917', '2017-08-08'),
(28, 'jordan', '333444', 'jordan@gmail.com', '12345678918', '2017-08-08'),
(29, 'julie', '444555', 'julie@gmail.com', '12345678919', '2017-08-08');
```

完成了数据初始化后，我们先通过 `mysql -u root -h 127.0.0.1 -P 3306 -p -c -A` 直接 MySQL 数据库，查看底层数据库 t_user 表中存储的数据，可以看到 MySQL 中存储的是加密之后的数据，敏感数据在数据库存储层得到了有效的保护。

```SQL
mysql> SELECT * FROM t_user;
+---------+--------------------------+--------------------------+----------------------------------------------+--------------------------+---------------+
| user_id | user_name_cipher         | password_cipher          | email_cipher                                 | telephone_cipher         | creation_date |
+---------+--------------------------+--------------------------+----------------------------------------------+--------------------------+---------------+
|      10 | sVq8Lmm+j6bZE5EKSilJEQ== | aQol0b6th65d0aXe+zFPsQ== | WM0fHOH91JNWnHTkiqBdyNmzk4uJ7CCz4mB1va9Ya1M= | kLjLJIMnfyHT2nA+viaoaQ== | 2017-08-08    |
|      11 | fQ7IzBxKVuNHtUF6h6WSBg== | wuhmEKgdgrWQYt+Ev0hgGA== | svATu3uWv9KfiloWJeWx3A==                     | 0kDFxndQdzauFwL/wyCsNQ== | 2017-08-08    |
|      12 | AQRWSlufQPog/b64YRhu6Q== | x7A+2jq9B6DSOSFtSOibdA== | nHJv9e6NiClIuGHOjHLvCAq2ZLhWcqfQ8/EQnIqMx+g= | a/SzSJLapt5iBXvF2c9ycw== | 2017-08-08    |
|      13 | 5NqS4YvpT+mHBFqZOZ3QDA== | zi6b4xYRjjV+bBk2R4wB+w== | MLBZczLjriUXvg3aM5QPTxMJbLjNh8yeNrSNBek/VTw= | b6VVhG+F6ujG8IMUZJAIFg== | 2017-08-08    |
|      14 | qeIY9od3u1KwhjihzLQUTQ== | 51UmlLAC+tUvdOAj8CjWfQ== | JCmeNdPyrKO5BW5zvhAA+g==                     | f995xinpZdKMVU5J5/yv3w== | 2017-08-08    |
|      15 | VbNUtguwtpeGhHGnPJ3aXg== | +3/5CVbqoKhg3sqznKTFFQ== | T+X+e3Q3+ZNIXXmg/80uxg==                     | GETj+S6DrO042E7NuBXLBQ== | 2017-08-08    |
|      16 | U0/Ao/w1u7L5avR3fAH2Og== | jFfFMYxv02DjaFRuAoCDGw== | RNW/KRq5HeL2YTfAdXSyARMJbLjNh8yeNrSNBek/VTw= | +lbvjJwO7VO4HUKc0Mw0NA== | 2017-08-08    |
|      17 | zb1sgBigoMi7JPSoY4bAVw== | VFIjocgjujJCJc6waWXqJA== | 1vF/ET3nBxt7T7vVfAndZQ==                     | wFvs5BH6OikgveBeTEBwsQ== | 2017-08-08    |
|      18 | rJzNIrFEnx296kW+N1YmMw== | LaODSKGyR7vZ1IvmBOe9vA== | 5u4GIQkJsWRmnJHWaHNSjg==                     | uwqm2O1Lv2tNTraJX1ym7Q== | 2017-08-08    |
|      19 | qHwpQ9kteL8VX6iTUhNdbQ== | MyOShk4kjRnds7CZfU5NCw== | HmYCo7QBfJ2E0EvaGHBCOBMJbLjNh8yeNrSNBek/VTw= | YLNQuuUPMGA21nhKWPzzsg== | 2017-08-08    |
|      20 | qCCmvf7OWRxbVbtLb0az1g== | fzdTMkzpBvgNYmKSQAp8Fg== | gOoP4Mf0P4ISOJp6A4sRmg==                     | l4xa4HwOfs/jusoJon9Wzw== | 2017-08-08    |
|      21 | IYJ1COaRQ0gSjWMC/UAeMg== | 1uEDMeYh2jstbOf6kx/cqw== | tikMAFiQ37u2VgWqUT38Eg==                     | rGpr30UXfczXjCjdvPN+BA== | 2017-08-08    |
|      22 | 7wvZZ7NVHgk6m1vB/sTC1Q== | OirN3gvz9uBnrq88nfa1wQ== | T7K/Uz1O2m+3xvB0+c4nGQ==                     | 7+fCU+VbQZKgLJXZPTTegA== | 2017-08-08    |
|      23 | SbVQWl8JbnxflCfGJ7KZdA== | hWVVYdkdTUTgm08haeq+tw== | Uk3ju6GteCD1qEHns5ZhKA==                     | DpnV86FZefwBRmIAVBh2gg== | 2017-08-08    |
|      24 | fx7OfSAYqVpjNa7LoKhXvw== | N2W9ijAXNkBxhkvJiIwp0A== | lAAGItVLmb1H69++1MDrIA==                     | QrE62wAb8B+2cEPcs4Lm1Q== | 2017-08-08    |
|      25 | wH3/LdWShD9aCb8eCIm3Tg== | GDixtt6NzPOVv6H0dmov5g== | T1yfJSyVxumZUfkDnmUQxA==                     | iU+AsGczboCRfU+Zr7mcpw== | 2017-08-08    |
|      26 | GgJQTndbxyBZ2tECS8SmqQ== | gLgVFLFIyyKwdQCXaw78Ag== | O+JIn9XZ3yq6RnKElHuqlA==                     | kwYlbu9aF7ndvMTcj8QBSg== | 2017-08-08    |
|      27 | lv8w8g32kuTXNvSUUypOig== | 8i0YH2mn6kXSyvBjM5p+Yg== | gqRoJF5S66SvBalc2RCo1A==                     | 2ob/3UYqRsZA5VdScnaWxQ== | 2017-08-08    |
|      28 | P9YCbFvWCIhcS99KyKH2zA== | PRrI4z4FrWwLvcHPx9g4og== | y8q31Jj4PFSyZHiLVIxKEQq2ZLhWcqfQ8/EQnIqMx+g= | kDF2za26uOerlNYWYHRT2Q== | 2017-08-08    |
|      29 | 5wu9XvlJAVtjKijhxt6SQQ== | O4pgkLgz34N+C4bIUOQVnA== | UH7ihg16J61Np/EYMQnXIA==                     | z2hbJQD4dRkVVITNxAac5Q== | 2017-08-08    |
+---------+--------------------------+--------------------------+----------------------------------------------+--------------------------+---------------+
20 rows in set (0.00 sec)
```

确认完数据加密的效果后，我们再对数据脱敏功能进行一个简单的测试，下面的测试 CASE 包含了`简单的 SELECT 查询`、`关联查询`、`子查询`等用户日常操作的语句，可以看到 password 字段使用 MD5 哈希脱敏，email 字段使用了 MASK_BEFORE_SPECIAL_CHARS 遮盖脱敏，telephone 字段则使用了 KEEP_FIRST_N_LAST_M 遮盖脱敏。

```SQL
-- 简单 SELECT 查询
mysql> SELECT * FROM t_user WHERE user_id = 10;
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
| user_id | user_name | password                         | email              | telephone   | creation_date |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
|      10 | zhangsan  | 96e79218965eb72c92a549dd5a330112 | ********@gmail.com | 123****8900 | 2017-08-08    |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
1 row in set (0.01 sec)

-- 关联查询
mysql> SELECT u1.* FROM t_user u1 INNER JOIN t_user u2 ON u1.user_id = u2.user_id WHERE u1.user_id = 10;
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
| user_id | user_name | password                         | email              | telephone   | creation_date |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
|      10 | zhangsan  | 96e79218965eb72c92a549dd5a330112 | ********@gmail.com | 123****8900 | 2017-08-08    |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
1 row in set (0.05 sec)

-- 子查询
mysql> SELECT * FROM (SELECT * FROM t_user) temp WHERE temp.user_id = 10;
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
| user_id | user_name | password                         | email              | telephone   | creation_date |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
|      10 | zhangsan  | 96e79218965eb72c92a549dd5a330112 | ********@gmail.com | 123****8900 | 2017-08-08    |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
1 row in set (0.03 sec)

-- 子查询包含关联查询
mysql> SELECT * FROM (SELECT u1.* FROM t_user u1 INNER JOIN t_user u2 ON u1.user_id = u2.user_id) temp WHERE temp.user_id < 15;
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
| user_id | user_name | password                         | email              | telephone   | creation_date |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
|      10 | zhangsan  | 96e79218965eb72c92a549dd5a330112 | ********@gmail.com | 123****8900 | 2017-08-08    |
|      11 | lisi      | e3ceb5881a0a1fdaad01296d7554868d | ****@gmail.com     | 123****8901 | 2017-08-08    |
|      12 | wangwu    | 1a100d2c0dab19c4430e7d73762b3423 | ******@gmail.com   | 123****8902 | 2017-08-08    |
|      13 | zhaoliu   | 73882ab1fa529d7273da0db6b49cc4f3 | *******@gmail.com  | 123****8903 | 2017-08-08    |
|      14 | zhuqi     | 5b1b68a9abf4d2cd155c81a9225fd158 | *****@gmail.com    | 123****8904 | 2017-08-08    |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
5 rows in set (0.03 sec)
```

我们使用 DistSQL 修改脱敏规则，将 password 字段使用的 MD5 哈希脱敏增加可选参数 salt，telephone 字段的脱敏算法修改为 TELEPHONE_RANDOM_REPLACE 手机号随机替换脱敏算法。

```SQL
ALTER MASK RULE t_user (
    COLUMNS(
        (NAME=password, TYPE(NAME='MD5', PROPERTIES("salt"="123abc"))),
        (NAME=email, TYPE(NAME='MASK_BEFORE_SPECIAL_CHARS', PROPERTIES("special-chars"="@", "replace-char"="*"))),
        (NAME=telephone, TYPE(NAME='TELEPHONE_RANDOM_REPLACE', PROPERTIES("network-numbers"="123,180")))
    )
);
```

修改完成后，再次进行查询测试，可以看到由于 salt 值的变化，password 字段 MD5 脱敏的结果发生了变化，而 telephone 字段由于使用了手机号随机替换脱敏算法，脱敏的结果也变为号段位之后随机生成。

```SQL
mysql> SELECT * FROM t_user WHERE user_id = 10;
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
| user_id | user_name | password                         | email              | telephone   | creation_date |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
|      10 | zhangsan  | 554555c0eaca7aeecada758122efd640 | ********@gmail.com | 12383015546 | 2017-08-08    |
+---------+-----------+----------------------------------+--------------------+-------------+---------------+
1 row in set (0.01 sec)
```

最后，我们执行 `DROP MASK RULE t_user;` 语句将脱敏规则删除，此时再进行查询可以返回原始明文结果。

```SQL
mysql> SELECT * FROM t_user WHERE user_id = 10;
+---------+-----------+----------+--------------------+-------------+---------------+
| user_id | user_name | password | email              | telephone   | creation_date |
+---------+-----------+----------+--------------------+-------------+---------------+
|      10 | zhangsan  | 111111   | zhangsan@gmail.com | 12345678900 | 2017-08-08    |
+---------+-----------+----------+--------------------+-------------+---------------+
1 row in set (0.00 sec)
```

# 结语

Apache ShardingSphere 5.3.1 新增的动态数据脱敏功能，是对 ShardingSphere 数据安全方案的进一步补充和完善，未来数据脱敏将会尝试和用户权限、SQL 审计等功能进行结合，根据企业内部的角色划分，进行不同维度的数据脱敏处理。欢迎社区的同学积极参与进来，共同提升 Apache ShardingSphere 的脱敏功能，为社区提供更好的使用体验。

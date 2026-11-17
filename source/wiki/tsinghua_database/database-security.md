---
layout: wiki
wiki: tsinghua_database
order: 014
title: 数据库安全
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：数据库安全课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1265616461&page=13&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 数据库安全覆盖哪些边界

课程从内部越权与外部攻击出发，按接入、认证、授权、数据保护和审计展开。数据库安全不只保护磁盘文件，也要考虑谁能连接、能执行什么操作、结果是否暴露敏感信息，以及事后能否追踪修改。

![数据库从接入、权限到数据保护与审计的安全层次](/wiki/tsinghua_database/database-security/security-layers.webp)

## 认证与边界防护

认证确认访问者身份，可以结合口令、证书、外部认证服务及多因素方式。课件还介绍了 Kerberos 和代理认证，说明集中管理身份与各数据库执行授权是两个相关但不同的环节。

数据库防火墙根据来源、用户、语句和策略检查请求，入侵或异常检测识别可疑行为。它们可以补充应用和内核控制，但不能仅凭关键字过滤就保证消除 SQL 注入；应用仍需通过参数绑定正确区分数据与 SQL 结构。

## 访问控制

DAC 允许数据所有者授予访问权，MAC 根据统一安全标签与策略控制主体、客体关系。RBAC 通过角色集中赋权，再把角色赋给用户，减少逐用户管理；ABAC 则综合用户、对象和环境属性判断请求。

系统权限与对象权限作用范围不同，授权、回收和角色继承需要统一考虑。三权分立把管理、审计和安全职责分开，避免同一个身份既执行敏感变更又不受约束地处理痕迹。

![用户、角色与对象权限之间的关系](/wiki/tsinghua_database/database-security/role-based-access.webp)

配置策略还包括访问来源、口令规则、账户生命周期和对象默认权限。实际授权应围绕业务所需操作确定范围，不能为了方便把所有用户都当成管理员。

## 审计

审计记录谁在何时、从何处对什么对象执行了什么操作及其结果。课程区分 DDL、DML、DCL 等审计对象，并讨论策略配置、统一记录与查询。

日志是否完整、能否被未授权修改、保留多久以及谁能查询，同样影响追踪能力。记录了 SQL 不等于所有证据都可信，还需要保护审计链路和管理权限。

## 加密与全密态计算

存储加密保护持久介质，传输加密保护通信链路，密态计算则尝试在限制明文暴露的条件下完成查询。透明存储加密通常仍允许获得正常查询权限的引擎读取明文，不能把它当成隔离管理员与明文的全部方案。

全密态设计将客户端加密、密钥管理、密文索引和计算组织起来。课件的分层密钥包含列加密密钥、客户端主密钥与设备保护层，使数据密钥与保护数据密钥的密钥分离。

![全密态查询中的客户端、密态内核与可信计算区域](/wiki/tsinghua_database/database-security/encrypted-query.webp)

纯软件方案可以为等值、顺序和聚合选择不同加密表示，但确定性或保序信息也可能暴露模式，不能只看能否执行算子。TEE 将部分计算放入可信边界，又需要明确硬件与实现的信任假设，查询效率和明文暴露范围仍需权衡。

## 隐私、完整性与联合查询

脱敏可以隐藏、替换、扰动或按权限改变显示内容，目标是减少结果暴露。它不自动等于不可逆匿名化，数据组合后是否还能关联到个人，也需要考虑。

差分隐私通过限制相邻数据集上的输出差异约束信息泄露。课件用随机化回答统计及格率，展示个体答案与总体估计之间的关系。噪声需要按机制和隐私预算校准，多次发布还会消耗组合预算，不能仅“加一点随机数”就宣称已经提供差分隐私。

防篡改设计通过受保护的校验与历史记录帮助发现未授权修改，审计和账本也需要可信锚点。多方联合查询则把子查询送到成员库，再合并必要结果；数据不集中搬运并不自动保证隐私，还要控制中间结果和最终聚合能够泄露的信息。

## 参考资料

- [第 13 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides13.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

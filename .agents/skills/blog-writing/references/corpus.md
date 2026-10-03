# 全量语料索引

首次整理：2026-10-02。范围为 `source/_posts/blog/**/*.md`，共 43 篇；源码、日志、图片和表格同时作为文章结构参考。下表覆盖所有文件，不以最近文章替代全部语料。原文件是依据，更新时重新检查，不把历史行为当作当前版本事实。

完整原创文章主要用于学习叙事；翻译、资料、未完成笔记按用途参考。共同习惯是具体背景、例子与代码相互解释、观察结果推动下一步。不同类型的结构差异见 [article-types.md](article-types.md)。

| 文章 | 类型 | 参考权重 / 状态 | 观察到的写法 |
| --- | --- | --- | --- |
| [关系系统查询优化概述论文学习](../../../../source/_posts/blog/an-overview-of-query-optimization-in-relational-systems.md) | 论文译文 | 部分完成；译文身份独立 | 以原论文的搜索空间、代价模型、枚举算法组织内容。 |
| [ShardingSphere 联邦查询 GROUPING 聚合结果问题分析](../../../../source/_posts/blog/analyze-wrong-result-for-shardingsphere-sql-federation-grouping-function.md) | 排障 / SQL 语义 | 主要叙事样本 | 从下标异常转到结果错误，借 Calcite 生成代码理解 GROUPING。 |
| [Apache Calcite Catalog 拾遗之类型系统实现](../../../../source/_posts/blog/apache-calcite-catalog-type-system-implementation.md) | 源码专题 | 提纲草稿 | 承接校验器文章的类型推断问题，正文尚未展开。 |
| [Apache Calcite Catalog 拾遗之 UDF 函数实现和扩展](../../../../source/_posts/blog/apache-calcite-catalog-udf-function-implementation-and-extension.md) | 源码 / API 扩展 | 主要叙事样本 | 函数分类、执行用例和自定义函数实现相互结合。 |
| [Apache Calcite 学习资料整理](../../../../source/_posts/blog/apache-calcite-learning-materials.md) | 学习资料 | 资料结构样本 | 个人知识图谱与基础、优化器、执行器资料分类。 |
| [Apache Calcite 快速入门指南](../../../../source/_posts/blog/apache-calcite-quick-start-guide.md) | 入门 / 源码 | 主要叙事样本 | CSV 入门案例持续串起元数据、优化与执行。 |
| [初探分布式事务常见方案及实现原理](../../../../source/_posts/blog/basic-introduction-to-common-distributed-transaction-solutions.md) | 概念入门 | 部分完成 | 围绕 XA 角色和实际命令，部分标题仍为空。 |
| [Calcite UDF 实战之 ShardingSphere 联邦查询适配 MySQL BIT_COUNT](../../../../source/_posts/blog/calcite-udf-in-action-shardingsphere-sql-federation-adapte-to-mysql-bit-count.md) | 兼容排障 / 源码 | 主要叙事样本 | 升级异常、原生行为测试、社区建议和实现调整。 |
| [CentOS 开发环境搭建笔记](../../../../source/_posts/blog/centos-dev-environment-setup-note.md) | 环境教程 | 主要叙事样本 | 围绕虚拟机网络和开发环境配置。 |
| [CBO 优化的基石——Apache Calcite 统计信息和代价模型详解](../../../../source/_posts/blog/cornerstone-of-cbo-optimization-apache-calcite-statistics-and-cost-model.md) | 源码 / 理论 | 主要叙事样本 | 从 CBO 所需统计信息进入元数据提供器与代价计算。 |
| [无关性的基石之 Java 字节码技术初探](../../../../source/_posts/blog/cornerstone-of-irrelevance-preliminary-study-of-java-bytecode-technology.md) | 概念 / 原理入门 | 主要叙事样本 | 逐条字节码与局部变量表、操作栈变化互相解释。 |
| [深入理解 Apache Calcite HepPlanner 优化器](../../../../source/_posts/blog/deep-understand-of-apache-calcite-hep-planner.md) | 源码笔记 | 部分完成；结构低权重 | 调用跟踪有价值，空标题与箭头笔记不作成文模板。 |
| [深入理解 Apache Calcite ValcanoPlanner 优化器](../../../../source/_posts/blog/deep-understand-of-apache-calcite-volcano-planner.md) | 理论 / 源码 | 主要叙事样本 | 论文概念、核心对象、同一 SQL 的优化过程。 |
| [Charles 抓包下载钉钉群直播视频](../../../../source/_posts/blog/download-ding-talk-video-by-charles.md) | 工具教程 | 工具叙述样本 | 目标驱动的 Charles 抓包与 FFmpeg 下载衔接。 |
| [Apache Calcite System Catalog 实现探究](../../../../source/_posts/blog/explore-apache-calcite-system-catalog-implementation.md) | 源码 / 元数据 | 主要叙事样本 | 承接解析阶段，以测试用例说明 Catalog 使用。 |
| [探秘 ShardingSphere 5.0.0 beta 版内核增强](../../../../source/_posts/blog/explore-shardingsphere-5.0.0-beta-kernel-enhancement.md) | 版本特性 | 类型样本 | 内核背景、路由场景、分布式查询支持范围。 |
| [Apache Calcite 在 MyCat2 中的实践探究](../../../../source/_posts/blog/explore-the-practice-of-apache-calcite-in-mycat2.md) | 项目实践 / 源码 | 主要叙事样本 | 环境、分片数据、执行计划和调用关系结合。 |
| [GraalVM 编译动态链接库之 MySQL UDF 实现](../../../../source/_posts/blog/graalvm-compilation-of-dynamic-link-library-mysql-udf-implementation.md) | 跨语言实战 | 主要叙事样本 | 接口规范先于实现，异常修复紧接具体实验。 |
| [Apache Calcite SQL Parser 原理剖析](../../../../source/_posts/blog/implementation-principle-of-apache-calcite-sql-parser.md) | 源码 / 语法扩展 | 主要叙事样本 | 从 Parse 在整体流程中的位置到 AST 和方言生成。 |
| [ANTLR 解析性能优化指南](../../../../source/_posts/blog/improving-the-performance-of-an-antlr-parser.md) | 译文 | 部分完成；译文身份独立 | 原文的性能建议不作为作者个人实验经历。 |
| [深度探究 Apache Calcite SQL 校验器实现原理](../../../../source/_posts/blog/in-depth-exploration-of-implementation-principle-of-apache-calcite-sql-validator.md) | 源码 / 语义分析 | 主要叙事样本 | Scope、Namespace 概念为同一查询的校验服务。 |
| [ANTLR 基础入门](../../../../source/_posts/blog/introduction-to-antlr.md) | 技术入门 / 实战 | 主要叙事样本 | HelloWorld 到计算器，概念随着演示逐步展开。 |
| [Java8 新特性实战](../../../../source/_posts/blog/java-8-new-features-in-action.md) | 语言特性入门 | 类型样本 | 各特性分别从使用问题、写法和限制展开。 |
| [Java AOT 编译框架 GraalVM 快速入门](../../../../source/_posts/blog/java-aot-compiler-framework-graalvm-quick-start.md) | 原理 / 操作教程 | 主要叙事样本 | AOT 背景、HelloWorld、反射失败及元数据收集。 |
| [JVM 学习资料整理](../../../../source/_posts/blog/jvm-learning-materials.md) | 学习资料 | 资料结构样本 | 知识图谱、书籍与不同专题链接。 |
| [MySQL 5.7.40 安装及初始化配置指南](../../../../source/_posts/blog/mysql-5.7.40-install-and-initial-config-guide.md) | 安装 / 配置教程 | 主要叙事样本 | 环境版本明确，每阶段有命令与可观察结果。 |
| [MySQL 学习资料整理](../../../../source/_posts/blog/mysql-learning-materials.md) | 学习资料 | 资料结构样本 | 官方、书籍、网络资料的短分类。 |
| [Java 虚拟机指令操作码和助记符映射关系](../../../../source/_posts/blog/opcode-mnemonics-by-opcode.md) | 速查表 | 表格结构样本 | 按 JVM 指令类别提供映射，检索优先。 |
| [打造 24 小时专属 AI 管家！OpenClaw 基础入门与飞书实战](../../../../source/_posts/blog/openclaw-configuration-and-feishu-integration-guide.md) | 工具体验 / 集成实践 | 轻松语气样本 | 对话、截图、幽默和日报需求逐轮完善。 |
| [PolarDB-X 开发环境搭建笔记](../../../../source/_posts/blog/polardb-x-dev-environment-setup-note.md) | 环境搭建 / 排障 | 主要叙事样本 | 启动异常逐一排查，最后回到查询与 Debug。 |
| [基于 SQLLine 快速体验 ShardingSphere JDBC](../../../../source/_posts/blog/quickly-start-shardingsphere-jdbc-with-sqlline.md) | 工具入门 | 提纲草稿 | 仅有 SQLLine、打包、实战标题。 |
| [ShardingSphere 5.0.0 内核优化及升级指南](../../../../source/_posts/blog/shardingsphere-5.0.0-kernel-optimization-and-upgrade-guide.md) | 版本迁移 / 架构 | 主要叙事样本 | 同一组功能与配置贯穿版本差异和升级操作。 |
| [ShardingSphere 5.1.0 执行引擎性能优化揭秘](../../../../source/_posts/blog/shardingsphere-5.1.0-execution-engine-performance-optimization.md) | 性能优化 / 架构 | 主要叙事样本 | 连接与内存取舍引出 UNION ALL，测试验证收益。 |
| [ShardingSphere 5.3.1 新特性之动态数据脱敏](../../../../source/_posts/blog/shardingsphere-5.3.1-new-feature-dynamic-data-masking.md) | 新特性 / 工程实战 | 类型样本 | 扩展点、API、规则变更与实际查询结果。 |
| [ShardingSphere Proxy 适配 MySQL addBatch/executeBatch 数组结果实战](../../../../source/_posts/blog/shardingsphere-proxy-adapt-mysql-add-batch-execute-batch-return-int-array-in-action.md) | 协议兼容排障 | 主要叙事样本 | 多结果返回、状态标记与握手能力逐步定位。 |
| [ShardingSphere Proxy 集成测试代码调试实战](../../../../source/_posts/blog/shardingsphere-proxy-integration-test-debug-in-action.md) | 调试教程 / 排障 | 主要叙事样本 | 容器随机端口与远程调试，回到 SQL 测试语义。 |
| [百倍提速！ShardingSphere 联邦查询批量 IN 查询深度优化](../../../../source/_posts/blog/speed-up-by-100x-shardingsphere-sql-federation-in-predicate-deep-optimization-practice.md) | 性能排障 / 优化规则 | 主要叙事样本 | 客户超时、计划追踪、规则改写、前后环境数据。 |
| [BenchmarkSQL & ShardingSphere-JDBC 性能测试实战](../../../../source/_posts/blog/use-benchmark-sql-test-shardingsphere-jdbc-performance.md) | 性能测试 | 提纲草稿 | TPC-C 简介之后的流程尚未展开。 |
| [使用 Java 远程调试技术定位系统表加载问题](../../../../source/_posts/blog/use-java-remote-debugging-to-locate-system-table-loading-bug.md) | 调试实战 | 主要叙事样本 | IDEA 正常与打包异常对照，远程调试解释根因。 |
| [使用 MySQL Test Framework 测试 ShardingSphere 联邦查询](../../../../source/_posts/blog/use-mysql-test-framework-test-shardingsphere-sql-federation.md) | 测试工具 | 提纲草稿 | 仅有框架简介、使用与测试实战标题。 |
| [使用 SQLancer 测试 ShardingSphere 联邦查询](../../../../source/_posts/blog/use-sqlancer-to-test-shardingsphere-sql-federation.md) | 测试方法 / 项目集成 | 主要叙事样本 | 先讲结果判定方法，再讲联邦查询接入和复现。 |
| [使用 Wireshark 解决 BenchmarkSQL 压测 Proxy 异常](../../../../source/_posts/blog/use-wireshark-to-solve-benchmarksql-exception-with-shardingsphere-proxy.md) | 协议排障 / 工具 | 主要叙事样本 | 参数从源码到报文，原生 MySQL 对照完成判断。 |
| [以 Calcite 为例探究 Join 算子的常用实现](../../../../source/_posts/blog/using-calcite-as-an-example-to-explore-the-common-implementation-of-join-operators.md) | 算子原理 | 提纲草稿 | 正文为待写标记，作为题材记录。 |

## 具体语气参考

《SQL Parser》：“大致了解 JavaCC 语法描述的基本结构后，我们结合 Calcite `Parser.jj` 文件，来具体看下这些规则应该如何配置，以及在 Calcite SQL Parser 中起到了什么作用。”这里先建立阅读基础，再引出对应实现。

《Wireshark》：“Proxy 返回了正确的 parameterCount，而 MySQL 驱动接收到的却是一个错误的值，这到底是为什么？”问题来自已经观察到的矛盾，后面的抓包调查接着解答。

《GROUPING》：“不过意外情况又出现了，修改完 GROUPING 函数逻辑后，SQL 的执行结果仍然不正确。”真实的未解决结果让调查自然转向下一层算子。

《MySQL 安装》：“使用 `ll` 查看上传结果”，随后给出实际输出。短操作直接写，方案选择和环境差异再展开解释。

这些片段说明解释关系和叙事节奏，不能逐段复制句式。译文中的第一人称、营销尾部、草稿占位、错别字和重复段落不作为个人写作习惯继承。

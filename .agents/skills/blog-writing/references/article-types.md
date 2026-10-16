# 按文章类型写作

这些经验用于技术博客，来自本仓库文章的不同写法，是选材和组织的参考。按本次文章的问题选择有用的部分；章节标题、数量和顺序都不固定。以下文件均位于仓库的 `source/_posts/blog/`，完整清单见 [corpus.md](corpus.md)。Wiki 学习笔记另按 [wiki-notes.md](wiki-notes.md) 执行，课程笔记的整体顺序以原始视频为准。

## 源码与实现原理

参考 `implementation-principle-of-apache-calcite-sql-parser.md`、`in-depth-exploration-of-implementation-principle-of-apache-calcite-sql-validator.md`、`deep-understand-of-apache-calcite-volcano-planner.md`。

作者经常先说明组件在完整流程里的位置，再以一个 SQL 或测试入口跟踪内部实现。介绍类和接口时解释它们在案例中承担的工作；跟踪方法时说明参数、对象状态和调用结果。源码片段前提出需要观察的地方，后面解释相关逻辑。

长篇可以先给整体流程，再深入关键路径，最后回到同一个例子看输出。短篇只解释一个方法或数据结构即可。继承体系、初始化流程、执行流程是否单独成章，取决于它们是否帮助理解当前问题。

《SQL Parser》承接快速入门文章中的 `Parse` 阶段；《SQL 校验器》从名称解析范围与命名空间进入；《VolcanoPlanner》先补论文中的概念。保留细节解释方式，各自的入口无须统一。

避免按类名罗列全部源码。用“这个参数为什么传入”“处理后对象变成什么”“哪个分支与案例有关”决定展开程度。版本或 commit 是源码结论的适用范围，保留一次明确说明。

## 问题排查与兼容适配

参考 `analyze-wrong-result-for-shardingsphere-sql-federation-grouping-function.md`、`use-wireshark-to-solve-benchmarksql-exception-with-shardingsphere-proxy.md`、`use-java-remote-debugging-to-locate-system-table-loading-bug.md`、`shardingsphere-proxy-adapt-mysql-add-batch-execute-batch-return-int-array-in-action.md`。

从实际现象进入：操作是什么、预期是什么、观察到了什么。保留有证据的初始猜测和转折，例如修正下标异常后结果仍不对，或者服务端参数正确而驱动读到的数值错误。这些转折解释了为什么需要继续调查。

复杂业务先做最小复现，用正常系统或环境作对照。原生数据库结果、日志、抓包或对象状态推动结论；定位后解释修改，并回到最初的复现或测试验证。

只有原始材料提供了调查经历，才使用“笔者起初怀疑”“本地复现”。资料不足时用客观的排查说明。不要为营造故事而编造失败尝试、周末调研或社区交流。

某些文章突出工具方法，如 JDWP 和容器端口映射；另一些突出协议语义或聚合计算。选主要关注点，次要技术按需要穿插，不强制排成“背景—分析—解决—总结”。

## 性能优化与测试实践

参考 `speed-up-by-100x-shardingsphere-sql-federation-in-predicate-deep-optimization-practice.md`、`shardingsphere-5.1.0-execution-engine-performance-optimization.md`、`use-sqlancer-to-test-shardingsphere-sql-federation.md`。

性能文章解释“慢在哪里”与“修改为何减少开销”。《批量 IN 查询》从计划发现过滤条件未下推，沿规则追踪，再展示优化后计划和耗时；《执行引擎性能优化》从连接和内存的取舍进入，再讨论 `UNION ALL` 改写和测试。

保留硬件、版本、数据量、SQL、并发与测试方式，使结果有明确范围。区分客户环境和本地环境的耗时，不把单个案例的倍率推广为普遍结论。正文说清改动对应的工作量变化，数据表负责比较结果。

测试方法文章可以围绕“如何判断结果错误”组织。《SQLancer》先解释各预言机，再落到联邦查询的改造和复现。这种文章不必编造性能瓶颈，也不必凑优化倍率。

## 操作教程与环境搭建

参考 `mysql-5.7.40-install-and-initial-config-guide.md`、`centos-dev-environment-setup-note.md`、`polardb-x-dev-environment-setup-note.md`、`java-aot-compiler-framework-graalvm-quick-start.md`。

明确环境、目标和必要条件，沿操作顺序解释配置。命令前说明目的，命令后说明怎样判断完成，只有影响后续操作的参数才详解。截图旁指出要观察的选项或结果，避免只写“如下图”。

简单安装流程直接写到可用结果。《PolarDB-X》中的协议、动态库、类型检查异常则值得展开，它们与具体环境相关。《GraalVM》把反射失败和元数据收集放进同一演示，概念因此更容易理解。

步骤长度由依赖关系决定。允许短命令串、参数表或某个异常的小节，无需把每一步改写成同样的段落。方案选择说明原因；历史配置要按本次环境确认适用性。

## 版本特性与工程方案解读

参考 `explore-shardingsphere-5.0.0-beta-kernel-enhancement.md`、`shardingsphere-5.0.0-kernel-optimization-and-upgrade-guide.md`、`shardingsphere-5.3.1-new-feature-dynamic-data-masking.md`。

说明功能解决的使用问题，以及它在已有架构中的位置。旧版本有具体限制时，用配置、路由结果或行为说明变化。《升级指南》通过同一组分片、读写分离、加密配置展示差异；《动态脱敏》说明归并扩展点，再演示创建、修改和删除规则的结果。

特性介绍可按能力组织，迁移指南应沿升级动作组织。混合时以受影响的场景为线索。把收益写成能够执行的 SQL、减少的配置或支持的行为，减少“强大、完美、全面提升”等宣传表达。

## 概念入门与论文学习

概念入门参考 `introduction-to-antlr.md`、`cornerstone-of-irrelevance-preliminary-study-of-java-bytecode-technology.md`、`java-8-new-features-in-action.md`。两篇译文见语料索引，注意原作者身份。

从能解释清楚的小例子进入概念。ANTLR 用 HelloWorld 和计算器说明解析、遍历；字节码文章用对象创建和整数运算解释局部变量表与操作栈；Java8 按不同特性的使用问题展开。概念先后顺序由理解所需的依赖决定。

博客中的论文解读交代主题和资料，围绕最值得展开的机制说明，穿插必要的图、伪代码和例子。引用就近放在相关结论或段落；原文内容与扩展示例说明清楚。

纯翻译保留原文逻辑和作者身份；博客中的学习解读允许围绕一个问题重组。Wiki 学习笔记保留原始资料的讲解顺序。没有原始实验时，将代码写成明确的演示或伪代码，不宣布已验证。

## 资料整理与速查

参考 `apache-calcite-learning-materials.md`、`jvm-learning-materials.md`、`mysql-learning-materials.md`、`opcode-mnemonics-by-opcode.md`。

重点是检索和学习路径。短开篇交代用途，按官方文档、书籍、专题或指令类别组织。链接清单和表格就是主体，需要时补一句选择依据；无需扩写成机制分析或为每组添加总结。

资料未确认读过时，不虚构阅读评价。速查类保留字段统一与可扫描性，不能为追求叙事风格而拆成大量散文。

## 混合题材与变化

`calcite-udf-in-action-shardingsphere-sql-federation-adapte-to-mysql-bit-count.md` 同时包含兼容排查、函数行为测试、源码追踪和社区交流；`graalvm-compilation-of-dynamic-link-library-mysql-udf-implementation.md` 先解释两套接口规范，再进行跨语言实践和修复。顺序来自解决问题所需的知识。

`openclaw-configuration-and-feishu-integration-guide.md` 混合入门、工具体验和日报实践，出现幽默、对话和截图，说明作者也会用轻松语气。此类语气适合体验材料；严肃源码文章依据自己的材料决定语气。

确定哪条线最能带动理解，让其他内容为它提供解释。变化来自问题、材料和作者判断，不靠随机改标题或换几个转折词。

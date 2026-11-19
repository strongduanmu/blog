---
layout: wiki
wiki: cmu_17_214
order: 001
title: 课程资料
date: 2026-11-19 08:00:00
banner: /assets/banner/banner_1.jpg
---

`CMU 17-214/514: Agentic Software Development` 是卡内基梅隆大学 2026 年秋季的软件开发课程，由 [Hammad Ahmad](https://hammadahmad.io/) 与 [Claire Le Goues](https://clairelegoues.com/) 联合授课。课程围绕使用编程智能体时的软件设计展开，讨论如何验证生成结果、应对需求变化、维护设计记忆，以及让系统能够扩展和持续运行。笔记如有错误，欢迎大家留言指正。

## 官方资料

- [2026 秋季课程主页](https://cmu-17-214.github.io/f2026/index.html)
- [课程 Schedule](https://cmu-17-214.github.io/f2026/index.html#schedule)
- [官方课件目录](https://github.com/CMU-17-214/f2026/tree/main/slides)
- [课程仓库：实验与作业说明](https://github.com/CMU-17-214/f2026)
- [课程学习目标](https://github.com/CMU-17-214/f2026/blob/main/learninggoals.md)
- [智能体使用与课程政策](https://github.com/CMU-17-214/f2026/blob/main/policies.md)

## 录像与整理范围

本系列对应 **2026 秋季版**。第 1 讲说明，课堂录像通过校内 Canvas 的 Panopto Recordings 提供；截至 2026-11-19，尚未找到与本学期对应的公开视频入口。CS Learn 已公开的同编号 Spring 2026 录像属于《Principles of Software Construction》，不能作为本系列的逐讲录像。

本系列按官方前 21 讲 PDF 的顺序整理，记录知识主题、定义、分类、原课示例、课堂练习与实验条件，并配合公开实验和作业说明核对。同一主题的重复展示与总结合并说明，行政通知不逐页翻译。正文中的课堂案例与图示来自课件，补充推导和练习建议在相关位置说明；尚未核对录像中的演示、问答与口头补充。后续三讲按官方计划保留入口并注明资料状态。

截图从官方 PDF 直接渲染，使用无损 WebP 保存。资料与课件链接集中在本页及各讲文末，方便对照复习。

## 学习主线

课程先建立验证标准，再讨论数据、操作和模块结构。随后通过需求变化、陌生代码库重构、多副本和实际运行，观察早期设计的后果。

| 阶段 | 主要问题 | 对应讲次 |
| --- | --- | --- |
| 验证 | 如何定义正确，怎样检查生成代码与测试？ | 01—04 |
| 变化与复用 | 如何选择边界、保存决策并保持接口兼容？ | 05—12 |
| 智能体监督 | 如何配置上下文、工具、权限与验证关卡？ | 13—14 |
| 扩展规模 | 如何处理数据所有权、副本、并发和消息？ | 15—18 |
| 交付与运行 | 如何部署、验证发布，并观察运行中的问题？ | 19—24 |

## 课程目录

下表按官方课表中的正式讲授课编号，不把实验、作业截止日、考试或假期计为课程。每讲对应独立 Markdown 文档。

| 编号 | 日期 | 课程 | 笔记 | 官方资料 |
| --- | --- | --- | --- | --- |
| 01 | 08-24 | Course Introduction and Modern Software Engineering | [课程简介与现代软件工程](/wiki/cmu_17_214/course_introduction.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/01-introduction.pdf) |
| 02 | 08-26 | Agentic Development and Design for Verification | [智能体开发与面向验证的设计](/wiki/cmu_17_214/agentic_development.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/02-agentic-development.pdf) |
| 03 | 08-31 | Testing and Testability | [测试与可测试性](/wiki/cmu_17_214/testing_and_testability.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/03-testing-and-testability.pdf) |
| 04 | 09-02 | Test Design and Coverage | [测试设计与覆盖率](/wiki/cmu_17_214/test_design_and_coverage.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/04-test-design-and-coverage.pdf) |
| 05 | 09-09 | What Is a Software System’s Design? | [软件系统的设计是什么](/wiki/cmu_17_214/what_is_design.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/05-what-is-design.pdf) |
| 06 | 09-14 | Communicating and Recording Designs | [设计的表达与记录](/wiki/cmu_17_214/communicating_designs.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/06-communicating-designs.pdf) |
| 07 | 09-16 | Design for Change | [面向变化的设计](/wiki/cmu_17_214/design_for_change.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/07-design-for-change.pdf) |
| 08 | 09-21 | Modularity and Anti-Patterns | [模块化与反模式](/wiki/cmu_17_214/modularity_and_anti_patterns.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/08-modularity-and-anti-patterns.pdf) |
| 09 | 09-28 | Refactoring and Design Improvement | [重构与设计改进](/wiki/cmu_17_214/refactoring.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/09-refactoring.pdf) |
| 10 | 09-30 | Design Patterns and Tradeoffs | [设计模式与取舍](/wiki/cmu_17_214/design_patterns.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/10-design-patterns.pdf) |
| 11 | 10-05 | APIs, Libraries, and Frameworks | [API、库与框架](/wiki/cmu_17_214/apis_libraries_frameworks.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/11-apis-libraries-frameworks.pdf) |
| 12 | 10-07 | Evolution, Drift, and Decision Archaeology | [演进、设计漂移与决策考古](/wiki/cmu_17_214/evolution_drift_memory.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/12-evolution-drift-memory.pdf) |
| 13 | 10-19 | Agent Architectures | [编程智能体的架构](/wiki/cmu_17_214/agent_architectures.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/13-agent-architectures.pdf) |
| 14 | 10-21 | Agent Supervision and Safety | [智能体监督与安全](/wiki/cmu_17_214/agent_supervision.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/14-agent-supervision.pdf) |
| 15 | 10-26 | Software Architecture and Subsystem Design | [软件架构与子系统设计](/wiki/cmu_17_214/software_architecture.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/15-software-architecture.pdf) |
| 16 | 10-28 | Data Models at Scale | [规模增长下的数据模型](/wiki/cmu_17_214/data_models_at_scale.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/16-data-models-at-scale.pdf) |
| 17 | 11-02 | Concurrency and Asynchrony | [并发与异步](/wiki/cmu_17_214/concurrency.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/17-concurrency.pdf) |
| 18 | 11-09 | Coordinating and Communicating Systems | [系统之间的协调与通信](/wiki/cmu_17_214/coordinating_systems.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/18-coordinating-systems.pdf) |
| 19 | 11-11 | Containers and the Cloud | [容器与云部署](/wiki/cmu_17_214/containers_and_cloud.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/19-containers-and-cloud.pdf) |
| 20 | 11-16 | DevOps | [DevOps 与交付流程](/wiki/cmu_17_214/devops.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/20-devops.pdf) |
| 21 | 11-18 | Verification in the Pipeline | [流水线中的验证](/wiki/cmu_17_214/verification_pipeline.html) | [课件](https://github.com/CMU-17-214/f2026/blob/main/slides/21-verification-pipeline.pdf) |
| 22 | 11-23 | Supply Chain Security | [软件供应链安全](/wiki/cmu_17_214/supply_chain_security.html) | 课表已列出，课件未公开 |
| 23 | 11-30 | Observability and Monitoring | [可观测性与监控](/wiki/cmu_17_214/observability_and_monitoring.html) | 课表已列出，课件未公开 |
| 24 | 12-02 | Summary and What We Learned Together | [课程回顾](/wiki/cmu_17_214/course_summary.html) | 课表已列出，课件未公开 |

## 贯穿学期的作业

作业二、三、五、六在同一 Slack 类系统上继续开发；作业四转向 Jenkins，练习理解历史决策并保持现有行为。部分起始仓库、验收契约与评分环境由课程内部发放，公开说明可用于理解要求，不能假定旁听者拥有全部评分材料。

| 作业 | 内容 | 官方说明 |
| --- | --- | --- |
| A1 · Bad Slack | 诊断并修复生成系统，用证据解释修复 | [作业一](https://github.com/CMU-17-214/f2026/blob/main/assignments/hw1.md) |
| A2 · Better Slack | 先写规格与验证工具，再实现第一版并建立决策记录 | [作业二](https://github.com/CMU-17-214/f2026/blob/main/assignments/hw2.md) |
| A3 · Two Roads | 审查新契约，选择在原系统演进或重新生成，并保持旧客户端兼容 | [作业三](https://github.com/CMU-17-214/f2026/blob/main/assignments/hw3.md) |
| A4 · Explore and Refactor | 恢复 Jenkins 历史决策，为 XML 持久化子系统建立特征测试并重构 | [作业四](https://github.com/CMU-17-214/f2026/blob/main/assignments/hw4.md) |
| A5 · Scale | 多副本、吞吐与跨副本正确性，以及有速率限制的通知 | [作业五](https://github.com/CMU-17-214/f2026/blob/main/assignments/hw5.md) |
| A6 · Operate | 建立交付流水线，在实际流量与下游退化中观察、报告运行情况 | [作业六](https://github.com/CMU-17-214/f2026/blob/main/assignments/hw6.md) |

## 实验资料

实验把课堂方法缩小为可操作的步骤，可以与相关讲次一起阅读。

| 实验 | 主题 | 资料 |
| --- | --- | --- |
| Lab 01 | 环境准备与首次受监督任务 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab01.md) |
| Lab 02 | 测试、可测试性与生成测试审查 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab02.md) |
| Lab 03 | 找到设计与实现的差距 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab03.md) |
| Lab 04 | 首次 AWS 部署 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab04.md) |
| Lab 05 | 评审生成代码的反模式 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab05.md) |
| Lab 06 | API 契约承受变化 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab06.md) |
| Lab 07 | 指挥一次保持行为的重构 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab07.md) |
| Lab 08 | 监督仓库级修改与反例检查 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab08.md) |
| Lab 09 | 边界、状态与副本 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab09.md) |
| Lab 10 | 找出并稳定复现竞争 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab10.md) |
| Lab 11 | 事件、重放与退款 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab11.md) |
| Lab 12 | 设置并验证 CI 关卡 | [说明](https://github.com/CMU-17-214/f2026/blob/main/labs/lab12.md) |
| Lab 13 | Make It Observable | 课表已列出，说明未公开 |

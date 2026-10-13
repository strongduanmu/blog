---
layout: wiki
wiki: cmu_11_768
order: 001
title: 课程资料
date: 2026-09-10 08:00:00
banner: /assets/banner/banner_1.jpg
---

`CMU 11-768: AI Agents` 是卡内基梅隆大学，语言技术研究所 2026 年秋季开设的研究生课程，由 [Graham Neubig](https://www.phontron.com/) 与 [Daniel Fried](https://dpfried.github.io/) 联合授课。课程把 LLM 智能体视为一个需要构建、评测、训练和保障安全的完整系统，兼顾理论、工程实践与开放研究。适合对 AI Agents 感兴趣的朋友学习，课程笔记如有错误，欢迎大家留言指正。

## 官方资料

- [CMU 11-768: AI Agents 课程主页](https://www.cmu-agents.com/)
- [课程 Schedule](https://www.cmu-agents.com/#/schedule)
- [课程 Assignments](https://www.cmu-agents.com/#/assignments)
- [课程 Syllabus & Policies](https://www.cmu-agents.com/#/syllabus)
- [课程 YouTube 播放列表](https://www.youtube.com/playlist?list=PLSN0qpDfUvTM)
- [Assignment 1: Build an Agent Harness](https://github.com/cmu-agents/assignment-1)

## 网络资料

- [CMU AI Agents 2026 中英字幕](https://space.bilibili.com/103778182/favlist?fid=4033440582&ftype=create)

## 参考导读

- [CMU 秋季新课 AI Agents 概览](https://x.com/shao__meng/status/2097496946877636655)

## 学习路线

课程围绕两条互相咬合的主线展开：

1. **知识主线**：智能体能力 → 应用领域 → 训练方法 → 安全与框架 → 交互、搜索与进阶。
2. **实践主线**：搭建 Harness → 设计 Eval → 使用 SFT/RL 训练 → 完成研究项目。

学完后应能在开源 LLM 之上实现智能体，设计多步任务评测，训练和改进智能体能力，分析安全与可靠性取舍，并围绕智能体提出和验证一个开放研究问题。

## 课程目录

| 编号 | 日期 | 课程 | 笔记 | 资料 |
| --- | --- | --- | --- | --- |
| 01 | 08-25 | What Are Agents & How Do They Work? | [什么是智能体 & 他们如何工作](/wiki/cmu_11_768/what_are_agents_and_how_do_they_work.html) | [Slides](https://www.cmu-agents.com/slides/lecture-01-agents.pdf) · [YouTube](https://www.youtube.com/watch?v=UwfjzyLnvMg) · [B 站](https://www.bilibili.com/video/BV1hQYT64E2e) |
| 02 | 08-27 | Agent Capabilities 1: Tool Use | [工具调用](/wiki/cmu_11_768/tool_use.html) | [Slides](https://www.cmu-agents.com/slides/lecture-02-tool-use.pdf) · [YouTube](https://www.youtube.com/watch?v=jXChFB4JSyw) · [B 站](https://www.bilibili.com/video/BV13QYT64Eyq) |
| 03 | 09-01 | Agent Capabilities 2: Context Management for Long-Context Agents | [长上下文智能体的上下文管理](/wiki/cmu_11_768/context_management_for_long_context_agents.html) | [Slides](https://www.cmu-agents.com/slides/lecture-03-long-context.pdf) · [YouTube](https://www.youtube.com/watch?v=AiwCCvFW1uE) · [B 站](https://www.bilibili.com/video/BV1hQYT64EXQ) |
| 04 | 09-03 | Agent Capabilities 3: Skills and Memory | [技能与记忆](/wiki/cmu_11_768/skills_and_memory.html) | [Slides](https://www.cmu-agents.com/slides/lecture-04-memory-and-skills.pdf) · [YouTube](https://www.youtube.com/watch?v=6zigF2a-2Pw) · [B 站](https://www.bilibili.com/video/BV1GSYT6ZEb4) |
| 05 | 09-08 | Agent Capabilities 4: Planning, Task Decomposition, and Multi-Agent Coordination | [规划、任务分解与多智能体协同](/wiki/cmu_11_768/planning_task_decomposition_and_multi_agent_coordination.html) | [Slides](https://www.cmu-agents.com/slides/lecture-05-planning.pdf) |
| 06 | 09-10 | Domains 1: Coding Agents | [编程智能体](/wiki/cmu_11_768/coding_agents.html) | [Slides](https://www.cmu-agents.com/slides/lecture-06-coding-agents.pdf) |
| 07 | 09-15 | Domains 2: GUI Agents | [GUI 智能体](/wiki/cmu_11_768/gui_agents.html) | 待更新 |
| 08 | 09-17 | Training 1: Supervised Fine-Tuning (SFT) | [监督微调](/wiki/cmu_11_768/supervised_fine_tuning.html) | 待更新 |
| 09 | 09-22 | Training 2: Reinforcement Learning Basics | [强化学习基础](/wiki/cmu_11_768/reinforcement_learning_basics.html) | 待更新 |
| 10 | 09-24 | Domains 3: Deep Research Agents | [深度研究智能体](/wiki/cmu_11_768/deep_research_agents.html) | 待更新 |
| 11 | 09-29 | Training 3: Advanced RL Algorithms | [高级强化学习算法](/wiki/cmu_11_768/advanced_reinforcement_learning_algorithms.html) | 待更新 |
| 12 | 10-01 | Training 4: RL Systems | [强化学习系统](/wiki/cmu_11_768/reinforcement_learning_systems.html) | 待更新 |
| 13 | 10-06 | Safety 1: Sandboxing and Credential Management | [沙箱与凭证管理](/wiki/cmu_11_768/sandboxing_and_credential_management.html) | 待更新 |
| 14 | 10-08 | Frameworks 1: OpenHands | [OpenHands](/wiki/cmu_11_768/openhands.html) | 待更新 |
| 15 | 10-20 | Frameworks 2: LangGraph | [LangGraph](/wiki/cmu_11_768/langgraph.html) | 待更新 |
| 16 | 10-22 | Safety 2: Observability and Monitoring | [可观测性与监控](/wiki/cmu_11_768/observability_and_monitoring.html) | 待更新 |
| 17 | 10-27 | Agents and the Future of Work | [智能体与工作的未来](/wiki/cmu_11_768/agents_and_the_future_of_work.html) | 待更新 |
| 18 | 10-29 | Interaction 1: Multi-Agent Interaction | [多智能体交互](/wiki/cmu_11_768/multi_agent_interaction.html) | 待更新 |
| 19 | 11-10 | Interaction 2: Human-Agent Interaction | [人机交互](/wiki/cmu_11_768/human_agent_interaction.html) | 待更新 |
| 20 | 11-12 | Search 1: Reranking and Critic Models | [重排序与评论模型](/wiki/cmu_11_768/reranking_and_critic_models.html) | 待更新 |
| 21 | 11-17 | Search 2: Tree Search | [树搜索](/wiki/cmu_11_768/tree_search.html) | 待更新 |
| 22 | 11-19 | Guest Lecture: Karthik Narasimhan | [客座讲座：Karthik Narasimhan](/wiki/cmu_11_768/guest_lecture_karthik_narasimhan.html) | 待更新 |
| 23 | 11-24 | Guest Lecture: Sasha Rush | [客座讲座：Sasha Rush](/wiki/cmu_11_768/guest_lecture_sasha_rush.html) | 待更新 |

课程另安排两次 Project Hours、三次假期停课和两次期末海报展示。本项目将这些非主题讲次统一记录在研究项目笔记中。

## 实践项目

| 项目 | 截止时间 | 笔记 |
| --- | --- | --- |
| Assignment 1: Harness | 2026-09-14 | [搭建智能体 Harness](/wiki/cmu_11_768/assignment_1_harness.html) |
| Assignment 2: Eval | 2026-09-24（暂定） | [设计智能体评测](/wiki/cmu_11_768/assignment_2_eval.html) |
| Assignment 3: Training | 2026-10-22（暂定） | [训练智能体](/wiki/cmu_11_768/assignment_3_training.html) |
| Half-semester Research Project | 2026-12-01 至 12-03 展示 | [研究项目](/wiki/cmu_11_768/research_project.html) |

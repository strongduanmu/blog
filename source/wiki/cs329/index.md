---
layout: wiki
wiki: cs329
order: 001
title: 课程资料
date: 2026-11-08 20:00:00
updated: 2026-11-08 20:00:00
banner: /assets/banner/banner_1.jpg
---

`CS329A: Self-Improving AI Agents` 是 Stanford 2025 年秋季开设的研究生课程，由 Aakanksha Chowdhery 与 Azalia Mirhoseini 授课。课程从大语言模型的生成与验证出发，讨论怎样通过更多推理计算、环境反馈和训练更新，改进智能体完成复杂任务的能力。

本组学习笔记参考 [CMU 11-768：AI Agents 学习笔记](/wiki/cmu_11_768/)的排版，按 Stanford 公开发布的 **9 段课程录像，一段录像对应一篇笔记**。正文依据原视频字幕与可见课件画面整理，关键流程、公式和实验配有原视频截图及时间链接，如有错误，欢迎指正。

## 官方资料

- [Stanford CS329A 课程主页、2025 年秋季课表与阅读论文](https://cs329a.stanford.edu/)
- [Stanford Online：Self-Improving AI Agents](https://online.stanford.edu/courses/cs329a-self-improving-ai-agents)
- [Stanford Scaling Intelligence Lab](https://scalingintelligence.stanford.edu/)

## 课程视频

- [B 站收藏夹：CS329_自我改进 AI 智能体，中英文字幕](https://space.bilibili.com/103778182/favlist?fid=4492876382&ftype=create)
- 每篇笔记顶部嵌入对应课程视频，也提供 Stanford 官方录像入口。

## 学习路线

课程先建立“生成候选—验证—使用反馈”的关系，再逐步扩展到更完整的智能体：

1. 从模型规模、指令微调与思维链理解自我改进的来由。
2. 比较推理时的采样、修订、验证与架构组合，检查计算投入的收益。
3. 将工具执行和环境观察接入循环，再研究搜索、规划与多步训练。
4. 用合成轨迹、组相对奖励和稳定的 RL 训练改进策略。
5. 把方法放到代码与深度研究系统中，用任务跨度、工作质量和证据检验结果。
6. 继续研究多样性、元验证、任务生成、持续学习与推理效率。

建议具备基本的机器学习、语言模型与概率知识，再沿录像顺序学习。对工具接口、Harness 和系统搭建感兴趣，也可以结合 [CMU 11-768 的工具调用笔记](/wiki/cmu_11_768/tool_use.html)对照阅读。

## 课程目录

官方课表包含 20 次安排，公开录像采用独立的 Part 编号。下表分别列出两种编号：Part 7、8、9 对应课表第 8、17、20 次课。目录以本次这 9 个公开录像单元为范围。

| 录像 | 官方课表 | 日期 | 主题与笔记 | 视频 |
| --- | --- | --- | --- | --- |
| 01 | 01 | 2025-09-22 | [课程概览](/wiki/cs329/course_overview.html)<br>Course Overview | [B 站](https://www.bilibili.com/video/BV1saWJ6xEhm/) · [官方录像](https://www.youtube.com/watch?v=6YnLB0XbTnI) |
| 02 | 02 | 2025-09-26 | [推理时计算扩展](/wiki/cs329/test_time_compute_scaling.html)<br>Test-Time Compute Scaling | [B 站](https://www.bilibili.com/video/BV1ZmWJ6LEb1/) · [官方录像](https://www.youtube.com/watch?v=-Ggc37xLj_Y) |
| 03 | 03 | 2025-09-29 | [鲁棒验证](/wiki/cs329/robust_verification.html)<br>Robust Verification | [B 站](https://www.bilibili.com/video/BV17mWJ6LEHt/) · [官方录像](https://www.youtube.com/watch?v=p7TdPUcPoik) |
| 04 | 04 | 2025-10-03 | [利用工具与代码反馈学习](/wiki/cs329/learning_from_feedback_with_tools_and_code.html)<br>Learning from Feedback with Tools/Code | [B 站](https://www.bilibili.com/video/BV17mWJ6LE7y/) · [官方录像](https://www.youtube.com/watch?v=Lxh9RF5S-K0) |
| 05 | 05 | 2025-10-06 | [规划与多步推理](/wiki/cs329/planning_and_multi_step_reasoning.html)<br>Planning and Multi-Step Reasoning | [B 站](https://www.bilibili.com/video/BV1qUWJ6yEgL/) · [官方录像](https://www.youtube.com/watch?v=Ml_fp9XkB8Y) |
| 06 | 06 | 2025-10-10 | [训练时扩展与强化学习](/wiki/cs329/train_time_scaling_and_reinforcement_learning.html)<br>Train Time Scaling/Scaling RL | [B 站](https://www.bilibili.com/video/BV1iUWJ6yEdr/) · [官方录像](https://www.youtube.com/watch?v=yVnmHSAy3ck) |
| 07 | 08 | 2025-10-17 | [自我改进与深度研究智能体](/wiki/cs329/self_improvement_and_deep_research_agents.html)<br>Self-Improvement and Deep Research Agents | [B 站](https://www.bilibili.com/video/BV1jUWJ6yEUP/) · [官方录像](https://www.youtube.com/watch?v=Uni9dqyuuDM) |
| 08 | 17 | 2025-11-17 | [智能体评估与长时程任务](/wiki/cs329/agentic_evaluations_and_long_horizon_tasks.html)<br>Agentic Evaluations & Long-Horizon Tasks | [B 站](https://www.bilibili.com/video/BV1fyWJ67E9K/) · [官方录像](https://www.youtube.com/watch?v=8JAqLnTaZu4) |
| 09 | 20 | 2025-12-05 | [未来研究方向](/wiki/cs329/future_research_areas.html)<br>Future Research Areas | [B 站](https://www.bilibili.com/video/BV1EyWJ67EUH/) · [官方录像](https://www.youtube.com/watch?v=AyO6wyu4DEg) |

## 怎样对照原课复习

笔记中的截图下方标注原视频时间，并链接到对应位置。补充解释、公式的简化表达和自行整理的 Mermaid 图，会在相关段落说明；课堂中的历史实验结果，应连同模型、数据集、验证条件和计算预算一起理解。

课程原本还安排了三次作业与研究项目。自学时可以围绕一个具体问题设计实验，例如固定调用预算比较不同候选选择器，分析多步任务里的失败恢复，或检查研究报告的引用支持。先建立可复现基线，再评估改动带来的收益。

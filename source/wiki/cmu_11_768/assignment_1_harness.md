---
layout: wiki
wiki: cmu_11_768
order: 025
title: Assignment 1：搭建智能体 Harness
date: 2026-09-10 08:00:00
banner: /assets/banner/banner_5.jpg
---

## 项目目标

在开源 LLM 之上实现一个可复用的智能体 Harness，完成工具调用、上下文管理和跨领域复用。本项目是课程“构建 → 评测 → 训练”实践主线的起点。

## 项目结构

### Part 1：Coding Agent

- 实现消息构造、ReAct 主循环和工具调用分发。
- 实现遵循 Agent Skills 规范的技能加载机制，通过渐进式披露控制上下文。
- 在隔离沙箱中完成代码修改任务并生成补丁。

### Part 2：Context Compaction

- 从历史轨迹中生成工作记忆，保留目标、进度、证据与失败经验。
- 比较开启和关闭上下文压缩时的任务结果与 Token 消耗。
- 分析压缩率、信息损失、成本和任务成功率之间的取舍。

### Part 3：Chess Agent

- 复用同一套智能体循环完成象棋任务。
- 实现 UCI 走子、无状态局面模拟与程序化工具调用。
- 完成模型与合法走法提示的 `2 × 2` 消融实验。

## 验收清单

- [ ] 智能体循环能够处理工具调用、工具结果和可恢复错误。
- [ ] 模型生成的代码只在隔离沙箱中执行。
- [ ] 上下文压缩实验包含统一任务、结果和 Token 统计。
- [ ] 象棋智能体只提交一个真实动作，其余搜索动作保持可回滚。
- [ ] 实验结论由轨迹、日志和结果支持。

## 参考资料

- [Assignment 1: Build an Agent Harness](https://github.com/cmu-agents/assignment-1)
- [课程 Assignments](https://www.cmu-agents.com/#/assignments)
- [课程 Schedule](https://www.cmu-agents.com/#/schedule)
- [meng shao：CMU 秋季新课 AI Agents](https://x.com/shao__meng/status/2097496946877636655)

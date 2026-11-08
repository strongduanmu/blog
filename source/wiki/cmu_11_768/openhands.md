---
layout: wiki
wiki: cmu_11_768
order: 015
title: OpenHands：框架设计与软件开发自动化
date: 2026-10-08 08:00:00
banner: /assets/banner/banner_15.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=117476348204668&bvid=BV1hNni6MEw3&cid=42912776787&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站观看第 14 讲](https://www.bilibili.com/video/BV1hNni6MEw3) · [官方课件](https://www.cmu-agents.com/slides/lecture-14-openhands.pdf)

## 从产品演示理解智能体框架

第 14 讲由 Graham Neubig 于 2026-10-08 授课。Graham 结合建设 OpenHands 的经历，先演示产品，再回顾发展过程，介绍 SDK、单智能体与多智能体、部署界面和软件开发自动化。本文按视频顺序整理，代码接口以本讲课件版本为准。

开场的 Agent Canvas 有两类入口：用户在聊天中提出当前任务，以及为重复工作设置 automation。Graham 现场输入查找 OpenHands 仓库中自己的未完成 PR、整理今天需要处理的工作，随后展示模型切换、MCP 和技能等配置。

![OpenHands Agent Canvas 中输入 PR 整理任务](/wiki/cmu_11_768/openhands/agent-canvas-demo.png)

*原视频截图：[01:40](https://www.bilibili.com/video/BV1hNni6MEw3/?t=100)。*

演示中的 daily workflow preparation 整理待办信息；software factory 则连接 issue 分类、PR 审查和依赖维护等重复工作。前者仍以用户当下交互为中心，后者更依赖稳定触发、权限和结果检查。

## 从代码补全走向完整任务

课程回顾 2023 年以前以函数生成和人工执行为主的代码工具，再讲 SWE-bench 将真实 issue 与仓库快照、补丁和测试连接起来。Devin 的 2024 年演示推动了完整软件工程智能体的关注，随后社区共同建设 OpenDevin，逐渐发展为 OpenHands。

早期系统把前端、agent 和 Docker 沙箱连在一起，SWE-agent 与 CodeAct 等工作探索 agent-computer interface。后续进步来自更强模型，也来自工具、测试环境、上下文和恢复机制。到了产品部署，长时间运行、中断、并行任务及结果检查成为额外需求。

## SDK 中的对象怎样配合

`LLM` 保存模型配置，`Agent` 组合模型、终端、文件编辑器和任务跟踪器；`Conversation` 连接任务消息、事件与执行循环；`Workspace` 提供文件和运行环境。它们组成 GUI、CLI 与集成入口可以复用的基础。

![Conversation 连接 agent、工作区与任务消息](/wiki/cmu_11_768/openhands/conversation-workspace.png)

*来源：[官方课件第 15 页](https://www.cmu-agents.com/slides/lecture-14-openhands.pdf#page=15)。*

自定义工具需要有类型的 Action、实际 Executor 和模型可读的 Observation。例如 grep 工具的输入是模式与路径，输出是匹配结果。接口约束与真实执行分开，方便接入具体环境。

### 会话持久化与工作区持久化

保存相同会话 ID 和 storage，可以恢复事件与会话状态；文件和运行进程是否存在，则由 Workspace 生命周期决定。只恢复消息而没有恢复文件，模型记忆中的成功修改可能已不在环境中。

上下文管理可以使用 condenser，把较旧事件变为摘要，保留原始指令和近期工作；细节可能丢失，因此仍需文件和测试证据。DockerWorkspace 在远端环境运行 Agent Server，使用相近的会话接口。Action confirmation 在执行前暂停，向人展示待执行动作，拒绝后让模型修订计划。

![会话 ID、事件存储与工作区的持久化边界](/wiki/cmu_11_768/openhands/conversation-persistence.png)

*来源：[官方课件第 17 页](https://www.cmu-agents.com/slides/lecture-14-openhands.pdf#page=17)。*

## 单智能体基线与有目的的分工

Graham 先回顾固定 Manager、复现、定位、编辑、验证等角色的设计，再提出单智能体基线：同一个 agent 连续完成这些活动，可以共享上下文，减少交接和维护。

较少的通用工具也能产生很多组合：编辑源码、配置和文档，运行搜索、依赖和测试，浏览资料和视觉检查。技能为同一 agent 按需添加项目约定与重复流程；它并不必然对应另一个独立执行体。MCP 则连接外部工具，同时引入服务访问和信任边界。

![并行工作、独立审查与成本控制中的分工](/wiki/cmu_11_768/openhands/division-of-labor.png)

*来源：[官方课件第 28 页](https://www.cmu-agents.com/slides/lecture-14-openhands.pdf#page=28)。*

多 agent 适合有明确作用的地方，例如独立 issue 或仓库并行、让另一执行体审查补丁，或将适合的任务交给较便宜模型。收益需要扣除任务拆分、上下文交接和协调成本。OpenHands-Versa 则说明同一通用工具基础也能覆盖研究和办公工作。

## 执行位置与交互方式是两条轴

本地执行容易使用已有文件和服务，但受电脑可用性影响；云端可持续工作，却要准备仓库、依赖和凭证。IDE、专门 GUI、CLI 和工作渠道集成可以分别搭配本地或云端，不能把“CLI”等同于“本地”。

GUI 可以围绕任务展示运行进度、预览、diff 和批准；CLI 便于终端与脚本；issue、PR 和聊天集成把任务放回既有工作流。课件中的用户研究指出，主动投入减少后，理解结果与监督的需要仍然存在。

## 将重复开发工作接成自动化

![从触发事件到可检查产物的 automation](/wiki/cmu_11_768/openhands/automation-run.png)

*来源：[官方课件第 39 页](https://www.cmu-agents.com/slides/lecture-14-openhands.pdf#page=39)。*

一次 automation 接收 issue、PR 或定时事件，取得仓库、指令和权限，在隔离工作区执行，生成补丁、报告或评论，再由人或策略检查。Software factory 将问题分类、实现、独立代码审查和合并检查串联起来；合并检查需要针对当前提交，旧提交通过不能代表新版本已经通过。

最后的 SkillRefiner 从历史运行中分析技能问题、修订并在留出任务中比较。自动化要持续变好，需要保留任务、输出、验证和修订依据，而不只是定时启动同一段提示。

## 参考资料

- [官方第 14 讲课件](https://www.cmu-agents.com/slides/lecture-14-openhands.pdf)
- [OpenHands](https://github.com/OpenHands/OpenHands)
- [OpenHands Software Agent SDK](https://github.com/OpenHands/software-agent-sdk)

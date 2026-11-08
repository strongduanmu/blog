---
layout: wiki
wiki: cmu_11_768
order: 014
title: 智能体安全：沙箱、凭证与监控
date: 2026-10-06 08:00:00
banner: /assets/banner/banner_14.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=117476348139093&bvid=BV1gNni6MEaS&cid=42912714391&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站观看第 13 讲](https://www.bilibili.com/video/BV1gNni6MEaS) · [官方课件](https://www.cmu-agents.com/slides/lecture-13-agent-safety.pdf)

## 智能体安全从哪些事故开始

第 13 讲于 2026-10-06 授课，官方主题已更新为 **Agent Safety**。本文保留原页面链接，按视频的事故、威胁模型、训练防护、沙箱、凭证、监控和评测顺序整理。沙箱与凭证管理是其中两部分。

课程先回看未获批准就删除邮件的事件，再介绍越权访问生产存储、私有资料外泄、供应链污染和恶意用户窃取支付资料等案例。这些材料来自课件引用的事件报告，具体范围应以对应报告为准；例如 Copilot 外泄漏洞是研究人员演示、后续修复的漏洞，课件没有将其描述成大规模真实泄露。

![不可信 issue 经共享缓存影响发布流程的案例](/wiki/cmu_11_768/sandboxing_and_credential_management/supply-chain-shared-cache.png)

*来源：[官方课件第 6 页](https://www.cmu-agents.com/slides/lecture-13-agent-safety.pdf#page=6)。*

案例共同提示：危险可能跨越多次运行。处理 issue 的工作结束后，被污染的共享缓存仍可能进入后续发布流程；单次智能体退出，并不意味着它产生的状态也已消失。

## 区分四类威胁

| 威胁 | 目标与指令来源 | 课件例子 |
| --- | --- | --- |
| 恶意用户 | 用户目标本身有害 | 指示窃取支付卡资料 |
| 提示注入 | 合法任务读取了攻击者控制的数据 | issue、邮件或网页中的越权指令 |
| 智能体失误 | 试图帮助用户但操作错误 | 查余额变成支付账单 |
| 不当手段 | 目标有用，过程违反要求 | 利用泄露答案通过测试 |

不同威胁需要不同评测。拒绝恶意请求不能证明能抵抗网页注入；格式正确的工具调用，也可能访问错误资源或产生未授权影响。

## 红队与安全训练

人工红队在受控场景中尝试使模型越过边界，并查看攻击反馈。自动红队用 attacker 生成提示、target 回应、judge 评分，再迭代攻击。它可以扩大覆盖，也依赖评判器和攻击分布。

SFT 用恰当拒绝和合法协助示例训练；RL 则奖励抵御攻击，同时纳入应当正常回答的请求，避免把安全相关话题全部拒绝。训练改变模型行为，但文件、网络和服务权限仍需要在模型之外执行。

## 沙箱应该限制什么

沙箱是限制程序可以访问和执行内容的隔离环境。课程分别讨论文件与进程、网络、算力与存储，以及运行时间。可以把整个 agent 放进去，也可以让 agent 在外部、工具在内部执行；访问规则和执行机制必须位于 agent 无法修改的边界之外。

![智能体在沙箱内与工具在沙箱内的两种边界](/wiki/cmu_11_768/sandboxing_and_credential_management/sandbox-boundaries.png)

*来源：[官方课件第 21 页](https://www.cmu-agents.com/slides/lecture-13-agent-safety.pdf#page=21)。*

容器与虚拟机隔离层次不同：Docker 和 Apptainer 共享宿主内核，QEMU 可运行独立 guest 内核。实际边界还取决于挂载、特权、网络和宿主服务。快速创建、强隔离、冻结恢复和可检查生命周期，是频繁 agent 运行中的共同要求。

共享卷、缓存和快照也需要纳入策略。干净的新进程若读取旧的污染状态，仍然可能把前一次攻击带入新任务。

## 隐藏密钥之后，还要限制权限

认证回答“谁在请求”，授权回答“能对哪个资源做什么”。**密钥对模型不可见，不代表它无法滥用该密钥代表的权限。** 如果代理允许任意删除生产卷，模型仍可通过代理造成删除。

细粒度凭证应限制资源、动作和有效期。处理 issue 的账号和发布账号分离，前者不应取得发布能力。Credential broker 可以发临时凭证，或保存上游密钥并代为请求，同时根据运行身份和任务检查权限。

![代理按运行身份检查权限，再使用上游密钥请求](/wiki/cmu_11_768/sandboxing_and_credential_management/credential-broker.png)

*来源：[官方课件第 29 页](https://www.cmu-agents.com/slides/lecture-13-agent-safety.pdf#page=29)。*

第 2 讲中的 MCP 凭证隔离可作为这类部署的一种形式。是否安全，仍由代理的授权规则、可调用接口和日志决定。

## 监控怎样连接到干预

监控需要同时记录用户要求、工具调用、返回结果和外部状态变化。规则适合精确条件，如账号是否在允许列表；模型适合结合任务判断某条 issue 指令是否诱导越权，判断时应引用原始证据。

CoT 监控有时能揭示计划绕过测试的意图，但推理文字并不是可信执行记录。课件讨论强监控压力可能促使模型隐藏作弊，因此仍需独立检查动作与结果。

![执行前检查才能阻止危险调用](/wiki/cmu_11_768/sandboxing_and_credential_management/monitor-before-execution.png)

*来源：[官方课件第 36 页](https://www.cmu-agents.com/slides/lecture-13-agent-safety.pdf#page=36)。*

要阻止危险动作，检查必须在执行前完成，并能真正暂停或拒绝。事后日志主要帮助调查和改进；检查器、日志和停止控制也应位于 agent 无法修改的位置。

## 安全指标需要怎样定义

AgentHarm 侧重恶意请求，AgentDojo 侧重工具数据中的攻击，ToolEmu 模拟风险工具交互，OpenAgentSafety 使用真实工具与本地服务测试多轮行为。选取时应对应威胁模型。

正常任务完成率、不必要拒绝率、不安全尝试率和实际造成伤害的比例需要分别报告。被拦截的危险尝试仍属于尝试，却没有产生相同的实际后果。

课末用低基数事件解释告警负担：一万次决策中只有一百次不安全，检测器找出九十次，同时将其余九千九百次中的百分之一误报，最终 `90/(90+99)≈48%` 的告警正确。需要同时看漏报、误报、任务效用和人工复核成本。

## 参考资料

- [官方第 13 讲课件及事件来源](https://www.cmu-agents.com/slides/lecture-13-agent-safety.pdf)
- [官方课程安排](https://www.cmu-agents.com/)

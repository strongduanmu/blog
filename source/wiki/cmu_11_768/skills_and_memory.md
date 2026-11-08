---
layout: wiki
wiki: cmu_11_768
order: 005
title: 技能与记忆
date: 2026-09-03 08:00:00
banner: /assets/banner/banner_5.jpg
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=117245443315225&bvid=BV1GSYT6ZEb4&cid=41753117912&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站观看第 4 讲](https://www.bilibili.com/video/BV1GSYT6ZEb4) · [官方课件](https://www.cmu-agents.com/slides/lecture-04-memory-and-skills.pdf)

## 从重复任务中留下什么

第 4 讲由 Daniel Fried 于 2026-09-03 授课。上一讲关注单次长任务如何保存状态，本讲讨论跨任务复用：已经完成一次的工作，能否让下一次少走一些步骤？本文按视频与[官方课件](https://www.cmu-agents.com/slides/lecture-04-memory-and-skills.pdf)的顺序，整理人工编写的技能、外部记忆、技能归纳和维护。

课堂先比较两个购物任务：把 Sony 耳机加入愿望清单，以及查询无线键盘的价格范围。两者都需要进入商店、找到搜索框、输入词语并提交，最后几步才出现差别。可复用的结构可以表达为文本，也可以表达为代码；系统还要决定何时取出它、如何检验，以及什么时候修改或删除。

经验可以保存在上下文、外部文件或模型权重中。完整上下文忠实但昂贵；外部文件可读、可改、可迁移，但需要检索和维护；权重更新能改变广泛行为，却成本较高、难以直接检查。本讲主要讨论外部产物。

### Episode、Fact 与 Skill

| 形式 | 购物例子 | 适合保留的信息 |
| --- | --- | --- |
| Episode | 一次任务的全部观察与行动 | 商品、价格、具体执行过程 |
| Fact | 这个商店只在商品详情页展示价格 | 可重复使用、也可能过期的事实 |
| Skill | 搜索框输入 → 提交 → 打开结果 | 怎样执行一类任务 |

Memory 指从智能体自身交互中保存的内容；Skill 指关于如何行动的可复用知识。两者有交集：从自己的搜索经历中归纳出的技能，同时属于记忆。人写的发布清单可以是技能，却不来自智能体自身经历。

## 人工编写的技能怎样加载

Daniel 先用 Python 代码审查说明技能的用处。用户每次都重复 Black、Ruff、公开接口类型注解、Google 风格文档及测试要求，可以把这套约定放入一个技能目录，让后续审查按需加载。

![技能目录及渐进加载的三个层次](/wiki/cmu_11_768/skills_and_memory/authored-skill-package.png)

*来源：[官方课件第 9 页](https://www.cmu-agents.com/slides/lecture-04-memory-and-skills.pdf#page=9)。*

课件中的技能由 `SKILL.md`、脚本、参考文档和资源文件组成。渐进披露（progressive disclosure）先加载名称和描述，命中任务后读取正文，需要时再读取参考文件或执行脚本。脚本执行时通常只把结果放回上下文，无须把整个脚本源码都塞给模型。

课件以 Hermes 的技能索引及查看工具说明这一过程，并联系作业 1 的 `invoke_skill`。技能能否被选中，依赖描述是否准确、索引是否可见；加载正文后，还需要把步骤落实到实际工具操作。

### 有技能不一定更好

SkillsBench 包含 87 个任务、8 个领域，主实验由人提供整理好的任务与技能组合，在 18 个模型与 Harness 配置中比较。课件报告平均通过率从 33.9% 提高到 50.5%，但 13 个任务反而受损。聚焦、较短的技能组合与更大收益相关，这种相关性不能直接解释为“删短就会变好”。

技能可能覆盖模型原来更合适的策略。课堂因此把维护也放进讨论：OpenHands 的代码审查技能记录每次建议，由模型评估人类采纳情况，再分析反复出现的错误，如忽视仓库约定或放过严重问题，据此修订技能。技能文件是可版本管理的行为约定，需要通过后续任务验证效果。

## 外部记忆怎样读写和修正

随后课程介绍 MemGPT：智能体通过函数调用读写外部记忆，把有限上下文与外部存储连接起来。Mem0 的示意图则将新消息与已有记忆比较，选择 `ADD`、`UPDATE`、`DELETE` 或 `NOOP`。只追加不修正，容易让新旧偏好同时留在记忆中。

Reflexion 保存对尝试的反馈，再重试同一任务。课件中的问答要求的是一系列战役，第一次只回答一场战役；反思指出粒度不对，下一次改为相关战役序列的名称。这里有评价、反馈和再尝试，并没有更新模型权重。

ExpeL、Agent S、Synapse 和 ICAL 等工作还会保存完整轨迹，用 embedding 检索与新任务相近的经历，作为 few-shot 示例。这能保留具体行为，但长轨迹占空间，其中的固定页面元素也未必适合迁移。

## 从轨迹中归纳技能

课件接着把“搜索商品”视为任务中的一个可复用块。Voyager 在 Minecraft 中归纳函数并调用已有函数；DreamCoder 与 Stitch 从程序中压缩共同结构；LAPS 和 LILO 进一步结合自然语言和语言模型生成。它们共同关心怎样把已解决问题的结构转成未来可调用的知识。

在线归纳时，任务逐个到达，成功任务更新技能库，后续任务再使用它。评估应记录整个任务流的累计表现，因为前面的经验会改变后面的系统状态。

![技能学习、使用和维护的生命周期](/wiki/cmu_11_768/skills_and_memory/skill-lifecycle.png)

*来源：[官方课件第 25 页](https://www.cmu-agents.com/slides/lecture-04-memory-and-skills.pdf#page=25)。*

Agent Workflow Memory（AWM）从任务和动作中提取文本工作流。课件例子是搜索包含某个词的评论：先进入评论页面，输入关键词，再提交搜索。归纳时把具体词语替换成 `{term}`，保留可复用子过程，而不是复制整个任务。

### 文本技能与代码技能

文本技能是供模型理解和调整的指导。页面变了，模型仍可重新寻找搜索框；代价是每次仍需发出底层动作。代码技能则可以将多步操作压缩为一次函数调用，支持层次组合和运行前测试，但如果把旧页面 ID 写死，也会稳定地执行错误操作。

![文本工作流和代码技能的表达差异](/wiki/cmu_11_768/skills_and_memory/text-and-code-skills.png)

*来源：[官方课件第 29 页](https://www.cmu-agents.com/slides/lecture-04-memory-and-skills.pdf#page=29)。*

ASI 在归纳代码技能后加入测试与准入：任务结果是否正确，这次执行是否真正使用了候选技能？只有通过检查，才加入记忆。SkillWeaver 的例子展示了更具体的检查：函数声明 `color` 参数却没有使用，静态检查和试运行可以发现问题，再修改实现。

课件第 33 页比较五个 WebArena 站点上的平均结果：无记忆、文本技能、代码技能到达检查点的比例分别为 41.3%、59.5%、80.2%，平均步骤分别为 24.5、20.6、15.0。检查点达成率并非“全部任务成功率”，这些数字也只适用于该实验设置。

### 迁移为什么会失败

同一个 `sort_listings`，在一个网站上点击下拉框，在另一个网站上却要打开侧边栏。函数名相同并不意味着实现可以照搬。PolySkill 因而分离抽象接口与网站底层动作，组合逻辑依赖抽象方法，不同网站实现各自的原语。

选择存储形式，实际上是在分配决策：完整轨迹保留细节，文本把适配留给模型，代码则把更多行为固定下来。不能只比较文件大小或调用次数，还要考虑环境变化后由谁发现并修复错误。

## 技能怎样学习失败、选择和退役

后半段课程讨论 ReasoningBank 从成功与失败中提炼经验，以及技能检索、重复和干扰问题。失败经历需要说明失败原因与适用范围，否则“某次搜索没有结果”可能被错误归纳为普遍规则。

维护不仅包含增加新技能，还包括合并重复项、修复参数与行为、删除过期内容。若旧技能不断被优先检索，新策略也可能没有机会探索。技能数量增多以后，要评估的是完整检索与执行过程。

SAGE 把训练目标延伸到后续任务中的技能复用：第一项任务成功还不够，归纳出的技能也应帮助第二项任务。课件报告 AppWorld 特定设置下，面向成功复用的训练高于只奖励单次结果的配置。它说明技能质量需要在后续执行中验证，而非仅凭文件看起来合理。

课末讨论将人和智能体的责任展开：组织政策和规范由人提供意图与责任归属；可执行、低成本的结果检查适合自动化；涉及例外、风险和问责时仍需要明确维护者。一个技能从诞生到退役，都需要可观察的效果和修订依据。

## 参考资料

- [官方第 4 讲课件](https://www.cmu-agents.com/slides/lecture-04-memory-and-skills.pdf)
- [SkillsBench](https://arxiv.org/abs/2602.12670)
- [Agent Workflow Memory](https://arxiv.org/abs/2409.07429) · [Agent Skill Induction](https://arxiv.org/abs/2504.06821)
- [Reflexion](https://arxiv.org/abs/2303.11366) · [ReasoningBank](https://arxiv.org/abs/2509.25140)

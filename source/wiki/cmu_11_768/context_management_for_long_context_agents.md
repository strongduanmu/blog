---
layout: wiki
wiki: cmu_11_768
order: 004
title: 长上下文智能体的上下文管理
date: 2026-09-01 08:00:00
banner: /assets/banner/banner_4.jpg
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe src="https://player.bilibili.com/player.html?isOutside=true&aid=117245426604755&bvid=BV1hQYT64EXQ&cid=41753053659&page=1&high_quality=1&qn=120&quality=120&danmaku=0&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%;"></iframe>
</div>

[B 站高清观看：03 - Long Context Modeling for Agents](https://www.bilibili.com/video/BV1hQYT64EXQ)

## 课程信息

- 官网主题：Agent Capabilities 2: Context Management for Long-Context Agents
- 所属模块：智能体能力
- 授课日期：2026-09-01

## 学习重点

- 理解长任务中上下文窗口、KV Cache、延迟与成本之间的关系。
- 比较截断、摘要、压缩、检索与外部记忆等上下文管理方法。
- 分析 Prompt Cache、PagedAttention 和 RadixAttention 对智能体推理效率的影响。

## 核心问题

- 长上下文问题为什么同时是准确率问题和系统效率问题？
- 压缩历史时必须保留哪些任务状态、证据与失败经验？
- 如何设计实验衡量上下文压缩的收益和信息损失？

## 学习记录

- [ ] 看完课程视频或完成对应阅读。
- [ ] 整理本讲的核心概念、方法与系统结构。
- [ ] 记录关键实验、评测指标和失败案例。
- [ ] 补充一个能够动手验证的实现或复现实验。

## 参考资料

- [课程 Schedule](https://www.cmu-agents.com/#/schedule)
- [课程 Slides](https://www.cmu-agents.com/slides/lecture-03-long-context.pdf)
- [课程 Video](https://www.youtube.com/watch?v=AiwCCvFW1uE)
- [B 站视频](https://www.bilibili.com/video/BV1hQYT64EXQ)
- [MemGPT](https://arxiv.org/abs/2310.08560)
- [PagedAttention / vLLM](https://arxiv.org/abs/2309.06180)
- [SGLang / RadixAttention](https://arxiv.org/abs/2312.07104)

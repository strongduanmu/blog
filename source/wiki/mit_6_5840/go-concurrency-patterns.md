---
layout: wiki
wiki: mit_6_5840
order: 006
title: Go 并发模式：状态、调度与通信
date: 2026-11-17 22:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频（2021 年公开录像）

<div class="youtube-video" style="position:relative;width:100%;aspect-ratio:16 / 9;margin:1rem 0;">
  <iframe title="MIT 6.824 2021 · Go 并发模式：状态、调度与通信" src="https://www.youtube-nocookie.com/embed/IdCbMO0Ey9I" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
</div>

## 并发结构如何帮助组织状态

Russ Cox 的 2026 年 slide 从并发与并行的区别进入：并发用于组织能够独立推进的活动，并行描述多个计算同时执行。即使只用一个 CPU，goroutine 与 channel 也可以帮助表达状态机、等待和通信。

开头的字符串解析示例逐步把显式 `state` 转换为顺序执行的解析代码。goroutine 在读取输入时暂停，程序计数器本身就保存了解析位置。这样可以减少手工维护的状态，但仍需处理停止、错误和资源回收。

## 发布订阅：慢消费者不能被忽略

发布订阅服务需要管理订阅集合、分发事件和取消订阅。用 Mutex 保护 map 很直接，但如果持锁向一个慢消费者发送，其他发布、订阅和取消操作也会被阻塞。换成事件循环后，集合可以由一个 goroutine 独占，慢消费者问题却仍然存在。

面对慢消费者，slide 列出三类选择：减慢事件生产、丢弃事件，或者排队。无界队列把等待变成内存增长，需要先明确服务愿意承受的积压，而不是只看到发送不再阻塞。

![Go helper 在输入结束后继续排空队列，并最终关闭输出](/wiki/mit_6_5840/go-concurrency-patterns/queue-and-channel-close.webp)

排队 helper 用 `nil` channel 控制 `select` 中的可选分支。没有待发送数据时，让输出分支不可选；输入关闭后停止接收，继续发完已有队列，最后关闭输出。关闭的输入如果没有处理好，会不断返回零值，使循环忙转或制造无效事件。

## 工作调度器：任务完成与 worker 退出

第二个模式从任务分配发展到动态 worker 和失败重试。工作队列保存尚未完成的任务，成功执行才计入完成，失败任务重新进入队列。完成数必须对应任务，不能把“已经派发”当作“已经完成”。

![工作调度器为接收新 worker 的 goroutine 增加退出通道](/wiki/mit_6_5840/go-concurrency-patterns/scheduler-goroutine-exit.webp)

当主流程只负责发送任务，却没有及时接收完成消息时，worker 可能卡在发送完成通知，无法领取后续任务，形成相互等待。缓冲可以改变阻塞位置，却仍需根据协议解释容量为什么足够。

所有任务完成后，等待新服务器的 goroutine 也应有退出路径。slide 特别强调逐个检查 goroutine 的生命周期：谁创建它、它在等什么、正常结束和失败结束分别由谁通知。

## 副本客户端：等待慢服务与继续尝试

第三个模式把 RPC 放入 goroutine，通过 timer 决定何时尝试另一台副本。某个回复先到达后，调用者可以返回，但之前发出的 RPC 仍可能完成，因此结果 channel 的容量与接收方退出时机要一起设计，避免后台 goroutine 永久阻塞。

![副本客户端保存优先服务器，并在超时后继续尝试其他副本](/wiki/mit_6_5840/go-concurrency-patterns/replicated-client.webp)

优先服务器编号用短临界区读写，远程调用不在这把锁里执行。Mutex 与 channel 可以配合使用，选择依据是状态和控制流是否清楚。该模式负责尝试副本，并不自动提供请求去重或业务上的执行次数保证。

## 协议复用器：先登记，再发送

最后一个模式在共享连接上复用多个调用。每个请求带 tag，`pending[tag]` 指向等待该回复的 channel。接收循环按 tag 找到调用方，发送循环保证底层不允许并发的 Send 被串行执行。

登记 pending 必须先于发送，否则快速回复可能在登记前到达。与此同时，等待回复时不能长期持有保护 pending 的锁，否则接收循环无法取出登记项。这个例子把本讲贯穿的两个问题放在一起：共享状态由谁保护，每一次阻塞通信又依赖谁继续推进。

## 参考资料

- [Go patterns](https://pdos.csail.mit.edu/6.5840/notes/Go-MIT6824-2026.pdf)
- [论文讨论 FAQ](https://pdos.csail.mit.edu/6.5840/papers/go-faq.txt)
- [The Go Programming Language and Environment](https://doi.org/10.1145/3488716)

---
layout: wiki
wiki: cmu_15_721
order: 014
title: 数据库网络协议
date: 2024-03-13 08:00:00
banner: /assets/banner/banner_4.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="youtube-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="CMU 15-721：数据库网络协议课程视频" src="https://www.youtube-nocookie.com/embed/0tfDldfzlR8" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 应用接口与网络协议是两层问题

应用程序可以通过 ODBC、JDBC 或数据库专用库访问数据库。ODBC 和 JDBC 提供统一的调用接口，由驱动把连接、执行、取结果等操作翻译成具体数据库支持的通信方式。

Wire Protocol 决定客户端与服务器在线路上传输什么消息，包括认证、请求、结果、类型和错误。兼容某个协议可以复用驱动，但完整兼容还涉及 SQL 方言、目录与类型行为，不能只做到报文能够收发。

JDBC 驱动可以桥接 ODBC、通过 JNI 调用本地 API、经由中间层转换协议，或直接用 Java 实现数据库协议。课程列出这些实现，是为了说明统一 API 背后仍然有不同的计算与通信路径。

## 查询结束后，数据传输仍可能很慢

数据库执行查询、序列化结果、通过网络发送，客户端再反序列化成应用对象。即使扫描和连接很快，逐行解码、字符串转换和内存复制也可能限制端到端吞吐。

![不同结果传输方式的吞吐对照](/wiki/cmu_15_721/networking_protocols/data-export-throughput.webp)

课件中的实验把约 7 GB 的 TPC-C `ORDER_LINE` 数据交给客户端，比较传统 PostgreSQL、批量传输、Arrow Flight 和 RDMA 路径。图中的吞吐差异说明结果传输可以成为主要瓶颈；它们属于具体实验配置，不代表这些协议在所有负载上的固定排名。

## 协议的布局、编码与字符串表示

行式消息便于逐条访问，列式或批次消息更接近 DataFrame 与矩阵分析程序的输入。使用列式接口可以减少“服务器按行编码、客户端再按列重组”的重复工作。ADBC 提供面向 Arrow 数据的数据库连接接口，是课程讨论的相关方向。

二进制编码减少数值与文本之间的转换，但要协商类型、字节序和格式；文本编码更直观，却可能增加体积和解析成本。通用块压缩容易复用现有库，字典、Delta、RLE 等列编码则利用相同类型和重复值的结构。

字符串可以使用结束符、长度前缀或固定宽度。结束符需要扫描才能找到边界；长度前缀便于跳过值，但增加元数据；固定宽度寻址简单，长度差异大时会浪费空间。布局与编码选择要和客户端最终需要的数据结构一起评估。

## 减少网络路径上的系统开销

传统网络路径涉及系统调用、线程调度、协议栈处理和缓冲区复制。DPDK 让应用更直接管理网卡收发与缓冲区；RDMA 提供访问远端已注册内存的能力，但双方仍需设计地址、权限、同步与生命周期。

![用户态与内核态之间的数据路径](/wiki/cmu_15_721/networking_protocols/user-bypass.webp)

`io_uring` 通过提交与完成队列组织异步 I/O，使应用批量提交请求、获取完成事件。它仍然与内核协作，应当把“减少系统调用和复制”与“完全绕过内核协议栈”区分开；具体是否零拷贝也取决于操作与运行条件。

另一条方向是 User-Bypass：把适合的短期 I/O 处理逻辑移到内核中，减少反复进入用户态的开销。课程中的 Tigger 使用 eBPF 研究数据库代理路径，适用范围与通用数据库执行器不同。

## 客户端同样可以并行加载

ConnectorX 从客户端侧划分读取范围，让多个线程直接填充 DataFrame 数组，减少逐行对象的构造与中间表示转换。

这把问题重新落回整条链路：优化 SQL 执行器、改变网络编码、减少内核交互和优化客户端装载，都可能改善结果获取速度。测量时应说明返回多少行、多少字节、转换成什么结构，以及各阶段分别花了多少时间。

## 参考资料

- [官方课件：第 12 讲](https://15721.courses.cs.cmu.edu/spring2024/slides/12-networking.pdf)
- [官方课程笔记：第 12 讲](https://15721.courses.cs.cmu.edu/spring2024/notes/12-networking.pdf)
- [Don't Hold My Data Hostage: A Case for Client Protocol Redesign](https://15721.courses.cs.cmu.edu/spring2024/papers/12-networking/p1022-muehleisen.pdf)
- [ConnectorX: Accelerating Data Loading From Databases to Dataframes](https://15721.courses.cs.cmu.edu/spring2024/papers/12-networking/p2994-wang.pdf)
- [Tigger: A Database Proxy That Bounces With User-Bypass,](https://15721.courses.cs.cmu.edu/spring2024/papers/12-networking/p3335-butrovich.pdf)

---
layout: wiki
wiki: tsinghua_database
order: 023
title: GaussDB 简介
date: 2024-03-18 08:30:00
banner: /assets/banner/banner_11.jpg
katex: true
mermaid: true
---

## 课程视频

<div class="bilibili-video" style="position: relative; width: 100%; aspect-ratio: 16 / 9; margin: 1rem 0;">
  <iframe title="清华数据库：GaussDB 简介课程视频" src="https://player.bilibili.com/player.html?isOutside=true&bvid=BV15u4y1Q71R&cid=1268809586&page=22&high_quality=1&danmaku=0&autoplay=0" loading="lazy" scrolling="no" frameborder="no" allowfullscreen="true" style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0;"></iframe>
</div>

## 用系统案例串起课程组件

本讲按照课件介绍 GaussDB 的总体架构、单机引擎、分布式事务、云原生、高可用、安全和智能能力。以下记录对应课程所展示的架构与版本，openGauss 单机示例和 GaussDB 分布式示例分别理解，不将不同形态的组件视为所有部署都同时具备的配置。

![课件中的 GaussDB 总体技术架构](/wiki/tsinghua_database/gaussdb/system-architecture.webp)

协调节点接收请求并规划、分发工作，数据节点执行本地操作，全局事务相关组件协调跨节点状态。存算分离示例还引入共享缓存和共享存储，使页面、日志与计算能够按不同职责管理。

## 查询优化与执行

课件依次介绍规则重写、代价优化与学习辅助优化。代价包含页面 I/O、元组处理 CPU 和跨节点通信，统计信息包括表行数、页数、不同值数、NULL 比例、高频值、直方图与多列统计。

候选路径需要同时考虑扫描、连接、分布和并行属性。课程所述路径搜索结合自底向上与关系较多时的随机化方法，不能将某一种算法的理想最优性直接等同于整个优化器的保证。

执行器结合火山、批量向量、线程及节点并行，并在适合的位置使用 LLVM 专门化。并行路径也要支付启动、数据分发和结果汇聚成本，是否选择由完整计划成本决定。

## 行存、版本与缓冲区

行存页面采用页头、行指针和从页面尾部增长的记录，空闲空间结构帮助插入定位。B-link 风格链接与上界支持索引并发访问，缓冲区通过分区管理结构、冷热策略和扫描 Ring 减少竞争与缓存污染。

追加更新将新旧记录放在表空间中，原位更新形式则把当前记录留在数据段，利用 Undo 区域保留历史。可见性需要结合版本边界与事务状态，不能只看某个事务号大小。

![原位更新通过回滚段保存历史版本](/wiki/tsinghua_database/gaussdb/undo-version-storage.webp)

日志与备机回放也有并行路径。多个回放任务可以处理不同页面，但提交次序、读快照推进和版本清理必须保持一致，不能让副本读到不完整事务。

## 列存、内存与 HTAP

列存以 CU 为压缩单元，CUDesc 保存位置、数量、范围、编码及事务相关元数据。范围摘要帮助跳过不匹配 CU，Delta 区域接收较小更新，再合并到压缩主体。

内存引擎强调记录指针、私有事务状态与适合内存的索引。HTAP 示例通过行列转换和统一代价决策组合执行，同时维护数据同步与新鲜度。

## 分布式与云原生

分布式事务需要安排全局时间戳、参与者访问和原子提交。分布式优化器在本地算子之外选择 Gather、Broadcast、Redistribute 等数据交换。

共享存储使数据分片责任与物理字节位置可以分别管理。课件还展示了收集副本回放进度、计算全局一致性点，再把读取送到满足条件的副本，以实现读负载分担；不能仅选一个空闲副本就忽略其追赶位置。

## 高可用、安全与智能

多副本、同城双集群、两地三中心与异地多活分别针对不同故障范围。物理日志与逻辑复制的粒度不同，逻辑传播还要保持冲突事务和提交依赖。

安全部分联系认证、角色或标签授权、审计、加密、脱敏和防篡改。智能部分则展示多列分布建模、计划选择、参数和索引推荐，以及库内模型训练、推理。

![自治运维平台的数据采集、模型与服务层](/wiki/tsinghua_database/gaussdb/autonomous-management.webp)

这些能力把前面的算法放回实际系统：新的执行方式仍需要统计与路径选择，新存储仍需要版本和恢复，智能建议也需要正确性验证和运行约束。课件中的性能数字只用于理解其展示场景，不推广为所有查询的固定收益。

## 参考资料

- [第 15 章官方课件](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses/slides15.pdf)
- [李国良教授课程主页](https://dbgroup.cs.tsinghua.edu.cn/ligl/courses_cn.html)

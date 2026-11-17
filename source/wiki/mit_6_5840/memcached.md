---
layout: wiki
wiki: mit_6_5840
order: 017
title: Memcached：缓存扩展与一致性
date: 2026-11-17 22:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频（2021 年公开录像）

<div class="youtube-video" style="position:relative;width:100%;aspect-ratio:16 / 9;margin:1rem 0;">
  <iframe title="MIT 6.824 2021 · Memcached：缓存扩展与一致性" src="https://www.youtube-nocookie.com/embed/eYZg0YJtFEE" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
</div>

## 缓存首先是在保护数据库

Facebook 的 Memcache 论文围绕读多写少的大型网站展开。数据库保存持久记录，Memcached 在内存中缓存热点数据，Web 服务器自行访问两者。缓存命中率降低一点，数据库承受的请求却可能成倍增加：从 99% 命中降到 98%，未命中流量就翻倍。

![look-aside 缓存在未命中时回源，写入时删除缓存](/wiki/mit_6_5840/memcached/lookaside-cache.webp)

读路径先查询缓存，miss 后读数据库并回填。写路径先更新数据库，再删除缓存中的旧条目。缓存并不自己理解业务查询，因此回填值可能是多个记录计算出的结果，而不只是一条数据库行。

## 为什么写后删除，而不是写后更新

两个客户端并发更新同一个 key 时，数据库和缓存可能以不同顺序收到请求。如果都把自己的值写入缓存，缓存最终值可能永久落后于数据库。删除不携带某个具体旧值，较容易避免这种相互覆盖。

但删除仍然不能解决所有竞争。C1 miss 后读到 v1，C2 随后把数据库更新为 v2 并删除缓存，C1 最后回填 v1，旧值又重新出现。一次已经执行的删除，无法阻止未来到达的旧回填。

## Lease 同时控制回填和惊群

缓存 miss 时发给客户端一个 lease token，只有持有有效 token 的回填才被接受。C2 的删除会使旧 token 失效，因此 C1 迟到的 v1 不再写入。

同一个 key 大量并发 miss 时，系统也可只允许少量持有 lease 的请求回源，其他请求稍后重试，降低 thundering herd 对数据库的冲击。这种 lease 是缓存回填许可，不应直接等同于 GFS 中任职 primary 的时间租约。

## 分片、复制与区域池

![不同 region 具有数据库副本和多个前端缓存集群](/wiki/mit_6_5840/memcached/regional-architecture.webp)

分片节省缓存空间，但一次页面请求可能要向很多服务器获取 key，引发大量小包和 incast。复制把客户端分到不同缓存集群，可以分散热点与网络压力，却消耗更多内存。

论文混合使用两种方式：热门数据在多个集群中缓存，低频数据放到区域共享池，避免不必要地复制冷对象。批量请求和窗口控制也帮助限制同时返回的数据量。这里的性能瓶颈不仅是总带宽，还包括包处理、连接和缓冲区压力。

新缓存集群从空状态启动时，不能让所有 miss 一起冲向数据库，于是先从已有集群获取数据预热。单台缓存服务器失败时，备用 gutter 池临时接住请求，避免把一次缓存故障放大成数据库过载；它以较短过期时间限制残留数据，而不是无条件接收所有常规失效广播。

## 跨 region 的旧数据问题

论文架构中，更新进入主 region 数据库，再异步复制到其他 region。失效消息还要与数据库副本的应用进度协调，否则刚删缓存就可能从尚未追上的本地数据库读回旧值。

论文的 remote marker 机制帮助写入客户端在远端复制尚未追上时避开旧副本。它改善读己之写等体验，不代表所有客户端的缓存读都变成线性一致。

本讲的一致性目标是控制旧值和不良竞态，放在允许短暂旧读的应用背景下。需要严格余额或权限判断时，应使用相应强度的权威存储协议，不能因为普通页面能容忍旧缓存，就把同一保证推广给所有业务。

## 参考资料

- [Cache Consistency: Memcached at Facebook](https://pdos.csail.mit.edu/6.5840/notes/l-memcached.txt)
- [Memcached at Facebook (2013)](https://pdos.csail.mit.edu/6.5840/papers/memcache-fb.pdf)
- [论文讨论 FAQ](https://pdos.csail.mit.edu/6.5840/papers/memcache-faq.txt)

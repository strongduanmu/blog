---
layout: wiki
wiki: mit_6_5840
order: 020
title: SUNDR：不可信存储与分叉一致性
date: 2026-11-17 22:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频（2021 年公开录像）

<div class="youtube-video" style="position:relative;width:100%;aspect-ratio:16 / 9;margin:1rem 0;">
  <iframe title="MIT 6.824 2021 · SUNDR：不可信存储与分叉一致性" src="https://www.youtube-nocookie.com/embed/FxwjSs_xSBM" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
</div>

## 数据有签名，为什么仍然可能被骗

SUNDR 面对的是不可信存储服务器：它可能被攻破，也可能主动向不同用户隐瞒更新。目标是完整性与可验证的历史关系，并不直接提供内容保密或保证服务永远可用。

哈希能够检测块内容是否改变，签名能够验证某个用户是否授权该内容，但服务器仍可返回旧的合法签名。讲义用代码补丁和 NEWS 文件说明危险：用户读到“漏洞已修复”的新公告，却拿到旧代码；两个文件各自验签通过，也不能保证它们来自兼容的历史。

## 先用签名日志建立直觉

简化方案让服务器保存全部操作日志，客户端读取并验证历史，再把自己的修改或读取追加进去。签名覆盖先前历史，客户端还在本地记住自己上次看到的位置，因此服务器不能悄悄删除它已经承认过的前缀。

读取也需要进入历史。否则某个客户端看过什么不会留下约束，服务器更容易事后编造与其先前观察不一致的解释。这个方案容易推理，却要求不断读取增长的日志，不适合实际文件系统。

## Fork consistency 不保证总能看到最新值

服务器仍可以把两个客户端分开，各自维护一条持续增长的合法历史。它不能在不被发现的前提下，把已经分叉的两段历史重新拼成一条：客户端签名和本地记忆会暴露缺失的前缀。

因此分叉可能持续存在，并不要求每个客户端立即检测到。用户若通过存储之外的可信渠道比较状态，就可能发现彼此的历史不同。SUNDR 限制的是攻击能够隐藏到什么程度，不是让不可信服务器自动恢复诚实。

## 用当前状态替代完整日志

![SUNDR 用哈希树和用户 handle 表示文件系统当前内容](/wiki/mit_6_5840/sundr/hash-tree-and-handles.webp)

实际设计按用户组织哈希树，目录指向 inode，inode 指向数据块，根哈希承诺整棵树。修改文件会产生新的相关节点和根值，客户端验证哈希路径即可检查读取内容。

单一可变根还要处理多用户权限。SUNDR 为用户保存各自的树与签名 handle，再通过受签名保护的版本结构描述它所看到的其他用户状态。

![签名版本结构同时绑定根哈希、版本号和其他用户版本](/wiki/mit_6_5840/sundr/signed-version-vector.webp)

版本向量中，每一项记录该客户端已观察到的某用户版本。例如 `(1,2,1)` 表示它观察过 A 的版本 1、B 的版本 2 和 C 的版本 1。签名防止服务器随意改写这组依赖。

## 用不可比较的向量识别隐藏历史

若 B 的历史包含 `(1,1,0)`，而 C 在未看到 B 更新的分支形成 `(1,0,1)`，这两组向量不能按逐项不下降的顺序合并。服务器如果随后让双方接触对方的后续更新，就会暴露缺失关系。

![服务器隐瞒更新后形成无法无声合并的签名版本分支](/wiki/mit_6_5840/sundr/forked-version-structures.webp)

这里的向量服务于签名历史的兼容性检查，不能简单等同于“版本号更大就是全局最新”。本讲按课程要求覆盖到论文 3.3.2 的串行化方案，后续并发 SUNDR 是进一步的协议优化。

原论文采用 SHA-1 等当年的密码组件。这里保留它们用于理解 2004 年设计，不能把历史算法选择直接当成新系统的安全实现建议；要复用的是完整性承诺、历史依赖和分叉可检测的设计思路。

## 参考资料

- [Fork Consistency, SUNDR](https://pdos.csail.mit.edu/6.5840/notes/l-sundr.txt)
- [SUNDR (2004)](https://pdos.csail.mit.edu/6.5840/papers/li-sundr.pdf)
- [论文讨论 FAQ](https://pdos.csail.mit.edu/6.5840/papers/sundr-faq.txt)

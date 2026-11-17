---
layout: wiki
wiki: mit_6_5840
order: 021
title: Bitcoin：工作量证明与分叉收敛
date: 2026-11-17 22:00:00
banner: /assets/banner/banner_2.jpg
katex: true
mermaid: true
---

## 课程视频（2021 年公开录像）

<div class="youtube-video" style="position:relative;width:100%;aspect-ratio:16 / 9;margin:1rem 0;">
  <iframe title="MIT 6.824 2021 · Bitcoin：工作量证明与分叉收敛" src="https://www.youtube-nocookie.com/embed/yB6m8EjAqPU" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;"></iframe>
</div>

## 签名解决所有权，却没有解决双花

Bitcoin 这一讲延续 SUNDR 的问题：如果参与者互不信任，如何对同一份公开历史达成一致？课程从一个带签名的转账链开始，说明只验证签名仍然不够。

![前一拥有者签名授权下一拥有者，并引用先前交易](/wiki/mit_6_5840/bitcoin/transaction-signatures.webp)

Y 可以对同一个尚未花费的输出，分别签名转给 Z 和 Q。两笔交易的签名都有效，两个收款方却不能同时接受它们。双花的核心是对冲突交易决定统一历史，而不是无法验证付款人是谁。

## 区块把交易放入共同日志

节点传播交易和区块，验证已有输出、签名及花费条件。区块头引用前一个区块的哈希，形成可检查的历史链，后续区块又承诺更早的前缀。

![工作量证明区块通过前驱哈希连接，并用 nonce 搜索有效结果](/wiki/mit_6_5840/bitcoin/proof-of-work-chain.webp)

工作量证明要求区块头的哈希满足难度目标。寻找合适 nonce 依赖大量尝试，验证找到的结果却很便宜。讲义用“前导零”帮助理解，严格说是哈希数值低于目标。

这不是一次请求必定消耗固定工作量的算法。每次尝试都有小概率成功，平均出块间隔受整体算力与难度调整控制，因此不能把某个时间间隔当成每块的确定完成时间。

## 开放成员为什么不能按机器数投票

任何人都可以加入网络，如果采用“一台机器一票”或“一个身份一票”，攻击者可以生成大量身份。工作量证明把影响力联系到计算工作，而不是可任意创建的网络身份。

课程的“诚实多数”也应理解为诚实算力占优势，不能只数在线节点数量。节点仍需要独立验证交易和区块；即使某条链包含大量工作，非法花费也不能仅凭工作量获得合法性。

## 临时分叉怎样收敛

不同矿工可能几乎同时找到有效区块，或因传播延迟在不同分支上继续计算。节点先沿自己知道的有效分支推进，随后转向累计工作量更多的有效链。把它简称为“最长链”时，需要保留累计工作量这个判断依据。

落在被放弃分支上的交易可能需要重新进入后续区块，也可能与主链交易冲突。交易出现在一个区块里，并不意味着像 Raft 已提交条目那样永远不会回退。

## 确认带来的是概率保证

交易后面累积越多工作，落后攻击者赶上的概率在相应诚实算力假设下越低。若攻击者控制足够算力，它可以重写自己的支付历史、制造审查或双花风险，但不能凭此伪造别人私钥对应的合法签名。

因此 Bitcoin 的最终性是概率性的，而且依赖网络传播、算力与攻击模型。课程讨论的出块时间、区块大小和奖励处于原论文及课堂背景，这里不把历史吞吐估算写成当前协议的固定性能参数。

## 与 SUNDR、Raft 的不同边界

SUNDR 允许服务器永久分叉用户，但要求重新合并时能被发现；Bitcoin 通过工作量竞争让开放网络倾向于一条共同历史；Raft 在已知成员、崩溃故障模型下，对提交条目提供不同形式的安全保证。

这些协议不能只用“都是日志”概括。成员由谁定义、坏节点能够做什么、何时可以对外确认，以及确认会不会回退，决定了它们适合的系统边界。

## 参考资料

- [Bitcoin](https://pdos.csail.mit.edu/6.5840/notes/l-bitcoin.txt)
- [Bitcoin (2008)](https://pdos.csail.mit.edu/6.5840/papers/bitcoin.pdf)
- [论文讨论 FAQ](https://pdos.csail.mit.edu/6.5840/papers/bitcoin-faq.txt)

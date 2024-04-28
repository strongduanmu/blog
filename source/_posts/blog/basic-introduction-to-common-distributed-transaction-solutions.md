---
title: 初探分布式事务常见方案及实现原理
tags: [Transaction, Distributed Transaction]
categories: [Transaction]
date: 2024-04-26 09:26:16
updated: 2024-04-28 07:26:16
cover: /assets/cover/distributed_transactions.png
banner: /assets/banner/banner_11.jpg
references:
  - '[MySQL 8.x XA 事务官方文档](https://dev.mysql.com/doc/refman/8.0/en/xa.html)'
  - '[Distributed Transaction Processing: The XA Specification](https://pubs.opengroup.org/onlinepubs/009680699/toc.pdf)'
  - '[分布式事务如何实现？深入解读 Seata 的 XA 模式](https://seata.apache.org/zh-cn/blog/seata-xa-introduce/)'
  - '[分布式事务：不过是在一致性、吞吐量和复杂度之间，做一个选择](https://mp.weixin.qq.com/s?__biz=MzI4MTY5NTk4Ng==&mid=2247489579&idx=1&sn=128c1ced738e205f0b9def9bc5ec6d51&source=41#wechat_redirect)'
---

## 前言

TODO

## 什么是分布式事务

### 基本定义



### 使用场景

随着互联网、金融等行业的快速发展，业务越来越复杂，一个完整的业务往往需要调用多个子业务或服务，随着业务的不断增多，涉及的服务及数据也越来越多越来越复杂。传统的系统难以支撑，出现了应用和数据库等的分布式系统。分布式系统又带来了数据一致性的问题，从而产生了分布式事务。

![分布式事务使用场景](basic-introduction-to-common-distributed-transaction-solutions/distributed-transactions-usage-case.png)

## 如何实现分布式事务

基于第一个强一致的思路，就有了基于数据库本身支持的协议，XA 分布式事务。XA 整体设计思路可以概括为，如何在现有事务模型上微调扩展，实现分布式事务。

> X/Open，即现在的 open group，是一个独立的组织，主要负责制定各种行业技术标准。 X/Open 组织主要由各大知名公司或者厂商进行支持，这些组织不光遵循 X/Open 组织定义的行业技术标准，也参与到标准的制定。





## 分布式事务常见方案

### XA 分布式事务




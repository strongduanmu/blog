---
title: VolcanoPlaner
tags: []
categories: []
date: 2022-07-25 19:32:33
cover: 
---

### VolcanoPlanner 基本概念

* RelSet：一组逻辑上相等的 Relation Expression。

> A RelSet is an equivalence-set of expressions; that is, a set of expressions which have identical semantics. We are generally interested in using the expression which has the lowest cost.
> All of the expressions in an RelSet have the same calling convention.

特点：

1. 描述一组等价 Relation Expression，所有的 RelNode 会记录在 rels 中；
2. have the same calling convention；
3. 具有**相同物理属性的 Relational Expression** 会记录在其成员变量 List **subsets** 中.
4. 成员变量 equivalentSet 记录了等价的 RelSet；

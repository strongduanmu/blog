---
layout: wiki
katex: true
wiki: cmu_11_768
order: 026
title: Assignment 2：设计智能体评测
date: 2026-09-10 08:00:00
banner: /assets/banner/banner_6.jpg
---

## 评测数据可视化智能体

本页依据[官方 Assignment 2](https://github.com/cmu-agents/assignment-2/blob/main/ASSIGNMENT.md)整理，核对时间为 2026-11-08。课程页列出的截止日期为 **2026-10-01**，占课程总成绩 15%，独立完成。本文是作业要求与实验设计笔记，尚未填写实际运行结果。

可视化 agent 接收数据和用户要求，生成图表。作业要求实现 validator：读取一个运行的任务、数据、轨迹和最终图片，判断结果是否可接受，并给出具体错误证据。评分时没有参考图、真实标签或其他候选运行供 validator 比较。

## 四类错误与评分口径

在 `validator/solution.py` 实现 `validate(run)`，返回错误列表；空列表表示可接受。错误类别固定为：

| 类别 | 要判断的内容 |
| --- | --- |
| `execution_failure` | 没有生成有效图表 |
| `wrong_data` | 画出的数据与要求不符 |
| `wrong_chart` | 图表设计不符合要求 |
| `hard_to_read` | 渲染后难以阅读 |

同一运行可能同时有多个错误。真实标签若是终止性的执行失败，该运行不进入其他三类的 TP/TN/FP/FN；validator 自己预测执行失败，并不能让它逃过其他类别评分。

每类作为二元问题计算 Matthews correlation coefficient（MCC），再无权重平均得到 macro-MCC：

$$
\mathrm{MCC}=\frac{TP\cdot TN-FP\cdot FN}
{\sqrt{(TP+FP)(TP+FN)(TN+FP)(TN+FN)}}
$$

负相关会得到负值，不能截成零。应同时检查各类分数及误报、漏报，避免总体分数掩盖某一类型失效。

## 从种子运行诊断 Validator

先检查公开的 seed agent 轨迹与标签，运行基线，结合任务、数据计算、代码和图片理解错误。在报告中给出假阳性与假阴性的具体证据，并解释验证器为什么会误判。

开发阶段使用官方指定的视觉模型，不允许替换为更强模型。改进可来自输入组织、规则、数值计算和有针对性的视觉判断，但不能把标签或参考答案送给评分时没有这些信息的 validator。

第二部分迭代后，保留对应预测文件和分数。比较时保持任务与评分口径一致，不要只展示最好的一次自然语言解释。

## 设计新任务，检查能否泛化

至少编写五个任务，覆盖至少两个 `task_class`，每个覆盖类别至少两个任务。每项任务由三个固定 agent 各执行一次，任务描述与输入确定后不要根据运行结果反向改题。

为每条运行人工复核标签，保持一次运行恰好一份标签，评分时对照最终图和实际轨迹。新任务应该探查种子集之外的能力，防止只围绕公开样例调整验证器。

## Harbor 包装揭示了什么边界

接着将每个新任务包装成 Harbor 环境，补充确定性 verifier 与 reference solution，并要求产出 `plot.py` 和 `plotted_values.json`。先运行官方示例的 oracle 与 nop，再验证自己的参考解能够得到一分。

确定性检查能直接核对计算值、标签和必要文件，却未必能识别很小的字体或糟糕布局。作业因此要求总共构造两个有意错误的 mutant：一个被 verifier 拒绝，得零；另一个确实错误却被漏过，仍得一分。

第二个 mutant 的意义是实测验证器边界。例如数值完全正确，但图小到无法阅读，数值断言仍可能通过。需要报告它错在哪里、实际奖励，以及哪个断言捕获或为什么没有捕获。这也说明 VLM 判断与确定性检查可以互补，但二者各自需要验证。

## 最后一次迭代与提交

利用新任务再做至少一次改进，同时在种子集与自建集上报告最终四类 MCC 和 macro-MCC，分析误报、漏报及相对旧版本的变化。最终私有集合可能包含新任务和图类型，因此不要把具体公开题目写死。

提交包含最终 validator、预测文件、任务与输入、三种 agent 的运行、人工标签、Harbor 环境及 mutant、LaTeX 报告源文件、PDF 和 `AI_USAGE.md`。官方完整结构检查为：

```bash
uv run python -m workflow check-submission
```

该检查覆盖结构和 Harbor 奖励合同，不替代人工标签正确性或报告质量。具体模型、文件格式及运行命令仍以当前官方作业文档为准。

## 参考资料

- [官方作业说明与评分要求](https://github.com/cmu-agents/assignment-2/blob/main/ASSIGNMENT.md)
- [官方课程作业入口](https://www.cmu-agents.com/#/assignments)

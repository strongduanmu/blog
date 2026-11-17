# 2026-11-09 搜索收录核验

通过现有 Chrome 登录后台核查。已收录、提交请求已接受、地图已提交分别记录；接受不代表已收录。未记录后台会话地址、凭证或原始页面树。

## 当前结论

| 范围 | Google 已收录 | Google 未收录 | Bing 已收录 | Bing 未发现 |
| --- | ---: | ---: | ---: | ---: |
| AI Wiki 共 38 页 | 27 | 11 | 33 | 5 |
| 其中 CMU 11-768 共 28 页 | 27 | 1 | 28 | 0 |
| 其中 CS329 共 10 页 | 0 | 10 | 5 | 5 |

AI Wiki 已完成 Google 和 Bing 的 38 页逐页检查。CMU 的 22 个有实质内容的正式页面全部被 Google 和 Bing 收录；Google 未收录的是仅含资料状态的“可观测性与监控”。六个材料占位页保留课程入口，不主动提交。

Google 全站目前已逐页核验 99/173：84 已收录、15 未收录，剩余 74 待核验。Google 随后明确提示本站 URL Inspection 的每日检查配额已耗尽，停止该平台检查；这与此前耗尽的 Request indexing 请求配额是两项不同限制。汇总报告仍显示最后更新 2026-10-23、175 已收录及 98 未收录，不能用这个旧分母替代当前 173 个规范地址。剩余地址未推断为已收录。34 篇博客与 7 篇便笺正文均核验已收录。新增的非 AI 未收录地址为 notes 目录（旧抓取 noindex）、topic 目录、C 语言目录和 C 语言介绍；四页当前 GET 200、canonical 正确、meta 与响应头均无 noindex，后续检查抓取刷新。C 语言介绍为正式笔记，待 Google 请求配额恢复后处理。

Bing 全站 Site Explorer 曾显示 Indexed 200、Error 0、Warning 25、Excluded 1，但含历史地址且无当前地图口径的逐页匹配，不作为本站 173 页的收录率。其他 135 个地址的 Bing 状态仍待核验。Chrome 前台持续切到其他浏览任务，已在确认前台变化时停止动作，避免对用户工作页面输入。

百度于本次后台复核：最新索引量日期 2026-11-07，全站 4 条。该总量不提供 AI 单页证据，38 个 AI 页面均保持收录待核验。

## 已执行的提交

- Google：CS329 目录及前六篇笔记共 7 个 URL 取得“Indexing requested / priority crawl queue”最终回执。“自我改进与深度研究”第八次请求收到明确 Quota exceeded，停止后续请求；该篇、智能体评估与未来研究方向共 3 个正式地址仍待后续日期配额，另有 C 语言介绍等待请求配额。
- Google：CMU SFT 和 Agent 入门在 11 月 8 日已接受请求，今天均核实已收录，未重复提交。CentOS 环境搭建博客也已核实收录。
- Bing：共 6 个 CS329 URL 取得明确 URL submitted successfully 或 Indexing requested 回执，其中稳健验证随后核实已收录；其余 5 个未发现页均已接受请求。首次界面显示当日额度 10000。
- 百度：CS329 目录 1 条、九篇笔记一批共 9 条，两个批次均出现“链接提交成功”，今日确认接受 10 个独立 URL。此前接受的两篇 CMU 笔记未重复提交。
- 百度：CMU 目录请求卡在验证码。用户当次明确要求尝试操作验证，尝试后仍未取得通过或提交成功回执，继续留队；不能记为当日限额。今日余量未显示，不沿用昨日的 0。
- Google sitemap.xml 重新提交，收到 Sitemap submitted successfully。提交前最后读取 2026-11-04、发现 163 页。
- Bing sitemap.xml 重新提交，界面 Last submit 2026-11-09、Processing；最后抓取仍为 2026-11-04、发现 163 页。未把 Processing 记为重新读取成功。

## 公开页面与地图验收

当前 sitemap.xml 共 173 个规范地址，包括全部 38 个 AI 页面。173 页均已在线验证返回 200，canonical 指向自身，无 meta noindex；这说明具备访问条件，不等于搜索引擎已经收录。没有修改页面正文、标题展示、广告配置或其他可见内容。

## AI 逐页结果

| 页面 | Google | Google 请求 | Bing | Bing 请求 | 百度请求 | 是否主动提交 |
| --- | --- | --- | --- | --- | --- | --- |
| [课程资料](https://strongduanmu.com/wiki/cmu_11_768/) | 已收录 | 未提交 | 已收录 | 未提交 | 验证码未完成，未确认 | 正式页面 |
| [什么是智能体 & 他们如何工作](https://strongduanmu.com/wiki/cmu_11_768/what_are_agents_and_how_do_they_work.html) | 已收录 | 已接受 2026-11-08 | 已收录 | 未提交 | 已接受 2026-11-08 | 正式页面 |
| [工具调用](https://strongduanmu.com/wiki/cmu_11_768/tool_use.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [长上下文智能体的上下文管理](https://strongduanmu.com/wiki/cmu_11_768/context_management_for_long_context_agents.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [技能与记忆](https://strongduanmu.com/wiki/cmu_11_768/skills_and_memory.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [规划、任务分解与多智能体协同](https://strongduanmu.com/wiki/cmu_11_768/planning_task_decomposition_and_multi_agent_coordination.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [编程智能体](https://strongduanmu.com/wiki/cmu_11_768/coding_agents.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [计算机使用智能体（GUI Agents）](https://strongduanmu.com/wiki/cmu_11_768/gui_agents.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [监督微调](https://strongduanmu.com/wiki/cmu_11_768/supervised_fine_tuning.html) | 已收录 | 已接受 2026-11-08 | 已收录 | 未提交 | 已接受 2026-11-08 | 正式页面 |
| [强化学习基础](https://strongduanmu.com/wiki/cmu_11_768/reinforcement_learning_basics.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [深度研究智能体](https://strongduanmu.com/wiki/cmu_11_768/deep_research_agents.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [高级强化学习算法](https://strongduanmu.com/wiki/cmu_11_768/advanced_reinforcement_learning_algorithms.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [强化学习系统](https://strongduanmu.com/wiki/cmu_11_768/reinforcement_learning_systems.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [智能体安全：沙箱、凭证与监控](https://strongduanmu.com/wiki/cmu_11_768/sandboxing_and_credential_management.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [OpenHands：框架设计与软件开发自动化](https://strongduanmu.com/wiki/cmu_11_768/openhands.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [智能体编排与监控：LangGraph 与轨迹分析](https://strongduanmu.com/wiki/cmu_11_768/langgraph.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [可观测性与监控](https://strongduanmu.com/wiki/cmu_11_768/observability_and_monitoring.html) | 未收录 | 未提交 | 已收录 | 未提交 | 未提交 | 资料占位，排除 |
| [智能体与工作的未来](https://strongduanmu.com/wiki/cmu_11_768/agents_and_the_future_of_work.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [多智能体系统：协调、交互与监督](https://strongduanmu.com/wiki/cmu_11_768/multi_agent_interaction.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [人机交互](https://strongduanmu.com/wiki/cmu_11_768/human_agent_interaction.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 资料占位，排除 |
| [重排序与 Critic 模型](https://strongduanmu.com/wiki/cmu_11_768/reranking_and_critic_models.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 资料占位，排除 |
| [树搜索](https://strongduanmu.com/wiki/cmu_11_768/tree_search.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 资料占位，排除 |
| [客座讲座（11 月 19 日）](https://strongduanmu.com/wiki/cmu_11_768/guest_lecture_karthik_narasimhan.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 资料占位，排除 |
| [客座讲座（11 月 24 日）](https://strongduanmu.com/wiki/cmu_11_768/guest_lecture_sasha_rush.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 资料占位，排除 |
| [Assignment 1：搭建智能体 Harness](https://strongduanmu.com/wiki/cmu_11_768/assignment_1_harness.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [Assignment 2：设计智能体评测](https://strongduanmu.com/wiki/cmu_11_768/assignment_2_eval.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [Assignment 3：训练智能体](https://strongduanmu.com/wiki/cmu_11_768/assignment_3_training.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [期末研究项目](https://strongduanmu.com/wiki/cmu_11_768/research_project.html) | 已收录 | 未提交 | 已收录 | 未提交 | 未提交 | 正式页面 |
| [课程资料](https://strongduanmu.com/wiki/cs329/) | 未收录 | 已接受 2026-11-09 | 未发现 | 已接受 2026-11-09 | 已接受 2026-11-09 | 正式页面 |
| [课程概览](https://strongduanmu.com/wiki/cs329/course_overview.html) | 未收录 | 已接受 2026-11-09 | 未发现 | 已接受 2026-11-09 | 已接受 2026-11-09 | 正式页面 |
| [推理时计算扩展](https://strongduanmu.com/wiki/cs329/test_time_compute_scaling.html) | 未收录 | 已接受 2026-11-09 | 未发现 | 已接受 2026-11-09 | 已接受 2026-11-09 | 正式页面 |
| [鲁棒验证](https://strongduanmu.com/wiki/cs329/robust_verification.html) | 未收录 | 已接受 2026-11-09 | 已收录 | 已接受 2026-11-09 | 已接受 2026-11-09 | 正式页面 |
| [利用工具与代码反馈学习](https://strongduanmu.com/wiki/cs329/learning_from_feedback_with_tools_and_code.html) | 未收录 | 已接受 2026-11-09 | 已收录 | 未提交 | 已接受 2026-11-09 | 正式页面 |
| [规划与多步推理](https://strongduanmu.com/wiki/cs329/planning_and_multi_step_reasoning.html) | 未收录 | 已接受 2026-11-09 | 未发现 | 已接受 2026-11-09 | 已接受 2026-11-09 | 正式页面 |
| [训练时扩展与强化学习](https://strongduanmu.com/wiki/cs329/train_time_scaling_and_reinforcement_learning.html) | 未收录 | 已接受 2026-11-09 | 已收录 | 未提交 | 已接受 2026-11-09 | 正式页面 |
| [自我改进与深度研究智能体](https://strongduanmu.com/wiki/cs329/self_improvement_and_deep_research_agents.html) | 未收录 | 当日限额，未接受 | 已收录 | 未提交 | 已接受 2026-11-09 | 正式页面 |
| [智能体评估与长时程任务](https://strongduanmu.com/wiki/cs329/agentic_evaluations_and_long_horizon_tasks.html) | 未收录 | 未提交 | 已收录 | 未提交 | 已接受 2026-11-09 | 正式页面 |
| [未来研究方向](https://strongduanmu.com/wiki/cs329/future_research_areas.html) | 未收录 | 未提交 | 未发现 | 已接受 2026-11-09 | 已接受 2026-11-09 | 正式页面 |

## 尚未完成

1. Google 配额恢复后的下一次用户巡检，先检查 CS329 剩余三篇是否已自然收录，再对仍未收录的请求抓取；不重复请求今天已接受的 7 条。
2. Google 其余 74 个规范地址因检查配额耗尽待后续日期核验，Bing 其余 135 个地址待逐页核验；可从 JSON 清单的 pending_verification 继续。
3. 百度 CMU 验证仍待完成，AI 队列还有 20 条未确认接受（另有原 JDBC 2 条），并非 20 条确定未收录。后续需先核对收录和配额，再继续；没有创建自动任务。
4. 百度全站与 AI 单页收录均不能凭目前总量确认。已接受的 CS329 10 条等待索引报告或具体 URL 证据。

完整规范 URL、检查时间、状态与回执见同目录 `2026-11-09-indexing-ledger.json`。下一次检查按该清单去重；不承诺抓取时间和排名。

# CS329 学习笔记发布与 SEO 验收

观察日期：2026-11-08（Asia/Shanghai）。本记录仅覆盖本次新增的 CS329 学习笔记，不覆盖当天其他巡检和未提交修改。

## 内容与课程对应

- 官方课程：[Stanford CS329A，Autumn 2025](https://cs329a.stanford.edu/)。课表共 20 次安排，公开录像为 9 段。
- Wiki 按这 9 段公开录像一对一创建 9 篇实质笔记，并新增课程目录。录像 Part 7、8、9 分别对应官方课表第 8、17、20 次课；目录分别列明编号和日期，没有补造缺失课次。
- 正文依据本地已校对中英文字幕、原视频课件画面、官方阅读论文整理。没有逐分钟完整回放音视频，不将本轮检查表述为完整听课验证。
- 共 52 张 WebP 课件图，逐张检查最终图片，保留视频时间链接；去除录屏浏览器地址栏、标签页及其他浏览器界面。优先改取相同课件的直接画面，一张 AlphaCode 指标投影图仅裁正课件区域。
- 课程卡片与首页封面使用同一张原创 AI 智能体图像，不使用课件截图作为 Logo。

## Logo 来源与提示词

课程官网图像资源只有教师/助教头像，没有适合直接作为课程 Logo 的独立图像。按用户明确要求，使用内置 image_gen 工具生成原创主题形象，保存为 `source/assets/wiki/cs329/cover.webp`，640 × 640，保留透明背景。这不是 Stanford 官方 Logo。

最终提示词：

> Use case: logo-brand. Asset type: square course icon for Chinese learning notes about Stanford CS329 Self-Improving AI Agents. Primary request: an original friendly intelligent agent mascot that visually communicates learning through a feedback loop. Subject: a compact robot head with an expressive simple face, a small neural-network motif and one clear curved feedback arrow around it. Style: polished editorial illustration, clean bold silhouette, restrained details, legible at 64px, centered with generous padding. Background: genuinely transparent. No text, letters, university seals, university logos, screenshots, watermarks, or additional characters. This is an original unofficial study-note illustration.

## 本地检查

- `npm test`：14 项通过。
- `npm run build`：成功。
- 验证生成的 10 个页面：自指 canonical、独立 title/description、允许索引、图片路径有效、均进入 sitemap.xml 和 baidusitemap.xml。
- Wiki 总目录和 AI 分类均包含新课程，侧栏及前后篇链接正常。
- Chrome 本地预览确认新 Logo、课件图、GRPO 公式、STaR 流程图与课程视频显示；另检查课程概览流程图的可访问文本。未把静态 iframe 链接验证表述为 9 个视频全部完整播放。
- 广告实现未改动；Auto optimise / Auto ads 保持用户已关闭的配置。

## 发布

- 内容提交：`07754263a262feb37ae2775312795020afee9fa1`。
- 已推送 `strongduanmu/blog` 的 master。
- [CI 运行](https://github.com/strongduanmu/blog/actions/runs/42480109072)：成功。生成站点提交 `c96ca9a8830efa3ab22eec606661774bd07829cf`，提交时间 2026-11-08 20:26:00。
- 线上验收：10 个新页面均返回 200，canonical 指向自身正式 URL，独立 title/description 正确，页面未设 noindex，9 篇视频 iframe 均使用对应 BVID。两份地图各包含全部 10 个地址，AI 分类包含课程入口。
- 线上 53 个图片资源（52 张课件图和 1 张 Logo）均返回 200，下载内容逐个与本地构建结果按字节比较一致。检查只请求站点 HTML/XML/WebP，没有加载或点击真实广告。
- 线上 HTML 和静态资源验收完成；Chrome 连接断开后没有完成新页面的线上浏览器视觉复查，本地 Chrome 视觉检查结果见上文。

## 搜索后台与待提交地址

Chrome 界面已打开 strongduanmu.com 的 Google Search Console 域名属性。设置页显示已验证所有权、robots.txt 文件有效。准备执行 URL Inspection 时，computer use 服务返回 `Transport closed`，重置接口也返回同一错误。本次未完成 Google、Bing、百度的 URL 或站点地图后台提交，不能记录为“提交成功”或“已收录”。

以下 10 个规范地址均为本轮新页面，待浏览器通道恢复后先检查平台当前状态、去重并按界面配额提交。Google 优先检查目录和重点文章，其余通过站点地图发现；百度继续遵循当日验证码与配额限制，不重复其他队列已接受的地址。

1. https://strongduanmu.com/wiki/cs329/
2. https://strongduanmu.com/wiki/cs329/course_overview.html
3. https://strongduanmu.com/wiki/cs329/test_time_compute_scaling.html
4. https://strongduanmu.com/wiki/cs329/robust_verification.html
5. https://strongduanmu.com/wiki/cs329/learning_from_feedback_with_tools_and_code.html
6. https://strongduanmu.com/wiki/cs329/planning_and_multi_step_reasoning.html
7. https://strongduanmu.com/wiki/cs329/train_time_scaling_and_reinforcement_learning.html
8. https://strongduanmu.com/wiki/cs329/self_improvement_and_deep_research_agents.html
9. https://strongduanmu.com/wiki/cs329/agentic_evaluations_and_long_horizon_tasks.html
10. https://strongduanmu.com/wiki/cs329/future_research_areas.html

站点地图自动包含新增内容，不代表搜索引擎已读取或已收录。后续观察建议使用相同口径比较 2–4 周的抓取、索引与搜索表现；未创建自动任务。

# strongduanmu.com 实现与验收

以下是 2026-11-03 的站点实现。执行前核对仓库当前状态，不把历史路径或实现当成永远不变。

## 仓库与发布

- 仓库：本项目（本机 `~/blog`），远端 `strongduanmu/blog`，当前发布分支 `master`。
- Hexo 7.3.0、Stellar 1.30.1；以 `package.json` 和实际安装为准，主题配置中的展示版本可能滞后。
- GitHub Actions：`.github/workflows/deploy.yml`；生成后发布至 `strongduanmu/strongduanmu.github.io`，由 Vercel 提供网站。
- `source/_drafts/` 是草稿，`render_drafts: false`。草稿不应进入公开页面、站点地图、搜索数据或 feed。
- 公共检查入口：[robots.txt](https://strongduanmu.com/robots.txt)、[sitemap.xml](https://strongduanmu.com/sitemap.xml)、[baidusitemap.xml](https://strongduanmu.com/baidusitemap.xml)。
- HTTPS 裸域名是当前内容使用的规范地址。巡检时特别比较 `www`、无尾斜杠目录与规范页面的重定向及 canonical，不未经验证就改全站 URL。

## 现有广告实现

| 文件 | 责任 |
| --- | --- |
| `_config.stellar.yml` | 正式域名才加载官方异步 AdSense 脚本；记录 `publisher-ads-script` 的 loading/loaded/error；引入广告控制与拦截提示脚本 |
| `scripts/fix-adsense-plugin.js` | 长文章在第一个完整二级标题章节之后插入广告，跳过短文、禁用页面和已插入内容 |
| `layout/_partial/adsense-inline.html` | 内文广告片段；不应作为独立网页公开 |
| `source/js/plugins/article-bottom-ad.js` | 提前约 300px 请求临近视口的广告，每个单元仅请求一次；隐藏侧栏或后台标签不发起无效请求 |
| `source/js/plugins/adblock-detector.js` | CSS 探针或广告脚本 error 触发可关闭中央 dialog；在线加载失败采用条件措辞，不断言一定安装了拦截器 |
| `source/css/custom.css` | 预留广告空间、桌面侧栏、移动端适配、弹框主题色与居中关闭图标 |
| `test/adsense.test.js` | 请求顺序、隐藏单元、本地不请求广告、未填充收缩、加载状态、弹框关闭与冷却、插入位置等检查 |

公开发布商 ID：`ca-pub-9880881761323734`。当前广告位：内文 `7617691942`、侧栏 `1987141063`、文末 `6799117067`。这些是前端公开配置，不是认证信息。

AdSense 的 `push({})` 按 DOM 顺序处理未初始化的 `.adsbygoogle`。现有控制器在广告真正就绪时才把 `.publisher-ad-unit` 加入该类，避免侧栏请求初始化了屏幕外的内文单元。不要恢复每个片段自行 push 的旧写法，也不要加入自动刷新。

未填充单元依据 `data-ad-status` 处理；正在视口中时避免突然收缩导致跳动。不得访问、重写或裁剪广告创意。小屏隐藏右侧广告，正文广告仍按可见性加载。

旧 `source/js/ads.js` 只有 `window.canRunAds = true`，不是当前检测链路。旧独立广告页 `/ads/google/article_ads.html` 已删除，不应重新收录或复用成内容页。

## 验收

1. 运行 `npm test` 和 `npm run build`。如果改了文章渲染插件，需要先 `npm run clean` 再构建，避免 Hexo 缓存保留旧插入位置。
2. 本地预览只显示广告占位，不请求真实广告。`http://localhost:<端口>/?test-adblock=1` 可预览中央提示；这个参数只在 localhost/127.0.0.1 生效，仍尊重关闭后的冷却期。
3. 弹框使用原生 `dialog.showModal()`，从 `body` 显示，只要求页面存在 `.l_main`，覆盖首页和文章页。检查主题色按钮、SVG 关闭图标、窄屏滚动和 44px 点击区域；“继续阅读”、× 和 Esc 都可退出。
4. 如需重置测试产生的冷却，只通过浏览器 UI 删除测试站点的 `ad-support-dismissed-at` 一项，不清空 Cookie 或全部站点存储。
5. 用户授权后做真实对照：拦截开启 → 广告库被拦且出现弹框；仅本站放行并手动刷新 → 脚本可加载、弹框消失，广告可能显示或正常 unfilled；恢复原设置。只看到广告空白不能判定测试通过。
6. 在 Chrome Console/Network 只读确认 `ERR_BLOCKED_BY_CLIENT` 与加载结果，不向控制台输入脚本。后台浏览器通道超时不能写成网站错误；先按工具文档排查，必要时在用户允许前台操作的条件下使用 Chrome UI。
7. 推送后检查对应 CI，再验证线上静态文件已更新；必要时只打开一次真实页面查看行为，不反复刷广告。区分本地强制预览和线上真实拦截测试。

## 可复查的官方资料

- [Google：广告拦截收入挽回消息](https://support.google.com/adsense/answer/11576085?hl=zh-Hans)
- [Google：未填充广告单元处理](https://support.google.com/adsense/answer/10762946)
- [Google：页面 RPM 定义](https://support.google.com/adsense/answer/112030?hl=zh-Hans)
- [MDN：dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)

当前没有证据表明账号已创建或发布 Google 官方广告拦截收入挽回消息；不要将自建提示误报为该后台功能已经配置。

## 搜索基础信息（2026-11-03 增补）

- `scripts/website-seo.js` 使用 Hexo `template_locals` 补充独立标题、描述及唯一 canonical；已有正文、侧栏和页面注入均保留。自动摘要排除原文链接、代码、表格和广告片段。
- 人工优化的标题与摘要集中在 `source/_data/seo.yml`，按规范 URL 路径维护。目录键使用 `/wiki/c/`，不是 `/wiki/c/index.html`。标题可能同时用于页面标题及搜索标题，修改前核对实际效果。
- `_config.yml` 中 `pretty_urls.trailing_index: false`，保留普通文章的 `.html`；站点描述作为兜底，不代替核心页面的独立描述。
- 本地生成器覆盖 `sitemap`、`baidusitemap`，两者均包含正式 Wiki 与文章，排除 noindex、草稿、静态资源及显式关闭 sitemap 的条目；不要恢复旧百度生成器“仅有分类的文章”条件。
- Vercel 博客项目域名设置：`https://vercel.com/strongduanmu-blog/blog/settings/domains`。当前 www 已在域名层配置为 308 → `strongduanmu.com`，保留路径与参数；主域继续连接 Production。迁移项目时同时检查这项设置，不能只依赖仓库内 host 条件。
- `source/vercel.json` 会复制到生成站点根目录，负责 www → 裸域名、目录尾斜杠以及已核对的旧路径重定向。根据 Vercel 文档，带文件扩展名的文章不会被 `trailingSlash: true` 改成目录。修改后必须验证线上状态码、Location、目标页面与不存在重定向循环。
- `layout/index*.ejs` 和 `_partial/list_heading.ejs` 由 SEO 脚本通过 Hexo `theme.setView` 显式注册，提供目录页可见 H1；根目录 `layout/` 不会被 Hexo 自动载入，不要只编辑未注册模板就认为已生效。
- 未完成的 Join 算子与 BenchmarkSQL 笔记也暂时 noindex；补全正文后再评估恢复。
- 只有 TODO 的 CMU 15-721 资料页、清华查询优化占位页，以及内容很少的个人动态页，保留访问但设置 noindex、退出两份地图。将来补全内容后再评估恢复，不批量取消全站的 noindex。
- 搜索检查增加 `test/seo.test.js`，并检查实际生成页面与两份 XML 的 canonical 一致性。不要只凭单元检查就宣布线上重定向已经生效。

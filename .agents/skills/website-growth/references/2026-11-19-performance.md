# 2026-11-19 页面加载优化

用户要求优化网站页面加载速度，沿用不改可见文字、图片清晰度与展示结构的偏好。本记录区分本地实现检查与实际线上性能；未取得新的 LCP、INP、CLS 或 Lighthouse 分数，不把资源策略变化换算成速度提升百分比。

## 证据与改动

- 正式站点 CSS 与 WOFF2 的 HEAD 均返回 `cache-control: public, max-age=0, must-revalidate`。已有 Vercel CDN 缓存不等于浏览器可以直接复用资源。
- `scripts/page-performance.js` 在 `after_generate` 读取实际生成字节，给已存在的本地 JS、CSS、字体和图片引用添加 SHA256 的前 16 位版本号。先处理字体与图片，再更新 CSS 的依赖 URL，最后更新 HTML 和主题内联插件配置；文件内容变化会改变引用版本。使用原文件路径与查询参数，不复制静态资源，不给正文、搜索 JSON 或站点地图添加长期缓存。
- `source/vercel.json` 仅对静态扩展名且 `v` 为 16 位十六进制的请求设置 `public, max-age=31536000, immutable`。未带内容版本的旧引用继续使用原缓存策略。用官方 `@vercel/routing-utils@6.6.1` 编译并验证 CSS、JS、WOFF2、Wiki 配图匹配，而 HTML、目录、search.json 与 XML 不匹配。
- 首页首张文章封面与课程首页封面保留真实 `src`，绕过主题 JavaScript 懒加载，使用 `loading=eager`、`fetchpriority=high`；每页最多一张。其余图片保留现有懒加载与样式。屏外 iframe 使用浏览器 `loading=lazy`，既有显式设置、地址、全屏和播放参数保留。
- 全站移除未被实际样式使用的 `LXGW WenKai Mono` 字体 CSS 注入，保留使用中的 `LXGW WenKai Screen`、原字体资源和代码字体。移除的声明文件原始大小 92,261 字节，本地 gzip 对照 30,754 字节；这是少下载一份 CSS，不是声称每页减少了所有字体文件。

## 本地验收

- 25 项测试通过，完整构建通过。新增测试覆盖字体变化向 CSS/HTML 传播、脚本失效、重复构建稳定、旧 CSS import 版本清理、代码与元信息保留、首屏图片及 iframe 行为。
- 对照 387 个 HTML，规范化资源版本与预期加载属性后，可见 body DOM 无差异；标题、正文、图片说明、链接、导航与结构保留。脚本、style 与主题为直接加载图片生成的错误回退处理不作为可见正文比较。
- 62 张主要封面直接加载，121 个 iframe 带延后加载属性；8,708 处 HTML 静态资源引用与实际文件内容哈希一致，字体 CSS 中的 WOFF2 版本也逐项核对。
- 首次与旧 public 比较时发现 7 个目录页中相同时间条目的顺序变化。独立关闭本次性能过滤器、恢复旧字体注入，并使用同一 Hexo 数据库完成对照构建后，387 页可见 DOM 无差异。该顺序差异来自既有清缓存重建，不能当成本次优化改写目录。
- 图片与字体的生成文件逐项与 source 原文件比较，具体文件数、字节数及结果存放于下述 `unchanged-assets.json`。没有重编码、缩放或删除原图。

检查日志、官方路由编译结果、前后 HTML、资源哈希与对照数据保存在仓库外 `/tmp/blog-speed-2026-11-19/`。提交、CI 和线上响应头应以本轮实际交付回执为准。

## 浏览器边界

按用户偏好用文档支持的 management API 创建了非聚焦独立 Chrome 窗口。`browser.tabs.get()` 能绑定该空白标签并读取 URL，但导航接口仍报参数错误；未切换或操作用户原窗口，也未采用外部 CDP 或自建浏览器自动化绕过。已关闭本次空白标签。未完成本轮真实浏览器视觉或性能测量，不能把静态 DOM 对照说成 Lighthouse 或用户性能验收。

## 参考

- [Vercel Cache-Control](https://vercel.com/docs/caching/cache-control-headers)
- [Vercel headers 路由条件](https://vercel.com/docs/project-configuration/vercel-json#headers)
- [Google：优化 LCP 与关键图片发现](https://web.dev/articles/optimize-lcp)
- [Hexo after_generate](https://hexo.io/api/filter.html#after-generate)

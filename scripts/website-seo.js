'use strict';

const cheerio = require('cheerio');
const fs = require('node:fs');
const path = require('node:path');
const { escapeHTML } = require('hexo-util');

// Register repository-owned views explicitly: Hexo does not load a root layout/ directory.
// https://hexo.io/api/themes
hexo.extend.filter.register('before_generate', function() {
  for (const view of ['_partial/head.ejs']) {
    this.theme.setView(view, fs.readFileSync(path.join(this.base_dir, 'layout', view), 'utf8'));
  }
});

// Hexo 7 template locals preserve source content and the theme's rendering.
// https://hexo.io/api/filter#template-locals
function canonicalUrl(route) {
  return new URL(String(route || '').replace(/(^|\/)index\.html$/, '$1'), hexo.config.url).href;
}

function descriptionFromContent(content) {
  const $ = cheerio.load(content || '');
  $('script, style, iframe, pre, table, .article-inline-ad-wrapper, .article-bottom-ad').remove();
  const paragraphs = $('p').toArray().map(node => $(node).text().replace(/\s+/g, ' ').trim())
    .filter(text => text && !/^(原文链接|注意[：:]|B\s*站|官方录像|本页截图取自|截至.{0,50}(?:视频|收藏夹))/.test(text));
  let text = '';
  for (const paragraph of paragraphs) {
    text += (text ? ' ' : '') + paragraph;
    if (Array.from(text).length >= 90) break;
  }
  const chars = Array.from(text);
  if (chars.length <= 160) return text;
  const excerpt = chars.slice(0, 160).join('');
  const end = Math.max(excerpt.lastIndexOf('。'), excerpt.lastIndexOf('；'));
  return end >= 70 ? excerpt.slice(0, end + 1) : excerpt + '…';
}

hexo.extend.filter.register('template_locals', function(locals) {
  const page = locals.page;
  const seo = locals.site.data.seo || {};
  const canonical = canonicalUrl(locals.path);
  const route = new URL(canonical).pathname;
  const entry = (seo.pages || {})[route] || {};
  page.seo_title = entry.title || page.title;
  if (/^\/page\/\d+\/$/.test(route)) {
    page.seo_title = `技术博客 · 第 ${page.current} 页`;
    page.seo_description = `端小强技术博客第 ${page.current} 页，继续浏览数据库内核、Apache Calcite 查询优化、ShardingSphere 联邦查询和 Java 开发相关文章，按发布时间查找过往的源码分析、问题排查与工程实践记录。`;
  }
  if (route === '/404.html') page.robots = 'noindex,follow';
  if (/^\/wiki\/tags\//.test(route)) {
    page.seo_title = `${page.tagName || page.title} 专题文档`;
    page.robots = 'noindex,follow';
  }
  page.seo_description = entry.description || page.seo_description || page.description || descriptionFromContent(page.content) || hexo.config.description;
  // Keep existing per-page injections; normalize directory aliases to one URL.
  // https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
  const oldHead = page.inject && page.inject.head;
  const head = oldHead ? (Array.isArray(oldHead) ? oldHead : [oldHead]) : [];
  page.inject = Object.assign({}, page.inject, {
    head: head.filter(item => !/rel=["']canonical["']/.test(item))
      .concat(`<link rel="canonical" href="${escapeHTML(canonical)}">`)
  });
  return locals;
});

function indexable(post, target) {
  return post.path && /\.html$/.test(post.path) && post.published !== false &&
    post.sitemap !== false && (target !== 'baidu' || post.baidusitemap !== false) &&
    !/(^|[,\s])(noindex|none)([,\s]|$)/i.test(post.robots || '') &&
    !/^(archives|categories|tags|wiki\/tags)\//.test(post.path);
}

// The old Baidu generator only included entries with categories, omitting wiki
// pages. Both maps now share canonical, published content and exclude noindex.
// https://hexo.io/api/generator
function sitemap(locals, target) {
  const entries = new Map();
  ['', 'wiki/', 'topic/'].forEach(route => entries.set(canonicalUrl(route), null));
  [].concat(locals.posts.toArray(), locals.pages.toArray()).filter(post => indexable(post, target)).forEach(post => {
    const updated = post.updated || post.date;
    const date = updated ? new Date(updated.valueOf()) : null;
    entries.set(canonicalUrl(post.path), date && !Number.isNaN(date.valueOf()) ? date.toISOString().slice(0, 10) : null);
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from(entries).sort(([a], [b]) => a.localeCompare(b)).map(([url, date]) =>
      `  <url><loc>${escapeHTML(url)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`).join('\n') + '\n</urlset>\n';
}
hexo.extend.generator.register('sitemap', function(locals) {
  return { path: this.config.sitemap.path, data: sitemap(locals, 'default') };
});
hexo.extend.generator.register('baidusitemap', function(locals) {
  return { path: this.config.baidusitemap.path, data: sitemap(locals, 'baidu') };
});

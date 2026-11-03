'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const cheerio = require('cheerio');

function harness() {
  const filters = {}, generators = {};
  const hexo = { config: { url: 'https://strongduanmu.com/', description: 'Site fallback',
    sitemap: { path: 'sitemap.xml' }, baidusitemap: { path: 'baidusitemap.xml' } },
    extend: { filter: { register: (name, fn) => { filters[name] = fn; } },
      generator: { register: (name, fn) => { generators[name] = fn; } } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../scripts/website-seo.js'), 'utf8'), {hexo, require, URL, Date});
  return { hexo, filters, generators };
}

test('SEO metadata uses one canonical directory URL and preserves page injections and explicit summaries', () => {
  const h = harness();
  const locals = { path: 'wiki/index.html', site: { data: { seo: { pages: { '/wiki/': {
    title: 'Documentation', description: 'A specific documentation directory summary.' } } } } },
    page: { inject: { head: ['<script src="/keep.js"></script>'] } } };
  h.filters.template_locals(locals);
  assert.equal(locals.page.title, 'Documentation');
  assert.equal(locals.page.description, 'A specific documentation directory summary.');
  assert.equal(cheerio.load(locals.page.inject.head.join(''))('link[rel="canonical"]').attr('href'), 'https://strongduanmu.com/wiki/');
  assert.match(locals.page.inject.head.join(''), /keep.js/);
  h.filters.template_locals(locals);
  assert.equal(locals.page.inject.head.filter(x=>x.includes('rel="canonical"')).length, 1);
  const page = { path: 'blog/test.html', site: { data: {} }, page: { description: 'Author summary', content: '<p>Different content</p>' } };
  h.filters.template_locals(page);
  assert.equal(page.page.description, 'Author summary');
});

test('automatic descriptions exclude attribution URLs, code, tables and injected advertisements', () => {
  const h = harness();
  const locals = { path: 'wiki/topic.html', site: { data: {} }, page: { content:
    '<blockquote><p>原文链接：https://example.com/</p></blockquote><pre><p>SECRET_CODE</p></pre>' +
    '<div class="article-inline-ad-wrapper"><p>广告</p></div><p>Useful explanation about the actual topic.</p>' } };
  h.filters.template_locals(locals);
  assert.equal(locals.page.description, 'Useful explanation about the actual topic.');
});

test('both sitemaps include wiki and portal URLs, deduplicate aliases and exclude drafts and noindex pages', () => {
  const h = harness();
  const posts = [{path:'blog/test.html',updated:new Date('2026-10-01')}, {path:'blog/draft.html',published:false}];
  const pages = [{path:'wiki/index.html'}, {path:'wiki/course/index.html'}, {path:'wiki/todo.html',robots:'noindex,follow'},
    {path:'wiki/hidden.html',sitemap:false}, {path:'README.md'}, {path:'categories/test/index.html'},
    {path:'only-google.html',baidusitemap:false}];
  const locals = {posts:{toArray:()=>posts},pages:{toArray:()=>pages}};
  for (const name of ['sitemap','baidusitemap']) {
    const result = h.generators[name].call(h.hexo, locals);
    const $ = cheerio.load(result.data, { xmlMode: true });
    const urls = $('loc').toArray().map(node => $(node).text());
    assert.ok(urls.includes('https://strongduanmu.com/wiki/course/'));
    assert.equal(urls.filter(url => url === 'https://strongduanmu.com/wiki/').length, 1);
    assert.match(result.data, /<lastmod>2026-10-01<\/lastmod>/);
    assert.doesNotMatch(result.data, /draft|todo|hidden|README|categories/);
    assert.equal(result.data.includes('only-google.html'), name === 'sitemap');
  }
});

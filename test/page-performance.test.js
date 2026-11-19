'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { Readable } = require('node:stream');
const cheerio = require('cheerio');

const root = path.join(__dirname, '..');
function harness(files = {}) {
  const filters = [];
  const routes = new Map(Object.entries(files));
  const route = {
    list: () => [...routes.keys()],
    get: name => Readable.from([Buffer.from(routes.get(name))]),
    set: (name, data) => routes.set(name, data)
  };
  const hexo = { config: { url: 'https://strongduanmu.com' }, route,
    extend: { filter: { register: (name, fn, priority) => filters.push({ name, fn, priority }) } } };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'scripts/page-performance.js'), 'utf8'), { hexo, require, URL, module });
  return { routes, api: module.exports,
    generate: () => filters.find(f => f.name === 'after_generate').fn.call(hexo) };
}

test('fonts propagate cache invalidation through CSS to HTML without copying assets', async () => {
  const h = harness({
    'fonts/body.woff2': 'original font',
    'css/body.css': '@font-face{src:url(../fonts/body.woff2)}',
    'wiki/test/index.html': '<html><head><link rel="stylesheet" href="/css/body.css"></head><body>中文原文</body></html>'
  });
  await h.generate();
  const firstCss = h.routes.get('css/body.css');
  const firstHtml = h.routes.get('wiki/test/index.html');
  assert.match(firstCss, /body\.woff2\?v=[a-f0-9]{16}/);
  assert.match(firstHtml, /body\.css\?v=[a-f0-9]{16}/);
  assert.match(firstHtml, /中文原文/);
  assert.equal(h.routes.size, 3);
  assert.equal(h.routes.get('fonts/body.woff2'), 'original font');
  await h.generate();
  assert.equal(h.routes.get('css/body.css'), firstCss);
  assert.equal(h.routes.get('wiki/test/index.html'), firstHtml);
  h.routes.set('fonts/body.woff2', 'updated font');
  await h.generate();
  assert.notEqual(h.routes.get('css/body.css'), firstCss);
  assert.notEqual(h.routes.get('wiki/test/index.html'), firstHtml);
});

test('local script changes refresh its URL while page edits keep unchanged asset URLs stable', async () => {
  const h = harness({ 'js/main.js': 'let a=1;', 'index.html': '<script defer src="/js/main.js?v=1.30.1"></script><p>原文</p>' });
  await h.generate();
  const first = h.routes.get('index.html');
  h.routes.set('index.html', first.replace('原文', '另一个页面'));
  await h.generate();
  assert.equal(cheerio.load(h.routes.get('index.html'))('script').attr('src'), cheerio.load(first)('script').attr('src'));
  h.routes.set('js/main.js', 'let a=2;');
  await h.generate();
  assert.notEqual(cheerio.load(h.routes.get('index.html'))('script').attr('src'), cheerio.load(first)('script').attr('src'));
});

test('CSS imports that have not been processed cannot retain stale immutable fingerprints', async () => {
  const h = harness({
    'css/main.css': '@import url(./import.css?v=0000000000000000);',
    'css/import.css': '.content{color:red}',
    'index.html': '<link rel="stylesheet" href="/css/main.css">'
  });
  await h.generate();
  assert.equal(h.routes.get('css/main.css'), '@import url(./import.css);');
  h.routes.set('css/import.css', '.content{color:blue}');
  await h.generate();
  // The imported URL deliberately revalidates; it does not point at old bytes.
  assert.equal(h.routes.get('css/main.css'), '@import url(./import.css);');
});

test('versioning preserves external resources, examples, entities, fragments and metadata', () => {
  const { api } = harness();
  const hashes = new Map([['assets/a.svg', '0123456789abcdef'], ['js/plugin.js', 'fedcba9876543210']]);
  const original = '<p>中文 &amp; 原文</p><pre>&lt;img src="/assets/a.svg"&gt;</pre>' +
    '<img src="/assets/a.svg?mode=a&amp;x=b#icon" alt="原说明">' +
    '<script src="https://cdn.example.com/js/plugin.js"></script>' +
    '<script>ctx.plugin="/js/plugin.js"</script>' +
    '<script type="application/ld+json">{"image":"/assets/a.svg"}</script>';
  const html = api.versionHtml(original, 'wiki/test.html', hashes, 'https://strongduanmu.com');
  assert.ok(html.includes('<p>中文 &amp; 原文</p><pre>&lt;img src="/assets/a.svg"&gt;</pre>'));
  assert.ok(html.includes('src="/assets/a.svg?mode=a&amp;x=b&amp;v=0123456789abcdef#icon"'));
  assert.ok(html.includes('https://cdn.example.com/js/plugin.js'));
  assert.ok(html.includes('ctx.plugin="/js/plugin.js?v=fedcba9876543210"'));
  assert.ok(html.includes('{"image":"/assets/a.svg"}'));
  assert.equal(api.versionHtml(html, 'wiki/test.html', hashes, 'https://strongduanmu.com'), html);
  assert.equal(api.assetUrl('data:image/svg+xml,a', 'index.html', hashes, 'https://strongduanmu.com'), 'data:image/svg+xml,a');
});

test('one primary cover loads without JavaScript, other images retain lazy loading', () => {
  const { api } = harness();
  const original = '<div class="preview cover"><img src="/cover.webp"></div>' +
    '<div class="post-cover"><img src="/post.jpg"></div><p><img src="/body.png"></p>';
  const html = api.prioritizeImages(original);
  const lazy = require('../node_modules/hexo-theme-stellar/scripts/filters/lib/img_lazyload');
  const $ = cheerio.load(lazy.processSite.call({ theme: { config: { plugins: { lazyload: { enable: true } } } } }, html));
  assert.equal($('.cover img').attr('src'), '/cover.webp');
  assert.equal($('.cover img').attr('fetchpriority'), 'high');
  assert.equal($('.post-cover img').hasClass('lazy'), true);
  assert.equal($('p img').hasClass('lazy'), true);
  assert.equal($('img[fetchpriority=high]').length, 1);
  assert.equal(api.prioritizeImages(html), html);
  assert.match(api.prioritizeImages('<div class="post-cover"><img src="/post.jpg"></div>'), /fetchpriority="high"/);
});

test('video lazy loading preserves attributes and leaves explicit loading and script examples alone', () => {
  const { api } = harness();
  const html = api.prioritizeImages('<iframe src="https://player.bilibili.com/player.html" allowfullscreen></iframe>' +
    '<iframe src="x" loading="eager"></iframe><script>const example=\'<iframe src="x">\';</script>');
  assert.match(html, /<iframe loading="lazy" src="https:\/\/player.bilibili.com\/player.html" allowfullscreen>/);
  assert.ok(html.includes('<iframe src="x" loading="eager">'));
  assert.ok(html.includes('const example=\'<iframe src="x">\''));
});

test('immutable caching only applies to versioned static file extensions, never article paths', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'source/vercel.json'), 'utf8'));
  const rule = config.headers[0];
  assert.match(rule.source, /:ext\(/);
  assert.doesNotMatch(rule.source, /html|json|xml/);
  assert.ok(new RegExp(rule.has[0].value).test('0123456789abcdef'));
  assert.equal(new RegExp(rule.has[0].value).test('1.30.1'), false);
  assert.equal(new RegExp(rule.has[0].value).test('0123456789abcdefEXTRA'), false);
  assert.equal(rule.headers[0].value, 'public, max-age=31536000, immutable');
});

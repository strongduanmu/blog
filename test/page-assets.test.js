'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { createRequire } = require('node:module');
const cheerio = require('cheerio');
// cnpm keeps transitive dependencies beside their owning package.
const ejs = createRequire(require.resolve('hexo-renderer-ejs'))('ejs');

const root = path.join(__dirname, '..');
function harness() {
  const filters = [], helpers = {};
  const hexo = { extend: {
    filter: { register: (name, fn, priority = 10) => filters.push({ name, fn, priority }) },
    helper: { register: (name, fn) => { helpers[name] = fn; } }
  } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'scripts/page-assets.js'), 'utf8'), { hexo, require });
  return { helpers, render: html => filters.filter(x => x.name === 'after_render:html')
    .sort((a, b) => a.priority - b.priority).reduce((s, x) => x.fn(s), html) };
}
const documentHtml = content => `<html><head></head><body>${content}</body></html>`;

test('actual diagrams load Mermaid even without front matter, while flags alone do not load it', () => {
  const h = harness();
  const view = fs.readFileSync(path.join(root, 'layout/_plugins/index.ejs'), 'utf8');
  function render(content, flag) {
    return ejs.render(view, { theme: { search: {}, plugins: { mermaid: { enable: true } } },
      page: { content, mermaid: flag }, needs_mermaid: h.helpers.needs_mermaid, partial: id => `<loaded>${id}</loaded>` });
  }
  assert.match(render('<pre class="mermaid">graph LR; A-->B</pre>'), /loaded/);
  assert.doesNotMatch(render('<p>Ordinary content</p>', true), /loaded/);
  assert.doesNotMatch(render('<pre>&lt;pre class="mermaid"&gt;</pre>'), /loaded/);
});

test('built formulas need matching CSS only, while raw math retains one auto-render fallback', () => {
  const h = harness();
  const rendered = h.render(documentHtml('<p><span class="katex">formula</span></p>'));
  assert.equal(cheerio.load(rendered)('link[href*="katex@0.12.0"]').length, 1);
  assert.equal(cheerio.load(rendered)('script').length, 0);
  assert.equal(h.render(rendered), rendered);
  const raw = h.render(documentHtml('<p>\\(x + y\\)</p>'));
  const $ = cheerio.load(raw);
  assert.equal($('script[src*="katex@0.12.0"]').length, 2);
  assert.equal($('script[onload]').length, 1);
  assert.equal(h.render(raw), raw);
  for (const tag of ['pre', 'code', 'script', 'style', 'textarea', 'noscript']) {
    assert.doesNotMatch(h.render(documentHtml(`<${tag}>$$x$$</${tag}>`)), /katex@/);
  }
});

test('banner has one live owner and a real image fallback when JavaScript is disabled', () => {
  const h = harness(), url = '/assets/banner/banner_4.jpg';
  const html = h.render(documentHtml(`<div class="article banner top"><img class="bg" src="${url}"><div class="content">Original heading</div></div>`));
  const lazy = require('../node_modules/hexo-theme-stellar/scripts/filters/lib/img_lazyload');
  const $ = cheerio.load(lazy.processSite.call({ theme: { config: { plugins: { lazyload: { enable: true } } } } }, html));
  const image = $('.banner > img');
  assert.equal(image.hasClass('lazy'), false);
  assert.match(image.attr('src'), /^data:image/);
  assert.equal(image.attr('data-src'), url);
  assert.equal($('noscript img').attr('src'), url);
  assert.equal($('.banner > img.bg + .content').length, 1);
  assert.equal($('.banner div').text(), 'Original heading');
});

test('banner runtime chooses one random image without touching normal lazy images or requiring jQuery', () => {
  const attrs = { 'data-src': '/assets/banner/banner_4.jpg', 'data-random-banner': '' }, writes = [];
  const image = { removeAttribute: name => { delete attrs[name]; }, setAttribute: (name, value) => { attrs[name] = value; writes.push([name, value]); } };
  const document = { querySelectorAll: selector => selector === '.banner img.bg[data-random-banner]' && 'data-random-banner' in attrs ? [image] : [] };
  const context = { document, Math: { random: () => 0.5, floor: Math.floor } };
  const script = fs.readFileSync(path.join(root, 'source/js/plugins/article-images.js'), 'utf8');
  vm.runInNewContext(script, context);
  vm.runInNewContext(script, context);
  assert.equal(attrs.src, '/assets/banner/banner_11.jpg');
  assert.equal('data-src' in attrs, false);
  assert.deepEqual(writes, [['src', '/assets/banner/banner_11.jpg']]);
});

'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

class Element {
  constructor(classes = '', rect = { top: 50, bottom: 300, left: 0, right: 600, width: 600 }) {
    this.classes = new Set(classes.split(' ').filter(Boolean));
    this.classList = { add: name => this.classes.add(name), contains: name => this.classes.has(name) };
    this.attributes = new Map();
    this.rect = rect;
    this.style = {};
    this.children = [];
    this.events = {};
    this.hidden = false;
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  getBoundingClientRect() { return this.rect; }
  closest(selector) { return selector === '.l_right' ? this.sidebar : this.wrapper; }
  append(...items) { this.children.push(...items); }
  appendChild(item) { this.append(item); }
  prepend(item) { this.children.unshift(item); }
  remove() { this.removed = true; }
  addEventListener(name, fn) { this.events[name] = fn; }
}

function adHarness({ hostname = 'strongduanmu.com', hidden = false, sidebarWidth = 200 } = {}) {
  const main = new Element('publisher-ad-unit', { top: 2000, bottom: 2250, left: 20, right: 620, width: 600 });
  const sidebar = new Element('publisher-ad-unit', { top: 50, bottom: 300, left: 900, right: 900 + sidebarWidth, width: sidebarWidth });
  main.wrapper = new Element('', main.rect);
  sidebar.wrapper = new Element('', sidebar.rect);
  sidebar.sidebar = new Element();
  const units = [main, sidebar];
  const observers = [];
  const mutations = [];
  const events = {};
  const requests = [];
  const document = {
    visibilityState: hidden ? 'hidden' : 'visible',
    querySelector: () => null,
    querySelectorAll: () => units,
    addEventListener: (name, callback) => { events[name] = callback; }
  };
  class IntersectionObserver {
    constructor(callback, options) { this.callback = callback; this.options = options; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    unobserve(target) { this.targets = this.targets.filter(item => item !== target); }
  }
  class MutationObserver {
    constructor(callback) { this.callback = callback; mutations.push(this); }
    observe(target) { this.target = target; }
  }
  const window = {
    innerHeight: 800, innerWidth: 1440, IntersectionObserver,
    addEventListener: () => {},
    adsbygoogle: { push() {
      // Model AdSense's queue: the next unprocessed .adsbygoogle element wins.
      const unit = units.find(item => item.classes.has('adsbygoogle') && !item.hasAttribute('data-adsbygoogle-status'));
      assert.ok(unit, 'an ad request must correspond to an eligible slot');
      unit.setAttribute('data-adsbygoogle-status', 'done');
      requests.push(unit);
    } }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../source/js/plugins/article-bottom-ad.js'), 'utf8'), {
    document, window, location: { hostname, pathname: '/blog/test.html' },
    IntersectionObserver, MutationObserver, console
  });
  return { main, sidebar, requests, document, events, observers, mutations };
}

test('a visible sidebar requests its own slot, not an off-screen article slot', () => {
  const h = adHarness();
  assert.deepEqual(h.requests, [h.sidebar]);
  assert.equal(h.main.classes.has('adsbygoogle'), false);
  const loader = h.observers.find(item => item.options?.rootMargin);
  loader.callback([{ target: h.main, isIntersecting: true }]);
  loader.callback([{ target: h.main, isIntersecting: true }]);
  assert.deepEqual(h.requests, [h.sidebar, h.main], 'scrolling must not refresh an ad');
});

test('hidden mobile sidebar and background tabs do not request ads', () => {
  assert.equal(adHarness({ sidebarWidth: 0 }).requests.length, 0);
  const h = adHarness({ hidden: true });
  assert.equal(h.requests.length, 0);
  h.document.visibilityState = 'visible';
  h.events.visibilitychange();
  assert.deepEqual(h.requests, [h.sidebar]);
});

test('local previews do not request ads', () => {
  for (const hostname of ['localhost', '127.0.0.1']) {
    const h = adHarness({ hostname });
    assert.equal(h.requests.length, 0);
    assert.ok(h.main.wrapper.classes.has('ad-preview'));
  }
});

test('unfilled ads collapse only outside the viewport', () => {
  const h = adHarness();
  h.sidebar.setAttribute('data-ad-status', 'unfilled');
  h.mutations.find(item => item.target === h.sidebar).callback();
  assert.equal(h.sidebar.wrapper.hidden, false);
  const collapse = h.observers.find(item => !item.options);
  collapse.callback([{ target: h.sidebar.wrapper, isIntersecting: false }]);
  assert.equal(h.sidebar.wrapper.hidden, true);
  h.main.setAttribute('data-ad-status', 'unfilled');
  h.mutations.find(item => item.target === h.main).callback();
  assert.equal(h.main.wrapper.hidden, true);
});

test('the support notice can be dismissed, never locks scrolling, and respects dismissal', () => {
  const article = new Element();
  const body = new Element();
  const stored = new Map();
  const source = fs.readFileSync(path.join(__dirname, '../source/js/plugins/adblock-detector.js'), 'utf8');
  const context = {
    document: { body, querySelector: selector => selector === 'article.md-text.content' ? article : null,
      createElement: () => new Element() },
    localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
    location: { hostname: 'localhost', search: '?test-adblock=1' }, URLSearchParams,
    setTimeout: callback => callback(), Date
  };
  vm.runInNewContext(source, context);
  assert.equal(article.children.length, 1);
  assert.equal(body.style.overflow, undefined);
  const notice = article.children[0];
  notice.children[1].events.click();
  assert.equal(notice.removed, true);
  vm.runInNewContext(source, context);
  assert.equal(article.children.length, 1, 'dismissed notice must not be recreated');
});

test('in-article placement preserves the first section, skips nested headings and never duplicates', () => {
  const filters = {};
  const plugin = fs.readFileSync(path.join(__dirname, '../scripts/fix-adsense-plugin.js'), 'utf8');
  const hexo = {
    base_dir: path.join(__dirname, '..'),
    config: { hexo_google_adsense: { enable: true, auto_insert: { enable: true, after_paragraph: 2 } } },
    extend: { tag: { register() {} }, filter: { register: (name, fn) => { filters[name] = fn; } } }
  };
  vm.runInNewContext('(function() {\n' + plugin + '\n})()', { hexo, require });
  const render = filters.after_post_render;
  const content = '<h2>Introduction</h2><p>' + 'Useful explanation. '.repeat(65) + '</p>' +
    '<blockquote><h2>Nested example</h2><p>A quote.</p></blockquote>' +
    '<h2>Reproduction</h2><pre><code>SELECT * FROM example;</code></pre>';
  const article = render({ layout: 'post', content });
  assert.ok(article.content.indexOf('Nested example') < article.content.indexOf('article-inline-ad-wrapper'));
  assert.ok(article.content.indexOf('article-inline-ad-wrapper') < article.content.indexOf('<h2>Reproduction'));
  assert.equal(render(article).content.match(/article-inline-ad-wrapper/g).length, 1);
  assert.equal(render({ layout: 'post', content: '<h2>Outline</h2><p>TODO</p>' }).content.includes('publisher-ad-unit'), false);
  assert.equal(render({ layout: 'post', content, disable_ads: true }).content, content);
});

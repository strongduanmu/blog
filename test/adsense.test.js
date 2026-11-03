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

test('the live ad tag records load and failure before deferred detection, and skips local requests', () => {
  const config = require('js-yaml').load(fs.readFileSync(path.join(__dirname, '../_config.stellar.yml'), 'utf8'));
  const bootstrap = config.inject.head.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const hostname of ['localhost', 'strongduanmu.com', 'www.strongduanmu.com']) {
    const scripts = [];
    vm.runInNewContext(bootstrap, { location: { hostname }, document: {
      createElement: () => new Element(), head: { appendChild: script => scripts.push(script) }
    } });
    assert.equal(scripts.length, hostname === 'localhost' ? 0 : 1);
    if (!scripts.length) continue;
    assert.equal(scripts[0].getAttribute('data-load-state'), 'loading');
    scripts[0].events.load();
    assert.equal(scripts[0].getAttribute('data-load-state'), 'loaded');
    scripts[0].events.error();
    assert.equal(scripts[0].getAttribute('data-load-state'), 'error');
  }
});

function noticeHarness({ hostname = 'strongduanmu.com', search = '', state = 'loaded', blocked = false, online = true, stored = new Map() } = {}) {
  const article = new Element();
  const body = new Element();
  const script = new Element();
  script.setAttribute('data-load-state', state);
  const events = {};
  const window = { addEventListener: (name, fn) => { events[name] = fn; } };
  const navigator = { onLine: online };
  const context = {
    document: { body,
      querySelector: selector => selector === 'article.md-text.content' ? article :
        article.children.find(item => item.className === 'ad-support-notice' && !item.removed),
      getElementById: () => script,
      createElement: () => { const element = new Element(); element.offsetHeight = blocked ? 0 : 10; return element; } },
    localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
    location: { hostname, search }, URLSearchParams, window, navigator,
    getComputedStyle: () => ({ display: blocked ? 'none' : 'block' }),
    setTimeout: callback => callback(), Date
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../source/js/plugins/adblock-detector.js'), 'utf8'), context);
  return { article, body, script, navigator, events, stored };
}

test('normal, slow, offline and local ad loading do not produce false blocking notices', () => {
  for (const options of [{}, { state: 'loading' }, { online: false, state: 'error' },
    { hostname: 'localhost', state: 'error' }, { hostname: 'preview.example', blocked: true }]) {
    assert.equal(noticeHarness(options).article.children.length, 0, JSON.stringify(options));
  }
});

test('CSS blocking and script errors before or after detection show a single optional notice', () => {
  assert.equal(noticeHarness({ blocked: true }).article.children.length, 1);
  const early = noticeHarness({ state: 'error' });
  assert.equal(early.article.children.length, 1, 'remember errors fired before deferred detection');
  assert.match(early.article.children[0].children[0].children[0].textContent, /如果你使用/);
  const late = noticeHarness({ state: 'loading' });
  late.script.setAttribute('data-load-state', 'error');
  late.script.events.error();
  late.script.events.error();
  assert.equal(late.article.children.length, 1);
  const offline = noticeHarness({ online: false, state: 'error' });
  offline.navigator.onLine = true;
  offline.events.online();
  assert.equal(offline.article.children.length, 1);
});

test('the support notice offers instructions, never locks scrolling, and respects seven-day dismissal', () => {
  const h = noticeHarness({ hostname: 'localhost', search: '?test-adblock=1' });
  assert.equal(h.article.children.length, 1);
  assert.equal(h.body.style.overflow, undefined);
  const notice = h.article.children[0];
  const instructions = notice.children[0].children[1];
  assert.equal(instructions.children[1].children.length, 3);
  notice.children[1].events.click();
  assert.equal(notice.removed, true);
  assert.equal(noticeHarness({ state: 'error', stored: h.stored }).article.children.length, 0);
  h.stored.set('ad-support-dismissed-at', String(Date.now() - 8 * 24 * 60 * 60 * 1000));
  assert.equal(noticeHarness({ state: 'error', stored: h.stored }).article.children.length, 1);
  const live = noticeHarness({ state: 'error' });
  live.article.children[0].children[1].events.click();
  live.events.online();
  assert.equal(live.article.children.length, 1, 'later events must not recreate a dismissed notice');
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

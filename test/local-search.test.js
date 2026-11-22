'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../source/js/plugins/local-search.js'), 'utf8');

class Element extends EventTarget {
  children = [];
  classes = new Set();
  dataset = {};
  value = '';
  attributes = new Map();
  classList = {
    toggle: (name, present) => present ? this.classes.add(name) : this.classes.delete(name),
    remove: name => this.classes.delete(name)
  };

  append(...children) { this.children.push(...children); }
  replaceChildren() { this.children = []; }
  setAttribute(name, value) { this.attributes.set(name, value); }
}

function setup(filter = '') {
  const input = new Element();
  input.dataset.filter = filter;
  input.form = new Element();
  const wrapper = new Element();
  const results = new Element();
  const elements = { 'search-input': input, 'search-wrapper': wrapper, 'search-result': results };
  const requests = [];
  vm.runInNewContext(script, {
    document: {
      getElementById: id => elements[id],
      createElement: () => new Element(),
      currentScript: { dataset: { searchIndex: '/search.json' } }
    },
    fetch: url => new Promise(resolve => requests.push({ url, resolve }))
  });
  const type = query => {
    input.value = query;
    input.dispatchEvent(new Event('input'));
  };
  const focus = () => input.dispatchEvent(new Event('focus'));
  const links = () => (results.children[0]?.children || []).map(item => item.children[0]);
  return { input, wrapper, requests, type, focus, links };
}

const settle = () => new Promise(resolve => setImmediate(resolve));
const rows = [
  { path: '/blog/calcite.html', title: 'Calcite 入门', content: 'Apache Calcite 查询优化。' },
  { path: '//wiki/cmu/parser.html', title: '解析器', content: 'Calcite 解析器接受 RexNode[0]。' }
];

test('search requests the index once and renders the latest query typed during loading', async () => {
  const search = setup();
  assert.equal(search.requests.length, 0);
  search.focus();
  search.type('入门');
  search.type('解析器');
  search.focus();
  assert.deepEqual(search.requests.map(request => request.url), ['/search.json']);
  search.requests[0].resolve({ ok: true, json: async () => rows });
  await settle();
  assert.deepEqual(search.links().map(link => link.href), ['/wiki/cmu/parser.html']);

  search.focus();
  search.type('Calcite');
  assert.deepEqual(search.links().map(link => link.href), ['/blog/calcite.html', '/wiki/cmu/parser.html']);
  assert.equal(search.requests.length, 1);
  search.type('');
  assert.equal(search.wrapper.attributes.get('searching'), 'false');
  assert.deepEqual(search.links(), []);
  assert.equal(search.input.form.dispatchEvent(new Event('submit', { cancelable: true })), false);
});

test('search can retry a failed request and retains page scope and literal code matches', async () => {
  const search = setup('/wiki/cmu/');
  search.focus();
  search.requests[0].resolve({ ok: false });
  await settle();
  assert.equal(search.wrapper.classes.has('noresult'), false);

  search.type('RexNode[0]');
  assert.equal(search.requests.length, 2);
  search.requests[1].resolve({ ok: true, json: async () => rows });
  await settle();
  assert.deepEqual(search.links().map(link => link.href), ['/wiki/cmu/parser.html']);
  const snippet = search.links()[0].children[1];
  assert.equal(snippet.children.find(node => node.className === 'search-keyword').textContent, 'RexNode[0]');

  search.type('Calcite');
  assert.deepEqual(search.links().map(link => link.href), ['/wiki/cmu/parser.html']);
  search.type('不存在的词');
  assert.equal(search.wrapper.classes.has('noresult'), true);
  assert.deepEqual(search.links(), []);
});
